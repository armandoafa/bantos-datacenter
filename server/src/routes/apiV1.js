import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import pool from '../config/db.js';
import * as trustonicApi from '../services/trustonicApi.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'bantos-secret-api-jwt-key-2026';

// ── SWAGGER / OPENAPI 3.0 CONFIGURATION ──────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Bantos LMS - API de Integración para Terceros',
      version: '1.0.0',
      description: 'API pública RESTful de Bantos LMS para integración segura de sistemas de terceros (CRMs, ERPs, Pasarelas de Pago) mediante autenticación API Key + Bearer Token JWT.',
      contact: {
        name: 'Soporte Técnico Bantos Data Center',
        email: 'soporte@bantos.cloud',
        url: 'https://bantos.cloud'
      },
    },
    servers: [
      {
        url: 'https://bantos.cloud',
        description: 'Servidor de Producción'
      },
      {
        url: 'http://localhost:4000',
        description: 'Entorno de Desarrollo Local'
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Introduce tu token JWT obtenido previamente del endpoint POST /api/v1/auth/token'
        }
      },
      schemas: {
        TokenResponse: {
          type: 'object',
          properties: {
            access_token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
            token_type: { type: 'string', example: 'Bearer' },
            expires_in: { type: 'integer', example: 86400 },
            tenant_id: { type: 'string', example: 'c-romel' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error de autenticación' },
            message: { type: 'string', example: 'Se requiere un Bearer Token válido.' }
          }
        },
        Device: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 101 },
            imei: { type: 'string', example: '861234567890123' },
            serial_number: { type: 'string', example: 'SN-99812' },
            status: { type: 'string', example: 'active' },
            is_locked: { type: 'boolean', example: false },
            assigned_client_id: { type: 'string', example: 'CLI-8812' },
            store_name: { type: 'string', example: 'Tienda Central' }
          }
        },
        Customer: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 45 },
            upya_id: { type: 'string', example: 'CLI-8812' },
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan.perez@example.com' },
            mobile: { type: 'string', example: '5512345678' },
            clabe: { type: 'string', example: '646180123456789012' }
          }
        },
        Contract: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 12 },
            contract_number: { type: 'string', example: 'CNT-2026-001' },
            customer_name: { type: 'string', example: 'Juan Pérez' },
            device_imei: { type: 'string', example: '861234567890123' },
            total_amount: { type: 'number', example: 12500.00 },
            balance_pending: { type: 'number', example: 4500.00 },
            status: { type: 'string', example: 'active' }
          }
        },
        PaymentInput: {
          type: 'object',
          required: ['contract_id', 'amount'],
          properties: {
            contract_id: { type: 'string', example: 'CNT-2026-001' },
            amount: { type: 'number', example: 450.00 },
            payment_method: { type: 'string', example: 'bank_transfer' },
            reference: { type: 'string', example: 'REF-BANK-9981' }
          }
        }
      }
    }
  },
  apis: ['./src/routes/apiV1.js', './src/index.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Documentación JSON & UI Swagger
router.get('/v1/swagger.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});
router.use('/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ── MIDDLEWARE AUTENTICACIÓN EXTERNA (BEARER TOKEN JWT) ──────────────────────
export const authenticateExternalApiToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ 
      error: 'Acceso no autorizado', 
      message: 'Se requiere un Bearer Token en el encabezado Authorization. Obtén uno en /api/v1/auth/token' 
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ 
        error: 'Token inválido o expirado', 
        message: 'El token de acceso no es válido o ha caducado. Por favor genera un nuevo token con /api/v1/auth/token' 
      });
    }
    req.externalApi = decoded;
    req.tenantId = decoded.tenantId;
    next();
  });
};


// ── BACKOFFICE API KEYS MANAGEMENT ──────────────────────────────────────────

// GET /api/backoffice/api-keys
router.get('/backoffice/api-keys', async (req, res) => {
  const { tenantId } = req.query;
  if (!tenantId) return res.status(400).json({ error: 'tenantId es requerido' });
  try {
    const [rows] = await pool.query(
      'SELECT id, tenant_id, name, api_key, scopes, status, last_used_at, created_at FROM tenant_api_keys WHERE tenant_id = ? ORDER BY created_at DESC',
      [tenantId]
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/backoffice/api-keys
router.post('/backoffice/api-keys', async (req, res) => {
  const { tenantId, name, scopes, userId } = req.body;
  if (!tenantId || !name) return res.status(400).json({ error: 'tenantId y nombre son requeridos' });

  try {
    const prefixKey = 'bnt_live_' + crypto.randomBytes(12).toString('hex');
    const secretKey = 'bnt_sec_' + crypto.randomBytes(24).toString('hex');
    const secretHash = await bcrypt.hash(secretKey, 10);

    const [result] = await pool.query(
      'INSERT INTO tenant_api_keys (tenant_id, name, api_key, api_secret_hash, scopes, created_by_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      [tenantId, name.trim(), prefixKey, secretHash, JSON.stringify(scopes || ['full_access']), userId || null]
    );

    res.json({
      id: result.insertId,
      name: name.trim(),
      api_key: prefixKey,
      api_secret: secretKey, // Se envía ÚNICAMENTE en la respuesta de creación
      tenant_id: tenantId,
      message: 'API Key generada exitosamente. Guarda el api_secret de forma segura, no podrá ser mostrado nuevamente.'
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/backoffice/api-keys/:id
router.delete('/backoffice/api-keys/:id', async (req, res) => {
  const { tenantId } = req.query;
  try {
    await pool.query('UPDATE tenant_api_keys SET status = "revoked" WHERE id = ? AND tenant_id = ?', [req.params.id, tenantId]);
    res.json({ success: true, message: 'API Key revocada exitosamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── EXTERNAL API ENDPOINTS (v1) ─────────────────────────────────────────────

/**
 * @openapi
 * /api/v1/auth/token:
 *   post:
 *     summary: Intercambio de credenciales API Key por Token Bearer (JWT)
 *     description: Autentica una aplicación externa enviando api_key y api_secret para generar un Bearer Token válido por 24 horas.
 *     tags:
 *       - Autenticación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - api_key
 *               - api_secret
 *             properties:
 *               api_key:
 *                 type: string
 *                 example: bnt_live_8f3a9b1c2d3e4f5a
 *               api_secret:
 *                 type: string
 *                 example: bnt_sec_1a2b3c4d5e6f7a8b9c0d1e2f
 *     responses:
 *       200:
 *         description: Token generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TokenResponse'
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/v1/auth/token', async (req, res) => {
  const { api_key, api_secret } = req.body;
  if (!api_key || !api_secret) {
    return res.status(400).json({ error: 'Se requieren api_key y api_secret en el cuerpo de la petición' });
  }

  try {
    const [rows] = await pool.query(
      'SELECT * FROM tenant_api_keys WHERE api_key = ? AND status = "active"',
      [api_key]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas', message: 'API Key no encontrada o inactiva.' });
    }

    const keyRecord = rows[0];
    const matchSecret = await bcrypt.compare(api_secret, keyRecord.api_secret_hash);

    if (!matchSecret) {
      return res.status(401).json({ error: 'Credenciales inválidas', message: 'API Secret incorrecto.' });
    }

    // Actualizar timestamp de último uso
    await pool.query('UPDATE tenant_api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?', [keyRecord.id]);

    // Generar JWT
    const tokenPayload = {
      tenantId: keyRecord.tenant_id,
      apiKeyId: keyRecord.id,
      name: keyRecord.name,
      scopes: keyRecord.scopes
    };

    const accessToken = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: 86400,
      tenant_id: keyRecord.tenant_id
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /api/v1/devices:
 *   get:
 *     summary: Obtener catálogo de dispositivos
 *     description: Retorna la lista paginada de dispositivos asociados al tenant.
 *     tags:
 *       - Dispositivos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de dispositivos
 */
router.get('/v1/devices', authenticateExternalApiToken, async (req, res) => {
  const { limit = 50, status } = req.query;
  try {
    let query = 'SELECT i.id, i.imei, i.serial_number, i.status, i.assigned_to_user_id, o.name as store_name FROM inventory i LEFT JOIN org_structure o ON i.store_id = o.id WHERE i.tenant_id = ?';
    const params = [req.tenantId];

    if (status) {
      query += ' AND i.status = ?';
      params.push(status);
    }
    query += ' ORDER BY i.id DESC LIMIT ?';
    params.push(parseInt(limit));

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/devices/{imei}:
 *   get:
 *     summary: Consultar detalle de un dispositivo por IMEI
 *     tags:
 *       - Dispositivos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del dispositivo
 */
router.get('/v1/devices/:imei', authenticateExternalApiToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT i.*, o.name as store_name FROM inventory i LEFT JOIN org_structure o ON i.store_id = o.id WHERE i.imei = ? AND i.tenant_id = ?',
      [req.params.imei, req.tenantId]
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Dispositivo no encontrado para este tenant' });
    }
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/devices/{imei}/lock:
 *   post:
 *     summary: Solicitar bloqueo de dispositivo por IMEI
 *     tags:
 *       - Dispositivos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden de bloqueo emitida exitosamente
 */
router.post('/v1/devices/:imei/lock', authenticateExternalApiToken, async (req, res) => {
  try {
    const result = await trustonicApi.lockDevice(pool, req.tenantId, req.params.imei);
    res.json({ success: true, imei: req.params.imei, action: 'LOCK', result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/devices/{imei}/unlock:
 *   post:
 *     summary: Solicitar desbloqueo de dispositivo por IMEI
 *     tags:
 *       - Dispositivos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: imei
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Orden de desbloqueo emitida exitosamente
 */
router.post('/v1/devices/:imei/unlock', authenticateExternalApiToken, async (req, res) => {
  try {
    const result = await trustonicApi.unlockDevice(pool, req.tenantId, req.params.imei);
    res.json({ success: true, imei: req.params.imei, action: 'UNLOCK', result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /api/v1/customers:
 *   get:
 *     summary: Obtener catálogo de clientes
 *     tags:
 *       - Clientes
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de clientes
 */
router.get('/v1/customers', authenticateExternalApiToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, upya_id, name, email, mobile, clabe, created_at FROM client_history WHERE tenant_id = ? ORDER BY id DESC LIMIT 100',
      [req.tenantId]
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/customers:
 *   post:
 *     summary: Crear nuevo cliente
 *     tags:
 *       - Clientes
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: María López
 *               email:
 *                 type: string
 *                 example: maria@example.com
 *               mobile:
 *                 type: string
 *                 example: 5598765432
 *     responses:
 *       200:
 *         description: Cliente registrado exitosamente
 */
router.post('/v1/customers', authenticateExternalApiToken, async (req, res) => {
  const { name, email, mobile } = req.body;
  if (!name) return res.status(400).json({ error: 'El nombre del cliente es obligatorio' });

  try {
    const newUpyaId = `CLI-EXT-${Date.now()}`;
    const [result] = await pool.query(
      'INSERT INTO client_history (upya_id, tenant_id, name, email, mobile) VALUES (?, ?, ?, ?, ?)',
      [newUpyaId, req.tenantId, name.trim(), email || null, mobile || null]
    );
    res.json({ success: true, customer_id: result.insertId, upya_id: newUpyaId, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /api/v1/contracts:
 *   get:
 *     summary: Obtener listado de contratos
 *     tags:
 *       - Contratos
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de contratos del tenant
 */
router.get('/v1/contracts', authenticateExternalApiToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT c.*, ch.name as customer_name, i.imei as device_imei FROM contracts c LEFT JOIN client_history ch ON c.client_id = ch.upya_id LEFT JOIN inventory i ON c.inventory_id = i.id WHERE c.tenant_id = ? ORDER BY c.id DESC LIMIT 100',
      [req.tenantId]
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /api/v1/payments:
 *   post:
 *     summary: Registrar un pago externo
 *     tags:
 *       - Pagos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentInput'
 *     responses:
 *       200:
 *         description: Pago registrado exitosamente
 */
router.post('/v1/payments', authenticateExternalApiToken, async (req, res) => {
  const { contract_id, amount, payment_method, reference } = req.body;
  if (!contract_id || !amount) {
    return res.status(400).json({ error: 'contract_id y amount son requeridos' });
  }
  try {
    const [result] = await pool.query(
      'INSERT INTO payment_history (tenant_id, contract_id, amount, payment_method, reference, status) VALUES (?, ?, ?, ?, ?, "completed")',
      [req.tenantId, contract_id, amount, payment_method || 'external_api', reference || `EXT-API-${Date.now()}`]
    );
    res.json({ success: true, payment_id: result.insertId, amount, status: 'completed' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


/**
 * @openapi
 * /api/v1/inventory/stores:
 *   get:
 *     summary: Consultar tiendas y sucursales
 *     tags:
 *       - Inventario
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de tiendas del tenant
 */
router.get('/v1/inventory/stores', authenticateExternalApiToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, type, is_central_store, administrator FROM org_structure WHERE tenant_id = ? ORDER BY name ASC',
      [req.tenantId]
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
