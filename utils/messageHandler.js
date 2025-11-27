const fs = require('fs');
const path = require('path');

class MessageHandler {
  constructor() {
    this.responsesConfig = this.loadResponses();
    this.sequenceIndex = 0;
  }

  loadResponses() {
    const configPath = path.join(__dirname, '../config/responses.json');
    const rawData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(rawData);
  }

  /**
   * Genera un ID único para el mensaje
   */
  generateMessageId() {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene una respuesta desde el archivo de configuración usando una ruta
   * @param {string} path - Ruta en formato "defaultResponses.hello"
   */
  getResponseByPath(path) {
    const parts = path.split('.');
    let response = this.responsesConfig;
    
    for (const part of parts) {
      if (response && response[part]) {
        response = response[part];
      } else {
        return null;
      }
    }
    
    return response;
  }

  /**
   * Busca una respuesta basada en palabras clave
   * @param {string} text - Texto del mensaje del usuario
   * @returns {object|array|null} - Respuesta simple, array de respuestas múltiples, o null
   */
  findKeywordResponse(text) {
    if (!text) return null;
    
    const lowerText = text.toLowerCase().trim();
    const keywords = this.responsesConfig.keywordResponses;
    
    // Busca coincidencia exacta primero
    if (keywords[lowerText]) {
      const responsePath = keywords[lowerText];
      
      // Verifica si es una respuesta múltiple
      if (responsePath.startsWith('multiResponse.')) {
        const multiResponses = this.getResponseByPath(responsePath);
        if (Array.isArray(multiResponses)) {
          // Retorna array de respuestas resueltas
          return multiResponses.map(path => this.getResponseByPath(path)).filter(r => r !== null);
        }
      }
      
      return this.getResponseByPath(responsePath);
    }
    
    // Busca coincidencia parcial
    for (const keyword in keywords) {
      if (lowerText.includes(keyword)) {
        const responsePath = keywords[keyword];
        
        // Verifica si es una respuesta múltiple
        if (responsePath.startsWith('multiResponse.')) {
          const multiResponses = this.getResponseByPath(responsePath);
          if (Array.isArray(multiResponses)) {
            return multiResponses.map(path => this.getResponseByPath(path)).filter(r => r !== null);
          }
        }
        
        return this.getResponseByPath(responsePath);
      }
    }
    
    return null;
  }

  /**
   * Obtiene la siguiente respuesta en secuencia
   */
  getSequentialResponse() {
    const responses = this.responsesConfig.sequentialResponses;
    if (!responses || responses.length === 0) return null;
    
    const response = responses[this.sequenceIndex];
    this.sequenceIndex = (this.sequenceIndex + 1) % responses.length;
    
    return response;
  }

  /**
   * Procesa un mensaje del usuario y genera una respuesta apropiada
   * @param {object} userMessage - Mensaje recibido del usuario
   * @returns {object|array} - Respuesta simple o array de respuestas múltiples
   */
  processMessage(userMessage) {
    let responseTemplate = null;
    
    // Si el mensaje tiene un body de texto, busca por palabra clave
    if (userMessage.message && userMessage.message.body) {
      responseTemplate = this.findKeywordResponse(userMessage.message.body);
    }
    
    // Si no se encontró respuesta por palabra clave, usa respuesta por defecto
    if (!responseTemplate) {
      responseTemplate = this.responsesConfig.defaultResponses.default;
    }
    
    // Si es un array de respuestas múltiples, procesar cada una
    if (Array.isArray(responseTemplate)) {
      return responseTemplate.map(template => {
        const response = JSON.parse(JSON.stringify(template));
        response.messageId = this.generateMessageId();
        response.createdOn = new Date().toISOString();
        response.icon = userMessage.botInfo?.icon || 'https://via.placeholder.com/40';
        return response;
      });
    }
    
    // Clona la respuesta para no modificar el original
    const response = JSON.parse(JSON.stringify(responseTemplate));
    
    // Añade metadatos al mensaje
    response.messageId = this.generateMessageId();
    response.createdOn = new Date().toISOString();
    response.icon = userMessage.botInfo?.icon || 'https://via.placeholder.com/40';
    
    return response;
  }

  /**
   * Genera el mensaje "hello" inicial
   */
  generateHelloMessage() {
    return {
      type: 'hello',
      ok: true,
      timestamp: Date.now()
    };
  }

  /**
   * Genera respuesta para acknowledgment
   * @param {object} ackMessage - Mensaje de ACK recibido
   */
  processAcknowledgment(ackMessage) {
    console.log('[ACK] Received acknowledgment:', {
      replyto: ackMessage.replyto,
      status: ackMessage.status
    });
    return null; // No se envía respuesta para ACKs
  }

  /**
   * Simula delay en la respuesta (opcional)
   * @param {number} ms - Milisegundos de delay
   */
  async delay(ms = 500) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = MessageHandler;
