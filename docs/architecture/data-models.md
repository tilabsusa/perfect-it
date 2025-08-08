# Data Models

### User
**Purpose:** Represents authenticated users with profile information and reputation tracking

**Key Attributes:**
- id: String (UUID) - Unique identifier from Cognito
- username: String - Unique display name
- email: String - Contact email (private)
- avatarUrl: String - Profile image S3 URL
- bio: String - User description (max 500 chars)
- expertiseTags: String[] - Areas of expertise
- reputationScore: Number - Calculated reputation points
- joinedAt: DateTime - Registration timestamp
- isVerified: Boolean - Expert verification status
- socialLinks: Map - Social media profiles

**Relationships:**
- Has many PerfectionCards (author)
- Has many Comments
- Has many Votes
- Has many Collections
- Has many UserFollows (followers/following)

### PerfectionCard
**Purpose:** Core content entity containing improvement instructions for specific items

**Key Attributes:**
- id: String (UUID) - Unique identifier
- title: String - Card title (max 100 chars)
- description: String - Brief summary (max 500 chars)
- imageUrls: String[] - S3 URLs for card images
- instructions: String[] - Step-by-step instructions
- materials: Material[] - Required materials list
- tools: String[] - Required tools
- category: String - Primary category
- tags: String[] - Searchable tags
- difficulty: Enum (Beginner|Intermediate|Expert)
- estimatedTime: Number - Minutes to complete
- estimatedCost: Number - USD cost estimate
- viewCount: Number - Total views
- voteScore: Number - Net votes (up - down)
- authorId: String - Reference to User
- createdAt: DateTime
- updatedAt: DateTime
- status: Enum (Draft|Published|Flagged|Removed)

**Relationships:**
- Belongs to User (author)
- Has many Comments
- Has many Votes
- Belongs to many Collections

### Comment
**Purpose:** User discussions and feedback on Perfection Cards

**Key Attributes:**
- id: String (UUID)
- content: String - Comment text (max 1000 chars)
- cardId: String - Reference to PerfectionCard
- authorId: String - Reference to User
- parentId: String - For nested replies (optional)
- voteCount: Number - Helpful votes
- createdAt: DateTime
- editedAt: DateTime
- status: Enum (Active|Flagged|Removed)

**Relationships:**
- Belongs to PerfectionCard
- Belongs to User (author)
- Has many Comments (replies)
- Has many CommentVotes

### Vote
**Purpose:** Track user votes on cards and comments

**Key Attributes:**
- id: String (Composite: userId#targetId)
- userId: String - Voter reference
- targetId: String - Card or Comment ID
- targetType: Enum (Card|Comment)
- voteType: Enum (Up|Down)
- createdAt: DateTime

**Relationships:**
- Belongs to User
- Belongs to PerfectionCard or Comment

### Collection
**Purpose:** User-created groups of saved Perfection Cards

**Key Attributes:**
- id: String (UUID)
- name: String - Collection title
- description: String - Optional description
- ownerId: String - Reference to User
- isPublic: Boolean - Visibility setting
- cardIds: String[] - References to PerfectionCards
- followerCount: Number - Users following collection
- createdAt: DateTime
- updatedAt: DateTime

**Relationships:**
- Belongs to User (owner)
- Has many PerfectionCards
- Has many CollectionFollowers

### Category
**Purpose:** Hierarchical organization structure for browsing

**Key Attributes:**
- id: String - URL-safe identifier
- name: String - Display name
- parentId: String - Parent category (optional)
- description: String
- iconUrl: String - Category icon
- cardCount: Number - Total cards in category
- sortOrder: Number - Display ordering

**Relationships:**
- Has many PerfectionCards
- Has many Categories (subcategories)
