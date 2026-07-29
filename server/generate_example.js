import { generateStatementPDF } from './src/services/pdfGenerator.js';
import fs from 'fs';

async function run() {
  try {
    const paymentData = {
      amount: 1500.50,
      client_name: 'Juan Pérez',
      contract_id: 'CTR-2023-0892',
      voucher_folio: 'PAY-1698239012',
      date: new Date(),
      device_name: 'Samsung Galaxy S24 Ultra 256GB',
      is_financed: true,
      plan_name: 'Instalment 12 Meses',
      total_device_value: 18000.00,
      total_iterations: 12,
      paid_history: [
        { date: '2025-10-29T10:00:00', amount: 1500.50 },
        { date: '2025-11-29T10:00:00', amount: 1500.50 },
        { date: '2025-12-29T10:00:00', amount: 1500.50 },
        { date: '2026-01-29T10:00:00', amount: 1500.50 }
      ]
    };
    const pdfBuffer = await generateStatementPDF('tenant_test', paymentData);
    fs.writeFileSync('./Estado_De_Cuenta_Ejemplo.pdf', pdfBuffer);
    console.log('PDF Generado Exitosamente');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
run();
