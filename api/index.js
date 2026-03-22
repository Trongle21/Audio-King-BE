import express, { json } from 'express';
import connect from '../configs/db/index.js';
import routes from '../routes/index.js';

const app = express();

connect();

app.use(json());

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
