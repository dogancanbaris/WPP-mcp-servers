import('./dist/superset/client.js').then(({ createSupersetClient }) => {
  (async () => {
    const client = createSupersetClient({
      baseUrl: 'https://superset-60184572847.us-central1.run.app',
      username: 'admin',
      password: 'admin123',
    });

    await client.login();
    console.log('Logged in successfully');

    // Update chart 36 with x_axis parameter
    const chartId = '36';
    const updatedParams = {
      metrics: ['SUM(clicks)', 'SUM(impressions)'],
      x_axis: 'date',  // CRITICAL FIX
      time_grain_sqla: 'P1D',
      color_scheme: 'supersetColors',
    };

    await client.updateChart(chartId, {
      params: JSON.stringify(updatedParams),
    });

    console.log('✅ Chart 36 updated with x_axis parameter');
    console.log('Refresh dashboard 9 to see the fix!');
    process.exit(0);
  })();
});
