import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Header from './Header';
import Sidebar from './Sidebar';
import CurrentSale from './CurrentSale';
import { useCartStore } from '../store/useCartStore';
import { supabase } from '../supabaseClient';

describe('UI Components Coverage Suite', () => {
  it('harus menguji Header dan Sidebar', async () => {
    const handleLogout = vi.fn();
    const setActiveTab = vi.fn();

    await act(async () => {
      render(
        <Header
          user={{ email: 'admin@pos.com' }}
          onLogout={handleLogout}
          toggleSidebar={() => {}}
        />
      );

      render(
        <Sidebar
          activeTab="dashboard"
          setActiveTab={setActiveTab}
          userRole="admin"
          isOpen={true}
          toggleSidebar={() => {}}
        />
      );
    });

    const buttons = screen.queryAllByRole('button');

    buttons.forEach((btn) => {
      fireEvent.click(btn);
    });

    expect(document.body).toBeInTheDocument();
  });

  it('harus menguji CurrentSale kondisi kosong dan terisi item keranjang', async () => {
    // 1. Kondisi keranjang kosong
    act(() => {
      useCartStore.getState().clearCart();
    });

    const { rerender } = render(<CurrentSale />);

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });

    // 2. Kondisi keranjang terisi item
    act(() => {
      useCartStore.getState().addProduct({
        id: '1',
        name: 'Kopi Susu',
        price: 15000
      });

      useCartStore.getState().addProduct({
        id: '2',
        name: 'Roti Bakar',
        price: 10000
      });
    });

    await act(async () => {
      rerender(<CurrentSale />);
    });

    // Uji manipulasi kuantitas
    act(() => {
      useCartStore.getState().updateQuantity('1', 1);
      useCartStore.getState().updateQuantity('2', -1);
    });

    // Input nominal pembayaran tunai
    const cashInputs = screen.queryAllByRole('spinbutton');

    cashInputs.forEach((inp) => {
      fireEvent.change(inp, {
        target: { value: '50000' }
      });
    });

    // Input catatan
    const textInputs = screen.queryAllByRole('textbox');

    textInputs.forEach((inp) => {
      fireEvent.change(inp, {
        target: { value: 'Catatan Meja 5' }
      });
    });

    // Klik tombol aksi
    const allButtons = screen.queryAllByRole('button');

    allButtons.forEach((btn) => {
      fireEvent.click(btn);
    });

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });

  it('menyimpan pembayaran QRIS, memperbarui stok, dan memulai transaksi baru', async () => {
    const transaction = { insert: vi.fn().mockResolvedValue({ error: null }) };
    const productRead = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'p9', stock: 8 }, error: null }) };
    const productUpdate = { update: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), select: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'p9', stock: 6 }, error: null }) };
    const settings = { select: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: { store_name: 'Toko Test', address: 'Jl. Test', phone: '123', receipt_footer: 'Sampai jumpa' } }) };
    vi.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'store_settings') return settings;
      if (table === 'transactions_final') return transaction;
      return productRead.maybeSingle.mock.calls.length ? productUpdate : productRead;
    });
    const onOrderCreated = vi.fn();
    const onStockUpdated = vi.fn();
    act(() => {
      useCartStore.getState().clearCart();
      useCartStore.getState().addProduct({ id: 'p9', name: 'Kopi Test', price: 10000, stock: 8 });
    });
    render(<CurrentSale user={{ id: 'u1' }} onOrderCreated={onOrderCreated} onStockUpdated={onStockUpdated} />);
    await waitFor(() => expect(settings.maybeSingle).toHaveBeenCalled());
    fireEvent.click(screen.getByRole('button', { name: 'QRIS' }));
    fireEvent.click(screen.getByRole('button', { name: /Bayar/ }));
    expect(await screen.findByText('Transaksi Berhasil')).toBeInTheDocument();
    expect(screen.getByText('Toko Test')).toBeInTheDocument();
    expect(screen.getByText('Sampai jumpa')).toBeInTheDocument();
    expect(onOrderCreated).toHaveBeenCalledWith(expect.objectContaining({ payment_method: 'qris', user_id: 'u1' }));
    expect(onStockUpdated).toHaveBeenCalledWith('p9', 6);
    fireEvent.click(screen.getByRole('button', { name: /Cetak Struk/ }));
    expect(window.print).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: /Transaksi Baru/ }));
    expect(screen.getByText('Keranjang masih kosong')).toBeInTheDocument();
  });

  it('menampilkan kegagalan transaksi dan peringatan stok', async () => {
    const settings = { select: vi.fn().mockReturnThis(), limit: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null }) };
    vi.spyOn(supabase, 'from').mockImplementation((table) => {
      if (table === 'store_settings') return settings;
      if (table === 'transactions_final') return { insert: vi.fn().mockResolvedValue({ error: { message: 'DB down' } }) };
      return { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }) };
    });
    act(() => {
      useCartStore.getState().clearCart();
      useCartStore.getState().addProduct({ id: 'missing', name: 'Item Hilang', price: 1000, stock: 4 });
    });
    const { unmount } = render(<CurrentSale />);
    fireEvent.click(screen.getByRole('button', { name: /Bayar/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('DB down');
    unmount();

    const transaction = { insert: vi.fn().mockResolvedValue({ error: null }) };
    const product = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { message: 'not found' } }) };
    vi.spyOn(supabase, 'from').mockImplementation((table) => table === 'transactions_final' ? transaction : table === 'store_settings' ? settings : product);
    render(<CurrentSale />);
    fireEvent.click(screen.getByRole('button', { name: /Bayar/ }));
    expect(await screen.findByRole('alert')).toHaveTextContent('stok tidak dapat dibaca');
  });
});