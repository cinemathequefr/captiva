<script>
  import _ from "lodash";
  import { get, put } from "../../lib/api.js";
  import { films } from "../../stores/films.js";
  import Form from "../lib/Form.svelte";
  import cudm from "../../lib/format/cudm";
  import convertObjectValuesToNum from "../../../src/lib/utils/convertObjectValuesToNum.js";
  import EditingStatus from "../EditingStatus.svelte";
  import Snackbar from "../ui/Snackbar.svelte";

  let oldPk;
  let pk;
  let film;

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
      });
    }
  }

  function updateFilm(e) {
    let formData = new FormData(e.target);
    let film = [];
    for (let [k, v] of formData.entries()) {
      film.push([k, v]);
    }
    film = Object.assign(_.fromPairs(film));
    film = convertObjectValuesToNum(film, ["annee", "editing_status"]);

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
        snackbarMessage = "L'enregistrement a échoué.";
        snackbar.props.bg = "#f9c";
        visible = true;
      });
  }

  function cleanUp(e) {
    e.originalTarget.value = cudm(e.originalTarget.value);
  }

  function cleanUpSingleLine(e) {
    e.originalTarget.value = cudm(e.originalTarget.value, { singleLine: true });
  }
</script>

{#if pk}
  {#await film then film}
    <div class="container">
      <Form submit={updateFilm} options={{ textareaFitContent: true }}>
        <div>
          <a
            title="Voir la page du film sur le site"
            href="https://www.cinematheque.fr/film/{film.pk}.html"
            target="film_site_cf">{film.pk}</a
          >
          <div class="status-container"
            ><EditingStatus
              status={$films.currentFilmEditingStatus}
              size={12}
            />
            {["Non relu", "En cours", "Corrigé"][
              $films.currentFilmEditingStatus
            ]}</div
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
            /></label
          >
          <label style="flex: 0 1 10%;"
            ><div>Art</div>
            <input
              name="art"
              type="text"
              class="bold"
              value={film.art || ""}
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
            /></label
          >
          <label style="flex: 0 1 10%;"
            ><div>ArtVo</div>
            <input name="artvo" type="text" value={film.artvo || ""} /></label
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
              required
            /></label
          >
        </fieldset>
        <fieldset>
          <label>
            <div>Pays</div>
            <input name="pays" type="text" value={film.pays || ""} />
          </label>
          <label style="flex: 0 1 15%;">
            <div>Année</div>
            <input
              name="annee"
              type="text"
              value={film.annee || ""}
              required
              pattern="\d\d\d\d"
            />
          </label>
          <label style="flex: 0 1 15%;">
            <div>Durée</div>
            <input name="duree" type="text" value={film.duree || ""} />
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Générique</div>
            <input name="generique" type="text" value={film.generique || ""} />
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Adaptation</div>
            <textarea
              name="adaptation"
              class="single-line"
              on:blur={cleanUpSingleLine}>{film.adaptation || ""}</textarea
            >
          </label>
        </fieldset>

        <fieldset>
          <label>
            <div>Synopsis</div>
            <textarea name="synopsis" on:blur={cleanUp}
              >{film.synopsis || ""}</textarea
            >
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Mentions</div>
            <textarea name="mentions" on:blur={cleanUp}
              >{film.mentions || ""}</textarea
            >
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Commentaire</div>
            <textarea name="commentaire" on:blur={cleanUp}
              >{film.commentaire || ""}</textarea
            >
          </label>
        </fieldset>
        <fieldset>
          <label>
            <div>Synopsis JP</div>
            <textarea name="synopsisjp" on:blur={cleanUp}
              >{film.synopsisjp || ""}</textarea
            >
          </label>
        </fieldset>
        <!-- <input name="ageminimal" type="hidden" value={film.ageminimal || null} /> -->

        <fieldset>
          <label style="flex: 0 1 20%;"
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
    margin: 24px auto;
    width: 90%;
    max-width: 600px;
    padding: 12px;
    flex: 0 0 auto;
    align-self: flex-start;
    transform: translateX(-20%);
  }

  .status-container {
    display: inline-block;
    font-size: 0.75rem;
    padding: 0 4px 0 0;
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
</style>
