import InputField from '../ui/InputField'
import { usePredictionStore } from '../../store/predictionStore'

const fields = [
  { name: 'c', label: 'C — Carbon', placeholder: 'e.g. 0.02', tooltip: 'Carbon — most influential element, increases strength and hardness', unit: 'wt%', min: 0, max: 2, step: 0.001 },
  { name: 'mn', label: 'Mn — Manganese', placeholder: 'e.g. 0.05', tooltip: 'Manganese — improves hardenability and toughness', unit: 'wt%', min: 0, max: 3, step: 0.01 },
  { name: 'si', label: 'Si — Silicon', placeholder: 'e.g. 0.05', tooltip: 'Silicon — deoxidizer, improves strength slightly', unit: 'wt%', min: 0, max: 2, step: 0.01 },
  { name: 'cr', label: 'Cr — Chromium', placeholder: 'e.g. 0.01–20', tooltip: 'Chromium — corrosion resistance, key in stainless steel', unit: 'wt%', min: 0, max: 25, step: 0.01 },
  { name: 'ni', label: 'Ni — Nickel', placeholder: 'e.g. 0–20', tooltip: 'Nickel — toughness and low-temperature performance', unit: 'wt%', min: 0, max: 25, step: 0.01 },
  { name: 'mo', label: 'Mo — Molybdenum', placeholder: 'e.g. 0–5', tooltip: 'Molybdenum — creep resistance and hardenability', unit: 'wt%', min: 0, max: 5, step: 0.01 },
  { name: 'v', label: 'V — Vanadium', placeholder: 'e.g. 0.01', tooltip: 'Vanadium — grain refinement, improves strength', unit: 'wt%', min: 0, max: 2, step: 0.001 },
  { name: 'n', label: 'N — Nitrogen', placeholder: 'e.g. 0.01', tooltip: 'Nitrogen — austenite stabilizer', unit: 'wt%', min: 0, max: 0.5, step: 0.001 },
  { name: 'nb', label: 'Nb — Niobium', placeholder: 'e.g. 0.01', tooltip: 'Niobium — microalloying element', unit: 'wt%', min: 0, max: 0.5, step: 0.001 },
  { name: 'co', label: 'Co — Cobalt', placeholder: 'e.g. 0.01', tooltip: 'Cobalt — high-temperature strength', unit: 'wt%', min: 0, max: 25, step: 0.01 },
  { name: 'w', label: 'W — Tungsten', placeholder: 'e.g. 0.01', tooltip: 'Tungsten — hardness at high temperature', unit: 'wt%', min: 0, max: 5, step: 0.01 },
  { name: 'al', label: 'Al — Aluminium', placeholder: 'e.g. 0.01', tooltip: 'Aluminium — deoxidizer and grain refiner', unit: 'wt%', min: 0, max: 2, step: 0.001 },
  { name: 'ti', label: 'Ti — Titanium', placeholder: 'e.g. 0.01', tooltip: 'Titanium — carbide former, grain refiner', unit: 'wt%', min: 0, max: 2, step: 0.001 },
]

export default function SteelForm() {
  const { formData, updateFormData } = usePredictionStore()
  const data = formData.steel

  const handleChange = (name, value) => updateFormData('steel', name, value)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
