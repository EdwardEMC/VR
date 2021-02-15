const express = require("express");

// Sets up the Express App
// =============================================================
const app = express();
const PORT = process.env.PORT || 8080;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

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