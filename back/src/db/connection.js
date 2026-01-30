import { Sequelize } from "sequelize";

<<<<<<< Updated upstream
const sequelize = new Sequelize("marsai", "root", "rootroot", {
  host: "localhost",
  port: 3306,
  dialect: "mysql",
=======
dotenv.config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  dialect:process.env.DB_DIALECT,
>>>>>>> Stashed changes
});

sequelize.sync().then(() => {
  console.log("La base de données est synchronisée.");
});

export default sequelize;
