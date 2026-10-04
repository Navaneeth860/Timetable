# 📚 College Timetable

An offline-first, mobile-friendly student timetable Progressive Web App (PWA) with Branch, Cluster & Section selection, real-time class tracking, and zero build steps. Built with vanilla HTML/CSS/JS and hosted on GitHub Pages.

## ✨ Features

- 📅 **Today's Timetable**: Automatically opens on the current day's schedule.
- 🏫 **Branch, Cluster & Section Selectors**: Select your branch (CSE, ECE, CS(IOT), AIML), cluster, and section (persisted in local storage).
- 📍 **Venue & Faculty Info**: Displays room numbers, course codes, and teacher details for every slot.
- ⏰ **Real-Time Countdown**: Live status banner showing active classes, upcoming classes, break indicators (Tea/Lunch), and free periods.
- 👥 **Parallel Labs**: Automatically identifies and lists overlapping lab batches (e.g., "Embedded Technologies Lab + Data Structures Lab").
- 📱 **Offline PWA**: Full offline capability via Service Worker caching (`timetable-app-v14`).
- ♿ **Accessible**: WCAG AA color contrast compliant, screen-reader polite announcements, visible focus outlines, and reduced motion support.

## 🌐 Live App

👉 **[Open Live App on GitHub Pages](https://navaneeth860.github.io/Timetable)**

## 📱 Install on Mobile

1. Open the live app link in **Chrome** (Android) or **Safari** (iOS).
2. Tap the browser menu (**⋮** on Android, **Share** icon on iOS).
3. Select **Add to Home screen** or **Install app**.

## 📁 Project Structure

```text
Timetable/
├── index.html               # App markup, UI logic, selectors & rendering
├── style.css                # App styles, CSS variables & media queries
├── data.json                # Timetable dataset (separate JSON file)
├── sw.js                    # Service Worker with offline caching & stale-while-revalidate
├── manifest.json            # PWA web app manifest
├── scripts/
│   ├── time-engine.js       # Core time parsing, status & sorting functions
│   └── validate-data.js     # CLI validator for data.json integrity
├── tests/
│   └── time-engine.test.js  # Node.js unit tests for time & status engine
├── icon-192.png             # PWA app icon (192x192)
├── icon-512.png             # PWA app icon (512x512)
└── README.md                # Project documentation
```

## 🛠️ Updating Timetable Data

1. Edit `data.json` to update class timings, subjects, rooms, or faculty details.
2. If introducing overlapping parallel labs, add `"parallel": true` to each overlapping entry.
3. Update `"lastUpdated"` or `"DATA_VERSION"` at the top level of `data.json` (e.g., `"lastUpdated": "October 4, 2026"`).
4. Bump `CACHE` version string in `sw.js` (e.g., `timetable-app-v15`).
5. Run the validation script to verify formatting and sorting:
   ```bash
   node scripts/validate-data.js
   ```

## 🧪 Testing

Run the unit test suite locally using Node.js:
```bash
node tests/time-engine.test.js
```

## ⚠️ Disclaimer

This is a student-made timetable app. Always verify class schedule changes with official university announcements.
