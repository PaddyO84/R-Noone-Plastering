from playwright.sync_api import sync_playwright, expect
import os

def verify_website():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        # Ensure we are using absolute path for file protocol
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # Verify Title
        expect(page).to_have_title("R Noone Plastering | Donegal")
        print("Title verified.")

        # Verify Phone Number
        phone_link = page.locator('a[href="tel:+353834063343"]')
        expect(phone_link).to_be_visible()
        print("Phone number verified.")

        # Verify Profile Image
        profile_img = page.locator('.about-img')
        expect(profile_img).to_be_visible()
        # Check that src ends with the correct filename
        src = profile_img.get_attribute("src")
        assert "images/profile.jpg" in src
        print("Profile image verified.")

        # Verify Gallery Images
        gallery_imgs = page.locator('.gallery-grid img')
        count = gallery_imgs.count()
        print(f"Found {count} gallery images.")
        assert count > 0, "No gallery images found."

        first_img = gallery_imgs.first
        expect(first_img).to_be_visible()
        src_gallery = first_img.get_attribute("src")
        assert "images/gallery/" in src_gallery
        print("Gallery images verified.")

        # Take screenshot
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/screenshot_final.png", full_page=True)
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_website()
