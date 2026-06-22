import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function ApplicationStatusPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-auto text-center"
      >
        <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 shadow-xl">
          <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/15 flex items-center justify-center mb-4">
            <Clock className="w-7 h-7 text-amber-400" />
          </div>
          <h1 className="text-xl font-bold text-white mb-2">Application under review</h1>
          <p className="text-slate-400 text-sm">
            Thanks for applying to FieldRoute, {user?.name ?? 'there'}. Our team is
            reviewing your CV and skills. You'll receive an email as soon as a
            decision is made — once approved, your technician dashboard unlocks here.
          </p>

          <button
            onClick={() => { logout(); navigate('/login') }}
            className="mt-6 w-full py-3 min-h-[44px] rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-medium hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut size={16} /> Sign Out
          </button>
        </div>
      </motion.div>
    </div>
  )
}
