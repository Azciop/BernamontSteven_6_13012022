const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const Sauce = require("../models/sauce");
const fs = require("fs");
exports.signup = (req, res, next) => {
	bcrypt
		.hash(req.body.password, 10)
		.then(hash => {
			const user = new User({
				email: req.body.email,
				password: hash,
			});
			user
				.save()
				.then(() => res.status(201).json({ message: "Utilisateur créé !" }))
				.catch(error => res.status(400).json({ error }));
		})
		.catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
	User.findOne({ email: req.body.email })
		.then(user => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non trouvé !" });
			}
			bcrypt
				.compare(req.body.password, user.password)
				.then(valid => {
					if (!valid) {
						return res.status(401).json({ error: "Mot de passe incorrect !" });
					}
					res.status(200).json({
						userId: user._id,
						token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
							expiresIn: "24h",
						}),
					});
				})
				.catch(error => res.status(500).json({ error }));
		})
		.catch(error => res.status(500).json({ error }));
};

// find user and send infos in JSON
exports.readUser = (req, res, next) => {
	user
		.findOne({ userId: req.auth.userId })
		.then(user => {
			if (!user) {
				return res.status(404).json({ error: "User not found!" });
			}
		})
		.catch(error => {
			res.status(404).send({ error });
		});
};

// find user and send infos in txt
exports.exportUser = (req, res, next) => {
	const userSauces = [];
	User.findOne({ userId: req.auth.userId })
		.then(user => {
			if (!user) {
				return res.status(404).json({ error: "User not found !" });
			}
			try {
				const sauces = Sauce.find({ userId: user._id });
				if (sauces.length <= 0) {
					userSauces.push("No sayces were found !");
				} else {
					userSauces.push(sauces);
				}
			} catch (error) {
				console.log(error);
			}

			const result = { ...user._doc, sauces: userSauces };

			const StringifyResults = JSON.stringify(result, null, 2);

			fs.writeFile(__dirname + "/test.txt", StringifyResults, err => {
				if (err) {
					console.log("couldn't write any files", err);
				} else {
					console.log("Successfully wrote file");
				}
			});
			return res.status(200).json(result);
		})
		.catch(error => res.status(500).json({ error }));
};

// update user infos
exports.updateUser = (req, res, next) => {
	const filter = { userId: req.auth.userId };

	const update = {};

	if (req.body.password) {
		const hash = bcrypt.hash(req.body.password, 10);

		update.password = hash;
	}

	if (req.body.email) {
		if (!validateEmail(req.body.email)) {
			return res.status(400).json({ error: "The specified email is invalid." });
		}
	}

	User.findOneAndUpdate(filter, update, {
		returnOriginal: true,
		updatedExisting: true,
	})
		.then(user => {
			res.status(201).json({ error });
		})
		.catch(error => res.status(400).json({ error }));
};

// delete the user
exports.deleteUser = (req, res, next) => {
	User.findOneAndDelete({ userId: req.auth.userId })
		.then(user => {
			if (!user) {
				return res.status(404).send({
					message: "User not found",
				});
			}
			res.send({ message: "This user has been delete !" });
		})
		.catch(err => {
			return res.status(500).send({
				message: "Error, user cant be deleted",
			});
		});
};

// report the user
exports.reportUser = (req, res, next) => {
	const currentUser = req.auth.userID;
	User.findOneAndUpdate(req.userId, {
		new: true,
		returnOriginal: true,
		updatedExisting: true,
	}).then(user => {
		if (!user) {
			return res.status(404).json({ error: new Error(" User not found ! ") });
		}

		if (user.usersAlert.indexOf(currentUser)) {
			user.usersAlert.push(currentUser);
			user.reports++;
		}
		if (!user.usersAlert.indexOf(currentUser)) {
			return res.send(" It is not possible to report yourself ");
		}

		User.updateOne({ userID: req.userID }, user)
			.then(() => {
				res.status(200).json({
					message:
						" Report sent ! ",
				});
			})
			.catch(err => {
				res.status(500).json({ err });
			});
	});
};
