import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import enrollRoutes from './routes/enrollments';
import adminRoutes from './routes/admin';

dotenv.config();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/enrollments', enrollRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (_req, res) => res.json({ ok: true, name: 'Learning API' }));

app.listen(process.env.PORT || 4000, () => {
  console.log(`✅ Server: http://localhost:${process.env.PORT || 4000}`);
});