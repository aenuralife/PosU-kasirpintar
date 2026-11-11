import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import OrdersView from './OrdersView';
import { supabase } from '../supabaseClient';

describe('OrdersView', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('menampilkan, mencari, dan membuka rincian transaksi', async () => {
    const data = [
      { id: 'order-10001', date: '2026-11-10', items: [{ id: 'i1', name: 'Kopi Susu', qty: 2, price: 15000 }], grand_total: 30000, payment_method: 'qris' },
      { id: 'order-10002', date: 'invalid-date', items: '[{"name":"Roti","qty":1,"price":8000}]', grand_total: 8000, payment_method: 'cash' },
      { id: 'order-10003', items: '{broken', grand_total: 5000, payment_method: null },
    ];
    const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockResolvedValue({ data, error: null }) };
    vi.spyOn(supabase, 'from').mockReturnValue(chain);
    render(<OrdersView userId="u1" />);
    expect(await screen.findByRole('cell', { name: /r-10001/ })).toBeInTheDocument();
    expect(screen.getByText(/43\.000/)).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cari ID atau produk'), { target: { value: 'roti' } });
    expect(screen.getByRole('cell', { name: /r-10002/ })).toBeInTheDocument();
    expect(screen.queryByRole('cell', { name: /r-10001/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cari ID atau produk'), { target: { value: 'tidak ketemu' } });
    expect(screen.getByText('Transaksi tidak ditemukan')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cari ID atau produk'), { target: { value: '' } });
    fireEvent.click(screen.getAllByRole('button', { name: 'Lihat item' })[0]);
    expect(screen.getByRole('dialog')).toHaveTextContent('Kopi Susu');
    fireEvent.mouseDown(screen.getByRole('presentation'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: 'Lihat item' })[2]);
    expect(screen.getByRole('dialog')).toHaveTextContent('Rincian item tidak tersedia.');
    fireEvent.click(screen.getByRole('button', { name: 'Tutup detail' }));
  });

  it('menangani tanpa user dan kegagalan pemuatan', async () => {
    const { unmount } = render(<OrdersView />);
    expect(await screen.findByText('Belum ada transaksi')).toBeInTheDocument();
    unmount();
    const chain = { select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(), order: vi.fn().mockRejectedValue(new Error('network down')) };
    vi.spyOn(supabase, 'from').mockReturnValue(chain);
    render(<OrdersView userId="u1" />);
    expect(await screen.findByRole('alert')).toHaveTextContent('network down');
  });
});