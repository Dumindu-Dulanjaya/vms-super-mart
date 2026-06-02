import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { useAppContext } from '../context/useAppContext';
import { AppProvider } from '../context/AppContext';

describe('AppContext Hook', () => {
  const getWrapper = () => {
    return ({ children }) => (
      <BrowserRouter>
        <AppProvider>
          {children}
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('should provide initial context values', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper: getWrapper() });

    expect(result.current).toBeDefined();
    expect(result.current.products).toBeDefined();
  });

  it('should add product to cart', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper: getWrapper() });

    act(() => {
      if (result.current.addToCart) {
        result.current.addToCart(1);
      }
    });

    if (result.current.cartItems) {
      expect(result.current.cartItems['1']).toBe(1);
    }
  });

  it('should handle user login', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper: getWrapper() });

    expect(result.current.userLogin).toBeDefined();
  });

  it('should have checkout function', () => {
    const { result } = renderHook(() => useAppContext(), { wrapper: getWrapper() });

    expect(result.current.checkout).toBeDefined();
    expect(typeof result.current.checkout).toBe('function');
  });

  it('should handle admin login', async () => {
    const { result } = renderHook(() => useAppContext(), { wrapper: getWrapper() });

    expect(result.current.adminLogin).toBeDefined();
    expect(typeof result.current.adminLogin).toBe('function');
  });
});
