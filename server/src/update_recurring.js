import pool from './config/db.js';

async function setRecurring() {
  try {
    const dates = JSON.stringify(['2026-08-28', '2026-09-28', '2026-10-28', '2026-11-28', '2026-12-28']);
    const sql = 'UPDATE payments SET method = \'Tarjeta de Crédito (Domiciliado)\', is_recurring = true, recurring_dates = ? WHERE transaction_id = \'TXN-001\' AND tenant_id = \'sotelo\'';
    await pool.query(sql, [dates]);
    console.log('✅ Pago TXN-001 configurado como Enganche + Pagos Recurrentes.');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    process.exit(0);
  }
}

setRecurring();
