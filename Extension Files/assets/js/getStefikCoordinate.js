
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	var elements = document.elementsFromPoint(msg.x, msg.y);

	document.getElementById("iTraceEventTime").value = msg.time;
	var sentResult = false;
	
	function findSpanInLine(parentElt, x, y) {
		for(var i = 0; i < parentElt.childNodes.length; i++) {
			if(parentElt.childNodes[i].nodeName === "SPAN") {
				var boundingRect = parentElt.childNodes[i].getBoundingClientRect();
				if(boundingRect.left <= x && boundingRect.right > x &&
					boundingRect.top <= y && boundingRect.bottom > y)
				{
					var spanChildren = parentElt.childNodes[i].childNodes;
					if(spanChildren.length != 0 && spanChildren[0].nodeName === "#text") {
						return spanChildren[0].nodeValue;
					}
				}
			}
		}
		return null;
	}
	
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
    for (element of elements) {
		if (element.classList.contains('container-fluid')){
			console.log('task info');
			sentResult = true;
			sendResponse({ result: 'task info', line: null, word: null, x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
		}
		if (element.classList.contains('sampleline')){
			var word = findSpanInLine(element, msg.x, msg.y);
			if (word != null) {
				// ID = smpA1-line-XX
				var lineNumber = parseInt(element.id.split('-')[2]);
				console.log('code sample');
				sentResult = true;
				sendResponse({ result: 'code sample', line:lineNumber, word:word, x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
				return;
			}
		}
		if (element.classList.contains("outputline")){
			var word = findSpanInLine(element, msg.x, msg.y);
			if (word != null) {
				// ID = output-line-xx
				var lineNumber = parseInt(element.id.split('-')[2]);
				console.log('task output');
				sentResult = true;
				sendResponse({ result: 'task output', line:lineNumber, word:word, x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
				return;
			}
		}
		if (element.classList.contains('inputline')){
			console.log('solution area');
			// ID = inputline-XX
			var lineNumber = parseInt(element.id.split('-')[1]);
			var word = null;
			var gazed = findToken(element.childNodes[0], msg.x, msg.y);
			if(gazed) {
				word = gazed[0];
			}
			sentResult = true;
			sendResponse({ result: 'solution area', line: lineNumber, word: word, x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
		}
		if (element.id == 'task-timer'){
			console.log('timer');
			sentResult = true;
			sendResponse({ result: 'timer', line: null, word: null, x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;		
		}
		if (element.id == 'checkButton'){
			console.log('check button');
			sentResult = true;
			sendResponse({ result: 'checkButton', line: null, word: null, x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url })
		}
	}
	if (!sentResult) {
        sendResponse(null);
    }
});