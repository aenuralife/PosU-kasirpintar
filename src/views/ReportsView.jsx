import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon } from '../components/Sidebar'
import { FileSpreadsheet } from 'lucide-react'

const currency = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 })
const idr = (amount) => currency.format(Number(amount) || 0)
const csvCell = (value) => {
  const text = String(value ?? '')
  const safeText = /^[=+@\-\t\r]/.test(text) ? `'${text}` : text
  return `"${safeText.replaceAll('"', '""')}"`
}
const getOrderDate = (order) => {
  const value = order.create_at
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}
const getMonthValue = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
const formatMonthLabel = (monthValue) => {
  const [year, month] = monthValue.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
}

export default function ReportsView({ userId }) {
  const [orders, setOrders] = useState([])
  const [period, setPeriod] = useState('today')
  const [selectedMonth, setSelectedMonth] = useState(() => getMonthValue(new Date()))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const loadOrders = async () => {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase
        .from('transactions_final')
        .select('id, create_at, payment_method, subtotal, grand_total, user_id')
        .eq('user_id', userId)
        .order('create_at', { ascending: false })
      if (!active) return
      if (queryError) setError(`Laporan gagal dimuat: ${queryError.message}`)
      else setOrders(data || [])
      setLoading(false)
    }
    if (userId) loadOrders().catch((queryError) => {
      if (active) { setError(`Laporan gagal dimuat: ${queryError.message}`); setLoading(false) }
    })
    else setLoading(false)
    return () => { active = false }
  }, [userId])

  const visibleOrders = useMemo(() => {
    const now = new Date()
    const todayStart = new Date(now)
    todayStart.setHours(0, 0, 0, 0)
    const tomorrowStart = new Date(todayStart)
    tomorrowStart.setDate(tomorrowStart.getDate() + 1)
    const [year, month] = selectedMonth.split('-').map(Number)
    const monthStart = new Date(year, month - 1, 1)
    const nextMonthStart = new Date(year, month, 1)
    return orders.filter((order) => {
      const date = getOrderDate(order)
      if (!date) return false
      if (period === 'today') return date >= todayStart && date < tomorrowStart
      return date >= monthStart && date < nextMonthStart
    })
  }, [orders, period, selectedMonth])

  const revenue = visibleOrders.reduce((sum, order) => sum + Number(order.grand_total || 0), 0)
  const average = visibleOrders.length ? revenue / visibleOrders.length : 0
  const exportOrders = () => {
    if (!visibleOrders.length || loading) return
    const rows = [
      ['ID Pesanan', 'Tanggal/Waktu', 'Metode Pembayaran', 'Subtotal', 'Total Belanja'],
      ...visibleOrders.map((order) => {
        const date = getOrderDate(order)
        return [
          order.id,
          date ? date.toLocaleString('id-ID') : '',
          order.payment_method || 'Cash',
          Number(order.subtotal) || 0,
          Number(order.grand_total) || 0,
        ]
      }),
    ]
    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(',')).join('\r\n')}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date()
    const dateStamp = period === 'today' ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` : selectedMonth
    link.href = url
    link.download = `Laporan_Penjualan_PosU_${dateStamp}.csv`
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }
  const metrics = [
    { label: 'Total Pendapatan', value: idr(revenue), icon: 'reports', iconClass: 'bg-teal-50 text-teal-700' },
    { label: 'Total Pesanan', value: visibleOrders.length.toLocaleString('id-ID'), icon: 'orders', iconClass: 'bg-blue-50 text-blue-700' },
    { label: 'Rata-rata Nilai Transaksi', value: idr(average), icon: 'sales', iconClass: 'bg-violet-50 text-violet-700' },
  ]
  const periodLabel = period === 'today' ? 'Hari Ini' : formatMonthLabel(selectedMonth)

  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Analisis bisnis</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Reports &amp; Analytics</h2><p className="mt-1 text-sm text-slate-500">Rekapitulasi pendapatan dan transaksi toko Anda.</p></div><div className="flex flex-wrap items-center gap-2"><button type="button" onClick={() => setPeriod('today')} aria-pressed={period === 'today'} className={`h-10 rounded-xl px-4 text-xs font-bold transition ${period === 'today' ? 'bg-[#073833] text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-800'}`}>Hari Ini</button><label className={`flex h-10 items-center gap-2 rounded-xl border bg-white px-3 text-xs font-semibold transition ${period === 'month' ? 'border-teal-400 ring-2 ring-teal-500/10' : 'border-slate-200 hover:border-teal-300'}`}><span className="text-slate-500">Bulan</span><input type="month" aria-label="Pilih bulan laporan" value={selectedMonth} onChange={(event) => { if (event.target.value) { setSelectedMonth(event.target.value); setPeriod('month') } }} className="min-w-0 bg-transparent text-xs font-semibold text-slate-700 outline-none" /></label><button type="button" onClick={exportOrders} disabled={loading || !visibleOrders.length} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#20B2AA] px-4 text-xs font-bold text-[#073833] shadow-sm transition hover:bg-teal-300 disabled:cursor-not-allowed disabled:opacity-50"><FileSpreadsheet size={16} strokeWidth={2}/><span>Unduh Excel</span></button></div></div>

    {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

    <div className="grid gap-4 md:grid-cols-3">{metrics.map((metric) => <article key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-slate-500">{metric.label}</p><p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">{loading ? '—' : metric.value}</p></div><span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${metric.iconClass}`}><Icon name={metric.icon} size={18}/></span></div><p className="mt-3 text-[10px] text-slate-400">{periodLabel}</p></article>)}</div>

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6"><div><h3 className="text-sm font-bold text-slate-900">Rekapitulasi Transaksi</h3><p className="mt-1 text-xs text-slate-400">{visibleOrders.length} transaksi pada periode {periodLabel.toLowerCase()}</p></div><span className="rounded-full bg-teal-50 px-3 py-1.5 text-[10px] font-bold text-teal-800">Urut terbaru</span></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><tr><th className="px-6 py-3 font-semibold">ID Pesanan</th><th className="px-6 py-3 font-semibold">Tanggal / Waktu</th><th className="px-6 py-3 font-semibold">Metode Pembayaran</th><th className="px-6 py-3 text-right font-semibold">Total Belanja</th></tr></thead><tbody>{visibleOrders.map((order) => { const date = getOrderDate(order); return <tr key={order.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-6 py-4 font-semibold text-slate-800">#{String(order.id).slice(-8)}</td><td className="px-6 py-4 text-slate-500">{date ? date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${String(order.payment_method).toLowerCase() === 'qris' ? 'bg-violet-50 text-violet-700' : 'bg-emerald-50 text-emerald-700'}`}>{String(order.payment_method || 'Cash').toUpperCase()}</span></td><td className="px-6 py-4 text-right font-bold text-slate-800">{idr(order.grand_total)}</td></tr>})}</tbody></table>{loading ? <div className="grid min-h-48 place-items-center text-sm text-slate-400"><span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Memuat laporan...</span></div> : !visibleOrders.length ? <div className="grid min-h-48 place-items-center px-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon name="reports" size={22}/></span><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada transaksi pada periode ini</p><p className="mt-1 text-xs text-slate-400">Pilih periode lain atau catat transaksi baru.</p></div></div> : null}</div></section>
  </section>
}
