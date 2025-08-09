import { graphql, http, HttpResponse } from 'msw';

const handlers = [
  graphql.query('GetUser', ({ query, variables }) => {
    return HttpResponse.json({
      data: {
        user: {
          id: '1',
          username: 'testuser',
          email: 'test@example.com',
          avatarUrl: 'https://example.com/avatar.jpg',
          bio: 'Test user bio',
          expertiseTags: ['testing', 'development'],
          reputationScore: 100,
          isVerified: true,
          socialLinks: {
            twitter: 'https://twitter.com/testuser',
            linkedin: 'https://linkedin.com/in/testuser',
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    });
  }),

  graphql.query('ListPerfectionCards', ({ query, variables }) => {
    return HttpResponse.json({
      data: {
        listPerfectionCards: {
          items: [
            {
              id: '1',
              title: 'Test Card 1',
              subtitle: 'Test subtitle 1',
              description: 'Test description 1',
              category: 'TEST',
              tags: ['test', 'mock'],
              imageUrl: 'https://example.com/image1.jpg',
              votes: 10,
              views: 100,
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              author: {
                id: '1',
                username: 'testuser',
                avatarUrl: 'https://example.com/avatar.jpg',
              },
            },
            {
              id: '2',
              title: 'Test Card 2',
              subtitle: 'Test subtitle 2',
              description: 'Test description 2',
              category: 'TEST',
              tags: ['test', 'sample'],
              imageUrl: 'https://example.com/image2.jpg',
              votes: 5,
              views: 50,
              status: 'PUBLISHED',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              author: {
                id: '2',
                username: 'anotheruser',
                avatarUrl: 'https://example.com/avatar2.jpg',
              },
            },
          ],
          nextToken: null,
        },
      },
    });
  }),

  graphql.mutation('CreatePerfectionCard', ({ query, variables }) => {
    return HttpResponse.json({
      data: {
        createPerfectionCard: {
          id: '3',
          title: variables.input.title,
          subtitle: variables.input.subtitle,
          description: variables.input.description,
          category: variables.input.category,
          tags: variables.input.tags,
          imageUrl: variables.input.imageUrl,
          votes: 0,
          views: 0,
          status: 'DRAFT',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          author: {
            id: '1',
            username: 'testuser',
            avatarUrl: 'https://example.com/avatar.jpg',
          },
        },
      },
    });
  }),

  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'healthy' });
  }),
];

export { handlers };
