<script>
  import SplitPane from "../components/ui/SplitPane.svelte";
  import FilmView from "../components/films/FilmView.svelte";
  import FilmEdit from "../components/films/FilmEdit.svelte";
  import FilmsNav from "../components/films/FilmsNav.svelte";
  import { global } from "../stores/global";
</script>

<svelte:head><title>Captiva - Films</title></svelte:head>

<div class="container">
  <SplitPane leftInitialSize="25%">
    <svelte:fragment slot="left">
      <FilmsNav />
    </svelte:fragment>
    <svelte:fragment slot="right">
      {#if $global.filmEditOrView === "edit"}
        <FilmEdit />{:else}<FilmView />{/if}
    </svelte:fragment>
  </SplitPane>
</div>

<style>
  .container {
    display: flex;
    flex: 0 0 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
  }
</style>
