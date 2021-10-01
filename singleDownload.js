const path = require("path");
const fs = require("fs");
const scdl = require("soundcloud-downloader").default;

const removeSpecialChars = require("./utils/removeSpecialChars");
const getThumb = require("./utils/getThumb");

function singleDownload(SOUNDCLOUD_URL, bot, chatId, fileOptions) {
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
          const filename = `${removeSpecialChars(
            fileInfo.title
          )}_${chatId}.mp3`;
          const thumbPath = path.join(
            process.cwd(),
            "downloads",
            `${removeSpecialChars(fileInfo.title)}_${chatId}.jpg`
          );
          const filepath = path.join(process.cwd(), "downloads", filename);
          getThumb(fileInfo.artwork_url, thumbPath);

          console.log("Downloading...");
          bot.sendMessage(chatId, "Downloading...");
          scdl
            .download(url)
            .then(stream => {
              stream.pipe(
                fs.createWriteStream(filepath).on("close", () => {
                  console.log("Uploading...");
                  bot.sendMessage(chatId, "Uploading...");
                  bot
                    .sendAudio(
                      chatId,
                      filepath,
                      {
                        caption:
                          "\nID: @soundcloud_download_bot\nYoutube Video To Audio Bot: @yt_video_to_audio_bot",
                        thumb: thumbPath,
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
                      fs.unlinkSync(thumbPath);
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
          bot.sendMessage(chatId, error.message);
        });
    })
    .catch(error => {
      console.error(error);
      bot.sendMessage(
        chatId,
        "Failed to get track info, Please try again later."
      );
    });
}

module.exports = singleDownload;
