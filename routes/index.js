import authRouter from './auth.js';
import userRouter from './user.js';
import categoryRouter from './category.js';
import productRouter from './product.js';

const routes = app => {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/products', productRouter);
};

export default routes;
