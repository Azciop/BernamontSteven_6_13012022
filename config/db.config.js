const mongoose = require("mongoose");
// we set up the bunyan module (Bunyan is a JSON logging library)
const bunyan = require("bunyan");
require("dotenv").config();

// We create the logger with bunyan
const log = bunyan.createLogger({
  name: "MongoDB Logs",
  serializers: {
    dbQuery: serializer,
  },
  streams: [
    {
      // we use a stdout stream (stdout = single stream) (stream = output log messages)
      stream: process.stdout,
      //  Detail on regular operation.
      level: "info",
    },
    {
      stream: process.stdout,
      // Anything else, i.e. too verbose to be included in "info" level.
      level: "debug",
    },
    {
      stream: process.stderr,
      // Fatal for a particular request, but the service/app continues servicing other requests
      level: "error",
    },
    {
      type: "rotating-file",
      // we create the path to save the logs
      path: "./logs/mongodb.logs",
      period: "1d", // daily rotation
      count: 3, // keep 3 back copies
    },
  ],
});

if (!process.env.MONGO_URI) {
  console.log("No DB_URL found in .env configuration");
}

// we make a serializer function to stringify 
function serializer(data) {
  let query = JSON.stringify(data.query);
  let options = JSON.stringify(data.options || {});

  return `db.${data.coll}.${data.method}(${query}, ${options});`;
}

mongoose.set("debug", function (coll, method, query, doc, options) {
  let set = {
    coll: coll,
    method: method,
    query: query,
    doc: doc,
    options: options,
  };

  log.info({
    dbQuery: set,
  });
});

// we make the connect function to allow our mongoDB to connect
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log("Database connection error: " + error);
  });

module.exports = mongoose.connection;