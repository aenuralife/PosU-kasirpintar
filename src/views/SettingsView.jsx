import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon } from '../components/Sidebar'

const emptySettings = { store_name: '', address: '', phone: '', receipt_footer: '' }

export default function SettingsView() {
  const [settingsId, setSettingsId] = useState(null)
  const [form, setForm] = useState(emptySettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const loadSettings = async () => {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase
        .from('store_settings')
        .select('id, store_name, address, phone, receipt_footer')
        .limit(1)
        .maybeSingle()
      if (!active) return
      if (queryError) setError(`Pengaturan toko gagal dimuat: ${queryError.message}`)
      else if (data) {
        setSettingsId(data.id)
        setForm({
          store_name: data.store_name || '',
          address: data.address || '',
          phone: data.phone || '',
          receipt_footer: data.receipt_footer || '',
        })
      }
      setLoading(false)
    }
    loadSettings().catch((queryError) => {
      if (active) { setError(`Pengaturan toko gagal dimuat: ${queryError.message}`); setLoading(false) }
    })
    return () => { active = false }
  }, [])

  const updateField = (field, value) => setForm((current) => ({ ...current, [field]: value }))

  const saveSettings = async (event) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    setNotice('')
    const payload = {
      store_name: form.store_name.trim(),
      address: form.address.trim(),
      phone: form.phone.trim(),
      receipt_footer: form.receipt_footer.trim(),
    }
    try {
      const query = settingsId
        ? supabase.from('store_settings').update(payload).eq('id', settingsId)
        : supabase.from('store_settings').insert(payload)
      const { data, error: saveError } = await query
        .select('id, store_name, address, phone, receipt_footer')
        .single()
      if (saveError) throw saveError
      setSettingsId(data.id)
      setForm({ store_name: data.store_name || '', address: data.address || '', phone: data.phone || '', receipt_footer: data.receipt_footer || '' })
      setNotice('Pengaturan toko berhasil disimpan.')
    } catch (saveError) {
      setError(`Pengaturan toko gagal disimpan: ${saveError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setSaving(false)
    }
  }

  return <section className="mx-auto max-w-4xl space-y-6">
    <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Konfigurasi toko</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Store Settings</h2><p className="mt-1 text-sm text-slate-500">Atur informasi toko yang digunakan pada operasional dan struk.</p></div>

    <form onSubmit={saveSettings} className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_10px_36px_rgba(15,23,42,.045)]">
      <div className="border-b border-slate-100 bg-gradient-to-r from-teal-50/80 to-white px-5 py-5 md:px-7"><div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#073833] text-[#20B2AA]"><Icon name="settings" size={20}/></span><div><h3 className="text-sm font-bold text-slate-900">Informasi Toko</h3><p className="mt-1 text-xs text-slate-500">Detail ini dapat dicantumkan pada struk transaksi.</p></div></div></div>
      <div className="space-y-5 px-5 py-6 md:px-7">
        {error && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}
        {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
        {loading && <div className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-500"><span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Memuat pengaturan...</div>}
        <label className="block text-xs font-semibold text-slate-700">Nama Toko<input required maxLength={150} value={form.store_name} onChange={(event) => updateField('store_name', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Contoh: PosU Coffee & Eatery" /></label>
        <label className="block text-xs font-semibold text-slate-700">Alamat Toko<textarea rows={3} maxLength={500} value={form.address} onChange={(event) => updateField('address', event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Alamat lengkap toko" /></label>
        <label className="block text-xs font-semibold text-slate-700">Nomor Telepon<input type="tel" maxLength={30} value={form.phone} onChange={(event) => updateField('phone', event.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="08xxxxxxxxxx" /></label>
        <label className="block text-xs font-semibold text-slate-700">Pesan Bawah Struk<textarea rows={3} maxLength={300} value={form.receipt_footer} onChange={(event) => updateField('receipt_footer', event.target.value)} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Terima kasih telah berbelanja!" /><span className="mt-1 block text-[10px] font-normal text-slate-400">Pesan ini akan ditampilkan di bagian bawah struk.</span></label>
      </div>
      <div className="flex justify-end border-t border-slate-100 bg-slate-50/60 px-5 py-4 md:px-7"><button disabled={saving || loading} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0d766e] px-5 text-sm font-semibold text-white shadow-md shadow-teal-900/10 transition hover:bg-[#095d57] disabled:cursor-not-allowed disabled:opacity-50"><Icon name="check" size={17}/>{saving ? 'Menyimpan...' : 'Simpan Pengaturan'}</button></div>
    </form>
  </section>
}
