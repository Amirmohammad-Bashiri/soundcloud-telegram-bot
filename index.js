const fs = require("fs");
const scdl = require("soundcloud-downloader").default;
const dotenv = require("dotenv");
const TelegramBot = require("node-telegram-bot-api");

const singleDownload = require("./singleDownload");
const playlistDownload = require("./playlistDownload");
// Utils
const userDetailsLogger = require("./utils/userDetailsLogger");
const urlExtractor = require("./utils/urlExtractor");

dotenv.config({ path: "./config.env" });

const dir = "./downloads";

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const token = process.env.BOT_TOKEN;

const bot = new TelegramBot(token, {
  polling: true,
});

bot.on("message", msg => {
  const chatId = msg.chat.id;
  const fileOptions = {
    contentType: "audio/mpeg",
  };

  try {
    if (msg.text !== "/start") {
      userDetailsLogger(bot, chatId);

      const SOUNDCLOUD_URL = urlExtractor(msg);

      if (scdl.isPlaylistURL(SOUNDCLOUD_URL)) {
        playlistDownload(SOUNDCLOUD_URL, bot, chatId, fileOptions);
      } else {
        singleDownload(SOUNDCLOUD_URL, bot, chatId, fileOptions);
      }
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Something went wrong, Please try again later");
  }
});
