/**
 * Tool Categorization for Smart Discovery
 *
 * Organizes all 98 Google marketing tools into logical categories
 * for efficient searching and discovery via meta-tools.
 */
/**
 * Complete tool categorization
 */
export const toolCategories = {
    // ============================================================================
    // GOOGLE SEARCH CONSOLE (8 tools)
    // ============================================================================
    'gsc.properties': {
        name: 'GSC Properties',
        description: 'Manage Search Console properties',
        platform: 'Google Search Console',
        tools: [
            'list_properties',
            'get_property',
            'add_property'
        ]
    },
    'gsc.analytics': {
        name: 'GSC Search Analytics',
        description: 'Search traffic data and performance',
        platform: 'Google Search Console',
        tools: [
            'query_search_analytics'
        ]
    },
    'gsc.sitemaps': {
        name: 'GSC Sitemaps',
        description: 'Sitemap management and submission',
        platform: 'Google Search Console',
        tools: [
            'list_sitemaps',
            'get_sitemap',
            'submit_sitemap',
            'delete_sitemap'
        ]
    },
    'gsc.indexing': {
        name: 'GSC Indexing',
        description: 'URL inspection and indexing status',
        platform: 'Google Search Console',
        tools: [
            'inspect_url'
        ]
    },
    // ============================================================================
    // GOOGLE ADS (59 tools)
    // ============================================================================
    'ads.accounts': {
        name: 'Google Ads Accounts',
        description: 'Account access and management',
        platform: 'Google Ads',
        tools: [
            'list_accessible_accounts',
            'get_account_info'
        ]
    },
    'ads.campaigns': {
        name: 'Campaign Management',
        description: 'Create, update, and manage campaigns',
        platform: 'Google Ads',
        tools: [
            'create_campaign',
            'list_campaigns',
            'update_campaign_status',
            'get_campaign_performance'
        ]
    },
    'ads.ad_groups': {
        name: 'Ad Group Management',
        description: 'Create and manage ad groups',
        platform: 'Google Ads',
        tools: [
            'create_ad_group',
            'update_ad_group',
            'list_ad_groups',
            'get_ad_group_quality_score',
            'update_ad_group_bid_modifier'
        ]
    },
    'ads.keywords': {
        name: 'Keyword Management',
        description: 'Add, remove, and optimize keywords',
        platform: 'Google Ads',
        tools: [
            'add_keywords',
            'remove_keywords',
            'list_keywords',
            'update_keyword',
            'pause_keyword',
            'set_keyword_bid',
            'update_keyword_match_type',
            'get_keyword_performance'
        ]
    },
    'ads.negative_keywords': {
        name: 'Negative Keyword Management',
        description: 'Manage negative keywords to control ad serving',
        platform: 'Google Ads',
        tools: [
            'add_negative_keywords',
            'remove_negative_keywords'
        ]
    },
    'ads.keyword_research': {
        name: 'Keyword Research',
        description: 'Generate keyword ideas and search terms',
        platform: 'Google Ads',
        tools: [
            'generate_keyword_ideas',
            'get_search_terms_report'
        ]
    },
    'ads.ads': {
        name: 'Ad Management',
        description: 'Create and manage responsive search ads',
        platform: 'Google Ads',
        tools: [
            'create_ad',
            'update_ad',
            'pause_ad',
            'list_ads',
            'get_ad_performance'
        ]
    },
    'ads.budgets': {
        name: 'Budget Management',
        description: 'Create and modify campaign budgets',
        platform: 'Google Ads',
        tools: [
            'create_budget',
            'update_budget',
            'list_budgets'
        ]
    },
    'ads.bidding': {
        name: 'Bidding Strategies',
        description: 'Portfolio bidding and bid management',
        platform: 'Google Ads',
        tools: [
            'list_bidding_strategies',
            'create_portfolio_bidding_strategy',
            'update_bidding_strategy',
            'set_ad_group_cpc_bid'
        ]
    },
    'ads.bid_modifiers': {
        name: 'Bid Modifiers',
        description: 'Adjust bids by device, location, demographics, schedule',
        platform: 'Google Ads',
        tools: [
            'create_device_bid_modifier',
            'create_location_bid_modifier',
            'create_demographic_bid_modifier',
            'create_ad_schedule_bid_modifier'
        ]
    },
    'ads.targeting': {
        name: 'Campaign Targeting',
        description: 'Geographic, demographic, and audience targeting',
        platform: 'Google Ads',
        tools: [
            'add_location_criteria',
            'add_language_criteria',
            'add_demographic_criteria',
            'add_audience_criteria',
            'set_ad_schedule'
        ]
    },
    'ads.conversions': {
        name: 'Conversion Tracking',
        description: 'Manage conversion actions and upload conversions',
        platform: 'Google Ads',
        tools: [
            'list_conversion_actions',
            'get_conversion_action',
            'create_conversion_action',
            'upload_click_conversions',
            'upload_conversion_adjustments'
        ]
    },
    'ads.audiences': {
        name: 'Audience Management',
        description: 'Remarketing lists and customer match',
        platform: 'Google Ads',
        tools: [
            'list_user_lists',
            'create_user_list',
            'upload_customer_match_list',
            'create_audience'
        ]
    },
    'ads.assets': {
        name: 'Ad Assets',
        description: 'Images, videos, and media assets',
        platform: 'Google Ads',
        tools: [
            'list_assets'
        ]
    },
    'ads.extensions': {
        name: 'Ad Extensions',
        description: 'Sitelinks, callouts, and structured snippets',
        platform: 'Google Ads',
        tools: [
            'list_ad_extensions'
        ]
    },
    'ads.reporting': {
        name: 'Google Ads Reporting',
        description: 'Performance metrics and custom reports',
        platform: 'Google Ads',
        tools: [
            'get_campaign_performance',
            'get_ad_group_performance',
            'get_ad_performance',
            'get_keyword_performance',
            'run_custom_report'
        ]
    },
    // ============================================================================
    // GOOGLE ANALYTICS 4 (11 tools)
    // ============================================================================
    'analytics.accounts': {
        name: 'GA4 Account Management',
        description: 'List and manage GA4 accounts and properties',
        platform: 'Google Analytics 4',
        tools: [
            'list_analytics_accounts',
            'list_analytics_properties',
            'list_data_streams'
        ]
    },
    'analytics.reporting': {
        name: 'GA4 Reporting',
        description: 'Custom reports and real-time data',
        platform: 'Google Analytics 4',
        tools: [
            'run_analytics_report',
            'get_realtime_users'
        ]
    },
    'analytics.configuration': {
        name: 'GA4 Configuration',
        description: 'Create properties, streams, and custom definitions',
        platform: 'Google Analytics 4',
        tools: [
            'create_analytics_property',
            'create_data_stream',
            'create_custom_dimension',
            'create_custom_metric',
            'create_conversion_event',
            'create_google_ads_link'
        ]
    },
    // ============================================================================
    // CORE WEB VITALS (5 tools)
    // ============================================================================
    'crux.vitals': {
        name: 'Core Web Vitals',
        description: 'LCP, INP, CLS metrics from Chrome UX Report',
        platform: 'Chrome UX Report',
        tools: [
            'get_core_web_vitals_origin',
            'get_core_web_vitals_url',
            'get_cwv_history_origin',
            'get_cwv_history_url',
            'compare_cwv_form_factors'
        ]
    },
    // ============================================================================
    // GOOGLE BUSINESS PROFILE (3 tools)
    // ============================================================================
    'business.locations': {
        name: 'Business Locations',
        description: 'Manage Google Business Profile locations',
        platform: 'Google Business Profile',
        tools: [
            'list_business_locations',
            'get_business_location',
            'update_business_location'
        ]
    },
    // ============================================================================
    // BIGQUERY (3 tools)
    // ============================================================================
    'bigquery.data': {
        name: 'BigQuery Data',
        description: 'Query and manage BigQuery datasets',
        platform: 'BigQuery',
        tools: [
            'list_bigquery_datasets',
            'create_bigquery_dataset',
            'run_bigquery_query'
        ]
    },
    // ============================================================================
    // SERP API (1 tool)
    // ============================================================================
    'serp.search': {
        name: 'SERP Data',
        description: 'Get Google search results for rank tracking',
        platform: 'SERP API',
        tools: [
            'search_google'
        ]
    },
    // ============================================================================
    // WPP ANALYTICS PLATFORM (7 tools)
    // ============================================================================
    'wpp.dashboards': {
        name: 'Dashboard Management',
        description: 'Create, read, update, delete dashboards',
        platform: 'WPP Analytics',
        tools: [
            'create_dashboard',
            'get_dashboard',
            'list_dashboards',
            'update_dashboard_layout',
            'delete_dashboard',
            'list_dashboard_templates'
        ]
    },
    'wpp.data': {
        name: 'Data Integration',
        description: 'Pull platform data to BigQuery and create dashboards',
        platform: 'WPP Analytics',
        tools: [
            'push_platform_data_to_bigquery',
            'create_dashboard_from_table',
            'analyze_gsc_data_for_insights',
            'list_datasets'
        ]
    }
};
/**
 * Platform mapping for quick filtering
 */
export const platformMap = {
    'google-search-console': ['gsc.properties', 'gsc.analytics', 'gsc.sitemaps', 'gsc.indexing'],
    'google-ads': ['ads.accounts', 'ads.campaigns', 'ads.ad_groups', 'ads.keywords', 'ads.negative_keywords', 'ads.keyword_research', 'ads.ads', 'ads.budgets', 'ads.bidding', 'ads.bid_modifiers', 'ads.targeting', 'ads.conversions', 'ads.audiences', 'ads.assets', 'ads.extensions', 'ads.reporting'],
    'google-analytics': ['analytics.accounts', 'analytics.reporting', 'analytics.configuration'],
    'core-web-vitals': ['crux.vitals'],
    'google-business': ['business.locations'],
    'bigquery': ['bigquery.data'],
    'serp': ['serp.search'],
    'wpp-analytics': ['wpp.dashboards', 'wpp.data']
};
/**
 * Search tools by keyword
 */
export function searchToolsByKeyword(query) {
    const lowerQuery = query.toLowerCase();
    const results = new Set();
    for (const category of Object.values(toolCategories)) {
        // Search in category name and description
        if (category.name.toLowerCase().includes(lowerQuery) ||
            category.description.toLowerCase().includes(lowerQuery)) {
            category.tools.forEach(t => results.add(t));
        }
        // Search in individual tool names
        category.tools.forEach(tool => {
            if (tool.toLowerCase().includes(lowerQuery)) {
                results.add(tool);
            }
        });
    }
    return Array.from(results);
}
/**
 * Get tools by category key
 */
export function getToolsByCategory(categoryKey) {
    const category = toolCategories[categoryKey];
    return category ? category.tools : [];
}
/**
 * Get tools by platform
 */
export function getToolsByPlatform(platform) {
    const categoryKeys = platformMap[platform] || [];
    const tools = [];
    for (const key of categoryKeys) {
        const category = toolCategories[key];
        if (category) {
            tools.push(...category.tools);
        }
    }
    return tools;
}
/**
 * Get all categories for discovery
 */
export function getAllCategories() {
    return Object.entries(toolCategories).map(([key, category]) => ({
        key,
        category
    }));
}
/**
 * Find which category a tool belongs to
 */
export function findCategoryForTool(toolName) {
    for (const [key, category] of Object.entries(toolCategories)) {
        if (category.tools.includes(toolName)) {
            return key;
        }
    }
    return null;
}
//# sourceMappingURL=tool-categories.js.map