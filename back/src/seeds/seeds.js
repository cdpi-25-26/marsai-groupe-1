/**
 * @bref Seeds de base - Users et Configuration
 * Crée les utilisateurs de test (ADMIN, JURY, REALISATEUR) et la configuration de soumission
 */

import "dotenv/config";
import sequelize from "../db/connection.js";
import "../models/index.js";
import { User, SubmissionConfig } from "../models/index.js";
import { hashPassword } from "../utils/password.js";

/**
 * @bref Fonction principale de seeding
 * @returns {Promise<void>}
 */
async function seed() {
  try {
    await sequelize.authenticate();
    console.log("✅ Connexion BDD OK");

    /**
     * @bref Création des utilisateurs de test
     * Crée 1 ADMIN, 2 JURY et 3 REALISATEUR avec mots de passe hashés
     */
    const users = await User.bulkCreate([
      {
        email: "admin@marsai.fr",
        username: "Admin",
        password: await hashPassword("admin123"),
        role: "ADMIN",
        country: "FR",
        biography: "Administrateur de la plateforme marsAI",
      },
      {
        email: "jury1@marsai.fr",
        username: "Jury Member 1",
        password: await hashPassword("jury123"),
        role: "JURY",
        country: "FR",
      },
      {
        email: "jury2@marsai.fr",
        username: "Jury Member 2",
        password: await hashPassword("jury123"),
        role: "JURY",
        country: "BE",
      },
      {
        email: "realisateur1@marsai.fr",
        username: "Réalisateur Test",
        password: await hashPassword("real123"),
        role: "REALISATEUR",
        country: "FR",
        biography: "Réalisateur passionné par l'IA et le cinéma",
      },
      {
        email: "realisateur2@marsai.fr",
        username: "Réalisateur 2",
        password: await hashPassword("real123"),
        role: "REALISATEUR",
        country: "BE",
        biography: "Réalisateur belge spécialisé en animation IA",
      },
      {
        email: "realisateur3@marsai.fr",
        username: "Réalisateur 3",
        password: await hashPassword("real123"),
        role: "REALISATEUR",
        country: "CH",
        biography: "Réalisateur suisse explorant les nouvelles technologies",
      },
    ], { ignoreDuplicates: true });

    console.log(`✅ ${users.length} utilisateurs créés`);

    /**
     * @bref Configuration de la période de soumission
     * Définit une période ouverte (30 jours avant et après la date actuelle)
     */
    const now = new Date();
    const opensAt = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // Il y a 30 jours
    const closesAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000); // Dans 30 jours

    await SubmissionConfig.bulkCreate([
      {
        key: "submission_opens_at",
        value: opensAt.toISOString(),
        description: "Date d'ouverture des soumissions",
      },
      {
        key: "submission_closes_at",
        value: closesAt.toISOString(),
        description: "Date de fermeture des soumissions",
      },
    ], { ignoreDuplicates: true });

    console.log("✅ Configuration de soumission créée");
    console.log(`   Ouverture: ${opensAt.toLocaleDateString("fr-FR")}`);
    console.log(`   Fermeture: ${closesAt.toLocaleDateString("fr-FR")}`);

    console.log("\n🎉 Seeds de base terminés !");
    console.log("\n📝 Comptes créés:");
    console.log("   Admin: admin@marsai.fr / admin123");
    console.log("   Jury: jury1@marsai.fr / jury123");
    console.log("   Réalisateurs: realisateur1@marsai.fr / real123");
  } catch (error) {
    console.error("❌ Erreur lors du seeding:", error);
    throw error;
  } finally {
    await sequelize.close();
  }
}

seed();
