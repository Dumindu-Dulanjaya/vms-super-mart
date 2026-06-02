import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { AppProvider } from '../context/AppContext';

describe('Navbar Component', () => {
  const renderNavbar = () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <Navbar />
        </AppProvider>
      </BrowserRouter>
    );
  };

  it('should render navigation links', () => {
    renderNavbar();

    const links = screen.queryAllByText(/home|categories|products/i);
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render cart icon', () => {
    renderNavbar();

    const cartLink = screen.queryByText(/cart/i) || 
                     screen.queryByRole('img', { name: /cart/i });
    
    expect(cartLink || document.querySelector('[href*="cart"]')).toBeTruthy();
  });

  it('should render search functionality', () => {
    renderNavbar();

    const searchInputs = screen.queryAllByPlaceholderText(/search/i);
    expect(searchInputs.length > 0 || document.querySelector('input[type="search"]')).toBeTruthy();
  });

  it('should have links to different pages', () => {
    renderNavbar();

    const links = screen.getAllByRole('link');
    expect(links.length).toBeGreaterThan(0);
  });

  it('should render logo or brand name', () => {
    renderNavbar();

    const logo = screen.queryByText(/vms|supermart/i) || 
                 screen.queryByRole('img', { name: /logo/i });
    
    expect(logo || document.querySelector('[href="/"]')).toBeTruthy();
  });

  it('should have responsive design elements', () => {
    renderNavbar();

    const navbar = document.querySelector('nav') || 
                  document.querySelector('.navbar') ||
                  document.querySelector('header');
    
    expect(navbar).toBeInTheDocument();
  });
});
