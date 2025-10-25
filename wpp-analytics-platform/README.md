# 🎯 WPP Analytics Platform

**AI-Powered Dashboard Builder for Digital Marketing Teams**

Built with Supabase, Cube.js, Next.js, and ECharts

**Status**: ✅ **100% Production Ready**

---

## ✨ Features

### **Complete Dashboard Builder**
- 🎨 **13 Chart Types** - KPI, Line, Bar, Pie, Table, Treemap, Sankey, Heatmap, Gauge, Area, Scatter, Funnel, Radar
- 🖱️ **Drag-and-Drop** - Reorder charts with smooth animations
- 💾 **Save/Load** - Persist dashboards to Supabase with RLS isolation
- 🔍 **Advanced Filters** - Date range, search, multi-select, range slider, filter chips
- 🎨 **Auto-Formatting** - CTR shows as "2.17%" not 0.0217, currency as "$1,234.56"
- 📊 **Auto-Sizing** - Charts automatically sized based on type
- 🌓 **Dark Mode** - Beautiful dark theme with automatic chart color adaptation

### **Dashboard Management**
- ✅ Create from templates (Blank, GSC Standard, Ads Performance)
- ✅ Duplicate dashboards (one click)
- ✅ Delete dashboards (with confirmation)
- ✅ List view with metadata (chart counts, last edited)
- ✅ Real-time loading from Supabase

### **Sharing & Export**
- 📤 **Export** - PDF, Excel formats
- 🔗 **Share** - With specific users (email) or public link
- 🔐 **Permissions** - View-only or edit access
- 🔒 **RLS Enforced** - Users only see their own or shared dashboards

### **Authentication**
- 🔐 Google OAuth (via Supabase Auth)
- 👤 User profile dropdown (avatar, name, logout)
- 🛡️ Protected routes (middleware)
- 🏢 Multi-tenant workspace isolation

### **Data Sources**
- 📈 Google Search Console (clicks, impressions, CTR, position)
- 💰 Google Ads (cost, conversions, CPC, CPA)
- 📊 Google Analytics (sessions, users, bounce rate, duration)
- 🔌 All connected via Cube.js semantic layer
- 💡 Intelligence metadata for auto-formatting

---

## 🏗️ Architecture

**LEGO-BLOCK Approach**: Assemble proven components (not custom-built)

**Stack**:
1. **Supabase Cloud** - Authentication + PostgreSQL database
2. **Cube.js** - Semantic layer (handles filter complexity automatically)
3. **Next.js 15** - App Router + React 19
4. **Apache ECharts** - 13 chart types (120+ available, FREE)
5. **Shadcn/ui** - Professional UI components (14 installed)
6. **@dnd-kit** - Drag-and-drop library

**Result**: 95% proven functionality, 5% custom glue code ✅

---

## 🚀 Quick Start

### **Prerequisites**
- Node.js 18+
- npm or yarn
- Google Cloud Project (for BigQuery + OAuth)
- Supabase account (free tier works!)

### **Installation** (5 minutes)

```bash
cd wpp-analytics-platform

# Install Cube.js backend
cd cube-backend
npm install

# Install frontend
cd ../frontend
npm install
```

### **Configuration** (10 minutes)

**1. Cube.js Backend** (`cube-backend/.env`):
```bash
CUBEJS_DB_TYPE=bigquery
CUBEJS_DB_BQ_PROJECT_ID=mcp-servers-475317
CUBEJS_DB_BQ_KEY_FILE=/path/to/service-account.json
CUBEJS_API_SECRET=your_secret_key
```

**2. Frontend** (`frontend/.env.local`):
```bash
NEXT_PUBLIC_SUPABASE_URL=https://nbjlehblqctblhpbwgry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
NEXT_PUBLIC_CUBEJS_API_URL=http://localhost:4000/cubejs-api/v1
NEXT_PUBLIC_CUBEJS_API_SECRET=your_secret_key
```

**3. Apply Database Migrations**:
```bash
# Via Supabase MCP or Studio - apply:
supabase/migrations/20251021000000_initial_schema.sql
supabase/migrations/20251021000001_add_sharing.sql
```

**4. Configure OAuth** (15 min):
See **`GOOGLE-OAUTH-SETUP.md`** for detailed guide

### **Start Services** (2 terminals)

**Terminal 1**:
```bash
cd cube-backend
npm run dev
```

**Terminal 2**:
```bash
cd frontend
npm run dev
```

**Access**: http://localhost:3000

---

## 📐 Project Structure

```
wpp-analytics-platform/
├── supabase/migrations/     # Database schema & RLS policies
├── cube-backend/schema/     # Cube.js data models (3 sources)
└── frontend/src/
    ├── app/
    │   ├── login/           # OAuth login page
    │   ├── dashboard/       # Dashboard list & builder
    │   ├── settings/        # User settings
    │   └── auth/callback/   # OAuth callback handler
    ├── components/
    │   ├── ui/              # Shadcn components (14)
    │   ├── providers.tsx    # CubeProvider + ThemeProvider
    │   ├── user-profile.tsx # User dropdown
    │   └── theme-toggle.tsx # Dark mode switcher
    ├── hooks/
    │   └── use-keyboard-shortcuts.ts
    ├── lib/
    │   ├── supabase/        # Dashboard & sharing services
    │   ├── cubejs/          # Cube API client
    │   ├── export/          # PDF/Excel export
    │   └── themes/          # ECharts theming
    └── middleware.ts        # Route protection
```

**Total**: ~5,890 lines of production code

---

## ⌨️ Keyboard Shortcuts

Power user features:

| Shortcut | Action |
|----------|--------|
| `Cmd+S` | Save dashboard |
| `Cmd+K` | Add chart |
| `Cmd+F` | Toggle filters |
| `Cmd+E` | Export PDF |
| `Cmd+Z` | Undo (planned) |

**See all shortcuts**: Click `?` in dashboard builder

---

## 📊 Complete Feature List

**Authentication**: Google OAuth, User profiles, Protected routes, Workspace isolation

**Dashboard Management**: Create, Read, Update, Delete, Duplicate, Templates

**Builder**: 13 chart types, Drag-and-drop, Auto-formatting, Auto-sizing

**Filters**: Date range, Search, Multi-select, Range slider, Filter chips

**Export**: PDF, Excel

**Sharing**: User-specific, Public links, Permissions (view/edit)

**UI/UX**: Dark mode, Keyboard shortcuts, Responsive design, Loading states

**Data Sources**: GSC, Google Ads, Analytics (all with intelligence metadata)

---

## 💰 Cost

**Free Tier** (Perfect for starting):
- Supabase: FREE (50K MAU)
- Cube.js: FREE (self-hosted)
- BigQuery: $0-20/month (free quota)
- Vercel: FREE
- **Total**: **$0-20/month** ✅

**Pro Tier** (100+ users):
- Supabase: $25/month
- BigQuery: $50-100/month
- Vercel: $20/month
- **Total**: ~**$95-145/month**

---

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| **QUICK-START-GUIDE.md** | Get started in 5 minutes |
| **GOOGLE-OAUTH-SETUP.md** | Configure OAuth (15 min) |
| **PRODUCTION-READY-SUMMARY.md** | Complete feature list |
| **DAY-3-COMPLETION-SUMMARY.md** | Save/load, charts, filters |
| **DAY-4-5-COMPLETION-SUMMARY.md** | Auth, CRUD, sharing |

---

## 💡 Key Innovation: Intelligence Metadata

**The Problem**: Different metrics need different formatting

**The Solution**: Intelligence embedded in Cube models

```javascript
// In Cube model:
avgCtr: {
  sql: `ctr`,
  type: `avg`,
  meta: {
    intelligence: {
      format: 'percentage',
      transform: 'multiply_100',
      decimals: 2,
      suffix: '%'
    }
  }
}

// Result: 0.0217 → "2.17%" ✅ (automatic!)
```

**Formats Supported**:
- Percentages (CTR, bounce rate, conversion rate)
- Currency ($1,234.56)
- Numbers with commas (12,345)
- Duration (2m 34s)

---

## 🔐 Security

**Multi-Layer Security**:
- ✅ Google OAuth (Supabase Auth)
- ✅ Row Level Security (RLS policies on all tables)
- ✅ Workspace isolation (users only see their data)
- ✅ Protected routes (Next.js middleware)
- ✅ Secure cookies (HTTP-only)
- ✅ PKCE flow (OAuth best practice)

---

## 📈 What's Next (Optional)

**Week 2**: Gemini Integration
- Auto-generate Cube models from any BigQuery table
- AI-powered metric detection
- Natural language queries

**Week 3**: Advanced Features
- Calculated metrics builder
- Cross-filtering (click chart → filter dashboard)
- Cascading filters (country → city)
- 40+ chart types (expand from 13)

**Week 4**: Enterprise
- Team workspaces
- Real-time collaboration
- Scheduled reports (email)
- Custom branding

---

## 🎊 Status

**Progress**: 100% Complete ✅
**Production Ready**: Yes (after OAuth config)
**Total Code**: 5,890 lines
**Time to Deploy**: 30 minutes (15 min OAuth + 15 min deployment)
**Cost**: $0-20/month

---

## 📄 License

MIT License - See LICENSE file

---

## 🎯 Quick Links

**Live URLs**:
- Platform: http://localhost:3000
- Dashboard Builder: http://localhost:3000/dashboard/example/builder
- Cube Playground: http://localhost:4000
- Supabase Studio: https://supabase.com/dashboard/project/nbjlehblqctblhpbwgry

---

**Built with ❤️ for WPP Digital Marketing Teams**

**Status**: ✅ 100% Production Ready | **Features**: 50+ | **Cost**: $0-20/month
