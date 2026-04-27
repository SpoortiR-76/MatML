const BASE = import.meta.env.VITE_API_URL || ''

async function handleResponse(res) {
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || data.detail || `HTTP ${res.status}`)
  return data
}

export async function predictConcrete(formData) {
  const res = await fetch(`${BASE}/api/predict/concrete`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  return handleResponse(res)
}

export async function predictEnhancedSteel(formData) {
  const res = await fetch(`${BASE}/api/predict/enhanced-steel`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  return handleResponse(res)
}

export async function predictStructural(formData) {
  const res = await fetch(`${BASE}/api/predict/structural`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  return handleResponse(res)
}

export async function predictCost(formData) {
  const res = await fetch(`${BASE}/api/predict/cost`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  })
  return handleResponse(res)
}

export async function checkHealth() {
  const res = await fetch(`${BASE}/api/health`)
  return handleResponse(res)
}
