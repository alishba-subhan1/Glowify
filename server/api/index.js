const { app, connectDatabase } = require("../src/index");

module.exports = async function handler(req, res) {
  await connectDatabase();
  return app(req, res);
};