const WebSocket = require('ws');
const express = require('express');
const MessageHandler = require('./utils/messageHandler');
require('dotenv').config();

// ===== CONFIGURACIÓN DESDE .ENV =====
const WS_PORT = process.env.WS_PORT || 8080;
const HTTP_PORT = process.env.HTTP_PORT || 3000;
const MOCK_JWT_TOKEN = process.env.MOCK_JWT_TOKEN || 'mock_jwt_token_12345';
const MOCK_BOT_ID = process.env.MOCK_BOT_ID || 'mock_bot_id';

// Credenciales mock aceptadas
const VALID_CREDENTIALS = {
  clientId: process.env.MOCK_CLIENT_ID || 'MOCK_CLIENT_ID',
  clientSecret: process.env.MOCK_CLIENT_SECRET || 'MOCK_CLIENT_SECRET',
  userIdentity: process.env.MOCK_USER_IDENTITY || 'test@example.com'
};

// Configuración de validación
const CONFIG = {
  validateCredentials: process.env.VALIDATE_CREDENTIALS === 'true',
  requireJWT: process.env.REQUIRE_JWT === 'true',
  strictMode: process.env.STRICT_MODE === 'true'
};

// Orígenes permitidos para CORS
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS || '*';

// Inicializar Express para API REST
const app = express();
app.use(express.json());

// ===== CONFIGURACIÓN CORS =====
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  if (ALLOWED_ORIGINS === '*') {
    res.header('Access-Control-Allow-Origin', '*');
  } else {
    const allowedOriginsList = ALLOWED_ORIGINS.split(',').map(o => o.trim());
    if (allowedOriginsList.includes(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
    }
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Handler de mensajes
const messageHandler = new MessageHandler();

// ===== ESTADÍSTICAS DE CONEXIÓN =====
const connectionStats = {
  total: 0,
  active: 0,
  closed: 0,
  errors: 0
};

// ===== API REST ENDPOINTS =====

/**
 * Endpoint para simular JWT token generation (método antiguo)
 */
app.post('/api/users/login', (req, res) => {
  console.log('[REST] JWT login request received');
  console.log('[REST] Request body:', {
    assertion: req.body?.assertion ? 'presente' : 'ausente',
    botInfo: req.body?.botInfo
  });
  
  // Si está en modo validación estricta, verificar la assertion (JWT)
  if (CONFIG.validateCredentials && CONFIG.strictMode) {
    if (!req.body?.assertion) {
      console.log('[REST] ❌ Missing assertion (JWT)');
      return res.status(401).json({
        errors: [{
          msg: 'Missing assertion',
          code: 'MISSING_ASSERTION'
        }]
      });
    }
    
    console.log('[REST] ✅ Assertion validated (mock)');
  }
  
  console.log('[REST] ✅ Login successful - returning JWT token');
  res.json({
    authorization: {
      accessToken: MOCK_JWT_TOKEN,
      refreshToken: 'mock_refresh_token'
    },
    userInfo: {
      userId: 'mock_user_123',
      firstName: 'Mock',
      lastName: 'User',
      email: VALID_CREDENTIALS.userIdentity
    }
  });
});

/**
 * Endpoint para JWT Grant (el que usa el SDK internamente)
 */
app.post('/api/oAuth/token/jwtgrant', (req, res) => {
  console.log('[REST] JWT Grant request received');
  console.log('[REST] Request body:', {
    clientId: req.body?.clientId ? 'presente' : 'ausente',
    clientSecret: req.body?.clientSecret ? 'presente' : 'ausente',
    assertion: req.body?.assertion ? 'presente' : 'ausente'
  });
  
  // Validar credenciales si está habilitado
  if (CONFIG.validateCredentials) {
    if (!req.body?.clientId || !req.body?.clientSecret) {
      console.log('[REST] ❌ Missing clientId or clientSecret');
      return res.status(401).json({
        errors: [{
          msg: 'Missing credentials',
          code: 'MISSING_CREDENTIALS'
        }]
      });
    }
    
    if (CONFIG.strictMode) {
      if (req.body.clientId !== VALID_CREDENTIALS.clientId || 
          req.body.clientSecret !== VALID_CREDENTIALS.clientSecret) {
        console.log('[REST] ❌ Invalid credentials');
        return res.status(401).json({
          errors: [{
            msg: 'Invalid clientId or clientSecret',
            code: 'INVALID_CREDENTIALS'
          }]
        });
      }
    }
    
    console.log('[REST] ✅ Credentials validated');
  }
  
  console.log('[REST] ✅ JWT Grant successful - returning token');
  res.json({
    "authorization": {
        "accessToken": "6Ipmt7On79urjvFDJB0TfHmj7zyBQ-8oYOMbRMkBBx8wMd_nzJZbkFc-FObCx_O4",
        "token_type": "bearer",
        "expiresDate": "2025-11-26T02:11:34.925Z",
        "refreshExpiresDate": "2025-11-28T01:11:34.925Z",
        "issuedDate": "2025-11-26T01:11:34.925Z"
    },
    "userInfo": {
        "userId": "u-bba51de4-62fe-57ea-a9e2-a0654a906f58",
        "accountId": "60625df27092898e35d9cee5",
        "identity": "cs-638644b9-8816-58e7-bf65-a8d21a4f1347/c9fab29a-5d7c-4201-97a7-ec6bdea5a5fc",
        "managedBy": "60625df27092898e35d9cee5"
    }
  });
});

/**
 * Endpoint para iniciar RTM (Real-Time Messaging) - retorna WebSocket URL
 */
app.post('/api/rtm/start', (req, res) => {
  console.log('[REST] RTM start request received');
  
  // Verificar autorización si está habilitada
  if (CONFIG.requireJWT) {
    const authHeader = req.headers.authorization || req.body?.authorization;
    
    if (!authHeader) {
      console.log('[REST] ❌ Missing authorization header');
      return res.status(401).json({
        errors: [{
          msg: 'Missing authorization',
          code: 'MISSING_AUTH'
        }]
      });
    }
    
    // Verificar que el token sea el esperado (en mock)
    const expectedAuth = `bearer ${MOCK_JWT_TOKEN}`;
    if (CONFIG.strictMode && authHeader.toLowerCase() !== expectedAuth.toLowerCase()) {
      console.log('[REST] ❌ Invalid JWT token');
      return res.status(401).json({
        errors: [{
          msg: 'Invalid token',
          code: 'INVALID_TOKEN'
        }]
      });
    }
    
    console.log('[REST] ✅ Authorization validated');
  }
  
  const wsUrl = `ws://localhost:${WS_PORT}`;
  
  console.log('[REST] ✅ Returning WebSocket URL');
  res.json({
    ok: true,
    url: wsUrl,
    botInfo: {
      name: 'Mock Bot',
      _id: MOCK_BOT_ID
    }
  });
});

/**
 * Endpoint para obtener historial de chat (opcional)
 */
app.get('/api/chat/history', (req, res) => {
  console.log('[REST] Chat history request received');
  
  res.json({
    messages: [],
    moreAvailable: false
  });
});

/**
 * Endpoint para obtener el tema activo del bot (necesario para UI)
 */
app.get('/api/websdkthemes/:botId/activetheme', (req, res) => {
  console.log('[REST] Active theme request received for bot:', req.params.botId);
  
  // Tema por defecto que simula la configuración del widget
  const defaultTheme = {
    _id: 'mock_theme_id',
    name: 'Default Theme',
    isDef: true,
    botId: req.params.botId,
    isActive: true,
    colors: {
      primary: '#2881DF',
      primaryLight: '#E5F1FC',
      primaryDark: '#1B5FAD',
      secondary: '#F3F4F5',
      text: '#202124',
      textLight: '#5A5E62',
      border: '#E4E5E7',
      background: '#FFFFFF',
      bubbleUser: '#2881DF',
      bubbleUserText: '#FFFFFF',
      bubbleBot: '#F3F4F5',
      bubbleBotText: '#202124'
    },
    chatWindow: {
      headerBgColor: '#2881DF',
      headerTextColor: '#FFFFFF',
      windowBgColor: '#FFFFFF',
      botName: 'Mock Bot',
      botIcon: 'https://via.placeholder.com/40',
      allowAttachments: true,
      allowEmojis: true,
      allowQuickReplies: true
    },
    customizations: {
      font: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      borderRadius: '8px',
      fontSize: '14px'
    }
  };
  
  console.log('[REST] ✅ Returning default theme');
  res.json(defaultTheme);
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'kore-mock-server',
    config: {
      httpPort: HTTP_PORT,
      wsPort: WS_PORT,
      validateCredentials: CONFIG.validateCredentials,
      requireJWT: CONFIG.requireJWT,
      strictMode: CONFIG.strictMode
    }
  });
});

/**
 * WebSocket Statistics endpoint
 */
app.get('/ws-stats', (req, res) => {
  const activeClients = [];
  wss.clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      const duration = Date.now() - new Date(ws.connectionTime).getTime();
      activeClients.push({
        ip: ws.clientIp,
        connectedFor: `${(duration / 1000).toFixed(2)}s`,
        isAlive: ws.isAlive
      });
    }
  });

  res.json({
    status: 'ok',
    websocket: {
      port: WS_PORT,
      statistics: connectionStats,
      activeClients: activeClients,
      timestamp: new Date().toISOString()
    }
  });
});

// Iniciar servidor HTTP
const httpServer = app.listen(HTTP_PORT, () => {
  console.log(`\n${'='.repeat(70)}`);
  console.log('🚀 Kore.ai Mock Server Started');
  console.log(`${'='.repeat(70)}`);
  console.log(`📡 HTTP Server: http://localhost:${HTTP_PORT}`);
  console.log(`🔌 WebSocket Server: ws://localhost:${WS_PORT}`);
  console.log(`\n⚙️  Configuration:`);
  console.log(`   Validate Credentials: ${CONFIG.validateCredentials}`);
  console.log(`   Require JWT: ${CONFIG.requireJWT}`);
  console.log(`   Strict Mode: ${CONFIG.strictMode}`);
  console.log(`   CORS Origins: ${ALLOWED_ORIGINS === '*' ? 'ALL (*)' : ALLOWED_ORIGINS}`);
  console.log(`\n${'='.repeat(70)}\n`);
  console.log('💡 Endpoints disponibles:');
  console.log(`   POST http://localhost:${HTTP_PORT}/api/users/login`);
  console.log(`   POST http://localhost:${HTTP_PORT}/api/oAuth/token/jwtgrant`);
  console.log(`   POST http://localhost:${HTTP_PORT}/api/rtm/start`);
  console.log(`   GET  http://localhost:${HTTP_PORT}/api/chat/history`);
  console.log(`   GET  http://localhost:${HTTP_PORT}/api/websdkthemes/:botId/activetheme`);
  console.log(`   GET  http://localhost:${HTTP_PORT}/health`);
  console.log(`   GET  http://localhost:${HTTP_PORT}/ws-stats  (WebSocket statistics)`);
  console.log(`\n${'='.repeat(70)}\n`);
  console.log('💡 Para conectar tu proyecto del SDK:');
  console.log(`   koreAPIUrl: "http://localhost:${HTTP_PORT}/api/"`);
  console.log(`   JWTUrl: "http://localhost:${HTTP_PORT}/api/oAuth/token/jwtgrant"`);
  console.log(`\n${'='.repeat(70)}\n`);
});

// ===== WEBSOCKET SERVER =====

const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws, req) => {
  const clientIp = req.socket.remoteAddress;
  const connectionTime = new Date().toISOString();
  
  connectionStats.total++;
  connectionStats.active++;
  
  console.log('[WS] 🔗 New client connected:', {
    ip: clientIp,
    time: connectionTime,
    totalConnections: connectionStats.total,
    activeConnections: connectionStats.active
  });

  // Variable para rastrear si la conexión está viva
  ws.isAlive = true;
  ws.connectionTime = connectionTime;
  ws.clientIp = clientIp;

  // Manejar pong para keepalive
  ws.on('pong', () => {
    ws.isAlive = true;
  });

  // Enviar mensaje "hello" al conectar
  setTimeout(() => {
    const helloMessage = messageHandler.generateHelloMessage();
    ws.send(JSON.stringify(helloMessage));
    console.log('[WS] ✅ Sent HELLO message');
  }, 100);

  // Manejar mensajes entrantes
  ws.on('message', async (data) => {
    try {
      const message = JSON.parse(data);
      console.log('[WS] 📩 Received message:', {
        type: message.type,
        resourceid: message.resourceid,
        body: message.message?.body
      });

      // Si es un mensaje de acknowledgment, procesarlo sin responder
      if (message.type === 'ack') {
        messageHandler.processAcknowledgment(message);
        return;
      }

      // Si es un ping, responder con pong
      if (message.type === 'ping') {
        ws.send(JSON.stringify({ type: 'pong' }));
        console.log('[WS] 🏓 Sent PONG response');
        return;
      }

      // Procesar mensaje normal del usuario
      if (message.resourceid === '/bot.message' || message.message) {
        // Simular delay de procesamiento
        await messageHandler.delay(800);

        // Generar respuesta del bot
        const response = messageHandler.processMessage(message);
        
        // Si es un array de respuestas múltiples, enviar cada una con delay
        if (Array.isArray(response)) {
          console.log(`[WS] 📤 Sending ${response.length} bot responses`);
          for (let i = 0; i < response.length; i++) {
            const singleResponse = response[i];
            
            // Delay entre mensajes múltiples
            if (i > 0) {
              await messageHandler.delay(600);
            }
            
            ws.send(JSON.stringify(singleResponse));
            console.log(`[WS] 📤 Sent response ${i + 1}/${response.length}:`, {
              messageId: singleResponse.messageId,
              type: singleResponse.type,
              body: singleResponse.message[0]?.cInfo?.body?.substring(0, 50) + '...'
            });
          }
        } else {
          // Enviar respuesta simple
          ws.send(JSON.stringify(response));
          console.log('[WS] 📤 Sent bot response:', {
            messageId: response.messageId,
            type: response.type,
            body: response.message[0]?.cInfo?.body?.substring(0, 50) + '...'
          });
        }
      }
    } catch (error) {
      console.error('[WS] ❌ Error processing message:', error);
      
      // Enviar mensaje de error
      const errorResponse = {
        type: 'error',
        error: {
          message: 'Error processing message',
          code: 500
        }
      };
      ws.send(JSON.stringify(errorResponse));
    }
  });

  // Manejar cierre de conexión
  ws.on('close', (code, reason) => {
    const duration = Date.now() - new Date(ws.connectionTime).getTime();
    const durationSeconds = (duration / 1000).toFixed(2);
    
    connectionStats.active--;
    connectionStats.closed++;
    
    console.log('[WS] 🔌 Connection closed:', {
      ip: ws.clientIp,
      code: code,
      reason: reason.toString() || 'No reason provided',
      duration: `${durationSeconds}s`,
      closedBy: code === 1000 ? 'Client (normal)' : 
                code === 1001 ? 'Client (going away)' :
                code === 1006 ? 'Abnormal (timeout or network)' :
                code === 1011 ? 'Server (error)' :
                `Unknown (code: ${code})`,
      activeConnections: connectionStats.active,
      totalClosed: connectionStats.closed
    });
  });

  // Manejar errores
  ws.on('error', (error) => {
    connectionStats.errors++;
    console.error('[WS] ❌ WebSocket error:', {
      ip: ws.clientIp,
      error: error.message,
      code: error.code,
      totalErrors: connectionStats.errors
    });
  });
});

// ===== KEEPALIVE - Prevenir cierres por inactividad =====
const keepAliveInterval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('[WS] ⚠️ Client not responding to ping, terminating:', {
        ip: ws.clientIp
      });
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
    // console.log('[WS] 🏓 Sent keepalive ping'); // Comentado para no saturar logs
  });
}, 30000); // Cada 30 segundos

wss.on('close', () => {
  clearInterval(keepAliveInterval);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down mock server...');
  httpServer.close(() => {
    console.log('✅ HTTP server closed');
  });
  wss.close(() => {
    console.log('✅ WebSocket server closed');
  });
  process.exit(0);
});

module.exports = { app, wss };
