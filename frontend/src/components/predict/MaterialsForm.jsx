import InputField from '../ui/InputField'
import { usePredictionStore } from '../../store/predictionStore'

const fields = [
  { name: 'E', label: "E — Young's Modulus", placeholder: 'e.g. 207000', tooltip: "Young's Modulus — stiffness, resistance to elastic deformation", unit: 'MPa', min: 1000, max: 500000, step: 100 },
  { name: 'G', label: 'G — Shear Modulus', placeholder: 'e.g. 79000', tooltip: 'Shear Modulus — resistance to shear deformation', unit: 'MPa', min: 500, max: 250000, step: 100 },
  { name: 'mu', label: "μ — Poisson's Ratio", placeholder: 'e.g. 0.3', tooltip: "Poisson's Ratio — lateral strain ratio, typically 0.2–0.45", unit: '—', min: 0.1, max: 0.5, step: 0.01 },
  { name: 'Ro', label: 'ρ — Density', placeholder: 'e.g. 7860', tooltip: 'Material density', unit: 'kg/m³', min: 500, max: 25000, step: 10 },
]

export default function MaterialsForm() {
  const { formData, updateFormData } = usePredictionStore()
  const data = formData.materials

  const handleChange = (name, value) => updateFormData('materials', name, value)

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
