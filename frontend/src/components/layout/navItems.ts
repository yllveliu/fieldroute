import { LayoutDashboard, Users, Truck, Wrench, Package, Briefcase, Sparkles } from 'lucide-react'

export const NAV_ITEMS = [
  { label: 'Dashboard',   path: '/',            icon: LayoutDashboard },
  { label: 'Dispatcher',  path: '/dispatcher',  icon: Truck           },
  { label: 'Technicians', path: '/technicians', icon: Wrench          },
  { label: 'Jobs',        path: '/jobs',        icon: Briefcase       },
  { label: 'Inventory',   path: '/inventory',   icon: Package         },
  { label: 'Customers',   path: '/customer',    icon: Users           },
  { label: 'AI',          path: '/ai',          icon: Sparkles        },
]
