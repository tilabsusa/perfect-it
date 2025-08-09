'use client';

import { useEffect, useState } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ username: string; userId: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkUser() {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch {
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Error signing out: ', error);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <div
        style={{
          backgroundColor: 'white',
          padding: '32px',
          borderRadius: '8px',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '16px' }}>
          Welcome to PerfectIt Dashboard
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '24px' }}>
          You are successfully authenticated!
        </p>
        {user && (
          <div style={{ marginBottom: '24px' }}>
            <p style={{ marginBottom: '8px' }}>
              <strong>Username:</strong> {user.username}
            </p>
            <p>
              <strong>User ID:</strong> {user.userId}
            </p>
          </div>
        )}
        <button
          onClick={handleSignOut}
          style={{
            backgroundColor: '#0284c7',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '500',
          }}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
