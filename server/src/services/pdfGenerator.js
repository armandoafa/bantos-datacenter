import puppeteer from 'puppeteer';
import pool from '../config/db.js';

export async function generateStatementPDF(tenantId, paymentData) {
  // 1. Fetch tenant org structure for Company Name
  const [orgRows] = await pool.query('SELECT name FROM org_structure WHERE tenant_id = ? AND type = "headquarters" LIMIT 1', [tenantId]);
  const companyName = orgRows.length > 0 ? orgRows[0].name : 'Bantos Platform';
  
  // paymentData should have: amount, date, client_name, contract_id, remaining_balance, voucher_folio
  const htmlContent = `
    <html>
      <head>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
          .title { font-size: 28px; font-weight: bold; color: #1e293b; }
          .company { font-size: 18px; color: #64748b; font-weight: bold; text-transform: uppercase; }
          .details { margin-bottom: 30px; }
          .details table { width: 100%; border-collapse: collapse; }
          .details th { text-align: left; padding: 8px 0; color: #64748b; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #eee; }
          .details td { padding: 12px 0; font-size: 16px; font-weight: 500; border-bottom: 1px solid #eee; }
          .amount-box { background-color: #f8fafc; padding: 20px; border-radius: 12px; text-align: center; margin-bottom: 30px; }
          .amount-box .label { font-size: 14px; color: #64748b; margin-bottom: 5px; }
          .amount-box .value { font-size: 32px; font-weight: bold; color: #10b981; }
          .footer { text-align: center; font-size: 12px; color: #94a3b8; margin-top: 50px; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">Estado de Cuenta</div>
            <div style="font-size: 14px; color: #64748b; margin-top: 8px; font-weight: 500;">Dispositivo: ${paymentData.device_name || 'N/A'}</div>
          </div>
          <div class="company">${companyName}</div>
        </div>
        
        <div class="amount-box">
          <div class="label">Monto Pagado</div>
          <div class="value">$${parseFloat(paymentData.amount).toFixed(2)}</div>
        </div>

        <div class="details">
          <table>
            <tr>
              <th>Cliente</th>
              <td>${paymentData.client_name}</td>
            </tr>
            <tr>
              <th>No. Contrato</th>
              <td>${paymentData.contract_id}</td>
            </tr>
            <tr>
              <th>Folio / Referencia</th>
              <td>${paymentData.voucher_folio || 'N/A'}</td>
            </tr>
            <tr>
              <th>Fecha de Pago</th>
              <td>${new Date(paymentData.date).toLocaleDateString()}</td>
            </tr>
            ${paymentData.is_financed ? `
            <tr>
              <th>Plan de Financiamiento</th>
              <td>${paymentData.plan_name || 'Financiamiento'}</td>
            </tr>
            <tr>
              <th>Costo Total del Dispositivo</th>
              <td>$${parseFloat(paymentData.total_device_value || 0).toFixed(2)}</td>
            </tr>
            ` : `
            <tr>
              <th>Saldo Restante</th>
              <td>$${parseFloat(paymentData.remaining_balance || 0).toFixed(2)}</td>
            </tr>
            `}
          </table>
        </div>

        ${paymentData.is_financed && paymentData.paid_history && paymentData.paid_history.length > 0 ? `
        <div class="details" style="margin-top: 40px;">
          <h3 style="font-size: 16px; color: #1e293b; margin-bottom: 15px; text-transform: uppercase;">Historial de Pagos Realizados (${paymentData.paid_history.length} de ${paymentData.total_iterations || 'N/A'})</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr>
                <th style="text-align: left; padding: 8px 0; color: #64748b; font-size: 12px; border-bottom: 2px solid #eee;">Iteración</th>
                <th style="text-align: left; padding: 8px 0; color: #64748b; font-size: 12px; border-bottom: 2px solid #eee;">Fecha de Pago</th>
                <th style="text-align: right; padding: 8px 0; color: #64748b; font-size: 12px; border-bottom: 2px solid #eee;">Monto</th>
              </tr>
            </thead>
            <tbody>
              ${paymentData.paid_history.map((hist, index) => `
              <tr>
                <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eee;">Pago #${index + 1}</td>
                <td style="padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eee;">${new Date(hist.date).toLocaleDateString()}</td>
                <td style="text-align: right; padding: 10px 0; font-size: 14px; border-bottom: 1px solid #eee;">$${parseFloat(hist.amount).toFixed(2)}</td>
              </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ` : ''}

        <div class="footer">
          Este documento es un comprobante de pago generado electrónicamente por la plataforma.
        </div>
      </body>
    </html>
  `;

  // Use puppeteer to generate PDF
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  await browser.close();

  return pdfBuffer;
}
