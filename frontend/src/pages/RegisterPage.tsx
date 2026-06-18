import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { UserPlus, AlertCircle } from 'lucide-react'
import { register, ApiError } from '@/api'

export default function RegisterPage() {
  const [form, setForm] = useState({
    name:     '',
    email:    '',
    password: '',
    role:     'dispatcher' as 'dispatcher' | 'technician',
  })
  const [submitting, setSubmitting]       = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const navigate                          = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setPasswordError(null)

    if (form.password.length < 8) {
      setPasswordError('Password must be at least 8 characters.')
      return
    }

    setSubmitting(true)
    try {
      await register(form)
      navigate('/login')
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 409) {
        setError('An account with this email already exists.')
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        {/* Logo / brand */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">FieldRoute</h1>
          <p className="text-slate-400 text-sm mt-1">Create your account</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">

          {/* API error banner */}
          {error && (
            <div className="mb-4 bg-red-950 border border-red-800 rounded-xl p-3 flex items-start gap-2 text-sm text-red-300">
              <AlertCircle size={15} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Jane Smith"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                required
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className={`w-full px-4 py-2.5 rounded-xl bg-slate-800 border text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${passwordError ? 'border-red-500' : 'border-slate-700'}`}
              />
              {passwordError && (
                <p className="text-red-400 text-xs mt-1">{passwordError}</p>
              )}
            </div>

            {/* Role selector */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['dispatcher', 'technician'] as const).map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, role: r }))}
                    className={`py-2.5 rounded-xl text-sm font-medium border transition-colors capitalize ${
                      form.role === r
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {submitting
                ? <><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Creating account…</>
                : <><UserPlus size={16} /> Create Account</>
              }
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{' '}
            <a
              href="/login"
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Sign In
            </a>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
