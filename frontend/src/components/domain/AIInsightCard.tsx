import { motion } from 'framer-motion'
import { Sparkles, AlertTriangle, BrainCircuit } from 'lucide-react'

interface AIInsightCardProps {
  aiServiceType:  string | null
  aiConfidence:   number | null
  aiExplanation:  string | null
  onClassify?:    () => void
}

export function AIInsightCard({
  aiServiceType,
  aiConfidence,
  aiExplanation,
  onClassify,
}: AIInsightCardProps) {
  const isPending = aiServiceType === null
  const isLowConf = !isPending && aiConfidence !== null && aiConfidence < 0.70
  const isNormal  = !isPending && aiConfidence !== null && aiConfidence >= 0.70
  const confidencePct = aiConfidence !== null ? Math.round(aiConfidence * 100) : 0

  const cardStyle: React.CSSProperties = isNormal
    ? {
        border: '1.5px solid #8B5CF6',
        boxShadow: 'var(--fr-shadow-ai)',
        animation: 'fr-ai-glow-pulse 3s ease-in-out infinite',
      }
    : isLowConf
    ? { border: '1.5px solid #FCD34D' }
    : { border: '1.5px dashed #CBD5E1' }

  const cardBg = isLowConf ? 'bg-amber-50' : 'bg-white'

  return (
    <div
      className={`rounded-xl p-4 ${cardBg}`}
      style={cardStyle}
    >
      {/* Header row */}
      <div className="flex items-center gap-2 mb-3">
        {isLowConf
          ? <AlertTriangle className="w-4 h-4 text-amber-500" />
          : <BrainCircuit className="w-4 h-4 text-violet-500" />
        }
        <span className="text-sm font-semibold text-slate-700">AI Insight</span>

        <span className={`ml-auto flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
          isNormal
            ? 'bg-cyan-100 text-cyan-700'
            : 'bg-slate-100 text-slate-500'
        }`}>
          <Sparkles className="w-3 h-3" />
          AI Assisted
        </span>
      </div>

      {/* PENDING STATE */}
      {isPending && (
        <div className="space-y-3">
          <div className="space-y-2">
            <div className="h-3 rounded bg-slate-200 animate-pulse w-3/4" />
            <div className="h-3 rounded bg-slate-200 animate-pulse w-1/2" />
            <div className="h-3 rounded bg-slate-200 animate-pulse w-2/3" />
          </div>

          <p className="text-xs text-slate-400">
            Not yet classified. Run AI to detect service type.
          </p>

          {onClassify && (
            <button
              onClick={onClassify}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan-600 text-white hover:bg-cyan-700 transition-colors"
            >
              <Sparkles className="w-3 h-3" />
              Run AI Classification
            </button>
          )}
        </div>
      )}

      {/* LOW CONFIDENCE STATE */}
      {isLowConf && (
        <div className="space-y-2">
          <p className="text-base font-semibold text-slate-800">{aiServiceType}</p>

          <p className="text-xs text-slate-500">{aiExplanation}</p>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Confidence</span>
              <span>{confidencePct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-amber-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-amber-400"
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <AlertTriangle className="w-3 h-3" />
            Low confidence — manual review recommended
          </div>
        </div>
      )}

      {/* NORMAL STATE */}
      {isNormal && (
        <div className="space-y-2">
          <p className="text-lg font-bold text-slate-800">{aiServiceType}</p>

          <p className="text-xs text-slate-500">{aiExplanation}</p>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500">
              <span>Confidence</span>
              <span>{confidencePct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                initial={{ width: 0 }}
                animate={{ width: `${confidencePct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
