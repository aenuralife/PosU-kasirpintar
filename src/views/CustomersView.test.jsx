import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import CustomersView from './CustomersView';
import { supabase } from '../supabaseClient';

const rows = [
  { id: 'c1', name: 'Ayu Putri', phone: '08123', email: 'ayu@example.com', address: 'Bandung' },
  { id: 'c2', name: 'Budi Santoso', phone: null, email: null, address: null },
];

describe('CustomersView', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('memuat, mencari, menambah, dan menghapus pelanggan', async () => {
    const deleteEq = vi.fn().mockReturnThis();
    const deleteQuery = { eq: deleteEq, then: (resolve) => resolve({ error: null }) };
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: rows, error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: { id: 'c3', name: 'Citra', phone: null, email: null, address: null }, error: null }),
      delete: vi.fn(() => deleteQuery),
    };
    vi.spyOn(supabase, 'from').mockReturnValue(chain);
    render(<CustomersView userId="u1" />);
    expect(await screen.findByText('Ayu Putri')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cari pelanggan'), { target: { value: 'bandung' } });
    expect(screen.getByText('Ayu Putri')).toBeInTheDocument();
    expect(screen.queryByText('Budi Santoso')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cari pelanggan'), { target: { value: 'tidak ada' } });
    expect(screen.getByText('Pelanggan tidak ditemukan')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Cari pelanggan'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah Pelanggan' }));
    fireEvent.change(screen.getByLabelText('Nama'), { target: { value: ' Citra ' } });
    fireEvent.change(screen.getByLabelText('No. Telepon'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText('Alamat'), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Pelanggan' }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil ditambahkan');

    window.confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus pelanggan Ayu Putri' }));
    expect(chain.delete).not.toHaveBeenCalled();
    window.confirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getByRole('button', { name: 'Hapus pelanggan Ayu Putri' }));
    await waitFor(() => expect(chain.delete).toHaveBeenCalled());
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dihapus');
  });

  it('menutup modal dan menampilkan error saat penyimpanan gagal', async () => {
    const chain = {
      select: vi.fn().mockReturnThis(), eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: 'insert gagal' } }),
    };
    vi.spyOn(supabase, 'from').mockReturnValue(chain);
    render(<CustomersView userId="u1" />);
    fireEvent.click(await screen.findByRole('button', { name: 'Tambah Pelanggan' }));
    fireEvent.change(screen.getByLabelText('Nama'), { target: { value: 'Dewi' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Pelanggan' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('insert gagal');
    fireEvent.mouseDown(screen.getByRole('presentation'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(await screen.findByText('Belum ada pelanggan')).toBeInTheDocument();
  });
});