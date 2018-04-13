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

    callback(url, tab.id);
  });
}

function translateCoordinates(x, y) {
    // broswer viewport dimensions

    // screen dimensions
    var screenX = screen.height;
    var screenY = screen.width;

    var offsetX = screenX - this.browserX;
    var offsetY = screenY - this.browserY;

    if (x < offsetX || y < offsetY) {
        // user is looking outside of the broswer viewport, most likely at the broswer's shell
        return null;
    } else {
        // user is looking in the broswer viewport, return the translated coordinates
        return { x: x - offsetY, y: y - offsetX };
    }
}

function json2xml(o, tab) {
    var toXml = function(v, name, ind) {
       var xml = "";
       if (v instanceof Array) {
          for (var i=0, n=v.length; i<n; i++)
             xml += ind + toXml(v[i], name, ind+"\t") + "\n";
       }
       else if (typeof(v) == "object") {
          var hasChild = false;
          xml += ind + "<" + name;
          for (var m in v) {
             if (m.charAt(0) == "@")
                xml += " " + m.substr(1) + "=\"" + v[m].toString() + "\"";
             else
                hasChild = true;
          }
          xml += hasChild ? ">" : "/>";
          if (hasChild) {
             for (var m in v) {
                if (m == "#text")
                   xml += v[m];
                else if (m == "#cdata")
                   xml += "<![CDATA[" + v[m] + "]]>";
                else if (m.charAt(0) != "@")
                   xml += toXml(v[m], m, ind+"\t");
             }
             xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
          }
       }
       else {
          xml += ind + "<" + name + ">" + v.toString() +  "</" + name + ">";
       }
       return xml;
    }, xml="";
    for (var m in o)
       xml += toXml(o[m], m, "");
    return tab ? xml.replace(/\t/g, tab) : xml.replace(/\t|\n/g, "");
 }

function getBZElementResult(elements) {
    for (element of elements) {
       if (element.classList.contains('bz_show_bug_column')) {
           console.log('question info - 1');
       }

       if (element.classList.contains('bz_alias_short_desc_container')) {
           console.log('question title');
       }

       if (element.classList.contains('bz_comment_text')) {
           console.log('answer info');
       }

       if (element.classList.contains('bz_attach_extra_info')) {
           console.log('attachment info');
       }
   }
}

function printSOResults(response) {
    if (response) {
        this.sessionData.push({ x: response.x, y: response.y, result: response.result });
        var printString = 'x: ' + response.x + ', y: ' + response.y + ', result: ' + response.result;
        console.log(printString);
    }
}

function writeXMLData() {
    this.websocket.close();

    // call method to parse JSON to xml string, then write to file
    var xmlString = json2xml(this.sessionData);

    // create blob with url for chrome.downloads api
    var xmlBlob = new Blob([xmlString], { type: "text/xml" });
    var url = URL.createObjectURL(xmlBlob);

    // download file
    // I think this should just download to the default downloads folder?
    // can change this if needed
    chrome.downloads.download({
        url: url,
    });

    this.isActive = false;

    chrome.browserAction.onClicked.removeListener(this.writeXMLData);
}

this.isActive = false;
this.sessionData = [];

// establish the websocket connection
chrome.browserAction.onClicked.addListener(function (tab) {
    console.log('START SESSION');

    chrome.tabs.executeScript({
        'code': 'window.innerHeight'
    }, function (result) {
        console.log('browserX');
        console.log(result);
        this.browserX = result[0];
    }.bind(this));

    chrome.tabs.executeScript({
        'code': 'window.innerWidth'
    }, function (result) {
        console.log('browserY');
        console.log(result);
        this.browserY = result[0];
    }.bind(this));

    var queryInfo = {
        active: true,
        currentWindow: true
    };
    var url = tab.url;
    var id = tab.id;

    if (!this.websocket) {
        this.websocket = new WebSocket('ws://localhost:7007');
    }

    // listen for eye gaze data coming from the server
    this.websocket.onmessage = function (e) {
        // deal with incoming eyegaze data

        var eyeGazeData = e.data;
        var timeStamp = eyeGazeData.substring(0, eyeGazeData.indexOf(','));

        var coordString = eyeGazeData.substring(eyeGazeData.indexOf(',') + 1);

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
            // need to check which website the user is looking at
            chrome.tabs.query({ 'active': true }, function (tabs) {
                var url = tab.url;
                this.currentTab = tab;
                if (url.includes('stackoverflow.com/questions/')) {
                    chrome.tabs.sendMessage(id, { text: 'get_so_coordinate', x: coords.x, y: coords.y  }, this.printSOResults );
                }
                if (url.includes('bugzilla')) { // NOTE: This include may be incorect, will need to do some more research
                    
                }
            }.bind(this));
        }
    }.bind(this);

    chrome.browserAction.onClicked.addListener(this.writeXMLData.bind(this));
}.bind(this));