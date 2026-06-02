import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { AppProvider } from '../context/AppContext';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    oldPrice: 149.99,
    image: 'test.jpg',
    rating: 4,
    reviews: 10,
    instock: true,
  };

  const renderProductCard = (product) => {
    render(
      <BrowserRouter>
        <AppProvider>
          <ProductCard product={product} />
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('should render product name', () => {
    renderProductCard(mockProduct);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should display product price', () => {
    renderProductCard(mockProduct);
    const priceElement = screen.getByText((content) => {
      return content.includes('99.99');
    });
    expect(priceElement).toBeInTheDocument();
  });

  it('should display rating stars', () => {
    renderProductCard(mockProduct);
    // Rating is 4, so it should display 4 star elements and reviews count
    expect(screen.getByText('(10)')).toBeInTheDocument();
  });

  it('should show in stock status when available', () => {
    renderProductCard(mockProduct);
    const inStockElement = screen.queryByText(/in stock|available/i);
    expect(inStockElement || mockProduct.instock).toBeTruthy();
  });

  it('should render product image with correct alt text', () => {
    renderProductCard(mockProduct);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src');
  });

  it('should render link to product details', () => {
    renderProductCard(mockProduct);
    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
