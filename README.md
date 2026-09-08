# 📚 College Timetable

A simple, mobile-friendly multi-cluster timetable app with Cluster (A–V) & Section selection, offline PWA support, and real-time class tracking.
A simple, mobile-friendly multi-cluster timetable app with Cluster (A–E) & Section selection, offline PWA support, and real-time class tracking.

## ✨ Features

- 📅 Automatically opens on **today's timetable**
- 🏫 Select **Cluster (A–V)** and **Section** (saves automatically locally)
- 🏫 Select **Cluster (A–E)** and **Section** (saves automatically locally)
- 📍 Displays **Room / Lab** numbers and 👨‍🏫 **Teacher / Faculty** names for each slot
- ⏰ Real-time class timings, live countdown, break indicators (Tea/Lunch), and **LIVE NOW** pill
- 🚀 **Coming Soon!! Skill Lab** placeholder view for sections currently being updated
- 👆 Tap **Mon–Sat** buttons to view schedules for any day
- 📱 Optimized for mobile browsers (PWA support)
- 🏠 Installable on Android & iOS home screens as an offline PWA
- 🔄 Automatically updates current time and active classes live

## 📱 Install on Mobile

1. Open the live app link in **Chrome** (Android) or **Safari** (iOS).
2. Open the browser menu (**⋮** on Android, **Share** icon on iOS).
3. Choose **Add to Home screen** or **Install app**.
4. Launch **College Timetable** directly from your home screen like a native app.

## 🌐 Live App

👉 **[Open Live App on GitHub Pages](https://navaneeth860.github.io/Timetable)**

## 🖥️ How It Works

The app is a lightweight static single-page app built with HTML5, CSS3, and Vanilla JavaScript. No server or database required.

When opened, JavaScript checks `localStorage` for your selected Cluster & Section, detects the current day and time, and displays active class cards, room locations, teacher metadata, and break count-downs.

## 📁 Project Structure

```text
Timetable/
├── index.html       # App UI, CSS styling, selectors & timetable JSON dataset
├── manifest.json    # PWA configuration manifest
├── sw.js            # Service worker / offline caching (v3)
├── icon-192.png     # PWA app icon (192x192)
├── icon-512.png     # PWA app icon (512x512)
└── README.md        # Project documentation
```

## 📋 Timetable Data

Includes complete 3rd Semester 2026–27 timetable data for:
- **Cluster B**: Sections `3B1 [3D]`, `3B2 [3G]`, `3B3 [3N]`, `3B4 [3Q]`, `3B5 [3V]`
- **Cluster D**: Sections `3D1 [3B]`, `3D2 [3I]`, `3D3 [3L]`, `3D4 [3S]`, `3D5 [3U]`
- Placeholder/Coming Soon support for Clusters A, C, E, F, G, H... through V.
- Placeholder/Coming Soon support for Clusters A, C, and E.

## 🛠️ Tech Stack

- HTML5
- CSS3 (CSS Variables, Flexbox/Grid, Dark & Light Mode)
- Vanilla JavaScript (ES6+)
- Web App Manifest (PWA)
- Service Worker (Offline Cache API)
- GitHub Pages

## 🚀 Deployment

The project is hosted and deployed automatically using **GitHub Pages** from the `main` branch.

## ⚠️ Disclaimer

This is a student-made timetable app. Always verify class schedule changes with official university announcements.
