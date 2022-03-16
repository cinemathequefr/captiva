<script>
  import SplitPane from "../components/ui/SplitPane.svelte";
  import FilmEdit from "../components/films/FilmEdit.svelte";
  import FilmsNav from "../components/films/FilmsNav.svelte";
</script>

<svelte:head><title>Captiva - Films</title></svelte:head>

<div class="container">
  <SplitPane leftInitialSize="25%">
    <svelte:fragment slot="left">
      <FilmsNav />
    </svelte:fragment>
    <svelte:fragment slot="right">
      <FilmEdit />
    </svelte:fragment>
  </SplitPane>
</div>

<!-- <div class="container">
  <div class="left">
    <FilmsNav />
  </div>
  <div class="right">
    <FilmEdit />
  </div>
</div> 
-->
<style>
  .container {
    display: flex;
    flex: 0 0 100%;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: stretch;
  }

  /*
  .left {
    flex: 0 0 25%;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background-color: #aaa;
  }
  .right {
    flex: 0 0 75%;
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
    background-color: #ddd;
  }
  */
</style>
