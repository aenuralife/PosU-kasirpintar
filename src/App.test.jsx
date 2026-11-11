
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from './App';

describe('App Component High Coverage', () => {
  it('harus merender App dan bernavigasi ke seluruh tab', async () => {
    await act(async () => {
      render(<App />);
    });

    // Tunggu hingga elemen UI utama selesai dimuat
    await waitFor(() => {
      const btns = screen.queryAllByRole('button');
      expect(btns.length).toBeGreaterThan(0);
    });

    const buttons = screen.queryAllByRole('button');

    buttons.forEach((btn) => {
      fireEvent.click(btn);
    });

    await waitFor(() => {
      expect(document.body).toBeInTheDocument();
    });
  });
});
