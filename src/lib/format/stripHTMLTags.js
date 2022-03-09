module.exports = function stripHTMLTags(str) {
  if (typeof str === "string") return str.replace(/(<([^>]+)>)/gi, "");
};
