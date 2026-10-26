import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon } from '../components/Sidebar'

const blankCustomer = { name: '', phone: '', email: '', address: '' }

export default function CustomersView({ userId }) {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState(blankCustomer)
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const loadCustomers = async () => {
      setLoading(true)
      setError('')
      const { data, error: fetchError } = await supabase
        .from('customers')
        .select('id, name, phone, email, address, user_id, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
      if (!active) return
      if (fetchError) setError(`Data pelanggan gagal dimuat: ${fetchError.message}`)
      else setCustomers(data || [])
      setLoading(false)
    }

    if (userId) loadCustomers().catch((fetchError) => {
      if (active) {
        setError(`Data pelanggan gagal dimuat: ${fetchError.message}`)
        setLoading(false)
      }
    })
    else setLoading(false)
    return () => { active = false }
  }, [userId])

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return customers
    return customers.filter((customer) => [customer.name, customer.phone, customer.email, customer.address].some((value) => value?.toLowerCase().includes(query)))
  }, [customers, search])

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setForm(blankCustomer)
    setError('')
  }

  const addCustomer = async (event) => {
    event.preventDefault()
    if (!userId || saving) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      const payload = {
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        address: form.address.trim() || null,
        user_id: userId,
      }
      const { data, error: insertError } = await supabase
        .from('customers')
        .insert(payload)
        .select('id, name, phone, email, address, user_id, created_at')
        .single()
      if (insertError) throw insertError
      setCustomers((current) => [data, ...current])
      setNotice('Pelanggan berhasil ditambahkan.')
      setModalOpen(false)
      setForm(blankCustomer)
    } catch (insertError) {
      setError(`Pelanggan gagal disimpan: ${insertError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setSaving(false)
    }
  }

  const removeCustomer = async (customer) => {
    if (!window.confirm(`Hapus data pelanggan ${customer.name}?`)) return
    setError('')
    setNotice('')
    const { error: deleteError } = await supabase.from('customers').delete().eq('id', customer.id).eq('user_id', userId)
    if (deleteError) {
      setError(`Pelanggan gagal dihapus: ${deleteError.message}`)
      return
    }
    setCustomers((current) => current.filter((item) => item.id !== customer.id))
    setNotice('Data pelanggan berhasil dihapus.')
  }

  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Hubungan pelanggan</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Customers</h2><p className="mt-1 text-sm text-slate-500">Simpan dan temukan informasi pelanggan toko.</p></div>
      <button onClick={() => { setError(''); setModalOpen(true) }} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0d766e] px-4 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-[#095d57]"><Icon name="plus" size={17}/>Tambah Pelanggan</button>
    </div>

    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {error && !modalOpen && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

    <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-6">
        <div><h3 className="text-sm font-bold text-slate-900">Daftar pelanggan</h3><p className="mt-1 text-xs text-slate-400">{customers.length} pelanggan terdaftar</p></div>
        <label className="flex h-10 w-full items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-400 transition focus-within:border-teal-400 focus-within:bg-white sm:w-64"><Icon name="search" size={16}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari pelanggan..." className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder:text-slate-400" /></label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><tr><th className="px-6 py-3 font-semibold">Nama</th><th className="px-6 py-3 font-semibold">No. Telepon</th><th className="px-6 py-3 font-semibold">Email</th><th className="px-6 py-3 font-semibold">Alamat</th><th className="px-6 py-3 text-right font-semibold">Aksi</th></tr></thead>
          <tbody>{filteredCustomers.map((customer) => <tr key={customer.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-800">{customer.name?.trim().charAt(0).toUpperCase() || '?'}</span><span className="font-semibold text-slate-800">{customer.name}</span></div></td><td className="px-6 py-4 text-slate-600">{customer.phone || '—'}</td><td className="px-6 py-4 text-slate-600">{customer.email || '—'}</td><td className="max-w-[240px] truncate px-6 py-4 text-slate-500">{customer.address || '—'}</td><td className="px-6 py-4 text-right"><button onClick={() => removeCustomer(customer)} aria-label={`Hapus pelanggan ${customer.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"><Icon name="trash" size={16}/></button></td></tr>)}</tbody>
        </table>
        {loading ? <div className="grid min-h-48 place-items-center text-sm text-slate-400"><span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Memuat data pelanggan...</span></div> : !filteredCustomers.length ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon name="customers" size={22}/></span><p className="mt-3 text-sm font-semibold text-slate-700">{search ? 'Pelanggan tidak ditemukan' : 'Belum ada pelanggan'}</p><p className="mt-1 text-xs text-slate-400">{search ? 'Coba kata kunci lain.' : 'Tambahkan pelanggan untuk mulai membangun daftar.'}</p></div></div> : null}
      </div>
    </div>

    {modalOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}>
      <div role="dialog" aria-modal="true" aria-labelledby="customer-modal-title" className="w-full max-w-lg rounded-2xl border border-white/60 bg-white p-5 shadow-2xl md:p-6">
        <div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Data pelanggan</p><h3 id="customer-modal-title" className="mt-1 text-xl font-bold text-slate-950">Tambah Pelanggan</h3><p className="mt-1 text-xs text-slate-500">Masukkan informasi pelanggan baru.</p></div><button type="button" onClick={closeModal} aria-label="Tutup" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><Icon name="close" size={18}/></button></div>
        <form onSubmit={addCustomer} className="space-y-4">
          <label className="block text-xs font-semibold text-slate-600">Nama<input autoFocus required maxLength={120} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Nama pelanggan" /></label>
          <div className="grid gap-4 sm:grid-cols-2"><label className="block text-xs font-semibold text-slate-600">No. Telepon<input type="tel" maxLength={30} value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="08xxxxxxxxxx" /></label><label className="block text-xs font-semibold text-slate-600">Email<input type="email" maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="nama@email.com" /></label></div>
          <label className="block text-xs font-semibold text-slate-600">Alamat<textarea rows={3} maxLength={500} value={form.address} onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))} className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Alamat pelanggan" /></label>
          {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error}</p>}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Batal</button><button disabled={saving || !userId} className="rounded-xl bg-[#0d766e] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#095d57] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Pelanggan'}</button></div>
        </form>
      </div>
    </div>}
  </section>
}
