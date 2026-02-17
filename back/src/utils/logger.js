/**
 * @bref Logger structuré pour la plateforme marsAI
 * Remplace console.log par un système de logging professionnel
 */

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

class Logger {
  /**
   * @bref Construit le logger
   * @returns {Logger}
   */
  constructor() {
    this.level = process.env.LOG_LEVEL || "INFO";
  }

  /**
   * @bref Formate un message en objet loggable
   * @param {"ERROR"|"WARN"|"INFO"|"DEBUG"|string} level - Niveau de log
   * @param {string} message - Message
   * @param {object} meta - Métadonnées additionnelles
   * @returns {{timestamp: string, level: string, message: string} & object}
   */
  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      ...meta,
    };
  }

  /**
   * @bref Log en ERROR
   * @param {string} message - Message
   * @param {object} meta - Métadonnées
   * @returns {void}
   */
  error(message, meta = {}) {
    if (logLevels[this.level] >= logLevels.ERROR) {
      console.error(JSON.stringify(this.formatMessage("ERROR", message, meta)));
    }
  }

  /**
   * @bref Log en WARN
   * @param {string} message - Message
   * @param {object} meta - Métadonnées
   * @returns {void}
   */
  warn(message, meta = {}) {
    if (logLevels[this.level] >= logLevels.WARN) {
      console.warn(JSON.stringify(this.formatMessage("WARN", message, meta)));
    }
  }

  /**
   * @bref Log en INFO
   * @param {string} message - Message
   * @param {object} meta - Métadonnées
   * @returns {void}
   */
  info(message, meta = {}) {
    if (logLevels[this.level] >= logLevels.INFO) {
      console.log(JSON.stringify(this.formatMessage("INFO", message, meta)));
    }
  }

  /**
   * @bref Log en DEBUG
   * @param {string} message - Message
   * @param {object} meta - Métadonnées
   * @returns {void}
   */
  debug(message, meta = {}) {
    if (logLevels[this.level] >= logLevels.DEBUG) {
      console.log(JSON.stringify(this.formatMessage("DEBUG", message, meta)));
    }
  }
}

export default new Logger();
