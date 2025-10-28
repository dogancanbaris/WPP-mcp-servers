/**
 * Test script for multi-page dashboard creation
 *
 * Tests:
 * 1. Single-page dashboard (backward compatibility)
 * 2. Multi-page dashboard (new feature)
 * 3. Multi-page with page filters
 */

const { createDashboardFromTableTool } = require('./dist/wpp-analytics/tools/create-dashboard-from-table.js');

async function testSinglePage() {
  console.log('\n=== TEST 1: Single-Page Dashboard (Backward Compatibility) ===\n');

  const result = await createDashboardFromTableTool.handler({
    bigqueryTable: 'mcp-servers-475317.wpp_marketing.gsc_test_data',
    title: 'SEO Dashboard - Single Page',
    description: 'Test dashboard with single page layout',
    template: 'seo_overview',
    dateRange: ['2024-01-01', '2024-12-31'],
    platform: 'gsc',
    workspace_id: '945907d8-7e88-45c4-8fde-9db35d5f5ce2'
  });

  console.log('Result:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ Single-page dashboard created successfully');
    console.log(`Dashboard URL: ${result.dashboard_url}`);
  } else {
    console.log('❌ Single-page dashboard creation failed:', result.error);
  }

  return result;
}

async function testMultiPage() {
  console.log('\n=== TEST 2: Multi-Page Dashboard ===\n');

  const result = await createDashboardFromTableTool.handler({
    bigqueryTable: 'mcp-servers-475317.wpp_marketing.gsc_test_data',
    title: 'SEO Performance Dashboard - Multi Page',
    description: 'Comprehensive SEO analysis with multiple pages',
    dateRange: ['2024-01-01', '2024-12-31'],
    platform: 'gsc',
    workspace_id: '945907d8-7e88-45c4-8fde-9db35d5f5ce2',
    pages: [
      {
        name: 'Overview',
        template: 'seo_overview_summary'
      },
      {
        name: 'Query Analysis',
        template: 'seo_queries_detail'
      },
      {
        name: 'Page Performance',
        template: 'seo_pages_detail'
      }
    ]
  });

  console.log('Result:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ Multi-page dashboard created successfully');
    console.log(`Dashboard URL: ${result.dashboard_url}`);
  } else {
    console.log('❌ Multi-page dashboard creation failed:', result.error);
  }

  return result;
}

async function testMultiPageWithFilters() {
  console.log('\n=== TEST 3: Multi-Page Dashboard with Page Filters ===\n');

  const result = await createDashboardFromTableTool.handler({
    bigqueryTable: 'mcp-servers-475317.wpp_marketing.gsc_test_data',
    title: 'SEO Dashboard - Filtered Pages',
    description: 'Multi-page dashboard with page-specific filters',
    dateRange: ['2024-01-01', '2024-12-31'],
    platform: 'gsc',
    workspace_id: '945907d8-7e88-45c4-8fde-9db35d5f5ce2',
    pages: [
      {
        name: 'All Pages',
        template: 'seo_overview'
      },
      {
        name: 'High Traffic Pages',
        template: 'seo_pages_detail',
        filters: [
          { field: 'clicks', operator: 'gt', values: ['1000'] }
        ]
      },
      {
        name: 'Low Traffic Pages',
        template: 'seo_pages_detail',
        filters: [
          { field: 'clicks', operator: 'lt', values: ['100'] }
        ]
      }
    ]
  });

  console.log('Result:', JSON.stringify(result, null, 2));

  if (result.success) {
    console.log('✅ Multi-page dashboard with filters created successfully');
    console.log(`Dashboard URL: ${result.dashboard_url}`);
  } else {
    console.log('❌ Multi-page dashboard with filters creation failed:', result.error);
  }

  return result;
}

async function runTests() {
  console.log('🚀 Starting Multi-Page Dashboard Tests\n');
  console.log('=' .repeat(80));

  try {
    const result1 = await testSinglePage();
    const result2 = await testMultiPage();
    const result3 = await testMultiPageWithFilters();

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Test Summary\n');

    const results = [
      { name: 'Single-Page', success: result1.success },
      { name: 'Multi-Page', success: result2.success },
      { name: 'Multi-Page with Filters', success: result3.success }
    ];

    results.forEach(({ name, success }) => {
      console.log(`${success ? '✅' : '❌'} ${name}`);
    });

    const allPassed = results.every(r => r.success);
    console.log(`\n${allPassed ? '🎉 All tests passed!' : '⚠️  Some tests failed'}`);

  } catch (error) {
    console.error('\n❌ Test execution failed:', error);
    console.error(error.stack);
  }
}

// Check if required environment variables are set
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease set these in your .env file before running tests.');
  process.exit(1);
}

runTests();
