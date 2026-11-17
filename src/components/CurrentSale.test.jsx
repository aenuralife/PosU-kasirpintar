import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CurrentSale from '../components/CurrentSale';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../supabaseClient';
import { vi } from 'vitest';

vi.mock('../store/useCartStore');
vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('CurrentSale Checkout Logic & Warnings', () => {
  beforeAll(() => {
    window.print = vi.fn();
  });

  beforeEach(() => {
    useCartStore.mockReturnValue([{ id: 1, name: 'Kopi', price: 10000, qty: 5, stock: 10 }]);
    useCartStore.mockImplementation((selector) => {
      const state = {
        items: [{ id: 1, name: 'Kopi', price: 10000, qty: 5, stock: 10 }],
        updateQuantity: vi.fn(),
        removeItem: vi.fn(),
        clearCart: vi.fn(),
        getSubtotal: () => 10000,
        getTax: () => 800,
        getTotal: () => 10800,
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Checkout dengan peringatan stok tidak mencukupi', async () => {
    // Mock insert transaksi berhasil
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    // Mock cek stok (stok di database ternyata hanya sisa 2, sedangkan qty 5)
    const mockSelect = vi.fn().mockResolvedValue({ data: { id: 1, stock: 2 }, error: null });
    
    supabase.from.mockImplementation((table) => {
      if (table === 'transactions_final') return { insert: mockInsert };
      if (table === 'products') return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: mockSelect };
      if (table === 'store_settings') return { select: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({}) };
    });

    render(<CurrentSale />);
    
    // Klik bayar
    fireEvent.click(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'button' && content.includes('Bayar Rp 10.800');
    }));
    
    await waitFor(() => {
      expect(screen.getByText(/Transaksi tersimpan, tetapi stok perlu diperiksa: Kopi: stok tersisa 2, transaksi mencatat 5/i)).toBeInTheDocument();
    });
  });

  test('Memicu fungsi Cetak Struk', async () => {
    const mockInsert = vi.fn().mockResolvedValue({ error: null });
    const mockSelect = vi.fn().mockResolvedValue({ data: { id: 1, stock: 10 }, error: null });
    const mockUpdate = vi.fn().mockResolvedValue({ data: { id: 1, stock: 5 }, error: null });
    
    supabase.from.mockImplementation((table) => {
      if (table === 'transactions_final') return { insert: mockInsert };
      if (table === 'products') {
        return {
          select: vi.fn().mockReturnThis(),
          update: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          maybeSingle: mockSelect
        };
      }
      return { select: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({}) };
    });

    render(<CurrentSale />);
    fireEvent.click(screen.getByText((content, element) => {
      return element.tagName.toLowerCase() === 'button' && content.includes('Bayar Rp 10.800');
    }));

    // PERBAIKAN DI SINI:
    // Gunakan findByRole untuk menunggu elemen muncul tanpa membungkusnya dalam waitFor
    const btnPrint = await screen.findByRole('button', { name: /Cetak Struk/i });
    
    // Lakukan aksi klik (side-effect) di luar dari waitFor
    fireEvent.click(btnPrint);
    
    // Verifikasi pemanggilan window.print()
    await waitFor(() => {
      expect(window.print).toHaveBeenCalled();
    });
  });
});