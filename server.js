const express = require("express");
const cors = require("cors");
const routes = require("./app/routes")
const path = require("path")
// Init .env config
require('dotenv').config();

const app = express();

var corsOptions = {
  origin: "http://127.0.0.1:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to piiquante application." });
});
app.use(routes);

app.use('/images', express.static(path.join(__dirname, 'images')));

const db = require("./config/db.config");

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});