# Epic 4: Community Engagement Features

**Goal:** Implement social features that drive user engagement, content quality, and community building. This epic transforms PerfectIt from a content repository into an interactive community platform.

### Story 4.1: Implement Voting System

As a user,  
I want to upvote or downvote Perfection Cards,  
so that I can contribute to content quality signals for the community.

**Acceptance Criteria:**

1. Upvote/downvote buttons on card detail and list views
2. Vote state persisted per user in DynamoDB
3. Real-time vote count updates using AppSync subscriptions
4. Prevent multiple votes from same user
5. Vote change capability (switch from up to down)
6. Anonymous voting for non-authenticated users (session-based)
7. Vote analytics for trending algorithm
8. GraphQL mutations with optimistic updates
9. Visual feedback on vote action

### Story 4.2: Build Commenting System

As a user,  
I want to comment on Perfection Cards and discuss with others,  
so that I can ask questions, share experiences, and improve the guides.

**Acceptance Criteria:**

1. Comment thread component at bottom of card detail
2. Rich text editor for comment creation
3. Nested replies support (2 levels deep)
4. @mention functionality for user notifications
5. Comment voting for helpful responses
6. Edit and delete own comments capability
7. Moderation flagging system
8. Real-time updates via AppSync subscriptions
9. Pagination for long comment threads
10. Comment count displayed on card previews

### Story 4.3: Create User Collections Feature

As a user,  
I want to save Perfection Cards to personal collections,  
so that I can organize and quickly access guides for my projects.

**Acceptance Criteria:**

1. "Save to Collection" button on card views
2. Default "Saved Cards" collection for all users
3. Create custom collections with name and description
4. Add/remove cards from collections
5. Collection privacy settings (public/private)
6. Collection sharing via URL
7. Collection management page with grid view
8. Quick save with collection selector dropdown
9. Collection statistics (card count, last updated)
10. Export collection as PDF or bookmark list

### Story 4.4: Implement Content Moderation System

As a platform owner,  
I want to moderate user-generated content,  
so that the platform remains safe and valuable for all users.

**Acceptance Criteria:**

1. Flag inappropriate content button for cards and comments
2. Flag categories (spam, inappropriate, dangerous, copyright)
3. Moderation queue dashboard for admin users
4. Bulk moderation actions (approve, remove, ban)
5. Automated flagging for suspicious patterns
6. User warning and ban system
7. Appeal process for removed content
8. Moderation audit log
9. Community guidelines page
10. Auto-hide content exceeding flag threshold

### Story 4.5: Build Notification System

As a user,  
I want to receive notifications about relevant activities,  
so that I stay engaged with my content and the community.

**Acceptance Criteria:**

1. In-app notification bell icon with count badge
2. Notification types (comments, mentions, votes, follows)
3. Notification preferences management page
4. Mark as read/unread functionality
5. Notification history with pagination
6. Email notification option for important events
7. Push notification setup (PWA)
8. Batch notification digest option
9. Clear all notifications action
10. Real-time notification updates
