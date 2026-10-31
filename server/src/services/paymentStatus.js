// Fuente única de verdad para los estados de pago "efectivos" y para recalcular
// contract_history.paid_value a partir de la tabla payments.

// ACCEPTED es el estado con el que Upya/Dynamicore marcan los pagos aprobados (128 de 130 en c-romel).
export const PAID_STATUSES = [
  'ACCEPTED', 'PAID', 'VALIDATED', 'COMPLETED', 'SUCCESS', 'SUCCESSFUL',
  'ACEPTADO', 'PAGADO', 'VALIDADO',
];

// Fragmento SQL listo para usar: UPPER(status) IN ${PAID_STATUS_SQL}
export const PAID_STATUS_SQL = `(${PAID_STATUSES.map((s) => `'${s}'`).join(', ')})`;

/**
 * Recalcula paid_value del contrato = suma de pagos efectivos + descuentos de finiquito.
 * Es idempotente: se puede llamar tras crear/editar cualquier pago.
 * @returns {Promise<number|null>} nuevo paid_value, o null si no hay contrato que coincida
 */
export async function recalcContractPaidValue(pool, tenantId, contractId) {
  if (!contractId) return null;
  const [cs] = await pool.query(
    'SELECT id, upya_id, contract_number FROM contract_history WHERE tenant_id = ? AND (upya_id = ? OR contract_number = ?) LIMIT 1',
    [tenantId, contractId, contractId]
  );
  if (cs.length === 0) return null;
  const c = cs[0];
  const [r] = await pool.query(
    `SELECT COALESCE(SUM(amount), 0) AS paid,
            COALESCE(SUM(CASE WHEN is_settlement = 1 THEN COALESCE(discount_amount, 0) ELSE 0 END), 0) AS disc
     FROM payments
     WHERE tenant_id = ? AND contract_id IN (?, ?) AND UPPER(status) IN ${PAID_STATUS_SQL}`,
    [tenantId, c.upya_id, c.contract_number]
  );
  const total = Number(r[0].paid) + Number(r[0].disc);
  await pool.query('UPDATE contract_history SET paid_value = ? WHERE id = ?', [total, c.id]);
  return total;
}
