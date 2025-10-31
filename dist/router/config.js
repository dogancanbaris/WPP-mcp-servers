/**
 * Configuration loader for MCP Router
 */
import { getLogger } from '../shared/logger.js';
const logger = getLogger('router.config');
/**
 * Load backend configurations from environment variables
 */
export function loadBackendConfigs() {
    const configs = [];
    // Google Marketing Backend (existing)
    if (process.env.GOOGLE_BACKEND_URL || process.env.ENABLE_GOOGLE !== 'false') {
        configs.push({
            name: 'google-marketing',
            url: process.env.GOOGLE_BACKEND_URL || 'http://localhost:3100/mcp',
            prefix: 'google',
            description: 'Google Marketing ecosystem: Search Console, Ads, Analytics, CrUX, Business Profile, BigQuery',
            active: process.env.ENABLE_GOOGLE !== 'false', // Active by default
            timeout: parseInt(process.env.GOOGLE_BACKEND_TIMEOUT || '30000'),
        });
    }
    // WPP Analytics Platform Backend (existing)
    if (process.env.WPP_ANALYTICS_URL || process.env.ENABLE_WPP_ANALYTICS !== 'false') {
        configs.push({
            name: 'wpp-analytics',
            url: process.env.WPP_ANALYTICS_URL || 'http://localhost:3104/mcp',
            prefix: 'wpp',
            description: 'WPP Analytics Platform: Dashboard creation, data ingestion, insights',
            active: process.env.ENABLE_WPP_ANALYTICS !== 'false',
            timeout: parseInt(process.env.WPP_ANALYTICS_TIMEOUT || '30000'),
        });
    }
    // Social Media Backend (new - Meta, X, TikTok)
    if (process.env.SOCIAL_MEDIA_URL && process.env.ENABLE_SOCIAL_MEDIA === 'true') {
        configs.push({
            name: 'social-media',
            url: process.env.SOCIAL_MEDIA_URL,
            prefix: 'social',
            description: 'Social Media Advertising: Meta (Facebook/Instagram), X (Twitter), TikTok',
            active: true,
            timeout: parseInt(process.env.SOCIAL_MEDIA_TIMEOUT || '30000'),
        });
    }
    // Amazon Backend (new - Ads + SP-API)
    if (process.env.AMAZON_URL && process.env.ENABLE_AMAZON === 'true') {
        configs.push({
            name: 'amazon',
            url: process.env.AMAZON_URL,
            prefix: 'amazon',
            description: 'Amazon ecosystem: Amazon Ads (Sponsored Products/Brands/Display), Seller/Vendor Central (SP-API)',
            active: true,
            timeout: parseInt(process.env.AMAZON_TIMEOUT || '30000'),
        });
    }
    // Microsoft Backend (new - MS Ads + Bing Webmaster)
    if (process.env.MICROSOFT_URL && process.env.ENABLE_MICROSOFT === 'true') {
        configs.push({
            name: 'microsoft',
            url: process.env.MICROSOFT_URL,
            prefix: 'microsoft',
            description: 'Microsoft ecosystem: Microsoft Advertising (Bing Ads), Bing Webmaster Tools (organic search)',
            active: true,
            timeout: parseInt(process.env.MICROSOFT_TIMEOUT || '30000'),
        });
    }
    logger.info(`Loaded ${configs.length} backend configurations`, {
        backends: configs.map((c) => ({ name: c.name, active: c.active })),
    });
    return configs;
}
/**
 * Load router configuration from environment
 */
export function loadRouterConfig() {
    const transport = (process.env.MCP_TRANSPORT || 'both');
    return {
        httpPort: parseInt(process.env.ROUTER_PORT || process.env.PORT || '3000'),
        transport,
        refreshInterval: parseInt(process.env.ROUTER_REFRESH_INTERVAL || '0'), // 0 = disabled, manual refresh only
        healthCheckEnabled: process.env.ROUTER_HEALTH_CHECK_ENABLED === 'true',
        healthCheckInterval: parseInt(process.env.ROUTER_HEALTH_CHECK_INTERVAL || '60000'), // 1 minute
    };
}
/**
 * Validate backend configuration
 */
export function validateBackendConfig(config) {
    const errors = [];
    if (!config.name) {
        errors.push('Backend name is required');
    }
    if (!config.url) {
        errors.push('Backend URL is required');
    }
    if (!config.prefix) {
        errors.push('Backend prefix is required');
    }
    // Validate URL format
    try {
        new URL(config.url);
    }
    catch {
        errors.push(`Invalid backend URL: ${config.url}`);
    }
    // Validate prefix format (alphanumeric, underscores, hyphens)
    if (!/^[a-z0-9_-]+$/i.test(config.prefix)) {
        errors.push(`Invalid prefix format: ${config.prefix}. Use alphanumeric, underscores, or hyphens.`);
    }
    return errors;
}
//# sourceMappingURL=config.js.map