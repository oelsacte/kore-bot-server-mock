# ✅ MOCK SERVER INDEPENDIENTE CREADO

## 📍 Ubicación del Servidor

```
c:\Dev\kore-mock-server\
```

Este servidor es **completamente independiente** y puede ser usado por **cualquier proyecto** que use el Kore.ai SDK, incluso fuera de este workspace.

---

## 🚀 PASOS PARA USARLO

### PASO 1: Instalar Dependencias

Abre **Command Prompt (cmd)** y ejecuta:

```cmd
cd c:\Dev\kore-mock-server
install.bat
```

O manualmente:
```cmd
cd c:\Dev\kore-mock-server
npm install
```

### PASO 2: Iniciar el Servidor

```cmd
cd c:\Dev\kore-mock-server
start.bat
```

O:
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

**IMPORTANTE**: Este servidor queda corriendo. **NO lo cierres**.

---

## 🔌 CONECTAR TUS PROYECTOS

### En CUALQUIER proyecto que use el SDK

1. **El mock server debe estar corriendo** (paso 2 anterior)

2. **En tu proyecto**, configura el SDK:

```javascript
// En tu archivo de configuración (kore-config.js, config.js, etc.)

botOptions.koreAPIUrl = "http://localhost:3000/api/";
botOptions.JWTUrl = "http://localhost:3000/api/oAuth/token/jwtgrant";
botOptions.clientId = "cualquier_cosa";        // Acepta cualquier valor
botOptions.clientSecret = "cualquier_cosa";    // Acepta cualquier valor

// IMPORTANTE: Agregar assertionFn
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

3. **Inicia tu proyecto normalmente**

---

## 🎯 EJEMPLO PRÁCTICO

### Tienes varios proyectos con el SDK:

```
c:\Dev\
  ├── kore-mock-server\          ← UN solo servidor (puerto 3000, 8080)
  ├── proyecto-1\                ← Tu proyecto principal
  ├── proyecto-2\                ← Otro proyecto
  └── web-kore-sdk-3-11.19.1\    ← Este workspace
```

### Flujo de trabajo:

**Terminal 1** (solo una vez):
```cmd
cd c:\Dev\kore-mock-server
start.bat
```

**Terminal 2** (tu proyecto 1):
```cmd
cd c:\Dev\proyecto-1
npm run dev
```

**Terminal 3** (tu proyecto 2):
```cmd
cd c:\Dev\proyecto-2
npm start
```

**Todos los proyectos se conectan al MISMO mock server** ✅

---

## 📝 PERSONALIZAR RESPUESTAS

Edita el archivo:
```
c:\Dev\kore-mock-server\config\responses.json
```

Puedes agregar nuevas respuestas sin reiniciar el servidor.

Palabras clave que funcionan por defecto:
- `hola` - Mensaje de bienvenida
- `botones` - Plantilla con botones
- `lista` - Lista de elementos
- `carousel` - Carrusel de tarjetas
- `ayuda` - Mensaje de ayuda

---

## ⚙️ CONFIGURACIÓN AVANZADA

### Cambiar Puertos

Edita `c:\Dev\kore-mock-server\.env`:

```env
HTTP_PORT=3001    # Cambiar puerto HTTP
WS_PORT=8081      # Cambiar puerto WebSocket
```

### Configurar CORS

Por defecto acepta **todos** los orígenes (`*`).

Para restringir a orígenes específicos:

```env
ALLOWED_ORIGINS=http://localhost:9000,http://localhost:3001
```

### Habilitar Validación de Credenciales

Si quieres validar credenciales específicas:

```env
VALIDATE_CREDENTIALS=true
STRICT_MODE=true
MOCK_CLIENT_ID=MI_CLIENT_ID
MOCK_CLIENT_SECRET=MI_SECRET
```

---

## 🧪 VERIFICAR QUE FUNCIONA

### 1. Health Check

```cmd
curl http://localhost:3000/health
```

Debe responder con JSON indicando que está corriendo.

### 2. En tu proyecto

Abre la consola del navegador (F12) y deberías ver:
- ✅ JWT Grant request successful
- ✅ WebSocket conectado
- ✅ Mensajes del bot

---

## 📚 DOCUMENTACIÓN COMPLETA

Todos estos archivos están en `c:\Dev\kore-mock-server\`:

- **GETTING-STARTED.md** - Guía de inicio detallada
- **INTEGRATION.md** - Ejemplos por framework (React, Angular, Vue)
- **README.md** - Documentación técnica completa
- **SUMMARY.md** - Resumen ejecutivo

---

## ⚠️ IMPORTANTE

### ✅ VENTAJAS de este Mock Server:

1. ✅ **Independiente** - No está dentro del workspace del SDK
2. ✅ **Reutilizable** - Un solo servidor para TODOS tus proyectos
3. ✅ **Fácil de mantener** - Cambios en un solo lugar
4. ✅ **No requiere credenciales reales** - Acepta cualquier valor por defecto
5. ✅ **Configurable** - Puertos, CORS, validación mediante .env
6. ✅ **Compartible** - Otros desarrolladores pueden usarlo

### ⚠️ NOTAS:

- **PowerShell puede dar error** - Usa Command Prompt (cmd) en su lugar
- **Solo una instancia** - No necesitas iniciar múltiples servidores
- **Debe estar corriendo** - Inícialo antes que tus proyectos del SDK
- **Firewall** - Puede pedir permiso para Node.js la primera vez

---

## 🎉 RESUMEN RÁPIDO

```cmd
# 1. Instalar (solo la primera vez)
cd c:\Dev\kore-mock-server
install.bat

# 2. Iniciar servidor (dejar corriendo)
start.bat

# 3. En tu proyecto del SDK, configurar:
koreAPIUrl: "http://localhost:3000/api/"
JWTUrl: "http://localhost:3000/api/oAuth/token/jwtgrant"

# 4. Iniciar tu proyecto normalmente
npm start
```

---

## 🆘 AYUDA

Si tienes problemas:

1. Verifica que Node.js está instalado: `node --version`
2. Verifica que el servidor está corriendo
3. Revisa los logs en la terminal del servidor
4. Verifica que `.env` tiene `ALLOWED_ORIGINS=*`
5. Usa Command Prompt (cmd) en lugar de PowerShell

---

## ✨ ¡LISTO!

Tienes un servidor mock **profesional, independiente y reutilizable** para desarrollar con el Kore.ai SDK sin depender del backend real.

**Happy Coding!** 🚀
