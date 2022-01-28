var express = require('express');
const sauce = require("../models/sauce");
var app = express();
app.get('/api/sauces', (req, res, next) => {
  const sauces = [
    {
      userId: "",
      name: "",
      manufacturer: "",
      description: "",
      mainPepper: "",
      imageUrl: "",
      heat: "",
      likes: "",
      dislikes: "",
      usersLiked: [""],
      usersDisliked: [""],
    }]
  res.status(200).json(sauces);
});
