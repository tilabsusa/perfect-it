# Epic 5: User Profiles & Reputation System

**Goal:** Develop comprehensive user profiles that showcase expertise, contributions, and build trust within the community. This epic completes the MVP by adding the human element to the platform.

### Story 5.1: Create User Profile Pages

As a user,  
I want a profile page that showcases my contributions and expertise,  
so that I can build reputation and connect with the community.

**Acceptance Criteria:**

1. Public profile URL (perfectit.com/u/username)
2. Profile header with avatar, name, bio, joined date
3. Expertise tags with endorsement counts
4. Statistics dashboard (cards created, total votes, comments)
5. Grid of user's Perfection Cards
6. Public collections section
7. Activity timeline showing recent actions
8. Follow/unfollow button for other users
9. Contact button (when messaging implemented)
10. Edit profile button for own profile

### Story 5.2: Implement Profile Editing

As a user,  
I want to customize my profile information,  
so that I can accurately represent my skills and interests.

**Acceptance Criteria:**

1. Edit profile form with all editable fields
2. Amplify UI Avatar component with FileUploader for profile images
3. Bio rich text editor with character limit
4. Expertise tags selector with autocomplete
5. Social media links addition
6. Privacy settings (show email, activity, etc.)
7. Username change with availability check
8. Save draft and preview before saving
9. Validation for required fields
10. Success confirmation with view profile link

### Story 5.3: Build Reputation Scoring System

As a platform owner,  
I want users to earn reputation based on quality contributions,  
so that expertise and helpfulness are recognized and rewarded.

**Acceptance Criteria:**

1. Reputation score calculation algorithm implemented
2. Points for cards created, upvotes received, helpful comments
3. Reputation badges/levels (Beginner, Contributor, Expert, Master)
4. Badge display on profiles and comments
5. Leaderboard page showing top contributors
6. Weekly/monthly reputation highlights
7. Reputation history graph on profile
8. Special privileges for high reputation users
9. Reputation decay for inactive users
10. Anti-gaming measures for reputation system

### Story 5.4: Implement Expertise Tag System

As a user,  
I want to tag my areas of expertise and have them verified by the community,  
so that others can trust my knowledge in specific domains.

**Acceptance Criteria:**

1. Predefined expertise tag taxonomy
2. Tag selection during profile creation/editing
3. Endorsement system for other users' expertise
4. Minimum endorsements for "verified" status
5. Tag-based user discovery/search
6. Expertise tags shown on Perfection Cards
7. Auto-suggest tags based on created content
8. Tag statistics (users with tag, cards in tag)
9. Request new tag functionality
10. Tag moderation for inappropriate entries

### Story 5.5: Create User Dashboard

As an authenticated user,  
I want a personal dashboard to manage my content and track engagement,  
so that I can monitor my impact and improve my contributions.

**Acceptance Criteria:**

1. Dashboard homepage for authenticated users
2. Quick stats widgets (views, votes, comments this week)
3. Recent activity on user's cards
4. Draft Perfection Cards section
5. Saved cards quick access
6. Trending in your expertise areas
7. Recommended cards based on interests
8. Quick actions (create card, manage collections)
9. Notification summary widget
10. Personalization options for dashboard layout
