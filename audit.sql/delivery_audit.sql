CREATE TABLE delivery_audit (
    audit_id INT PRIMARY KEY AUTO_INCREMENT,
    delivery_id INT NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by VARCHAR(100),
    FOREIGN KEY (delivery_id) REFERENCES deliveries(delivery_id) ON DELETE CASCADE ON UPDATE CASCADE
);