require("dotenv").config();
const mongoose = require("mongoose");
const connectMongoDB = require("./db/mongoConn");
const translate = require("translate-google");

connectMongoDB();

const { Telegraf } = require("telegraf");

const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { polling: true });

const twitter = require("./twitter");
const { getAllSubscription, updateSubscription } = require("./db/subscriptions");
const { userSendMsg, sendMessage } = require("./actions");

mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
});

// General commands
// bot.on("text", userSendMsg);

// Cron;
setInterval(async () => {
  console.log("> Checking subscriptions...");
  try {
    const subscriptions = await getAllSubscription(process.env.TELEGRAM_ADMINS);
    for (const subscription of subscriptions) {
      // Get tweets by account since the last check
      const tweets = await twitter.getTweets(subscription.twitterAccount, subscription.lastCheck);
      for (const tweet of tweets) {
        // Do not forward replies
        if (tweet.in_reply_to_user_id) continue;

        let text =
          "<b>" +
          subscription.twitterAccount +
          ":</b>\n\n" +
          tweet.text +
          '\n\n<a href="https://twitter.com/' +
          subscription.twitterAccount +
          "/status/" +
          tweet.id +
          '">TWEET URL</a>';

        const textHe = await translate(tweet.text, { to: "iw" });
        text += `\n\n ☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰☰\n\n ${textHe}`;

        // Replace Telegram alias to Twitter direct links in order to aviod scams
        const mentions = text.matchAll(/\@(\w+)/g);
        for (const mention of mentions) {
          text = text.replace(mention[0], `<a href="https://twitter.com/${mention[1]}">${mention[0]}</a>`);
        }
        // If the tweet does contain a link, show preview. Else, do not show it since it will load the message text from the tweet url
        // Note that we are checking tweet.text, not text. This is because we insert mentions in the text that are no useful urls

        await sendMessage(subscription.telegramChat, text, "html");
      }
      // Update subscription last check time
      await updateSubscription(subscription._id, new Date().toISOString());
    }
  } catch (error) {
    console.log("🚀 ~ file: telegram.js ~ line 58 ~ setInterval ~ error", error);
  }
}, 1 * 60 * 1000); // Checks every 10 minutes ---
//
// bot.launch();
exports.handler = async (event) => {
  try {
    await userSendMsg(event.body);
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" };
  }
};
