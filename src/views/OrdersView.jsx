import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon } from '../components/Sidebar'

const idr = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount) || 0)
const formatDate = (order) => {
  const value = order.create_at || order.timestamp || order.date
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}
const getItems = (order) => {
  if (Array.isArray(order.items)) return order.items
  if (typeof order.items === 'string') {
    try { const parsed = JSON.parse(order.items); return Array.isArray(parsed) ? parsed : [] } catch { return [] }
  }
  return []
}

export default function OrdersView({ userId }) {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedOrder, setSelectedOrder] = useState(null)

  useEffect(() => {
    let active = true
    const loadOrders = async () => {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase
        .from('transactions_final')
        .select('id, date, timestamp, items, subtotal, grand_total, payment_method, cash, change, user_id, create_at')
        .eq('user_id', userId)
        .order('create_at', { ascending: false })
      if (!active) return
      if (queryError) setError(`Riwayat transaksi gagal dimuat: ${queryError.message}`)
      else setOrders(data || [])
      setLoading(false)
    }
    if (userId) loadOrders().catch((queryError) => {
      if (active) { setError(`Riwayat transaksi gagal dimuat: ${queryError.message}`); setLoading(false) }
    })
    else setLoading(false)
    return () => { active = false }
  }, [userId])

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return orders
    return orders.filter((order) => String(order.id).toLowerCase().includes(query) || String(order.payment_method || '').toLowerCase().includes(query) || getItems(order).some((item) => String(item.name || '').toLowerCase().includes(query)))
  }, [orders, search])
  const revenue = orders.reduce((sum, order) => sum + Number(order.grand_total || 0), 0)

  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Aktivitas penjualan</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Orders</h2><p className="mt-1 text-sm text-slate-500">Lihat transaksi dan rincian produk yang terjual.</p></div><span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm">{orders.length} transaksi</span></div>

    <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Total transaksi</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{orders.length}</p></article><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Total penjualan</p><p className="mt-2 text-2xl font-bold tracking-tight text-teal-800">{idr(revenue)}</p></article></div>

    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6"><div><h3 className="text-sm font-bold text-slate-900">Riwayat transaksi</h3><p className="mt-1 text-xs text-slate-400">Diurutkan dari transaksi terbaru</p></div><label className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 transition focus-within:border-teal-400 focus-within:bg-white sm:w-64"><Icon name="search" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari ID atau produk..." className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" /></label></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><tr><th className="px-6 py-3 font-semibold">ID Transaksi</th><th className="px-6 py-3 font-semibold">Tanggal / Waktu</th><th className="px-6 py-3 font-semibold">Pembayaran</th><th className="px-6 py-3 font-semibold">Total belanja</th><th className="px-6 py-3 text-right font-semibold">Rincian</th></tr></thead><tbody>{filteredOrders.map((order) => <tr key={order.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-6 py-4 font-semibold text-slate-800">#{String(order.id).slice(-8)}</td><td className="px-6 py-4 text-slate-500">{formatDate(order)}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${String(order.payment_method).toLowerCase() === 'qris' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'}`}>{String(order.payment_method || 'Cash').toUpperCase()}</span></td><td className="px-6 py-4 font-bold text-slate-800">{idr(order.grand_total)}</td><td className="px-6 py-4 text-right"><button onClick={() => setSelectedOrder(order)} className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-100"><Icon name="orders" size={14}/>Lihat item</button></td></tr>)}</tbody></table>
        {loading ? <div className="grid min-h-52 place-items-center text-sm text-slate-400"><span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Memuat transaksi...</span></div> : !filteredOrders.length ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon name="orders" size={22}/></span><p className="mt-3 text-sm font-semibold text-slate-700">{search ? 'Transaksi tidak ditemukan' : 'Belum ada transaksi'}</p><p className="mt-1 text-xs text-slate-400">{search ? 'Coba kata kunci lain.' : 'Transaksi yang selesai akan muncul di sini.'}</p></div></div> : null}
      </div>
    </section>

    {selectedOrder && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedOrder(null) }}><div role="dialog" aria-modal="true" aria-labelledby="order-detail-title" className="max-h-[85vh] w-full max-w-lg overflow-hidden rounded-2xl border border-white/60 bg-white shadow-2xl"><div className="flex items-start justify-between border-b border-slate-100 px-5 py-4 md:px-6"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Detail transaksi</p><h3 id="order-detail-title" className="mt-1 text-lg font-bold text-slate-950">#{String(selectedOrder.id).slice(-8)}</h3><p className="mt-1 text-xs text-slate-500">{formatDate(selectedOrder)}</p></div><button onClick={() => setSelectedOrder(null)} aria-label="Tutup detail" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><Icon name="close" size={18}/></button></div><div className="max-h-[55vh] space-y-2 overflow-y-auto p-5 md:px-6">{getItems(selectedOrder).length ? getItems(selectedOrder).map((item, index) => <div key={`${item.id || item.name}-${index}`} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3"><div className="min-w-0"><p className="truncate text-sm font-semibold text-slate-800">{item.name || 'Produk'}</p><p className="mt-1 text-xs text-slate-500">{item.qty || 0} × {idr(item.price)}</p></div><span className="shrink-0 text-sm font-semibold text-slate-800">{idr(Number(item.price || 0) * Number(item.qty || 0))}</span></div>) : <p className="py-8 text-center text-sm text-slate-400">Rincian item tidak tersedia.</p>}</div><div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 md:px-6"><div className="flex justify-between text-xs text-slate-500"><span>Metode pembayaran</span><span className="font-semibold uppercase text-slate-700">{selectedOrder.payment_method || 'Cash'}</span></div><div className="mt-2 flex justify-between text-sm font-bold text-slate-900"><span>Total belanja</span><span className="text-teal-800">{idr(selectedOrder.grand_total)}</span></div></div></div></div>}
  </section>
}
