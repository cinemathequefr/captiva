<script>
  import _ from "lodash";
  import { get } from "../../lib/api.js";
  import { films } from "../../stores/films";
  import { global } from "../../stores/global";
  import { currentCycleId } from "../../stores/cycles"; // 2025-05-23 : TEST.
  import EditingStatus from "../EditingStatus.svelte";
  import Form from "../lib/Form.svelte";
  import FilmsExportJsonNovius from "./FilmsExportJsonNovius.svelte";
  import XButton from "../ui/XButton.svelte";
  import Refresh from "../icons/Refresh.svelte";

  import { onMount } from "svelte";
  // if (!$global.currentProgId) $global.currentProgId = 129; // TODO: fetch "default" currentProgId

  let cyclesResponse = get(`prog/${$global.currentProgId}/cycles`);
  let elCycleSelector;
  let idCycle;
  let pWhenFilmsFetched; // Promesse (sans valeur de résolution) qui est tenue quand la liste des films est obtenue.

  // 2022-12-16 : Quand le programme change, réinitialise le sélecteur de cycles et la liste des films (solution rapide mais pas propre).
  $: {
    $global;
    // $global;
    cyclesResponse = get(`prog/${$global.currentProgId}/cycles`);
    if (elCycleSelector) {
      elCycleSelector.selectedIndex = 0;
      $currentCycleId = idCycle = null;
      $films.currentFilmsList = [];
    }
  }

  onMount(() => {
    idCycle = $currentCycleId = null;
  });

  /**
   * fetchFilmsList
   * Requête la liste des films d'un cycle.
   * Le cycle est identifié par idCycle, soit directement, soit via un événement.
   * @param arg {number|Object} idCycle ou event.
   */
  function fetchFilmsList(arg) {
    if (typeof arg === "number") {
      idCycle = arg;
    } else {
      idCycle = Number(arg.currentTarget.value);
    }

    $currentCycleId = idCycle; // Inscrit idCycle dans le store global.

    pWhenFilmsFetched = new Promise((resolve, reject) => {
      get(`prog/${$global.currentProgId}/cycle/${idCycle}/films`)
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

  function refresh(e) {
    fetchFilmsList(idCycle);
  }
</script>

<div class="container">
  <div class="cycle-selector">
    <Form>
      <fieldset>
        <label>
          <select
            on:change|preventDefault={fetchFilmsList}
            bind:this={elCycleSelector}
          >
            <option selected disabled value="">--- Choisir un cycle ---</option>
            {#await cyclesResponse then cycles}
              {#each cycles.data as cycle}
                <option
                  value={cycle.id_cycle}
                  selected={cycle.id_cycle === $currentCycleId}
                >
                  {cycle.id_cycle}
                  <!-- {cycle.id_cycle} -->
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

  <div class="tools-container">
    <div class="tools-container-left">
      <XButton
        style="font-size:.75rem;"
        on:click={() => {
          $global.filmEditOrView = "view";
        }}>view</XButton
      >
      <XButton
        style="font-size:.75rem;"
        on:click={() => {
          $global.filmEditOrView = "edit";
        }}>edit</XButton
      >
    </div>

    <div class="tools-container-right">
      <div class="films-count">
        {#if idCycle}
          {#await pWhenFilmsFetched then}
            {$films.currentFilmsList.length}
            {$films.currentFilmsList.length < 2
              ? "film trouvé."
              : "films trouvés."}
            <XButton on:click={refresh}
              ><Refresh size={14} color={"#666"} /></XButton
            >
          {/await}{/if}
      </div>
    </div>
  </div>

  {#await pWhenFilmsFetched then}
    {#if $films.currentFilmsList.length > 0}
      <ul class="films-list">
        {#each $films.currentFilmsList as film, i}
          <li
            on:focus={selectFilm}
            on:click={selectFilm}
            data-pk={film.pk}
            title={film.pk}
            class:selected={film.pk === $films.currentFilmPk}
            tabindex={i + 1}
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
        <FilmsExportJsonNovius
          filename="PROG{$global.currentProgId}_CYCL{$currentCycleId}_FILMS_NOVIUS.json"
        />
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
    background-color: #aaa;
  }

  .cycle-selector {
    padding: 8px 4px 0 4px;
  }

  .films-count {
    /* height: 32px; */
    padding: 3px 16px 12px 16px;
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

  li.selected:focus,
  li.selected:nth-child(even):focus {
    background-color: #ff6;
  }

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

  .tools-container {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    margin: 0 7px 0 4px;
  }

  .tools-container-left,
  .tools-container-right {
    flex: 1 1 auto;
  }

  label {
    padding: 12px;
  }
</style>
