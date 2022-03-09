module.exports = function titreArt(art, titre) {
  return !art ? titre : `${titre} (${art})`;
};
