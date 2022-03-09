const _ = require("lodash");

/**
 * de
 * @description Renvoie la chaîne "de " ou "d'" selon le début de la chaîne passée en paramètre.
 * @example "Jean" => "de", "Alain" => "d'", "Yann" => "de"
 * @param {string} str
 * @returns {string}
 */
module.exports = function de(str) {
  if (!str) return "";
  let i0;
  const indexVoc = (pos) =>
    _.indexOf("AEIOUY", _.upperCase(_.deburr(str)).charAt(pos));
  if ((i0 = indexVoc(0)) > -1) {
    if (i0 === 5 && indexVoc(1) > -1) {
      return "de ";
    }
    return "d'";
  } else {
    return "de ";
  }
};
