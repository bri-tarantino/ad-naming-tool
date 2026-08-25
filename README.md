# 🌱 Growth | File Naming Tool v1.2

A lightweight internal web tool for generating standardized ad file names across The Mind Company's product suite (Elevate, Balance, Spark, TMC). Built to replace a manual spreadsheet-based naming process with an automated, team-friendly interface.

**Live URL:** [file-naming-tool.vercel.app](https://file-naming-tool.vercel.app) *(update with your actual Vercel URL)*

---

## What It Does

- Generates file names in a consistent format: `PREFIX_###_AssetType_Freeform_Size_Date_Platform`
- Supports **Static (S)** and **Video (V)** asset types
- Auto-generates platform-specific video variants (Meta, TikTok, YouTube) with correct sizes
- Auto-fills today's date in MMDDYY format
- Logs every generated file name to a shared Google Sheet with full field breakdown and timestamps
- Maintains a per-session list with copy, copy-all, and CSV export functionality

---

## Naming Convention

### Format
`PREFIX_###_AssetType_Freeform_Size_Date_Platform`

### Examples
- `ELE_104_S_BlinkistBillboard_1x1_082526_NA`
- `BAL_207_V_MoodCheckin_9x16_082526_TT`
- `SPA_055_V_DailyReminder_16x9_082526_YT`

### Ticket Prefixes
| App      | Prefix |
|----------|--------|
| Elevate  | ELE    |
| Balance  | BAL    |
| Spark    | SPA    |
| TMC      | TMC    |

### Asset Types
| Type   | Code | Behavior |
|--------|------|----------|
| Static | S    | Single file. Size defaults to 1×1, platform locked to Meta (NA). |
| Video  | V    | Platform-driven. Generates size variants automatically. |

### Video Platform Variants
| Platform | Sizes Generated         | Platform Codes |
|----------|------------------------|----------------|
| Meta     | 4×5, 9×16, + AppLovin 9×16 | NA, AL     |
| TikTok   | 9×16                   | TT             |
| YouTube  | 9×16, 4×5, 16×9        | YT             |

### Platform Codes
| Platform  | Code |
|-----------|------|
| Meta      | NA   |
| AppLovin  | AL   |
| TikTok    | TT   |
| YouTube   | YT   |

### Date Format
MMDDYY — auto-filled with today's date (e.g., `082526` for August 25, 2026)

---

## Tech Stack

| Layer        | Technology              |
|-------------|------------------------|
| Frontend    | React + Vite           |
| Hosting     | Vercel (auto-deploys from GitHub) |
| Logging     | Google Sheets via Google Apps Script |
| Repository  | GitHub                 |

---

## Project Structure

```
ad-naming-tool/
├── public/
│   └── favicon.svg
├── src/
│   ├── App.jsx              # Root component wrapper
│   ├── FileNamingTool.jsx   # Main tool (all logic lives here)
│   ├── index.css            # Global styles (dark theme base)
│   └── main.jsx             # React entry point
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Google Sheet Integration

### How It Works
Every time a user clicks "+ Add to Session List", the tool sends the file name and all metadata to a Google Sheet via a Google Apps Script web app endpoint. Each product tab (Elevate, Balance, Spark, TMC) logs to its own sheet tab.

### Sheet Structure
Each tab has the following columns:

| Column | Field       | Description                          |
|--------|-------------|--------------------------------------|
| A      | File Name   | Full generated file name             |
| B      | Ticket      | Ticket prefix + number (e.g., ELE_104) |
| C      | Asset Type  | Static or Video                      |
| D      | Description | Freeform description text            |
| E      | Size        | File dimensions (1x1, 4x5, 9x16, 16x9) |
| F      | Date        | Go-live date (formatted as date)     |
| G      | Platform    | Platform code (NA, AL, TT, YT)      |
| H      | Timestamp   | When the entry was generated         |

Entries are auto-sorted by timestamp (newest first).

---

## How to Update

### Making code changes
1. Open the project folder in VS Code
2. Edit files in `src/`
3. Test locally with `npm run dev`
4. Stop the dev server with `Ctrl+C`
5. Push to deploy:
   ```
   git add .
   git commit -m "describe your change"
   git push
   ```
6. Vercel auto-deploys within ~30 seconds

### Updating the Apps Script
1. Open the Google Sheet → Extensions → Apps Script
2. Edit the code
3. Deploy → New deployment → Web app → Anyone
4. Copy the new URL
5. Update `SHEET_URL` in `src/FileNamingTool.jsx`
6. Push the code change to deploy

---

## Key Configuration

All configurable values are at the top of `src/FileNamingTool.jsx`:

- `APPS` — Product tabs, prefixes, and sheet names
- `PLATFORMS` — Platform options and codes
- `FILE_SIZES` — Available static file sizes
- `VIDEO_PLATFORM_VARIANTS` — Size/platform combos per video platform
- `SHEET_URL` — Google Apps Script endpoint
- `SHEET_VIEW_URL` — Direct link to the Google Sheet

---

## Team Usage

1. Open the Vercel URL in any browser (desktop, tablet, or phone)
2. Select the product tab (Elevate, Balance, Spark, TMC)
3. Enter the ticket number
4. Choose Static or Video
5. Type a freeform description (use camelCase or underscores)
6. For Video: select the platform (Meta, TikTok, YouTube)
7. Click "+ Add to Session List"
8. Copy individual names or use "Copy All" / "CSV"
9. All entries are automatically logged to the shared Google Sheet