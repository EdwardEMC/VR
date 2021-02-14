// Routes
// =============================================================
module.exports = function(app) {
  // login route loads login and registration module for existing and new users
  app.get("/", function(req, res) {
    res.render("vr-player");
  });
};