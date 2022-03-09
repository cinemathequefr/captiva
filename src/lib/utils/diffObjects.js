const _ = require("lodash");

/**
 * diffObjects
 * Renvoie un objet résultant de la différence entre l'objet `first` et l'objet `second`.
 * ATTENTION : sans garantie, en particulier pour un deep diff.
 * Source : https://gist.github.com/Yimiprod/7ee176597fef230d1451
 * @param {object} first
 * @param {object} second
 * @returns {object}
 *
 */
module.exports = function diffObjects(first, second) {
  function changes(first, second) {
    return _.transform(second, function (result, value, key) {
      if (!_.isEqual(value, first[key])) {
        result[key] =
          _.isObject(value) && _.isObject(first[key])
            ? changes(value, first[key])
            : value;
      }
    });
  }
  return changes(first, second);
};
