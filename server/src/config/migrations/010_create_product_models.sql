CREATE TABLE IF NOT EXISTS product_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(100),
    manufacturer VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY (tenant_id, manufacturer, model)
);
