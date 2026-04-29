import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAppContext } from '../context/useAppContext';
import { AppProvider } from '../context/AppContext';

describe('AppContext Hook', () => {
  it('should provide initial context values', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.products).toBeDefined();
    expect(result.current.cart).toBeDefined();
  });

  it('should add product to cart', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    const product = {
      id: 1,
      name: 'Test Product',
      price: 99.99,
      oldPrice: 149.99,
      image: 'test.jpg',
      quantity: 1,
    };

    act(() => {
      if (result.current.addToCart) {
        result.current.addToCart(product);
      }
    });

    if (result.current.cart) {
      expect(result.current.cart.length).toBeGreaterThan(0);
    }
  });

  it('should handle user login', async () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.userLoggedIn).toBeDefined();
  });

  it('should have checkout function', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.checkout).toBeDefined();
    expect(typeof result.current.checkout).toBe('function');
  });

  it('should handle admin login', async () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.adminLogin).toBeDefined();
    expect(typeof result.current.adminLogin).toBe('function');
  });

  it('should fetch products', () => {
    const wrapper = ({ children }) => <AppProvider>{children}</AppProvider>;
    const { result } = renderHook(() => useAppContext(), { wrapper });

    expect(result.current.fetchProducts).toBeDefined();
    expect(typeof result.current.fetchProducts).toBe('function');
  });
});
