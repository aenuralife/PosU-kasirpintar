import { useMemo, useState } from 'react'
import { useCartStore } from '../store/useCartStore'
import { useUIStore } from '../store/useUIStore'
import { Icon } from '../components/Sidebar'

const categories = ['All', 'Coffee', 'Food', 'Drinks', 'Desserts']
const idr = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
const categoryMatch = (product, category) => {
  if (category === 'All') return true
  const value = `${product.category || ''} ${product.name || ''}`.toLowerCase()
  const words = { Coffee: ['coffee', 'kopi', 'espresso'], Food: ['food', 'makanan', 'nasi', 'roti'], Drinks: ['drink', 'minuman', 'teh', 'juice', 'jus'], Desserts: ['dessert', 'cake', 'kue', 'pudding', 'donat'] }
  return words[category].some((word) => value.includes(word))
}

export default function SalesView({ products = [], transactions = [] }) {
  const [category, setCategory] = useState('All')
  const addProduct = useCartStore((state) => state.addProduct)
  const cartItems = useCartStore((state) => state.items)
  const search = useUIStore((state) => state.searchQuery)
  const today = dateKey(new Date())
  const todaysOrders = transactions.filter((transaction) => {
    const timestamp = transaction.timestamp || transaction.create_at
    return timestamp && dateKey(new Date(timestamp)) === today
  })
  const sales = todaysOrders.reduce((sum, transaction) => sum + Number(transaction.grand_total ?? transaction.grandTotal ?? 0), 0)
  const customerCount = new Set(todaysOrders.map((transaction) => transaction.customer_id || transaction.customer_name).filter(Boolean)).size
  const metrics = [
    { label: 'Total Sales', value: idr(sales), icon: 'reports', color: 'bg-teal-50 text-teal-700' },
    { label: 'Orders', value: todaysOrders.length, icon: 'orders', color: 'bg-blue-50 text-blue-700' },
    { label: 'Customers', value: customerCount, icon: 'customers', color: 'bg-violet-50 text-violet-700' },
    { label: 'Avg. Order Value', value: idr(todaysOrders.length ? sales / todaysOrders.length : 0), icon: 'sales', color: 'bg-orange-50 text-orange-700' },
  ]
  const visibleProducts = useMemo(() => products.filter((product) => categoryMatch(product, category) && product.name?.toLowerCase().includes(search.toLowerCase())), [products, category, search])

  return <section className="min-w-0 space-y-6 xl:col-span-8 xl:h-[calc(100vh-120px)] xl:overflow-y-auto xl:overscroll-contain xl:pr-2 xl:[scrollbar-width:thin]">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-medium text-teal-700">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">Good morning, ready to serve?</h2><p className="mt-1 text-sm text-slate-500">Select products and build an order.</p></div><div className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-emerald-500"/>Register 01 · Online</div></div>
    <div className="grid grid-cols-2 gap-3 2xl:grid-cols-4">{metrics.map((metric) => <article key={metric.label} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,.03)] transition hover:shadow-md"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-slate-500">{metric.label}</span><span className={`grid h-9 w-9 place-items-center rounded-xl ${metric.color}`}><Icon name={metric.icon} size={17}/></span></div><p className="mt-3 truncate text-lg font-bold tracking-tight text-slate-950">{metric.value}</p></article>)}</div>
    <div className="flex gap-2 overflow-x-auto pb-1">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={`shrink-0 rounded-xl px-4 py-2 text-xs font-semibold transition ${category === item ? 'bg-[#0d766e] text-white shadow-md shadow-teal-900/10' : 'border border-slate-200 bg-white text-slate-500 hover:border-teal-200 hover:text-teal-800'}`}>{item}</button>)}</div>
    {visibleProducts.length ? <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 2xl:grid-cols-4">{visibleProducts.map((product, index) => { const stock = Number(product.stock ?? 0); const inCart = cartItems.find((item) => String(item.id) === String(product.id))?.qty || 0; const unavailable = stock <= 0 || inCart >= stock; return <article key={product.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg hover:shadow-slate-900/5"><div className="relative aspect-[1.35] overflow-hidden bg-slate-100"><img src={product.imageUrl || product.image || `https://images.unsplash.com/photo-${['1509042239860-f550ce710b93','1555939594-58d7cb561ad1','1556679343-c7306c1976bc','1578985545062-69928b1d9587'][index % 4]}?auto=format&fit=crop&w=500&q=80`} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105"/><span className="absolute left-2.5 top-2.5 rounded-lg bg-white/90 px-2 py-1 text-[9px] font-semibold text-slate-600 backdrop-blur">{product.category || 'Popular'}</span><button disabled={unavailable} aria-label={`Add ${product.name}`} onClick={() => addProduct(product)} className="absolute bottom-2.5 right-2.5 grid h-9 w-9 place-items-center rounded-xl bg-[#0d766e] text-white shadow-lg transition hover:scale-105 hover:bg-[#095d57] disabled:cursor-not-allowed disabled:bg-slate-400"><Icon name="plus" size={18}/></button></div><div className="p-3"><h3 className="truncate text-xs font-semibold text-slate-800">{product.name}</h3><div className="mt-2 flex items-center justify-between"><span className="text-xs font-bold text-[#0d766e]">{idr(product.price)}</span><span className={`text-[10px] ${stock <= 5 ? 'font-semibold text-rose-600' : 'text-slate-400'}`}>Stok: {stock}</span></div></div></article>})}</div> : <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-slate-300 bg-white text-center"><div><div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-400"><Icon name="products"/></div><p className="text-sm font-semibold text-slate-700">No products found</p><p className="mt-1 text-xs text-slate-400">Try another category or search term.</p></div></div>}
  </section>
}
