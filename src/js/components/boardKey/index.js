import { h, Fragment } from "preact";

export default function BoardKey(props) {
	var full = !props.simple;
  var race = props.race;
	var hasParties = race !== "ballot";
  var hasPickup = race == "senate"; // suppress flips in house '22 race b/c redistricting
	var hasIncumbent = race == "house" || race == "senate" || race == "gov";
	// var hasEEVP = race !== "ballot";
	var hasEEVP = true;


  // Do we need an asterisk b/c Evan McMullin won in 2022?
  var mcmullinWon = false;

  if (this.props.data) {

    var results = (this.props.data);

    results.forEach(function(r) {
      if ( r.hasOwnProperty('called')  && r.called == true ) {
        if (r.id == '46329' && r.winnerParty == 'Ind') {
              mcmullinWon = true;
            }
      }
    });
  }

  return <div class="board-key">
    {full && <h3>Key</h3>}
    <ul>
      {hasParties && <>
	      	<li class="dem">{full ? "Democrat" : "Biden"} / <span class="leading">Leading</span> <span class="winner">Winner</span></li>
	      	<li class="gop">{full ? "Republican" : "Trump"} / <span class="leading">Leading</span> <span class="winner">Winner</span></li>
	      	{full && <li class="ind">Independent / <span class="leading">Leading</span> <span class="winner">Winner</span></li>}
      </>}
      {hasPickup  && <li class="pickup"><span>FLIP</span> {hasPickup ? "Seat pickup" : "Change in winning party"} (party color)</li>}
      {full && hasParties && <li class="runoff"><span>R.O.</span> Going to a runoff election</li>}
      {full && !hasParties && <>
      	<li class="yes">Yes / <span class="leading">Leading</span> <span class="winner">Winner</span></li>
      	<li class="no">No / <span class="leading">Leading</span> <span class="winner">Winner</span></li>
      </>}
      {full && <li class="eevp"><span class="perc">76% in</span> {hasEEVP ? <span>Estimated share of votes counted*</span> : "Precincts reporting"}</li>}
      {full && hasIncumbent && <li class="incumbent">● Incumbent</li>}

    </ul>
     {mcmullinWon && <div id="mcmullin_note"><span style="color:#15b16e; font-family: Helvetica, Arial, sans-serif; font-weight: normal; font-weight: 400; font-size: 20px; font-weight: bold;">*</span><span id="mcmullin_text" style="font-style:italic;">In the Senate, Bernie Sanders (I-VT) and Angus King (I-ME) caucus with Democrats. The bar chart does not include newly-elected Evan McMullin (I-UT), who has said he will not caucus with either party.</span></div> }
  </div>
}
