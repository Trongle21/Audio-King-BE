import authRouter from "./auth.js";

const routes = (app) => {
  app.use("/api/auth", authRouter);
};

export default routes;
