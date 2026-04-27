# MatML — SKILLS.md
## Subagent Capability Definitions for Antigravity

---

## SKILL: React Frontend Development

**Activation:** Any task involving UI components, pages, styling, animations, or API integration in the `frontend/` directory.

### Design System (ALWAYS apply)
- Background `#0a0a0a`, accent `#10b981` (emerald), glass cards `rgba(255,255,255,0.05)`
- Fonts: Syne (headings), DM Sans (body), JetBrains Mono (metrics/values)
- Import fonts via Google Fonts in `index.html`
- All spacing via Tailwind utilities — no inline styles unless for dynamic values
- Animations via Framer Motion — `motion.div`, `AnimatePresence`, `useInView`

### Component Rules
- Every component is a named export with PropTypes or TypeScript-style JSDoc
- GlassCard wraps ALL result panels, feature cards, and info boxes
- InputField ALWAYS includes: placeholder (ghost text), tooltip icon, label, error state
- Never use raw `<input>` tags — always use the `InputField` component
- API calls ONLY through `src/api/predictions.js` — never inline fetch in components

### Tailwind Config Extensions (add to tailwind.config.js)
```js
extend: {
  colors: {
    emerald: { DEFAULT: '#10b981', hover: '#059669', glow: 'rgba(16,185,129,0.2)' },
    surface: 'rgba(255,255,255,0.05)',
    border: 'rgba(255,255,255,0.08)',
  },
  backdropBlur: { glass: '20px' },
  fontFamily: {
    display: ['Syne', 'sans-serif'],
    body: ['DM Sans', 'sans-serif'],
    mono: ['JetBrains Mono', 'monospace'],
  }
}
```

---

## SKILL: FastAPI Backend Development

**Activation:** Any task involving API routes, Pydantic schemas, model loading, inference, or `backend/` directory.

### Architecture Rules
- One router file per dataset: `concrete.py`, `steel.py`, `materials.py`
- One schema file per dataset in `backend/app/schemas/`
- One service file per dataset in `backend/app/services/`
- All models loaded ONCE at startup via `app/ml/loader.py` using `@asynccontextmanager` lifespan
- Models stored in `app.state.models` dict — never reload per-request

### CORS Configuration (required)
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", os.getenv("FRONTEND_URL", "*")],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Response Format (ALL endpoints must follow this)
```python
# Success
{"status": "success", "data": {...}, "model_used": "...", "r2_score": 0.921}
# Error  
{"status": "error", "message": "...", "detail": "..."}
```

### SHAP Integration
- Use `shap.TreeExplainer` for RF and XGB models
- Return top-5 feature contributions as dict in every prediction response
- Compute SHAP on the scaled input (after StandardScaler transform)

---

## SKILL: ML Pipeline & Training

**Activation:** Any task involving data loading, preprocessing, model training, evaluation, or saving .pkl files.

### Data Loading Rules
- Concrete CSV target column: `Concrete compressive strength(MPa, megapascals)`
- Steel CSV: drop `formula` column (text), targets are `yield strength`, `tensile strength`, `elongation`
- Materials CSV: drop `Material` column (text), regression targets `Su`+`Sy`, classification target `Use` (encode TRUE→1, FALSE→0)
- ALWAYS check `df.dtypes` and drop all `object` dtype columns from X

### Pipeline Template (apply to all 3 datasets)
```python
# 1. Load → 2. Inspect → 3. Clean → 4. Split X/y → 
# 5. Train/test split (0.2, random_state=42) → 6. StandardScaler (fit on train only) →
# 7. Train baseline (LinearRegression) → 8. Train main model →
# 9. Evaluate (MAE, R², compare) → 10. Save winner + scaler
```

### Saving Convention (ALWAYS use joblib)
```python
import joblib
joblib.dump(best_model, '../backend/trained_models/concrete_best_model.pkl')
joblib.dump(scaler, '../backend/trained_models/concrete_scaler.pkl')
```

### Evaluation Output (print this for every model)
```
=== CONCRETE — MODEL COMPARISON ===
LinearRegression        MAE: 8.42 MPa    R²: 0.6234
RandomForestRegressor   MAE: 4.18 MPa    R²: 0.9156  ← WINNER
```

---

## SKILL: Integration & API Wiring

**Activation:** Connecting frontend ↔ backend, fixing CORS, aligning request/response schemas.

### Integration Checklist
- [ ] Backend running on port 8000, frontend on 5173
- [ ] CORS allows `localhost:5173`
- [ ] Frontend `.env` has `VITE_API_URL=http://localhost:8000`
- [ ] `predictions.js` uses `import.meta.env.VITE_API_URL`
- [ ] All Pydantic field names match frontend JSON keys exactly
- [ ] Error responses handled in frontend with user-friendly messages
- [ ] `/api/health` endpoint returns `{"status": "ok", "models_loaded": true}`

### Frontend API Layer Template
```js
// src/api/predictions.js
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function predictConcrete(formData) {
  const res = await fetch(`${BASE}/api/predict/concrete`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  if (!res.ok) throw new Error((await res.json()).message);
  return res.json();
}
```

---

## SKILL: Debugging & Error Recovery

**Activation:** Any error, failed test, or broken integration.

### Common Issues & Fixes

| Error | Cause | Fix |
|---|---|---|
| `CORS policy blocked` | CORS not configured | Add CORSMiddleware to FastAPI |
| `ValueError: could not convert string to float` | Text columns in X | Drop all `object` dtype columns |
| `KeyError: 'column_name'` | Wrong column name | Check exact CSV headers with `df.columns.tolist()` |
| `FileNotFoundError: .pkl` | Model not trained yet | Run training script first |
| `R² is negative` | Wrong feature/target split | Check X and y definitions |
| `Module not found` | Missing import | Check requirements.txt / package.json |
| `Network Error` in frontend | Backend not running | Start uvicorn, check port 8000 |
| `422 Unprocessable Entity` | Pydantic validation failed | Check request body matches schema |

### Debug Order
1. Check browser console for frontend errors
2. Check uvicorn terminal for backend errors  
3. Test endpoint directly with curl or FastAPI /docs
4. Verify .pkl files exist in `backend/trained_models/`
5. Verify column names match exactly (case-sensitive)
