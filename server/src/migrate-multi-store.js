import pool from './config/db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateMultiStore() {
  console.log('--- Iniciando Migración Multi-Tienda ---');
  try {
    // 1. Ejecutar el archivo SQL
    const sqlPath = path.join(__dirname, 'config/migrations/005_multi_store.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    const queries = sql.split(';').filter(q => q.trim().length > 0);
    
    for (const query of queries) {
      try {
        await pool.query(query);
        console.log('Query ejecutado correctamente.');
      } catch (err) {
        // Ignorar error de "Duplicate column name"
        if (err.code === 'ER_DUP_FIELDNAME') {
          console.log('Columna ya existe, omitiendo.');
        } else if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('Tabla ya existe, omitiendo.');
        } else {
          console.error('Error ejecutando query:', err.message);
        }
      }
    }
    
    // 2. Lógica de Migración: Crear "Tienda Principal" para cada Tenant y asignar registros
    console.log('--- Verificando Tenants y asignando Tienda Principal ---');
    const [tenants] = await pool.query('SELECT DISTINCT tenant_id FROM users WHERE tenant_id IS NOT NULL');
    
    for (const t of tenants) {
      const tenantId = t.tenant_id;
      
      // Checar si ya tiene tiendas
      const [existingStores] = await pool.query('SELECT id FROM stores WHERE tenant_id = ?', [tenantId]);
      let storeId;
      
      if (existingStores.length === 0) {
        console.log(`Creando 'Tienda Principal' para Tenant: ${tenantId}`);
        const [result] = await pool.query(
          'INSERT INTO stores (tenant_id, name, address, status) VALUES (?, ?, ?, ?)',
          [tenantId, 'Tienda Principal', 'Dirección Principal', 'Active']
        );
        storeId = result.insertId;
      } else {
        storeId = existingStores[0].id;
      }
      
      console.log(`Asignando registros huérfanos al store_id: ${storeId} (Tenant: ${tenantId})`);
      
      // Asignar usuarios huérfanos
      await pool.query('UPDATE users SET store_id = ? WHERE tenant_id = ? AND store_id IS NULL AND role != ?', [storeId, tenantId, 'director']);
      
      // Asignar entidades huérfanas
      await pool.query('UPDATE client_history SET store_id = ? WHERE tenant_id = ? AND store_id IS NULL', [storeId, tenantId]);
      await pool.query('UPDATE contract_history SET store_id = ? WHERE tenant_id = ? AND store_id IS NULL', [storeId, tenantId]);
      await pool.query('UPDATE payments SET store_id = ? WHERE tenant_id = ? AND store_id IS NULL', [storeId, tenantId]);
      await pool.query('UPDATE inventory SET store_id = ? WHERE tenant_id = ? AND store_id IS NULL', [storeId, tenantId]);
      await pool.query('UPDATE trustonic_devices SET store_id = ? WHERE tenant_id = ? AND store_id IS NULL', [storeId, tenantId]);
    }
    
    console.log('--- Migración completada exitosamente ---');
  } catch (error) {
    console.error('Error crítico en la migración:', error);
  } finally {
    process.exit(0);
  }
}

migrateMultiStore();
