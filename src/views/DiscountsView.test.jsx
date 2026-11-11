import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import DiscountsView from './DiscountsView';
import { supabase } from '../supabaseClient';

describe('DiscountsView', () => {
  it('membuat kode promo, mengubah status, dan menangani penyimpanan gagal', async () => {
    let mode = 'load';
    const active = { id: 'd1', code: 'HEMAT10', percentage: 10, is_active: true, create_at: '2026-11-10' };
    const inactive = { id: 'd2', code: 'LAMA20', percentage: 20, is_active: false, create_at: 'bad-date' };
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [active, inactive], error: null }),
      insert: vi.fn().mockImplementation(() => { mode = 'insert'; return chain; }),
      update: vi.fn().mockImplementation(() => { mode = 'update'; return chain; }),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockImplementation(async () => {
        if (mode === 'insert') return { data: { id: 'd3', code: 'NEW15', percentage: 15, is_active: true, create_at: '2026-11-11' }, error: null };
        if (mode === 'update') return { data: { ...active, is_active: false }, error: null };
        return { data: null, error: { message: 'gagal' } };
      }),
    };
    vi.spyOn(supabase, 'from').mockReturnValue(chain);
    render(<DiscountsView />);
    expect(await screen.findByText('HEMAT10')).toBeInTheDocument();
    expect(screen.getByText('Tidak Aktif')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('switch', { name: 'Nonaktifkan kode HEMAT10' }));
    expect(await screen.findByRole('status')).toHaveTextContent('sekarang tidak aktif');

    fireEvent.click(screen.getByRole('button', { name: 'Buat Diskon Baru' }));
    fireEvent.change(screen.getByLabelText('Kode Diskon'), { target: { value: ' hemat 15 ' } });
    fireEvent.change(screen.getByLabelText('Persentase Diskon'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Diskon' }));
    expect(await screen.findByRole('status')).toHaveTextContent('berhasil dibuat');
    expect(screen.getByText('NEW15')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Buat Diskon Baru' }));
    fireEvent.change(screen.getByLabelText('Kode Diskon'), { target: { value: '  ' } });
    fireEvent.change(screen.getByLabelText('Persentase Diskon'), { target: { value: '0' } });
    fireEvent.submit(screen.getByRole('dialog').querySelector('form'));
    expect(await screen.findByRole('alert')).toHaveTextContent('Kode diskon harus diisi');
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});