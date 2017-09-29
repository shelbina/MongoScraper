// Node Dependencies
var express = require('express');
var path = require('path');
var request = require('request'); // for web-scraping
var cheerio = require('cheerio'); // for web-scraping

// Initialize Express
var app = express();

// Import the Comment and Article models
var Comment = require('../models/comment.js');
var Article = require('../models/article.js');

// Index Page Render
app.get('/', function (req, res){
      // Scrape data
      res.redirect('/scrape');
    });

    // Articles Page Render, Query MongoDB, load comments
    app.get('/articles', function (req, res){
      Article.find().sort({_id: -1})
        .populate('comments')
        .exec(function(err, doc){
          if (err){
            console.log(err);
          } 
          else {
            var hbsObject = {articles: doc}
            res.render('index', hbsObject);
          }
        });
    });
    // Web Scrape Route
    app.get('/scrape', function(req, res) {
      request('http://www.bbc.com/news', function(error, response, html) {
        var $ = cheerio.load(html);
        // error handler for  duplicate articles
        var titlesArray = [];
        $(".gs-c-promo").each(function(i, element) {
            var result = {};
            result.title = $(this).children("h3").text();
            result.link = "http://www.bbc.com"+ $(this).children('h3').children('a').attr('href');
            result.summary = $(this).children('div').text();
            if(result.title !== "" &&  result.summary !== ""){
    
              // filter duplicates within a scrape
              if(titlesArray.indexOf(result.title) == -1){
                titlesArray.push(result.title);
                Article.count({ title: result.title}, function (err, test){
                   if(test == 0){
                    var entry = new Article (result);
                    entry.save(function(err, doc) {
                      if (err) {
                        console.log(err);
                      } 
                      else {
                        console.log(doc);
                      }
                    });
    
                  }
                });
            }
            else{
              console.log('Same BBC Content. Not Saved to DB.')
            }
          }
        });
        res.redirect("/articles");
      });
    });
    // Add a Comment Route
    app.post('/add/comment/:id', function (req, res){
      var articleId = req.params.id;
      var commentAuthor = req.body.name;
      var commentContent = req.body.comment;
      var result = {
        author: commentAuthor,
        content: commentContent
      };
      var entry = new Comment (result);
      entry.save(function(err, doc) {
        if (err) {
          console.log(err);
        } 
        else {
          Article.findOneAndUpdate({'_id': articleId}, {$push: {'comments':doc._id}}, {new: true})
          .exec(function(err, doc){
            if (err){
              console.log(err);
            } else {
              res.sendStatus(200);
            }
          });
        }
      });
    });
    // Delete a Comment Route
    app.post('/remove/comment/:id', function (req, res){
      var commentId = req.params.id;
      Comment.findByIdAndRemove(commentId, function (err, todo) {  
        if (err) {
          console.log(err);
        } 
        else {
          res.sendStatus(200);
        }
      });  
    });
    // Export Router to Server.js
    module.exports = app;