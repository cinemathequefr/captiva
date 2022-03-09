import _ from "lodash";

/**
 * extractArgsValue
 * Extrait les arguments passés pour lancer un processus Node.js dans la console.
 * "<val0> -<arg1> <val1> <val2> <val3> -<arg2> <val4> -<arg1> <val5> -<arg3> -<arg4>"
 * Chaque nom d'argument (clé) commence par `-` et les valeurs sont séparées par des espaces.
 * Les arguments éventuellement présents avant la première clé sont placés dans une clé `_nokey`
 * Les clés sont fusionnées et les valeurs de forme numérique converties en nombre.
 * Une clé sans valeur est conservée et renvoie un tableau vide.
 * Elle peut ainsi être évaluée comme booléen avec `!_.isUndefined`.
 * @example "12 -p 60 -c 400 401 -d" => { _nokey: [12], p: [60], c: [400, 401], d: [] }
 * @param {string} args : Chaîne des arguments (obtenue par process.argv.slice(2).join(" "))
 * @param {string} noKeyDefaultName : Nom de clé pour les valeurs sans clé (= avant la première clé), par défaut : "_nokey".
 * @returns {Object} Objet de la forme : { _nokey: [val0], arg1: [val1, val2, val3, val5], arg2: [val4], arg3: [], arg4: [] }
 */
export function extractArgsValue(args, noKeyDefaultName) {
  let o = [];
  let m = null;

  let startArg = /^([^-]+)/gi.exec(args);

  if (!!startArg) {
    startArg = startArg[0];
    let pos = startArg.length - 1;
    startArg = _.trim(startArg);
    o.push([[[noKeyDefaultName || "_nokey"], startArg.split(" ")]]);
    args = args.slice(pos, args.length);
  }

  let reg = new RegExp("-([a-z0-9]+)\\s+([^-]*)", "gi");

  do {
    m = reg.exec(args + " -");
    if (!!m) o.push([[m[1], m[2].split(" ")]]);
  } while (m);
  let res = _(o)
    .map((e) => _(e).fromPairs().value())
    .reduce(
      (o, v) =>
        _(o)
          .mergeWith(v, (v1, v2) => _.concat(v1 || [], v2))
          .value(),
      {}
    );
  res = _(res)
    .mapValues((d) => _(d).without("").value())
    .value();
  return res;
}
