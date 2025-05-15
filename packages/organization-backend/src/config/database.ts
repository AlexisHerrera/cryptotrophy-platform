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

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
    host: dbHost,
    dialect: 'postgres',
    logging: console.log,
});

export async function seedData() {
    const { Campaign } = await import('../models/Campaign');
    const { Client }   = await import('../models/Client');
    await Campaign.findOrCreate({
        where: { id_campaign: 0 },
        defaults: {
            campaign_name: 'Initial Campaign',
            start_date: new Date(),
            end_date: new Date(Date.now() + 7 * 24*60*60*1000),
        },
    });

    await Client.findOrCreate({
        where: { id_client: 0 },
        defaults: {
            wallet_address: '0x6875548D549dB2D6D99B29E0BA6ea7f7C53739D1',
            name: 'Alexis',
        },
    });
}

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