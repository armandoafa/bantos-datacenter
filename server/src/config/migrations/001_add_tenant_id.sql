-- 1. Añadir columna tenant_id a tablas existentes
ALTER TABLE users ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'c-romel' AFTER id;
ALTER TABLE users ADD COLUMN password VARCHAR(255) AFTER email;
ALTER TABLE users ADD COLUMN company_name VARCHAR(100) AFTER username;
ALTER TABLE users ADD COLUMN contact_name VARCHAR(100) AFTER company_name;
ALTER TABLE users ADD COLUMN phone VARCHAR(20) AFTER contact_name;

ALTER TABLE client_history ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'c-romel' AFTER id;
ALTER TABLE contract_history ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'c-romel' AFTER id;
ALTER TABLE inventory ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'c-romel' AFTER id;
ALTER TABLE products ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'c-romel' AFTER id;
ALTER TABLE trustonic_devices ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'c-romel' AFTER imei1;
ALTER TABLE operation_logs ADD COLUMN tenant_id VARCHAR(50) DEFAULT 'c-romel' AFTER user_id;

-- 2. Crear nuevas tablas si no existen
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(100),
    tenant_id VARCHAR(50),
    transaction_id VARCHAR(100),
    contract_id VARCHAR(100),
    client_id VARCHAR(100),
    amount DECIMAL(10,2),
    method VARCHAR(50),
    status VARCHAR(50),
    payment_date DATETIME,
    account_number VARCHAR(100),
    card_holder VARCHAR(100),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_dates JSON,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

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

CREATE TABLE IF NOT EXISTS data_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(100),
    tenant_id VARCHAR(50),
    name VARCHAR(255),
    category VARCHAR(100),
    status VARCHAR(50),
    questions_json JSON,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS operation_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(100),
    tenant_id VARCHAR(50),
    client_id VARCHAR(100),
    action_type VARCHAR(100),
    status VARCHAR(50),
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

-- 3. Actualizar Constraints para Multi-Tenancy
-- Nota: Si las llaves ya no existen o ya se actualizaron, esto podría fallar, pero las tablas nuevas ya tienen la llave correcta.
ALTER TABLE client_history DROP INDEX upya_id;
ALTER TABLE client_history ADD UNIQUE KEY (upya_id, tenant_id);

ALTER TABLE contract_history DROP INDEX upya_id;
ALTER TABLE contract_history ADD UNIQUE KEY (upya_id, tenant_id);

ALTER TABLE products DROP INDEX upya_id;
ALTER TABLE products ADD UNIQUE KEY (upya_id, tenant_id);
