import { h, Component, Fragment } from "preact";
import gopher from "../gopher.js";
import Results from "../resultsBoardNamed";
import BalanceOfPower from "../balanceOfPower";
import BarsHouse from "../barsHouse";
import TestBanner from "../testBanner";
import DateFormatter from "../dateFormatter";
import BoardKey from "../boardKey";
import { getBucket } from "../util";

export default class BoardHouse extends Component {
  constructor(props) {
    super();

    this.state = {};
    this.onData = this.onData.bind(this);
  }

  onData(data) {
    console.log("boardHouse: ondata");
    var latest = Math.max(...data.results.map((r) => r.updated));
    this.setState({ ...data, latest });
  }

  // Lifecycle: Called whenever our component is created
  async componentDidMount() {
    gopher.watch(`./data/house.json`, this.onData);
  }

  // Lifecycle: Called just before our component will be destroyed
  componentWillUnmount() {
    // stop when not renderable
    gopher.unwatch(`./data/house.json`, this.onData);
  }

  render() {

    var { results = [], test, latest, alert } = this.state;

    if (!alert) {
      alert = '';
    }
    if (alert.includes("~")) {
      alert = '';
    } 

    var sorted = results.slice().sort((a, b) =>
      a.state > b.state ? 1 :
      a.state < b.state ? -1 :
      parseInt(a.seatNumber) > parseInt(b.seatNumber) ? 1 :
      parseInt(a.seatNumber) < parseInt(b.seatNumber) ? -1 : 0
    );

    // Don't show flipped races in '22 after redistricting.
    //sorted = sorted.filter(r => r.keyRace || (r.winnerParty && r.winnerParty != r.previousParty));
    sorted = sorted.filter(r => r.keyRace );

    var buckets = {
      likelyD: [],
      tossup: [],
      likelyR: [],
    };

    sorted.forEach(function (r) {
      switch (r.rating) {
        case "solid-d":
        case "likely-d":
        case "lean-d":
          buckets.likelyD.push(r);
          break;

        case "solid-r":
        case "likely-r":
        case "lean-r":
          buckets.likelyR.push(r);
          break;

        default:
          buckets.tossup.push(r);
      }
    });

    return (
      <>
        {test ? <TestBanner /> : ""}
        <div class="header">
          <div class="title-wrapper">
            <h1 tabindex="-1">House Results</h1>
            <div class="alert" dangerouslySetInnerHTML={({ __html: alert })} />
          </div>
          <div class="bop-wrapper">
            <BarsHouse race="house" data={results}/>
          </div>
        </div>
        <div class="board-container House">
          <h2>Key Races</h2>
          {results && results.length && (
            <>
              <Results
                races={buckets.tossup}
                hed="Toss-Up Seats"
                office="House"
                addClass="middle"
                split={true}
              />
              <Results
                races={buckets.likelyD}
                hed="Lean Democratic"
                office="House"
                addClass="first"
              />
              <Results
                races={buckets.likelyR}
                hed="Lean Republican"
                office="House"
                addClass="last"
              />
            </>
          )}
        </div>
        <BoardKey race="house"/>

        <div class="source">
          <div class="note">
            <strong>Note:</strong> <em>% in</em> is an Associated Press estimate of
            the share of total ballots cast in an election that have been
            counted. <a href="https://www.ap.org/about/our-role-in-elections/counting-the-vote">Read more about how EEVP is calculated</a>.
          </div>
          <div class="note">
            Seat flips are not shown for House races. Districts were redrawn during redistricting, so comparison to prior seatholders is meaningless.
          </div>

          <div class="source">Source: AP (as of <DateFormatter value={latest} />). U.S. House race ratings come from the nonpartisan <a href="https://cookpolitical.com/ratings/house-race-ratings">Cook Political Report</a>.</div>
        </div>

      </>
    );
  }
}
