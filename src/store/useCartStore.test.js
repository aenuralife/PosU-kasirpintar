import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { TAX_RATE, useCartStore } from './useCartStore'

describe('useCartStore', () => {
  beforeEach(() => {
    useCartStore.getState().clearCart()
  })

  it('includes tax in the total when a product is added', () => {
    const { result } = renderHook(() => useCartStore())
    const product = { id: 'product-1', name: 'Kopi', price: 1080 }

    act(() => {
      result.current.addProduct(product)
    })

    expect(result.current.items).toHaveLength(1)
    expect(result.current.getTotal()).toBe(1080)
    expect(result.current.getSubtotal()).toBe(1000)
    expect(result.current.getTax()).toBe(80)
    expect(result.current.getTotal()).toBeCloseTo(
      result.current.getSubtotal() * (1 + TAX_RATE),
      2,
    )
  })
})
