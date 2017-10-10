//Dependencies
var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var logger = require('morgan');
var request = require('request');
var cheerio = require('cheerio');
var Comment = require('./models/Comment.js');
var Article = require('./models/Article.js');
mongoose.Promise;
var app = express();

app.use(logger('dev'));
app.use(bodyParser.urlencoded({
  extended: false
}));

app.use(express.static('public'));

var exphbs = require('express-handlebars');
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({defaultLayout: 'main'}));

//Configure MongoDB
mongoose.connect('mongodb://heroku_r1mcc7hs:rkabgv3c54830uco5qhub8fpl0@ds149134.mlab.com:49134/heroku_r1mcc7hs');
var db = mongoose.connection;

db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

db.once('open', function() {
  console.log('Mongoose connection successful.');
});

//List Routes
app.get("/", function (req, res) {
  Article.find({})
    .sort({ dateCreated: 1 })
    .exec(function (error, doc) {
      if (error) {
        console.log("Error retrieving from db:", error);
      }
      else {
        var hbObject = {
          articles: doc
        }
        res.render('index', hbObject);
      }
    });
});

// Scrape
app.get('/scrape', function (req, res) {
  request('http://www.bbc.com/news', function (error, response, html) {
    if (error) {
      console.log("Request error:", error);
    }
    var $ = cheerio.load(html);
    $('.gs-c-promo-heading').each(function (i, element) {
      var result = {};
      result.title = $(this).children('h3').text().trim() + "";    
      result.link = 'http://www.bbc.com/news' + $(this).children('h3').children('a').attr('href').trim();
      result.summary = $(this).children('div').text().trim() + "";
      Article.update({ title: result.title }, result, { new: true, upsert: true, setDefaultsOnInsert: true }, function (err, doc) {
      });
    });
    res.redirect("/");
  });
});

// Add an article to, or remove from, "saved" list
app.post("/save/:route/:id", function (req, res) {
  if (req.params.route === "index") {
    req.params.route = "";
  }
  Article.findOneAndUpdate({ "_id": req.params.id }, { "saved": req.body.saved })
    .exec(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log('doc', doc)
        res.redirect('/' + req.params.route);
      }
    })
});

// Render "Saved" list
app.get("/saved", function (req, res) {
  Article.find({ "saved": true })
    .populate("comments")
    .sort({dateCreated: 1})
    .exec(function (err, doc) {
      if (err) {
        console.log(err);
      } else {
        console.log(doc);
        var hbObject = {
          articles: doc
        }
        console.log('hbObject:', hbObject);
        res.render('saved', hbObject);
      }
    });
});

// Create comment 
app.post("/comment/:id", function (req, res) {
  var newComment = new Comment(req.body);
  newComment.save(function (error, doc) {
    if (error) {
      console.log(error);
    }
    else {
      Article.findOneAndUpdate({ "_id": req.params.id }, {$push: { "comments": doc._id }}, {new: true})
        .exec(function (err, doc) {
          if (err) {
            console.log(err);
          }
          else {
            res.redirect('/saved');
          }
        });
    }
  });
});

//Connect to Port
var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Running on port: ' + port);
});
