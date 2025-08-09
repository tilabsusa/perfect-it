# Testing Strategy

### Testing Pyramid

```
         /\
        /E2E\      5% - Critical user journeys
       /------\
      /  Integ  \   15% - API & service integration
     /------------\
    /     Unit     \  80% - Component & function logic
   /------------------\
```

### Unit Testing

**Framework:** Jest + React Testing Library

**Coverage targets:**

- Components: 80% coverage
- Utilities: 95% coverage
- Hooks: 90% coverage
- Lambda functions: 85% coverage

**Key test files:**

```
components/cards/CardGrid.test.tsx
hooks/useAuth.test.ts
amplify/functions/image-processor/handler.test.ts
lib/utils/validation.test.ts
```

### Integration Testing

**Framework:** Jest + MSW (Mock Service Worker)

**Test scenarios:**

- GraphQL query/mutation flows
- Authentication workflows
- File upload pipelines
- Real-time subscription updates

### End-to-End Testing

**Framework:** Playwright

**Critical paths:**

- User registration and login
- Create and publish Perfection Card
- Search and filter cards
- Vote and comment interactions

**Test environments:**

- Local: Against sandbox backend
- Staging: Pre-production validation
- Production: Smoke tests only

### Performance Testing

**Tools:** Lighthouse CI, WebPageTest

**Metrics:**

- Core Web Vitals (LCP < 2.5s, FID < 100ms, CLS < 0.1)
- Time to Interactive < 3.5s
- Bundle size < 200KB (initial)
