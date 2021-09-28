const path = require("path");
const fs = require("fs");
const scdl = require("soundcloud-downloader").default;
const dotenv = require("dotenv");
const TelegramBot = require("node-telegram-bot-api");

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
      const SOUNDCLOUD_URL = msg.text;
      scdl.prepareURL(SOUNDCLOUD_URL).then(url => {
        console.log("Getting audio info...");
        bot.sendMessage(chatId, "Getting audio info...");
        scdl.getInfo(url).then(fileInfo => {
          const filename = `${fileInfo.title}.mp3`;
          const filepath = path.join(process.cwd(), "downloads", filename);
          console.log("Downloading...");
          bot.sendMessage(chatId, "Downloading...");
          scdl.download(url).then(stream => {
            stream.pipe(
              fs.createWriteStream(filepath).on("close", () => {
                console.log("Uploading...");
                bot.sendMessage(chatId, "Uploading...");
                bot
                  .sendAudio(
                    chatId,
                    filepath,
                    { caption: "\nID: @soundcloud_download_bot" },
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
          });
        });
      });
    }
  } catch (error) {
    console.error(error);
  }
});

// scdl.prepareURL(SOUNDCLOUD_URL).then(url => {
//   scdl.getInfo(url).then(fileInfo => {
//     scdl.download(url).then(stream =>
//       stream.pipe(
//         fs.createWriteStream(`${fileInfo.title}.mp3`).on("close", () => {
//           console.log("Finished");
//         })
//       )
//     );
//   });
// });
