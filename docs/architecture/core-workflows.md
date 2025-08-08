# Core Workflows

### User Registration and Authentication Flow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js App
    participant C as Cognito
    participant A as AppSync API
    participant D as DynamoDB
    participant L as Lambda (Post-Confirm)

    U->>N: Click Sign Up
    N->>C: Initiate registration
    C->>U: Send verification email
    U->>N: Enter verification code
    N->>C: Confirm registration
    C->>L: Trigger post-confirmation
    L->>D: Create user profile record
    L->>C: Return success
    C->>N: Return tokens (ID, Access)
    N->>A: Query user profile
    A->>D: Fetch user data
    D->>A: Return user profile
    A->>N: Return profile data
    N->>U: Show dashboard
```

### Create Perfection Card Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js App
    participant S as S3 Storage
    participant A as AppSync API
    participant D as DynamoDB
    participant L as Lambda (Image)
    participant O as OpenSearch

    U->>N: Upload image
    N->>S: Request presigned URL
    S->>N: Return presigned URL
    N->>S: Upload image directly
    S->>L: Trigger image processing
    L->>L: Resize & optimize
    L->>S: Save processed images
    L->>D: Update image metadata
    
    U->>N: Fill card details
    N->>A: Mutation: createCard
    A->>D: Save card data
    D->>A: Confirm save
    A->>N: Return card ID
    
    D->>L: DynamoDB Stream event
    L->>O: Index card for search
    
    N->>U: Show success & redirect
```

### Browse and Search Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js App
    participant A as AppSync API
    participant D as DynamoDB
    participant O as OpenSearch
    participant CF as CloudFront

    alt Browse by Category
        U->>N: Select category
        N->>A: Query: cardsByCategory
        A->>D: Query GSI by category
        D->>A: Return card list
    else Search by Keyword
        U->>N: Enter search term
        N->>A: Query: searchCards
        A->>O: Full-text search
        O->>A: Return matches
    end
    
    A->>N: Return results
    N->>CF: Request card images
    CF->>N: Deliver cached images
    N->>U: Display card grid
    
    U->>N: Click card
    N->>A: Query: getCard
    A->>D: Fetch full details
    D->>A: Return card data
    A->>N: Return complete card
    N->>U: Show detail view
```

### Real-time Voting and Comments

```mermaid
sequenceDiagram
    participant U1 as User 1
    participant U2 as User 2
    participant N1 as Next.js (U1)
    participant N2 as Next.js (U2)
    participant A as AppSync API
    participant D as DynamoDB
    participant Sub as Subscriptions

    Note over U2,N2: Viewing same card
    
    U1->>N1: Click upvote
    N1->>N1: Optimistic update
    N1->>A: Mutation: voteCard
    A->>D: Save vote
    D->>A: Confirm
    A->>Sub: Publish update
    
    Sub->>N1: Confirm vote
    Sub->>N2: Notify vote change
    N2->>U2: Update vote count
    
    U1->>N1: Write comment
    N1->>A: Mutation: addComment
    A->>D: Save comment
    D->>A: Confirm
    A->>Sub: Publish comment
    
    Sub->>N2: New comment
    N2->>U2: Display comment
```

### Content Moderation Workflow

```mermaid
sequenceDiagram
    participant U as User
    participant N as Next.js App
    participant A as AppSync API
    participant D as DynamoDB
    participant M as Moderation Lambda
    participant Admin as Admin User

    U->>N: Flag content
    N->>A: Mutation: flagContent
    A->>D: Save flag record
    A->>M: Trigger moderation
    
    M->>D: Check flag count
    alt Threshold Exceeded
        M->>D: Update status to "Under Review"
        M->>Admin: Send notification
        Admin->>N: Review content
        Admin->>A: Approve/Remove decision
        A->>D: Update content status
    else Below Threshold
        M->>D: Log flag only
    end
    
    D->>A: Return status
    A->>N: Confirm flag
    N->>U: Show acknowledgment
```
