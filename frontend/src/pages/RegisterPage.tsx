import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, AlertCircle, Wrench, User, Upload } from 'lucide-react'
import { register, applyAsTechnician, ApiError } from '@/api'
import { SKILLS } from '@/constants/skills'

type Mode = 'customer' | 'technician'

export default function RegisterPage() {
  const [mode, setMode] = useState<Mode>('customer')
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [skills, setSkills] = useState<string[]>([])
  const [cv, setCv] = useState<File | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [applied, setApplied] = useState(false)
  const navigate = useNavigate()

  function toggleSkill(skill: string) {
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setFieldError(null)

    if (form.password.length < 8) {
      setFieldError('Password must be at least 8 characters.')
      return
    }

    if (mode === 'technician') {
      if (skills.length === 0) {
        setFieldError('Select at least one skill.')
        return
      }
      if (!cv) {
        setFieldError('Please attach your CV (PDF).')
        return
      }
      if (cv.type !== 'application/pdf') {
        setFieldError('CV must be a PDF file.')
        return
      }
    }

    setSubmitting(true)
    try {
      if (mode === 'customer') {
        await register(form)
        navigate('/login')
      } else {
        await applyAsTechnician({ ...form, skills, cv: cv as File })
        setApplied(true)
      }
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setError('An account with this email already exists.')
      } else if (err instanceof ApiError) {
        setError(err.message)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (applied) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto text-center"
        >
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
            <h1 className="text-xl font-bold text-white mb-2">Application submitted</h1>
            <p className="text-slate-400 text-sm">
              Thanks for applying! We've received your CV and will review it shortly.
              You'll get an email with our decision, and you can log in any time to
              check your status.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="mt-6 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
            >
              Go to Sign In
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  const inputClass =
    'w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 overflow-x-hidden py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto px-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">FieldRoute</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
          {/* Mode switch */}
          <div className="grid grid-cols-2 gap-2 mb-6">
            {([
              { key: 'customer', label: 'I need service', icon: User },
              { key: 'technician', label: 'I want to work here', icon: Wrench },
            ] as const).map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => { setMode(key); setError(null); setFieldError(null) }}
                className={`py-2.5 min-h-[44px] rounded-xl text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${
                  mode === key
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                <Icon size={15} /> {label}
              </button>
            ))}
          </div>

          {error && (
            <div role="alert" className="mb-4 bg-red-950 border border-red-800 rounded-xl p-3 flex items-start gap-2 text-sm text-red-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label htmlFor="reg-name" className="block text-sm font-medium text-slate-300 mb-1">
                Full Name <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="reg-name"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="reg-email" className="block text-sm font-medium text-slate-300 mb-1">
                Email address <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required)</span>
              </label>
              <input
                id="reg-email"
                required
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="reg-password" className="block text-sm font-medium text-slate-300 mb-1">
                Password <span className="text-red-500" aria-hidden="true">*</span>
                <span className="sr-only">(required, minimum 8 characters)</span>
              </label>
              <input
                id="reg-password"
                required
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className={inputClass}
              />
            </div>

            {/* Technician-only: skills + CV */}
            {mode === 'technician' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Skills <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SKILLS.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`py-2 px-2 rounded-xl text-sm font-medium border transition-colors capitalize ${
                          skills.includes(skill)
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    CV (PDF) <span className="text-red-500">*</span>
                  </label>
                  <label className={`${inputClass} flex items-center gap-2 cursor-pointer`}>
                    <Upload size={16} className="shrink-0 text-slate-400" />
                    <span className="truncate text-slate-300">
                      {cv ? cv.name : 'Choose a PDF file…'}
                    </span>
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setCv(e.target.files?.[0] ?? null)}
                    />
                  </label>
                </div>
              </>
            )}

            {fieldError && <p className="text-red-400 text-xs">{fieldError}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 min-h-[44px] rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {submitting ? (
                <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting…</>
              ) : (
                <><UserPlus size={16} /> {mode === 'customer' ? 'Create Account' : 'Submit Application'}</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Sign In
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
