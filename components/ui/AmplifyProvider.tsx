'use client';

import { Amplify } from 'aws-amplify';
import outputs from '@/amplify_outputs.json';
import { ReactNode, useEffect } from 'react';

Amplify.configure(outputs);

interface AmplifyProviderProps {
  children: ReactNode;
}

export default function AmplifyProvider({ children }: AmplifyProviderProps) {
  useEffect(() => {
    // Additional Amplify configuration can be added here if needed
  }, []);

  return <>{children}</>;
}