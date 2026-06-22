import { Check, X } from 'lucide-react'

const STEPS = ['new', 'categorized', 'assigned', 'en_route', 'done'] as const
type Step = typeof STEPS[number]

const STEP_LABELS: Record<Step, string> = {
  new:         'New',
  categorized: 'Categorized',
  assigned:    'Assigned',
  en_route:    'En Route',
  done:        'Done',
}

interface TimelineProps {
  currentStatus: string
}

export function Timeline({ currentStatus }: TimelineProps) {
  const isCancelled = currentStatus === 'cancelled'
  const activeIndex = STEPS.indexOf(currentStatus as Step)

  return (
    <div className="relative flex flex-col md:flex-row items-start">
      {STEPS.map((step, i) => {
        const isCompleted = isCancelled ? false : i < activeIndex
        const isActive    = !isCancelled && i === activeIndex
        const isFuture    = isCancelled ? true : i > activeIndex

        return (
          <div key={step} className="flex flex-col items-center flex-1 min-w-0">
            <div className="flex items-center w-full">
              {/* Node */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                    transition-colors duration-200
                    ${isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                        ? 'bg-blue-600 text-white'
                        : isCancelled && i === activeIndex
                          ? 'bg-red-500 text-white'
                          : 'bg-slate-200 text-slate-400'
                    }
                  `}
                  style={isActive ? { animation: 'fr-node-pulse 1.5s ease-in-out infinite' } : undefined}
                >
                  {isCompleted
                    ? <Check size={14} />
                    : isCancelled && i === STEPS.length - 1
                      ? <X size={14} />
                      : i + 1
                  }
                </div>

                <span
                  className={`mt-1 text-xs text-center leading-tight ${
                    isActive
                      ? 'text-blue-600 font-semibold'
                      : isCompleted
                        ? 'text-green-600 font-medium'
                        : 'text-slate-400'
                  }`}
                >
                  {STEP_LABELS[step]}
                </span>
              </div>

              {/* Connector line (not after last item) */}
              {i < STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 mb-5 ${
                    isCompleted ? 'bg-green-400' : 'bg-slate-200'
                  }`}
                />
              )}
            </div>
          </div>
        )
      })}

      {/* Cancelled label */}
      {isCancelled && (
        <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-medium text-red-500">
          Cancelled
        </span>
      )}
    </div>
  )
}
