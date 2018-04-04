// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    if (msg.text === 'get_answers') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        var element = document.getElementById('answers');
        console.log(element);
        sendResponse(element);
    }
});