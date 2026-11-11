
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import DashboardView from './DashboardView';

describe('DashboardView Component', () => {
  it('berhasil merender tampilan dashboard', () => {
    const { container } = render(<DashboardView />);

    expect(container.firstChild).not.toBeNull();
  });

  it('menampilkan konten dashboard', () => {
    render(<DashboardView />);

    expect(document.body.textContent.trim().length).toBeGreaterThan(0);
  });
});
