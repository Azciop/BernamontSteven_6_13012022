const bcrypt = require("bcrypt");
const User = require("../models/user");
const jwt = require("jsonwebtoken");
const user = require("../models/user");
const Sauce = require("../models/sauce");

// Importing the filesystem module

const fs = require("fs");

// making the sign up function
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

// making the log in function
exports.login = (req, res, next) => {
	// using findOne to find the user
	User.findOne({ email: req.body.email })
		.then(user => {
			if (!user) {
				return res.status(401).json({ error: "Utilisateur non trouvé !" });
			}
			bcrypt

				// checking if the two passwords matches. If not, send error message
				.compare(req.body.password, user.password)
				.then(valid => {
					if (!valid) {
						return res.status(401).json({ error: "Mot de passe incorrect !" });
					}
					res.status(200).json({
						// if passwords matches, creat random secret token for a duration of 24h, and log in
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

//
// RGPD
//

// find user and send infos in JSON
exports.readUser = (req, res, next) => {
	// using FindONe to find the user
	User.findOne({ userId: req.auth.userId })
		.then(user => {
			// if user does not match, send error message
			if (!user) {
				return res.status(404).json({ error: "User not found!" });
			}
			// send user infos as json
			res.status(200).json(user);
		})
		.catch(error => {
			res.status(404).send({ error });
		});
};

// find user and send infos in txt
exports.exportUser = (req, res, next) => {
	// Using findOne to find the user
	User.findOne({ userId: req.auth.userId }).then(user => {
		// if user does not match, send error message
		if (!user) {
			return res.status(404).json({ error: "User not found !" });
		}
		// stringify user infos as txt file
		const string = user.toString();

		res.attachment("data.txt");
		res.type("txt");
		// send text file to user
		return res.status(200).send(string);
	});
};

// update user infos
exports.updateUser = async (req, res, next) => {
	// making an empty object to store future infos
	const update = {};
	// making the password change
	if (req.body.password) {
		// Hashing the password
		const hash = await bcrypt.hash(req.body.password, 10);
		//changing the password
		update.password = hash;
	}
	// Making the email change
	if (req.body.email) {
		// changing the  email
		update.email = req.body.email;
	}
	// using the findOneAndUpdate function to update the desired change
	User.findOneAndUpdate({ userId: req.auth.userId }, update)
		.then(user => {
			// if user not found, send error message
			if (!user) {
				return res.status(404).json({ error: "User not found !" });
			}
			// else, sending the confirmation message and update the user's infos
			res.status(201).json({ message: "user updated" });
		})
		.catch(error => res.status(400).json({ error }));
};

// delete the user
exports.deleteUser = (req, res, next) => {
	// using the findOneAndDelete function to delete the desired user
	User.findOneAndDelete({ userId: req.auth.userId })
		.then(user => {
			// if user not found, send error message
			if (!user) {
				return res.status(404).json({ error: "User not found !" });
			}
			// else, delete the user
			res.status(204).send();
		})
		.catch(error => res.status(400).json({ error }));
};

// report the user
exports.reportUser = (req, res, next) => {
	// using the findOneAndUpdate function to add a report on a user
	User.findOneAndUpdate(
		{ _id: req.params.id },
		{
			// using the $inc method to add a report
			$inc: { report: 1 },
			// using the $push method to send the user id of the user who reported
			$push: { whoReported: req.auth.userId },
		}
	)
		.then(user => {
			if (!user) {
				// if user not found, send error message
				return res.status(404).json({ error: "User not found !" });
			} // else, report the user and send message
			res.status(200).json({ message: "user reported" });
		})
		.catch(error => res.status(400).json({ error }));
};
