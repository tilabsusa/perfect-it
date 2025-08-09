import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Footer from './Footer';
import { ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme();

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider theme={theme}>
      {component}
    </ThemeProvider>
  );
};

describe('Footer', () => {
  it('renders the PerfectIt brand', () => {
    renderWithTheme(<Footer />);
    expect(screen.getByText('PerfectIt')).toBeInTheDocument();
  });

  it('renders the company description', () => {
    renderWithTheme(<Footer />);
    expect(screen.getByText(/Share and discover perfectly executed ideas/i)).toBeInTheDocument();
  });

  it('renders all footer sections', () => {
    renderWithTheme(<Footer />);
    
    expect(screen.getByText('Product')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  describe('Product links', () => {
    it('renders product navigation links', () => {
      renderWithTheme(<Footer />);
      
      expect(screen.getByRole('link', { name: 'Features' })).toHaveAttribute('href', '/features');
      expect(screen.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/pricing');
      expect(screen.getByRole('link', { name: 'Browse' })).toHaveAttribute('href', '/browse');
      expect(screen.getByRole('link', { name: 'Collections' })).toHaveAttribute('href', '/collections');
    });
  });

  describe('Company links', () => {
    it('renders company navigation links', () => {
      renderWithTheme(<Footer />);
      
      const aboutLinks = screen.getAllByRole('link', { name: 'About' });
      expect(aboutLinks[0]).toHaveAttribute('href', '/about');
      expect(screen.getByRole('link', { name: 'Blog' })).toHaveAttribute('href', '/blog');
      expect(screen.getByRole('link', { name: 'Careers' })).toHaveAttribute('href', '/careers');
      expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact');
    });
  });

  describe('Legal links', () => {
    it('renders legal navigation links', () => {
      renderWithTheme(<Footer />);
      
      const termsLinks = screen.getAllByRole('link', { name: /Terms/i });
      expect(termsLinks[0]).toHaveAttribute('href', '/terms');
      
      const privacyLinks = screen.getAllByRole('link', { name: /Privacy/i });
      expect(privacyLinks[0]).toHaveAttribute('href', '/privacy');
      
      const cookieLinks = screen.getAllByRole('link', { name: /Cookie/i });
      expect(cookieLinks[0]).toHaveAttribute('href', '/cookies');
      
      expect(screen.getByRole('link', { name: 'License' })).toHaveAttribute('href', '/license');
    });
  });

  describe('Support links', () => {
    it('renders support navigation links', () => {
      renderWithTheme(<Footer />);
      
      expect(screen.getByRole('link', { name: 'Help Center' })).toHaveAttribute('href', '/help');
      expect(screen.getByRole('link', { name: 'FAQs' })).toHaveAttribute('href', '/faqs');
      expect(screen.getByRole('link', { name: 'Guidelines' })).toHaveAttribute('href', '/guidelines');
      expect(screen.getByRole('link', { name: 'API' })).toHaveAttribute('href', '/api');
    });
  });

  describe('Social media icons', () => {
    it('renders social media icon buttons', () => {
      renderWithTheme(<Footer />);
      
      expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
      expect(screen.getByLabelText('Facebook')).toBeInTheDocument();
      expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
      expect(screen.getByLabelText('LinkedIn')).toBeInTheDocument();
    });

    it('social media links open in new tab', () => {
      renderWithTheme(<Footer />);
      
      const twitterButton = screen.getByLabelText('Twitter');
      expect(twitterButton).toHaveAttribute('target', '_blank');
      expect(twitterButton).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('Copyright notice', () => {
    it('renders copyright text with current year', () => {
      renderWithTheme(<Footer />);
      const currentYear = new Date().getFullYear();
      expect(screen.getByText(`© ${currentYear} PerfectIt. All rights reserved.`)).toBeInTheDocument();
    });
  });

  describe('Footer bottom links', () => {
    it('renders bottom navigation links', () => {
      renderWithTheme(<Footer />);
      
      const termsLinks = screen.getAllByRole('link', { name: 'Terms' });
      expect(termsLinks[termsLinks.length - 1]).toHaveAttribute('href', '/terms');
      
      const privacyLinks = screen.getAllByRole('link', { name: 'Privacy' });
      expect(privacyLinks[privacyLinks.length - 1]).toHaveAttribute('href', '/privacy');
      
      const cookiesLinks = screen.getAllByRole('link', { name: 'Cookies' });
      expect(cookiesLinks[cookiesLinks.length - 1]).toHaveAttribute('href', '/cookies');
    });
  });

  describe('Responsive layout', () => {
    it('renders with proper grid structure', () => {
      const { container } = renderWithTheme(<Footer />);
      
      const gridContainers = container.querySelectorAll('.MuiGrid-container');
      expect(gridContainers.length).toBeGreaterThan(0);
      
      const gridItems = container.querySelectorAll('.MuiGrid-item');
      expect(gridItems.length).toBeGreaterThan(0);
    });

    it('uses Container component for max width', () => {
      const { container } = renderWithTheme(<Footer />);
      
      const muiContainer = container.querySelector('.MuiContainer-root');
      expect(muiContainer).toBeInTheDocument();
      expect(muiContainer).toHaveClass('MuiContainer-maxWidthLg');
    });
  });
});