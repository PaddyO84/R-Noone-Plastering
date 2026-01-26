# Hosting Guide for R Noone Plastering

This repository contains a custom-coded website (HTML, CSS, JavaScript) that provides a professional online presence with a custom gallery, carousel, and contact features.

Because this is a **custom code** solution, it works differently from drag-and-drop builders like "Google Sites". You cannot simply "upload" this code into the Google Sites editor. Instead, you host this code on a platform like **GitHub Pages** (free and robust) and point your new domains to it.

## 1. Hosting the Site (GitHub Pages)

Since this code is already in a Git repository, the easiest way to get it online is **GitHub Pages**.

1.  Go to the **Settings** tab of this repository on GitHub.
2.  Click on **Pages** in the left sidebar.
3.  Under **Build and deployment**, select **Source** -> **Deploy from a branch**.
4.  Under **Branch**, select `main` (or `master`) and folder `/ (root)`. Click **Save**.
5.  Scroll down to **Custom domain**. You should see `rnooneplastering.ie` entered there (because we added a `CNAME` file). If not, enter `rnooneplastering.ie` and click **Save**.
6.  Check the **Enforce HTTPS** box.

Your site will essentially be "live" at `rnooneplastering.ie` once you configure the DNS (next step).

## 2. Connecting Your Domains (DNS Configuration)

You need to log in to the website where you bought your domains (e.g., Google Domains, GoDaddy, Namecheap) and manage the **DNS Settings** for `rnooneplastering.ie`.

### A. Primary Domain: `rnooneplastering.ie`

Add the following **A Records** to point your domain to GitHub's servers:

| Type | Name (Host) | Value (IP Address) |
| :--- | :--- | :--- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |

And add one **CNAME Record** for the "www" subdomain:

| Type | Name (Host) | Value (Target) |
| :--- | :--- | :--- |
| CNAME | www | rnooneplastering.github.io |

*(Note: Replace `rnooneplastering.github.io` with your actual GitHub username + .github.io if it differs, but usually GitHub provides the specific target in the Pages settings tab).*

### B. Secondary Domain: `ryannooneplastering.ie`

You do not need to host a second site. You just want to **forward** this domain.

1.  In your domain registrar's dashboard, look for **Domain Forwarding** or **Web Forwarding**.
2.  Set up a **301 Permanent Redirect**.
3.  Source: `ryannooneplastering.ie`
4.  Target/Destination: `https://rnooneplastering.ie`

## 3. What about the Google Site?

The link you provided (`https://sites.google.com/view/rnooneplastering/home`) is a **Google Site**. This is a separate system from the custom code we wrote.

*   **Recommendation**: Once your new custom site is live at `rnooneplastering.ie`, you can simply stop using the Google Site. Your new site replaces it entirely.
*   **Connecting them**: If you strictly want to keep the Google Site URL active but show the new content, you can use the **Embed** feature in Google Sites:
    1.  Open your Google Site editor.
    2.  Select **Embed**.
    3.  Enter the URL of your new site: `https://rnooneplastering.ie`.
    4.  Select **Whole Page** to embed the entire website inside the Google Site.
    *   *Warning*: This creates a "site inside a site" (iframe) which is often bad for mobile users and SEO. We strongly recommend using the custom domain method (Step 1 & 2) instead.

## Summary of Files

*   `index.html`: The main homepage.
*   `style.css`: All colors, fonts, and layout rules (including the Teal/Yellow theme).
*   `script.js`: Logic for the Hero Carousel and Photo Lightbox.
*   `images/`: Contains the poster and the `gallery/` folder with all project photos.
*   `CNAME`: A configuration file used by GitHub Pages to know which domain to use.
