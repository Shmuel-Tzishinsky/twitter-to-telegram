const { createSubscription, getAllSubscription, searchSubscription, deleteSubscription } = require("../db/subscriptions");
const { getDataUser, getAllFollowing } = require("../twitter");
const { sendMessage } = require("./sendMsg");

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
    return await sendMessage(chatId, "Already subscribed", "HTML");
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
  // console.log("🚀 ~ file: index.js ~ line 67 ~ suballfollower ~ match", match);
  const chatId = msg.chat.id;
  // Only admins can use this function
  if (!userIsAdmin(chatId)) return;

  const findTheID = await getDataUser(match.split(" ")[1].replace("@", ""));
  // console.log("🚀 ~ file: index.js ~ line 73 ~ suballfollower ~ findTheID", findTheID.data.id);
  const allFollowing = await getAllFollowing(findTheID.data.id);
  // console.log("🚀 ~ file: index.js ~ line 74 ~ suballfollower ~ allFollowing ", allFollowing);

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

module.exports = {
  start,
  subscriptions,
  suballfollower,
  unsubscribe,
};
