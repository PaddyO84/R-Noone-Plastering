# Admin & Photo Upload Guide

This guide explains how the owner can upload new project photos through the web interface without touching any code or terminal commands.

---

## 1. How It Works

1. **Admin Portal**: Accessible at `https://rnooneplastering.ie/admin/`.
2. **Uploading Photos**:
   - The owner logs in using their GitHub account.
   - They click **New Project** or select an existing project.
   - They enter the title and upload **After** photos (and optionally **Before** photos).
   - They click **Publish**.
3. **Automated Rebuild (GitHub Actions)**:
   - When new photos are committed to the repository, the automated workflow [`.github/workflows/rebuild-gallery.yml`](.github/workflows/rebuild-gallery.yml) runs immediately.
   - It runs `python tools/generate_gallery_data.py` to regenerate `gallery_data.js`.
   - The changes are automatically committed and deployed to the live website on GitHub Pages.

---

## 2. One-Time Setup for the Owner's Access

Because this site is hosted directly on **GitHub Pages**, authentication connects to GitHub.

### Option A: Invite the Owner to GitHub (Simplest & Direct)
1. Have the owner create a free account at [github.com](https://github.com) (if they don't have one).
2. In this GitHub repository:
   - Go to **Settings** > **Collaborators**.
   - Click **Add people** and enter the owner's GitHub username or email.
   - Give them **Write** permission so they can upload photos.
3. The owner visits `https://rnooneplastering.ie/admin/` and clicks **Login with GitHub** (or enters their Personal Access Token once on mobile).

### Option B: Sveltia CMS / Free Cloudflare Worker OAuth Gateway (Alternative 1-Click Login)
If you want the owner to have a 1-click popup login without seeing any token prompts:
- Deploy a free, open-source Decap OAuth proxy (such as `decap-cms-oauth` on Cloudflare Workers or Vercel).
- Add the `base_url` to [`admin/config.yml`](admin/config.yml).

---

## 3. GitHub Actions Permission Setting

To make sure the auto-rebuild action can commit `gallery_data.js` back to the repository:
1. Go to the repository **Settings** on GitHub.
2. In the left menu, select **Actions** > **General**.
3. Scroll down to **Workflow permissions**.
4. Select **Read and write permissions**.
5. Click **Save**.
