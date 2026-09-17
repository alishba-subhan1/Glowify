const { app, connectDatabase } = require("../src/index");

module.exports = async function handler(req, res) {
  const allowedOrigin = process.env.CLIENT_URL || "https://client-three-indol-85.vercel.app";
  const requestOrigin = req.headers.origin;
  if (requestOrigin === allowedOrigin) {
    res.setHeader("Access-Control-Allow-Origin", requestOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  }
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }
  await connectDatabase();
  return app(req, res);
};