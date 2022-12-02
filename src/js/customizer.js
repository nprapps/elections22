import { h, Fragment, render, Component } from "preact";
import $ from "./lib/qsa";
import stateSheet from "states.sheet.json";
import strings from "strings.sheet.json";
import Sidechain from "@nprapps/sidechain";

var axios = require("axios");

var lambdaUrl = strings.lambda_url;
var lambdaCssUrl = strings.lambda_css_url;

class Customizer extends Component {
  constructor() {
    super();
    this.state = {
      mode: "governor",
      selectedState: "AK",
      selectedOffice: "",
      races: [],
      raceID: null,
      dark: false,
      showPresident: false,
      onlyPresident: false,
      inline: false,
      image: null,
      loadingImage: false,
      imageError: false,
    }

    this.selectStatePage = this.selectStatePage.bind(this);
    this.selectStateOffice = this.selectStateOffice.bind(this);
    this.loadStateRaces = this.loadStateRaces.bind(this);
    this.selectRace = this.selectRace.bind(this);
  }

  componentDidMount() {
    this.loadStateRaces(this.state.selectedState);
  }

  componentDidUpdate(prevProps, prevState) {
    if ( (prevState.mode !== this.state.mode)
      || (prevState.selectedState !== this.state.selectedState)
      || (prevState.selectedOffice !== this.state.selectedOffice)
      || (prevState.dark !== this.state.dark)
      || (prevState.showPresident !== this.state.showPresident)
      || (prevState.onlyPresident !== this.state.onlyPresident)
      || (prevState.inline !== this.state.inline)
      || (prevState.raceID !== this.state.raceID )
    ) {
      this.setState({ image: null })
      this.setState({ loadingImage: false })
      this.setState({ imageError: false })
    }
  }

  selectStatePage(e) {
    this.setState({
      selectedState: e.target.value,
      selectedOffice: null,
      races: []
    });
    this.loadStateRaces(e.target.value);
  }

  selectStateOffice(e) {
    this.setState({ selectedOffice: e.target.value })
  }

  selectRace(e) {
    this.setState({ raceID: e.target.value })
  }

  setFlag(flag, value) {
    this.setState({ [flag]: value });
  }

  async loadStateRaces(state) {
    this.setState({ selectedState: state, races: [], raceID: null });
    var response = await fetch(`./data/states/${state}.json`);
    var json = await response.json();

    // Hack for special election 
    json.results.forEach(function (race) {
      if (race.id == '12597') {
        race.seat = "(Dec. 6 runoff)";
        race.seatNumber = -1;
      }
      if (race.id == '12588') {
        race.seat = "(Nov. 8 election)";
        race.seatNumber = -1;
      }      

    });

    this.setState({ races: json.results });
  }

  async getScreenshot(src) {
    this.setState({ image: null });
    this.setState({ loadingImage: true });
    this.setState({ imageError: false });

    try {
      // TODO: does this need to be axios
      var response = await axios({
        url: lambdaUrl,
        params: {
          'embedUrl': src,
          'cssUrl': lambdaCssUrl
        },
        headers: {
          Accept: "*/*",
          'x-npr': {}
        },
        validateStatus: status => status == 200,
      });
      let imageStr = `data:image/png;base64, ${response.data}`;
      this.setState({ image: imageStr })
    } catch (err) {
      this.setState({ image: null })
      this.setState({ imageError: true })
    }
  }

  embeds(src, id) {
    return (<>
      <h2>Embeds</h2>
      <div style="display: grid; grid-template-columns: 1fr 1fr; grid-gap: 8px">
        <div>
          <h3>Pym</h3>
          <textarea rows="6" style="width:100%">
          {`<p
            data-pym-loader
            data-child-src="${src}"
            id="${id}">
              Loading...
          </p>
          <script src="https://pym.nprapps.org/npr-pym-loader.v2.min.js"></script>`.replace(/\s{2,}|\n/g, " ")}
          </textarea>
        </div>
        <div>
          <h3>Sidechain</h3>
          <textarea rows="6" style="width:100%">
          {`<side-chain src="${src}"></side-chain>
          <script src="https://apps.npr.org/election-results-live-2022/sidechain.js"></script>`.replace(/\s{2,}|\n/g, " ")}
          </textarea>
        </div>
      </div>
    </>);
  }

  socialShare(screenshotSrc) {
    return (<>
      <h2>Social image</h2>
      <div>
        <button onClick={() => this.getScreenshot(screenshotSrc).then(() => {
          this.setState({ loadingImage: false });
        })}>Get social image</button>

        <div class={ `social-image-preview ${this.state.loadingImage || this.state.image || this.state.imageError  ? '' : 'is-hidden'}`}>
          {
            this.state.loadingImage
              ? <div class="loading"><div class='loader'></div>Loading image...this may take a little while</div>
              : ""
          }
          {
            this.state.image
              ? ( <a id="download" download="image.png" href={`${this.state.image}`}><img class="preview-image" src={`${this.state.image}`} alt="generated social image"/></a> )
              : ""
          }
          {
            this.state.imageError
              ? <div class="error">There was an error loading the image. Try again?</div>
              : ""
          }
        </div>

      </div>
    </>);
  }

  board(free, props, state) {
    var { url } = free;
    var src = url + `#/${state.mode}`;
    var screenshotSrc = src.indexOf('localhost') > -1
      ? `https://apps.npr.org/election-results-live-2022/#/${state.mode}`
      : src

    return (<>
      {this.embeds(src, `responsive-embed-election-${state.selectedState}-${state.mode}`)}
      {this.socialShare(screenshotSrc)}
      <h2>Preview</h2>
      <side-chain
        key={state.raceID}
        src={src}
      />
    </>);
  }

  statePage(free, props, state) {
    var { url, offices, postals } = free;
    var src = `${url}#/states/${state.selectedState}/${state.selectedOffice || ''}`;
    var screenshotSrc = src.indexOf('localhost') > -1
      ? `https://apps.npr.org/election-results-live-2022/#/states/${state.selectedState}/${state.selectedOffice || ''}`
      : src

    return (<>
      <div class="state-select">
        <select value={state.selectedState} onInput={this.selectStatePage}>
          {postals.map(s => <option value={s}>{stateSheet[s].name}</option>)}
        </select>
        <select value={state.selectedOffice} onInput={this.selectStateOffice}>
          {offices.map(([data, label]) => (
            <option value={data}>{label}</option>
          ))}
        </select>
      </div>
      {this.embeds(src, `responsive-embed-election-${state.selectedState}-${state.selectedOffice || "X"}`)}
      {this.socialShare(screenshotSrc)}
      <h2>Preview</h2>
      <side-chain
        key={state.selectedState}
        src={src} />
    </>);
  }

  race(free, props, state) {
    var { url, postals } = free;
    var src = "";
    if (state.raceID) {
      var assembly = new URL(url + "./embed.html");
      assembly.searchParams.set("file", `states/${state.selectedState}`);
      assembly.searchParams.set("race", state.raceID);
      src = assembly.toString();
    }
    var screenshotSrc = src;
    if (state.raceID && src.indexOf('localhost') > -1) {
      var assembly = new URL('https://apps.npr.org/election-results-live-2022/' + "./embed.html");
      assembly.searchParams.set("file", `states/${state.selectedState}`);
      assembly.searchParams.set("race", state.raceID);
      screenshotSrc = assembly.toString();
    }
    return (<>
      <div class="state-select">
        <select value={state.selectedState} onInput={e => this.loadStateRaces(e.target.value)}>
          {postals.map(s => <option value={s}>{stateSheet[s].name}</option>)}
        </select>
        <select value={state.selectedRace} onInput={this.selectRace}>
          <option value="">Select an office</option>
          {state.races.map(r => <option value={r.id}>
            {`${strings["office-" + r.office]} ${r.seat ? r.seat : ""}`}
          </option>)}
        </select>
      </div>
      {state.raceID && <>
        {this.embeds(src, `responsive-embed-election-${state.selectedState}-${state.raceID}`)}
        {this.socialShare(screenshotSrc)}
        <h2>Preview</h2>
        <side-chain
          key={state.raceID}
          src={src}
        />
      </>}
    </>);
  }

  sidebar(free, props, state) {
    var { url } = free;
    var src = new URL(url + `embedBOP.html`);
    if (state.dark) src.searchParams.set("theme", "dark");
    if (state.showPresident) src.searchParams.set("president", false); // Never show the president in 22
    if (state.inline) src.searchParams.set("inline", true)
    if (state.onlyPresident) src.searchParams.set("onlyPresident", true);

    var screenshotSrc = src.toString();
    if (src.toString().indexOf('localhost') > -1) {
      var screenshotUrl = new URL('https://apps.npr.org/election-results-live-2022/' + `embedBOP.html`);
      if (state.dark) screenshotUrl.searchParams.set("theme", "dark");
      if (state.showPresident) screenshotUrl.searchParams.set("president", true);
      if (state.inline) screenshotUrl.searchParams.set("inline", true)
      if (state.onlyPresident) screenshotUrl.searchParams.set("onlyPresident", true);
      screenshotSrc = screenshotUrl.toString();
    }

    return (<>
      <div class="options">
        <input
          id="bop_dark"
          type="checkbox"
          value={state.dark}
          onInput={() => this.setFlag("dark", !state.dark)} />
        <label for="bop_dark">Dark theme</label>

        <input
          id="bop_triplet"
          type="checkbox"
          value={state.inline}
          onInput={() => this.setFlag("inline", !state.inline)} />
        <label for="bop_inline">Row layout</label>
      </div>
      {this.embeds(src, "responsive-embed-election-congress")}
      {this.socialShare(screenshotSrc)}
      <h2>Preview</h2>
      <side-chain
        src={src}
      />
    </>);
  }

  homepage(free, props, state) {
    var { url } = free;
    var src = new URL(url + `homepage.html`);
    var screenshotSrc = src.toString().indexOf('localhost') > -1
      ? 'https://apps.npr.org/election-results-live-2022/homepage.html'
      : src.toString()
    return (<>
      {this.embeds(src, "responsive-embed-electoral-college")}
      {this.socialShare(screenshotSrc)}
      <h2>Preview</h2>
      <side-chain
        src={src}
      />
    </>);
  }

  render(props, state) {
    var postals = Object.keys(stateSheet).filter(s => !stateSheet[s].district);
    var modes = [
      ["governor", "Governor"],
      ["senate", "Senate"],
      ["house", "House"],
      ["state", "State page"],
      ["race", "Individual race"],
      ["sidebar", "Balance of power"]
    ];

    var offices = [
      ["", "Key Races"],
      ["S", "Senate"],
      ["G", "Governor"],
      ["H", "House"],
      ["I", "Ballot initiatives"]
    ];

    var url = new URL(".", window.location.href).toString();

    var { selectedState, mode } = this.state;

    var freeVariables = { url, offices, modes, postals };

    var modePartials = {
      "state": "statePage",
      "race": "race",
      "sidebar": "sidebar",
      "homepage": "homepage"
    };

    var route = modePartials[mode] || "board";

    return (<>
      <div class="mode-select">
      {modes.map(([data, label]) => (<>
        <input
          type="radio"
          name="mode"
          onInput={() => this.setState({ mode: data, selectedOffice: '' })}
          id={`mode-${data}`}
          checked={data == state.mode}
        />
        <label for={`mode-${data}`}>{label}</label>
      </>))}
      </div>
      {this[route](freeVariables, props, state)}
    </>)
  }
}

render(<Customizer />, $.one("main"));
