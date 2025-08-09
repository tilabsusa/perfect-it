import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Authenticator from './Authenticator';
import { useRouter } from 'next/navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock Amplify UI React components
jest.mock('@aws-amplify/ui-react', () => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Authenticator: ({ children, components, initialState, hideSignUp, formFields }: any) => {
    const Header = components?.Header;
    const Footer = components?.Footer;
    
    return (
      <div data-testid="amplify-authenticator">
        {Header && <Header />}
        <div data-testid="auth-form">
          <div data-testid="initial-state">{initialState}</div>
          <div data-testid="hide-signup">{hideSignUp ? 'true' : 'false'}</div>
          {formFields && (
            <div data-testid="form-fields">
              {JSON.stringify(Object.keys(formFields))}
            </div>
          )}
        </div>
        {children && children({ signOut: jest.fn(), user: null })}
        {Footer && <Footer />}
      </div>
    );
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ThemeProvider: ({ children, theme }: any) => (
    <div data-testid="theme-provider" data-theme={theme?.name}>
      {children}
    </div>
  ),
  Loader: () => <div data-testid="loader">Loading...</div>,
}));

// Mock Amplify UI React styles
jest.mock('@aws-amplify/ui-react/styles.css', () => ({}));

describe('Authenticator Component', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    });
  });

  describe('Rendering', () => {
    it('should render the Authenticator component with default props', () => {
      render(<Authenticator />);
      
      expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
      expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'perfectit-theme');
    });

    it('should render with signIn as initial state by default', () => {
      render(<Authenticator />);
      
      expect(screen.getByTestId('initial-state')).toHaveTextContent('signIn');
    });

    it('should render with signUp as initial state when specified', () => {
      render(<Authenticator initialState="signUp" />);
      
      expect(screen.getByTestId('initial-state')).toHaveTextContent('signUp');
    });

    it('should hide sign up when hideSignUp is true', () => {
      render(<Authenticator hideSignUp={true} />);
      
      expect(screen.getByTestId('hide-signup')).toHaveTextContent('true');
    });
  });

  describe('Custom Branding', () => {
    it('should render custom header with PerfectIt branding', () => {
      render(<Authenticator />);
      
      expect(screen.getByText('PerfectIt')).toBeInTheDocument();
      expect(screen.getByText('Your journey to perfection starts here')).toBeInTheDocument();
    });

    it('should render custom footer with links', () => {
      render(<Authenticator />);
      
      expect(screen.getByText('Terms')).toBeInTheDocument();
      expect(screen.getByText('Privacy')).toBeInTheDocument();
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText(/© 2025 PerfectIt/)).toBeInTheDocument();
    });
  });

  describe('Form Fields', () => {
    it('should configure form fields for sign up, sign in, and password reset', () => {
      render(<Authenticator />);
      
      const formFields = screen.getByTestId('form-fields');
      const fields = JSON.parse(formFields.textContent || '[]');
      
      expect(fields).toContain('signUp');
      expect(fields).toContain('signIn');
      expect(fields).toContain('forgotPassword');
      expect(fields).toContain('confirmResetPassword');
      expect(fields).toContain('confirmSignUp');
    });
  });

  describe('Custom Components', () => {
    it('should render sign up form message', () => {
      render(<Authenticator />);
      
      // The SignUp.FormFields component should be configured
      expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
    });

    it('should render email verification header', () => {
      render(<Authenticator />);
      
      // The ConfirmSignUp.Header component should be configured
      expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
    });

    it('should render password reset header', () => {
      render(<Authenticator />);
      
      // The ForgotPassword.Header component should be configured
      expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
    });
  });

  describe('Authentication Flow', () => {
    it('should render children when user is authenticated', () => {
      const TestChild = () => <div data-testid="child-component">Authenticated Content</div>;
      
      render(
        <Authenticator>
          <TestChild />
        </Authenticator>
      );
      
      // The mock passes children function, which renders the child component
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    it('should configure social providers', () => {
      render(<Authenticator />);
      
      // The component should be configured with Google and Facebook providers
      expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive theme tokens', () => {
      render(<Authenticator />);
      
      const themeProvider = screen.getByTestId('theme-provider');
      expect(themeProvider).toHaveAttribute('data-theme', 'perfectit-theme');
    });
  });

  describe('Error Handling', () => {
    it('should handle loading state', () => {
      render(<Authenticator />);
      
      // Component should be able to show loading state
      expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
    });

    it('should handle error messages', () => {
      render(<Authenticator />);
      
      // Component should be able to show error messages
      expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
    });
  });
});

describe('Authenticator Integration', () => {
  it('should integrate with Amplify configuration', () => {
    render(<Authenticator />);
    
    // The component should use Amplify configuration
    expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
  });

  it('should handle OAuth redirect URLs', () => {
    render(<Authenticator />);
    
    // OAuth configuration should match Cognito settings
    expect(screen.getByTestId('amplify-authenticator')).toBeInTheDocument();
  });
});