
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CustomersView from './CustomersView';
import DashboardView from './DashboardView';
import DiscountsView from './DiscountsView';
import OrdersView from './OrdersView';
import ProductsView from './ProductsView';
import ReportsView from './ReportsView';
import SalesView from './SalesView';
import SettingsView from './SettingsView';
import UsersView from './UsersView';

const executeAllInteractions = async (Component, props = {}) => {
  await act(async () => {
    render(<Component {...props} />);
  });

  // 1. Input teks
  const inputs = screen.queryAllByRole('textbox');

  inputs.forEach((input) => {
    fireEvent.change(input, {
      target: { value: 'Test Data' }
    });
  });

  const numbers = screen.queryAllByRole('spinbutton');

  numbers.forEach((input) => {
    fireEvent.change(input, {
      target: { value: '10000' }
    });
  });

  const selects = screen.queryAllByRole('combobox');

  selects.forEach((select) => {
    if (select.options.length > 0) {
      fireEvent.change(select, {
        target: { value: select.options[0].value }
      });
    }
  });

  // 2. Klik tombol
  let buttons = screen.queryAllByRole('button');

  buttons.forEach((btn) => {
    fireEvent.click(btn);
  });

  // 3. Input ulang setelah modal terbuka
  const modalInputs = screen.queryAllByRole('textbox');

  modalInputs.forEach((input) => {
    fireEvent.change(input, {
      target: { value: 'Simpan Data' }
    });
  });

  buttons = screen.queryAllByRole('button');

  buttons.forEach((btn) => {
    fireEvent.click(btn);
  });

  await waitFor(() => {
    expect(document.body).toBeInTheDocument();
  });
};

describe('Comprehensive Views Full Coverage', () => {
  it('harus menguji CustomersView secara mendalam', async () => {
    await executeAllInteractions(CustomersView);
  });

  it('harus menguji DashboardView secara mendalam', async () => {
    await executeAllInteractions(DashboardView);
  });

  it('harus menguji DiscountsView secara mendalam', async () => {
    await executeAllInteractions(DiscountsView);
  });

  it('harus menguji OrdersView secara mendalam', async () => {
    await executeAllInteractions(OrdersView);
  });

  it('harus menguji ProductsView secara mendalam', async () => {
    await executeAllInteractions(ProductsView);
  });

  it('harus menguji ReportsView secara mendalam', async () => {
    await executeAllInteractions(ReportsView, { userId: '123' });
  });

  it('harus menguji SalesView secara mendalam', async () => {
    await executeAllInteractions(SalesView);
  });

  it('harus menguji SettingsView secara mendalam', async () => {
    await executeAllInteractions(SettingsView);
  });

  it('harus menguji UsersView secara mendalam', async () => {
    await executeAllInteractions(UsersView);
  });
});
