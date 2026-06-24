import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Send, CheckCircle, AlertCircle, BrainCircuit,
  Truck, ClipboardList,
} from 'lucide-react'
import { createJob, getMe, ApiError } from '@/api'
import type { CreateJobResponse } from '@/api'
import { PageHeader } from '@/components/layout'
import { useAuth } from '@/context/AuthContext'

const PLACEHOLDERS = [
  'e.g. Burst pipe under kitchen sink…',
  'e.g. Flickering lights throughout office…',
  'e.g. AC unit not cooling properly…',
  'e.g. Blocked main drain in bathroom…',
  'e.g. Poor airflow in office building…',
]

const NEXT_STEPS = [
  {
    icon: BrainCircuit,
    color: '#8B5CF6',
    title: 'AI Categorizes Your Request',
    detail:
      'Our AI reads your description and detects the service type ' +
      'automatically: plumbing, electrical, HVAC, and more.',
  },
  {
    icon: Truck,
    color: '#06B6D4',
    title: 'Dispatcher Assigns a Technician',
    detail:
      'A dispatcher reviews the job and assigns the nearest ' +
      'available technician with the right skills.',
  },
  {
    icon: CheckCircle,
    color: '#16A34A',
    title: 'Technician Arrives & Completes',
    detail:
      'You receive real-time status updates as your technician ' +
      'travels to your location and completes the job.',
  },
]

const EMPTY_FORM = {
  customer_name: '',
  phone: '',
  address: '',
  raw_description: '',
}

export default function CustomerPage() {
  const { user } = useAuth()
  const isTechnician = user?.role === 'technician'
  const [form, setForm] = useState(EMPTY_FORM)

  // For a technician requesting a service, prefill their name from their account
  // so they don't retype it (phone/address aren't on file, so stay editable).
  useEffect(() => {
    if (!isTechnician) return
    let active = true
    getMe()
      .then((me) => {
        if (active && me.name) setForm((f) => ({ ...f, customer_name: me.name as string }))
      })
      .catch(() => { /* leave form blank on failure */ })
    return () => { active = false }
  }, [isTechnician])
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<CreateJobResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [problemFocused, setProblemFocused] = useState(false)

  useEffect(() => {
    if (problemFocused) return
    const interval = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [problemFocused])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await createJob(form)
      setSubmitted(result)
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="overflow-x-hidden px-4 md:px-6">
      <PageHeader
        title="New Service Request"
        subtitle="Tell us what's wrong and we'll dispatch a technician."
      />

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT — Form or Success state */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          {submitted !== null ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                Request Submitted!
              </h2>
              <p className="mt-2 text-sm text-slate-600">
                Your job has been created with ID #{submitted.job_id}.
              </p>
              <p className="mt-2 text-sm text-slate-600">
                Status:{' '}
                <span className="font-semibold text-slate-900">
                  {submitted.status}
                </span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setSubmitted(null)
                  setForm(EMPTY_FORM)
                }}
                className="mt-6 px-4 py-2 min-h-[44px] rounded-lg bg-green-600 text-white
                  text-base font-medium hover:bg-green-700 transition-colors"
              >
                Submit Another Request
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={form.customer_name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customer_name: e.target.value }))
                  }
                  placeholder="Jane Smith"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300
                    text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, phone: e.target.value }))
                  }
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300
                    text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition"
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Service Address *
                </label>
                <input
                  type="text"
                  required
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                  placeholder="123 Main St, City, State"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300
                    text-base focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent transition"
                />
              </div>

              {/* Problem description */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Describe the Problem *
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.raw_description}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      raw_description: e.target.value,
                    }))
                  }
                  onFocus={() => setProblemFocused(true)}
                  onBlur={() => setProblemFocused(false)}
                  placeholder={PLACEHOLDERS[placeholderIndex]}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300
                    text-base resize-none focus:outline-none focus:ring-2
                    focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 min-h-[44px] rounded-xl bg-blue-600 text-white font-semibold
                  text-base hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed
                  transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40
                      border-t-white rounded-full animate-spin" />
                    Submitting…
                  </>
                ) : (
                  <>
                    <Send size={16} /> Submit Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* RIGHT — What Happens Next panel */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white h-fit">
          <h3 className="text-base font-bold mb-6 flex items-center gap-2">
            <ClipboardList size={18} className="text-cyan-400" />
            What Happens Next
          </h3>
          <div className="space-y-6">
            {NEXT_STEPS.map((step, i) => {
              const Icon = step.icon
              return (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className="w-9 h-9 rounded-full flex items-center
                      justify-center shrink-0"
                    style={{
                      backgroundColor: step.color + '22',
                      border: `1px solid ${step.color}55`,
                    }}
                  >
                    <Icon size={16} style={{ color: step.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{step.title}</p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {step.detail}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Average response time note */}
          <div className="mt-6 pt-6 border-t border-slate-700 text-xs text-slate-500">
            ⚡ Average response time:{' '}
            <span className="text-cyan-400 font-semibold">
              under 30 minutes
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
