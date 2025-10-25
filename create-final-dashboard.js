import('./dist/superset/client.js').then(({ createSupersetClient }) => {
  import('./dist/superset/auto-provision.js').then(async ({ ensureBigQueryConnection, ensureDataset, createDashboard }) => {
    console.log('🚀 Creating MODERN, BEAUTIFUL Superset Dashboard\n');

    const client = createSupersetClient({
      baseUrl: 'https://superset-60184572847.us-central1.run.app',
      username: 'admin',
      password: 'admin123',
    });

    await client.login();
    console.log('✓ Logged in\n');

    const databaseId = await ensureBigQueryConnection(client, 'mcp-servers-475317');
    const datasetId = await ensureDataset(client, databaseId, 'gsc_performance_7days', 'wpp_marketing');
    console.log(`✓ Database: ${databaseId}, Dataset: ${datasetId}\n`);

    const result = await createDashboard(client, {
      dashboardName: 'GSC Performance Dashboard - Modern',
      datasetId,
      visualizations: ['scorecards', 'time_series', 'table'],
      userId: 'practitioner@wpp.com',
      clientIds: ['Nike', 'Adidas'],
    });

    console.log('✅ MODERN DASHBOARD CREATED!\n');
    console.log(`Dashboard ID: ${result.dashboardId}`);
    console.log(`URL: https://superset-60184572847.us-central1.run.app/superset/dashboard/${result.dashboardId}/\n`);
    console.log('Improvements:');
    console.log('  ✓ Compact KPI cards (height reduced 50%)');
    console.log('  ✓ Better number formatting (.3s, .2%, etc.)');
    console.log('  ✓ Taller time series for better data viz');
    console.log('  ✓ Clean legend with proper labels');
    console.log('  ✓ Optimized table with better column order');
    console.log('  ✓ Professional spacing and layout\n');

    process.exit(0);
  });
});
