
import { h, Component, Fragment } from "preact";
import gopher from "../gopher.js";

import {getParty} from "../util.js"

import $ from "../../lib/qsa";


//import InactiveSenateRaces from "inactive_senate_races.sheet.json";

import DateFormatter from "../dateFormatter";

export default class BarsHouse extends Component {
  constructor(props) {
    super();

    this.state = {};
    this.onData = this.onData.bind(this);
  }

  onData(data) {
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
      return;
    }
    var results = (this.props.data);

    var house = {
      Dem: {total: 0},
      GOP: {total: 0},
      Ind: {total: 0}
    }

    // Tally vote/seat totals and gains (TODO: clean up the grossness)

  
    results.forEach(function(r) {
      if ( r.hasOwnProperty('called')  && r.called == true ) {
          var winnerParty = getParty(r.winnerParty);
          house[winnerParty].total += 1;  
      } 
    });

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

    
    return (
        <div id="embed-bop-on-page">

          <a class="link-container house" href="http://apps.npr.org/election-results-live-2022/#/house" target="_top">
            
          <div class="number-container">
            <div class="candidate dem">
              <div class="name">Dem. {house.Dem.total >= 218 ? winnerIcon : ""}</div>
              <div class="votes">{house.Dem.total}</div>
            </div>
            {house.Ind.total ?
              <div class="candidate other">
                <div class="name">Ind. {house.Ind.total >= 218 ? winnerIcon : ""}</div>
                <div class="votes">{house.Ind.total}</div>
              </div>
            : ""}
            {435 - house.Dem.total - house.GOP.total - house.Ind.total ?
              <div class="candidate uncalled">
                <div class="name">Not yet called</div>
                <div class="votes">{435 - house.Dem.total - house.GOP.total - house.Ind.total}</div>
              </div>
            : ""}
            <div class="candidate gop">
              <div class="name">GOP {house.GOP.total >= 218 ? winnerIcon : ""}</div>
              <div class="votes">{house.GOP.total}</div>
            </div>
          </div>

          <div class="bar-container">
            <div class="bar dem" style={"width: " + (house.Dem.total / 435 * 100) + "%"}>
              {/*<div class="label">Dem. {house.Dem.total >= 218 ? winnerIcon : ""}<span class="number">{house.Dem.total}</span></div>*/}
            </div>
            <div class="bar other" style={"width: " + (house.Ind.total / 435 * 100) + "%"}>
              {/*{house.Ind.total ? <div class="label">Ind. {house.Ind.total >= 218 ? winnerIcon : ""}<span class="number">{house.Ind.total}</span></div> : ""}*/}
            </div>
            <div class="bar gop" style={"width: " + (house.GOP.total / 435 * 100) + "%"}>
              {/*<div class="label">GOP {house.GOP.total >= 218 ? winnerIcon : ""}<span class="number">{house.GOP.total}</span></div>*/}
            </div>
            <div class="middle"></div>
          </div>

          <div class="chatter"><strong>218</strong> seats for majority </div>

          {/*  Ignore net gain after redistricting. 
          <div class="net-gain-container">
            <div class="gain-label">Net gain</div>
            <div class={"net-gain " + house.netGainParty}>{house.netGainParty != "none"
                ? house.netGainParty + " +" + house.netGain
                : "No change"}</div>
          </div>
          */}

        </a>
      </div>

      );
	}


}