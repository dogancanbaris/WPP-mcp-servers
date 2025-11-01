import { Document, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'docx';
import { Packer } from 'docx';
import fs from 'fs';

const doc = new Document({
  sections: [{
    properties: {
      page: {
        margin: {
          top: 1440,
          right: 1440,
          bottom: 1440,
          left: 1440,
        },
      },
    },
    children: [
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

      new Paragraph({
        text: 'Submitted: October 31, 2025',
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),

      // Rest of document content (condensed for ES module compatibility)...
      // Company Info
      new Paragraph({ text: '1. Company Information', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Company Name: ', bold: true }), new TextRun('WPP Media (part of WPP plc - world\'s largest advertising company)') ], spacing: { after: 100 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Business Type: ', bold: true }), new TextRun('Multi-tenant marketing analytics platform for WPP agency network') ], spacing: { after: 100 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Scale: ', bold: true }), new TextRun('1,000-10,000 marketing practitioners across WPP agencies globally') ], spacing: { after: 100 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Industry: ', bold: true }), new TextRun('Digital marketing analytics and business intelligence') ], spacing: { after: 300 } }),
      
      new Paragraph({ text: 'WPP Media provides a centralized analytics platform enabling marketing practitioners across the WPP network to monitor and optimize Google Ads performance for their clients. We serve major WPP agencies including GroupM, Ogilvy, VML, and Wavemaker, who collectively manage billions in annual ad spend for Fortune 500 clients.', spacing: { after: 300 } }),

      // Tool Purpose
      new Paragraph({ text: '2. Tool Purpose and Use Case', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Primary Purpose: ', bold: true }), new TextRun('AI-agent-driven analytics platform for Google Ads performance monitoring, reporting, and optimization across multiple client accounts.') ], spacing: { after: 200 } }),
      
      new Paragraph({ text: 'Core Capabilities:', spacing: { after: 100 } }),
      new Paragraph({ text: 'Performance Reporting: Pull campaign metrics, ad group stats, keyword data into BigQuery for unified cross-platform analytics', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Dashboard Automation: Generate interactive dashboards showing Google Ads + Search Console + GA4 data in one view', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Budget Monitoring: Track spend, forecast pacing, enable budget adjustments with approval workflows', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Keyword Analysis: Search term reports, negative keyword identification, Quality Score tracking', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Conversion Tracking: Import offline conversions from CRM for full-funnel ROI measurement', bullet: { level: 0 }, spacing: { after: 300 } }),

      new Paragraph({ text: 'Tool Access:', spacing: { after: 100 } }),
      new Paragraph({ text: 'Internal WPP Platform: Used exclusively by WPP employees and approved contractors', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'OAuth 2.0 Authentication: Each practitioner connects their own Google account - tool only accesses accounts they already have permission for', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'AI Agent Interface: Practitioners issue natural language requests ("Show Nike campaign performance"), AI agents call our MCP tools which use Google Ads API', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Approval Required: All write operations require dry-run preview + explicit confirmation', bullet: { level: 0 }, spacing: { after: 300 } }),

      // API Services
      new Paragraph({ text: '3. Google Ads API Services Used', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Read Operations (90% of usage):', bold: true }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'CustomerService: listAccessibleCustomers(), getCustomer() - Account discovery and metadata', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'GoogleAdsService.search(): Campaign performance reports, keyword metrics, ad group stats', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'CampaignService: List campaigns, get campaign status and settings', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'CampaignBudgetService: List budgets, monitor daily spend', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'KeywordPlanIdeaService: generateKeywordIdeas() for keyword research', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'ConversionActionService: List conversion actions and performance', bullet: { level: 0 }, spacing: { after: 200 } }),

      new Paragraph({ children: [ new TextRun({ text: 'Write Operations (10% of usage, all require approval):', bold: true }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'CampaignBudgetService.mutateCampaignBudgets(): Update daily budgets', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'CampaignService.mutateCampaigns(): Update campaign status (pause/enable)', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'AdGroupCriterionService.mutateAdGroupCriteria(): Add keywords and negative keywords', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'ConversionUploadService.uploadClickConversions(): Import offline conversions', bullet: { level: 0 }, spacing: { after: 300 } }),

      // Expected Usage
      new Paragraph({ text: '4. Expected API Usage at Scale', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: 'Production Scale Projections (1,000 users, 5,000 managed accounts):', spacing: { after: 200 } }),

      new Paragraph({ text: 'Daily Automated Refresh: 5,000 accounts × 1 query/day = 5,000 operations', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'On-Demand Reporting: 1,000 users × 5 dashboards/day × 3 API calls = 15,000 operations', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Interactive Exploration: 1,000 users × 10 queries/day = 10,000 operations', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Keyword Research: 500 users × 2 queries/day = 1,000 operations', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Budget Updates: 200 updates/day × 2 calls (preview + execute) = 400 operations', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Campaign Management: 500 changes/day × 2 calls = 1,000 operations', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Account Discovery: 1,000 users × 1 call/day = 1,000 operations', bullet: { level: 0 }, spacing: { after: 200 } }),

      new Paragraph({ children: [ new TextRun({ text: 'Total Daily Operations: ~37,400 operations/day minimum', bold: true }) ], spacing: { after: 100 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Peak Production: 100,000-500,000 operations/day', bold: true }) ], spacing: { after: 100 } }),
      new Paragraph({ children: [ new TextRun({ text: 'This exceeds Basic tier (15K/day) and requires Standard Access.', bold: true, italics: true }) ], spacing: { after: 300 } }),

      // Tool Design
      new Paragraph({ text: '5. Tool Design and User Interface', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      
      new Paragraph({ children: [ new TextRun({ text: 'Dashboard List View:', bold: true, underline: {} }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'Grid layout displaying all dashboards accessible to practitioner. Each dashboard card shows: Dashboard name and description, Data sources (Google Ads + GSC + GA4 badges), Key metrics preview (Total Spend, Conversions, ROAS), Last updated timestamp, "View Dashboard" action button.', spacing: { after: 200 } }),
      new Paragraph({ text: 'Design: Clean card-based interface with WPP brand colors (navy #191D63), responsive grid layout, search and filter controls.', spacing: { after: 300 } }),

      new Paragraph({ children: [ new TextRun({ text: 'Performance Analytics Dashboard:', bold: true, underline: {} }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'Multi-page interactive dashboard with global filters:', spacing: { after: 100 } }),
      new Paragraph({ text: 'Page 1 "Overview": 4 scorecards (Total Spend $45,230 | Conversions 1,247 | ROAS 4.2x | Avg CPC $1.82), Line chart showing 90-day spend trend, Performance table listing top 10 campaigns', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Page 2 "Keywords": Table of top 100 keywords by clicks with Quality Score column, Bar chart showing Quality Score distribution, Search terms word cloud', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Page 3 "Devices & Geo": Stacked bar chart (Desktop vs Mobile vs Tablet performance), Geographic heatmap of conversions by country', bullet: { level: 0 }, spacing: { after: 200 } }),
      new Paragraph({ text: 'Design: ECharts visualizations, date range selector (Last 7/30/90 days), dimension filters (Device, Campaign, Country) in sidebar, export to PDF/CSV buttons.', spacing: { after: 300 } }),

      new Paragraph({ children: [ new TextRun({ text: 'Budget Update Approval Workflow:', bold: true, underline: {} }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'Modal dialog showing: Budget name "Q4 2025 Campaign Budget", Current value "$50.00/day", Proposed value "$75.00/day", Change indicator "+$25.00/day (+50%)", Monthly impact "+$760.00/month", Affected campaigns list (3 campaigns shown), Warning banner "Large increase - monitor performance closely", "Cancel" and "Confirm Update" buttons.', spacing: { after: 200 } }),
      new Paragraph({ text: 'Design: Yellow warning border for changes >20%, clear before/after comparison, financial impact prominently displayed, confirmation button disabled until preview reviewed.', spacing: { after: 300 } }),

      // Security
      new Paragraph({ text: '6. Security and Data Privacy', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: 'OAuth 2.0 Only: Every API call uses practitioner\'s OAuth token - we never use service accounts or API keys to access user data', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Permission Scoping: Google enforces access control - practitioners only see accounts they manage', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Multi-Tenant Isolation: All data tagged with workspace_id, filtered by Row-Level Security', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Audit Trail: Complete log of all operations with user identity, timestamp, and results', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Write Protection: Dry-run previews, confirmation tokens, financial impact warnings, bulk operation limits', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Data Retention: Compliant with GDPR and CCPA, user data deletable on request', bullet: { level: 0 }, spacing: { after: 300 } }),

      // Why Standard Access
      new Paragraph({ text: '7. Justification for Standard Access', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: 'WPP Media requires Standard Access (unlimited operations) for the following reasons:', spacing: { after: 200 } }),

      new Paragraph({ text: '1. Enterprise Scale: Supporting 1,000-10,000 practitioners managing 5,000-20,000 Google Ads accounts exceeds Basic tier capacity (15K ops/day)', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: '2. Daily Refresh Requirements: Automated data refresh for 5,000 accounts = 5,000+ operations/day before any user interactions', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: '3. Real-Time Analytics: Interactive dashboards require on-demand API queries for fresh data, cannot rely on cached/stale data', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: '4. Enterprise SLA: WPP clients (Fortune 500 companies) require 99.9% uptime - rate limits would cause unacceptable service interruptions', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: '5. Competitive Requirements: Competing enterprise BI platforms (Datorama, Tableau, Looker Studio) have unlimited API access', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: '6. Predictable Costs: Unlimited tier enables accurate cost forecasting for enterprise budgeting', bullet: { level: 0 }, spacing: { after: 300 } }),

      // Responsible Use
      new Paragraph({ text: '8. Responsible API Usage', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ text: 'WPP Media commits to responsible API usage through:', spacing: { after: 200 } }),

      new Paragraph({ text: 'Incremental Refresh: Only pull new/changed data (yesterday\'s metrics), not full historical re-pulls', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Smart Caching: Store data in BigQuery, serve dashboards from warehouse (not real-time API calls)', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Off-Peak Scheduling: Daily refresh runs at 2 AM UTC to avoid peak API load', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Deduplication: Multiple dashboards for same account share same BigQuery data (no redundant API calls)', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Rate Limiting: Internal rate limits prevent runaway scripts or accidental API abuse', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Monitoring: CloudWatch alerts for anomalous API usage patterns', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Pagination: Large result sets paginated to avoid excessive single-query loads', bullet: { level: 0 }, spacing: { after: 300 } }),

      // Timeline
      new Paragraph({ text: '9. Production Rollout Timeline', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Q4 2025 (Pilot): ', bold: true }), new TextRun('10-100 users, 5K-15K ops/day - Validate platform with early adopters') ], spacing: { after: 100 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Q1 2026 (Early Adoption): ', bold: true }), new TextRun('100-500 users, 30K-100K ops/day - Scale infrastructure and features') ], spacing: { after: 100 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Q2 2026+ (Full Production): ', bold: true }), new TextRun('1,000-10,000 users, 100K-500K ops/day - Enterprise-scale deployment') ], spacing: { after: 300 } }),

      // Contact
      new Paragraph({ text: '10. Contact Information', heading: HeadingLevel.HEADING_1, spacing: { before: 400, after: 200 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Technical Contact:', bold: true }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'Name: [Your Name - Update before submission]', indent: { left: 360 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Email: [Your Email - Update before submission]', indent: { left: 360 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Title: Lead Developer / Technical Architect', indent: { left: 360 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Organization: WPP Media', indent: { left: 360 }, spacing: { after: 300 } }),

      new Paragraph({ children: [ new TextRun({ text: 'Developer Token:', bold: true }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'Current Token: _rj-sEShX-fFZuMAIx3ouA (Test Access)', indent: { left: 360 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Requested Level: Standard Access (Unlimited Operations)', indent: { left: 360 }, spacing: { after: 400 } }),

      // Footer
      new Paragraph({ text: '---', border: { top: { color: '000000', space: 1, style: BorderStyle.SINGLE, size: 6 } }, spacing: { before: 600, after: 200 } }),
      new Paragraph({ children: [ new TextRun({ text: 'Important Notes:', bold: true }) ], spacing: { after: 100 } }),
      new Paragraph({ text: 'Internal Tool: This platform is exclusively for WPP internal use and will NOT be publicly accessible', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'User OAuth Only: 100% user credential authentication - we never access accounts without user permission', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Approval Workflows: All write operations require multi-step confirmation with impact preview', bullet: { level: 0 }, spacing: { after: 100 } }),
      new Paragraph({ text: 'Audit Compliance: Complete logging for SOC 2 and enterprise audit requirements', bullet: { level: 0 }, spacing: { after: 300 } }),

      new Paragraph({ text: 'For additional information or clarification, please contact the technical lead listed above.', spacing: { after: 200 } }),
    ],
  }],
  
  numbering: {
    config: [
      { reference: 'dataflow', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT }] },
      { reference: 'budget', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT }] },
      { reference: 'workflow', levels: [{ level: 0, format: 'decimal', text: '%1.', alignment: AlignmentType.LEFT }] },
    ],
  },
});

Packer.toBuffer(doc).then((buffer) => {
  fs.writeFileSync('/home/dogancanbaris/projects/MCP Servers/Google-Ads-API-Design-Document-WPP-Media.docx', buffer);
  console.log('✅ Document created: Google-Ads-API-Design-Document-WPP-Media.docx');
});
