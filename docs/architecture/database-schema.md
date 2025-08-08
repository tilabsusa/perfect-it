# Database Schema

### DynamoDB Single-Table Design

PerfectIt uses a single-table design pattern in DynamoDB for optimal performance and cost efficiency. This approach minimizes the number of tables and requests while supporting all access patterns.

**Table Name:** `perfectit-main`

**Primary Key Structure:**
- **Partition Key (PK):** Entity type and ID composite
- **Sort Key (SK):** Entity-specific sorting/relationship data

### Entity Patterns

| Entity | PK | SK | GSI1PK | GSI1SK | GSI2PK | GSI2SK |
|--------|----|----|--------|--------|--------|--------|
| User | `USER#<userId>` | `PROFILE` | `USERNAME#<username>` | `PROFILE` | - | - |
| PerfectionCard | `CARD#<cardId>` | `METADATA` | `CAT#<category>` | `CREATED#<timestamp>` | `USER#<authorId>` | `CREATED#<timestamp>` |
| Comment | `CARD#<cardId>` | `COMMENT#<timestamp>#<commentId>` | `USER#<authorId>` | `COMMENT#<timestamp>` | - | - |
| Vote | `VOTE#<userId>#<targetId>` | `VOTE` | `TARGET#<targetId>` | `VOTE#<timestamp>` | - | - |
| Collection | `USER#<userId>` | `COLLECTION#<collectionId>` | `COLLECTION#<collectionId>` | `METADATA` | - | - |
| CardInCollection | `COLLECTION#<collectionId>` | `CARD#<cardId>` | - | - | - | - |
| Category | `CAT#<categoryId>` | `METADATA` | `PARENT#<parentId>` | `SORT#<sortOrder>` | - | - |

### Global Secondary Indexes (GSIs)

**GSI1: Category and Username Index**
- Supports queries by category, username lookups
- Access patterns: Browse cards by category, find user by username

**GSI2: Author Index**
- Supports queries for all content by a specific author
- Access patterns: User's cards, user's comments

**GSI3: Time-based Queries**
- PK: `DATE#<YYYY-MM-DD>`, SK: `CREATED#<timestamp>#<entityId>`
- Access patterns: Trending content, recent cards, daily analytics

**GSI4: Search Support**
- PK: `SEARCH#<searchableField>`, SK: `CARD#<cardId>`
- Limited text search before OpenSearch integration

**GSI5: Vote Aggregation**
- PK: `VOTETYPE#<type>`, SK: `SCORE#<score>#<targetId>`
- Access patterns: Top voted cards, controversial content

### Access Patterns

| Access Pattern | Index | Query |
|---------------|-------|-------|
| Get user profile | Main | PK=`USER#<userId>`, SK=`PROFILE` |
| Get user by username | GSI1 | PK=`USERNAME#<username>` |
| List cards by category | GSI1 | PK=`CAT#<category>`, SK begins_with `CREATED#` |
| List cards by author | GSI2 | PK=`USER#<authorId>`, SK begins_with `CREATED#` |
| Get card details | Main | PK=`CARD#<cardId>`, SK=`METADATA` |
| Get card comments | Main | PK=`CARD#<cardId>`, SK begins_with `COMMENT#` |
| Get user collections | Main | PK=`USER#<userId>`, SK begins_with `COLLECTION#` |
| Get collection cards | Main | PK=`COLLECTION#<collectionId>`, SK begins_with `CARD#` |
| Check user vote | Main | PK=`VOTE#<userId>#<targetId>` |
| Get trending cards | GSI3 | PK=`DATE#<today>`, limit 20 |
| Get top voted | GSI5 | PK=`VOTETYPE#CARD`, SK begins_with `SCORE#`, ScanIndexForward=false |

### DynamoDB Streams Configuration

- **Stream View Type:** NEW_AND_OLD_IMAGES
- **Lambda Triggers:**
  - Search indexer (updates OpenSearch)
  - Analytics aggregator (updates metrics)
  - Notification processor (sends real-time updates)

### Data Types and Attributes

Common attributes stored in item body:
```json
{
  "PK": "CARD#123",
  "SK": "METADATA",
  "entityType": "PerfectionCard",
  "id": "123",
  "title": "Perfect Wood Finish",
  "description": "...",
  "imageUrls": [...],
  "instructions": [...],
  "materials": {...},
  "tools": [...],
  "category": "woodworking",
  "tags": ["furniture", "finishing"],
  "difficulty": "INTERMEDIATE",
  "estimatedTime": 120,
  "estimatedCost": 50,
  "viewCount": 0,
  "voteScore": 0,
  "authorId": "user123",
  "status": "PUBLISHED",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z",
  "GSI1PK": "CAT#woodworking",
  "GSI1SK": "CREATED#2025-01-01T00:00:00Z",
  "GSI2PK": "USER#user123",
  "GSI2SK": "CREATED#2025-01-01T00:00:00Z"
}
```

### Cost Optimization Strategies

- **On-Demand Pricing:** Start with on-demand, switch to provisioned when patterns stabilize
- **TTL for Temporary Data:** Set TTL on draft cards, old notifications
- **Compression:** Store large text fields (instructions) as compressed JSON
- **Batch Operations:** Use BatchGetItem and BatchWriteItem for bulk operations
- **Caching:** CloudFront for images, API Gateway caching for popular queries
