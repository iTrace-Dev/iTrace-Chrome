// main JavaScript driver for the iTrace-Chrome plugin, all data will be handled here

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];

    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

function translateCoordinates(x, y) {
    // broswer viewport dimensions
    var browserX = $(window).height();
    var browserY = $(window).width();

    // screen dimensions
    var screenX = screen.height;
    var screenY = screen.width;

    var offsetX = screenX - broswerX;
    var offsetY = screenY - browserY;

    if (x < offsetX || y < offsetY) {
        // user is looking outside of the broswer viewport, most likely at the broswer's shell
        return null;
    } else {
        // user is looking in the broswer viewport, return the translated coordinates
        return { x: x - offsetX, y: y - offsetY };
    }
}

$(document).ready(function () {
    // establish the websocket connection
    var websocket = new WebSocket("ws://localhost:7007");

    // listen for eye gaze data coming from the server
    websocket.onmessage = function (e) {
        // deal with incoming eyegaze data
        var eyeGazeData = e.data;
        var timeStamp = eyeGazeData.substring(0, string.indexOf(','));

        var coordString = eyeGazeData.substring(string.indexOf(',') + 1);

        var x = coordString.substring(0                           , coordString.indexOf(','));
        var y = coordString.substring(coordString.indexOf(',') + 1, coordString.length      );

        // parse values
        x = parseInt(x);
        y = parseInt(y);

        // get translated coordinates
        var coords = translateCoordinates(x, y);

        if (!coords) {
            // user is not looking in the html viewport
        } else {
            // user is looking in the html viewport
        }
    }
});
