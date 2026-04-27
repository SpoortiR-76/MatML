import { motion } from 'framer-motion'
import { useInView } from 'framer-motion'
import { useRef } from 'react'
import GlassCard from '../ui/GlassCard'

const features = [
  {
    icon: '🏗️',
    title: '3 Material Types',
    desc: 'Concrete compressive strength, steel multi-property (yield/tensile/elongation), and general materials prediction — all in one platform.',
    tag: 'Concrete · Steel · Alloys',
  },
  {
    icon: '🤖',
    title: 'ML-Powered',
    desc: 'Random Forest and XGBoost models trained on real lab datasets. Multi-output regression, binary classification — selected by best R² and MAE.',
    tag: 'RF · XGB · Multi-output',
  },
  {
    icon: '🔍',
    title: 'Explainable AI',
    desc: 'Every prediction comes with SHAP feature importance — understand which compositional factors drive the predicted outcome.',
    tag: 'SHAP · Interpretable',
  },
]

function FeatureCard({ feature, index }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.12 }}
    >
      <GlassCard className="p-8 h-full glass-hover flex flex-col gap-5">
        <span className="text-4xl">{feature.icon}</span>
        <div className="flex flex-col gap-2">
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: 'Syne, sans-serif', color: '#f9fafb' }}
          >
            {feature.title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}>
            {feature.desc}
          </p>
        </div>
        <span
          className="text-xs font-medium px-3 py-1.5 rounded-lg self-start mt-auto"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.18)',
            color: '#10b981',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          {feature.tag}
        </span>
      </GlassCard>
    </motion.div>
  )
}

export default function FeaturesSection() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: 'Syne, sans-serif' }}
          >
            Everything you need to predict
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="text-lg"
            style={{ color: '#9ca3af', fontFamily: 'DM Sans, sans-serif' }}
          >
            Three ML modules, one clean interface.
          </motion.p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <FeatureCard key={f.title} feature={f} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
