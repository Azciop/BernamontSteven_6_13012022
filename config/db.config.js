const mongoose = require("mongoose");

if (!process.env.MONGO_URI) {
  console.log("No DB_URL found in .env configuration");
}

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    ssl:true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((error) => {
    console.log("Database connection error: " + error);
  });

module.exports = mongoose.connection;