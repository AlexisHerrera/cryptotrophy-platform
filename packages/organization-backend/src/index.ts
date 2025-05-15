import { connectDB, seedData, sequelize } from './config/database';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import challengesRoutes from './routes/ChallengeRoutes';
import campaignRoutes from "./routes/CampaignRoutes";
import clientRoutes from "./routes/ClientRoutes";

const app: Express = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(
    '/api/challenges',
    cors({
        origin: '*',
        methods: ['GET', 'POST'],
    }),
);

app.use('/api/campaigns', campaignRoutes);
app.use('/api/clients',    clientRoutes);
app.use('/api/challenges', challengesRoutes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server is running!');
});
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
    try {
        await connectDB();
        await sequelize.sync({ alter: true });
        await seedData();
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

void startServer();
