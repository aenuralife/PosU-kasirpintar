import { Icon } from './Sidebar'
import { useUIStore } from '../store/useUIStore'

export default function Header({ user, onMenuClick }) {
  const activeMenu = useUIStore((state) => state.activeMenu)
  const searchQuery = useUIStore((state) => state.searchQuery)
  const setSearchQuery = useUIStore((state) => state.setSearchQuery)
  return <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between gap-3 border-b border-slate-200/70 bg-white/85 px-4 shadow-[0_4px_20px_rgba(15,23,42,.025)] backdrop-blur-xl md:px-7">
    <div className="flex min-w-0 items-center gap-3">
      <button aria-label="Open navigation" onClick={onMenuClick} className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 lg:hidden"><Icon name="menu" /></button>
      <div className="min-w-0"><p className="truncate text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">PosU <span className="mx-1 text-slate-300">/</span> <span className="capitalize text-teal-700">{activeMenu}</span></p><h1 className="mt-0.5 truncate text-lg font-bold capitalize tracking-tight text-slate-900">{activeMenu === 'sales' ? 'Point of Sale' : activeMenu}</h1></div>
    </div>
    <div className="flex items-center gap-2 md:gap-3">
      <label className="hidden h-10 w-52 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 text-slate-400 transition focus-within:border-teal-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-teal-500/10 md:flex xl:w-72"><Icon name="search" size={17} /><input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Cari produk..." className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" /></label>
      <button aria-label="Notifications" className="relative grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-teal-200 hover:bg-teal-50"><Icon name="bell" size={18} /><span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-rose-500" /></button>
      <button title="Open profile settings" onClick={() => useUIStore.getState().setActiveMenu('settings')} className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-xs font-bold text-orange-800 ring-1 ring-orange-200/70 transition hover:ring-2 hover:ring-teal-200">{(user?.user_metadata?.full_name || user?.email || 'A').slice(0, 1).toUpperCase()}</button>
      <button onClick={() => useUIStore.getState().setActiveMenu('sales')} className="hidden h-10 items-center gap-2 rounded-xl bg-[#0d766e] px-4 text-xs font-semibold text-white shadow-sm shadow-teal-900/15 transition hover:bg-[#095d57] sm:flex"><Icon name="sales" size={16} /> Transaksi baru</button>
    </div>
  </header>
}
