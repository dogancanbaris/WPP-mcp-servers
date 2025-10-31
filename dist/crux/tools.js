/**
 * MCP Tools for Chrome UX Report API operations
 */
import { getCruxClient } from './client.js';
import { validateCruxQuery, hasOrigin, hasUrl } from './validation.js';
import { getLogger } from '../shared/logger.js';
import { injectGuidance, formatNextSteps, } from '../shared/interactive-workflow.js';
const logger = getLogger('crux.tools');
/**
 * Helper: Categorize Core Web Vitals metric
 */
function categorizeCWV(metric, p75) {
    const thresholds = {
        lcp: { good: 2500, needsImprovement: 4000 }, // milliseconds
        inp: { good: 200, needsImprovement: 500 }, // milliseconds
        cls: { good: 0.1, needsImprovement: 0.25 }, // score
        fcp: { good: 1800, needsImprovement: 3000 }, // milliseconds
        ttfb: { good: 800, needsImprovement: 1800 }, // milliseconds
    };
    const threshold = thresholds[metric];
    if (!threshold) {
        return { category: 'Unknown', emoji: '❓' };
    }
    if (p75 <= threshold.good) {
        return { category: 'Good', emoji: '✅' };
    }
    else if (p75 <= threshold.needsImprovement) {
        return { category: 'Needs Improvement', emoji: '⚠️' };
    }
    else {
        return { category: 'Poor', emoji: '❌' };
    }
}
/**
 * Helper: Generate CWV insights from processed data
 */
function generateCWVInsights(data) {
    const insights = [];
    // LCP analysis
    if (data.lcp) {
        const lcpCat = categorizeCWV('lcp', data.lcp.p75);
        insights.push(`${lcpCat.emoji} **LCP (Largest Contentful Paint):** ${data.lcp.p75}ms - ${lcpCat.category}`);
        if (lcpCat.category === 'Poor') {
            insights.push('   → Focus: Optimize largest image/text rendering, reduce server response time');
        }
    }
    // INP analysis
    if (data.inp) {
        const inpCat = categorizeCWV('inp', data.inp.p75);
        insights.push(`${inpCat.emoji} **INP (Interaction to Next Paint):** ${data.inp.p75}ms - ${inpCat.category}`);
        if (inpCat.category === 'Poor') {
            insights.push('   → Focus: Reduce JavaScript execution time, optimize event handlers');
        }
    }
    // CLS analysis
    if (data.cls) {
        const clsCat = categorizeCWV('cls', data.cls.p75);
        insights.push(`${clsCat.emoji} **CLS (Cumulative Layout Shift):** ${data.cls.p75.toFixed(3)} - ${clsCat.category}`);
        if (clsCat.category === 'Poor') {
            insights.push('   → Focus: Set explicit sizes for images/ads, avoid dynamic content injection');
        }
    }
    // FCP analysis
    if (data.fcp) {
        const fcpCat = categorizeCWV('fcp', data.fcp.p75);
        insights.push(`${fcpCat.emoji} **FCP (First Contentful Paint):** ${data.fcp.p75}ms - ${fcpCat.category}`);
    }
    // TTFB analysis
    if (data.ttfb) {
        const ttfbCat = categorizeCWV('ttfb', data.ttfb.p75);
        insights.push(`${ttfbCat.emoji} **TTFB (Time to First Byte):** ${data.ttfb.p75}ms - ${ttfbCat.category}`);
    }
    // Distribution summary
    if (data.lcp) {
        insights.push('\n📊 **User Experience Distribution:**');
        insights.push(`   • Good: ${data.lcp.good.toFixed(1)}% of users`);
        insights.push(`   • Needs Improvement: ${data.lcp.needsImprovement.toFixed(1)}% of users`);
        insights.push(`   • Poor: ${data.lcp.poor.toFixed(1)}% of users`);
    }
    // Collection period
    if (data.collectionPeriod) {
        insights.push(`\n📅 **Data Collection Period:** ${data.collectionPeriod.start} to ${data.collectionPeriod.end}`);
    }
    return insights.join('\n');
}
/**
 * Helper: Compare form factor results
 */
function compareFormFactors(results) {
    const insights = [];
    const devices = ['DESKTOP', 'PHONE', 'TABLET'];
    const metricsToCompare = [
        { key: 'lcp', name: 'LCP', unit: 'ms' },
        { key: 'inp', name: 'INP', unit: 'ms' },
        { key: 'cls', name: 'CLS', unit: '' },
    ];
    for (const metric of metricsToCompare) {
        const values = [];
        for (const device of devices) {
            const deviceData = results[device];
            if (deviceData && !deviceData.error && deviceData[metric.key]) {
                const p75 = deviceData[metric.key].p75;
                const cat = categorizeCWV(metric.key, p75);
                values.push({ device, p75, category: cat.category });
            }
        }
        if (values.length > 0) {
            // Sort by p75 (best to worst)
            const sorted = [...values].sort((a, b) => {
                if (metric.key === 'cls') {
                    return a.p75 - b.p75; // Lower is better
                }
                return a.p75 - b.p75; // Lower is better for all metrics
            });
            insights.push(`\n**${metric.name} Comparison:**`);
            sorted.forEach((v, i) => {
                const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉';
                const value = metric.key === 'cls' ? v.p75.toFixed(3) : `${v.p75}${metric.unit}`;
                insights.push(`   ${emoji} ${v.device}: ${value} (${v.category})`);
            });
            // Best device
            if (sorted.length > 1) {
                insights.push(`   → Best: ${sorted[0].device}`);
            }
        }
    }
    return insights.join('\n');
}
/**
 * Get Core Web Vitals for an origin (entire domain)
 */
export const getCoreWebVitalsOriginTool = {
    name: 'get_core_web_vitals_origin',
    description: 'Get Core Web Vitals metrics (LCP, INP, CLS) for an entire origin/domain.',
    inputSchema: {
        type: 'object',
        properties: {
            origin: {
                type: 'string',
                description: 'Origin URL (e.g., https://keepersdigital.com)',
            },
            formFactor: {
                type: 'string',
                enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
                description: 'Device type to query. Defaults to ALL (aggregated across all devices)',
            },
        },
        required: ['origin'],
    },
    async handler(input) {
        try {
            // Input guidance
            if (!input.origin) {
                return injectGuidance({}, `🌐 CORE WEB VITALS CHECK - ORIGIN

Please provide:
- **origin:** Domain URL (e.g., "https://example.com")

**Optional:**
- **formFactor:** Device type (PHONE, TABLET, DESKTOP, or ALL)
  Default: ALL (aggregated across all devices)

**What You'll Get:**
• LCP (Largest Contentful Paint) - Loading performance
• INP (Interaction to Next Paint) - Interactivity
• CLS (Cumulative Layout Shift) - Visual stability
• Distribution: % of users with Good/Needs Improvement/Poor experience

What origin would you like to check?`);
            }
            validateCruxQuery(input);
            const client = getCruxClient();
            logger.info('Querying CWV for origin', { origin: input.origin, formFactor: input.formFactor });
            const response = await client.queryRecord({
                origin: input.origin,
                ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
            });
            const processed = client.processCWVData(response);
            // Generate rich insights
            const insights = generateCWVInsights(processed);
            return injectGuidance({
                origin: input.origin,
                formFactor: input.formFactor || 'ALL',
                ...processed,
            }, `🌐 CORE WEB VITALS - ${input.origin}
**Device:** ${input.formFactor || 'ALL'}

${insights}

💡 **WHAT THIS MEANS:**
- **Good (✅):** Fast, responsive experience for users
- **Needs Improvement (⚠️):** Moderate performance, consider optimization
- **Poor (❌):** Slow experience, urgent optimization needed

${formatNextSteps([
                'Check specific page: use get_core_web_vitals_url',
                'View historical trends: use get_cwv_history_origin',
                'Compare devices: use compare_cwv_form_factors',
                'Optimize images/JavaScript based on insights above',
            ])}`);
        }
        catch (error) {
            logger.error('Failed to get CWV for origin', error);
            throw error;
        }
    },
};
/**
 * Get Core Web Vitals for a specific URL
 */
export const getCoreWebVitalsUrlTool = {
    name: 'get_core_web_vitals_url',
    description: 'Get Core Web Vitals metrics for a specific page URL.',
    inputSchema: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                description: 'Full page URL (e.g., https://keepersdigital.com/about)',
            },
            formFactor: {
                type: 'string',
                enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
                description: 'Device type to query. Defaults to ALL',
            },
        },
        required: ['url'],
    },
    async handler(input) {
        try {
            // Input guidance
            if (!input.url) {
                return injectGuidance({}, `📄 CORE WEB VITALS CHECK - SPECIFIC PAGE

Please provide:
- **url:** Full page URL (e.g., "https://example.com/about")

**Optional:**
- **formFactor:** Device type (PHONE, TABLET, DESKTOP, or ALL)
  Default: ALL (aggregated across all devices)

**What You'll Get:**
• LCP (Largest Contentful Paint) - Loading performance
• INP (Interaction to Next Paint) - Interactivity
• CLS (Cumulative Layout Shift) - Visual stability
• Distribution: % of users with Good/Needs Improvement/Poor experience

**Note:** Page must have sufficient traffic to appear in CrUX database.

What URL would you like to check?`);
            }
            validateCruxQuery(input);
            const client = getCruxClient();
            logger.info('Querying CWV for URL', { url: input.url, formFactor: input.formFactor });
            const response = await client.queryRecord({
                url: input.url,
                ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
            });
            const processed = client.processCWVData(response);
            // Generate rich insights
            const insights = generateCWVInsights(processed);
            return injectGuidance({
                url: input.url,
                formFactor: input.formFactor || 'ALL',
                ...processed,
            }, `📄 CORE WEB VITALS - ${input.url}
**Device:** ${input.formFactor || 'ALL'}

${insights}

💡 **WHAT THIS MEANS:**
- **Good (✅):** Fast, responsive experience for users
- **Needs Improvement (⚠️):** Moderate performance, consider optimization
- **Poor (❌):** Slow experience, urgent optimization needed

${formatNextSteps([
                'Check entire domain: use get_core_web_vitals_origin',
                'View historical trends: use get_cwv_history_url',
                'Compare devices: use compare_cwv_form_factors',
                'Optimize this specific page based on insights above',
            ])}`);
        }
        catch (error) {
            logger.error('Failed to get CWV for URL', error);
            throw error;
        }
    },
};
/**
 * Get historical Core Web Vitals for an origin
 */
export const getCwvHistoryOriginTool = {
    name: 'get_cwv_history_origin',
    description: 'Get historical Core Web Vitals data for an origin over time.',
    inputSchema: {
        type: 'object',
        properties: {
            origin: {
                type: 'string',
                description: 'Origin URL (e.g., https://keepersdigital.com)',
            },
            formFactor: {
                type: 'string',
                enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
                description: 'Device type to query. Defaults to ALL',
            },
        },
        required: ['origin'],
    },
    async handler(input) {
        try {
            // Input guidance
            if (!input.origin) {
                return injectGuidance({}, `📈 CORE WEB VITALS HISTORY - ORIGIN

Please provide:
- **origin:** Domain URL (e.g., "https://example.com")

**Optional:**
- **formFactor:** Device type (PHONE, TABLET, DESKTOP, or ALL)
  Default: ALL (aggregated across all devices)

**What You'll Get:**
• Historical data showing how CWV metrics changed over time
• Multiple collection periods (typically weekly snapshots)
• Trend analysis: improving, declining, or stable performance

**Use Case:**
- Track performance improvements after optimization
- Identify when performance degraded
- Monitor long-term trends

What origin would you like to analyze?`);
            }
            validateCruxQuery(input);
            const client = getCruxClient();
            logger.info('Querying CWV history for origin', { origin: input.origin, formFactor: input.formFactor });
            const response = await client.queryHistoryRecord({
                origin: input.origin,
                ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
            });
            // Analyze trends
            const collectionPeriods = response.record.collectionPeriods || [];
            const numPeriods = collectionPeriods.length;
            let trendAnalysis = '';
            if (numPeriods > 0) {
                trendAnalysis = `\n📊 **TREND ANALYSIS:**
   • Total collection periods: ${numPeriods}
   • Date range: ${collectionPeriods[0]?.firstDate ? `${collectionPeriods[0].firstDate.year}-${String(collectionPeriods[0].firstDate.month).padStart(2, '0')}-${String(collectionPeriods[0].firstDate.day).padStart(2, '0')}` : 'N/A'} to ${collectionPeriods[numPeriods - 1]?.lastDate ? `${collectionPeriods[numPeriods - 1].lastDate.year}-${String(collectionPeriods[numPeriods - 1].lastDate.month).padStart(2, '0')}-${String(collectionPeriods[numPeriods - 1].lastDate.day).padStart(2, '0')}` : 'N/A'}

💡 **WHAT TO LOOK FOR:**
   • Are metrics improving (LCP/INP decreasing, CLS stable)?
   • Any sudden performance drops? (May indicate deployment issues)
   • Consistent good performance? (Keep monitoring for regressions)`;
            }
            return injectGuidance({
                origin: input.origin,
                formFactor: input.formFactor || 'ALL',
                history: response.record,
                collectionPeriods: response.record.collectionPeriods,
            }, `📈 CORE WEB VITALS HISTORY - ${input.origin}
**Device:** ${input.formFactor || 'ALL'}
${trendAnalysis}

**Historical Data:** ${numPeriods} collection periods included in response data.

${formatNextSteps([
                'Check current performance: use get_core_web_vitals_origin',
                'Compare across devices: use compare_cwv_form_factors',
                'Analyze specific page trends: use get_cwv_history_url',
                'Visualize trends in a dashboard for easier analysis',
            ])}`);
        }
        catch (error) {
            logger.error('Failed to get CWV history for origin', error);
            throw error;
        }
    },
};
/**
 * Get historical Core Web Vitals for a specific URL
 */
export const getCwvHistoryUrlTool = {
    name: 'get_cwv_history_url',
    description: 'Get historical Core Web Vitals data for a specific page over time.',
    inputSchema: {
        type: 'object',
        properties: {
            url: {
                type: 'string',
                description: 'Full page URL (e.g., https://keepersdigital.com/about)',
            },
            formFactor: {
                type: 'string',
                enum: ['PHONE', 'TABLET', 'DESKTOP', 'ALL'],
                description: 'Device type to query. Defaults to ALL',
            },
        },
        required: ['url'],
    },
    async handler(input) {
        try {
            // Input guidance
            if (!input.url) {
                return injectGuidance({}, `📈 CORE WEB VITALS HISTORY - SPECIFIC PAGE

Please provide:
- **url:** Full page URL (e.g., "https://example.com/about")

**Optional:**
- **formFactor:** Device type (PHONE, TABLET, DESKTOP, or ALL)
  Default: ALL (aggregated across all devices)

**What You'll Get:**
• Historical data showing how this page's CWV metrics changed over time
• Multiple collection periods (typically weekly snapshots)
• Trend analysis: improving, declining, or stable performance

**Use Case:**
- Track performance after page-specific optimization
- Identify when this page's performance degraded
- Compare before/after deployment changes

**Note:** Page must have sufficient traffic to appear in CrUX database.

What URL would you like to analyze?`);
            }
            validateCruxQuery(input);
            const client = getCruxClient();
            logger.info('Querying CWV history for URL', { url: input.url, formFactor: input.formFactor });
            const response = await client.queryHistoryRecord({
                url: input.url,
                ...(input.formFactor && input.formFactor !== 'ALL' ? { formFactor: input.formFactor } : {}),
            });
            // Analyze trends
            const collectionPeriods = response.record.collectionPeriods || [];
            const numPeriods = collectionPeriods.length;
            let trendAnalysis = '';
            if (numPeriods > 0) {
                trendAnalysis = `\n📊 **TREND ANALYSIS:**
   • Total collection periods: ${numPeriods}
   • Date range: ${collectionPeriods[0]?.firstDate ? `${collectionPeriods[0].firstDate.year}-${String(collectionPeriods[0].firstDate.month).padStart(2, '0')}-${String(collectionPeriods[0].firstDate.day).padStart(2, '0')}` : 'N/A'} to ${collectionPeriods[numPeriods - 1]?.lastDate ? `${collectionPeriods[numPeriods - 1].lastDate.year}-${String(collectionPeriods[numPeriods - 1].lastDate.month).padStart(2, '0')}-${String(collectionPeriods[numPeriods - 1].lastDate.day).padStart(2, '0')}` : 'N/A'}

💡 **WHAT TO LOOK FOR:**
   • Did recent optimizations improve metrics?
   • Any performance regressions after deployments?
   • Seasonal patterns (e.g., slower during high traffic periods)?`;
            }
            return injectGuidance({
                url: input.url,
                formFactor: input.formFactor || 'ALL',
                history: response.record,
                collectionPeriods: response.record.collectionPeriods,
            }, `📈 CORE WEB VITALS HISTORY - ${input.url}
**Device:** ${input.formFactor || 'ALL'}
${trendAnalysis}

**Historical Data:** ${numPeriods} collection periods included in response data.

${formatNextSteps([
                'Check current performance: use get_core_web_vitals_url',
                'Compare with domain average: use get_cwv_history_origin',
                'Compare across devices: use compare_cwv_form_factors',
                'Visualize trends over time in a dashboard',
            ])}`);
        }
        catch (error) {
            logger.error('Failed to get CWV history for URL', error);
            throw error;
        }
    },
};
/**
 * Compare Core Web Vitals across form factors
 */
export const compareCwvFormFactorsTool = {
    name: 'compare_cwv_form_factors',
    description: 'Compare Core Web Vitals across different device types (desktop, mobile, tablet).',
    inputSchema: {
        type: 'object',
        properties: {
            origin: {
                type: 'string',
                description: 'Origin URL (e.g., https://keepersdigital.com)',
            },
            url: {
                type: 'string',
                description: 'Full page URL (alternative to origin)',
            },
        },
    },
    async handler(input) {
        try {
            // Input guidance
            if (!hasOrigin(input) && !hasUrl(input)) {
                return injectGuidance({}, `📱 COMPARE CORE WEB VITALS ACROSS DEVICES

Please provide ONE of the following:
- **origin:** Domain URL (e.g., "https://example.com")
  OR
- **url:** Specific page URL (e.g., "https://example.com/about")

**What You'll Get:**
• Side-by-side comparison of Desktop, Phone, and Tablet performance
• LCP, INP, and CLS metrics for each device type
• Which device has best/worst performance
• Device-specific optimization recommendations

**Use Case:**
- Identify if mobile performance lags behind desktop
- Prioritize which device experience to optimize first
- Validate that optimizations work across all devices

What would you like to compare?`);
            }
            const client = getCruxClient();
            const formFactors = ['DESKTOP', 'PHONE', 'TABLET'];
            const results = {
                target: input.origin || input.url,
                comparison: {},
            };
            logger.info('Comparing CWV across form factors', {
                origin: input.origin,
                url: input.url,
            });
            for (const formFactor of formFactors) {
                try {
                    const response = await client.queryRecord({
                        origin: input.origin,
                        url: input.url,
                        formFactor,
                    });
                    const processed = client.processCWVData(response);
                    results.comparison[formFactor] = processed;
                }
                catch (error) {
                    // Some form factors might not have data
                    results.comparison[formFactor] = {
                        error: error.message,
                    };
                }
            }
            // Generate comparison insights
            const comparisonInsights = compareFormFactors(results.comparison);
            // Count available devices
            const availableDevices = Object.keys(results.comparison).filter((device) => !results.comparison[device].error);
            return injectGuidance({
                ...results,
            }, `📱 DEVICE COMPARISON - ${results.target}

**Available Data:** ${availableDevices.length} device types (${availableDevices.join(', ')})
${comparisonInsights}

💡 **INTERPRETATION:**
- Lower values are better for LCP/INP (faster response)
- Lower CLS is better (more stable layout)
- 🥇 = Best device performance
- 🥈🥉 = Good but not the best

⚠️ **COMMON PATTERNS:**
- Mobile often slower than Desktop (smaller screen, network variability)
- If mobile has poor CLS: Check responsive design, avoid layout shifts
- If desktop has poor LCP: Check large images, render-blocking resources

${formatNextSteps([
                'Check individual device details: use get_core_web_vitals_origin with formFactor',
                'View historical trends: use get_cwv_history_origin',
                'Optimize slowest device first (highest impact)',
                'Test responsive design on actual devices',
            ])}`);
        }
        catch (error) {
            logger.error('Failed to compare CWV across form factors', error);
            throw error;
        }
    },
};
/**
 * Export all CrUX tools
 */
export const cruxTools = [
    getCoreWebVitalsOriginTool,
    getCoreWebVitalsUrlTool,
    getCwvHistoryOriginTool,
    getCwvHistoryUrlTool,
    compareCwvFormFactorsTool,
];
//# sourceMappingURL=tools.js.map