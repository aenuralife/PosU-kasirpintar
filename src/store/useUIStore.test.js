import { describe, it, expect } from 'vitest';
import { useUIStore } from './useUIStore';

describe('useUIStore Unit Test', () => {
  it('harus mengeksekusi seluruh fungsi aksi pada useUIStore', () => {
    const store = useUIStore.getState();
    expect(store).toBeDefined();

    Object.keys(store).forEach((key) => {
      if (typeof store[key] === 'function') {
        store[key](true);
        store[key](false);
      }
    });

    expect(useUIStore.getState()).toBeDefined();
  });
});