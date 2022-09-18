const { createSubscription, getAllSubscription, searchSubscription, deleteSubscription } = require("../db/subscriptions");

const axios = require("axios");

const sendMessage = async (id, text, mode) => {
  return await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: id,
    text: text,
    parse_mode: mode,
  });
};

// General commands
const start = async (msg) => {
  const chatId = msg.chat.id;
  const text =
    "This bot forwards tweets from Twitter accounts to Telegram chats.\n\nBot made by [Stakely.io](https://www.youtube.com/watch?v=cr3pX6fSUpc) for a private use.\n\nThe source code of this bot is available in our [Github](https://github.com/Stakely).";
  return await sendMessage(chatId, text, "Markdown");
};

// Get all subscriptions
const subscriptions = async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // Only admins can use this function
  if (!userIsAdmin(userId)) return;

  const allSubscription = await getAllSubscription({ telegram_chat: userId });
  const text = JSON.stringify(allSubscription, null, 2);

  return await sendMessage(chatId, text, "HTML");
};

//  <<< 🔽🔽🔽 Admin functions 🔽🔽🔽 >>>

// Inert subscribe
const subscribe = async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // Only admins can use this function
  if (!userIsAdmin(userId)) return;

  const twitterAccount = match;

  if (await searchSubscription(twitterAccount, chatId)) {
    return await sendMessage(chatId, "Already subscribed", "HTML");
  }

  try {
    await createSubscription({
      twitter_account: twitterAccount,
      telegram_chat: chatId,
      last_check: new Date().toISOString(),
    });
  } catch (error) {
    console.log("🚀 ~ file: telegram.js ~ line 79 ~ bot.onText ~ error", error);
    return await sendMessage(chatId, "i heve some error: ", error + "", "HTML");
  }

  return await sendMessage(chatId, "Saved!", "HTML");
};

// Delete subscribe
const unsubscribe = async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // Only admins can use this function
  if (!userIsAdmin(userId)) return;

  const twitterAccount = match;
  try {
    const del = await deleteSubscription(twitterAccount, chatId);
    if (del) {
      return await sendMessage(chatId, "Deleted!", "HTML");
    } else {
      return await sendMessage(chatId, "Sorry i don't find the subscription", "HTML");
    }
  } catch (error) {
    console.log("🚀 ~ file: index.js ~ line 79 ~ unsubscribe ~ error", error);
    await sendMessage(chatId, "Sorry i have some error", "HTML");
    return await sendMessage(process.env.TELEGRAM_ADMINS, "i have some error " + error + "" + "", "HTML");
  }
};

// Helper functions
const userIsAdmin = async (userId) => {
  const admins = process.env.TELEGRAM_ADMINS.split(",");
  for (const admin of admins) {
    if (userId === admin) return true;
  }
  return false;
};

const userSendMsg = async (msg) => {
  const text = msg.text;

  switch (text) {
    case text.match(/\/start/)?.input:
      return await start(msg);
    case text.match(/\/subscriptions/)?.input:
      return await subscriptions(msg);
    case text.match(/\/subscribe @(\w+)/)?.input:
      return await subscribe(msg, text.replace("/subscribe @", ""));
    case text.match(/\/unsubscribe @(\w+)/)?.input:
      return await unsubscribe(msg, text.replace("/unsubscribe @", ""));

    default:
      return await sendMessage(msg.chat.id, "I don't find command", "HTML");
  }
};
module.exports = {
  userSendMsg,
};
