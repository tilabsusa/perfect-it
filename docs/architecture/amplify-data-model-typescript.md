# Amplify Data Model (TypeScript)

In Amplify Gen 2, the data model is defined in TypeScript and Amplify automatically generates the GraphQL schema. Here's the data model definition for `amplify/data/resource.ts`:

```typescript
import { type ClientSchema, a, defineData } from '@aws-amplify/backend';

const schema = a.schema({
  User: a
    .model({
      username: a.string().required(),
      email: a.email(),
      avatarUrl: a.url(),
      bio: a.string(),
      expertiseTags: a.string().array(),
      reputationScore: a.integer().default(0),
      isVerified: a.boolean().default(false),
      socialLinks: a.json(),
      cards: a.hasMany('PerfectionCard', 'authorId'),
      comments: a.hasMany('Comment', 'authorId'),
      votes: a.hasMany('Vote', 'userId'),
      collections: a.hasMany('Collection', 'ownerId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.guest().to(['read'])
    ])
    .secondaryIndexes((index) => [
      index('username')
    ]),

  PerfectionCard: a
    .model({
      title: a.string().required(),
      description: a.string().required(),
      imageUrls: a.url().array().required(),
      instructions: a.string().array().required(),
      materials: a.json(),  // Array of Material objects
      tools: a.string().array(),
      category: a.string().required(),
      tags: a.string().array(),
      difficulty: a.enum(['BEGINNER', 'INTERMEDIATE', 'EXPERT']),
      estimatedTime: a.integer(),  // in minutes
      estimatedCost: a.float(),    // in USD
      viewCount: a.integer().default(0),
      voteScore: a.integer().default(0),
      status: a.enum(['DRAFT', 'PUBLISHED', 'FLAGGED', 'REMOVED']),
      authorId: a.id().required(),
      author: a.belongsTo('User', 'authorId'),
      comments: a.hasMany('Comment', 'cardId'),
      votes: a.hasMany('Vote', 'targetId'),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.guest().to(['read']),
      allow.group('moderator').to(['update', 'delete'])
    ])
    .secondaryIndexes((index) => [
      index('category').sortKeys(['createdAt']).queryField('cardsByCategory'),
      index('authorId').sortKeys(['createdAt']).queryField('cardsByAuthor')
    ]),

  Comment: a
    .model({
      content: a.string().required(),
      cardId: a.id().required(),
      card: a.belongsTo('PerfectionCard', 'cardId'),
      authorId: a.id().required(),
      author: a.belongsTo('User', 'authorId'),
      parentId: a.id(),  // For nested replies
      voteCount: a.integer().default(0),
      status: a.enum(['ACTIVE', 'FLAGGED', 'REMOVED']),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.guest().to(['read']),
      allow.group('moderator').to(['delete'])
    ])
    .secondaryIndexes((index) => [
      index('cardId').sortKeys(['createdAt']),
      index('parentId').sortKeys(['createdAt'])
    ]),

  Vote: a
    .model({
      userId: a.id().required(),
      user: a.belongsTo('User', 'userId'),
      targetId: a.id().required(),
      targetType: a.enum(['CARD', 'COMMENT']),
      voteType: a.enum(['UP', 'DOWN']),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read'])
    ])
    .secondaryIndexes((index) => [
      index('targetId').sortKeys(['userId']),
      index('userId').sortKeys(['targetId'])
    ]),

  Collection: a
    .model({
      name: a.string().required(),
      description: a.string(),
      ownerId: a.id().required(),
      owner: a.belongsTo('User', 'ownerId'),
      isPublic: a.boolean().default(true),
      cardIds: a.id().array(),
      followerCount: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.owner(),
      allow.authenticated().to(['read']),
      allow.guest().to(['read']).when((c) => c.isPublic.eq(true))
    ])
    .secondaryIndexes((index) => [
      index('ownerId'),
      index('isPublic').sortKeys(['followerCount'])
    ]),

  Category: a
    .model({
      name: a.string().required(),
      parentId: a.id(),
      description: a.string(),
      iconUrl: a.url(),
      cardCount: a.integer().default(0),
      sortOrder: a.integer().default(0),
    })
    .authorization((allow) => [
      allow.group('admin'),
      allow.authenticated().to(['read']),
      allow.guest().to(['read'])
    ])
    .secondaryIndexes((index) => [
      index('parentId').sortKeys(['sortOrder'])
    ]),
});

export type Schema = ClientSchema<typeof schema>;

export const data = defineData({
  schema,
  authorizationModes: {
    defaultAuthorizationMode: 'userPool',
    apiKeyAuthorizationMode: {
      expiresInDays: 30,
    },
  },
});
```

This TypeScript schema definition:
- Automatically generates the GraphQL schema
- Provides type-safe client code generation
- Defines authorization rules inline
- Creates DynamoDB tables with appropriate indexes
- Handles relationships between models
