import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  expertiseTags?: string[];
  reputationScore: number;
  isVerified: boolean;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export const createUser = (overrides?: Partial<User>): User => {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const username = faker.internet.userName({ firstName, lastName });

  return {
    id: faker.string.uuid(),
    username,
    email: faker.internet.email({ firstName, lastName }),
    avatarUrl: faker.image.avatar(),
    bio: faker.person.bio(),
    expertiseTags: faker.helpers.arrayElements(
      ['react', 'typescript', 'aws', 'graphql', 'nextjs', 'testing', 'design', 'backend'],
      { min: 1, max: 4 }
    ),
    reputationScore: faker.number.int({ min: 0, max: 1000 }),
    isVerified: faker.datatype.boolean(),
    socialLinks: {
      twitter: faker.helpers.maybe(() => `https://twitter.com/${username}`),
      linkedin: faker.helpers.maybe(() => `https://linkedin.com/in/${username}`),
      github: faker.helpers.maybe(() => `https://github.com/${username}`),
      website: faker.helpers.maybe(() => faker.internet.url()),
    },
    createdAt: faker.date.past().toISOString(),
    updatedAt: faker.date.recent().toISOString(),
    ...overrides,
  };
};

export const createUsers = (count: number, overrides?: Partial<User>): User[] => {
  return Array.from({ length: count }, () => createUser(overrides));
};

export const createVerifiedUser = (overrides?: Partial<User>): User => {
  return createUser({
    isVerified: true,
    reputationScore: faker.number.int({ min: 500, max: 1000 }),
    ...overrides,
  });
};

export const createNewUser = (overrides?: Partial<User>): User => {
  const now = new Date().toISOString();
  return createUser({
    reputationScore: 0,
    isVerified: false,
    expertiseTags: [],
    bio: undefined,
    socialLinks: {},
    createdAt: now,
    updatedAt: now,
    ...overrides,
  });
};
