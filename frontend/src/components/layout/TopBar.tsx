import { Bell, Search } from 'lucide-react'

interface TopBarProps {
  title?: string
}

export function TopBar({ title }: TopBarProps) {
  return (
    <header className="h-14 flex items-center gap-4 px-4 bg-white border-b border-slate-200 flex-shrink-0">
      {/* Mobile page title */}
      {title && (
        <h1 className="md:hidden text-base font-semibold text-slate-900 truncate">
          {title}
        </h1>
      )}

      {/* Search bar (desktop) */}
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm bg-slate-100 rounded-lg px-3 py-1.5">
        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
        <span className="text-sm text-slate-400">Search…</span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <button className="min-h-[44px] p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        {/* User avatar placeholder */}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold select-none">
          FR
        </div>
      </div>
    </header>
  )
}
