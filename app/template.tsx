'use client';

import ClientLayout from './ClientLayout';

export default function Template({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>;
}
