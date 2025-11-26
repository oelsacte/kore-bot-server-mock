# 🎉 Mock Server Independiente Creado!

## 📍 Ubicación

El mock server ha sido creado en:
```
c:\Dev\kore-mock-server\
```

Este servidor es **completamente independiente** del workspace del SDK y puede ser usado por múltiples proyectos simultáneamente.

---

## 🚀 Instalación y Primer Uso

### Opción 1: Instalación Automática (Recomendada)

Abre **Command Prompt** (cmd) y ejecuta:

```cmd
cd c:\Dev\kore-mock-server
install.bat
```

Esto instalará todas las dependencias y configurará el servidor.

### Opción 2: Instalación Manual

```cmd
cd c:\Dev\kore-mock-server
npm install
copy .env.example .env
```

---

## ▶️ Iniciar el Servidor

### Opción 1: Usando script

```cmd
cd c:\Dev\kore-mock-server
start.bat
```

### Opción 2: Comando directo

```cmd
cd c:\Dev\kore-mock-server
npm start
```

Deberías ver:
```
🚀 Kore.ai Mock Server Started
📡 HTTP Server: http://localhost:3000
🔌 WebSocket Server: ws://localhost:8080
```

---

## 🔧 Configuración

### Para Aceptar Conexiones de Todos tus Proyectos

El archivo `.env` ya está configurado para permitir conexiones desde cualquier origen (`ALLOWED_ORIGINS=*`).

Si quieres restringir a orígenes específicos:

```env
# Edita c:\Dev\kore-mock-server\.env
ALLOWED_ORIGINS=http://localhost:9000,http://localhost:3001,http://localhost:4200
```

### Para Cambiar Puertos

```env
# Edita c:\Dev\kore-mock-server\.env
HTTP_PORT=3000
WS_PORT=8080
```

---

## 🔌 Conectar Tus Proyectos del SDK

### En el Workspace Actual (web-kore-sdk-3-11.19.1_SINBRANDING)

Si quieres probar el SDK en este workspace:

**Archivo**: `examples/esm/chat/index.html` (o tu archivo de prueba)

```javascript
botOptions.koreAPIUrl = "http://localhost:3000/api/";
botOptions.JWTUrl = "http://localhost:3000/api/oAuth/token/jwtgrant";
botOptions.clientId = "MOCK_CLIENT_ID";
botOptions.clientSecret = "MOCK_CLIENT_SECRET";
```

### En Otro Workspace (Tu Proyecto Real)

En tu otro workspace donde estás desarrollando con el SDK:

1. **Inicia el mock server** (solo una vez):
   ```cmd
   cd c:\Dev\kore-mock-server
   start.bat
   ```

2. **En tu proyecto**, configura el SDK:
   ```javascript
   // kore-config.js o tu archivo de configuración
   botOptions.koreAPIUrl = "http://localhost:3000/api/";
   botOptions.JWTUrl = "http://localhost:3000/api/oAuth/token/jwtgrant";
   botOptions.clientId = "cualquier_cosa"; // Se acepta cualquier valor
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
     .then(response => response.json())
     .then(data => {
       options.assertion = data.authorization.accessToken;
       callback(null, options);
     })
     .catch(error => {
       console.error('Error getting JWT:', error);
       callback(error);
     });
   };
   ```

3. **Inicia tu proyecto** normalmente y se conectará automáticamente al mock server.

---

## 🎯 Ejemplo de Uso con Múltiples Proyectos

```
c:\Dev\
  ├── kore-mock-server\              ← Mock server (puerto 3000, 8080)
  │   └── start.bat                  ← Iniciar servidor
  │
  ├── web-kore-sdk-3-11.19.1_SINBRANDING\  ← SDK original (puerto 9000)
  │   └── examples\...
  │
  └── mi-proyecto-sdk\               ← Tu proyecto (puerto 3001)
      └── src\...
```

**Flujo de trabajo**:

1. **Terminal 1**: Inicia el mock server
   ```cmd
   cd c:\Dev\kore-mock-server
   start.bat
   ```

2. **Terminal 2**: Inicia tu proyecto principal
   ```cmd
   cd c:\Dev\mi-proyecto-sdk
   npm run dev
   ```

3. **Terminal 3** (opcional): Prueba el SDK original
   ```cmd
   cd c:\Dev\web-kore-sdk-3-11.19.1_SINBRANDING
   npm start
   ```

**Todos los proyectos se conectan al mismo mock server** 🎉

---

## 🧪 Probar el Servidor

### Verificar que está corriendo

```cmd
curl http://localhost:3000/health
```

Debería responder:
```json
{
  "status": "ok",
  "service": "kore-mock-server",
  "config": {
    "httpPort": 3000,
    "wsPort": 8080,
    "validateCredentials": false,
    "requireJWT": false,
    "strictMode": false
  }
}
```

### Probar endpoint JWT

```cmd
curl -X POST http://localhost:3000/api/oAuth/token/jwtgrant ^
  -H "Content-Type: application/json" ^
  -d "{\"clientId\":\"test\",\"clientSecret\":\"test\",\"assertion\":\"test\"}"
```

---

## 📝 Personalizar Respuestas

Para cambiar las respuestas del bot, edita:
```
c:\Dev\kore-mock-server\config\responses.json
```

Ejemplos de palabras clave que puedes escribir en el chat:
- `hola` - Mensaje de bienvenida
- `botones` - Plantilla con botones
- `lista` - Plantilla de lista
- `carousel` - Plantilla carousel
- `ayuda` - Mensaje de ayuda

---

## 📚 Documentación Completa

- **README.md** - Guía general y características
- **INTEGRATION.md** - Ejemplos por framework (React, Angular, Vue)
- **.env** - Configuración de puertos y CORS
- **config/responses.json** - Respuestas del bot

---

## 🛑 Detener el Servidor

Presiona `Ctrl+C` en la terminal donde está corriendo.

---

## ✅ Ventajas de Esta Configuración

✔️ **Un solo servidor** para todos tus proyectos del SDK  
✔️ **No duplicas código** - el mock server está en un solo lugar  
✔️ **Fácil de mantener** - cambios en un solo lugar afectan a todos los proyectos  
✔️ **Fácil de actualizar** - solo actualizas `c:\Dev\kore-mock-server`  
✔️ **Independiente del SDK** - no interfiere con tu workspace del SDK  
✔️ **Reutilizable** - otros desarrolladores pueden usar el mismo servidor  

---

## 🆘 Soporte

Si tienes problemas:

1. **Verifica que Node.js está instalado**: `node --version`
2. **Verifica que el servidor está corriendo**: `curl http://localhost:3000/health`
3. **Revisa los logs** en la terminal donde corre el servidor
4. **Verifica CORS** en `.env`: `ALLOWED_ORIGINS=*`

---

## 📦 Archivos Creados

```
c:\Dev\kore-mock-server\
├── server.js                  ← Servidor principal
├── package.json               ← Dependencias
├── .env                       ← Configuración (gitignored)
├── .env.example               ← Ejemplo de configuración
├── .gitignore                 ← Archivos a ignorar
├── install.bat                ← Script de instalación
├── start.bat                  ← Script para iniciar servidor
├── README.md                  ← Documentación general
├── INTEGRATION.md             ← Guía de integración por framework
├── GETTING-STARTED.md         ← Este archivo
├── config\
│   └── responses.json         ← Respuestas del bot
└── utils\
    └── messageHandler.js      ← Lógica de mensajes
```

---

## 🎉 ¡Listo para Usar!

Ejecuta:
```cmd
cd c:\Dev\kore-mock-server
install.bat
start.bat
```

Y conecta cualquier proyecto del SDK apuntando a:
- `koreAPIUrl: "http://localhost:3000/api/"`
- `JWTUrl: "http://localhost:3000/api/oAuth/token/jwtgrant"`

**¡Disfruta desarrollando sin depender del backend real!** 🚀
