var $ = require("../lib/qsa");

// ad filtering code
window.grumi = window.grumi || {
    cfg: {
        advs: {
            '19566752': true, // Google Inc
            '4952276315': true, // IntowowBillable
            '88382072': true, // NPR - Programmatic
            '5056504790': true, // Pubmatic
            '5116496584': true, // Index Exchange
            '5212620189': true, // Pubmatic
        },
    },
    key: '880a45f2-0015-49d2-b38f-2d26be44ae09',
};
const geoEdge = document.createElement('script');
geoEdge.async = true;
geoEdge.type = 'text/javascript';
geoEdge.src = 'https://rumcdn.geoedge.be/880a45f2-0015-49d2-b38f-2d26be44ae09/grumi-ip.js';
const lastNode = document.getElementsByTagName('script')[0];
lastNode.parentNode.insertBefore(geoEdge, lastNode);

window.googletag = window.googletag || {cmd: []};
var gptLoaded = false;
var gptSetup = false;

var ccpaCookie = document.cookie.split(";").filter(c => c.includes("ccpa_rdp=true")).length > 0;

var storyId = "election-results-live-2022";
var isStagingServer = window.location.hostname == "stage-apps.npr.org";
var adSizes = {
  tall: ["fluid", [300,600], [300, 250]],
  wide: ["fluid", [728, 90], [970, 250], [1300, 250]]
}
var advelvetTargeting = [String(Math.floor(Math.random() * 20) + 1)];



// Load the code on page.

// var observer = new IntersectionObserver(function([event]) {
//   if (event.isIntersecting) {
//     observer.disconnect();
//     var gpt = document.createElement("script");
//     gpt.src = "https://securepubads.g.doubleclick.net/tag/js/gpt.js";
//     gpt.async = true;
//     gpt.defer = true;
//     document.body.appendChild(gpt);
//     console.log("Lazy-loading ad code...");
//     gptLoaded = true;
//   }
// });



var guid = 0;

class GoogleAd extends HTMLElement {
  constructor() {
    super();
    //if (!gptLoaded) observer.observe(this);
    this.connected = false;
  }

  connectedCallback() {
    console.log("Ad instrumentation: running connectedCallback on ad elements");
    if (this.connected) return;
    this.connected = true;

    var elements = this.illuminate();
    var id = "google-ad-" + guid++;
    elements.container.id = id;


    var size = this.dataset.size || "tall";
    var adSizeArray = adSizes[size];

    var adUnitString = "/6735/n6735.npr/news_politics/news_politics_liveblog";
    // Medium and small breakpoints
    if (window.innerWidth < 1024) {
      console.log("ad instrumentation: window.innerWidth < 1024")
      adUnitString = "/6735/n6735.nprmobile/news_politics/news_politics_liveblog";
      adSizeArray.push([300, 250]);
    }

    googletag.cmd.push(() => {
      console.log(`Loading ad for #${id}...`);
      var adService = googletag.pubads();

      if (!gptSetup) {
        adService.enableSingleRequest();
        adService.collapseEmptyDivs();
        adService.setTargeting("advelvet", advelvetTargeting);
        adService.setTargeting("storyid", [storyId]);
        adService.setTargeting("testserver", [isStagingServer.toString()]);
        if (ccpaCookie) {
          console.log("DFP: ccpa rdp enabled");
          adService.setPrivacySettings({ restrictDataProcessing: true, });
        }
        googletag.enableServices();
        gptSetup = true;
      }

      googletag.defineSlot(adUnitString, adSizeArray, id).addService(adService);
      console.log("googletag.defineSlot( " + adUnitString + ", " + adSizeArray + ", " +  id  + ")");



      // This listener will be called when an impression is considered viewable.
      adService.addEventListener('impressionViewable', function(event) {
        var slotId = event.slot.getSlotElementId();
        console.log('Impression has become viewable.', slotId);
      });

      // This listener will be called when a slots creative iframe load event fires.
      adService.addEventListener('slotOnload', function(event) {
        var slotId = event.slot.getSlotElementId();
        console.log('Creative iframe load event has fired.', slotId);
      });



      adService.addEventListener("slotRenderEnded", event => {
        if (event.slot.getSlotElementId() != id) {
          console.log("slot element id mismatch " + event.slot.getSlotElementId() + " <> " + id + " ignoring... ");
          return;
        }
        console.log("Processing ads for slot " + event.slot.getSlotElementId() );

        this.classList.remove("pending");
        if (!event.isEmpty) {
          this.classList.add("has-ad");


          console.log((`ad returned for ${id}`))

          // Record details of the rendered ad.
          var details = {
            'Advertiser ID': event.advertiserId,
            'Campaign ID': event.campaignId,
            'Company IDs': event.companyIds,
            'Creative ID': event.creativeId,
            'Creative Template ID': event.creativeId,
            'Is backfill?': event.isBackfill,
            'Is empty?': event.isEmpty,
            'Label IDs': event.labelIds,
            'Line Item ID': event.lineItemId,
            'Size': event.size.join('x'),
            'Slot content changed?': event.slotContentChanged,
            'Source Agnostic Creative ID': event.sourceAgnosticCreativeId,
            'Source Agnostic Line Item ID': event.sourceAgnosticLineItemId,
            'Yield Group IDs': event.yieldGroupIds
          }

          console.log(details);

        } else {
          console.log(`No ad returned for ${id}`);
        }
      });
      googletag.display(id);
    });
  }

  illuminate() {
    var elements = {};
    this.innerHTML = GoogleAd.template;
    var tagged = $(`[data-as]`, this);
    for (var el of tagged) {
      var prop = el.dataset.as;
      elements[prop] = el;
    }
    this.illuminate = () => elements;
    return elements;
  }

  static get template() {
    return `
<div class="ad-unit" data-as="container"></div>
<div class="message" data-as="message">
  <div>NPR thanks its sponsors</div>
  <a href="https://www.npr.org/about-npr/186948703/corporate-sponsorship">
    Become an NPR Sponsor
  </a>
</div>
    `
  }
}

try {
  window.customElements.define("google-ad", GoogleAd);
} catch (err) {
  console.log("Couldn't (re)define google-ad element.")
}
