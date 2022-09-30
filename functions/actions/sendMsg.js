const axios = require("axios");

const sendMessage = async (id, text, mode, replayMsgId) => {
  if (replayMsgId) {
    console.log(1111111111);
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
const sendMediaGrup = async (id, media) =>
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMediaGroup`, {
    chat_id: id,
    media: media,
    parse_mode: "HTML",
  });

const sendAnimation = async (id, media) =>
  await axios.post(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendAnimation`, {
    chat_id: id,
    animation: media,
    parse_mode: "HTML",
  });

module.exports = {
  sendMessage,
  sendMediaGrup,
  sendAnimation,
};
