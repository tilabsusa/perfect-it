'use client';

import { Authenticator as AmplifyAuthenticator, ThemeProvider, Theme } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import { useRouter } from 'next/navigation';

const theme: Theme = {
  name: 'perfectit-theme',
  tokens: {
    colors: {
      brand: {
        primary: {
          10: '#f0f9ff',
          20: '#e0f2fe',
          40: '#7dd3fc',
          60: '#0284c7',
          80: '#075985',
          90: '#0c4a6e',
          100: '#082f49',
        },
      },
    },
    fonts: {
      default: {
        variable: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        static: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
    },
    radii: {
      small: '4px',
      medium: '8px',
      large: '16px',
    },
  },
};

interface AuthenticatorProps {
  children?: React.ReactNode;
  initialState?: 'signIn' | 'signUp';
  hideSignUp?: boolean;
}

export default function Authenticator({ 
  children, 
  initialState = 'signIn',
  hideSignUp = false 
}: AuthenticatorProps) {
  const router = useRouter();

  return (
    <ThemeProvider theme={theme}>
      <AmplifyAuthenticator
        initialState={initialState}
        hideSignUp={hideSignUp}
        loginMechanisms={['email']}
        socialProviders={['google', 'facebook']}
        components={{
          Header() {
            return (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>
                  PerfectIt
                </h1>
                <p style={{ color: '#6b7280', fontSize: '14px' }}>
                  Your journey to perfection starts here
                </p>
              </div>
            );
          },
          Footer() {
            return (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                fontSize: '12px',
                color: '#6b7280'
              }}>
                <div style={{ marginBottom: '8px' }}>
                  <a href="/terms" style={{ margin: '0 8px', color: '#0284c7' }}>Terms</a>
                  <a href="/privacy" style={{ margin: '0 8px', color: '#0284c7' }}>Privacy</a>
                  <a href="/about" style={{ margin: '0 8px', color: '#0284c7' }}>About</a>
                </div>
                <p>&copy; 2025 PerfectIt. All rights reserved.</p>
              </div>
            );
          },
        }}
      >
        {({ user }) => {
          if (user) {
            router.push('/dashboard');
            return <></>;
          }
          return children ? <>{children}</> : <></>;
        }}
      </AmplifyAuthenticator>
    </ThemeProvider>
  );
}