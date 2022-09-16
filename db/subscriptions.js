const knex = require("./knex");

function createSubscription(sub) {
  return knex("subscriptions").insert(sub);
}

function getAllSubscription(telegram_chat) {
  return knex("subscriptions").where(telegram_chat).select("*");
}

// Update subscription last check time
async function updateSubscription(twitter_account, telegram_chat, last_time, subscription_id) {
  return await knex("subscriptions").update("last_check", last_time).where("subscription_id", subscription_id);
}

async function searchSubscription(twitter_account, telegram_chat) {
  const subscription = await knex("subscriptions").where(twitter_account).andWhere(telegram_chat);
  return subscription.length === 0 ? !1 : !0;
}

module.exports = {
  createSubscription,
  getAllSubscription,
  searchSubscription,
  updateSubscription,
};
