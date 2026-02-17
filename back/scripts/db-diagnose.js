/**
 * @bref Diagnostic des index MySQL (erreur "Too many keys specified")
 * @returns {Promise<void>}
 */

import sequelize from "../src/db/connection.js";
import "../src/models/index.js";

/**
 * @bref Affiche le nombre d'index par table, puis le détail de la pire table.
 * @returns {Promise<void>}
 */
async function main() {
  const dbName = process.env.DB_NAME;
  if (!dbName) {
    console.error("DB_NAME manquant dans l'environnement.");
    process.exit(1);
  }

  await sequelize.authenticate();

  const [tables] = await sequelize.query(
    `
    SELECT
      TABLE_NAME AS tableName,
      COUNT(DISTINCT INDEX_NAME) AS indexCount
    FROM information_schema.statistics
    WHERE table_schema = :dbName
    GROUP BY TABLE_NAME
    ORDER BY indexCount DESC, TABLE_NAME ASC;
    `,
    { replacements: { dbName } }
  );

  console.log("Index par table (top 20):");
  console.table(tables.slice(0, 20));

  const worst = tables[0];
  if (!worst) {
    console.log("Aucune table trouvée dans ce schéma.");
    process.exit(0);
  }

  const [detail] = await sequelize.query(
    `
    SELECT
      INDEX_NAME AS indexName,
      NON_UNIQUE AS nonUnique,
      GROUP_CONCAT(COLUMN_NAME ORDER BY SEQ_IN_INDEX) AS columns
    FROM information_schema.statistics
    WHERE table_schema = :dbName
      AND table_name = :tableName
    GROUP BY INDEX_NAME, NON_UNIQUE
    ORDER BY INDEX_NAME ASC;
    `,
    { replacements: { dbName, tableName: worst.tableName } }
  );

  console.log(`\nDétail des index pour la table la plus "chargée": ${worst.tableName} (${worst.indexCount} index)`);
  console.table(detail);

  await sequelize.close();
}

main().catch((err) => {
  console.error("Erreur db-diagnose:", err?.message || err);
  process.exit(1);
});

