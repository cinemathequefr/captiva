<script>
  import _ from "lodash";
  import { get, put } from "../../lib/api.js";
  import { films } from "../../stores/films.js";
  // import { global } from "../../stores/global";
  import { currentCycleId, cyclesList } from "../../stores/cycles";
  import Form from "../lib/Form.svelte";
  import cudm from "../../lib/format/cudm";
  import convertObjectValuesToNum from "../../../src/lib/utils/convertObjectValuesToNum.js";
  import EditingStatus from "../EditingStatus.svelte";
  import Snackbar from "../ui/Snackbar.svelte";
  import CountChar from "../lib/CountChar.svelte";
  import { clean_input_on_paste_blur } from "../../lib/clean_input_on_paste_blur.js";

  let oldPk;
  let pk;
  let film;
  let filmIdCycle = null; // Id du cycle dans le contexte duquel le film a été sélectionné.
  let cycleTitle = "";
  let valueMiniTexte = "";
  let valueMiniTexteCtxCycle = "";

  let snackbar = {
    visible: false,
    message: "",
    props: {}, // bottom, bg, color, style, timeout
  };

  $: {
    // DONE: Empêche le rechargement intempestif du component quand on sélectionne un autre cycle.
    // TODO: Améliorer.
    oldPk = pk;
    pk = $films.currentFilmPk;
    if (pk && oldPk !== pk) {
      film = get(`film/${pk}`);
      film.then((f) => {
        $films.currentFilmEditingStatus = f.editing_status;
        valueMiniTexte = f.minitexte || "";
        valueMiniTexteCtxCycle =
          _(f.minitextes_ctx_cycle).find((i) => i.id_cycle === filmIdCycle)
            ?.contenu || "";
      });
      filmIdCycle = $currentCycleId;
      cycleTitle = $cyclesList[filmIdCycle];
    }
  }

  function updateFilm(e) {
    let formData = new FormData(e.target);
    let film = [];
    for (let [k, v] of formData.entries()) {
      film.push([k, v]);
    }
    film = Object.assign(_.fromPairs(film));

    film = convertObjectValuesToNum(film, [
      "annee",
      "duree", // <--- Ajout (2024-05-23)
      "editing_status",
      "ageminimal", // Une chaîne vide (ageminimal non spécifié) renvoie 0.
      "id_boxoffice",
      "film_id_cycle",
    ]);

    if (film.ageminimal === 0) film = _.omit(film, "ageminimal");

    // 2024-05-22 : On retire les propriétés dont la valeur est une chaîne vide.
    film = _(film)
      .omitBy((v) => v === "")
      .value();

    // (NOTE du 2024-05-22) Une requête PUT (et non PATCH) aura pour effet que les champs non transmis (notamment les "" retirées ci-dessus) seront bien réécrits dans la table, avec la valeur par défaut du champ.
    put(`film/${pk}`, film)
      .then((res) => {
        snackbar.message = "Enregistré.";
        snackbar.visible = true;
        snackbar.props.bg = "#9fc";

        $films.currentFilmEditingStatus = film.editing_status;

        // Met à jour la currentFilmsList avec les données à jour du film.
        $films.currentFilmsList = _($films.currentFilmsList)
          .map((d) => {
            if (d.pk === pk) {
              return _({})
                .assign(d, {
                  titre: film.titre,
                  art: film.art,
                  realisateurs: film.realisateurs,
                  annee: film.annee,
                  editing_status: film.editing_status,
                })
                .value();
            } else {
              return d;
            }
          })
          .value();
      })
      .catch((e) => {
        console.log(e);
        snackbar.message = "L'enregistrement a échoué.";
        snackbar.props.bg = "#f99";
        snackbar.visible = true;
      });
  }

  function cleanUp(e) {
    // 2022-11-10 : un timeout est nécessaire lorsque l'événement est de type `paste`.
    setTimeout(() => {
      e.target.value = cudm(e.target.value);
    }, 1);
  }

  function cleanUpSingleLine(e) {
    setTimeout(() => {
      e.target.value = cudm(e.target.value, { singleLine: true });
    }, 1);
  }
</script>

{#if pk}
  {#await film then film}
    <div class="container">
      <Form submit={updateFilm} options={{ textareaFitContent: true }}>
        <input type="hidden" name="film_id_cycle" value={filmIdCycle} />
        <div>
          <span
            on:keyup={(e) => {}}
            class="clip"
            title="Copier dans le presse-papier"
            on:click={async () => {
              await navigator.clipboard.writeText(film.pk);
            }}>{film.pk}</span
          >
          <div class="status-container">
            <EditingStatus status={$films.currentFilmEditingStatus} size={12} />
            {["Non relu", "En cours", "Corrigé"][
              $films.currentFilmEditingStatus
            ]}
          </div>
          <a
            class="small-link"
            title="Voir la page du film sur le site"
            href="https://www.cinematheque.fr/film/{film.pk}.html"
            target="film_site_cf">Site CF</a
          >
          <a
            class="small-link"
            title="Rechercher le film sur Google"
            href="https://www.google.com/search?q={film.titrevo ||
              film.titre} {film.realisateurs} site:en.wikipedia.org"
            target="film_site_cf">Google</a
          >
        </div>
        <fieldset>
          <label
            ><div>Titre</div>
            <input
              name="titre"
              type="text"
              class="bold"
              value={film.titre || ""}
              required
              use:clean_input_on_paste_blur={{ singleLine: true }}
            /></label
          >
          <label style="flex: 0 1 10%;"
            ><div>Art</div>
            <input
              name="art"
              type="text"
              class="bold"
              value={film.art || ""}
              use:clean_input_on_paste_blur={{ singleLine: true }}
            /></label
          >
        </fieldset>
        <fieldset>
          <label
            ><div>TitreVo</div>
            <input
              name="titrevo"
              type="text"
              value={film.titrevo || ""}
              use:clean_input_on_paste_blur={{ singleLine: true }}
            /></label
          >
          <label style="flex: 0 1 10%;"
            ><div>ArtVo</div>
            <input
              name="artvo"
              type="text"
              value={film.artvo || ""}
              use:clean_input_on_paste_blur={{ singleLine: true }}
            /></label
          >
        </fieldset>
        <fieldset>
          <label>
            <div>TitreNx</div>
            <input
              name="titrenx"
              type="text"
              value={film.titrenx || ""}
            /></label
          >
        </fieldset>
        <fieldset>
          <label
            ><div>Réalisateurs</div>
            <input
              name="realisateurs"
              type="text"
              value={film.realisateurs || ""}
              use:clean_input_on_paste_blur={{ singleLine: true }}
              required
            /></label
          >
        </fieldset>
        <fieldset>
          <label>
            <div>Pays</div>
            <input
              name="pays"
              type="text"
              value={film.pays || ""}
              use:clean_input_on_paste_blur={{ singleLine: true }}
            />
          </label>
          <label style="flex: 0 1 15%;">
            <div>Année</div>
            <input
              name="annee"
              type="text"
              value={film.annee || ""}
              required
              pattern="\d\d\d\d"
              readonly={film.annee && film.annee_is_verified}
              tabindex={film.annee && film.annee_is_verified ? "-1" : "auto"}
            />
          </label>
          <label style="flex: 0 1 15%;">
            <div>Durée</div>
            <input name="duree" type="text" value={film.duree || ""} />
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Générique (+ Générique prog)</div>
            <input
              name="generique"
              type="text"
              value={film.generique || ""}
              use:clean_input_on_paste_blur={{ singleLine: true }}
            />
          </label>
        </fieldset>
        <!-- {#if film.generique !== film.generique_source} -->
        <fieldset target="">
          <label>
            <input
              style="background-color: #ccc; color:#444;"
              type="text"
              disabled
              value={film.generique_source || ""}
            /></label
          >
        </fieldset>
        <!-- {/if} -->
        <fieldset>
          <label>
            <div>Adaptation</div>
            <textarea
              name="adaptation"
              class="single-line"
              use:clean_input_on_paste_blur={{ singleLine: true }}
              >{film.adaptation || ""}</textarea
            >
          </label>
        </fieldset>

        <fieldset>
          <label>
            <div>Synopsis</div>
            <textarea name="synopsis" use:clean_input_on_paste_blur
              >{film.synopsis || ""}</textarea
            >
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div class="label-container">
              <div>Mini-texte (MT)</div>
              <CountChar value={valueMiniTexte}></CountChar>
            </div>
            <textarea
              bind:value={valueMiniTexte}
              class="hi"
              name="minitexte"
              use:clean_input_on_paste_blur
            ></textarea>
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Commentaire (texte FIFR, citation)</div>
            <textarea name="commentaire" use:clean_input_on_paste_blur
              >{film.commentaire || ""}</textarea
            >
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Mentions (restauration, ...)</div>
            <textarea name="mentions" use:clean_input_on_paste_blur
              >{film.mentions || ""}</textarea
            >
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Mini-texte JP</div>
            <textarea name="synopsisjp" use:clean_input_on_paste_blur
              >{film.synopsisjp || ""}</textarea
            >
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div class="label-container">
              <div>
                Mini-texte contextuel pour le cycle <span class="inverse">
                  {cycleTitle} ({filmIdCycle})</span
                >
              </div>
              <CountChar value={valueMiniTexteCtxCycle}></CountChar>
            </div>
            <textarea
              bind:value={valueMiniTexteCtxCycle}
              class="hi"
              name="minitexte_ctx_cycle"
              use:clean_input_on_paste_blur
            ></textarea>
          </label>
        </fieldset>

        <!-- <input name="ageminimal" type="hidden" value={film.ageminimal || null} /> -->

        <fieldset>
          <label style="flex: 0 1 25%;"
            ><div>Editing_status</div>
            <select name="editing_status" required>
              <option value="0" selected={film.editing_status === 0}
                >0-Non relu</option
              >
              <option value="1" selected={film.editing_status === 1}
                >1-En cours</option
              >
              <option value="2" selected={film.editing_status === 2}
                >2-Corrigé</option
              >
            </select></label
          >
          <div style="flex: 0 1 35%;" />

          <label style="flex: 0 1 20%;">
            <div>
              Id Allociné
              {#if !film.id_boxoffice}<a
                  href="https://www.allocine.fr/rechercher/movie/?q={film.titre}"
                  target="allocine">⚫︎</a
                >{:else}<a
                  class="check"
                  href="https://www.allocine.fr/film/fichefilm_gen_cfilm={film.id_boxoffice}.html"
                  target="allocine">⚫︎</a
                >{/if}
            </div>
            <input
              name="id_boxoffice"
              type="text"
              value={film.id_boxoffice || ""}
              pattern="\d+"
            />
          </label>

          <label style="flex: 0 1 20%;"
            ><div>Âge JP</div>
            <select name="ageminimal">
              <option value="" />
              {#each [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as age}
                <option value={age} selected={film.ageminimal === age}
                  >{age}</option
                >
              {/each}
            </select>
          </label>
        </fieldset>
        <fieldset class="buttons-container">
          <label><input type="submit" class="yes" value="Enregistrer" /></label>
        </fieldset>
      </Form>
    </div>
  {/await}
{/if}
<Snackbar bind:visible={snackbar.visible} {...snackbar.props}>
  {snackbar.message}
</Snackbar>

<style>
  .container {
    margin: 12px auto;
    width: 100%;
    max-width: 600px;
    padding: 12px;
    flex: 0 0 auto;
    align-self: flex-start;
    background-color: #ddd;
  }

  .status-container {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0 2px 0 0;
    border: solid 1px #888;
    color: #666;
    border-radius: 4px;
    user-select: none;
  }

  a {
    color: inherit;
    border: none;
    text-decoration: none;
    padding: 0;
    margin: 0;
    font-size: 1rem;
  }

  .small-link {
    display: inline-block;
    font-size: 0.875rem;
    color: #666;
    padding: 0 2px;
    text-decoration: underline;
  }

  .clip {
    display: inline-block;
    font-size: 1rem;
    color: #444;
    background-color: #ccc;
    padding: 0 4px;
    margin: 0 2px 0 0;
    cursor: copy;
  }

  fieldset {
    padding-top: 6px;
  }

  form label a {
    font-size: inherit;
    padding: 0 0 0 4px;
  }

  form label span.inverse {
    display: inline-block;
    background-color: #ccc;
    padding: 0 2px;
  }

  form label a.check {
    color: #69f;
  }

  .hi {
    background-color: #e7fef6;
    /* background-color: #cfe; */
  }

  input:disabled {
    background-color: transparent;
  }

  input:read-only {
    background-color: #ccc;
    color: #444;
  }
</style>
