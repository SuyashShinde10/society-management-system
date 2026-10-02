import os
import subprocess
import pypdf
import sys

# Ensure UTF-8 output
sys.stdout.reconfigure(encoding='utf-8')

CAROUSEL_DIR = r"d:\Projects\society-management-system\carousel"
ASSETS_DIR = os.path.join(CAROUSEL_DIR, "assets")
ROOT_DIR = r"d:\Projects\society-management-system"
HTML_PATH = os.path.join(CAROUSEL_DIR, "index.html")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

def render_pdf_via_chrome():
    print("Rendering 26-slide LinkedIn Carousel PDF via Headless Chrome...")
    pdf_out_carousel = os.path.join(CAROUSEL_DIR, "Awaastech-LinkedIn-Carousel.pdf")
    pdf_out_root = os.path.join(ROOT_DIR, "Awaastech-LinkedIn-Carousel.pdf")
    
    file_url = "file:///" + os.path.abspath(HTML_PATH).replace('\\', '/')
    
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--run-all-compositor-stages-before-draw",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_out_carousel}",
        file_url
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    if res.returncode != 0:
        print("Chrome error:", res.stderr)
        raise RuntimeError("Chrome failed to export PDF")
    
    # Copy to root as well
    with open(pdf_out_carousel, "rb") as fsrc:
        data = fsrc.read()
    with open(pdf_out_root, "wb") as fdst:
        fdst.write(data)
    
    reader = pypdf.PdfReader(pdf_out_carousel)
    print(f"Successfully generated Carousel PDF with {len(reader.pages)} pages!")
    print(f"Page 1 size: {reader.pages[0].mediabox}")
    print(f"Saved to: {pdf_out_carousel}")
    print(f"Saved to: {pdf_out_root}")

if __name__ == "__main__":
    render_pdf_via_chrome()
