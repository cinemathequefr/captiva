import _ from "lodash";

/**
 * withDefaultProperties
 * @description Cette fonction permet de construire une fonction servant à donner des clés/valeurs par défaut à l'objet passé en paramètre. La valeur donnée par défaut est `null`, ce qui sert à éviter `undefined`.
 * @exemple withDefaultProperties(["name", "age", "sex"], null)({"age": 8}) => {"name": null, "age": 8, "sex": null}
 * @param {Array} keys Tableau de chaînes
 * @param {*} defaultValue
 * @return {Function} Fonction prenant un objet en paramètre et retournant un objet complété les propriétés par défaut
 */
export function withDefaultProperties(keys, defaultValue) {
  return function (o) {
    return _(
      _(keys)
        .map((d) => [d, defaultValue || null])
        .fromPairs()
        .value()
    )
      .assign(o)
      .value();
  };
}
