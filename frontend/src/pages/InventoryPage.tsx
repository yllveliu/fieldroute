import { useState, useEffect } from 'react'
import { getParts } from '@/api'
import type { Part } from '@/api'
import { PageHeader } from '@/components/layout'
import { EmptyState } from '@/components/primitives'
import { InventoryCard } from '@/components/domain'
import { MOCK_PARTS } from '@/data/mockData'

export default function InventoryPage() {
  const [parts, setParts]               = useState<Part[]>([])
  const [loading, setLoading]           = useState(true)
  const [search, setSearch]             = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  useEffect(() => {
    getParts()
      .then(setParts)
      .catch(() => setParts(MOCK_PARTS)) // network error only
      .finally(() => setLoading(false))
  }, [])

  const query = search.trim().toLowerCase()
  const filtered = parts
    .filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.sku.toLowerCase().includes(query)
    )
    .filter(p =>
      !lowStockOnly ||
      p.stock_quantity <= (p.low_stock_threshold ?? 5)
    )

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
      <PageHeader
        title="Inventory"
        subtitle="Monitor parts stock levels and identify low-stock items."
      />

      {/* Search + low-stock toggle */}
      <div className="flex flex-wrap gap-3 items-center mt-6">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or SKU…"
          className="flex-1 min-w-[200px] px-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={e => setLowStockOnly(e.target.checked)}
            className="w-4 h-4 accent-orange-500"
          />
          Low-stock only
        </label>
      </div>

      {/* Parts grid */}
      {loading ? (
        <p className="text-slate-500 mt-8 text-sm">Loading inventory…</p>
      ) : filtered.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No parts match the current filters." />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-4">
          {filtered.map(part => (
            <InventoryCard key={part.id} part={part} />
          ))}
        </div>
      )}
    </div>
  )
}
