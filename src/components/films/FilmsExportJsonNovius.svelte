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
      let films = convertFilmsToNoviusFormat(data.data);

      // https://stackoverflow.com/questions/2897619/using-html5-javascript-to-generate-and-save-a-file
      // link.setAttribute(
      //   "href",
      //   `data:application/json;charset=utf-8,${encodeURIComponent(
      //     JSON.stringify(films, null, 2)
      //   )}`
      // );
      // link.setAttribute("download", "films.json");
      // link.click();
    });
  }

  function convertFilmsToNoviusFormat(data) {
    // TODO (cf journal 2022-03-17)
    console.log(JSON.stringify(data[0], null, 2));
  }
</script>

<button class="mini" on:click={fetchFilms}>Export Novius</button>
<a bind:this={link} href="/">Lien</a>

<style>
  a {
    display: none;
  }
</style>
