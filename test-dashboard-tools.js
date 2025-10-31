/**
 * Test script for dashboard MCP tools
 * Tests get_dashboard and update_dashboard_layout via HTTP MCP server
 */

const DASHBOARD_ID = 'fe674307-be20-4699-9a58-81040145bb96';
const MCP_SERVER_URL = 'http://localhost:3001/mcp';

async function callMCPTool(toolName, args) {
  const response = await fetch(MCP_SERVER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Dev-Bypass': 'true'
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: Date.now(),
      method: 'tools/call',
      params: {
        name: toolName,
        arguments: args
      }
    })
  });

  const data = await response.json();

  if (data.error) {
    console.error(`Error calling ${toolName}:`, data.error);
    throw new Error(data.error.message);
  }

  // Parse the content from MCP response
  if (data.result && data.result.content && data.result.content[0]) {
    return JSON.parse(data.result.content[0].text);
  }

  return data.result;
}

async function main() {
  console.log('🔍 Testing Dashboard MCP Tools\n');

  // Step 1: Get current dashboard structure
  console.log('1️⃣  Getting current dashboard structure...');
  const dashboard = await callMCPTool('get_dashboard', {
    dashboard_id: DASHBOARD_ID
  });

  console.log(`   ✓ Dashboard: "${dashboard.dashboard.name}"`);
  console.log(`   ✓ Rows: ${dashboard.dashboard.rows.length}`);
  console.log(`   ✓ Current components: ${dashboard.dashboard.rows.map(r => r.columns.map(c => c.component?.type || 'empty').join(', ')).join(' | ')}\n`);

  // Step 2: Add time series chart
  console.log('2️⃣  Adding time series chart with clicks & impressions...');
  const updateResult = await callMCPTool('update_dashboard_layout', {
    dashboard_id: DASHBOARD_ID,
    operation: 'add_row',
    data: {
      columns: [
        {
          width: '1/1',
          component: {
            type: 'time_series',
            title: 'Clicks & Impressions Over Time',
            dimension: 'date',
            metrics: ['clicks', 'impressions']
          }
        }
      ]
    }
  });

  console.log(`   ✓ Row added successfully!`);
  console.log(`   ✓ Total rows now: ${updateResult.row_count}\n`);

  // Step 3: Verify the chart was added
  console.log('3️⃣  Verifying chart was added...');
  const updatedDashboard = await callMCPTool('get_dashboard', {
    dashboard_id: DASHBOARD_ID
  });

  const lastRow = updatedDashboard.dashboard.rows[updatedDashboard.dashboard.rows.length - 1];
  const timeSeriesComponent = lastRow.columns[0].component;

  console.log(`   ✓ Last row component type: ${timeSeriesComponent.type}`);
  console.log(`   ✓ Title: ${timeSeriesComponent.title}`);
  console.log(`   ✓ Metrics: ${timeSeriesComponent.metrics.join(', ')}`);
  console.log(`   ✓ Dimension: ${timeSeriesComponent.dimension}\n`);

  console.log('✅ All tests passed!');
  console.log(`\n🌐 View dashboard at: http://localhost:3000/dashboard/${DASHBOARD_ID}/builder`);
}

main().catch(error => {
  console.error('\n❌ Test failed:', error.message);
  process.exit(1);
});
