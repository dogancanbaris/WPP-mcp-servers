# WPP Marketing Analytics Platform - Complete Documentation

Welcome to the WPP MCP Servers documentation. This is the comprehensive reference for the entire platform - from OAuth authentication to dashboard creation to advanced API usage.

## 🗂️ Documentation Structure

### 📘 [OAuth Authentication](./oauth/)
Everything about Google OAuth 2.0 authentication and token handling.

**Key Documents:**
- **[OMA-INTEGRATION-SPEC.md](./oauth/OMA-INTEGRATION-SPEC.md)** - OAuth integration spec for OMA platform
- **[TOKEN-SOLUTION.md](./oauth/TOKEN-SOLUTION.md)** - Token file format, auto-refresh, and handling
- **[MIGRATION-GUIDE.md](./oauth/MIGRATION-GUIDE.md)** - How to migrate tools to OAuth pattern
- **[MIGRATION-STATUS.md](./oauth/MIGRATION-STATUS.md)** - Current implementation status

**Quick Links:**
- Token format and structure
- Auto-refresh mechanism (< 5 min to expiry)
- Per-request OAuth architecture
- Service account requirements

---

### 📊 [Reporting Platform](./reporting-platform/)
Dashboard builder, visualization engine, and analytics interface.

**Key Documents:**
- **[SPEC.md](./reporting-platform/SPEC.md)** - Technical specification and architecture
- **[COMPLETE-GUIDE.md](./reporting-platform/COMPLETE-GUIDE.md)** - User guide with 5+ use cases

**Quick Links:**
- 13 chart types (scorecard, line, bar, pie, table, treemap, sankey, heatmap, gauge, scatter, funnel, radar)
- 9 backend API endpoints
- Dashboard builder walkthrough
- Sharing and export capabilities
- Use case workflows (weekly review, keyword research, budget optimization, cross-platform analysis, SEO audit, automated reporting)

---

### 🔧 [Guides & Developer Documentation](./guides/)
Technical implementation guides and architecture references.

**Key Documents:**
- **[AGENT-GUIDE.md](./guides/AGENT-GUIDE.md)** - AI agent usage guide with tool workflows
- **[GETTING-STARTED.md](./guides/GETTING-STARTED.md)** - Quick start for practitioners and developers
- **[DEVELOPER-GUIDE.md](./guides/DEVELOPER-GUIDE.md)** - Complete technical reference

**Quick Links:**
- 31 MCP tools across 7 Google APIs
- API integration patterns
- Data transformation examples
- Testing and deployment
- Troubleshooting
- Common workflows with examples

---

### 🖥️ [Chrome DevTools MCP](./chrome-devtools/)
Browser automation and debugging in WSL2 environments.

**Key Documents:**
- **[WSL2-SETUP.md](./chrome-devtools/WSL2-SETUP.md)** - Complete setup and troubleshooting

**Quick Links:**
- Chrome installation in WSL2
- DevTools protocol configuration
- Troubleshooting common errors
- Quick start script

---

## 🚀 Quick Start Paths

### I'm a Marketer - I Want to Use Dashboards
1. Start: [Reporting Platform - Complete Guide](./reporting-platform/COMPLETE-GUIDE.md)
2. Create your first dashboard (5 minutes)
3. Explore use case workflows
4. Share dashboards with team

### I'm a Developer - I Want to Build Features
1. Start: [Developer Guide](./guides/DEVELOPER-GUIDE.md)
2. Understand architecture and tool inventory
3. Review OAuth authentication setup
4. Study the 31 available tools
5. Follow deployment guides

### I'm an Architect - I Want to Understand the System
1. Start: [Reporting Platform SPEC](./reporting-platform/SPEC.md) - System design
2. Review: [Developer Guide](./guides/DEVELOPER-GUIDE.md) - Component breakdown
3. Study: [OAuth Documentation](./oauth/README.md) - Security architecture
4. Plan: Infrastructure and scaling

### I'm Setting Up - I Need to Deploy
1. OAuth: [MIGRATION-STATUS.md](./oauth/MIGRATION-STATUS.md) - Authentication setup
2. Infrastructure: [Developer Guide](./guides/DEVELOPER-GUIDE.md#deployment)
3. Dashboards: [Reporting Platform](./reporting-platform/) - UI deployment
4. Testing: Validation checklist

---

## 📊 Platform Overview

### Technology Stack
- **Backend**: Node.js + TypeScript + MCP Protocol
- **Frontend**: Next.js 15 + React 19 + Recharts
- **Database**: Supabase PostgreSQL + BigQuery
- **Authentication**: Google OAuth 2.0
- **Charts**: 13 visualization types

### Key Features
✅ **31 MCP Tools** across 7 Google APIs
✅ **OAuth 2.0** authentication (100%)
✅ **Multi-tenant** architecture with RLS
✅ **13 chart types** for data visualization
✅ **9-layer safety system** with approvals
✅ **Dashboard sharing** and export (PDF/Excel)
✅ **Real-time data** via Google APIs
✅ **Custom dashboards** drag-and-drop builder

### 31 Available Tools

**Google Search Console (11 tools)**
- Query analytics (clicks, impressions, CTR, position)
- Property management
- URL inspection & indexing
- Sitemap management
- Core Web Vitals

**Google Ads (14 tools)**
- Campaign management (create, pause, enable)
- Budget optimization
- Keyword management & forecasts
- Bid strategy configuration
- Conversion tracking
- Comprehensive reporting

**Google Analytics (5 tools)**
- Custom report builder
- Real-time tracking
- Account/property management
- Data stream configuration
- Custom dimensions & metrics

**BigQuery (2 tools)**
- SQL query execution
- Table management

**Business Profile (3 tools)**
- Location management
- Business insights
- Review management

**Other (Including SERP Search, Core Web Vitals)**
- Specialized analysis tools

---

## 🔐 Security & Architecture

### Authentication
- **OAuth 2.0 only** - No API keys or service accounts
- **Per-request tokens** - Each user's own credentials
- **Auto-refresh** - Tokens refresh automatically
- **Multi-tenant isolation** - Automatic via OAuth

### Data Protection
- **Row Level Security (RLS)** - Supabase enforced
- **Encrypted tokens** - In database
- **Audit logging** - All operations tracked
- **Approval workflows** - Safety checks on writes

### Safety (9-Layer System)
1. Account authorization
2. Approval workflow for writes
3. Snapshot manager for rollback
4. Financial impact calculator
5. Vagueness detector
6. Pattern matcher validation
7. Notification system
8. Change history/audit log
9. Budget caps and limits

---

## 📈 Use Cases

### For Practitioners
- **Weekly performance reviews** - Campaign metrics and trends
- **Keyword research** - Search Console + Keyword Planner
- **Budget optimization** - Identify underperformers
- **Cross-platform analysis** - Paid vs organic comparison
- **Technical SEO audits** - Indexing and Core Web Vitals
- **Automated reporting** - Client report generation

### For Agencies
- Multi-client dashboard management
- Client report automation
- Team collaboration via sharing
- Export and PDF delivery
- Custom branding support

### For Leadership
- Executive dashboards
- ROI reporting
- Budget accountability
- Trend analysis
- Performance benchmarking

---

## 🎯 Core Concepts

### MCP (Model Context Protocol)
- Standard protocol for AI-LLM tool integration
- 31 tools available to Claude and other LLMs
- Natural language queries supported
- Example: "Show me top 10 keywords from last week"

### Cube.js Semantic Layer
- Data aggregation and pre-computation
- Intelligent metric definitions
- Automatic formatting (percentages, currency)
- Query optimization and caching

### BigQuery Data Warehouse
- Central hub for all marketing data
- Handles billions of rows
- Cost-effective ($0.02/GB/month)
- Powers both dashboards and analysis

---

## 📚 Document Map

```
docs/
├── README.md                          ← You are here
├── oauth/
│   ├── README.md
│   ├── TOKEN-SOLUTION.md
│   ├── MIGRATION-GUIDE.md
│   └── MIGRATION-STATUS.md
├── reporting-platform/
│   ├── README.md
│   ├── SPEC.md
│   └── COMPLETE-GUIDE.md
├── guides/
│   ├── README.md
│   └── DEVELOPER-GUIDE.md
└── chrome-devtools/
    ├── README.md
    └── WSL2-SETUP.md
```

---

## ✅ Getting Started Checklist

### Before You Start
- [ ] Have a Google Cloud Project (billing enabled)
- [ ] Have Google Ads, Search Console, and/or Analytics accounts
- [ ] Node.js 18+ installed
- [ ] Familiar with command line

### Phase 1: Understanding
- [ ] Read this README end-to-end
- [ ] Choose your quick start path above
- [ ] Review relevant documentation section

### Phase 2: Setup
- [ ] Set up OAuth authentication (see oauth/)
- [ ] Configure environment variables
- [ ] Start the MCP server

### Phase 3: Testing
- [ ] Test one tool manually
- [ ] Create your first dashboard
- [ ] Share with a colleague

### Phase 4: Production
- [ ] Deploy to cloud infrastructure
- [ ] Enable multi-tenant isolation
- [ ] Set up monitoring and alerts

---

## 🔗 Quick Navigation

| I want to... | Start here |
|---|---|
| Build a dashboard | [Reporting Platform Guide](./reporting-platform/COMPLETE-GUIDE.md) |
| Understand authentication | [OAuth README](./oauth/README.md) |
| Set up the MCP server | [Developer Guide](./guides/DEVELOPER-GUIDE.md) |
| Debug Chrome automation | [Chrome DevTools Setup](./chrome-devtools/WSL2-SETUP.md) |
| Migrate tools to OAuth | [OAuth Migration Guide](./oauth/MIGRATION-GUIDE.md) |
| Deploy to production | [Developer Guide - Deployment](./guides/DEVELOPER-GUIDE.md) |

---

## 🆘 Support & Help

### For Questions About...
- **OAuth & Authentication**: See [oauth/](./oauth/)
- **Dashboard Building**: See [reporting-platform/COMPLETE-GUIDE.md](./reporting-platform/COMPLETE-GUIDE.md)
- **Tool Integration**: See [guides/DEVELOPER-GUIDE.md](./guides/DEVELOPER-GUIDE.md)
- **WSL2 Setup**: See [chrome-devtools/](./chrome-devtools/)

### Common Issues
- **OAuth token expired**: See [oauth/TOKEN-SOLUTION.md](./oauth/TOKEN-SOLUTION.md#auto-refresh)
- **Chrome "Target closed" error**: See [chrome-devtools/WSL2-SETUP.md](./chrome-devtools/WSL2-SETUP.md#troubleshooting)
- **Dashboard not saving**: See [reporting-platform/COMPLETE-GUIDE.md#troubleshooting](./reporting-platform/COMPLETE-GUIDE.md#troubleshooting)
- **Tool migration**: See [oauth/MIGRATION-GUIDE.md](./oauth/MIGRATION-GUIDE.md)

---

## 📋 Documentation Statistics

- **Total Pages**: 2,000+ lines
- **Sections**: 5 major topics
- **Tools Documented**: 31 MCP tools
- **Use Cases**: 6+ detailed workflows
- **Code Examples**: 50+ snippets
- **Troubleshooting Items**: 15+ common issues

---

## 🎯 Next Steps

1. **Choose your path** above based on your role
2. **Read the relevant documentation**
3. **Follow the quick start guide**
4. **Try building something**
5. **Refer back** as needed

---

**Platform Version**: 1.0 Production Ready
**Last Updated**: October 25, 2025
**Status**: ✅ Complete Documentation | 📊 31 Tools | 🎨 13 Charts
