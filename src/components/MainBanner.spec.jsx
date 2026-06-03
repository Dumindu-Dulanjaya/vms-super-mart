import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainBanner from './MainBanner';

describe('MainBanner Component', () => {
  const renderMainBanner = () => {
    return render(
      <BrowserRouter>
        <MainBanner />
      </BrowserRouter>
    );
  };

  it('renders default hero content initially', () => {
    renderMainBanner();

    // Should render the welcome tag
    expect(screen.getByText(/Welcome to VMS Super Mart/i)).toBeInTheDocument();
    
    // Should render the main heading text
    expect(screen.getByText(/Delivered Daily/i)).toBeInTheDocument();
    expect(screen.getByText(/Discover unbeatable deals on fresh vegetables/i)).toBeInTheDocument();
  });

  it('toggles hover state on mouse enter and leave', () => {
    const { container } = renderMainBanner();
    
    // The main container wrapper is the first child of the render output
    const mainWrapper = container.firstChild;
    
    // Default text should be visible initially (opacity-100 is present on the default hero div)
    const defaultHeroDiv = screen.getByTestId('default-hero');
    expect(defaultHeroDiv).toHaveClass('opacity-100');

    // Simulate Mouse Enter on Explore Deals (Hover on)
    const exploreDealsLink = screen.getAllByText(/Explore Deals/i)[0].closest('a');
    fireEvent.mouseEnter(exploreDealsLink);
    
    // Now opacity should transition (opacity-0 class will be applied)
    expect(defaultHeroDiv).toHaveClass('opacity-0');

    // Simulate Mouse Leave on the main container (Hover off)
    fireEvent.mouseLeave(mainWrapper);
    
    // Should revert back to visible state
    expect(defaultHeroDiv).toHaveClass('opacity-100');
  });

  it('has functional Shop Now links', () => {
    renderMainBanner();
    
    const shopNowLinks = screen.getAllByRole('link', { name: /shop now/i });
    // There are two "Shop Now" links (one in hero state, one in carousel state)
    expect(shopNowLinks.length).toBe(2);
    shopNowLinks.forEach(link => {
      expect(link).toHaveAttribute('href', '/all-products');
    });
  });
});
