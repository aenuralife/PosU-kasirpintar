import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import UsersView from './UsersView'
import { supabase } from '../supabaseClient'
import { vi } from 'vitest'

vi.mock('../supabaseClient', () => ({
  supabase: { from: vi.fn() }
}))

describe('UsersView.jsx', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    window.confirm = vi.fn(() => true) // Bypass window.confirm
  })

  it('loads and displays staff data', async () => {
    const mockData = [
      { id: 1, name: 'Budi', email: 'budi@test.com', role: 'Kasir', create_at: '2023-01-01' }
    ]
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
    supabase.from.mockReturnValue({ select: vi.fn().mockReturnValue({ order: mockOrder }) })

    render(<UsersView />)
    await waitFor(() => {
      expect(screen.getByText('Budi')).toBeInTheDocument()
      expect(screen.getByText('budi@test.com')).toBeInTheDocument()
    })
  })

  it('handles query error on load (coverage line 30)', async () => {
    const mockOrder = vi.fn().mockResolvedValue({ data: null, error: { message: 'Fetch error' } })
    supabase.from.mockReturnValue({ select: vi.fn().mockReturnValue({ order: mockOrder }) })

    render(<UsersView />)
    await waitFor(() => {
      expect(screen.getByText(/Data staf gagal dimuat: Fetch error/i)).toBeInTheDocument()
    })
  })

  it('can open create modal, fill form, and save new staff (coverage line 74-96)', async () => {
    // Mock load awal (kosong)
    const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null })
    const mockSelectSingle = vi.fn().mockResolvedValue({ 
      data: { id: 2, name: 'Siti', email: 'siti@test.com', role: 'Admin' }, 
      error: null 
    })
    const mockInsert = vi.fn().mockReturnValue({ select: vi.fn().mockReturnValue({ single: mockSelectSingle }) })

    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ order: mockOrder }),
      insert: mockInsert
    }))

    render(<UsersView />)
    const user = userEvent.setup()
    
    // Buka Modal
    await user.click(screen.getByText('Tambah Staf'))
    expect(screen.getByText('Tambah Staf', { selector: 'h3' })).toBeInTheDocument()

    // Isi Form
    await user.type(screen.getByLabelText(/Nama/i), 'Siti')
    await user.type(screen.getByLabelText(/Email/i), 'siti@test.com')
    
    // Submit
    await user.click(screen.getByText('Simpan Staf'))
    
    await waitFor(() => {
      expect(screen.getByText('Staf berhasil ditambahkan.')).toBeInTheDocument()
    })
  })

  it('can delete a staff member (coverage line 108-110)', async () => {
    const mockData = [{ id: 1, name: 'Budi', email: 'budi@test.com', role: 'Kasir' }]
    const mockOrder = vi.fn().mockResolvedValue({ data: mockData, error: null })
    
    const mockDeleteEq = vi.fn().mockResolvedValue({ error: null })
    const mockDelete = vi.fn().mockReturnValue({ eq: mockDeleteEq })

    supabase.from.mockImplementation(() => ({
      select: vi.fn().mockReturnValue({ order: mockOrder }),
      delete: mockDelete
    }))

    render(<UsersView />)
    await waitFor(() => expect(screen.getByText('Budi')).toBeInTheDocument())

    const user = userEvent.setup()
    const deleteBtn = screen.getByLabelText('Hapus Budi')
    await user.click(deleteBtn)

    expect(window.confirm).toHaveBeenCalledWith('Hapus data staf Budi?')
    
    await waitFor(() => {
      expect(screen.getByText('Data staf berhasil dihapus.')).toBeInTheDocument()
    })
  })
})