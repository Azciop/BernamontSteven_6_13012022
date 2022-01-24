const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true, ref: "User"},
  name: { type: String, required: true, trim: true, minlength: 2},
  manufacturer: { type: String, required: true, trim: true, minlength: 2},
  description: { type: String, required: true, trim: true, minlength: 2},
  mainPepper: { type: String, required: true, trim: true, minlength: 2},
  imageUrl: { type: String, required: true, trim: true, minlength: 2},
  heat: { type: Number, required: true},
  likes: { type: Number, required: true},
  dislikes: { type: Number, required: true},
  usersLiked: [{ type: String, required: true, ref: "User"}],
  usersDisliked: [{ type: String, required: true, ref: "User"}],
});

module.exports = mongoose.model('Sauce', sauceSchema);