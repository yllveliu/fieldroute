import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { MobileNav } from './MobileNav'

const PAGE_TITLES: Record<string, string> = {
  '/':            'Dashboard',
  '/dispatcher':  'Dispatcher',
  '/technicians': 'Technicians',
  '/jobs':        'Jobs',
  '/inventory':   'Inventory',
  '/customer':    'Customers',
  '/ai':          'AI Classification',
  '/analytics':   'Analytics',
  '/admin':       'Admin Console',
}

export function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'FieldRoute'

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50">
        <TopBar title={title} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">
          <Outlet />
        </main>
      </div>

      <MobileNav />
    </div>
  )
}
