// const translate = require("google-translate-api");
const { sendMessage } = require("./index");
const { getAllSubscription, updateSubscription } = require("../db/subscriptions");
const twitter = require("../twitter");
const translate = require("@vitalets/google-translate-api");

// Replace Telegram alias to Twitter direct links in order to aviod scams
const twitterDirectToLink = async (text) => {
  const mentions = text.matchAll(/\@(\w+)/g);
  for (const mention of mentions) {
    text = text.replace(mention[0], `<a href="https://twitter.com/${mention[1]}">${mention[0]}</a>`);
  }

  return text;
};

const transleteTweet = async (tweet, text) => {
  try {
    const textHe = await translate(tweet.text, { to: "iw" });
    text += `\n\n ☰☰☰☰☰☰ ציוץ מתורגם ☰☰☰☰☰☰\n\n${textHe.text}`;

    text = await twitterDirectToLink(text);
  } catch (error) {
    console.log("🚀 ~ file: tweet.js ~ line 11 ~ transleteTweet ~ error", error);
  }

  return text;
};

const analyzeText = async (tweet, subscription) => {
  let text = `<b>${subscription.twitterAccount}:</b>\n\n ${tweet.text}\n\n
<a href="https://twitter.com/${subscription.twitterAccount}/status/${tweet.id}">קישור לציוץ</a>`;

  text = await transleteTweet(tweet, text);

  return text;
};

const analyzeTweet = async (tweets, subscription) => {
  for (const tweet of tweets) {
    // Do not forward replies
    if (tweet.in_reply_to_user_id) continue;
    let text = await analyzeText(tweet, subscription);

    await sendMessage(subscription.telegramChat, text, "html");
  }

  return !0;
};

const analyzeData = async (subscriptions) => {
  for (const subscription of subscriptions) {
    // Get tweets by account since the last check
    const tweets = await twitter.getTweets(subscription.twitterAccount, subscription.lastCheck);
    await analyzeTweet(tweets, subscription);
    // Update subscription last check time
    await updateSubscription(subscription._id, new Date().toISOString());
  }
};

const checksTweet = async () => {
  console.log("> Checking subscriptions...");
  try {
    const subscriptions = await getAllSubscription(process.env.TELEGRAM_ADMINS);
    await analyzeData(subscriptions);
  } catch (error) {
    console.log("🚀 ~ file: tweet.js ~ line 12 ~ checksTweet ~ error", error);
    return;
  }
};

module.exports = {
  checksTweet,
};
