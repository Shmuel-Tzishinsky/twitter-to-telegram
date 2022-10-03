require("dotenv").config();
const mongoose = require("mongoose");
const connectMongoDB = require("./db/mongoConn");
connectMongoDB();

const { Telegraf } = require("telegraf");
const bot = new Telegraf(process.env.TELEGRAM_TOKEN, { polling: true });

const { userSendMsg, sendMessage } = require("./actions");

// let intrevalChecksTweet;
mongoose.connection.once("open", () => {
  console.log("MongoDB Connected!");
  sendMessage(process.env.TELEGRAM_ADMINS, "MongoDB Connected!", "HTML");
});

// General commands
// bot.on("text", userSendMsg);
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
