require("dotenv").config();
const mongoose = require("mongoose");
const connectMongoDB = require("./db/mongoConn");
connectMongoDB();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { polling: true });

const { userSendMsg, sendMessage } = require("./actions");
const { checksTweet } = require("./actions/tweet");

let intrevalChecksTweet;

function test(e) {
  console.log("TEST");
}
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
  intrevalChecksTweet = setInterval(test, 1000); // Checks every 1 minutes ---
});

// 5 * 60 *

// General commands
// bot.on("text", async (e) => {
//   if (e.message?.text === "/stop") {
//     clearInterval(intrevalChecksTweet);
//     await sendMessage(process.env.TELEGRAM_ADMINS, "I stop the msg", "HTML");
//     return;
//   }
//   if (e.message?.text === "/start") {
//     intrevalChecksTweet = setInterval(test, 1000);
//     await sendMessage(process.env.TELEGRAM_ADMINS, "I start the msg", "HTML");
//     return;
//   }
//   userSendMsg(e);
// });

// bot.launch();
exports.handler = async (event) => {
  try {
    console.log("🚀 ~ file: telegram.js ~ line 25 ~ exports.handler= ~ message", message);
    // const text = message?.message?.text || message?.message?.caption;

    if (message.text === "/stop") {
      clearInterval(intrevalChecksTweet);
      await sendMessage(process.env.TELEGRAM_ADMINS, "I stop the msg", "HTML");
    } else if (message.text === "/start") {
      intrevalChecksTweet = setInterval(test, 1000);
      await sendMessage(process.env.TELEGRAM_ADMINS, "I start the msg", "HTML");
      return;
    }
    await userSendMsg(event.body);
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" };
  }
};
