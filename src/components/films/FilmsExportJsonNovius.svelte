<script>
  import _ from "lodash";
  import { marked } from "marked";
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
    let o = _(data)
      // .filter((d) => d.editing_status === 2) // On ne garde que les films en état validé.
      .map((d) => {
        let synopsis = d.synopsis || undefined;
        let minitexte = d.minitexte || undefined;
        let commentaire = d.commentaire || undefined;
        let mentions = d.mentions || undefined;
        let synopsisjp = d.synopsisjp || undefined;
        let ageMinimal =
          d.ageMininal === 0 ? undefined : d.ageMinimal || undefined;

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
          synopsis: toHTML(minitexte || synopsis || synopsisjp), // Ordre de priorité des textes à mettre dans le champ "synopsis" du site (qui sert de champ texte principal).
          texte: toHTML(commentaire),
          mention: toHTML(mentions),
          ageMinimal,
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
                ["duree", "ageMinimal"],
                // ["synopsis", "texte", "mention", "duree", "ageMinimal"],
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
    // Convertit Markdown -> HTML
    // L'option inline=true renvoie du HTML inline (sans <p></p> autour). Utile pour le champ adaptation.
    if (!s || s === "") return "";
    const html = inline ? marked.parseInline : marked.parse;

    let o = html(s); // Conversion Markdown -> HTML.
    o = o.replace(/&#39;/g, "'"); // Remplacement de l'entité apostrophe &#39; (générée par marked) par son caractère.
    o = o.replace(/\n/g, ""); // Remplace de \n généré par marked.
    o = o.replace(/<hr>/g, `<hr class="short">`); // Donne la classe voulue à l'élément hr.
    o = nbsp(o); // Placement des espaces insécables.
    return o;
  }
</script>

<button class="mini" on:click={fetchFilms}>Export Novius</button>
<a bind:this={link} href="/">Lien</a>

<style>
  a {
    display: none;
  }
</style>
