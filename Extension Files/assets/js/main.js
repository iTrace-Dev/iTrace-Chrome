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
                xml += " " + m.substr(1) + "=\"" + String(v[m]);
             else
                hasChild = true;
          }
          xml += hasChild ? ">"  + "\n" : "/>"  + "\n";
          if (hasChild) {
             for (var m in v) {
                if (m == "#text")
                   xml += v[m] + "\n";
                else if (m == "#cdata")
                   xml += "<![CDATA[" + v[m] + "]]>";
                else if (m.charAt(0) != "@")
                   xml += toXml(v[m], m, "gaze\t") + "\n";
             }
             xml += (xml.charAt(xml.length-1)=="\n"?ind:"") + "</" + name + ">";
          }
       }
       else {
          xml += ind + "<" + name + ">" + String(v) +  "</" + name + ">";
       }
       return xml;
    }, xml="";
    for (var m in o)
       xml += toXml(o[m], m, "") + "\n";
    return xml;
 }

function printResults(response) {
    if (response) {
		var printString = 'x: ' + response.x + ', y: ' + response.y + ', result: ' + response.result + ', url: ' + response.url;
		//console.log(printString);
        this.sessionData.push({ timestamp: response.time, x: response.x, y: response.y, response: response.result, tagname: response.tagname, id: response.id, url: response.url });
    }
}

function getTokens(x, y) {
	if (response) {
		var elements = document.elementsFromPoint(x, y);
		for (element of elements) {
			var textElement = document.getElementsByClassName("sampleLine");
			for (var i = 0; i < textElement.length; i++) {
				var text = textElement[i].innerText;
				console.log(text);
			}
			var boundingRect = element.getBoundingClientRect();
			if (boundingRect.top == y) {
				for (var i = 0; i < textElement.length; i++) {
					var text = textElement[i].innerText;
					console.log(text);
				}
			}
		}
	}
}

function findGazedWord(parentElement, x, y) {
    if (parentElement.nodeName !== '#text') {
        console.log('didn\'t click on text node');
        return null;
    }
    var range = document.createRange();
    var words = parentElement.textContent.split(' ');
    var start = 0;
    var end = 0;
    for (var i = 0; i < words.length; i++) {
        var word = words[i];
        end = start+word.length;
        range.setStart(parentElement, start);
        range.setEnd(parentElement, end);
        // not getBoundingClientRect as word could wrap
        var rects = range.getClientRects();
        var clickedRect = isClickInRects(rects);
        if (clickedRect) {
            return [word, start, clickedRect];
        }
        start = end + 1;
    }
    
    function isClickInRects(rects) {
        for (var i = 0; i < rects.length; ++i) {
            var r = rects[i]
            if (r.left<x && r.right>x && r.top<y && r.bottom>y) {            
                return r;
            }
        }
        return false;
    }
    return null;
}

var fileLocation = "";
function writeXMLData() {
    this.websocket.close();

    // call method to parse JSON to xml string, then write to file
    var xmlString = json2xml(this.sessionData);

    // create blob with url for chrome.downloads api
    var xmlBlob = new Blob([xmlString], { type: "text/xml" });
    var url = URL.createObjectURL(xmlBlob);

    // download file
    // currently defaults to downloading to the device's download folder
    // can be changed to any path in local storage
    chrome.downloads.download({
        url: url,
		filename: "chrome_plugin_data.xml"
    });

    this.isActive = false;

    chrome.browserAction.onClicked.removeListener(this.writeXMLData.bind(this));
    chrome.browserAction.onClicked.addListener(this.startSession.bind(this));
    this.sessionData = [];
}


function webSocketHandler(e) {
    // deal with incoming eyegaze data

    var eyeGazeData = e.data;
	
	if (eyeGazeData.substring(0, eyeGazeData.indexOf(',')) == 'session'){
		var tmp = eyeGazeData.substring(eyeGazeData.indexOf(',') + 1);
		fileLocation = tmp;
		return;
	} 
    var timeStampAndCoords = eyeGazeData.substring(eyeGazeData.indexOf(',') + 1);
	var timeStamp = timeStampAndCoords.substring(0, timeStampAndCoords.indexOf(','));
    var coordString = timeStampAndCoords.substring(timeStampAndCoords.indexOf(',') + 1);

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
			var url = this.tab.url;
            if (url.includes('stackoverflow.com/questions/')) {
                chrome.tabs.sendMessage(this.id, { text: 'get_so_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url  }, this.printResults );
            }
            if (url.includes('https://bug')) { // NOTE: This include may be incorect, will need to do some more research
                chrome.tabs.sendMessage(this.id, { text: 'get_bz_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url  }, this.printResults );
            }
			if (url.includes('amiga')) {
				chrome.tabs.sendMessage(this.id, { text: 'get_stefik_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url }, this.printResults);
			}
			if (url.includes('stackoverflow.com/search')) {
				chrome.tabs.sendMessage(this.id, { text: 'get_search_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url }, this.printResults);
			}	
			if (url.includes('google.com')){
				chrome.tabs.sendMessage(this.id, { text: 'get_google_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url }, this.printResults);
			}
        }.bind(this));
    }
}

function getBrowserX(result) {
    console.log('browserX');
    console.log(result);
    this.browserX = result[0];
}

function getBrowserY(result) {
    console.log('browserY');
    console.log(result);
    this.browserY = result[0];
}

function startSession(tab) {
    this.tab = tab;
    console.log('START SESSION');

    chrome.tabs.executeScript({
        'code': 'window.innerHeight'
    }, this.getBrowserX.bind(this));

    chrome.tabs.executeScript({
        'code': 'window.innerWidth'
    }, this.getBrowserY.bind(this));

    var queryInfo = {
        active: true,
        currentWindow: true
    };
    var url = tab.url;
    this.id = tab.id;

    this.websocket = new WebSocket('ws://localhost:7007');

    // listen for eye gaze data coming from the server
    this.websocket.onmessage = this.webSocketHandler.bind(this);

    chrome.browserAction.onClicked.removeListener(this.startSession.bind(this));
    chrome.browserAction.onClicked.addListener(this.writeXMLData.bind(this));
}

this.isActive = false;
this.sessionData = [];

// add initial listener for the broswerAction click
chrome.browserAction.onClicked.addListener(this.startSession.bind(this));
