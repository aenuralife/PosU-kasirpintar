import { useEffect, useState } from 'react'
import { supabase } from '../supabaseClient'
import { Icon } from '../components/Sidebar'

const emptyForm = { name: '', email: '', role: 'Kasir' }

export default function UsersView() {
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    let active = true
    const loadStaff = async () => {
      setLoading(true)
      setError('')
      const { data, error: queryError } = await supabase
        .from('store_users')
        .select('id, name, email, role, create_at')
        .order('create_at', { ascending: false })
      if (!active) return
      if (queryError) setError(`Data staf gagal dimuat: ${queryError.message}`)
      else setStaff(data || [])
      setLoading(false)
    }
    loadStaff().catch((queryError) => {
      if (active) { setError(`Data staf gagal dimuat: ${queryError.message}`); setLoading(false) }
    })
    return () => { active = false }
  }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setEditingId(null)
    setError('')
    setNotice('')
    setModalOpen(true)
  }
  const openEdit = (user) => {
    setForm({ name: user.name || '', email: user.email || '', role: user.role || 'Kasir' })
    setEditingId(user.id)
    setError('')
    setNotice('')
    setModalOpen(true)
  }
  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditingId(null)
    setForm(emptyForm)
    setError('')
  }

  const saveStaff = async (event) => {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError('')
    setNotice('')
    const payload = { name: form.name.trim(), email: form.email.trim(), role: form.role }
    try {
      const query = editingId
        ? supabase.from('store_users').update(payload).eq('id', editingId)
        : supabase.from('store_users').insert(payload)
      const { data, error: saveError } = await query.select('id, name, email, role, create_at').single()
      if (saveError) throw saveError
      setStaff((current) => editingId ? current.map((user) => user.id === editingId ? data : user) : [data, ...current])
      setNotice(editingId ? 'Data staf berhasil diperbarui.' : 'Staf berhasil ditambahkan.')
      setModalOpen(false)
      setEditingId(null)
      setForm(emptyForm)
    } catch (saveError) {
      setError(`Data staf gagal disimpan: ${saveError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteStaff = async (user) => {
    if (!window.confirm(`Hapus data staf ${user.name}?`)) return
    setDeletingId(user.id)
    setError('')
    setNotice('')
    try {
      const { error: deleteError } = await supabase.from('store_users').delete().eq('id', user.id)
      if (deleteError) throw deleteError
      setStaff((current) => current.filter((item) => item.id !== user.id))
      setNotice('Data staf berhasil dihapus.')
    } catch (deleteError) {
      setError(`Data staf gagal dihapus: ${deleteError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setDeletingId(null)
    }
  }

  return <section className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-[11px] font-bold uppercase tracking-[.18em] text-teal-700">Akses tim toko</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">User Management</h2><p className="mt-1 text-sm text-slate-500">Kelola daftar referensi admin dan kasir toko.</p></div><button onClick={openCreate} className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#0d766e] px-4 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:bg-[#095d57]"><Icon name="plus" size={17}/>Tambah Staf</button></div>

    {notice && <div role="status" className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{notice}</div>}
    {error && !modalOpen && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

    <div className="grid gap-4 sm:grid-cols-2"><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Total staf</p><p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">{staff.length}</p></article><article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)]"><p className="text-xs font-semibold text-slate-500">Kasir terdaftar</p><p className="mt-2 text-2xl font-bold tracking-tight text-teal-800">{staff.filter((user) => user.role?.toLowerCase() === 'kasir').length}</p></article></div>

    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]"><div className="border-b border-slate-100 px-5 py-4 md:px-6"><h3 className="text-sm font-bold text-slate-900">Daftar Staf</h3><p className="mt-1 text-xs text-slate-400">{staff.length} data referensi staf</p></div><div className="overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm"><thead className="bg-slate-50/80 text-[10px] uppercase tracking-[.12em] text-slate-400"><tr><th className="px-6 py-3 font-semibold">Nama Staf</th><th className="px-6 py-3 font-semibold">Email</th><th className="px-6 py-3 font-semibold">Peran</th><th className="px-6 py-3 font-semibold">Status</th><th className="px-6 py-3 text-right font-semibold">Aksi</th></tr></thead><tbody>{staff.map((user) => <tr key={user.id} className="border-t border-slate-100 transition hover:bg-slate-50/70"><td className="px-6 py-4"><div className="flex items-center gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-teal-50 text-xs font-bold text-teal-800">{user.name?.trim().charAt(0).toUpperCase() || '?'}</span><span className="font-semibold text-slate-800">{user.name}</span></div></td><td className="px-6 py-4 text-slate-600">{user.email}</td><td className="px-6 py-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${user.role?.toLowerCase() === 'admin' ? 'bg-violet-50 text-violet-700' : 'bg-teal-50 text-teal-800'}`}>{user.role}</span></td><td className="px-6 py-4"><span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500"/>Terdaftar</span></td><td className="px-6 py-4 text-right"><div className="flex justify-end gap-1"><button onClick={() => openEdit(user)} aria-label={`Edit ${user.name}`} className="rounded-lg p-2 text-slate-500 transition hover:bg-teal-50 hover:text-teal-800"><Icon name="edit" size={16}/></button><button onClick={() => deleteStaff(user)} disabled={deletingId === user.id} aria-label={`Hapus ${user.name}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600 disabled:opacity-50"><Icon name="trash" size={16}/></button></div></td></tr>)}</tbody></table>{loading ? <div className="grid min-h-48 place-items-center text-sm text-slate-400"><span className="flex items-center gap-2"><span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-r-transparent"/>Memuat data staf...</span></div> : !staff.length ? <div className="grid min-h-52 place-items-center px-6 text-center"><div><span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-teal-50 text-teal-700"><Icon name="users" size={22}/></span><p className="mt-3 text-sm font-semibold text-slate-700">Belum ada staf</p><p className="mt-1 text-xs text-slate-400">Tambahkan data staf untuk mengisi daftar tim.</p></div></div> : null}</div></section>

    {modalOpen && <div className="fixed inset-0 z-[60] grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeModal() }}><div role="dialog" aria-modal="true" aria-labelledby="staff-modal-title" className="w-full max-w-md rounded-2xl border border-white/60 bg-white p-5 shadow-2xl md:p-6"><div className="mb-5 flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.16em] text-teal-700">Data tim</p><h3 id="staff-modal-title" className="mt-1 text-xl font-bold text-slate-950">{editingId ? 'Edit Staf' : 'Tambah Staf'}</h3><p className="mt-1 text-xs text-slate-500">Data ini hanya menjadi referensi kasir di aplikasi.</p></div><button type="button" onClick={closeModal} aria-label="Tutup" className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"><Icon name="close" size={18}/></button></div><form onSubmit={saveStaff} className="space-y-4"><label className="block text-xs font-semibold text-slate-600">Nama<input required maxLength={120} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="Nama staf" /></label><label className="block text-xs font-semibold text-slate-600">Email<input required type="email" maxLength={254} value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10" placeholder="staf@toko.com" /></label><label className="block text-xs font-semibold text-slate-600">Role<select value={form.role} onChange={(event) => setForm((current) => ({ ...current, role: event.target.value }))} className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm font-normal text-slate-800 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-500/10"><option value="Kasir">Kasir</option><option value="Admin">Admin</option></select></label>{error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-xs text-rose-700">{error}</p>}<div className="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" onClick={closeModal} disabled={saving} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50">Batal</button><button disabled={saving} className="rounded-xl bg-[#0d766e] px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#095d57] disabled:cursor-not-allowed disabled:opacity-50">{saving ? 'Menyimpan...' : 'Simpan Staf'}</button></div></form></div></div>}
  </section>
}
