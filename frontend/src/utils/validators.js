export function validateField(value, min, max) {
  const num = parseFloat(value)
  if (isNaN(num)) return 'Must be a number'
  if (min !== undefined && num < min) return `Min: ${min}`
  if (max !== undefined && num > max) return `Max: ${max}`
  return null
}

export function validateConcreteForm(data) {
  const errors = {}
  if (!data.cement || data.cement < 100 || data.cement > 600) errors.cement = 'Must be 100–600'
  if (data.water < 100 || data.water > 250) errors.water = 'Must be 100–250'
  if (data.age < 1 || data.age > 365) errors.age = 'Must be 1–365'
  return errors
}

export function validateSteelForm(data) {
  const errors = {}
  if (data.c < 0 || data.c > 2) errors.c = 'Must be 0–2'
  return errors
}

export function validateMaterialsForm(data) {
  const errors = {}
  if (data.E < 1000 || data.E > 500000) errors.E = 'Must be 1000–500000'
  if (data.G < 500 || data.G > 250000) errors.G = 'Must be 500–250000'
  if (data.mu < 0.1 || data.mu > 0.5) errors.mu = 'Must be 0.1–0.5'
  if (data.Ro < 500 || data.Ro > 25000) errors.Ro = 'Must be 500–25000'
  return errors
}
