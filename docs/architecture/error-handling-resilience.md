# Error Handling & Resilience

### Client-Side Error Handling

#### Global Error Boundary

```typescript
// components/common/ErrorBoundary.tsx
class ErrorBoundary extends Component {
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log to CloudWatch RUM
    // Display fallback UI
    // Offer recovery action
  }
}
```

#### GraphQL Error Handling

- Optimistic updates with rollback on failure
- Retry logic with exponential backoff
- User-friendly error messages
- Offline queue for mutations

### Server-Side Resilience

#### Lambda Function Patterns

- **Timeout handling:** 30-second max, alert before timeout
- **Retry configuration:** DLQ for failed invocations
- **Error classification:** Transient vs permanent failures
- **Circuit breaker:** For external service calls

#### Database Resilience

- **DynamoDB:** Auto-scaling, on-demand billing for unpredictable loads
- **Read replicas:** Global tables for disaster recovery
- **Backup strategy:** Point-in-time recovery enabled
- **Throttling handling:** Exponential backoff in SDK

#### API Gateway Protection

- **Rate limiting:** 1000 requests per second per user
- **Throttling:** Burst limit of 5000 requests
- **WAF rules:** SQL injection, XSS protection
- **API key rotation:** Quarterly rotation schedule

### Failure Scenarios & Recovery

| Scenario                  | Detection        | Response                 | Recovery               |
| ------------------------- | ---------------- | ------------------------ | ---------------------- |
| Lambda timeout            | CloudWatch alarm | Retry with backoff       | Investigate slow query |
| DynamoDB throttle         | SDK exception    | Exponential backoff      | Scale capacity         |
| S3 upload failure         | Client error     | Retry with presigned URL | Check CORS/permissions |
| Auth token expired        | 401 response     | Refresh token            | Re-authenticate        |
| GraphQL subscription drop | Connection error | Auto-reconnect           | Restore subscription   |
