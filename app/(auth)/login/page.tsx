'use client';

import Authenticator from '@/components/auth/Authenticator';

export default function LoginPage() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
      }}
    >
      <Authenticator initialState="signIn" />
    </div>
  );
}
