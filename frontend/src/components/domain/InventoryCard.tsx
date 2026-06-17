import { AlertTriangle } from 'lucide-react'
import type { Part } from '@/api'

interface InventoryCardProps {
  part: Part
}

export function InventoryCard({ part }: InventoryCardProps) {
  const available = part.stock_quantity - part.reserved_qty
  const isLowStock = available <= part.low_stock_threshold
  const fillPercent = Math.min(100,
    part.stock_quantity > 0
      ? Math.round((available / part.stock_quantity) * 100)
      : 0
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-800 truncate">{part.name}</p>
          <p className="text-xs text-slate-400 font-mono mt-0.5">{part.sku}</p>
        </div>

        {isLowStock && (
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
        )}
      </div>

      {/* Stock numbers */}
      <div className="mt-3 flex items-baseline justify-between text-sm">
        <span>
          <span className={`font-bold text-base ${isLowStock ? 'text-amber-600' : 'text-slate-800'}`}>
            {available}
          </span>
          {' '}
          <span className="text-slate-500">available</span>
        </span>
        <span className="text-xs text-slate-400">{part.reserved_qty} reserved</span>
      </div>

      {/* Stock fill bar */}
      <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${
            isLowStock ? 'bg-amber-400' : 'bg-green-500'
          }`}
          style={{ width: `${fillPercent}%` }}
        />
      </div>

      {isLowStock && (
        <p className="mt-2 text-xs text-amber-600">
          Low stock — threshold: {part.low_stock_threshold}
        </p>
      )}
    </div>
  )
}
