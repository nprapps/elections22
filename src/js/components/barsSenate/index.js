
import { h, Component, Fragment } from "preact";
import gopher from "../gopher.js";

import $ from "../../lib/qsa";


import InactiveSenateRaces from "inactive_senate_races.sheet.json";

import DateFormatter from "../dateFormatter";

export default class BarsSenate extends Component {
  constructor(props) {
    super();

    this.state = {};
    this.onData = this.onData.bind(this);
  }

  onData(data) {
    console.log("onData");
    console.log(data);
    var latest = Math.max(...data.results.map((r) => r.updated));
    this.setState({ ...data, latest });
  }


  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
  }

  // Lifecycle: Called just before our component will be destroyed
  componentWillUnmount() {
    // stop when not renderable
  }

  render() {
    if (!this.props.data) {
      console.log("missing this.props.data");
      return;
    }
    var results = (this.props.data);
    console.log("Results::: ");
    console.log(results);


    var senate = {
      Dem:  {total: InactiveSenateRaces.Dem, gains: 0},
      GOP: {total: InactiveSenateRaces.GOP, gains: 0},
      Other: {total: InactiveSenateRaces.Other, gains: 0}
    }

    // Tally vote/seat totals and gains (TODO: clean up the grossness)

  
    results.forEach(function(r) {
      if ( r.hasOwnProperty('called')  && r.called == true ) {
          senate[r.winnerParty].total += 1;  
      } 
    });

    senate.netGainParty = "none";
    var [topSenate] = Object.keys(senate)
      .map(k => ({ party: k, gains: senate[k].gains }))
      .sort((a, b) => b.gains - a.gains);
    if (topSenate.gains > 0) {
      senate.netGainParty = topSenate.party;
      senate.netGain = topSenate.gains;
    }

    var winnerIcon =
      <span class="winner-icon" role="img" aria-label="check mark">
        <svg
          aria-hidden="true"
          focusable="false"
          role="img"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 512 512">
          <path
            fill="#333"
            d="M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z"></path>
        </svg>
      </span>;

    console.log("senate");
    console.log(senate);
    return (
      <div id="embed-bop-on-page">

        <a class="link-container senate" href="http://apps.npr.org/election-results-live-2022/#/senate" target="_top">
                    
          <div class="number-container">
            <div class="candidate dem">
              <div class="name">Dem. {senate.Dem.total >= 51 ? winnerIcon : ""}</div>
              <div class="votes">{senate.Dem.total}</div>
            </div>
            {senate.Other.total ?
              <div class="candidate other">
                <div class="name">Ind. {senate.Other.total >= 51 ? winnerIcon : ""}</div>
                <div class="votes">{senate.Other.total}</div>
              </div>
            : ""}
            {100 - senate.Dem.total - senate.GOP.total - senate.Other.total ?
              <div class="candidate uncalled">
                <div class="name">Not yet called</div>
                <div class="votes">{100 - senate.Dem.total - senate.GOP.total - senate.Other.total}</div>
              </div>
            : ""}
            <div class="candidate gop">
              <div class="name">GOP {senate.GOP.total >= 51 ? winnerIcon : ""}</div>
              <div class="votes">{senate.GOP.total}</div>
            </div>
          </div>

          <div class="bar-container">
            <div class="bar dem" style={"width: " + (senate.Dem.total) + "%"}>
              {/*<div class="label">Dem. {senate.Dem.total >= 51 ? winnerIcon : ""}<span class="number">{senate.Dem.total}</span></div>*/}
            </div>
            <div class="bar other" style={"width: " + (senate.Other.total) + "%"}>
              {/*<div class="label">Ind. {senate.Other.total >= 51 ? winnerIcon : ""}<span class="number">{senate.Other.total}</span></div>*/}
            </div>
            <div class="bar gop" style={"width: " + (senate.GOP.total) + "%"}>
              {/*<div class="label">GOP {senate.GOP.total >= 51 ? winnerIcon : ""}<span class="number">{senate.GOP.total}</span></div>*/}
            </div>
            <div class="middle"></div>
          </div>

          <div class="chatter"><strong>51</strong> seats for majority</div>

          
          <div class="net-gain-container">
            <div class={"net-gain " + senate.netGainParty}>{senate.netGainParty != "none"
                    ? senate.netGainParty + " +" + senate.netGain
                    : "No change"}</div>
          </div>

        </a>
         
      </div>

      );
	}
}