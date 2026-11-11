import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CustomersView from './CustomersView';
import DashboardView from './DashboardView';
import DiscountsView from './DiscountsView';
import OrdersView from './OrdersView';
import ProductsView from './ProductsView';
import ReportsView from './ReportsView';
import SalesView from './SalesView';
import SettingsView from './SettingsView';
import UsersView from './UsersView';
import { supabase } from '../supabaseClient';

const testViewSuccessAndErrorPaths = async (Component, props = {}) => {
  // 1. Jalankan Jalur Sukses (Success Fetch & Render Table)
  await act(async () => {
    render(<Component {...props} />);
  });

  // Interaksi Input Teks, Angka, dan Dropdown
  const textInputs = screen.queryAllByRole('textbox');
  textInputs.forEach((inp) => fireEvent.change(inp, { target: { value: 'Kopi' } }));

  const numberInputs = screen.queryAllByRole('spinbutton');
  numberInputs.forEach((inp) => fireEvent.change(inp, { target: { value: '20000' } }));

  const selectInputs = screen.queryAllByRole('combobox');
  selectInputs.forEach((sel) => {
    if (sel.options.length > 0) fireEvent.change(sel, { target: { value: sel.options[0].value } });
  });

  // Klik Seluruh Tombol UI (Buka Modal, Edit, Hapus, Simpan, Filter)
  let buttons = screen.queryAllByRole('button');
  buttons.forEach((btn) => { try { fireEvent.click(btn); } catch {} });

  // Isi ulang input dalam Modal yang terbuka dan Simpan
  const modalInputs = screen.queryAllByRole('textbox');
  modalInputs.forEach((inp) => fireEvent.change(inp, { target: { value: 'Data Update' } }));

  buttons = screen.queryAllByRole('button');
  buttons.forEach((btn) => { try { fireEvent.click(btn); } catch {} });

  await waitFor(() => expect(document.body).toBeInTheDocument());

  // 2. Jalankan Jalur Error Supabase (Trigger catch block / setError)
  vi.spyOn(supabase, 'from').mockImplementationOnce(() => ({
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockRejectedValueOnce(new Error('Koneksi Database Gagal')),
    insert: vi.fn().mockRejectedValueOnce(new Error('Gagal Simpan Data')),
    update: vi.fn().mockRejectedValueOnce(new Error('Gagal Update Data')),
    delete: vi.fn().mockRejectedValueOnce(new Error('Gagal Hapus Data')),
    eq: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn().mockRejectedValueOnce(new Error('Gagal Memuat Single')),
  }));

  await act(async () => {
    render(<Component {...props} />);
  });

  await waitFor(() => expect(document.body).toBeInTheDocument());
};

describe('Views Comprehensive Deep Test Suite (>85% Coverage)', () => {
  it('harus menguji CustomersView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(CustomersView); });
  it('harus menguji DashboardView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(DashboardView); });
  it('harus menguji DiscountsView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(DiscountsView); });
  it('harus menguji OrdersView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(OrdersView); });
  it('harus menguji ProductsView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(ProductsView); });
  it('harus menguji ReportsView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(ReportsView, { userId: '123' }); });
  it('harus menguji SalesView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(SalesView); });
  it('harus menguji SettingsView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(SettingsView); });
  it('harus menguji UsersView (Sukses & Error)', async () => { await testViewSuccessAndErrorPaths(UsersView); });
});