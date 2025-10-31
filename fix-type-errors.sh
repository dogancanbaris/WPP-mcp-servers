#!/bin/bash

# Fix sitemap errors/warnings comparison (convert to number)
sed -i 's/if (sitemapData.errors > 0)/if (Number(sitemapData.errors) > 0)/' src/gsc/tools/sitemaps.ts
sed -i 's/if (sitemapData.warnings > 0)/if (Number(sitemapData.warnings) > 0)/' src/gsc/tools/sitemaps.ts

# Fix analytics null safety
sed -i 's/const totalActiveUsers = response.rows.reduce/const totalActiveUsers = response.rows?.reduce/' src/analytics/tools/reporting/get-realtime-users.tool.ts
sed -i 's/, 0);/, 0) || 0;/' src/analytics/tools/reporting/get-realtime-users.tool.ts

echo "✅ Type errors fixed!"
