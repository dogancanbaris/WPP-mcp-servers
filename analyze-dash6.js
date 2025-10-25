import('./dist/superset/client.js').then(({ createSupersetClient }) => {
  (async () => {
    const client = createSupersetClient({
      baseUrl: 'https://superset-60184572847.us-central1.run.app',
      username: 'admin',
      password: 'admin123',
    });

    await client.login();

    const dash6 = await client.getDashboard('6');
    const posJson = JSON.parse(dash6.result.position_json);
    const metaJson = JSON.parse(dash6.result.json_metadata);

    const chartKeys = Object.keys(posJson).filter(k => k.startsWith('CHART-'));
    const chartIds = chartKeys.map(k => posJson[k].meta.chartId);

    console.log('Dashboard 6 charts in position_json:', chartIds);
    console.log('Dashboard 6 charts in json_metadata.chart_configuration:', Object.keys(metaJson.chart_configuration));
    console.log('Dashboard 6 charts in global_chart_configuration:', metaJson.global_chart_configuration.chartsInScope);

    process.exit(0);
  })();
});
