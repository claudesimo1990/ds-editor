#!/bin/bash

# Simple Supabase Export Script
# Usage: ./export-supabase-simple.sh [password]

PROJECT_ID="ytuumwgmdnqcmkvrtsll"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_DIR="supabase-backup-$TIMESTAMP"

# Get password
if [ -z "$1" ]; then
    echo -n "Enter Supabase database password: "
    read -s DB_PASSWORD
    echo
else
    DB_PASSWORD="$1"
fi

DB_URL="postgresql://postgres:$DB_PASSWORD@db.$PROJECT_ID.supabase.co:5432/postgres"

echo "Creating export directory..."
mkdir -p "$EXPORT_DIR"

echo "Exporting complete database..."
pg_dump "$DB_URL" \
    --no-owner \
    --no-privileges \
    --file="$EXPORT_DIR/database_backup.sql"

echo "Exporting edge functions..."
if [ -d "supabase/functions" ]; then
    cp -r supabase/functions "$EXPORT_DIR/"
fi

echo "Exporting config..."
if [ -f "supabase/config.toml" ]; then
    cp supabase/config.toml "$EXPORT_DIR/"
fi

echo "Creating archive..."
tar -czf "$EXPORT_DIR.tar.gz" "$EXPORT_DIR"

echo "✅ Export completed: $EXPORT_DIR.tar.gz"
echo "Size: $(du -sh "$EXPORT_DIR.tar.gz" | cut -f1)"