---
name: ml-pipeline-agent
description: Writes and executes all ML training scripts for MatML — data preprocessing, model training, evaluation, and saving .pkl files
tools: [read, write, edit, bash]
model: claude-sonnet-4-6
---

# ML Pipeline Agent — MatML Training Pipeline

## My Role
I write and execute training scripts in `training/`. Once training completes, I copy `.pkl` files to `backend/trained_models/`. I report model performance metrics to the orchestrator.

## My Completion Signal
When done: "Training complete. Files placed in backend/trained_models/: [list]. Best models: Concrete=RF(R²=X), Steel=XGB_multi(MAE=Y), Materials_reg=RF(R²=Z), Materials_cls=RF(Acc=W)"

---

## training/train_concrete.py

```python
"""
MatML — Module 1: Concrete Compressive Strength Prediction
Dataset: UCI Concrete Compressive Strength (~1030 rows, 9 columns)
Task: Single-output regression
Target: Concrete compressive strength (MPa)
"""

import pandas as pd
import numpy as np
import joblib
import os
import shutil
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score, mean_squared_error
from xgboost import XGBRegressor

# ── Configuration ──────────────────────────────────────────────────
DATA_PATH = 'data/concrete_strength.csv'
OUTPUT_DIR = '../backend/trained_models'
RANDOM_STATE = 42
TEST_SIZE = 0.2

# Exact column names from the CSV
TARGET_COL = 'Concrete compressive strength(MPa, megapascals)'
FEATURE_COLS = [
    'Cement (component 1)(kg in a m^3 mixture)',
    'Blast Furnace Slag (component 2)(kg in a m^3 mixture)',
    'Fly Ash (component 3)(kg in a m^3 mixture)',
    'Water  (component 4)(kg in a m^3 mixture)',
    'Superplasticizer (component 5)(kg in a m^3 mixture)',
    'Coarse Aggregate  (component 6)(kg in a m^3 mixture)',
    'Fine Aggregate (component 7)(kg in a m^3 mixture)',
    'Age (day)'
]

# ── Step 1: Load ────────────────────────────────────────────────────
print("=" * 60)
print("MODULE 1: CONCRETE COMPRESSIVE STRENGTH")
print("=" * 60)

df = pd.read_csv(DATA_PATH)
print(f"Shape: {df.shape}")
print(f"Missing values: {df.isna().sum().sum()}")
print(f"Columns: {df.columns.tolist()}")

# ── Step 2: Validate columns ────────────────────────────────────────
for col in FEATURE_COLS + [TARGET_COL]:
    if col not in df.columns:
        raise ValueError(f"Column not found: '{col}'\nAvailable: {df.columns.tolist()}")

# ── Step 3: Split X/y ───────────────────────────────────────────────
X = df[FEATURE_COLS].copy()
y = df[TARGET_COL].copy()

print(f"\nFeature shape: {X.shape}")
print(f"Target shape: {y.shape}")
print(f"Target range: {y.min():.2f} — {y.max():.2f} MPa")

# ── Step 4: Train/test split ────────────────────────────────────────
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=TEST_SIZE, random_state=RANDOM_STATE
)
print(f"\nTrain: {X_train.shape}, Test: {X_test.shape}")

# ── Step 5: Scale ───────────────────────────────────────────────────
scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)   # fit ONLY on train
X_test_sc = scaler.transform(X_test)          # transform test

# ── Step 6: Train models ────────────────────────────────────────────
models = {
    'LinearRegression': LinearRegression(),
    'RandomForestRegressor': RandomForestRegressor(
        n_estimators=200,
        max_depth=None,
        min_samples_split=2,
        random_state=RANDOM_STATE,
        n_jobs=-1
    ),
    'XGBRegressor': XGBRegressor(
        n_estimators=200,
        max_depth=5,
        learning_rate=0.05,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=RANDOM_STATE,
        verbosity=0
    )
}

# ── Step 7: Evaluate ────────────────────────────────────────────────
print("\n=== CONCRETE — MODEL COMPARISON ===")
results = {}
for name, model in models.items():
    model.fit(X_train_sc, y_train)
    preds = model.predict(X_test_sc)
    mae = mean_absolute_error(y_test, preds)
    rmse = np.sqrt(mean_squared_error(y_test, preds))
    r2 = r2_score(y_test, preds)
    results[name] = {'model': model, 'mae': mae, 'rmse': rmse, 'r2': r2}
    marker = " ← CURRENT BEST" if r2 == max(v['r2'] for v in results.values()) else ""
    print(f"{name:30s}  MAE: {mae:.2f} MPa  RMSE: {rmse:.2f}  R²: {r2:.4f}{marker}")

# Cross-validation on best model
best_name = max(results, key=lambda k: results[k]['r2'])
best_model = results[best_name]['model']
cv_scores = cross_val_score(best_model, X_train_sc, y_train, cv=5, scoring='r2')
print(f"\nCross-validation R² ({best_name}): {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")

# ── Step 8: Save ────────────────────────────────────────────────────
os.makedirs(OUTPUT_DIR, exist_ok=True)
joblib.dump(best_model, f'{OUTPUT_DIR}/concrete_best_model.pkl')
joblib.dump(scaler, f'{OUTPUT_DIR}/concrete_scaler.pkl')

print(f"\n✅ Saved: concrete_best_model.pkl ({best_name})")
print(f"✅ Saved: concrete_scaler.pkl")
print(f"Final metrics — MAE: {results[best_name]['mae']:.2f}, R²: {results[best_name]['r2']:.4f}")
```

---

## training/train_steel.py

```python
"""
MatML — Module 2: Steel Multi-Property Prediction
Dataset: Steel alloy composition → yield strength, tensile strength, elongation
Task: Multi-output regression (3 targets simultaneously)
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression
from sklearn.ensemble import RandomForestRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from xgboost import XGBRegressor

DATA_PATH = 'data/steel_strength.csv'
OUTPUT_DIR = '../backend/trained_models'
RANDOM_STATE = 42

REGRESSION_TARGETS = ['yield strength', 'tensile strength', 'elongation']
DROP_COLS = ['formula']   # text column — no ML signal

print("=" * 60)
print("MODULE 2: STEEL MULTI-PROPERTY PREDICTION")
print("=" * 60)

# ── Load ─────────────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
print(f"Shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")

# Drop text columns
df = df.drop(columns=[c for c in DROP_COLS if c in df.columns])

# Drop remaining non-numeric
obj_cols = df.select_dtypes(include='object').columns.tolist()
if obj_cols:
    print(f"Dropping non-numeric columns: {obj_cols}")
    df = df.drop(columns=obj_cols)

# Handle missing values
missing = df.isna().sum().sum()
print(f"Missing values: {missing}")
if missing > 0:
    df = df.fillna(df.mean(numeric_only=True))

# Validate targets
for col in REGRESSION_TARGETS:
    if col not in df.columns:
        raise ValueError(f"Target column '{col}' not found. Columns: {df.columns.tolist()}")

# ── Split X/y ────────────────────────────────────────────────────────
feature_cols = [c for c in df.columns if c not in REGRESSION_TARGETS]
X = df[feature_cols].copy()
y = df[REGRESSION_TARGETS].copy()

print(f"\nFeatures ({len(feature_cols)}): {feature_cols}")
print(f"Targets: {REGRESSION_TARGETS}")

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=RANDOM_STATE
)

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

# ── Train models ──────────────────────────────────────────────────────
models = {
    'MultiOutput_RF': MultiOutputRegressor(
        RandomForestRegressor(n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1)
    ),
    'MultiOutput_XGB': MultiOutputRegressor(
        XGBRegressor(n_estimators=200, max_depth=5, learning_rate=0.05,
                     subsample=0.8, random_state=RANDOM_STATE, verbosity=0)
    )
}

print("\n=== STEEL — MODEL COMPARISON ===")
results = {}
for name, model in models.items():
    model.fit(X_train_sc, y_train)
    preds = model.predict(X_test_sc)
    per_target = {}
    print(f"\n{name}:")
    for i, col in enumerate(REGRESSION_TARGETS):
        mae = mean_absolute_error(y_test.iloc[:, i], preds[:, i])
        r2 = r2_score(y_test.iloc[:, i], preds[:, i])
        per_target[col] = {'mae': mae, 'r2': r2}
        print(f"  {col:20s}  MAE: {mae:.2f}   R²: {r2:.4f}")
    avg_r2 = np.mean([v['r2'] for v in per_target.values()])
    results[name] = {'model': model, 'avg_r2': avg_r2, 'per_target': per_target}
    print(f"  Average R²: {avg_r2:.4f}")

best_name = max(results, key=lambda k: results[k]['avg_r2'])
best_model = results[best_name]['model']

os.makedirs(OUTPUT_DIR, exist_ok=True)
joblib.dump(best_model, f'{OUTPUT_DIR}/steel_best_model.pkl')
joblib.dump(scaler, f'{OUTPUT_DIR}/steel_scaler.pkl')

print(f"\n✅ Saved: steel_best_model.pkl ({best_name})")
print(f"✅ Saved: steel_scaler.pkl")
```

---

## training/train_materials.py

```python
"""
MatML — Module 3: Materials Mechanical Properties
Dataset: material.csv — E, G, mu, Ro → Su, Sy (regression) + Use (classification)
Task: Multi-output regression + binary classification
"""

import pandas as pd
import numpy as np
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.multioutput import MultiOutputRegressor
from sklearn.metrics import mean_absolute_error, r2_score, accuracy_score, classification_report

DATA_PATH = 'data/material.csv'
OUTPUT_DIR = '../backend/trained_models'
RANDOM_STATE = 42

REGRESSION_TARGETS = ['Su', 'Sy']
CLASSIFICATION_TARGET = 'Use'
DROP_COLS = ['Material']   # text column

print("=" * 60)
print("MODULE 3: MATERIALS MECHANICAL PROPERTIES")
print("=" * 60)

# ── Load ──────────────────────────────────────────────────────────────
df = pd.read_csv(DATA_PATH)
print(f"Shape: {df.shape}")
print(f"Columns: {df.columns.tolist()}")
print(f"Use value counts:\n{df[CLASSIFICATION_TARGET].value_counts()}")

# Drop text columns
df = df.drop(columns=[c for c in DROP_COLS if c in df.columns])

# Encode Use column (TRUE/FALSE → 1/0)
if df[CLASSIFICATION_TARGET].dtype == object:
    df[CLASSIFICATION_TARGET] = df[CLASSIFICATION_TARGET].map(
        {'TRUE': 1, 'FALSE': 0, True: 1, False: 0}
    ).fillna(0).astype(int)

# Handle missing values
df = df.fillna(df.mean(numeric_only=True))

print(f"\nAfter cleaning — shape: {df.shape}")
print(f"Missing values: {df.isna().sum().sum()}")

# ── Split X/y ──────────────────────────────────────────────────────────
all_targets = REGRESSION_TARGETS + [CLASSIFICATION_TARGET]
feature_cols = [c for c in df.columns if c not in all_targets]
X = df[feature_cols].copy()
y_reg = df[REGRESSION_TARGETS].copy()
y_cls = df[CLASSIFICATION_TARGET].copy()

print(f"\nInput features ({len(feature_cols)}): {feature_cols}")
print(f"Regression targets: {REGRESSION_TARGETS}")
print(f"Classification target: {CLASSIFICATION_TARGET}")

# Shared train/test split
X_train, X_test, y_reg_train, y_reg_test = train_test_split(
    X, y_reg, test_size=0.2, random_state=RANDOM_STATE
)
y_cls_train = y_cls.loc[X_train.index]
y_cls_test = y_cls.loc[X_test.index]

scaler = StandardScaler()
X_train_sc = scaler.fit_transform(X_train)
X_test_sc = scaler.transform(X_test)

# ── Task 3a: Regression ─────────────────────────────────────────────────
print("\n=== MODULE 3a: MATERIALS REGRESSION ===")
reg_model = MultiOutputRegressor(
    RandomForestRegressor(n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1)
)
reg_model.fit(X_train_sc, y_reg_train)
reg_preds = reg_model.predict(X_test_sc)

for i, col in enumerate(REGRESSION_TARGETS):
    mae = mean_absolute_error(y_reg_test.iloc[:, i], reg_preds[:, i])
    r2 = r2_score(y_reg_test.iloc[:, i], reg_preds[:, i])
    print(f"  {col:10s}  MAE: {mae:.2f}   R²: {r2:.4f}")

# ── Task 3b: Classification ─────────────────────────────────────────────
print("\n=== MODULE 3b: MATERIALS CLASSIFICATION (Use) ===")
cls_model = RandomForestClassifier(
    n_estimators=200, random_state=RANDOM_STATE, n_jobs=-1
)
cls_model.fit(X_train_sc, y_cls_train)
cls_preds = cls_model.predict(X_test_sc)

acc = accuracy_score(y_cls_test, cls_preds)
print(f"Accuracy: {acc:.4f}")
print(classification_report(y_cls_test, cls_preds, target_names=['Not Recommended', 'Recommended']))

# ── Save ────────────────────────────────────────────────────────────────
os.makedirs(OUTPUT_DIR, exist_ok=True)
joblib.dump(reg_model, f'{OUTPUT_DIR}/materials_reg_model.pkl')
joblib.dump(cls_model, f'{OUTPUT_DIR}/materials_cls_model.pkl')
joblib.dump(scaler, f'{OUTPUT_DIR}/materials_scaler.pkl')

print(f"\n✅ Saved: materials_reg_model.pkl")
print(f"✅ Saved: materials_cls_model.pkl")
print(f"✅ Saved: materials_scaler.pkl")
```

---

## training/requirements_training.txt
```
pandas==2.2.3
numpy==1.26.4
scikit-learn==1.5.2
xgboost==2.1.1
shap==0.46.0
joblib==1.4.2
matplotlib==3.9.0
seaborn==0.13.2
jupyter==1.0.0
```

## My Constraints
- I run scripts from the `training/` directory
- I never modify `backend/` code directly — only place .pkl files in `backend/trained_models/`
- If a column name is wrong, I print the actual columns and adjust, never guess
- I always print model comparison before saving — orchestrator can verify metrics
- Training order: concrete → steel → materials
