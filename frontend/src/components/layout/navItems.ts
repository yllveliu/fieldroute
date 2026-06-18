import { LayoutDashboard, Users, Truck, Wrench, Package, Briefcase, Sparkles, ClipboardCheck, type LucideIcon } from 'lucide-react'
import type { AuthUser } from '@/context/AuthContext'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  // When set, the item only shows for users with this role. Items without a
  // role are visible to everyone (unchanged behaviour).
  role?: AuthUser['role']
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',   path: '/',               icon: LayoutDashboard                       },
  { label: 'Dispatcher',  path: '/dispatcher',     icon: Truck                                 },
  { label: 'Technicians', path: '/technicians',    icon: Wrench                                 },
  { label: 'My Job',      path: '/technician/job', icon: ClipboardCheck, role: 'technician'    },
  { label: 'Jobs',        path: '/jobs',           icon: Briefcase                              },
  { label: 'Inventory',   path: '/inventory',      icon: Package                                },
  { label: 'Customers',   path: '/customer',       icon: Users                                  },
  { label: 'AI',          path: '/ai',             icon: Sparkles                               },
]

// Items visible to the given user. Role-less items always show; role-gated
// items show only when the user's role matches.
export function visibleNavItems(role: AuthUser['role'] | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.role || item.role === role)
}
