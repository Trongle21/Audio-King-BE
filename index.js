import express, { json } from 'express';
import connect from './configs/db/index.js';
import routes from './routes/index.js';

const { PORT = 3000 } = process.env;

connect();

const app = express();

app.use(json());

routes(app);

app.use((_req, res) => {
  return res.status(404).json({
    message: "Router not found",
  });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
