const { createSubscription, getAllSubscription, searchSubscription, deleteSubscription } = require("../db/subscriptions");
const axios = require("axios");
const { getDataUser, getAllFollowing } = require("../twitter");

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
  // Only admins can use this function
  if (!userIsAdmin(chatId)) return;

  try {
    const allSubscription = await getAllSubscription(chatId);
    const text = JSON.stringify(allSubscription, null, 2);

    return await sendMessage(chatId, text, "HTML");
  } catch (error) {
    console.log("🚀 ~ file: index.js ~ line 38 ~ subscriptions ~ error", error);
    return await sendMessage(chatId, "Sorry i have some error", "HTML");
  }
};

//  🔽🔽🔽 Admin functions 🔽🔽🔽

// Inert subscribe
const subscribe = async (msg, match) => {
  const chatId = msg.chat.id;
  // Only admins can use this function
  if (!userIsAdmin(chatId)) return;

  if ((await searchSubscription(match, chatId)) !== null) {
    await sendMessage(chatId, "Already subscribed", "HTML");
    return;
  }

  try {
    await createSubscription({
      twitterAccount: match,
      telegramChat: chatId,
      lastCheck: new Date().toISOString(),
    });
    return await sendMessage(chatId, `Saved the ${match}!`, "HTML");
  } catch (error) {
    console.log("🚀 ~ file: telegram.js ~ line 79 ~ bot.onText ~ error", error);
    return await sendMessage(chatId, "Sorry i have some error", "HTML");
  }
};

// Inert subscribe the all follower from @username
const suballfollower = async (msg, match) => {
  console.log("🚀 ~ file: index.js ~ line 67 ~ suballfollower ~ match", match);
  const chatId = msg.chat.id;
  // Only admins can use this function
  if (!userIsAdmin(chatId)) return;

  const findTheID = await getDataUser(match.split(" ")[1].replace("@", ""));
  console.log("🚀 ~ file: index.js ~ line 73 ~ suballfollower ~ findTheID", findTheID.data.id);
  const allFollowing = await getAllFollowing(findTheID.data.id);
  console.log("🚀 ~ file: index.js ~ line 74 ~ suballfollower ~ allFollowing ", allFollowing);

  for (let i = 0; i < allFollowing.data.length; i++) {
    await subscribe(msg, allFollowing?.data[i]?.username);
  }

  return await sendMessage(chatId, "I finished the work, you can see the list of subscribers at /subscribers", "HTML");
};

// Delete subscribe
const unsubscribe = async (msg, match) => {
  const chatId = msg.chat.id;

  // Only admins can use this function
  if (!userIsAdmin(chatId)) return;

  const twitterAccount = match;
  try {
    const del = await deleteSubscription(twitterAccount, chatId);
    return await sendMessage(chatId, del ? "Deleted!" : "Sorry i don't find the subscription", "HTML");
  } catch (error) {
    console.log("🚀 ~ file: index.js ~ line 79 ~ unsubscribe ~ error", error);
    return await sendMessage(chatId, "Sorry i have some error", "HTML");
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
  const { message } = JSON.parse(msg + "");
  // const text = message?.message?.text || message?.message?.caption;

  const text = message?.text || message?.caption;

  if (text.match(/\/start/)?.input) {
    return await start(message);
  } else if (text.match(/\/subscriptions/)?.input) {
    return await subscriptions(message);
  } else if (text.match(/\/subscribe @(\w+)/)?.input) {
    return await subscribe(message, text.replace("/subscribe @", ""));
  } else if (text.match(/\/suballfollower @(\w+)/)?.input) {
    return await suballfollower(message, text.replace("/unsubscribe @", ""));
  } else if (text.match(/\/unsubscribe @(\w+)/)?.input) {
    return await unsubscribe(message, text.replace("/unsubscribe @", ""));
  } else {
    return await sendMessage(message.chat.id, "I don't find command", "HTML");
  }
};

module.exports = {
  userSendMsg,
  sendMessage,
};
