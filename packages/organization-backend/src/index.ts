import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { connectDB } from './config/database';
import userRoutes from './routes/UserRoutes';
import challengesRoutes from './routes/ChallengesRoutes';

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
app.use('/api/challenges', challengesRoutes);

app.use('/api/users', userRoutes);

app.get('/', (req: Request, res: Response) => {
    res.status(200).send('Server is running!');
});
app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
});

const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

void startServer();
