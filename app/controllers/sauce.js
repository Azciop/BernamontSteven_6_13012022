// getting the sauce model's file
const Sauce = require("../models/sauce");

// importing the filesystem module
const fs = require("fs");

// Importing the express modules
var express = require("express");
var app = express();

// importing the HATEOASlinker module
var hateoasLinker = require("express-hateoas-links");
app.use(hateoasLinker);

// making a function and an export to find a specific sauce
exports.readOneSauce = (req, res, next) => {
	// using the findOne function to find a sauce
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => {
			// then, pushing the sauce and it's image
			sauce.imageUrl = `${req.protocol}://${req.get("host") + sauce.imageUrl}`;
			res.status(200).json(sauce, hateoasLinks(req, sauce._id));
		})
		.catch(error => res.status(404).json({ error }));
};

// making a function and an export to read every sauces
exports.readAllSauces = (req, res, next) => {
	// using a find function to find every sauces available
	Sauce.find()
		.then(sauces => {
			// using a .map to make an array that includes every sauces
			sauces = sauces.map(sauce => {
				// pushing every sauces and their image
				sauce.imageUrl = `${req.protocol}://${req.get("host") + sauce.imageUrl
					}`;
				sauce.links = hateoasLinks(req, sauce._id);
				return sauce;
			});
			res.status(200).json(sauces);
		})
		.catch(error => res.status(400).json({ error }));
};

// making a function using a switch to make the like system functionnal
exports.rateSauce = (req, res, next) => {
	// using findOne function to find the sauce
	Sauce.findOne({ _id: req.params.id }).then(sauce => {
		switch (req.body.like) {
			//   case one, we add a like by using a push method
			case 1:
				// Making a if to check if user didn't liked the sauce yet
				if (!sauce.usersLiked.includes(req.body.userId)) {
					// making a object with $inc and $push methods to add a like and to add the user's id
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
					// we update the result for the like
					Sauce.updateOne({ _id: req.params.id }, toChange)
						// then we send the result and the message
						.then(sauce =>
							res
								.status(200)
								.json(
									{ message: "Liked !", data: sauce },
									hateoasLinks(req, sauce._id)
								)
						)
						.catch(error => res.status(400).json({ error }));
				} else {
					res.status(304).json();
				}
				break;
			case -1:
				// case 2, we add a dislike by using the push method
				// we check if the user has already disliked the sauce
				if (!sauce.usersDisliked.includes(req.body.userId)) {
					// making an object with $inc and $push methods to add the dislike and the user's id
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
					// then we update the result
					Sauce.updateOne({ _id: req.params.id }, toChange)
						.then(sauce =>
							res
								.status(200)
								.json(
									{ message: "Disliked !", data: sauce },
									hateoasLinks(req, sauce._id)
								)
						)
						.catch(error => res.status(400).json({ error }));
				} else {
					res.status(304).json();
				}
				break;
			case 0:
				Sauce.findOne({ _id: req.params.id })
					.then(sauce => {
						// case 3, we want to take off a like or a dislike
						if (sauce.usersLiked.includes(req.body.userId)) {
							// using the updateOne function to update the result
							Sauce.updateOne(
								{ _id: req.params.id },
								//  we use a pull method to take off a like
								{ $pull: { usersLiked: req.body.userId }, $inc: { likes: -1 } }
							)
								.then(sauce => {
									// then we send the result and the message
									res
										.status(200)
										.json(
											{ message: "Sauce unliked", data: sauce },
											hateoasLinks(req, sauce._id)
										);
								})
								.catch(error => res.status(400).json({ error }));
							// if it's a dislike, we take it off too
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
									// then we push the result
									res
										.status(200)
										.json(
											{ message: "Sauce undisliked !", data: sauce },
											hateoasLinks(req, sauce._id)
										);
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
	// making a const to store new sauce values
	const sauceObject = JSON.parse(req.body.sauce);
	delete sauceObject._id;
	// then we creat the new sauce using the cost we just created
	const sauce = new Sauce({
		...sauceObject,
		// we also get the desired image
		imageUrl: `/images/${req.file.filename}`,
	});
	sauce
		.save()
		// then we push the new sauce and we send a message
		.then(result =>
			res
				.status(201)
				.json(
					{ message: "New sauce saved !", data: result },
					hateoasLinks(req, result._id)
				)
		)
		.catch(error => res.status(400).json({ error }));
};

// we make a function to update a sauce
exports.updateSauce = (req, res, next) => {
	// Using the findOne method to find the sauce
	Sauce.findOne({ _id: req.params.id })
		.then(sauce => {
			// we make a const to find the image we want to delete in case of a image change
			const filename = sauce.imageUrl.split("/images/")[1];
			if (req.auth == sauce.userId) {
				// we make a object that contains the new values and the new image
				const sauceObject = {
					...JSON.parse(req.body.sauce),
					imageUrl: `/images/${req.file.filename}`,
				};
				// We use the unlink method to delete the old image
				fs.unlink(`images/${filename}`, () => {
					// using the updateOne function to update the values if the image has been modified
					Sauce.updateOne(
						{ _id: req.params.id },
						{ ...sauceObject, _id: req.params.id }
						)
						
						// then we send the message
						.then(sauce =>
							res
								.status(200)
								.json(
									{ message: "Your sauce has been modified", data: sauce },
									hateoasLinks(req, sauce._id)
								)
						)
						.catch(error => res.status(400).json({ error }));
				});
			} else {
				// else, we just update the new values without changing the image
				Sauce.updateOne(
					{ _id: req.params.id },
					{ ...req.body, _id: req.params.id }
				)
					// then, we send the message
					.then(sauce =>
						res
							.status(200)
							.json(
								{ message: "Your sauce has been modified", data: sauce },
								hateoasLinks(req, sauce._id)
							)
					)
					.catch(error => res.status(400).json({ error }));
			}
		})
		.catch(error => res.status(500).json({ error }));

};

// we make a function to delete a sauce
exports.deleteSauce = (req, res, next) => {
	// uding a findOneAndDelete to delete a sauce
	Sauce.findOneAndDelete({ _id: req.params.id }).then(sauce => {
		// making a const to get the image we want to delete
		const filename = sauce.imageUrl.split("/images/")[1];
		// using the unlink method to delete the image that is in the const
		fs.unlink(`images/${filename}`, () => {
			// then we send the image
			res.status(200).json({ message: "Your sauce has been deleted" });
		});
	});
};

//
// RGPD
//

// report a sauce
exports.reportSauce = (req, res, next) => {
	// using the findOneAndUpdate function to update the result
	Sauce.findOneAndUpdate(
		{ _id: req.params.id },
		{
			// using the $inc aand $push method to add a report and the user id
			$inc: { report: 1 },
			$push: { whoReported: req.auth.userId },
		}
	)
		.then(sauce => {
			// if sauce cant be found, send error message
			if (!sauce) {
				return res.status(404).json({ error: "Sauce not found !" });
			}
			// else, report the sauce and send a message
			res
				.status(200)
				.json(
					{ message: "Sauce reported", data: sauce },
					hateoasLinks(req, sauce._id)
				);
		})
		.catch(error => res.status(400).json({ error }));
};

// HATEOAS links
function hateoasLinks(req, id) {
	const baseUri = `${req.protocol}://${req.get("host")}`;

	return [
		{
			rel: "create",
			method: "POST",
			title: "Create a sauce",
			href: baseUri + "/api/sauces",
		},
		{
			rel: "update",
			method: "PUT",
			title: "Modify a sauce",
			href: baseUri + "/api/sauces/" + id,
		},
		{
			rel: "readOne",
			method: "GET",
			title: "Read a sauce",
			href: baseUri + "/api/sauces/" + id,
		},
		{
			rel: "readAllSauces",
			method: "GET",
			title: "Read all sauces",
			href: baseUri + "/api/sauces",
		},

		{
			rel: "delete",
			method: "DELETE",
			title: "Delete a sauce",
			href: baseUri + "/api/sauces/" + id,
		},
		{
			rel: "rate",
			method: "POST",
			title: "Rate a sauce",
			href: baseUri + "/api/sauces/",
		},
		{
			rel: "report",
			method: "POST",
			title: "Report a sauce",
			href: baseUri + "/api/sauces/" + id,
		},
	];
}
