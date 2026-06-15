import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: 'up' | 'down' | 'neutral'
}

export function StatCard({ title, value, subtitle, icon: Icon, trend }: StatCardProps) {
  const trendColor =
    trend === 'up'   ? 'text-green-600' :
    trend === 'down' ? 'text-red-600'   :
                       'text-slate-500'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="bg-white rounded-lg p-4 shadow-sm border border-slate-200"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div className="p-1.5 rounded-md bg-slate-50">
            <Icon className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      {subtitle && (
        <p className={`text-xs mt-1 ${trendColor}`}>{subtitle}</p>
      )}
    </motion.div>
  )
}
