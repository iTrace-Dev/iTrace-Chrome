chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
    for (element of elements) {
		if (element.classList.contains('container-fluid')){
			console.log('task info');
			sentResult = true;
			sendResponse({ result: 'task info', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
		}
		if (element.classList.contains('sampleline')){
			console.log('code sample');
			sentResult = true;
			sendResponse({ result: 'code sample', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
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
