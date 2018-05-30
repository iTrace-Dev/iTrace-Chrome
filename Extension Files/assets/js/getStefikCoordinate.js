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
		if (element.classList.contains('tab-pane form-control display-area codeSample active')){
			console.log('Code sample');
			sentResult = true;
			sendResponse({ result: 'code sample', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
		}
		if (element.classList.contains('col-lg-6')){
			console.log('practice area');
			sentResult = true;
			sendResponse({ result: 'Practice area', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
			return;
		}
	}
	if (!sentResult) {
        sendResponse(null);
    }
});
