import pool from './config/db.js';

async function seedSotelo() {
  const tenantId = 'sotelo';
  console.log('Starting mock data injection v2 for tenant: ' + tenantId + '...');

  try {
    // 0. Clean previous data for sotelo
    console.log('Cleaning old data...');
    await pool.query('DELETE FROM payments WHERE tenant_id = ?', [tenantId]);
    await pool.query('DELETE FROM inventory WHERE tenant_id = ?', [tenantId]);
    await pool.query('DELETE FROM contract_history WHERE tenant_id = ?', [tenantId]);
    await pool.query('DELETE FROM payment_plans WHERE tenant_id = ?', [tenantId]);
    await pool.query('DELETE FROM products WHERE tenant_id = ?', [tenantId]);
    await pool.query('DELETE FROM client_history WHERE tenant_id = ?', [tenantId]);

    // 1. Create mock clients
    const clients = [
      { upya_id: 'upya-client-001', client_number: 'C-001', name: 'Juan Perez', email: 'juan.perez@example.com', status: 'Active' },
      { upya_id: 'upya-client-002', client_number: 'C-002', name: 'Maria Garcia', email: 'maria.garcia@example.com', status: 'Active' },
      { upya_id: 'upya-client-003', client_number: 'C-003', name: 'Carlos Lopez', email: 'carlos.lopez@example.com', status: 'Inactive' },
      { upya_id: 'upya-client-004', client_number: 'C-004', name: 'Ana Martinez', email: 'ana.martinez@example.com', status: 'Active' },
      { upya_id: 'upya-client-005', client_number: 'C-005', name: 'Luis Rodriguez', email: 'luis.rodriguez@example.com', status: 'Active' }
    ];

    for (const c of clients) {
      await pool.query(
        'INSERT INTO client_history (upya_id, client_number, tenant_id, name, email, status) VALUES (?, ?, ?, ?, ?, ?)',
        [c.upya_id, c.client_number, tenantId, c.name, c.email, c.status]
      );
    }
    console.log('✅ Inserted 5 clients.');

    // 2. Create mock products (Mobile Devices)
    const products = [
      { upya_id: 'upya-prod-001', name: 'Samsung Galaxy S23', category: 'Smartphone', reference: 'SM-S911B', base_value: 800.00 },
      { upya_id: 'upya-prod-002', name: 'Motorola Moto G Stylus', category: 'Smartphone', reference: 'XT2315', base_value: 300.00 },
      { upya_id: 'upya-prod-003', name: 'Oppo Reno 10', category: 'Smartphone', reference: 'CPH2531', base_value: 400.00 }
    ];

    for (const p of products) {
      await pool.query(
        'INSERT INTO products (upya_id, tenant_id, name, category, reference, base_value, status) VALUES (?, ?, ?, ?, ?, ?, "Active")',
        [p.upya_id, tenantId, p.name, p.category, p.reference, p.base_value]
      );
    }
    console.log('✅ Inserted 3 products (Mobile Devices).');

    // 3. Create mock payment plans
    const paymentPlans = [
      { upya_id: 'upya-plan-001', type: 'PAYGO', name: 'Financiamiento 12 Meses', product_name: 'Samsung Galaxy S23', total_cost: '900.00', status: 'Active' },
      { upya_id: 'upya-plan-002', type: 'CASH', name: 'Pago de Contado', product_name: 'Motorola Moto G Stylus', total_cost: '300.00', status: 'Active' },
      { upya_id: 'upya-plan-003', type: 'PAYGO', name: 'Financiamiento 6 Meses', product_name: 'Oppo Reno 10', total_cost: '450.00', status: 'Active' }
    ];

    for (const pp of paymentPlans) {
      await pool.query(
        'INSERT INTO payment_plans (upya_id, tenant_id, type, name, product_name, total_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [pp.upya_id, tenantId, pp.type, pp.name, pp.product_name, pp.total_cost, pp.status]
      );
    }
    console.log('✅ Inserted 3 payment plans.');

    // 4. Create mock contracts
    const contracts = [
      { upya_id: 'upya-contract-001', contract_number: 'CON-1001', client_id: 'upya-client-001', client_number: 'C-001', product_name: 'Samsung Galaxy S23', deal_name: 'Financiamiento 12 Meses', total_value: 900.00, paid_value: 150.00, status: 'Active' },
      { upya_id: 'upya-contract-002', contract_number: 'CON-1002', client_id: 'upya-client-002', client_number: 'C-002', product_name: 'Motorola Moto G Stylus', deal_name: 'Pago de Contado', total_value: 300.00, paid_value: 300.00, status: 'Completed' },
      { upya_id: 'upya-contract-003', contract_number: 'CON-1003', client_id: 'upya-client-004', client_number: 'C-004', product_name: 'Oppo Reno 10', deal_name: 'Financiamiento 6 Meses', total_value: 450.00, paid_value: 150.00, status: 'Active' },
      { upya_id: 'upya-contract-004', contract_number: 'CON-1004', client_id: 'upya-client-005', client_number: 'C-005', product_name: 'Samsung Galaxy S23', deal_name: 'Financiamiento 12 Meses', total_value: 900.00, paid_value: 90.00, status: 'Active' },
      { upya_id: 'upya-contract-005', contract_number: 'CON-1005', client_id: 'upya-client-001', client_number: 'C-001', product_name: 'Oppo Reno 10', deal_name: 'Financiamiento 6 Meses', total_value: 450.00, paid_value: 450.00, status: 'Completed' }
    ];

    for (const c of contracts) {
      await pool.query(
        'INSERT INTO contract_history (upya_id, contract_number, tenant_id, client_id, client_number, product_name, deal_name, total_value, paid_value, status, created_at_upya) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [c.upya_id, c.contract_number, tenantId, c.client_id, c.client_number, c.product_name, c.deal_name, c.total_value, c.paid_value, c.status]
      );
    }
    console.log('✅ Inserted 5 contracts.');

    // 5. Create mock inventory
    const inventory = [
      { upya_id: 'upya-inv-001', serial_number: 'IMEI-S23-001', model: 'Samsung Galaxy S23', status: 'Deployed' },
      { upya_id: 'upya-inv-002', serial_number: 'IMEI-MOT-001', model: 'Motorola Moto G Stylus', status: 'Deployed' },
      { upya_id: 'upya-inv-003', serial_number: 'IMEI-OPP-001', model: 'Oppo Reno 10', status: 'Deployed' },
      { upya_id: 'upya-inv-004', serial_number: 'IMEI-S23-002', model: 'Samsung Galaxy S23', status: 'In Stock' },
      { upya_id: 'upya-inv-005', serial_number: 'IMEI-OPP-002', model: 'Oppo Reno 10', status: 'In Stock' }
    ];

    for (const i of inventory) {
      await pool.query(
        'INSERT INTO inventory (upya_id, serial_number, tenant_id, model, status) VALUES (?, ?, ?, ?, ?)',
        [i.upya_id, i.serial_number, tenantId, i.model, i.status]
      );
    }
    console.log('✅ Inserted 5 inventory items.');

    // 6. Create mock payments
    const payments = [
      { upya_id: 'upya-pay-001', transaction_id: 'TXN-001', contract_id: 'upya-contract-001', client_id: 'upya-client-001', amount: 150.00, method: 'Tarjeta de Crédito', status: 'Completed' },
      { upya_id: 'upya-pay-002', transaction_id: 'TXN-002', contract_id: 'upya-contract-002', client_id: 'upya-client-002', amount: 300.00, method: 'Efectivo', status: 'Completed' },
      { upya_id: 'upya-pay-003', transaction_id: 'TXN-003', contract_id: 'upya-contract-003', client_id: 'upya-client-004', amount: 150.00, method: 'Transferencia Bancaria', status: 'Completed' },
      { upya_id: 'upya-pay-004', transaction_id: 'TXN-004', contract_id: 'upya-contract-004', client_id: 'upya-client-005', amount: 90.00, method: 'OXXO Pay', status: 'Completed' },
      { upya_id: 'upya-pay-005', transaction_id: 'TXN-005', contract_id: 'upya-contract-005', client_id: 'upya-client-001', amount: 450.00, method: 'Tarjeta de Débito', status: 'Completed' }
    ];

    for (const p of payments) {
      await pool.query(
        'INSERT INTO payments (upya_id, transaction_id, tenant_id, contract_id, client_id, amount, method, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [p.upya_id, p.transaction_id, tenantId, p.contract_id, p.client_id, p.amount, p.method, p.status]
      );
    }
    console.log('✅ Inserted 5 payments.');

    console.log('\n🎉 Mock data injection v2 for ' + tenantId + ' completed successfully!');
    
  } catch (error) {
    console.error('❌ Error during mock data injection:', error);
  } finally {
    process.exit(0);
  }
}

seedSotelo();
