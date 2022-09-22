require("dotenv").config();
const mongoose = require("mongoose");
const connectMongoDB = require("./db/mongoConn");
connectMongoDB();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { polling: true });

const { userSendMsg, sendMessage } = require("./actions");
const { checksTweet } = require("./actions/tweet");

let intrevalChecksTweet;
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
  intrevalChecksTweet = setInterval(checksTweet, 5 * 60 * 1000); // Checks every 1 minutes ---
});

// General commands
// bot.on("text", userSendMsg);

// bot.launch();
exports.handler = async (event) => {
  try {
    const message = JSON.parse(event.body + " ");

    if (message.text === "/stop") {
      clearInterval(intrevalChecksTweet);
      await sendMessage(process.env.TELEGRAM_ADMINS, "I stop the msg", "HTML");
    }
    await userSendMsg(event.body);
    return { statusCode: 200, body: "" };
  } catch (e) {
    console.log(e);
    return { statusCode: 400, body: "This endpoint is meant for bot and telegram communication" };
  }
};
