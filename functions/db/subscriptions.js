const knex = require("./knex");

const createSubscription = (sub) => {
  return knex("subscriptions").insert(sub);
};

const getAllSubscription = (telegram_chat) => {
  return knex("subscriptions").where(telegram_chat).select("*");
};

// Update subscription last check time
const updateSubscription = async (last_time, subscription_id) => {
  return await knex("subscriptions").update("last_check", last_time).where("subscription_id", subscription_id);
};

const searchSubscription = async (twitter_account, telegram_chat) => {
  const subscription = await knex("subscriptions").where("twitter_account", twitter_account).andWhere("telegram_chat", telegram_chat);
  return subscription.length === 0 ? !1 : !0;
};

const deleteSubscription = async (twitter_account, telegram_chat) => {
  const subscription = await knex("subscriptions").where("twitter_account", twitter_account).andWhere("telegram_chat", telegram_chat).del();
  return subscription;
};

module.exports = {
  createSubscription,
  getAllSubscription,
  searchSubscription,
  updateSubscription,
  deleteSubscription,
};
