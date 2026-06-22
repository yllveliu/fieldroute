import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, AlertCircle } from 'lucide-react'
import { forgotPassword, ApiError } from '@/api'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await forgotPassword(email)
      setSent(true)
    } catch (err: unknown) {
      // Backend returns a generic success even for unknown emails, so an error
      // here is a real failure (network/server).
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto px-4"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Reset password</h1>
          <p className="text-slate-400 text-sm mt-1">
            We'll email you a link to set a new password.
          </p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
          {sent ? (
            <div className="text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-blue-500/15 flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <p className="text-slate-300 text-sm">
                If an account exists for <span className="text-white">{email}</span>,
                a reset link is on its way. Check your inbox (and spam folder).
              </p>
              <a href="/login" className="inline-block mt-6 text-blue-400 hover:text-blue-300 text-sm font-medium">
                Back to Sign In
              </a>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-950 border border-red-800 rounded-xl p-3 flex items-start gap-2 text-sm text-red-300">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Email address</label>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 min-h-[44px] rounded-xl bg-blue-600 text-white font-semibold text-base hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
                >
                  {submitting ? 'Sending…' : 'Send reset link'}
                </button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-6">
                <a href="/login" className="text-blue-400 hover:text-blue-300 font-medium">Back to Sign In</a>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}
