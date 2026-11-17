import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReportsView from '../views/ReportsView';
import { supabase } from '../supabaseClient';
import { vi, describe, beforeAll, afterEach, test, expect } from 'vitest';

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('ReportsView Edge Cases & Branch Coverage', () => {
  beforeAll(() => {
    // Mock Blob & URL API untuk test "Unduh Excel"
    window.URL.createObjectURL = vi.fn();
    window.URL.revokeObjectURL = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('Menangani error useEffect saat gagal memuat laporan', async () => {
    const mockError = new Error('Database timeout');
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: mockError }),
    });

    render(<ReportsView userId="123" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Laporan gagal dimuat: Database timeout');
    });
  });

  test('Fungsi Unduh Excel memicu manipulasi DOM dengan benar', async () => {
    // Buat data mock dengan tanggal HARI INI agar masuk ke filter period === 'today'
    const mockOrders = [
      { id: '1', grand_total: 50000, subtotal: 45000, payment_method: 'cash', create_at: new Date().toISOString() }
    ];
    
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockOrders, error: null }),
    });

    render(<ReportsView userId="123" />);

    // 1. Tunggu hingga tombol "Unduh Excel" muncul
    const unduhBtn = await screen.findByRole('button', { name: /Unduh Excel/i });

    // 2. Tunggu sampai data selesai di-load dan tombol menjadi aktif (tidak disabled)
    await waitFor(() => {
      expect(unduhBtn).not.toBeDisabled();
    });

    // 3. Lakukan aksi klik (side-effect) di LUAR waitFor
    fireEvent.click(unduhBtn);
    
    // 4. Pastikan fungsi Blob URL dipanggil untuk membuat file CSV
    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });
  });

  // ==========================================
  // TAMBAHAN TES UNTUK MENDONGKRAK BRANCH > 90%
  // ==========================================

  test('Menangani validasi tanggal tak beraturan (Coverage getOrderDate null/invalid)', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 1, create_at: "Invalid-Date-Format", grand_total: 10000, user_id: "123" },
          { id: 2, create_at: null, grand_total: 5000, user_id: "123" }
        ],
        error: null
      })
    });

    render(<ReportsView userId="123" />);

    await waitFor(() => {
      // Data yang tanggalnya null/invalid tidak akan masuk ke perhitungan Hari Ini
      // Sehingga total pendapatannya harusnya Rp 0.
      // Menggunakan getAllByText karena "Rp 0" muncul di lebih dari 1 card metrik.
      const zeroRupiahElements = screen.getAllByText(/Rp\s?0/i);
      expect(zeroRupiahElements[0]).toBeInTheDocument();
    });
  });

  test('Menangani unmount dan promise reject saat loading data (Baris catch error)', async () => {
    // Paksa promise throw error (bukan mengembalikan object {error})
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockRejectedValue(new Error('Jaringan putus')),
    });

    render(<ReportsView userId="123" />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Laporan gagal dimuat: Jaringan putus');
    });
  });

  test('Memilih dan mengubah tampilan ke laporan bulanan (Branch select month)', async () => {
    supabase.from.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: 3, create_at: "2024-05-10T10:00:00.000Z", payment_method: "qris", grand_total: 50000, user_id: "123" },
        ],
        error: null
      })
    });

    render(<ReportsView userId="123" />);

    // Cek perubahan ke bulan spesifik (misal Mei 2024)
    const monthInput = screen.getByLabelText(/Pilih bulan laporan/i);
    fireEvent.change(monthInput, { target: { value: "2024-05" } });
    
    await waitFor(() => {
      // UI akan berubah mencerminkan bulan yang dipilih
      // Menggunakan getAllByText karena label bulan muncul di bawah tiap card metrik
      const monthLabels = screen.getAllByText(/Mei 2024/i);
      expect(monthLabels[0]).toBeInTheDocument();
    });
  });
});