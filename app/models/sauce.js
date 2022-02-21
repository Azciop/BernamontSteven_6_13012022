const mongoose = require('mongoose');

const sauceSchema = mongoose.Schema({
  userId: { type: String, required: true, ref: "User"},
  name: { type: String, required: true, trim: true, minlength: 2},
  manufacturer: { type: String, required: true, trim: true, minlength: 2},
  description: { type: String, required: true, trim: true, minlength: 2},
  mainPepper: { type: String, required: true, trim: true, minlength: 2},
  imageUrl: { type: String, required: true, trim: true},
  heat: { type: Number, required: true},
  likes: { type: Number, default: 0},
  dislikes: { type: Number, default: 0},
  usersLiked: [{ type: String, ref: "User"}],
  usersDisliked: [{ type: String, ref: "User"}],
  report: { type: Number, default: 0},
  whoReported: [{ type: String, ref: "User"}],
});

module.exports = mongoose.model('Sauce', sauceSchema);