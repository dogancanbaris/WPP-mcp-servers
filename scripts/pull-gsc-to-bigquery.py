#!/usr/bin/env python3
"""
Pull Google Search Console data and load to BigQuery
For proof of concept: keepersdigital.com last 7 days
"""

from google.oauth2 import service_account
from googleapiclient.discovery import build
from google.cloud import bigquery
from datetime import datetime, timedelta
import json

# Service account file
SERVICE_ACCOUNT_FILE = '/home/dogancanbaris/projects/MCP Servers/mcp-servers-475317-adc00dc800cc.json'

# GSC property
PROPERTY_URL = 'sc-domain:keepersdigital.com'

# BigQuery details
PROJECT_ID = 'mcp-servers-475317'
DATASET_ID = 'wpp_marketing'
TABLE_ID = 'gsc_performance_7days'

print("🔐 Authenticating with service account...")
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE,
    scopes=['https://www.googleapis.com/auth/webmasters.readonly',
            'https://www.googleapis.com/auth/bigquery']
)

# Initialize GSC client
print("📊 Connecting to Google Search Console...")
gsc_service = build('searchconsole', 'v1', credentials=credentials)

# Calculate date range
end_date = datetime.now().date() - timedelta(days=1)
start_date = end_date - timedelta(days=7)

print(f"📅 Pulling data from {start_date} to {end_date}...")

# Query GSC API
request = {
    'startDate': start_date.strftime('%Y-%m-%d'),
    'endDate': end_date.strftime('%Y-%m-%d'),
    'dimensions': ['query', 'page', 'country', 'device', 'date'],
    'rowLimit': 25000
}

response = gsc_service.searchanalytics().query(
    siteUrl=PROPERTY_URL,
    body=request
).execute()

print(f"✅ Retrieved {len(response.get('rows', []))} rows from GSC")

# Transform to BigQuery format
rows_to_insert = []
for row in response.get('rows', []):
    rows_to_insert.append({
        'query': row['keys'][0],
        'page': row['keys'][1],
        'country': row['keys'][2],
        'device': row['keys'][3],
        'date': row['keys'][4],
        'clicks': row['clicks'],
        'impressions': row['impressions'],
        'ctr': row['ctr'],
        'position': row['position']
    })

print(f"🔄 Loading {len(rows_to_insert)} rows to BigQuery...")

# Initialize BigQuery client
bq_client = bigquery.Client(credentials=credentials, project=PROJECT_ID)

# Create table schema
schema = [
    bigquery.SchemaField("query", "STRING"),
    bigquery.SchemaField("page", "STRING"),
    bigquery.SchemaField("country", "STRING"),
    bigquery.SchemaField("device", "STRING"),
    bigquery.SchemaField("date", "DATE"),
    bigquery.SchemaField("clicks", "INTEGER"),
    bigquery.SchemaField("impressions", "INTEGER"),
    bigquery.SchemaField("ctr", "FLOAT"),
    bigquery.SchemaField("position", "FLOAT"),
]

table_ref = f"{PROJECT_ID}.{DATASET_ID}.{TABLE_ID}"

# Create or replace table
table = bigquery.Table(table_ref, schema=schema)
table = bq_client.create_table(table, exists_ok=True)

# Load data
job_config = bigquery.LoadJobConfig(
    schema=schema,
    write_disposition="WRITE_TRUNCATE"
)

job = bq_client.load_table_from_json(
    rows_to_insert,
    table_ref,
    job_config=job_config
)

job.result()  # Wait for job to complete

print(f"✅ Loaded to BigQuery: {table_ref}")
print(f"📈 Rows: {len(rows_to_insert)}")
print(f"🔗 View in console: https://console.cloud.google.com/bigquery?project={PROJECT_ID}&ws=!1m5!1m4!4m3!1s{PROJECT_ID}!2s{DATASET_ID}!3s{TABLE_ID}")
print("\n🎉 SUCCESS! Data ready for Metabase!")
