# LogiRoute — 50-Screen React Native App

Full-featured logistics optimizer app for iOS & Android built with Expo.

---

## 📁 Project Structure

```
LogiRouteApp/
├── App.js                          ← Entry point
├── package.json
├── app.json
├── babel.config.js
└── src/
    ├── theme/index.js              ← Colors, fonts, shadows
    ├── data/index.js               ← Mock data + API switch
    ├── components/index.js         ← Shared UI components
    ├── navigation/AppNavigator.js  ← All 50 screens registered
    └── screens/
        ├── onboarding/             ← S01–S04
        ├── auth/                   ← S05–S10
        ├── company/                ← S11–S18
        ├── driver/                 ← S19–S24
        ├── route/                  ← S25–S30
        ├── booking/                ← S31–S36
        ├── tracking/               ← S37–S40
        ├── weather/                ← S41–S43
        ├── history/                ← S44–S47
        ├── profile/                ← S48–S50
        └── remaining/              ← S31–S50 implementations
```

---

## 🚀 Setup

```bash
# 1. Go into project folder
cd LogiRouteApp

# 2. Install dependencies
npm install

# 3. Start
npx expo start --no-dev --minify

# 4. Scan QR with Expo Go on your phone
```

---

## 🔌 Switch to Real Backend

Open `src/data/index.js` and change:

```js
// Line 8
export const USE_REAL_API = false;   // ← change to true

// Line 11 — set your Mac's IP
export const API_BASE = 'http://192.168.1.10:8000';
```

Find your Mac IP:
```bash
ipconfig getifaddr en0
```

---

## 📱 All 50 Screens

| # | Screen | Category |
|---|--------|----------|
| 01 | Splash Screen | Onboarding |
| 02 | Onboarding 1 — Optimize | Onboarding |
| 03 | Onboarding 2 — Track | Onboarding |
| 04 | User Type Select | Onboarding |
| 05 | Login | Auth |
| 06 | Register | Auth |
| 07 | OTP Verification | Auth |
| 08 | Forgot Password | Auth |
| 09 | Reset Password | Auth |
| 10 | Profile Setup | Auth |
| 11 | Company Dashboard | Company |
| 12 | New Shipment | Company |
| 13 | Active Shipments | Company |
| 14 | Shipment Detail | Company |
| 15 | Analytics | Company |
| 16 | Fleet Overview | Company |
| 17 | Invoice | Company |
| 18 | Team Members | Company |
| 19 | Driver Dashboard | Driver |
| 20 | My Trips | Driver |
| 21 | Trip Detail | Driver |
| 22 | Available Jobs | Driver |
| 23 | Driver Earnings | Driver |
| 24 | Vehicle Status | Driver |
| 25 | Route Optimizer | Route |
| 26 | Optimize Result | Route |
| 27 | Route Map | Route |
| 28 | Cost Comparison | Route |
| 29 | Route History | Route |
| 30 | Saved Routes | Route |
| 31 | Book Transport | Booking |
| 32 | Select Driver | Booking |
| 33 | Booking Summary | Booking |
| 34 | Payment | Booking |
| 35 | Booking Confirmed | Booking |
| 36 | My Bookings | Booking |
| 37 | Live Tracking | Tracking |
| 38 | Track Shipment | Tracking |
| 39 | Delivery Status | Tracking |
| 40 | ETA Update | Tracking |
| 41 | Weather Dashboard | Weather |
| 42 | Route Weather | Weather |
| 43 | Road Alerts | Weather |
| 44 | History | History |
| 45 | Reports | History |
| 46 | Export Data | History |
| 47 | Feedback & Rating | History |
| 48 | Profile | Profile |
| 49 | Settings | Profile |
| 50 | Notifications | Profile |

---

## 🏗 Build for App Store / Play Store

```bash
# Install EAS
npm install -g eas-cli

# Login to Expo
eas login

# Build Android APK
eas build --platform android --profile preview

# Build iOS (needs Apple Developer account)
eas build --platform ios

# Submit to stores
eas submit --platform android
eas submit --platform ios
```
