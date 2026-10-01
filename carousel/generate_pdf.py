import os
from PIL import Image

def generate_pdf():
    assets_dir = r"d:\Projects\society-management-system\carousel\assets"
    
    # 12 live product & module slides in chronological order
    slide_files = [
        "awaastech_slide_01.png",  # Slide 1: Grand Introduction & Hero
        "awaastech_slide_02.png",  # Slide 2: Admin Command Center
        "awaastech_slide_03.png",  # Slide 3: Resident & Flat Registry
        "awaastech_slide_04.png",  # Slide 4: Automated Maintenance Billing
        "awaastech_slide_05.png",  # Slide 5: Notice Board & Global Meetings
        "awaastech_slide_06.png",  # Slide 6: Grievance Redressal Portal
        "awaastech_slide_07.png",  # Slide 7: Gate Security & Parcel Locker
        "awaastech_slide_08.png",  # Slide 8: Amenity Bookings & Digital AGM Voting
        "awaastech_slide_09.png",  # Slide 9: Green Society & Sustainability ERP
        "awaastech_slide_10.png",  # Slide 10: WhatsApp AI Resident Concierge
        "awaastech_slide_11.png",  # Slide 11: Society Accounting & Financial Analytics
        "awaastech_slide_12.png",  # Slide 12: Grand Finale & Open Source GitHub
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
