import InputField from '../ui/InputField'
import { usePredictionStore } from '../../store/predictionStore'

const fields = [
  { name: 'cement', label: 'Cement', placeholder: 'e.g. 540', tooltip: 'Primary binding material. Higher = stronger but costlier', unit: 'kg/m³', min: 100, max: 600, step: 1 },
  { name: 'blast_furnace_slag', label: 'Blast Furnace Slag', placeholder: 'e.g. 0–360', tooltip: 'Industrial byproduct, improves durability', unit: 'kg/m³', min: 0, max: 400, step: 1 },
  { name: 'fly_ash', label: 'Fly Ash', placeholder: 'e.g. 0–200', tooltip: 'Coal combustion residue, adds workability', unit: 'kg/m³', min: 0, max: 200, step: 1 },
  { name: 'water', label: 'Water', placeholder: 'e.g. 162', tooltip: 'Lower water ratio = higher strength', unit: 'kg/m³', min: 100, max: 250, step: 1 },
  { name: 'superplasticizer', label: 'Superplasticizer', placeholder: 'e.g. 0–32', tooltip: 'Chemical additive, improves flowability', unit: 'kg/m³', min: 0, max: 35, step: 0.1 },
  { name: 'coarse_aggregate', label: 'Coarse Aggregate', placeholder: 'e.g. 800–1100', tooltip: 'Gravel or crushed stone in the mix', unit: 'kg/m³', min: 700, max: 1200, step: 1 },
  { name: 'fine_aggregate', label: 'Fine Aggregate', placeholder: 'e.g. 594–993', tooltip: 'Sand content in the concrete mix', unit: 'kg/m³', min: 500, max: 1000, step: 1 },
  { name: 'age', label: 'Age', placeholder: 'e.g. 28', tooltip: 'Curing days — strength increases with age', unit: 'days', min: 1, max: 365, step: 1 },
]

export default function ConcreteForm() {
  const { formData, updateFormData } = usePredictionStore()
  const data = formData.concrete

  const handleChange = (name, value) => updateFormData('concrete', name, value)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {fields.map((f) => (
        <InputField
          key={f.name}
          {...f}
          value={data[f.name]}
          onChange={handleChange}
        />
      ))}
    </div>
  )
}
