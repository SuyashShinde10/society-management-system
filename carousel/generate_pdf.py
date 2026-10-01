import os
from PIL import Image

def generate_pdf():
    assets_dir = r"d:\Projects\society-management-system\carousel\assets"
    
    # 11 professional introduction slides in chronological order
    slide_files = [
        "awaastech_carousel_cover_1790600283254.jpg",            # Slide 1: Grand Introduction & Hero
        "awaastech_problem_slide_1790600867398.jpg",             # Slide 2: The Core Problems It Solves
        "awaastech_roles_overview_1790601607104.jpg",            # Slide 3: All 4 Roles & Functions
        "awaastech_concurrency_slide_fixed.jpg",         # Slide 4: Distributed Concurrency (Fixed & Centered)
        "awaastech_geofence_escrow_1790600381876.jpg",           # Slide 5: GPS Geofenced Smart Escrow (turf.js)
        "awaastech_ai_agent_1790600399096.jpg",                  # Slide 6: Generative AI Dispute Agent (LangGraph)
        "awaastech_security_slide_fixed.jpg",            # Slide 7: Bank-Grade Security (Fixed with 4 Cards)
        "awaastech_bullmq_slide_1790600937634.jpg",              # Slide 8: Async BullMQ Pipelines & DLQ
        "awaastech_tech_stack_1790600422173.jpg",                # Slide 9: Complete Full-Stack Architecture
        "awaastech_lessons_slide_1790601190132.jpg",             # Slide 10: Production Engineering Lessons
        "awaastech_coming_next_dashboards_1790601961802.jpg"     # Slide 11: Coming Next: The Dashboards (Part 2 Teaser)
    ]
    
    images = []
    for filename in slide_files:
        path = os.path.join(assets_dir, filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"Missing slide image: {path}")
        img = Image.open(path).convert("RGB")
        images.append(img)
    
    print(f"Loaded {len(images)} slides successfully.")
    
    # Output PDF locations:
    output_pdf_1 = r"d:\Projects\society-management-system\carousel\Awaastech-LinkedIn-Carousel.pdf"
    output_pdf_2 = r"d:\Projects\society-management-system\Awaastech-LinkedIn-Carousel.pdf"
    
    first_image = images[0]
    other_images = images[1:]
    
    first_image.save(
        output_pdf_1,
        "PDF",
        resolution=150.0,
        save_all=True,
        append_images=other_images
    )
    print(f"Generated PDF at: {output_pdf_1}")
    
    first_image.save(
        output_pdf_2,
        "PDF",
        resolution=150.0,
        save_all=True,
        append_images=other_images
    )
    print(f"Generated PDF at: {output_pdf_2}")

if __name__ == "__main__":
    generate_pdf()
