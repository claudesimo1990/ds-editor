#!/bin/bash

# Supabase Database Export Script
# This script exports the complete Supabase database including schema, data, triggers, and edge functions

set -e

# Configuration
PROJECT_ID="ytuumwgmdnqcmkvrtsll"
EXPORT_DIR="./supabase-export-$(date +%Y%m%d_%H%M%S)"
DB_URL="postgresql://postgres:[PASSWORD]@db.${PROJECT_ID}.supabase.co:5432/postgres"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check dependencies
check_dependencies() {
    log_info "Checking dependencies..."
    
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Please install it first:"
        echo "npm install -g supabase"
        exit 1
    fi
    
    if ! command -v pg_dump &> /dev/null; then
        log_error "pg_dump is not installed. Please install PostgreSQL client tools."
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        log_warning "jq is not installed. JSON formatting will be limited."
    fi
    
    log_success "All dependencies are available"
}

# Create export directory
create_export_dir() {
    log_info "Creating export directory: $EXPORT_DIR"
    mkdir -p "$EXPORT_DIR"/{database,functions,config,docs}
    log_success "Export directory created"
}

# Get database password
get_db_password() {
    if [ -z "$POSTGRES_PASSWORD" ]; then
        echo -n "Enter your Supabase database password: "
        read -s POSTGRES_PASSWORD
        echo
    fi
    
    # Replace [PASSWORD] in DB_URL
    DB_URL="${DB_URL/\[PASSWORD\]/$POSTGRES_PASSWORD}"
}

# Export database schema
export_schema() {
    log_info "Exporting database schema..."
    
    pg_dump "$DB_URL" \
        --schema-only \
        --no-owner \
        --no-privileges \
        --verbose \
        --file="$EXPORT_DIR/database/schema.sql" \
        2>/dev/null || {
        log_error "Failed to export schema"
        return 1
    }
    
    log_success "Schema exported to database/schema.sql"
}

# Export database data
export_data() {
    log_info "Exporting database data..."
    
    # Export all data
    pg_dump "$DB_URL" \
        --data-only \
        --no-owner \
        --no-privileges \
        --verbose \
        --file="$EXPORT_DIR/database/data.sql" \
        2>/dev/null || {
        log_error "Failed to export data"
        return 1
    }
    
    log_success "Data exported to database/data.sql"
}

# Export specific tables data as JSON
export_tables_json() {
    log_info "Exporting table data as JSON..."
    
    # List of important tables to export as JSON
    TABLES=(
        "dde_obituaries"
        "dde_memorial_pages"
        "dde_user_profiles"
        "dde_admin_users"
        "dde_orders"
        "dde_email_templates"
        "dde_notifications"
        "dde_candles"
        "dde_condolences"
        "dde_memorial_photos"
    )
    
    for table in "${TABLES[@]}"; do
        log_info "Exporting $table as JSON..."
        psql "$DB_URL" -c "\copy (SELECT row_to_json($table) FROM $table) TO '$PWD/$EXPORT_DIR/database/${table}.json'" 2>/dev/null || {
            log_warning "Failed to export $table (table might not exist)"
            continue
        }
        log_success "$table exported as JSON"
    done
}

# Export complete database (schema + data)
export_complete_db() {
    log_info "Exporting complete database..."
    
    pg_dump "$DB_URL" \
        --no-owner \
        --no-privileges \
        --verbose \
        --file="$EXPORT_DIR/database/complete_backup.sql" \
        2>/dev/null || {
        log_error "Failed to export complete database"
        return 1
    }
    
    log_success "Complete database exported to database/complete_backup.sql"
}

# Export edge functions
export_functions() {
    log_info "Exporting edge functions..."
    
    # Check if we're in a Supabase project
    if [ ! -f "supabase/config.toml" ]; then
        log_warning "Not in a Supabase project directory. Skipping edge functions export."
        return 0
    fi
    
    # Copy edge functions
    if [ -d "supabase/functions" ]; then
        cp -r supabase/functions/* "$EXPORT_DIR/functions/" 2>/dev/null || {
            log_warning "No edge functions found or failed to copy"
        }
        log_success "Edge functions exported to functions/"
    else
        log_warning "No edge functions directory found"
    fi
}

# Export configuration
export_config() {
    log_info "Exporting configuration..."
    
    # Copy Supabase config
    if [ -f "supabase/config.toml" ]; then
        cp supabase/config.toml "$EXPORT_DIR/config/"
        log_success "Supabase config exported"
    fi
    
    # Export project settings (if possible)
    if command -v supabase &> /dev/null; then
        supabase projects list --output json > "$EXPORT_DIR/config/projects.json" 2>/dev/null || {
            log_warning "Could not export project list"
        }
    fi
    
    # Create a metadata file
    cat > "$EXPORT_DIR/config/export_metadata.json" << EOF
{
  "export_date": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "project_id": "$PROJECT_ID",
  "supabase_cli_version": "$(supabase --version 2>/dev/null || echo 'unknown')",
  "postgres_version": "$(psql "$DB_URL" -t -c 'SELECT version();' 2>/dev/null | head -1 | xargs || echo 'unknown')"
}
EOF
    
    log_success "Configuration and metadata exported"
}

# Export RLS policies
export_rls_policies() {
    log_info "Exporting RLS policies..."
    
    psql "$DB_URL" -c "
        SELECT 
            schemaname,
            tablename,
            policyname,
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM pg_policies 
        ORDER BY schemaname, tablename, policyname;
    " --csv > "$EXPORT_DIR/database/rls_policies.csv" 2>/dev/null || {
        log_warning "Failed to export RLS policies"
    }
    
    log_success "RLS policies exported to database/rls_policies.csv"
}

# Export database functions and triggers
export_functions_triggers() {
    log_info "Exporting database functions and triggers..."
    
    # Export functions
    psql "$DB_URL" -c "
        SELECT 
            n.nspname as schema,
            p.proname as function_name,
            pg_get_functiondef(p.oid) as definition
        FROM pg_proc p
        JOIN pg_namespace n ON p.pronamespace = n.oid
        WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
        ORDER BY n.nspname, p.proname;
    " --csv > "$EXPORT_DIR/database/functions.csv" 2>/dev/null || {
        log_warning "Failed to export functions"
    }
    
    # Export triggers
    psql "$DB_URL" -c "
        SELECT 
            schemaname,
            tablename,
            triggername,
            definition
        FROM pg_triggers
        WHERE schemaname NOT IN ('information_schema', 'pg_catalog')
        ORDER BY schemaname, tablename, triggername;
    " --csv > "$EXPORT_DIR/database/triggers.csv" 2>/dev/null || {
        log_warning "Failed to export triggers"
    }
    
    log_success "Functions and triggers exported"
}

# Create documentation
create_documentation() {
    log_info "Creating documentation..."
    
    cat > "$EXPORT_DIR/docs/README.md" << 'EOF'
# Supabase Export

This export contains a complete backup of your Supabase project.

## Contents

### `/database/`
- `complete_backup.sql` - Complete database backup (schema + data)
- `schema.sql` - Database schema only
- `data.sql` - Database data only
- `*.json` - Individual table exports in JSON format
- `rls_policies.csv` - Row Level Security policies
- `functions.csv` - Database functions
- `triggers.csv` - Database triggers

### `/functions/`
- Edge functions source code

### `/config/`
- `config.toml` - Supabase configuration
- `export_metadata.json` - Export metadata and version info

## Restore Instructions

### Database Restore
```bash
# Restore complete database
psql "your-new-database-url" < database/complete_backup.sql

# Or restore schema and data separately
psql "your-new-database-url" < database/schema.sql
psql "your-new-database-url" < database/data.sql
```

### Edge Functions
Copy the functions to your new Supabase project:
```bash
cp -r functions/* your-new-project/supabase/functions/
supabase functions deploy
```

### Configuration
Update your new project's config:
```bash
cp config/config.toml your-new-project/supabase/
```

## Important Notes

- Update connection strings and project IDs in the new environment
- Verify all RLS policies are properly applied
- Test edge functions after deployment
- Update environment variables and secrets
EOF
    
    log_success "Documentation created in docs/README.md"
}

# Main execution
main() {
    log_info "Starting Supabase export process..."
    
    check_dependencies
    create_export_dir
    get_db_password
    
    # Database exports
    export_schema
    export_data
    export_complete_db
    export_tables_json
    export_rls_policies
    export_functions_triggers
    
    # Other exports
    export_functions
    export_config
    create_documentation
    
    # Create compressed archive
    log_info "Creating compressed archive..."
    tar -czf "${EXPORT_DIR}.tar.gz" -C "$(dirname "$EXPORT_DIR")" "$(basename "$EXPORT_DIR")"
    
    log_success "Export completed successfully!"
    log_info "Export location: $EXPORT_DIR"
    log_info "Compressed archive: ${EXPORT_DIR}.tar.gz"
    
    # Show summary
    echo
    echo "=== EXPORT SUMMARY ==="
    find "$EXPORT_DIR" -type f -exec basename {} \; | sort | uniq -c | sort -nr
    echo
    echo "Total size: $(du -sh "$EXPORT_DIR" | cut -f1)"
    echo "Archive size: $(du -sh "${EXPORT_DIR}.tar.gz" | cut -f1)"
}

# Run the script
main "$@"