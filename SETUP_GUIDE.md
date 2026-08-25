# Setup Guide — File Naming Tool

This guide walks through deploying your own instance of the File Naming Tool from scratch. No coding experience required.

---

## Prerequisites

Install these two applications:
- **Node.js** — Download LTS version from https://nodejs.org
- **VS Code** — Download from https://code.visualstudio.com

Create free accounts on:
- **GitHub** — https://github.com
- **Vercel** — https://vercel.com (sign up with your GitHub account)

---

## Step 1: Clone the Repository

Open VS Code → Terminal → New Terminal. Run:

```
git clone https://github.com/bri-tarantino/ad-naming-tool.git
cd ad-naming-tool
npm install
```

To test locally:
```
npm run dev
```
Then open http://localhost:5173 in your browser.

---

## Step 2: Set Up the Google Sheet

1. Create a new Google Sheet at https://sheets.google.com
2. Name it (e.g., "Growth Ad File Name Log")
3. Create 4 tabs at the bottom: **Elevate**, **Balance**, **Spark**, **TMC**
4. In each tab, add this header row in Row 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| File Name | Ticket | Asset Type | Description | Size | Date | Platform | Timestamp |

5. Note your Sheet ID — it's the long string in the URL between `/d/` and `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit
   ```

---

## Step 3: Set Up Google Apps Script

1. In your Google Sheet, click **Extensions → Apps Script**
2. Delete the default code and paste the following:

```javascript
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok", message: "File Name Logger is running" })
  ).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var data = JSON.parse(e.postData.contents);
  var sheetName = data.sheetName || "Elevate";
  var entries = Array.isArray(data.entries) ? data.entries : [data.entries];

  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
    sheet.appendRow([
      "File Name",
      "Ticket",
      "Asset Type",
      "Description",
      "Size",
      "Date",
      "Platform",
      "Timestamp",
    ]);
  }

  entries.forEach(function (entry) {
    var dateStr = entry.date || "";
    var formattedDate = "";

    if (dateStr.length === 6) {
      var mm = parseInt(dateStr.substring(0, 2), 10);
      var dd = parseInt(dateStr.substring(2, 4), 10);
      var yy = parseInt(dateStr.substring(4, 6), 10);
      formattedDate = new Date(2000 + yy, mm - 1, dd);
    }

    sheet.appendRow([
      entry.fileName || "",
      entry.ticket || "",
      entry.assetType || "",
      entry.description || "",
      entry.size || "",
      formattedDate || dateStr,
      entry.platform || "",
      new Date().toLocaleString(),
    ]);
  });

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var range = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    range.sort({ column: 8, ascending: false });
  }

  return ContentService.createTextOutput(
    JSON.stringify({ status: "success", sheet: sheetName, rows: entries.length })
  ).setMimeType(ContentService.MimeType.JSON);
}
```

3. Save the script (Ctrl+S / Cmd+S)
4. Click **Deploy → New deployment**
5. Select **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Click **Deploy**
7. Authorize access when prompted (if you see "Google hasn't verified this app", click Advanced → Go to [project name])
8. Copy the Web app URL — you'll need it in the next step

---

## Step 4: Connect the Tool to Your Google Sheet

Open `src/FileNamingTool.jsx` in VS Code and update these two values near the top of the file:

```javascript
const SHEET_URL =
  "PASTE_YOUR_APPS_SCRIPT_URL_HERE";

const SHEET_VIEW_URL =
  "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID_HERE/edit";
```

Replace:
- `PASTE_YOUR_APPS_SCRIPT_URL_HERE` with the Web app URL from Step 3
- `YOUR_SHEET_ID_HERE` with your Google Sheet ID from Step 2

Save the file.

---

## Step 5: Deploy to Vercel

### Option A: Fork the existing repo (recommended)
1. Go to the GitHub repo: https://github.com/bri-tarantino/ad-naming-tool
2. Click **Fork** (top right)
3. Go to https://vercel.com → Add New → Project
4. Import your forked repo
5. Click **Deploy**

### Option B: Create a new repo
1. Create a new repository on GitHub
2. In VS Code terminal:
   ```
   git init
   git add .
   git commit -m "initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```
3. Go to https://vercel.com → Add New → Project
4. Import the repo and click **Deploy**

Your tool will be live at the URL Vercel provides.

---

## Step 6: Verify Everything Works

1. Open your Vercel URL
2. Select a product tab
3. Enter a ticket number and description
4. Click "+ Add to Session List"
5. Check your Google Sheet — a new row should appear in the correct tab
6. Verify the "✓ Logged to [App] sheet" toast appears

---

## Customization Guide

### Changing product tabs / prefixes
Edit the `APPS` array in `src/FileNamingTool.jsx`:
```javascript
const APPS = [
  { label: "Elevate", prefix: "ELE", sheet: "Elevate" },
  { label: "Balance", prefix: "BAL", sheet: "Balance" },
  // Add or modify as needed
];
```
Make sure the `sheet` value matches the tab name in your Google Sheet.

### Adding a new video platform
Add an entry to `VIDEO_PLATFORM_VARIANTS`:
```javascript
const VIDEO_PLATFORM_VARIANTS = {
  // ... existing platforms
  XX: [
    { size: "9x16", plat: "XX", label: "9x16 — New Platform" },
  ],
};
```
Then add it to `videoPlatformOptions` in the component.

### Changing the color scheme
Edit the color constants at the top of `src/FileNamingTool.jsx`:
```javascript
const ACCENT = "#29B6F6";  // Primary accent color
const BG = "#1a1a1a";      // Background
const TEXT = "#f0f0f0";     // Primary text
const TEXT_MID = "#aaa";    // Secondary text
const TEXT_DIM = "#666";    // Muted text
```

---

## Pushing Updates

After making any changes in VS Code:

1. Stop the dev server if running: `Ctrl+C`
2. Run:
   ```
   git add .
   git commit -m "describe your change"
   git push
   ```
3. Vercel auto-deploys within ~30 seconds

---

## Troubleshooting

**Google Sheet not receiving data**
- Verify the `SHEET_URL` in FileNamingTool.jsx matches your latest Apps Script deployment URL
- Redeploy the Apps Script: Deploy → New deployment → copy new URL → update the tool
- Make sure "Who has access" is set to "Anyone" (not "Anyone at [company]")

**Vercel deployment fails**
- If the repo is private, either make it public or upgrade to Vercel Pro
- If you see "could not associate committer", run:
  ```
  git config --global user.email "your-github-email@example.com"
  git config --global user.name "your-github-username"
  git commit --allow-empty -m "fix identity"
  git push
  ```

**Tool shows blank screen after update**
- Check the browser console (right-click → Inspect → Console tab) for error messages
- Make sure all files are saved in VS Code
- Try a hard refresh: Ctrl+Shift+R / Cmd+Shift+R

**Terminal not accepting commands**
- The dev server may still be running — press Ctrl+C to stop it
- If that doesn't work, close the terminal (trash icon) and open a new one: Terminal → New Terminal