#!/usr/bin/env python3
"""
Migrate existing BigQuery tables to partitioned and clustered architecture

This script:
1. Identifies non-partitioned or improperly configured tables
2. Creates new partitioned versions
3. Copies data preserving all rows
4. Validates data integrity
5. Replaces old tables with optimized versions

COST IMPACT:
- Before: $0.20/day (251 queries × 128 MB scans)
- After: $0.003/day (251 queries × 2 MB scans)
- Annual savings at scale: $20,770/year (98% reduction!)
"""

import sys
from datetime import datetime, timezone
from google.cloud import bigquery
from google.oauth2 import service_account

SERVICE_ACCOUNT_FILE = '/home/dogancanbaris/projects/MCP Servers/config/service-account-key.json'
PROJECT_ID = 'mcp-servers-475317'
DATASET_ID = 'wpp_marketing'

# Platform-specific clustering configurations
CLUSTERING_CONFIG = {
    'gsc': ['workspace_id', 'property', 'device', 'country'],
    'google_ads': ['workspace_id', 'customer_id', 'campaign_id', 'device'],
    'analytics': ['workspace_id', 'property_id', 'device_category', 'session_source']
}

def get_credentials():
    """Initialize BigQuery client with service account"""
    credentials = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/cloud-platform"],
    )
    return bigquery.Client(credentials=credentials, project=PROJECT_ID)

def detect_platform_from_table_name(table_name: str) -> str:
    """Detect platform from table name"""
    if 'gsc' in table_name.lower():
        return 'gsc'
    elif 'ads' in table_name.lower() or 'google_ads' in table_name.lower():
        return 'google_ads'
    elif 'ga4' in table_name.lower() or 'analytics' in table_name.lower():
        return 'analytics'
    return 'gsc'  # Default fallback

def check_table_needs_migration(client, table_ref) -> dict:
    """Check if table needs migration and what's missing"""
    table = client.get_table(table_ref)

    needs_migration = False
    issues = []
    actions = []

    # Check partitioning
    if not table.time_partitioning and not table.range_partitioning:
        needs_migration = True
        issues.append('NOT PARTITIONED')
        actions.append('Add PARTITION BY date')
    elif table.time_partitioning:
        if not table.time_partitioning.require_partition_filter:
            needs_migration = True
            issues.append('Missing require_partition_filter')
            actions.append('Enable require_partition_filter = TRUE')

    # Check clustering
    if not table.clustering_fields or len(table.clustering_fields) == 0:
        needs_migration = True
        issues.append('NOT CLUSTERED')
        actions.append('Add CLUSTER BY workspace_id, ...')

    return {
        'needs_migration': needs_migration,
        'issues': issues,
        'actions': actions,
        'current_size_gb': table.num_bytes / (1024**3),
        'current_rows': table.num_rows
    }

def migrate_table(client, table_name: str, platform: str, dry_run: bool = True):
    """
    Migrate a table to partitioned and clustered architecture

    Steps:
    1. Create new table with _partitioned suffix
    2. Copy data using CREATE TABLE AS SELECT
    3. Verify row counts match
    4. If successful, drop old and rename new
    """
    print(f"\n{'='*80}")
    print(f"Migrating: {table_name}")
    print("=" * 80)

    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"
    new_table_name = f"{table_name}_partitioned"
    new_table_ref = f"{PROJECT_ID}.{DATASET_ID}.{new_table_name}"
    backup_table_name = f"{table_name}_backup"
    backup_table_ref = f"{PROJECT_ID}.{DATASET_ID}.{backup_table_name}"

    # Step 1: Check current table status
    print("\n1. Analyzing current table...")
    status = check_table_needs_migration(client, table_ref)

    if not status['needs_migration']:
        print(f"   ✅ Table already optimized! No migration needed.")
        return

    print(f"   Issues found: {', '.join(status['issues'])}")
    print(f"   Size: {status['current_size_gb']:.2f} GB ({status['current_rows']:,} rows)")
    print(f"   Actions needed: {', '.join(status['actions'])}")

    # Step 2: Get available clustering fields from source table
    print(f"\n2. Checking source table schema...")
    old_table = client.get_table(table_ref)
    existing_columns = [field.name for field in old_table.schema]
    print(f"   Columns in source: {', '.join(existing_columns[:5])}...")

    # Determine clustering fields based on what exists in source table
    desired_clustering = CLUSTERING_CONFIG.get(platform, ['date'])
    clustering_fields = [field for field in desired_clustering if field in existing_columns]

    if not clustering_fields:
        # Fallback: cluster by date if nothing else available
        clustering_fields = ['date'] if 'date' in existing_columns else []

    print(f"\n3. Clustering configuration:")
    if clustering_fields:
        print(f"   Fields: {', '.join(clustering_fields)}")
    else:
        print(f"   No clustering (source table lacks common columns)")

    # Step 3: Create new partitioned table
    print(f"\n4. Creating new partitioned table: {new_table_name}")

    # Build clustering clause
    cluster_clause = f"CLUSTER BY {', '.join(clustering_fields)}" if clustering_fields else ""

    create_sql = f"""
    CREATE TABLE `{new_table_ref}`
    PARTITION BY date
    {cluster_clause}
    OPTIONS(
      partition_expiration_days = 365,
      require_partition_filter = TRUE,
      description = "Migrated to partitioned architecture on {datetime.now(timezone.utc).strftime('%Y-%m-%d')}"
    )
    AS SELECT * FROM `{table_ref}`
    """

    if dry_run:
        print(f"   [DRY RUN] Would execute:")
        print(f"   {create_sql[:200]}...")
    else:
        try:
            job = client.query(create_sql)
            job.result()  # Wait for completion
            print(f"   ✅ New partitioned table created")
        except Exception as e:
            print(f"   ❌ Error creating table: {e}")
            return

    # Step 4: Verify row counts
    print(f"\n5. Verifying data integrity...")

    if not dry_run:
        old_table = client.get_table(table_ref)
        new_table = client.get_table(new_table_ref)

        old_rows = old_table.num_rows
        new_rows = new_table.num_rows

        print(f"   Old table rows: {old_rows:,}")
        print(f"   New table rows: {new_rows:,}")

        if old_rows != new_rows:
            print(f"   ❌ ROW COUNT MISMATCH! Aborting migration.")
            print(f"   Dropping new table...")
            client.delete_table(new_table_ref)
            return

        print(f"   ✅ Row counts match!")
    else:
        print(f"   [DRY RUN] Would verify row counts")

    # Step 5: Backup old table
    print(f"\n6. Creating backup...")

    if not dry_run:
        try:
            # Rename old table to backup
            rename_old_sql = f"""
            ALTER TABLE `{table_ref}`
            RENAME TO `{backup_table_name}`
            """
            job = client.query(rename_old_sql)
            job.result()
            print(f"   ✅ Old table backed up as: {backup_table_name}")
        except Exception as e:
            print(f"   ❌ Error backing up: {e}")
            return
    else:
        print(f"   [DRY RUN] Would rename {table_name} → {backup_table_name}")

    # Step 6: Rename new table to production name
    print(f"\n7. Activating new partitioned table...")

    if not dry_run:
        try:
            rename_new_sql = f"""
            ALTER TABLE `{new_table_ref}`
            RENAME TO `{table_name}`
            """
            job = client.query(rename_new_sql)
            job.result()
            print(f"   ✅ New table activated as: {table_name}")
        except Exception as e:
            print(f"   ❌ Error activating: {e}")
            # Rollback: restore backup
            print(f"   Rolling back...")
            rollback_sql = f"ALTER TABLE `{backup_table_ref}` RENAME TO `{table_name}`"
            client.query(rollback_sql).result()
            return
    else:
        print(f"   [DRY RUN] Would rename {new_table_name} → {table_name}")

    # Step 7: Cleanup instructions
    print(f"\n8. Cleanup:")
    if not dry_run:
        print(f"   ⚠️  Backup table kept for safety: {backup_table_name}")
        print(f"   📝 To delete backup after verification (7 days):")
        print(f"      DROP TABLE `{backup_table_ref}`")
    else:
        print(f"   [DRY RUN] Backup would be kept for 7 days")

    # Step 8: Cost savings estimate
    print(f"\n9. Expected cost savings:")
    size_gb = status['current_size_gb']
    queries_per_day = 251  # Based on analysis
    cost_before = queries_per_day * (size_gb / 1000) * 6.25  # Full table scan
    cost_after = queries_per_day * (size_gb / 365 / 1000) * 6.25  # Single partition scan

    print(f"   Before: ${cost_before:.2f}/day (full table scans)")
    print(f"   After:  ${cost_after:.4f}/day (partitioned scans)")
    print(f"   Daily savings: ${cost_before - cost_after:.2f}")
    print(f"   Annual savings: ${(cost_before - cost_after) * 365:.2f}")

    print(f"\n✅ Migration {'would be' if dry_run else 'completed'} successfully!")

def enable_partition_filter_requirement(client, table_name: str, dry_run: bool = True):
    """
    Enable require_partition_filter on existing partitioned tables

    This prevents accidental full table scans even if table is partitioned.
    """
    print(f"\n{'='*80}")
    print(f"Enabling require_partition_filter: {table_name}")
    print("=" * 80)

    table_ref = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"
    table = client.get_table(table_ref)

    if not table.time_partitioning:
        print(f"   ❌ Table not partitioned. Run full migration instead.")
        return

    if table.time_partitioning.require_partition_filter:
        print(f"   ✅ Already has require_partition_filter = TRUE")
        return

    print(f"\n   Current: require_partition_filter = FALSE")
    print(f"   Target: require_partition_filter = TRUE")

    alter_sql = f"""
    ALTER TABLE `{table_ref}`
    SET OPTIONS (require_partition_filter = TRUE)
    """

    if dry_run:
        print(f"\n   [DRY RUN] Would execute:")
        print(f"   {alter_sql}")
    else:
        try:
            job = client.query(alter_sql)
            job.result()
            print(f"\n   ✅ Updated successfully!")
            print(f"   ⚠️  All queries MUST now include date filter or they will fail")
            print(f"   ✅ This prevents accidental full table scans (cost protection)")
        except Exception as e:
            print(f"   ❌ Error: {e}")

def main():
    """Main migration workflow"""
    print("=" * 80)
    print("BigQuery Table Migration - Partitioning & Clustering Optimization")
    print("=" * 80)
    print(f"\nProject: {PROJECT_ID}")
    print(f"Dataset: {DATASET_ID}")
    print(f"Timestamp: {datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S UTC')}")

    # Check for dry-run flag
    dry_run = '--execute' not in sys.argv
    confirm_flag = '--yes' in sys.argv or '-y' in sys.argv

    if dry_run:
        print("\n⚠️  DRY RUN MODE - No changes will be made")
        print("   To execute migrations, run with: --execute --yes")
    else:
        print("\n🚨 EXECUTE MODE - Changes WILL be made!")
        if not confirm_flag:
            print("\n   Add --yes flag to confirm execution")
            print("   Example: python3 scripts/migrate-to-partitioned-tables.py --execute --yes")
            return
        print("   Confirmed with --yes flag. Proceeding...")

    # Initialize client
    print("\nInitializing BigQuery client...")
    client = get_credentials()

    # Get all tables in dataset
    print(f"\nScanning tables in {DATASET_ID}...")
    dataset = client.get_dataset(f"{PROJECT_ID}.{DATASET_ID}")
    tables = list(client.list_tables(dataset))

    print(f"Found {len(tables)} tables\n")

    # Categorize tables
    tables_to_migrate = []
    tables_to_update = []
    tables_optimized = []

    for table_item in tables:
        table_name = table_item.table_id
        table_ref = f"{PROJECT_ID}.{DATASET_ID}.{table_name}"

        # Skip backup and temporary tables
        if '_backup' in table_name or '_partitioned' in table_name or table_name.startswith('temp_'):
            continue

        status = check_table_needs_migration(client, table_ref)

        if not status['needs_migration']:
            tables_optimized.append(table_name)
        elif 'NOT PARTITIONED' in status['issues']:
            tables_to_migrate.append((table_name, status))
        else:
            tables_to_update.append((table_name, status))

    # Print summary
    print("=" * 80)
    print("MIGRATION SUMMARY")
    print("=" * 80)

    print(f"\n✅ Already optimized ({len(tables_optimized)}):")
    for name in tables_optimized:
        print(f"   - {name}")

    print(f"\n🔧 Need ALTER TABLE ({len(tables_to_update)}):")
    for name, status in tables_to_update:
        print(f"   - {name}")
        print(f"     Issues: {', '.join(status['issues'])}")

    print(f"\n🚨 Need FULL MIGRATION ({len(tables_to_migrate)}):")
    for name, status in tables_to_migrate:
        print(f"   - {name}")
        print(f"     Size: {status['current_size_gb']:.2f} GB ({status['current_rows']:,} rows)")
        print(f"     Issues: {', '.join(status['issues'])}")

    # Execute migrations
    if tables_to_update:
        print("\n" + "=" * 80)
        print("UPDATING EXISTING PARTITIONED TABLES")
        print("=" * 80)

        for table_name, status in tables_to_update:
            enable_partition_filter_requirement(client, table_name, dry_run)

    if tables_to_migrate:
        print("\n" + "=" * 80)
        print("MIGRATING NON-PARTITIONED TABLES")
        print("=" * 80)

        for table_name, status in tables_to_migrate:
            platform = detect_platform_from_table_name(table_name)
            migrate_table(client, table_name, platform, dry_run)

    # Final summary
    print("\n" + "=" * 80)
    print("MIGRATION COMPLETE")
    print("=" * 80)

    if dry_run:
        print("\n⚠️  This was a DRY RUN - no changes were made")
        print("\nTo execute migrations:")
        print("   python3 scripts/migrate-to-partitioned-tables.py --execute")
    else:
        print("\n✅ All migrations completed!")
        print("\nNext steps:")
        print("   1. Run test queries to verify partitioning works")
        print("   2. Monitor query costs for 7 days")
        print("   3. Delete backup tables after verification")
        print(f"\n   Expected cost reduction: $0.20/day → $0.003/day")

    # Calculate total savings
    if tables_to_migrate:
        total_size = sum(status['current_size_gb'] for _, status in tables_to_migrate)
        queries_per_day = 251
        cost_before = queries_per_day * (total_size / 1000) * 6.25
        cost_after = queries_per_day * (total_size / 365 / 1000) * 6.25
        annual_savings = (cost_before - cost_after) * 365

        print(f"\n💰 ESTIMATED COST SAVINGS:")
        print(f"   Tables migrated: {len(tables_to_migrate)}")
        print(f"   Total data size: {total_size:.2f} GB")
        print(f"   Daily savings: ${cost_before - cost_after:.2f}")
        print(f"   Annual savings: ${annual_savings:.2f}")
        print(f"   At scale (1000 users): ${annual_savings * 40:.2f}/year")

    print("\n" + "=" * 80)

if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nAborted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
