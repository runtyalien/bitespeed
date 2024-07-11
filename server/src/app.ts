import express from 'express';
import bodyParser from 'body-parser';
import contactRoutes from './routes/contactRoutes';
import pool from './utils/database';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.use(cors({
  origin: 'https://omkar-bitespeed-frontend.vercel.app',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
  optionsSuccessStatus: 204
}));


const port = process.env.PORT || 4000;

app.use(bodyParser.json());

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  console.log('Body:', req.body);
  next();
});

// Log all responses
app.use((req, res, next) => {
  const oldSend = res.send.bind(res);
  res.send = function (data: any) {
    console.log('Response:', data);
    return oldSend(data); 
  };
  next();
});

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the API');
});

app.use('/api', contactRoutes);

app.listen(port, async () => {
  console.log(`Server is running on port ${port}`);

  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Database connected:', res.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Database connection error:', err.stack);
    } else {
      console.error('Unexpected error:', err);
    }
  }
});

