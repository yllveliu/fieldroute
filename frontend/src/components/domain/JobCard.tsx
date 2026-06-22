import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronUp, UserPlus, BrainCircuit } from 'lucide-react'
import { StatusBadge } from '@/components/primitives'
import { getStatusConfig } from '@/data'
import type { JobDetail } from '@/api'

interface JobCardProps {
  job: JobDetail
  onAssign?: (jobId: number) => void
  onClassify?: () => void
  classifying?: boolean
}

export function JobCard({ job, onAssign, onClassify, classifying = false }: JobCardProps) {
  const [expanded, setExpanded] = useState(false)
  const config = getStatusConfig(job.status)

  return (
    <div
      className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
      style={{ borderLeft: `4px solid ${config.color}` }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 p-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono text-slate-400">#{job.id}</span>
            <StatusBadge status={job.status} size="sm" />
            {job.service_name && (
              <span className="text-sm font-semibold text-slate-800 truncate">
                {job.service_name}
              </span>
            )}
          </div>

          {job.technician && (
            <p className="mt-1 text-xs text-slate-500">
              Assigned to {job.technician.name}
            </p>
          )}
          {job.eta_message && (
            <p className="mt-0.5 text-xs text-slate-400 italic">
              {job.eta_message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {job.status === 'new' && onClassify && (
            <button
              onClick={onClassify}
              disabled={classifying}
              className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg
                bg-violet-600 text-white text-xs font-medium
                hover:bg-violet-700 disabled:opacity-60
                transition-colors duration-150"
            >
              <BrainCircuit size={12} />
              {classifying ? 'Classifying…' : 'Classify'}
            </button>
          )}
          {job.status === 'categorized' && onAssign && (
            <button
              onClick={() => onAssign(job.id)}
              className="flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg
                bg-blue-600 text-white text-xs font-medium
                hover:bg-blue-700 transition-colors duration-150"
            >
              <UserPlus size={12} />
              Assign
            </button>
          )}
          {job.problem_description && (
            <button
              onClick={() => setExpanded(e => !e)}
              className="p-1.5 min-h-[44px] min-w-[44px] rounded-lg text-slate-400 hover:bg-slate-100
                transition-colors"
              aria-label={expanded ? 'Collapse' : 'Expand'}
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
        </div>
      </div>

      {/* Expandable description */}
      <AnimatePresence initial={false}>
        {expanded && job.problem_description && (
          <motion.div
            key="description"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-100 pt-3">
              <p className="text-sm text-slate-600 leading-relaxed">
                {job.problem_description}
              </p>

              {job.ai_service_type && (
                <div className="mt-2 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-xs font-medium">
                    AI: {job.ai_service_type}
                  </span>
                  {job.ai_confidence && (
                    <span className="text-xs text-slate-400">
                      {Math.round(job.ai_confidence * 100)}% confidence
                    </span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
