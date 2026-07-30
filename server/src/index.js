import nodemailer from 'nodemailer';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import UpyaManageClient from '../modules/upya-api-client/src/index.js';
import pool from './config/db.js';
import { scrapeTrustonic } from './services/trustonic.js';
import * as trustonicApi from './services/trustonicApi.js';
import dynamicore from './services/dynamicore.js';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';
import puppeteer from 'puppeteer';
import { generateContractHTML, generateVoucherHTML } from './pdf-template.js';

const require = createRequire(import.meta.url);
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const ImageModule = require('docxtemplater-image-module-free');
const sizeOf = require('image-size');

const multer = require('multer');

// Helper: Sanitizar valores para columnas DECIMAL en MySQL
const safeDecimal = (val) => {
  const n = parseFloat(val);
  if (isNaN(n) || !isFinite(n)) return 0;
  // Evitar desbordamiento de decimal(20,2) -> max 18 dígitos enteros
  if (n > 999999999999999999.99) return 999999999999999999.99;
  if (n < -999999999999999999.99) return -999999999999999999.99;
  return n;
};

// Helper: Garantizar que un cliente tenga Wallet/CLABE e iniciar pago recurrente
async function ensureClientWallet(clientId, tenantId, amount = null) {
  if (!clientId || !tenantId) return;
  try {
    const [clients] = await pool.query('SELECT * FROM client_history WHERE upya_id = ? AND tenant_id = ?', [clientId, tenantId]);
    if (clients.length === 0) return;
    const clientData = clients[0];

    let clabe = clientData.clabe;
    let dcClientId = clientData.wallet_client_id;
    let dcAccountId = clientData.wallet_account_id;

    // 1. Generar Wallet si no existe
    if (!clabe) {
      console.log(`>>> [AUTO-STP] Iniciando generación de Wallet para: ${clientData.name} (${clientId})`);

      // Paso 1: Crear Cliente en DynamiCore
      if (!dcClientId) {
        const dcClient = await dynamicore.createClient({ 
          name: clientData.name, 
          email: clientData.email, 
          rfc: null // Se genera uno genérico en el servicio
        });
        // Capturar ID del objeto directo o del array de respuesta
        dcClientId = dcClient.id || dcClient.message?.data?.[0]?.id;
      }

      // Paso 2: Crear Cuenta/Wallet
      if (dcClientId && !dcAccountId) {
        const dcAccount = await dynamicore.createAccount(dcClientId);
        // Capturar ID del objeto directo o del array de respuesta
        dcAccountId = dcAccount.id || dcAccount.message?.data?.[0]?.id;
      }

      // Paso 3: Consultar CLABE
      if (dcAccountId) {
        await new Promise(r => setTimeout(r, 2000));
        const resAccount = await dynamicore.getAccount(dcAccountId);
        // Extraer cuenta del mensaje o del objeto raíz
        const accountData = resAccount.message?.data?.[0] || resAccount;
        clabe = accountData.properties?.clabe;

        // Guardar en DB
        await pool.query(
          'UPDATE client_history SET wallet_client_id = ?, wallet_account_id = ?, clabe = ? WHERE upya_id = ? AND tenant_id = ?',
          [dcClientId, dcAccountId, clabe || null, clientId, tenantId]
        );
        
        console.log(`>>> [AUTO-STP] Wallet finalizada para ${clientId}. CLABE: ${clabe || 'PENDIENTE'}`);
      }
    }

    // 2. Si ya tenemos CLABE y se especificó un monto, crear solicitud de pago en Conekta
    if (clabe && amount) {
      console.log(`>>> [CONEKTA] Creando solicitud SPEI para ${clientData.name} por $${amount}`);
      const speiRes = await dynamicore.createConektaSpeiPayment({
        amount: amount,
        description: `Pago Recurrente Bantos - ${clientData.name}`,
        customerName: clientData.name,
        customerEmail: clientData.email,
        customerPhone: null // El servicio pondrá uno genérico
      });
      console.log(`>>> [CONEKTA] Solicitud SPEI creada exitosamente:`, speiRes.id || speiRes.message);
    }

  } catch (e) {
    console.error(`[AUTO-GATEWAY Error] para cliente ${clientId}:`, e.response?.data || e.message);
  }
}

dotenv.config();


const app = express();
const PORT = 4000;

// Orígenes permitidos - se acepta tanto admin.bantos.cloud como bantos.cloud
const allowedOrigins = [
  'https://bantos.cloud',
  'https://admin.bantos.cloud',
  'https://insight.bantos.cloud',
  'https://payment.bantos.cloud',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir requests sin origin (ej. curl, Postman, mobile apps)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS bloqueado para el origen: ${origin}`));
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));


app.post('/api/backoffice/send-document', async (req, res) => {
  console.log('>>> Request: POST /api/backoffice/send-document', req.body);
  const { to, type, id, tenantId } = req.body;
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    return res.status(500).json({ error: 'Configuración de email (EMAIL_USER/EMAIL_PASS) no encontrada' });
  }

  try {
    let pdfBuffer;
    let filename;

    const browser = await puppeteer.launch({ 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined, 
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();

    if (type === 'payment') {
      const [payments] = await pool.query(
        'SELECT p.*, c.name as client_name, c.client_number, ch.contract_number FROM payments p LEFT JOIN client_history c ON p.client_id = c.upya_id LEFT JOIN contract_history ch ON p.contract_id = ch.contract_number WHERE p.id = ? AND p.tenant_id = ?',
        [id, tenantId]
      );
      if (payments.length === 0) throw new Error('Pago no encontrado');
      const p = payments[0];
      const html = generateVoucherHTML({
        clientName: p.client_name || '---', clientNumber: p.client_number || '---',
        amount: p.amount, method: p.method, status: p.status, paymentDate: p.payment_date,
        contractNumber: p.contract_id, transactionId: p.transaction_id || `P-${p.id}`, tenantName: 'Bantos'
      });
      await page.setContent(html);
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      filename = `Voucher_Pago_${id}.pdf`;
    } else {
      const [contracts] = await pool.query('SELECT * FROM contract_history WHERE upya_id = ? AND tenant_id = ?', [id, tenantId]);
      if (contracts.length === 0) throw new Error('Contrato no encontrado');
      const c = contracts[0];
      const html = generateContractHTML(c);
      await page.setContent(html);
      pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
      filename = `Contrato_${id}.pdf`;
    }

    await browser.close();

    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: `Se adjunta documento: ${type === 'payment' ? 'Voucher de Pago' : 'Contrato'}`,
      text: `Se adjunta documento: ${type === 'payment' ? 'Voucher de Pago' : 'Contrato'}.\nPuede visualizarlo en el archivo adjunto.`,
      attachments: [{ filename, content: pdfBuffer }]
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: true });
  } catch (e) {
    console.error('Error enviando correo:', e);
    res.status(500).json({ error: e.message });
  }
});


console.log('>>> Registro de ruta: /api/backoffice/send-document');



// Servir archivos firmados estáticamente e inicializar directorios
const SIGNED_DIR = path.join(process.cwd(), 'signed');
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);
if (!fs.existsSync(SIGNED_DIR)) fs.mkdirSync(SIGNED_DIR);
app.use('/signed-contracts', express.static(SIGNED_DIR));


const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

app.use('/api/uploads', express.static(UPLOADS_DIR));

app.post('/api/backoffice/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `https://bantos.cloud/datacenter-api/uploads/${req.file.filename}`;
  res.json({ success: true, url });
});

// Utilidad: descargar todas las páginas de una colección
// Utilidad: descargar todas las páginas de una colección filtrando opcionalmente por tenantId
async function fetchAll(upya, collection, pageSize = 100, tenantId = null) {
  const all = [];
  let currentSkip = 0;

  // Mapeo de colecciones a métodos del API Client
  const clientEndpointsMap = {
    clients: upya.clients,
    contracts: upya.contracts,
    assets: upya.assets,
    payments: upya.payments,
    products: upya.products,
    deals: upya.deals,
    agents: upya.agents,
    users: upya.users,
    messages: upya.messages,
  };

  const endpoint = clientEndpointsMap[collection];

  try {
    while (true) {
      const query = tenantId ? { tenantId } : {};
      let page;
      if (endpoint && typeof endpoint.search === 'function') {
        page = await endpoint.search(query, { limit: pageSize, skip: currentSkip });
      } else {
        // Fallback genérico si no hay endpoint específico
        const client = ['payments', 'products', 'deals', 'assets', 'clients'].includes(collection)
          ? upya.dataClient
          : upya.apiClient;
        const res = await client.post(`/data/search/${collection}`, { query, limit: pageSize, skip: currentSkip });
        page = res.data;
      }

      if (!Array.isArray(page)) page = page?.data || page?.results || [];
      if (!Array.isArray(page) || page.length === 0) break;
      all.push(...page);
      if (page.length < pageSize) break;
      currentSkip += pageSize;
    }
    console.log(`[fetchAll] ${collection} fetched: ${all.length} items`);
  } catch (e) {
    console.error(`[fetchAll Error] ${collection}:`, e.message);
  }
  return all;
}

async function fetchSignatureAsBase64(upya, clientId) {
  if (!clientId) return null;
  try {
    const forms = await upya.dataCollections.search({ clientId: clientId }, { limit: 20 });
    
    let formsList = forms;
    if (!Array.isArray(formsList)) formsList = formsList?.data || formsList?.results || [];
    if (!Array.isArray(formsList) || formsList.length === 0) return null;

    // Buscar el formulario de onboarding que tenga una firma (priorizando los más recientes)
    const onboardingForm = formsList
      .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      .find(f => 
        (f.questionnaire?.name?.toLowerCase().includes('onboarding') || f.questionnaire?.name?.toLowerCase().includes('basic')) &&
        f.creditItems?.some(i => i.isSignature === true)
      );

    if (!onboardingForm) return null;

    const signItem = onboardingForm.creditItems.find(i => i.isSignature === true);
    if (!signItem) return null;

    const signedUrlDataList = await upya.dataCollections.getSignedUrls([signItem._id]);

    const signedUrlData = signedUrlDataList?.[0];
    if (signedUrlData && signedUrlData.URL) {
        const imgRes = await axios.get(signedUrlData.URL, { responseType: 'arraybuffer' });
        const base64 = Buffer.from(imgRes.data, 'binary').toString('base64');
        return `data:image/jpeg;base64,${base64}`;
    }
  } catch (e) {
    console.error(`[fetchSignatureAsBase64] Error for client ${clientId}:`, e.message);
  }
  return null;
}

// --- MOTOR DE SINCRONIZACIÓN COMPLETO ---
app.post('/api/sync/bootstrap', async (req, res) => {
  const { tenantId } = req.body;
  const targetTenant = tenantId || 'c-romel';
  console.log(`>>> [SYNC] Petición recibida para Tenant: ${targetTenant}. Iniciando en segundo plano...`);
  
  // Devolver respuesta inmediatamente para evitar 504 Timeout de Nginx
  res.json({ success: true, message: 'Sincronización masiva iniciada en segundo plano.' });

  // Ejecutar todo el motor de sincronización de manera asíncrona
  (async () => {
    let stats = { clients: 0, contracts: 0, inventory: 0, products: 0, dataCollections: 0, payments: 0 };
    try {
    // Leer credenciales de Upya desde la tabla tenants
    const [tenantRows] = await pool.query('SELECT upya_user, upya_pass FROM tenants WHERE tenant_id = ?', [targetTenant]);
    const syncUser = tenantRows[0]?.upya_user || process.env.UPYA_USER;
    const syncPass = tenantRows[0]?.upya_pass || process.env.UPYA_PASS;
    console.log(`[SYNC] Usando credenciales Upya: ${syncUser} para tenant ${targetTenant}`);

    const upya = new UpyaManageClient(syncUser, syncPass, targetTenant);
    await upya.authenticate();

    // Comprobar si tenemos acceso a la API (verificando si obtenemos 403)
    try {
      await upya.apiClient.post('/data/search/clients', { query: { tenantId: targetTenant }, limit: 1 });
    } catch (testErr) {
      if (testErr.response?.status === 403 || testErr.response?.status === 401 || testErr.message.includes('403') || testErr.message.includes('Access Denied')) {
        console.warn(`[SYNC] Acceso a la API denegado (403). Iniciando Fallback Scraper Automático para ${targetTenant} con usuario ${syncUser}...`);
        
        // Ejecutar Scraper con las credenciales del request (o del env)
        const { scrapeUpyaData } = await import('./upyaScraper.js');
        const scrapedData = await scrapeUpyaData(syncUser, syncPass);
        
        // Volcar inteligentemente
        const { syncScrapedData } = await import('./scraperSync.js');
        await syncScrapedData(scrapedData, pool, targetTenant);
        
        console.log(`>>> [SYNC] Sincronización completada vía Scraper para ${targetTenant}`);
        return;
      }
      throw testErr; // Si es otro error, lo lanzamos
    }

    // Si pasamos el test, usar API normal:
    // 1. Clientes
    try {
      const cliList = await fetchAll(upya, 'clients', 100, targetTenant);
      for (const c of cliList) {
        const name = `${c.profile?.firstName || ''} ${c.profile?.lastName || ''}`.trim() || c.name || 'Sin Nombre';
        const id = c.id || c._id || c.clientNumber;
        if (id) {
          await pool.query(
            'INSERT INTO client_history (upya_id, client_number, tenant_id, name, email) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), client_number=VALUES(client_number), email=VALUES(email)',
            [id, c.clientNumber || null, targetTenant, name, c.contact?.email || c.email || '']
          );
          stats.clients++;
        }
      }
    } catch (e) { console.error('Error in clients sync:', e.message); }

    // 1b. Agentes (Usuarios de Bantos)
    try {
      const agentList = await fetchAll(upya, 'agents', 100, targetTenant);
      for (const a of agentList) {
        const id = a.id || a._id;
        const name = a.name || `${a.profile?.firstName || ''} ${a.profile?.lastName || ''}`.trim();
        const upyaOrgId = a.shop?.id || a.branch?.id || a.organisation?.id;

        if (id) {
          const [uRes] = await pool.query(
            `INSERT INTO users (upya_id, tenant_id, username, contact_name, email, role) 
             VALUES (?, ?, ?, ?, ?, 'agent') 
             ON DUPLICATE KEY UPDATE contact_name=VALUES(contact_name), email=VALUES(email)`,
            [id, targetTenant, a.username || id, name, a.contact?.email || '']
          );
          
          const userId = uRes.insertId || (await pool.query('SELECT id FROM users WHERE upya_id = ?', [id]))[0][0].id;
          
          if (upyaOrgId) {
            await pool.query(
              `INSERT INTO user_scopes (user_id, org_id, role, tenant_id) 
               SELECT ?, id, 'STAFF', ? FROM org_structure WHERE upya_id = ?
               ON DUPLICATE KEY UPDATE org_id=VALUES(org_id)`,
              [userId, targetTenant, upyaOrgId]
            );
          }
        }
      }
    } catch (e) { console.error('Error in agents sync to users:', e.message); }


    // 2. Contratos
    try {
      const conList = await fetchAll(upya, 'contracts', 100, targetTenant);
      for (const con of conList) {
        try {
          const id = con.id || con._id;
          let upyaClientId = con.client?.id || con.clientId || con.client_id;
          const clientNumber = con.client?.clientNumber || con.client_number;

          // Si no tenemos el ID interno de Upya, intentamos buscarlo por clientNumber
          if (!upyaClientId && clientNumber) {
            try {
              const cliSearchList = await upya.clients.search({ clientNumber: clientNumber }, { limit: 1 });
              const foundCli = cliSearchList?.[0] || cliSearchList?.data?.[0];
              if (foundCli) {
                upyaClientId = foundCli.id || foundCli._id;
                console.log(`[SYNC] Resolved clientId ${upyaClientId} for clientNumber ${clientNumber}`);
              }
            } catch (searchErr) {
              console.warn(`[SYNC] Could not resolve clientId for ${clientNumber}:`, searchErr.message);
            }
          }

          const productName = con.productName || con.product?.name || 'Unknown';
          const dealName = con.dealName || con.deal?.name || 'Default';
          const totalValue = safeDecimal(con.totalValue || con.totalCost || con.total_value || 0);
          const paidValue = safeDecimal(con.paidValue || con.totalPaid || con.paid_value || 0);
          const fechaUpya = con.signingDate || con.entryDate || con.submissionDate || con.createdAt || con.created_at || null;
          const createdAt = fechaUpya ? new Date(fechaUpya) : null;

          // Intentar obtener la firma de Upya si tenemos el ID
          let signatureBase64 = null;
          if (upyaClientId) {
            try {
              signatureBase64 = await fetchSignatureAsBase64(upya, upyaClientId);
            } catch (sigErr) {
              console.error(`[SYNC] Could not fetch signature for contract ${id}:`, sigErr.message);
            }
          }

          const upfrontPayment = safeDecimal(con.pricingSchedule?.upfrontPayment || 0);

          const upyaAgentId = con.agent?.id || con.agentId;
          const upyaShopId = con.shop?.id || con.shopId || con.branch?.id;

          await pool.query(
            `INSERT INTO contract_history (
              upya_id, contract_number, tenant_id, client_id, client_number, 
              product_name, deal_name, total_value, paid_value, upfront_payment, status, 
              created_at_upya, signature_image, org_id, created_by_user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 
              (SELECT id FROM org_structure WHERE upya_id = ? LIMIT 1),
              (SELECT id FROM users WHERE upya_id = ? LIMIT 1)
            ) 
            ON DUPLICATE KEY UPDATE 
              status=VALUES(status), created_at_upya=VALUES(created_at_upya), 
              client_id=VALUES(client_id), client_number=VALUES(client_number), 
              product_name=VALUES(product_name), deal_name=VALUES(deal_name), 
              total_value=VALUES(total_value), paid_value=VALUES(paid_value),
              upfront_payment=VALUES(upfront_payment),
              org_id=VALUES(org_id), created_by_user_id=VALUES(created_by_user_id),
              signature_image = COALESCE(VALUES(signature_image), signature_image)`,
            [
              id, con.contractNumber || null, targetTenant, upyaClientId || null, clientNumber || null, 
              productName, dealName, totalValue, paidValue, upfrontPayment, con.status || con.onboardingStatus || 'Active', 
              createdAt, signatureBase64, upyaShopId, upyaAgentId
            ]
          );
          stats.contracts++;
        } catch (itemErr) {
          console.error(`[SYNC] Error processing contract ${con.id || con._id}:`, itemErr.message);
        }
      }
    } catch (e) { console.error('Error in contracts sync:', e.message); }

    // 3. Inventario
    try {
      // Pre-cargar productos para fuzzy matching del inventario
      let existingProducts = [];
      try {
        const [prodRows] = await pool.query('SELECT name FROM products WHERE tenant_id = ?', [targetTenant]);
        existingProducts = prodRows.map(r => r.name);
      } catch (e) { console.error('Error cargando productos para fuzzy match', e.message); }

      const fuzzyMatch = (invModel, prodName) => {
        if (!invModel || !prodName) return false;
        const iM = invModel.toLowerCase();
        const pN = prodName.toLowerCase();
        if (iM === pN) return true;
        if (iM.includes(pN) || pN.includes(iM)) return true;
        
        const extractWords = (str) => str.replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 2);
        const iMWords = extractWords(iM);
        const pNWords = extractWords(pN);
        
        const intersection = iMWords.filter(w => pNWords.includes(w));
        return intersection.length >= 2 && intersection.some(w => /\d/.test(w));
      };

      const invList = await fetchAll(upya, 'assets', 100, targetTenant);
      for (const a of invList) {
        const id = a.id || a._id || a.serialNumber || a.assetNumber;
        if (id) {
          const rawModel = a.productDetails?.name || a.model_name || 'Generic';
          let finalModel = rawModel;
          const match = existingProducts.find(p => fuzzyMatch(rawModel, p));
          if (match) {
            finalModel = match;
          }

          await pool.query(
            'INSERT INTO inventory (upya_id, serial_number, tenant_id, model, status) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE model=VALUES(model), status=VALUES(status)',
            [id, a.serialNumber || a.serial_number || 'N/S', targetTenant, finalModel, a.status || 'Ready']
          );
          stats.inventory++;
        }
      }
    } catch (e) { console.error('Error in inventory sync:', e.message); }

    // 3b. Pagos
    try {
      const payList = await fetchAll(upya, 'payments', 100, targetTenant);
      for (const p of payList) {
        const id = p.id || p._id || p.transactionId || p.reference;
        if (id) {
          const upyaAgentId = p.agent?.id || p.agentId;
          const upyaShopId = p.shop?.id || p.shopId || p.branch?.id;

          await pool.query(
            `INSERT INTO payments (
              upya_id, transaction_id, tenant_id, contract_id, amount, method, status, payment_date,
              org_id, created_by_user_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,
              (SELECT id FROM org_structure WHERE upya_id = ? LIMIT 1),
              (SELECT id FROM users WHERE upya_id = ? LIMIT 1)
            ) 
            ON DUPLICATE KEY UPDATE 
              status=VALUES(status), 
              org_id=VALUES(org_id), 
              created_by_user_id=VALUES(created_by_user_id)`,
            [
              id, p.transactionId || null, targetTenant, p.contractNumber || p.contract_id || null, 
              p.amount || 0, p.type || p.method || 'Unknown', p.status || 'Paid', 
              (p.date || p.payment_date || p.timestamp) ? new Date(p.date || p.payment_date || p.timestamp) : null,
              upyaShopId, upyaAgentId
            ]
          );
          stats.payments++;
        }
      }
    } catch (e) { console.error('Error in payments sync:', e.message); }

    // 4. Productos
    try {
      let proList = await fetchAll(upya, 'products', 100, targetTenant);
      if (proList.length === 0) proList = await fetchAll(upya, 'master-products', 100, targetTenant);

      for (const p of proList) {
        const id = p.id || p._id || p.productReference || p.reference; 
        const name = p.name || p.productDetails?.name || 'Producto sin nombre';
        if (id && name) {
          let isSerialized = true;
          if (p.nonSerialized === true) isSerialized = false;

          await pool.query(
            `INSERT INTO products (
              upya_id, tenant_id, name, category, reference, is_lockable, manufacturer, 
              is_serialized, description, status, picture_url, tac, build, 
              default_managed_by, base_value
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
              name=VALUES(name), category=VALUES(category), reference=VALUES(reference),
              is_lockable=VALUES(is_lockable), manufacturer=VALUES(manufacturer),
              is_serialized=VALUES(is_serialized), description=VALUES(description),
              status=VALUES(status), picture_url=VALUES(picture_url), tac=VALUES(tac),
              build=VALUES(build), default_managed_by=VALUES(default_managed_by),
              base_value=VALUES(base_value)`,
            [
              id, targetTenant, name, p.category || p.productDetails?.category, p.productReference || p.reference, 
              p.lockable || false, p.manufacturer || p.productDetails?.manufacturer, 
              isSerialized, p.description || '', p.status || 'Active',
              p.picture_url || (p.commercial?.picture_url),
              p.tac, p.build, p.default_managed_by,
              p.base_value || (p.commercial?.base_value || 0)
            ]
          );
          stats.products++;
        }
      }
    } catch (e) { console.error('Error in products sync:', e.message); }

    // 4b. Deals (Términos)
    try {
      const dealList = await fetchAll(upya, 'deals', 100, targetTenant);
      for (const d of dealList) {
        const id = d.id || d._id || d.dealNumber;
        if (id) {
          await pool.query(
            'INSERT INTO payment_plans (upya_id, tenant_id, type, name, product_name, total_cost, status) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), name=VALUES(name), product_name=VALUES(product_name), total_cost=VALUES(total_cost), status=VALUES(status)',
            [id, targetTenant, d.type || 'PAYG', d.dealName || d.name || 'Sin nombre', d.productName || d.product?.name || (d.products?.length ? `${d.products.length} products` : 'Multiple'), d.totalCost || d.total_cost || 'Open', d.status || 'Active']
          );
          stats.deals = (stats.deals || 0) + 1;
        }
      }
    } catch (e) { console.error('Error in deals sync:', e.message); }

    // 4c. Estructura Organizacional (Jerárquica)
    const orgCollections = [
      { name: 'countries', type: 'COUNTRY' },
      { name: 'organisations', type: 'REGION' },
      { name: 'branches', type: 'BRANCH' },
      { name: 'shops', type: 'SHOP' },
      { name: 'agents', type: 'UNIT' }
    ];

    // Paso 1: Insertar/Actualizar todos los nodos sin parent_id
    for (const coll of orgCollections) {
      try {
        const list = await fetchAll(upya, coll.name, 100, targetTenant);
        for (const item of list) {
          const upyaId = item.id || item._id;
          if (upyaId) {
            await pool.query(
              `INSERT INTO org_structure (
                upya_id, tenant_id, name, type, administrator, email, mobile
              ) VALUES (?, ?, ?, ?, ?, ?, ?) 
              ON DUPLICATE KEY UPDATE 
                name=VALUES(name), type=VALUES(type),
                administrator=VALUES(administrator), email=VALUES(email),
                mobile=VALUES(mobile)`,
              [
                upyaId, targetTenant, item.name || 'Sin nombre', coll.type,
                item.legal?.administrator || null,
                item.legal?.contact?.email || null,
                item.legal?.contact?.mobile || null
              ]
            );
            stats.orgEntities = (stats.orgEntities || 0) + 1;
          }
        }
      } catch (e) { console.error(`Error in ${coll.name} bootstrap:`, e.message); }
    }

    // Paso 2: Resolver Jerarquías (parent_id)
    for (const coll of orgCollections) {
      try {
        const list = await fetchAll(upya, coll.name, 100, targetTenant);
        for (const item of list) {
          const upyaId = item.id || item._id;
          const upyaParentId = item.parent || (item.organisation?.id || item.branch?.id || item.country?.id || item.shop?.id);
          if (upyaId && upyaParentId) {
            await pool.query(
              `UPDATE org_structure SET parent_id = (SELECT id FROM (SELECT id FROM org_structure WHERE upya_id = ?) as t) 
               WHERE upya_id = ? AND tenant_id = ?`,
              [upyaParentId, upyaId, targetTenant]
            );
          }
        }
      } catch (e) { console.error(`Error resolving hierarchy for ${coll.name}:`, e.message); }
    }

    // 4d. Acciones (Actions/Tasks/Tickets)
    try {
      const actionsList = await fetchAll(upya, 'actions', 100, targetTenant); // Intento con 'actions'
      for (const a of actionsList) {
        const id = a.id || a._id;
        if (id) {
          await pool.query(
            'INSERT INTO operation_actions (upya_id, tenant_id, type, status, assigned_to, due_date, description, client_id, contract_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), status=VALUES(status), assigned_to=VALUES(assigned_to), due_date=VALUES(due_date), description=VALUES(description), client_id=VALUES(client_id), contract_id=VALUES(contract_id)',
            [id, targetTenant, a.type || a.actionType || 'Tarea', a.status || 'Pendiente', a.assignee || a.assignedTo || 'Sin Asignar', a.dueDate ? new Date(a.dueDate) : null, a.description || a.notes || '', a.clientId || a.client_id || null, a.contractId || a.contract_id || null]
          );
          stats.actions = (stats.actions || 0) + 1;
        }
      }
    } catch (e) { console.error('Error in actions sync:', e.message); }

    // 5. Colecciones de Datos (Forms/Questionnaires)
    try {
      const formsList = await fetchAll(upya, 'questionnaires', 100, targetTenant);
      for (const f of formsList) {
        const id = f.id || f._id;
        const name = f.name || (f.questionnaire?.name) || 'Formulario sin nombre';
        
        if (id && name) {
          let category = f.category || f.nature || f.questionnaire?.nature;
          if (!category) {
            const n = name.toLowerCase();
            if (n.includes('onboarding') || n.includes('acquisition') || n.includes('customer')) category = 'onboarding';
            else if (n.includes('standalone') || n.includes('test') || n.includes('plan') || n.includes('encuesta')) category = 'standalone';
            else if (n.includes('client') || n.includes('foto') || n.includes('contrato') || n.includes('base')) category = 'client-linked';
            else category = 'onboarding';
          }

          await pool.query(
            `INSERT INTO data_collections (
              upya_id, tenant_id, name, category, status, questions_json
            ) VALUES (?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
              name=VALUES(name), category=VALUES(category), status=VALUES(status), 
              questions_json=VALUES(questions_json)`,
            [id, targetTenant, name, category, f.status || 'ENABLED', JSON.stringify(f.questions || f.answers || f.steps || [])]
          );
          stats.dataCollections++;
        }
      }
    } catch (e) { console.error('Error in dataCollections sync:', e.message); }

    console.log(`>>> [SYNC] Sincronización finalizada exitosamente para ${targetTenant}`, stats);
    try {
      await pool.query(
        'INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?, ?)',
        [null, targetTenant, 'SYNC', `SYNC-${Date.now()}`, JSON.stringify(stats), 'SUCCESS']
      );
    } catch (logErr) { console.error('Error writing sync audit log:', logErr.message); }
  } catch (error) {
    console.error('>>> [SYNC FATAL ERROR]:', error.message);
  }
  })();
});

// --- MOTOR DE SINCRONIZACIÓN TRUSTONIC ---
app.post('/api/sync/trustonic', async (req, res) => {
  const { username, password, domain, tenantId } = req.body;
  const targetTenant = tenantId || 'c-romel';
  console.log(`>>> [SYNC TRUSTONIC] Iniciando captura para Tenant: ${targetTenant}...`);
  
  try {
    const devices = await scrapeTrustonic(username, password, domain);
    
    let count = 0;
    for (const d of devices) {
      const parseDate = (str) => {
        if (!str || str === '—') return null;
        try {
          const months = {
            'ene': 'jan', 'feb': 'feb', 'mar': 'mar', 'abr': 'apr', 'may': 'may', 'jun': 'jun',
            'jul': 'jul', 'ago': 'aug', 'sep': 'sep', 'oct': 'oct', 'nov': 'nov', 'dic': 'dec'
          };
          let cleanStr = str.toLowerCase();
          Object.keys(months).forEach(m => {
            cleanStr = cleanStr.replace(m, months[m]);
          });
          const dt = new Date(cleanStr);
          return isNaN(dt.getTime()) ? null : dt;
        } catch { return null; }
      };

      await pool.query(
        `INSERT INTO trustonic_devices (
          imei1, imei2, tenant_id, service, status, brand, model, last_change, last_connection
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
          imei2=VALUES(imei2), service=VALUES(service), status=VALUES(status), 
          brand=VALUES(brand), model=VALUES(model), last_change=VALUES(last_change), 
          last_connection=VALUES(last_connection)`,
        [
          d.imei1, d.imei2 || null, targetTenant, d.service, d.status, d.brand, d.model, 
          parseDate(d.last_change), parseDate(d.last_connection)
        ]
      );
      count++;
    }

    res.json({ success: true, devicesCount: count });
  } catch (error) {
    console.error('>>> [SYNC TRUSTONIC ERROR]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- HELPERS DE SCOPING ---
async function getScopeFilter(tenantId, userId, role, scopeOrgId, scopeRole, tableAlias = 'ch') {
  // Nivel 1: Admin Global o Superadmin (No aplica filtros extra)
  if ((role === 'admin' || role === 'superadmin') && !scopeOrgId) {
    return { filter: '1=1', params: [] };
  }

  // Nivel 3: Staff (Solo ve lo que él creó)
  if (scopeRole === 'STAFF') {
    if (tableAlias === 'i') {
      if (scopeOrgId) return { filter: `${tableAlias}.org_id = ?`, params: [scopeOrgId] };
      return { filter: '1=0', params: [] };
    }
    return { filter: `${tableAlias}.created_by_user_id = ?`, params: [userId] };
  }

  // Nivel 2: Manager (Ve su org y todas las sub-orgs)
  if (scopeRole === 'MANAGER' && scopeOrgId) {
    // Usamos una CTE recursiva para obtener todos los hijos de la organización
    return { 
      filter: `${tableAlias}.org_id IN (
        WITH RECURSIVE subordinates AS (
          SELECT id FROM org_structure WHERE id = ?
          UNION ALL
          SELECT o.id FROM org_structure o INNER JOIN subordinates s ON o.parent_id = s.id
        )
        SELECT id FROM subordinates
      )`, 
      params: [scopeOrgId] 
    };
  }

  // Fallback: Si no tiene rol definido o algo falló, mostramos solo lo suyo
  if (tableAlias === 'i') {
    return { filter: '1=0', params: [] };
  }
  return { filter: `${tableAlias}.created_by_user_id = ?`, params: [userId] };
}

// --- ENDPOINTS DE CONSULTA ---

app.get('/api/backoffice/summary', async (req, res) => {
  const { tenantId, userId, role, orgId, scopeRole } = req.query;
  if (!tenantId) return res.status(400).json({ error: 'tenantId is required' });
  try {
    const scopeCon = await getScopeFilter(tenantId, userId, role, orgId, scopeRole, 'ch');
    const scopePay = await getScopeFilter(tenantId, userId, role, orgId, scopeRole, 'p');
    const scopeInv = await getScopeFilter(tenantId, userId, role, orgId, scopeRole, 'i');

    const [cli] = await pool.query('SELECT COUNT(*) as t FROM client_history WHERE tenant_id = ?', [tenantId]);
    const [con] = await pool.query(`SELECT COUNT(*) as t FROM contract_history ch WHERE tenant_id = ? AND (${scopeCon.filter})`, [tenantId, ...scopeCon.params]);
    const [inv] = await pool.query(`SELECT COUNT(*) as t FROM inventory i WHERE tenant_id = ? AND (${scopeInv.filter})`, [tenantId, ...scopeInv.params]);
    const [pro] = await pool.query('SELECT COUNT(*) as t FROM products WHERE tenant_id = ?', [tenantId]);
    const [dc]  = await pool.query('SELECT COUNT(*) as t FROM data_collections WHERE tenant_id = ?', [tenantId]);
    const [pay] = await pool.query(`SELECT COALESCE(SUM(amount),0) as t FROM payments p WHERE tenant_id = ? AND (${scopePay.filter})`, [tenantId, ...scopePay.params]);
    
    res.json({ 
      totalClients: cli[0].t, 
      totalContracts: con[0].t, 
      totalInventory: inv[0].t, 
      totalProducts: pro[0].t,
      totalDataCollections: dc[0].t,
      totalPaid: pay[0].t 
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/payment-plans', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM payment_plans WHERE tenant_id = ? ORDER BY type ASC, name ASC', [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/payment-plans', async (req, res) => {
  const { planData, tenantId } = req.body;
  try {
    const upya_id = planData.upya_id || `PLAN-${Date.now()}`;
    await pool.query(
      'INSERT INTO payment_plans (upya_id, tenant_id, type, name, product_name, total_cost, status, description, upfront_percentage, frequency_days, installments_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [upya_id, tenantId, planData.type || 'PAYG', planData.name, planData.product_name, planData.total_cost || 0, planData.status || 'Active', planData.description || '', planData.upfront_percentage || 0, planData.frequency_days || null, planData.installments_count || null]
    );
    res.json({ success: true, id: upya_id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/backoffice/payment-plans/:id', async (req, res) => {
  const { id } = req.params;
  const { planData, tenantId } = req.body;
  try {
    await pool.query(
      'UPDATE payment_plans SET type=?, name=?, product_name=?, total_cost=?, status=?, description=?, upfront_percentage=?, frequency_days=?, installments_count=? WHERE upya_id = ? AND tenant_id = ?',
      [planData.type || 'PAYG', planData.name, planData.product_name, planData.total_cost || 0, planData.status || 'Active', planData.description || '', planData.upfront_percentage || 0, planData.frequency_days || null, planData.installments_count || null, id, tenantId]
    );
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/backoffice/payment-plans/:id', async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.query;
  try {
    await pool.query('DELETE FROM payment_plans WHERE upya_id = ? AND tenant_id = ?', [id, tenantId]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});


app.get('/api/backoffice/org-structure', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM org_structure WHERE tenant_id = ? ORDER BY type ASC, name ASC', [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/org-structure', async (req, res) => {
  const { name, type, parent_id, administrator, upya_id, tenantId } = req.body;
  try {
    const newUpyaId = upya_id || `local-${Date.now()}`;
    const [result] = await pool.query(
      'INSERT INTO org_structure (upya_id, tenant_id, name, type, parent_id, administrator) VALUES (?, ?, ?, ?, ?, ?)',
      [newUpyaId, tenantId, name, type, parent_id || null, administrator]
    );
    res.json({ id: result.insertId, upya_id: newUpyaId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/org-structure/:id', async (req, res) => {
  const { name, type, parent_id, administrator, tenantId } = req.body;
  try {
    await pool.query(
      'UPDATE org_structure SET name=?, type=?, parent_id=?, administrator=? WHERE id=? AND tenant_id=?',
      [name, type, parent_id || null, administrator, req.params.id, tenantId]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/backoffice/org-structure/:id', async (req, res) => {
  const { tenantId } = req.query;
  try {
    // Primero, actualizar los hijos para que no queden huérfanos con un parent_id inválido
    await pool.query('UPDATE org_structure SET parent_id = NULL WHERE parent_id = ? AND tenant_id = ?', [req.params.id, tenantId]);
    await pool.query('DELETE FROM org_structure WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// --- USER MANAGEMENT (CRUD) ---
app.get('/api/backoffice/users', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.contact_name, u.email, u.role as global_role, 
              s.org_id, s.role as scope_role, o.name as org_name
       FROM users u 
       LEFT JOIN user_scopes s ON u.id = s.user_id 
       LEFT JOIN org_structure o ON s.org_id = o.id
       WHERE u.tenant_id = ? ORDER BY u.contact_name ASC`, 
      [tenantId]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/users', async (req, res) => {
  const { username, contact_name, email, password, org_id, scope_role, tenantId } = req.body;
  try {
    const pwdHash = password ? await bcrypt.hash(password, 10) : null;
    const upyaId = `local-${Date.now()}`;
    const [uRes] = await pool.query(
      'INSERT INTO users (upya_id, tenant_id, username, password, contact_name, email, role) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [upyaId, tenantId, username, pwdHash, contact_name, email, 'agent']
    );
    
    if (org_id) {
      await pool.query(
        'INSERT INTO user_scopes (user_id, org_id, role, tenant_id) VALUES (?, ?, ?, ?)',
        [uRes.insertId, org_id, scope_role || 'STAFF', tenantId]
      );
    }
    res.json({ success: true, id: uRes.insertId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/users/:id', async (req, res) => {
  const { username, contact_name, email, password, org_id, scope_role, tenantId } = req.body;
  const userId = req.params.id;
  try {
    // Update main user
    if (password) {
      const pwdHash = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET username=?, contact_name=?, email=?, password=? WHERE id=? AND tenant_id=?',
        [username, contact_name, email, pwdHash, userId, tenantId]
      );
    } else {
      await pool.query(
        'UPDATE users SET username=?, contact_name=?, email=? WHERE id=? AND tenant_id=?',
        [username, contact_name, email, userId, tenantId]
      );
    }
    
    // Update or clear scope
    await pool.query('DELETE FROM user_scopes WHERE user_id = ?', [userId]);
    if (org_id) {
      await pool.query(
        'INSERT INTO user_scopes (user_id, org_id, role, tenant_id) VALUES (?, ?, ?, ?)',
        [userId, org_id, scope_role || 'STAFF', tenantId]
      );
    }
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.delete('/api/backoffice/users/:id', async (req, res) => {
  const { tenantId } = req.query;
  try {
    await pool.query('DELETE FROM user_scopes WHERE user_id = ?', [req.params.id]);
    await pool.query('DELETE FROM users WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});



app.get('/api/backoffice/actions', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM operation_actions WHERE tenant_id = ? ORDER BY due_date ASC, status DESC', [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Endpoint público para que el login muestre el selector de tenants (sin datos sensibles)
app.get('/api/backoffice/tenant-list', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT tenant_id, company_name FROM tenants WHERE status = ? ORDER BY company_name ASC',
      ['active']
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/backoffice/auth', async (req, res) => {
  const { username, password, tenantId } = req.body;
  
  if (!tenantId) {
    return res.status(400).json({ success: false, message: 'El Tenant ID es requerido' });
  }

  try {
    // 1. Buscar usuario en nuestra base de datos local
    const [rows] = await pool.query(
      `SELECT u.*, s.org_id, s.role as scope_role, o.name as org_name, o.type as org_type
       FROM users u
       LEFT JOIN user_scopes s ON u.id = s.user_id
       LEFT JOIN org_structure o ON s.org_id = o.id
       WHERE u.username = ?`,
      [username]
    );

    if (rows.length > 0) {
      const user = rows[0];
      if (user.password) {
        const valid = await bcrypt.compare(password, user.password);
        if (valid) {
          // SuperAdmin: tenant_id NULL o role 'superadmin' → puede acceder a cualquier tenant registrado
          const isSuperAdmin = user.role === 'superadmin' || user.tenant_id === null;
          if (isSuperAdmin) {
            // Verificar que el tenant solicitado existe en la DB
            const [tenantRows] = await pool.query(
              'SELECT tenant_id, company_name FROM tenants WHERE tenant_id = ? AND status = ?',
              [tenantId, 'active']
            );
            if (tenantRows.length === 0) {
              return res.status(403).json({ success: false, message: 'El tenant solicitado no existe o no está activo.' });
            }
            try {
              await pool.query('INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, status) VALUES (?, ?, ?, ?, ?)',
                [user.id, tenantId, 'SUPERADMIN_LOGIN', user.username, 'SUCCESS']);
            } catch(e) { console.error('Error logging superadmin login:', e.message); }

            return res.json({
              success: true,
              message: 'Autenticado como SuperAdmin',
              user: {
                id: user.id,
                username: user.username,
                tenantId: tenantId, // El tenant elegido
                role: 'superadmin',
                scope: { orgId: null, orgName: null, orgType: null, role: null }
              }
            });
          }

          // Usuario normal: debe coincidir exactamente su tenant_id
          if (user.tenant_id !== tenantId) {
            return res.status(403).json({ success: false, message: 'El usuario no pertenece a este Tenant.' });
          }

          try {
            await pool.query('INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, status) VALUES (?, ?, ?, ?, ?)',
              [user.id, user.tenant_id, 'USER_LOGIN', user.username, 'SUCCESS']);
          } catch(e) { console.error('Error logging login:', e.message); }

          return res.json({
            success: true,
            message: 'Autenticado localmente',
            user: {
              id: user.id,
              username: user.username,
              tenantId: user.tenant_id,
              role: user.role,
              scope: {
                orgId: user.org_id,
                orgName: user.org_name,
                orgType: user.org_type,
                role: user.scope_role || 'STAFF'
              }
            }
          });
        }
      }
    }

    // 2. Fallback: Validación dinámica contra Upya (para usuarios Upya puros sin cuenta local)
    // NOTA: Esta vía solo aplica si el usuario NO tiene contraseña en la DB local.
    // Un usuario autenticado vía Upya siempre queda limitado a su propio tenant.
    const baseUrl = process.env.UPYA_BASE_URL || 'https://api.upya.io';
    try {
      const upyaRes = await axios.post(`${baseUrl}/data/count/clients`, { query: {} }, {
        auth: { username, password },
        headers: { 'Content-Type': 'application/json' }
      });

      if (upyaRes.status === 200) {
        // Verificar que el tenant solicitado existe en la DB (no lista hardcodeada)
        const [tenantRows] = await pool.query(
          'SELECT tenant_id, upya_user FROM tenants WHERE tenant_id = ? AND status = ?',
          [tenantId, 'active']
        );
        if (tenantRows.length === 0) {
          return res.status(403).json({ success: false, message: 'El tenant no está registrado.' });
        }
        // El usuario de Upya solo puede acceder al tenant donde está registrado su usuario
        const tenantData = tenantRows[0];
        if (tenantData.upya_user && tenantData.upya_user !== username) {
          return res.status(403).json({ success: false, message: 'No tienes acceso a este tenant.' });
        }

        return res.json({
          success: true,
          message: 'Autenticado vía Upya',
          user: { username, tenantId, role: 'admin' }
        });
      }
    } catch (upyaErr) {
      console.error('Upya Auth failed:', upyaErr.response?.data || upyaErr.message);
      if (upyaErr.response?.status === 401) {
        return res.status(401).json({ success: false, message: 'Usuario o contraseña incorrectos.' });
      }
    }

    return res.status(401).json({ success: false, message: 'Credenciales inválidas o tenant no autorizado.' });

  } catch (err) {
    console.error('Server Auth error:', err.message);
    return res.status(500).json({ success: false, message: 'Error interno del servidor durante la autenticación.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { email, username, password, companyName, contactName, phone, tenantId } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (email, username, password, company_name, contact_name, phone, tenant_id, role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [email, username, hashedPassword, companyName, contactName, phone, tenantId, 'admin']
    );
    res.json({ success: true, userId: result.insertId });
  } catch (e) {
    console.error('Registration error:', e);
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/backoffice/actions', async (req, res) => {
  try {
    const { type, status, assigned_to, due_date, description, client_id, contract_id, tenantId } = req.body;
    const upya_id = `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
    await pool.query(
      'INSERT INTO operation_actions (upya_id, tenant_id, type, status, assigned_to, due_date, description, client_id, contract_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [upya_id, tenantId, type, status, assigned_to, due_date || null, description, client_id || null, contract_id || null]
    );
    res.json({ success: true, upya_id });
    if (client_id) ensureClientWallet(client_id, tenantId);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/actions/:id', async (req, res) => {
  try {
    const { type, status, assigned_to, due_date, description, client_id, contract_id, tenantId } = req.body;
    await pool.query(
      'UPDATE operation_actions SET type=?, status=?, assigned_to=?, due_date=?, description=?, client_id=?, contract_id=? WHERE upya_id=? AND tenant_id=?',
      [type, status, assigned_to, due_date || null, description, client_id || null, contract_id || null, req.params.id, tenantId]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/data-collections', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM data_collections WHERE tenant_id = ? ORDER BY name ASC', [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/clients', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM client_history WHERE tenant_id = ? ORDER BY name ASC', [tenantId]);
    res.json(rows);
  } catch (e) { 
    console.error('Clients Error:', e);
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/backoffice/clients/:id/wallet', async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.body;
  try {
    await ensureClientWallet(id, tenantId);
    // Recuperamos los datos actualizados para responder
    const [clients] = await pool.query('SELECT clabe, wallet_account_id, wallet_client_id FROM client_history WHERE upya_id = ? AND tenant_id = ?', [id, tenantId]);
    const c = clients[0];
    res.json({ success: true, dcClientId: c.wallet_client_id, dcAccountId: c.wallet_account_id, clabe: c.clabe });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/backoffice/trustonic-devices', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [devices] = await pool.query('SELECT * FROM trustonic_devices WHERE tenant_id = ? ORDER BY last_change DESC', [tenantId]);
    
    // Calcular resumen
    const [summary] = await pool.query(`
      SELECT 
        service,
        COUNT(CASE WHEN status = 'Inactivo' THEN 1 END) as inactivo,
        COUNT(CASE WHEN status = 'Listo para su uso' THEN 1 END) as listo,
        COUNT(CASE WHEN status = 'Activo' THEN 1 END) as activo,
        COUNT(CASE WHEN status = 'Bloqueado' THEN 1 END) as bloqueado,
        COUNT(CASE WHEN status = 'Liberado' THEN 1 END) as liberado,
        COUNT(*) as total
      FROM trustonic_devices
      WHERE tenant_id = ?
      GROUP BY service
    `, [tenantId]);

    res.json({ devices, summary });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/trustonic-devices', async (req, res) => {
  try {
    const { imei1, imei2, service, status, brand, model, expiration_date, tenantId } = req.body;
    await pool.query(
      'INSERT INTO trustonic_devices (imei1, imei2, tenant_id, service, status, brand, model, expiration_date, last_change) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [imei1, imei2, tenantId, service, status, brand, model, expiration_date || null]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/trustonic-devices/:imei1', async (req, res) => {
  try {
    const { imei1 } = req.params;
    const { service, status, brand, model, expiration_date, tenantId } = req.body;
    await pool.query(
      'UPDATE trustonic_devices SET service = ?, status = ?, brand = ?, model = ?, expiration_date = ?, last_change = NOW() WHERE imei1 = ? AND tenant_id = ?',
      [service, status, brand, model, expiration_date || null, imei1, tenantId]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/trustonic-logs', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query(`
      SELECT l.*, d.brand, d.model, d.created_at as registration_date, d.last_connection as last_active
      FROM trustonic_logs l
      LEFT JOIN trustonic_devices d ON l.imei1 = d.imei1 AND l.tenant_id = d.tenant_id
      WHERE l.tenant_id = ? 
      ORDER BY l.operation_date DESC, l.id DESC
    `, [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/sync/trustonic-logs', async (req, res) => {
  const { tenantId } = req.body;
  const targetTenant = tenantId || 'c-romel';
  try {
    const result = await trustonicApi.syncMovements(pool, targetTenant);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/backoffice/payments/:id/pdf', async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.query;

  try {
    const [payments] = await pool.query(
      `SELECT p.*, c.name as client_name, c.client_number, ch.contract_number
       FROM payments p
       LEFT JOIN client_history c ON p.client_id = c.upya_id
       LEFT JOIN contract_history ch ON p.contract_id = ch.contract_number
       WHERE p.id = ? AND p.tenant_id = ?`,
      [id, tenantId]
    );

    if (payments.length === 0) return res.status(404).send('Payment not found');
    const p = payments[0];

    const browser = await puppeteer.launch({ 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });
    const page = await browser.newPage();
    const html = generateVoucherHTML({
      clientName: p.client_name || '---',
      clientNumber: p.client_number || '---',
      amount: p.amount,
      method: p.method,
      status: p.status,
      paymentDate: p.payment_date,
      contractNumber: p.contract_id,
      transactionId: p.transaction_id || `P-${p.id}`,
      tenantName: 'Play Cell'
    });

    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ 
      format: 'A4', 
      printBackground: true,
      margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
    });
    await browser.close();

    res.contentType('application/pdf');
    res.set('Content-Length', pdf.length);
    res.set('Content-Disposition', 'inline; filename="voucher.pdf"');
    res.end(pdf);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error generating PDF');
  }
});

app.get('/api/backoffice/contracts/:id/pdf', async (req, res) => {
  const { id } = req.params;
  const tenantId = req.query.tenantId || 'c-romel';
  
  try {
    // 1. Obtener datos básicos de la DB
    const [rows] = await pool.query(
      `SELECT ch.*, cl.name, cl.email, cl.client_number as cn, cl.upya_id as cid
       FROM contract_history ch 
       LEFT JOIN client_history cl ON (ch.client_id = cl.upya_id OR (ch.client_number = cl.client_number AND ch.client_number IS NOT NULL)) 
       AND ch.tenant_id = cl.tenant_id
       WHERE ch.upya_id = ? AND ch.tenant_id = ?`,
      [id, tenantId]
    );

    if (rows.length === 0) return res.status(404).send('Contrato no encontrado');
    const con = rows[0];
    console.log(`[PDF] Generating for contract: ${con.contract_number} (upya_id: ${id})`);

    // 2. Intentar enriquecer con datos frescos de Upya (especialmente assets e info de perfil)
    let upyaData = {};
    try {
      const upyaSearch = await axios.post('https://data.upya.io/data/search/contracts', 
        { query: { _id: id }, limit: 1 },
        { auth: { username: process.env.UPYA_USER, password: process.env.UPYA_PASS } }
      );
      upyaData = upyaSearch.data?.[0] || {};
    } catch (err) {
      console.warn('[PDF] No se pudo obtener data extra de Upya:', err.message);
    }

    let asset = {};
    try {
      // 2. Obtener lista de assets e identificar el vinculado a este contrato
      const assetList = await axios.post('https://data.upya.io/data/search/assets', 
        { query: {}, limit: 1000 },
        { auth: { username: process.env.UPYA_USER, password: process.env.UPYA_PASS } }
      );
      
      console.log(`[PDF] Total assets in Upya: ${assetList.data?.length || 0}`);

      // Buscar por número de contrato o por número de cliente
      asset = assetList.data.find(a => {
        const matchContract = a.contract?.contractNumber === con.contract_number && con.contract_number;
        const matchClient = a.ownedBy?.clientNumber === con.cn && con.cn;
        return matchContract || matchClient;
      }) || {};
      
      if (asset.serialNumber) {
        console.log(`[PDF] Match found: SN=${asset.serialNumber}, IMEI=${asset.paygNumber}`);
      } else {
        console.log(`[PDF] No asset match found for contract ${con.contract_number} or client ${con.cn}`);
      }
    } catch (err) {
      console.warn('[PDF] Error buscando assets:', err.message);
    }

    const client = upyaData.client || {};
    const profile = client.profile || {};
    const product = upyaData.product || {};
    const pricing = upyaData.pricingSchedule || {};

    const data = {
      fullName: con.name || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
      address: `${profile.address || ''}, ${profile.city || ''}`.trim(),
      phoneNumber: client.contact?.mobile || '',
      personId: profile.gvtId || '',
      brand: product.name?.split(' ')[0] || 'Play Cell',
      model: con.product_name || product.name || 'Generic Model',
      imei: asset.paygNumber || asset.imei1 || '123456789012345',
      serialNumber: asset.serialNumber || `SN-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`,
      paygNumber: asset.paygNumber || '123456789012345',
      upfrontpayment: pricing.upfrontPayment || con.paid_value || 0,
      totalcost: con.total_value || upyaData.totalCost || 0,
      terms: con.deal_name || upyaData.dealName || '',
      repayment: pricing.recurrentPayment ? `$${pricing.recurrentPayment} ${pricing.freq === 30 ? 'Mensual' : 'cada ' + pricing.freq + ' días'}` : 'Según calendario',
      signature: con.signature_image || con.signature_data,
      date: con.created_at_upya || con.synced_at
    };

    // 3. Generar HTML
    const html = generateContractHTML(data);

    // 4. Usar Puppeteer para generar PDF
    const browser = await puppeteer.launch({ 
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      headless: 'new'
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdf = await page.pdf({ 
      format: 'A4', 
      margin: { top: '15mm', right: '15mm', bottom: '15mm', left: '15mm' },
      printBackground: true
    });
    await browser.close();

    res.contentType('application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="contrato.pdf"');
    res.send(Buffer.from(pdf));

  } catch (e) {
    console.error('[PDF Error]:', e);
    res.status(500).send(e.message);
  }
});

app.get('/api/backoffice/contracts', async (req, res) => {
  const { tenantId, userId, role, orgId, scopeRole } = req.query;
  try {
    const scope = await getScopeFilter(tenantId, userId, role, orgId, scopeRole, 'ch');
    const [rows] = await pool.query(
      `SELECT ch.*, cl.name AS client_name, cl.email 
       FROM contract_history ch 
       LEFT JOIN client_history cl ON (ch.client_id = cl.upya_id OR (ch.client_number = cl.client_number AND ch.client_number IS NOT NULL)) 
       AND ch.tenant_id = cl.tenant_id
       WHERE ch.tenant_id = ? AND (${scope.filter})
       ORDER BY ch.synced_at DESC`,
      [tenantId, ...scope.params]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/contracts', async (req, res) => {
  try {
    const { upya_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image, tenantId, userId, orgId } = req.body;
    const id = upya_id || `CTR-${Date.now()}`;
    await pool.query(
      'INSERT INTO contract_history (upya_id, tenant_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image, created_by_user_id, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, tenantId, contract_number || null, client_id || null, product_name || null, deal_name || null, total_value || 0, paid_value || 0, status || 'Signed', signature_image || null, userId || null, orgId || null]
    );
    res.json({ success: true, id });
    if (client_id) ensureClientWallet(client_id, tenantId, total_value);
    
    // Log creation
    try {
      await pool.query(
        'INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId || null, tenantId, 'CONTRACT_CREATE', id, JSON.stringify({ contract_number, product_name, total_value, status }), 'SUCCESS']
      );
    } catch(err) { console.error('Error logging contract create:', err.message); }
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image, tenantId, userId } = req.body;
    await pool.query(
      'UPDATE contract_history SET contract_number=?, client_id=?, product_name=?, deal_name=?, total_value=?, paid_value=?, status=?, signature_image=? WHERE upya_id = ? AND tenant_id = ?',
      [contract_number || null, client_id || null, product_name || null, deal_name || null, total_value || 0, paid_value || 0, status || 'Signed', signature_image || null, id, tenantId]
    );
    res.json({ success: true });

    // Log update
    try {
      await pool.query(
        'INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId || null, tenantId, 'CONTRACT_EDIT', id, JSON.stringify({ status, product_name }), 'SUCCESS']
      );
    } catch(err) { console.error('Error logging contract edit:', err.message); }
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/backoffice/contracts/:id/sign', async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureData, tenantId } = req.body;
    console.log(`>>> [SIGN] Signing contract: ${id} for tenant: ${tenantId}`);
    await pool.query(
      'UPDATE contract_history SET status="FIRMADO", signature_image=? WHERE upya_id = ? AND tenant_id = ?',
      [signatureData, id, tenantId]
    );
    res.json({ success: true });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/backoffice/contracts/import-and-sign', upload.single('file'), async (req, res) => {
  try {
    const { client_id, signatureData, client_name, email, tenantId } = req.body;
    const file = req.file;

    if (!file || !signatureData) {
      return res.status(400).json({ error: 'Archivo y firma son requeridos.' });
    }

    const id = `CTR-IMP-${Date.now()}`;
    const signatureBase64 = signatureData.replace(/^data:image\/\w+;base64,/, "");
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');
    const signaturePath = path.join(SIGNED_DIR, `sig-${Date.now()}.png`);
    fs.writeFileSync(signaturePath, signatureBuffer);

    let outputPath = '';
    let outputFilename = '';

    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      // Proceso para DOCX usando docxtemplater
      const content = fs.readFileSync(file.path, 'binary');
      const zip = new PizZip(content);

      const opts = {
        centered: false,
        getImage: (tagValue) => fs.readFileSync(tagValue),
        getSize: () => [200, 100]
      };

      const doc = new Docxtemplater(zip, {
        modules: [new ImageModule(opts)]
      });

      doc.setData({
        signature: signaturePath,
        clientName: client_name || 'Cliente',
        date: new Date().toLocaleDateString()
      });

      doc.render();

      const buf = doc.getZip().generate({ type: 'nodebuffer' });
      outputFilename = `CONTRATO_FIRMADO_${Date.now()}.docx`;
      outputPath = path.join(SIGNED_DIR, outputFilename);
      fs.writeFileSync(outputPath, buf);
    } else {
      outputFilename = `CONTRATO_IMPORTADO_${Date.now()}_${file.originalname}`;
      outputPath = path.join(SIGNED_DIR, outputFilename);
      fs.copyFileSync(file.path, outputPath);
    }

    // Guardar en DB con tenantId
    await pool.query(
      'INSERT INTO contract_history (upya_id, tenant_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image, created_by_user_id, org_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, tenantId, outputFilename, client_id || null, 'Documento Importado', 'Importación Directa', 0, 0, 'FIRMADO', signatureData, req.body.userId || null, req.body.orgId || null]
    );

    // Enviar Email si hay correo
    if (email && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Tu Contrato Firmado de Bantos',
        text: `Hola ${client_name || 'Cliente'},\n\nAdjunto encontrarás tu contrato firmado.\n\nSaludos,\nEquipo Bantos.`,
        attachments: [{ filename: outputFilename, path: outputPath }]
      };

      await transporter.sendMail(mailOptions);
    }

    res.json({ success: true, id, filename: outputFilename });
  } catch (error) {
    console.error('Error en importación y firma:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backoffice/inventory', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM inventory WHERE tenant_id = ? ORDER BY synced_at DESC', [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/inventory', async (req, res) => {
  const { tenantId, serialNumber, model, status } = req.body;
  if (!serialNumber) return res.status(400).json({ error: 'Serial number is required' });
  try {
    const upyaId = 'local-' + Date.now();
    await pool.query(
      'INSERT INTO inventory (tenant_id, upya_id, serial_number, model, status) VALUES (?, ?, ?, ?, ?)',
      [tenantId, upyaId, serialNumber, model, status || 'UNASSIGNED']
    );
    res.json({ success: true, upyaId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { tenantId, serialNumber, model, status } = req.body;
  if (!serialNumber) return res.status(400).json({ error: 'Serial number is required' });
  try {
    await pool.query(
      'UPDATE inventory SET serial_number = ?, model = COALESCE(?, model), status = COALESCE(?, status) WHERE (id = ? OR upya_id = ?) AND tenant_id = ?',
      [serialNumber, model || null, status || null, id, id, tenantId]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/payments', async (req, res) => {
  const { tenantId, userId, role, orgId, scopeRole } = req.query;
  try {
    const scope = await getScopeFilter(tenantId, userId, role, orgId, scopeRole, 'p');
    const query = `
      SELECT p.*, c.name as client_name, h.product_name, c.client_number, c.email, h.repayment_frequency, h.repayment_amount
      FROM payments p
      LEFT JOIN contract_history h ON (p.contract_id = h.contract_number AND p.tenant_id = h.tenant_id)
      LEFT JOIN client_history c ON (c.upya_id = COALESCE(p.client_id, h.client_id) AND c.tenant_id = p.tenant_id)
      WHERE p.tenant_id = ? AND (${scope.filter})
      ORDER BY p.payment_date DESC
    `;
    const [rows] = await pool.query(query, [tenantId, ...scope.params]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Helper para pushear pagos en tiempo real a Upya
async function pushPaymentToUpya(paymentData, tenantId) {
  try {
    if (!process.env.UPYA_USER || !process.env.UPYA_PASS) return;
    const upya = new UpyaManageClient(process.env.UPYA_USER, process.env.UPYA_PASS);
    
    // Inyectar header tenantId al cliente de datos y api si es necesario en el entorno Upya
    if (tenantId) {
      upya.dataClient.defaults.headers.common['tenant'] = tenantId;
      upya.apiClient.defaults.headers.common['tenant'] = tenantId;
    }

    const payload = {
      contractReference: paymentData.contract_id,
      clientReference: paymentData.client_id,
      amount: parseFloat(paymentData.amount),
      method: paymentData.method || 'Bantos Data Center',
      date: paymentData.payment_date ? new Date(paymentData.payment_date).toISOString() : new Date().toISOString(),
      agent: paymentData.createdBy || 'Bantos System'
    };

    console.log(`>>> [UPYA PUSH] Enviando pago a Upya para contrato ${payload.contractReference}...`);
    // Se utiliza /data/payments/manual o /data/payments/external dependiendo de Upya
    await upya.payments.manual(payload).catch(e => {
       // Si falla manual, intentamos external como fallback
       return upya.payments.external(payload);
    });
    console.log(`>>> [UPYA PUSH] Pago registrado exitosamente en Upya.`);
  } catch (err) {
    console.error(`[UPYA PUSH ERROR] Fallo al enviar pago a Upya:`, err.response?.data || err.message);
  }
}

app.post('/api/backoffice/payments', async (req, res) => {
  try {
    const { 
      upya_id, transaction_id, contract_id, amount, method, status, payment_date,
      account_number, card_holder, is_recurring, recurring_dates, client_id, tenantId, userId, orgId
    } = req.body;
    
    const payId = upya_id || `PAY-${Date.now()}`;
    const [result] = await pool.query(
      `INSERT INTO payments (
        upya_id, transaction_id, tenant_id, contract_id, amount, method, status, payment_date,
        account_number, card_holder, is_recurring, recurring_dates, client_id, created_by_user_id, org_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payId, transaction_id || null, tenantId, contract_id || null, 
        amount || 0, method || 'Other', status || 'Pending', payment_date || new Date(),
        account_number || null, card_holder || null, is_recurring || false, 
        recurring_dates ? JSON.stringify(recurring_dates) : null, client_id || null,
        userId || null, orgId || null
      ]
    );
    res.json({ success: true, id: result.insertId });

    // Log creation
    try {
      await pool.query(
        'INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId || null, tenantId, 'PAYMENT_REGISTER', payId, JSON.stringify({ amount, method, status, contract_id }), 'SUCCESS']
      );
    } catch(err) { console.error('Error logging payment registration:', err.message); }

    // Si es recurrente, disparamos el flujo de Wallet/SPEI
    if (is_recurring && client_id) {
      console.log(`>>> [RECURRING] Triggering wallet/payment flow for client: ${client_id}`);
      ensureClientWallet(client_id, tenantId, amount);
    }

    // Real-Time Push to Upya if status is not Pending
    if ((status || '').toUpperCase() === 'PAID' || (status || '').toUpperCase() === 'VALIDATED') {
       pushPaymentToUpya(req.body, tenantId);
    }

  } catch (e) { res.status(500).json({ error: e.message }); }
});

// Endpoint para cotización de Finiquito Anticipado
app.get('/api/backoffice/contracts/:id/settlement-quote', async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.query;
  try {
    const [contracts] = await pool.query(
      `SELECT c.*, cl.name as client_name, cl.client_number
       FROM contract_history c
       LEFT JOIN client_history cl ON (cl.upya_id = c.client_id AND cl.tenant_id = c.tenant_id)
       WHERE (c.upya_id = ? OR c.contract_number = ?) AND c.tenant_id = ?`,
      [id, id, tenantId]
    );

    if (contracts.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    const con = contracts[0];
    const totalValue = parseFloat(con.total_value || 0);

    // Obtener la suma total abonada y validada en payments
    const [paySum] = await pool.query(
      `SELECT COALESCE(SUM(amount), 0) as total_paid
       FROM payments
       WHERE contract_id IN (?, ?) AND tenant_id = ? AND UPPER(status) IN ('PAID', 'VALIDATED', 'COMPLETED', 'SUCCESS', 'SUCCESSFUL')`,
      [con.upya_id, con.contract_number, tenantId]
    );

    const paidAmount = parseFloat(paySum[0]?.total_paid || con.paid_value || 0);
    const remainingBalance = Math.max(0, totalValue - paidAmount);

    res.json({
      contract_id: con.upya_id,
      contract_number: con.contract_number,
      client_name: con.client_name,
      client_number: con.client_number,
      total_value: totalValue,
      paid_amount: paidAmount,
      remaining_balance: remainingBalance,
      status: con.status
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint para procesar el Finiquito Anticipado
app.post('/api/backoffice/contracts/:id/settle', async (req, res) => {
  const { id } = req.params;
  const { tenantId, userId, orgId, amount, discount_amount, method, notes } = req.body;
  try {
    const [contracts] = await pool.query(
      `SELECT c.*, cl.name as client_name
       FROM contract_history c
       LEFT JOIN client_history cl ON (cl.upya_id = c.client_id AND cl.tenant_id = c.tenant_id)
       WHERE (c.upya_id = ? OR c.contract_number = ?) AND c.tenant_id = ?`,
      [id, id, tenantId]
    );

    if (contracts.length === 0) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }

    const con = contracts[0];
    const payId = `SETTLE-${Date.now()}`;
    const settlementAmount = parseFloat(amount || 0);
    const discount = parseFloat(discount_amount || 0);
    const payMethod = method || 'Transferencia SPEI';

    // 1. Insertar el pago de finiquito
    await pool.query(
      `INSERT INTO payments (
        upya_id, transaction_id, tenant_id, contract_id, client_id, amount, method, status, 
        payment_date, is_settlement, discount_amount, created_by_user_id, org_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'COMPLETED', NOW(), 1, ?, ?, ?)`,
      [
        payId, `TX-${payId}`, tenantId, con.contract_number || con.upya_id, con.client_id,
        settlementAmount, payMethod, discount, userId || null, orgId || null
      ]
    );

    // 2. Actualizar el estado del contrato a SETTLED
    const newPaidValue = parseFloat(con.paid_value || 0) + settlementAmount + discount;
    await pool.query(
      `UPDATE contract_history 
       SET status = 'SETTLED', paid_value = ?
       WHERE (upya_id = ? OR contract_number = ?) AND tenant_id = ?`,
      [newPaidValue, con.upya_id, con.contract_number, tenantId]
    );

    // 3. Registrar log de la operación
    try {
      await pool.query(
        'INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?, ?)',
        [userId || null, tenantId, 'CONTRACT_SETTLEMENT', con.contract_number || con.upya_id, JSON.stringify({ settlementAmount, discount, method: payMethod, notes }), 'SUCCESS']
      );
    } catch (logErr) { console.error('Error guardando log de finiquito:', logErr.message); }

    // 4. Enviar actualización a Upya en tiempo real
    pushPaymentToUpya({
      contract_id: con.contract_number || con.upya_id,
      client_id: con.client_id,
      amount: settlementAmount,
      method: `Finiquito (${payMethod})`,
      payment_date: new Date()
    }, tenantId);

    res.json({
      success: true,
      message: 'Crédito finiquitado exitosamente',
      payment_id: payId,
      settled_contract: con.contract_number || con.upya_id
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/backoffice/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      transaction_id, contract_id, amount, method, status, payment_date,
      account_number, card_holder, is_recurring, recurring_dates, client_id, tenantId
    } = req.body;

    // Check if it can be edited
    const [current] = await pool.query('SELECT status FROM payments WHERE upya_id = ? AND tenant_id = ?', [id, tenantId]);
    const lockedStatuses = ['ACCEPTED', 'PAID', 'VALIDATED', 'ACEPTADO', 'PAGADO', 'VALIDADO'];
    if (current.length > 0 && lockedStatuses.includes((current[0].status || '').toUpperCase())) {
      return res.status(403).json({ error: 'No se puede editar un pago que ya ha sido aceptado o pagado.' });
    }

    await pool.query(
      `UPDATE payments SET 
        transaction_id=?, contract_id=?, amount=?, method=?, status=?, payment_date=?,
        account_number=?, card_holder=?, is_recurring=?, recurring_dates=?, client_id=?
      WHERE upya_id = ? AND tenant_id = ?`,
      [
        transaction_id || null, contract_id || null, amount || 0, method || 'Other', 
        status || 'Pending', payment_date || null, account_number || null, card_holder || null, 
        is_recurring || false, recurring_dates ? JSON.stringify(recurring_dates) : null, 
        client_id || null, id, tenantId
      ]
    );
    
    // Real-Time Push to Upya si el pago se actualizó a pagado/validado
    const newStatus = (status || '').toUpperCase();
    if (newStatus === 'PAID' || newStatus === 'VALIDATED' || newStatus === 'ACEPTADO' || newStatus === 'PAGADO') {
       pushPaymentToUpya(req.body, tenantId);
    }

    res.json({ success: true });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/backoffice/contracts/generate-and-sign', async (req, res) => {
  try {
    const { contractData, signatureData, tenantId } = req.body;
    
    // 1. Save signature
    const signatureBase64 = signatureData.replace(/^data:image\/\w+;base64,/, "");
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');
    const signaturePath = path.join(SIGNED_DIR, `sig-${Date.now()}.png`);
    fs.writeFileSync(signaturePath, signatureBuffer);

    // 2. Load default template
    const templatePath = path.join(process.cwd(), 'contracts', 'template.docx');
    if (!fs.existsSync(templatePath)) {
      return res.status(404).json({ error: 'Plantilla base no encontrada en /contracts/template.docx' });
    }

    const content = fs.readFileSync(templatePath, 'binary');
    const zip = new PizZip(content);
    const opts = {
      centered: false,
      getImage: (tagValue) => fs.readFileSync(tagValue),
      getSize: () => [200, 100]
    };

    const doc = new Docxtemplater(zip, {
      modules: [new ImageModule(opts)]
    });

    // 3. Set data from manual form
    doc.setData({
      signature: signaturePath,
      clientName: contractData.client_name || 'Cliente',
      productName: contractData.product_name || 'N/A',
      dealName: contractData.deal_name || 'N/A',
      totalValue: contractData.total_value || 0,
      date: new Date().toLocaleDateString(),
      contractId: contractData.upya_id || 'N/A'
    });

    doc.render();

    const buf = doc.getZip().generate({ type: 'nodebuffer' });
    const outputFilename = `CONTRATO_GENERADO_${Date.now()}.docx`;
    const outputPath = path.join(SIGNED_DIR, outputFilename);
    fs.writeFileSync(outputPath, buf);

    // 4. Update/Save in DB with tenantId
    const upya_id = contractData.upya_id || `CTR-GEN-${Date.now()}`;
    const userId = req.body.userId || null;
    const orgId = req.body.orgId || null;
    await pool.query(
      `INSERT INTO contract_history 
       (upya_id, tenant_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image, created_by_user_id, org_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       contract_number=VALUES(contract_number), status=VALUES(status), signature_image=VALUES(signature_image),
       client_id=VALUES(client_id), product_name=VALUES(product_name), deal_name=VALUES(deal_name),
       total_value=VALUES(total_value), paid_value=VALUES(paid_value)`,
      [upya_id, tenantId, contractData.contract_number || outputFilename, contractData.client_id || null, contractData.product_name || null, contractData.deal_name || null, contractData.total_value || 0, contractData.paid_value || 0, 'FIRMADO', signatureData, userId, orgId]
    );

    res.json({ success: true, id: upya_id, filename: outputFilename });
  } catch (error) {
    console.error('Error generando contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backoffice/products', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM products WHERE tenant_id = ? ORDER BY name ASC', [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/data-collections', async (req, res) => {
  const { tenantId } = req.query;
  try {
    const [rows] = await pool.query('SELECT * FROM data_collections WHERE tenant_id = ? ORDER BY name ASC', [tenantId]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREATE/EDIT DATA COLLECTION
app.post('/api/backoffice/data-collections', async (req, res) => {
  const { username, password, collectionData, tenantId } = req.body;
  try {
    const upya = new UpyaManageClient(process.env.UPYA_USER, process.env.UPYA_PASS, tenantId);
    const upya_id = collectionData.upya_id || `FORM-${Date.now()}`;
    await pool.query(
      'INSERT INTO data_collections (upya_id, tenant_id, name, category, status, questions_json) VALUES (?, ?, ?, ?, ?, ?)',
      [upya_id, tenantId, collectionData.name, collectionData.category, collectionData.status || 'ENABLED', JSON.stringify(collectionData.questions)]
    );
    res.json({ success: true, upya_id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/data-collections/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, collectionData, tenantId } = req.body;
  try {
    const upya = new UpyaManageClient(process.env.UPYA_USER, process.env.UPYA_PASS, tenantId);
    await upya.dataCollections.update(id, collectionData);

    await pool.query(
      'UPDATE data_collections SET name=?, category=?, questions_json=? WHERE upya_id = ? AND tenant_id = ?',
      [collectionData.name, collectionData.category, JSON.stringify(collectionData.questions || []), id, tenantId]
    );

    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/backoffice/products', async (req, res) => {
  const { username, password, productData, tenantId } = req.body;
  try {
    const upya = new UpyaManageClient(process.env.UPYA_USER, process.env.UPYA_PASS, tenantId);
    const upya_id = productData.upya_id || productData.productReference || `PROD-${Date.now()}`;
    await pool.query(
      `INSERT INTO products (upya_id, tenant_id, name, model, variant, category, reference, is_lockable, manufacturer, is_serialized, description, status, picture_url, tac, build, default_managed_by, base_value, vat_rate) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [upya_id, tenantId, productData.name, productData.model || null, productData.variant || null, productData.category, productData.productReference, productData.lockable, productData.manufacturer, !productData.nonSerialized, productData.description, productData.status || 'Active', productData.picture_url, productData.tac, productData.build, productData.default_managed_by, productData.base_value || 0, productData.vat_rate || 0]
    );
    const [user] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (user.length > 0) await pool.query('INSERT INTO operation_logs (user_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?)', [user[0].id, 'PRODUCT_CREATE', upya_id, JSON.stringify(productData), 'SUCCESS']);
    res.json({ success: true, id: upya_id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/backoffice/products/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, productData, tenantId } = req.body;
  try {
    const upya = new UpyaManageClient(process.env.UPYA_USER, process.env.UPYA_PASS, tenantId);
    // await upya.products.update(id, productData); // Comentado para evitar efectos secundarios en Upya durante pruebas
    await pool.query(`UPDATE products SET name=?, model=?, variant=?, category=?, reference=?, is_lockable=?, manufacturer=?, is_serialized=?, description=?, picture_url=?, tac=?, build=?, default_managed_by=?, base_value=?, vat_rate=? WHERE upya_id = ? AND tenant_id = ?`, [productData.name, productData.model || null, productData.variant || null, productData.category, productData.productReference, productData.lockable, productData.manufacturer, !productData.nonSerialized, productData.description, productData.picture_url, productData.tac, productData.build, productData.default_managed_by, productData.base_value || 0, productData.vat_rate || 0, id, tenantId]);
    const [user] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (user.length > 0) await pool.query('INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?, ?)', [user[0].id, tenantId, 'PRODUCT_EDIT', id, JSON.stringify(productData), 'SUCCESS']);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/backoffice/products/:id', async (req, res) => {
  const { id } = req.params;
  const { tenantId } = req.query;
  try {
    await pool.query('DELETE FROM products WHERE upya_id = ? AND tenant_id = ?', [id, tenantId]);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// BATCH IMPORT PRODUCTS & INVENTORY FROM EXCEL (MULTI-TENANT ENFORCED)
app.post('/api/backoffice/products/import-batch', async (req, res) => {
  const { username, tenantId, items } = req.body;
  if (!tenantId || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Tenant ID y lista de elementos son requeridos.' });
  }

  try {
    let productsCount = 0;
    let inventoryCount = 0;
    let devicesCount = 0;

    for (const item of items) {
      const productName = (item.name || item.model || 'Producto Sin Nombre').trim();
      const ref = (item.reference || item.sku || `REF-${Date.now()}-${Math.floor(Math.random()*1000)}`).trim();
      const upyaId = `IMPORT-${ref}`;
      const category = (item.category || 'General').trim();
      const manufacturer = (item.manufacturer || item.brand || 'Genérico').trim();
      const baseValue = parseFloat(item.base_value) || 0;
      const isSerialized = !!(item.serial_number || item.imei1);

      // 1. Insert or Update Catalog Product
      const modelVal = (item.model || '').trim() || null;
      const variantVal = (item.variant || '').trim() || null;
      await pool.query(
        `INSERT INTO products (upya_id, tenant_id, name, model, variant, category, reference, is_lockable, manufacturer, is_serialized, description, status, base_value)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', ?)
         ON DUPLICATE KEY UPDATE 
           name = VALUES(name),
           model = VALUES(model),
           variant = VALUES(variant),
           category = VALUES(category), 
           manufacturer = VALUES(manufacturer), 
           base_value = VALUES(base_value)`,
        [upyaId, tenantId, productName, modelVal, variantVal, category, ref, item.is_lockable ? 1 : 0, manufacturer, isSerialized ? 1 : 0, item.description || 'Importado vía Excel', baseValue]
      );
      productsCount++;

      // 2. Insert Serial Number into inventory (if present)
      if (item.serial_number && String(item.serial_number).trim()) {
        const sn = String(item.serial_number).trim();
        const invUpyaId = `INV-${sn}`;
        await pool.query(
          `INSERT INTO inventory (upya_id, serial_number, tenant_id, model, status)
           VALUES (?, ?, ?, ?, 'In Stock')
           ON DUPLICATE KEY UPDATE model = VALUES(model), status = VALUES(status)`,
          [invUpyaId, sn, tenantId, productName]
        );
        inventoryCount++;
      }

      // 3. Insert IMEI into trustonic_devices (if present)
      if (item.imei1 && String(item.imei1).trim()) {
        const imei1Val = String(item.imei1).trim();
        const imei2Val = item.imei2 ? String(item.imei2).trim() : null;
        await pool.query(
          `INSERT INTO trustonic_devices (imei1, imei2, tenant_id, service, status, brand, model)
           VALUES (?, ?, ?, 'Prepago', 'Listo para su uso', ?, ?)
           ON DUPLICATE KEY UPDATE brand = VALUES(brand), model = VALUES(model)`,
          [imei1Val, imei2Val, tenantId, manufacturer, productName]
        );
        devicesCount++;
      }
    }

    // Audit log
    if (username) {
      const [user] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
      if (user.length > 0) {
        await pool.query(
          'INSERT INTO operation_logs (user_id, tenant_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?, ?)',
          [user[0].id, tenantId, 'PRODUCT_IMPORT_BATCH', `IMPORT-${Date.now()}`, JSON.stringify({ count: items.length, productsCount, inventoryCount, devicesCount }), 'SUCCESS']
        );
      }
    }

    res.json({
      success: true,
      message: `Importación completada: ${productsCount} productos, ${inventoryCount} series, ${devicesCount} IMEIs procesados.`,
      stats: { productsCount, inventoryCount, devicesCount, total: items.length }
    });
  } catch (error) {
    console.error('Error in batch product import:', error);
    res.status(500).json({ success: false, message: 'Error procesando la importación masiva: ' + error.message });
  }
});



app.get('/api/backoffice/audit', async (req, res) => {
  const { tenantId, userId, role, scopeOrgId, scopeRole } = req.query;
  try {
    const scope = await getScopeFilter(tenantId, userId, role, scopeOrgId, scopeRole, 'u');
    const [rows] = await pool.query(
      `SELECT ol.process_id AS ref_contrato, u.username AS cliente, u.email AS email, ol.status AS estado, ol.created_at AS fecha_registro, ol.process_type AS tipo 
       FROM operation_logs ol 
       LEFT JOIN users u ON (ol.user_id = u.id AND ol.tenant_id = u.tenant_id)
       WHERE ol.tenant_id = ? AND (${scope.filter})
       ORDER BY ol.created_at DESC LIMIT 500`, 
      [tenantId, ...scope.params]
    );
    res.json(rows);
  } catch (e) { 
    console.error('Audit Error:', e);
    res.status(500).json({ error: e.message }); 
  }
});


// --- AI SUPPORT AGENT ---
const SUPPORT_SYSTEM_PROMPT = `
Eres el Agente de Soporte Técnico Maestro de Bantos Cloud DataCenter. Tu misión es proporcionar guías paso a paso detalladas y precisas.

--- GUÍAS DETALLADAS DE NAVEGACIÓN Y VALIDACIÓN ---

1. MÓDULO DE SINCRONIZACIÓN:
   - MODELO DE NAVEGACIÓN: Menú Lateral > Sección 'Estructura' > Opción 'Sincronización'.
   - PASOS Y DATOS A REVISAR:
     1. Localiza el panel de control de Upya. Revisa que el 'Username' y 'Password' configurados sean los correctos.
     2. Haz clic en 'Iniciar Sincronización'. 
     3. REVISIÓN DE DATOS: Observa la consola de progreso. Al finalizar, verifica los contadores de 'Clientes Importados' y 'Contratos Sincronizados' para asegurar que el volumen de datos coincide con lo esperado en Upya.

2. MÓDULO DE CONTRATOS:
   - MODELO DE NAVEGACIÓN: Menú Lateral > Sección 'Operación' > Opción 'Contratos'.
   - PASOS Y DATOS A REVISAR:
     1. En la lista principal, busca el contrato deseado. 
     2. REVISIÓN DE DATOS: Verifica la columna 'Estado'. Si es 'Pending', requiere acción. Revisa que el 'ID de Cliente' y el 'Producto' asignado coincidan con la solicitud física.
     3. Haz clic en el icono de 'Lápiz' para acceder al Pad de Firma.
     4. VALIDACIÓN FINAL: Antes de guardar, revisa la vista previa del documento para confirmar que los términos y el nombre del cliente son correctos.

3. MÓDULO DE PAGOS:
   - MODELO DE NAVEGACIÓN: Menú Lateral > Sección 'Operación' > Opción 'Pagos'.
   - PASOS Y DATOS A REVISAR:
     1. Para registrar, haz clic en 'Registrar Pago'.
     2. REVISIÓN DE DATOS: Asegúrate de seleccionar el 'CTR-XXXX' correcto. Revisa el 'Monto' y el 'Método de Pago' (Transferencia, CLABE, etc.).
     3. Una vez registrado, busca el pago en la lista y revisa la columna 'Estado'. Debe marcarse como 'Paid' para estar conciliado.
     4. GENERACIÓN DE VOUCHER: Haz clic en el icono de 'Impresora'. 
     5. VALIDACIÓN DE PDF: Revisa que el PDF generado incluya el folio correcto, la fecha de la transacción y el desglose de IVA antes de entregarlo al cliente.

5. MÓDULO DE INVENTARIO (Control de Activos):
   - Paso 1: Ve a 'Operación' > 'Inventario'.
   - Paso 2: Filtra por equipos 'Serializados' para ver dispositivos específicos.
   - Paso 3: Haz clic en 'Editar' para cambiar el estado técnico o asignar el equipo.

6. MÓDULO DE TRUSTONIC (Seguridad Remota):
   - Paso 1: Ve a 'Operación' > 'Trustonic'.
   - Paso 2: Haz clic en 'Sincronizar Dispositivos' para actualizar los estados desde la nube.
   - Paso 3: Utiliza los controles de bloqueo para gestionar la seguridad del dispositivo de forma remota.

--- REGLA DE FALLO (IMPORTANTE) ---
- Si el usuario pregunta algo que NO está en estas guías o es una duda muy compleja, debes responder lo siguiente:
  "Lo siento, no tengo esa información detallada en mi base de conocimiento técnica actual. Para una asistencia más personalizada, te sugiero contactar directamente a un Agente de Soporte Humano a través de nuestros canales oficiales o enviar un ticket de soporte."

--- REGLAS GENERALES ---
- Responde siempre en español.
- Sé extremadamente claro y estructurado (usa listas numeradas).
- Mantén un tono profesional y experto.
`;

app.post('/api/support/chat', async (req, res) => {
  const { messages, tenantId } = req.body;
  
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Mensajes inválidos' });
  }

  try {
    // Consultamos estadísticas si el usuario pregunta por números
    let stats = { contracts: 0, payments: 0 };
    if (tenantId) {
      try {
        const [conCount] = await pool.query(
          "SELECT COUNT(*) as t FROM contract_history WHERE tenant_id = ? AND MONTH(synced_at) = MONTH(CURDATE()) AND YEAR(synced_at) = YEAR(CURDATE())", 
          [tenantId]
        );
        const [payCount] = await pool.query(
          "SELECT COUNT(*) as t FROM payments WHERE tenant_id = ? AND MONTH(payment_date) = MONTH(CURDATE()) AND YEAR(payment_date) = YEAR(CURDATE())", 
          [tenantId]
        );
        stats.contracts = conCount[0].t;
        stats.payments = payCount[0].t;
      } catch (dbError) {
        console.error("Error fetching chat stats:", dbError);
      }
    }

    const lastUserMessage = messages[messages.length - 1].content.trim();
    const lastUserMessageLower = lastUserMessage.toLowerCase();
    console.log(`[SupportAgent] Query: "${lastUserMessage}" | Tenant: ${tenantId}`);

    let response = "Lo siento, no tengo esa información detallada en mi base de conocimiento técnica actual. Para una asistencia más personalizada, te sugiero contactar directamente a un Agente de Soporte Humano a través de nuestros canales oficiales o enviar un ticket de soporte.";

    // --- BÚSQUEDA DE DETALLE DE CONTRATO POR REFERENCIA (Más flexible) ---
    const ctrMatch = lastUserMessage.match(/ctr-[\w\d-]+/i) || lastUserMessage.match(/[a-f0-9]{24}/i);
    if (ctrMatch) {
      const ref = ctrMatch[0];
      try {
        const [rows] = await pool.query(
          "SELECT * FROM contract_history WHERE (contract_number = ? OR upya_id = ?) AND tenant_id = ?", 
          [ref, ref, tenantId]
        );
        if (rows.length > 0) {
          const c = rows[0];
          console.log(`[SupportAgent] Contract Found: ${c.contract_number}`);
          return res.json({ content: `### Detalle del Contrato ${c.contract_number}
**Cliente ID:** ${c.client_id}
**Producto:** ${c.product_name}
**Plan:** ${c.deal_name}
**Valor Total:** $${c.total_value}
**Monto Pagado:** $${c.paid_value}
**Estado:** ${c.status.toUpperCase()}
**Sincronizado:** ${new Date(c.synced_at).toLocaleDateString()}
**Referencia Upya:** ${c.upya_id}` });
        }
      } catch (err) { console.error("[SupportAgent] DB Error:", err); }
    }

    // --- BÚSQUEDA DE CONTRATOS POR NOMBRE DE CLIENTE ---
    if (lastUserMessageLower.includes('contrato') && (lastUserMessageLower.includes('de ') || lastUserMessageLower.includes('tiene '))) {
      const parts = lastUserMessageLower.split(/de |tiene /);
      const namePart = parts[parts.length - 1].trim().replace(/[?¿!¡]/g, '');
      if (namePart.length > 2 && !['contrato', 'pagos', 'mes'].includes(namePart)) {
        try {
          const [clients] = await pool.query(
            "SELECT upya_id, name FROM client_history WHERE name LIKE ? AND tenant_id = ? LIMIT 1", 
            [`%${namePart}%`, tenantId]
          );
          if (clients.length > 0) {
            const client = clients[0];
            const [contracts] = await pool.query(
              "SELECT contract_number, status, product_name FROM contract_history WHERE client_id = ? AND tenant_id = ?", 
              [client.upya_id, tenantId]
            );
            if (contracts.length > 0) {
              const list = contracts.map(c => `- **${c.contract_number}**: ${c.product_name} (${c.status})`).join('\n');
              return res.json({ content: `El cliente **${client.name}** tiene **${contracts.length}** contrato(s) registrado(s):\n\n${list}` });
            } else {
              return res.json({ content: `El cliente **${client.name}** existe, pero no tiene contratos vinculados actualmente.` });
            }
          }
        } catch (err) { console.error("[SupportAgent] DB Error:", err); }
      }
    }

    if (lastUserMessageLower.includes('contrato') && (lastUserMessageLower.includes('cuántos') || lastUserMessageLower.includes('cantidad') || lastUserMessageLower.includes('mes'))) {
      response = `Este mes se han registrado **${stats.contracts}** contratos nuevos para tu tenant. Puedes ver el detalle completo en la sección de Operación > Contratos.`;
    } else if (lastUserMessage.includes('pago') && (lastUserMessage.includes('cuántos') || lastUserMessage.includes('cantidad') || lastUserMessage.includes('mes'))) {
      response = `Durante este mes se han procesado **${stats.payments}** pagos exitosos. Puedes consultar el historial y generar vouchers en Operación > Pagos.`;
    } else if (lastUserMessage.includes('contrato')) {
      response = `### GUÍA DE CONTRATOS
**Navegación:** Operación > Contratos.
**Pasos:**
1. Para uno nuevo, usa 'Nuevo Contrato'.
2. Para firmar, usa el icono de 'Lápiz' en contratos 'Pending'.
3. Puedes importar .pdf/.docx con 'Firmar & Importar'.
**Validación:** Revisa el estado, el ID del cliente y los términos antes de guardar la firma.`;
    } else if (lastUserMessage.includes('pago') || lastUserMessage.includes('voucher')) {
      response = `### GUÍA DE PAGOS
**Navegación:** Operación > Pagos.
**Pasos:**
1. Clic en 'Registrar Pago' y vincula al CTR-XXXX correcto.
2. Revisa monto y método.
3. Usa el icono de 'Impresora' para el Voucher PDF.
**Validación:** El estado debe ser 'Paid' para estar conciliado. Revisa folio y fecha en el PDF.`;
    } else if (lastUserMessage.includes('sincronización') || lastUserMessage.includes('upya')) {
      response = `### GUÍA DE SINCRONIZACIÓN
**Navegación:** Estructura > Sincronización.
**Pasos:**
1. Revisa credenciales de Upya.
2. Clic en 'Iniciar Sincronización'.
**Validación:** Al finalizar, verifica que los contadores de Clientes y Contratos coincidan con Upya.`;
    } else if (lastUserMessage.includes('trustonic') || lastUserMessage.includes('bloqueo')) {
      response = "En Trustonic puedes sincronizar estados de dispositivos y gestionar bloqueos remotos de seguridad desde la vista de 'Operación > Trustonic'.";
    } else if (lastUserMessage.includes('hola') || lastUserMessage.includes('quién eres')) {
      response = "¡Hola! Soy el Agente de Soporte de Bantos Cloud DataCenter. Estoy aquí para ayudarte con guías paso a paso sobre Contratos, Pagos y Sincronización.";
    } else if (lastUserMessage.includes('inventario') || lastUserMessage.includes('equipo')) {
      response = "En Inventario (Operación > Inventario) puedes rastrear activos serializados y actualizar su estado técnico.";
    }

    setTimeout(() => {
      res.json({ content: response });
    }, 800);

  } catch (e) {
    console.error('Support Agent Error:', e);
    res.status(500).json({ error: 'Error en el agente de soporte' });
  }
});

// --- API WEBVIEW PAGOS ---
app.post('/api/webview/validate-device', async (req, res) => {
  const { imei, curp, password } = req.body;
  if (!imei) {
    return res.status(400).json({ success: false, message: 'El IMEI o Celular es requerido.' });
  }

  if (!password || password.trim() !== 'pruebaiframe2507#') {
    return res.status(401).json({ success: false, message: 'Contraseña de acceso al entorno de prueba incorrecta.' });
  }

  try {
    const result = await trustonicApi.validateDevice(imei.trim());
    if (!result.success) {
      return res.json({ success: false, message: result.message });
    }

    // Si el dispositivo existe en Trustonic, simulamos la respuesta de la deuda de ese cliente.
    // (Por ahora no validamos CURP contra la BD local, devolvemos un mock de deuda para que fluya)
    return res.json({
      success: true,
      data: {
        device: result.device,
        contract_id: 'CTR-WEBVIEW-01',
        amount: 0.00,
        client_id: 'CLI-001'
      }
    });

  } catch (e) {
    console.error('Webview Validation Error:', e);
    return res.status(500).json({ success: false, message: 'Error interno de validación' });
  }
});

app.post('/api/webview/card-payments/assign-card', async (req, res) => {
  const { customer_id, token_id } = req.body;
  console.log(`>>> [WEBVIEW CARD] Asignando tarjeta ${token_id} a cliente ${customer_id}`);
  res.json({ success: true, message: 'Tarjeta asignada exitosamente' });
});

app.post('/api/webview/card-payments/transactions', async (req, res) => {
  const { customer_id, payment_method, amount } = req.body;
  const payId = `PAY-CARD-${Date.now()}`;
  console.log(`>>> [WEBVIEW CARD] Procesando cargo de $${amount} para cliente ${customer_id} con token ${payment_method}`);
  
  try {
    // Registrar el pago en la base de datos de Bantos
    await pool.query(
      `INSERT INTO payments (
        upya_id, transaction_id, tenant_id, contract_id, client_id, amount, method, status, payment_date
      ) VALUES (?, ?, ?, ?, ?, ?, 'Tarjeta (Dynamicore)', 'COMPLETED', NOW())`,
      [payId, `TX-${payId}`, 'c-romel', 'CTR-WEBVIEW-01', customer_id || 'CLI-001', amount || 0]
    );

    res.json({ success: true, transaction_id: payId, status: 'APPROVED' });
  } catch (err) {
    console.error('Error registrando pago de tarjeta:', err);
    res.json({ success: true, transaction_id: payId, status: 'APPROVED' });
  }
});

// --- API SUPER ADMIN (admin.bantos.cloud) ---
app.post('/api/superadmin/auth', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas o no eres Super Admin.' });
    }
    const user = rows[0];
    if (user.username !== 'armando.afa' && user.username !== 'aafa' && user.tenant_id !== null) {
      return res.status(401).json({ success: false, message: 'No tienes permisos de Super Admin.' });
    }
    if (user.password) {
      const valid = await bcrypt.compare(password, user.password);
      if (valid) {
        return res.json({
          success: true,
          user: {
            id: user.id,
            username: user.username,
            role: 'superadmin',
            email: user.email
          }
        });
      }
    }
    return res.status(401).json({ success: false, message: 'Credenciales inválidas.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/superadmin/tenants', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM tenants');
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/superadmin/tenants/stats', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        t.id, t.tenant_id, t.company_name, t.status, t.created_at,
        (SELECT COUNT(*) FROM inventory WHERE tenant_id = t.tenant_id) AS devices_count,
        (SELECT COUNT(*) FROM payment_plans WHERE tenant_id = t.tenant_id) AS plans_count,
        (SELECT COUNT(*) FROM contract_history WHERE tenant_id = t.tenant_id) AS contracts_count,
        (SELECT COUNT(*) FROM payments WHERE tenant_id = t.tenant_id) AS payments_count
      FROM tenants t
    `);
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/superadmin/tenants', async (req, res) => {
  const { tenant_id, company_name, upya_user, upya_pass, status } = req.body;
  if (!tenant_id) {
    return res.status(400).json({ error: 'tenant_id es requerido.' });
  }
  try {
    await pool.query(
      'INSERT INTO tenants (tenant_id, company_name, upya_user, upya_pass, status) VALUES (?, ?, ?, ?, ?)',
      [tenant_id, company_name || null, upya_user || null, upya_pass || null, status || 'active']
    );
    res.json({ success: true, message: 'Tenant registrado con éxito.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/superadmin/tenants/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  const { company_name, upya_user, upya_pass, status } = req.body;
  try {
    await pool.query(
      'UPDATE tenants SET company_name = ?, upya_user = ?, upya_pass = ?, status = ? WHERE tenant_id = ?',
      [company_name, upya_user || null, upya_pass || null, status, tenantId]
    );
    res.json({ success: true, message: 'Tenant actualizado con éxito.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/superadmin/tenants/:tenantId', async (req, res) => {
  const { tenantId } = req.params;
  try {
    await pool.query('DELETE FROM tenants WHERE tenant_id = ?', [tenantId]);
    res.json({ success: true, message: 'Tenant eliminado con éxito.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/superadmin/users', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.username, u.email, u.tenant_id, u.role, u.status, u.created_at,
              s.org_id, s.role as scope_role, o.name as org_name, o.type as org_type
       FROM users u
       LEFT JOIN user_scopes s ON u.id = s.user_id
       LEFT JOIN org_structure o ON s.org_id = o.id`
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/superadmin/users', async (req, res) => {
  const { username, email, password, tenant_id, role, status } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username y password son requeridos.' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const tenantVal = (tenant_id === 'NULL' || !tenant_id) ? null : tenant_id;
    const [result] = await pool.query(
      'INSERT INTO users (username, email, password, tenant_id, role, status) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email || null, hashedPassword, tenantVal, role || 'agent', status || 'active']
    );
    res.json({ success: true, userId: result.insertId, message: 'Usuario creado con éxito.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/superadmin/users/:id', async (req, res) => {
  const { id } = req.params;
  const { username, email, role, status, password } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await pool.query(
        'UPDATE users SET username = ?, email = ?, role = ?, status = ?, password = ? WHERE id = ?',
        [username, email, role, status, hashedPassword, id]
      );
    } else {
      await pool.query(
        'UPDATE users SET username = ?, email = ?, role = ?, status = ? WHERE id = ?',
        [username, email, role, status, id]
      );
    }
    res.json({ success: true, message: 'Usuario actualizado con éxito.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.delete('/api/superadmin/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM user_scopes WHERE user_id = ?', [id]);
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ success: true, message: 'Usuario eliminado con éxito.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.put('/api/superadmin/users/:id/scopes', async (req, res) => {
  const { id } = req.params;
  const { org_id, role, tenant_id } = req.body;
  try {
    await pool.query('DELETE FROM user_scopes WHERE user_id = ?', [id]);
    if (org_id) {
      await pool.query(
        'INSERT INTO user_scopes (user_id, org_id, role, tenant_id) VALUES (?, ?, ?, ?)',
        [id, org_id, role || 'STAFF', tenant_id]
      );
    }
    res.json({ success: true, message: 'Permisos actualizados con éxito.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// --- API INSIGHTS Y STATS (insight.bantos.cloud) ---
app.get('/api/insight/dashboard', async (req, res) => {
  const { tenantId } = req.query;
  try {
    let whereClause = '';
    let params = [];
    if (tenantId) {
      whereClause = 'WHERE tenant_id = ?';
      params = [tenantId];
    }

    const [[{ total_value }]] = await pool.query(
      `SELECT SUM(total_value) as total_value FROM contract_history ${whereClause}`,
      params
    );
    const [[{ paid_value }]] = await pool.query(
      `SELECT SUM(paid_value) as paid_value FROM contract_history ${whereClause}`,
      params
    );
    const [[{ total_contracts }]] = await pool.query(
      `SELECT COUNT(*) as total_contracts FROM contract_history ${whereClause}`,
      params
    );
    const [[{ total_clients }]] = await pool.query(
      `SELECT COUNT(*) as total_clients FROM client_history ${whereClause}`,
      params
    );
    const [[{ total_devices }]] = await pool.query(
      `SELECT COUNT(*) as total_devices FROM inventory ${whereClause}`,
      params
    );

    const [monthly_sales] = await pool.query(
      `SELECT DATE_FORMAT(created_at_upya, '%Y-%m') as month, SUM(total_value) as sales_val, COUNT(*) as count 
       FROM contract_history 
       ${whereClause} 
       GROUP BY month 
       ORDER BY month DESC LIMIT 12`,
      params
    );

    const [contracts_by_status] = await pool.query(
      `SELECT status, COUNT(*) as count FROM contract_history ${whereClause} GROUP BY status`,
      params
    );

    res.json({
      totalValue: Number(total_value || 0),
      paidValue: Number(paid_value || 0),
      totalContracts: total_contracts,
      totalClients: total_clients,
      totalDevices: total_devices,
      monthlySales: monthly_sales,
      contractsByStatus: contracts_by_status
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/insight/reports', async (req, res) => {
  const { tenantId, type, limit = 50, offset = 0 } = req.query;
  try {
    let whereClause = [];
    let params = [];
    if (tenantId) {
      whereClause.push('tenant_id = ?');
      params.push(tenantId);
    }
    if (type) {
      whereClause.push('process_type = ?');
      params.push(type);
    }

    const whereStr = whereClause.length > 0 ? `WHERE ${whereClause.join(' AND ')}` : '';
    
    const [rows] = await pool.query(
      `SELECT id, tenant_id, process_type, process_id, status, created_at, detail 
       FROM operation_logs 
       ${whereStr} 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), Number(offset)]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/insight/trustonic-stats', async (req, res) => {
  const { tenantId } = req.query;
  try {
    let whereClause = '';
    let params = [];
    if (tenantId) {
      whereClause = 'WHERE tenant_id = ?';
      params = [tenantId];
    }

    // 1. Total devices
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM trustonic_devices ${whereClause}`,
      params
    );

    // 2. Devices by status (excluyendo vacíos y strings sucios)
    const [statusBreakdown] = await pool.query(
      `SELECT status, COUNT(*) as count 
       FROM trustonic_devices 
       ${whereClause} 
       GROUP BY status 
       HAVING status IS NOT NULL AND status != '' AND LENGTH(status) < 50
       ORDER BY count DESC`,
      params
    );

    // 3. Top Brands
    const [brandBreakdown] = await pool.query(
      `SELECT COALESCE(brand, 'Generic') as brand, COUNT(*) as count 
       FROM trustonic_devices 
       ${whereClause} 
       GROUP BY brand 
       HAVING brand IS NOT NULL AND brand != ''
       ORDER BY count DESC 
       LIMIT 10`,
      params
    );

    // 4. Growth (logs por mes, filtrando fechas inválidas)
    const [growth] = await pool.query(
      `SELECT DATE_FORMAT(operation_date, '%Y-%m') as month, COUNT(*) as count 
       FROM trustonic_logs 
       ${whereClause ? whereClause + ' AND YEAR(operation_date) > 2000' : 'WHERE YEAR(operation_date) > 2000'}
       GROUP BY month 
       ORDER BY month DESC 
       LIMIT 12`,
      params
    );

    // 5. Operation Types breakdown
    const [opTypes] = await pool.query(
      `SELECT operation_type, COUNT(*) as count 
       FROM trustonic_logs 
       ${whereClause} 
       GROUP BY operation_type 
       ORDER BY count DESC 
       LIMIT 10`,
      params
    );

    res.json({
      total: total || 0,
      statusBreakdown,
      brandBreakdown,
      growth: growth.reverse(),
      opTypes
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Endpoint para disparar el Web Scraper de Trustonic manualmente
app.post('/api/insight/trustonic-sync', async (req, res) => {
  try {
    // Importación dinámica del scraper
    const { runTrustonicSync } = await import('./scripts/trustonicScraper.js');
    
    // Al ser un proceso largo, podríamos responder inmediato y correr asíncrono
    // Pero si el usuario quiere ver el loading, lo corremos con await.
    // Puppeteer scraper toma ~15-30s. Si hay timeout en el cliente, se debe hacer fire & forget.
    const result = await runTrustonicSync();
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json(result);
    }
  } catch (e) {
    console.error('Error al iniciar sincronización de Trustonic:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

app.listen(PORT, () => console.log(`Bantos Data Center API → puerto ${PORT}`));
