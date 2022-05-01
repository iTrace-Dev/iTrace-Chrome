// main JavaScript driver for the iTrace-Chrome plugin, all data will be handled here
this.isActive = false;
this.sessionData = [];
this.currentUrl = "";

var _this = this;
debugger;

var iTraceChrome = chrome.extension.getBackgroundPage().iTraceChrome;
if(iTraceChrome.isInitialized == false) {
    iTraceChrome.initialize(); //initializing if it's not initialized
}

/*
	This function displays the HTML text upon its status
*/
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

/* Example code for finding the token user is gazing at used inside get_XXX_Coordinate.js

	
	function findToken(parentElt, x, y) {
		console.log(parentElt.nodeName);
		if (parentElt.nodeName !== '#text') {
			console.log('didn\'t look on text node');
			return null;
		}
		var range = document.createRange();
		var words = parentElt.textContent.split(/( |\t)+/);
		var start = 0;
		var end = 0;

		for (var i = 0; i < words.length; i++) {
			var word = words[i];
			end = start+word.length;
			range.setStart(parentElt, start);
			range.setEnd(parentElt, end);
			// not getBoundingClientRect as word could wrap
			var rects = range.getClientRects();
			var clickedRect = isGazeInRects(rects);
			if (clickedRect) {
				return [word, start, clickedRect];
			}
			start = end + 1;
		}
		
		function isGazeInRects(rects) {
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
*/