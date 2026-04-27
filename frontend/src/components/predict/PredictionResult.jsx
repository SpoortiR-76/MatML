import { motion } from 'framer-motion'
import GlassCard from '../ui/GlassCard'
import ResultCard from '../ui/ResultCard'
import ModelBadge from '../ui/ModelBadge'
import ShapChart from './ShapChart'
import StructuralResults from './StructuralResult'
import EnhancedSteelResult from './EnhancedSteelResult'
import CostResults from './CostResult'

function ConcreteResults({ data }) {
  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <ResultCard label="Compressive Strength" value={data.predicted_compressive_strength_mpa} unit="MPa" />
        {data.r2_score != null && <ResultCard label="Model R²" value={data.r2_score?.toFixed(4)} accent="#6ee7b7" />}
        {data.mae != null && <ResultCard label="Model MAE" value={`${data.mae?.toFixed(2)} MPa`} accent="#9ca3af" />}
      </div>
    </>
  )
}

const resultRenderers = {
  concrete:       ConcreteResults,
  enhanced_steel: EnhancedSteelResult,
  structural:     StructuralResults,
  cost:           CostResults,
}

const TITLES = {
  structural:     'Structural Analysis Complete',
  cost:           'Cost Estimate Ready',
  enhanced_steel: 'Enhanced Steel Analysis Complete',
  concrete:       'Prediction Complete',
}

export default function PredictionResult({ result, tab }) {
  const ResultComponent = resultRenderers[tab]

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
      className="mt-6"
    >
      <GlassCard className="p-6 md:p-8" style={{ border: '1px solid rgba(16,185,129,0.18)' }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
              style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>✓</div>
            <div>
              <h3 className="font-bold text-base" style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}>
                {TITLES[tab] || 'Analysis Complete'}
              </h3>
              <p className="text-xs" style={{ color: '#6b7280', fontFamily: 'DM Sans, sans-serif' }}>
                Based on your input
              </p>
            </div>
          </div>
          {result.model_used && <ModelBadge modelName={result.model_used} />}
        </div>

        {ResultComponent && <ResultComponent data={result} />}

        {/* Global SHAP — only for single-output tabs like concrete */}
        {tab === 'concrete' && result.shap_values && Object.keys(result.shap_values).length > 0 && (
          <div className="mt-8 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <ShapChart shapValues={result.shap_values} title="Feature Contributions (SHAP)" />
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
