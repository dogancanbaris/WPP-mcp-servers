# WPP MCP Servers - Documentation Index

Welcome to the WPP MCP Servers documentation! This guide helps you find what you need.

---

## 🚀 New to the Project?

**Start with these 3 documents in order:**

1. **[../README.md](../README.md)** - Project overview, what this is, current status
2. **[../GETTING-STARTED.md](../GETTING-STARTED.md)** - Quick start guide (5 minutes)
3. **[architecture/CLAUDE.md](architecture/CLAUDE.md)** - Complete project documentation

---

## 📚 Documentation Structure

### guides/ - How-To Guides

**For Users/Practitioners:**
- **[SKILLS-GUIDE.md](guides/SKILLS-GUIDE.md)** - 13 Claude Code skills for workflows

**For Developers:**
- **[SETUP-GUIDE.md](guides/SETUP-GUIDE.md)** - OAuth setup, authentication
- **[INTEGRATION-GUIDE.md](guides/INTEGRATION-GUIDE.md)** - How to create new MCP tools with safety
- **[TESTING-GUIDE.md](guides/TESTING-GUIDE.md)** - Testing procedures

---

### architecture/ - System Design & Planning

- **[CLAUDE.md](architecture/CLAUDE.md)** ⭐ **Main project documentation**
  - Project overview and goals
  - Architecture diagrams
  - Technology stack
  - Security design
  - Multi-phase approach

- **[project-plan.md](architecture/project-plan.md)** - Original implementation plan
- **[OMA-MCP-INTEGRATION.md](architecture/OMA-MCP-INTEGRATION.md)** - OMA platform integration spec
- **[AWS-DEPLOYMENT-GUIDE.md](architecture/AWS-DEPLOYMENT-GUIDE.md)** - Production infrastructure deployment

---

### api-reference/ - API Documentation

Complete reference for all integrated APIs:

- **[GOOGLE-ADS-API-REFERENCE.md](api-reference/GOOGLE-ADS-API-REFERENCE.md)** - 40 tools documented (25 built, 15 planned)
- **[GSC-API-REFERENCE.md](api-reference/GSC-API-REFERENCE.md)** - Search Console API
- **[GSC-API-CAPABILITIES.md](api-reference/GSC-API-CAPABILITIES.md)** - GSC + CrUX detailed capabilities
- **[GOOGLE-ADS-API-RESEARCH.md](api-reference/GOOGLE-ADS-API-RESEARCH.md)** - Ads API research notes
- **[API-EXPANSION-PLAN.md](api-reference/API-EXPANSION-PLAN.md)** - Future API expansion roadmap

---

### safety/ - Safety & Production

Critical for production deployment:

- **[SAFETY-AUDIT.md](safety/SAFETY-AUDIT.md)** ⭐ **Must-read before production**
  - Complete risk analysis
  - All 58 tools categorized by risk
  - 8 critical scenarios
  - What's protected vs gaps

- **[PRODUCTION-READINESS.md](safety/PRODUCTION-READINESS.md)** - 4-phase rollout plan
- **[AGENT-EXPERIENCE.md](safety/AGENT-EXPERIENCE.md)** - What AI agents see and can do
- **[DEPLOYMENT-READY-STATUS.md](safety/DEPLOYMENT-READY-STATUS.md)** - Pre-deployment checklist

---

### status/ - Project Status

- **[CURRENT-STATUS.md](status/CURRENT-STATUS.md)** - Current project state (always up-to-date)

**Historical Status (archive/):**
- FINAL-STATUS-OCT-17.md - Phase 1 completion
- FINAL-STATUS-OCT-18.md - Phase 2 completion
- COMPLETE-OCT-18.md - Full completion summary
- EXPANSION-COMPLETE.md - API expansion completion
- Plus 4 other historical snapshots

---

### internal/ - Internal Documentation

For developers and AI agents working on the project:

- **[AGENT-HANDOVER.md](internal/AGENT-HANDOVER.md)** - Complete agent handover guide
- **[PROJECT-BACKBONE.md](internal/PROJECT-BACKBONE.md)** - Technical deep dive
- **[COMPLETE-MCP-SERVER-SUMMARY.md](internal/COMPLETE-MCP-SERVER-SUMMARY.md)** - Technical summary
- **[ALL-DOCS-COMPLETE.md](internal/ALL-DOCS-COMPLETE.md)** - Documentation completion notes

---

## 🎯 Finding What You Need

### "I want to use the MCP server"
→ Start: [../GETTING-STARTED.md](../GETTING-STARTED.md)
→ Skills: [guides/SKILLS-GUIDE.md](guides/SKILLS-GUIDE.md)

### "I want to understand the architecture"
→ Read: [architecture/CLAUDE.md](architecture/CLAUDE.md)
→ Then: [architecture/OMA-MCP-INTEGRATION.md](architecture/OMA-MCP-INTEGRATION.md)

### "I want to create a new tool"
→ Guide: [guides/INTEGRATION-GUIDE.md](guides/INTEGRATION-GUIDE.md)
→ Safety: [safety/SAFETY-AUDIT.md](safety/SAFETY-AUDIT.md)
→ Use: `mcp-tool-creator` Claude Code skill

### "I want to deploy to production"
→ Check: [safety/PRODUCTION-READINESS.md](safety/PRODUCTION-READINESS.md)
→ Deploy: [architecture/AWS-DEPLOYMENT-GUIDE.md](architecture/AWS-DEPLOYMENT-GUIDE.md)
→ Verify: Use `deployment-readiness-checker` skill

### "I want to know what tools are available"
→ APIs: [api-reference/](api-reference/) directory
→ Current: [status/CURRENT-STATUS.md](status/CURRENT-STATUS.md)

### "I'm taking over development"
→ Start: [internal/AGENT-HANDOVER.md](internal/AGENT-HANDOVER.md)
→ Context: [internal/PROJECT-BACKBONE.md](internal/PROJECT-BACKBONE.md)

---

## 📊 Documentation Statistics

- **Total Documentation Files:** 30
- **Total Pages:** 1,000+ pages
- **Categories:** 6 main categories
- **Languages:** Markdown (docs), TypeScript (code)
- **Maintained:** Auto-sync via documentation-syncer skill

---

**Pro Tip:** Use the `documentation-syncer` Claude Code skill to keep these docs updated as the project evolves!
