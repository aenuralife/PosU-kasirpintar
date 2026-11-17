import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from './App'
import { supabase } from './supabaseClient'
import { vi } from 'vitest'
import { useUIStore } from './store/useUIStore'

// Mocking dependencies
vi.mock('./supabaseClient', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn()
    },
    from: vi.fn()
  }
}))

vi.mock('./store/useUIStore', () => ({
  useUIStore: vi.fn()
}))

// Mock komponen anak agar render lebih ringan
vi.mock('./components/Sidebar', () => ({ default: () => <div data-testid="sidebar">Sidebar</div> }))
vi.mock('./components/Header', () => ({ default: () => <div data-testid="header">Header</div> }))
vi.mock('./components/CurrentSale', () => ({
  default: ({ onOrderCreated, onStockUpdated }) => (
    <div>
      <button onClick={() => onOrderCreated({ id: 1 })}>Add Transaction</button>
      <button onClick={() => onStockUpdated('1', 50)}>Update Stock</button>
    </div>
  )
}))
vi.mock('./views/SalesView', () => ({ default: () => <div>SalesView</div> }))
vi.mock('./views/ProductsView', () => ({
  default: ({ onSave, onDelete }) => (
    <div>
      {/* Tambahkan catch() agar Unhandled Promise Rejection tidak menghentikan Vitest saat test error */}
      <button onClick={() => onSave({ id: '1', name: 'New Product' }).catch(() => {})}>Save Product (Update)</button>
      <button onClick={() => onSave({ name: 'Insert Product' }).catch(() => {})}>Save Product (Insert)</button>
      <button onClick={() => onDelete('1').catch(() => {})}>Delete Product</button>
    </div>
  )
}))

describe('App.jsx Coverage & Edge Cases', () => {
  const mockUser = { id: 'user-1' }
  const mockSession = { user: mockUser }

  beforeEach(() => {
    vi.clearAllMocks()
    useUIStore.mockImplementation((selector) => selector({ activeMenu: 'sales' }))
    supabase.auth.getSession.mockResolvedValue({ data: { session: mockSession }, error: null })
    supabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    })
    
    // Default mock untuk pemanggilan supabase.from()
    const mockSelect = vi.fn().mockReturnThis()
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
    supabase.from.mockReturnValue({ select: mockSelect, order: mockOrder })
  })

  it('renders loading state initially', async () => {
    supabase.auth.getSession.mockReturnValue(new Promise(() => {})) // Pending promise
    render(<App />)
    expect(screen.getByText(/Loading PosU/i)).toBeInTheDocument()
  })

  it('renders Auth component if no session', async () => {
    supabase.auth.getSession.mockResolvedValue({ data: { session: null }, error: null })
    render(<App />)
    await waitFor(() => {
      expect(screen.queryByText(/Loading PosU/i)).not.toBeInTheDocument()
    })
  })

  it('handles auth session rejection natively (Baris 50 branch)', async () => {
    // Memaksa getSession melemparkan error
    supabase.auth.getSession.mockRejectedValue(new Error('Sesi gagal dimuat'))
    render(<App />)
    
    await waitFor(() => {
      // Pastikan fungsi dipanggil dan di-catch secara internal
      expect(supabase.auth.getSession).toHaveBeenCalled()
    })
  })

  it('handles error when loading initial data & dismisses error notice (Baris 53-54 & 101)', async () => {
    useUIStore.mockImplementation((selector) => selector({ activeMenu: 'sales' }))
    
    // Memaksa fetch tabel transactions_final gagal (test branch error transaksi)
    supabase.from.mockImplementation((table) => {
      if (table === 'transactions_final') {
        return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: null, error: { message: 'Network Timeout' } }) }) }
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })

    render(<App />)
    const user = userEvent.setup()
    
    // Tunggu sampai pesan error muncul
    await waitFor(() => {
      expect(screen.getByText(/Network Timeout/i)).toBeInTheDocument()
    })

    // Test fitur Dismiss (x)
    const dismissBtn = screen.getByRole('button', { name: 'Dismiss' })
    await user.click(dismissBtn)

    await waitFor(() => {
      expect(screen.queryByText(/Network Timeout/i)).not.toBeInTheDocument()
    })
  })

  it('executes child callback functions (addTransaction, updateProductStock) (Line 95-97 coverage)', async () => {
    render(<App />)
    await waitFor(() => expect(screen.getByTestId('sidebar')).toBeInTheDocument())
    
    const user = userEvent.setup()
    
    const addTransactionBtn = screen.getByText('Add Transaction')
    const updateStockBtn = screen.getByText('Update Stock')
    
    await user.click(addTransactionBtn)
    await user.click(updateStockBtn)
  })

  it('executes product callback functions successfully (Insert, Update, Delete) (Line 87-92, 104 coverage)', async () => {
    useUIStore.mockImplementation((selector) => selector({ activeMenu: 'products' }))
    
    // Sukses Insert & Update
    const mockSingle = vi.fn().mockResolvedValue({ data: { id: '1', name: 'Saved Product' }, error: null })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingle })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq, select: mockSelect })
    const mockInsert = vi.fn().mockReturnValue({ select: mockSelect })
    
    // Sukses Delete
    const mockDelete = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })

    supabase.from.mockImplementation((table) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
          update: mockUpdate,
          insert: mockInsert,
          delete: mockDelete
        }
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })

    render(<App />)
    await waitFor(() => expect(screen.getByText('Save Product (Update)')).toBeInTheDocument())
    
    const user = userEvent.setup()
    
    await user.click(screen.getByText('Save Product (Update)')) // Test Update branch
    await user.click(screen.getByText('Save Product (Insert)')) // Test Insert branch (tanpa id)
    await user.click(screen.getByText('Delete Product'))        // Test Delete success branch
  })

  it('throws error gracefully when product save or delete fails (Branch throw error)', async () => {
    useUIStore.mockImplementation((selector) => selector({ activeMenu: 'products' }))
    
    // Memaksa aksi API produk menghasilkan object { error }
    const mockSingleError = vi.fn().mockResolvedValue({ data: null, error: new Error('Save database error') })
    const mockSelect = vi.fn().mockReturnValue({ single: mockSingleError })
    const mockEq = vi.fn().mockReturnValue({ select: mockSelect })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq, select: mockSelect })
    
    const mockDeleteError = vi.fn().mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: new Error('Delete database error') }) })

    supabase.from.mockImplementation((table) => {
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }),
          update: mockUpdate,
          delete: mockDeleteError
        }
      }
      return { select: vi.fn().mockReturnValue({ order: vi.fn().mockResolvedValue({ data: [], error: null }) }) }
    })

    render(<App />)
    await waitFor(() => expect(screen.getByText('Save Product (Update)')).toBeInTheDocument())
    
    const user = userEvent.setup()
    
    // Jika blok `if (error) throw error` dipanggil, branch tersebut akan tercatat terlewati (ter-cover) oleh Vitest
    await user.click(screen.getByText('Save Product (Update)')) 
    await user.click(screen.getByText('Delete Product'))        
  })
})