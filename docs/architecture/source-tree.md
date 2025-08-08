# Source Tree

The PerfectIt project follows the AWS Amplify Gen 2 monorepo structure based on the amplify-next-template:

```
perfectit/
├── .amplify/                     # Amplify CLI generated files (gitignored)
├── .next/                        # Next.js build output (gitignored)
├── amplify/                      # Backend configuration
│   ├── auth/                     # Authentication resource
│   │   └── resource.ts          # Cognito configuration
│   ├── data/                     # Data layer
│   │   ├── resource.ts          # DynamoDB models & GraphQL schema
│   │   └── custom-resolvers/    # Custom business logic resolvers
│   ├── functions/                # Lambda functions
│   │   ├── image-processor/     
│   │   │   ├── handler.ts      # Image processing logic
│   │   │   ├── package.json    
│   │   │   └── tsconfig.json   
│   │   ├── content-moderator/   
│   │   │   └── handler.ts      # Moderation logic
│   │   ├── search-indexer/      
│   │   │   └── handler.ts      # OpenSearch sync
│   │   └── post-confirmation/   
│   │       └── handler.ts      # User profile creation
│   ├── storage/                  # S3 configuration
│   │   └── resource.ts          # Bucket policies & triggers
│   └── backend.ts               # Main backend configuration
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth group route
│   │   ├── login/               
│   │   │   └── page.tsx        
│   │   ├── register/            
│   │   │   └── page.tsx        
│   │   └── layout.tsx          # Auth layout wrapper
│   ├── (dashboard)/              # Authenticated routes
│   │   ├── cards/               
│   │   │   ├── [id]/           
│   │   │   │   └── page.tsx    # Card detail view
│   │   │   ├── create/         
│   │   │   │   └── page.tsx    # Card creation wizard
│   │   │   └── page.tsx        # Cards listing
│   │   ├── profile/             
│   │   │   ├── [username]/     
│   │   │   │   └── page.tsx    # Public profile
│   │   │   └── edit/           
│   │   │       └── page.tsx    # Edit profile
│   │   ├── collections/         
│   │   │   └── page.tsx        # User collections
│   │   └── layout.tsx           # Dashboard layout with nav
│   ├── api/                      # API routes (if needed)
│   │   └── health/              
│   │       └── route.ts        # Health check endpoint
│   ├── globals.css              # Global styles and MUI overrides
│   ├── layout.tsx               # Root layout
│   └── page.tsx                 # Landing page
├── components/                   # Shared React components
│   ├── cards/                   # Card-related components
│   │   ├── CardGrid.tsx        
│   │   ├── CardDetail.tsx      
│   │   ├── CardForm.tsx        
│   │   └── CardPreview.tsx     
│   ├── ui/                      # UI components
│   │   ├── Navigation.tsx      # MUI AppBar navigation
│   │   ├── Drawer.tsx          # MUI Drawer menu
│   │   ├── ThemeProvider.tsx   # MUI theme configuration
│   │   └── AmplifyProvider.tsx # Amplify UI provider
│   ├── auth/                    # Auth components
│   │   ├── Authenticator.tsx   # Amplify Authenticator wrapper
│   │   └── AuthGuard.tsx       # Route protection
│   └── common/                  # Common components
│       ├── LoadingSpinner.tsx  
│       ├── ErrorBoundary.tsx   
│       └── SEO.tsx             # SEO meta tags
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts               # Authentication hook
│   ├── useCards.ts              # Card data operations
│   └── useSubscription.ts       # GraphQL subscriptions
├── lib/                          # Utility libraries
│   ├── amplify/                 # Amplify configuration
│   │   ├── client.ts           # Client-side Amplify setup
│   │   └── server.ts           # Server-side Amplify setup
│   ├── theme/                   # MUI theme
│   │   └── theme.ts            # MUI theme configuration
│   └── utils/                   # Utility functions
│       ├── validation.ts       # Input validation
│       └── formatting.ts       # Data formatting
├── public/                       # Static assets
│   ├── images/                  # Static images
│   └── favicon.ico             
├── types/                        # TypeScript types
│   ├── amplify/                 # Generated Amplify types
│   │   └── API.ts              # GraphQL types (generated)
│   └── index.d.ts              # Custom type definitions
├── .env.local                   # Local environment variables
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   
├── .prettierrc                  # Prettier configuration
├── amplify.yml                  # Amplify hosting build spec
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies & scripts
├── README.md                    # Project documentation
└── tsconfig.json                # TypeScript configuration
```

### Key Directory Responsibilities

**`/amplify`** - Backend infrastructure as code
- All AWS resource definitions
- Lambda function code
- Data models and API schema
- Keep backend logic separate from frontend

**`/app`** - Next.js application routes
- File-based routing with App Router
- Route groups for organization
- Server components by default
- Client components marked with 'use client'

**`/components`** - Reusable UI components
- Organized by feature/domain
- Mix of Amplify UI and MUI components
- All components are TypeScript

**`/lib`** - Core utilities and configuration
- Amplify client/server setup
- MUI theme configuration
- Shared utility functions

**`/types`** - TypeScript definitions
- Generated GraphQL types from Amplify
- Custom application types
- Third-party library augmentations
