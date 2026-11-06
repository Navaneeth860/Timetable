# College Timetable

A modern, mobile-friendly multi-branch college timetable and attendance/bunk tracking web app with offline PWA support, live status tracking, and clean, professional styling.

## Features

- **Automatic Daily View:** Opens automatically to today's schedule with real-time class tracking.
- **Multi-Branch & Section Filters:** Filter schedules across **CSE**, **ECE**, **AIML**, and **CS(IOT)**, including cluster and section selection with persistent local caching.
- **Live Status & Countdown:** Real-time indicator for ongoing classes ("LIVE NOW"), next upcoming class countdown, and tea/lunch break cards.
- **Attendance & Bunk Tracking Engine:**
  - Mark individual classes or full days as bunked directly from the timetable.
  - Classify bunks into **Personal** (casual/self-study) vs **Official Duty / Medical** (OD, events, emergencies).
  - Add optional reason titles and descriptive notes.
  - View overall bunk statistics and quick metrics.
  - Filter past bunks by category (Personal vs OD), subject, and month.
  - Streamlined bunk metadata limited to Subject Name, Subject Code, Date, and Time.
- **Clean SVG Iconography:** Professional, minimalist SVG icons for course codes, venues, instructors, groups, breaks, and actions with zero cartoonish emojis.
- **Day-by-Day Navigation:** Interactive day switcher (Mon–Sat) with dates and quick "Back to Today" jump button.
- **100% Offline PWA:** Installable on Android and iOS home screens with seamless Service Worker caching.

## Install on Mobile

1. Open the live app link in **Chrome** (Android) or **Safari** (iOS).
2. Open the browser menu (**⋮** on Android, **Share** on iOS).
3. Tap **Add to Home screen** or **Install app**.
4. Launch **College Timetable** directly from your home screen with instant offline access.

## Live App

👉 **[Open College Timetable](https://navaneeth860.github.io/Timetable)**

## How It Works

The app is built with pure HTML5, CSS3, and modern Vanilla JavaScript without heavy framework dependencies.

- Data is loaded asynchronously from `data.json` and cached locally in `localStorage` for instant subsequent loads.
- Bunk records and filter preferences are persisted in `localStorage`.
- Real-time calculations determine the active period, upcoming class, and countdown timers relative to local time.
- A Service Worker (`sw.js`) caches all assets (`index.html`, `style.css`, `script.js`, `data.json`, icons) for reliable offline support.

## Project Structure

```text
Timetable/
├── index.html       # Semantic HTML markup, dialog modals, and PWA setup
├── style.css        # Responsive dark-theme styling, CSS variables & layouts
├── script.js        # Core logic: timetable engine, live countdown, filters & bunk tracking
├── data.json        # Structured timetable dataset for all branches and sections
├── manifest.json    # Progressive Web App manifest
├── sw.js            # Service worker for offline caching and background updates
├── icon-192.png     # PWA app icon (192x192)
├── icon-512.png     # PWA app icon (512x512)
└── README.md        # Project documentation
```

## Supported Branches & Schedules

Based on the 3rd Semester 2026–27 timetable:
- **CSE:** 22 sections across Clusters A–E (`3A1–3A4`, `3B1–3B5`, `3C1–3C4`, `3D1–3D5`, `3E1–3E4`)
- **AIML:** 7 sections across Clusters A and B (`3A1–3A3`, `3B1–3B2`, etc.)
- **ECE:** 7 sections (`ECE-S3-3A` through `ECE-S3-3G`)
- **CS(IOT):** `CSE-IoT`

## Tech Stack

- **HTML5:** Semantic elements (`<dialog>`, `<main>`, `<article>`, `<section>`)
- **CSS3:** Custom properties (CSS variables), Grid, Flexbox, backdrop filters, responsive mobile-first UI
- **Vanilla JavaScript:** ES6+, native `Intl` DateTimeFormat, `localStorage` API, custom modals
- **Web App Manifest & Service Worker:** Offline PWA functionality
- **GitHub Pages:** Automated static hosting

## Disclaimer

This is an independent student-made timetable and productivity tool. Always verify official schedule changes and attendance requirements with university announcements and departments.
