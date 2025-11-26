# 🔌 Guía de Integración - Kore.ai Mock Server

Esta guía explica cómo conectar cualquier proyecto que use el Kore.ai SDK al mock server independiente.

## 📋 Tabla de Contenidos

- [Configuración Básica](#configuración-básica)
- [Integración por Framework](#integración-por-framework)
- [Múltiples Proyectos](#múltiples-proyectos)
- [Ejemplo Completo](#ejemplo-completo)
- [Troubleshooting](#troubleshooting)

---

## Configuración Básica

### 1. Iniciar el Mock Server

El mock server debe estar corriendo **antes** de iniciar tu proyecto del SDK:

```bash
cd c:\Dev\kore-mock-server
npm start
```

Deberías ver:
```
🚀 Kore.ai Mock Server Started
📡 HTTP Server: http://localhost:3000
🔌 WebSocket Server: ws://localhost:8080
```

### 2. Configurar el SDK en Tu Proyecto

En tu proyecto, modifica la configuración del SDK para apuntar al mock server:

```javascript
// Antes (apunta a Kore.ai real)
botOptions.koreAPIUrl = "https://bots.kore.ai/api/";
botOptions.JWTUrl = "https://bots.kore.ai/api/oAuth/token/jwtgrant";

// Después (apunta al mock server)
botOptions.koreAPIUrl = "http://localhost:3000/api/";
botOptions.JWTUrl = "http://localhost:3000/api/oAuth/token/jwtgrant";
```

### 3. Configuración Mínima Requerida

```javascript
const botOptions = {
  // URLs del mock server
  koreAPIUrl: "http://localhost:3000/api/",
  JWTUrl: "http://localhost:3000/api/oAuth/token/jwtgrant",
  
  // Credenciales (cualquier valor si VALIDATE_CREDENTIALS=false)
  clientId: "MOCK_CLIENT_ID",
  clientSecret: "MOCK_CLIENT_SECRET",
  
  // Información del usuario
  userIdentity: "test@example.com",
  
  // Información del bot
  botInfo: {
    name: "Mock Bot",
    _id: "mock_bot_id"
  },
  
  // Función de assertion (necesaria para JWT)
  assertionFn: function(options, callback) {
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
  }
};
```

---

## Integración por Framework

### 🔷 Vanilla JavaScript / HTML

**Archivo**: `index.html`

```html
<!DOCTYPE html>
<html>
<head>
  <title>Kore.ai Chat</title>
  <link rel="stylesheet" href="path/to/kore-sdk/kore-chat.css">
</head>
<body>
  <script src="path/to/kore-sdk/kore-sdk.js"></script>
  <script src="kore-config.js"></script>
  <script>
    // Inicializar chat
    const chatWindow = new KoreSDK.ChatWindow(chatConfig);
    chatWindow.show();
  </script>
</body>
</html>
```

**Archivo**: `kore-config.js`

```javascript
const chatConfig = {
  botOptions: {
    koreAPIUrl: "http://localhost:3000/api/",
    JWTUrl: "http://localhost:3000/api/oAuth/token/jwtgrant",
    clientId: "MOCK_CLIENT_ID",
    clientSecret: "MOCK_CLIENT_SECRET",
    userIdentity: "test@example.com",
    botInfo: { name: "Mock Bot", _id: "mock_bot_id" },
    
    assertionFn: function(options, callback) {
      // ... (función de assertion completa aquí)
    }
  }
};
```

---

### ⚛️ React

**Archivo**: `src/config/kore.config.js`

```javascript
export const koreConfig = {
  botOptions: {
    koreAPIUrl: process.env.REACT_APP_KORE_API_URL || 'http://localhost:3000/api/',
    JWTUrl: process.env.REACT_APP_KORE_JWT_URL || 'http://localhost:3000/api/oAuth/token/jwtgrant',
    clientId: process.env.REACT_APP_KORE_CLIENT_ID || 'MOCK_CLIENT_ID',
    clientSecret: process.env.REACT_APP_KORE_CLIENT_SECRET || 'MOCK_CLIENT_SECRET',
    userIdentity: 'user@example.com',
    botInfo: {
      name: 'Mock Bot',
      _id: 'mock_bot_id'
    },
    
    assertionFn: function(options, callback) {
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
    }
  }
};
```

**Archivo**: `.env.local`

```env
REACT_APP_KORE_API_URL=http://localhost:3000/api/
REACT_APP_KORE_JWT_URL=http://localhost:3000/api/oAuth/token/jwtgrant
REACT_APP_KORE_CLIENT_ID=MOCK_CLIENT_ID
REACT_APP_KORE_CLIENT_SECRET=MOCK_CLIENT_SECRET
```

**Archivo**: `src/components/ChatWidget.jsx`

```jsx
import React, { useEffect } from 'react';
import { koreConfig } from '../config/kore.config';

function ChatWidget() {
  useEffect(() => {
    // Cargar SDK
    const script = document.createElement('script');
    script.src = '/kore-sdk/kore-sdk.js';
    script.onload = () => {
      const chatWindow = new window.KoreSDK.ChatWindow(koreConfig);
      chatWindow.show();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div id="kore-chat-container"></div>;
}

export default ChatWidget;
```

---

### 🅰️ Angular

**Archivo**: `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  kore: {
    apiUrl: 'http://localhost:3000/api/',
    jwtUrl: 'http://localhost:3000/api/oAuth/token/jwtgrant',
    clientId: 'MOCK_CLIENT_ID',
    clientSecret: 'MOCK_CLIENT_SECRET'
  }
};
```

**Archivo**: `src/app/services/kore-bot.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

declare var KoreSDK: any;

@Injectable({ providedIn: 'root' })
export class KoreBotService {
  private chatWindow: any;

  initializeBot() {
    const botOptions = {
      koreAPIUrl: environment.kore.apiUrl,
      JWTUrl: environment.kore.jwtUrl,
      clientId: environment.kore.clientId,
      clientSecret: environment.kore.clientSecret,
      userIdentity: 'user@example.com',
      botInfo: {
        name: 'Mock Bot',
        _id: 'mock_bot_id'
      },
      
      assertionFn: (options: any, callback: any) => {
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
      }
    };

    this.chatWindow = new KoreSDK.ChatWindow({ botOptions });
    this.chatWindow.show();
  }

  showChat() {
    if (this.chatWindow) this.chatWindow.show();
  }

  hideChat() {
    if (this.chatWindow) this.chatWindow.hide();
  }
}
```

**Archivo**: `src/app/app.component.ts`

```typescript
import { Component, OnInit } from '@angular/core';
import { KoreBotService } from './services/kore-bot.service';

@Component({
  selector: 'app-root',
  template: '<div id="kore-chat"></div>'
})
export class AppComponent implements OnInit {
  constructor(private koreBotService: KoreBotService) {}

  ngOnInit() {
    this.koreBotService.initializeBot();
  }
}
```

---

### 🟢 Vue.js

**Archivo**: `src/config/bot.config.js`

```javascript
export default {
  koreAPIUrl: import.meta.env.VITE_KORE_API_URL || 'http://localhost:3000/api/',
  JWTUrl: import.meta.env.VITE_KORE_JWT_URL || 'http://localhost:3000/api/oAuth/token/jwtgrant',
  clientId: import.meta.env.VITE_KORE_CLIENT_ID || 'MOCK_CLIENT_ID',
  clientSecret: import.meta.env.VITE_KORE_CLIENT_SECRET || 'MOCK_CLIENT_SECRET',
  userIdentity: 'user@example.com',
  botInfo: {
    name: 'Mock Bot',
    _id: 'mock_bot_id'
  },
  
  assertionFn(options, callback) {
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
  }
};
```

**Archivo**: `.env.local`

```env
VITE_KORE_API_URL=http://localhost:3000/api/
VITE_KORE_JWT_URL=http://localhost:3000/api/oAuth/token/jwtgrant
VITE_KORE_CLIENT_ID=MOCK_CLIENT_ID
VITE_KORE_CLIENT_SECRET=MOCK_CLIENT_SECRET
```

**Archivo**: `src/components/ChatWidget.vue`

```vue
<template>
  <div id="kore-chat-widget"></div>
</template>

<script>
import { onMounted } from 'vue';
import botConfig from '../config/bot.config';

export default {
  name: 'ChatWidget',
  setup() {
    onMounted(() => {
      const chatWindow = new window.KoreSDK.ChatWindow({
        botOptions: botConfig
      });
      chatWindow.show();
    });
  }
};
</script>
```

---

## Múltiples Proyectos

### Escenario: Varios Proyectos Simultáneos

```
c:\Dev\
  ├── kore-mock-server\          ← UN solo servidor
  ├── proyecto-react\            ← Puerto 3001
  ├── proyecto-angular\          ← Puerto 4200
  └── proyecto-vue\              ← Puerto 5173
```

### Configuración del Mock Server

**Archivo**: `c:\Dev\kore-mock-server\.env`

```env
# Permitir todos los proyectos
ALLOWED_ORIGINS=http://localhost:3001,http://localhost:4200,http://localhost:5173

# O permitir todos
ALLOWED_ORIGINS=*
```

### Cada Proyecto Usa la Misma URL

Todos los proyectos apuntan a:
- API: `http://localhost:3000/api/`
- JWT: `http://localhost:3000/api/oAuth/token/jwtgrant`

**No es necesario cambiar puertos del mock server** - cada proyecto tiene su propio puerto de desarrollo.

---

## Ejemplo Completo

### Proyecto Completo de Ejemplo

```
mi-proyecto-sdk/
├── public/
│   └── index.html
├── src/
│   ├── config/
│   │   └── kore.config.js       ← Configuración del mock
│   ├── components/
│   │   └── ChatWidget.js
│   └── index.js
├── package.json
└── .env.local                    ← Variables de entorno
```

**`.env.local`**:
```env
KORE_API_URL=http://localhost:3000/api/
KORE_JWT_URL=http://localhost:3000/api/oAuth/token/jwtgrant
```

**`src/config/kore.config.js`**:
```javascript
export const chatConfig = {
  botOptions: {
    koreAPIUrl: process.env.KORE_API_URL,
    JWTUrl: process.env.KORE_JWT_URL,
    clientId: "MOCK_CLIENT_ID",
    clientSecret: "MOCK_CLIENT_SECRET",
    userIdentity: "dev@test.com",
    botInfo: { name: "Mock Bot", _id: "mock_bot" },
    
    assertionFn: function(options, callback) {
      fetch(options.JWTUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: options.clientId,
          clientSecret: options.clientSecret,
          assertion: JSON.stringify({
            iss: options.clientId,
            sub: options.userIdentity,
            aud: options.koreAPIUrl
          })
        })
      })
      .then(r => r.json())
      .then(d => {
        options.assertion = d.authorization.accessToken;
        callback(null, options);
      })
      .catch(e => callback(e));
    }
  }
};
```

### Pasos para Ejecutar

```bash
# Terminal 1: Mock Server
cd c:\Dev\kore-mock-server
npm start

# Terminal 2: Tu Proyecto
cd c:\Dev\mi-proyecto-sdk
npm run dev
```

---

## Troubleshooting

### ❌ Error: "Failed to fetch"

**Causa**: Mock server no está corriendo o puerto incorrecto.

**Solución**:
```bash
# Verificar que el mock server esté corriendo
curl http://localhost:3000/health

# Si no responde, iniciar el servidor
cd c:\Dev\kore-mock-server
npm start
```

### ❌ Error: CORS Policy

**Causa**: Tu proyecto no está en la lista de orígenes permitidos.

**Solución**:
```env
# En c:\Dev\kore-mock-server\.env
ALLOWED_ORIGINS=*
```

Reinicia el mock server después de cambiar `.env`.

### ❌ WebSocket Connection Failed

**Causa**: Puerto WebSocket bloqueado o incorrecto.

**Verificar**:
```bash
# Windows
netstat -ano | findstr :8080

# Debe mostrar LISTENING
```

**Solución**: Verifica que `WS_PORT=8080` en `.env` y que el firewall no bloquee el puerto.

### ❌ Assertion Function Error

**Causa**: `assertionFn` no está configurada correctamente.

**Verificar**: La función `assertionFn` debe:
1. Crear el assertion JSON
2. Hacer POST a `/api/oAuth/token/jwtgrant`
3. Asignar el token a `options.assertion`
4. Llamar al `callback(null, options)`

---

## 📞 Soporte

Para más ayuda:
- Ver logs del mock server en la terminal
- Verificar `/health` endpoint: `http://localhost:3000/health`
- Revisar consola del navegador (F12)

---

## ✅ Checklist de Integración

- [ ] Mock server corriendo (`npm start`)
- [ ] `.env` configurado correctamente
- [ ] `koreAPIUrl` apunta a `http://localhost:3000/api/`
- [ ] `JWTUrl` apunta a `http://localhost:3000/api/oAuth/token/jwtgrant`
- [ ] `assertionFn` implementada
- [ ] CORS configurado para tu puerto
- [ ] Proyecto inicia sin errores de conexión
- [ ] Chat se conecta y responde mensajes
