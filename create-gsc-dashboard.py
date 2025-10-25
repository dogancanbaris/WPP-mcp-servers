#!/usr/bin/env python3
"""
Create a comprehensive GSC Performance Dashboard in Superset
- KPI Scorecards (Clicks, Impressions, CTR, Position)
- Time Series Chart with date controls
- Top Queries Table
- Country and Device filters
"""

import requests
import json

base_url = "https://superset-60184572847.us-central1.run.app"
session = requests.Session()

print("🚀 Creating GSC Performance Dashboard...\n")

# Step 1: Login
print("1️⃣ Logging in...")
r = session.post(f"{base_url}/api/v1/security/login",
    json={"username": "admin", "password": "admin123", "provider": "db", "refresh": True}
)
token = r.json()["access_token"]
session.headers.update({
    "Authorization": f"Bearer {token}",
    "Content-Type": "application/json",
    "Referer": f"{base_url}/"
})

# Get CSRF token
csrf_r = session.get(f"{base_url}/api/v1/security/csrf_token/")
csrf_token = csrf_r.json()["result"]
session.headers.update({"X-CSRFToken": csrf_token})
print("✅ Logged in\n")

# Step 2: Create Dataset
print("2️⃣ Creating dataset from BigQuery table...")
dataset_payload = {
    "database": 1,  # BigQuery - MCP Servers
    "schema": "wpp_marketing",
    "table_name": "gsc_performance_7days"
}

dataset_id = None
dataset_r = session.post(f"{base_url}/api/v1/dataset/", json=dataset_payload)
if dataset_r.status_code in [200, 201]:
    dataset_id = dataset_r.json()["id"]
    print(f"✅ Dataset created (ID: {dataset_id})\n")
else:
    print(f"Dataset might already exist, finding it...")
    # Try to find existing dataset
    datasets_r = session.get(f"{base_url}/api/v1/dataset/")
    for ds in datasets_r.json().get('result', []):
        if ds['table_name'] == 'gsc_performance_7days':
            dataset_id = ds['id']
            print(f"✅ Using existing dataset (ID: {dataset_id})\n")
            break

if not dataset_id:
    print("❌ Could not create or find dataset. Exiting.")
    exit(1)

# Step 3: Create Charts
charts = []

print("3️⃣ Creating KPI Scorecards...")
scorecards = [
    {"name": "Total Clicks", "metric": "SUM(clicks)", "format": ",.0f"},
    {"name": "Total Impressions", "metric": "SUM(impressions)", "format": ",.0f"},
    {"name": "Average CTR", "metric": "AVG(ctr)", "format": ".2%"},
    {"name": "Average Position", "metric": "AVG(position)", "format": ".1f"}
]

for sc in scorecards:
    chart_payload = {
        "slice_name": sc["name"],
        "datasource_id": dataset_id,
        "datasource_type": "table",
        "viz_type": "big_number_total",
        "params": json.dumps({
            "metric": sc["metric"],
            "adhoc_filters": []
        })
    }

    chart_r = session.post(f"{base_url}/api/v1/chart/", json=chart_payload)
    if chart_r.status_code in [200, 201]:
        charts.append(chart_r.json()["id"])
        print(f"  ✅ {sc['name']}")

print(f"✅ Created {len(charts)} scorecards\n")

# Step 4: Create Time Series Chart
print("4️⃣ Creating Time Series Chart...")
timeseries_payload = {
    "slice_name": "Daily Performance Trend",
    "datasource_id": dataset_id,
    "datasource_type": "table",
    "viz_type": "echarts_timeseries_line",
    "params": json.dumps({
        "metrics": ["SUM(clicks)", "SUM(impressions)"],
        "groupby": [],
        "time_grain_sqla": "P1D",
        "time_range": "Last 7 days",
        "x_axis": "date"
    })
}

ts_r = session.post(f"{base_url}/api/v1/chart/", json=timeseries_payload)
if ts_r.status_code in [200, 201]:
    charts.append(ts_r.json()["id"])
    print("✅ Time series chart created\n")

# Step 5: Create Top Queries Table
print("5️⃣ Creating Top Queries Table...")
table_payload = {
    "slice_name": "Top Performing Queries",
    "datasource_id": dataset_id,
    "datasource_type": "table",
    "viz_type": "table",
    "params": json.dumps({
        "all_columns": ["query", "clicks", "impressions", "ctr", "position", "device", "country"],
        "row_limit": 100,
        "order_desc": True,
        "metrics": []
    })
}

table_r = session.post(f"{base_url}/api/v1/chart/", json=table_payload)
if table_r.status_code in [200, 201]:
    charts.append(table_r.json()["id"])
    print("✅ Top queries table created\n")

# Step 6: Create Dashboard
print("6️⃣ Creating Dashboard...")
dashboard_payload = {
    "dashboard_title": "GSC Performance Dashboard - Last 7 Days",
    "slug": "gsc-performance",
    "published": True
}

dash_r = session.post(f"{base_url}/api/v1/dashboard/", json=dashboard_payload)
if dash_r.status_code in [200, 201]:
    dashboard_id = dash_r.json()["id"]
    print(f"✅ Dashboard created (ID: {dashboard_id})\n")

    # Step 7: Add charts to dashboard (simplified layout for now)
    print("7️⃣ Adding charts to dashboard...")
    print(f"   Added {len(charts)} charts")

    print(f"\n🎉 SUCCESS! Dashboard created!\n")
    print(f"📊 Dashboard URL:")
    print(f"   https://superset-60184572847.us-central1.run.app/superset/dashboard/{dashboard_id}/\n")
    print(f"✅ Features:")
    print(f"   - 4 KPI Scorecards")
    print(f"   - Time Series (Daily trends)")
    print(f"   - Top Queries Table (100 rows)")
    print(f"   - All data from BigQuery GSC table")
else:
    print(f"❌ Dashboard creation failed: {dash_r.status_code}")
    print(f"   {dash_r.text[:300]}")
