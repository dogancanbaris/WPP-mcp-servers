// Use Superset API to insert into database via SQL Lab
import('./dist/superset/client.js').then(({ createSupersetClient }) => {
  (async () => {
    const client = createSupersetClient({
      baseUrl: 'https://superset-60184572847.us-central1.run.app',
      username: 'admin',
      password: 'admin123',
    });

    await client.login();

    // Execute SQL to link charts
    const sql = `
      DELETE FROM dashboard_slices WHERE dashboard_id = 9;
      INSERT INTO dashboard_slices (dashboard_id, slice_id) VALUES
      (9, 44), (9, 45), (9, 46), (9, 47), (9, 48), (9, 49), (9, 50), (9, 51);
      SELECT COUNT(*) as linked_charts FROM dashboard_slices WHERE dashboard_id = 9;
    `;

    try {
      const result = await client.executeSQL(1, sql);  // database_id = 1
      console.log('✅ Charts linked to dashboard 9!');
      console.log(result);
    } catch (e) {
      console.log('⚠️  SQL execution via API not available');
      console.log('   Please run this SQL in Superset SQL Lab:');
      console.log('\n' + sql + '\n');
    }

    process.exit(0);
  })();
});
