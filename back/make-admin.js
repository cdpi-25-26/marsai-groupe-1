import { configDotenv } from "dotenv";
configDotenv();

import User from "./src/models/User.js";

const email = process.argv[2];

if (!email) {
  console.log("Usage : node make-admin.js <email>");
  process.exit(1);
}

try {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    console.log(`Utilisateur avec l'email "${email}" non trouvé.`);
    process.exit(1);
  }

  user.role = "ADMIN";
  await user.save();
  console.log(`${user.username} (${email}) est maintenant ADMIN.`);
  process.exit(0);
} catch (err) {
  console.error("Erreur :", err.message);
  process.exit(1);
}
