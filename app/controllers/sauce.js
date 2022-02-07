const Sauce = require("../models/sauce");

exports.readOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      sauce.imageUrl = `${req.protocol}://${req.get("host") + sauce.imageUrl}`
      res.status(200).json(sauce)
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => {
      sauces = sauces.map((sauce) => {
        sauce.imageUrl = `${req.protocol}://${req.get("host") + sauce.imageUrl}`
        return sauce
      })
      res.status(200).json(sauces)
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.rateSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => {
      switch (req.body.like) {
        case 1:
          if (!sauce.usersLiked.includes(req.body.userId)) {
            let toChange = {
              $inc: { likes: +1 },
              $push: { usersLiked: req.body.userId },
            }
            if (sauce.usersDisliked.includes(req.body.userId)) {
              toChange = {
                $inc: { likes: +1, dislikes: -1 },
                $push: { usersLiked: req.body.userId },
                $pull: { usersDisliked: req.body.userId }
              }
            }
            Sauce.updateOne(
              { _id: req.params.id }, toChange)
              .then((sauce) => res.status(200).json({ message: "Liked !" }))
              .catch((error) => res.status(400).json({ error }));
          }
          else {
            res.status(304).json()
          }
          break;
        case -1:
          if (!sauce.usersDisliked.includes(req.body.userId)) {
            let toChange = {
              $inc: { dislikes: req.body.like++ * -1 },
              $push: { usersDisliked: req.body.userId },
            }
            if (sauce.usersLiked.includes(req.body.userId)) {
              toChange = {
                $inc: { likes: -1, dislikes: +1 },
                $push: { usersDisliked: req.body.userId },
                $pull: { usersLiked: req.body.userId }
              }
            }
            Sauce.updateOne(
              { _id: req.params.id }, toChange)
              .then((sauce) =>
                res.status(200).json({ message: "Disliked !" })
              )
              .catch((error) => res.status(400).json({ error }));
          }
          else {
            res.status(304).json()
          }
          break;
        case 0:
          Sauce.findOne({ _id: req.params.id })
            .then((sauce) => {
              if (sauce.usersLiked.includes(req.body.userId)) {
                Sauce.updateOne(
                  { _id: req.params.id },
                  { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
                )
                  .then((sauce) => {
                    res.status(200).json({ message: "Sauce unliked" });
                  })
                  .catch((error) => res.status(400).json({ error }));
              } else if (sauce.usersDisliked.includes(req.body.userId)) {
                Sauce.updateOne(
                  { _id: req.params.id },
                  {
                    $pull: { usersDisliked: req.body.userId },
                    $inc: { dislikes: -1 },
                  })
                  .then((sauce) => {
                    res.status(200).json({ message: "Sauce undisliked !" });
                  })
                  .catch((error) => res.status(400).json({ error }));
              }
              else {
                res.status(304).json()
              }
            })
            .catch((error) => res.status(400).json({ error }));

          break;
          ;
      }
    })
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `/images/${req.file.filename}`
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'New sauce saved !' }))
    .catch(error => res.status(400).json({ error }));
};