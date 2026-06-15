import { NavLink } from 'react-router-dom'
import { NAV_ITEMS } from './navItems'

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 flex">
      {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          end={path === '/'}
          className={({ isActive }) =>
            `relative flex-1 flex flex-col items-center justify-center py-2 gap-0.5
             text-xs font-medium transition-colors duration-150
             ${isActive ? 'text-blue-600' : 'text-slate-500'}`
          }
        >
          {({ isActive }) => (
            <>
              <Icon className="w-5 h-5" />
              <span>{label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-blue-600 rounded-full" />
              )}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
