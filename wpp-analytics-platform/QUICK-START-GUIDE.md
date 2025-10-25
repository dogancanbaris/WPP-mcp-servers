# 🚀 WPP Analytics Platform - Quick Start Guide

**Get started in 5 minutes!**

---

## ⚡ Start the Platform

### 1. Start Services (2 terminals)

**Terminal 1 - Cube.js Backend**:
```bash
cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/cube-backend
npm run dev
```

**Terminal 2 - Next.js Frontend**:
```bash
cd /home/dogancanbaris/projects/MCP\ Servers/wpp-analytics-platform/frontend
npm run dev
```

**Wait for**:
- Cube.js: `🚀 Cube API server is listening on 4000`
- Next.js: `✓ Ready in XXXXms`

---

## 🔑 One-Time Setup: Configure OAuth

**Time**: 15 minutes
**Guide**: See `GOOGLE-OAUTH-SETUP.md`

**Quick steps**:
1. Google Cloud Console → Create OAuth client
2. Add redirect URI: `https://nbjlehblqctblhpbwgry.supabase.co/auth/v1/callback`
3. Copy Client ID & Secret
4. Supabase Dashboard → Authentication → Providers → Google
5. Paste credentials, Save
6. Test: http://localhost:3000/login → "Continue with Google"

---

## 🎯 Using the Platform

### **Login**
```
http://localhost:3000
→ Auto-redirects to /login
→ Click "Continue with Google"
→ OAuth consent → Allow
→ Redirected to dashboard list ✅
```

### **Create Dashboard**
```
Click "New Dashboard"
Name: "My Dashboard"
Source: "gsc_performance_7days" (or ads/analytics)
Template: "GSC Standard" (or Blank)
Click "Create Dashboard"
→ Opens builder with charts ✅
```

### **Build Dashboard**
```
Press Cmd+K (or click "Add Chart")
→ Choose chart type: KPI, Line, Bar, Pie, Advanced, Special, Table
→ Select metric/dimension
→ Chart appears, auto-sized ✅

Drag charts to reorder
Press Cmd+F to toggle filters
Press Cmd+S to save
```

### **Export**
```
Click "Export" → "Export as PDF" (or Excel)
→ File downloads ✅
```

### **Share**
```
Click "Share"
→ Enter email OR click "Generate Public Link"
→ Dashboard shared ✅
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+S` | Save dashboard |
| `Cmd+K` | Add chart |
| `Cmd+F` | Toggle filters |
| `Cmd+E` | Export PDF |
| `Cmd+Z` | Undo (planned) |
| `Cmd+Shift+Z` | Redo (planned) |

---

## 📊 Available Chart Types (13)

**Basic** (5):
1. KPI cards
2. Line charts
3. Bar charts
4. Pie charts
5. Tables

**Advanced** (4):
6. Area charts
7. Scatter plots
8. Heatmaps
9. Gauge charts

**Special** (4):
10. Treemap
11. Sankey diagrams
12. Funnel charts
13. Radar charts

---

## 🎨 Available Data Sources

**Ready Now**:
1. **Google Search Console** (gsc_performance_7days)
   - Metrics: Clicks, Impressions, CTR, Position
   - Dimensions: Query, Page, Device, Country, Date

2. **Google Ads** (ads_performance_7days)
   - Metrics: Clicks, Cost, CPC, CPA, Conversions, CVR
   - Dimensions: Campaign, Ad Group, Device, Network, Date

3. **Google Analytics** (analytics_sessions_7days)
   - Metrics: Sessions, Users, Pageviews, Bounce Rate, Duration
   - Dimensions: Source, Medium, Landing Page, Device, Country, Date

**To add more**:
- Create new BigQuery table
- Create Cube model in `/cube-backend/schema/`
- Add to dropdown in dashboard creation modal

---

## 🔧 Common Tasks

### **Duplicate a Dashboard**:
```
Go to /dashboard
Hover over dashboard card
Click ⋮ (three dots)
Click "Duplicate"
→ Copy created ✅
```

### **Delete a Dashboard**:
```
Hover over dashboard card
Click ⋮ → "Delete"
Confirm dialog
→ Dashboard deleted ✅
```

### **Change Theme**:
```
Click 🌙/☀️ icon (top right)
→ Toggles light/dark mode ✅

Or go to /settings
```

### **Sign Out**:
```
Click user profile dropdown
Click "Sign Out"
→ Redirected to /login ✅
```

---

## 🆘 Troubleshooting

### **"OAuth not configured" error**
→ Follow `GOOGLE-OAUTH-SETUP.md`

### **Charts not loading**
→ Check Cube.js is running on port 4000
→ Check BigQuery credentials in `cube-backend/.env`

### **Dashboard not saving**
→ Check Supabase connection
→ Check browser console for errors
→ Verify user is authenticated

### **RLS blocking data**
→ Check user has workspace in Supabase
→ Verify RLS policies are correct
→ Check Supabase logs

---

## 📱 Responsive Design

**Mobile** (< 768px):
- Dashboard list: 1 column
- Filter panel: Stacked vertically
- Charts: Full width
- User profile: Name hidden, icon only

**Tablet** (768px - 1024px):
- Dashboard list: 2 columns
- Filter panel: 2 columns
- Charts: Responsive grid

**Desktop** (> 1024px):
- Dashboard list: 3 columns
- Filter panel: 4 columns
- Charts: 12-column grid

---

## 🎯 Quick Links

**Pages**:
- Login: http://localhost:3000/login
- Dashboard List: http://localhost:3000/dashboard
- Dashboard Builder: http://localhost:3000/dashboard/[id]/builder
- Settings: http://localhost:3000/settings

**Services**:
- Cube.js Playground: http://localhost:4000
- Supabase Studio: https://supabase.com/dashboard/project/nbjlehblqctblhpbwgry

**Documentation**:
- OAuth Setup: `GOOGLE-OAUTH-SETUP.md`
- Day 3 Summary: `DAY-3-COMPLETION-SUMMARY.md`
- Day 4-5 Summary: `DAY-4-5-COMPLETION-SUMMARY.md`
- Production Ready: `PRODUCTION-READY-SUMMARY.md`
- This Guide: `QUICK-START-GUIDE.md`

---

**🎉 You're all set! Start building dashboards! 🎉**
