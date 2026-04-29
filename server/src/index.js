import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import UpyaManageClient from '../modules/upya-api-client/src/index.js';
import pool from './config/db.js';
import { createRequire } from 'module';
import path from 'path';
import fs from 'fs';

const require = createRequire(import.meta.url);
const PizZip = require('pizzip');
const Docxtemplater = require('docxtemplater');
const ImageModule = require('docxtemplater-image-module-free');
const sizeOf = require('image-size');
const nodemailer = require('nodemailer');
const multer = require('multer');

dotenv.config();

const app = express();
const PORT = 4000;
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

// Utilidad: descargar todas las páginas de una colección
async function fetchAll(upya, collection, pageSize = 100) {
  const all = [];
  
  const attempt = async (client, name) => {
    const results = [];
    let currentSkip = 0;
    try {
      while (true) {
        const res = await client.post(`/data/search/${collection}`, { query: {}, limit: pageSize, skip: currentSkip });
        let page = res.data;
        if (!Array.isArray(page)) page = page?.data || page?.results || [];
        if (!Array.isArray(page) || page.length === 0) break;
        results.push(...page);
        if (page.length < pageSize) break;
        currentSkip += pageSize;
      }
    } catch (e) {
      console.error(`[fetchAll attempt ${name}] ${collection}:`, e.message);
    }
    return results;
  };

  try {
    const useDataClient = ['payments', 'products', 'deals', 'assets', 'clients'].includes(collection);
    const primary = useDataClient ? upya.dataClient : upya.apiClient;
    const secondary = useDataClient ? upya.apiClient : upya.dataClient;

    let res = await attempt(primary, 'Primary');
    if (res.length === 0) {
      res = await attempt(secondary, 'Secondary');
    }
    console.log(`[fetchAll] ${collection} fetched: ${res.length} items`);
    all.push(...res);
  } catch (e) {
    console.error(`[fetchAll Error] ${collection}:`, e.message);
  }
  return all;
}

// --- MOTOR DE SINCRONIZACIÓN COMPLETO ---
app.post('/api/sync/bootstrap', async (req, res) => {
  const { username, password } = req.body;
  console.log('>>> [SYNC] Iniciando carga completa multi-página...');
  let stats = { clients: 0, contracts: 0, inventory: 0, products: 0, dataCollections: 0, payments: 0 };
  
  try {
    const upya = new UpyaManageClient(username, password);

    // 1. Clientes
    try {
      const cliList = await fetchAll(upya, 'clients');
      for (const c of cliList) {
        const name = `${c.profile?.firstName || ''} ${c.profile?.lastName || ''}`.trim() || c.name || 'Sin Nombre';
        const id = c.id || c._id || c.clientNumber;
        if (id) {
          await pool.query(
            'INSERT INTO client_history (upya_id, client_number, name, email) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE name=VALUES(name), client_number=VALUES(client_number)',
            [id, c.clientNumber || null, name, c.contact?.email || c.email || '']
          );
          stats.clients++;
        }
      }
    } catch (e) { console.error('Error in clients sync:', e.message); }

    // 2. Contratos
    try {
      const conList = await fetchAll(upya, 'contracts');
      for (const con of conList) {
        const id = con.id || con._id || con.contractNumber;
        const fechaUpya = con.signingDate || con.entryDate || con.submissionDate || null;
        const createdAt = fechaUpya ? new Date(fechaUpya) : null;
        
        // Mapeo de cliente: Prioridad al ID directo, luego al objeto client
        const upyaClientId = con.client_id || con.clientId || (con.client?.id) || (con.client?._id);
        const clientNumber = con.clientNumber || con.client?.clientNumber;

        if (id) {
          const productName = con.product?.name || con.productName || 'N/A';
          const dealName = con.dealName || con.deal?.name || 'Standard';
          const totalValue = con.totalCost || con.totalValue || 0;
          const paidValue = con.totalPaid || con.paidValue || 0;

          await pool.query(
            'INSERT INTO contract_history (upya_id, contract_number, client_id, client_number, product_name, deal_name, total_value, paid_value, status, created_at_upya) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status), created_at_upya=VALUES(created_at_upya), client_id=VALUES(client_id), client_number=VALUES(client_number), product_name=VALUES(product_name), deal_name=VALUES(deal_name), total_value=VALUES(total_value), paid_value=VALUES(paid_value)',
            [id, con.contractNumber || null, upyaClientId || null, clientNumber || null, productName, dealName, totalValue, paidValue, con.status || con.onboardingStatus || 'Active', createdAt]
          );
          stats.contracts++;
        }
      }
    } catch (e) { console.error('Error in contracts sync:', e.message); }

    // 3. Inventario
    try {
      const invList = await fetchAll(upya, 'assets');
      for (const a of invList) {
        const id = a.id || a._id || a.serialNumber || a.assetNumber;
        if (id) {
          await pool.query(
            'INSERT INTO inventory (upya_id, serial_number, model, status) VALUES (?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)',
            [id, a.serialNumber || a.serial_number || 'N/S', a.productDetails?.name || a.model_name || 'Generic', a.status || 'Ready']
          );
          stats.inventory++;
        }
      }
    } catch (e) { console.error('Error in inventory sync:', e.message); }

    // 3b. Pagos
    try {
      const payList = await fetchAll(upya, 'payments');
      for (const p of payList) {
        const id = p.id || p._id || p.transactionId || p.reference;
        if (id) {
          await pool.query(
            'INSERT INTO payments (upya_id, transaction_id, contract_id, amount, method, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status=VALUES(status)',
            [id, p.transactionId || null, p.contractNumber || p.contract_id || null, p.amount || 0, p.type || p.method || 'Unknown', p.status || 'Paid', (p.date || p.payment_date || p.timestamp) ? new Date(p.date || p.payment_date || p.timestamp) : null]
          );
          stats.payments++;
        }
      }
    } catch (e) { console.error('Error in payments sync:', e.message); }

    // 4. Productos
    try {
      let proList = await fetchAll(upya, 'products');
      if (proList.length === 0) proList = await fetchAll(upya, 'master-products');

      for (const p of proList) {
        const id = p.id || p._id || p.productReference || p.reference; 
        const name = p.name || p.productDetails?.name || 'Producto sin nombre';
        if (id && name) {
          let isSerialized = true;
          if (p.nonSerialized === true) isSerialized = false;

          await pool.query(
            `INSERT INTO products (
              upya_id, name, category, reference, is_lockable, manufacturer, 
              is_serialized, description, status, picture_url, tac, build, 
              default_managed_by, base_value
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
              name=VALUES(name), category=VALUES(category), reference=VALUES(reference),
              is_lockable=VALUES(is_lockable), manufacturer=VALUES(manufacturer),
              is_serialized=VALUES(is_serialized), description=VALUES(description),
              status=VALUES(status), picture_url=VALUES(picture_url), tac=VALUES(tac),
              build=VALUES(build), default_managed_by=VALUES(default_managed_by),
              base_value=VALUES(base_value)`,
            [
              id, name, p.category || p.productDetails?.category, p.productReference || p.reference, 
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
      const dealList = await fetchAll(upya, 'deals');
      for (const d of dealList) {
        const id = d.id || d._id || d.dealNumber;
        if (id) {
          await pool.query(
            'INSERT INTO payment_plans (upya_id, type, name, product_name, total_cost, status) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), name=VALUES(name), product_name=VALUES(product_name), total_cost=VALUES(total_cost), status=VALUES(status)',
            [id, d.type || 'PAYG', d.dealName || d.name || 'Sin nombre', d.productName || d.product?.name || (d.products?.length ? `${d.products.length} products` : 'Multiple'), d.totalCost || d.total_cost || 'Open', d.status || 'Active']
          );
          stats.deals = (stats.deals || 0) + 1;
        }
      }
    } catch (e) { console.error('Error in deals sync:', e.message); }

    // 4c. Estructura Organizacional
    const orgCollections = [
      { name: 'countries', type: 'Country' },
      { name: 'organisations', type: 'Organisation' },
      { name: 'branches', type: 'Branch' },
      { name: 'shops', type: 'Shop' }
    ];

    for (const coll of orgCollections) {
      try {
        const list = await fetchAll(upya, coll.name);
        for (const item of list) {
          const id = item.id || item._id;
          if (id) {
            await pool.query(
              `INSERT INTO org_structure (
                upya_id, name, type, parent_id, 
                entity_number, external_id, administrator, email, mobile, address
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
              ON DUPLICATE KEY UPDATE 
                name=VALUES(name), type=VALUES(type), parent_id=VALUES(parent_id),
                entity_number=VALUES(entity_number), external_id=VALUES(external_id),
                administrator=VALUES(administrator), email=VALUES(email),
                mobile=VALUES(mobile), address=VALUES(address)`,
              [
                id, item.name || 'Sin nombre', coll.type, item.parent || null,
                item.entityNumber || null, item.externalId || null,
                item.legal?.administrator || null,
                item.legal?.contact?.email || null,
                item.legal?.contact?.mobile || null,
                item.legal?.address?.fullAddress || null
              ]
            );
            stats.orgEntities = (stats.orgEntities || 0) + 1;
          }
        }
      } catch (e) { console.error(`Error in ${coll.name} sync:`, e.message); }
    }

    // 4d. Acciones (Actions/Tasks/Tickets)
    try {
      const actionsList = await fetchAll(upya, 'actions'); // Intento con 'actions'
      for (const a of actionsList) {
        const id = a.id || a._id;
        if (id) {
          await pool.query(
            'INSERT INTO operation_actions (upya_id, type, status, assigned_to, due_date, description, client_id, contract_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE type=VALUES(type), status=VALUES(status), assigned_to=VALUES(assigned_to), due_date=VALUES(due_date), description=VALUES(description), client_id=VALUES(client_id), contract_id=VALUES(contract_id)',
            [id, a.type || a.actionType || 'Tarea', a.status || 'Pendiente', a.assignee || a.assignedTo || 'Sin Asignar', a.dueDate ? new Date(a.dueDate) : null, a.description || a.notes || '', a.clientId || a.client_id || null, a.contractId || a.contract_id || null]
          );
          stats.actions = (stats.actions || 0) + 1;
        }
      }
    } catch (e) { console.error('Error in actions sync:', e.message); }

    // 5. Colecciones de Datos (Forms/Questionnaires)
    try {
      const formsList = await fetchAll(upya, 'questionnaires');
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
              upya_id, name, category, status, questions_json
            ) VALUES (?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE 
              name=VALUES(name), category=VALUES(category), status=VALUES(status), 
              questions_json=VALUES(questions_json)`,
            [id, name, category, f.status || 'ENABLED', JSON.stringify(f.questions || f.answers || f.steps || [])]
          );
          stats.dataCollections++;
        }
      }
    } catch (e) { console.error('Error in dataCollections sync:', e.message); }

    res.json({ success: true, ...stats });
  } catch (error) {
    console.error('>>> [SYNC FATAL ERROR]:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// --- ENDPOINTS DE CONSULTA ---
app.get('/api/backoffice/summary', async (req, res) => {
  try {
    const [cli] = await pool.query('SELECT COUNT(*) as t FROM client_history');
    const [con] = await pool.query('SELECT COUNT(*) as t FROM contract_history');
    const [inv] = await pool.query('SELECT COUNT(*) as t FROM inventory');
    const [pro] = await pool.query('SELECT COUNT(*) as t FROM products');
    const [dc]  = await pool.query('SELECT COUNT(*) as t FROM data_collections');
    const [pay] = await pool.query('SELECT COALESCE(SUM(amount),0) as t FROM payments');
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
  try {
    const [rows] = await pool.query('SELECT * FROM payment_plans ORDER BY name ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/org-structure', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM org_structure ORDER BY type ASC, name ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/actions', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM operation_actions ORDER BY due_date ASC, status DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/auth', async (req, res) => {
  const { username, password } = req.body;
  try {
    const baseUrl = process.env.UPYA_BASE_URL || 'https://api.upya.io';
    // We use /data/count/clients as a reliable way to check if credentials are valid
    const upyaRes = await axios.post(`${baseUrl}/data/count/clients`, { query: {} }, {
      auth: { username, password },
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (upyaRes.status === 200) {
      return res.json({ success: true, message: 'Autenticado' });
    } else {
      return res.status(401).json({ success: false, message: 'Acceso denegado' });
    }
  } catch (err) {
    console.error('Auth error:', err.response?.data || err.message);
    return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
  }
});

app.post('/api/backoffice/actions', async (req, res) => {
  try {
    const { type, status, assigned_to, due_date, description, client_id, contract_id } = req.body;
    const upya_id = `TKT-${Math.floor(1000 + Math.random() * 9000)}`; // Auto-generate ID locally for now
    await pool.query(
      'INSERT INTO operation_actions (upya_id, type, status, assigned_to, due_date, description, client_id, contract_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [upya_id, type, status, assigned_to, due_date || null, description, client_id || null, contract_id || null]
    );
    res.json({ success: true, upya_id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/actions/:id', async (req, res) => {
  try {
    const { type, status, assigned_to, due_date, description, client_id, contract_id } = req.body;
    await pool.query(
      'UPDATE operation_actions SET type=?, status=?, assigned_to=?, due_date=?, description=?, client_id=?, contract_id=? WHERE upya_id=?',
      [type, status, assigned_to, due_date || null, description, client_id || null, contract_id || null, req.params.id]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/data-collections', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM data_collections ORDER BY name ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/clients', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM client_history ORDER BY name ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/contracts', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT ch.*, cl.name AS client_name 
       FROM contract_history ch 
       LEFT JOIN client_history cl ON (ch.client_id = cl.upya_id OR (ch.client_number = cl.client_number AND ch.client_number IS NOT NULL))
       ORDER BY ch.synced_at DESC`
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/contracts', async (req, res) => {
  try {
    const { upya_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image } = req.body;
    const id = upya_id || `CTR-${Date.now()}`;
    await pool.query(
      'INSERT INTO contract_history (upya_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, contract_number || null, client_id || null, product_name || null, deal_name || null, total_value || 0, paid_value || 0, status || 'Signed', signature_image || null]
    );
    res.json({ success: true, id });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/contracts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image } = req.body;
    await pool.query(
      'UPDATE contract_history SET contract_number=?, client_id=?, product_name=?, deal_name=?, total_value=?, paid_value=?, status=?, signature_image=? WHERE upya_id = ?',
      [contract_number || null, client_id || null, product_name || null, deal_name || null, total_value || 0, paid_value || 0, status || 'Signed', signature_image || null, id]
    );
    res.json({ success: true });
  } catch (e) { 
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/backoffice/contracts/:id/sign', async (req, res) => {
  try {
    const { id } = req.params;
    const { signatureData } = req.body;
    console.log(`>>> [SIGN] Signing contract: ${id} (${signatureData ? signatureData.length : 0} bytes)`);
    await pool.query(
      'UPDATE contract_history SET status="FIRMADO", signature_image=? WHERE upya_id = ?',
      [signatureData, id]
    );
    console.log('<<< [SIGN] Contract signed successfully');
    res.json({ success: true });
  } catch (e) { 
    console.error('!!! [SIGN] Error signing contract:', e.message);
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/backoffice/contracts/import-and-sign', upload.single('file'), async (req, res) => {
  try {
    const { client_id, signatureData, client_name, email } = req.body;
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
      // Para PDF o otros, simplemente guardamos el original y la firma aparte por ahora
      // Opcionalmente se podría implementar unión de PDF
      outputFilename = `CONTRATO_IMPORTADO_${Date.now()}_${file.originalname}`;
      outputPath = path.join(SIGNED_DIR, outputFilename);
      fs.copyFileSync(file.path, outputPath);
    }

    // Guardar en DB
    await pool.query(
      'INSERT INTO contract_history (upya_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, outputFilename, client_id || null, 'Documento Importado', 'Importación Directa', 0, 0, 'FIRMADO', signatureData]
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
  try {
    const [rows] = await pool.query('SELECT * FROM inventory ORDER BY synced_at DESC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get('/api/backoffice/payments', async (req, res) => {
  try {
    console.log('>>> [GET] Fetching payments...');
    const query = `
      SELECT p.*, c.name as client_name, h.product_name, c.client_number
      FROM payments p
      LEFT JOIN contract_history h ON p.contract_id = h.contract_number
      LEFT JOIN client_history c ON c.upya_id = COALESCE(p.client_id, h.client_id)
      ORDER BY p.payment_date DESC
    `;
    const [rows] = await pool.query(query);
    console.log(`<<< [GET] Returned ${rows.length} payments`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/backoffice/payments', async (req, res) => {
  try {
    console.log('>>> [POST] Creating payment:', req.body.upya_id || 'manual');
    const { 
      upya_id, transaction_id, contract_id, amount, method, status, payment_date,
      account_number, card_holder, is_recurring, recurring_dates, client_id
    } = req.body;
    
    await pool.query(
      `INSERT INTO payments (
        upya_id, transaction_id, contract_id, amount, method, status, payment_date,
        account_number, card_holder, is_recurring, recurring_dates, client_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        upya_id || `PAY-${Date.now()}`, transaction_id || null, contract_id || null, 
        amount || 0, method || 'Other', status || 'Pending', payment_date || new Date(),
        account_number || null, card_holder || null, is_recurring || false, 
        recurring_dates ? JSON.stringify(recurring_dates) : null, client_id || null
      ]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.put('/api/backoffice/payments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('>>> [PUT] Updating payment:', id, 'Payload:', req.body);
    const { 
      transaction_id, contract_id, amount, method, status, payment_date,
      account_number, card_holder, is_recurring, recurring_dates, client_id
    } = req.body;

    // Check if it can be edited (Only Accepted/Paid are locked)
    const [current] = await pool.query('SELECT status FROM payments WHERE upya_id = ?', [id]);
    const lockedStatuses = ['ACCEPTED', 'PAID', 'VALIDATED', 'ACEPTADO', 'PAGADO', 'VALIDADO'];
    if (current.length > 0 && lockedStatuses.includes((current[0].status || '').toUpperCase())) {
      console.warn('!!! [PUT] Attempt to edit locked payment:', id);
      return res.status(403).json({ error: 'No se puede editar un pago que ya ha sido aceptado o pagado.' });
    }

    await pool.query(
      `UPDATE payments SET 
        transaction_id=?, contract_id=?, amount=?, method=?, status=?, payment_date=?,
        account_number=?, card_holder=?, is_recurring=?, recurring_dates=?, client_id=?
      WHERE upya_id = ?`,
      [
        transaction_id || null, contract_id || null, amount || 0, method || 'Other', 
        status || 'Pending', payment_date || null, account_number || null, card_holder || null, 
        is_recurring || false, recurring_dates ? JSON.stringify(recurring_dates) : null, 
        client_id || null, id
      ]
    );
    console.log('<<< [PUT] Update successful:', id);
    res.json({ success: true });
  } catch (e) { 
    console.error('!!! [PUT] Error updating payment:', e.message);
    res.status(500).json({ error: e.message }); 
  }
});

app.post('/api/backoffice/contracts/generate-and-sign', async (req, res) => {
  try {
    const { contractData, signatureData } = req.body;
    
    // 1. Save signature
    const signatureBase64 = signatureData.replace(/^data:image\/\w+;base64,/, "");
    const signatureBuffer = Buffer.from(signatureBase64, 'base64');
    const signaturePath = path.join(SIGNED_DIR, `sig-${Date.now()}.png`);
    fs.writeFileSync(signaturePath, signatureBuffer);

    // 2. Load default template
    // Buscamos un template base en el sistema
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

    // 4. Update/Save in DB
    const upya_id = contractData.upya_id || `CTR-GEN-${Date.now()}`;
    await pool.query(
      'INSERT INTO contract_history (upya_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE contract_number=VALUES(contract_number), status=VALUES(status), signature_image=VALUES(signature_image)',
      [upya_id, outputFilename, contractData.client_id || null, contractData.product_name || null, contractData.deal_name || null, contractData.total_value || 0, contractData.paid_value || 0, 'FIRMADO', signatureData]
    );

    res.json({ success: true, id: upya_id, filename: outputFilename });
  } catch (error) {
    console.error('Error generando contrato:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/backoffice/products', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// CREATE/EDIT DATA COLLECTION
app.post('/api/backoffice/data-collections', async (req, res) => {
  const { username, password, collectionData } = req.body;
  try {
    const upya = new UpyaManageClient(username, password);
    const result = await upya.dataCollections.create(collectionData);
    const upya_id = result.id || result._id;

    await pool.query(
      'INSERT INTO data_collections (upya_id, name, category, status, questions_json) VALUES (?, ?, ?, ?, ?)',
      [upya_id, collectionData.name, collectionData.category, 'ENABLED', JSON.stringify(collectionData.questions || [])]
    );

    res.json({ success: true, id: upya_id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/backoffice/data-collections/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, collectionData } = req.body;
  try {
    const upya = new UpyaManageClient(username, password);
    await upya.dataCollections.update(id, collectionData);

    await pool.query(
      'UPDATE data_collections SET name=?, category=?, questions_json=? WHERE upya_id = ?',
      [collectionData.name, collectionData.category, JSON.stringify(collectionData.questions || []), id]
    );

    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/backoffice/products', async (req, res) => {
  const { username, password, productData } = req.body;
  try {
    const upya = new UpyaManageClient(username, password);
    const result = await upya.products.create(productData);
    const upya_id = result.id || result._id || productData.productReference;
    await pool.query(
      `INSERT INTO products (upya_id, name, category, reference, is_lockable, manufacturer, is_serialized, description, status, picture_url, tac, build, default_managed_by, base_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [upya_id, productData.name, productData.category, productData.productReference, productData.lockable, productData.manufacturer, !productData.nonSerialized, productData.description, 'Active', productData.picture_url, productData.tac, productData.build, productData.default_managed_by, productData.base_value || 0]
    );
    const [user] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (user.length > 0) await pool.query('INSERT INTO operation_logs (user_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?)', [user[0].id, 'PRODUCT_CREATE', upya_id, JSON.stringify(productData), 'SUCCESS']);
    res.json({ success: true, id: upya_id });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.put('/api/backoffice/products/:id', async (req, res) => {
  const { id } = req.params;
  const { username, password, productData } = req.body;
  try {
    const upya = new UpyaManageClient(username, password);
    await upya.products.update(id, productData);
    await pool.query(`UPDATE products SET name=?, category=?, reference=?, is_lockable=?, manufacturer=?, is_serialized=?, description=?, picture_url=?, tac=?, build=?, default_managed_by=?, base_value=? WHERE upya_id = ?`, [productData.name, productData.category, productData.productReference, productData.lockable, productData.manufacturer, !productData.nonSerialized, productData.description, productData.picture_url, productData.tac, productData.build, productData.default_managed_by, productData.base_value || 0, id]);
    const [user] = await pool.query('SELECT id FROM users WHERE username = ?', [username]);
    if (user.length > 0) await pool.query('INSERT INTO operation_logs (user_id, process_type, process_id, detail, status) VALUES (?, ?, ?, ?, ?)', [user[0].id, 'PRODUCT_EDIT', id, JSON.stringify(productData), 'SUCCESS']);
    res.json({ success: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.get('/api/backoffice/audit', async (req, res) => {
  try {
    const [rows] = await pool.query(`SELECT ol.process_id AS ref_contrato, u.username AS cliente, u.email AS email, ol.status AS estado, ol.created_at AS fecha_registro, ol.process_type AS tipo FROM operation_logs ol LEFT JOIN users u ON ol.user_id = u.id ORDER BY ol.created_at DESC LIMIT 500`);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.listen(PORT, () => console.log(`Bantos Data Center API → puerto ${PORT}`));
