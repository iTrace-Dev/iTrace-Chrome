// main JavaScript driver for the iTrace-Chrome plugin, all data will be handled here
window.iTraceChrome = {
  translateCoordinates: function(x, y) {
      // screen dimensions
      var screenX = screen.height;
      var screenY = screen.width;

      var offsetX = screenX - iTraceChrome.browserX;
      var offsetY = screenY - iTraceChrome.browserY;

      if (x < offsetX || y < offsetY) {
          // user is looking outside of the broswer viewport, most likely at the broswer's shell
          return null;
      } else {
          // user is looking in the broswer viewport, return the translated coordinates
          return { x: x - offsetY, y: y - offsetX };
      }
  },
  groupByFilename: function(data) {
    return data.reduce(function(objectsByKeyValue, obj) {
      var value = obj.filename;
      objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
      return objectsByKeyValue;
    }, {});
  },
  json2xml: function(o, tab) {
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
            xml += hasChild ? ">"  + "\n" : "/>";
            if (hasChild) {
               for (var m in v) {
                  if (m == "#text")
                     xml += v[m] + "\n";
                  else if (m == "#cdata")
                     xml += "<![CDATA[" + v[m] + "]]>";
                  else if (m.charAt(0) != "@")
                     xml += toXml(v[m], m, "\t") + "\n";
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
   },
   printResults: function(response) {
      chrome.tabs.getSelected(null,function(tab) {
        this.currentUrl = tab.url;
      }.bind(iTraceChrome));
      if(response == null) {
          // user is looking off screen
          return;
      }
      //var printString = 'x: ' + response.x + ', y: ' + response.y + ', result: ' + response.result + ', url: ' + iTraceChrome.currentUrl;
      var sessionDataItem = { filename: iTraceChrome.fileLocation, timestamp: response.time, current_timestamp: new Date().getTime(), x: response.x, y: response.y, area: response.result, word: response.word, tagname: response.tagname, id: response.id, url: iTraceChrome.currentUrl };
      iTraceChrome.sessionData.push(sessionDataItem);

      if(iTraceChrome.db != null) {
        var transaction = iTraceChrome.db.transaction(["sessionData"], "readwrite");

        var objectStore = transaction.objectStore("sessionData");
        objectStore.add(sessionDataItem)
      }
  },
  writeXMLData: function () {
      if (iTraceChrome.websocket != null) {
          iTraceChrome.websocket.close();
      }

      var sessionsData = iTraceChrome.groupByFilename(iTraceChrome.sessionData);

      for(var file in sessionsData) {
        // call method to parse JSON to xml string, then write to file
        var xmlString = iTraceChrome.json2xml(sessionsData[file]);

        // create blob with url for chrome.downloads api
        var xmlBlob = new Blob([xmlString], { type: "text/xml" });
        var url = URL.createObjectURL(xmlBlob);

        var filePath = "chrome_plugin_data.xml";
        if (file != "") {
          filePath = "itrace_chrome_" + file + ".xml";
        }
        // download file
        // currently defaults to downloading to the device's download folder
        // can be changed to any path in local storage
        chrome.downloads.download({
            url: url,
            filename: filePath
        });
      }

      iTraceChrome.sessionData = [];
      iTraceChrome.fileLocation = "";

      if(iTraceChrome.db) {
        var objectStore = iTraceChrome.db.transaction(["sessionData"], "readwrite").objectStore("sessionData");
        objectStore.clear();
      }
  },
  loadIndexedDBData: function(callback) {
    if(iTraceChrome.db && iTraceChrome.sessionData.length == 0) {
      var objectStore = iTraceChrome.db.transaction("sessionData").objectStore("sessionData");
      objectStore.getAll().onsuccess = function(event) {
        iTraceChrome.sessionData = event.target.result;
        callback();
      }
    }
  },
  webSocketHandler: function(e) {
    // deal with incoming eyegaze data

    var eyeGazeData = e.data;

    if (eyeGazeData.substring(0, eyeGazeData.indexOf(',')) == 'session_start'){
      var tmp = eyeGazeData.substring(eyeGazeData.indexOf(',') + 1);
      tmp = tmp.substring(tmp.indexOf(',') + 1);
      iTraceChrome.fileLocation = tmp.substring(0, tmp.indexOf(','));
      return;
    }
    else if(eyeGazeData.substring(0, eyeGazeData.indexOf(',')) == "session_end") {
      iTraceChrome.isActive = false;
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
    var coords = iTraceChrome.translateCoordinates(x, y);

    if (!coords || isNaN(x) || isNaN(y)) {
        // user is not looking in the html viewport
    } else {
        // user is looking in the html viewport
        // need to check which website the user is looking at
        chrome.tabs.query({ 'active': true }, function (tabs) {
            var url = iTraceChrome.tab.url;
            if (url.includes('stackoverflow.com/questions/')) {
                chrome.tabs.sendMessage(iTraceChrome.id, { text: 'get_so_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url  }, iTraceChrome.printResults );
            }
            if (url.includes('https://bug')) { // NOTE: This include may be incorect, will need to do some more research
                chrome.tabs.sendMessage(iTraceChrome.id, { text: 'get_bz_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url  }, iTraceChrome.printResults );
            }
            if (url.includes('stackoverflow.com/search')) {
                chrome.tabs.sendMessage(iTraceChrome.id, { text: 'get_search_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url }, iTraceChrome.printResults);
            }
            if (url.includes('google.com')){
                chrome.tabs.sendMessage(iTraceChrome.id, { text: 'get_google_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url }, iTraceChrome.printResults);
            }
            if (url.includes('file://')){
                chrome.tabs.sendMessage(iTraceChrome.id, { text: 'get_tos_coordinate', x: coords.x, y: coords.y, time: timeStamp, url: url}, iTraceChrome.printResults);
            }
        });
    }
  },
  getBrowserX: function(result) {
      console.log('browserX');
      console.log(result);
      this.browserX = result[0];
  },
  getBrowserY: function(result) {
      console.log('browserY');
      console.log(result);
      this.browserY = result[0];
  },
  startSession: function(tabs, callback) {
    iTraceChrome.tab = tabs[0];
    console.log('START SESSION');

    chrome.tabs.executeScript({
        'code': 'window.innerHeight'
    }, iTraceChrome.getBrowserX.bind(iTraceChrome));

    chrome.tabs.executeScript({
        'code': 'window.innerWidth'
    }, iTraceChrome.getBrowserY.bind(iTraceChrome));

    iTraceChrome.id = iTraceChrome.tab.id;

    iTraceChrome.websocket = new WebSocket('ws://localhost:7007');

    // listen for eye gaze data coming from the server
    iTraceChrome.websocket.onmessage = iTraceChrome.webSocketHandler.bind(iTraceChrome);
    iTraceChrome.isActive = true;
    callback(iTraceChrome.websocket);
  },
  initializeIndxedDB: function() {
    if(!window.indexedDB || iTraceChrome.db) {
      return;
    }
    var request = window.indexedDB.open("iTraceDB", 3);
    request.onerror = function(event) {
        console.log("Couldn't open indexedDB instance. Won't back up along the way");
    }
    request.onupgradeneeded = function(event) {
      var db = event.target.result;
      db.createObjectStore("sessionData", {keyPath: "timestamp"});
    }
    request.onsuccess = function(event) {
      iTraceChrome.db = event.target.result;

      var objectStore = iTraceChrome.db.transaction("sessionData").objectStore("sessionData");
      var countRequest = objectStore.count();
      countRequest.onsuccess = function() {
        if(countRequest.result > 0) {
          console.log("PREVIOUS RESULTS FOUND AND BEING WRITTEN");

          objectStore.getAll().onsuccess = function(event) {
            iTraceChrome.sessionData = event.target.result;
            iTraceChrome.writeXMLData();
          }
        }
      }
    }
  },
  initialize: function() {
    if(iTraceChrome.isInitialized) {
      return;
    }

    iTraceChrome.initializeIndxedDB();
    iTraceChrome.isInitialized = true;
  },
  isInitialized:false,
  fileLocation: "",
  isActive:false,
  sessionData:[],
  currentUrl:"",
  db:null
}
