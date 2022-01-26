const sauce = require ("../models/sauce")

app.get('/api/sauces', (req, res, next) => {
    const sauces = [
      { userId: "",
      name: "",
      manufacturer: "",
      description: "",
      mainPepper: "",
      imageUrl: "",
      heat: "",
      likes: "0",
      dislikes: "0",
      usersLiked: [""],
      usersDisliked: [""],
      }]
    res.status(200).json(sauces);
  });
  