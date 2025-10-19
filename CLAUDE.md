# WPP Media MCP Servers Project

## Project Overview

WPP Media is a large global agency with thousands of users managing Google Search Console, Google Ads, and other search/social platforms for various clients. This project aims to build secure, controlled MCP (Model Context Protocol) servers that allow LLMs to interact with these platforms programmatically while maintaining strict safety, privacy, and authorization controls.

### Problem Statement

- **Scale**: Managing multiple clients' accounts across multiple platforms
- **Safety**: LLMs making mistakes could have serious consequences (budget changes, data deletion)
- **Privacy**: Exposing client private data to LLMs requires careful control
- **Control**: Need granular authorization - who can do what on which accounts

### Solution

Build MCP servers that:
1. Connect to Google APIs securely via OAuth 2.0
2. Enforce strict account isolation (users only access pre-selected accounts)
3. Implement approval workflows for write operations
4. Provide comprehensive audit logging
5. Support role-based access control
6. Offer dry-run previews for destructive operations

## Architecture

### High-Level Design

```
┌─────────────────────────────────────────────────────────────────┐
│                        LLM (Claude)                              │
│                                                                   │
│  Calls MCP Tools with user input                                 │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│               MCP Server (TypeScript/Node.js)                    │
│                                                                   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Authorization & Validation Layer                         │   │
│  │ - User permission checks                                 │   │
│  │ - Account access verification                            │   │
│  │ - Input validation & sanitization                        │   │
│  │ - Dry-run calculation & preview                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ MCP Tools (Resources & Functions)                        │   │
│  │ - Google Search Console Operations                       │   │
│  │ - Google Ads Operations (Phase 2)                        │   │
│  │ - Other platforms (Future phases)                        │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│                             ▼                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Google API Clients                                       │   │
│  │ - OAuth 2.0 token management                             │   │
│  │ - Automatic token refresh                                │   │
│  │ - API request/response handling                          │   │
│  └─────────────────────────────────────────────────────────┘   │
│                             │                                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Configuration & Storage                                  │   │
│  │ - User profiles and roles                                │   │
│  │ - Account assignments                                    │   │
│  │ - OAuth tokens (secure storage)                          │   │
│  │ - Audit logs                                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Google Cloud APIs                               │
│  - Search Console API                                            │
│  - Google Ads API                                                │
│  - Future: Google Analytics, etc.                                │
└─────────────────────────────────────────────────────────────────┘
```

### Multi-Phase Approach

**Phase 1: Google Search Console (Current)**
- OAuth setup and account management
- Read operations (analytics, sitemaps, properties, URL inspection)
- Safe write operations (sitemap submission, property management)
- Comprehensive API exploration
- Testing with personal account

**Phase 2: Google Ads (After Phase 1 success)**
- Google Ads API integration
- Campaign and budget management
- Advanced spend safety controls
- Role-based access control refinement

**Phase 3: Multi-User Authorization Infrastructure**
- User management system
- Permission matrix implementation
- Multi-level approval workflows
- Comprehensive audit system

**Phase 4: Deployment & Scaling**
- AWS infrastructure setup
- Multi-user support
- Team rollout process

## Technology Stack

### Core Technologies

**Language & Runtime**
- TypeScript with strict type checking
- Node.js 18+ for runtime
- ESM modules for modern JavaScript

**MCP Framework**
- `@modelcontextprotocol/sdk` - Official MCP SDK
- STDIO transport for local development
- Extensible architecture for future transports

**Google APIs**
- `googleapis` npm package - Official Google API client library
- OAuth 2.0 for authentication
- Automatic token refresh handling

**Validation & Types**
- `zod` - Runtime schema validation for tool inputs
- TypeScript for compile-time type safety

**Testing**
- `jest` - Testing framework
- Mock Google API responses
- Integration tests with real API (optional)

**Configuration & Storage**
- Local JSON files for Phase 1 (developer mode)
- Will migrate to DynamoDB for AWS deployment (Phase 4)
- Environment variables for secrets

### Dependencies Overview

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "googleapis": "^118.0.0",
    "google-auth-library": "^9.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/node": "^20.0.0",
    "jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "ts-node": "^10.0.0"
  }
}
```

## Security Architecture

### Authentication Flow

1. **Initial OAuth Setup**
   - User runs setup command
   - Browser opens OAuth consent screen
   - User authorizes access to Google Search Console
   - OAuth code exchanged for tokens
   - Tokens stored securely

2. **Token Management**
   - Access token used for API requests
   - Refresh token stored securely for token refresh
   - Automatic refresh when token expires
   - Tokens never logged or transmitted insecurely

### Authorization & Access Control

**Account Isolation**
- Each user specifies which accounts they can access
- Configuration stored locally
- Every operation verifies account ownership
- Blocks access to non-whitelisted accounts

**Approval Workflow**
- Write operations require explicit user approval
- Dry-run preview shows what will change
- User confirms before execution
- Operation aborted if user declines

**Audit Logging**
- All operations logged with timestamp, user, action, result
- Logs stored locally in JSON format
- Sensitive data (tokens) never logged
- Audit trail for compliance

### Input Validation

**Tool Input Validation**
- Zod schemas validate all inputs
- Strict type checking
- Reject malformed requests
- Prevent injection attacks

**API Response Validation**
- Validate structure of API responses
- Handle rate limits and errors gracefully
- Sanitize data before presenting to LLM

## Development Workflow

### Local Development Setup

```bash
# Clone and setup
git clone [repo]
cd mcp-servers
npm install

# Create configuration
cp .env.example .env
# Edit .env with your settings

# Run GSC MCP server
npm run dev:gsc

# In another terminal, test with MCP client
npm run test:gsc
```

### MCP Client Integration

For Claude Desktop:
```json
{
  "mcpServers": {
    "gsc": {
      "command": "node",
      "args": ["dist/gsc/server.js"],
      "env": {
        "CONFIG_PATH": "./config/gsc-config.json"
      }
    }
  }
}
```

For Web-based clients:
- HTTP transport wrapper (Phase 4)
- Authentication via API key
- Request/response logging

## API Exploration & Operations

### Google Search Console API

The GSC API provides comprehensive access to:
- **Search Analytics** - Traffic data, performance metrics
- **Sitemaps** - Submission and management
- **Sites/Properties** - Account and property management
- **URL Inspection** - Individual URL indexing status

Comprehensive list of operations to be documented after initial exploration.

### Google Ads API (Phase 2)

- Campaign management
- Budget and bidding
- Keyword management
- Performance reporting
- Conversion tracking

## Deployment Roadmap

### Phase 1: Local Development
- TypeScript/Node.js locally
- STDIO transport
- File-based configuration
- Personal account testing

### Phase 4: AWS Deployment
- ECS Fargate containers
- API Gateway for HTTP access
- AWS Secrets Manager for credentials
- DynamoDB for configuration
- CloudWatch for logging
- IAM roles for security

## File Structure

```
mcp-servers/
├── claude.md                        # Project documentation (this file)
├── project-plan.md                  # Detailed project plan
├── package.json
├── tsconfig.json
├── src/
│   ├── gsc/                         # Google Search Console MCP
│   │   ├── server.ts                # MCP server entry point
│   │   ├── auth.ts                  # OAuth setup and token management
│   │   ├── config.ts                # Configuration management
│   │   ├── tools/                   # Tool implementations
│   │   │   ├── analytics.ts         # Search analytics queries
│   │   │   ├── sitemaps.ts          # Sitemap operations
│   │   │   ├── properties.ts        # Property management
│   │   │   ├── urlInspection.ts     # URL inspection
│   │   │   └── index.ts             # Export all tools
│   │   ├── validation.ts            # Input validation schemas
│   │   ├── approval.ts              # Dry-run and approval workflow
│   │   ├── audit.ts                 # Audit logging
│   │   └── types.ts                 # TypeScript types and interfaces
│   ├── shared/                      # Shared utilities
│   │   ├── logger.ts                # Logging utilities
│   │   ├── errors.ts                # Error classes
│   │   └── utils.ts                 # Common utilities
│   └── ads/                         # Google Ads (Phase 2)
├── tests/
│   ├── gsc/
│   │   ├── auth.test.ts
│   │   ├── tools.test.ts
│   │   └── integration.test.ts
│   └── shared/
├── config/
│   └── gsc-config.json             # Local configuration
├── logs/
│   └── audit.log                   # Audit log file
└── dist/                           # Compiled JavaScript (generated)
```

## Security Considerations

### Threat Model

**Threats Mitigated:**
1. **Unauthorized account access** - Account isolation and ACLs
2. **Accidental data deletion** - Approval workflow and dry-run preview
3. **Budget overspending** - Spend limits and approval
4. **Token theft** - Secure token storage, never logged
5. **Privilege escalation** - Role-based access control
6. **API credential exposure** - Environment variables, AWS Secrets Manager

### Privacy Considerations

**Data Handling:**
- Minimize data exposure to LLM
- Consider data masking for sensitive fields
- Use Claude API privacy policies
- Audit all LLM-accessed data
- Comply with GDPR/privacy regulations

## Monitoring & Logging

### What Gets Logged

**Audit Events:**
- User authentication
- Account access requests
- Tool invocations
- Approval workflow events
- Data modifications
- API errors

**Technical Logs:**
- OAuth token refresh
- API request/response times
- Rate limit status
- Configuration changes

### Log Format

```json
{
  "timestamp": "2025-10-17T10:30:00Z",
  "level": "INFO",
  "component": "gsc",
  "action": "search_analytics_query",
  "user": "user@example.com",
  "account": "sc-domain:example.com",
  "result": "success",
  "details": {}
}
```

## Success Metrics

**Phase 1 (GSC) Success Criteria:**
1. Successfully authenticate with Google Search Console
2. Query search analytics data
3. List properties and sitemaps
4. Inspect URLs
5. Submit sitemaps with approval workflow
6. Account isolation verified
7. Audit logs working correctly
8. Comprehensive API operations documented

**Overall Project Success:**
- Multiple users with different roles successfully using system
- Zero unauthorized data access
- Zero accidental destructive operations
- Audit trail shows all activity
- Deploy to production with team rollout

## Next Steps

1. Create `project-plan.md` with detailed implementation steps
2. Initialize TypeScript project
3. Implement OAuth 2.0 authentication
4. Set up configuration system
5. Explore all Google Search Console API operations
6. Begin implementing tools