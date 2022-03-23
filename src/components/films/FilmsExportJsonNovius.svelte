<script>
  import _ from "lodash";
  import { marked } from "marked";
  // import convertObjectValuesToNum from "../../lib/utils/convertObjectValuesToNum";
  import nbsp from "../../lib/format/nbsp";
  import { get } from "../../lib/api.js";
  import { films } from "../../stores/films.js";
  export let filename = "films.json";

  let link;

  function fetchFilms() {
    let pks = _($films.currentFilmsList)
      .map((d) => d.pk)
      .value()
      .join(",");

    get(`films?pk=${pks}`).then((data) => {
      let films = convertFilmsToNoviusFormat(data.data);

      // https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
      link.setAttribute(
        "href",
        `data:application/json;charset=utf-8,${encodeURIComponent(
          JSON.stringify(films, null, 2)
        )}`
      );
      link.setAttribute("download", filename);
      link.click();
    });
  }

  function convertFilmsToNoviusFormat(data) {
    // TODO (cf journal 2022-03-17)

    let o = _(data)
      .filter((d) => d.editing_status === 2) // On ne garde que les films en état validé.
      .map((d) => {
        let mentions = d.mentions || "";
        let commentaire = d.commentaire || "";
        return {
          pk: d.pk,
          titre: d.titre,
          article: d.art || "",
          titreVoComplet: [
            (!d.artvo
              ? d.titrevo
              : d.artvo === "L'"
              ? `${d.artvo}${d.titrevo}`
              : `${d.artvo} ${d.titrevo}`) || "",
            d.titrenx ? ` [${d.titrenx}]` : "",
          ].join(""),
          realisateur: d.realisateurs,
          pays: d.pays,
          annee: Number(d.annee) || null,
          duree: Number(d.duree) || null,
          generique: d.generique ? `<p>Avec ${d.generique}.</p>` : "",
          adaptation: toHTML(d.adaptation, true),
          // `synopsis` prend la valeur de synopsisjp seulement s'il n'y a de valeur synopsis.
          synopsis: toHTML(
            d.synopsisjp &&
              d.synopsisjp !== "" &&
              (!d.synopsis || d.synopsis === "")
              ? d.synopsisjp
              : d.synopsis
          ),
          texte:
            toHTML(
              `${mentions}${
                mentions && commentaire ? "\n\n" : ""
              }${commentaire}`
            ) || undefined,
        };
      })
      .value();

    // Elimine les propriétés de certains champs si leur valeur est null, undefined, "" ou 0 (= actuellement la valeur vide pour âge minimal).
    // Ce mécanisme permet de préserver leur éventuelle valeur déjà existante sur le site.
    o = _(o)
      .map((d) =>
        _(d)
          .omitBy((v, k) => {
            if (
              _.indexOf(
                ["synopsis", "texte", "mention", "duree", "ageMinimal"],
                k
              ) > -1 &&
              (v === "" || _.isNil(v) || v === 0)
            ) {
              return true;
            }
            return false;
          })
          .value()
      )
      .value();

    return o;
  }

  function toHTML(s, inline = false) {
    // Convertit Markdow -> HTML
    // Applique cudm (pour enlever trailing /n provenant de `marked`.)
    // Applique nbsp.
    // Remplace son entité par `'`.
    // L'option inline=true renvoie du HTML inline. Utile pour le champ adaptation.
    if (!s || s === "") return "";
    const html = inline ? marked.parseInline : marked.parse;
    return nbsp(html(s)).replace(/&#39;/g, "'").replace(/\n/g, "");
  }
</script>

<button class="mini" on:click={fetchFilms}>Export Novius</button>
<a bind:this={link} href="/">Lien</a>

<style>
  a {
    display: none;
  }
</style>
