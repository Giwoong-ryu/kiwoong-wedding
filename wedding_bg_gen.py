#!/usr/bin/env python3
"""
Wedding Photo Background Generator
===================================
CLI tool to automate background replacement for wedding photos
while preserving the original lighting atmosphere.

Uses rembg for masking and Replicate API (Flux) for inpainting.

Usage:
    python wedding_bg_gen.py input.jpg
    python wedding_bg_gen.py input.jpg --prompt "custom prompt"
    python wedding_bg_gen.py input.jpg --output my_output.png
    python wedding_bg_gen.py input.jpg --dilation 8

Requirements:
    pip install rembg pillow numpy replicate

Environment:
    REPLICATE_API_TOKEN=r8_xxxxx
"""

from __future__ import annotations

import argparse
import base64
import io
import os
import sys
from datetime import datetime
from pathlib import Path
from typing import Optional

try:
    import numpy as np
    from PIL import Image, ImageFilter
    import replicate
except ImportError as e:
    print(f"[ERROR] Missing dependency: {e}")
    print("Install with: pip install rembg pillow numpy replicate")
    sys.exit(1)

try:
    from rembg import remove, new_session
except ImportError:
    print("[ERROR] rembg not installed. Install with: pip install rembg[gpu] or pip install rembg")
    sys.exit(1)


# =============================================================================
# DEFAULT PROMPTS (can be overridden via CLI flags)
# =============================================================================

DEFAULT_POSITIVE_PROMPT = (
    "High-end wedding photography, close-up, a couple looking at each other, "
    "dark moody atmosphere, background is luxurious dark velvet curtains with "
    "subtle dark red floral arrangements, soft cinematic bokeh, rim lighting, "
    "highly detailed, 8k, photorealistic, masterpiece."
)

DEFAULT_NEGATIVE_PROMPT = (
    "bright daylight, white background, cartoon, illustration, low quality, "
    "distorted hands, bad anatomy, messy, noise, nsfw, text, watermark."
)


# =============================================================================
# CORE FUNCTIONS
# =============================================================================

def load_image(image_path: str) -> Image.Image:
    """Load an image from file path."""
    path = Path(image_path)
    if not path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    img = Image.open(path)
    # Convert to RGB if necessary (e.g., RGBA, P mode)
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGB")
    return img


def generate_mask(image: Image.Image, session_name: str = "u2net") -> Image.Image:
    """
    Generate a binary mask of the subjects using rembg.

    Args:
        image: Input PIL Image
        session_name: rembg model name (u2net, u2net_human_seg, isnet-general-use)

    Returns:
        PIL Image in "L" mode (grayscale mask)
    """
    print("[Step 1/4] Generating subject mask with rembg...")

    # Create rembg session
    session = new_session(session_name)

    # Remove background (returns RGBA with transparent background)
    result = remove(image, session=session, only_mask=True)

    # Convert to grayscale mask (L mode)
    if result.mode != "L":
        result = result.convert("L")

    return result


def dilate_mask(mask: Image.Image, dilation_pixels: int = 7) -> Image.Image:
    """
    Apply mask dilation to expand the mask edges.

    CRITICAL: This ensures the AI regenerates the edges of subjects
    to blend them perfectly with the new background, avoiding the
    "cut-out sticker" look.

    Args:
        mask: Grayscale mask (L mode)
        dilation_pixels: Number of pixels to expand (5-10 recommended)

    Returns:
        Dilated mask
    """
    print(f"[Step 2/4] Applying mask dilation ({dilation_pixels}px)...")

    # Convert to numpy for processing
    mask_array = np.array(mask)

    # Create a binary mask (threshold at 128)
    binary_mask = (mask_array > 128).astype(np.uint8) * 255

    # Convert back to PIL for dilation using MaxFilter
    pil_mask = Image.fromarray(binary_mask, mode="L")

    # Apply dilation using MaxFilter (expands white regions)
    # Apply multiple times for larger dilation
    dilated = pil_mask
    for _ in range(dilation_pixels):
        dilated = dilated.filter(ImageFilter.MaxFilter(3))

    # Invert the mask: we want to inpaint the BACKGROUND (where mask is black)
    # Flux expects: white = area to inpaint, black = area to keep
    # Our mask: white = subject, black = background
    # So we need to invert for background inpainting
    inverted = Image.eval(dilated, lambda x: 255 - x)

    return inverted


def image_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """Convert PIL Image to base64 string."""
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode("utf-8")


def image_to_data_uri(image: Image.Image, format: str = "PNG") -> str:
    """Convert PIL Image to data URI."""
    b64 = image_to_base64(image, format)
    mime = "image/png" if format.upper() == "PNG" else "image/jpeg"
    return f"data:{mime};base64,{b64}"


def call_flux_inpainting(
    original_image: Image.Image,
    mask: Image.Image,
    prompt: str,
    negative_prompt: str,
    api_token: Optional[str] = None,
) -> Image.Image:
    """
    Call Replicate API with Flux inpainting model.

    Args:
        original_image: Original wedding photo
        mask: Dilated mask (white = inpaint area)
        prompt: Positive prompt for generation
        negative_prompt: Negative prompt to avoid
        api_token: Replicate API token (optional, uses env if not provided)

    Returns:
        Generated image with new background
    """
    print("[Step 3/4] Calling Flux inpainting API...")

    # Check API token
    token = api_token or os.environ.get("REPLICATE_API_TOKEN")
    if not token:
        raise ValueError(
            "REPLICATE_API_TOKEN not found. "
            "Set it via environment variable or --api-token flag."
        )

    # Set the token (replicate library uses this)
    os.environ["REPLICATE_API_TOKEN"] = token

    # Convert images to data URIs
    # Ensure both images are the same size
    if original_image.size != mask.size:
        mask = mask.resize(original_image.size, Image.Resampling.NEAREST)

    # Convert original to RGB if RGBA
    if original_image.mode == "RGBA":
        original_image = original_image.convert("RGB")

    image_uri = image_to_data_uri(original_image, "JPEG")
    mask_uri = image_to_data_uri(mask, "PNG")

    # Call Flux Fill Dev model
    # Model: black-forest-labs/flux-fill-dev
    print("  Sending request to Replicate (this may take 30-60 seconds)...")

    output = replicate.run(
        "black-forest-labs/flux-fill-dev",
        input={
            "image": image_uri,
            "mask": mask_uri,
            "prompt": prompt,
            "guidance": 30,  # Higher guidance for more prompt adherence
            "steps": 50,  # More steps for quality
            "output_format": "png",
            "output_quality": 100,
        }
    )

    # The output is typically a URL or file object
    if isinstance(output, str):
        # It's a URL, download it
        import urllib.request
        print(f"  Downloading result from: {output[:50]}...")
        with urllib.request.urlopen(output) as response:
            result_data = response.read()
        result_image = Image.open(io.BytesIO(result_data))
    elif hasattr(output, "read"):
        # It's a file-like object
        result_image = Image.open(output)
    elif isinstance(output, list) and len(output) > 0:
        # It's a list of URLs
        url = output[0]
        import urllib.request
        print(f"  Downloading result from: {url[:50]}...")
        with urllib.request.urlopen(url) as response:
            result_data = response.read()
        result_image = Image.open(io.BytesIO(result_data))
    else:
        raise ValueError(f"Unexpected API output type: {type(output)}")

    return result_image


def save_output(image: Image.Image, output_path: Optional[str] = None) -> str:
    """
    Save the result image.

    Args:
        image: Result image to save
        output_path: Optional custom output path

    Returns:
        Path where the image was saved
    """
    print("[Step 4/4] Saving output...")

    if output_path:
        path = Path(output_path)
    else:
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        path = Path(f"output_{timestamp}.png")

    # Ensure the image is in RGB mode for saving
    if image.mode == "RGBA":
        # Create white background and paste
        background = Image.new("RGB", image.size, (255, 255, 255))
        background.paste(image, mask=image.split()[3])
        image = background
    elif image.mode != "RGB":
        image = image.convert("RGB")

    image.save(path, "PNG", quality=100)
    print(f"  Saved to: {path.absolute()}")

    return str(path.absolute())


# =============================================================================
# MAIN PIPELINE
# =============================================================================

def process_wedding_photo(
    input_path: str,
    output_path: Optional[str] = None,
    positive_prompt: Optional[str] = None,
    negative_prompt: Optional[str] = None,
    dilation_pixels: int = 7,
    api_token: Optional[str] = None,
    save_mask: bool = False,
) -> str:
    """
    Main pipeline to process a wedding photo.

    Args:
        input_path: Path to input image
        output_path: Optional output path
        positive_prompt: Custom positive prompt
        negative_prompt: Custom negative prompt
        dilation_pixels: Mask dilation amount
        api_token: Replicate API token
        save_mask: Whether to save the mask for debugging

    Returns:
        Path to the output image
    """
    print("=" * 60)
    print("Wedding Photo Background Generator")
    print("=" * 60)
    print(f"Input: {input_path}")
    print(f"Dilation: {dilation_pixels}px")
    print()

    # Use defaults if not provided
    prompt = positive_prompt or DEFAULT_POSITIVE_PROMPT
    neg_prompt = negative_prompt or DEFAULT_NEGATIVE_PROMPT

    # 1. Load image
    image = load_image(input_path)
    print(f"  Image size: {image.size}")

    # 2. Generate mask
    mask = generate_mask(image)

    # 3. Dilate mask
    dilated_mask = dilate_mask(mask, dilation_pixels)

    # Optional: save mask for debugging
    if save_mask:
        mask_path = Path(input_path).stem + "_mask.png"
        dilated_mask.save(mask_path)
        print(f"  Mask saved to: {mask_path}")

    # 4. Call Flux inpainting
    result = call_flux_inpainting(
        original_image=image,
        mask=dilated_mask,
        prompt=prompt,
        negative_prompt=neg_prompt,
        api_token=api_token,
    )

    # 5. Save output
    output_file = save_output(result, output_path)

    print()
    print("=" * 60)
    print("[DONE] Background replacement complete!")
    print("=" * 60)

    return output_file


# =============================================================================
# CLI INTERFACE
# =============================================================================

def create_parser() -> argparse.ArgumentParser:
    """Create argument parser for CLI."""
    parser = argparse.ArgumentParser(
        description="Wedding Photo Background Generator - Replace backgrounds with luxurious dark textures",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python wedding_bg_gen.py photo.jpg
  python wedding_bg_gen.py photo.jpg --output result.png
  python wedding_bg_gen.py photo.jpg --prompt "dark marble background with gold accents"
  python wedding_bg_gen.py photo.jpg --dilation 10 --save-mask

Environment:
  REPLICATE_API_TOKEN: Your Replicate API token (required)
        """,
    )

    parser.add_argument(
        "input",
        type=str,
        help="Path to the input wedding photo",
    )

    parser.add_argument(
        "-o", "--output",
        type=str,
        default=None,
        help="Output file path (default: output_TIMESTAMP.png)",
    )

    parser.add_argument(
        "-p", "--prompt",
        type=str,
        default=None,
        help=f"Custom positive prompt (default: luxurious dark velvet background)",
    )

    parser.add_argument(
        "-n", "--negative-prompt",
        type=str,
        default=None,
        help="Custom negative prompt",
    )

    parser.add_argument(
        "-d", "--dilation",
        type=int,
        default=7,
        help="Mask dilation in pixels (default: 7, range: 3-15)",
    )

    parser.add_argument(
        "--api-token",
        type=str,
        default=None,
        help="Replicate API token (default: uses REPLICATE_API_TOKEN env)",
    )

    parser.add_argument(
        "--save-mask",
        action="store_true",
        help="Save the generated mask for debugging",
    )

    parser.add_argument(
        "--version",
        action="version",
        version="%(prog)s 1.0.0",
    )

    return parser


def main() -> int:
    """Main entry point."""
    parser = create_parser()
    args = parser.parse_args()

    # Validate dilation range
    if not 1 <= args.dilation <= 20:
        print(f"[ERROR] Dilation must be between 1 and 20, got: {args.dilation}")
        return 1

    try:
        process_wedding_photo(
            input_path=args.input,
            output_path=args.output,
            positive_prompt=args.prompt,
            negative_prompt=args.negative_prompt,
            dilation_pixels=args.dilation,
            api_token=args.api_token,
            save_mask=args.save_mask,
        )
        return 0
    except FileNotFoundError as e:
        print(f"[ERROR] {e}")
        return 1
    except ValueError as e:
        print(f"[ERROR] {e}")
        return 1
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    sys.exit(main())
