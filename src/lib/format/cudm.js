/**
 * Clean Up da Mess 4-beta version module
 * 2018-05-31
 * 2018-12-10 : Supprime tout remplacement d'espace en &nbsp; (ici, le script sert à générer du Markdown)
 * 2023-01-13 : Remplace les éventuels &nbsp; en espace + désactive le remplacement autimatique des guillemets droits en guillemets français.
 */
const _ = require("lodash");

const defaultOpts = {
  protect: {
    markdownLineBreaks: false,
  },
  singleLine: false, // true : remplace toutes les séquences de saut de ligne par un espace.
};

// Pour empêcher certaines séquences de caractères d'être affectées par les remplacements, on intercale temporairement un caractère arbitraire entre chaque caractère.
// Ceux-ci sont retirés après les remplacements en appelant la fonction `unprotect`.
const protectChar = "¤";
const protectSequences = {
  markdownLineBreaks: /\x20{2}$/gm, // Protège deux espaces en fin de ligne (saut de ligne Markdown)
};

function protect(seq, str) {
  return str.replace(seq, function (s) {
    return protectChar + s.split("").join(protectChar) + protectChar;
  });
}

function unprotect(str) {
  return str.replace(new RegExp(protectChar, "g"), "");
}

/**
 * replaceOe
 * Dans une chaîne, remplace "oe" par "œ" pour les cas usuels et en respectant la casse.
 * @param str {string} Texte
 * @return {String} Texte avec remplacements effectués
 */
function replaceOe(str) {
  var sequences = [
    "(ch)(oe)(ur)",
    "(c)(oe)(ur)",
    "(f)(oe)(tal)",
    "(f)(oe)(tus)",
    "(m)(oe)(urs)",
    "(n)(oe)(ud)",
    "()(oe)(cu)",
    "()(oe)(dip)",
    "()(oe)(dème)",
    "()(oe)(il)",
    "()(oe)(no)",
    "()(oe)(so)",
    "()(oe)(stro)",
    "()(oe)(uf)",
    "()(oe)(uvr)",
    "(s)(oe)(ur)",
    "(v)(oe)(u)",
  ];
  sequences.forEach(function (seq) {
    var find = new RegExp(seq, "gi");
    str = str.replace(find, function (a, p1, p2, p3) {
      return p1 + (p2 === "oe" ? "œ" : "Œ") + p3;
    });
  });
  return str;
}

function cudm(str, opts) {
  if (!str) return ""; //

  var o = str;

  opts = _({}).assign(defaultOpts, opts).value();
  opts.protect = _({}).assign(defaultOpts.protect, opts.protect).value();

  // Encodage des séquences protégées
  _(opts.protect)
    .toPairs()
    .filter((d) => d[1] === true)
    .map((d) => d[0])
    .forEach((d) => {
      o = protect(protectSequences[d], o);
    });

  // Remplacements

  // 2022-02-17 : remplacement des combinaisons caractère + diacritique par leur forme normalisée (1 caractère Unicode).
  o = o.replace(
    /([A-Z])[\u0300\u0301\u0302\u0303\u0304\u0308\u030b\u030c\u0322\u0327]/gi,
    (c) => c.normalize()
  );

  o = o.replace(/\xAC/g, ""); // Supprime le caractère ¬ (logical not - utilisé par Word comme césure optionnelle)
  o = o.replace(/\r\n*/g, "\n"); // Normalise la séquence saut de ligne Windows (\r\n devient \n) [utile ?]

  if (opts.singleLine === true) {
    o = o.replace(/\n+/g, " "); // Remplace les séquences de saut de ligne par un espace.
  }

  // o = o.replace(/\xA0/g, "&nbsp;"); // Remplace espace insécable Unicode par &nbsp;
  o = o.replace(/\t/g, " "); // Remplace tab par espace

  o = o.replace(/^\x20+|\x20+$/gm, ""); // Supprime espaces en début et fin de lignes
  o = o.replace(/^\n+|\n+$/g, ""); // Supprime les sauts de lignes et début et fin de document
  o = o.replace(/(\n){3,}/g, "\n\n"); // Remplace 3+ sauts de ligne par 2 sauts de ligne

  // Désactivé pour test (la même opération a lieu plus loin)
  // o = o.replace(/(\x20){2,}/g, " "); // Remplace 2+ espaces par 1 espace

  o = o.replace(/(\x20)(,|\.(?!(\.{2}|\d)))/g, "$2"); // Enlève espace devant virgule ou point (mais pas ... ni un chiffre)
  o = o.replace(/…/g, "...");
  o = o.replace(/[’‘]/g, "'");
  o = o.replace(/[“”]/g, '"');
  o = o.replace(/(\s)-([\s\,])/g, "$1–$2"); // Remplace un tiret par un demi-cadratin lorsqu'il est entouré d'espaces.

  o = replaceOe(o);

  o = o.replace(/«([^ ])/g, "« $1"); // Normalise les guillemets français
  o = o.replace(/([^ ])»/g, "$1 »");
  // o = o.replace(/\xAB\x20*/g, "« "); // Normalise les guillemets français
  // o = o.replace(/\x20*\xBB/g, " »");

  // o = o.replace(/((")(?![^<]*>))([^"]*)((")(?![^<]*>))/g, "« $3 »"); // Remplace les guillemets droits par des guillemets français sauf à l'intérieur des tags HTML.

  // o = o.replace(/(\x20)([\?:!;\xBB])/gi, "&nbsp;$2"); // Remplace un espace par un espace insécable dans les cas usuels
  // o = o.replace(/(\xAB)(\x20)/gi, "$1&nbsp;"); // Remplace un espace par un espace insécable après un guillemet français ouvrant
  // o = o.replace(/(\s–)/gi, "&nbsp;–"); // Demi-cadratins
  // o = o.replace(/(–\s)/gi, "–&nbsp;"); // Demi-cadratins

  o = o.replace(/([^\n])(\n{3,})([^\n])/g, "$1\n$3");

  // o = o.replace(/((\x20)*(&nbsp;)+(\x20)*)+/g, "&nbsp;"); // Une succession d'espaces incluant au moins &nbsp; est remplacé par &nbsp;

  o = o.replace(/<br>/g, " "); // Nettoie les éléments HTML <br>

  o = o.replace(/&nbsp;/g, " "); // Nettoie les entités &nbsp; en les remplaçant par 1 espace.

  o = o.replace(/\x20{2,}/gm, " "); // Remplace 2+ espaces par 1 espace (NB : on utilise `\x20` plutôt que `\s`, pour préserver les sauts de paragraphe markdown.)
  o = o.replace(/(^\x20|\x20$)/gm, ""); // Retire espace en début et fin de chaque ligne

  // Décodage des séquences protégées
  o = unprotect(o);
  return o;
}

module.exports = cudm;
