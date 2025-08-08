# Tech Stack

### Cloud Infrastructure

- **Provider:** Amazon Web Services (AWS)
- **Key Services:** Amplify, AppSync, DynamoDB, S3, CloudFront, Cognito, Lambda, OpenSearch
- **Deployment Regions:** us-east-1 (primary), with CloudFront global edge locations

### Technology Stack Table

| Category               | Technology              | Version | Purpose                      | Rationale                                                |
| ---------------------- | ----------------------- | ------- | ---------------------------- | -------------------------------------------------------- |
| **Language**           | TypeScript              | 5.3.3   | Primary development language | Strong typing, excellent tooling, reduces runtime errors |
| **Runtime**            | Node.js                 | 20.11.0 | JavaScript runtime           | LTS version, stable performance, AWS Lambda support      |
| **Frontend Framework** | Next.js                 | 14.2.0  | React framework with SSR/SSG | App Router, optimal performance, SEO benefits            |
| **UI Library**         | React                   | 18.3.0  | Component library            | Industry standard, huge ecosystem, Amplify UI support    |
| **UI Components**      | Amplify UI React        | 6.1.0   | Connected components         | Pre-built auth, storage, data components                 |
| **UI Design System**   | Material-UI (MUI)       | 5.15.0  | Component library            | Comprehensive components, theming, accessibility         |
| **Next.js Adapter**    | Amplify Adapter Next.js | 1.6.8   | Next.js integration          | Server-side Amplify context, SSR support                 |
| **Backend Framework**  | AWS Amplify Gen 2       | 1.0.0   | Backend infrastructure       | Integrated AWS services, type-safe, real-time            |
| **API**                | AWS AppSync             | Managed | GraphQL API                  | Real-time subscriptions, managed scaling                 |
| **Database**           | DynamoDB                | Managed | NoSQL database               | Serverless, scalable, cost-effective                     |
| **Authentication**     | AWS Cognito             | Managed | User management              | Social login, MFA, integrated with Amplify               |
| **Storage**            | AWS S3                  | Managed | Object storage               | Image storage, integrated with CloudFront                |
| **CDN**                | CloudFront              | Managed | Content delivery             | Global edge locations, S3 integration                    |
| **Search**             | OpenSearch              | 2.11    | Full-text search             | Advanced search capabilities, DynamoDB integration       |
| **Image Processing**   | Sharp                   | 0.33.2  | Image manipulation           | Resize, optimize, format conversion in Lambda            |
| **State Management**   | Amplify DataStore       | 5.0.0   | Offline-first sync           | Conflict resolution, real-time sync                      |
| **CSS Framework**      | MUI Styling System      | 5.15.0  | CSS-in-JS                    | sx prop, styled components, theme consistency            |
| **Testing**            | Jest                    | 29.7.0  | Test framework               | Unit/integration testing, good TS support                |
| **Testing (E2E)**      | Playwright              | 1.41.2  | E2E testing                  | Cross-browser, reliable, fast                            |
| **Linting**            | ESLint                  | 8.57.1  | Code quality                 | Catches errors, enforces standards                       |
| **Formatting**         | Prettier                | 3.2.0   | Code formatting              | Consistent style, auto-format                            |
| **Git Hooks**          | Husky                   | 9.1.7   | Pre-commit hooks             | Enforce quality before commit                            |
| **Package Manager**    | npm                     | 10.2.0  | Dependency management        | Default with Node.js, workspace support                  |
| **CI/CD**              | Amplify Hosting         | Managed | Deployment pipeline          | Automatic deployments, preview environments              |
| **Monitoring**         | CloudWatch              | Managed | Logs and metrics             | Integrated with all AWS services                         |
| **Tracing**            | AWS X-Ray               | Managed | Distributed tracing          | Performance analysis, debugging                          |
