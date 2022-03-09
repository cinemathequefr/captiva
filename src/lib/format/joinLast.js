/**
 * joinLast
 * @version 2
 * @description
 * Fonction équivalent à la méthode `Array.join` mais permettant de spécifier un séparateur particulier pour la dernière position.
 * A la différence de la méthode native, gère correctement le cas où `arr` est undefined.
 * Cas évident : la conjonction "et" en fin de liste.
 * ATTENTION : la signature a changé depuis la version précédente (ordre des paramètres).
 * ATTENTION : la dépendance à lodash a été retirée.
 * @example (", ", " et ", ["Alice", null, "Bob", undefined, "Charles"]) => "Alice, Bob et Charles".
 * @param {Array} arr Tableau des items de liste à joindre.
 * @param {string} separator Séparateur d'items.
 * @param {string} lastSeparator Séparateur d'items pour la dernière position (entre l'avant-dernier et le dernier item).
 * @returns {string}
 */
function joinLast(arr, separator, lastSeparator) {
  separator = separator || "";
  lastSeparator = lastSeparator || separator;

  if (Array.isArray(arr) === false) return "";
  arr = arr.filter((i) => !!i);

  function j(a) {
    a = a || [];
    if (a.length < 2) return a.join("");
    var last = a.pop();
    return a.join(separator) + lastSeparator + last;
  }

  return j(arr);
}
