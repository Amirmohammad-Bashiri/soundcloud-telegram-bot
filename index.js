const path = require("path");
const fs = require("fs");
const scdl = require("soundcloud-downloader").default;
const dotenv = require("dotenv");
const TelegramBot = require("node-telegram-bot-api");

const userDetailsLogger = require("./utils/userDetailsLogger");
const removeSpecialChars = require("./utils/removeSpecialChars");
const checkFileSize = require("./utils/checkFileSize");

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

      const SOUNDCLOUD_URL = msg.text;

      scdl
        .prepareURL(SOUNDCLOUD_URL)
        .then(url => {
          const isValidUrl = scdl.isValidUrl(url);
          if (!isValidUrl) {
            throw new Error("URL is not valid");
          }
          console.log("Getting audio info...");
          bot.sendMessage(chatId, "Getting audio info...");
          scdl
            .getInfo(url)
            .then(fileInfo => {
              const filename = `${removeSpecialChars(fileInfo.title)}.mp3`;
              const filepath = path.join(process.cwd(), "downloads", filename);
              console.log("Downloading...");
              bot.sendMessage(chatId, "Downloading...");
              scdl
                .download(url)
                .then(stream => {
                  stream.pipe(
                    fs.createWriteStream(filepath).on("close", () => {
                      if (!checkFileSize(filepath)) {
                        bot.sendMessage(chatId, "File is too large.");
                        fs.unlinkSync(filepath);
                        return;
                      }
                      console.log("Uploading...");
                      bot.sendMessage(chatId, "Uploading...");
                      bot
                        .sendAudio(
                          chatId,
                          filepath,
                          {
                            caption:
                              "\nID: @soundcloud_download_bot\nYoutube Video To Audio Bot:\n ID: @yt_video_to_audio_bot",
                          },
                          fileOptions
                        )
                        .then(() => {
                          console.log("Uploaded");
                        })
                        .catch(error => {
                          console.error(error);
                          bot.sendMessage(chatId, "Failed to upload file");
                        })
                        .finally(() => {
                          fs.unlinkSync(filepath);
                        });
                    })
                  );
                })
                .catch(error => {
                  console.error(error);
                  bot.sendMessage(
                    chatId,
                    "Failed to download audio, Please try again later."
                  );
                });
            })
            .catch(error => {
              console.error(error);
              bot.sendMessage(
                chatId,
                "Could not get audio info, Please try again later."
              );
            });
        })
        .catch(error => {
          console.error(error);
          bot.sendMessage(chatId, "Please enter a valid Soundcloud URL");
        });
    }
  } catch (error) {
    console.error(error);
    bot.sendMessage(chatId, "Something went wrong, Please try again later");
  }
});
