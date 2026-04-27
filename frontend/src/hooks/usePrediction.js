import { usePredictionStore } from '../store/predictionStore'
import { predictConcrete, predictEnhancedSteel, predictStructural, predictCost } from '../api/predictions'

const predictors = {
  concrete:       predictConcrete,
  enhanced_steel: predictEnhancedSteel,
  structural:     predictStructural,
  cost:           predictCost,
}

export function usePrediction() {
  const { activeTab, formData, isLoading, setLoading, setResult, setError } = usePredictionStore()

  async function submit() {
    setLoading(true)
    setError(null)
    try {
      const predictor = predictors[activeTab]
      const data = formData[activeTab]
      const result = await predictor(data)
      setResult(result)
    } catch (err) {
      setError(err.message || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return { submit, isLoading, activeTab }
}
