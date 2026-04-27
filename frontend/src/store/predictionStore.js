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
    // concrete strength context used when steel is selected
    concrete_fck_mpa: 30,
  },
  cost: {
    material_type: 'concrete',
    volume_m3: 10,
    cement: 350, blast_furnace_slag: 0, fly_ash: 0,
    water: 185, superplasticizer: 6,
    coarse_aggregate: 1000, fine_aggregate: 750,
    c: 0.1, mn: 0.5, si: 0.3, cr: 0.5, ni: 0.1,
    mo: 0.2, v: 0.01, n: 0.01, nb: 0.01, co: 0.01,
    w: 0.01, al: 0.01, ti: 0.01,
    Ro: 7800,
  },
}

export const usePredictionStore = create((set) => ({
  activeTab: 'concrete',
  isLoading: false,
  result: null,
  error: null,
  formData: defaultFormData,

  setActiveTab: (tab) => set({ activeTab: tab, result: null, error: null }),
  setLoading: (isLoading) => set({ isLoading }),
  setResult: (result) => set({ result, error: null }),
  setError: (error) => set({ error, result: null }),
  updateFormData: (tab, field, value) =>
    set((state) => ({
      formData: {
        ...state.formData,
        [tab]: { ...state.formData[tab], [field]: value },
      },
    })),
  resetResult: () => set({ result: null, error: null }),
}))
