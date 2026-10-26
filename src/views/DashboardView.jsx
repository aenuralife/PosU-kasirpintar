import { Icon } from '../components/Sidebar'

const idr = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

export default function DashboardView({ transactions = [], products = [] }) {
  const today = dateKey(new Date())
  const todayOrders = transactions.filter((tx) => {
    const date = tx.timestamp || tx.create_at
    return date && dateKey(new Date(date)) === today
  })
  const sales = todayOrders.reduce((sum, tx) => sum + Number(tx.grand_total ?? tx.grandTotal ?? 0), 0)
  const customers = new Set(todayOrders.map((tx) => tx.customer_id || tx.customer_name).filter(Boolean)).size
  const metrics = [
    { label: 'Penjualan hari ini', value: idr(sales), icon: 'reports', tint: 'bg-teal-50 text-teal-700' },
    { label: 'Transaksi', value: todayOrders.length, icon: 'orders', tint: 'bg-blue-50 text-blue-700' },
    { label: 'Pelanggan', value: customers, icon: 'customers', tint: 'bg-violet-50 text-violet-700' },
    { label: 'Rata-rata transaksi', value: idr(todayOrders.length ? sales / todayOrders.length : 0), icon: 'sales', tint: 'bg-orange-50 text-orange-700' },
  ]
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - index))
    const key = dateKey(date)
    const amount = transactions.filter((tx) => {
      const timestamp = tx.timestamp || tx.create_at
      return timestamp && dateKey(new Date(timestamp)) === key
    }).reduce((sum, tx) => sum + Number(tx.grand_total ?? tx.grandTotal ?? 0), 0)
    return { day: date.toLocaleDateString('id-ID', { weekday: 'short' }), amount }
  })
  const maxAmount = Math.max(...week.map((item) => item.amount), 1)

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Ringkasan toko</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Dashboard</h2><p className="mt-1 text-sm text-slate-500">Pantau performa toko hari ini.</p></div><span className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 shadow-sm">{new Date().toLocaleDateString('id-ID', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span></div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <article key={metric.label} className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_36px_rgba(15,23,42,.08)]"><div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500">{metric.label}</span><span className={`grid h-10 w-10 place-items-center rounded-xl ${metric.tint}`}><Icon name={metric.icon} size={18}/></span></div><p className="mt-4 text-2xl font-bold tracking-tight text-slate-950">{metric.value}</p><p className="mt-2 text-[10px] text-slate-400">Berdasarkan transaksi hari ini</p></article>)}</div>

    <div className="grid gap-5 xl:grid-cols-[1.45fr_1fr]">
      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)] md:p-6"><div className="flex items-start justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-700">Tren mingguan</p><h3 className="mt-1 text-base font-bold text-slate-900">Penjualan 7 hari terakhir</h3></div><span className="rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-semibold text-slate-500">IDR</span></div><div className="mt-7 flex h-48 items-end gap-3 border-b border-l border-slate-100 px-3 pb-2">{week.map((item, index) => <div key={`${item.day}-${index}`} title={`${item.day}: ${idr(item.amount)}`} className="group relative flex h-full flex-1 items-end"><div style={{ height: `${item.amount ? Math.max((item.amount / maxAmount) * 100, 4) : 2}%` }} className={`w-full rounded-t-lg transition-all duration-300 ${index === week.length - 1 ? 'bg-teal-600' : 'bg-teal-100 group-hover:bg-teal-300'}`}/></div>)}</div><div className="mt-3 flex justify-between px-1 text-[10px] font-medium text-slate-400">{week.map((item, index) => <span key={`${item.day}-${index}`}>{item.day}</span>)}</div></section>

      <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)] md:p-6"><div className="flex items-center justify-between"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-700">Katalog</p><h3 className="mt-1 text-base font-bold text-slate-900">Produk terbaru</h3></div><span className="rounded-full bg-teal-50 px-3 py-1.5 text-[10px] font-bold text-teal-800">{products.length} produk</span></div><div className="mt-5 space-y-3">{products.slice(0, 4).map((product) => <div key={product.id} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-slate-50"><img src={product.imageUrl || product.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=100&q=80'} alt="" className="h-11 w-11 rounded-xl bg-slate-100 object-cover"/><div className="min-w-0 flex-1"><p className="truncate text-xs font-semibold text-slate-800">{product.name}</p><p className="mt-1 text-[10px] text-slate-400">{product.category || 'Produk'} · Stok {product.stock ?? 0}</p></div><span className="text-xs font-bold text-slate-700">{idr(product.price)}</span></div>)}</div>{!products.length && <p className="py-8 text-center text-xs text-slate-400">Belum ada produk.</p>}</section>
    </div>

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]"><div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6"><div><p className="text-[11px] font-bold uppercase tracking-[.14em] text-teal-700">Aktivitas</p><h3 className="mt-1 text-base font-bold text-slate-900">Transaksi terbaru</h3></div><span className="text-xs font-semibold text-slate-500">{transactions.length} transaksi</span></div><div className="overflow-x-auto"><table className="w-full min-w-[540px] text-left text-xs"><thead className="bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><tr><th className="px-5 py-3 font-semibold md:px-6">ID transaksi</th><th className="px-5 py-3 font-semibold">Tanggal</th><th className="px-5 py-3 font-semibold">Pembayaran</th><th className="px-5 py-3 font-semibold">Total</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead><tbody>{transactions.slice(0, 5).map((tx) => <tr key={tx.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-5 py-3.5 font-semibold text-slate-700 md:px-6">#{String(tx.id).slice(-8)}</td><td className="px-5 py-3.5 text-slate-500">{tx.timestamp || tx.create_at ? new Date(tx.timestamp || tx.create_at).toLocaleDateString('id-ID') : '—'}</td><td className="px-5 py-3.5 capitalize text-slate-500">{tx.payment_method || 'Cash'}</td><td className="px-5 py-3.5 font-bold text-slate-800">{idr(tx.grand_total ?? tx.grandTotal)}</td><td className="px-5 py-3.5"><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Selesai</span></td></tr>)}</tbody></table>{!transactions.length && <p className="py-9 text-center text-xs text-slate-400">Belum ada transaksi tercatat.</p>}</div></section>
  </div>
}
