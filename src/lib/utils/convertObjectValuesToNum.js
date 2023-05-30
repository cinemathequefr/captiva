const _ = require("lodash");

/**
 * convertObjectValuesToNum
 * Renvoie une copie de l'objet `o` dans laquelle les valeurs des clés listées dans `keys` sont convertit au format numérique.
 * Si une clé listée dans `keys` n'est pas présente dans l'objet, elle est sans effet.
 * Si la conversion d'une valeur échoue, la valeur d'origine (chaîne) est renvoyée.
 * ATTENTION : une chaîne vide est convertie en 0 (effets potentiellement indésirables).
 * Utilisé typiquement sur des données provenant d'un formulaire HTML, dans lequel les champs numériques sont exprimés par une chaîne.
 * @param o {Object}
 * @param keys {Array:string}
 */
module.exports = function convertObjectValuesToNum(o, keys) {
  return _(_.cloneDeep(o))
    .mapValues((v, k) => {
      const conv = Number(v); // Nombre ou isNaN
      return _.indexOf(keys, k) > -1 ? (isNaN(conv) ? v : conv) : v;
    })
    .value();
};
