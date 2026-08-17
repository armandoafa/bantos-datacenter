import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function run() {
    try {
        console.log('Connecting to database...');
        const tenantId = 'c-romel';

        const [tables] = await db.query('SHOW TABLES');
        const dbName = process.env.DB_NAME;
        const tableKey = `Tables_in_${dbName}`;

        for (const row of tables) {
            const tableName = row[tableKey];
            const [columns] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
            const hasTenantId = columns.some(c => c.Field === 'tenant_id');
            const hasTenantIdCamel = columns.some(c => c.Field === 'tenantId');
            
            const columnToUse = hasTenantId ? 'tenant_id' : (hasTenantIdCamel ? 'tenantId' : null);
            
            if (columnToUse) {
                const [result] = await db.execute(`DELETE FROM ${tableName} WHERE ${columnToUse} = ?`, [tenantId]);
                console.log(`Deleted ${result.affectedRows} rows from ${tableName}`);
            }
        }
        
        console.log('Data cleanup completed.');
    } catch (e) {
        console.error('Error cleaning up data:', e);
    } finally {
        await db.end();
    }
}

run();
