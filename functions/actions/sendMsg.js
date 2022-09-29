const axios = require("axios");

const sendMessage = async (id, text, mode, replayMsgId) => {
  if (replayMsgId) {
    return await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      chat_id: id,
      text: text,
      parse_mode: mode,
      reply_to_message_id: replayMsgId,
    });
  }
  return await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
    chat_id: id,
    text: text,
    parse_mode: mode,
  });
};
const sendMediaGrup = async (id, text, media) =>
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMediaGroup`, {
    chat_id: id,
    caption: "text yyyyyyyyyyyyyyyyyyyyyyyyyyy",
    media: media,
    parse_mode: "HTML",
  });

const sendAnimation = async (id, text, media) =>
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendAnimation`, {
    chat_id: id,
    caption: text,
    text: text,
    title: text,
    animation: media,
    parse_mode: "HTML",
  });

module.exports = {
  sendMessage,
  sendMediaGrup,
  sendAnimation,
};
