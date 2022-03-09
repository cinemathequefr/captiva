<script>
  import _ from "lodash";
  import convertObjectValuesToNum from "../../lib/utils/convertObjectValuesToNum";
  import { get } from "../../lib/api.js";
  import { films } from "../../stores/films.js";

  let link;

  function fetchFilms() {
    let pks = _($films.currentFilmsList)
      .map((d) => d.pk)
      .value()
      .join(",");

    get(`films?pk=${pks}`).then((data) => {
      let films = convertFilmsToAppNotulesFormat(data.data);

      // https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
      link.setAttribute(
        "href",
        `data:application/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(films, null, 2)
        )}`
      );
      link.setAttribute("download", "films.json");
      link.click();
    });
  }

  /**
   * convertFilmsToAppNotulesFormat
   * Utilisé pour exporter les films d'un cycle sous forme de fichier de type _FILMS_EDIT.json.
   * @param {Array} data Données films au format JSON renvoyé par l'API.
   * @returb {Array} Données films au format JSON d'app_notules4.
   */
  function convertFilmsToAppNotulesFormat(data) {
    return (
      _(data)
        .filter((d) => d.editing_status === 2) // On ne garde que les films en état validé.
        // .tap((d) => {
        //   console.log(JSON.stringify(d, null, 2));
        // })
        .map((d) => {
          let remarque;
          if (d.mentions && d.remarque) {
            remarque = `${d.mentions}\n\n${d.remarque}`;
          } else {
            remarque = d.mentions || d.remarque;
          }

          let textes = _([
            { typeTexte: 9, texte: d.synopsis },
            { typeTexte: 99, texte: remarque },
            { typeTexte: 203, texte: d.synopsisjp },
          ])
            .filter((e) => e.texte)
            .value();

          let o = {
            idFilm: d.pk,
            titre: d.titre,
            art: d.art,
            titreVo: d.titrevo,
            artVo: d.artvo,
            realisateurs: d.realisateurs,
            annee: d.annee,
            pays: d.pays,
            generique: (d.generique && d.generique.split(", ")) || undefined,
            adaptation: d.adaptation,
            textes: textes,
          };
          // Retire les propriétés de valeur "" et null.
          o = _(o)
            .pickBy((d) => !(d === "" || d === null))
            .value();
          o = convertObjectValuesToNum(o, ["annee", "editing_status"]);
          return o;
        })
        .value()
    );
  }
</script>

<button class="mini" on:click={fetchFilms}>Export JSON</button>
<a bind:this={link} href="/">Lien</a>

<style>
  a {
    display: none;
  }
</style>
