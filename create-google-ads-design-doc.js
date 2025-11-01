const { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, Table, TableRow, TableCell, WidthType, VerticalAlign } = require('docx');
const { Packer } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1440,    // 1 inch
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    children: [
      // Title
      new Paragraph({
        text: 'Google Ads API Design Document',
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),
      
      new Paragraph({
        text: 'WPP Media - Marketing Analytics Platform',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'Application for Standard Access (Unlimited Operations)',
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
      }),

      // Section 1: Company Information
      new Paragraph({
        text: '1. Company Information',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Company Name: ', bold: true }),
          new TextRun('WPP Media (part of WPP plc)'),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Business Type: ', bold: true }),
          new TextRun('Multi-tenant marketing analytics and reporting platform'),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Target Users: ', bold: true }),
          new TextRun('1,000-10,000 marketing practitioners across WPP agency network and their clients'),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Geographic Scope: ', bold: true }),
          new TextRun('Global (North America, Europe, Asia-Pacific)'),
        ],
        spacing: { after: 300 },
      }),

      new Paragraph({
        text: 'Business Model:',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'WPP Media operates a centralized marketing analytics platform that serves multiple WPP agencies (GroupM, Ogilvy, VML, Wavemaker, etc.) and their enterprise clients. Our platform enables marketing practitioners to access unified analytics across Google Search Console, Google Ads, and Google Analytics through an AI-agent-driven interface.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'Unlike traditional SaaS platforms, we do NOT manage ads on behalf of clients. Instead, we provide a reporting and analytics tool that practitioners use to monitor and optimize their own Google Ads accounts using their own credentials through OAuth 2.0.',
        spacing: { after: 300 },
      }),

      // Section 2: Tool Purpose and Use Case
      new Paragraph({
        text: '2. Tool Purpose and Use Case',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Primary Purpose: ', bold: true }),
          new TextRun('AI-agent-driven marketing analytics and reporting platform for Google Ads performance monitoring and optimization.'),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'What Our Tool Does:',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '1. Performance Reporting: Pull campaign performance data, keyword metrics, ad group statistics, and budget utilization into our BigQuery data warehouse for unified cross-platform analytics',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '2. Dashboard Creation: Generate interactive dashboards showing Google Ads performance alongside organic search (GSC) and website analytics (GA4) data',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '3. Budget Monitoring: Track daily spend, alert on budget pacing issues, and enable budget adjustments through approval workflows',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '4. Keyword Insights: Analyze search term reports, identify negative keyword opportunities, and track Quality Score metrics',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '5. Conversion Tracking: Import offline conversions from CRM systems to measure full-funnel ROI',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      new Paragraph({
        text: 'Who Uses Our Tool:',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Marketing Practitioners: Account managers, media buyers, and digital strategists within WPP agencies who manage Google Ads campaigns for their clients',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Agency Leadership: Directors and VPs who need cross-account performance views and reporting',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Client Stakeholders: Enterprise clients who receive automated performance reports generated by our platform',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      new Paragraph({
        text: 'Access Model:',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Each practitioner authenticates using their own Google account via OAuth 2.0. Our platform ONLY accesses Google Ads accounts that the practitioner already has permission to access through Google\'s native permission system. We do not maintain separate access control - Google IAM is our source of truth.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'All write operations (budget changes, campaign updates, keyword additions) require explicit user approval through our multi-step confirmation workflow with dry-run previews showing financial impact.',
        spacing: { after: 300 },
      }),

      // Section 3: Technical Architecture
      new Paragraph({
        text: '3. Technical Architecture',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'System Architecture:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'MCP Server Layer: 25+ Google Ads API tools accessible via Model Context Protocol, enabling AI agents to programmatically pull reports and execute approved operations',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'OAuth 2.0 Authentication: Per-request user authentication - each API call uses the practitioner\'s access token, ensuring they only access accounts they own or manage',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'BigQuery Data Warehouse: Centralized storage for cross-platform analytics (GSC + Ads + GA4), using shared table architecture with workspace_id for multi-tenant isolation',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Reporting Dashboard: Next.js web application displaying interactive charts, tables, and scorecards with real-time data queries',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Daily Refresh System: Cloud Function that incrementally pulls yesterday\'s data for all active properties, maintaining data freshness without manual intervention',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Data Flow:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '1. Practitioner authenticates via OAuth 2.0 → Google provides access token',
        numbering: { reference: 'dataflow', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '2. AI agent calls our MCP tool with user\'s token → Tool queries Google Ads API on behalf of user',
        numbering: { reference: 'dataflow', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '3. API returns data scoped to user\'s permissions → Agent stores in BigQuery with workspace_id tag',
        numbering: { reference: 'dataflow', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '4. Dashboard queries BigQuery → Displays fresh data with filtering and visualization',
        numbering: { reference: 'dataflow', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '5. Daily Cloud Function pulls incremental updates → All dashboards auto-refresh',
        numbering: { reference: 'dataflow', level: 0 },
        spacing: { after: 300 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Security & Compliance:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Multi-tenant Isolation: All data tagged with workspace_id, filtered by Row-Level Security in Supabase and BigQuery',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Approval Workflows: All write operations require dry-run preview + explicit confirmation with financial impact displayed',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Audit Logging: Complete trail of who accessed what data, when, and what changes were made',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'No Service Accounts: 100% user OAuth - we never access accounts without user credentials',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      // Section 4: API Services Used
      new Paragraph({
        text: '4. Google Ads API Services Used',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: 'Our platform uses the following Google Ads API services:',
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Read Operations (Primary - 90% of usage):', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Customer Service: List accessible accounts, get account metadata',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Campaign Service: List campaigns, get campaign performance metrics (impressions, clicks, cost, conversions)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'AdGroup Service: Get ad group performance and structure',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Keyword Service: Get keyword performance, Quality Score, search term reports',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Budget Service: List campaign budgets, monitor daily spend',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Conversion Service: Get conversion actions, conversion performance',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Audience Service: List remarketing lists and customer match lists',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Asset Service: List ad assets (images, videos, text)',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Write Operations (Secondary - 10% of usage, all require approval):', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Budget Service: Update campaign budgets (with dry-run preview and confirmation)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Campaign Service: Update campaign status (pause/enable campaigns)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Keyword Service: Add keywords and negative keywords to campaigns',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Conversion Service: Upload offline conversions from CRM systems',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Audience Service: Create and update remarketing lists',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      // Section 5: Expected API Usage
      new Paragraph({
        text: '5. Expected API Usage and Scale',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Pilot Phase (Months 1-3):', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Users: 10-100 practitioners',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Accounts Managed: ~50-200 Google Ads accounts',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Daily API Calls: ~5,000-15,000 operations/day',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Primary Operations: Performance reports, campaign lists, keyword reports',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Production Phase (Months 6-12):', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Users: 1,000-10,000 practitioners',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Accounts Managed: ~5,000-20,000 Google Ads accounts',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Daily API Calls: 100,000-500,000 operations/day',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Operation Mix: 90% read (reporting), 10% write (budget updates, campaign management)',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Why Standard Access is Required:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Scale: At 1,000+ users with daily refresh, we will exceed Basic tier\'s 15K operations/day limit',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Enterprise Clients: WPP serves Fortune 500 companies requiring reliable, unlimited API access',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Real-Time Monitoring: Daily automated refresh requires consistent API access without rate limit concerns',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Production SLA: Our clients expect 99.9% uptime and cannot tolerate rate limit interruptions',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      // Section 6: API Workflow
      new Paragraph({
        text: '6. Detailed API Workflow',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Typical User Workflow:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '1. Practitioner Authentication',
        numbering: { reference: 'workflow', level: 0 },
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: 'Practitioner logs into WPP platform, clicks "Connect Google Account", completes OAuth 2.0 consent screen, grants access to Google Ads API scope (https://www.googleapis.com/auth/adwords)',
        spacing: { after: 100, before: 0 },
        indent: { left: 720 },
      }),

      new Paragraph({
        text: '2. Data Discovery',
        numbering: { reference: 'workflow', level: 0 },
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: 'AI agent calls Customer.listAccessibleCustomers() using practitioner\'s token → Gets list of Google Ads accounts practitioner manages → Displays options to user',
        spacing: { after: 100, before: 0 },
        indent: { left: 720 },
      }),

      new Paragraph({
        text: '3. Performance Data Pull',
        numbering: { reference: 'workflow', level: 0 },
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: 'Agent queries GoogleAdsService.search() for campaign performance → Pulls metrics (clicks, impressions, cost, conversions) → Stores in BigQuery with workspace_id for isolation',
        spacing: { after: 100, before: 0 },
        indent: { left: 720 },
      }),

      new Paragraph({
        text: '4. Dashboard Generation',
        numbering: { reference: 'workflow', level: 0 },
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: 'Agent creates dashboard with charts showing: Daily spend trends, Campaign ROI, Keyword performance, Device breakdown, Geographic distribution → Returns dashboard URL to practitioner',
        spacing: { after: 100, before: 0 },
        indent: { left: 720 },
      }),

      new Paragraph({
        text: '5. Ongoing Refresh',
        numbering: { reference: 'workflow', level: 0 },
        spacing: { after: 50 },
      }),

      new Paragraph({
        text: 'Daily at 2 AM UTC: Cloud Function queries API for yesterday\'s data → Incremental update to BigQuery → All dashboards auto-update → No user action required',
        spacing: { after: 300, before: 0 },
        indent: { left: 720 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Budget Update Workflow (Example Write Operation):', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '1. Practitioner requests: "Increase budget for Campaign X to $100/day"',
        numbering: { reference: 'budget', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '2. Agent identifies campaign, retrieves current budget via CampaignBudget service',
        numbering: { reference: 'budget', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '3. Agent shows dry-run preview: "Current: $50/day → New: $100/day (+$50/day, +$1,520/month)"',
        numbering: { reference: 'budget', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '4. Practitioner confirms change',
        numbering: { reference: 'budget', level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: '5. Agent executes CampaignBudgetService.mutateCampaignBudgets() → Logs to audit trail → Notifies practitioner',
        numbering: { reference: 'budget', level: 0 },
        spacing: { after: 300 },
      }),

      // Section 7: Tool Design  
      new Paragraph({
        text: '7. Tool Design and User Interface',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'UI Component 1: Dashboard List View', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Shows all dashboards created by practitioner or shared with them. Each dashboard card displays: Dashboard name, Data sources (GSC, Ads, GA4), Last updated timestamp, Quick preview of key metrics.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'Mockup Description: Grid layout with dashboard cards, each showing thumbnail preview, "Client Name - Campaign Performance" title, "Google Ads + Search Console" badge, "Updated 2 hours ago" timestamp.',
        spacing: { after: 300 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'UI Component 2: Performance Analytics Dashboard', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Multi-page interactive dashboard with: Page 1 "Overview" - Scorecards (Total Spend, Conversions, ROAS, Avg CPC), Line chart (Daily spend trend over 90 days), Table (Top 10 campaigns by performance). Page 2 "Keywords" - Table (Top keywords by clicks), Bar chart (Quality Score distribution), Pie chart (Match type breakdown). Page 3 "Devices & Geo" - Stacked bar (Device performance), Heatmap (Geographic distribution).',
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'Mockup Description: Clean white background with WPP brand colors (navy #191D63), charts using ECharts library, global date range filter at top, dimension controls (Device, Campaign, Country) in sidebar.',
        spacing: { after: 300 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'UI Component 3: Budget Update Approval Interface', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'When practitioner requests budget change, shows: Current budget value, Proposed new value, Daily change amount, Monthly impact calculation, List of affected campaigns, Risk warnings (if increase >20%), "Preview Changes" and "Confirm Update" buttons.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'Mockup Description: Modal dialog with yellow warning border for large changes, clear before/after comparison table, green "Confirm" button disabled until preview reviewed.',
        spacing: { after: 300 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Data Visualization:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Our platform uses ECharts and Recharts libraries to visualize Google Ads data pulled via API. We support 32 chart types including: Line charts (trend analysis), Bar charts (campaign comparison), Pie charts (budget allocation), Tables (detailed metrics), Scorecards (KPI summaries), Heatmaps (geographic performance).',
        spacing: { after: 300 },
      }),

      // Section 8: API Call Patterns
      new Paragraph({
        text: '8. Specific API Call Patterns',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'On-Demand Dashboard Creation:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'When practitioner creates first dashboard for an account:',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Query campaign performance: GoogleAdsService.search(query="SELECT campaign.id, campaign.name, metrics.clicks, metrics.impressions, metrics.cost_micros, metrics.conversions FROM campaign WHERE segments.date DURING LAST_90_DAYS")',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Expected volume: ~50-500 rows per account (depending on campaign count)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Frequency: Once per account (reused for subsequent dashboards)',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Daily Automated Refresh:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'For each active account (used in last 30 days):',
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Pull yesterday\'s data: GoogleAdsService.search(query="SELECT ... WHERE segments.date = YESTERDAY")',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Incremental insert to BigQuery',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Expected volume: ~20-200 rows per account per day',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Frequency: Once per day per active account',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Total daily operations: (Active accounts × 1 query) = ~1,000-5,000 queries/day at scale',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Estimated Total Operations:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Read Operations: ~90,000-450,000/day (performance queries, lists, reports)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Write Operations: ~10,000-50,000/day (budget updates, campaign changes, keyword adds)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Total: 100,000-500,000 operations/day at full scale',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'This exceeds Basic tier\'s 15K/day limit and requires Standard Access.', bold: true, italics: true }),
        ],
        spacing: { after: 300 },
      }),

      // Section 9: Data Privacy and Compliance
      new Paragraph({
        text: '9. Data Privacy and Compliance',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'User Data Access:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Our platform ONLY accesses data that each practitioner is already authorized to view through Google\'s permission system. We do not aggregate, share, or expose data across practitioner boundaries.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'OAuth 2.0 Implementation:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Per-request authentication: Every API call includes user\'s OAuth token',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'No service accounts: We never access Google Ads accounts using service account credentials',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Token refresh: Access tokens refreshed automatically before each request (1-hour lifetime)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Scope limitation: Only request https://www.googleapis.com/auth/adwords (read/write ads data)',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Data Storage:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Performance data stored in BigQuery with workspace_id tags for multi-tenant isolation',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Row-Level Security enforced (users only see their workspace data)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'PII handling: No customer email/phone data stored except for Customer Match uploads (SHA-256 hashed)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Data retention: 12 months hot storage (BigQuery standard), 13-24 months warm storage (long-term), 25+ months archived (GCS)',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      // Section 10: Safety and Approval Systems
      new Paragraph({
        text: '10. Safety Systems and Approval Workflows',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        text: 'All write operations to Google Ads accounts are protected by multiple safety layers:',
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: '1. Dry-Run Preview System', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Before any write operation executes, system generates preview showing: Current state vs proposed state, Financial impact calculation (daily and monthly), List of affected campaigns/ad groups, Risk warnings for large changes (>20% budget increase), Requires explicit user confirmation before proceeding.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: '2. Approval Enforcer', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Confirmation tokens (60-second expiration), Two-step confirmation for destructive operations, Prevents accidental bulk changes (max 20 items per operation).',
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: '3. Audit Trail', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Every API call logged with: User identity (OAuth user ID), Timestamp, Operation type (read/write), Parameters and results, Success/failure status.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: '4. Financial Impact Calculation', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Budget changes show real financial impact in dollars: Daily change, 30-day projected change, Warnings for large increases, Recommendations for gradual optimization.',
        spacing: { after: 300 },
      }),

      // Section 11: Why We Need This Access
      new Paragraph({
        text: '11. Why WPP Media Needs Google Ads API Access',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Business Justification:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'WPP is the world\'s largest advertising and PR company, managing billions in annual ad spend across Google Ads. Our platform consolidates analytics for 1,000+ marketing practitioners who collectively manage tens of thousands of Google Ads accounts for major enterprise clients (Fortune 500 companies).',
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'Current solutions (Looker Studio, Supermetrics, etc.) require each practitioner to manually configure connectors, build dashboards, and manage refresh schedules. Our AI-agent-driven approach automates this entirely, reducing dashboard creation from 2-3 hours to 30 seconds.',
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Technical Justification for Standard Access:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Scale Requirements: At 1,000 users with 5,000 managed accounts, daily refresh alone requires 5,000+ API calls. With on-demand reporting and interactive dashboards, we project 100K-500K operations/day.',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Basic Tier Insufficient: 15K operations/day limit would support only ~50-100 users, far below our production requirements.',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Enterprise SLA: WPP clients expect 99.9% uptime. Rate limits would cause service interruptions unacceptable for enterprise contracts.',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Competitive Position: Our platform competes with enterprise BI tools (Datorama, Tableau) that have unlimited API access. Rate limits would make our platform non-competitive.',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Responsible Use Commitment:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Incremental refresh strategy (only pull new data, not full history)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Caching in BigQuery (avoid redundant API calls)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Smart scheduling (daily refresh at off-peak hours)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Rate limiting on our side (prevent runaway scripts)',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Monitoring and alerting (detect anomalies)',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      // Section 12: Production Timeline
      new Paragraph({
        text: '12. Production Timeline and Rollout Plan',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Phase 1: Pilot (Months 1-2)', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Users: 10-50 WPP practitioners',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Accounts: ~20-100 Google Ads accounts',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Daily operations: 5,000-15,000',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Goal: Validate platform with real users, gather feedback, refine workflows',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Phase 2: Early Adoption (Months 3-6)', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Users: 100-500 practitioners',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Accounts: ~500-2,000 accounts',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Daily operations: 30,000-100,000',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Goal: Scale infrastructure, optimize API usage, add advanced features',
        bullet: { level: 0 },
        spacing: { after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Phase 3: Full Production (Months 6+)', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Users: 1,000-10,000 practitioners',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Accounts: ~5,000-20,000 accounts',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Daily operations: 100,000-500,000',
        bullet: { level: 0 },
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Goal: Enterprise-scale deployment across WPP global network',
        bullet: { level: 0 },
        spacing: { after: 300 },
      }),

      // Section 13: Contact Information
      new Paragraph({
        text: '13. Contact Information',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Technical Contact:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Name: [Your Name]',
        spacing: { after: 100 },
        indent: { left: 360 },
      }),

      new Paragraph({
        text: 'Title: [Your Title]',
        spacing: { after: 100 },
        indent: { left: 360 },
      }),

      new Paragraph({
        text: 'Email: [Your Email]',
        spacing: { after: 100 },
        indent: { left: 360 },
      }),

      new Paragraph({
        text: 'Organization: WPP Media / WPP plc',
        spacing: { after: 300 },
        indent: { left: 360 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Developer Token Details:', bold: true }),
        ],
        spacing: { after: 100 },
      }),

      new Paragraph({
        text: 'Current Access Level: Test (limited to test accounts)',
        spacing: { after: 100 },
        indent: { left: 360 },
      }),

      new Paragraph({
        text: 'Requested Access Level: Standard (unlimited operations)',
        spacing: { after: 100 },
        indent: { left: 360 },
      }),

      new Paragraph({
        text: 'Justification: Production deployment supporting 1,000+ users and 100K-500K daily API operations',
        spacing: { after: 100 },
        indent: { left: 360 },
      }),

      new Paragraph({
        text: 'Developer Token ID: [Your current token from .env file]',
        spacing: { after: 400 },
        indent: { left: 360 },
      }),

      // Footer Note
      new Paragraph({
        text: '---',
        border: {
          top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 },
        },
        spacing: { before: 600, after: 200 },
      }),

      new Paragraph({
        children: [
          new TextRun({ text: 'Note: ', bold: true }),
          new TextRun('This platform is an internal tool for WPP agency network. It is not a public SaaS product and will not be externally accessible to the general public. All users are WPP employees or contractors with approved access.'),
        ],
        spacing: { after: 200 },
      }),

      new Paragraph({
        text: 'For questions or additional documentation, please contact the technical lead above.',
        spacing: { after: 200 },
      }),
    ],
  }],
  
  numbering: {
    config: [
      {
        reference: 'dataflow',
        levels: [
          {
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.LEFT,
          },
        ],
      },
      {
        reference: 'budget',
        levels: [
          {
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.LEFT,
          },
        ],
      },
      {
        reference: 'workflow',
        levels: [
          {
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: AlignmentType.LEFT,
          },
        ],
      },
    ],
  },
});

// Export to DOCX
Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('/home/dogancanbaris/projects/MCP Servers/Google-Ads-API-Design-Document-WPP-Media.docx', buffer);
  console.log('✅ Document created: Google-Ads-API-Design-Document-WPP-Media.docx');
});
