/**
 * nbsp
 * Remplace les espaces en position d'insécable (cas usuels) par un insécable.
 * TODO : ajouter des paramètres pour des custom patterns (par exemple pour les cas du type "35 mm"...).
 * @param {string} str
 * @param {string} rep Chaîne à utiliser pour exprimer l'espace insécable (par défaut "&nbsp;").
 * @return {string}
 */
function nbsp(str, rep) {
  if (!str) return;
  if (!rep) rep = "&nbsp;";
  let o = str;
  o = o.replace(/(\x20)([\?:!;\xBB])/gi, `${rep}$2`); // Remplace un espace par un espace insécable dans les cas usuels (inclut guillemet français fermant).
  o = o.replace(/(\xAB)(\x20)/gi, `$1${rep}`); // Remplace un espace par un espace insécable après un guillemet français ouvrant.
  o = o.replace(/(\s–)/gi, `${rep}–`); // Demi-cadratins.
  o = o.replace(/(–\s)/gi, `–${rep}`); // Demi-cadratins.
  return o;
}

module.exports = nbsp;
