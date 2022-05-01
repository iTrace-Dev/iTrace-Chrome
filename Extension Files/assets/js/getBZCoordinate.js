console.log('Get BZ Coordinates Script Started');

// listens for data of the different BZ columns and the data associated with and logs it
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
    for (element of elements) {
        if (element.classList.contains('bz_show_bug_column_1')) {
            console.log('question info - 1');
            sentResult = true;
            sendResponse({ result: 'question info - 1', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
        }

        if (element.classList.contains('bz_show_bug_column_2')) {
            console.log('question info - 1');
            sentResult = true;
            sendResponse({ result: 'question info - 2', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
        }
 
        if (element.classList.contains('bz_comment')) {
            console.log('answer info');
            sentResult = true;
            sendResponse({ result: 'answer info', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
        }
 
        if (element.tagName == 'TR') {
            console.log('attachment info');
            sentResult = true;
            sendResponse({ result: 'attachment info', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
        }
    }

    if (!sentResult) {
        sendResponse(null);
    }
});