import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

CAROUSEL_DIR = r"d:\Projects\society-management-system\carousel"
ASSETS_DIR = os.path.join(CAROUSEL_DIR, "assets")
HTML_PATH = os.path.join(CAROUSEL_DIR, "index.html")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

with open(HTML_PATH, "r", encoding="utf-8") as f:
    full_html = f.read()

# For each slide 1..26, create a temporary single-slide view and screenshot it at 1080x1080
os.makedirs(ASSETS_DIR, exist_ok=True)

print("Starting export of 26 high-resolution PNG slides...")

for i in range(1, 27):
    # Modify display property for slide i
    # Hide top bar and nav controls, show only slide i
    slide_html = full_html.replace(
        "switchView('carousel');",
        f"switchView('carousel'); showSlide({i});"
    ).replace(
        "</head>",
        """<style>
          body { background: #F9F8F3 !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 1080px !important; height: 1080px !important; }
          .top-bar, .nav-controls, .modal-backdrop, .grid-view, .image-showcase { display: none !important; }
          .carousel-container { margin: 0 !important; width: 1080px !important; height: 1080px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .slide-wrapper { width: 1040px !important; height: 1040px !important; border-radius: 28px !important; padding: 46px 54px 34px 54px !important; box-shadow: 0 16px 40px rgba(0,0,0,0.06) !important; }
          .cover-title { font-size: 56px !important; }
          .screenshot-slide-title { font-size: 36px !important; }
          .slide-subtitle { font-size: 17px !important; }
          .browser-mockup { border-radius: 16px !important; }
          .browser-topbar { padding: 9px 16px !important; }
          .b-dot { width: 11px !important; height: 11px !important; }
          .browser-address-bar { font-size: 13px !important; padding: 5px 12px !important; max-width: 480px !important; }
          .screenshot-img { max-height: 570px !important; }
          .doodle-note { font-size: 13px !important; padding: 5px 12px !important; }
          .slide-tag { font-size: 13px !important; padding: 7px 15px !important; }
          .slide-page-num { font-size: 13px !important; padding: 5px 12px !important; }
          .slide-footer { font-size: 13px !important; }
          .slide-author, .slide-swipe-hint { font-size: 13px !important; }
        </style></head>"""
    )
    
    tmp_path = os.path.join(CAROUSEL_DIR, f"_tmp_slide_{i}.html")
    with open(tmp_path, "w", encoding="utf-8") as ftmp:
        ftmp.write(slide_html)
    
    out_png = os.path.join(ASSETS_DIR, f"awaastech_slide_{i:02d}.png")
    tmp_url = "file:///" + os.path.abspath(tmp_path).replace('\\', '/')
    
    cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-sandbox",
        "--force-device-scale-factor=1.5",
        "--window-size=1080,1080",
        f"--screenshot={out_png}",
        tmp_url
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    os.remove(tmp_path)
    print(f"Rendered slide {i:02d}/26 -> awaastech_slide_{i:02d}.png")

print("All 26 slide PNGs rendered successfully!")
