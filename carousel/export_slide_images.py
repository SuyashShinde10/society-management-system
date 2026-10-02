import os
import subprocess
import sys

sys.stdout.reconfigure(encoding='utf-8')

CAROUSEL_DIR = r"d:\Projects\society-management-system\carousel"
ASSETS_DIR = os.path.join(CAROUSEL_DIR, "assets")
HTML_PATH = os.path.join(CAROUSEL_DIR, "index.html")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"

TOTAL_SLIDES = 23

with open(HTML_PATH, "r", encoding="utf-8") as f:
    full_html = f.read()

os.makedirs(ASSETS_DIR, exist_ok=True)

# Clean up older slide PNGs beyond 23 if present
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
          .browser-card-container { flex: 1 !important; min-height: 0 !important; width: 100% !important; display: flex !important; align-items: center !important; justify-content: center !important; position: relative !important; }
          .browser-mockup { width: var(--cw-1080) !important; height: var(--ch-1080) !important; border-radius: 18px !important; box-shadow: 0 16px 40px rgba(0,0,0,0.07) !important; flex: none !important; margin: auto auto !important; }
          .browser-topbar { padding: 10px 18px !important; height: 42px !important; }
          .b-dot { width: 11px !important; height: 11px !important; }
          .browser-address-bar { font-size: 13.5px !important; padding: 4px 14px !important; max-width: 520px !important; }
          .browser-live-badge { font-size: 12px !important; padding: 3px 10px !important; }
          .browser-viewport { width: var(--vw-1080) !important; height: var(--vh-1080) !important; flex: none !important; overflow: hidden !important; }
          .screenshot-img { width: 100% !important; height: 100% !important; object-fit: fill !important; display: block !important; }
          .doodle-note-pill { font-size: 13px !important; padding: 5px 14px !important; }
          .slide-tag { font-size: 13px !important; padding: 6px 15px !important; }
          .slide-page-num { font-size: 13px !important; padding: 5px 12px !important; }
          .slide-footer { font-size: 13px !important; padding-top: 12px !important; }
          .slide-author, .slide-swipe-hint { font-size: 13px !important; }
          /* Coming Next Styles */
          .coming-next-content { padding-top: 10px !important; }
          .monitor-doodle-left { width: 65px !important; height: 65px !important; top: 0px !important; left: 20px !important; }
          .monitor-doodle-right { width: 65px !important; height: 65px !important; top: 0px !important; right: 20px !important; }
          .dashboards-grid { gap: 20px !important; max-width: 920px !important; margin-bottom: 24px !important; }
          .dash-card { border-radius: 18px !important; padding: 16px 18px !important; gap: 10px !important; }
          .dash-card-title { font-size: 17px !important; }
          .dash-badge { font-size: 11px !important; padding: 3px 8px !important; }
          .dash-mockup-mini { height: 115px !important; border-radius: 10px !important; padding: 8px 10px !important; gap: 8px !important; }
          .mini-sidebar { width: 26px !important; gap: 4px !important; padding: 6px 3px !important; }
          .mini-bar { height: 3px !important; }
          .mini-kpi-label { height: 3px !important; }
          .mini-kpi-val { height: 6px !important; }
          .mini-row { height: 4px !important; }
          .dash-desc { font-size: 13.5px !important; line-height: 1.35 !important; }
          .bottom-teaser-box { max-width: 920px !important; margin-top: 10px !important; }
          .teaser-stamp { font-size: 14px !important; padding: 8px 18px !important; }
          .stay-tuned-text { font-size: 26px !important; }
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
