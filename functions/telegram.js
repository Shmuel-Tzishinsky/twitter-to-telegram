const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
// const Database = require("better-sqlite3");
const twitter = require("./twitter");
const TelegramBot = require("node-telegram-bot-api");
const { createSubscription, getAllSubscription, searchSubscription, updateSubscription } = require("./db/subscriptions");

// const db = new Database("subscriptions.db", {}); // verbose: console.log
const bot = new TelegramBot(process.env.TELEGRAM_TOKEN, { polling: true });

exports.handler = async (event) => {
  try {
    // General commands
    bot.onText(/\/start/, async (msg, match) => {
      const chatId = msg.chat.id;
      bot.sendMessage(
        chatId,
        "This bot forwards tweets from Twitter accounts to Telegram chats.\n\nBot made by [Stakely.io](https://www.youtube.com/watch?v=cr3pX6fSUpc) for a private use.\n\nThe source code of this bot is available in our [Github](https://github.com/Stakely).",
        { parse_mode: "Markdown" }
      );
    });

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
          if (tweet.text.includes("http")) {
            await bot.sendMessage(subscription.telegram_chat, text, { parse_mode: "html" });
          } else {
            await bot.sendMessage(subscription.telegram_chat, text, { parse_mode: "html", disable_web_page_preview: true });
          }
        }
        // Update subscription last check time
        await updateSubscription(subscription.twitter_account, subscription.telegram_chat, new Date().toISOString(), subscription.subscription_id);
        // db.prepare("UPDATE subscriptions SET last_check = ? WHERE subscription_id = ?").run(new Date().toISOString(), subscription.subscription_id);
      }
    }, 10 * 60 * 10000); // Checks every 10 minutes

    // <<< Admin functions >>>
    // Inert subscribe
    bot.onText(/\/subscribe @(\w+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      // Only admins can use this function
      if (!userIsAdmin(userId)) return;

      const twitterAccount = match[1];

      if (await searchSubscription({ twitter_account: twitterAccount }, { telegram_chat: chatId })) {
        bot.sendMessage(chatId, "Already subscribed");
        return;
      }

      try {
        await createSubscription({
          twitter_account: twitterAccount,
          telegram_chat: chatId,
          last_check: new Date().toISOString(),
        });
      } catch (error) {
        console.log("🚀 ~ file: telegram.js ~ line 79 ~ bot.onText ~ error", error);
        bot.sendMessage(chatId, "i heve some error: ", error + "");

        return;
      }

      bot.sendMessage(chatId, "Saved!");
    });

    //  Get all subscriptions
    bot.onText(/\/subscriptions/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      // Only admins can use this function
      if (!userIsAdmin(userId)) return;

      const allSubscription = await getAllSubscription({ telegram_chat: userId });
      console.log(allSubscription);

      bot.sendMessage(chatId, JSON.stringify(allSubscription, null, 2));
    });

    // Delete subscribe
    bot.onText(/\/unsubscribe @(\w+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const userId = msg.from.id;
      // Only admins can use this function
      if (!userIsAdmin(userId)) return;

      const twitterAccount = match[1];
      // db.prepare("DELETE FROM subscriptions WHERE twitter_account = ? AND telegram_chat = ?").run(twitterAccount, chatId);
      bot.sendMessage(chatId, "Deleted!");
    });

    // Helper functions
    const userIsAdmin = async (userId) => {
      const admins = process.env.TELEGRAM_ADMINS.split(",");
      for (const admin of admins) {
        if (userId === admin) return true;
      }
      return false;
    };

    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" };
  }
};
