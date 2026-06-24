import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Zap, ArrowRight, LogIn,
  UserCheck, Truck, Wrench, ShieldCheck,
  FileText, BrainCircuit, CheckCircle, ChevronRight,
  MapPin, Clock, Package, BarChart3,
} from 'lucide-react'
import { login as loginApi } from '@/api'
import { useAuth } from '@/context/AuthContext'
import type { ApplicationStatus } from '@/context/AuthContext'
import type { Role } from '@/context/AuthContext'

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const DEMO_ROLES = [
  {
    role: 'customer' as Role,
    email: 'customer@fieldroute.com',
    icon: UserCheck,
    color: '#2563EB',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    label: 'Customer',
    tagline: 'Request & track your jobs',
    bullets: [
      'Submit a service request in seconds',
      'AI instantly categorises your issue',
      'Real-time status updates per job',
      'See which technician is on the way',
    ],
    redirect: '/customer',
  },
  {
    role: 'dispatcher' as Role,
    email: 'dispatcher@fieldroute.com',
    icon: Truck,
    color: '#7C3AED',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    label: 'Dispatcher',
    tagline: 'Assign the right tech, fast',
    bullets: [
      'View all incoming jobs at a glance',
      'AI pre-classifies by service type',
      'Assign technicians based on skills',
      'Advance jobs through the pipeline',
    ],
    redirect: '/dispatcher',
  },
  {
    role: 'technician' as Role,
    email: 'technician@fieldroute.com',
    icon: Wrench,
    color: '#16A34A',
    bg: 'bg-green-50',
    border: 'border-green-200',
    label: 'Technician',
    tagline: 'See your jobs, update on the go',
    bullets: [
      'Clear view of your assigned jobs',
      'One-tap status updates (en route → done)',
      'Access customer address & job notes',
      'Inventory lookup for parts needed',
    ],
    redirect: '/technician/job',
  },
  {
    role: 'admin' as Role,
    email: 'admin@fieldroute.com',
    icon: ShieldCheck,
    color: '#EA580C',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    label: 'Admin',
    tagline: 'Full control & oversight',
    bullets: [
      'Dashboard: jobs, techs, stock at a glance',
      'Manage technician applications',
      'Inventory & low-stock alerts',
      'Review AI classification logs',
    ],
    redirect: '/',
  },
]

const PIPELINE = [
  { icon: FileText,     label: 'Customer Submits',   color: '#2563EB' },
  { icon: BrainCircuit, label: 'AI Classifies',      color: '#7C3AED' },
  { icon: Truck,        label: 'Dispatcher Assigns', color: '#0891B2' },
  { icon: CheckCircle,  label: 'Tech Completes',     color: '#16A34A' },
]

const FEATURES = [
  { icon: BrainCircuit, color: '#7C3AED', title: 'AI Classification', desc: 'Anthropic Claude reads the job description and picks the right service category automatically.' },
  { icon: MapPin,       color: '#2563EB', title: 'Real-Time Tracking', desc: 'Customers follow their job through every status: assigned, en route, and done. No phone tag needed.' },
  { icon: Clock,        color: '#0891B2', title: 'Smart Scheduling',   desc: 'Dispatchers see technician availability and skill sets side-by-side for fast, accurate assignment.' },
  { icon: Package,      color: '#16A34A', title: 'Inventory Control',  desc: 'Parts stock tracked per job. Low-stock alerts surface before a technician runs dry on site.' },
  { icon: BarChart3,    color: '#EA580C', title: 'Admin Dashboard',    desc: 'Live KPIs for jobs, active techs, and stock levels. Everything ops needs in one view.' },
  { icon: ShieldCheck,  color: '#0F766E', title: 'Role-Based Access',  desc: 'Four distinct portals: customers, dispatchers, technicians, and admins each see only what they need.' },
]

const STACK = ['FastAPI', 'PostgreSQL', 'React', 'TypeScript', 'Tailwind CSS', 'Docker', 'Anthropic AI']

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function landingFor(role: Role, status: ApplicationStatus | null | undefined): string {
  switch (role) {
    case 'admin':      return '/dashboard'
    case 'dispatcher': return '/dispatcher'
    case 'technician': return status === 'approved' ? '/technician/job' : '/application-status'
    case 'customer':   return '/customer'
    default:           return '/dashboard'
  }
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState<Role | null>(null)
  const [error, setError]     = useState<string | null>(null)

  async function tryAs(role: Role, email: string) {
    setLoading(role)
    setError(null)
    try {
      const res = await loginApi({ email, password: 'demo1234' })
      login(res.access_token, {
        id:    res.user_id,
        email,
        name:  email,
        role:  res.role,
        applicationStatus: res.application_status,
      })
      navigate(landingFor(res.role, res.application_status))
    } catch {
      setError('Demo login failed — make sure the backend is running.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ── Navbar ──────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-white/10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">FieldRoute</span>
          </div>
          <button
            onClick={() => navigate('/login')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors border border-white/20"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </button>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 55%, #1D4ED8 100%)' }}
        className="py-28 px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-blue-200 text-sm font-medium mb-6 border border-white/20">
            <BrainCircuit className="w-3.5 h-3.5" /> AI-Powered · Full Stack · Live Demo
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight">
            Field Service,<br />
            <span className="text-blue-400">Intelligently</span> Managed.
          </h1>

          <p className="text-lg text-blue-200 mt-6 max-w-2xl mx-auto leading-relaxed">
            FieldRoute is a multi-role field service management platform. Customers
            submit jobs, AI classifies them, dispatchers assign technicians, and
            everyone tracks progress in real time.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <button
              onClick={() => tryAs('dispatcher', 'dispatcher@fieldroute.com')}
              disabled={!!loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading === 'dispatcher'
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Truck className="w-4 h-4" />}
              Try Dispatcher View <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => tryAs('customer', 'customer@fieldroute.com')}
              disabled={!!loading}
              className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 disabled:opacity-60 text-white font-semibold rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              {loading === 'customer'
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <UserCheck className="w-4 h-4" />}
              Try Customer View
            </button>
          </div>

          {error && (
            <p className="mt-4 text-red-300 text-sm">{error}</p>
          )}
        </motion.div>
      </section>

      {/* ── How it works ────────────────────────────────────────────── */}
      <section className="bg-slate-900 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-slate-400 text-sm font-semibold uppercase tracking-widest mb-10">
            How FieldRoute Works
          </p>
          <motion.div
            className="flex items-start justify-center gap-0 flex-wrap"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {PIPELINE.map((step, i) => (
              <motion.div key={step.label} variants={fadeUp} className="flex items-center">
                <div className="flex flex-col items-center px-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: step.color + '22', border: `1.5px solid ${step.color}44` }}
                  >
                    <step.icon className="w-7 h-7" style={{ color: step.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-300 mt-3 text-center max-w-[90px] leading-tight">
                    {step.label}
                  </span>
                </div>
                {i < PIPELINE.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-slate-600 mb-4 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Role cards ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900">
              One Platform, Four Portals
            </h2>
            <p className="text-slate-500 mt-3 max-w-xl mx-auto">
              Click any role below to instantly launch a live demo. No sign-up needed.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {DEMO_ROLES.map(r => (
              <motion.div
                key={r.role}
                variants={fadeUp}
                className={`bg-white rounded-2xl border ${r.border} shadow-sm p-6 flex flex-col hover:shadow-md transition-shadow`}
              >
                <div className={`w-12 h-12 rounded-xl ${r.bg} flex items-center justify-center`}>
                  <r.icon className="w-6 h-6" style={{ color: r.color }} />
                </div>

                <h3 className="text-lg font-bold text-slate-900 mt-4">{r.label}</h3>
                <p className="text-xs font-semibold mt-0.5" style={{ color: r.color }}>
                  {r.tagline}
                </p>

                <ul className="mt-4 space-y-2 flex-1">
                  {r.bullets.map(b => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle className="w-4 h-4 mt-0.5 flex-shrink-0 text-slate-400" />
                      {b}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => tryAs(r.role, r.email)}
                  disabled={!!loading}
                  className="mt-6 w-full py-2.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
                  style={{
                    backgroundColor: r.color + '15',
                    color: r.color,
                    border: `1.5px solid ${r.color}33`,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = r.color + '25' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = r.color + '15' }}
                >
                  {loading === r.role
                    ? <span className="w-4 h-4 border-2 border-current/40 border-t-current rounded-full animate-spin" />
                    : <ArrowRight className="w-4 h-4" />}
                  Try as {r.label}
                </button>
              </motion.div>
            ))}
          </motion.div>

          <p className="text-center text-slate-400 text-xs mt-8">
            All demo accounts use password <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-600">demo1234</code>
            &nbsp;· or <button onClick={() => navigate('/login')} className="text-blue-500 hover:underline">sign in</button> with your own account
          </p>
        </div>
      </section>

      {/* ── Feature grid ────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900">Built to Impress</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto">
              Every feature is production-grade: auth, roles, real-time state, AI, inventory, and more.
            </p>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {FEATURES.map(f => (
              <motion.div key={f.title} variants={fadeUp} className="flex gap-4 p-5 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-sm transition-all">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: f.color + '18' }}
                >
                  <f.icon className="w-5 h-5" style={{ color: f.color }} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">{f.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Tech stack ──────────────────────────────────────────────── */}
      <section className="py-12 px-6 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-6">
            Built with
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {STACK.map(tech => (
              <span
                key={tech}
                className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-medium shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer CTA ──────────────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1D4ED8 100%)' }}
        className="py-20 px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          <h2 className="text-3xl font-extrabold text-white">
            Ready to explore?
          </h2>
          <p className="text-blue-200 mt-3 max-w-md mx-auto">
            Pick a role above and click Try. You'll be live in the app in under two seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <button
              onClick={() => tryAs('dispatcher', 'dispatcher@fieldroute.com')}
              disabled={!!loading}
              className="w-full sm:w-auto px-6 py-3 bg-blue-500 hover:bg-blue-400 disabled:opacity-60 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading === 'dispatcher'
                ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                : <Truck className="w-4 h-4" />}
              Launch Dispatcher
            </button>
            <button
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign In
            </button>
          </div>
        </motion.div>
      </section>

      <footer className="bg-slate-950 py-6 px-6 text-center">
        <p className="text-slate-500 text-sm">
          FieldRoute · Portfolio Project · FastAPI + React + PostgreSQL
        </p>
      </footer>

    </div>
  )
}
