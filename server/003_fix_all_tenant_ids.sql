DELIMITER //

CREATE PROCEDURE FixMissingTenantIds()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE tbl_name VARCHAR(255);
    DECLARE cur CURSOR FOR 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'bantosprompt502301_db' 
        AND table_name NOT IN ('users', 'app_users'); -- 'users' ya tiene tenant_id, 'app_users' es interna
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO tbl_name;
        IF done THEN
            LEAVE read_loop;
        END IF;

        -- Verificar si la columna tenant_id existe
        IF NOT EXISTS (
            SELECT * 
            FROM information_schema.columns 
            WHERE table_schema = 'bantosprompt502301_db' 
            AND table_name = tbl_name 
            AND column_name = 'tenant_id'
        ) THEN
            SET @sql = CONCAT('ALTER TABLE ', tbl_name, ' ADD COLUMN tenant_id VARCHAR(50) DEFAULT "c-romel" AFTER upya_id');
            -- Si no hay upya_id, añadirla al principio
            IF NOT EXISTS (
                SELECT * 
                FROM information_schema.columns 
                WHERE table_schema = 'bantosprompt502301_db' 
                AND table_name = tbl_name 
                AND column_name = 'upya_id'
            ) THEN
                SET @sql = CONCAT('ALTER TABLE ', tbl_name, ' ADD COLUMN tenant_id VARCHAR(50) DEFAULT "c-romel" FIRST');
            END IF;
            
            PREPARE stmt FROM @sql;
            EXECUTE stmt;
            DEALLOCATE PREPARE stmt;
        END IF;
    END LOOP;

    CLOSE cur;
END //

DELIMITER ;

CALL FixMissingTenantIds();
DROP PROCEDURE FixMissingTenantIds;
