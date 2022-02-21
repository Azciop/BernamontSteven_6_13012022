const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: [true, "Email must be unique"] },
  password: { type: String, required: true },
  report: { type: Number, default: 0},
  whoReported: [{ type: String, ref: "User"}],
});

userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);