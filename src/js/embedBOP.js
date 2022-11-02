import { h, render, Fragment } from "preact";
import gopher from "./components/gopher";
import $ from "./lib/qsa";
import InactiveSenateRaces from "inactive_senate_races.sheet.json";
import DateFormatter from "./components/dateFormatter";
import {getParty} from "./components/util.js"

import Sidechain from "@nprapps/sidechain";
var guest = Sidechain.registerGuest();

gopher.watch("./data/bop.json", init);

var search = new URLSearchParams(window.location.search);
var params = {
  president: null,
  inline: null,
  theme: null,
  hideCongress: null,
  onlyPresident: null
};

for (var k in params) params[k] = search.get(k);

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

async function init(results) {
  var president = {
    Dem: 0,
    GOP: 0,
    Other: 0,
    winner: ""
  }
  var house = {
    Dem: {total: 0, gains: 0},
    GOP: {total: 0, gains: 0},
    Ind: {total: 0, gains: 0}
  }
  var senate = {
    Dem:  {total: InactiveSenateRaces.Dem, gains: 0},
    GOP: {total: InactiveSenateRaces.GOP, gains: 0},
    Ind: {total: InactiveSenateRaces.Other, gains: 0}
  }

  // Tally vote/seat totals and gains (TODO: clean up the grossness)

  results.president.forEach(r => president[r.winner] += r.electoral);

  // Do we need an asterisk b/c Evan McMullin won in 2022? 
  var mcmullinWon = false;

  results.house.forEach(function(r) {
    // fix this

    var winnerParty = getParty(r.winner);
    var priorWinner = getParty(r.previous)
    house[winnerParty].total += 1;


    if (r.winner !== r.previous) {
      house[winnerParty].gains += 1;
      house[priorWinner].gains -= 1;
    }
  });

  results.senate.forEach(function(r) {

    var winnerParty = getParty(r.winner);
    console.log(r);


    if ( r.hasOwnProperty('winner') ) {
      if (r.id == '46329' && r.winner == 'Ind') {
        console.log("embedbop.js: Evan McMullin is victor, bar chart asterisk")
        mcmullinWon = true;
      }
    }


    // fix this too
    senate[winnerParty].total += 1;
    if (r.previous !== "Dem" && r.previous !== "GOP") {
      // console.log("senate", r)
      r.previous = "Ind";
    }

    if (r.winner !== r.previous) {
      senate[r.winner].gains += 1;
      senate[r.previous].gains -= 1;
    }
  });

  senate.Ind.width = senate.Ind.total;
    if (mcmullinWon) {
      senate.Ind.width = (senate.Ind.total)-1;
  }

  house.netGainParty = "none";
  var [topHouse] = Object.keys(house)
    .map(k => ({ party: k, gains: house[k].gains }))
    .sort((a, b) => b.gains - a.gains);
  if (topHouse.gains > 0) {
    house.netGainParty = topHouse.party;
    house.netGain = topHouse.gains;
  }

  senate.netGainParty = "none";
  var [topSenate] = Object.keys(senate)
    .map(k => ({ party: k, gains: senate[k].gains }))
    .sort((a, b) => b.gains - a.gains);
  if (topSenate.gains > 0) {
    senate.netGainParty = topSenate.party;
    senate.netGain = topSenate.gains;
  }

  var container = $.one("main.embed-bop");

  var template = <>

    <div class={(params.inline ? "inline " : "") + (params.theme ? "dark " : "") + (params.hideCongress? "hide-congress" : "") + (params.onlyPresident? "only-pres" : "")}>
      <div class="container">

        {/*PRESIDENT*/}

        {params.president && <>
          <a class="link-container president" href="http://apps.npr.org/elections20-interactive/#/president" target="_top">
            
            <h3>President</h3>
            
            <div class="number-container">
              <div class="candidate dem">
                <div class="name">Biden {president.Dem >= 270 ? winnerIcon : ""}</div>
                <div class="votes">{president.Dem}</div>
              </div>
              {president.Other ?
                <div class="candidate other">
                  <div class="name">Other {president.Other >= 270 ? winnerIcon : ""}</div>
                  <div class="votes">{president.Other}</div>
                </div>
              : ""}
              {/*{538 - president.Dem - president.GOP - president.Other ?
                <div class="candidate uncalled">
                  <div class="name">Not Yet Called</div>
                  <div class="votes">{538 - president.Dem - president.GOP - president.Other}</div>
                </div>
              : ""}*/}
              <div class="candidate gop">
                <div class="name">Trump {president.GOP >= 270 ? winnerIcon : ""}</div>
                <div class="votes">{president.GOP}</div>
              </div>
            </div>

            <div class="bar-container">
              <div class="bar dem" style={"width: " + (president.Dem / 538 * 100) + "%"}></div>
              <div class="bar other" style={"width: " + (president.Other / 538 * 100) + "%"}></div>
              <div class="bar gop" style={"width: " + (president.GOP / 538 * 100) + "%"}></div>
              <div class="middle"></div>
            </div>

            <div class="chatter"><strong>270</strong> electoral votes to win</div>

            <div class="full-link"><a>See full results ›</a></div>
          </a>
          <div class="divider" />
        </>}

        {/*HOUSE*/}

        <a class="link-container house" href="http://apps.npr.org/election-results-live-2022/#/house" target="_top">
          
          <h3>House</h3>
  
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
           {/* {435 - house.Dem - house.GOP - house.Ind ?
              <div class="candidate uncalled">
                <div class="name">Not Yet Called</div>
                <div class="votes">{435 - house.Dem - house.GOP - house.Ind}</div>
              </div>
            : ""}*/}
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

          <div class="full-link"><a>See full results ›</a></div>

          {/*  Ignore net gain after redistricting. 
          <div class="net-gain-container">
            <div class="gain-label">Net gain</div>
            <div class={"net-gain " + house.netGainParty}>{house.netGainParty != "none"
                ? house.netGainParty + " +" + house.netGain
                : "No change"}</div>
          </div>
          */}

        </a>
        <div class="second divider" />

        {/*SENATE*/}

        <a class="link-container senate" href="http://apps.npr.org/election-results-live-2022/#/senate" target="_top">
          
          <h3>Senate</h3>
          
          <div class="number-container">
            <div class="candidate dem">
              <div class="name">Dem. {senate.Dem.total >= 51 ? winnerIcon : ""}</div>
              <div class="votes">{senate.Dem.total}</div>
            </div>
            {senate.Ind.total ?
              <div class="candidate other">
                <div class="name">Ind. {senate.Ind.total >= 51 ? winnerIcon : ""}</div>
                <div class="votes">{senate.Ind.total}{mcmullinWon ? "*" : ""}</div>
              </div>
            : ""}
            {/*{100 - senate.Dem - senate.GOP - senate.Ind ?
              <div class="candidate uncalled">
                <div class="name">Not Yet Called</div>
                <div class="votes">{435 - senate.Dem - senate.GOP - senate.Ind}</div>
              </div>
            : ""}*/}
            <div class="candidate gop">
              <div class="name">GOP {senate.GOP.total >= 51 ? winnerIcon : ""}</div>
              <div class="votes">{senate.GOP.total}</div>
            </div>
          </div>

          <div class="bar-container">
            <div class="bar dem" style={"width: " + (senate.Dem.total) + "%"}>
              {/*<div class="label">Dem. {senate.Dem.total >= 51 ? winnerIcon : ""}<span class="number">{senate.Dem.total}</span></div>*/}
            </div>
            <div class="bar other" style={"width: " + (senate.Ind.width) + "%"}>
              {/*<div class="label">Ind. {senate.Ind.total >= 51 ? winnerIcon : ""}<span class="number">{senate.Ind.total}</span></div>*/}
            </div>
            <div class="bar gop" style={"width: " + (senate.GOP.total) + "%"}>
              {/*<div class="label">GOP {senate.GOP.total >= 51 ? winnerIcon : ""}<span class="number">{senate.GOP.total}</span></div>*/}
            </div>
            <div class="middle"></div>
          </div>

          <div class="chatter"><strong>51</strong> seats for majority</div>

          <div class="full-link"><a>See full results ›</a></div>
          <div class="net-gain-container">
            <div class="gain-label">Net gain</div>
            <div class={"net-gain " + senate.netGainParty}>{senate.netGainParty != "none"
                    ? senate.netGainParty + " +" + senate.netGain
                    : "No change"}</div>
          </div>

        </a>
      </div>

      <div class="source">Source: AP (as of <DateFormatter value={results.latest} />)</div>
      {mcmullinWon && <div id="mcmullin_note" class="source"><span style="color:#15b16e; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-weight: 400; font-size: 20px; font-weight: bold;">*</span><span id="mcmullin_text" style="font-style:italic;">In the Senate, Bernie Sanders (I-VT) and Angus King (I-ME) caucus with Democrats. The bar chart does not include newly-elected Evan McMullin (I-UT), who has said he will not caucus with either party.</span></div> }

    </div>
  </>;
  
  render(template, container);
}