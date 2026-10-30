// Validación del IMEI que se vincula a un contrato (contract_history.imei).
// Se usa en todas las rutas que crean/editan contratos para garantizar la relación IMEI <-> contrato.

export class ContractImeiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ContractImeiError';
    this.status = status;
  }
}

export const normalizeImei = (raw) => String(raw ?? '').replace(/[\s-]/g, '');

/**
 * @param {object} pool  Pool mysql2
 * @param {string} tenantId
 * @param {*} raw  IMEI recibido (puede venir vacío)
 * @param {object} opts
 * @param {boolean} [opts.required=false]  Si es true, un IMEI vacío es error 400
 * @param {Array<string>} [opts.excludeIds=[]]  upya_id / contract_number del propio contrato (edición)
 * @param {string} [opts.clientNumber]  Mismo cliente reintentando: no se considera duplicado
 * @returns {Promise<string|null>} IMEI normalizado, o null si no se envió y no es obligatorio
 */
export async function validateContractImei(pool, tenantId, raw, opts = {}) {
  const { required = false, excludeIds = [], clientNumber = null } = opts;
  const imei = normalizeImei(raw);

  if (!imei) {
    if (required) throw new ContractImeiError('El IMEI del dispositivo es obligatorio para crear el contrato.');
    return null;
  }
  if (!/^\d{14,16}$/.test(imei)) {
    throw new ContractImeiError('El IMEI debe contener solo dígitos (14 a 16).');
  }

  const [linked] = await pool.query(
    'SELECT contract_number, upya_id, client_number FROM contract_history WHERE tenant_id = ? AND imei = ?',
    [tenantId, imei]
  );
  const excluded = new Set(excludeIds.filter(Boolean).map(String));
  const conflict = linked.find((r) =>
    !excluded.has(String(r.upya_id)) &&
    !excluded.has(String(r.contract_number)) &&
    !(clientNumber && r.client_number && String(r.client_number) === String(clientNumber))
  );
  if (conflict) {
    throw new ContractImeiError(
      `El IMEI ${imei} ya está vinculado al contrato ${conflict.contract_number || conflict.upya_id}.`,
      409
    );
  }

  // Aviso (no bloqueante): el equipo puede enrolarse en Trustonic después de crear el contrato
  try {
    const [td] = await pool.query(
      'SELECT 1 FROM trustonic_devices WHERE (imei1 = ? OR imei2 = ?) AND tenant_id = ? LIMIT 1',
      [imei, imei, tenantId]
    );
    if (td.length === 0) {
      console.warn(`[CONTRACT IMEI] ${imei} no está en trustonic_devices del tenant ${tenantId}; las recargas fallarán hasta que se enrole.`);
    }
  } catch (e) {
    console.warn('[CONTRACT IMEI] No se pudo verificar en trustonic_devices:', e.message);
  }

  return imei;
}
