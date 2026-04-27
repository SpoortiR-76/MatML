"""
cost_service.py
===============
Material cost estimation with per-component SHAP-style contributions.

Unit rates are approximate Indian market rates (INR/kg) as of mid-2025.
All cost breakdowns are computed analytically — no ML model required.
"""

import logging

logger = logging.getLogger(__name__)

# ── Unit rates (INR / kg) ─────────────────────────────────────────────────
# Concrete constituents
CONCRETE_RATES = {
    "cement":            8.50,   # OPC 53 grade
    "blast_furnace_slag":2.50,   # GGBFS
    "fly_ash":           1.20,   # Class F fly ash
    "water":             0.01,   # municipal supply
    "superplasticizer": 120.00,  # polycarboxylate SP
    "coarse_aggregate":  0.90,   # 20mm crushed stone
    "fine_aggregate":    1.10,   # river sand / M-sand
}

# Steel alloying premiums on top of base iron cost (INR/kg per 1 wt%)
STEEL_BASE_RATE = 52.0  # base mild steel
STEEL_ALLOY_RATES = {
    "c":   15.0,   # carbon — slight premium for quality control
    "mn":  12.0,   # manganese
    "si":  18.0,   # silicon
    "cr": 180.0,   # chromium
    "ni": 1450.0,  # nickel (LME driven)
    "mo": 2800.0,  # molybdenum
    "v":  3500.0,  # vanadium
    "n":   50.0,   # nitrogen
    "nb": 4200.0,  # niobium
    "co": 3800.0,  # cobalt
    "w":  2100.0,  # tungsten
    "al":  200.0,  # aluminium
    "ti":  850.0,  # titanium
}
STEEL_DENSITY = 7850.0  # kg/m³

# Generic materials — priced by density class (INR/kg)
DENSITY_CLASS_RATES = [
    (0,     1000,  120.0, "Low-density polymer / foam"),
    (1000,  2500,  80.0,  "Light alloy / composite"),
    (2500,  5000,  55.0,  "Medium-density structural alloy"),
    (5000,  9000,  52.0,  "Ferrous / heavy alloy"),
    (9000,  15000, 350.0, "Dense / precious-metal alloy"),
    (15000, 1e9,   800.0, "Ultra-dense / speciality metal"),
]


def _rate_for_density(rho: float) -> tuple[float, str]:
    for lo, hi, rate, label in DENSITY_CLASS_RATES:
        if lo <= rho < hi:
            return rate, label
    return 800.0, "Speciality material"


def _shap_from_breakdown(breakdown: list[dict]) -> dict[str, float]:
    """SHAP-style: each component's fractional cost contribution (0–1)."""
    total = sum(item["total_cost_inr"] for item in breakdown)
    if total == 0:
        return {}
    return {
        item["component"]: round(item["total_cost_inr"] / total, 4)
        for item in breakdown
        if item["total_cost_inr"] > 0
    }


def _format_breakdown(breakdown_raw: list[dict], total: float) -> list[dict]:
    return [
        {
            "component": b["component"],
            "quantity_kg": round(b["qty_kg"], 2),
            "unit_cost_inr_per_kg": b["rate"],
            "total_cost_inr": round(b["total_cost_inr"], 2),
            "cost_fraction": round(b["total_cost_inr"] / total, 4) if total > 0 else 0.0,
        }
        for b in breakdown_raw
        if b["qty_kg"] > 0
    ]


# ── Concrete ───────────────────────────────────────────────────────────────
def _cost_concrete(data: dict, volume: float) -> dict:
    breakdown_raw = []
    for key, rate in CONCRETE_RATES.items():
        kg_per_m3 = data.get(key, 0.0)
        qty = kg_per_m3 * volume
        breakdown_raw.append({
            "component": key.replace("_", " ").title(),
            "qty_kg": qty,
            "rate": rate,
            "total_cost_inr": qty * rate,
        })

    total = sum(b["total_cost_inr"] for b in breakdown_raw)
    breakdown = _format_breakdown(breakdown_raw, total)

    notes = []
    cement_kg_m3 = data.get("cement", 0)
    if cement_kg_m3 > 400:
        notes.append("High cement content (>400 kg/m³) — consider partial replacement with fly ash or GGBFS to reduce cost.")
    if data.get("superplasticizer", 0) > 8:
        notes.append("Superplasticizer is the most expensive admixture — ensure dosage is optimised by trial mixes.")
    if total == 0:
        notes.append("No concrete ingredients entered — enter mix proportions to get a cost estimate.")

    return {
        "total": total,
        "breakdown": breakdown,
        "notes": notes,
        "shap": _shap_from_breakdown([dict(component=b["component"], total_cost_inr=b["total_cost_inr"]) for b in breakdown]),
    }


# ── Steel ──────────────────────────────────────────────────────────────────
def _cost_steel(data: dict, volume: float) -> dict:
    total_mass_kg = STEEL_DENSITY * volume

    breakdown_raw = []
    # Base iron cost
    base_cost = total_mass_kg * STEEL_BASE_RATE
    breakdown_raw.append({
        "component": "Base Iron",
        "qty_kg": total_mass_kg,
        "rate": STEEL_BASE_RATE,
        "total_cost_inr": base_cost,
    })

    # Alloying element premiums
    for elem, rate_per_pct in STEEL_ALLOY_RATES.items():
        pct = data.get(elem, 0.0)
        if pct <= 0:
            continue
        alloy_mass = total_mass_kg * (pct / 100.0)
        premium = alloy_mass * rate_per_pct
        breakdown_raw.append({
            "component": elem.upper(),
            "qty_kg": alloy_mass,
            "rate": rate_per_pct,
            "total_cost_inr": premium,
        })

    total = sum(b["total_cost_inr"] for b in breakdown_raw)
    breakdown = _format_breakdown(breakdown_raw, total)

    notes = []
    if data.get("ni", 0) > 5:
        notes.append("Nickel content >5 wt% significantly increases cost — consider lower-Ni alternative grades if budget-constrained.")
    if data.get("mo", 0) > 1:
        notes.append("Molybdenum is expensive — verify Mo addition is justified by corrosion or high-temperature requirements.")
    if data.get("cr", 0) > 10:
        notes.append("High Cr (>10%) indicates stainless steel — premium grade; specify correctly to avoid substitution.")

    return {
        "total": total,
        "breakdown": breakdown,
        "notes": notes,
        "shap": _shap_from_breakdown([dict(component=b["component"], total_cost_inr=b["total_cost_inr"]) for b in breakdown]),
    }


# ── Generic materials ──────────────────────────────────────────────────────
def _cost_materials(data: dict, volume: float) -> dict:
    rho = data.get("Ro", 7800.0)
    rate, label = _rate_for_density(rho)
    total_mass = rho * volume
    total = total_mass * rate

    breakdown_raw = [{
        "component": label,
        "qty_kg": total_mass,
        "rate": rate,
        "total_cost_inr": total,
    }]

    breakdown = _format_breakdown(breakdown_raw, total)
    notes = [
        f"Material classified as '{label}' based on density {rho:.0f} kg/m³.",
        "Rate is an approximate market average — actual cost may vary by supplier and grade.",
    ]

    return {
        "total": total,
        "breakdown": breakdown,
        "notes": notes,
        "shap": {"material_density_class": 1.0},
    }


# ── Public entry point ────────────────────────────────────────────────────
def run_cost_calculation(input_data: dict) -> dict:
    mat  = input_data["material_type"]
    vol  = input_data["volume_m3"]

    calculators = {
        "concrete":  _cost_concrete,
        "steel":     _cost_steel,
        "materials": _cost_materials,
    }
    calc = calculators.get(mat)
    if calc is None:
        raise ValueError(f"Unknown material_type: {mat}")

    result = calc(input_data, vol)
    total  = result["total"]

    return {
        "status": "success",
        "material_type": mat,
        "volume_m3": vol,
        "total_cost_inr": round(total, 2),
        "cost_per_m3_inr": round(total / vol, 2) if vol > 0 else 0.0,
        "breakdown": result["breakdown"],
        "shap_values": result["shap"],
        "cost_notes": result["notes"],
    }
