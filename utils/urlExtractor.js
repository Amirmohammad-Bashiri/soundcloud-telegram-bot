function urlExtractor(msg) {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const url = msg.text.match(urlRegex);

  if (!url) {
    throw new Error("Please enter a valid Soundcloud");
  }

  return url[1];
}

module.exports = urlExtractor;
