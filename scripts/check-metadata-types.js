import('./dist/superset/client.js').then(({ createSupersetClient }) => {
  (async () => {
    const client = createSupersetClient({
      baseUrl: 'https://superset-60184572847.us-central1.run.app',
      username: 'admin',
      password: 'admin123',
    });

    await client.login();

    // Check dashboard 6
    const dash6 = await client.getDashboard('6');
    const meta6 = JSON.parse(dash6.result.json_metadata);

    console.log('Dashboard 6 chart_configuration keys:');
    console.log(JSON.stringify(Object.keys(meta6.chart_configuration)));

    // Check dashboard 9
    const dash9 = await client.getDashboard('9');
    const meta9 = JSON.parse(dash9.result.json_metadata);

    console.log('\nDashboard 9 chart_configuration keys:');
    console.log(JSON.stringify(Object.keys(meta9.chart_configuration)));

    console.log('\nDashboard 6 sample:');
    console.log(JSON.stringify(meta6.chart_configuration, null, 2).substring(0, 400));

    console.log('\n\nDashboard 9 sample:');
    console.log(JSON.stringify(meta9.chart_configuration, null, 2).substring(0, 400));

    process.exit(0);
  })();
});
