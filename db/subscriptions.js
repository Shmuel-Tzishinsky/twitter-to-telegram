const knex = require("./knex");

function createSubscription(sub) {
  return knex("subscriptions").insert(sub);
}

function getAllSubscription(telegram_chat) {
  return knex("subscriptions").where(telegram_chat).select("*");
}

async function searchSubscription(twitter_account, telegram_chat) {
  const subscription = await knex("subscriptions").where(twitter_account).andWhere(telegram_chat);
  return subscription.length === 0 ? !1 : !0;
}

module.exports = {
  createSubscription,
  getAllSubscription,
  searchSubscription,
};
