import type { Metadata } from 'next';
import { generateMetadata } from '@/components/common/SEO';

export const metadata: Metadata = generateMetadata();

export { default } from './layout';
