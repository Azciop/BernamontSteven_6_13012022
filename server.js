// Importing the Express module
const express = require("express");
const app = express();

// Importing the cors module
const cors = require("cors");

// Importing the  routes
const routes = require("./app/routes");

// Importing the path module
const path = require("path");

// Importing the mongoose module
const mongoose = require("mongoose");

// Logger mongoose
mongoose.set("debug", true);

// Importing the mongoose sanitize module
const mongoSanitize = require("express-mongo-sanitize");

// Init .env config
require("dotenv").config();

// importing the hateoas module
var hateoasLinker = require("express-hateoas-links");

// we import the cors options
var corsOptions = {
	origin: "http://127.0.0.1:8081",
};

// importing db confing to allow our database to work
const db = require("./config/db.config");

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
	res.json({ message: "Welcome to piiquante application." });
});

app.use(mongoSanitize());

// replace standard express res.json with the new version
app.use(hateoasLinker);

app.use(routes);

// using express.static to serv our images in express
app.use("/images", express.static(path.join(__dirname, "images")));

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
