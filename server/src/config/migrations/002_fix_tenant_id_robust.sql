DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS DropIndexIfExists;
DROP PROCEDURE IF EXISTS AddUniqueKeyIfNotExists;

DELIMITER //

CREATE PROCEDURE AddColumnIfNotExists(
    IN tableName VARCHAR(255),
    IN columnName VARCHAR(255),
    IN columnDef VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND COLUMN_NAME = columnName
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD COLUMN ', columnName, ' ', columnDef);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

CREATE PROCEDURE DropIndexIfExists(
    IN tableName VARCHAR(255),
    IN indexName VARCHAR(255)
)
BEGIN
    IF EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND INDEX_NAME = indexName
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' DROP INDEX ', indexName);
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

CREATE PROCEDURE AddUniqueKeyIfNotExists(
    IN tableName VARCHAR(255),
    IN indexName VARCHAR(255),
    IN columns VARCHAR(255)
)
BEGIN
    IF NOT EXISTS (
        SELECT * FROM INFORMATION_SCHEMA.STATISTICS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = tableName
        AND INDEX_NAME = indexName
    ) THEN
        SET @sql = CONCAT('ALTER TABLE ', tableName, ' ADD UNIQUE KEY ', indexName, ' (', columns, ')');
        PREPARE stmt FROM @sql;
        EXECUTE stmt;
        DEALLOCATE PREPARE stmt;
    END IF;
END //

DELIMITER ;

-- Aplicar cambios
CALL AddColumnIfNotExists('users', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER id");
CALL AddColumnIfNotExists('users', 'password', "VARCHAR(255) AFTER email");
CALL AddColumnIfNotExists('users', 'company_name', "VARCHAR(100) AFTER username");
CALL AddColumnIfNotExists('users', 'contact_name', "VARCHAR(100) AFTER company_name");
CALL AddColumnIfNotExists('users', 'phone', "VARCHAR(20) AFTER contact_name");

CALL AddColumnIfNotExists('client_history', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER id");
CALL AddColumnIfNotExists('contract_history', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER id");
CALL AddColumnIfNotExists('inventory', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER id");
CALL AddColumnIfNotExists('products', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER id");
CALL AddColumnIfNotExists('trustonic_devices', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER imei1");
CALL AddColumnIfNotExists('operation_logs', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER user_id");
CALL AddColumnIfNotExists('payments', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER upya_id");
CALL AddColumnIfNotExists('data_collections', 'tenant_id', "VARCHAR(50) DEFAULT 'c-romel' AFTER upya_id");

-- Crear nuevas tablas
CREATE TABLE IF NOT EXISTS payment_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(100),
    tenant_id VARCHAR(50),
    name VARCHAR(100),
    type VARCHAR(50),
    total_cost DECIMAL(10,2),
    duration_months INT,
    deposit_required BOOLEAN,
    status VARCHAR(50),
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS org_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(100),
    tenant_id VARCHAR(50),
    parent_id VARCHAR(100),
    name VARCHAR(255),
    type VARCHAR(50),
    entity_number VARCHAR(100),
    external_id VARCHAR(100),
    administrator VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(50),
    address TEXT,
    UNIQUE KEY (upya_id, tenant_id)
);

-- Actualizar Índices
CALL DropIndexIfExists('client_history', 'upya_id');
CALL AddUniqueKeyIfNotExists('client_history', 'idx_upya_tenant', 'upya_id, tenant_id');

CALL DropIndexIfExists('contract_history', 'upya_id');
CALL AddUniqueKeyIfNotExists('contract_history', 'idx_upya_tenant', 'upya_id, tenant_id');

CALL DropIndexIfExists('products', 'upya_id');
CALL AddUniqueKeyIfNotExists('products', 'idx_upya_tenant', 'upya_id, tenant_id');

CALL DropIndexIfExists('payments', 'upya_id');
CALL AddUniqueKeyIfNotExists('payments', 'idx_upya_tenant', 'upya_id, tenant_id');

CALL DropIndexIfExists('data_collections', 'upya_id');
CALL AddUniqueKeyIfNotExists('data_collections', 'idx_upya_tenant', 'upya_id, tenant_id');

-- Limpieza
DROP PROCEDURE IF EXISTS AddColumnIfNotExists;
DROP PROCEDURE IF EXISTS DropIndexIfExists;
DROP PROCEDURE IF EXISTS AddUniqueKeyIfNotExists;
