/****************************************************************************************************************************
 ****************************
 * @file FILE.EXT
 *
 * @copyright (C) 2022 i-trace.org
 *
 * This file is part of iTrace Infrastructure http://www.i-trace.org/.
 * iTrace Infrastructure is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
 * version.
 *
 * iTrace Infrastructure is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * for more details.
 *
 * You should have received a copy of the GNU General Public License along with iTrace Infrastructure. If not, see
 * https://www.gnu.org/licenses/.
 ************************************************************************************************************************
 ********************************/
// importScripts("jquery-3.3.1.js");
// main JavaScript driver for the iTrace-Chrome plugin, all data will be handled here
chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get("iTraceState", (data) => {
        if (data.iTraceState) {
            Object.assign(iTraceChrome, data.iTraceState);
        }
        iTraceChrome.isSessionActive = false;
        iTraceChrome.isConnectedToCore = false;
        iTraceChrome.websocket = null;
    });
});
const iTraceChrome = {
    // this function takes the x and y coordinates from the screen and the browser
    // to get the offset, which then returns the translated coordinates based off if the user
    // is looking in or outside the viewport

    translateCoordinates: function (x, y) {
        if (
            iTraceChrome.viewportX == null ||
            iTraceChrome.viewportY == null ||
            iTraceChrome.browserWidth == null ||
            iTraceChrome.browserHeight == null ||
            iTraceChrome.dpr == null
        ) {
            return null;
        }

        const cssX = x / iTraceChrome.dpr;
        const cssY = y / iTraceChrome.dpr;

        // Translate into coordinates relative to viewport
        const relX = cssX - iTraceChrome.viewportX;
        const relY = cssY - iTraceChrome.viewportY - iTraceChrome.chromeUIHeight;

        // Bounds check
        if (
            relX < 0 || // Not to the left of the viewportX
            relY < 0 || // Not above viewportY
            relX > iTraceChrome.browserWidth || // Not to the right of the window
            relY > iTraceChrome.browserHeight // Not below the window
        ) {
            return null;
        }

        return {relX: relX, relY: relY};
    },

    // this function groups files by their name, param data are the files

    groupByFilename: function (data) {
        return data.reduce(function (objectsByKeyValue, obj) {
            var value = obj.filename;
            objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
            return objectsByKeyValue;
        }, {});
    },

    // this function converts a JSON formatted file to an XML formatted file
    json2xml: function (o, tab) {
        var toXml = function (v, name, ind) {
            var xml = "";
            if (v instanceof Array) {
                for (var i = 0, n = v.length; i < n; i++)
                    xml += ind + toXml(v[i], name, ind + "\t") + "\n";
            } else if (typeof (v) == "object") {
                var hasChild = false;
                xml += ind + "<" + name;
                for (var m in v) {
                    if (m.charAt(0) == "@")
                        xml += " " + m.substr(1) + "=\"" + String(v[m]);
                    else
                        hasChild = true;
                }
                xml += hasChild ? ">" + "\n" : "/>";
                if (hasChild) {
                    for (var m in v) {
                        if (m == "#text")
                            xml += v[m] + "\n";
                        else if (m == "#cdata")
                            xml += "<![CDATA[" + v[m] + "]]>";
                        else if (m.charAt(0) != "@")
                            xml += toXml(v[m], m, "\t") + "\n";
                    }
                    xml += (xml.charAt(xml.length - 1) == "\n" ? ind : "") + "</" + name + ">";
                }
            } else {
                xml += ind + "<" + name + ">" + String(v) + "</" + name + ">";
            }
            return xml;
        }, xml = "";
        for (var m in o)
            xml += toXml(o[m], m, "") + "\n";
        return xml;
    },

    // this function takes the data from the session and adds it to the iTraceChrome's sessionData attribute
    // and stores it in objectStore
    printResults: function (response, x, y) {
        chrome.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            iTraceChrome.currentUrl = tabs[0].url;

            let sessionDataItem;
            if ((!response || response.result == null) && iTraceChrome.emptyResponsesEnabled) {
                sessionDataItem = {
                    aoi_detected: "No_Hit",
                    filename: iTraceChrome.fileLocation,
                    timestamp: Number(response?.time) || Date.now(),
                    current_timestamp: Date.now(),
                    x: x,
                    y: y,
                    relX: response?.relX ?? null,
                    relY: response?.relY ?? null,
                    url: iTraceChrome.currentUrl
                };
            } else if (response && response.result != null) {
                sessionDataItem = {
                    aoi_detected: "AOI_Hit",
                    filename: iTraceChrome.fileLocation,
                    timestamp: Number(response?.time) || Date.now(),
                    current_timestamp: Date.now(),
                    x: x,
                    y: y,
                    relX: response.relX,
                    relY: response.relY,
                    area: response.result,
                    line: response.line,
                    word: response.word,
                    tagname: response.tagname,
                    id: response.id,
                    url: iTraceChrome.currentUrl
                };
            }

            if (sessionDataItem) {
                iTraceChrome.sessionData.push(sessionDataItem);

                if (iTraceChrome.db != null) {
                    const transaction = iTraceChrome.db.transaction(["sessionData"], "readwrite");

                    const objectStore = transaction.objectStore("sessionData");
                    objectStore.add(sessionDataItem)
                }
            }
        });
    },

    // writes the sessionData in XML and downloads the file, then resets sessionData and clears objectStore
    writeXMLData: function () {

        var sessionsData = iTraceChrome.groupByFilename(iTraceChrome.sessionData);

        for (var file in sessionsData) {
            // call method to parse JSON to xml string, then write to file
            if (!file || file === "undefined") continue;
            var xmlString = iTraceChrome.json2xml(sessionsData[file]);
            var xmlBlob = new Blob([xmlString], {type: "text/xml"});

            var reader = new FileReader();
            reader.onload = function () {
                var dataUrl = reader.result;

                var filePath = "chrome_plugin_data.xml";
                if (file != "") {
                    filePath = "itrace_chrome_" + file + ".xml";
                }

                chrome.downloads.download({
                    url: dataUrl,
                    filename: filePath
                });
            };
            reader.readAsDataURL(xmlBlob);

        }

        iTraceChrome.sessionData = [];
        iTraceChrome.fileLocation = "";

        if (iTraceChrome.db) {
            // objectStore is the (temporary) bridge that allows us to get the local data that is locally stored
            // in the iTraceChrome object
            var objectStore = iTraceChrome.db.transaction(["sessionData"], "readwrite").objectStore("sessionData");
            objectStore.clear();
        }
    },

    // if database data and sessionData are empty, this function will load the 
    // indexed database data
    loadIndexedDBData: function (callback) {
        if (iTraceChrome.db && iTraceChrome.sessionData.length == 0) {
            var objectStore = iTraceChrome.db.transaction("sessionData").objectStore("sessionData");
            objectStore.getAll().onsuccess = function (event) {
                iTraceChrome.sessionData = event.target.result;
                callback();
            }
        }
    },

    // this function deals with incoming eyegaze data
    webSocketHandler: function (e) {
        var eyeGazeData = e.data;

        // sets the file's location upon session start
        if (eyeGazeData.substring(0, eyeGazeData.indexOf(',')) == 'session_start') {
            var tmp = eyeGazeData.substring(eyeGazeData.indexOf(',') + 1);
            tmp = tmp.substring(tmp.indexOf(',') + 1);
            iTraceChrome.fileLocation = tmp.substring(0, tmp.indexOf(','));
            iTraceChrome.isSessionActive = true;

            chrome.runtime.sendMessage({
                type: "sessionStatus",
                status: "started"
            });

            return;
        }
        // if session is no longer active, then set iTraceChrome's active status to false
        else if (eyeGazeData.substring(0, eyeGazeData.indexOf(',')) == "") {
            iTraceChrome.isSessionActive = false;

            if (!iTraceChrome.persistCoreConnectionEnabled) {
                chrome.runtime.sendMessage({
                    type: "websocketStatus",
                    status: "disconnected"
                });

                chrome.runtime.sendMessage({
                    type: "sessionStatus",
                    status: "ended"
                });

                if (iTraceChrome.websocket) {
                    iTraceChrome.websocket.close();
                }
            } else {
                chrome.runtime.sendMessage({
                    type: "sessionStatus",
                    status: "ended"
                });
            }

            return;
        }
        var timeStampAndCoords = eyeGazeData.substring(eyeGazeData.indexOf(',') + 1);
        var timeStamp = timeStampAndCoords.substring(0, timeStampAndCoords.indexOf(','));
        var coordString = timeStampAndCoords.substring(timeStampAndCoords.indexOf(',') + 1);

        var x = coordString.substring(0, coordString.indexOf(','));
        var y = coordString.substring(coordString.indexOf(',') + 1, coordString.length);

        // parse values
        x = parseInt(x);
        y = parseInt(y);

        // get translated coordinates
        var coords = iTraceChrome.translateCoordinates(x, y);

        if (!coords || isNaN(coords.relX) || isNaN(coords.relY)) {
            // user is not looking in the html viewport
        } else {
            // user is looking in the html viewport
            // need to check which website the user is looking at
            chrome.tabs.query({active: true, currentWindow: true}).then((tabs) => {
                let url = tabs[0].url;
                if (url.includes('stackoverflow.com/questions/')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_so_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('https://bug')) { // NOTE: This include may be incorect, will need to do some more research
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_bz_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('stackoverflow.com/search')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_search_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('google.com')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_google_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('github.com/*/*/issues')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_github_issues_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('github.com/*/*/pulls')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_github_prlist_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('github.com/*/*/pull')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_github_pr_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('github.com') && url.includes('pull')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_github_pr_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
                if (url.includes('github.com/')) {
                    chrome.tabs.sendMessage(iTraceChrome.id, {
                        text: 'get_github_dev_profile_coordinate',
                        relX: coords.relX,
                        relY: coords.relY,
                        time: timeStamp,
                        url: url
                    }).then(response => {
                        iTraceChrome.printResults(response, x, y);
                    });
                }
            });
        }
    },

    // this retrieve's the browser's x coordinate
    getBrowserX: function (result) {
        console.log('browserX');
        console.log(result);
        this.browserX = result[0];
    },

    // this retrieve's the browser's y coordinate
    getBrowserY: function (result) {
        console.log('browserY');
        console.log(result);
        this.browserY = result[0];
    },

    // this function begins a session, which binds the browser's x and y coordinates, initializes and
    // binds new websocket, sets status to active then listens for eye gaze data from the server
    startSession: function (tabs) {
        iTraceChrome.tab = tabs[0];
        iTraceChrome.id = iTraceChrome.tab.id;
        console.log('START SESSION');

        if (iTraceChrome.websocket) {
            iTraceChrome.websocket.close();
            iTraceChrome.websocket = null;
        }

        iTraceChrome.websocket = new WebSocket('ws://localhost:7007');

        // listen for eye gaze data coming from the server
        iTraceChrome.websocket.onmessage = iTraceChrome.webSocketHandler.bind(iTraceChrome);

        chrome.scripting.executeScript({
            target: {tabId: iTraceChrome.id},
            func: () => ({
                innerWidth: window.innerWidth,
                innerHeight: window.innerHeight,
                outerHeight: window.outerHeight,
                screenX: window.screenX,
                screenY: window.screenY,
                devicePixelRatio: window.devicePixelRatio
            })
        }).then(r => {
            const data = r[0].result;
            iTraceChrome.browserWidth = data.innerWidth;
            iTraceChrome.browserHeight = data.innerHeight;
            iTraceChrome.chromeUIHeight = data.outerHeight - data.innerHeight;
            iTraceChrome.viewportX = data.screenX;
            iTraceChrome.viewportY = data.screenY;
            iTraceChrome.dpr = data.devicePixelRatio;

            chrome.storage.local.set({
                iTraceState: {
                    id: iTraceChrome.id,
                    fileLocation: iTraceChrome.fileLocation,
                    emptyResponsesEnabled: iTraceChrome.emptyResponsesEnabled,
                    persistCoreConnectionEnabled: iTraceChrome.persistCoreConnectionEnabled,
                    // viewport vars tell us where the Chrome window begins in the top left corner relative to the screen
                    // They are measured in Css pixels
                    viewportX: iTraceChrome.viewportX,
                    viewportY: iTraceChrome.viewportY,
                    browserWidth: iTraceChrome.browserWidth,
                    browserHeight: iTraceChrome.browserHeight,
                    // Device Pixel Ratio
                    dpr: iTraceChrome.dpr
                }
            });
        });

        chrome.runtime.sendMessage({type: "websocketStatus", status: "attempting"});

        iTraceChrome.websocket.onopen = () => {
            iTraceChrome.isConnectedToCore = true;
            chrome.runtime.sendMessage({type: "websocketStatus", status: "connected"});
        };

        iTraceChrome.websocket.onclose = () => {
            iTraceChrome.isConnectedToCore = false;
            iTraceChrome.isSessionActive = false;
            iTraceChrome.websocket = null;
            chrome.runtime.sendMessage({type: "websocketStatus", status: "disconnected"});
        };

        iTraceChrome.websocket.onerror = (err) => {
            chrome.runtime.sendMessage({type: "websocketStatus", status: "error", error: err.message});
        };
    },

    // this functions opens the iTrace database, upon successfully opening the database it
    // calls writeXMLData based on the current state of sessionData that's in objectStore
    initializeIndxedDB: function () {
        if (!indexedDB || iTraceChrome.db) {
            return;
        }
        var request = indexedDB.open("iTraceDB", 3);
        request.onerror = function (event) {
            console.log("Couldn't open indexedDB instance. Won't back up along the way");
        }
        request.onupgradeneeded = function (event) {
            var db = event.target.result;
            db.createObjectStore("sessionData", {keyPath: "timestamp"});
        }
        request.onsuccess = function (event) {
            iTraceChrome.db = event.target.result;

            var objectStore = iTraceChrome.db.transaction("sessionData").objectStore("sessionData");
            var countRequest = objectStore.count();
            countRequest.onsuccess = function () {
                if (countRequest.result > 0) {
                    console.log("PREVIOUS RESULTS FOUND AND BEING WRITTEN");

                    objectStore.getAll().onsuccess = function (event) {
                        iTraceChrome.sessionData = event.target.result;
                        iTraceChrome.writeXMLData();
                    }
                }
            }
        }
    },

    // initializing iTraceChrome
    initialize: function () {
        if (iTraceChrome.isInitialized) {
            return;
        }

        iTraceChrome.initializeIndxedDB();
        iTraceChrome.isInitialized = true;
    },
    isInitialized: false,
    fileLocation: "",
    isSessionActive: false,
    isConnectedToCore: false,
    sessionData: [],
    currentUrl: "",
    db: null
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "isInitializedITraceChrome") {
        sendResponse(iTraceChrome.isInitialized);
    }
    if (message.type === "initializeITraceChrome") {
        iTraceChrome.initialize()
    }
    if (message.type === "writeXMLDataITraceChrome") {
        console.log("writeXMLDataITraceChrome");
        iTraceChrome.writeXMLData();
    }
    if (message.type === "startSessionITraceChrome") {
        iTraceChrome.startSession(message.vars[0]);
    }
    if (message.type === "isConnectedITraceChrome") {
        sendResponse(iTraceChrome.isConnectedToCore);
    }
    if (message.type === "isActiveITraceChrome") {
        sendResponse(iTraceChrome.isSessionActive);
    }

    if (message.type === "toggleEmptyResponses") {
        iTraceChrome.emptyResponsesEnabled = message.enabled;

        chrome.storage.local.set({
            emptyResponsesEnabled: message.enabled
        });

        console.log("Empty responses enabled:", iTraceChrome.emptyResponsesEnabled);
    }

    if (message.type === "togglePersistCoreConnection") {
        iTraceChrome.persistCoreConnectionEnabled = message.enabled;

        chrome.storage.local.set({
            persistCoreConnectionEnabled: message.enabled
        });

        console.log("Persist core connection enabled:", iTraceChrome.persistCoreConnectionEnabled);
    }
});