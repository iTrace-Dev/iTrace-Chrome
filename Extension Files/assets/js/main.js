// main JavaScript driver for the iTrace-Chrome plugin, all data will be handled here
this.isActive = false;
this.sessionData = [];
this.currentUrl = "";

var _this = this;
debugger;

var iTraceChrome = chrome.extension.getBackgroundPage().iTraceChrome;
if(iTraceChrome.isInitialized == false) {
    iTraceChrome.initialize();
}

function afterSessionSetup(websocket) {    
    $("#session_status").html("Session Started - Attempting To Connect");
  
    websocket.onopen = function() {
        $("#session_status").html("Session Started - Connected");
    }

    websocket.onclose = function() {
        $("#session_status").html("Not Connected To Core");
    }
}

$(document).ready(function() {
    $("#start_session").on("click", function(event) {
        chrome.tabs.query({active: true, currentWindow:true}, function(tabs) {
            iTraceChrome.startSession(tabs, afterSessionSetup);
        });
    });
    
    $("#write_xml").on("click", function(event) {
        iTraceChrome.writeXMLData();
    });

    if (iTraceChrome.isActive) {
        $("#session_status").html("Session Started - Connected");
    }
});