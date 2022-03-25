// Importing bcrypt to hash passwords
const bcrypt = require("bcrypt");

// Importing jwt to make tokens
const jwt = require("jsonwebtoken");

// Importing the models
const User = require("../models/user");

// importing the dotenv file
const dotenv = require("dotenv");
const result = dotenv.config();
require("dotenv").config();

const CryptoJS = require("crypto-js");

// Importing express
var express = require("express");
var app = express();

// Importing hateoas module
var hateoasLinker = require("express-hateoas-links");

// replace standard express res.json with the new version
app.use(hateoasLinker);

// Making a function to encrypt the email
function encryptEmail(email) {
	return CryptoJS.AES.encrypt(
		email,
		CryptoJS.enc.Base64.parse(process.env.PASSPHRASE),
		{
			iv: CryptoJS.enc.Base64.parse(process.env.IV),
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7,
		}
	).toString();
}

// Making a function to decrypt the email
function decryptEmail(email) {
	var bytes = CryptoJS.AES.decrypt(
		email,
		CryptoJS.enc.Base64.parse(process.env.PASSPHRASE),
		{
			iv: CryptoJS.enc.Base64.parse(process.env.IV),
			mode: CryptoJS.mode.ECB,
			padding: CryptoJS.pad.Pkcs7,
		}
	);
	return bytes.toString(CryptoJS.enc.Utf8);
}

function emailValidator(email) {
	const reg =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return reg.test(String(email).toLowerCase());
}

// making the signup function
exports.signup = (req, res, next) => {
	if (!emailValidator(req.body.email)) {
		return res.status(400).json({ error: "invalid email" });
	}
	// making the email encrypting function
	bcrypt
		.hash(req.body.password, 10)
		.then(hash => {
			// we get the encrypted email and we creat the user object
			const emailEncrypted = encryptEmail(req.body.email);
			const user = new User({
				email: emailEncrypted,
				password: hash,
			});
			user
				.save()
				.then(result => {
					// we get the email to send it to the hateoas
					result.email = req.body.email;
					res
						.status(201)
						.json(
							{ message: " User Created !", data: result },
							hateoasLinks(req, result._id)
						);
				})
				.catch(error => res.status(400).json({ error }));
		})
		.catch(error => res.status(500).json(console.log(error)));
};

// making the login function
exports.login = (req, res, next) => {
	// we get the encrypted email
	const emailCryptoJS = encryptEmail(req.body.email);
	// using findOne to find the user
	User.findOne({ email: emailCryptoJS })
		.then(user => {
			if (!user) {
				return res.status(401).json({ error: " User not found !" });
			}
			bcrypt
				// checking if the two passwords matches. If not, send error message
				.compare(req.body.password, user.password)
				.then(valid => {
					if (!valid) {
						return res.status(401).json({ error: "Wrong password !" });
					}
					res.status(200).json(
						{
							// if passwords matches, creat random secret token for a duration of 24h, and log in
							userId: user._id,
							token: jwt.sign({ userId: user._id }, "RANDOM_TOKEN_SECRET", {
								expiresIn: "24h",
							}),
						},
						hateoasLinks(req, user._id)
					);
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
	User.findOne({ _id: req.auth.userId })
		.then(user => {
			// if user does not match, send error message
			if (!user) {
				return res.status(404).json({ error: "User not found!" });
			}
			user.email = decryptEmail(user.email);
			// send user infos as json
			res.status(200).json(user, hateoasLinks(req, user.id));
		})
		.catch(error => {
			res.status(404).send(console.log(error));
		});
};

// find user and send infos in txt
exports.exportUser = (req, res, next) => {
	// Using findOne to find the user
	User.findOne({ _id: req.auth.userId }).then(user => {
		// if user does not match, send error message
		if (!user) {
			return res.status(404).json({ error: "User not found !" });
		}
		user.email = decryptEmail(user.email);
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
		if (!emailValidator(req.body.email)) {
			return res.status(400).json({ error: "invalid email" });
		}
		// changing the  email
		update.email = encryptEmail(req.body.email);
	}
	// using the findOneAndUpdate function to update the desired change
	User.findOneAndUpdate({ _id: req.auth.userId }, update)
		.then(user => {
			// if user not found, send error message
			if (!user) {
				return res.status(404).json({ error: "User not found !" });
			}
			// else, sending the confirmation message and update the user's infos
			res
				.status(201)
				.json(
					{ message: "user updated", data: user },
					hateoasLinks(req, user._id)
				);
		})
		.catch(error => res.status(400).json({ error }));
};

// delete the user
exports.deleteUser = (req, res, next) => {
	// using the findOneAndDelete function to delete the desired user
	User.findOneAndDelete({ _id: req.auth.userId })
		.then(user => {
			// if user not found, send error message
			if (!user) {
				return res.status(404).json({ error: "User not found !" });
			}
			// else, delete the user
			res.send({ message: "user has been deleted" });
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
			res
				.status(200)
				.json({ message: "user reported" }, hateoasLinks(req, user._id));
		})
		.catch(error => res.status(400).json({ error }));
};

// HATEOAS Links

function hateoasLinks(req, id) {
	const baseUri = `${req.protocol}://${req.get("host")}`;

	return [
		{
			rel: "signup",
			method: "POST",
			title: "Create an user",
			href: baseUri + "/api/auth/signup",
		},
		{
			rel: "login",
			method: "POST",
			title: "Login an user",
			href: baseUri + "/api/auth/login",
		},
		{
			rel: "read",
			method: "GET",
			title: "Read user's data",
			href: baseUri + "/api/auth/read",
		},
		{
			rel: "export",
			method: "GET",
			title: "Export user's data",
			href: baseUri + "/api/auth/export",
		},
		{
			rel: "update",
			method: "PUT",
			title: "Update user's data",
			href: baseUri + "/api/auth/",
		},
		{
			rel: "delete",
			method: "DELETE",
			title: "Delete user's data",
			href: baseUri + "/api/auth/",
		},
		{
			rel: "report",
			method: "POST",
			title: "Report a user",
			href: baseUri + "/api/auth/report/" + id,
		},
	];
}
