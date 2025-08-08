# Epic 2: Perfection Card Core System

**Goal:** Implement the heart of PerfectIt - the ability to create, view, edit, and delete Perfection Cards with structured improvement instructions. This epic delivers the core value proposition where users can document and share their expertise through visual guides.

### Story 2.1: Design and Implement Perfection Card Data Model
As a developer,  
I want to establish the GraphQL schema and DynamoDB tables for Perfection Cards,  
so that we have a robust data foundation for all card operations.

**Acceptance Criteria:**
1. GraphQL schema defined for PerfectionCard type with all required fields
2. DynamoDB table configured with appropriate partition and sort keys for efficient queries
3. Global Secondary Indexes (GSI) created for querying by user, category, and creation date
4. Amplify Data model includes relationships between User and PerfectionCard
5. Authorization rules implemented (owners can edit/delete, public can read)
6. Timestamps (createdAt, updatedAt) automatically managed
7. Data validation rules defined for required fields
8. Test data seeding script created for development environment

### Story 2.2: Implement Image Upload and Processing Pipeline
As a user,  
I want to upload images for my Perfection Cards that are automatically optimized,  
so that my improvement guides have clear visual references without slow loading times.

**Acceptance Criteria:**
1. Amplify Storage configured with proper bucket policies and CORS settings
2. Amplify UI FileUploader component configured with drag-and-drop and file selection
3. Client-side image preview before upload with basic cropping capability
4. File size validation (max 5MB) and format validation (JPEG, PNG only)
5. Lambda function triggered on S3 upload to resize images (thumbnail, medium, large)
6. Processed images stored with CDN-friendly naming convention
7. Upload progress indicator and error handling for failed uploads
8. Cleanup process for orphaned images when cards are deleted

### Story 2.3: Create Perfection Card Creation Wizard
As a content creator,  
I want a guided process for creating Perfection Cards,  
so that I can easily document improvement techniques with all necessary details.

**Acceptance Criteria:**
1. Multi-step wizard UI using MUI Stepper with Amplify UI form components
2. Step 1: Image upload with preview and basic editing
3. Step 2: Basic information (title, description, category selection)
4. Step 3: Materials and tools lists with add/remove functionality
5. Step 4: Step-by-step instructions with rich text editor
6. Step 5: Metadata (difficulty level, time estimate, cost estimate)
7. Step 6: Review and preview before submission
8. Draft saving capability to resume incomplete cards
9. GraphQL mutations for creating cards with proper error handling
10. Success confirmation with link to view created card

### Story 2.4: Build Perfection Card Detail View
As a user,  
I want to view complete Perfection Card details in an engaging layout,  
so that I can understand and follow the improvement instructions.

**Acceptance Criteria:**
1. Responsive layout with hero image and structured content sections
2. Image gallery component for multiple views (if available)
3. Materials and tools displayed as chips or badges
4. Step-by-step instructions with clear numbering and formatting
5. Metadata badges showing difficulty, time, and cost estimates
6. View count incremented and displayed
7. Breadcrumb navigation showing category hierarchy
8. Print-friendly version accessible via button
9. Share buttons for social media platforms
10. Related cards suggestion section (placeholder for now)

### Story 2.5: Implement Edit and Delete Functionality
As a card owner,  
I want to update or remove my Perfection Cards,  
so that I can improve content quality or remove outdated information.

**Acceptance Criteria:**
1. Edit button visible only to card owners when authenticated
2. Edit mode reuses creation wizard with pre-populated data
3. Image replacement with old image cleanup functionality
4. Change history tracked in audit fields
5. Delete confirmation dialog with clear warning message
6. Soft delete implementation with recovery option (30 days)
7. GraphQL mutations for update and delete with authorization checks
8. Cascade delete for associated data (images, future comments)
9. Success/error notifications for all operations
