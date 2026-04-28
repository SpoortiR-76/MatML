import ResultCard from '../ui/ResultCard'
import ShapChart from './ShapChart'

function SectionHeader({ label }) {
  return (
    <p className="text-xs font-semibold mb-3 uppercase tracking-widest" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>{label}</p>
  )
}

// Steel recommendation panel — shown when material_type === 'steel'
function SteelRecommendationPanel({ steelRec }) {
  if (!steelRec) return null
  const { grade_name, estimated_lifespan_years, weldability_class, verdict } = steelRec

  const weldColors = {
    'Class I':   '#10b981',
    'Class II':  '#f59e0b',
    'Class III': '#ef4444',
  }
  const wc = weldColors[weldability_class] || '#9ca3af'

  return (
    <div className="space-y-4">
      {/* Grade banner */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <p className="text-xs uppercase tracking-widest mb-1" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>
          Recommended Steel Grade
        </p>
        <p className="text-xl font-bold mb-3" style={{ color: '#f9fafb', fontFamily: 'Syne, sans-serif' }}>
          {grade_name}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
          <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Est. Lifespan</p>
            <p className="text-lg font-bold" style={{ color: '#f9fafb', fontFamily: 'Syne' }}>
              {estimated_lifespan_years} <span className="text-sm font-normal" style={{ color: '#9ca3af' }}>yr</span>
            </p>
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,0.04)' }}>
            <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Weldability</p>
            <p className="text-lg font-bold" style={{ color: wc, fontFamily: 'Syne' }}>
              {weldability_class}
            </p>
          </div>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: '#d1d5db', fontFamily: 'DM Sans' }}>{verdict}</p>
      </div>
    </div>
  )
}

export default function StructuralResults({ data }) {
  const statusColors = {
    Safe: '#10b981',
    Caution: '#f59e0b',
    Unsafe: '#ef4444',
  }
  const designColor = statusColors[data.design_status] || '#9ca3af'
  const isSteelMode = data.material_type === 'steel'

  return (
    <div className="space-y-6">
      {/* Section Properties */}
      <div>
        <SectionHeader label="Section Properties" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <ResultCard label="Cross-section Area"  value={data.cross_section_area_m2?.toFixed(4)} unit="m²" />
          <ResultCard label="Moment of Inertia"   value={data.moment_of_inertia_m4?.toExponential(3)} unit="m⁴" />
          <ResultCard label="Section Modulus"     value={data.section_modulus_m3?.toExponential(3)} unit="m³" />
          <ResultCard label="Radius of Gyration"  value={data.radius_of_gyration_m?.toFixed(4)} unit="m" accent="#6ee7b7" />
          <ResultCard label="Slenderness Ratio"   value={data.slenderness_ratio} accent={data.slenderness_ratio > 120 ? '#fbbf24' : '#6ee7b7'} />
        </div>
      </div>

      {/* Stress Demands */}
      <div>
        <SectionHeader label="Stress Demands" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ResultCard label="Bending Stress"  value={data.max_bending_stress_mpa}  unit="MPa" />
          <ResultCard label="Axial Stress"    value={data.max_axial_stress_mpa}    unit="MPa" accent="#6ee7b7" />
          <ResultCard label="Shear Stress"    value={data.max_shear_stress_mpa}    unit="MPa" accent="#9ca3af" />
          <ResultCard label="Combined Stress" value={data.combined_stress_mpa}     unit="MPa" accent="#fbbf24" />
        </div>
      </div>

      {/* Design Check */}
      <div>
        <SectionHeader label="Design Check" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ResultCard label="Required Strength" value={data.required_strength_mpa}     unit="MPa" />
          <ResultCard label="Safety Factor"     value={data.safety_factor?.toFixed(2)} accent={designColor} />
          <ResultCard label="Design Status"     value={data.design_status}             accent={designColor} />
          <ResultCard label="Est. Service Life" value={data.estimated_service_life_years} unit="years" accent="#34d399" />
        </div>
      </div>

      {/* Steel mode: full recommendation panel */}
      {isSteelMode && data.steel_recommendation ? (
        <div>
          <SectionHeader label="Steel Recommendation (Enhanced Engine)" />
          <SteelRecommendationPanel steelRec={data.steel_recommendation} />
        </div>
      ) : (
        /* Concrete/composite: show recommended composition table */
        data.recommended_composition && (
          <div className="rounded-xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <p className="text-xs font-semibold mb-2 uppercase tracking-widest" style={{ color: '#10b981', fontFamily: 'DM Sans' }}>
              Recommended Composition
            </p>
            <p className="text-xs mb-3" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
              {data.recommended_composition.description} — <em>{data.recommended_composition.unit}</em>
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.entries(data.recommended_composition.components).map(([k, v]) => (
                <div key={k} className="flex justify-between rounded-lg px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.04)' }}>
                  <span className="text-xs" style={{ color: '#9ca3af', fontFamily: 'JetBrains Mono' }}>{k.replace(/_/g, ' ')}</span>
                  <span className="text-xs font-semibold" style={{ color: '#f9fafb', fontFamily: 'JetBrains Mono' }}>{typeof v === 'number' ? v : String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )
      )}

      {/* SHAP load contributions */}
      {data.shap_values && Object.keys(data.shap_values).length > 0 && (
        <div className="pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <ShapChart shapValues={data.shap_values} title="Load Contribution Analysis (SHAP-style)" />
        </div>
      )}

      {/* Design Notes */}
      {data.design_notes?.length > 0 && (
        <div className="space-y-2">
          <SectionHeader label="Design Notes" />
          {data.design_notes.map((note, i) => (
            <div key={i} className="rounded-lg px-3 py-2 text-xs" style={{
              background: note.startsWith('⚠') ? 'rgba(251,191,36,0.07)' : note.startsWith('✓') ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.04)',
              borderLeft: `3px solid ${note.startsWith('⚠') ? '#fbbf24' : note.startsWith('✓') ? '#10b981' : '#6b7280'}`,
              color: '#d1d5db', fontFamily: 'DM Sans', lineHeight: '1.5',
            }}>
              {note}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
