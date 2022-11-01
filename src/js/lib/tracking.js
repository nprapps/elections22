//module for interfacing with GA

/**
@param [category] - usually "interaction"
@param action - what happened
@param [label] - not usually visible in dashboard, defaults to title or URL
*/

var isEmbedded = require("./embedded");

var DIMENSION_PARENT_URL = 'dimension1';
var DIMENSION_PARENT_HOSTNAME = 'dimension2';
var DIMENSION_PARENT_INITIAL_WIDTH = 'dimension3';

var a = document.createElement("a");

var slug = window.location.pathname.replace(/^\/|\/$/g, "");

var track = function(eventAction, eventLabel, eventValue) {
  var event = {
    eventAction,
    eventLabel,
    eventValue,
    hitType: "event",
    eventCategory: "apps-" + slug
  }






  //console.log(`Tracking: ${eventAction} / ${eventLabel} / ${eventValue}`)

  var search = window.location.search.replace(/^\?/, "");
  var query = {};
  search.split("&").forEach(pair => {
    var [key, value] = pair.split("=");
    query[key] = value;
  });
  var parentURL = query.parentUrl;
  a.href = parentURL;
  var hostname = a.hostname;

  event[DIMENSION_PARENT_URL] = parentURL;
  event[DIMENSION_PARENT_HOSTNAME] = hostname;

  if (window.ga) ga("send", event);
};

track.page = function(url) {
  // don't send these when embedded
  if (isEmbedded) return;
  var page = new URL(url, window.location.href);
  page = page.toString();
  // console.log(`Virtual pageview: ${page}`);
  if (window.ga) {
    ga("set", "page", page);
    ga("send", "pageview");
  }
}

module.exports = track;
