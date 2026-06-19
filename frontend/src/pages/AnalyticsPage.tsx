import { useState, useEffect, useMemo } from 'react'
import { Briefcase, Users, Clock, TrendingUp, AlertCircle, FlaskConical } from 'lucide-react'
import { fetchAnalytics, MOCK_ANALYTICS } from '@/api/analytics'
import type { AnalyticsResponse } from '@/api/analytics'
import { getDispatcherJobs, mockDispatcherJobs } from '@/api/dispatcher'
import type { DispatcherJob } from '@/api/dispatcher'
import { StatCard } from '@/components/primitives/StatCard'
import { StatusBadge } from '@/components/primitives/StatusBadge'
import { EmptyState } from '@/components/primitives/EmptyState'
import { getStatusConfig } from '@/data'

// Canonical display order for the jobs_by_status breakdown
const STATUS_ORDER = ['new', 'categorized', 'assigned', 'en_route', 'done'] as const

const ALL_STATUSES = ['new', 'categorized', 'assigned', 'en_route', 'done']

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics]         = useState<AnalyticsResponse | null>(null)
  const [analyticsIsMock, setAnalyticsIsMock] = useState(false)
  const [jobs, setJobs]                   = useState<DispatcherJob[]>([])
  const [loading, setLoading]             = useState(true)

  // Filter state
  const [filterStatus, setFilterStatus]   = useState('')
  const [filterService, setFilterService] = useState('')
  const [filterFrom, setFilterFrom]       = useState('')
  const [filterTo, setFilterTo]           = useState('')

  useEffect(() => {
    async function load() {
      // Analytics — fall back to clearly-marked mock if KAN-63 endpoint is not yet live
      try {
        const data = await fetchAnalytics()
        setAnalytics(data)
        setAnalyticsIsMock(false)
      } catch {
        setAnalytics(MOCK_ANALYTICS)
        setAnalyticsIsMock(true)
      }

      // Job history — fall back to offline mock (same pattern as DispatcherPage)
      try {
        const data = await getDispatcherJobs()
        setJobs(data)
      } catch {
        setJobs(mockDispatcherJobs)
      }

      setLoading(false)
    }
    load()
  }, [])

  // Unique service types derived from loaded jobs (for filter dropdown)
  const serviceTypes = useMemo(() => {
    const names = jobs
      .map(j => j.service_name)
      .filter((n): n is string => Boolean(n))
    return Array.from(new Set(names)).sort()
  }, [jobs])

  // Client-side filtering
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      if (filterStatus && job.status !== filterStatus) return false
      if (filterService && job.service_name !== filterService) return false
      const dateStr = job.created_at.slice(0, 10)
      if (filterFrom && dateStr < filterFrom) return false
      if (filterTo   && dateStr > filterTo)   return false
      return true
    })
  }, [jobs, filterStatus, filterService, filterFrom, filterTo])

  const hasFilters = Boolean(filterStatus || filterService || filterFrom || filterTo)

  function clearFilters() {
    setFilterStatus('')
    setFilterService('')
    setFilterFrom('')
    setFilterTo('')
  }

  // ── Shared styles ─────────────────────────────────────────────────────────
  const selectCls =
    'px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-700 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">

      {/* ── Analytics section ─────────────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-700">Overview</h2>
          {analyticsIsMock && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-700">
              <FlaskConical className="w-3 h-3" />
              Demo data — GET /dispatcher/analytics not yet live
            </span>
          )}
        </div>

        {analytics && (
          <>
            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Jobs Today"
                value={analytics.jobs_today}
                icon={Briefcase}
              />
              <StatCard
                title="Available Technicians"
                value={analytics.available_technicians}
                icon={Users}
              />
              <StatCard
                title="Avg Resolution"
                value={`${analytics.avg_resolution_hours.toFixed(1)}h`}
                icon={Clock}
                subtitle="per completed job"
              />
              <StatCard
                title="Team Utilization"
                value={`${analytics.technician_utilization_pct}%`}
                icon={TrendingUp}
                trend={
                  analytics.technician_utilization_pct >= 80 ? 'up' :
                  analytics.technician_utilization_pct <= 40 ? 'down' : 'neutral'
                }
              />
            </div>

            {/* Jobs by status breakdown */}
            <div className="bg-white rounded-lg border border-slate-200 px-5 py-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
                Jobs by Status
              </p>
              <div className="flex flex-wrap gap-4">
                {STATUS_ORDER.map(status => {
                  const count = analytics.jobs_by_status[status] ?? 0
                  const cfg   = getStatusConfig(status)
                  return (
                    <div key={status} className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${cfg.bgClass} ${cfg.textClass}`}
                      >
                        {cfg.label}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}
      </section>

      {/* ── Job History section ────────────────────────────────────────────── */}
      <section className="space-y-4">
        <h2 className="text-base font-semibold text-slate-700">Job History</h2>

        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex flex-wrap gap-3 items-end">
            {/* Status filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={e => setFilterStatus(e.target.value)}
                className={selectCls}
              >
                <option value="">All statuses</option>
                {ALL_STATUSES.map(s => (
                  <option key={s} value={s}>{getStatusConfig(s).label}</option>
                ))}
              </select>
            </div>

            {/* Service type filter */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">Service Type</label>
              <select
                value={filterService}
                onChange={e => setFilterService(e.target.value)}
                className={selectCls}
              >
                <option value="">All services</option>
                {serviceTypes.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Date from */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">From</label>
              <input
                type="date"
                value={filterFrom}
                onChange={e => setFilterFrom(e.target.value)}
                className={selectCls}
              />
            </div>

            {/* Date to */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500 font-medium">To</label>
              <input
                type="date"
                value={filterTo}
                onChange={e => setFilterTo(e.target.value)}
                className={selectCls}
              />
            </div>

            {/* Clear */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>

          {/* Result count */}
          <p className="mt-3 text-xs text-slate-400">
            Showing <strong className="text-slate-600">{filteredJobs.length}</strong> of{' '}
            <strong className="text-slate-600">{jobs.length}</strong> jobs
          </p>
        </div>

        {/* Job list */}
        {filteredJobs.length === 0 ? (
          <EmptyState
            icon={AlertCircle}
            title="No jobs match your filters"
            description="Try adjusting the filters above."
            action={hasFilters ? { label: 'Clear filters', onClick: clearFilters } : undefined}
          />
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide w-12">#</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Service</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Technician</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredJobs.map(job => (
                  <tr key={job.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{job.id}</td>
                    <td className="px-4 py-3">
                      {job.customer ? (
                        <div>
                          <p className="font-medium text-slate-900">{job.customer.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{job.customer.address}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {job.service_name ?? <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={job.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {job.technician?.name ?? <span className="text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                      {fmtDate(job.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
