import { LayoutDashboard, Truck, Wrench, Package, Sparkles, ClipboardCheck, ShieldCheck, FileText, Users, MapPin, type LucideIcon } from 'lucide-react'
import type { Role } from '@/context/AuthContext'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
  // Roles allowed to see the item. Omit to show for every logged-in user.
  roles?: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  // Admin
  { label: 'Dashboard',    path: '/',                   icon: LayoutDashboard, roles: ['admin']      },
  { label: 'Applications', path: '/admin/applications', icon: FileText,        roles: ['admin']      },
  { label: 'Admin',        path: '/admin',              icon: ShieldCheck,     roles: ['admin']      },
  // Dispatcher
  { label: 'Dispatcher',   path: '/dispatcher',         icon: Truck,           roles: ['dispatcher'] },
  { label: 'Technicians',  path: '/technicians',        icon: Wrench,          roles: ['dispatcher'] },
  { label: 'AI',           path: '/ai',                 icon: Sparkles,        roles: ['dispatcher'] },
  // Technician
  { label: 'My Job',       path: '/technician/job',     icon: ClipboardCheck,  roles: ['technician'] },
  { label: 'Inventory',    path: '/inventory',          icon: Package,         roles: ['technician'] },
  // Customer (technicians can also request/track services with their own account)
  { label: 'New Request',  path: '/customer',           icon: Users,           roles: ['customer', 'technician'] },
  { label: 'Track',        path: '/track',              icon: MapPin,          roles: ['customer', 'technician'] },
]

// Items visible to the given role. Role-less items always show; role-gated
// items show only when the user's role is in the allowed list.
export function visibleNavItems(role: Role | undefined): NavItem[] {
  return NAV_ITEMS.filter((item) => !item.roles || (role !== undefined && item.roles.includes(role)))
}
