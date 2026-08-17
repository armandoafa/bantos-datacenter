import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'adminbantosprompt',
  password: process.env.DB_PASSWORD || 'adminbantosprompt2026',
  database: process.env.DB_NAME || 'bantosprompt502301_db',
  waitForConnections: true,
  connectionLimit: 10
});

async function run() {
  console.log("=== ANALISIS DE DATOS IMPORTADOS DE TRUSTONIC ===");
  
  // 1. Resumen de dispositivos por Tenant y Status
  const [deviceSummary] = await pool.query(`
    SELECT tenant_id, status, COUNT(*) as count 
    FROM trustonic_devices 
    GROUP BY tenant_id, status 
    ORDER BY tenant_id, count DESC
  `);
  console.log("\n--- 1. Resumen de Dispositivos por Tenant y Status ---");
  console.table(deviceSummary);

  // 2. Dispositivos totales por Tenant
  const [tenantTotals] = await pool.query(`
    SELECT tenant_id, COUNT(*) as total_devices, COUNT(DISTINCT brand) as brand_count
    FROM trustonic_devices 
    GROUP BY tenant_id 
    ORDER BY total_devices DESC
  `);
  console.log("\n--- 2. Totales por Tenant ---");
  console.table(tenantTotals);

  // 3. Top marcas por tenant
  const [topBrands] = await pool.query(`
    SELECT tenant_id, brand, COUNT(*) as count
    FROM trustonic_devices
    WHERE brand IS NOT NULL AND brand != ''
    GROUP BY tenant_id, brand
    ORDER BY tenant_id, count DESC
  `);
  console.log("\n--- 3. Top Marcas por Tenant ---");
  console.table(topBrands.slice(0, 40));

  // 4. Clasificación de operaciones por tenant (de trustonic_logs)
  const [opTypes] = await pool.query(`
    SELECT tenant_id, operation_type, COUNT(*) as count
    FROM trustonic_logs
    GROUP BY tenant_id, operation_type
    ORDER BY tenant_id, count DESC
  `);
  console.log("\n--- 4. Clasificación de Operaciones por Tenant ---");
  console.table(opTypes.slice(0, 40));

  // 5. Crecimiento temporal de activaciones/registros (agrupado por Año/Mes y Tenant)
  const [growth] = await pool.query(`
    SELECT tenant_id, YEAR(operation_date) as year, MONTH(operation_date) as month, COUNT(*) as new_records
    FROM trustonic_logs
    WHERE operation_date IS NOT NULL AND YEAR(operation_date) > 2000
    GROUP BY tenant_id, YEAR(operation_date), MONTH(operation_date)
    ORDER BY tenant_id, year, month
  `);
  console.log("\n--- 5. Crecimiento de Registros/Operaciones por Tenant (Temporal) ---");
  console.table(growth);

  await pool.end();
}

run().catch(console.error);
