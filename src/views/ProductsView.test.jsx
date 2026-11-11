import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ProductsView from './ProductsView';

const products = [
  { id: 'p1', name: 'Kopi Susu', category: 'Coffee', price: 18000, stock: 3 },
  { id: 'p2', name: 'Roti Bakar', category: 'Food', price: 12000, stock: 12 },
];

describe('ProductsView', () => {
  it('mencari, menambah, mengedit, dan menghapus produk', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onDelete = vi.fn().mockResolvedValue(undefined);
    window.scrollTo = vi.fn();
    render(<ProductsView products={products} userId="u1" onSave={onSave} onDelete={onDelete} />);

    expect(screen.getByText('Kopi Susu')).toBeInTheDocument();
    expect(screen.getByText('3')).toHaveClass('text-rose-600');
    fireEvent.change(screen.getByLabelText('Cari produk'), { target: { value: 'roti' } });
    expect(screen.getByText('Roti Bakar')).toBeInTheDocument();
    expect(screen.queryByText('Kopi Susu')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Cari produk'), { target: { value: '' } });

    fireEvent.change(screen.getByLabelText('Nama produk'), { target: { value: '  Teh Lemon  ' } });
    fireEvent.change(screen.getByLabelText('Harga (Rp)'), { target: { value: '9000' } });
    fireEvent.change(screen.getByLabelText('Stok'), { target: { value: '8' } });
    fireEvent.change(screen.getByLabelText('Kategori'), { target: { value: 'Drinks' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah produk' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledWith({
      id: null, name: 'Teh Lemon', price: 9000, category: 'Drinks', image: null, stock: 8, user_id: 'u1',
    }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil ditambahkan');

    fireEvent.click(screen.getAllByRole('button', { name: 'Edit' })[0]);
    expect(screen.getByText('Edit produk')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Nama produk'), { target: { value: 'Kopi Edit' } });
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.getByRole('heading', { name: 'Tambah produk' })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    await waitFor(() => expect(onDelete).toHaveBeenCalledWith('p1'));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dihapus');
  });

  it('menampilkan kegagalan simpan dan hapus serta memvalidasi upload gambar', async () => {
    const onSave = vi.fn().mockRejectedValueOnce(new Error('DB offline'));
    const onDelete = vi.fn().mockRejectedValueOnce(new Error('DB offline'));
    render(<ProductsView products={products} userId="u1" onSave={onSave} onDelete={onDelete} />);
    fireEvent.change(screen.getByLabelText('Nama produk'), { target: { value: 'Produk Gagal' } });
    fireEvent.change(screen.getByLabelText('Harga (Rp)'), { target: { value: '1000' } });
    fireEvent.change(screen.getByLabelText('Stok'), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah produk' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('DB offline');

    fireEvent.change(screen.getByLabelText('Upload gambar (opsional)'), { target: { files: [new File(['x'], 'a.txt', { type: 'text/plain' })] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Gunakan gambar JPG');
    const oversizedImage = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' });
    fireEvent.change(screen.getByLabelText('Upload gambar (opsional)'), { target: { files: [oversizedImage] } });
    expect(screen.getByRole('alert')).toHaveTextContent('Ukuran gambar maksimal 5 MB');

    window.confirm.mockReturnValueOnce(false);
    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    expect(onDelete).not.toHaveBeenCalled();
    window.confirm.mockReturnValueOnce(true);
    fireEvent.click(screen.getAllByRole('button', { name: 'Hapus' })[0]);
    expect(await screen.findByRole('alert')).toHaveTextContent('DB offline');
  });
});