// getting the sauce model's file
const Sauce = require("../models/sauce");

const fs = require("fs");

// making a function and an export to find a specific sauce
exports.readOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      sauce.imageUrl = `${req.protocol}://${req.get("host") + sauce.imageUrl}`;
      res.status(200).json(sauce);
    })
    .catch(error => res.status(404).json({ error }));
};

// making a function and an export to read every sauces
exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => {
      sauces = sauces.map(sauce => {
        sauce.imageUrl = `${req.protocol}://${req.get("host") + sauce.imageUrl
          }`;
        return sauce;
      });
      res.status(200).json(sauces);
    })
    .catch(error => res.status(400).json({ error }));
};

// making a function using a switch to make the like system functionnal
exports.rateSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id }).then(sauce => {
    switch (req.body.like) {
      //   case one, we add a like by using a push method
      case 1:
        if (!sauce.usersLiked.includes(req.body.userId)) {
          let toChange = {
            $inc: { likes: +1 },
            $push: { usersLiked: req.body.userId },
          };
          if (sauce.usersDisliked.includes(req.body.userId)) {
            // if user wants to change his dislike to put a like, we push the like and we pull out the dislike
            toChange = {
              $inc: { likes: +1, dislikes: -1 },
              $push: { usersLiked: req.body.userId },
              $pull: { usersDisliked: req.body.userId },
            };
          }
          Sauce.updateOne(
            // we update the result for the like
            { _id: req.params.id },
            toChange
          )
            .then(sauce => res.status(200).json({ message: "Liked !" }))
            .catch(error => res.status(400).json({ error }));
        } else {
          res.status(304).json();
        }
        break;
      case -1:
        // case 2, we add a dislike by using the push method
        if (!sauce.usersDisliked.includes(req.body.userId)) {
          let toChange = {
            $inc: { dislikes: req.body.like++ * -1 },
            $push: { usersDisliked: req.body.userId },
          };
          if (sauce.usersLiked.includes(req.body.userId)) {
            // if the user wants to change his like to a dislike, we push the dislike and we pull out the like
            toChange = {
              $inc: { likes: -1, dislikes: +1 },
              $push: { usersDisliked: req.body.userId },
              $pull: { usersLiked: req.body.userId },
            };
          }
          Sauce.updateOne(
            // then we update the result
            { _id: req.params.id },
            toChange
          )
            .then(sauce => res.status(200).json({ message: "Disliked !" }))
            .catch(error => res.status(400).json({ error }));
        } else {
          res.status(304).json();
        }
        break;
      case 0:
        Sauce.findOne({ _id: req.params.id })
          .then(sauce => {
            // case 2, we want to take off a like or a dislike
            if (sauce.usersLiked.includes(req.body.userId)) {
              Sauce.updateOne(
                { _id: req.params.id },
                //  we use a pull method to take off a like
                { $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
              )
                .then(sauce => {
                  res.status(200).json({ message: "Sauce unliked" });
                })
                .catch(error => res.status(400).json({ error }));
            } else if (sauce.usersDisliked.includes(req.body.userId)) {
              Sauce.updateOne(
                { _id: req.params.id },
                {
                  //  we use a pull method to take off a dislike
                  $pull: { usersDisliked: req.body.userId },
                  $inc: { dislikes: -1 },
                }
              )
                .then(sauce => {
                  res.status(200).json({ message: "Sauce undisliked !" });
                })
                .catch(error => res.status(400).json({ error }));
            } else {
              res.status(304).json();
            }
          })
          .catch(error => res.status(400).json({ error }));

        break;
    }
  });
};

// we make a function and a exports to creat a new sauce
exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `/images/${req.file.filename}`,
  });
  sauce
    .save()
    .then(() => res.status(201).json({ message: "New sauce saved !" }))
    .catch(error => res.status(400).json({ error }));
};

// we make a function to update a sauce
exports.updateSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split("/images/")[1];
      if (req.file) {
        const sauceObject = {
          ...JSON.parse(req.body.sauce),
          imageUrl: `/images/${req.file.filename}`,
        };
        // We use the unlink method to delete the old picture
        fs.unlink(`images/${filename}`, () => {
          Sauce.updateOne(
            { _id: req.params.id },
            { ...sauceObject, _id: req.params.id }
          )
            .then(() =>
              res.status(200).json({ message: "Your sauce has been modified" })
            )
            .catch(error => res.status(400).json({ error }));
        });
      } else {
        Sauce.updateOne(
          { _id: req.params.id },
          { ...req.body, _id: req.params.id }
        )
          .then(() =>
            res.status(200).json({ message: "Your sauce has been modified" })
          )
          .catch(error => res.status(400).json({ error }));
      }
    })
    .catch(error => res.status(500).json({ error }));
};

// we make a function to delete a sauce

exports.deleteSauce = (req, res, next) => {
  Sauce.findOneAndDelete({ _id: req.params.id }).then(sauce => {
    const filename = sauce.imageUrl.split("/images/")[1];
    fs.unlink(`images/${filename}`, () => {
      res.status(200).json({ message: "Your sauce has been deleted" });
    }).catch(error => res.status(400).json({ error }));
  });
};
