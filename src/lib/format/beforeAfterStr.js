/**
 * beforeAfterStr
 * @version 2
 * @description
 * Ajoute des chaînes avant et après une chaîne si celle-ci existe.
 * Fonction utilitaire pour formater un contenu variable, et ne pas formater en l'absence de contenu.
 * ATTENTION : la signature a changé depuis la version précédente (ordre des paramètres).
 * @param {string} str Chaîne à traîter
 * @param {string|function} before Chaîne à ajouter avant (ou fonction)
 * @param {string|function} after Chaîne à ajouter après (ou fonction)
 * @return {string}
 */
module.exports = function beforeAfterStr(str, before, after) {
  if (typeof str !== "string" || str === "") return "";
  let _before = before;
  let _after = after;
  if (typeof before !== "function") before = () => _before || "";
  if (typeof after !== "function") after = () => _after || "";
  return before(str) + str + after(str);
};
