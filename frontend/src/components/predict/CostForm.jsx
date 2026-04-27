import InputField from '../ui/InputField'
import { usePredictionStore } from '../../store/predictionStore'

const MATERIAL_TYPES = [
  { value: 'concrete',  label: 'Concrete',  icon: '🏗️' },
  { value: 'steel',     label: 'Steel',     icon: '⚙️' },
  { value: 'materials', label: 'Materials', icon: '🔬' },
]

const CONCRETE_FIELDS = [
  { name: 'cement',          label: 'Cement',           unit: 'kg/m³', placeholder: '350', min: 0, max: 600,  step: 1 },
  { name: 'blast_furnace_slag', label: 'Blast Furnace Slag', unit: 'kg/m³', placeholder: '0', min: 0, max: 400, step: 1 },
  { name: 'fly_ash',         label: 'Fly Ash',           unit: 'kg/m³', placeholder: '0',   min: 0, max: 200,  step: 1 },
  { name: 'water',           label: 'Water',             unit: 'kg/m³', placeholder: '185', min: 0, max: 250,  step: 1 },
  { name: 'superplasticizer',label: 'Superplasticizer',  unit: 'kg/m³', placeholder: '6',   min: 0, max: 35,   step: 0.5 },
  { name: 'coarse_aggregate',label: 'Coarse Aggregate',  unit: 'kg/m³', placeholder: '1000',min: 0, max: 1300, step: 5 },
  { name: 'fine_aggregate',  label: 'Fine Aggregate',    unit: 'kg/m³', placeholder: '750', min: 0, max: 1100, step: 5 },
]

const STEEL_FIELDS = [
  { name: 'c',  label: 'C — Carbon',     unit: 'wt%', placeholder: '0.1',   min: 0, max: 2,    step: 0.01 },
  { name: 'mn', label: 'Mn — Manganese', unit: 'wt%', placeholder: '0.5',   min: 0, max: 3,    step: 0.01 },
  { name: 'si', label: 'Si — Silicon',   unit: 'wt%', placeholder: '0.3',   min: 0, max: 2,    step: 0.01 },
  { name: 'cr', label: 'Cr — Chromium',  unit: 'wt%', placeholder: '0.5',   min: 0, max: 25,   step: 0.1 },
  { name: 'ni', label: 'Ni — Nickel',    unit: 'wt%', placeholder: '0.1',   min: 0, max: 25,   step: 0.1 },
  { name: 'mo', label: 'Mo — Molybdenum',unit: 'wt%', placeholder: '0.2',   min: 0, max: 5,    step: 0.05 },
  { name: 'v',  label: 'V — Vanadium',   unit: 'wt%', placeholder: '0.01',  min: 0, max: 2,    step: 0.01 },
  { name: 'nb', label: 'Nb — Niobium',   unit: 'wt%', placeholder: '0.01',  min: 0, max: 0.5,  step: 0.005 },
  { name: 'co', label: 'Co — Cobalt',    unit: 'wt%', placeholder: '0.01',  min: 0, max: 25,   step: 0.1 },
  { name: 'ti', label: 'Ti — Titanium',  unit: 'wt%', placeholder: '0.01',  min: 0, max: 2,    step: 0.01 },
]

const MATERIALS_FIELDS = [
  { name: 'Ro', label: 'ρ — Density', unit: 'kg/m³', placeholder: '7860', tooltip: 'Used to estimate material cost class', min: 500, max: 25000, step: 10 },
]

const FIELD_SETS = { concrete: CONCRETE_FIELDS, steel: STEEL_FIELDS, materials: MATERIALS_FIELDS }
const pill = 'px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border'

export default function CostForm() {
  const { formData, updateFormData } = usePredictionStore()
  const data = formData.cost

  const handle = (name, value) => updateFormData('cost', name, value)
  const fields = FIELD_SETS[data.material_type] || []

  return (
    <div className="space-y-6">
      {/* Material type */}
      <div>
        <p className="text-xs font-medium mb-2" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Material Type
        </p>
        <div className="flex flex-wrap gap-2">
          {MATERIAL_TYPES.map(m => (
            <button
              key={m.value}
              onClick={() => handle('material_type', m.value)}
              className={pill}
              style={data.material_type === m.value
                ? { background: 'rgba(16,185,129,0.15)', borderColor: '#10b981', color: '#10b981' }
                : { background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: '#9ca3af' }}
            >
              <span className="mr-1.5">{m.icon}</span>{m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Volume */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Volume
        </p>
        <div className="max-w-xs">
          <InputField
            name="volume_m3"
            label="Volume of Material"
            unit="m³"
            placeholder="e.g. 10.0"
            tooltip="Total volume of material to be used"
            min={0.01}
            max={10000}
            step={0.1}
            value={data.volume_m3}
            onChange={handle}
          />
        </div>
      </div>

      {/* Composition fields */}
      <div>
        <p className="text-xs font-medium mb-3" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          {data.material_type === 'concrete' ? 'Mix Composition (kg/m³)'
            : data.material_type === 'steel' ? 'Alloy Composition (wt%)'
            : 'Material Properties'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(f => (
            <InputField key={f.name} {...f} value={data[f.name] ?? 0} onChange={handle} />
          ))}
        </div>
      </div>

      {/* Rate info banner */}
      <div className="rounded-xl px-4 py-3 text-xs" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)', color: '#6b7280', fontFamily: 'DM Sans' }}>
        <span style={{ color: '#10b981', fontWeight: 600 }}>ℹ Unit rates</span> based on approximate Indian market prices (INR, mid-2025).
        Cement ₹8.50/kg · Coarse agg ₹0.90/kg · SP ₹120/kg · Base steel ₹52/kg · Nickel ₹1,450/kg per wt%
      </div>
    </div>
  )
}
