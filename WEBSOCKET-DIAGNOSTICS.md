# 🔍 Diagnóstico de Conexiones WebSocket

## 📊 Sistema de Monitoreo Implementado

He añadido herramientas de diagnóstico para identificar quién cierra las conexiones WebSocket (servidor o cliente) y por qué.

---

## 🔧 Mejoras Implementadas

### 1. **Logging Detallado de Conexiones**
Cada conexión ahora registra:
- ✅ **IP del cliente**
- ✅ **Hora de conexión**
- ✅ **Duración de la conexión**
- ✅ **Código de cierre**
- ✅ **Quién cerró la conexión** (servidor/cliente)
- ✅ **Estadísticas acumuladas**

### 2. **Códigos de Cierre WebSocket**
El servidor identifica automáticamente el origen del cierre:

| Código | Significado | Cerrado Por |
|--------|-------------|-------------|
| **1000** | Cierre normal | Cliente |
| **1001** | Cliente se va (navegador cerrado/pestaña cerrada) | Cliente |
| **1006** | Cierre anormal (timeout, red) | Red/Timeout |
| **1011** | Error del servidor | Servidor |

### 3. **Sistema Keep-Alive**
- **Ping cada 30 segundos** para mantener la conexión viva
- Previene cierres por inactividad
- Detecta clientes que no responden

### 4. **Endpoint de Estadísticas en Tiempo Real**
```
GET http://localhost:3000/ws-stats
```

Retorna:
```json
{
  "status": "ok",
  "websocket": {
    "port": 8080,
    "statistics": {
      "total": 5,
      "active": 2,
      "closed": 3,
      "errors": 0
    },
    "activeClients": [
      {
        "ip": "::1",
        "connectedFor": "45.32s",
        "isAlive": true
      }
    ],
    "timestamp": "2025-11-27T05:00:00.000Z"
  }
}
```

---

## 📝 Cómo Interpretar los Logs

### Ejemplo 1: Cliente Cierra Normalmente
```
[WS] 🔌 Connection closed: {
  ip: '::1',
  code: 1000,
  reason: 'No reason provided',
  duration: '23.45s',
  closedBy: 'Client (normal)',
  activeConnections: 0,
  totalClosed: 1
}
```
**Interpretación**: El cliente cerró la conexión correctamente (comportamiento esperado).

---

### Ejemplo 2: Timeout/Red
```
[WS] 🔌 Connection closed: {
  ip: '::1',
  code: 1006,
  reason: 'No reason provided',
  duration: '5.12s',
  closedBy: 'Abnormal (timeout or network)',
  activeConnections: 0,
  totalClosed: 1
}
```
**Interpretación**: Problema de red o timeout. Si ocurre frecuentemente (<10s de duración), hay un problema de conectividad o configuración del cliente.

---

### Ejemplo 3: Servidor Termina por Inactividad
```
[WS] ⚠️ Client not responding to ping, terminating: {
  ip: '::1'
}
```
**Interpretación**: El cliente no respondió a 2 pings consecutivos (60s sin respuesta), el servidor cerró la conexión.

---

## 🧪 Cómo Probar

### Paso 1: Reiniciar el Servidor
```cmd
cd c:\Dev\kore-mock-server
npm start
```

### Paso 2: Conectar con el SDK
Inicia tu aplicación del SDK y observa los logs del servidor.

### Paso 3: Monitorear en Tiempo Real
Abre en el navegador:
```
http://localhost:3000/ws-stats
```

O desde terminal:
```cmd
curl http://localhost:3000/ws-stats
```

### Paso 4: Prueba de Estrés
Para probar múltiples conexiones y cierres:
1. Abre y cierra el chat varias veces
2. Revisa los logs para ver patrones
3. Consulta `/ws-stats` para ver estadísticas

---

## 🔍 Identificar el Problema

### Si los cierres son **1000 o 1001** (Cliente)
✅ **Comportamiento normal**. El SDK o el usuario está cerrando la conexión intencionalmente.

### Si los cierres son **1006** (Timeout/Red)
⚠️ **Posibles causas**:
1. **Timeout del cliente**: El SDK tiene un timeout muy corto
2. **Proxy/Firewall**: Algún intermediario cierra conexiones WebSocket
3. **Configuración CORS**: Verificar `ALLOWED_ORIGINS` en `.env`
4. **Red inestable**: Problemas de conectividad

**Soluciones**:
- Aumentar timeout en el SDK
- Revisar configuración de proxy/firewall
- Verificar que el keepalive funcione (30s)

### Si el servidor termina conexiones (KeepAlive)
⚠️ **El cliente no responde a pings**

**Soluciones**:
- Verificar que el SDK maneje correctamente los mensajes `ping/pong`
- Ajustar intervalo de keepalive (actualmente 30s)

---

## ⚙️ Ajustes Opcionales

### Cambiar Intervalo de Keep-Alive
En `server.js`, línea ~460:
```javascript
}, 30000); // Cambiar a 60000 para 60 segundos
```

### Deshabilitar Keep-Alive (No Recomendado)
Comentar el bloque:
```javascript
// const keepAliveInterval = setInterval(() => {
//   ...
// }, 30000);
```

---

## 📊 Monitoreo Continuo

Para monitoreo continuo, puedes usar:

**PowerShell** (Windows):
```powershell
while ($true) {
  curl http://localhost:3000/ws-stats | ConvertFrom-Json | ConvertTo-Json
  Start-Sleep -Seconds 5
}
```

**Bash** (Git Bash/WSL):
```bash
watch -n 5 curl -s http://localhost:3000/ws-stats
```

---

## 🎯 Próximos Pasos

1. **Reinicia el servidor** con los cambios
2. **Conecta tu aplicación del SDK**
3. **Observa los logs** en la terminal
4. **Consulta `/ws-stats`** para ver estadísticas
5. **Reporta los códigos de cierre** que veas frecuentemente

Con esta información podremos identificar exactamente quién está cerrando las conexiones y por qué. 🚀
