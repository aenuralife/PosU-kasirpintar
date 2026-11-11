import '@testing-library/jest-dom';
import { vi } from 'vitest';

window.confirm = vi.fn(() => true);
window.alert = vi.fn();
window.print = vi.fn();

export const mockItems = [
  { id: '1', name: 'Kopi Hitam', title: 'Kopi Hitam', price: 15000, cost_price: 10000, qty: 2, total: 30000, status: 'completed', role: 'admin', email: 'admin@pos.com', phone: '0812345678', code: 'DISC10', percent: 10, category: 'Minuman', stock: 50, create_at: '2026-11-10' },
  { id: '2', name: 'Teh Manis', title: 'Teh Manis', price: 5000, cost_price: 3000, qty: 1, total: 5000, status: 'pending', role: 'kasir', email: 'kasir@pos.com', phone: '0887654321', code: 'DISC20', percent: 20, category: 'Minuman', stock: 20, create_at: '2026-11-09' }
];

export const mockChain = {
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockImplementation(() => Promise.resolve({ data: [mockItems[0]], error: null })),
  update: vi.fn().mockImplementation(() => Promise.resolve({ data: [mockItems[0]], error: null })),
  delete: vi.fn().mockImplementation(() => Promise.resolve({ error: null })),
  eq: vi.fn().mockReturnThis(),
  gte: vi.fn().mockReturnThis(),
  lte: vi.fn().mockReturnThis(),
  like: vi.fn().mockReturnThis(),
  ilike: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  order: vi.fn().mockImplementation(() => Promise.resolve({ data: mockItems, error: null })),
  single: vi.fn().mockResolvedValue({ data: mockItems[0], error: null }),
  maybeSingle: vi.fn().mockResolvedValue({
    data: { store_name: 'PosU Toko', address: 'Jl. Merdeka', phone: '08123456789', receipt_footer: 'Terima kasih' },
    error: null
  }),
};

vi.mock('../supabaseClient', () => ({
  supabase: {
    from: vi.fn(() => mockChain),
    auth: {
      getSession: vi.fn().mockResolvedValue({
        data: { session: { user: { id: '123', email: 'admin@pos.com', user_metadata: { role: 'admin' } } } }
      }),
      onAuthStateChange: vi.fn((cb) => {
        cb('SIGNED_IN', { user: { id: '123', email: 'admin@pos.com' } });
        return { data: { subscription: { unsubscribe: vi.fn() } } };
      }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: { user: { id: '123' } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
    },
  },
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});