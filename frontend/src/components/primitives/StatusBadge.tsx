import { getStatusConfig } from '@/data'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const isActive = status === 'en_route' || status === 'assigned'
  const pulse = isActive ? 'animate-[fr-status-pulse_2s_ease-in-out_infinite]' : ''
  const sizeClass = size === 'sm'
    ? 'px-2 py-0.5 text-xs'
    : 'px-3 py-1 text-sm'

  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className={`inline-flex items-center font-medium rounded-full ${config.bgClass} ${config.textClass} ${sizeClass} ${pulse}`}
    >
      {config.label}
    </span>
  )
}
