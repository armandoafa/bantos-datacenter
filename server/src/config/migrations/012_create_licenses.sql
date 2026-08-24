CREATE TABLE IF NOT EXISTS licenses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_key VARCHAR(100) UNIQUE NOT NULL,
    tenant_id VARCHAR(100) NOT NULL,
    device_imei VARCHAR(100) DEFAULT NULL,
    unit_cost DECIMAL(15,2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'available', -- 'available', 'active', 'suspended'
    activated_at DATETIME DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_tenant (tenant_id),
    INDEX idx_imei (device_imei)
);
