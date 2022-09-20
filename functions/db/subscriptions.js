const SchemaSub = require("../models/SchemaSub");

const getAllSubscription = async (telegram_chat) => {
  return await SchemaSub.find({ telegramChat: telegram_chat });
};

const createSubscription = async (sub) => {
  const addSub = new SchemaSub(sub);
  return await addSub.save();
};

const searchSubscription = async (twitter_account, telegram_chat) => {
  return await SchemaSub.exists({
    twitterAccount: twitter_account,
    telegramChat: telegram_chat,
  });
};

// Update subscription last check time
const updateSubscription = async (id, last_time) => {
  return await SchemaSub.updateOne({ _id: id }, { lastCheck: last_time });
};

const deleteSubscription = async (twitter_account, telegram_chat) => {
  return await SchemaSub.deleteMany({
    twitterAccount: twitter_account,
    telegramChat: telegram_chat,
  });
};

module.exports = {
  createSubscription,
  getAllSubscription,
  searchSubscription,
  updateSubscription,
  deleteSubscription,
};
