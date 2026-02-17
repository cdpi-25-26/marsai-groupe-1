import * as bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

/**
 * @bref Hash un mot de passe avec bcrypt
 * @param {string} password - Mot de passe en clair
 * @returns {Promise<string>} Hash bcrypt
 */
async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * @bref Compare un mot de passe en clair avec un hash bcrypt
 * @param {string} password - Mot de passe en clair
 * @param {string} encryptedPassword - Hash bcrypt
 * @returns {Promise<boolean>} True si match, sinon false
 */
async function comparePassword(password, encryptedPassword) {
  return bcrypt.compare(password, encryptedPassword);
}

export { hashPassword, comparePassword };
