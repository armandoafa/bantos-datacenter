#!/bin/bash

# Configuration
VPS_HOST="72.62.128.126"
VPS_USER="root"
VPS_PATH="/var/www/bantos.cloud/bantos-datacenter"
DB_NAME="bantosprompt502301_db"

echo "🚀 Starting Deployment to $VPS_HOST..."

# 1. Upload SQL Migration
echo "📦 Uploading SQL Migration..."
scp server/src/config/001_add_tenant_id.sql $VPS_USER@$VPS_HOST:$VPS_PATH/server/src/config/

# 2. Execute SQL Migration
echo "🗄️ Executing SQL Migration..."
ssh $VPS_USER@$VPS_HOST "mysql -u root $DB_NAME < $VPS_PATH/server/src/config/001_add_tenant_id.sql"

# 3. Upload Server Files
echo "📂 Uploading Server Files..."
# We use rsync to only upload modified files and exclude node_modules
rsync -avz --exclude 'node_modules' --exclude '.env' server/ $VPS_USER@$VPS_HOST:$VPS_PATH/server/

# 4. Install Dependencies and Restart Server
echo "🔄 Updating dependencies and restarting server..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH/server && npm install && pm2 restart bantos-datacenter || npm start"

# 5. Upload Client (if needed, assuming it's a SPA)
# echo "🌐 Building and Uploading Client..."
# cd client && npm run build
# rsync -avz dist/ $VPS_USER@$VPS_HOST:$VPS_PATH/client/dist/

echo "✅ Deployment Finished!"
