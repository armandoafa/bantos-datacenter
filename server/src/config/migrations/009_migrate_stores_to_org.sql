-- Step 0: Disable foreign key checks and drop constraints linking to stores
SET FOREIGN_KEY_CHECKS=0;

-- ALTER TABLE inventory_transfers DROP FOREIGN KEY inventory_transfers_ibfk_1;
-- ALTER TABLE inventory_transfers DROP FOREIGN KEY inventory_transfers_ibfk_2;

-- Step 1: Add temporary legacy column and missing address column
-- (legacy_store_id already added)
-- ALTER TABLE org_structure ADD COLUMN address TEXT;

-- Step 2: Ensure a ROOT node exists for each tenant that has stores
-- Type 'Administración' is standard for ROOT
INSERT INTO org_structure (tenant_id, upya_id, name, type, administrator)
SELECT DISTINCT 
    s.tenant_id, 
    CONCAT('local-root-', s.tenant_id), 
    'Central', 
    'Administración', 
    'Admin'
FROM stores s
WHERE NOT EXISTS (
    SELECT 1 FROM org_structure o 
    WHERE o.tenant_id = s.tenant_id AND o.parent_id IS NULL
);

-- Step 3: Insert stores into org_structure as children of the ROOT node
-- We assign them the type 'Manager' because the client code filters stores/Tiendas using type === 'Manager'
INSERT INTO org_structure (tenant_id, upya_id, name, type, address, parent_id, legacy_store_id)
SELECT 
    s.tenant_id, 
    CONCAT('local-store-', s.id, '-', REPLACE(s.tenant_id, ':', '-')), 
    s.name, 
    'Manager', 
    s.address, 
    (SELECT id FROM org_structure o WHERE o.tenant_id = s.tenant_id AND o.parent_id IS NULL LIMIT 1),
    s.id
FROM stores s;

-- Step 4: Update all foreign key references to point to the new org_structure id
-- For `users`
UPDATE users u 
INNER JOIN org_structure o ON u.store_id = o.legacy_store_id 
SET u.store_id = o.id;

-- For `client_history`
UPDATE client_history c 
INNER JOIN org_structure o ON c.store_id = o.legacy_store_id 
SET c.store_id = o.id;

-- For `contract_history`
UPDATE contract_history c 
INNER JOIN org_structure o ON c.store_id = o.legacy_store_id 
SET c.store_id = o.id;

-- For `payments`
UPDATE payments p 
INNER JOIN org_structure o ON p.store_id = o.legacy_store_id 
SET p.store_id = o.id;

-- For `inventory`
UPDATE inventory i 
INNER JOIN org_structure o ON i.store_id = o.legacy_store_id 
SET i.store_id = o.id;

-- For `inventory_transfers` origin_store_id
UPDATE inventory_transfers t 
INNER JOIN org_structure o ON t.origin_store_id = o.legacy_store_id 
SET t.origin_store_id = o.id;

-- For `inventory_transfers` dest_store_id
UPDATE inventory_transfers t 
INNER JOIN org_structure o ON t.dest_store_id = o.legacy_store_id 
SET t.dest_store_id = o.id;

-- For `trustonic_devices`
UPDATE trustonic_devices t 
INNER JOIN org_structure o ON t.store_id = o.legacy_store_id 
SET t.store_id = o.id;

-- Step 5: Clean up
-- Drop the temporary legacy column
ALTER TABLE org_structure DROP COLUMN legacy_store_id;

-- Drop the old stores table since it is no longer needed
DROP TABLE IF EXISTS stores;

SET FOREIGN_KEY_CHECKS=1;
