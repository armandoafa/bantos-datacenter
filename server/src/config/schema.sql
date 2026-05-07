-- Bantos Cloud UI Services - Consolidated Schema with Multi-Tenancy

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    password VARCHAR(255),
    company_name VARCHAR(255),
    contact_name VARCHAR(255),
    phone VARCHAR(50),
    tenant_id VARCHAR(100),
    upya_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'agent',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS operation_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    tenant_id VARCHAR(100),
    process_type VARCHAR(100) NOT NULL, -- e.g., 'CLIENT_CREATE', 'CONTRACT_ACTIVATE'
    process_id VARCHAR(255), -- ID from Upya
    detail JSON, -- Full payload or response detail
    status VARCHAR(50), -- 'SUCCESS', 'FAILED'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS client_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    client_number VARCHAR(100),
    tenant_id VARCHAR(100),
    name VARCHAR(255),
    email VARCHAR(255),
    status VARCHAR(50),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS contract_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    contract_number VARCHAR(100),
    tenant_id VARCHAR(100),
    client_id VARCHAR(255),
    client_number VARCHAR(100),
    product_name VARCHAR(255),
    deal_name VARCHAR(255),
    total_value DECIMAL(15, 2),
    paid_value DECIMAL(15, 2),
    status VARCHAR(50),
    signature_image LONGTEXT,
    created_at_upya DATETIME,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS inventory (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    serial_number VARCHAR(255),
    tenant_id VARCHAR(100),
    model VARCHAR(255),
    status VARCHAR(50),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    tenant_id VARCHAR(100),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    reference VARCHAR(100),
    is_lockable BOOLEAN DEFAULT FALSE,
    manufacturer VARCHAR(255),
    is_serialized BOOLEAN DEFAULT TRUE,
    tac VARCHAR(100),
    build VARCHAR(100),
    default_managed_by VARCHAR(255),
    description TEXT,
    picture_url VARCHAR(500),
    base_value DECIMAL(15, 2),
    entity_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS trustonic_devices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    imei1 VARCHAR(50) NOT NULL,
    imei2 VARCHAR(50),
    tenant_id VARCHAR(100),
    service VARCHAR(50), -- Prepago, Pospago
    status VARCHAR(50), -- Inactivo, Listo para su uso, Activo, Bloqueado, Liberado
    brand VARCHAR(100),
    model VARCHAR(100),
    last_change DATETIME,
    last_connection DATETIME,
    expiration_date DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (imei1, tenant_id)
);

CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    transaction_id VARCHAR(255),
    tenant_id VARCHAR(100),
    contract_id VARCHAR(255),
    client_id VARCHAR(255),
    amount DECIMAL(15, 2),
    method VARCHAR(100),
    status VARCHAR(50),
    payment_date DATETIME,
    account_number VARCHAR(100),
    card_holder VARCHAR(255),
    is_recurring BOOLEAN DEFAULT FALSE,
    recurring_dates JSON,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS payment_plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    tenant_id VARCHAR(100),
    type VARCHAR(100),
    name VARCHAR(255),
    product_name VARCHAR(255),
    total_cost VARCHAR(100),
    status VARCHAR(50),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS org_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    tenant_id VARCHAR(100),
    name VARCHAR(255),
    type VARCHAR(100),
    parent_id VARCHAR(255),
    entity_number VARCHAR(100),
    external_id VARCHAR(100),
    administrator VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(50),
    address TEXT,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS operation_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    tenant_id VARCHAR(100),
    type VARCHAR(100),
    status VARCHAR(50),
    assigned_to VARCHAR(255),
    due_date DATETIME,
    description TEXT,
    client_id VARCHAR(255),
    contract_id VARCHAR(255),
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

CREATE TABLE IF NOT EXISTS data_collections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    upya_id VARCHAR(255),
    tenant_id VARCHAR(100),
    name VARCHAR(255),
    category VARCHAR(100),
    status VARCHAR(50),
    questions_json JSON,
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY (upya_id, tenant_id)
);

