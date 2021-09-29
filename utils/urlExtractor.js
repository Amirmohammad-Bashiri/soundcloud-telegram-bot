function urlExtractor(msg) {
  const urlRegex = /(https?:\/\/[^ ]*)/;
  const url = msg.text.match(urlRegex);

  console.log("USER INPUT", msg.text);

  if (!url) {
    return;
  }

  console.log(url[1]);
  return url[1];
}

module.exports = urlExtractor;
