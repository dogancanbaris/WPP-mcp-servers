# Getting Started with WPP MCP Servers

**Quick start guide - 5 minutes to first query!**

---

## What is This?

WPP MCP Servers is an enterprise-grade Model Context Protocol server that connects AI agents to **7 Google Marketing APIs**:

1. Google Search Console (organic SEO)
2. Chrome UX Report (performance metrics)
3. Google Ads (paid advertising)
4. Google Analytics 4 (user behavior)
5. Google Business Profile (local SEO)
6. BigQuery (data blending)
7. Bright Data SERP (unlimited rank tracking)

**Total: 58 MCP tools** with comprehensive safety features.

---

## For Practitioners (Using the MCP Server)

### Prerequisites
- Claude Code CLI installed
- Access to WPP MCP server (configured by admin)

### First Steps

1. **Verify MCP Connection:**
   Open Claude Code CLI and type:
   ```
   /mcp
   ```
   You should see "wpp-digital-marketing" server with 58 tools.

2. **Try Your First Query:**
   ```
   "List my Google Search Console properties"
   ```

   Claude will call `list_properties` tool and show your GSC accounts.

3. **Run a Simple Analysis:**
   ```
   "Show me top 20 queries from my Search Console data for the last 30 days"
   ```

   Claude will:
   - Use BigQuery to aggregate data
   - Return ~20 rows (efficient!)
   - Show results in chat

4. **Use the Workflow Skills:**
   ```
   "Review SEO performance for keepersdigital.com"
   ```

   The `wpp-practitioner-assistant` skill activates and guides complete workflow!

### Available Workflows

- **SEO Review:** "Review SEO for [client]" → Complete content gap analysis
- **Campaign Optimization:** "Optimize Google Ads for [client]" → Cross-platform insights + changes
- **Client Reports:** "Create dashboard for [client]" → Persistent Metabase dashboard
- **Data Blending:** "Compare paid vs organic performance" → Multi-platform analysis

See [docs/guides/SKILLS-GUIDE.md](docs/guides/SKILLS-GUIDE.md) for all 13 available skills.

---

## For Developers (Building the MCP Server)

### Prerequisites
- Node.js 18+
- Git
- Google Cloud project with APIs enabled

### Setup Steps

1. **Clone Repository:**
   ```bash
   git clone https://github.com/dogancanbaris/WPP-mcp-servers.git
   cd WPP-mcp-servers
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Configure OAuth:**
   - Copy `.env.example` to `.env`
   - Add your Google OAuth credentials
   - See [docs/guides/SETUP-GUIDE.md](docs/guides/SETUP-GUIDE.md) for details

4. **Run OAuth Setup:**
   ```bash
   npm run setup:auth
   ```

   This opens browser for Google authorization.

5. **Build Project:**
   ```bash
   npm run build
   ```

   Expected: ✅ 0 errors, 0 warnings

6. **Start MCP Server:**
   ```bash
   npm run start:gsc
   ```

   Server runs in STDIO mode for Claude Code CLI.

### Creating Your First Tool

Use the `mcp-tool-creator` Claude Code skill:

```
"Create a new tool for listing Google Ads ad groups"
```

The skill generates:
- Complete tool file with safety integration
- Validation schema
- Test file
- Export statements

Then use `safety-audit-reviewer` to verify compliance!

---

## Configuration

### Server Modes

**STDIO Mode** (for Claude Code CLI):
```bash
npm run start:gsc
```

**HTTP Mode** (for OMA platform):
```bash
HTTP_PORT=3000 node dist/http-server/index.js
```

### Configuration Files

Located in `config/`:
- `gsc-config.json` - Server configuration
- `safety-limits.json` - Budget caps, bulk limits
- `prohibited-operations.json` - Blocked operations
- `notification-config.json` - Email settings

---

## Documentation

**Complete documentation index:** [docs/00-START-HERE.md](docs/00-START-HERE.md)

**Essential reading:**
- [docs/architecture/CLAUDE.md](docs/architecture/CLAUDE.md) - Complete project documentation
- [docs/safety/SAFETY-AUDIT.md](docs/safety/SAFETY-AUDIT.md) - Safety features and risks
- [docs/guides/INTEGRATION-GUIDE.md](docs/guides/INTEGRATION-GUIDE.md) - How to create tools

---

## Current Status

- **Tools:** 58 across 7 APIs
- **Safety:** 9-layer protection (95% complete)
- **Production Ready:** Yes (pending email notifications)
- **Code Quality:** 0 compilation errors
- **Tests:** 23 automated tests passing

---

## Getting Help

- **Documentation:** [docs/00-START-HERE.md](docs/00-START-HERE.md)
- **GitHub Issues:** https://github.com/dogancanbaris/WPP-mcp-servers/issues
- **Linear Team:** MCP Servers (43 tickets documenting all work)

---

## Next Steps

**For Practitioners:**
→ Start using Claude Code skills for your workflows!

**For Developers:**
→ Read [docs/architecture/CLAUDE.md](docs/architecture/CLAUDE.md) for complete context
→ Then [docs/internal/AGENT-HANDOVER.md](docs/internal/AGENT-HANDOVER.md) for development guide

---

**Ready to 10x your marketing workflow with AI? Let's go! 🚀**
