/**
 * mdHTML_ital
 * Replaces every "_..._" in a string by "<em>...</em>".
 * Naive interpretation of Markdown.
 * @param {*} str
 * @returns str
 */
module.exports = function mdHTML_ital(str) {
  if (typeof str === "string") {
    return str.replace(/(_)([^_]+)(_)/gi, "<em>$2</em>");
  }
};
