# Guides and Developer Documentation

Complete guides and reference documentation for developers and practitioners.

## 📚 Contents

### [DEVELOPER-GUIDE.md](./DEVELOPER-GUIDE.md)
Comprehensive technical implementation guide:
- MCP server architecture overview
- All 31 tools organized by platform:
  - 11 Google Search Console tools
  - 14 Google Ads tools
  - 5 Google Analytics tools
  - 2 BigQuery tools
  - 3 Business Profile tools
  - Plus additional tools
- Complete API integration patterns
- Data transformation examples
- Testing and deployment strategy
- Troubleshooting for common issues

## 🎯 Quick References

### For Implementation Teams
- Tool categories and availability by platform
- API endpoint patterns and authentication
- Data type conversions and transformations
- Integration testing procedures
- Deployment checklist

### For Architects
- System design and component breakdown
- Data flow diagrams and sequence charts
- Security and safety architecture
- Scalability considerations
- Infrastructure requirements

### For Practitioners
- How to use each tool via Claude Desktop
- Real-world workflow examples
- Data interpretation and analysis
- Report generation workflows
- Best practices for optimization

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│         User Interface Layer             │
│  Claude Desktop or Next.js Frontend      │
└──────────────┬──────────────────────────┘
               │ MCP Protocol / HTTPS
┌──────────────▼──────────────────────────┐
│       MCP Server Layer (Node.js)         │
│  31 Tools across 7 Google APIs           │
└──────────────┬──────────────────────────┘
               │ OAuth 2.0
┌──────────────▼──────────────────────────┐
│         Google Cloud Services            │
│  Ads, Search Console, Analytics, BigQuery│
└─────────────────────────────────────────┘
```

## 📋 Tool Inventory

### By Platform

**Google Search Console (11 tools)**
- Query analytics with 5 dimensions
- Property management (add/list/delete)
- URL inspection and indexing
- Sitemap submission and status
- Core Web Vitals integration

**Google Ads (14 tools)**
- Campaign management (CRUD operations)
- Budget allocation and optimization
- Keyword management with quality scores
- Bid strategy configuration
- Conversion tracking
- Reporting and analysis

**Google Analytics (5 tools)**
- Custom report builder
- Real-time user tracking
- Account and property management
- Data stream configuration
- Custom dimensions and metrics

**BigQuery (2 tools)**
- SQL query execution
- Table and dataset management
- Data export operations

**Business Profile (3 tools)**
- Location listing and insights
- Business information updates
- Review and rating management

## 🔐 Security & Safety

### Authentication
- 100% OAuth 2.0 via Google
- Per-request token passing
- Automatic token refresh
- No service accounts needed

### Data Protection
- Row Level Security (RLS) in Supabase
- Encrypted token storage
- Multi-tenant isolation
- Audit logging of all operations

### Operational Safety
- 9-layer safety system with approvals
- Financial impact calculation
- Vagueness detection
- Snapshot and rollback capability

## 🚀 Getting Started

1. **Understand Architecture**: Review the system overview above
2. **Review Tool Inventory**: See which tools are available
3. **Learn OAuth Pattern**: Understand token-based authentication
4. **Study Examples**: Review use case workflows
5. **Deploy and Test**: Follow deployment guide

## 📚 Additional Resources

- [OAuth Authentication](../oauth/README.md) - Token handling and auto-refresh
- [Reporting Platform](../reporting-platform/README.md) - Dashboard builder guide
- [Chrome DevTools](../chrome-devtools/README.md) - Browser automation setup
- [API Reference](../api-reference/) - Complete tool specifications

## 🔧 Common Workflows

### For Marketing Practitioners
1. Query Google Ads for campaign performance
2. Pull Search Console data for keyword analysis
3. Compare paid vs organic traffic
4. Build custom dashboards for reporting
5. Share insights with stakeholders

### For Developers
1. Create new MCP tools for additional APIs
2. Integrate with OAuth authentication
3. Add safety checks and approvals
4. Deploy to production infrastructure
5. Monitor and troubleshoot issues

### For DevOps/Infrastructure
1. Set up AWS or GCP deployment
2. Configure Supabase multi-tenant isolation
3. Set up monitoring and alerting
4. Manage infrastructure scaling
5. Implement backup and recovery

## ✅ Deployment Checklist

- [ ] All 31 tools tested with real API data
- [ ] OAuth token refresh working correctly
- [ ] Safety system approval flows validated
- [ ] Supabase RLS policies configured
- [ ] BigQuery dataset and tables created
- [ ] Reporting platform dashboards functional
- [ ] Audit logging enabled
- [ ] Monitoring and alerting configured
- [ ] Documentation reviewed by team
- [ ] Production deployment approved

## 🆘 Getting Help

- Check DEVELOPER-GUIDE.md for detailed explanations
- Review troubleshooting section in reporting platform docs
- Check OAuth documentation for auth issues
- Review Chrome DevTools docs for automation issues
