var express = require('express');
var exphbs = require('express-handlebars');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var request = require('request');
var cheerio = require('cheerio');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(express.static(process.cwd() + '/public'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

if(process.env.NODE_ENV == 'production'){
  mongoose.connect('mongodb://heroku_r1mcc7hs:rkabgv3c54830uco5qhub8fpl0@ds149134.mlab.com:49134/heroku_r1mcc7hs');
}
else{
  mongoose.connect('mongodb://localhost/mongoscraper');
 }
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

db.once('open', function() {
  console.log('Mongoose connection successful.');
});

var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');

var router = require('./controllers/controller.js');
app.use('/', router);

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Running on port: ' + port);
});
