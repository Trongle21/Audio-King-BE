import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const token = req.headers.token;
  if (token) {
    const accessToken = token.split(" ")[1];
    if (accessToken) {
      jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN, (err, user) => {
        if (err) {
          return handleError403(res, "Token không hợp lệ");
        } else {
          req.user = user;
          next();
        }
      });
    }
  } else {
    return handleError401(res, "Bạn chưa đăng nhập");
  }
};

const verifyAuth = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user.role === "admin") {
      next();
    } else {
      return handleError403(res, "Bạn không có quyền truy cập");
    }
  });
};

export { verifyToken, verifyAuth };
