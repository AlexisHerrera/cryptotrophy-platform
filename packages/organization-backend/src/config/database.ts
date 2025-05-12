import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbName = process.env.POSTGRES_DB as string;
const dbUser = process.env.POSTGRES_USER as string;
const dbHost = process.env.DB_HOST;
const dbPassword = process.env.POSTGRES_PASSWORD;

if (!dbName || !dbUser || !dbHost || !dbPassword) {
    console.error("Database configuration environment variables are missing!");
    process.exit(1);
}

const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    logging: console.log,
});

export const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('PostgreSQL Connection has been established successfully.');
        await sequelize.sync({ alter: true });
        console.log("All models were synchronized successfully.");
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

export default sequelize;