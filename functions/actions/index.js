const { createSubscription, getAllSubscription, searchSubscription, deleteSubscription } = require("../db/subscriptions");
const axios = require("axios");

const sendMessage = async (id, text, mode) => {
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: id,
    text: text,
    parse_mode: mode,
  });

  return;
};

// General commands
const start = async (msg) => {
  const chatId = msg.chat.id;
  const text =
    "This bot forwards tweets from Twitter accounts to Telegram chats.\n\nBot made by [Stakely.io](https://www.youtube.com/watch?v=cr3pX6fSUpc) for a private use.\n\nThe source code of this bot is available in our [Github](https://github.com/Stakely).";
  await sendMessage(chatId, text, "Markdown");
  return;
};

// Get all subscriptions
const subscriptions = async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // Only admins can use this function
  if (!userIsAdmin(userId)) return;

  try {
    const allSubscription = await getAllSubscription(userId);
    const text = JSON.stringify(allSubscription, null, 2);
  
    await sendMessage(chatId, text, "HTML");
  } catch (error) {
    console.log("🚀 ~ file: index.js ~ line 38 ~ subscriptions ~ error", error)
  }
  return;
};

//  <<< 🔽🔽🔽 Admin functions 🔽🔽🔽 >>>

// Inert subscribe
const subscribe = async (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  // Only admins can use this function
  if (!userIsAdmin(userId)) return;

  const twitterAccount = match;

  if ((await searchSubscription(twitterAccount, chatId)) !== null) {
    await sendMessage(chatId, "Already subscribed", "HTML");
    return;
  }

  try {
    await createSubscription({
      twitterAccount: twitterAccount,
      telegramChat: chatId,
      lastCheck: new Date().toISOString(),
    });
  } catch (error) {
    console.log("🚀 ~ file: telegram.js ~ line 79 ~ bot.onText ~ error", error);
    // await sendMessage(chatId, "i heve some error: ", error + "", "HTML");
    return;
  }

  await sendMessage(chatId, "Saved!", "HTML");
  return;
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
    await sendMessage(process.env.TELEGRAM_ADMINS, "i have some error " + error + "" + "", "HTML");
    return;
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

const userSendMsg = async (message) => {
  // const { message } = JSON.parse(msg + "");
  const text = message?.message?.text || message?.message?.caption;

  // const text = message?.text || message?.caption;

  if (text.match(/\/start/)?.input) {
    await start(message);
    return;
  } else if (text.match(/\/subscriptions/)?.input) {
    await subscriptions(message);
    return;
  } else if (text.match(/\/subscribe @(\w+)/)?.input) {
    await subscribe(message, text.replace("/subscribe @", ""));
    return;
  } else if (text.match(/\/unsubscribe @(\w+)/)?.input) {
    await unsubscribe(message, text.replace("/unsubscribe @", ""));
    return;
  } else {
    await sendMessage(message.chat.id, "I don't find command", "HTML");
    return;
  }
};
module.exports = {
  userSendMsg,
  sendMessage,
};
