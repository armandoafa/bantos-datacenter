#!/bin/bash

# Configuración del VPS
VPS_HOST="72.62.128.126"
VPS_USER="root"
VPS_PATH="/var/www/bantos.cloud/bantos-datacenter"
DB_NAME="bantosprompt502301_db"

echo "🚀 Iniciando despliegue de Conciliación Bancaria a $VPS_HOST..."

# 1. Subir la migración SQL
echo "📦 Subiendo archivo SQL de migración..."
scp server/src/config/migrations/013_reconciliation_fields.sql $VPS_USER@$VPS_HOST:$VPS_PATH/server/src/config/migrations/
scp server/src/config/migrations/014_add_card_extra_fields.sql $VPS_USER@$VPS_HOST:$VPS_PATH/server/src/config/migrations/

# 2. Ejecutar la migración SQL en el VPS
echo "🗄️ Ejecutando migración SQL en MySQL..."
ssh $VPS_USER@$VPS_HOST "mysql -u root $DB_NAME < $VPS_PATH/server/src/config/migrations/013_reconciliation_fields.sql"
ssh $VPS_USER@$VPS_HOST "mysql -u root $DB_NAME < $VPS_PATH/server/src/config/migrations/014_add_card_extra_fields.sql"

# 3. Subir los archivos del servidor modificados
echo "📂 Subiendo cambios del Backend (server)..."
rsync -avz --exclude 'node_modules' --exclude '.env' server/ $VPS_USER@$VPS_HOST:$VPS_PATH/server/

# 4. Instalar nuevas dependencias (pdf-parse) y reiniciar backend
echo "🔄 Instalando dependencias y reiniciando backend..."
ssh $VPS_USER@$VPS_HOST "cd $VPS_PATH/server && npm install && pm2 restart bantos-cloud-services || pm2 restart all"

# 5. Compilar y subir el cliente de InSight
echo "🌐 Compilando y subiendo InSight Client..."
cd insight-client
npm install
npm run build
cd ..
rsync -avz insight-client/dist/ $VPS_USER@$VPS_HOST:$VPS_PATH/insight-client/dist/

echo "✅ ¡Despliegue finalizado exitosamente!"
