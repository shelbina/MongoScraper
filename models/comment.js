var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var CommentSchema = new Schema({
  author: {
    type: String
  },
  content: {
    type: String
  }
});

var comment = mongoose.model('comment', CommentSchema);

module.exports = comment;