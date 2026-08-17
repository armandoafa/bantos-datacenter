USE bantosprompt502301_db;

-- Borrar historial de operaciones
DELETE FROM operation_logs WHERE tenant_id = 'c-romel';
DELETE FROM operation_actions WHERE tenant_id = 'c-romel';

-- Borrar datos de negocio
DELETE FROM payments WHERE tenant_id = 'c-romel';
DELETE FROM contract_history WHERE tenant_id = 'c-romel';
DELETE FROM client_history WHERE tenant_id = 'c-romel';
DELETE FROM inventory WHERE tenant_id = 'c-romel';
DELETE FROM products WHERE tenant_id = 'c-romel';
DELETE FROM data_collections WHERE tenant_id = 'c-romel';
DELETE FROM payment_plans WHERE tenant_id = 'c-romel';

-- Borrar datos de dispositivos
DELETE FROM trustonic_logs WHERE tenant_id = 'c-romel';
DELETE FROM trustonic_devices WHERE tenant_id = 'c-romel';

-- Opcional: Estructura organizacional (si se sincronizó)
DELETE FROM agents WHERE tenant_id = 'c-romel';

-- NO BORRAMOS tenants, users ni user_scopes para que el usuario armando.bantoshub siga existiendo y pueda volver a sincronizar.
