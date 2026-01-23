from playwright.sync_api import sync_playwright, expect

def verify_website():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Load the local HTML file
        page.goto("file:///app/index.html")

        # Verify Title
        expect(page).to_have_title("R Noone Plastering")
        print("Title verified.")

        # Verify Facebook Link
        fb_link = page.locator('a[href="https://www.facebook.com/share/17oc4fuFRv/"]')
        expect(fb_link).to_be_visible()
        print("Facebook link found.")

        # Take screenshot
        page.screenshot(path="verification/screenshot.png", full_page=True)
        print("Screenshot taken.")

        browser.close()

if __name__ == "__main__":
    verify_website()
