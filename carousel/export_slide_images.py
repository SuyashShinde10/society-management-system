import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

CAROUSEL_DIR = r"d:\Projects\society-management-system\carousel"
ASSETS_DIR = os.path.join(CAROUSEL_DIR, "assets")
HTML_PATH = os.path.join(CAROUSEL_DIR, "index.html")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

TOTAL_SLIDES = 22

with open(HTML_PATH, "r", encoding="utf-8") as f:
    full_html = f.read()

os.makedirs(ASSETS_DIR, exist_ok=True)

# Clean up older slide PNGs beyond 22 if present
for old_i in range(TOTAL_SLIDES + 1, 30):
    old_f = os.path.join(ASSETS_DIR, f"awaastech_slide_{old_i:02d}.png")
    if os.path.exists(old_f):
        os.remove(old_f)

print(f"Starting export of {TOTAL_SLIDES} high-resolution PNG slides with full screenshot fill...")

for i in range(1, TOTAL_SLIDES + 1):
    slide_html = full_html.replace(
        "switchView('carousel');",
        f"switchView('carousel'); showSlide({i});"
    ).replace(
        "</head>",
        """<style>
          body { background: #F9F8F3 !important; padding: 0 !important; margin: 0 !important; display: flex !important; align-items: center !important; justify-content: center !important; width: 1080px !important; height: 1080px !important; }
          .top-bar, .nav-controls, .modal-backdrop, .grid-view, .image-showcase { display: none !important; }
          .carousel-container { margin: 0 !important; width: 1080px !important; height: 1080px !important; display: flex !important; align-items: center !important; justify-content: center !important; }
          .slide-wrapper { width: 1080px !important; height: 1080px !important; border-radius: 0 !important; border: none !important; padding: 44px 50px 34px 50px !important; box-shadow: none !important; box-sizing: border-box !important; }
          .cover-title { font-size: 58px !important; }
          .screenshot-slide-title { font-size: 34px !important; margin-bottom: 6px !important; }
          .slide-subtitle { font-size: 16.5px !important; line-height: 1.4 !important; }
          .browser-mockup { border-radius: 18px !important; box-shadow: 0 16px 40px rgba(0,0,0,0.07) !important; flex: 1 !important; margin-top: 8px !important; }
          .browser-topbar { padding: 11px 18px !important; }
          .b-dot { width: 12px !important; height: 12px !important; }
          .browser-address-bar { font-size: 13.5px !important; padding: 5px 14px !important; max-width: 520px !important; }
          .browser-live-badge { font-size: 12px !important; padding: 3px 10px !important; }
          .browser-viewport { width: 100% !important; flex: 1 !important; height: 100% !important; overflow: hidden !important; }
          .screenshot-img { width: 100% !important; height: 100% !important; object-fit: cover !important; object-position: top center !important; display: block !important; }
          .doodle-note-pill { font-size: 13px !important; padding: 5px 14px !important; }
          .slide-tag { font-size: 13px !important; padding: 6px 15px !important; }
          .slide-page-num { font-size: 13px !important; padding: 5px 12px !important; }
          .slide-footer { font-size: 13px !important; padding-top: 12px !important; }
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
    print(f"Rendered slide {i:02d}/{TOTAL_SLIDES} -> awaastech_slide_{i:02d}.png")

print(f"All {TOTAL_SLIDES} slide PNGs rendered successfully!")
