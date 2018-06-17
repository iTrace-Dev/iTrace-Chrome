// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
	console.log('Hello');
    for (element of elements) {
        if (element.classList.contains('question-summary search-result'){
			console.log('question summary-search');
            sentResult = true;
            sendResponse({ result: 'question summary-search', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
		}
		if (element.classList.contains('vote-count-post '){
			console.log('question-vote count');
            sentResult = true;
            sendResponse({ result: 'question vote count', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
		}
		if (element.classList.contains('summary'){
			console.log('summary');
            sentResult = true;
            sendResponse({ result: 'summary', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
		}
    }

    if (!sentResult) {
        sendResponse(null);
    }
});