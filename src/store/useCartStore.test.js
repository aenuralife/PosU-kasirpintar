import { describe, it, expect, beforeEach } from 'vitest';
import { useCartStore } from './useCartStore';

describe('useCartStore Unit Tests', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart();
  });

  it('harus menambah produk baru ke keranjang', () => {
    const product = { id: '1', name: 'Kopi Hitam', price: 10000 };
    useCartStore.getState().addProduct(product);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0]).toEqual({ ...product, qty: 1 });
  });

  it('harus menambah kuantitas jika produk yang sama ditambahkan lagi', () => {
    const product = { id: '1', name: 'Kopi Hitam', price: 10000 };
    useCartStore.getState().addProduct(product);
    useCartStore.getState().addProduct(product);

    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].qty).toBe(2);
  });

  it('harus memperbarui kuantitas produk (updateQuantity)', () => {
    const product = { id: '1', name: 'Kopi Hitam', price: 10000 };
    useCartStore.getState().addProduct(product);

    useCartStore.getState().updateQuantity('1', 1);
    expect(useCartStore.getState().items[0].qty).toBe(2);

    useCartStore.getState().updateQuantity('1', -1);
    expect(useCartStore.getState().items[0].qty).toBe(1);
  });

  it('harus menghapus produk dari keranjang jika kuantitas menjadi 0', () => {
    const product = { id: '1', name: 'Kopi Hitam', price: 10000 };
    useCartStore.getState().addProduct(product);

    useCartStore.getState().updateQuantity('1', -1);
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('harus menghapus produk berdasarkan ID (removeItem)', () => {
    const product1 = { id: '1', name: 'Kopi Hitam', price: 10000 };
    const product2 = { id: '2', name: 'Teh Manis', price: 5000 };

    useCartStore.getState().addProduct(product1);
    useCartStore.getState().addProduct(product2);

    useCartStore.getState().removeItem('1');
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].id).toBe('2');
  });

  it('harus mengosongkan keranjang (clearCart)', () => {
    useCartStore.getState().addProduct({ id: '1', name: 'Kopi', price: 10000 });
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('harus menghitung total, subtotal, tax, dan getCount dengan benar', () => {
    const product1 = { id: '1', name: 'Kopi Hitam', price: 10800 };
    const product2 = { id: '2', name: 'Produk Tanpa Harga', price: 0 };

    useCartStore.getState().addProduct(product1);
    useCartStore.getState().addProduct(product1);
    useCartStore.getState().addProduct(product2);

    const store = useCartStore.getState();
    expect(store.getTotal()).toBe(21600);
    expect(store.getSubtotal()).toBe(Math.round(21600 / 1.08));
    expect(store.getTax()).toBe(21600 - store.getSubtotal());
    expect(store.getCount()).toBe(3);
  });
});