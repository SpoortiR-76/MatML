import { useState } from 'react'
import InputField from '../ui/InputField'
import { usePredictionStore } from '../../store/predictionStore'

const SHAPES = [
  { value: 'rectangular_beam', label: 'Rectangular Beam', icon: '━' },
  { value: 'circular_column',  label: 'Circular Column',  icon: '●' },
  { value: 'rectangular_slab', label: 'Rectangular Slab', icon: '▬' },
  { value: 'square_footing',   label: 'Square Footing',   icon: '◼' },
  { value: 'hollow_section',   label: 'Hollow Section',   icon: '◻' },
]

const MATERIALS = [
  { value: 'concrete',  label: 'Concrete',  icon: '🏗️' },
  { value: 'steel',     label: 'Steel',     icon: '⚡' },
  { value: 'composite', label: 'Composite', icon: '🔩' },
]

const EXPOSURES = [
  { value: 'mild',        label: 'Mild',        desc: 'Indoors / dry' },
  { value: 'moderate',    label: 'Moderate',    desc: 'Sheltered outdoor' },
  { value: 'severe',      label: 'Severe',      desc: 'Marine / industrial' },
  { value: 'very_severe', label: 'Very Severe', desc: 'Chemical / seawater' },
]

const CONSTRUCTION_TYPES = [
  { value: 'residential', label: 'Residential', icon: '🏠' },
  { value: 'commercial',  label: 'Commercial',  icon: '🏢' },
  { value: 'bridge',      label: 'Bridge',      icon: '🌉' },
]

const dimensionFields = (shape) => {
  const base = [
    { name: 'length', label: 'Length / Span',   unit: 'm', placeholder: '6.0',  tooltip: 'Member span or height',                      min: 0.1, max: 100, step: 0.1 },
    { name: 'width',  label: shape === 'circular_column' ? 'Diameter' : 'Width', unit: 'm', placeholder: '0.3', tooltip: 'Cross-section width or diameter', min: 0.05, max: 20, step: 0.05 },
  ]
  if (shape !== 'circular_column')
    base.push({ name: 'depth', label: 'Depth / Thickness', unit: 'm', placeholder: '0.5', tooltip: 'Section depth or slab thickness', min: 0.05, max: 5, step: 0.05 })
  return base
}

const loadFields = [
  { name: 'axial_load_kn',     label: 'Axial Load',     unit: 'kN',   placeholder: '0',   tooltip: 'Compressive or tensile axial force', min: 0, max: 100000, step: 1 },
  { name: 'bending_moment_knm',label: 'Bending Moment', unit: 'kN·m', placeholder: '120', tooltip: 'Maximum applied bending moment',      min: 0, max: 500000, step: 1 },
  { name: 'shear_force_kn',    label: 'Shear Force',    unit: 'kN',   placeholder: '80',  tooltip: 'Maximum applied shear force',          min: 0, max: 50000,  step: 1 },
  { name: 'inclination_deg',   label: 'Inclination',    unit: '°',    placeholder: '0',   tooltip: 'Member angle from horizontal',          min: 0, max: 90,     step: 1 },
]

const pill = 'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border'

export default function StructuralForm() {
  const { formData, updateFormData, results } = usePredictionStore()
  const data = formData.structural


  const handle = (name, value) => updateFormData('structural', name, value)

  return (
    <div className="space-y-6">
      {/* Previously Predicted Properties widget */}
      {(results.concrete || results.enhanced_steel) && (
        <div className="rounded-xl p-4 space-y-2 mb-4" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#34d399', fontFamily: 'DM Sans' }}>
            ✓ Using Previous Predictions
          </p>
          <div className="flex flex-wrap gap-4">
            {results.concrete && (
               <div className="text-xs">
                 <span style={{ color: '#9ca3af' }}>Concrete Strength: </span>
                 <span className="font-bold font-mono text-white">{results.concrete.predicted_compressive_strength_mpa?.toFixed(1)} MPa</span>
               </div>
            )}
            {results.enhanced_steel && (
               <div className="text-xs">
                 <span style={{ color: '#9ca3af' }}>Steel Yield (Sy): </span>
                 <span className="font-bold font-mono text-white">{results.enhanced_steel.strength?.sy_mpa?.toFixed(1)} MPa</span>
               </div>
            )}
          </div>
        </div>
      )}

      {/* Construction Type */}
      <div>
        <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Construction Type
        </p>
        <div className="grid grid-cols-3 gap-2">
          {CONSTRUCTION_TYPES.map(a => (
            <button key={a.value} onClick={() => handle('construction_type', a.value)}
              className="rounded-lg px-2 py-2 text-left border transition-all"
              style={data.construction_type === a.value
                ? { background: 'rgba(16,185,129,0.12)', borderColor: '#10b981' }
                : { background: 'rgba(255,255,255,0.03)', borderColor: 'rgba(255,255,255,0.07)' }}>
              <p className="text-xs font-medium" style={{ color: data.construction_type === a.value ? '#10b981' : '#9ca3af', fontFamily: 'DM Sans' }}>
                <span className="mr-1.5">{a.icon}</span>{a.label}
              </p>
            </button>
          ))}
        </div>
      </div>
      {/* Shape */}
      <div>
        <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Structural Shape
        </p>
        <div className="flex flex-wrap gap-2">
          {SHAPES.map(s => (
            <button key={s.value} onClick={() => handle('shape', s.value)} className={pill}
              style={data.shape === s.value
                ? { background: 'rgba(16,185,129,0.15)', borderColor: '#10b981', color: '#10b981' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              <span className="mr-1.5">{s.icon}</span>{s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Material type */}
      <div>
        <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Material Type
        </p>
        <div className="flex flex-wrap gap-2">
          {MATERIALS.map(m => (
            <button key={m.value} onClick={() => handle('material_type', m.value)} className={pill}
              style={data.material_type === m.value
                ? { background: 'rgba(16,185,129,0.15)', borderColor: '#10b981', color: '#10b981' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}>
              <span className="mr-1.5">{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Steel-specific: concrete grade input + application */}


      {/* Dimensions */}
      <div>
        <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Dimensions
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dimensionFields(data.shape).map(f => (
            <InputField key={f.name} {...f} value={data[f.name]} onChange={handle} />
          ))}
        </div>
      </div>

      {/* Loads */}
      <div>
        <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Applied Loads &amp; Orientation
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {loadFields.map(f => (
            <InputField key={f.name} {...f} value={data[f.name]} onChange={handle} />
          ))}
        </div>
      </div>

      {/* Exposure */}
      <div>
        <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Exposure Class
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {EXPOSURES.map(e => (
            <button key={e.value} onClick={() => handle('exposure_class', e.value)}
              className="rounded-xl px-3 py-2.5 text-left transition-all border"
              style={data.exposure_class === e.value
                ? { background: 'rgba(16,185,129,0.12)', borderColor: '#10b981' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-xs font-semibold" style={{ color: data.exposure_class === e.value ? '#10b981' : '#f9fafb', fontFamily: 'DM Sans' }}>{e.label}</p>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>{e.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
