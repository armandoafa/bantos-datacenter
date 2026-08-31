
export function generateContractHTML(data) {
  const { 
    fullName, address, phoneNumber, personId, 
    brand, model, imei, serialNumber, paygNumber,
    upfrontpayment, totalcost, terms, repayment, 
    signature, date 
  } = data;

  const formattedDate = date ? new Date(date).toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '__/__/____';

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #000;
            line-height: 1.6;
            margin: 0;
            padding: 0;
            padding-bottom: 60px; /* Espacio para el footer */
            background-color: white;
            font-size: 11pt;
        }
        .page-break {
            page-break-before: always;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .title {
            font-size: 14pt;
            font-weight: bold;
            margin: 0;
            text-transform: uppercase;
        }
        .date-section {
            text-align: left;
            margin-bottom: 25px;
        }
        .section-title {
            font-size: 12pt;
            font-weight: bold;
            text-transform: uppercase;
            margin-top: 25px;
            margin-bottom: 15px;
        }
        .data-grid {
            margin-bottom: 25px;
        }
        .field {
            margin-bottom: 10px;
        }
        .clauses {
            text-align: justify;
        }
        .clauses p {
            margin-bottom: 15px;
        }
        .clauses ul {
            padding-left: 20px;
            list-style-type: disc;
        }
        .clauses li {
            margin-bottom: 15px;
            line-height: 1.5;
        }
        .signature-section {
            margin-top: 50px;
            display: flex;
            justify-content: space-between;
            page-break-inside: avoid;
        }
        .signature-box {
            width: 45%;
        }
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 50px;
            padding-top: 5px;
            font-size: 11pt;
        }
        .signature-image {
            max-height: 80px;
            margin-bottom: -45px;
            display: block;
            mix-blend-mode: multiply;
            position: relative;
            z-index: 10;
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            text-align: left;
            font-size: 9pt;
            color: #000;
            line-height: 1.4;
            border-top: 1px solid #eee;
            padding-top: 10px;
            background: white;
        }
    </style>
</head>
<body>
    <div class="footer">
        CARRETERA INTERNACIONAL CRISTOBAL COLON KM 18.1<br>
        SAN SEBASTIAN DE LAS FLORES, SAN PABLO ETLA.<br>
        OAXACA<br>
        TEL: 8005502250
    </div>

    <!-- PÁGINA 1 -->
    <div class="header">
        <h1 class="title">CONTRATO DE VENTA DE TELÉFONO A CRÉDITO</h1>
    </div>

    <div class="date-section">
        Fecha: ${formattedDate}
    </div>

    <div class="section-title">DATOS DEL CLIENTE</div>
    <div class="data-grid">
        <div class="field">Nombre completo: ${fullName || '__________________________________'}</div>
        <div class="field">Dirección: ${address || '__________________________________'}</div>
        <div class="field">Teléfono: ${phoneNumber || '__________________________________'}</div>
        <div class="field">Identificación (INE/Pasaporte): ${personId || '__________________________________'}</div>
    </div>

    <div class="section-title">DATOS DEL EQUIPO ENTREGADO</div>
    <div class="data-grid">
        <div class="field">Marca: ${brand || '__________________________________'}</div>
        <div class="field">Modelo: ${model || '__________________________________'}</div>
        <div class="field">IMEI: ${paygNumber || imei || '__________________________________'}</div>
        <div class="field">DN: ${serialNumber || '__________________________________'}</div>
    </div>

    <div class="section-title">CONDICIONES DE LA VENTA</div>
    <div class="data-grid">
        <div class="field">Monto total: $${Number(totalcost || 0).toLocaleString()} MXN</div>
        <div class="field">Modalidad de pago: ${terms || '__________________________________'}</div>
        <br>
        <div class="field">Fechas de pago acordadas: ${repayment || '__________________________________'}</div>
    </div>

    <!-- PÁGINA 2 -->
    <div class="page-break"></div>
    <div class="section-title">CLÁUSULAS</div>
    <div class="clauses">
        <p>El CLIENTE acepta que el dispositivo cuenta con un sistema de administración de seguridad remoto. En caso de incumplimiento de pago en la fecha acordada, el CLIENTE autoriza de manera irrevocable:</p>
        <ul>
            <li>El bloqueo total e inmediato de las funciones del equipo (pantalla, llamadas, apps y datos).</li>
            <li>La imposibilidad de uso del dispositivo hasta que el saldo vencido sea liquidado.</li>
            <li>El pago de una penalización de $50.00 por concepto de "Reactivación de Sistema" tras un bloqueo.</li>
            <li>El cliente declara recibir el equipo descrito anteriormente en buen estado y acepta que la compra se realiza bajo la modalidad de pago a crédito.</li>
            <li>El cliente se compromete a cumplir con los pagos en las fechas establecidas.</li>
            <li>El equipo podrá permanecer bloqueado hasta que el cliente liquide el saldo pendiente o regularice su pago.</li>
            <li>Este documento sirve como comprobante del acuerdo de compra a crédito entre ambas partes.</li>
        </ul>
    </div>

    <br>
    <div class="section-title">FIRMAS</div>
    <div class="signature-section">
        <div class="signature-box">
            <div>Cliente</div>
            ${signature ? '<img src="' + signature + '" class="signature-image" />' : '<br><br><br>'}
            <div class="signature-line">Nombre y Firma: ${fullName || '____________________________________'}</div>
        </div>
        <div class="signature-box">
            <div>Vendedor</div>
            <br><br><br>
            <div class="signature-line">Nombre y Firma: ____________________________________</div>
        </div>
    </div>

</body>
</html>
  `;
}

export function generateVoucherHTML(data) {
  const { 
    clientName, clientNumber, amount, method, status, 
    paymentDate, contractNumber, transactionId, tenantName
  } = data;

  const formattedDate = paymentDate ? new Date(paymentDate).toLocaleDateString('es-MX', { 
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' 
  }) : 'N/A';

  const s = (status || '').toUpperCase();
  const isOk = ['PAID', 'VALIDATED', 'ACCEPTED', 'ACEPTADO', 'PAGADO', 'VALIDADO', 'SUCCESS'].includes(s);
  const isFailed = ['FAILED', 'FALLADO', 'REJECTED', 'CANCELED', 'RECHAZADO', 'CANCELADO', 'REVERSED', 'DECLINED'].includes(s);
  
  let statusText = 'PAGO PENDIENTE';
  let statusColor = '#f59e0b'; // Amber
  if (isOk) {
    statusText = 'PAGO PROCESADO EXITOSAMENTE';
    statusColor = '#00a859'; // Green
  } else if (isFailed) {
    statusText = 'PAGO RECHAZADO / FALLIDO';
    statusColor = '#ef4444'; // Red
  }

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @page {
            size: A4;
            margin: 15mm;
        }
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #333;
            line-height: 1.5;
            font-size: 10pt;
        }
        .header {
            text-align: center;
            border-bottom: 2px solid ${statusColor};
            padding-bottom: 10px;
            margin-bottom: 20px;
        }
        .logo {
            font-size: 18pt;
            font-weight: 900;
            color: ${statusColor};
            text-transform: uppercase;
        }
        .voucher-title {
            font-size: 12pt;
            font-weight: bold;
            margin-top: 5px;
            color: #666;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-bottom: 20px;
        }
        .label {
            font-weight: bold;
            color: #888;
            font-size: 8pt;
            text-transform: uppercase;
        }
        .value {
            font-weight: bold;
            font-size: 10pt;
        }
        .amount-box {
            background-color: #f8fafc;
            border: 1px solid ${statusColor};
            border-radius: 10px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
        }
        .amount-label {
            font-size: 9pt;
            color: ${statusColor};
            font-weight: bold;
            text-transform: uppercase;
        }
        .amount-value {
            font-size: 24pt;
            font-weight: 900;
            color: ${statusColor};
        }
        .footer {
            text-align: center;
            font-size: 8pt;
            color: #aaa;
            margin-top: 30px;
            border-top: 1px solid #eee;
            padding-top: 10px;
        }
        .watermark {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 60pt;
            font-weight: 900;
            color: rgba(0, 0, 0, 0.03);
            z-index: -1;
            white-space: nowrap;
        }
    </style>
</head>
<body>
    <div class="watermark">${s}</div>
    
    <div class="header">
        <div class="logo">${tenantName || 'Play Cell'}</div>
        <div class="voucher-title">Comprobante de Pago</div>
    </div>

    <div class="info-grid">
        <div>
            <div class="label">Fecha y Hora</div>
            <div class="value">${formattedDate}</div>
        </div>
        <div style="text-align: right;">
            <div class="label">Folio de Operación</div>
            <div class="value">${transactionId || 'N/A'}</div>
        </div>
    </div>

    <div style="margin-bottom: 20px;">
        <div class="label">Cliente</div>
        <div class="value">${clientName} (${clientNumber || 'S/N'})</div>
    </div>

    <div class="info-grid">
        <div>
            <div class="label">Contrato Asociado</div>
            <div class="value">${contractNumber || 'Venta Directa'}</div>
        </div>
        <div style="text-align: right;">
            <div class="label">Método de Pago</div>
            <div class="value">${method}</div>
        </div>
    </div>

    <div class="amount-box" style="border-color: ${statusColor}">
        <div class="amount-label" style="color: ${statusColor}">Monto Total Recibido</div>
        <div class="amount-value" style="color: ${statusColor}">$${Number(amount || 0).toLocaleString()} MXN</div>
        <div style="font-weight: bold; margin-top: 5px; color: ${statusColor};">${statusText}</div>
    </div>

    <div class="footer">
        Este documento es un comprobante de recepción de pago electrónico.<br>
        Bantos Cloud - Sistema de Gestión de Cobranza.
    </div>
</body>
</html>
  `;
}
