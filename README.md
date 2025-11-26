# 🚀 Kore.ai SDK Mock Server

> Servidor independiente de WebSocket + REST API para simular el backend de Kore.ai y permitir desarrollo y testing del SDK sin conexión al servidor real.

## 📋 Características

- ✅ **Independiente del proyecto SDK** - Se ejecuta como servicio separado
- ✅ **WebSocket Server** - Simula comunicación en tiempo real
- ✅ **REST API** - Endpoints de autenticación y configuración
- ✅ **Respuestas configurables** - JSON editable sin recompilar
- ✅ **CORS flexible** - Configurable para múltiples orígenes
- ✅ **Variables de entorno** - Puertos y configuración personalizables
- ✅ **Sin validación estricta por defecto** - Acepta cualquier credencial para facilitar testing

## 📦 Instalación Rápida

```bash
# Clonar o copiar el directorio del mock server
cd c:\Dev\kore-mock-server

# Instalar dependencias
npm install

# Copiar archivo de configuración (opcional)
copy .env.example .env

# Iniciar servidor
npm start
```

El servidor estará disponible en:
- 📡 **HTTP/REST**: `http://localhost:3000`
- 🔌 **WebSocket**: `ws://localhost:8080`

## ⚙️ Configuración

Edita el archivo `.env` para personalizar:

```env
# Puertos
HTTP_PORT=3000
WS_PORT=8080

# CORS - Orígenes permitidos
ALLOWED_ORIGINS=*
# O específicos: ALLOWED_ORIGINS=http://localhost:9000,http://localhost:4200

# Credenciales mock (opcionales si VALIDATE_CREDENTIALS=false)
MOCK_CLIENT_ID=MOCK_CLIENT_ID
MOCK_CLIENT_SECRET=MOCK_CLIENT_SECRET
MOCK_USER_IDENTITY=test@example.com

# Token JWT mock
MOCK_JWT_TOKEN=mock_jwt_token_12345

# Configuración de seguridad (recomendado: false para desarrollo)
VALIDATE_CREDENTIALS=false
REQUIRE_JWT=false
STRICT_MODE=false
```

### 🔧 Modos de Validación

| Configuración | Descripción | Uso recomendado |
|---------------|-------------|------------------|
| `VALIDATE_CREDENTIALS=false` | Acepta cualquier credencial | **Testing rápido** |
| `VALIDATE_CREDENTIALS=true` + `STRICT_MODE=false` | Valida que existan credenciales | Testing con validación básica |
| `VALIDATE_CREDENTIALS=true` + `STRICT_MODE=true` | Valida exactamente las credenciales del .env | Testing con validación completa |

## 🎯 Uso desde Cualquier Proyecto

### Opción 1: Servidor Independiente (Recomendado)

**Ventajas**: 
- Un solo servidor para múltiples proyectos
- No necesitas copiarlo en cada proyecto
- Fácil de actualizar

**Pasos**:

1. **Inicia el mock server** (solo una vez):
```bash
cd c:\Dev\kore-mock-server
npm start
```

2. **En tu proyecto del SDK**, configura:
```javascript
// kore-config.js o similar
botOptions.koreAPIUrl = "http://localhost:3000/api/";
botOptions.JWTUrl = "http://localhost:3000/api/oAuth/token/jwtgrant";
botOptions.clientId = "cualquier_cosa"; // Si VALIDATE_CREDENTIALS=false
botOptions.clientSecret = "cualquier_cosa";
```

3. **Ejecuta tu proyecto normalmente**

### Opción 2: Como Dependencia Global

```bash
# Instalar globalmente
cd c:\Dev\kore-mock-server
npm install -g

# Ejecutar desde cualquier lugar
kore-mock-server
```

### Opción 3: Como Módulo npm Local

```bash
# En tu proyecto del SDK
npm install ../kore-mock-server

# En tu package.json
{
  "scripts": {
    "mock": "node node_modules/kore-mock-server/server.js"
  }
}

# Ejecutar
npm run mock
```

## 📡 Endpoints Disponibles

### REST API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/api/users/login` | Login básico - retorna JWT |
| `POST` | `/api/oAuth/token/jwtgrant` | JWT Grant (usado por SDK) |
| `POST` | `/api/rtm/start` | Inicia RTM - retorna URL WebSocket |
| `GET` | `/api/chat/history` | Historial de chat (vacío) |
| `GET` | `/health` | Health check + configuración |

### WebSocket

- **Conexión**: `ws://localhost:8080`
- **Mensajes soportados**:
  - `hello` - Mensaje de bienvenida automático
  - `ping/pong` - Keep-alive
  - `bot.message` - Mensajes del usuario
  - `ack` - Confirmaciones

## 🎨 Personalizar Respuestas

Edita `config/responses.json` para cambiar las respuestas del bot:

```json
{
  "defaultResponses": {
    "hello": { /* respuesta de bienvenida */ }
  },
  "templates": {
    "buttons": { /* plantilla con botones */ },
    "carousel": { /* plantilla carousel */ }
  },
  "keywordResponses": {
    "hola": "defaultResponses.hello",
    "botones": "templates.buttons"
  }
}
```

**Palabras clave disponibles** (escribe en el chat):
- `hola` - Mensaje de bienvenida
- `botones` - Plantilla con botones
- `lista` - Plantilla de lista
- `carousel` - Plantilla carousel
- `ayuda` - Mensaje de ayuda

## 🔧 Scripts Disponibles

```bash
npm start      # Iniciar servidor
npm run dev    # Iniciar en modo desarrollo
npm run status # Ver estado del servidor (TODO)
npm run stop   # Detener servidor (TODO)
```

## 🌐 Uso con Múltiples Proyectos

### Escenario: Tienes varios proyectos usando el SDK

```
c:\Dev\
  ├── kore-mock-server\          ← Servidor independiente (puerto 3000, 8080)
  ├── proyecto-sdk-1\            ← Proyecto 1 (puerto 9000)
  ├── proyecto-sdk-2\            ← Proyecto 2 (puerto 9001)
  └── proyecto-sdk-3\            ← Proyecto 3 (puerto 9002)
```

**Configuración**:

1. **Mock Server** (`.env`):
```env
ALLOWED_ORIGINS=http://localhost:9000,http://localhost:9001,http://localhost:9002
```

2. **Cada proyecto** usa la misma URL:
```javascript
koreAPIUrl: "http://localhost:3000/api/"
```

3. **Inicia el mock server una sola vez**, todos los proyectos se conectan al mismo servidor.

## 🐛 Troubleshooting

### Error: CORS

**Síntoma**: `Access to XMLHttpRequest has been blocked by CORS policy`

**Solución**:
```env
# En .env
ALLOWED_ORIGINS=*
```

### Error: EADDRINUSE (puerto en uso)

**Síntoma**: `Error: listen EADDRINUSE: address already in use`

**Solución**:
```bash
# Windows: Encontrar proceso usando el puerto
netstat -ano | findstr :3000

# Matar proceso
taskkill /PID <PID> /F

# O cambiar puerto en .env
HTTP_PORT=3001
```

### Error: Cannot connect to WebSocket

**Verificar**:
1. Mock server está corriendo
2. Puerto correcto en configuración
3. Firewall no bloquea el puerto

```bash
# Verificar con curl
curl http://localhost:3000/health
```

### Respuestas no se cargan

**Verificar**: `config/responses.json` es JSON válido
```bash
node -e "console.log(JSON.parse(require('fs').readFileSync('config/responses.json')))"
```

## 📚 Ejemplos de Integración

### React App

```javascript
// src/config/kore.js
export const koreConfig = {
  botOptions: {
    koreAPIUrl: 'http://localhost:3000/api/',
    JWTUrl: 'http://localhost:3000/api/oAuth/token/jwtgrant',
    userIdentity: 'user@example.com',
    botInfo: { name: 'My Bot', _id: 'bot_id' },
    clientId: 'any_client_id',
    clientSecret: 'any_secret'
  }
};
```

### Angular App

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  koreApi: {
    baseUrl: 'http://localhost:3000/api/',
    jwtUrl: 'http://localhost:3000/api/oAuth/token/jwtgrant'
  }
};
```

### Vue App

```javascript
// src/config/bot.config.js
export default {
  koreAPIUrl: 'http://localhost:3000/api/',
  JWTUrl: 'http://localhost:3000/api/oAuth/token/jwtgrant',
  // ... resto de configuración
};
```

## 📖 Documentación Adicional

- **[QUICKSTART.md](./QUICKSTART.md)** - Inicio rápido
- **[INTEGRATION.md](./INTEGRATION.md)** - Guía de integración detallada
- **[RESPONSES.md](./RESPONSES.md)** - Personalizar respuestas
- **[API.md](./API.md)** - Documentación de endpoints

## 🤝 Contribuir

Para agregar nuevas funcionalidades:

1. Edita `server.js` para agregar endpoints
2. Edita `config/responses.json` para agregar respuestas
3. Edita `utils/messageHandler.js` para lógica de mensajes

## 📄 Licencia

MIT
