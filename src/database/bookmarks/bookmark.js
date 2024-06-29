const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const bookmarkSchema = mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
});

bookmarkSchema.index({ userId: 1, title: 1 }, { unique: true });
bookmarkSchema.plugin(uniqueValidator);
module.exports = mongoose.model("Bookmark", bookmarkSchema);
