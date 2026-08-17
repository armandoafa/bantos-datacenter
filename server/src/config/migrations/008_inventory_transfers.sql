CREATE TABLE IF NOT EXISTS inventory_transfers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tenant_id VARCHAR(50) NOT NULL,
    origin_store_id INT NOT NULL,
    dest_store_id INT NOT NULL,
    user_id INT NOT NULL,
    transferred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_reverted BOOLEAN DEFAULT FALSE,
    reverted_at TIMESTAMP NULL,
    reverted_by INT NULL,
    FOREIGN KEY (origin_store_id) REFERENCES stores(id),
    FOREIGN KEY (dest_store_id) REFERENCES stores(id),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (reverted_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inventory_transfer_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    transfer_id INT NOT NULL,
    inventory_id INT NOT NULL,
    FOREIGN KEY (transfer_id) REFERENCES inventory_transfers(id),
    FOREIGN KEY (inventory_id) REFERENCES inventory(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
