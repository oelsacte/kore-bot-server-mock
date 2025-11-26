# 🎯 Resumen: Mock Server Independiente

## ✅ Lo que se Creó

Se ha creado un **servidor mock completamente independiente** en:
```
c:\Dev\kore-mock-server\
```

## 🎁 Características Principales

1. ✅ **Independiente del workspace del SDK** - No interfiere con tu código
2. ✅ **Reutilizable** - Un solo servidor para múltiples proyectos
3. ✅ **Configurable** - Puertos, CORS y validación mediante `.env`
4. ✅ **Sin validación por defecto** - Acepta cualquier credencial para facilitar testing
5. ✅ **Respuestas editables** - Archivo JSON simple (`config/responses.json`)
6. ✅ **WebSocket + REST** - Simula completamente el backend de Kore.ai

---

## 🚀 Inicio Rápido (3 pasos)

### 1️⃣ Instalar

```cmd
cd c:\Dev\kore-mock-server
install.bat
```

### 2️⃣ Iniciar el Mock Server

```cmd
start.bat
```

Verás:
```
🚀 Kore.ai Mock Server Started
📡 HTTP Server: http://localhost:3000
🔌 WebSocket Server: ws://localhost:8080
```

### 3️⃣ Conectar tu Proyecto del SDK

En tu proyecto (cualquier workspace), configura:

```javascript
botOptions.koreAPIUrl = "http://localhost:3000/api/";
botOptions.JWTUrl = "http://localhost:3000/api/oAuth/token/jwtgrant";
botOptions.clientId = "cualquier_cosa";
botOptions.clientSecret = "cualquier_cosa";

botOptions.assertionFn = function(options, callback) {
  const assertion = JSON.stringify({
    iss: options.clientId,
    sub: options.userIdentity,
    aud: options.koreAPIUrl,
    isAnonymous: false
  });

  fetch(options.JWTUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clientId: options.clientId,
      clientSecret: options.clientSecret,
      assertion: assertion
    })
  })
  .then(res => res.json())
  .then(data => {
    options.assertion = data.authorization.accessToken;
    callback(null, options);
  })
  .catch(err => callback(err));
};
```

**¡Listo!** Tu proyecto se conectará al mock server.

---

## 📂 Estructura del Proyecto

```
c:\Dev\kore-mock-server\
├── 📄 server.js                   ← Servidor principal (WebSocket + REST)
├── 📄 package.json                ← Dependencias npm
├── 📄 .env                        ← Tu configuración personal
├── 📄 .env.example                ← Plantilla de configuración
├── 🪟 install.bat                 ← Instalador para Windows
├── 🪟 start.bat                   ← Iniciar servidor en Windows
├── 📖 README.md                   ← Documentación general
├── 📖 INTEGRATION.md              ← Guía por framework (React/Angular/Vue)
├── 📖 GETTING-STARTED.md          ← Guía de inicio
├── 📖 SUMMARY.md                  ← Este archivo
├── 📁 config\
│   └── 📄 responses.json          ← Respuestas del bot (editable)
└── 📁 utils\
    └── 📄 messageHandler.js       ← Lógica de procesamiento
```

---

## ⚙️ Configuración (.env)

```env
# Puertos del servidor
HTTP_PORT=3000
WS_PORT=8080

# CORS - Permitir todos los orígenes (desarrollo)
ALLOWED_ORIGINS=*

# Credenciales mock (opcionales)
MOCK_CLIENT_ID=MOCK_CLIENT_ID
MOCK_CLIENT_SECRET=MOCK_CLIENT_SECRET

# Seguridad (recomendado: false para testing)
VALIDATE_CREDENTIALS=false    # Acepta cualquier credencial
REQUIRE_JWT=false             # No requiere JWT válido
STRICT_MODE=false             # Validación relajada
```

---

## 🔌 Endpoints Disponibles

| Método | URL | Descripción |
|--------|-----|-------------|
| `POST` | `/api/users/login` | Login básico - retorna JWT |
| `POST` | `/api/oAuth/token/jwtgrant` | JWT Grant (usado por SDK) |
| `POST` | `/api/rtm/start` | Inicia RTM - retorna URL WebSocket |
| `GET` | `/api/chat/history` | Historial de chat (vacío) |
| `GET` | `/health` | Health check + configuración |

**WebSocket**: `ws://localhost:8080` - Conexión en tiempo real

---

## 🎨 Personalizar Respuestas

Edita `config/responses.json` sin reiniciar el servidor:

```json
{
  "keywordResponses": {
    "hola": "defaultResponses.hello",
    "botones": "templates.buttons",
    "lista": "templates.list"
  }
}
```

Agrega tus propias respuestas:

```json
{
  "defaultResponses": {
    "mi_respuesta": {
      "type": "bot_response",
      "from": "bot",
      "message": [{
        "type": "text",
        "cInfo": {
          "body": "Esta es mi respuesta personalizada"
        }
      }]
    }
  },
  "keywordResponses": {
    "test": "defaultResponses.mi_respuesta"
  }
}
```

---

## 🌐 Usar con Múltiples Proyectos

### Escenario Real

```
c:\Dev\
  ├── kore-mock-server\              ← UN servidor
  │   └── start.bat
  │
  ├── web-kore-sdk-3-11.19.1\        ← Proyecto 1
  │
  └── mi-proyecto-produccion\        ← Proyecto 2
```

### Flujo de Trabajo

1. **Una sola vez**: Inicia el mock server
   ```cmd
   cd c:\Dev\kore-mock-server
   start.bat
   ```

2. **Múltiples terminales**: Inicia tus proyectos
   ```cmd
   # Terminal 1
   cd c:\Dev\web-kore-sdk-3-11.19.1
   npm start
   
   # Terminal 2
   cd c:\Dev\mi-proyecto-produccion
   npm run dev
   ```

**Ambos proyectos comparten el mismo mock server** ✅

---

## 📊 Ventajas vs Mock Server Anterior

| Característica | Mock Anterior | Mock Independiente |
|----------------|---------------|-------------------|
| **Ubicación** | Dentro del SDK | `c:\Dev\kore-mock-server\` |
| **Reutilizable** | ❌ Solo ese workspace | ✅ Todos los proyectos |
| **Actualización** | ❌ Copiar en cada proyecto | ✅ Un solo lugar |
| **Configuración** | Hardcoded | ✅ Variables .env |
| **CORS** | Fixed | ✅ Configurable |
| **Mantenimiento** | Difícil | ✅ Fácil |

---

## 🧪 Verificar Funcionamiento

### 1. Health Check

```cmd
curl http://localhost:3000/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "service": "kore-mock-server",
  "config": {
    "httpPort": 3000,
    "wsPort": 8080
  }
}
```

### 2. Test JWT Endpoint

```cmd
curl -X POST http://localhost:3000/api/oAuth/token/jwtgrant ^
  -H "Content-Type: application/json" ^
  -d "{\"clientId\":\"test\",\"clientSecret\":\"test\",\"assertion\":\"test\"}"
```

Respuesta esperada:
```json
{
  "authorization": {
    "accessToken": "mock_jwt_token_12345",
    "refreshToken": "mock_refresh_token",
    "token_type": "bearer"
  }
}
```

### 3. Test desde tu Proyecto

Abre la consola del navegador y verifica:
- ✅ `[REST] JWT Grant request received`
- ✅ `[WS] 🔗 New client connected`
- ✅ `[WS] ✅ Sent HELLO message`

---

## 🎓 Casos de Uso

### ✅ Desarrollo Local
Desarrolla sin conexión al servidor real de Kore.ai

### ✅ Testing de UI
Prueba diferentes respuestas del bot editando JSON

### ✅ Demos y Presentaciones
Muestra el SDK sin depender de backend externo

### ✅ CI/CD
Integra en pipelines de testing automático

### ✅ Desarrollo en Equipo
Todo el equipo usa el mismo mock server

### ✅ Múltiples Proyectos
Un servidor para todos tus workspaces del SDK

---

## 📚 Documentación Completa

- **[GETTING-STARTED.md](./GETTING-STARTED.md)** - Guía de inicio paso a paso
- **[INTEGRATION.md](./INTEGRATION.md)** - Integración por framework (React, Angular, Vue, etc.)
- **[README.md](./README.md)** - Documentación técnica completa
- **`.env`** - Archivo de configuración
- **`config/responses.json`** - Personalizar respuestas

---

## ⚠️ Notas Importantes

### PowerShell Policy
Si tienes error con PowerShell, usa **Command Prompt (cmd)** en su lugar.

### Firewall
Si no puedes conectar, verifica que Windows Firewall permite Node.js en los puertos 3000 y 8080.

### Múltiples Instancias
Solo necesitas **UNA instancia** del mock server corriendo, sin importar cuántos proyectos tengas.

---

## 🎯 Próximos Pasos

1. ✅ **Instalar**: `cd c:\Dev\kore-mock-server && install.bat`
2. ✅ **Iniciar**: `start.bat`
3. ✅ **Configurar tu proyecto del SDK** con las URLs del mock
4. ✅ **Personalizar respuestas** en `config/responses.json`
5. ✅ **Compartir** con otros desarrolladores del equipo

---

## 🆘 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Puerto en uso | Cambia `HTTP_PORT` en `.env` |
| Error CORS | Configura `ALLOWED_ORIGINS=*` |
| No conecta WebSocket | Verifica puerto 8080 libre |
| 404 en endpoints | Revisa URL: debe terminar en `/api/` |

---

## ✨ ¡Listo!

Tienes un **mock server profesional, independiente y reutilizable** para todos tus proyectos del Kore.ai SDK.

**Ejecuta y conecta**:
```cmd
cd c:\Dev\kore-mock-server
start.bat
```

🎉 **¡Happy Coding!** 🎉
