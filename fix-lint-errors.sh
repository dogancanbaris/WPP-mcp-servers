#!/bin/bash

# Fix unused formatNumber imports
sed -i 's/, formatNumber//' src/ads/tools/bidding.ts
sed -i 's/, formatNumber//' src/ads/tools/conversions.ts  
sed -i 's/, formatNumber//' src/ads/tools/extensions.ts
sed -i 's/formatNumber,//' src/crux/tools.ts

# Fix unused formatNextSteps import
sed -i 's/, formatNextSteps//' src/wpp-analytics/tools/dashboards/list-dashboards.tool.ts

# Fix unused schema
sed -i 's/const DeleteDashboardSchema/const _DeleteDashboardSchema/' src/wpp-analytics/tools/dashboards/delete-dashboard.tool.ts

# Fix unused result variable
sed -i 's/const result = await approvalEnforcer/await approvalEnforcer/' src/wpp-analytics/tools/dashboards/delete-dashboard.tool.ts

# Fix unused target parameter in crux
sed -i 's/function generateCWVInsights(data: ProcessedCWV, target: string)/function generateCWVInsights(data: ProcessedCWV)/' src/crux/tools.ts

echo "✅ Lint errors fixed!"
