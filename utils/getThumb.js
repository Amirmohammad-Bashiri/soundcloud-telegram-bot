const fs = require("fs");
const request = require("request");

const imageGenerator = require("./imageGenerator");

function getThumb(url, path) {
  request
    .head(url, () => {
      request(url).pipe(fs.createWriteStream(path));
    })
    .on("complete", () => {
      imageGenerator(path)
        .then(() => {
          console.log("Generated Image");
        })
        .catch(error => {
          console.error(error);
        });
    });
}

module.exports = getThumb;