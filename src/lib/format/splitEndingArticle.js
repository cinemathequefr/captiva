/**
 * splitEndingArticle
 * Prend une chaîne (titre avec article défini rejeté à la fin, entre parethèses)
 * et renvoie un objet avec les propriétés :
 * - titre: Titre sans la partie article
 * - art: Article (sans les parenthèses). Clé non retournée en l'absence de valeur.
 * @exemple "Vie mode, d'emploi (La)" => { titre: "Vie, mode d'emploi", art: "La"}, {"Fitzcarraldo" => {titre: "Fitzcarraldo", art: ""}]
 * @param {string} str
 * @returns {Object: {art, titre}}
 */
module.exports = function splitEndingArticle(str) {
  let output;
  let match = str.match(
    /\((A|As|Da|Das|De|Der|Die|El|Els|Gli|Het|I|L'|La|Las|Le|Les|Los|O|Os|The)\)$/i
  );

  if (Array.isArray(match) && match.length > 0) {
    output = {
      titre: str.substr(0, str.length - match[1].length - 2).trim(),
      art: match[1],
    };
  } else {
    output = { titre: str };
    // output = { titre: str, art: "" };
  }
  return output;
};
