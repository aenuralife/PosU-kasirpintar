import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon } from '../components/Sidebar'

const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('id-ID', { dateStyle: 'medium' })
}

export default function DiscountsView() {
  const [discounts, setDiscounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [togglingId, setTogglingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [code, setCode] = useState('')
  const [percentage, setPercentage] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const loadDiscounts = async () => {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase
        .from('discounts')
        .select('id, code, percentage, is_active, create_at')
        .order('create_at', { ascending: false })
      if (!active) return
      if (queryError) setError(`Data diskon gagal dimuat: ${queryError.message}`)
      else setDiscounts(data || [])
      setLoading(false)
    }
    loadDiscounts().catch((queryError) => {
      if (active) { setError(`Data diskon gagal dimuat: ${queryError.message}`); setLoading(false) }
    })
    return () => { active = false }
  }, [])

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setCode('')
    setPercentage('')
    setError('')
  }

  const createDiscount = async (event) => {
    event.preventDefault()
    const normalizedCode = code.trim().toUpperCase()
    const numericPercentage = Number(percentage)
    if (!normalizedCode) { setError('Kode diskon harus diisi.'); return }
    if (!Number.isFinite(numericPercentage) || numericPercentage <= 0 || numericPercentage > 100) {
      setError('Persentase harus di antara 1 sampai 100.')
      return
    }
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const { data, error: insertError } = await supabase
        .from('discounts')
        .insert({ code: normalizedCode, percentage: numericPercentage, is_active: true, create_at: new Date().toISOString() })
        .select('id, code, percentage, is_active, create_at')
        .single()
      if (insertError) throw insertError
      setDiscounts((current) => [data, ...current])
      setNotice('Kode diskon berhasil dibuat.')
      setModalOpen(false)
      setCode('')
      setPercentage('')
    } catch (insertError) {
      setError(`Diskon gagal disimpan: ${insertError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setSaving(false)
    }
  }

  const toggleDiscount = async (discount) => {
    setTogglingId(discount.id)
    setError('')
    setNotice('')
    const nextStatus = !discount.is_active
    try {
      const { data, error: updateError } = await supabase
        .from('discounts')
        .update({ is_active: nextStatus })
        .eq('id', discount.id)
        .select('id, code, percentage, is_active, create_at')
        .single()
      if (updateError) throw updateError
      setDiscounts((current) => current.map((item) => item.id === discount.id ? data : item))
      setNotice(`Diskon ${data.code} sekarang ${data.is_active ? 'aktif' : 'tidak aktif'}.`)
    } catch (updateError) {
      setError(`Status diskon gagal diperbarui: ${updateError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setTogglingId(null)
    }
  }

  const activeCount = discounts.filter((discount) => discount.is_active).length

  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Promosi toko</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Discounts &amp; Promos</h2><p className="mt-1 text-sm text-slate-500">Buat kode promo dan kelola status diskon.</p></div><button onClick={() => { setError(''); setNotice(''); setModalOpen(true) }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0d766e] px-4 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-[#095d57]"><Icon name="plus" size={17}/>Buat Diskon Baru</button></div>

    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {error && !modalOpen && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

    <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Total kode diskon</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{discounts.length}</p></article><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Diskon aktif</p><p className="mt-2 text-2xl font-bold tracking-tight text-teal-800">{activeCount}</p></article></div>

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]"><div className="border-b border-slate-100 px-5 py-4 md:px-6"><h3 className="text-sm font-bold text-slate-900">Daftar Kode Promo</h3><p className="mt-1 text-xs text-slate-400">Aktifkan atau nonaktifkan promo kapan saja.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[680px] text-left text-sm"><thead className="bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><tr><th className="px-6 py-3 font-semibold">Kode Promo</th><th className="px-6 py-3 font-semibold">Diskon</th><th className="px-6 py-3 font-semibold">Status</th><th className="px-6 py-3 font-semibold">Tanggal Dibuat</th><th className="px-6 py-3 text-right font-semibold">Aksi</th></tr></thead><tbody>{discounts.map((discount) => <tr key={discount.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-6 py-4"><span className="rounded-lg border border-dashed border-teal-200 bg-teal-50/70 px-3 py-1.5 font-mono text-xs font-bold tracking-wide text-teal-900">{discount.code}</span></td><td className="px-6 py-4 font-bold text-slate-800">{Number(discount.percentage)}%</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${discount.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>{discount.is_active ? 'Aktif' : 'Tidak Aktif'}</span></td><td className="px-6 py-4 text-slate-500">{formatDate(discount.create_at)}</td><td className="px-6 py-4 text-right"><button type="button" role="switch" aria-checked={Boolean(discount.is_active)} aria-label={`${discount.is_active ? 'Nonaktifkan' : 'Aktifkan'} kode ${discount.code}`} disabled={togglingId === discount.id} onClick={() => toggleDiscount(discount)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition disabled:opacity-50 ${discount.is_active ? 'bg-[#20B2AA]' : 'bg-slate-300'}`}><span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${discount.is_active ? 'translate-x-6' : 'translate-x-1'}`}/></button></td></tr>)}</tbody></table>{loading ? <div className="grid min-h-48 place-items-center text-sm text-slate-400"><span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Memuat diskon...</span></div> : !discounts.length ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon name="discounts" size={22}/></span><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada kode promo</p><p className="mt-1 text-xs text-slate-400">Buat diskon pertama untuk toko Anda.</p></div></div> : null}</div></section>

    {modalOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}><div role="dialog" aria-modal="true" aria-labelledby="discount-modal-title" className="w-full max-w-md rounded-2xl border border-white/60 bg-white p-5 shadow-2xl md:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Promo baru</p><h3 id="discount-modal-title" className="mt-1 text-xl font-bold text-slate-950">Buat Diskon Baru</h3><p className="mt-1 text-xs text-slate-500">Tentukan kode promo dan nilai potongannya.</p></div><button type="button" onClick={closeModal} aria-label="Tutup" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><Icon name="close" size={18}/></button></div><form onSubmit={createDiscount} className="space-y-4"><label className="block text-xs font-semibold text-slate-600">Kode Diskon<input required maxLength={40} value={code} onChange={(event) => setCode(event.target.value.toUpperCase().replace(/\s/g, ''))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="HEMAT10" /></label><label className="block text-xs font-semibold text-slate-600">Persentase Diskon<input required type="number" min="1" max="100" step="1" value={percentage} onChange={(event) => setPercentage(event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="10" /><span className="mt-1 block text-[10px] font-normal text-slate-400">Masukkan angka dari 1 sampai 100 persen.</span></label>{error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error}</p>}<div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Batal</button><button disabled={saving} className="rounded-xl bg-[#0d766e] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#095d57] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Diskon'}</button></div></form></div></div>}
  </section>
}
