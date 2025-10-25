# OAuth 2.0 Authentication Documentation

Complete documentation for the WPP MCP Servers OAuth 2.0 implementation.

## 📚 Contents

### [TOKEN-SOLUTION.md](./TOKEN-SOLUTION.md)
Detailed implementation guide for OAuth token handling:
- Token file format and structure
- Auto-refresh mechanism for expired tokens
- Token extraction and validation
- File loading system

### [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md)
Step-by-step guide for migrating tools to OAuth:
- Pattern changes from service accounts to per-request OAuth
- Required code updates for each tool
- Implementation examples
- Testing procedures

### [MIGRATION-STATUS.md](./MIGRATION-STATUS.md)
Current status and progress of OAuth implementation:
- Completed infrastructure components
- Remaining work (tool migration status)
- Service account requirements and cleanup
- Testing workflow and validation steps

## 🎯 Quick Start

1. **Understanding OAuth**: Read [MIGRATION-STATUS.md](./MIGRATION-STATUS.md) for architectural overview
2. **Implementation Details**: Review [TOKEN-SOLUTION.md](./TOKEN-SOLUTION.md) for token handling
3. **Tool Migration**: Follow [MIGRATION-GUIDE.md](./MIGRATION-GUIDE.md) for updating tools

## 🔐 Key Concepts

- **OAuth 2.0**: 100% of authentication via Google OAuth 2.0
- **Per-Request Pattern**: Each API call uses the requesting user's OAuth token
- **Auto-Refresh**: Tokens automatically refresh when < 5 minutes to expiry
- **Multi-Tenant**: Automatic client/workspace isolation via OAuth credentials

## 🧪 Testing

Test OAuth workflow after tool migration:
1. Get OAuth token via `setup:auth` command
2. Start HTTP server
3. Call tools with `Authorization: Bearer <token>` header
4. Verify data returns based on user's Google account permissions

## 📋 Files Reference

- **src/shared/oauth-client-factory.ts** (271 lines) - Core OAuth client factory
- **src/http-server/server.ts** - HTTP server with token extraction
- **config/gsc-tokens.json** - Temporary token file (until OMA integration)

## 🔗 Related Documentation

- [MCP Server Architecture](../guides/DEVELOPER-GUIDE.md)
- [Safety System](../guides/DEVELOPER-GUIDE.md#safety-layers)
- [Integration Guide](../guides/DEVELOPER-GUIDE.md#integration-guide)
