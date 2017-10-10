//Dependencies
var moment = require("moment");
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ArticleSchema = new Schema({

  //Schemas
  title: {
    type: String,
    required: true
  },

  link: {
    type: String,
    required: true
  },

  summary: {
    type: String,
  },
  
  saved: {
    type: Boolean,
    default: false
  },  

  updated: {
    type: String,
    default: moment().format('MMMM Do YYYY, h:mm A')
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
});

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;