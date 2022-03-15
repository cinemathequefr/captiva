<script>
  import _ from "lodash";
  import { get } from "../../lib/api.js";
  import { films } from "../../stores/films";
  import { global } from "../../stores/global";
  import EditingStatus from "../EditingStatus.svelte";
  import Form from "../lib/Form.svelte";
  import FilmsExportJson from "./FilmsExportJson.svelte";

  if (!$global.currentProgId) $global.currentProgId = 119; // TODO: fetch "default" currentProgId

  let cyclesResponse = get(`prog/${$global.currentProgId}/cycles`);
  let idCycle;
  let pWhenFilmsFetched; // Promesse (sans valeur de résolution) qui est tenue quand la liste des films est obtenue.

  function fetchFilmsList(e) {
    idCycle = Number(e.currentTarget.value);
    pWhenFilmsFetched = new Promise((resolve, reject) => {
      get(`cycle/${idCycle}/films`)
        .then((data) => {
          $films.currentFilmsList = _(data.data)
            .orderBy((d) => _.kebabCase(d.titre))
            .value();
          resolve();
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  function selectFilm(e) {
    $films.currentFilmPk = Number(e.currentTarget.dataset.pk);
  }
</script>

<div class="container">
  <div class="cycle-selector">
    <Form>
      <fieldset>
        <label>
          <select on:change|preventDefault={fetchFilmsList}>
            <option selected disabled value="">--- Choisir un cycle ---</option>
            {#await cyclesResponse then cycles}
              {#each cycles.data as cycle}
                <option value={cycle.id_cycle}>
                  {cycle.id_cycle}
                  -
                  {cycle.titre_cycle}
                </option>
              {/each}
            {:catch}
              Erreur
            {/await}
          </select></label
        >
      </fieldset>
    </Form>
  </div>
  <div class="films-count">
    {#await pWhenFilmsFetched then}
      {$films.currentFilmsList.length}
      {$films.currentFilmsList.length < 2
        ? "film trouvé."
        : "films trouvés."}{/await}
  </div>

  {#await pWhenFilmsFetched then}
    {#if $films.currentFilmsList.length > 0}
      <ul class="films-list">
        {#each $films.currentFilmsList as film}
          <li
            on:click={selectFilm}
            data-pk={film.pk}
            title={film.pk}
            class:selected={film.pk === $films.currentFilmPk}
          >
            <div class="title-container">
              <div class="title">
                {film.titre}
                {film.art ? `(${film.art})` : ""}
              </div>
              <div class="editing-status">
                <EditingStatus status={film.editing_status} />
              </div>
            </div>
            <div class="director">{film.realisateurs}, {film.annee}</div>
          </li>
        {/each}
      </ul>
      <div class="footer">
        <FilmsExportJson />
      </div>
    {/if}
  {:catch error}
    <p>{error.message}</p>
  {/await}
</div>

<style>
  .container {
    position: relative;
    display: flex;
    flex-wrap: nowrap;
    align-items: stretch;
    flex-direction: column;
    flex: 0 0 100%;
    overflow: hidden;
  }

  .cycle-selector {
    padding: 8px 8px 0 8px;
  }

  .films-count {
    height: 32px;
    padding: 0 16px 12px 16px;
    flex: 0 0 auto;
    overflow: hidden;
    font-size: 0.813rem;
    text-align: right;
  }

  ul {
    padding: 0 4px;
    overflow-y: auto;
  }

  li {
    background-color: #ddd;
    padding: 4px 2px 4px 12px;
    font-size: 0.913rem;
    overflow: hidden;
    line-height: 1.3;
    cursor: pointer;
  }

  li.selected,
  li.selected:nth-child(even) {
    background-color: #ffa;
  }
  /*
  li.selected,
  li.selected:nth-child(even) {
    background-color: #486;
  }

  li.selected *,
  li.selected:nth-child(even) * {
    color: #dfe;
  }
  */

  li:nth-child(even) {
    background-color: #ccc;
  }

  li:not(.selected):hover {
    background-color: #eee;
  }

  .title-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;
  }

  .title {
    flex: 0 1 auto;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: #018;
  }

  .editing-status {
    flex: 0 0 auto;
    align-self: auto;
    padding-left: 2px;
  }

  .director {
    overflow: hidden;
    color: #666;
    font-size: 0.813rem;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .footer {
    padding: 6px 0;
  }
</style>
