#!/usr/bin/env python3
"""
Wedding Photo Background Generator - GUI
=========================================
One-click interface for background replacement.

Double-click this file to run!
"""

from __future__ import annotations

import os
import sys
import threading
import tkinter as tk
from tkinter import filedialog, messagebox, ttk
from pathlib import Path

# Ensure UTF-8 output
if sys.platform == "win32":
    os.environ["PYTHONIOENCODING"] = "utf-8"
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")


class WeddingBgApp:
    """Main GUI Application."""

    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("Wedding Photo Background Generator")
        self.root.geometry("600x500")
        self.root.resizable(True, True)

        # Variables
        self.input_path = tk.StringVar()
        self.output_path = tk.StringVar()
        self.api_token = tk.StringVar(value=os.environ.get("REPLICATE_API_TOKEN", ""))
        self.dilation = tk.IntVar(value=7)
        self.custom_prompt = tk.StringVar()
        self.is_processing = False

        self._create_widgets()

    def _create_widgets(self):
        """Create all GUI widgets."""
        # Main frame with padding
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.pack(fill=tk.BOTH, expand=True)

        # Title
        title_label = ttk.Label(
            main_frame,
            text="Wedding Photo Background Generator",
            font=("Helvetica", 16, "bold"),
        )
        title_label.pack(pady=(0, 15))

        # === Input File Section ===
        input_frame = ttk.LabelFrame(main_frame, text="1. Select Photo", padding="10")
        input_frame.pack(fill=tk.X, pady=5)

        input_entry = ttk.Entry(input_frame, textvariable=self.input_path, width=50)
        input_entry.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=(0, 5))

        browse_btn = ttk.Button(input_frame, text="Browse...", command=self._browse_input)
        browse_btn.pack(side=tk.RIGHT)

        # === API Token Section ===
        token_frame = ttk.LabelFrame(main_frame, text="2. Replicate API Token", padding="10")
        token_frame.pack(fill=tk.X, pady=5)

        token_entry = ttk.Entry(token_frame, textvariable=self.api_token, width=50, show="*")
        token_entry.pack(side=tk.LEFT, fill=tk.X, expand=True)

        # === Options Section ===
        options_frame = ttk.LabelFrame(main_frame, text="3. Options (Optional)", padding="10")
        options_frame.pack(fill=tk.X, pady=5)

        # Dilation slider
        dilation_frame = ttk.Frame(options_frame)
        dilation_frame.pack(fill=tk.X, pady=2)

        ttk.Label(dilation_frame, text="Edge Blend (Dilation):").pack(side=tk.LEFT)
        dilation_slider = ttk.Scale(
            dilation_frame,
            from_=3,
            to=15,
            variable=self.dilation,
            orient=tk.HORIZONTAL,
        )
        dilation_slider.pack(side=tk.LEFT, fill=tk.X, expand=True, padx=10)
        self.dilation_label = ttk.Label(dilation_frame, text="7px")
        self.dilation_label.pack(side=tk.RIGHT)
        dilation_slider.configure(command=self._update_dilation_label)

        # Custom prompt
        prompt_frame = ttk.Frame(options_frame)
        prompt_frame.pack(fill=tk.X, pady=5)

        ttk.Label(prompt_frame, text="Custom Prompt (leave empty for default):").pack(anchor=tk.W)
        prompt_entry = ttk.Entry(prompt_frame, textvariable=self.custom_prompt, width=60)
        prompt_entry.pack(fill=tk.X, pady=2)

        # === Run Button ===
        self.run_btn = ttk.Button(
            main_frame,
            text="Generate Background",
            command=self._run_generation,
            style="Accent.TButton",
        )
        self.run_btn.pack(pady=20, ipadx=20, ipady=10)

        # === Progress Section ===
        progress_frame = ttk.LabelFrame(main_frame, text="Progress", padding="10")
        progress_frame.pack(fill=tk.BOTH, expand=True, pady=5)

        self.progress_bar = ttk.Progressbar(progress_frame, mode="indeterminate")
        self.progress_bar.pack(fill=tk.X, pady=5)

        # Log text area
        self.log_text = tk.Text(progress_frame, height=8, state=tk.DISABLED, wrap=tk.WORD)
        self.log_text.pack(fill=tk.BOTH, expand=True)

        scrollbar = ttk.Scrollbar(self.log_text, command=self.log_text.yview)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.configure(yscrollcommand=scrollbar.set)

    def _update_dilation_label(self, value):
        """Update dilation label with current value."""
        self.dilation_label.configure(text=f"{int(float(value))}px")

    def _browse_input(self):
        """Open file dialog to select input image."""
        filetypes = [
            ("Image files", "*.jpg *.jpeg *.png *.webp *.bmp"),
            ("JPEG files", "*.jpg *.jpeg"),
            ("PNG files", "*.png"),
            ("All files", "*.*"),
        ]
        filepath = filedialog.askopenfilename(
            title="Select Wedding Photo",
            filetypes=filetypes,
        )
        if filepath:
            self.input_path.set(filepath)
            self._log(f"Selected: {filepath}")

    def _log(self, message: str):
        """Add message to log area."""
        self.log_text.configure(state=tk.NORMAL)
        self.log_text.insert(tk.END, message + "\n")
        self.log_text.see(tk.END)
        self.log_text.configure(state=tk.DISABLED)
        self.root.update_idletasks()

    def _clear_log(self):
        """Clear log area."""
        self.log_text.configure(state=tk.NORMAL)
        self.log_text.delete("1.0", tk.END)
        self.log_text.configure(state=tk.DISABLED)

    def _run_generation(self):
        """Run the background generation process."""
        # Validation
        if not self.input_path.get():
            messagebox.showerror("Error", "Please select an input photo.")
            return

        if not Path(self.input_path.get()).exists():
            messagebox.showerror("Error", "Selected file does not exist.")
            return

        if not self.api_token.get():
            messagebox.showerror("Error", "Please enter your Replicate API token.")
            return

        if self.is_processing:
            messagebox.showwarning("Warning", "Already processing. Please wait.")
            return

        # Start processing in background thread
        self.is_processing = True
        self.run_btn.configure(state=tk.DISABLED)
        self.progress_bar.start(10)
        self._clear_log()
        self._log("Starting background generation...")

        thread = threading.Thread(target=self._process_image, daemon=True)
        thread.start()

    def _process_image(self):
        """Process the image in background thread."""
        try:
            # Set API token
            os.environ["REPLICATE_API_TOKEN"] = self.api_token.get()

            # Import here to avoid startup delay
            self._log("Loading modules...")
            from wedding_bg_gen import process_wedding_photo

            # Run the pipeline
            prompt = self.custom_prompt.get() if self.custom_prompt.get().strip() else None

            self._log(f"Input: {self.input_path.get()}")
            self._log(f"Dilation: {self.dilation.get()}px")
            if prompt:
                self._log(f"Custom prompt: {prompt[:50]}...")
            self._log("")
            self._log("Processing... This may take 30-60 seconds.")

            output_path = process_wedding_photo(
                input_path=self.input_path.get(),
                output_path=None,
                positive_prompt=prompt,
                dilation_pixels=self.dilation.get(),
            )

            self._log("")
            self._log(f"[SUCCESS] Output saved to:")
            self._log(output_path)

            # Show success message
            self.root.after(0, lambda: messagebox.showinfo(
                "Success",
                f"Background replaced successfully!\n\nSaved to:\n{output_path}"
            ))

            # Open output folder
            self.root.after(0, lambda: os.startfile(Path(output_path).parent))

        except Exception as e:
            self._log(f"[ERROR] {str(e)}")
            self.root.after(0, lambda: messagebox.showerror("Error", str(e)))

        finally:
            self.is_processing = False
            self.root.after(0, lambda: self.run_btn.configure(state=tk.NORMAL))
            self.root.after(0, self.progress_bar.stop)


def main():
    """Main entry point."""
    root = tk.Tk()

    # Try to set a modern theme
    try:
        root.tk.call("source", "azure.tcl")
        root.tk.call("set_theme", "light")
    except tk.TclError:
        pass

    # Set icon (optional)
    try:
        root.iconbitmap(default="")
    except tk.TclError:
        pass

    app = WeddingBgApp(root)
    root.mainloop()


if __name__ == "__main__":
    main()
