import os
from PIL import Image, ImageDraw, ImageFont

ASSETS_DIR = r"d:\Projects\society-management-system\carousel\assets"

def fix_concurrency_slide():
    """Fix Slide 4: Remove cut-off artifact from right edge and center card."""
    src_path = os.path.join(ASSETS_DIR, "awaastech_concurrency_slide_1790600359832.jpg")
    out_path = os.path.join(ASSETS_DIR, "awaastech_concurrency_slide_fixed.jpg")
    
    img = Image.open(src_path).convert("RGB")
    bg_color = (244, 238, 224) # Warm cream #F9F8F3
    
    # The main card is between x=130 and x=892, y=130 and y=880
    card_width = 892 - 130  # 762
    card_height = 880 - 130 # 750
    card = img.crop((130, 130, 892, 880))
    
    # Create clean 1024x1024 canvas
    clean = Image.new("RGB", (1024, 1024), bg_color)
    paste_x = (1024 - card_width) // 2   # 131
    paste_y = (1024 - card_height) // 2  # 137
    clean.paste(card, (paste_x, paste_y))
    
    clean.save(out_path, quality=98)
    print("Fixed Slide 4 (Concurrency) — right cut-off removed & perfectly centered.")
    return out_path

def fix_security_slide():
    """Fix Slide 7: Render 4 distinct, rounded cards matching the aesthetic of Slide 3 & 11."""
    src_path = os.path.join(ASSETS_DIR, "awaastech_security_slide_1790600918789.jpg")
    out_path = os.path.join(ASSETS_DIR, "awaastech_security_slide_fixed.jpg")
    
    img = Image.open(src_path).convert("RGB")
    draw = ImageDraw.Draw(img)
    
    # Clear the plain raw text area inside the card with the card surface color
    card_surface_color = (247, 245, 240)
    draw.rectangle([205, 285, 820, 775], fill=card_surface_color)
    
    # Fonts
    font_bold = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 17)
    font_sub = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 12)
    font_pill = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 10)
    
    # Colors
    c_charcoal = (44, 44, 44)
    c_muted = (107, 107, 107)
    c_card_bg = (255, 253, 249) # Soft Alabaster
    
    cards = [
        {
            "box": [215, 295, 495, 515],
            "border": (217, 115, 78), # Terracotta
            "pill_bg": (247, 234, 227),
            "pill_fg": (217, 115, 78),
            "tag": "AUTH SECURITY",
            "title": "httpOnly Cookie JWTs",
            "line1": "Tokens in secure httpOnly cookies",
            "line2": "Zero XSS localStorage theft"
        },
        {
            "box": [530, 295, 810, 515],
            "border": (107, 112, 92), # Muted Olive
            "pill_bg": (239, 241, 235),
            "pill_fg": (107, 112, 92),
            "tag": "SESSION CONTROL",
            "title": "Redis Token Blacklist",
            "line1": "Revoked tokens written to bl_${token}",
            "line2": "Immediate stateless logout"
        },
        {
            "box": [215, 545, 495, 765],
            "border": (232, 228, 217), # Warm Organic Border
            "pill_bg": (242, 240, 230),
            "pill_fg": (74, 85, 104),
            "tag": "INJECTION DEFENSE",
            "title": "NoSQL Injection Sanitizer",
            "line1": "Recursive $ key & dot stripping",
            "line2": "Full MongoDB query protection"
        },
        {
            "box": [530, 545, 810, 765],
            "border": (74, 144, 226), # Blue Accent
            "pill_bg": (235, 243, 252),
            "pill_fg": (43, 108, 176),
            "tag": "ACCESS CONTROL",
            "title": "Granular RBAC Engine",
            "line1": "Strict hasPermission() checks",
            "line2": "Across 35+ REST endpoints"
        }
    ]
    
    for c in cards:
        x1, y1, x2, y2 = c["box"]
        # Draw rounded card with subtle organic shadow effect
        draw.rounded_rectangle([x1+2, y1+2, x2+2, y2+2], radius=16, fill=(238, 235, 228))
        draw.rounded_rectangle([x1, y1, x2, y2], radius=16, fill=c_card_bg, outline=c["border"], width=2)
        
        # Pill badge at top of card
        pill_text = c["tag"]
        pill_w = len(pill_text) * 6 + 16
        draw.rounded_rectangle([x1 + 16, y1 + 16, x1 + 16 + pill_w, y1 + 36], radius=10, fill=c["pill_bg"])
        draw.text((x1 + 24, y1 + 19), pill_text, font=font_pill, fill=c["pill_fg"])
        
        # Title
        draw.text((x1 + 16, y1 + 52), c["title"], font=font_bold, fill=c_charcoal)
        
        # Subtitle lines
        draw.text((x1 + 16, y1 + 86), c["line1"], font=font_sub, fill=c_muted)
        draw.text((x1 + 16, y1 + 110), c["line2"], font=font_sub, fill=c_muted)
    
    img.save(out_path, quality=98)
    print("Fixed Slide 7 (Security) — now structured into 4 distinct cards matching the deck.")
    return out_path

if __name__ == "__main__":
    fix_concurrency_slide()
    fix_security_slide()
