import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import SalesView from './SalesView'
import { useCartStore } from '../store/useCartStore'
import { useUIStore } from '../store/useUIStore'

// Mock Stores
vi.mock('../store/useCartStore')
vi.mock('../store/useUIStore')
vi.mock('../components/Sidebar', () => ({
  Icon: () => <svg data-testid="icon" />
}))

describe('SalesView Component', () => {
  const mockAddProduct = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    useCartStore.mockImplementation((selector) => {
      // Mock cartItems (1 produk ada di keranjang untuk tes batas stok)
      if (selector.toString().includes('items')) return [{ id: 1, qty: 1 }]
      if (selector.toString().includes('addProduct')) return mockAddProduct
      return []
    })
    
    useUIStore.mockImplementation((selector) => {
      if (selector.toString().includes('searchQuery')) return ''
      return {}
    })
  })

  const mockProducts = [
    { id: 1, name: 'Espresso', category: 'Coffee', price: 20000, stock: 1 }, // Stok sisa 1 (terpenuhi di keranjang)
    { id: 2, name: 'Nasi Goreng', category: 'Food', price: 25000, stock: 10 },
    { id: 3, name: 'Es Teh', category: 'Drinks', price: 5000, stock: 5 },
    { id: 4, name: 'Donat Coklat', category: 'Desserts', price: 8000, stock: 0 } // Habis
  ]

  const mockTransactions = [
    { id: 101, grand_total: 50000, customer_name: 'Ali', timestamp: new Date().toISOString() }
  ]

  it('merender metrik dan semua produk (baris 23-24 coverage)', () => {
    render(<SalesView products={mockProducts} transactions={mockTransactions} />)
    
    expect(screen.getByText('Espresso')).toBeInTheDocument()
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument()
  })

  it('memfilter produk berdasarkan kategori dan pencarian (baris 10-13 coverage)', () => {
    render(<SalesView products={mockProducts} transactions={mockTransactions} />)
    
   // Tes klik filter "Food"
    fireEvent.click(screen.getByRole('button', { name: 'Food' }));
    expect(screen.getByText('Nasi Goreng')).toBeInTheDocument();
    expect(screen.queryByText('Espresso')).not.toBeInTheDocument();

    // Tes klik filter "Drinks"
    fireEvent.click(screen.getByRole('button', { name: 'Drinks' }));
    expect(screen.getByText('Es Teh')).toBeInTheDocument();

    // Tes klik filter "Desserts"
    fireEvent.click(screen.getByRole('button', { name: 'Desserts' }));
    expect(screen.getByText('Donat Coklat')).toBeInTheDocument();
  })

  it('menangani state tombol tambah dan limitasi stok (baris 40 coverage)', () => {
    render(<SalesView products={mockProducts} transactions={[]} />)
    
    // Tombol 'Nasi Goreng' harus bisa diklik (Stok 10)
    const addNasiBtn = screen.getByLabelText('Add Nasi Goreng')
    expect(addNasiBtn).not.toBeDisabled()
    fireEvent.click(addNasiBtn)
    expect(mockAddProduct).toHaveBeenCalledWith(mockProducts[1])

    // Tombol 'Espresso' harus disabled karena stok 1, dan di keranjang sudah 1
    const addEspressoBtn = screen.getByLabelText('Add Espresso')
    expect(addEspressoBtn).toBeDisabled()

    // Tombol 'Donat Coklat' harus disabled karena stok 0
    const addDonatBtn = screen.getByLabelText('Add Donat Coklat')
    expect(addDonatBtn).toBeDisabled()
  })

  it('menampilkan status kosong ketika tidak ada produk cocok', () => {
    // Simulasi UI store sedang mencari teks yang tidak ada
    useUIStore.mockImplementation((selector) => {
      if (selector.toString().includes('searchQuery')) return 'ProdukGaib'
      return {}
    })

    render(<SalesView products={mockProducts} transactions={[]} />)
    
    // Pastikan UI empty state tampil
    expect(screen.getByText('No products found')).toBeInTheDocument()
  })
})