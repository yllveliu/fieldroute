export interface StatusConfig {
  label: string
  cssVar: string       // the CSS variable name from KAN-36 :root
  color: string        // resolved hex value for inline styles
  bgClass: string      // Tailwind bg class (approximate match)
  textClass: string    // Tailwind text class
}

export const STATUS_CONFIG: Record<string, StatusConfig> = {
  new: {
    label: 'New',
    cssVar: '--fr-status-new',
    color: '#6366F1',
    bgClass: 'bg-indigo-100',
    textClass: 'text-indigo-700',
  },
  categorized: {
    label: 'Categorized',
    cssVar: '--fr-status-categorized',
    color: '#8B5CF6',
    bgClass: 'bg-violet-100',
    textClass: 'text-violet-700',
  },
  assigned: {
    label: 'Assigned',
    cssVar: '--fr-status-assigned',
    color: '#2563EB',
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-700',
  },
  en_route: {
    label: 'En Route',
    cssVar: '--fr-status-en-route',
    color: '#D97706',
    bgClass: 'bg-amber-100',
    textClass: 'text-amber-700',
  },
  done: {
    label: 'Done',
    cssVar: '--fr-status-done',
    color: '#16A34A',
    bgClass: 'bg-green-100',
    textClass: 'text-green-700',
  },
}

export function getStatusConfig(status: string): StatusConfig {
  return STATUS_CONFIG[status] ?? {
    label: status,
    cssVar: '--fr-muted',
    color: '#64748B',
    bgClass: 'bg-slate-100',
    textClass: 'text-slate-700',
  }
}
