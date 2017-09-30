// Dependencies
var express = require("express");
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var request = require("request");
var cheerio = require("cheerio");
//Require for debugging
var logger = require('morgan');

// Initialize Express
// Use morgan and body parser
var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}))

// Serve Static Content
app.use(express.static(process.cwd() + '/public'));

// Express-Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Database Configuration with Mongoose
// Connect to localhost if not a production environment
if(process.env.NODE_ENV == 'production'){
  mongoose.connect('mongodb://heroku_r1mcc7hs:rkabgv3c54830uco5qhub8fpl0@ds149134.mlab.com:49134/heroku_r1mcc7hs');
}
else{
  mongoose.connect('mongodb://localhost/mongoscraper');
}
var db = mongoose.connection;

// Show any Mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// Once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});

// Import the Comment and Article models
var Comment = require('./models/comment.js');
var Article = require('./models/article.js');

// Import Routes/Controller
var router = require('./controllers/controller.js');
app.use('/', router);

// Launch App
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Running on port: ' + port);
});