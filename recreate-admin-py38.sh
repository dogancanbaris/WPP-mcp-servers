#!/bin/bash
# Recreate admin user with Python 3.8 compatible password hash

# Delete existing admin user
PGPASSWORD=superset_local_password psql -h 127.0.0.1 -p 5432 -U superset -d superset << 'EOF'
DELETE FROM ab_user_role WHERE user_id = (SELECT id FROM ab_user WHERE username = 'admin');
DELETE FROM ab_user WHERE username = 'admin';
EOF

# Create admin user using Docker with apache/superset:5.0.0 (Python 3.8)
docker run --rm --network=host \
  -e SUPERSET_CONFIG_PATH=/app/superset_config.py \
  -v "/home/dogancanbaris/projects/MCP Servers/superset_config_local.py:/app/superset_config.py:ro" \
  gcr.io/mcp-servers-475317/superset:v7-fixed \
  flask fab create-admin --username admin --password admin123 --firstname Admin --lastname User --email admin@superset.com

echo "Admin user recreated with Python 3.8 compatible hash"
