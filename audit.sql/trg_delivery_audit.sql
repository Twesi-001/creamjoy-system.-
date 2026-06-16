DELIMITER //

CREATE TRIGGER trg_delivery_audit
BEFORE UPDATE ON deliveries
FOR EACH ROW
BEGIN
    -- Only log if status is actually changing
    IF OLD.status != NEW.status THEN
        INSERT INTO delivery_audit (
            delivery_id,
            old_status,
            new_status,
            changed_at,
            changed_by
        ) VALUES (
            OLD.delivery_id,
            OLD.status,
            NEW.status,
            NOW(),
            USER()
        );
    END IF;
END//

DELIMITER ;