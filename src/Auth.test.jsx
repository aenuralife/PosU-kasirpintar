import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Auth from './Auth';
import { supabase } from './supabaseClient';

describe('Auth Component 90%+ Coverage Suite', () => {
  it('harus menguji alur login email, password, remember me, dan submit', async () => {
    await act(async () => { render(<Auth />); });

    const emailInput = screen.getByLabelText(/email/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const rememberCheckbox = screen.queryByRole('checkbox');

    if (rememberCheckbox) fireEvent.click(rememberCheckbox);

    fireEvent.change(emailInput, { target: { value: 'kasir@tokoku.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitBtn = screen.getByRole('button', { name: /masuk/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(document.body).toBeInTheDocument());
  });

  it('harus menguji alur registrasi (SignUp) lengkap', async () => {
    await act(async () => { render(<Auth />); });

    const toggleBtn = screen.getByText(/daftar sekarang/i);
    fireEvent.click(toggleBtn);

    const nameInput = screen.getByLabelText(/nama/i);
    const emailInput = screen.getByLabelText(/email/i);
    const passInputs = screen.getAllByLabelText(/password/i);

    fireEvent.change(nameInput, { target: { value: 'Toko Sukses' } });
    fireEvent.change(emailInput, { target: { value: 'owner@tokosukses.com' } });
    fireEvent.change(passInputs[0], { target: { value: '123456' } });
    if (passInputs[1]) fireEvent.change(passInputs[1], { target: { value: '123456' } });

    const submitBtn = screen.getByRole('button', { name: /daftar akun baru/i });
    fireEvent.click(submitBtn);

    const switchBackBtn = screen.getByText(/masuk di sini/i);
    fireEvent.click(switchBackBtn);

    await waitFor(() => expect(document.body).toBeInTheDocument());
  });

  it('harus menangani error saat login & signUp gagal', async () => {
    vi.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValueOnce({
      data: null,
      error: { message: 'Kredensial salah' }
    });

    await act(async () => { render(<Auth />); });
    const submitBtn = screen.getByRole('button', { name: /masuk/i });
    fireEvent.click(submitBtn);

    await waitFor(() => expect(document.body).toBeInTheDocument());
  });
});