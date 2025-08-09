# Technical Assumptions

### Repository Structure: Monorepo

Single repository containing the Next.js frontend and AWS Amplify Gen 2 backend configuration. This simplifies dependency management, enables atomic commits across the stack, and aligns with Amplify Gen 2's project structure. All application code, Amplify backend definitions, and configurations live in one version-controlled location.

### Service Architecture

**AWS Amplify Gen 2 Serverless Architecture** - Fully serverless application leveraging Amplify's managed services. Backend consists of AppSync GraphQL API with resolvers connecting to DynamoDB tables, Lambda functions for custom business logic, and Amplify Auth for authentication. This approach provides automatic scaling, reduced operational overhead, and tight integration with AWS services while maintaining clear separation between data, auth, storage, and function resources.

### Testing Requirements

**Unit + Integration Testing** focused on critical paths. Unit tests for React components and custom hooks. Integration tests for Lambda functions and GraphQL resolvers. Manual testing convenience methods for UI workflows. Test coverage target of 70% for Lambda functions and critical UI components, focusing on Perfection Card CRUD operations and search functionality.

### Additional Technical Assumptions and Requests

- **Frontend Framework:** Next.js with React and TypeScript, using App Router for optimal performance
- **UI Component Library:** Amplify UI React for connected components, Material-UI (MUI) v5 for additional UI needs
- **Amplify UI Components:** Authenticator, FileUploader, StorageImage, Collection, Card, Avatar for core functionality
- **State Management:** Amplify DataStore for offline-first data synchronization, Amplify UI connected components, React Context for UI state
- **Backend Framework:** AWS Amplify Gen 2 with AppSync GraphQL API
- **Database:** DynamoDB via Amplify Data, with single-table design pattern for optimal performance
- **Image Storage:** Amplify Storage (S3) with CloudFront CDN for image delivery
- **Authentication:** Amplify Auth (Cognito) with social login providers (Google, Facebook)
- **Search Implementation:** DynamoDB with GSI for basic search, OpenSearch integration for advanced search
- **Image Processing:** Lambda function with Sharp library triggered on S3 upload events
- **API Design:** GraphQL schema with type-safe code generation via Amplify Codegen
- **Development Tools:** ESLint, Prettier, Husky for pre-commit hooks, Amplify CLI
- **CI/CD:** Amplify Hosting with automatic branch deployments and preview environments
- **Hosting:** AWS Amplify Hosting for frontend, Amplify backend services for API/data
- **Monitoring:** CloudWatch for logs and metrics, X-Ray for distributed tracing
- **Rate Limiting:** AppSync API throttling and request limits
- **Content Moderation:** Manual flagging with admin review queue in DynamoDB
- **File Upload:** Amplify UI FileUploader component with Amplify Storage integration
- **Real-time Features:** AppSync subscriptions for live updates on comments and votes
