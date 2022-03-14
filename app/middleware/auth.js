// We get he jsonwebtoken module
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
	try {
		// Making a const token to extract the token from the authorization,
		const token = req.headers.authorization.split(" ")[1];
		// then we verify if the token is the same as our random token secret
		const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
		// then we get the userId from our token
		const userId = decodedToken.userId;
		req.auth = { userId };
		// then we compare our userId with our userId from the token
		if (req.body.userId && req.body.userId !== userId) {
			// if not the same userId, throw an error, else, we use the next function to push our result
			throw "Invalid user ID";
		} else {
			next();
		}
	} catch {
		res.status(401).json({
			error: new Error("Invalid request!"),
		});
	}
};
