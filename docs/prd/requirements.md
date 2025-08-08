# Requirements

### Functional

- FR1: Users must be able to register accounts with email/password or OAuth social login (Google, Facebook)
- FR2: Each user profile must display expertise tags, contributed Perfection Cards, and reputation score based on upvotes
- FR3: Users must be able to upload images (JPEG, PNG, up to 5MB) and create Perfection Cards with structured fields (title, description, step-by-step instructions, tools, materials, difficulty level, time estimate, cost estimate)
- FR4: The system must automatically resize and compress uploaded images while maintaining visual quality for web display
- FR5: Users must be able to browse Perfection Cards by categories (furniture, crafts, home repair, garden, etc.) with pagination
- FR6: The search function must support text-based queries across card titles, descriptions, and tags with relevance ranking
- FR7: Users must be able to filter search results by difficulty level (beginner/intermediate/expert), estimated time, and estimated cost
- FR8: Each Perfection Card must support upvoting/downvoting with a cumulative score visible to all users
- FR9: Users must be able to comment on Perfection Cards with threaded discussions and @mentions
- FR10: Users must be able to save Perfection Cards to personal collections (e.g., "Weekend Projects", "Kitchen Improvements")
- FR11: The system must implement content moderation with flagging for inappropriate or dangerous content
- FR12: Users must be able to edit or delete their own Perfection Cards and comments
- FR13: The platform must track and display view counts and engagement metrics for each Perfection Card

### Non Functional

- NFR1: Page load time must not exceed 3 seconds on 4G mobile connections
- NFR2: Image upload and processing must complete within 10 seconds for a 5MB file
- NFR3: The platform must support 1,000 concurrent users without performance degradation
- NFR4: The system must maintain 99.5% uptime excluding scheduled maintenance windows
- NFR5: All user data must be encrypted in transit (HTTPS/TLS 1.3) and at rest (AES-256)
- NFR6: The platform must be GDPR compliant with user data export and deletion capabilities
- NFR7: The UI must be fully responsive and functional on mobile browsers (iOS Safari, Chrome Android)
- NFR8: The system must implement rate limiting to prevent abuse (100 API calls per minute per user)
- NFR9: Image storage costs must be optimized through progressive loading and CDN caching
- NFR10: The platform must support Chrome, Safari, Firefox, and Edge (latest 2 versions)
- NFR11: Database backups must occur daily with 30-day retention and point-in-time recovery capability
- NFR12: The system must log all critical user actions for audit and debugging purposes
