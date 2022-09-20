const mongoose = require("mongoose");

const SchemaSub = mongoose.Schema({
  twitterAccount: {
    type: String,
    required: true,
  },
  telegramChat: {
    type: String,
    required: true,
  },
  lastCheck: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("subscriptions", SchemaSub);
