import { useEffect, useState } from 'react'
import Auth from './Auth'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import CurrentSale from './components/CurrentSale'
import DashboardView from './views/DashboardView'
import SalesView from './views/SalesView'
import ProductsView from './views/ProductsView'
import CustomersView from './views/CustomersView'
import OrdersView from './views/OrdersView'
import ReportsView from './views/ReportsView'
import ReturnsView from './views/ReturnsView'
import DiscountsView from './views/DiscountsView'
import UsersView from './views/UsersView'
import SettingsView from './views/SettingsView'
import { supabase } from './supabaseClient'
import { useUIStore } from './store/useUIStore'

const views = {
  dashboard: DashboardView,
  sales: SalesView,
  products: ProductsView,
  customers: CustomersView,
  orders: OrdersView,
  reports: ReportsView,
  returns: ReturnsView,
  discounts: DiscountsView,
  users: UsersView,
  settings: SettingsView,
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const activeMenu = useUIStore((state) => state.activeMenu)
  const [products, setProducts] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loadedUserId, setLoadedUserId] = useState(null)
  const [dataNotice, setDataNotice] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)
  const dataLoading = Boolean(session && loadedUserId !== session.user.id)

  useEffect(() => {
    let active = true
    supabase.auth.getSession().then(({ data, error }) => {
      if (active) {
        if (error) setDataNotice(error.message)
        setSession(data?.session || null)
        setLoading(false)
      }
    }).catch((error) => {
      if (active) { setDataNotice(error.message); setLoading(false) }
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setLoading(false)
    })
    return () => { active = false; subscription.unsubscribe() }
  }, [])

  useEffect(() => {
    if (!session) return undefined
    let active = true
    const loadData = async () => {
      const [productResult, transactionResult] = await Promise.all([
        supabase.from('products').select('*').order('created_at', { ascending: false }),
        supabase.from('transactions_final').select('*').order('create_at', { ascending: false }),
      ])
      if (!active) return
      if (productResult.error) setDataNotice(`Products could not be loaded: ${productResult.error.message}`)
      else setProducts((productResult.data || []).map((product) => ({ ...product, imageUrl: product.image || product.imageUrl })))
      if (transactionResult.error) setDataNotice((current) => current || `Orders could not be loaded: ${transactionResult.error.message}`)
      else setTransactions(transactionResult.data || [])
      setLoadedUserId(session.user.id)
    }
    loadData().catch((error) => { if (active) { setDataNotice(error.message); setLoadedUserId(session.user.id) } })
    return () => { active = false }
  }, [session])

  if (loading) return <div className="grid min-h-screen place-items-center bg-[#f5f8f8]"><div className="flex items-center gap-3 text-sm font-medium text-slate-500"><span className="h-5 w-5 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Loading PosU...</div></div>
  if (!session) return <Auth />

  const View = views[activeMenu] || SalesView
  const currentProducts = loadedUserId === session.user.id ? products : []
  const currentTransactions = loadedUserId === session.user.id ? transactions : []
  const addTransaction = (transaction) => setTransactions((current) => [transaction, ...current])
  const updateProductStock = (id, stock) => setProducts((current) => current.map((product) => String(product.id) === String(id) ? { ...product, stock: Number(stock) } : product))
  const saveProduct = async (product) => {
    const { id, ...fields } = product
    const query = id ? supabase.from('products').update(fields).eq('id', id) : supabase.from('products').insert(fields)
    const { data, error } = await query.select('*').single()
    if (error) throw error
    const normalized = { ...data, imageUrl: data.image || data.imageUrl }
    setProducts((current) => id ? current.map((item) => item.id === id ? normalized : item) : [normalized, ...current])
  }
  const deleteProduct = async (id) => {
    const { error } = await supabase.from('products').delete().eq('id', id)
    if (error) throw error
    setProducts((current) => current.filter((product) => product.id !== id))
  }

  return <div className="min-h-screen bg-[#f4f7f7] text-slate-900 lg:flex">
    <Sidebar user={session.user} onSignOut={() => supabase.auth.signOut()} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    <div className="min-w-0 flex-1"><Header user={session.user} onMenuClick={() => setMobileOpen(true)} />
      <main className="mx-auto max-w-[1680px] p-4 md:p-6 xl:p-8">
        {dataNotice && <div role="status" className="mb-5 flex items-start justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"><span>{dataNotice}</span><button aria-label="Dismiss" onClick={() => setDataNotice('')} className="font-bold">×</button></div>}
        {dataLoading && <div className="mb-4 h-1 overflow-hidden rounded-full bg-teal-100"><div className="h-full w-1/3 animate-pulse rounded-full bg-teal-600"/></div>}
        {activeMenu === 'sales' ? <div className="grid items-start gap-5 xl:grid-cols-12"><SalesView products={currentProducts} transactions={currentTransactions}/><CurrentSale user={session.user} onOrderCreated={addTransaction} onStockUpdated={updateProductStock}/></div> : activeMenu === 'dashboard' ? <View products={currentProducts} transactions={currentTransactions}/> : activeMenu === 'products' ? <ProductsView products={currentProducts} userId={session.user.id} onSave={saveProduct} onDelete={deleteProduct}/> : activeMenu === 'customers' ? <CustomersView userId={session.user.id}/> : activeMenu === 'orders' ? <OrdersView userId={session.user.id}/> : activeMenu === 'reports' ? <ReportsView userId={session.user.id}/> : activeMenu === 'returns' ? <ReturnsView userId={session.user.id} transactions={currentTransactions}/> : activeMenu === 'discounts' ? <DiscountsView/> : activeMenu === 'users' ? <UsersView/> : <View />}
      </main>
      <footer className="px-7 pb-5 pt-2 text-center text-[10px] font-medium tracking-wide text-slate-400">PosU Retail Cloud · Sistem kasir untuk bisnis yang lebih rapi</footer>
    </div>
  </div>
}
