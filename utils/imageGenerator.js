const sharp = require("sharp");

async function imageGenerator(imagePath) {
  await sharp(imagePath).jpeg({ quality: 100 }).resize({ width: 300 });
}

module.exports = imageGenerator;
