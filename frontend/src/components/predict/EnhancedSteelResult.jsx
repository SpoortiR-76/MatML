import ResultCard from '../ui/ResultCard'
import ShapChart from './ShapChart'
import RepairCurveChart from './RepairCurveChart'

// ── Reusable section header ──────────────────────────────────────────────────
function SectionHeader({ label }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest mb-3"
      style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>{label}</p>
  )
}

// ── Weldability badge ─────────────────────────────────────────────────────────
function WeldBadge({ cls }) {
  const colors = {
    'Class I':   { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#6ee7b7' },
    'Class II':  { bg: 'rgba(245,158,11,0.12)', border: '#f59e0b', text: '#fcd34d' },
    'Class III': { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444', text: '#fca5a5' },
  }
  const c = colors[cls] || colors['Class II']
  return (
    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold"
      style={{ background: c.bg, border: `1px solid ${c.border}`, color: c.text }}>
      {cls}
    </span>
  )
}

// ── Lifespan bar ──────────────────────────────────────────────────────────────
function LifespanBar({ index }) {
  const pct = Math.round((index || 0) * 100)
  const color = pct >= 70 ? '#10b981' : pct >= 45 ? '#f59e0b' : '#ef4444'
  return (
    <div>
      <div className="flex justify-between text-xs mb-1" style={{ fontFamily: 'DM Sans' }}>
        <span style={{ color: '#9ca3af' }}>Lifespan Index</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'rgba(255,255,255,0.07)' }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}

export default function EnhancedSteelResult({ data }) {
  const { mechanical, thermal, strength, repair, degradation, suitability, recommendation, cost } = data

  const recColor = suitability?.recommended ? '#10b981' : '#ef4444'

  return (
    <div className="space-y-7">

      {/* ── Recommendation banner ─────────────────────────────────────────── */}
      <div className="rounded-2xl p-5" style={{
        background: suitability?.recommended ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)',
        border: `1px solid ${recColor}33`,
      }}>
        <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
          <div>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>
              Nearest Grade Match
            </p>
            <p className="text-xl font-bold" style={{ color: '#f9fafb', fontFamily: 'Syne, sans-serif' }}>
              {recommendation?.grade_name || '—'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs mb-1" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Suitability</p>
            <span className="px-3 py-1 rounded-full text-sm font-bold"
              style={{ background: `${recColor}22`, color: recColor, border: `1px solid ${recColor}55` }}>
              {suitability?.recommended ? '✓ Recommended' : '✗ Not Recommended'}
            </span>
          </div>
        </div>

        {/* Key metrics row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Est. Lifespan</p>
            <p className="text-lg font-bold" style={{ color: '#f9fafb', fontFamily: 'Syne' }}>
              {recommendation?.estimated_lifespan_years} <span className="text-sm font-normal" style={{ color: '#9ca3af' }}>yr</span>
            </p>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Remaining Repairs</p>
            <p className="text-lg font-bold" style={{ color: '#f9fafb', fontFamily: 'Syne' }}>
              {recommendation?.remaining_repairs} <span className="text-sm font-normal" style={{ color: '#9ca3af' }}>/ {recommendation?.max_repair_cycles}</span>
            </p>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>CE (IIW)</p>
            <p className="text-lg font-bold font-mono" style={{ color: '#f9fafb' }}>
              {suitability?.carbon_equivalent?.toFixed(3)}
            </p>
          </div>
          <div className="rounded-xl px-3 py-2 flex flex-col gap-1" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Weldability</p>
            <WeldBadge cls={suitability?.weldability_class} />
          </div>
        </div>

        {/* Verdict */}
        <p className="text-xs leading-relaxed" style={{ color: '#d1d5db', fontFamily: 'DM Sans' }}>
          {recommendation?.verdict}
        </p>
        <p className="text-xs mt-1.5" style={{ color: '#4b5563', fontFamily: 'DM Sans' }}>
          Standard: {recommendation?.standard_reference} · Application: {recommendation?.application}
        </p>

        {/* Lifespan bar */}
        <div className="mt-4">
          <LifespanBar index={degradation?.lifespan_index} />
        </div>
      </div>

      {/* ── Module A — Mechanical ─────────────────────────────────────────── */}
      <div>
        <SectionHeader label="Module A — Elastic Properties" />
        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="Young's Modulus E"  value={mechanical?.E_mpa?.toLocaleString()}    unit="MPa" />
          <ResultCard label="Shear Modulus G"    value={mechanical?.G_mpa?.toLocaleString()}    unit="MPa" accent="#34d399" />
          <ResultCard label="Poisson's Ratio μ"  value={mechanical?.mu?.toFixed(3)}             accent="#6ee7b7" />
        </div>
        {mechanical?.shap_values && Object.keys(mechanical.shap_values).length > 0 && (
          <div className="mt-3">
            <ShapChart shapValues={mechanical.shap_values} title="Elastic Property Drivers (SHAP)" compact />
          </div>
        )}
      </div>

      {/* ── Module B — Thermal ────────────────────────────────────────────── */}
      <div>
        <SectionHeader label="Module B — Thermal / Physical Properties" />
        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="Thermal Conductivity" value={thermal?.thermal_conductivity_W_mK?.toFixed(1)} unit="W/m·K" />
          <ResultCard label="Max Service Temp"     value={thermal?.critical_temperature_C?.toFixed(0)}   unit="°C"   accent="#f59e0b" />
          <ResultCard label="Density"              value={thermal?.density_kg_m3?.toFixed(0)}            unit="kg/m³" accent="#9ca3af" />
        </div>
      </div>

      {/* ── Module C — Strength ───────────────────────────────────────────── */}
      <div>
        <SectionHeader label="Module C — Strength (Pre-repair)" />
        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="Ultimate Tensile (Su)" value={strength?.su_mpa?.toFixed(0)} unit="MPa" />
          <ResultCard label="Yield Strength (Sy)"   value={strength?.sy_mpa?.toFixed(0)} unit="MPa" accent="#34d399" />
          <ResultCard label="Elongation"             value={strength?.elongation_pct?.toFixed(1)} unit="%" accent="#6ee7b7" />
        </div>
        {strength?.shap_values && Object.keys(strength.shap_values).length > 0 && (
          <div className="mt-3">
            <ShapChart shapValues={strength.shap_values} title="Strength Drivers (SHAP)" compact />
          </div>
        )}
      </div>

      {/* ── Module D — Post-repair ────────────────────────────────────────── */}
      <div>
        <SectionHeader label="Module D — Post-repair Strength (1 weld cycle)" />
        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="Post-repair Su" value={repair?.su_post_mpa?.toFixed(0)} unit="MPa" />
          <ResultCard label="Post-repair Sy" value={repair?.sy_post_mpa?.toFixed(0)} unit="MPa" accent="#34d399" />
          <ResultCard label="HAZ Retention"  value={`${((repair?.repair_factor || 0) * 100).toFixed(1)}%`}
            accent={repair?.repair_factor >= 0.90 ? '#10b981' : '#f59e0b'} />
        </div>
      </div>

      {/* ── Module E — Degradation ────────────────────────────────────────── */}
      <div>
        <SectionHeader label="Module E — Multi-cycle Repair Degradation" />
        <div className="grid grid-cols-3 gap-3">
          <ResultCard label="Current Residual"   value={`${((degradation?.residual_strength_ratio || 0)*100).toFixed(1)}%`}
            accent={degradation?.residual_strength_ratio >= 0.80 ? '#10b981' : '#f87171'} />
          <ResultCard label="Lifespan Index"     value={degradation?.lifespan_index?.toFixed(3)} accent="#6ee7b7" />
          <ResultCard label="Cycles to Threshold" value={degradation?.cycles_to_threshold}
            accent={degradation?.cycles_to_threshold >= 6 ? '#10b981' : '#f59e0b'} />
        </div>

        {/* Repair Curve Chart — prominent panel */}
        <div className="mt-5 rounded-2xl p-5" style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-base">📉</span>
            <p className="text-sm font-semibold" style={{ color: '#6ee7b7', fontFamily: 'Syne, sans-serif' }}>
              Repair Cycle Degradation Chart (0–10 Cycles)
            </p>
          </div>
          <RepairCurveChart initialResult={data} />
        </div>
      </div>

      {/* ── Cost ─────────────────────────────────────────────────────────── */}
      {cost && (
        <div className="rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <SectionHeader label="Cost Estimate (1 m³ reference volume)" />
          <div className="grid grid-cols-2 gap-3">
            <ResultCard label="Cost per m³" value={`₹${cost.cost_per_m3_inr?.toLocaleString('en-IN')}`} accent="#34d399" />
            <ResultCard label="Total Cost"  value={`₹${cost.total_cost_inr?.toLocaleString('en-IN')}`} />
          </div>
          {cost.cost_notes?.length > 0 && (
            <ul className="mt-2 space-y-1">
              {cost.cost_notes.map((n, i) => (
                <li key={i} className="text-xs" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>• {n}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
