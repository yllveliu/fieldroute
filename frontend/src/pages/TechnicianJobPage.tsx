import { useCallback, useEffect, useState } from 'react'
import { Truck, CheckCircle2, ClipboardList } from 'lucide-react'
import {
  getCurrentTechnicianJob,
  resolveCurrentTechnicianId,
  updateTechnicianJobStatus,
  mockTechnicianJob,
  type JobDetail,
  type TechnicianJobStatus,
} from '@/api'
import { useAuth } from '@/context/AuthContext'
import { PageHeader } from '@/components/layout'
import { EmptyState, Toast, type ToastVariant } from '@/components/primitives'
import { JobCard, Timeline } from '@/components/domain'
import { PageSkeleton } from '@/components/ui/Skeleton'
import { PageError } from '@/components/ui/PageError'

export default function TechnicianJobPage() {
  const { user } = useAuth()

  const [job, setJob] = useState<JobDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offline, setOffline] = useState(false)
  const [updating, setUpdating] = useState<TechnicianJobStatus | null>(null)

  const [toastMsg, setToastMsg] = useState<string | null>(null)
  const [toastVariant, setToastVariant] = useState<ToastVariant>('success')

  const showToast = useCallback((message: string, variant: ToastVariant) => {
    setToastVariant(variant)
    setToastMsg(message)
  }, [])

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const technicianId = await resolveCurrentTechnicianId(user)
      if (technicianId == null) {
        // Gap: user could not be resolved to a technician — show mock so the
        // page is still demonstrable. Status changes are simulated locally.
        setOffline(true)
        setJob(mockTechnicianJob)
        return
      }
      setOffline(false)
      setJob(await getCurrentTechnicianJob(technicianId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load your job.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    void load()
  }, [load])

  // Auto-dismiss the toast after 4 seconds.
  useEffect(() => {
    if (!toastMsg) return
    const timer = setTimeout(() => setToastMsg(null), 4000)
    return () => clearTimeout(timer)
  }, [toastMsg])

  async function handleStatusChange(next: TechnicianJobStatus) {
    if (!job) return
    setUpdating(next)
    try {
      if (offline) {
        // Mock mode: simulate the transition without hitting the API.
        setJob({ ...job, status: next })
      } else {
        const updated = await updateTechnicianJobStatus(job.id, next)
        setJob(updated)
      }
      showToast(
        next === 'en_route' ? 'Marked as en route.' : 'Job marked as done.',
        'success'
      )
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to update status.',
        'error'
      )
    } finally {
      setUpdating(null)
    }
  }

  const canEnRoute = job?.status === 'assigned'
  const canDone = job?.status === 'en_route'

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 overflow-x-hidden">
      <PageHeader
        title="My Job"
        subtitle="Your current assignment. Update its status as you work."
      />

      {offline && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
          Showing sample data — your account is not linked to a technician
          record yet, so status changes here are simulated.
        </div>
      )}

      {loading ? (
        <PageSkeleton variant="cards" count={2} />
      ) : error ? (
        <PageError message={error} onRetry={load} />
      ) : !job ? (
        <div className="mt-4">
          <EmptyState
            icon={ClipboardList}
            title="No job assigned"
            description="You have no active assignment right now. Check back soon."
          />
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
            <Timeline currentStatus={job.status} />
          </div>

          <JobCard job={job} />

          {(canEnRoute || canDone) && (
            <div className="flex flex-wrap gap-3">
              {canEnRoute && (
                <button
                  onClick={() => void handleStatusChange('en_route')}
                  disabled={updating !== null}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-amber-600 text-white text-sm font-medium
                    hover:bg-amber-700 disabled:opacity-60
                    transition-colors duration-150"
                >
                  <Truck size={16} />
                  {updating === 'en_route' ? 'Updating…' : 'Mark En Route'}
                </button>
              )}
              {canDone && (
                <button
                  onClick={() => void handleStatusChange('done')}
                  disabled={updating !== null}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg
                    bg-green-600 text-white text-sm font-medium
                    hover:bg-green-700 disabled:opacity-60
                    transition-colors duration-150"
                >
                  <CheckCircle2 size={16} />
                  {updating === 'done' ? 'Updating…' : 'Mark Done'}
                </button>
              )}
            </div>
          )}

          {job.status === 'done' && (
            <p className="text-sm font-medium text-green-700 flex items-center gap-2">
              <CheckCircle2 size={16} />
              This job is complete.
            </p>
          )}
        </div>
      )}

      <Toast
        message={toastMsg ?? ''}
        variant={toastVariant}
        visible={Boolean(toastMsg)}
        onClose={() => setToastMsg(null)}
      />
    </div>
  )
}
