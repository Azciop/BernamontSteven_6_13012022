const Sauce = require("../models/sauce");

exports.readOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then((sauce) => res.status(200).json(sauce))
    .catch((error) => res.status(404).json({ error }));
};

exports.readAllSauces = (req, res, next) => {
  Sauce.find()
    .then((sauces) => res.status(200).json(sauces))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateSauce = (req, res, next) => {

};

exports.createSauce = (req, res, next) => {
  console.log(req.body)
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