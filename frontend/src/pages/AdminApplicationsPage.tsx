import { useEffect, useState } from 'react'
import { Check, X, FileText, Loader2 } from 'lucide-react'
import {
  adminListApplications,
  adminApproveApplication,
  adminDeclineApplication,
  adminFetchApplicationCv,
  ApiError,
} from '@/api'
import type { TechnicianApplication } from '@/api'

function scoreColor(score: number | null): string {
  if (score === null) return 'text-slate-400'
  if (score >= 70) return 'text-green-400'
  if (score >= 40) return 'text-amber-400'
  return 'text-red-400'
}

export default function AdminApplicationsPage() {
  const [apps, setApps] = useState<TechnicianApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<number | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      setApps(await adminListApplications())
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleApprove(id: number) {
    setBusyId(id)
    try {
      await adminApproveApplication(id)
      setApps((prev) => prev.filter((a) => a.id !== id))
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to approve.')
    } finally {
      setBusyId(null)
    }
  }

  async function handleDecline(id: number) {
    if (!window.confirm('Decline this application? The applicant account will be deleted.')) return
    setBusyId(id)
    try {
      await adminDeclineApplication(id)
      setApps((prev) => prev.filter((a) => a.id !== id))
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : 'Failed to decline.')
    } finally {
      setBusyId(null)
    }
  }

  async function viewCv(id: number) {
    try {
      const blob = await adminFetchApplicationCv(id)
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank', 'noopener')
      // Give the new tab a moment to load before revoking.
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch {
      setError('Failed to open CV.')
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-1">Technician Applications</h1>
      <p className="text-slate-400 text-sm mb-6">
        Review applicants and their AI suitability score, then approve or decline.
      </p>

      {error && (
        <div className="mb-4 bg-red-950 border border-red-800 rounded-xl p-3 text-sm text-red-300">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-slate-400"><Loader2 className="animate-spin" size={18} /> Loading…</div>
      ) : apps.length === 0 ? (
        <p className="text-slate-400">No pending applications. 🎉</p>
      ) : (
        <div className="space-y-4">
          {apps.map((app) => (
            <div key={app.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-white">{app.name}</h2>
                  <p className="text-sm text-slate-400">{app.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {app.skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs capitalize">{s}</span>
                    ))}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 uppercase tracking-wide">AI match</div>
                  <div className={`text-2xl font-bold ${scoreColor(app.ai_match_score)}`}>
                    {app.ai_match_score === null ? 'N/A' : `${Math.round(app.ai_match_score)}%`}
                  </div>
                </div>
              </div>

              {app.ai_match_summary && (
                <p className="text-sm text-slate-400 mt-3 bg-slate-950/50 rounded-lg p-3 border border-slate-800">
                  {app.ai_match_summary}
                </p>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {app.has_cv && (
                  <button
                    onClick={() => viewCv(app.id)}
                    className="px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
                  >
                    <FileText size={15} /> View CV
                  </button>
                )}
                <button
                  disabled={busyId === app.id}
                  onClick={() => handleApprove(app.id)}
                  className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  <Check size={15} /> Approve
                </button>
                <button
                  disabled={busyId === app.id}
                  onClick={() => handleDecline(app.id)}
                  className="px-3 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2"
                >
                  <X size={15} /> Decline
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
