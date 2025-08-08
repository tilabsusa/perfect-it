# Introduction

This document outlines the overall project architecture for PerfectIt, including backend systems, shared services, and non-UI specific concerns. Its primary goal is to serve as the guiding architectural blueprint for AI-driven development, ensuring consistency and adherence to chosen patterns and technologies.

**Relationship to Frontend Architecture:**
If the project includes a significant user interface, a separate Frontend Architecture Document will detail the frontend-specific design and MUST be used in conjunction with this document. Core technology stack choices documented herein (see "Tech Stack") are definitive for the entire project, including any frontend components.

### Starter Template or Existing Project

Based on your clarification, this project uses the **AWS Amplify Next.js Template** as its foundation:
- **Template Source:** https://github.com/aws-samples/amplify-next-template
- **Template Type:** Official AWS sample template for Amplify Gen 2 with Next.js
- **Key Features:** Pre-configured Next.js 14+ App Router, Amplify Gen 2 backend setup, TypeScript support, authentication scaffolding

**Decision:** Development will proceed using the already-cloned `amplify-next-template` which provides:
- Pre-configured monorepo structure with Next.js and Amplify backend
- Working authentication setup with Amplify Auth
- Example data models and API configuration
- Deployment pipeline configuration for Amplify Hosting
- Best practices for Amplify Gen 2 development

This template accelerates development by providing a production-ready foundation that aligns with AWS best practices.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-08-08 | 1.0 | Initial Architecture Document | Architect |
