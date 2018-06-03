console.log('hello');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
	console.log('hello-1');
    for (element of elements) {
		if (element.classList.contains('r')) {
			console.log('search title');
			sentResult = true;
			sendResponse({ result: 'search title', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.textContent, url: msg.url });
			return;	
		}
		if (element.classList.contains('st')) {
			console.log('search description');
			sentResult = true;
			sendResponse({ result: 'search description', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.textContent, url: msg.url });
			return;	
		}	
	}
	if (!sentResult) {
        sendResponse(null);
    }
});

