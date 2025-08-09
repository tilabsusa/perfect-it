# Security Architecture

### Authentication & Authorization

#### Multi-Factor Authentication

- **Required for:** Admin users, high-value actions
- **Methods:** SMS, TOTP apps
- **Implementation:** Cognito MFA configuration

#### Role-Based Access Control

```typescript
enum UserRole {
  GUEST = 'guest',
  USER = 'authenticated',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
}
```

#### Field-Level Authorization

- GraphQL field resolvers check permissions
- Amplify authorization directives
- Row-level security in DynamoDB

### Data Protection

#### Encryption

- **At rest:** DynamoDB encryption, S3 SSE-S3
- **In transit:** TLS 1.3 for all connections
- **Sensitive data:** Field-level encryption for PII

#### Data Privacy

- **PII handling:** Minimal collection, purpose limitation
- **Data retention:** 90-day deletion for inactive accounts
- **GDPR compliance:** Right to deletion, data portability
- **Audit logging:** All data access logged

### Application Security

#### Input Validation

- **Client-side:** Form validation, type checking
- **Server-side:** GraphQL schema validation
- **Sanitization:** XSS prevention, SQL injection protection

#### Content Security

- **Image validation:** File type, size limits, virus scanning
- **Content moderation:** Automated flagging, manual review
- **Rate limiting:** Per-user, per-IP limits

#### Infrastructure Security

- **VPC:** Private subnets for Lambda functions
- **Security groups:** Least privilege network access
- **IAM roles:** Minimal permissions per service
- **Secrets management:** AWS Secrets Manager for API keys

### Security Monitoring

- **AWS GuardDuty:** Threat detection
- **AWS Security Hub:** Compliance monitoring
- **CloudTrail:** API audit logging
- **Custom alerts:** Suspicious activity patterns
