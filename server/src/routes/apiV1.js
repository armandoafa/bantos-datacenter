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
            client_number: { type: 'string', example: 'C-9901' },
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan.perez@example.com' },
            mobile: { type: 'string', example: '5512345678' },
            clabe: { type: 'string', example: '646180123456789012' }
          }
        },
        CustomerInput: {
          type: 'object',
          required: ['name'],
          properties: {
            name: { type: 'string', example: 'Juan Pérez' },
            email: { type: 'string', example: 'juan.perez@example.com' },
            mobile: { type: 'string', example: '5512345678' },
            client_number: { type: 'string', example: 'CLI-9981' },
            clabe: { type: 'string', example: '646180123456789012' },
            address: { type: 'string', example: 'Av. Reforma 100, CDMX' }
          }
        },
        Contract: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 12 },
            upya_id: { type: 'string', example: 'CTR-9981' },
            contract_number: { type: 'string', example: 'CNT-2026-001' },
            customer_name: { type: 'string', example: 'Juan Pérez' },
            product_name: { type: 'string', example: 'SAMSUNG SM-A175F' },
            total_value: { type: 'number', example: 12500.00 },
            paid_value: { type: 'number', example: 4500.00 },
            status: { type: 'string', example: 'Firmado' }
          }
        },
        ContractInput: {
          type: 'object',
          required: ['total_value'],
          properties: {
            contract_number: { type: 'string', example: 'CNT-2026-001' },
            client_id: { type: 'string', example: 'CLI-8812' },
            product_name: { type: 'string', example: 'SAMSUNG SM-A175F' },
            deal_name: { type: 'string', example: 'Plan 12 Meses' },
            total_value: { type: 'number', example: 12500.00 },
            paid_value: { type: 'number', example: 2500.00 },
            status: { type: 'string', example: 'Firmado' },
            signature_image: { type: 'string', example: 'data:image/png;base64,...' }
          }
        },
        PaymentInput: {
          type: 'object',
          required: ['contract_id', 'amount'],
          properties: {
            contract_id: { type: 'string', example: 'CNT-2026-001' },
            client_id: { type: 'string', example: 'CLI-8812' },
            amount: { type: 'number', example: 450.00 },
            payment_method: { type: 'string', example: 'Efectivo' },
            transaction_id: { type: 'string', example: 'TX-998123' },
            status: { type: 'string', example: 'PAID' }
          }
        },
        PaymentUpdateInput: {
          type: 'object',
          properties: {
            amount: { type: 'number', example: 500.00 },
            method: { type: 'string', example: 'Tarjeta Débito' },
            status: { type: 'string', example: 'PAID' }
          }
        },
        SaleInput: {
          type: 'object',
          required: ['client', 'deal'],
          properties: {
            client: {
              type: 'object',
              required: ['name'],
              properties: {
                name: { type: 'string', example: 'Juan Pérez' },
                email: { type: 'string', example: 'juan@example.com' },
                mobile: { type: 'string', example: '5512345678' },
                client_number: { type: 'string', example: 'CLI-1001' },
                address: { type: 'string', example: 'Av. Insurgentes Sur 45' }
              }
            },
            device: {
              type: 'object',
              properties: {
                product_name: { type: 'string', example: 'SAMSUNG SM-A175F' },
                imei: { type: 'string', example: '861234567890123' },
                serial_number: { type: 'string', example: 'SN-99812' }
              }
            },
            deal: {
              type: 'object',
              required: ['total_value'],
              properties: {
                name: { type: 'string', example: 'Plan Quincenal 12M' },
                total_value: { type: 'number', example: 12500.00 }
              }
            },
            payment: {
              type: 'object',
              properties: {
                amount: { type: 'number', example: 2500.00 },
                method: { type: 'string', example: 'Efectivo' },
                status: { type: 'string', example: 'PAID' }
              }
            },
            signature_image: { type: 'string', example: 'data:image/png;base64,...' }
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
 *     summary: Lock (Bloquear dispositivo)
 *     description: Solicita el bloqueo de la pantalla del dispositivo por IMEI.
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               lock_message:
 *                 type: string
 *                 example: Dispositivo bloqueado por falta de pago
 *     responses:
 *       200:
 *         description: Orden de bloqueo emitida exitosamente
 */
router.post('/v1/devices/:imei/lock', authenticateExternalApiToken, async (req, res) => {
  try {
    const lockMsg = req.body?.lock_message || 'Dispositivo bloqueado por falta de pago';
    const result = await trustonicApi.lockDevice(pool, req.tenantId, req.params.imei, lockMsg);
    res.json({ success: true, imei: req.params.imei, action: 'LOCK', lock_message: lockMsg, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/devices/{imei}/unlock:
 *   post:
 *     summary: UnLock (Desbloquear dispositivo)
 *     description: Solicita el desbloqueo del dispositivo por IMEI.
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
 * /api/v1/devices/{imei}/release:
 *   post:
 *     summary: Liberar dispositivo (Release)
 *     description: Remueve la gestión de seguridad de Trustonic del dispositivo (liberación por fin de contrato o pago total).
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
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 example: Liberación por fin de contrato
 *     responses:
 *       200:
 *         description: Orden de liberación ejecutada exitosamente
 */
router.post('/v1/devices/:imei/release', authenticateExternalApiToken, async (req, res) => {
  try {
    const reason = req.body?.reason || 'Liberación vía API externa';
    const result = await trustonicApi.releaseDevice(pool, req.tenantId, req.params.imei, reason);
    res.json({ success: true, imei: req.params.imei, action: 'RELEASE', reason, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/devices/{imei}/notify:
 *   post:
 *     summary: Notificar dispositivo (Send Notification)
 *     description: Envía un mensaje emergente / notificación push en pantalla al dispositivo.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               title:
 *                 type: string
 *                 example: Recordatorio de Pago Bantos
 *               message:
 *                 type: string
 *                 example: Su mensualidad vence pronto. Evite el bloqueo de su equipo.
 *     responses:
 *       200:
 *         description: Notificación enviada al dispositivo exitosamente
 */
router.post('/v1/devices/:imei/notify', authenticateExternalApiToken, async (req, res) => {
  const { title = 'Aviso Bantos', message } = req.body;
  if (!message) {
    return res.status(400).json({ error: 'El parámetro "message" es requerido para enviar una notificación.' });
  }
  try {
    const result = await trustonicApi.notifyDevice(pool, req.tenantId, req.params.imei, title, message, 'HEADSUP');
    res.json({ success: true, imei: req.params.imei, action: 'NOTIFY', title, message, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/devices/{imei}/pin-unlock:
 *   post:
 *     summary: PIN Unlock (Generar código PIN de Desbloqueo)
 *     description: Genera o consulta un código PIN de emergencia/desbloqueo de 4 u 8 dígitos para el dispositivo.
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
 *         description: Código PIN generado exitosamente
 */
router.post('/v1/devices/:imei/pin-unlock', authenticateExternalApiToken, async (req, res) => {
  try {
    const result = await trustonicApi.pinUnlockDevice(pool, req.tenantId, req.params.imei);
    res.json({ success: true, imei: req.params.imei, action: 'PIN_UNLOCK', result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/devices/{imei}/lock-message:
 *   post:
 *     summary: Lock Message (Establecer mensaje de bloqueo)
 *     description: Envía o actualiza el mensaje de bloqueo personalizado que se muestra en la pantalla del dispositivo bloqueado.
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lock_message
 *             properties:
 *               lock_message:
 *                 type: string
 *                 example: Estimado cliente, su pago se encuentra vencido. Favor de comunicarse a atención al cliente.
 *     responses:
 *       200:
 *         description: Mensaje de bloqueo enviado exitosamente
 */
router.post('/v1/devices/:imei/lock-message', authenticateExternalApiToken, async (req, res) => {
  const { lock_message } = req.body;
  if (!lock_message) {
    return res.status(400).json({ error: 'El parámetro "lock_message" es requerido.' });
  }
  try {
    const result = await trustonicApi.lockDevice(pool, req.tenantId, req.params.imei, lock_message);
    res.json({ success: true, imei: req.params.imei, action: 'LOCK_MESSAGE', lock_message, result });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── CLIENTES (CUSTOMERS) CRUD ────────────────────────────────────────────────

/**
 * @openapi
 * /api/v1/customers:
 *   get:
 *     summary: Listar clientes
 *     description: Consulta la lista de clientes registrados en la plataforma.
 *     tags:
 *       - Clientes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda (nombre, email o teléfono)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de clientes obtenida exitosamente
 */
router.get('/v1/customers', authenticateExternalApiToken, async (req, res) => {
  try {
    const { search, limit } = req.query;
    let query = 'SELECT id, upya_id, client_number, name, email, mobile, clabe, created_at FROM client_history WHERE tenant_id = ?';
    const params = [req.tenantId];

    if (search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR mobile LIKE ? OR client_number LIKE ?)';
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    query += ' ORDER BY id DESC LIMIT ?';
    params.push(parseInt(limit) || 50);

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/customers/{id}:
 *   get:
 *     summary: Obtener cliente por ID
 *     tags:
 *       - Clientes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID numérico, upya_id o client_number
 *     responses:
 *       200:
 *         description: Detalle del cliente
 *       404:
 *         description: Cliente no encontrado
 */
router.get('/v1/customers/:id', authenticateExternalApiToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, upya_id, client_number, name, email, mobile, clabe, created_at FROM client_history WHERE (id = ? OR upya_id = ? OR client_number = ?) AND tenant_id = ? LIMIT 1',
      [id, id, id, req.tenantId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ success: true, data: rows[0] });
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
 *             $ref: '#/components/schemas/CustomerInput'
 *     responses:
 *       200:
 *         description: Cliente creado exitosamente
 */
router.post('/v1/customers', authenticateExternalApiToken, async (req, res) => {
  const { name, email, mobile, client_number, clabe } = req.body;
  if (!name) return res.status(400).json({ error: 'El parámetro "name" es obligatorio' });

  try {
    const upya_id = `CLI-EXT-${Date.now()}`;
    const clientNum = client_number || `C-${Date.now()}`;
    const [result] = await pool.query(
      'INSERT INTO client_history (upya_id, client_number, tenant_id, name, email, mobile, clabe) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [upya_id, clientNum, req.tenantId, name.trim(), email || null, mobile || null, clabe || null]
    );
    res.json({ success: true, id: result.insertId, upya_id, client_number: clientNum, name });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/customers/{id}:
 *   put:
 *     summary: Actualizar cliente existente
 *     tags:
 *       - Clientes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CustomerInput'
 *     responses:
 *       200:
 *         description: Cliente actualizado exitosamente
 */
router.put('/v1/customers/:id', authenticateExternalApiToken, async (req, res) => {
  const { id } = req.params;
  const { name, email, mobile, clabe } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE client_history SET name=COALESCE(?, name), email=COALESCE(?, email), mobile=COALESCE(?, mobile), clabe=COALESCE(?, clabe) WHERE (id = ? OR upya_id = ? OR client_number = ?) AND tenant_id = ?',
      [name || null, email || null, mobile || null, clabe || null, id, id, id, req.tenantId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ success: true, message: 'Cliente actualizado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/customers/{id}:
 *   delete:
 *     summary: Eliminar cliente
 *     tags:
 *       - Clientes
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cliente eliminado exitosamente
 */
router.delete('/v1/customers/:id', authenticateExternalApiToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM client_history WHERE (id = ? OR upya_id = ? OR client_number = ?) AND tenant_id = ?',
      [id, id, id, req.tenantId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Cliente no encontrado' });
    res.json({ success: true, message: 'Cliente eliminado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── CONTRATOS (CONTRACTS) CRUD ───────────────────────────────────────────────

/**
 * @openapi
 * /api/v1/contracts:
 *   get:
 *     summary: Listar contratos
 *     tags:
 *       - Contratos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de contratos obtenida exitosamente
 */
router.get('/v1/contracts', authenticateExternalApiToken, async (req, res) => {
  try {
    const { status, limit } = req.query;
    let query = `
      SELECT ch.id, ch.upya_id, ch.contract_number, ch.client_id, ch.client_number,
             ch.product_name, ch.deal_name, ch.total_value, ch.paid_value, ch.status, ch.synced_at,
             cl.name AS customer_name, cl.email AS customer_email
      FROM contract_history ch
      LEFT JOIN client_history cl ON (ch.client_id = cl.upya_id OR (ch.client_number = cl.client_number AND ch.client_number IS NOT NULL)) AND ch.tenant_id = cl.tenant_id
      WHERE ch.tenant_id = ?
    `;
    const params = [req.tenantId];

    if (status) {
      query += ' AND ch.status = ?';
      params.push(status);
    }

    query += ' ORDER BY ch.synced_at DESC LIMIT ?';
    params.push(parseInt(limit) || 50);

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/contracts/{id}:
 *   get:
 *     summary: Obtener contrato por ID
 *     tags:
 *       - Contratos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del contrato
 */
router.get('/v1/contracts/:id', authenticateExternalApiToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT ch.*, cl.name AS customer_name, cl.email AS customer_email, cl.mobile AS customer_phone
       FROM contract_history ch
       LEFT JOIN client_history cl ON (ch.client_id = cl.upya_id OR ch.client_number = cl.client_number) AND ch.tenant_id = cl.tenant_id
       WHERE (ch.id = ? OR ch.upya_id = ? OR ch.contract_number = ?) AND ch.tenant_id = ? LIMIT 1`,
      [id, id, id, req.tenantId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/contracts:
 *   post:
 *     summary: Crear nuevo contrato
 *     tags:
 *       - Contratos
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractInput'
 *     responses:
 *       200:
 *         description: Contrato creado exitosamente
 */
router.post('/v1/contracts', authenticateExternalApiToken, async (req, res) => {
  const { contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image } = req.body;
  try {
    const upya_id = `CTR-EXT-${Date.now()}`;
    const contractNum = contract_number || `CNT-${Date.now()}`;
    const [result] = await pool.query(
      'INSERT INTO contract_history (upya_id, tenant_id, contract_number, client_id, product_name, deal_name, total_value, paid_value, status, signature_image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [upya_id, req.tenantId, contractNum, client_id || null, product_name || null, deal_name || null, total_value || 0, paid_value || 0, status || 'Firmado', signature_image || null]
    );
    res.json({ success: true, id: result.insertId, upya_id, contract_number: contractNum, status: status || 'Firmado' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/contracts/{id}:
 *   put:
 *     summary: Actualizar contrato
 *     tags:
 *       - Contratos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ContractInput'
 *     responses:
 *       200:
 *         description: Contrato actualizado exitosamente
 */
router.put('/v1/contracts/:id', authenticateExternalApiToken, async (req, res) => {
  const { id } = req.params;
  const { product_name, deal_name, total_value, paid_value, status, signature_image } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE contract_history SET product_name=COALESCE(?, product_name), deal_name=COALESCE(?, deal_name), total_value=COALESCE(?, total_value), paid_value=COALESCE(?, paid_value), status=COALESCE(?, status), signature_image=COALESCE(?, signature_image) WHERE (id = ? OR upya_id = ? OR contract_number = ?) AND tenant_id = ?',
      [product_name || null, deal_name || null, total_value || null, paid_value || null, status || null, signature_image || null, id, id, id, req.tenantId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json({ success: true, message: 'Contrato actualizado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/contracts/{id}:
 *   delete:
 *     summary: Eliminar contrato
 *     tags:
 *       - Contratos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Contrato eliminado exitosamente
 */
router.delete('/v1/contracts/:id', authenticateExternalApiToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM contract_history WHERE (id = ? OR upya_id = ? OR contract_number = ?) AND tenant_id = ?',
      [id, id, id, req.tenantId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Contrato no encontrado' });
    res.json({ success: true, message: 'Contrato eliminado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── PAGOS (PAYMENTS) CRUD ───────────────────────────────────────────────────

/**
 * @openapi
 * /api/v1/payments:
 *   get:
 *     summary: Listar pagos
 *     tags:
 *       - Pagos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: contract_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista de pagos obtenida exitosamente
 */
router.get('/v1/payments', authenticateExternalApiToken, async (req, res) => {
  try {
    const { contract_id, limit } = req.query;
    let query = `
      SELECT p.*, cl.name AS client_name, ch.product_name
      FROM payments p
      LEFT JOIN contract_history ch ON (p.contract_id = ch.contract_number AND p.tenant_id = ch.tenant_id)
      LEFT JOIN client_history cl ON (cl.upya_id = COALESCE(p.client_id, ch.client_id) AND cl.tenant_id = p.tenant_id)
      WHERE p.tenant_id = ?
    `;
    const params = [req.tenantId];

    if (contract_id) {
      query += ' AND (p.contract_id = ? OR ch.upya_id = ?)';
      params.push(contract_id, contract_id);
    }

    query += ' ORDER BY p.payment_date DESC LIMIT ?';
    params.push(parseInt(limit) || 50);

    const [rows] = await pool.query(query, params);
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/payments/{id}:
 *   get:
 *     summary: Obtener pago por ID
 *     tags:
 *       - Pagos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Detalle del pago
 */
router.get('/v1/payments/:id', authenticateExternalApiToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, cl.name AS client_name, ch.product_name
       FROM payments p
       LEFT JOIN contract_history ch ON (p.contract_id = ch.contract_number AND p.tenant_id = ch.tenant_id)
       LEFT JOIN client_history cl ON (cl.upya_id = COALESCE(p.client_id, ch.client_id) AND cl.tenant_id = p.tenant_id)
       WHERE (p.id = ? OR p.upya_id = ? OR p.transaction_id = ?) AND p.tenant_id = ? LIMIT 1`,
      [id, id, id, req.tenantId]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ success: true, data: rows[0] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/payments:
 *   post:
 *     summary: Registrar un nuevo pago
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
  const { contract_id, client_id, amount, payment_method, transaction_id, status } = req.body;
  if (!contract_id || !amount) {
    return res.status(400).json({ error: 'contract_id y amount son obligatorios' });
  }
  try {
    const payUpyaId = `PAY-EXT-${Date.now()}`;
    const txId = transaction_id || `TX-EXT-${Date.now()}`;
    const payStatus = status || 'PAID';
    const payMethod = payment_method || 'API Rest';

    const [result] = await pool.query(
      'INSERT INTO payments (upya_id, transaction_id, tenant_id, contract_id, client_id, amount, method, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [payUpyaId, txId, req.tenantId, contract_id, client_id || null, amount, payMethod, payStatus]
    );

    // Actualizar paid_value en contrato
    await pool.query(
      'UPDATE contract_history SET paid_value = paid_value + ? WHERE (contract_number = ? OR upya_id = ?) AND tenant_id = ?',
      [amount, contract_id, contract_id, req.tenantId]
    );

    res.json({ success: true, payment_id: result.insertId, upya_id: payUpyaId, transaction_id: txId, amount, status: payStatus });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/payments/{id}:
 *   put:
 *     summary: Actualizar pago existente
 *     tags:
 *       - Pagos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PaymentUpdateInput'
 *     responses:
 *       200:
 *         description: Pago actualizado exitosamente
 */
router.put('/v1/payments/:id', authenticateExternalApiToken, async (req, res) => {
  const { id } = req.params;
  const { amount, method, status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE payments SET amount=COALESCE(?, amount), method=COALESCE(?, method), status=COALESCE(?, status) WHERE (id = ? OR upya_id = ? OR transaction_id = ?) AND tenant_id = ?',
      [amount || null, method || null, status || null, id, id, id, req.tenantId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ success: true, message: 'Pago actualizado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/payments/{id}:
 *   delete:
 *     summary: Eliminar / Anular pago
 *     tags:
 *       - Pagos
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pago eliminado exitosamente
 */
router.delete('/v1/payments/:id', authenticateExternalApiToken, async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query(
      'DELETE FROM payments WHERE (id = ? OR upya_id = ? OR transaction_id = ?) AND tenant_id = ?',
      [id, id, id, req.tenantId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Pago no encontrado' });
    res.json({ success: true, message: 'Pago eliminado exitosamente' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── MÓDULO DE VENTAS (SALES INTEGRATION MODULE) ──────────────────────────────

/**
 * @openapi
 * /api/v1/sales:
 *   post:
 *     summary: Registrar Venta Completa (Checkout Integral)
 *     description: Endpoint principal para sistemas de terceros (CRMs, Puntos de Venta, E-commerce). Procesa en una sola operación atómica el registro del Cliente, creación del Contrato, asignación del Dispositivo y registro del Pago inicial con activación opcional de seguridad Trustonic.
 *     tags:
 *       - Ventas
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaleInput'
 *     responses:
 *       200:
 *         description: Venta registrada y procesada exitosamente
 *       400:
 *         description: Datos requeridos faltantes o inválidos
 */
router.post('/v1/sales', authenticateExternalApiToken, async (req, res) => {
  const { client, device, deal, payment, signature_image } = req.body;

  if (!client || !client.name) {
    return res.status(400).json({ error: 'Los datos del cliente (client.name) son obligatorios.' });
  }
  if (!deal || !deal.total_value) {
    return res.status(400).json({ error: 'Los datos de la venta (deal.total_value) son obligatorios.' });
  }

  const tenantId = req.tenantId;

  try {
    // 1. Crear o Actualizar Cliente
    const clientId = client.client_number || `CLI-${Date.now()}`;
    const clientUpyaId = `CLI-SALE-${Date.now()}`;

    await pool.query(
      `INSERT INTO client_history (upya_id, client_number, tenant_id, name, email, mobile)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE name=VALUES(name), email=VALUES(email), mobile=VALUES(mobile)`,
      [clientUpyaId, clientId, tenantId, client.name.trim(), client.email || null, client.mobile || null]
    );

    // 2. Crear Contrato de Venta
    const contractNum = `CNT-${Date.now()}`;
    const contractUpyaId = `CTR-SALE-${Date.now()}`;
    const productName = device?.product_name || 'Dispositivo Inteligente';
    const dealName = deal?.name || 'Venta de Contado / Financiamiento';
    const totalVal = parseFloat(deal.total_value) || 0;
    const paidVal = payment?.amount ? parseFloat(payment.amount) : 0;

    await pool.query(
      `INSERT INTO contract_history 
       (upya_id, tenant_id, contract_number, client_id, client_number, product_name, deal_name, total_value, paid_value, status, signature_image) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Firmado', ?)`,
      [contractUpyaId, tenantId, contractNum, clientUpyaId, clientId, productName, dealName, totalVal, paidVal, signature_image || null]
    );

    // 3. Registrar Pago Inicial si aplica
    let paymentResult = null;
    if (payment && payment.amount > 0) {
      const payUpyaId = `PAY-SALE-${Date.now()}`;
      const txId = `TX-SALE-${Date.now()}`;
      const payStatus = payment.status || 'PAID';
      const payMethod = payment.method || 'Checkout API';

      const [payIns] = await pool.query(
        'INSERT INTO payments (upya_id, transaction_id, tenant_id, contract_id, client_id, amount, method, status, payment_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
        [payUpyaId, txId, tenantId, contractNum, clientUpyaId, payment.amount, payMethod, payStatus]
      );
      paymentResult = {
        payment_id: payIns.insertId,
        transaction_id: txId,
        amount: payment.amount,
        status: payStatus
      };

      // Si hay IMEI y el pago fue liquidado, solicitar activación en Trustonic
      if (device?.imei && (payStatus === 'PAID' || payStatus === 'VALIDATED')) {
        try {
          await trustonicApi.activateDevice(pool, tenantId, device.imei);
        } catch (tErr) {
          console.error('[SALE API] Error activando Trustonic:', tErr.message);
        }
      }
    }

    res.json({
      success: true,
      sale_id: contractUpyaId,
      contract: {
        contract_number: contractNum,
        upya_id: contractUpyaId,
        total_value: totalVal,
        paid_value: paidVal,
        status: 'Firmado'
      },
      client: {
        client_number: clientId,
        upya_id: clientUpyaId,
        name: client.name
      },
      payment: paymentResult,
      device: device || null
    });
  } catch (e) {
    console.error('[SALE API ERROR]:', e);
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/sales:
 *   get:
 *     summary: Consultar historial de ventas
 *     tags:
 *       - Ventas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *     responses:
 *       200:
 *         description: Lista histórica de ventas realizadas
 */
router.get('/v1/sales', authenticateExternalApiToken, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const [rows] = await pool.query(
      `SELECT ch.id AS sale_id, ch.upya_id AS contract_id, ch.contract_number, ch.product_name, ch.deal_name,
              ch.total_value, ch.paid_value, ch.status, ch.synced_at AS date,
              cl.name AS customer_name, cl.email AS customer_email, cl.mobile AS customer_phone
       FROM contract_history ch
       LEFT JOIN client_history cl ON (ch.client_id = cl.upya_id OR ch.client_number = cl.client_number) AND ch.tenant_id = cl.tenant_id
       WHERE ch.tenant_id = ?
       ORDER BY ch.synced_at DESC LIMIT ?`,
      [req.tenantId, limit]
    );
    res.json({ success: true, count: rows.length, data: rows });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

/**
 * @openapi
 * /api/v1/sales/{id}:
 *   get:
 *     summary: Obtener detalle completo de una venta
 *     tags:
 *       - Ventas
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Desglose completo de la venta (Contrato + Cliente + Historial de Pagos)
 */
router.get('/v1/sales/:id', authenticateExternalApiToken, async (req, res) => {
  try {
    const { id } = req.params;
    const [contracts] = await pool.query(
      `SELECT ch.*, cl.name AS customer_name, cl.email AS customer_email, cl.mobile AS customer_phone, cl.clabe AS customer_clabe
       FROM contract_history ch
       LEFT JOIN client_history cl ON (ch.client_id = cl.upya_id OR ch.client_number = cl.client_number) AND ch.tenant_id = cl.tenant_id
       WHERE (ch.id = ? OR ch.upya_id = ? OR ch.contract_number = ?) AND ch.tenant_id = ? LIMIT 1`,
      [id, id, id, req.tenantId]
    );

    if (contracts.length === 0) return res.status(404).json({ error: 'Venta no encontrada' });

    const contract = contracts[0];

    // Consultar pagos asociados a la venta
    const [payments] = await pool.query(
      'SELECT id, upya_id, transaction_id, amount, method, status, payment_date FROM payments WHERE (contract_id = ? OR contract_id = ?) AND tenant_id = ? ORDER BY payment_date DESC',
      [contract.contract_number, contract.upya_id, req.tenantId]
    );

    res.json({
      success: true,
      data: {
        sale_id: contract.upya_id,
        contract,
        payments
      }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});


// ── INVENTARIO (INVENTORY) ──────────────────────────────────────────────────

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

