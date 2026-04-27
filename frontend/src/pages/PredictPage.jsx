import { motion, AnimatePresence } from 'framer-motion'
import { usePredictionStore } from '../store/predictionStore'
import { usePrediction } from '../hooks/usePrediction'
import GlassCard from '../components/ui/GlassCard'
import TabSwitcher from '../components/ui/TabSwitcher'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import PredictionResult from '../components/predict/PredictionResult'
import ConcreteForm from '../components/predict/ConcreteForm'
import EnhancedSteelForm from '../components/predict/EnhancedSteelForm'
import StructuralForm from '../components/predict/StructuralForm'
import CostForm from '../components/predict/CostForm'

const tabs = [
  { id: 'concrete',       label: 'Concrete',       icon: '🏗️' },
  { id: 'enhanced_steel', label: 'Enhanced Steel',  icon: '⚡' },
  { id: 'structural',     label: 'Structural',      icon: '📐' },
  { id: 'cost',           label: 'Cost',            icon: '💰' },
]

const formComponents = {
  concrete:       ConcreteForm,
  enhanced_steel: EnhancedSteelForm,
  structural:     StructuralForm,
  cost:           CostForm,
}

const tabDescriptions = {
  concrete:       'Predict compressive strength from mix composition (cement, water, aggregates, age).',
  enhanced_steel: 'Six-module engine: elastic moduli, thermal properties, pre/post-repair strength, degradation profile, weldability class, nearest grade match, and cost — all from alloy composition.',
  structural:     'Analyse a structural member. For steel, the engine recommends the optimal alloy composition from the enhanced model based on combined stress demand and exposure class.',
  cost:           'Estimate material cost per volume with per-component contribution breakdown.',
}

const submitLabels = {
  concrete:       'Predict Strength →',
  enhanced_steel: 'Run Full Steel Analysis →',
  structural:     'Analyse Structure →',
  cost:           'Calculate Cost →',
}

export default function PredictPage() {
  const { activeTab, setActiveTab, result, error } = usePredictionStore()
  const { submit, isLoading } = usePrediction()
  const ActiveForm = formComponents[activeTab]

  return (
    <main className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }} className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}>
            Material Property Predictor
          </h1>
          <p className="text-base" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
            Select a material type, enter values, and get instant ML predictions with SHAP analysis.
          </p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }} className="mb-6">
          <TabSwitcher tabs={tabs} active={activeTab} onChange={setActiveTab} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}>
          <GlassCard className="p-6 md:p-8">
            <p className="text-sm mb-6 pb-5" style={{
              color: '#6b7280', fontFamily: 'DM Sans, sans-serif',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}>
              {tabDescriptions[activeTab]}
            </p>

            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }}>
                <ActiveForm />
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button
                onClick={submit} disabled={isLoading}
                className="w-full py-3.5 rounded-xl font-semibold text-base transition-all"
                style={{
                  background: isLoading ? 'rgba(16,185,129,0.5)' : '#10b981',
                  color: '#0a0a0a',
                  fontFamily: 'DM Sans, sans-serif',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  boxShadow: isLoading ? 'none' : '0 0 24px rgba(16,185,129,0.25)',
                }}
                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = '#059669' }}
                onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = '#10b981' }}
              >
                {isLoading ? 'Processing...' : (submitLabels[activeTab] || 'Run Analysis →')}
              </button>
            </div>

            {isLoading && <LoadingSpinner />}

            <AnimatePresence>
              {error && !isLoading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }} className="mt-4 p-4 rounded-xl"
                  style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                  <p className="text-sm font-medium mb-1" style={{ color: '#f87171', fontFamily: 'DM Sans' }}>
                    {activeTab === 'structural' ? 'Analysis Error'
                    : activeTab === 'cost' ? 'Calculation Error'
                    : 'Prediction Error'}
                  </p>
                  <p className="text-xs" style={{ color: '#fca5a5', fontFamily: 'JetBrains Mono, monospace' }}>
                    {error}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        </motion.div>

        <AnimatePresence>
          {result && !isLoading && (
            <PredictionResult result={result} tab={activeTab} />
          )}
        </AnimatePresence>
      </div>
    </main>
  )
}
