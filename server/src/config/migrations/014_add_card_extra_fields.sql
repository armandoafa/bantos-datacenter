ALTER TABLE payments 
ADD COLUMN customer_name VARCHAR(255),
ADD COLUMN card_last4 VARCHAR(10),
ADD COLUMN card_exp_date VARCHAR(10),
ADD COLUMN card_type VARCHAR(50),
ADD COLUMN issuing_bank VARCHAR(100);
