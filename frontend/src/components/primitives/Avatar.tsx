interface AvatarProps {
  name: string
  status?: string
  size?: 'sm' | 'md' | 'lg'
}

export function Avatar({ name, status, size = 'md' }: AvatarProps) {
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('')

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
  }

  const dotColor =
    status === 'available' ? 'bg-green-400' :
    status === 'on_job'    ? 'bg-amber-400' :
                             'bg-slate-300'

  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5'

  return (
    <div className="relative inline-flex">
      <div
        className={`${sizeClasses[size]} rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold`}
      >
        {initials}
      </div>
      {status && (
        <span
          className={`absolute bottom-0 right-0 ${dotSize} ${dotColor} rounded-full ring-1 ring-white`}
        />
      )}
    </div>
  )
}
