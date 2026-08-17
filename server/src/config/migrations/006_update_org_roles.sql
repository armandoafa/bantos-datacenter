-- 1. Insertar Tienda Principal si no existe
INSERT INTO stores (tenant_id, name, address, status)
SELECT tenant_id, 'Tienda Principal', 'Dirección Principal', 'Active'
FROM (SELECT DISTINCT tenant_id FROM users) as t
WHERE NOT EXISTS (SELECT 1 FROM stores WHERE tenant_id = t.tenant_id);

-- 2. Asignar todos los registros huerfanos a la Tienda Principal de su tenant
UPDATE users u
JOIN stores s ON u.tenant_id = s.tenant_id AND s.name = 'Tienda Principal'
SET u.store_id = s.id
WHERE u.store_id IS NULL;

UPDATE client_history c
JOIN stores s ON c.tenant_id = s.tenant_id AND s.name = 'Tienda Principal'
SET c.store_id = s.id
WHERE c.store_id IS NULL;

UPDATE contract_history c
JOIN stores s ON c.tenant_id = s.tenant_id AND s.name = 'Tienda Principal'
SET c.store_id = s.id
WHERE c.store_id IS NULL;

UPDATE payments p
JOIN stores s ON p.tenant_id = s.tenant_id AND s.name = 'Tienda Principal'
SET p.store_id = s.id
WHERE p.store_id IS NULL;

UPDATE inventory i
JOIN stores s ON i.tenant_id = s.tenant_id AND s.name = 'Tienda Principal'
SET i.store_id = s.id
WHERE i.store_id IS NULL;

UPDATE trustonic_devices t
JOIN stores s ON t.tenant_id = s.tenant_id AND s.name = 'Tienda Principal'
SET t.store_id = s.id
WHERE t.store_id IS NULL;

-- 3. Mapear niveles organizacionales
UPDATE org_structure
SET type = 'Administración'
WHERE type IN ('COUNTRY', 'REGION');

UPDATE org_structure
SET type = 'Manager'
WHERE type IN ('BRANCH', 'SHOP');

UPDATE org_structure
SET type = 'Agente'
WHERE type = 'UNIT';
