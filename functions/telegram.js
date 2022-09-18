const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const twitter = require("./twitter");
const { getAllSubscription, updateSubscription } = require("./db/subscriptions");
const { userSendMsg, sendMessage } = require("./actions");

const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

// General commands
bot.on("message", userSendMsg);

// Cron;
setInterval(async () => {
  console.log("> Checking subscriptions...");
  const subscriptions = await getAllSubscription({ telegram_chat: process.env.TELEGRAM_ADMINS });
  for (const subscription of subscriptions) {
    // Get tweets by account since the last check
    const tweets = await twitter.getTweets(subscription.twitter_account, subscription.last_check);
    for (const tweet of tweets) {
      // Do not forward replies
      if (tweet.in_reply_to_user_id) continue;

      let text =
        "<b>" +
        subscription.twitter_account +
        ":</b>\n\n" +
        tweet.text +
        '\n\n<a href="https://twitter.com/' +
        subscription.twitter_account +
        "/status/" +
        tweet.id +
        '">TWEET URL</a>';

      // Replace Telegram alias to Twitter direct links in order to aviod scams
      const mentions = text.matchAll(/\@(\w+)/g);
      for (const mention of mentions) {
        console.log("MENTION", mention[0]);
        text = text.replace(mention[0], `<a href="https://twitter.com/${mention[1]}">${mention[0]}</a>`);
      }
      // If the tweet does contain a link, show preview. Else, do not show it since it will load the message text from the tweet url
      // Note that we are checking tweet.text, not text. This is because we insert mentions in the text that are no useful urls

      await sendMessage(subscription.telegram_chat, text, "html");
    }
    // Update subscription last check time
    await updateSubscription(new Date().toISOString(), subscription.subscription_id);
  }
}, 5 * 60 * 1000); // Checks every 10 minutes ---

exports.handler = async (event) => {
  try {
    await userSendMsg(JSON.parse(event.body + ""));
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" };
  }
};
