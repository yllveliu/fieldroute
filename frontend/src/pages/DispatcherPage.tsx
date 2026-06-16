import { useEffect, useState } from 'react'
import { getDispatcherJobs, classifyJob, mockDispatcherJobs } from '@/api'
import type { DispatcherJob, JobDetail } from '@/api'
import { PageHeader } from '@/components/layout'
import { StatCard, EmptyState, Toast } from '@/components/primitives'
import type { ToastVariant } from '@/components/primitives'
import { JobCard } from '@/components/domain'
import AssignmentModal from '@/components/assignment/AssignmentModal'

const FILTER_OPTIONS = [
  { value: 'all',         label: 'All' },
  { value: 'new',         label: 'New' },
  { value: 'categorized', label: 'Categorized' },
  { value: 'assigned',    label: 'Assigned' },
  { value: 'en_route',    label: 'En Route' },
  { value: 'done',        label: 'Done' },
]

// JobCard consumes the JobDetail shape; map the dispatcher row onto it.
function toJobDetail(job: DispatcherJob): JobDetail {
  return {
    id:                  job.id,
    status:              job.status,
    service_name:        job.service_name,
    problem_description: job.raw_description,
    eta_message:         job.eta_message,
    technician:          job.technician
      ? { id: 0, name: job.technician.name, status: job.technician.status }
      : null,
    ai_service_type:  null,
    ai_confidence:    null,
    ai_explanation:   null,
  }
}

export default function DispatcherPage() {
  const [jobs, setJobs]                 = useState<DispatcherJob[]>([])
  const [loading, setLoading]           = useState(true)
  const [offline, setOffline]           = useState(false)
  const [filter, setFilter]             = useState<string>('all')
  const [search, setSearch]             = useState('')
  const [assigningJob, setAssigningJob]   = useState<DispatcherJob | null>(null)
  const [classifyingId, setClassifyingId]   = useState<number | null>(null)
  const [toastMsg, setToastMsg]             = useState<string | null>(null)
  const [toastVariant, setToastVariant]     = useState<ToastVariant>('success')

  useEffect(() => {
    getDispatcherJobs()
      .then(data => {
        setJobs(data)
        setOffline(false)
      })
      .catch(() => {
        setJobs(mockDispatcherJobs)
        setOffline(true)
      })
      .finally(() => setLoading(false))
  }, [])

  // Auto-dismiss the toast after 4 seconds.
  useEffect(() => {
    if (!toastMsg) return
    const timer = setTimeout(() => setToastMsg(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMsg])

  const query = search.trim().toLowerCase()
  const filtered = jobs
    .filter(j => filter === 'all' || j.status === filter)
    .filter(j =>
      query === '' ||
      (j.customer?.name?.toLowerCase().includes(query) ?? false) ||
      (j.service_name?.toLowerCase().includes(query) ?? false)
    )

  const openCount       = jobs.filter(j => !['done', 'cancelled'].includes(j.status)).length
  const unassignedCount = jobs.filter(j => j.technician === null).length
  const categorizedCount = jobs.filter(j => j.status === 'categorized').length

  function refresh() {
    getDispatcherJobs()
      .then(data => {
        setJobs(data)
        setOffline(false)
      })
      .catch(() => {})
  }

  async function handleClassify(job: DispatcherJob) {
    setClassifyingId(job.id)
    try {
      await classifyJob(job.id)
      setToastVariant('success')
      setToastMsg(`Job #${job.id} classified successfully.`)
      refresh()
    } catch {
      setToastVariant('error')
      setToastMsg(`Failed to classify Job #${job.id}.`)
    } finally {
      setClassifyingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
      <PageHeader
        title="Dispatcher Dashboard"
        subtitle="Manage incoming jobs, assign technicians, and track field operations."
      />

      {offline && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Using offline data — could not reach the dispatcher service.
        </div>
      )}

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
        <StatCard title="Open Jobs"      value={openCount} />
        <StatCard title="Unassigned"     value={unassignedCount} />
        <StatCard title="AI Categorized" value={categorizedCount} />
        <StatCard title="Total Jobs"     value={jobs.length} />
      </div>

      {/* Filter chips + search */}
      <div className="flex flex-wrap gap-2 items-center mt-6">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={
              filter === opt.value
                ? 'px-3 py-1 rounded-full text-xs font-semibold bg-blue-600 text-white'
                : 'px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200'
            }
          >
            {opt.label}
          </button>
        ))}
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search jobs…"
          className="ml-auto flex-1 min-w-[180px] max-w-xs px-3 py-1.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Job grid */}
      {loading ? (
        <p className="text-slate-500 mt-8 text-sm">Loading jobs…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No jobs match the current filters." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
          {filtered.map(job => (
            <JobCard
              key={job.id}
              job={toJobDetail(job)}
              onAssign={
                job.status === 'categorized'
                  ? () => setAssigningJob(job)
                  : undefined
              }
              onClassify={
                job.status === 'new' && !offline
                  ? () => handleClassify(job)
                  : undefined
              }
              classifying={classifyingId === job.id}
            />
          ))}
        </div>
      )}

      {/* Assignment modal */}
      {assigningJob && (
        <AssignmentModal
          job={assigningJob}
          onClose={() => setAssigningJob(null)}
          onSuccess={msg => {
            setAssigningJob(null)
            setToastVariant('success')
            setToastMsg(msg)
            refresh()
          }}
        />
      )}

      {/* Toast */}
      <Toast
        message={toastMsg ?? ''}
        variant={toastVariant}
        visible={Boolean(toastMsg)}
        onClose={() => setToastMsg(null)}
      />
    </div>
  )
}
