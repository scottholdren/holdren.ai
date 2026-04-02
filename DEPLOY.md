# Interview Link Tracking - Deployment Guide

## What This Is

68 personalized redirect pages, one per applicant. When an applicant clicks their link:

1. JavaScript calls ipinfo.io to get their IP, city, state, country
2. That data is POSTed to your Google Apps Script webhook
3. The webhook logs everything to a Google Sheet
4. The page redirects to your Zoom scheduler

The whole process takes under 2 seconds. The applicant just sees a brief "Redirecting..." screen.

## Deployment Steps

### 1. Deploy the Pages (Cloudflare Pages - free)

1. Sign up at https://pages.cloudflare.com (free)
2. Click "Create a project" > "Direct Upload"
3. Upload the entire `tracking-pages` folder
4. Cloudflare gives you a URL like `https://something.pages.dev`
5. Note this URL

### 2. Set Up the Click Logger (Google Sheets)

1. Create a new Google Sheet
2. Go to Extensions > Apps Script
3. Delete the default code
4. Paste the contents of `google-apps-script.js`
5. Click Deploy > New deployment
6. Type: Web app | Execute as: Me | Access: Anyone
7. Click Deploy, authorize when prompted
8. Copy the web app URL

### 3. Connect Them

1. Open `config.js` on your deployed site (or edit it before uploading)
2. Set `window._hds_webhook` to your Google Apps Script URL:
   ```
   window._hds_webhook = "https://script.google.com/macros/s/YOUR-SCRIPT-ID/exec";
   ```
3. Re-upload config.js to Cloudflare Pages

### 4. Update Your Spreadsheet

In `Applicant_Tracker.xlsx`, find-and-replace:
```
YOUR-DOMAIN.pages.dev
```
with your actual Cloudflare Pages domain.

### 5. Test

Open one of the applicant links (try your own test one). Check:
- You get redirected to Zoom scheduler
- A new row appears in your Google Sheet with IP/geo data

## File Structure

```
tracking-pages/
  config.js          <- Set your webhook URL here
  setup.html         <- Browser-based setup/test page
  google-apps-script.js  <- Paste into Google Apps Script
  DEPLOY.md          <- This file
  i/
    jenson-booth.html
    steven-brown.html
    ... (68 total)
```

## Alternative Hosting

Instead of Cloudflare Pages, you can use:
- **Netlify**: Drag-and-drop the folder at https://app.netlify.com/drop
- **GitHub Pages**: Push to a repo and enable Pages in settings
- **Vercel**: Import folder at https://vercel.com/new

Any static hosting works. The pages are just HTML + JS with no server requirement.
