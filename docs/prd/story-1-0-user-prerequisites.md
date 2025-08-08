# Story 1.0: User Prerequisites and External Account Setup

## Story Statement
As a project owner,  
I want to complete all external account setups and configurations before development begins,  
so that the development team has all necessary access and credentials to implement the authentication and infrastructure.

## Priority: CRITICAL - BLOCKER
This story MUST be completed before any development work begins. All subsequent stories depend on these prerequisites.

## User Responsibilities (Human-Only Tasks)

### Required Accounts to Create

#### 1. AWS Account Setup
**Responsibility:** USER ONLY  
**Timeline:** Before Story 1.1

**Steps:**
1. Navigate to https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Provide email, password, and account name
4. Enter payment information (credit card required)
5. Choose "Basic Support Plan" (free tier)
6. Verify phone number via SMS/call
7. Wait for account activation email (usually instant)
8. Sign in to AWS Console to verify access

**Deliverables to Development Team:**
- AWS Account ID (12-digit number)
- Root account email (for emergency access only)
- Confirmation that billing alerts are configured

#### 2. Google OAuth Application Setup
**Responsibility:** USER ONLY  
**Timeline:** Before Story 1.2

**Prerequisites:** Google account with access to Google Cloud Console

**Steps:**
1. Navigate to https://console.cloud.google.com/
2. Create a new project or select existing:
   - Click "Select a Project" → "New Project"
   - Name: "PerfectIt-Production"
   - Click "Create"
3. Enable Google+ API:
   - Go to "APIs & Services" → "Library"
   - Search for "Google+ API"
   - Click "Enable"
4. Create OAuth 2.0 Credentials:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth client ID"
   - Configure consent screen first:
     - User Type: "External"
     - App name: "PerfectIt"
     - User support email: [your email]
     - App logo: (upload PerfectIt logo if available)
     - Application home page: https://your-domain.com
     - Authorized domains: your-domain.com
     - Developer contact: [your email]
   - Create OAuth client:
     - Application type: "Web application"
     - Name: "PerfectIt Web Client"
     - Authorized JavaScript origins:
       - http://localhost:3000 (development)
       - https://your-domain.com (production)
       - https://your-amplify-domain.amplifyapp.com (staging)
     - Authorized redirect URIs:
       - http://localhost:3000/oauth/callback
       - https://your-domain.com/oauth/callback
       - https://your-amplify-domain.amplifyapp.com/oauth/callback

**Deliverables to Development Team:**
- Google Client ID
- Google Client Secret (store securely)
- Confirmation of authorized redirect URIs

#### 3. Facebook OAuth Application Setup
**Responsibility:** USER ONLY  
**Timeline:** Before Story 1.2

**Prerequisites:** Facebook account with developer access

**Steps:**
1. Navigate to https://developers.facebook.com/
2. Click "My Apps" → "Create App"
3. Select "Consumer" as app type
4. Fill in app details:
   - App name: "PerfectIt"
   - App contact email: [your email]
   - App purpose: "Yourself or your own business"
5. After creation, go to Dashboard
6. Add Facebook Login product:
   - Click "Set Up" under Facebook Login
   - Choose "Web"
   - Site URL: https://your-domain.com
7. Configure Facebook Login Settings:
   - Go to Facebook Login → Settings
   - Valid OAuth Redirect URIs:
     - http://localhost:3000/oauth/callback
     - https://your-domain.com/oauth/callback
     - https://your-amplify-domain.amplifyapp.com/oauth/callback
   - Enable: Client OAuth Login, Web OAuth Login
8. Go to Settings → Basic:
   - Add App Domains: localhost, your-domain.com
   - Add Platform → Website: https://your-domain.com
   - Save Changes

**Deliverables to Development Team:**
- Facebook App ID
- Facebook App Secret (store securely)
- Confirmation of redirect URIs configured

#### 4. Domain Name Registration (Optional but Recommended)
**Responsibility:** USER ONLY  
**Timeline:** Before Story 1.5

**Options:**
1. **AWS Route 53** (Recommended for integration):
   - Navigate to Route 53 in AWS Console
   - Click "Register domain"
   - Search for desired domain
   - Add to cart and complete purchase
   - Cost: $12-40/year depending on TLD

2. **External Registrar** (GoDaddy, Namecheap, etc.):
   - Register domain with preferred registrar
   - Note: Will need to configure DNS to point to AWS later

**Deliverables to Development Team:**
- Registered domain name
- DNS management access (if external registrar)
- Confirmation of registrar used

### Environment Variables to Prepare

Create a secure document with the following values:

```env
# AWS Configuration
AWS_ACCOUNT_ID=123456789012
AWS_REGION=us-east-1

# OAuth Providers
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret

# Domain Configuration (if registered)
DOMAIN_NAME=perfectit.com
```

## Developer Agent Responsibilities

### After User Completes Prerequisites

1. **Verify AWS Account Access:**
   - Confirm AWS CLI can authenticate
   - Verify necessary service quotas
   - Set up IAM user for Amplify

2. **Configure OAuth in Amplify:**
   - Add OAuth configuration to amplify/auth/resource.ts
   - Configure callback URLs in Amplify
   - Test OAuth flow in development

3. **Document Configuration:**
   - Create .env.example file
   - Update README with setup instructions
   - Document any additional configuration needed

## Acceptance Criteria

### User Completion Checklist:
- [ ] AWS account created and activated
- [ ] AWS Account ID documented
- [ ] Google OAuth app created with Client ID and Secret
- [ ] Facebook OAuth app created with App ID and Secret
- [ ] All OAuth redirect URIs configured correctly
- [ ] Domain name registered (optional)
- [ ] All credentials documented in secure location
- [ ] Credentials shared with development team securely

### Developer Validation Checklist:
- [ ] AWS CLI can authenticate successfully
- [ ] OAuth credentials are valid (test API calls)
- [ ] Redirect URIs match development/production URLs
- [ ] Environment variables documented in .env.example
- [ ] README updated with setup prerequisites

## Timeline

**Total Duration:** 2-4 hours of user time

1. AWS Account Setup: 30 minutes
2. Google OAuth Setup: 45 minutes
3. Facebook OAuth Setup: 45 minutes
4. Domain Registration: 30 minutes (optional)
5. Documentation: 30 minutes

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| OAuth app approval delays | HIGH | Create apps early, use development mode initially |
| Wrong redirect URIs | HIGH | Document all environment URLs upfront |
| Lost credentials | HIGH | Use password manager, enable 2FA |
| AWS billing surprises | MEDIUM | Set up billing alerts at $5, $10, $25 |
| Domain unavailable | LOW | Have 3-5 backup domain options ready |

## Support Resources

- **AWS Account Issues:** https://aws.amazon.com/contact-us/
- **Google OAuth Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Facebook Login Documentation:** https://developers.facebook.com/docs/facebook-login/web
- **Domain Registration Help:** Registrar-specific support

## Notes

- **Security:** Never commit credentials to Git. Use AWS Secrets Manager for production.
- **Development:** Developers can work with test accounts initially if production accounts aren't ready.
- **Costs:** AWS Free Tier covers most development. OAuth apps are free. Domain is only paid service (~$12/year).

## Definition of Done

- [ ] All external accounts created and verified
- [ ] OAuth applications configured with correct redirect URIs
- [ ] Credentials securely documented and shared
- [ ] Development team has confirmed access to all required services
- [ ] User understands ongoing responsibilities (billing, domain renewal)