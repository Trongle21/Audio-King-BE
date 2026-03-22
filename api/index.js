import express, { json } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connect from '../configs/db/index.js';
import routes from '../routes/index.js';

const app = express();

connect();

const allowedOrigins = [
  'http://localhost:3000',
  'https://audio-king-fe.vercel.app',
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(json());
app.use(cookieParser());

routes(app);

app.use((_req, res) => {
  return res.status(404).json({
    message: 'Router not found',
  });
});

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
