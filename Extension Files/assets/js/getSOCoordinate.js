// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'get_so_coordinate') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        var elements = document.elementsFromPoint(msg.x, msg.y);
        console.log(elements);
        sendResponse(elements);
    }
});