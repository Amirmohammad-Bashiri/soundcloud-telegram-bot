const path = require("path");
const fs = require("fs");
const scdl = require("soundcloud-downloader").default;

const removeSpecialChars = require("./utils/removeSpecialChars");

function playlistDownload(SOUNDCLOUD_URL, bot, chatId, fileOptions) {
  console.log("Getting playlist info...");
  bot.sendMessage(chatId, "Getting playlist info...");

  scdl.downloadPlaylist(SOUNDCLOUD_URL).then(([streams, trackNames]) => {
    console.log("Downloading...");
    bot.sendMessage(chatId, "Downloading...");

    streams.forEach((val, idx) => {
      val.pipe(
        fs
          .createWriteStream(
            path.join(
              process.cwd(),
              "downloads",
              removeSpecialChars(trackNames[idx]) + "_" + chatId + ".mp3"
            )
          )
          .on("finish", () => {
            const filepath = path.join(
              process.cwd(),
              "downloads",
              `${removeSpecialChars(trackNames[idx])}_${chatId}.mp3`
            );

            bot.sendMessage(chatId, `Uploading ${trackNames[idx]}...`);

            bot
              .sendAudio(
                chatId,
                filepath,
                {
                  caption:
                    "\nID: @soundcloud_download_bot\nYoutube Video To Audio Bot: @yt_video_to_audio_bot",
                },
                fileOptions
              )
              .then(() => console.log("File uploaded"))
              .catch(error => console.error(error))
              .finally(() => fs.unlinkSync(filepath));
          })
      );
    });
  });
}

module.exports = playlistDownload;
