import { useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
const emptyForm = { name: '', category: 'Coffee', price: '', stock: '', image: '' }
const acceptedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
const idr = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount || 0)

export default function ProductsView({ products = [], userId, onSave, onDelete }) {
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [query, setQuery] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const filteredProducts = useMemo(() => products.filter((product) => product.name?.toLowerCase().includes(query.toLowerCase())), [products, query])

  const resetForm = () => { setForm(emptyForm); setEditingId(null); setImageFile(null); setImagePreview(''); setError('') }
  const editProduct = (product) => {
    setForm({ name: product.name || '', category: product.category || 'Coffee', price: String(product.price ?? ''), stock: String(product.stock ?? 0), image: product.image || product.imageUrl || '' })
    setEditingId(product.id)
    setImageFile(null)
    setImagePreview(product.image || product.imageUrl || '')
    setError('')
    setSuccess('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      let image = form.image || null
      if (imageFile) {
        const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif' }[imageFile.type]
        const filePath = `${Date.now()}-${crypto.randomUUID()}.${extension}`
        const { error: uploadError } = await supabase.storage.from('product-images').upload(filePath, imageFile, { cacheControl: '3600', upsert: false, contentType: imageFile.type })
        if (uploadError) throw uploadError
        image = supabase.storage.from('product-images').getPublicUrl(filePath).data.publicUrl
      }
      await onSave({
        id: editingId,
        name: form.name.trim(),
        price: Number(form.price),
        category: form.category,
        image,
        stock: Number.parseInt(form.stock, 10),
        user_id: userId,
      })
      resetForm()
      setSuccess(editingId ? 'Produk berhasil diperbarui.' : 'Produk berhasil ditambahkan.')
    } catch (saveError) {
      setError(`Produk gagal disimpan: ${saveError.message || 'Terjadi kesalahan.'}`)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (product) => {
    if (!window.confirm(`Hapus produk “${product.name}”?`)) return
    setError('')
    setSuccess('')
    try { await onDelete(product.id); setSuccess('Produk berhasil dihapus.') } catch (deleteError) { setError(`Produk gagal dihapus: ${deleteError.message || 'Terjadi kesalahan.'}`) }
  }

  return <section className="space-y-6">
    <div><p className="text-xs font-medium text-teal-700">INVENTORY</p><h2 className="mt-1 text-2xl font-bold text-slate-900">Products</h2><p className="mt-1 text-sm text-slate-500">Tambah produk, atur harga, dan perbarui stok.</p></div>
    <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,.035)] md:p-6">
      <h3 className="mb-4 text-sm font-bold text-slate-800">{editingId ? 'Edit produk' : 'Tambah produk'}</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <label className="text-xs font-medium text-slate-600">Nama produk<input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder="Contoh: Kopi Susu" /></label>
        <label className="text-xs font-medium text-slate-600">Kategori<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm">{['Coffee', 'Food', 'Drinks', 'Desserts', 'Lainnya'].map((category) => <option key={category}>{category}</option>)}</select></label>
        <label className="text-xs font-medium text-slate-600">Harga (Rp)<input required type="number" min="0" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder="18000" /></label>
        <label className="text-xs font-medium text-slate-600">Stok<input required type="number" min="0" step="1" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm" placeholder="20" /></label>
        <label className="text-xs font-medium text-slate-600">Upload gambar (opsional)<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; if (!acceptedImageTypes.includes(file.type)) { setError('Gunakan gambar JPG, PNG, WebP, GIF, atau AVIF.'); e.target.value = ''; return } if (file.size > 5 * 1024 * 1024) { setError('Ukuran gambar maksimal 5 MB.'); e.target.value = ''; return } setError(''); setImageFile(file); setImagePreview(URL.createObjectURL(file)) }} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-xs file:mr-2 file:rounded-md file:border-0 file:bg-teal-50 file:px-2 file:py-1 file:font-semibold file:text-teal-800" />{imagePreview && <img src={imagePreview} alt="Preview gambar produk" className="mt-2 h-16 w-16 rounded-lg object-cover" />}<span className="mt-1 block text-[10px] font-normal text-slate-400">JPG, PNG, WebP, GIF, atau AVIF; maksimal 5 MB.</span></label>
      </div>
      {error && <p role="alert" className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">{error}</p>}
      {success && <p role="status" className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700">{success}</p>}
      <div className="mt-4 flex gap-2"><button disabled={saving} className="rounded-xl bg-[#0d766e] px-4 py-2.5 text-xs font-semibold text-white disabled:opacity-50">{saving ? 'Menyimpan…' : editingId ? 'Simpan perubahan' : 'Tambah produk'}</button>{editingId && <button type="button" onClick={resetForm} className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-semibold text-slate-600">Batal</button>}</div>
    </form>
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,.035)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5"><div><h3 className="text-sm font-bold text-slate-800">Daftar produk</h3><p className="mt-1 text-xs text-slate-400">{products.length} produk</p></div><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari produk…" className="rounded-lg border border-slate-200 px-3 py-2 text-xs" /></div>
      <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-400"><tr><th className="px-5 py-3">Produk</th><th className="px-5 py-3">Kategori</th><th className="px-5 py-3">Harga</th><th className="px-5 py-3">Stok</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody>{filteredProducts.map((product) => <tr key={product.id} className="border-t border-slate-100"><td className="px-5 py-3 font-semibold text-slate-700">{product.name}</td><td className="px-5 py-3 text-slate-500">{product.category}</td><td className="px-5 py-3 text-slate-600">{idr(product.price)}</td><td className="px-5 py-3"><span className={Number(product.stock) <= 5 ? 'font-semibold text-rose-600' : 'text-slate-600'}>{product.stock ?? 0}</span></td><td className="px-5 py-3"><div className="flex gap-2"><button onClick={() => editProduct(product)} className="rounded-lg bg-teal-50 px-3 py-1.5 font-semibold text-teal-800">Edit</button><button onClick={() => remove(product)} className="rounded-lg bg-rose-50 px-3 py-1.5 font-semibold text-rose-700">Hapus</button></div></td></tr>)}</tbody></table>{!filteredProducts.length && <p className="p-8 text-center text-xs text-slate-400">Belum ada produk. Isi formulir di atas untuk menambahkan.</p>}</div>
    </section>
  </section>
}
