#!/usr/bin/env python3
"""
Builds two web export packages for the MATH 319 Math Lab Dashboard:
1. math319-dashboard-standalone.html — Single-file self-contained HTML (ideal for Canvas/Blackboard/Email).
2. math319-math-lab-dashboard.zip — Clean static site archive (ideal for Netlify Drop / GitHub Pages).
"""
import os
import zipfile

ROOT = os.path.dirname(os.path.abspath(__file__))

def build_standalone_html():
    with open(os.path.join(ROOT, "index.html"), "r", encoding="utf-8") as f:
        html = f.read()
    with open(os.path.join(ROOT, "styles.css"), "r", encoding="utf-8") as f:
        css = f.read()
    with open(os.path.join(ROOT, "data.js"), "r", encoding="utf-8") as f:
        data_js = f.read()
    with open(os.path.join(ROOT, "optimizer.js"), "r", encoding="utf-8") as f:
        optimizer_js = f.read()
    with open(os.path.join(ROOT, "app.js"), "r", encoding="utf-8") as f:
        app_js = f.read()

    # Inline styles.css
    html = html.replace(
        '<link rel="stylesheet" href="styles.css" />',
        f"<style>\n{css}\n</style>"
    )

    # Inline data.js, optimizer.js, and app.js
    scripts_block = (
        '  <!-- Modular Scripts -->\n'
        '  <script src="data.js"></script>\n'
        '  <script src="optimizer.js"></script>\n'
        '  <script src="app.js"></script>'
    )
    inline_scripts = (
        f"  <!-- Inlined Scripts for Single-File Standalone Export -->\n"
        f"  <script>\n{data_js}\n  </script>\n"
        f"  <script>\n{optimizer_js}\n  </script>\n"
        f"  <script>\n{app_js}\n  </script>"
    )
    assert scripts_block in html, "Could not locate script tags in index.html"
    html = html.replace(scripts_block, inline_scripts)

    out_path = os.path.join(ROOT, "math319-dashboard-standalone.html")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Created standalone HTML: {out_path} ({os.path.getsize(out_path):,} bytes)")

def build_web_zip():
    zip_path = os.path.join(ROOT, "math319-math-lab-dashboard.zip")
    web_files = [
        "index.html",
        "styles.css",
        "data.js",
        "optimizer.js",
        "app.js",
        "README.md",
        "MATH319_Math_Lab_Dashboard_User_Guide.pdf",
        "MATH319_5Min_Presentation_Slides_and_Script.pdf",
    ]
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        for fname in web_files:
            fpath = os.path.join(ROOT, fname)
            if os.path.exists(fpath):
                zf.write(fpath, arcname=fname)
    print(f"Created web deployment zip: {zip_path} ({os.path.getsize(zip_path):,} bytes)")

if __name__ == "__main__":
    build_standalone_html()
    build_web_zip()

