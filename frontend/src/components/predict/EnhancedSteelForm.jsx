import { usePredictionStore } from '../../store/predictionStore'
import InputField from '../ui/InputField'

const APPLICATIONS = [
  { value: 'structural',        label: 'Structural',         icon: '🏗️', desc: 'Buildings / frames' },
  { value: 'bridge',            label: 'Bridge',             icon: '🌉', desc: 'Civil infrastructure' },
  { value: 'pressure_vessel',   label: 'Pressure Vessel',    icon: '⚗️', desc: 'ASME VIII' },
  { value: 'pipeline',          label: 'Pipeline',           icon: '🔩', desc: 'Onshore fluid transport' },
  { value: 'offshore',          label: 'Offshore Platform',  icon: '🌊', desc: 'Marine / subsea' },
  { value: 'rotating_machinery',label: 'Rotating Machinery', icon: '⚙️', desc: 'ISO 9283' },
]

const COMP_FIELDS = [
  { name: 'c',   label: 'Carbon (C)',      unit: 'wt%', placeholder: '0.15', tooltip: 'Main strengthening element. Higher C = stronger but less weldable.', min: 0, max: 2,    step: 0.01 },
  { name: 'mn',  label: 'Manganese (Mn)',  unit: 'wt%', placeholder: '1.20', tooltip: 'Improves hardenability and toughness.', min: 0, max: 3,    step: 0.01 },
  { name: 'si',  label: 'Silicon (Si)',    unit: 'wt%', placeholder: '0.30', tooltip: 'Deoxidiser; increases strength.', min: 0, max: 2,    step: 0.01 },
  { name: 'cr',  label: 'Chromium (Cr)',   unit: 'wt%', placeholder: '0.50', tooltip: '>10.5% = stainless; improves corrosion resistance.', min: 0, max: 25,   step: 0.1 },
  { name: 'ni',  label: 'Nickel (Ni)',     unit: 'wt%', placeholder: '0.40', tooltip: 'Improves toughness and ductility.', min: 0, max: 25,   step: 0.1 },
  { name: 'mo',  label: 'Molybdenum (Mo)', unit: 'wt%', placeholder: '0.10', tooltip: 'Raises creep resistance and high-temp strength.', min: 0, max: 5,    step: 0.01 },
  { name: 'v',   label: 'Vanadium (V)',    unit: 'wt%', placeholder: '0.05', tooltip: 'Fine-grain strengthening.', min: 0, max: 2,    step: 0.01 },
  { name: 'n',   label: 'Nitrogen (N)',    unit: 'wt%', placeholder: '0.005',tooltip: 'Solid-solution strengthener in austenitic grades.', min: 0, max: 0.5,  step: 0.001 },
  { name: 'nb',  label: 'Niobium (Nb)',    unit: 'wt%', placeholder: '0.02', tooltip: 'Microalloying for HSLA steels.', min: 0, max: 0.5,  step: 0.005 },
  { name: 'co',  label: 'Cobalt (Co)',     unit: 'wt%', placeholder: '0.0',  tooltip: 'Used in maraging steels for ultra-high strength.', min: 0, max: 25,   step: 0.1 },
  { name: 'w',   label: 'Tungsten (W)',    unit: 'wt%', placeholder: '0.0',  tooltip: 'High-temperature tool steels.', min: 0, max: 5,    step: 0.1 },
  { name: 'al',  label: 'Aluminium (Al)',  unit: 'wt%', placeholder: '0.02', tooltip: 'Grain refinement; deoxidiser.', min: 0, max: 2,    step: 0.01 },
  { name: 'ti',  label: 'Titanium (Ti)',   unit: 'wt%', placeholder: '0.01', tooltip: 'Stabiliser in ferritic stainless.', min: 0, max: 2,    step: 0.01 },
]

const PRESETS = [
  {
    label: 'S355 Structural', icon: '🏗️',
    values: { c:0.16, mn:1.50, si:0.45, cr:0.30, ni:0.30, mo:0.08, v:0.12, n:0.008, nb:0.04, co:0, w:0, al:0.02, ti:0.01, repair_cycles:0, application:'structural' },
  },
  {
    label: '316L Stainless', icon: '✨',
    values: { c:0.02, mn:1.80, si:0.50, cr:17.0, ni:12.0, mo:2.50, v:0, n:0.05, nb:0, co:0, w:0, al:0, ti:0, repair_cycles:0, application:'offshore' },
  },
  {
    label: '4140 Alloy', icon: '⚙️',
    values: { c:0.40, mn:0.90, si:0.25, cr:1.0, ni:0.15, mo:0.20, v:0, n:0, nb:0, co:0, w:0, al:0, ti:0, repair_cycles:0, application:'rotating_machinery' },
  },
  {
    label: 'HSLA 60', icon: '🌉',
    values: { c:0.10, mn:1.30, si:0.30, cr:0.20, ni:0.20, mo:0.05, v:0.06, n:0.012, nb:0.04, co:0, w:0, al:0.03, ti:0.02, repair_cycles:0, application:'bridge' },
  },
]

const pill = 'px-2.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border'

export default function EnhancedSteelForm() {
  const { formData, updateFormData } = usePredictionStore()
  const data = formData.enhanced_steel

  const handle = (name, value) => updateFormData('enhanced_steel', name, value)

  const applyPreset = (preset) => {
    Object.entries(preset.values).forEach(([k, v]) => handle(k, v))
  }

  // Carbon equivalent display
  const ce = (
    (data.c || 0)
    + (data.mn || 0) / 6
    + ((data.cr || 0) + (data.mo || 0) + (data.v || 0)) / 5
    + ((data.ni || 0) + (data.co || 0)) / 15
  ).toFixed(3)
  const weldClass = parseFloat(ce) < 0.35 ? { label: 'Class I — Excellent', color: '#10b981' }
                  : parseFloat(ce) < 0.45 ? { label: 'Class II — Acceptable', color: '#f59e0b' }
                  : { label: 'Class III — Poor', color: '#ef4444' }

  return (
    <div className="space-y-6">

      {/* Presets */}
      <div>
        <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Quick Presets
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button key={p.label} onClick={() => applyPreset(p)} className={pill}
              style={{ background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.25)', color: '#6ee7b7' }}>
              <span className="mr-1">{p.icon}</span>{p.label}
            </button>
          ))}
        </div>
      </div>

      {/* CE live indicator */}
      <div className="flex items-center gap-4 rounded-xl px-4 py-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
        <div>
          <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Carbon Equivalent (IIW)</p>
          <p className="text-xl font-bold font-mono" style={{ color: '#f9fafb' }}>{ce}</p>
        </div>
        <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
        <div>
          <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>Weldability</p>
          <p className="text-sm font-semibold" style={{ color: weldClass.color, fontFamily: 'DM Sans' }}>{weldClass.label}</p>
        </div>
      </div>

      {/* Composition grid */}
      <div>
        <p className="text-xs font-medium mb-3 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Elemental Composition (wt%)
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {COMP_FIELDS.map(f => (
            <InputField key={f.name} {...f} value={data[f.name]} onChange={handle} />
          ))}
        </div>
      </div>

      {/* Application */}
      <div>
        <p className="text-xs font-medium mb-2 uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
          Target Application
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {APPLICATIONS.map(a => (
            <button key={a.value} onClick={() => handle('application', a.value)}
              className="rounded-xl px-3 py-2.5 text-left transition-all border"
              style={data.application === a.value
                ? { background: 'rgba(16,185,129,0.12)', borderColor: '#10b981' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.08)' }}>
              <p className="text-sm font-semibold" style={{ color: data.application === a.value ? '#10b981' : '#f9fafb', fontFamily: 'DM Sans' }}>
                <span className="mr-1.5">{a.icon}</span>{a.label}
              </p>
              <p className="text-xs mt-0.5" style={{ color: '#6b7280', fontFamily: 'DM Sans' }}>{a.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Repair cycles */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#9ca3af', fontFamily: 'DM Sans' }}>
            Repair Cycles Already Performed
          </p>
          <span className="text-sm font-bold font-mono" style={{ color: '#10b981' }}>{data.repair_cycles}</span>
        </div>
        <input
          type="range" min={0} max={10} step={1}
          value={data.repair_cycles}
          onChange={e => handle('repair_cycles', parseInt(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
          style={{ accentColor: '#10b981', background: `linear-gradient(to right, #10b981 ${data.repair_cycles * 10}%, rgba(255,255,255,0.1) ${data.repair_cycles * 10}%)` }}
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#4b5563', fontFamily: 'JetBrains Mono' }}>
          <span>0</span><span>5</span><span>10</span>
        </div>
      </div>
    </div>
  )
}
