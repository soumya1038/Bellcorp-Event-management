import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import registrationRoutes from './routes/registration.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {   
    res.send('Hello World! \n Api is running...');
});

app.use('/api/auth', authRoutes);

app.use('/api/events', eventRoutes);

app.use('/api/events', registrationRoutes);

app.use('/api/dashboard', dashboardRoutes);

const parsedPort = Number.parseInt(process.env.PORT || '', 10);
const PORT = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5001;
const HOST = process.env.HOST || '0.0.0.0';

if (process.env.PORT && PORT !== parsedPort) {
    console.warn(
        `Invalid PORT value "${process.env.PORT}". Falling back to ${PORT}.`
    );
}

httpServer.listen(PORT, HOST, () => {
    console.log(`listening on http://${HOST}:${PORT}`);
});
