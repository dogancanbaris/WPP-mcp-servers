# WPP Media MCP Servers - Project Plan

## Executive Summary

This project builds secure MCP servers that allow LLMs to interact with Google platforms (Search Console, Google Ads, etc.) on behalf of WPP Media clients. The project prioritizes safety, privacy, and control through strict authorization, account isolation, and comprehensive approval workflows.

**Timeline:** Phase 1 (GSC) estimated 3-4 weeks, then evaluation before Phase 2.

---

## Phase 1: Google Search Console MCP Server

### Phase 1 Goals

1. ✅ Build fully functional MCP server for Google Search Console
2. ✅ Implement secure OAuth 2.0 authentication
3. ✅ Account isolation and access control
4. ✅ Comprehensive GSC API exploration (find ALL operations)
5. ✅ Implement dry-run and approval workflows
6. ✅ Thorough testing with personal account
7. ✅ Production-ready local deployment

### Phase 1 Implementation Steps

#### Step 1: Project Setup (Day 1)

**1.1 Initialize Project Structure**
```bash
mkdir mcp-servers
cd mcp-servers
npm init -y
```

**1.2 Install Core Dependencies**
```bash
npm install typescript @modelcontextprotocol/sdk googleapis google-auth-library zod
npm install --save-dev @types/node @types/jest jest ts-node typescript
```

**1.3 Create TypeScript Configuration**
- `tsconfig.json` with strict mode enabled
- Module resolution: ESM
- Strict null checks and type safety

**1.4 Create Project Directory Structure**
```
src/
  ├── gsc/
  │   ├── server.ts
  │   ├── auth.ts
  │   ├── config.ts
  │   ├── tools/
  │   ├── validation.ts
  │   ├── approval.ts
  │   ├── audit.ts
  │   └── types.ts
  ├── shared/
  │   ├── logger.ts
  │   ├── errors.ts
  │   └── utils.ts
tests/
config/
logs/
```

**1.5 Create Build Scripts**
- `npm run build` - Compile TypeScript
- `npm run dev:gsc` - Run GSC server in development
- `npm run test` - Run tests
- `npm run lint` - TypeScript checking

**Deliverable:** Fully initialized project with build system working

---

#### Step 2: Authentication System (Days 2-3)

**2.1 OAuth 2.0 Setup**

Create `src/gsc/auth.ts`:
- OAuth client initialization with Google APIs
- OAuth redirect server (local HTTP server on port 3000)
- Authorization flow:
  - Generate OAuth URL
  - Launch browser
  - Capture authorization code
  - Exchange code for tokens
  - Store tokens securely

**2.2 Token Management**

Implement token refresh logic:
- Automatically refresh access token when expired
- Store refresh token securely in local file
- Handle token revocation

**2.3 Credential Storage**

Local storage in `config/gsc-tokens.json`:
```json
{
  "accessToken": "...",
  "refreshToken": "...",
  "expiryDate": "2025-10-20T15:30:00Z",
  "tokenType": "Bearer"
}
```

**2.4 Testing**

- Test OAuth flow with real Google account
- Verify token refresh works
- Test error handling (user denies access, expired tokens, etc.)

**Deliverable:** Full OAuth authentication working, tokens can be refreshed

---

#### Step 3: Configuration & Account Management (Days 4-5)

**3.1 Configuration System**

Create `src/gsc/config.ts`:
- Load configuration from `config/gsc-config.json`
- Configuration includes:
  - Selected GSC properties (site URLs)
  - User role (for future multi-user support)
  - Audit logging settings
  - Approval settings

Example config:
```json
{
  "selectedProperties": [
    "sc-domain:mysite.com",
    "sc-domain:another-site.com"
  ],
  "role": "admin",
  "auditLogging": true,
  "requireApproval": {
    "writeOperations": true,
    "deleteOperations": true
  }
}
```

**3.2 Account Isolation**

Create validation function:
- Every operation checks if requested account is in `selectedProperties`
- Reject operations on non-whitelisted accounts
- Log unauthorized access attempts

**3.3 Type Definitions**

Create `src/gsc/types.ts`:
```typescript
interface GSCConfig {
  selectedProperties: string[];
  role: 'admin' | 'editor' | 'viewer';
  auditLogging: boolean;
  requireApproval: {
    writeOperations: boolean;
    deleteOperations: boolean;
  };
}

interface OperationContext {
  user: string;
  property: string;
  timestamp: Date;
  operationType: 'read' | 'write' | 'delete';
}

interface AuditLog {
  timestamp: Date;
  user: string;
  action: string;
  property: string;
  result: 'success' | 'failure';
  details: Record<string, any>;
}
```

**3.4 Testing**

- Load configuration correctly
- Block access to non-whitelisted accounts
- Verify account isolation works

**Deliverable:** Configuration system working, account isolation enforced

---

#### Step 4: Logging & Audit System (Day 5)

**4.1 Audit Logger**

Create `src/gsc/audit.ts`:
- Log all operations with timestamp, user, action, result
- Separate files for different dates
- Never log sensitive data (tokens, API keys)

**4.2 Logger Utility**

Create `src/shared/logger.ts`:
- Log to stderr (not stdout, which would corrupt MCP JSON-RPC)
- Include severity levels: DEBUG, INFO, WARN, ERROR
- Timestamped, formatted output

**4.3 Error Handling**

Create `src/shared/errors.ts`:
- Custom error classes for different scenarios
- Proper error messages for users
- Stack traces for debugging

**Deliverable:** Comprehensive logging and audit system

---

#### Step 5: Google Search Console API Client (Days 6-7)

**5.1 Initialize Google APIs Client**

Create functions in `src/gsc/auth.ts`:
- `initializeGoogleClient()` - Create authenticated Google API client
- `getSearchConsoleClient()` - Get webmasters API client
- Handle authentication automatically

**5.2 API Operation Helpers**

Create utility functions to wrap Google API calls:
- Error handling and retry logic
- Response validation
- Type safety

**5.3 Comprehensive API Exploration**

Systematically explore ALL Google Search Console API operations:

**Search Analytics Operations:**
- Query with various filters (date range, dimensions, metrics)
- Test different dimensions: country, device, page, query, appearance, searchType
- Understand pagination and result limits
- Test all available metrics

**Sites/Properties Operations:**
- List all sites
- Get site details
- Add new site (if supported)
- Remove site (if supported)
- Verify ownership

**Sitemaps Operations:**
- List sitemaps
- Get sitemap details
- Submit sitemap
- Delete sitemap
- Get sitemap status/issues

**URL Inspection Operations:**
- Inspect specific URLs
- Get indexing status
- Get canonical URL
- Get AMP information (if available)
- Get mobile usability issues

**Crawl Issues Operations (if available):**
- List crawl issues
- Get crawl issue details
- Mark issues as fixed

**Rich Results Operations (if available):**
- Get rich results status
- Validate rich results

**Coverage Operations (if available):**
- Get coverage information

**Document all findings:**
- Create comprehensive list of ALL available API endpoints
- Note which are read-only vs. write operations
- Document parameters for each operation
- Test with real data

**Deliverable:** Full Google API client working, comprehensive API operations documented

---

#### Step 6: Approval & Dry-Run System (Days 8-9)

**6.1 Dry-Run Engine**

Create `src/gsc/approval.ts`:

```typescript
interface DryRunResult {
  wouldSucceed: boolean;
  expectedResult: any;
  changes: string[];
  warnings: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

async function performDryRun(
  operation: Operation,
  context: OperationContext
): Promise<DryRunResult>
```

For each write operation, implement dry-run logic:
- Show what would change
- Show confirmation message
- Return prediction of outcome

Examples:
- Sitemap submission dry-run: Show which URLs would be submitted, current status
- Property addition: Show if property is already verified, what would happen
- Sitemap deletion: Show current URL count, what would be removed

**6.2 Approval Workflow**

Implement interactive approval:
1. User requests write operation
2. System performs dry-run
3. Shows preview and asks for confirmation
4. User responds (approve/deny/modify)
5. If approved, execute operation
6. Log the operation and approval

**6.3 Testing**

- Test dry-run accuracy
- Test approval acceptance and rejection
- Verify audit logs record approval decisions

**Deliverable:** Dry-run preview and approval workflow working for all write operations

---

#### Step 7: MCP Tool Implementation - Read Operations (Days 10-12)

**7.1 Search Analytics Tool**

Create `src/gsc/tools/analytics.ts`:

```typescript
const searchAnalyticsTool = {
  name: "query_search_analytics",
  description: "Query search analytics data from Google Search Console",
  inputSchema: {
    type: "object",
    properties: {
      property: { type: "string", description: "Site URL (e.g., sc-domain:example.com)" },
      startDate: { type: "string", description: "Start date (YYYY-MM-DD)" },
      endDate: { type: "string", description: "End date (YYYY-MM-DD)" },
      dimensions: { type: "array", items: { type: "string" }, description: "Dimensions to group by (query, page, country, device, etc.)" },
      searchType: { type: "string", enum: ["web", "image", "video", "news"], default: "web" },
      rowLimit: { type: "number", description: "Max rows to return" }
    }
  }
};
```

Implementation:
- Validate inputs
- Call Google Search Analytics API
- Format results nicely
- Handle large result sets with pagination

**7.2 Properties/Sites Tool**

```typescript
const propertiesTool = {
  name: "list_search_console_properties",
  description: "List all verified properties in Search Console",
  inputSchema: { type: "object", properties: {} }
};
```

Implementation:
- List all user's properties
- Show property type (Domain, URL prefix, App)
- Show verification status

**7.3 Sitemaps Tool**

```typescript
const sitemapsTool = {
  name: "list_sitemaps",
  description: "List submitted sitemaps for a property",
  inputSchema: {
    type: "object",
    properties: {
      property: { type: "string" }
    }
  }
};
```

Implementation:
- List all sitemaps for property
- Show URL, last submitted time, status
- Count of indexed/submitted URLs

**7.4 URL Inspection Tool**

```typescript
const urlInspectionTool = {
  name: "inspect_url",
  description: "Get indexing status and information for a specific URL",
  inputSchema: {
    type: "object",
    properties: {
      property: { type: "string" },
      url: { type: "string" }
    }
  }
};
```

Implementation:
- Inspect URL
- Show indexing status
- Show coverage status
- Show any issues
- Show last crawled date

**7.5 Additional Read Tools**

Based on API exploration, implement any other useful read-only operations:
- Get crawl issues (if available)
- Get rich results status
- Get coverage statistics
- Get mobile usability issues
- Any other available read operations

**Deliverable:** All read-only tools working correctly, comprehensive data access

---

#### Step 8: MCP Tool Implementation - Write Operations (Days 13-14)

**8.1 Submit Sitemap Tool**

```typescript
const submitSitemapTool = {
  name: "submit_sitemap",
  description: "Submit a sitemap to Google Search Console",
  inputSchema: {
    type: "object",
    properties: {
      property: { type: "string" },
      sitemapUrl: { type: "string", description: "Full URL to sitemap" }
    }
  }
};
```

Implementation:
- Validate sitemap URL format
- Perform dry-run (show current sitemaps, URL count)
- Request approval
- Submit if approved
- Return confirmation with indexed/submitted status

**8.2 Add Property Tool** (if API supports)

```typescript
const addPropertyTool = {
  name: "add_property",
  description: "Add a property to Search Console",
  inputSchema: {
    type: "object",
    properties: {
      siteUrl: { type: "string" },
      propertyType: { type: "string", enum: ["SITE", "PREFIX"] }
    }
  }
};
```

**8.3 Delete Sitemap Tool** (if API supports)

```typescript
const deleteSitemapTool = {
  name: "delete_sitemap",
  description: "Delete a submitted sitemap",
  inputSchema: {
    type: "object",
    properties: {
      property: { type: "string" },
      sitemapUrl: { type: "string" }
    }
  }
};
```

Implementation for delete:
- Show what would be deleted
- Require extra confirmation for destructive operation
- Confirm deletion with high visibility

**8.4 Input Validation**

Create `src/gsc/validation.ts`:
```typescript
const searchAnalyticsSchema = z.object({
  property: z.string().regex(/^sc-(domain|https?):.+/),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dimensions: z.array(z.enum(["query", "page", "country", "device", "searchType", "appearance"]))
});
```

- Validate all tool inputs with Zod
- Provide helpful error messages
- Prevent malformed requests

**Deliverable:** All write tools working with approval workflow

---

#### Step 9: MCP Server Implementation (Days 15-16)

**9.1 Create Server Entry Point**

Create `src/gsc/server.ts`:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/stdio";
import * as tools from "./tools/index";

const server = new McpServer({
  name: "gsc",
  version: "1.0.0"
});

// Register all tools
for (const [name, tool] of Object.entries(tools)) {
  server.tool(name, tool.description, tool.inputSchema, tool.handler);
}

// Start server
server.listen();
```

**9.2 Tool Registration**

Create `src/gsc/tools/index.ts`:
- Export all tools (analytics, properties, sitemaps, inspection, submit, delete, etc.)
- Ensure consistent interface for all tools

**9.3 Server Configuration**

- Load config on startup
- Verify auth tokens
- Initialize Google API clients
- Verify account access

**9.4 Error Handling**

- Wrap all tool handlers with error catching
- Return user-friendly error messages
- Log errors to audit log

**Deliverable:** Fully functional MCP server with all tools

---

#### Step 10: Testing & Validation (Days 17-19)

**10.1 Unit Tests**

Create `tests/gsc/`:
- Auth tests (token refresh, error handling)
- Config tests (load, validate, account isolation)
- Validation tests (Zod schemas)
- Tool tests (mock API responses)

**10.2 Integration Tests**

- Test with real Google Search Console API
- Set up test account with sample data
- Test full workflows:
  - Query analytics
  - List properties
  - Submit sitemap (then delete)
  - Inspect URL

**10.3 Security Tests**

- Verify account isolation (try to access non-whitelisted account)
- Verify token not logged
- Verify sensitive data not exposed
- Verify approval workflow enforced

**10.4 Testing with Personal Account**

- Create config with your personal GSC account
- Run through all operations manually
- Test with Claude desktop client
- Verify dry-run accuracy
- Test approval workflow

**10.5 Performance Testing**

- Large date ranges
- Many dimensions
- Pagination
- Response times

**Deliverable:** Fully tested GSC MCP server ready for use

---

#### Step 11: Documentation & Finalization (Days 20-21)

**11.1 API Operations Reference**

Create `GSC-API-REFERENCE.md`:
- Complete list of ALL available Google Search Console API operations
- Parameters for each operation
- Response format
- Example usage
- Any limitations or notes

**11.2 Usage Documentation**

Create `GSC-USAGE.md`:
- How to set up authentication
- How to configure properties
- How to use each tool
- Examples with actual usage
- Troubleshooting guide

**11.3 Setup Instructions**

Create `SETUP.md`:
- Prerequisites (Node.js version, etc.)
- Installation steps
- OAuth setup
- Configuration
- Running the server
- Testing

**11.4 Code Comments**

- Add JSDoc comments to all functions
- Explain complex logic
- Note any gotchas or edge cases

**Deliverable:** Complete documentation and polished codebase

---

### Phase 1 Success Metrics

- ✅ MCP server successfully connects to Google Search Console API
- ✅ All read operations working and returning correct data
- ✅ All available write operations identified and implemented
- ✅ Dry-run system accurately predicts changes
- ✅ Approval workflow prevents unintended changes
- ✅ Account isolation verified working
- ✅ Audit logs recording all operations
- ✅ Comprehensive API operations documented
- ✅ No bugs in local testing
- ✅ Ready for production use

---

## Phase 2: Google Ads MCP Server

### Phase 2 Goals (Post-Phase 1 Evaluation)

After completing Phase 1 and evaluating results:

1. Build MCP server for Google Ads API
2. Implement comprehensive API operation support
3. Add advanced safety controls for spending
4. Implement role-based access control refinement
5. Test with personal Google Ads account

### Phase 2 Implementation Steps

#### Similar structure to Phase 1:
- OAuth setup for Google Ads
- Account selection and isolation
- Comprehensive API exploration (ALL Google Ads operations)
- Read tools (reporting, campaign info, budget info)
- Write tools (create campaigns, manage budgets, add keywords)
- Spend safety controls
- Approval workflows
- Testing and documentation

---

## Phase 3: Multi-User Authorization Infrastructure

### Phase 3 Goals

Extend from single-user local system to multi-user team system:

1. User management system
2. Role-based access control (RBAC)
3. Permission matrix for fine-grained control
4. Multi-level approval workflows
5. Comprehensive audit system
6. User provisioning/deprovisioning

### Key Components

- User database (local JSON, later DynamoDB)
- Permission matrix configuration
- Approval workflow configuration
- Audit trail queries and reporting
- User management CLI/API

---

## Phase 4: AWS Deployment & Scaling

### Phase 4 Goals

Deploy to production AWS infrastructure for team use:

1. Containerize MCP servers (Docker)
2. Deploy to AWS ECS Fargate
3. API Gateway for HTTP access
4. AWS Secrets Manager for credentials
5. DynamoDB for persistent storage
6. CloudWatch for logging and monitoring
7. Gradual team rollout

### Architecture

```
Claude (Desktop & Web)
    ↓
API Gateway (Authentication)
    ↓
ECS Fargate Tasks (MCP Servers)
    ↓
AWS Secrets Manager (Credentials)
AWS DynamoDB (Users, Config, Logs)
CloudWatch (Monitoring)
```

---

## Timeline Summary

| Phase | Duration | Key Deliverable |
|-------|----------|-----------------|
| Phase 1 | 3-4 weeks | Fully functional GSC MCP server, tested locally |
| Evaluation | 1-2 weeks | Review results, decide on Phase 2 |
| Phase 2 | 2-3 weeks | Google Ads MCP server (if approved) |
| Phase 3 | 2-3 weeks | Multi-user auth system |
| Phase 4 | 2-3 weeks | AWS deployment and team rollout |
| **Total** | **~11-16 weeks** | **Production system for entire team** |

---

## Risk Mitigation

### Technical Risks

| Risk | Mitigation |
|------|-----------|
| API changes/deprecation | Regular API monitoring, version pinning |
| Token expiration | Automatic refresh, robust error handling |
| Rate limiting | Monitor usage, implement caching |
| Data loss | Regular backups, audit log retention |

### Security Risks

| Risk | Mitigation |
|------|-----------|
| Token theft | Secure storage, never logged, env vars |
| Unauthorized access | Account isolation, RBAC, audit logs |
| Accidental changes | Dry-run, approval workflow, undo capability |
| Privilege escalation | Role-based access, permission matrix |

### Organizational Risks

| Risk | Mitigation |
|------|-----------|
| User resistance | Clear documentation, training, gradual rollout |
| Integration issues | Thorough testing before deployment |
| Support burden | Comprehensive docs, error messages, monitoring |

---

## Sign-Off & Approval

This plan has been reviewed and approved for Phase 1 implementation starting immediately.

**Objectives:**
1. Complete Google Search Console MCP server
2. Explore ALL available API operations
3. Thoroughly test locally with personal account
4. Document findings and create comprehensive API reference
5. Prepare for Phase 2 decision

Let's build something great! 🚀