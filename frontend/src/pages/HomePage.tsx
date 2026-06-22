import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Zap, ArrowRight,
  Users, Briefcase, Package, AlertTriangle,
  UserCheck, Truck, Wrench,
  FileText, BrainCircuit, CheckCircle, ChevronRight,
} from 'lucide-react'
import { StatCard } from '@/components/primitives'
import { MOCK_JOBS, MOCK_TECHNICIANS, MOCK_PARTS } from '@/data'

const ACTORS = [
  {
    icon: UserCheck,
    color: '#2563EB',
    bg: 'bg-blue-50',
    title: 'Customer',
    description:
      'Submit a service request and track your job status in real time. ' +
      'Get ETA updates and see which technician is assigned.',
    cta: 'Customer View',
    path: '/customer',
  },
  {
    icon: Truck,
    color: '#8B5CF6',
    bg: 'bg-violet-50',
    title: 'Dispatcher',
    description:
      'Review AI-classified jobs, assign the right technician, ' +
      'and advance job status through the pipeline.',
    cta: 'Dispatcher View',
    path: '/dispatcher',
  },
  {
    icon: Wrench,
    color: '#16A34A',
    bg: 'bg-green-50',
    title: 'Technician',
    description:
      'See your assigned jobs, update status on arrival, ' +
      'and mark work complete when the job is done.',
    cta: 'Technician View',
    path: '/technicians',
  },
]

const PIPELINE_STEPS = [
  { icon: FileText,     label: 'Customer Requests',    color: '#2563EB' },
  { icon: BrainCircuit, label: 'AI Categorizes',       color: '#8B5CF6' },
  { icon: Truck,        label: 'Dispatcher Assigns',   color: '#06B6D4' },
  { icon: CheckCircle,  label: 'Technician Completes', color: '#16A34A' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.35 } },
}

export default function HomePage() {
  const navigate = useNavigate()

  const totalJobs      = MOCK_JOBS.length
  const activeJobs     = MOCK_JOBS.filter(j => j.status !== 'done' && j.status !== 'cancelled').length
  const availableTechs = MOCK_TECHNICIANS.filter(t => t.status === 'available').length
  const lowStockParts  = MOCK_PARTS.filter(
    p => (p.stock_quantity - p.reserved_qty) <= p.low_stock_threshold
  ).length

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ── Section 1: Hero ─────────────────────────────────────────── */}
      <section
        style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A5F 60%, #1E40AF 100%)' }}
        className="py-24 px-6 text-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 text-blue-200 text-sm font-medium mb-6 border border-white/20">
            <Zap className="w-3.5 h-3.5" />
            FieldRoute v2 — Sprint 2
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">
            Smart Dispatch,<br />Faster Service.
          </h1>

          <p className="text-lg text-blue-200 mt-4 max-w-lg mx-auto leading-relaxed">
            AI-powered field service management — classify jobs, assign
            technicians, and track every step in real time.
          </p>

          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            <button
              onClick={() => navigate('/dispatcher')}
              className="w-full md:w-auto min-h-[44px] px-6 py-3 bg-blue-500 hover:bg-blue-400 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              Go to Dispatcher <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/jobs')}
              className="w-full md:w-auto min-h-[44px] px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl border border-white/20 flex items-center justify-center gap-2 transition-colors"
            >
              Track a Job
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Section 2: Stats ────────────────────────────────────────── */}
      <section className="bg-white border-b border-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-10 px-4 md:px-8 max-w-5xl mx-auto pb-10">
          <StatCard title="Total Jobs"      value={totalJobs}      icon={Briefcase}     />
          <StatCard title="Active Jobs"     value={activeJobs}     icon={Users}         trend="up" />
          <StatCard title="Available Techs" value={availableTechs} icon={Package}       trend="neutral" />
          <StatCard
            title="Low Stock Parts"
            value={lowStockParts}
            icon={AlertTriangle}
            trend={lowStockParts > 0 ? 'down' : 'neutral'}
          />
        </div>
      </section>

      {/* ── Section 3: Actor cards ───────────────────────────────────── */}
      <section className="py-16 px-6 bg-slate-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
            Built for Every Role
          </h2>
          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {ACTORS.map(actor => (
              <motion.div
                key={actor.title}
                variants={item}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col"
              >
                <div className={`w-12 h-12 rounded-xl ${actor.bg} flex items-center justify-center`}>
                  <actor.icon className="w-6 h-6" style={{ color: actor.color }} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mt-4">{actor.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed flex-1">
                  {actor.description}
                </p>
                <button
                  onClick={() => navigate(actor.path)}
                  className="mt-6 px-4 py-2 text-sm font-semibold rounded-xl border-2 transition-opacity hover:opacity-75"
                  style={{ borderColor: actor.color, color: actor.color }}
                >
                  {actor.cta}
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Section 4: Pipeline strip ────────────────────────────────── */}
      <section className="bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto py-12 px-6">
          <h2 className="text-2xl font-bold text-center mb-10">
            How FieldRoute Works
          </h2>
          <motion.div
            className="flex items-center justify-center gap-0 flex-wrap"
            variants={container}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
          >
            {PIPELINE_STEPS.map((step, i) => (
              <motion.div key={step.label} variants={item} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: step.color + '26' }}
                  >
                    <step.icon className="w-6 h-6" style={{ color: step.color }} />
                  </div>
                  <span className="text-sm font-medium text-slate-300 mt-2 text-center max-w-[80px]">
                    {step.label}
                  </span>
                </div>
                {i < PIPELINE_STEPS.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-slate-500 mx-2 mb-4 flex-shrink-0" />
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    </div>
  )
}
