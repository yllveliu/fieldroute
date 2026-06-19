import { useState, useEffect, useCallback } from 'react'
import type { FormEvent } from 'react'
import { Wrench, Package, Plus, Pencil, Trash2, AlertCircle } from 'lucide-react'
import { getTechnicians } from '@/api/technicians'
import type { Technician } from '@/api/technicians'
import { getParts } from '@/api/parts'
import type { Part } from '@/api/parts'
import {
  adminCreateTechnician,
  adminUpdateTechnician,
  adminDeleteTechnician,
  adminCreatePart,
  adminUpdatePart,
} from '@/api/admin'
import { ApiError } from '@/api'
import { Toast } from '@/components/primitives/Toast'
import type { ToastVariant } from '@/components/primitives/Toast'
import { EmptyState } from '@/components/primitives/EmptyState'

// ── Local form shapes ─────────────────────────────────────────────────────────

interface TechFormState {
  name: string
  skills: string   // comma-separated → parsed to string[] on submit
  status: 'available' | 'on_job' | 'offline'
}

interface PartAddFormState {
  name: string
  sku: string
  stock_quantity: string
  reserved_qty: string
  low_stock_threshold: string
}

interface PartEditFormState {
  stock_quantity: string
  reserved_qty: string
  low_stock_threshold: string
}

const BLANK_TECH: TechFormState = { name: '', skills: '', status: 'available' }

function blankPartAdd(): PartAddFormState {
  return { name: '', sku: '', stock_quantity: '0', reserved_qty: '0', low_stock_threshold: '0' }
}

function techToForm(t: Technician): TechFormState {
  return {
    name: t.name,
    skills: t.skills.join(', '),
    status: (t.status as TechFormState['status']) ?? 'available',
  }
}

function partToEditForm(p: Part): PartEditFormState {
  return {
    stock_quantity:    String(p.stock_quantity),
    reserved_qty:      String(p.reserved_qty),
    low_stock_threshold: String(p.low_stock_threshold),
  }
}

function parseSkills(raw: string): string[] {
  return raw.split(',').map(s => s.trim()).filter(Boolean)
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminConsolePage() {
  const [tab, setTab] = useState<'technicians' | 'parts'>('technicians')

  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [parts, setParts]             = useState<Part[]>([])
  const [loading, setLoading]         = useState(true)
  const [fetchError, setFetchError]   = useState<string | null>(null)

  const [toast, setToast] = useState<{ message: string; variant: ToastVariant; visible: boolean }>({
    message: '', variant: 'success', visible: false,
  })

  // Technicians UI
  const [addTechOpen, setAddTechOpen]     = useState(false)
  const [techForm, setTechForm]           = useState<TechFormState>(BLANK_TECH)
  const [editTechId, setEditTechId]       = useState<number | null>(null)
  const [editTechForm, setEditTechForm]   = useState<TechFormState>(BLANK_TECH)
  const [deactivateId, setDeactivateId]   = useState<number | null>(null)
  const [submittingTech, setSubmittingTech] = useState(false)
  const [techFormError, setTechFormError] = useState<string | null>(null)

  // Parts UI
  const [addPartOpen, setAddPartOpen]     = useState(false)
  const [partAddForm, setPartAddForm]     = useState<PartAddFormState>(blankPartAdd())
  const [editPartId, setEditPartId]       = useState<number | null>(null)
  const [editPartForm, setEditPartForm]   = useState<PartEditFormState>({
    stock_quantity: '0', reserved_qty: '0', low_stock_threshold: '0',
  })
  const [submittingPart, setSubmittingPart] = useState(false)
  const [partFormError, setPartFormError] = useState<string | null>(null)

  function showToast(message: string, variant: ToastVariant) {
    setToast({ message, variant, visible: true })
    setTimeout(() => setToast(t => ({ ...t, visible: false })), 4000)
  }

  const loadData = useCallback(async () => {
    setLoading(true)
    setFetchError(null)
    try {
      const [techs, prts] = await Promise.all([getTechnicians(), getParts()])
      setTechnicians(techs)
      setParts(prts)
    } catch {
      setFetchError('Failed to load data. Make sure the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  // ── Technician handlers ───────────────────────────────────────────────────

  async function handleAddTech(e: FormEvent) {
    e.preventDefault()
    setTechFormError(null)
    if (!techForm.name.trim()) { setTechFormError('Name is required.'); return }
    setSubmittingTech(true)
    try {
      await adminCreateTechnician({
        name:   techForm.name.trim(),
        skills: parseSkills(techForm.skills),
        status: techForm.status,
      })
      setAddTechOpen(false)
      setTechForm(BLANK_TECH)
      await loadData()
      showToast('Technician added.', 'success')
    } catch (err) {
      setTechFormError(err instanceof ApiError ? err.message : 'Failed to add technician.')
    } finally {
      setSubmittingTech(false)
    }
  }

  async function handleEditTech(e: FormEvent) {
    e.preventDefault()
    if (editTechId === null) return
    setTechFormError(null)
    if (!editTechForm.name.trim()) { setTechFormError('Name is required.'); return }
    setSubmittingTech(true)
    try {
      await adminUpdateTechnician(editTechId, {
        name:   editTechForm.name.trim(),
        skills: parseSkills(editTechForm.skills),
        status: editTechForm.status,
      })
      setEditTechId(null)
      await loadData()
      showToast('Technician updated.', 'success')
    } catch (err) {
      setTechFormError(err instanceof ApiError ? err.message : 'Failed to update technician.')
    } finally {
      setSubmittingTech(false)
    }
  }

  async function handleDeactivate(id: number) {
    setSubmittingTech(true)
    try {
      await adminDeleteTechnician(id)
      setDeactivateId(null)
      await loadData()
      showToast('Technician deactivated.', 'success')
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to deactivate technician.', 'error')
    } finally {
      setSubmittingTech(false)
    }
  }

  // ── Part handlers ─────────────────────────────────────────────────────────

  async function handleAddPart(e: FormEvent) {
    e.preventDefault()
    setPartFormError(null)
    if (!partAddForm.name.trim() || !partAddForm.sku.trim()) {
      setPartFormError('Name and SKU are required.')
      return
    }
    setSubmittingPart(true)
    try {
      await adminCreatePart({
        name:                partAddForm.name.trim(),
        sku:                 partAddForm.sku.trim(),
        stock_quantity:      parseInt(partAddForm.stock_quantity)      || 0,
        reserved_qty:        parseInt(partAddForm.reserved_qty)        || 0,
        low_stock_threshold: parseInt(partAddForm.low_stock_threshold) || 0,
      })
      setAddPartOpen(false)
      setPartAddForm(blankPartAdd())
      await loadData()
      showToast('Part added.', 'success')
    } catch (err) {
      setPartFormError(err instanceof ApiError ? err.message : 'Failed to add part.')
    } finally {
      setSubmittingPart(false)
    }
  }

  async function handleEditPart(e: FormEvent) {
    e.preventDefault()
    if (editPartId === null) return
    setPartFormError(null)
    setSubmittingPart(true)
    try {
      await adminUpdatePart(editPartId, {
        stock_quantity:      parseInt(editPartForm.stock_quantity)      || 0,
        reserved_qty:        parseInt(editPartForm.reserved_qty)        || 0,
        low_stock_threshold: parseInt(editPartForm.low_stock_threshold) || 0,
      })
      setEditPartId(null)
      await loadData()
      showToast('Part updated.', 'success')
    } catch (err) {
      setPartFormError(err instanceof ApiError ? err.message : 'Failed to update part.')
    } finally {
      setSubmittingPart(false)
    }
  }

  // ── Shared style constants ────────────────────────────────────────────────

  const inputCls = 'px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition'
  const btnPrimary = 'px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
  const btnGhost   = 'px-3 py-1.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors'

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Toast
        message={toast.message}
        variant={toast.variant}
        visible={toast.visible}
        onClose={() => setToast(t => ({ ...t, visible: false }))}
      />

      <div>
        <h1 className="text-xl font-bold text-slate-900">Admin Console</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage technicians and parts inventory</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-slate-200">
        {(['technicians', 'parts'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {t === 'technicians' ? <Wrench className="w-4 h-4" /> : <Package className="w-4 h-4" />}
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Fetch error */}
      {!loading && fetchError && (
        <div className="flex items-start gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>{fetchError}</span>
        </div>
      )}

      {/* ─── TECHNICIANS TAB ─────────────────────────────────────────────── */}
      {!loading && !fetchError && tab === 'technicians' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {technicians.length} technician{technicians.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                setAddTechOpen(o => !o)
                setTechForm(BLANK_TECH)
                setTechFormError(null)
                setEditTechId(null)
              }}
              className={`${btnPrimary} flex items-center gap-1.5`}
            >
              <Plus className="w-4 h-4" />
              Add Technician
            </button>
          </div>

          {/* Add form */}
          {addTechOpen && (
            <form
              onSubmit={handleAddTech}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
            >
              <p className="text-sm font-semibold text-slate-700">New Technician</p>
              {techFormError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {techFormError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <input
                  required
                  placeholder="Full name"
                  value={techForm.name}
                  onChange={e => setTechForm(f => ({ ...f, name: e.target.value }))}
                  className={`${inputCls} w-full`}
                />
                <input
                  placeholder="Skills (comma-separated)"
                  value={techForm.skills}
                  onChange={e => setTechForm(f => ({ ...f, skills: e.target.value }))}
                  className={`${inputCls} w-full`}
                />
                <select
                  value={techForm.status}
                  onChange={e => setTechForm(f => ({ ...f, status: e.target.value as TechFormState['status'] }))}
                  className={`${inputCls} w-full`}
                >
                  <option value="available">Available</option>
                  <option value="on_job">On Job</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setAddTechOpen(false)} className={btnGhost}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingTech} className={btnPrimary}>
                  {submittingTech ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* List */}
          {technicians.length === 0 ? (
            <EmptyState
              icon={Wrench}
              title="No technicians yet"
              description="Add your first technician above."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    {['Name', 'Skills', 'Status', 'Current Job', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {technicians.map(tech => {
                    if (editTechId === tech.id) {
                      return (
                        <tr key={tech.id} className="bg-blue-50">
                          <td colSpan={5} className="px-4 py-3">
                            <form onSubmit={handleEditTech} className="space-y-3">
                              {techFormError && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  {techFormError}
                                </div>
                              )}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <input
                                  required
                                  placeholder="Full name"
                                  value={editTechForm.name}
                                  onChange={e => setEditTechForm(f => ({ ...f, name: e.target.value }))}
                                  className={`${inputCls} w-full`}
                                />
                                <input
                                  placeholder="Skills (comma-separated)"
                                  value={editTechForm.skills}
                                  onChange={e => setEditTechForm(f => ({ ...f, skills: e.target.value }))}
                                  className={`${inputCls} w-full`}
                                />
                                <select
                                  value={editTechForm.status}
                                  onChange={e => setEditTechForm(f => ({ ...f, status: e.target.value as TechFormState['status'] }))}
                                  className={`${inputCls} w-full`}
                                >
                                  <option value="available">Available</option>
                                  <option value="on_job">On Job</option>
                                  <option value="offline">Offline</option>
                                </select>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => { setEditTechId(null); setTechFormError(null) }}
                                  className={btnGhost}
                                >
                                  Cancel
                                </button>
                                <button type="submit" disabled={submittingTech} className={btnPrimary}>
                                  {submittingTech ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )
                    }

                    if (deactivateId === tech.id) {
                      return (
                        <tr key={tech.id} className="bg-red-50">
                          <td colSpan={5} className="px-4 py-3">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm text-red-700">
                                Deactivate <strong>{tech.name}</strong>? This cannot be undone.
                              </span>
                              <div className="flex gap-2 shrink-0">
                                <button
                                  onClick={() => setDeactivateId(null)}
                                  className={btnGhost}
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => handleDeactivate(tech.id)}
                                  disabled={submittingTech}
                                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                                >
                                  {submittingTech ? 'Removing…' : 'Yes, deactivate'}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )
                    }

                    return (
                      <tr key={tech.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">{tech.name}</td>
                        <td className="px-4 py-3">
                          {tech.skills.length > 0
                            ? tech.skills.map(s => (
                                <span
                                  key={s}
                                  className="inline-block mr-1 mb-0.5 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600"
                                >
                                  {s}
                                </span>
                              ))
                            : <span className="text-slate-400">—</span>
                          }
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            tech.status === 'available' ? 'bg-green-100 text-green-700' :
                            tech.status === 'on_job'    ? 'bg-amber-100 text-amber-700' :
                                                          'bg-slate-100 text-slate-600'
                          }`}>
                            {tech.status === 'on_job'
                              ? 'On Job'
                              : tech.status.charAt(0).toUpperCase() + tech.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-slate-500">
                          {tech.current_job != null ? `Job #${tech.current_job}` : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => {
                                setEditTechId(tech.id)
                                setEditTechForm(techToForm(tech))
                                setTechFormError(null)
                                setDeactivateId(null)
                                setAddTechOpen(false)
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => { setDeactivateId(tech.id); setEditTechId(null) }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Deactivate"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── PARTS TAB ───────────────────────────────────────────────────── */}
      {!loading && !fetchError && tab === 'parts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {parts.length} part{parts.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => {
                setAddPartOpen(o => !o)
                setPartAddForm(blankPartAdd())
                setPartFormError(null)
                setEditPartId(null)
              }}
              className={`${btnPrimary} flex items-center gap-1.5`}
            >
              <Plus className="w-4 h-4" />
              Add Part
            </button>
          </div>

          {/* Add form */}
          {addPartOpen && (
            <form
              onSubmit={handleAddPart}
              className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3"
            >
              <p className="text-sm font-semibold text-slate-700">New Part</p>
              {partFormError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {partFormError}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  placeholder="Part name"
                  value={partAddForm.name}
                  onChange={e => setPartAddForm(f => ({ ...f, name: e.target.value }))}
                  className={`${inputCls} w-full`}
                />
                <input
                  required
                  placeholder="SKU (e.g. SKU-PVC-001)"
                  value={partAddForm.sku}
                  onChange={e => setPartAddForm(f => ({ ...f, sku: e.target.value }))}
                  className={`${inputCls} w-full`}
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Stock Qty</label>
                  <input
                    type="number" min="0"
                    value={partAddForm.stock_quantity}
                    onChange={e => setPartAddForm(f => ({ ...f, stock_quantity: e.target.value }))}
                    className={`${inputCls} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Reserved Qty</label>
                  <input
                    type="number" min="0"
                    value={partAddForm.reserved_qty}
                    onChange={e => setPartAddForm(f => ({ ...f, reserved_qty: e.target.value }))}
                    className={`${inputCls} w-full`}
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Low Stock Threshold</label>
                  <input
                    type="number" min="0"
                    value={partAddForm.low_stock_threshold}
                    onChange={e => setPartAddForm(f => ({ ...f, low_stock_threshold: e.target.value }))}
                    className={`${inputCls} w-full`}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setAddPartOpen(false)} className={btnGhost}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingPart} className={btnPrimary}>
                  {submittingPart ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          )}

          {/* List */}
          {parts.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No parts yet"
              description="Add your first part above."
            />
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left  px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</th>
                    <th className="text-left  px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">SKU</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stock</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Reserved</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Min. Stock</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parts.map(part => {
                    if (editPartId === part.id) {
                      return (
                        <tr key={part.id} className="bg-blue-50">
                          <td className="px-4 py-3 font-medium text-slate-900">{part.name}</td>
                          <td className="px-4 py-3 text-slate-500 font-mono text-xs">{part.sku}</td>
                          <td colSpan={4} className="px-4 py-3">
                            <form onSubmit={handleEditPart} className="space-y-3">
                              {partFormError && (
                                <div className="flex items-center gap-1.5 text-xs text-red-600">
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                  {partFormError}
                                </div>
                              )}
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Stock Qty</label>
                                  <input
                                    type="number" min="0"
                                    value={editPartForm.stock_quantity}
                                    onChange={e => setEditPartForm(f => ({ ...f, stock_quantity: e.target.value }))}
                                    className={`${inputCls} w-full`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Reserved Qty</label>
                                  <input
                                    type="number" min="0"
                                    value={editPartForm.reserved_qty}
                                    onChange={e => setEditPartForm(f => ({ ...f, reserved_qty: e.target.value }))}
                                    className={`${inputCls} w-full`}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs text-slate-500 mb-1">Low Stock Threshold</label>
                                  <input
                                    type="number" min="0"
                                    value={editPartForm.low_stock_threshold}
                                    onChange={e => setEditPartForm(f => ({ ...f, low_stock_threshold: e.target.value }))}
                                    className={`${inputCls} w-full`}
                                  />
                                </div>
                              </div>
                              <div className="flex gap-2 justify-end">
                                <button
                                  type="button"
                                  onClick={() => { setEditPartId(null); setPartFormError(null) }}
                                  className={btnGhost}
                                >
                                  Cancel
                                </button>
                                <button type="submit" disabled={submittingPart} className={btnPrimary}>
                                  {submittingPart ? 'Saving…' : 'Save'}
                                </button>
                              </div>
                            </form>
                          </td>
                        </tr>
                      )
                    }

                    const isLowStock = part.stock_quantity <= part.low_stock_threshold

                    return (
                      <tr key={part.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-900">
                          {part.name}
                          {isLowStock && (
                            <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded font-medium">
                              Low Stock
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-500 font-mono text-xs">{part.sku}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{part.stock_quantity}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{part.reserved_qty}</td>
                        <td className="px-4 py-3 text-right text-slate-700">{part.low_stock_threshold}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button
                              onClick={() => {
                                setEditPartId(part.id)
                                setEditPartForm(partToEditForm(part))
                                setPartFormError(null)
                                setAddPartOpen(false)
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                              title="Edit stock"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
