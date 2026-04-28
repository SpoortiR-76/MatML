import { create } from 'zustand'

const defaultFormData = {
  concrete: {
    cement: 350, blast_furnace_slag: 0, fly_ash: 0,
    water: 185, superplasticizer: 6,
    coarse_aggregate: 1000, fine_aggregate: 750, age: 28,
  },
  enhanced_steel: {
    c: 0.15, mn: 1.20, si: 0.30, cr: 0.50, ni: 0.40,
    mo: 0.10, v: 0.05, n: 0.005, nb: 0.02, co: 0.0,
    w: 0.0,  al: 0.02, ti: 0.01,
    repair_cycles: 0,
    application: 'structural',
  },
  structural: {
    shape: 'rectangular_beam',
    material_type: 'concrete',
    length: 6.0, width: 0.3, depth: 0.5,
    axial_load_kn: 0, bending_moment_knm: 120, shear_force_kn: 80,
    inclination_deg: 0, exposure_class: 'moderate',
    construction_type: 'commercial',
  },
}

export const usePredictionStore = create((set) => ({
  activeTab: 'concrete',
  isLoading: false,
  results: { concrete: null, enhanced_steel: null, structural: null },
  error: null,
  formData: defaultFormData,

  setActiveTab: (tab) => set({ activeTab: tab, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setResult: (tab, data) => set((state) => ({
    results: { ...state.results, [tab]: data },
    error: null,
  })),
  setError: (error) => set({ error }),
  updateFormData: (tab, field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [tab]: { ...state.formData[tab], [field]: value },
      },
    })),
  resetResult: () => set({ results: { concrete: null, enhanced_steel: null, structural: null }, error: null }),
}))
