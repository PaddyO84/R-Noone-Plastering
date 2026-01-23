from playwright.sync_api import sync_playwright, expect
import os

def verify_website():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        page.goto("file:///app/index.html")

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
        assert src.endswith("images/profile.jpg")
        print("Profile image verified.")

        # Take screenshot
        page.screenshot(path="verification/screenshot_v2.png", full_page=True)
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_website()
