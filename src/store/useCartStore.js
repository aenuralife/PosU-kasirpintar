import { create } from 'zustand'

export const TAX_RATE = 0.08

export const useCartStore = create((set, get) => ({
  items: [],
  addProduct: (product) => set((state) => {
    const existing = state.items.find((item) => String(item.id) === String(product.id))
    return { items: existing
      ? state.items.map((item) => String(item.id) === String(product.id) ? { ...item, qty: item.qty + 1 } : item)
      : [...state.items, { ...product, qty: 1 }] }
  }),
  updateQuantity: (id, delta) => set((state) => ({
    items: state.items.map((item) => String(item.id) === String(id) ? { ...item, qty: item.qty + delta } : item).filter((item) => item.qty > 0),
  })),
  removeItem: (id) => set((state) => ({ items: state.items.filter((item) => String(item.id) !== String(id)) })),
  clearCart: () => set({ items: [] }),
  getTotal: () => get().items.reduce((sum, item) => sum + Number(item.price || 0) * item.qty, 0),
  getSubtotal: () => Math.round(get().getTotal() / (1 + TAX_RATE)),
  getTax: () => get().getTotal() - get().getSubtotal(),
  getCount: () => get().items.reduce((sum, item) => sum + item.qty, 0),
}))
