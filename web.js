/*
  Variables
*/

// Json string used to create the json
var jsonString = '{' +
'"title": "Lífsleikni | Leikirnir Network",' +
'"version": 0.1' +
'}'

// Json from jsonString stores about the website
var json = JSON.parse(jsonString);

window.onLoad = new function() {
  webLog("Created by Steinar Þór from Leikirnir. https://github.com/strandor (Version: " + json.version + ")");
  setupWeb();
}

/*
  Utils
*/
// Web Log
function webLog(message) {
  console.log("[Leikirnir]: " + message);
}

// Setup website
function setupWeb() {
  document.title = json.title;
}
