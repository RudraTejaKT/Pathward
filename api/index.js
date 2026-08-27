let app;
try {
  app = require("../backend/server");
} catch (e) {
  console.error("Critical: Failed to load backend server in serverless function:", e);
}

module.exports = (req, res) => {
  if (!app) {
    try {
      app = require("../backend/server");
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: "Serverless backend initialization error",
        error: e.message,
      });
    }
  }
  return app(req, res);
};
