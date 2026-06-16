import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, AlertCircle, Clock, CheckCircle2 } from 'lucide-react'
import { getJob, ApiError } from '@/api'
import type { JobTrackingResponse } from '@/api'
import { usePolling } from '@/hooks/usePolling'
import { PageHeader } from '@/components/layout'
import { Avatar, SkillBadge, StatusBadge, EmptyState } from '@/components/primitives'
import { getStatusConfig, MOCK_JOBS, MOCK_TECHNICIANS } from '@/data'

const STATUSES = ['new', 'categorized', 'assigned', 'en_route', 'done']

/** Map a mock JobDetail into the tracking response shape for offline fallback. */
function mockToTracking(id: number): JobTrackingResponse | null {
  const job = MOCK_JOBS.find(j => j.id === id)
  if (!job) return null
  const tech = job.technician
    ? MOCK_TECHNICIANS.find(t => t.id === job.technician?.id)
    : null
  return {
    id: job.id,
    status: job.status,
    service_name: job.service_name ?? 'Not categorized yet',
    customer_name: 'Customer',
    eta_message: job.eta_message,
    ai_service_type: job.ai_service_type,
    ai_confidence: job.ai_confidence,
    ai_explanation: job.ai_explanation,
    technician: job.technician
      ? {
          id: job.technician.id,
          name: job.technician.name,
          skills: tech?.skills ?? [],
          status: job.technician.status,
        }
      : null,
  }
}

export default function TrackingPage() {
  const [jobId, setJobId] = useState('')
  const [job, setJob] = useState<JobTrackingResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [found, setFound] = useState(false)
  const [isMock, setIsMock] = useState(false)

  async function handleFind() {
    if (!jobId.trim()) return
    // Stop any active polling so the interval restarts for the new lookup.
    setFound(false)
    setLoading(true)
    setError(null)
    try {
      const data = await getJob(Number(jobId))
      setJob(data)
      setIsMock(false)
      setFound(true)
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 404) {
        setError(`No job found with ID #${jobId}.`)
        setJob(null)
        setFound(false)
      } else if (err instanceof ApiError) {
        setError('Could not load job. Please try again.')
        setJob(null)
        setFound(false)
      } else {
        // Network error (fetch rejected) — fall back to mock data.
        const mock = mockToTracking(Number(jobId))
        if (mock) {
          setJob(mock)
          setIsMock(true)
          setFound(true)
        } else {
          setError('Could not load job. Please try again.')
          setJob(null)
          setFound(false)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  // Auto-refresh every 30 seconds while a real job is loaded.
  usePolling(
    () => {
      if (found && !isMock) {
        getJob(Number(jobId))
          .then(setJob)
          .catch(() => {})
      }
    },
    30000,
    found && !isMock
  )

  const currentIndex = job ? STATUSES.indexOf(job.status) : -1

  return (
    <div className="max-w-2xl mx-auto px-4 md:px-8 py-8">
      <PageHeader
        title="Track Your Job"
        subtitle="Enter your job ID to see real-time status updates."
      />

      {/* Lookup bar */}
      <div className="flex gap-3 mt-6">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            value={jobId}
            onChange={e => setJobId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFind()}
            placeholder="Enter Job ID (e.g. 1)"
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-300
              text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <button
          onClick={handleFind}
          disabled={loading}
          className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm
            font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
        >
          {loading ? 'Finding…' : 'Find'}
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-xl
          p-4 text-sm text-red-700 flex items-start gap-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Job found — show timeline, summary, technician */}
      {job && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 space-y-6"
        >
          {/* Status timeline */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-center justify-between">
              {STATUSES.map((status, i) => {
                const config = getStatusConfig(status)
                const completed = i < currentIndex
                const current = i === currentIndex
                const circle = completed
                  ? 'bg-green-500 text-white'
                  : current
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-200 text-slate-400'
                return (
                  <div
                    key={status}
                    className="flex-1 flex flex-col items-center relative"
                  >
                    {/* Connecting line to previous step */}
                    {i > 0 && (
                      <span
                        className={`absolute top-4 right-1/2 w-full h-0.5 ${
                          i <= currentIndex ? 'bg-green-500' : 'bg-slate-200'
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 w-8 h-8 rounded-full flex items-center
                        justify-center ${circle}`}
                    >
                      {completed ? (
                        <CheckCircle2 size={18} />
                      ) : current ? (
                        <Clock size={16} />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-current" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs text-center ${
                        current
                          ? 'font-semibold text-slate-900'
                          : 'text-slate-500'
                      }`}
                    >
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Job summary card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    Job #{job.id}
                  </h2>
                  {isMock && (
                    <span className="text-xs text-slate-400 font-medium">
                      [mock data]
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {job.service_name} · {job.customer_name}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            {job.eta_message && (
              <div className="mt-4 flex items-center gap-2 text-sm text-slate-600">
                <Clock size={16} className="text-blue-500" />
                <span>{job.eta_message}</span>
              </div>
            )}
            {job.ai_explanation && (
              <p className="mt-3 text-xs text-slate-400">{job.ai_explanation}</p>
            )}
          </div>

          {/* Technician card or empty state */}
          {job.technician ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-slate-700 mb-4">
                Your Technician
              </h3>
              <div className="flex items-center gap-4">
                <Avatar
                  name={job.technician.name}
                  status={job.technician.status}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900">
                    {job.technician.name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {job.technician.status.replace('_', ' ')}
                  </p>
                  {job.technician.skills.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {job.technician.skills.map(skill => (
                        <SkillBadge key={skill} skill={skill} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            job.status !== 'done' && (
              <div className="bg-white border border-slate-200 rounded-2xl">
                <EmptyState
                  icon={Search}
                  title="Being assigned"
                  description="A dispatcher is reviewing your job."
                />
              </div>
            )
          )}
        </motion.div>
      )}
    </div>
  )
}
