import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon } from '../components/Sidebar'

const idr = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(amount) || 0)
const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })
}
const emptyForm = { order_id: '', reason: '', amount: '' }

export default function ReturnsView({ userId, transactions = [] }) {
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const loadReturns = async () => {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase
        .from('returns')
        .select('id, order_id, reason, amount, user_id, create_at')
        .eq('user_id', userId)
        .order('create_at', { ascending: false })
      if (!active) return
      if (queryError) setError(`Riwayat retur gagal dimuat: ${queryError.message}`)
      else setReturns(data || [])
      setLoading(false)
    }
    if (userId) loadReturns().catch((queryError) => {
      if (active) { setError(`Riwayat retur gagal dimuat: ${queryError.message}`); setLoading(false) }
    })
    else setLoading(false)
    return () => { active = false }
  }, [userId])

  const orderIds = useMemo(() => [...new Set(transactions.map((transaction) => transaction.id).filter(Boolean).map(String))], [transactions])
  const totalRefunded = returns.reduce((sum, item) => sum + Number(item.amount || 0), 0)

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setForm(emptyForm)
    setError('')
  }

  const processReturn = async (event) => {
    event.preventDefault()
    if (!userId || saving) return
    const amount = Number(form.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      setError('Nominal refund harus lebih dari Rp0.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const payload = {
        order_id: form.order_id.trim(),
        reason: form.reason.trim(),
        amount,
        user_id: userId,
        create_at: new Date().toISOString(),
      }
      const { data, error: insertError } = await supabase
        .from('returns')
        .insert(payload)
        .select('id, order_id, reason, amount, user_id, create_at')
        .single()
      if (insertError) throw insertError
      setReturns((current) => [data, ...current])
      setNotice('Retur berhasil disimpan.')
      setModalOpen(false)
      setForm(emptyForm)
    } catch (insertError) {
      setError(`Retur gagal disimpan: ${insertError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setSaving(false)
    }
  }

  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Layanan purna jual</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Returns &amp; Refunds</h2><p className="mt-1 text-sm text-slate-500">Kelola pengembalian barang dan catatan dana refund.</p></div><button onClick={() => { setError(''); setNotice(''); setModalOpen(true) }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0d766e] px-4 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-[#095d57]"><Icon name="plus" size={17}/>Proses Retur Baru</button></div>

    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {error && !modalOpen && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

    <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Jumlah retur</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{returns.length}</p></article><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Total dana refund</p><p className="mt-2 text-2xl font-bold tracking-tight text-rose-700">{idr(totalRefunded)}</p></article></div>

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]"><div className="border-b border-slate-100 px-5 py-4 md:px-6"><h3 className="text-sm font-bold text-slate-900">Riwayat Retur</h3><p className="mt-1 text-xs text-slate-400">{returns.length} catatan pengembalian dana</p></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><tr><th className="px-6 py-3 font-semibold">ID Retur</th><th className="px-6 py-3 font-semibold">No. Pesanan</th><th className="px-6 py-3 font-semibold">Alasan Retur</th><th className="px-6 py-3 text-right font-semibold">Nominal Refund</th><th className="px-6 py-3 font-semibold">Tanggal / Waktu</th></tr></thead><tbody>{returns.map((item) => <tr key={item.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-6 py-4 font-semibold text-slate-800">#{String(item.id).slice(-8)}</td><td className="px-6 py-4 font-medium text-slate-700">#{item.order_id}</td><td className="max-w-[260px] truncate px-6 py-4 text-slate-500">{item.reason}</td><td className="px-6 py-4 text-right font-bold text-rose-700">{idr(item.amount)}</td><td className="px-6 py-4 text-slate-500">{formatDate(item.create_at)}</td></tr>)}</tbody></table>{loading ? <div className="grid min-h-48 place-items-center text-sm text-slate-400"><span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Memuat riwayat retur...</span></div> : !returns.length ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon name="returns" size={22}/></span><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada catatan retur</p><p className="mt-1 text-xs text-slate-400">Retur yang diproses akan muncul di sini.</p></div></div> : null}</div></section>

    {modalOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}><div role="dialog" aria-modal="true" aria-labelledby="return-modal-title" className="w-full max-w-lg rounded-2xl border border-white/60 bg-white p-5 shadow-2xl md:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Pengembalian dana</p><h3 id="return-modal-title" className="mt-1 text-xl font-bold text-slate-950">Proses Retur Baru</h3><p className="mt-1 text-xs text-slate-500">Catat pesanan, alasan, dan jumlah refund.</p></div><button type="button" onClick={closeModal} aria-label="Tutup" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><Icon name="close" size={18}/></button></div>
      <form onSubmit={processReturn} className="space-y-4"><label className="block text-xs font-semibold text-slate-600">No. Pesanan<input required list="return-order-options" value={form.order_id} onChange={(event) => setForm((current) => ({ ...current, order_id: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Pilih atau ketik ID transaksi"/><datalist id="return-order-options">{orderIds.map((id) => <option key={id} value={id}/>)}</datalist><span className="mt-1 block text-[10px] font-normal text-slate-400">Pilih dari transaksi terbaru atau masukkan ID pesanan secara manual.</span></label>
        <label className="block text-xs font-semibold text-slate-600">Alasan retur<textarea required rows={3} maxLength={500} value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Jelaskan alasan pengembalian"/></label>
        <label className="block text-xs font-semibold text-slate-600">Nominal refund (Rp)<input required type="number" min="1" step="1" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="0"/></label>
        {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Batal</button><button disabled={saving || !userId} className="rounded-xl bg-[#0d766e] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#095d57] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Retur'}</button></div>
      </form></div></div>}
  </section>
}
