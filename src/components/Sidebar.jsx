import { useEffect, useState } from 'react'
import { useUIStore } from '../store/useUIStore'
import { supabase } from '../supabaseClient'
import { Bell, LayoutDashboard, ShoppingCart, Package, UsersRound, ClipboardList, ChartNoAxesCombined, RotateCcw, Tag, Users, Settings, LogOut, Plus, Trash2, Minus, ArrowRight, Menu, Search, X, Pencil, Check, Printer } from 'lucide-react'

const sections = [
  { label: 'MAIN MENU', items: [['Dashboard', 'dashboard'], ['Sales', 'sales'], ['Products', 'products'], ['Customers', 'customers'], ['Orders', 'orders']] },
  { label: 'MANAGEMENT', items: [['Reports', 'reports'], ['Returns', 'returns'], ['Discounts', 'discounts'], ['Users', 'users'], ['Settings', 'settings']] },
]

const icons = {
  dashboard: LayoutDashboard, sales: ShoppingCart, products: Package, customers: UsersRound,
  orders: ClipboardList, reports: ChartNoAxesCombined, returns: RotateCcw, discounts: Tag,
  users: Users, settings: Settings, logout: LogOut,
  plus: Plus, trash: Trash2, minus: Minus, arrow: ArrowRight, menu: Menu, search: Search, bell: Bell, close: X, edit: Pencil, check: Check, print: Printer,
}

export function Icon({ name, size = 20, className = '' }) {
  const LucideIcon = icons[name] || LayoutDashboard
  return <LucideIcon aria-hidden="true" className={className} size={size} strokeWidth={1.8} />
}

export default function Sidebar({ user, onSignOut, mobileOpen = false, onClose }) {
  const activeMenu = useUIStore((state) => state.activeMenu)
  const setActiveMenu = useUIStore((state) => state.setActiveMenu)
  const [storeName, setStoreName] = useState('')
  const [storeLoading, setStoreLoading] = useState(true)

  useEffect(() => {
    let active = true
    const loadStoreName = async () => {
      const { data } = await supabase
        .from('store_settings')
        .select('store_name')
        .limit(1)
        .maybeSingle()
      if (active) {
        setStoreName(data?.store_name?.trim() || '')
        setStoreLoading(false)
      }
    }
    loadStoreName().catch(() => { if (active) setStoreLoading(false) })
    return () => { active = false }
  }, [])

  const displayStoreName = storeName || (storeLoading ? 'PosU' : 'Toko Saya')
  return <>
    {mobileOpen && <button aria-label="Close navigation" onClick={onClose} className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden" />}
    <aside className={`fixed inset-y-0 left-0 z-50 flex h-screen w-[252px] flex-col gap-3 overflow-hidden bg-[#073833] p-3 text-white transition-transform lg:sticky lg:top-0 lg:z-auto lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="flex shrink-0 items-center gap-3 px-2 py-1">
        <img src="/icon-192.png" alt="Logo PosU" className="h-10 w-10 rounded-xl object-cover shadow-sm" />
        <p title={displayStoreName} className="max-w-[164px] truncate text-sm font-bold tracking-tight text-white">{displayStoreName}</p>
      </div>
      <nav className="shrink-0 space-y-2 overflow-hidden">
        {sections.map((section) => <div key={section.label}>
          <p className="mb-1 px-3 text-[9px] font-semibold tracking-[.18em] text-teal-100/55">{section.label}</p>
          <div className="space-y-0.5">{section.items.map(([name, icon]) => <button key={name} aria-current={activeMenu === name.toLowerCase() ? 'page' : undefined} onClick={() => { setActiveMenu(name.toLowerCase()); onClose?.() }} className={`flex w-full items-center gap-3 rounded-lg px-3 py-1.5 text-[13px] leading-5 transition ${activeMenu === name.toLowerCase() ? 'bg-[#20B2AA] font-semibold text-[#073833] shadow-md shadow-black/10' : 'text-teal-50/80 hover:bg-white/10 hover:text-white'}`}>
            <Icon name={icon} size={17} className="shrink-0" /><span>{name}</span>
          </button>)}</div>
        </div>)}
      </nav>
      <div className="mt-auto shrink-0 rounded-xl border border-white/10 bg-white/[.06] p-2">
        <div className="flex items-center gap-2"><div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-orange-200 text-xs font-bold text-orange-900">{(user?.user_metadata?.full_name || user?.email || 'A').slice(0, 1).toUpperCase()}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold">{user?.user_metadata?.full_name || 'Admin PosU'}</p><p className="truncate text-[10px] text-teal-100/65">{user?.email || 'Administrator'}</p></div><button title="Sign out" onClick={() => onSignOut?.().catch((error) => window.alert(error.message))} className="rounded-lg p-1.5 text-teal-100/70 hover:bg-white/10 hover:text-white"><Icon name="logout" size={16} /></button></div>
      </div>
    </aside>
  </>
}
