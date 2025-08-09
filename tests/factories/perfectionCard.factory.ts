import { faker } from '@faker-js/faker';
import { createUser, User } from './user.factory';

export type CardStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
export type CardCategory =
  | 'BEAUTY'
  | 'FITNESS'
  | 'LIFESTYLE'
  | 'FASHION'
  | 'WELLNESS'
  | 'CAREER'
  | 'RELATIONSHIPS'
  | 'OTHER';

export interface PerfectionCard {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  category: CardCategory;
  tags: string[];
  imageUrl?: string;
  thumbnailUrl?: string;
  author: User;
  authorId: string;
  votes: number;
  views: number;
  status: CardStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

const categories: CardCategory[] = [
  'BEAUTY',
  'FITNESS',
  'LIFESTYLE',
  'FASHION',
  'WELLNESS',
  'CAREER',
  'RELATIONSHIPS',
  'OTHER',
];

const tagsByCategory: Record<CardCategory, string[]> = {
  BEAUTY: ['skincare', 'makeup', 'haircare', 'nails', 'natural', 'glowing', 'routine'],
  FITNESS: ['workout', 'nutrition', 'yoga', 'strength', 'cardio', 'flexibility', 'wellness'],
  LIFESTYLE: ['organization', 'productivity', 'minimalism', 'habits', 'balance', 'mindfulness'],
  FASHION: ['style', 'wardrobe', 'accessories', 'trends', 'sustainable', 'capsule', 'vintage'],
  WELLNESS: ['mental-health', 'meditation', 'selfcare', 'sleep', 'stress', 'healing', 'holistic'],
  CAREER: ['professional', 'networking', 'skills', 'leadership', 'growth', 'goals', 'success'],
  RELATIONSHIPS: [
    'communication',
    'boundaries',
    'love',
    'friendship',
    'family',
    'social',
    'empathy',
  ],
  OTHER: ['custom', 'unique', 'creative', 'innovative', 'special', 'different'],
};

export const createPerfectionCard = (overrides?: Partial<PerfectionCard>): PerfectionCard => {
  const category = overrides?.category || faker.helpers.arrayElement(categories);
  const author = overrides?.author || createUser();
  const status =
    overrides?.status ||
    faker.helpers.arrayElement(['DRAFT', 'PUBLISHED', 'PUBLISHED', 'PUBLISHED'] as CardStatus[]);
  const createdAt = faker.date.past();
  const updatedAt = faker.date.between({ from: createdAt, to: new Date() });

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence({ min: 3, max: 8 }).replace('.', ''),
    subtitle: faker.lorem.sentence({ min: 5, max: 12 }).replace('.', ''),
    description: faker.lorem.paragraphs({ min: 2, max: 4 }),
    category,
    tags: faker.helpers.arrayElements(tagsByCategory[category], { min: 2, max: 5 }),
    imageUrl: faker.image.url(),
    thumbnailUrl: faker.image.url(),
    author,
    authorId: author.id,
    votes: faker.number.int({ min: 0, max: 500 }),
    views: faker.number.int({ min: 0, max: 5000 }),
    status,
    featured: faker.datatype.boolean({ probability: 0.1 }),
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    publishedAt:
      status === 'PUBLISHED'
        ? faker.date.between({ from: createdAt, to: updatedAt }).toISOString()
        : undefined,
    ...overrides,
  };
};

export const createPerfectionCards = (
  count: number,
  overrides?: Partial<PerfectionCard>
): PerfectionCard[] => {
  return Array.from({ length: count }, () => createPerfectionCard(overrides));
};

export const createPublishedCard = (overrides?: Partial<PerfectionCard>): PerfectionCard => {
  const createdAt = faker.date.past();
  const publishedAt = faker.date.between({ from: createdAt, to: new Date() });

  return createPerfectionCard({
    status: 'PUBLISHED',
    publishedAt: publishedAt.toISOString(),
    views: faker.number.int({ min: 100, max: 5000 }),
    ...overrides,
  });
};

export const createDraftCard = (overrides?: Partial<PerfectionCard>): PerfectionCard => {
  return createPerfectionCard({
    status: 'DRAFT',
    publishedAt: undefined,
    views: 0,
    votes: 0,
    featured: false,
    ...overrides,
  });
};

export const createFeaturedCard = (overrides?: Partial<PerfectionCard>): PerfectionCard => {
  return createPublishedCard({
    featured: true,
    views: faker.number.int({ min: 1000, max: 10000 }),
    votes: faker.number.int({ min: 100, max: 1000 }),
    ...overrides,
  });
};
