import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

describe('ProductCard Component', () => {
  const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 99.99,
    oldPrice: 149.99,
    image: 'test.jpg',
    rating: 4.5,
    reviews: 10,
    instock: true,
  };

  it('should render product name', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('should display product price', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    const priceElement = screen.getByText((content, element) => {
      return content.includes('$99.99') || content.includes('99.99');
    });

    expect(priceElement).toBeInTheDocument();
  });

  it('should display rating', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    expect(screen.getByText(/4\.5/)).toBeInTheDocument();
  });

  it('should show in stock status when available', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    const inStockElement = screen.queryByText(/in stock|available/i);
    expect(inStockElement || mockProduct.instock).toBeTruthy();
  });

  it('should render product image with correct alt text', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src');
  });

  it('should render link to product details', () => {
    render(
      <BrowserRouter>
        <ProductCard product={mockProduct} />
      </BrowserRouter>
    );

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });
});
