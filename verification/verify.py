from playwright.sync_api import sync_playwright, expect
import os
import time

def verify_website():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        cwd = os.getcwd()
        page.goto(f"file://{cwd}/index.html")

        # 1. Verify Title
        expect(page).to_have_title("R Noone Plastering | Donegal")
        print("Title verified.")

        # 2. Verify Carousel
        carousel = page.locator('.hero-carousel')
        expect(carousel).to_be_visible()
        slides = page.locator('.hero-slide')
        expect(slides).to_have_count(5)
        # Check active class presence
        expect(page.locator('.hero-slide.active')).to_be_visible()
        print("Carousel verified.")

        # 3. Verify Theme Colors (Teal)
        # Check the Get a Free Quote button background color
        btn = page.locator('.btn').first
        # We need to get computed style.
        # Note: Playwright evaluates hex to rgb. #009B77 is rgb(0, 155, 119)
        bg_color = btn.evaluate("element => getComputedStyle(element).backgroundColor")
        print(f"Button background color: {bg_color}")
        # Allow some tolerance or check specific string
        assert bg_color == "rgb(0, 155, 119)", f"Expected rgb(0, 155, 119) but got {bg_color}"
        print("Theme color verified.")

        # 4. Verify Gallery & Poster
        gallery_imgs = page.locator('.gallery-grid img')
        count = gallery_imgs.count()
        print(f"Found {count} gallery images.")
        assert count > 10, "Gallery seems too empty."

        # Check first image is the poster (or one of the images)
        first_src = gallery_imgs.first.get_attribute("src")
        print(f"First gallery image: {first_src}")
        # I prepended poster.jpg
        assert "poster.jpg" in first_src
        print("Poster verified in gallery.")

        # 5. Verify Contact
        phone = page.locator('a[href="tel:+353834063343"]')
        expect(phone).to_be_visible()

        email = page.locator('a[href="mailto:rnooneplastering@gmail.com"]')
        expect(email).to_be_visible()
        print("Contact info verified.")

        # Take screenshot
        if not os.path.exists("verification"):
            os.makedirs("verification")
        page.screenshot(path="verification/screenshot_final_v2.png", full_page=True)
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_website()
