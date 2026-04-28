import { usePredictionStore } from '../store/predictionStore'
import { predictConcrete, predictEnhancedSteel, predictStructural } from '../api/predictions'

const predictors = {
  concrete:       predictConcrete,
  enhanced_steel: predictEnhancedSteel,
  structural:     predictStructural,
}

export function usePrediction() {
  const { activeTab, formData, isLoading, setLoading, setResult, setError, results } = usePredictionStore()

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const predictor = predictors[activeTab]
      let data = { ...formData[activeTab] }

      // Inject previously predicted properties for Structural tab
      if (activeTab === 'structural') {
        if (results.concrete?.predicted_compressive_strength_mpa) {
          data.predicted_concrete_fck_mpa = results.concrete.predicted_compressive_strength_mpa
        }
        if (results.enhanced_steel?.strength?.sy_mpa) {
          data.predicted_steel_sy_mpa = results.enhanced_steel.strength.sy_mpa
        }
      }

      const result = await predictor(data)
      setResult(activeTab, result)
    } catch (err) {
      setError(err.message || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return { submit, isLoading, activeTab }
}
