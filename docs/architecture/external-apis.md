# External APIs

### Google OAuth API
- **Purpose:** Enable user authentication via Google accounts
- **Documentation:** https://developers.google.com/identity/protocols/oauth2
- **Base URL(s):** https://accounts.google.com/o/oauth2/v2/auth
- **Authentication:** OAuth 2.0 flow managed by Cognito
- **Rate Limits:** 10,000 requests per day (free tier)

**Key Endpoints Used:**
- `GET /auth` - Initial authorization request
- `POST /token` - Exchange authorization code for tokens
- `GET /userinfo` - Retrieve user profile information

**Integration Notes:** Handled entirely through Cognito Identity Providers configuration. Requires Google Cloud Console project with OAuth 2.0 credentials.

### Facebook Login API
- **Purpose:** Enable user authentication via Facebook accounts
- **Documentation:** https://developers.facebook.com/docs/facebook-login
- **Base URL(s):** https://www.facebook.com/v18.0/dialog/oauth
- **Authentication:** OAuth 2.0 flow managed by Cognito
- **Rate Limits:** 200 calls per hour per user

**Key Endpoints Used:**
- `GET /dialog/oauth` - Initial authorization dialog
- `GET /oauth/access_token` - Exchange code for access token
- `GET /me` - Retrieve user profile data

**Integration Notes:** Managed through Cognito Identity Providers. Requires Facebook App ID and App Secret from Facebook Developer Console.
