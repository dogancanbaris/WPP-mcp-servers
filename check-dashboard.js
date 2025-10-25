import('./dist/superset/client.js').then(({ createSupersetClient }) => {
  (async () => {
    const client = createSupersetClient({
      baseUrl: 'https://superset-60184572847.us-central1.run.app',
      username: 'admin',
      password: 'admin123',
    });

    await client.login();
    
    const dashboard = await client.getDashboard('9');
    const posJson = JSON.parse(dashboard.result.position_json);
    
    const charts = Object.keys(posJson).filter(k => k.startsWith('CHART-'));
    console.log('Total CHART components:', charts.length);
    
    const chartIds = charts.map(k => posJson[k].meta?.chartId).filter(Boolean);
    console.log('Chart IDs:', chartIds);
    console.log('Unique chart IDs:', [...new Set(chartIds)]);
    
    process.exit(0);
  })();
});
