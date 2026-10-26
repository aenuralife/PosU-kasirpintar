import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useCartStore } from '../store/useCartStore'
import { Icon } from './Sidebar'

const idr = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount) || 0)

export default function CurrentSale({ user, onOrderCreated, onStockUpdated }) {
  const items = useCartStore((state) => state.items)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const removeItem = useCartStore((state) => state.removeItem)
  const clearCart = useCartStore((state) => state.clearCart)
  const subtotal = useCartStore((state) => state.getSubtotal())
  const tax = useCartStore((state) => state.getTax())
  const total = useCartStore((state) => state.getTotal())
  const [paying, setPaying] = useState(false)
  const [method, setMethod] = useState('cash')
  const [notice, setNotice] = useState('')
  const [receiptData, setReceiptData] = useState(null)
  const [store, setStore] = useState(null)

  useEffect(() => {
    let active = true
    supabase.from('store_settings').select('store_name, address, phone, receipt_footer').limit(1).maybeSingle()
      .then(({ data }) => { if (active && data) setStore(data) })
      .catch(() => {})
    return () => { active = false }
  }, [])

  const checkout = async () => {
    if (!items.length || paying || receiptData) return
    setPaying(true)
    setNotice('')
    const createdAt = new Date().toISOString()
    const transaction = {
      id: `TRX-${Date.now()}`,
      date: new Date().toLocaleString('id-ID'),
      timestamp: createdAt,
      items: items.map((item) => ({ ...item })),
      subtotal,
      grand_total: total,
      payment_method: method,
      cash: total,
      change: 0,
      user_id: user?.id,
      create_at: createdAt,
    }

    try {
      const { error: transactionError } = await supabase.from('transactions_final').insert([transaction])
      if (transactionError) throw transactionError

      const stockWarnings = []
      for (const item of transaction.items) {
        const { data: currentProduct, error: readError } = await supabase
          .from('products').select('id, stock').eq('id', item.id).maybeSingle()
        if (readError || !currentProduct) {
          stockWarnings.push(`${item.name}: stok tidak dapat dibaca`)
          continue
        }
        const currentStock = Number(currentProduct.stock) || 0
        if (currentStock < item.qty) {
          stockWarnings.push(`${item.name}: stok tersisa ${currentStock}, transaksi mencatat ${item.qty}`)
          continue
        }
        const { data: updatedProduct, error: stockError } = await supabase
          .from('products')
          .update({ stock: currentStock - item.qty })
          .eq('id', item.id)
          .eq('stock', currentStock)
          .select('id, stock')
          .maybeSingle()
        if (stockError || !updatedProduct) {
          stockWarnings.push(`${item.name}: stok gagal diperbarui`)
          continue
        }
        onStockUpdated?.(item.id, updatedProduct.stock)
      }

      onOrderCreated?.(transaction)
      setReceiptData({ transaction, items: transaction.items, store, stockWarnings })
    } catch (error) {
      setNotice(`Pembayaran belum tersimpan: ${error.message}`)
    } finally {
      setPaying(false)
    }
  }

  const startNewTransaction = () => {
    clearCart()
    setReceiptData(null)
    setNotice('')
    setMethod('cash')
  }

  const soldAt = receiptData?.transaction.create_at
    ? new Date(receiptData.transaction.create_at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
    : ''

  return <>
    <aside className="flex min-h-[560px] flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,.07)] xl:sticky xl:top-[88px] xl:col-span-4 xl:h-[calc(100vh-120px)] xl:min-h-0">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-white px-5 py-4">
        <div><p className="text-[10px] font-bold uppercase tracking-[.15em] text-teal-700">Pembayaran</p><h2 className="mt-0.5 font-bold text-slate-950">Keranjang</h2></div>
        <span className="rounded-full bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800">{items.reduce((count, item) => count + item.qty, 0)} item</span>
      </div>
      <div className="flex shrink-0 items-center justify-between px-5 py-3"><span className="text-xs font-semibold text-slate-600">Pesanan saat ini</span>{items.length > 0 && <button onClick={clearCart} className="text-[11px] font-semibold text-rose-500 transition hover:text-rose-700">Kosongkan</button>}</div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-4 pb-3">
        {items.length === 0 ? <div className="grid h-full min-h-48 place-items-center text-center"><div><div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-teal-50 text-teal-600"><Icon name="sales" size={24}/></div><p className="text-sm font-semibold text-slate-700">Keranjang masih kosong</p><p className="mt-1 text-xs text-slate-400">Pilih produk untuk mulai transaksi</p></div></div> : items.map((item) => <div key={item.id} className="flex gap-3 rounded-xl p-2.5 transition hover:bg-slate-50">
          <img src={item.imageUrl || item.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=120&q=80'} alt="" className="h-12 w-12 rounded-xl bg-slate-100 object-cover"/>
          <div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><p className="truncate text-xs font-semibold text-slate-800">{item.name}</p><button aria-label={`Hapus ${item.name}`} onClick={() => removeItem(item.id)} className="text-slate-300 transition hover:text-rose-500"><Icon name="trash" size={14}/></button></div><p className="mt-1 text-[11px] text-slate-400">{idr(item.price)}</p><div className="mt-2 flex items-center justify-between"><div className="flex items-center gap-2"><button onClick={() => updateQuantity(item.id, -1)} aria-label="Kurangi jumlah" className="grid h-6 w-6 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-300 hover:text-teal-700"><Icon name="minus" size={12}/></button><span className="w-4 text-center text-xs font-semibold">{item.qty}</span><button onClick={() => updateQuantity(item.id, 1)} aria-label="Tambah jumlah" disabled={Number(item.stock ?? 0) <= item.qty} className="grid h-6 w-6 place-items-center rounded-lg bg-teal-50 text-teal-700 transition hover:bg-teal-100 disabled:opacity-40"><Icon name="plus" size={12}/></button></div><span className="text-xs font-semibold text-slate-700">{idr(item.price * item.qty)}</span></div></div>
        </div>)}
      </div>
      <div className="shrink-0 border-t border-slate-100 bg-slate-50/70 px-5 py-4">
        <div className="space-y-2.5 text-xs"><p className="text-[10px] text-slate-400">Harga produk sudah termasuk pajak.</p><div className="flex justify-between text-slate-500"><span>Subtotal (sebelum pajak)</span><span>{idr(subtotal)}</span></div><div className="flex justify-between text-slate-500"><span>Pajak termasuk (8%)</span><span>{idr(tax)}</span></div><div className="my-3 border-t border-slate-200"/><div className="flex items-center justify-between text-sm font-bold text-slate-950"><span>Total bayar</span><span className="text-base text-[#0d766e]">{idr(total)}</span></div></div>
        <div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setMethod('cash')} className={`rounded-xl border py-2.5 text-xs font-semibold transition ${method === 'cash' ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/10' : 'border-slate-200 bg-white text-slate-500 hover:border-teal-200'}`}>Cash</button><button onClick={() => setMethod('qris')} className={`rounded-xl border py-2.5 text-xs font-semibold transition ${method === 'qris' ? 'border-teal-600 bg-teal-50 text-teal-800 ring-2 ring-teal-500/10' : 'border-slate-200 bg-white text-slate-500 hover:border-teal-200'}`}>QRIS</button></div>
        {notice && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[11px] text-rose-700">{notice}</p>}
        <button disabled={!items.length || paying} onClick={checkout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0d766e] py-3 text-sm font-semibold text-white shadow-lg shadow-teal-900/10 transition hover:bg-[#095d57] disabled:cursor-not-allowed disabled:opacity-40">{paying ? 'Memproses...' : `Bayar ${idr(total)}`} <Icon name="arrow" size={16}/></button>
      </div>
    </aside>

    {receiptData && <div className="fixed inset-0 z-[70] grid place-items-center overflow-y-auto bg-slate-950/55 p-4 backdrop-blur-sm print:static print:block print:overflow-visible print:bg-white print:p-0">
      <div className="w-full max-w-md rounded-3xl border border-white/60 bg-white p-5 shadow-2xl print-receipt-wrap">
        <div className="mb-4 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2.5 text-sm font-semibold text-emerald-800 print:hidden"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-600 text-white"><Icon name="check" size={15}/></span>Transaksi Berhasil</div>
        {receiptData.stockWarnings.length > 0 && <div role="alert" className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-800 print:hidden">Transaksi tersimpan, tetapi stok perlu diperiksa: {receiptData.stockWarnings.join('; ')}.</div>}
        <div className="receipt-print-area mx-auto w-full max-w-[300px] bg-white p-1 font-mono text-[11px] leading-[1.45] text-black">
          <div className="text-center"><h2 className="text-base font-bold uppercase">{receiptData.store?.store_name || 'PosU Store'}</h2>{receiptData.store?.address && <p className="mt-1 whitespace-pre-line">{receiptData.store.address}</p>}{receiptData.store?.phone && <p>{receiptData.store.phone}</p>}</div>
          <div className="my-3 border-t border-dashed border-black"/><div className="flex justify-between"><span>No.</span><span>{receiptData.transaction.id}</span></div><div className="flex justify-between"><span>Waktu</span><span>{soldAt}</span></div><div className="my-3 border-t border-dashed border-black"/>
          <div className="space-y-2">{receiptData.items.map((item, index) => <div key={`${item.id}-${index}`}><div className="font-semibold">{item.name}</div><div className="flex justify-between"><span>{item.qty} x {idr(item.price)}</span><span>{idr(Number(item.price) * Number(item.qty))}</span></div></div>)}</div>
          <div className="my-3 border-t border-dashed border-black"/><div className="flex justify-between"><span>Subtotal sebelum pajak</span><span>{idr(receiptData.transaction.subtotal)}</span></div><div className="flex justify-between"><span>Pajak termasuk (8%)</span><span>{idr(receiptData.transaction.grand_total - receiptData.transaction.subtotal)}</span></div><div className="my-2 border-t border-black"/><div className="flex justify-between text-sm font-bold"><span>TOTAL</span><span>{idr(receiptData.transaction.grand_total)}</span></div><div className="mt-1 flex justify-between"><span>Pembayaran</span><span>{receiptData.transaction.payment_method.toUpperCase()}</span></div><div className="mt-4 border-t border-dashed border-black pt-3 text-center">{receiptData.store?.receipt_footer || 'Terima kasih telah berbelanja!'}</div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-2 print:hidden"><button onClick={() => window.print()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 py-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"><Icon name="print" size={16}/>Cetak Struk</button><button onClick={startNewTransaction} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0d766e] py-3 text-xs font-semibold text-white shadow-sm transition hover:bg-[#095d57]"><Icon name="plus" size={16}/>Transaksi Baru</button></div>
      </div>
    </div>}
  </>
}
