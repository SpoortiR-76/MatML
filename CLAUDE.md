# MatML — Material Property Prediction using Machine Learning
## Master Project Context for Antigravity / Claude Code

---

## 🧠 PROJECT IDENTITY

**Name:** MatML  
**Tagline:** Predict. Understand. Optimize. Material properties, powered by ML.  
**Purpose:** A full-stack ML web application that predicts mechanical properties of engineering materials (concrete, steel, alloys) from composition data — without lab tests.  
**Audience:** Engineering students, materials researchers, portfolio evaluators, future real-world users  
**Status:** Building from scratch — clean architecture, seamless integration  

---

## 🏗️ SYSTEM ARCHITECTURE

```
User Browser
    ↓ (HTTPS)
React Frontend (Vite + Tailwind + Framer Motion)
    ↓ (REST API calls to /api/*)
FastAPI Backend (Python)
    ↓ (loads at startup)
Trained ML Models (.pkl files in backend/trained_models/)
    ↓ (returns JSON predictions + SHAP values)
React displays results in glass cards
```

**Deployment Target:** Render.com  
- Backend: Render Web Service (FastAPI)  
- Frontend: Render Static Site (React build)  

---

## 🛠️ TECH STACK (NON-NEGOTIABLE)

| Layer | Technology | Reason |
|---|---|---|
| Frontend | React 18 + Vite | Fast build, modern ecosystem |
| Styling | Tailwind CSS | Utility-first, consistent design |
| Animation | Framer Motion | Production-grade animations |
| State | Zustand | Lightweight, simple |
| Backend | FastAPI (Python) | Native Python, auto docs, fast |
| ML | scikit-learn + XGBoost + SHAP | Full ML pipeline |
| Model format | .pkl (joblib) | Standard, fast loading |
| Training env | Anaconda (local) | Pre-trained, pkl files committed |
| Deployment | Render.com | Free tier available |

**DO NOT introduce Node.js, Express, or any JS backend. ML is Python — keep it Python.**

---

## 🎨 DESIGN SYSTEM (STRICT — DO NOT DEVIATE)

```
Background:     #0a0a0a  (near-black — NOT pure #000000)
Surface/Cards:  rgba(255,255,255,0.05) with backdrop-blur-xl
Card border:    rgba(255,255,255,0.08)
Accent Primary: #10b981  (emerald-500)
Accent Hover:   #059669  (emerald-600)
Accent Glow:    rgba(16,185,129,0.2)
Text Primary:   #f9fafb  (gray-50)
Text Secondary: #9ca3af  (gray-400)
Text Muted:     #4b5563  (gray-600)
Error:          #ef4444  (red-500)
Warning:        #f59e0b  (amber-500)
Success:        #10b981  (emerald-500)
Font Display:   'Syne' (headings — sharp, technical)
Font Body:      'DM Sans' (body — clean, readable)
Font Mono:      'JetBrains Mono' (values, metrics)
```

**Landing page:** Dark glassmorphism — animated gradient orbs behind glass cards, Framer Motion scroll reveals  
**Prediction page:** Clean engineering layout — white/slate panels with glass result cards, structured data display  
**Navbar:** Floating glass bar, fixed top, backdrop-blur, border-bottom rgba white  

---

## 📁 PROJECT STRUCTURE (MONOREPO)

```
matml/
├── CLAUDE.md                          ← YOU ARE HERE
├── .claude/
│   ├── SKILLS.md
│   └── agents/
│       ├── frontend-agent.md
│       ├── backend-agent.md
│       └── ml-pipeline-agent.md
│
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── GlassCard.jsx
│   │   │   │   ├── GlassNavbar.jsx
│   │   │   │   ├── InputField.jsx       ← ghost text + tooltip
│   │   │   │   ├── TooltipIcon.jsx
│   │   │   │   ├── ResultCard.jsx
│   │   │   │   ├── ModelBadge.jsx
│   │   │   │   ├── TabSwitcher.jsx
│   │   │   │   └── LoadingSpinner.jsx
│   │   │   ├── sections/
│   │   │   │   ├── HeroSection.jsx
│   │   │   │   ├── FeaturesSection.jsx
│   │   │   │   ├── StatsSection.jsx
│   │   │   │   └── CTASection.jsx
│   │   │   └── predict/
│   │   │       ├── ConcreteForm.jsx
│   │   │       ├── SteelForm.jsx
│   │   │       ├── MaterialsForm.jsx
│   │   │       ├── PredictionResult.jsx
│   │   │       ├── ShapChart.jsx
│   │   │       └── ModelComparisonTable.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AboutPage.jsx
│   │   │   └── PredictPage.jsx
│   │   ├── api/
│   │   │   └── predictions.js           ← all fetch calls here
│   │   ├── hooks/
│   │   │   └── usePrediction.js
│   │   ├── store/
│   │   │   └── predictionStore.js       ← Zustand
│   │   ├── utils/
│   │   │   └── validators.js
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── backend/
│   ├── app/
│   │   ├── main.py                      ← FastAPI entry, CORS, router registration
│   │   ├── config.py                    ← env vars, settings
│   │   ├── routers/
│   │   │   ├── concrete.py              ← POST /api/predict/concrete
│   │   │   ├── steel.py                 ← POST /api/predict/steel
│   │   │   └── materials.py             ← POST /api/predict/materials
│   │   ├── schemas/                     ← Pydantic input/output models
│   │   │   ├── concrete.py
│   │   │   ├── steel.py
│   │   │   └── materials.py
│   │   ├── services/                    ← Business logic
│   │   │   ├── concrete_service.py
│   │   │   ├── steel_service.py
│   │   │   └── materials_service.py
│   │   ├── ml/
│   │   │   ├── loader.py                ← loads all .pkl at startup
│   │   │   └── inference.py             ← runs predictions + SHAP
│   │   └── utils/
│   │       └── logger.py
│   ├── trained_models/                  ← .pkl files placed here after training
│   │   ├── concrete_best_model.pkl
│   │   ├── concrete_scaler.pkl
│   │   ├── steel_best_model.pkl
│   │   ├── steel_scaler.pkl
│   │   ├── materials_reg_model.pkl
│   │   ├── materials_cls_model.pkl
│   │   └── materials_scaler.pkl
│   ├── requirements.txt
│   └── Dockerfile
│
├── training/
│   ├── data/
│   │   ├── concrete_strength.csv
│   │   ├── steel_strength.csv           ← formula, c, mn, si... yield/tensile/elongation
│   │   └── material.csv                 ← Material, Su, Sy, E, G, mu, Ro, Use
│   ├── notebooks/
│   │   ├── 01_concrete_eda.ipynb
│   │   ├── 02_steel_eda.ipynb
│   │   └── 03_materials_eda.ipynb
│   ├── train_concrete.py
│   ├── train_steel.py
│   ├── train_materials.py
│   └── requirements_training.txt
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 📊 DATASETS — EXACT COLUMN NAMES

### Dataset A — Concrete (concrete_strength.csv)
**Input features (X):**
- `Cement (component 1)(kg in a m^3 mixture)`
- `Blast Furnace Slag (component 2)(kg in a m^3 mixture)`
- `Fly Ash (component 3)(kg in a m^3 mixture)`
- `Water  (component 4)(kg in a m^3 mixture)`
- `Superplasticizer (component 5)(kg in a m^3 mixture)`
- `Coarse Aggregate  (component 6)(kg in a m^3 mixture)`
- `Fine Aggregate (component 7)(kg in a m^3 mixture)`
- `Age (day)`

**Target (y):** `Concrete compressive strength(MPa, megapascals)`  
**Task:** Single-output regression  
**Rows:** ~1030  

### Dataset B — Steel (steel_strength.csv)
**Input features (X):** `formula`, `c`, `mn`, `si`, `cr`, `ni`, `mo`, `v`, `n`, `nb`, `co`, `w`, `al`, `ti`  
**Drop:** `formula` (text — no ML signal)  
**Targets (y):** `yield strength`, `tensile strength`, `elongation`  
**Task:** Multi-output regression (3 targets simultaneously)  

### Dataset C — Materials (material.csv)
**Input features (X):** `E`, `G`, `mu`, `Ro`  
**Drop:** `Material` (text)  
**Regression targets:** `Su`, `Sy`  
**Classification target:** `Use` (boolean TRUE/FALSE → encode as 1/0)  
**Task:** Multi-output regression + binary classification  
**Note:** Dataset contains multiple material types (steel alloys, aluminum, titanium, etc.)  

---

## 🤖 ML MODEL DECISIONS

| Module | Dataset | Baseline | Main | Best Saved As |
|---|---|---|---|---|
| Module 1 | Concrete | LinearRegression | RandomForestRegressor | concrete_best_model.pkl |
| Module 2 | Steel | LinearRegression (per target) | MultiOutputRegressor(XGBRegressor) | steel_best_model.pkl |
| Module 3a | Materials | LinearRegression | MultiOutputRegressor(RandomForestRegressor) | materials_reg_model.pkl |
| Module 3b | Materials | — | RandomForestClassifier | materials_cls_model.pkl |

**Selection rule:** Train all candidates, compare MAE/R²/Accuracy, save the winner only.  
**Always save the scaler** alongside the model. Use `joblib.dump()`.  

---

## 🌐 API CONTRACT (FRONTEND ↔ BACKEND)

### POST /api/predict/concrete
**Request:**
```json
{
  "cement": 540.0,
  "blast_furnace_slag": 0.0,
  "fly_ash": 0.0,
  "water": 162.0,
  "superplasticizer": 2.5,
  "coarse_aggregate": 1040.0,
  "fine_aggregate": 676.0,
  "age": 28
}
```
**Response:**
```json
{
  "predicted_compressive_strength_mpa": 79.4,
  "model_used": "RandomForestRegressor",
  "r2_score": 0.921,
  "shap_values": {"cement": 0.34, "age": 0.28, "water": -0.18, ...}
}
```

### POST /api/predict/steel
**Request:**
```json
{
  "c": 0.02, "mn": 0.05, "si": 0.05, "cr": 0.01,
  "ni": 19.7, "mo": 2.95, "v": 0.01, "n": 0.0,
  "nb": 0.01, "co": 15.0, "w": 0.0, "al": 0.15, "ti": 1.55
}
```
**Response:**
```json
{
  "predicted_yield_strength_mpa": 2411.5,
  "predicted_tensile_strength_mpa": 2473.5,
  "predicted_elongation_percent": 7.0,
  "model_used": "MultiOutputRegressor(XGBRegressor)",
  "shap_values": {...}
}
```

### POST /api/predict/materials
**Request:**
```json
{
  "E": 207000,
  "G": 79000,
  "mu": 0.3,
  "Ro": 7860
}
```
**Response:**
```json
{
  "predicted_Su_mpa": 421.0,
  "predicted_Sy_mpa": 314.0,
  "predicted_use": true,
  "use_probability": 0.94,
  "model_used": "RandomForestRegressor + RandomForestClassifier",
  "shap_values": {...}
}
```

### GET /api/health
```json
{ "status": "ok", "models_loaded": true }
```

---

## ⚠️ CRITICAL RULES FOR ALL AGENTS

1. **NEVER merge the three datasets** — they have incompatible schemas
2. **NEVER fit_transform on test data** — only fit on train, transform on test
3. **NEVER use Node.js** — FastAPI handles all backend
4. **ALWAYS use the exact column names** from the Dataset section above
5. **ALWAYS drop text columns** (`formula`, `Material`) before training
6. **ALWAYS save both model AND scaler** as separate .pkl files
7. **ALWAYS use `random_state=42`** for reproducibility
8. **ALWAYS evaluate on test set only** — never report train metrics as final
9. **Frontend API calls ALWAYS go through** `src/api/predictions.js` — never inline fetch
10. **Design tokens NEVER hardcoded** — always use Tailwind config or CSS variables
11. **CORS must be configured** in FastAPI for the frontend origin
12. **Environment variables** via `.env` files — never hardcode URLs or secrets

---

## 🔄 SUBAGENT WORKFLOW

When Antigravity spawns subagents, they should work in this order:

```
Phase 1 (parallel):
  → ml-pipeline-agent: Write all 3 training scripts
  → backend-agent: Scaffold FastAPI app, schemas, routers (mock responses first)
  → frontend-agent: Scaffold React app, pages, components (mock data first)

Phase 2 (sequential):
  → ml-pipeline-agent: Training complete → .pkl files placed in backend/trained_models/
  → backend-agent: Wire real model loading + inference
  → frontend-agent: Connect to real API endpoints

Phase 3:
  → Integration testing
  → Polish animations + UX
  → Deployment prep
```

---

## 📋 NAMING CONVENTIONS

| Layer | Convention | Example |
|---|---|---|
| React components | PascalCase | `GlassCard.jsx`, `ConcreteForm.jsx` |
| React hooks | camelCase with `use` | `usePrediction.js` |
| API functions | camelCase | `predictConcrete()`, `predictSteel()` |
| FastAPI routers | snake_case | `concrete.py`, `steel_service.py` |
| Pydantic models | PascalCase | `ConcreteInput`, `SteelPredictionResponse` |
| API routes | kebab-case | `/api/predict/concrete`, `/api/predict/steel` |
| Python variables | snake_case | `yield_strength`, `compressive_strength` |
| CSS classes | Tailwind utilities only | no custom class names unless in globals.css |
| .pkl files | `{dataset}_{type}.pkl` | `concrete_best_model.pkl`, `steel_scaler.pkl` |

---

## 🚀 COMMANDS REFERENCE

```bash
# Frontend
cd frontend
npm install
npm run dev          # http://localhost:5173

# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000   # http://localhost:8000

# Training (run in Anaconda terminal)
cd training
python train_concrete.py
python train_steel.py
python train_materials.py
# → copies .pkl files to ../backend/trained_models/

# Full system (Docker)
docker-compose up --build
```

---

## 🎯 FEATURE PRIORITY

| Priority | Feature | Status |
|---|---|---|
| P0 | Working ML pipeline (all 3 datasets) | Build first |
| P0 | FastAPI endpoints returning predictions | Build first |
| P0 | React prediction UI with tabs | Build first |
| P1 | SHAP explainability charts | Build second |
| P1 | Model comparison table on About page | Build second |
| P1 | Input tooltips + ghost text | Build second |
| P2 | Framer Motion animations | Polish phase |
| P2 | What-if sliders | Polish phase |
| V2 | Target performance toggle (recommend composition) | Future version |
| V2 | Render deployment | After local works |
