#!/bin/bash
# Get access token
TOKEN=$(curl -s -X POST https://superset-60184572847.us-central1.run.app/api/v1/security/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","provider":"db","refresh":true}' | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Update dashboard with chart references
curl -s -X PUT "https://superset-60184572847.us-central1.run.app/api/v1/dashboard/10" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "owners": [2]
  }' | python3 -m json.tool | head -20

echo "✅ Dashboard 10 updated"
echo "🔗 Test at: https://superset-60184572847.us-central1.run.app/superset/dashboard/10/"
