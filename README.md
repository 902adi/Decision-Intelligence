# रक्षक · Rakshak
### *Decide faster than the water rises.*

> **AI Decision Intelligence for Flood Response** — a minimalist, calm, and beautiful crisis-management web app built for citizens, field workers, and emergency officers during flood events.

---

## 🌊 What is Rakshak?

**Rakshak** (रक्षक — *protector* in Sanskrit) is an AI-powered flood response platform that:

- **Analyzes** real-time rainfall, river level, ward elevation, and SOS signals
- **Finds patterns** across 12 city wards using a deterministic decision engine
- **Compares alternatives** in a Scenario Comparison Lab (AI Plan vs Traditional Reactive Plan)
- **Assesses risk** per ward every 5 minutes and generates risk scores (0–100)
- **Gives explainable recommendations** that humans can approve or override with a full audit trail
- **Predicts upcoming weather phenomena** (cloudburst, dam surge, heavy rain) with plain-language explanations of *how* each prediction is made

---

## ✨ Key Features

### 🏠 Citizen Mode

| Feature | Description |
|---|---|
| **Live Risk Status** | One large card in plain language — Safe & Dry / Watch Water / Rising Water / High Danger |
| **AI Phenomenon Forecast** | Predicts next weather event with probability %, timeline, and signal bars explaining the prediction |
| **GPS Location Tracker** | Detects your ward automatically via browser geolocation |
| **Dry Walking Path** | Safe evacuation route avoiding flooded roads |
| **SOS Rescue Request** | One-tap boat/ambulance dispatch with live status tracking |
| **Nearest Shelter Info** | Live capacity, food packets, clean water, and medical kits at nearest camp |
| **Community Check-in** | "I'm safe / I need help / Leaving now" — updates officer dashboard instantly |
| **Problem Reporting** | Photo + location incident reports sent to officers in under 1 second |
| **Emergency Helplines** | 112, 108, Police — tap to call |
| **Animated Background** | Rain drops + glowing orbs that intensify with rainfall level |

### 🎛️ Officer Command Room (Gated Access)

| Tab | Description |
|---|---|
| **Map** | Live SVG city map with ward-level risk heatmap + AI Actions panel |
| **SOS** | Priority queue of all active rescue requests with citizen details |
| **Weather** | IMD-style forecast bars, river level trend, and scenario projections |
| **Log** | Full audit trail — every AI recommendation and human override with timestamps |

**Officer tools:**
- 4 scenario presets (Normal Day / Heavy Rain / Cloudburst / Dam Release) with **sound effects**
- Rainfall intensity slider (0–240 mm/h) that recalculates all 12 ward risks in real time
- Time scrubber (T+0h → T+6h) with auto-play for projections
- Map/Satellite toggle (Google Maps integration)
- Approve or Override AI recommendations — all logged

---

## 🧠 AI Decision Engine

The decision pipeline runs entirely **client-side** (no backend needed for the prototype):

```
rainfallMmH + riverLevelRise + timeHour + hotspotWardId
        ↓
  runDecisionPipeline()  [src/engine/pipeline.ts]
        ↓
  Ward Risk Scores (0–100) per ward
  Evacuation Routes
  Recommended Actions with confidence %
  Resource Deployment suggestions
  Camp Capacity projections
```

**Phenomenon Prediction** uses 4 signals:
1. Current rainfall rate (mm/h)
2. Ward ground elevation (metres)
3. River proximity risk (ward-specific factor)
4. Time of day (night amplifies cloudburst risk)

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Framework | **React 18** + **TypeScript** |
| Build tool | **Vite** |
| State management | **Zustand** |
| Animations | **Framer Motion** + CSS keyframes |
| Styling | **Tailwind CSS v4** + custom CSS variables |
| Maps | **Google Maps Embed API** + custom SVG vector map |
| Sound FX | **Web Audio API** (synthesized — no audio files) |
| Icons | **Lucide React** |
| Fonts | Inter + JetBrains Mono + Instrument Serif (Google Fonts) |
| i18n | Custom translation engine — English / Hindi / Marathi |
| Data | Deterministic simulation (drop-in ready for live Postgres/PostGIS) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install & Run

```bash
# Clone the repo
git clone https://github.com/902adi/Decision-Intelligence.git
cd Decision-Intelligence

# Install dependencies
npm install

# Start the dev server
npm run dev
```

App runs at **http://localhost:5173**

### Build for Production

```bash
npm run build
```

Output goes to `dist/` — ready to deploy on Vercel, Netlify, or any static host.

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── citizen/
│   │   ├── CitizenView.tsx
│   │   ├── PhenomenonForecastCard.tsx   <- AI prediction widget
│   │   ├── SosRequestModal.tsx
│   │   ├── SafeRouteModal.tsx
│   │   └── ReportProblemModal.tsx
│   ├── officer/
│   │   ├── OfficerLayout.tsx            <- 4-tab minimal layout
│   │   ├── OfficerSignInPage.tsx        <- Auth gate
│   │   ├── CitySvgMap.tsx               <- Interactive ward map
│   │   ├── RecommendedActions.tsx       <- AI actions + approve/override
│   │   ├── SosQueuePanel.tsx
│   │   ├── ForecastView.tsx
│   │   └── DecisionLogView.tsx
│   ├── common/
│   │   ├── AnimatedBackground.tsx       <- Rain + orb animations
│   │   ├── Header.tsx
│   │   ├── GpsTrackerWidget.tsx
│   │   └── ...
│   └── landing/
│       └── LandingPage.tsx
├── engine/
│   └── pipeline.ts                     <- Core AI decision engine
├── store/
│   └── useAppStore.ts                  <- Zustand global state
├── i18n/
│   └── translations.ts                 <- EN / HI / MR strings
├── data/
│   └── rivergate.ts                    <- Ward topology, roads, camps
├── services/
│   └── index.ts                        <- Data service layer
└── utils/
    └── soundEffects.ts                 <- Web Audio synthesis engine
```

---

## 🎨 Design Principles

- **Minimal & calm** — In a crisis the UI must feel quiet. Muted, desaturated colors. Generous whitespace. Hairline borders.
- **Plain language** — All citizen-facing text targets a 6th-grade reading level.
- **Explainable AI** — Every recommendation shows *why* it was made, what signals drove it, and what alternatives were rejected.
- **Human-in-the-loop** — Officers approve or override every AI action. Nothing is automated.
- **Offline-resilient** — A service worker queue holds actions made without connectivity.
- **Accessible** — Colorblind-safe pattern mode, three text sizes, prefers-reduced-motion respected.

---

## 🌐 Languages Supported

| Language | Status |
|---|---|
| English | Full |
| Hindi | Full |
| Marathi | Full |

---

## 🔊 Sound Effects

All sounds are **synthesized in real-time** using the Web Audio API — no audio files are downloaded:

| Scenario | Sound |
|---|---|
| Normal Day | Peaceful C-major 9th chord chime |
| Heavy Rain | High-density filtered noise wash |
| Cloudburst | Lightning snap + rolling sub-bass thunder + rain surge |
| Dam Release | Hydraulic siren drone + resonant water roar |
| UI clicks | Soft sine-wave tap |
| Alerts | Two-note triangle wave chime |

---

## 🛡️ Disclaimer

> This is a **prototype** for decision intelligence research and demonstration purposes. It does **not** automatically dispatch municipal forces. In a life-threatening emergency, **dial 112 immediately**.

---

## 📄 License

MIT © 2024 Rakshak Project

---

*Built with care for every person who deserves to know — before the water rises.*
