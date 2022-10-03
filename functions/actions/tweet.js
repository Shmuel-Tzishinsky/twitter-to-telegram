// const translate = require("google-translate-api");
const { sendMessage, sendAnimation, sendMediaGrup } = require("./sendMsg");
const { getAllSubscription, updateSubscription } = require("../db/subscriptions");
const twitter = require("../twitter");
const translate = require("@vitalets/google-translate-api");
const { getMedia } = require("./getMedia");

// Replace Telegram alias to Twitter direct links in order to aviod scams
const twitterDirectToLink = async (text) => {
  const mentions = text.matchAll(/\@(\w+)/g);
  for (const mention of mentions) {
    text = text.replace(mention[0], `<a href="https://twitter.com/${mention[1]}">${mention[0]}</a>`);
  }

  return text;
};

const transleteTweet = async (text) => {
  try {
    const textHe = await translate(text, { to: "iw" });
    text += `\n\n\nתרגום:\n${textHe.text}`;

    text = await twitterDirectToLink(text);
  } catch (error) {
    console.log("🚀 ~ file: tweet.js ~ line 11 ~ transleteTweet ~ error", error);
  }

  return text;
};

const analyzeTweet = async (tweets, subscription) => {
  for (const tweet of tweets) {
    // Do not forward replies
    if (tweet.in_reply_to_user_id) continue;
    const media = await getMedia(tweet.id);
    let text = await transleteTweet(
      `<b>${subscription.twitterAccount}:</b>\n\n ${tweet.text.replace(/https:(\/\/t\.co\/([A-Za-z0-9]|[A-Za-z]){10})/, "")}`
    );
    text += `\n\n<a href="https://twitter.com/${subscription.twitterAccount}/status/${tweet.id}">קישור לציוץ</a>`;

    try {
      if (media.media) {
        if (media?.media[0]?.type === "animated_gif") {
          return await sendAnimation(subscription.telegramChat, media.media[0]);
        }
        arrMedia = media.media.map((e) => {
          return {
            type: (e.content_type || e.type).replace("video/mp4", "video").replace("animated_gif", "gif"),
            media: e.url,
          };
        });
        const res = await sendMediaGrup(subscription.telegramChat, arrMedia);
        res.data.result[0].message_id && (await sendMessage(subscription.telegramChat, text, "html", res.data.result[0].message_id));
      } else {
        await sendMessage(subscription.telegramChat, text, "html");
      }
    } catch (error) {
      await sendMessage(subscription.telegramChat, text, "html");
      console.log("🚀 ~ file: tweet.js ~ line 46 ~ analyzeTweet ~ error", error);
      return;
    }
  }
  return;
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
    await sendMessage(process.env.TELEGRAM_ADMINS, "> Checking subscriptions...", "HTML");
    const subscriptions = await getAllSubscription(process.env.TELEGRAM_ADMINS);
    return await analyzeData(subscriptions);
  } catch (error) {
    console.log("🚀 ~ file: tweet.js ~ line 12 ~ checksTweet ~ error", error);
    return;
  }
};

module.exports = {
  checksTweet,
};
