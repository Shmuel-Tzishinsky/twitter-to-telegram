const { start, subscriptions, suballfollower, unsubscribe } = require("./actions");
const { sendMessage, sendMediaGrup, sendAnimation } = require("./sendMsg");
const { checksTweet } = require("./tweet");

const userSendMsg = async (message) => {
  // const { message } = JSON.parse(String(msg));
  // const text = message?.text || message?.caption;
  const text = message?.message?.text || message?.message?.caption;
  console.log("🚀 ~ file: index.js ~ line 9 ~ userSendMsg ~ text", text);

  if (!text) {
    return await sendMessage(process.env.TELEGRAM_ADMINS, "text is undefin " + JSON.stringify(message, null, 1) + "", "HTML");
  }
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
  } else if (text === "/getTweets") {
    return await checksTweet();
  } else {
    return await sendMessage(message.chat.id, "I don't find command", "HTML");
  }
};

module.exports = {
  sendMessage,
  sendMediaGrup,
  sendAnimation,
  userSendMsg,
};
