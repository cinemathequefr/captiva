<script>
  import _ from "lodash";
  import { get } from "../../lib/api.js";
  import { films } from "../../stores/films.js";

  let pk;
  let film;
  let oldPk;

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
</script>

<!-- {JSON.stringify($films, null, 2)} -->
{#if pk}
  {#await film then film}
    <div class="container">
      <div>{film.art} {film.titre}</div>
      <div>({film.artvo} {film.titrevo})</div>
      <div>de {film.realisateurs}</div>
      <div>{film.pays} / {film.annee} / {film.duree}</div>
      <div>{film.adaptation}</div>
      <div>Avec {film.generique}.</div>
      <div>{film.synopsis}</div>
      <div>{film.commentaire}</div>
      <div>{film.mentions}</div>
      <div>{film.synopsisjp}</div>
    </div>
  {/await}
{/if}

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
</style>
