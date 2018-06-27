chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
	
	function findToken(parentElt, x, y) {
	console.log(parentElt.nodeName);
    if (parentElt.nodeName !== '#text') {
        console.log('didn\'t look on text node');
        return null;
    }
    var range = document.createRange();
    var words = parentElt.textContent.split(' ');
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
			sendResponse({ result: 'task info', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
		}
		if (element.classList.contains('sampleline')){
			console.log(element.tagName.nodeName);
			var gazed = findToken(element.childNodes[0], msg.x, msg.y);	
			if (gazed) {
				var word = gazed[0];
				var start = gazed[1]; //offset
				var r = gazed[2];
				console.log('code sample');
				sentResult = true;
				sendResponse({ result: word, x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
				return;
			}
		}
		if (element.classList.contains('inputline')){
			console.log('solution area');
			sentResult = true;
			sendResponse({ result: 'solution area', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
		}
		if (element.id == 'task-timer'){
			console.log('timer');
			sentResult = true;
			sendResponse({ result: 'timer', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;		
		}
	}
	if (!sentResult) {
        sendResponse(null);
    }
});
