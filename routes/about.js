import authRouter from './auth.js';
import userRouter from './user.js';
import categoryRouter from './category.js';
import productRouter from './product.js';
import orderRouter from './order.js';
import trendingRouter from './trending.js';

const routes = app => {
  app.use('/api/auth', authRouter);
  app.use('/api/users', userRouter);
  app.use('/api/categories', categoryRouter);
  app.use('/api/products', productRouter);
  app.use('/api/orders', orderRouter);
  app.use('/api/trending', trendingRouter);
};

export default routes;
