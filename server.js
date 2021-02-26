const express = require("express");
const compression = require("compression");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Using compression npm to improve performance
app.use(compression());

// Static directory
app.use(express.static("public"));

// Redirect users to https based URL
// app.use(function(req, res, next) {
//   if ((req.get('X-Forwarded-Proto') !== 'https')) {
//     res.redirect('https://' + req.get('Host') + req.url);
//   } else
//     next();
// });

// Set Handlebars.
var exphbs = require("express-handlebars");

app.engine("handlebars", exphbs({ 
  defaultLayout: "main",
  helpers:{
    section: function(name, options){
      if(!this._sections){this._sections = {}};
      this._sections[name] = options.fn(this);
      return null;
    } 
  }
}));
app.set("view engine", "handlebars");

// Routes
// =============================================================
require("./routes/html_routes.js")(app);

// Start the server on PORT
// =============================================================
app.listen(PORT, function() {
  console.log("App listening on http://localhost:" + PORT);
});