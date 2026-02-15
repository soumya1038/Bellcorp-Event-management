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

const PORT = process.env.PORT || 5001;

httpServer.listen(PORT, () => {
    console.log(`listening on port:${PORT}`);

});