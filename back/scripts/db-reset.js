/**
 * @bref Reset DB (DROP tables) pour corriger les index accumulés.
 * ATTENTION: destructif (dev uniquement).
 * @returns {Promise<void>}
 */

import sequelize from "../src/db/connection.js";
import "../src/models/index.js";

/**
 * @bref Drop toutes les tables puis recrée le schéma via Sequelize.
 * @returns {Promise<void>}
 */
async function main() {
  await sequelize.authenticate();

  console.log("⚠️  Reset DB: drop de toutes les tables...");
  await sequelize.drop();

  console.log("Recréation des tables via sync({ force: true })...");
  await sequelize.sync({ force: true });

  console.log("✅ Reset DB terminé.");
  await sequelize.close();
}

main().catch((err) => {
  console.error("Erreur db-reset:", err?.message || err);
  process.exit(1);
});

