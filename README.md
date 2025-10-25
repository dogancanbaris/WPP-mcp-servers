# WPP Marketing Analytics Platform - MCP Servers

Enterprise-grade Model Context Protocol server connecting AI agents to **7 Google Marketing APIs** with OAuth 2.0 authentication, automated dashboards, and multi-tenant support.

## 🎯 What This Is

A production-ready MCP server providing **31 tools** across:
- **Google Search Console** (11 tools) - Organic search analytics
- **Google Ads** (14 tools) - Campaign management and reporting
- **Google Analytics 4** (5 tools) - User behavior tracking
- **BigQuery** (2 tools) - Data warehouse queries
- **Business Profile** (3 tools) - Local SEO management
- **Core Web Vitals & SERP** - Performance and rank tracking

## 🚀 Quick Start

### For Practitioners (Using MCP)
```bash
# Verify MCP server is available
/mcp

# Try your first query
"Show me my Google Search Console properties"

# Use Claude agent skills for workflows
"Create SEO dashboard for my client"
```

**→ See [Getting Started](./docs/guides/GETTING-STARTED.md)**

### For Developers (Building Features)
```bash
# Clone and setup
git clone <repo>
cd WPP-MCP-Servers
npm install

# Configure OAuth
cp .env.example .env
npm run setup:auth

# Build and run
npm run build
npm run start:gsc
```

**→ See [Developer Guide](./docs/guides/DEVELOPER-GUIDE.md)**

## 📚 Complete Documentation

All documentation is organized in `/docs`:

| Section | Purpose | Key Docs |
|---------|---------|----------|
| **OAuth** | Authentication & token handling | [README](./docs/oauth/README.md), [OMA Integration](./docs/oauth/OMA-INTEGRATION-SPEC.md) |
| **Reporting** | Dashboard builder & visualizations | [README](./docs/reporting-platform/README.md), [Complete Guide](./docs/reporting-platform/COMPLETE-GUIDE.md) |
| **Guides** | Architecture, tools, workflows | [README](./docs/guides/README.md), [Developer Guide](./docs/guides/DEVELOPER-GUIDE.md) |
| **Chrome DevTools** | Browser automation in WSL2 | [README](./docs/chrome-devtools/README.md), [Setup Guide](./docs/chrome-devtools/WSL2-SETUP.md) |

**→ [Full Documentation Index](./docs/README.md)**

## 🔑 Key Features

✅ **OAuth 2.0 Only** - No API keys or service accounts
✅ **Multi-Tenant Ready** - Automatic client isolation via user credentials
✅ **31 Production Tools** - Ready to use across 7 Google APIs
✅ **9-Layer Safety System** - Approval workflows, snapshots, audit logging
✅ **Dashboard Builder** - Create professional reports in 5 tool calls
✅ **Real-Time Data** - Live analytics from Google platforms
✅ **BigQuery Integration** - Powerful data blending and analysis

## 💻 Tech Stack

**Backend:**
- Node.js 18+ with TypeScript
- MCP Protocol (Model Context Protocol)
- OAuth 2.0 for Google APIs
- BigQuery for data warehouse

**Frontend (Dashboard):**
- Next.js 15 + React 19
- Recharts visualization library
- Supabase for authentication & RLS
- Zustand for state management

**Infrastructure:**
- Google Cloud Platform
- BigQuery for analytics
- Optional: Metabase for BI

## 🏗️ Architecture

```
User/Agent → OAuth Login → MCP Server (31 Tools)
                            ↓
                    Google APIs (7 platforms)
                            ↓
                         BigQuery
                            ↓
                    Dashboard Platform
```

## 🔐 Security & Multi-Tenancy

- **User OAuth Tokens**: Each user uses their own Google credentials
- **Automatic Isolation**: Google IAM enforces data access control
- **Zero Provisioning**: No manual per-user setup needed
- **Audit Trail**: Every operation logged with user context
- **Token Rotation**: Automatic hourly refresh

**Supports 1,000+ practitioners with no per-user infrastructure!**

## 📊 Example Workflows

### 1. SEO Performance Review
```javascript
// Agent workflow
1. Pull GSC data via query_search_analytics
2. Analyze trends with analyze_gsc_data_for_insights
3. Create dashboard with create_dashboard_from_table
4. User views interactive dashboard
```

### 2. Campaign Optimization
```javascript
// Agent workflow
1. Get Google Ads performance (get_campaign_performance)
2. Pull Search Console data (query_search_analytics)
3. Join data in BigQuery (run_bigquery_query)
4. Create comparison dashboard
```

### 3. Keyword Research
```javascript
// Agent workflow
1. Generate keyword ideas (generate_keyword_ideas)
2. Get forecasts (get_keyword_forecasts)
3. Add to campaign with approval (add_keywords)
4. Track performance over time
```

## 📈 Current Status

- ✅ **31 Tools**: All production-ready
- ✅ **OAuth**: 100% implemented (no service accounts)
- ✅ **Dashboard Platform**: Full-featured with 13 chart types
- ✅ **Safety System**: 9-layer protection complete
- ✅ **Documentation**: Comprehensive and organized
- ✅ **Compilation**: 0 errors, 0 warnings

## 🎯 For Different Users

**I'm a Marketer** → [Reporting Platform Guide](./docs/reporting-platform/COMPLETE-GUIDE.md)
**I'm a Developer** → [Developer Guide](./docs/guides/DEVELOPER-GUIDE.md)
**I'm DevOps** → [Developer Guide - Deployment](./docs/guides/DEVELOPER-GUIDE.md#deployment)
**I need to integrate OMA** → [OAuth Integration Spec](./docs/oauth/OMA-INTEGRATION-SPEC.md)
**I need to set up Chrome automation** → [Chrome DevTools Guide](./docs/chrome-devtools/README.md)

## 📋 Project Structure

```
project/
├── README.md                          ← You are here
├── claude.md                          ← Central entry point
├── docs/                              ← All documentation
│   ├── README.md                      ← Documentation index
│   ├── oauth/                         ← OAuth guides
│   ├── reporting-platform/            ← Dashboard docs
│   ├── guides/                        ← Developer guides
│   └── chrome-devtools/               ← Browser automation
├── src/                               ← TypeScript source
│   ├── ads/                           ← Google Ads tools
│   ├── gsc/                           ← Search Console tools
│   ├── analytics/                     ← Analytics tools
│   ├── bigquery/                      ← BigQuery tools
│   ├── business-profile/              ← Business Profile tools
│   └── http-server/                   ← HTTP server
├── dist/                              ← Compiled JavaScript
├── scripts/                           ← One-off maintenance scripts
├── config/                            ← Configuration files
├── tests/                             ← Test files
├── package.json
└── tsconfig.json
```

## 🚀 Getting Started

1. **Read**: [Quick Start Guide](./docs/guides/GETTING-STARTED.md)
2. **Install**: Node.js 18+, npm
3. **Configure**: OAuth credentials in `.env`
4. **Build**: `npm run build`
5. **Run**: `npm run start:gsc`
6. **Test**: Use in Claude Code CLI or HTTP API

## 🔗 Important Links

- **Complete Docs**: [docs/README.md](./docs/README.md)
- **Agent Guide**: [claude.md](./claude.md)
- **OAuth Setup**: [docs/oauth/](./docs/oauth/README.md)
- **Dashboard Platform**: [docs/reporting-platform/](./docs/reporting-platform/README.md)
- **Tech Reference**: [docs/guides/DEVELOPER-GUIDE.md](./docs/guides/DEVELOPER-GUIDE.md)

## ❓ FAQ

**Q: Do I need service accounts?**
A: No! OAuth 2.0 handles everything. Users authenticate with their Google account.

**Q: How is data isolated between users?**
A: Automatically via Google IAM. User A's OAuth token can only access User A's data.

**Q: What's the cost?**
A: ~$11-38/month for infrastructure. BigQuery first 1TB/month is free.

**Q: Can I integrate with OMA?**
A: Yes! See [OMA Integration Spec](./docs/oauth/OMA-INTEGRATION-SPEC.md)

**Q: How many users can it support?**
A: Unlimited. OAuth per-request architecture scales infinitely.

## 📞 Support

- **Documentation**: See [docs/README.md](./docs/README.md)
- **Issues**: Check troubleshooting in relevant guide
- **Code Questions**: Review code comments and type definitions

## 📄 License

[LICENSE](./LICENSE)

---

**Status**: ✅ Production Ready
**Version**: 1.0
**Tools**: 31 across 7 APIs
**Auth**: OAuth 2.0 (100%)
**Last Updated**: October 25, 2025
