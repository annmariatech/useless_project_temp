# 🗺️ GooberMaps

> **The Map-Based Travel Comparison Tool for the Useless Hackathon!**  
> Pitting real transportation modes against absurd alternatives like Spider-Man swinging, unicycles, pogo sticks, roller skates, ziplines, and squeaky shopping carts.

---

## ⚡ Tech Stack (100% Free & Open Source)

- **Framework**: Vite + React + TypeScript
- **Mapping**: Leaflet + `react-leaflet`
- **Map Tiles**: OpenStreetMap
- **Geocoding**: Nominatim API
- **Routing**: OSRM Demo Server (Driving API) + Haversine Straight-Line Formula
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Icons & Extras**: Lucide React + Canvas Confetti

---

## 🚀 Quickstart Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Local Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

---

## 🐢 Nominatim Usage Policy & Rate Limits

GooberMaps strictly adheres to [OpenStreetMap Nominatim's Usage Policy](https://operations.osmfoundation.org/policies/nominatim/):
- **User-Agent Header**: All geocoding HTTP requests include a custom identifier header:
  `User-Agent: GooberMaps/1.0 (Hackathon-Demo-App)`
- **Request Throttling**: Geocoding requests are debounced by 600ms and throttled to **at most 1 request per second** (`enforceNominatimThrottle` in `src/lib/geocode.ts`).

---

## 🧮 Absurdity Index Formula

GooberMaps uses a mathematical formula to crown the most ridiculous travel option:

$$\text{Absurdity Score} = \frac{\text{Time (hours)} \times \text{Cost (USD)}}{\text{Practicality Rating}}$$

- **Time (hours)**: Travel duration calculated from mode speed.
- **Cost (USD)**: Fare calculated based on mode per-kilometer rate.
- **Practicality Rating**: Score from $1.0$ (Zipline) to $10.0$ (Driving).

---

## 🎭 Included Modes

### Real Modes
- 🚶 **Walking**: 5 km/h | $0.40/km
- 🚲 **Cycling**: 18 km/h | $0.15/km
- 🚗 **Driving**: 55 km/h | $0.85/km

### Absurd Modes
- 🕷️ **Spider-Man Swing**: 75 km/h | $14.50/km *(Requires skyscrapers & web fluid)*
- 🎪 **Unicycle**: 11 km/h | $0.60/km *(Half the wheels, double the embarrassment)*
- 🦘 **Pogo Stick**: 7.5 km/h | $2.20/km *(Spinal alignment recommended)*
- 🛼 **Roller Skates**: 16 km/h | $0.45/km *(Great until you encounter hills)*
- 🪢 **Zipline**: 95 km/h | $28.00/km *(Straight-line only! Ignores city bylaws)*
- 🛒 **Shopping Cart**: 20 km/h | $0.25/km *(Squeaky front wheel included)*

---

## 💰 Silly Currencies Included

Convert your trip cost from USD into:
- 🍎 Granny Smith Apples
- 🍊 Juicy Oranges
- 🦆 Squeaky Rubber Ducks
- 🫘 Black-Market Kidneys
- 🍞 Artisanal Sourdough Loaves
- ⏳ Minimum-Wage Work Hours
