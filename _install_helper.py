#!/usr/bin/env python3
"""Installation helper for Wedding BG Generator."""

import subprocess
import sys

# Ensure UTF-8 output on Windows
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

print("=" * 50)
print("Wedding Photo Background Generator - Setup")
print("=" * 50)
print()

packages = [
    "rembg>=2.0.50",
    "Pillow>=10.0.0",
    "numpy>=1.24.0",
    "replicate>=0.25.0",
]

print("[1/2] Installing dependencies...")
print()

for pkg in packages:
    print(f"  Installing: {pkg}")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", pkg],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(f"    [WARN] Error installing {pkg}")
        print(f"    {result.stderr[:200]}")
    else:
        print(f"    [OK]")

print()
print("[2/2] Downloading rembg model (first run only)...")
print("  This may take a few minutes...")

try:
    from rembg import new_session
    session = new_session("u2net")
    print("  [OK] Model downloaded successfully!")
except Exception as e:
    print(f"  [WARN] Model will download on first use: {e}")

print()
print("=" * 50)
print("[DONE] Setup complete!")
print()
print("Next steps:")
print("  1. Get your Replicate API token from: https://replicate.com/account/api-tokens")
print("  2. Double-click 'Run_Wedding_BG.bat' to start")
print("=" * 50)
