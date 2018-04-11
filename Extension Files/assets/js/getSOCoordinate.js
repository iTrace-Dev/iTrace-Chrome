// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    // If the received message has the expected format...
    /*if (msg.text === 'get_so_coordinate') {
        // Call the specified callback, passing
        // the web-page's DOM content as argument
        var elements = document.elementsFromPoint(msg.x, msg.y);
        var stringElements = [];
        elements.forEach(function (element) {
            var index;
            if (element.parentElement) {
                for (var i = 0; i < element.parentElement.children.length; i++) {
                    if (element.parentElement.children[i] == element) {
                        index = i;
                    }
                }
                stringElements.push({ element: element.parentElement.innerHTML, index: index });
            } else {
                stringElements.push({ element: element.innerHTML, index: 0 });
            }
        });
        //console.log(stringElements);
        sendResponse(stringElements);
    }*/

    var questionElement = document.getElementById('question');
    var answerElements = document.getElementById('answers').children;
    var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
    for (element of elements) {
        if (element) {
            if (element.tagName == 'CODE') {
                if (questionElement.contains(element)) {
                    // question code
                    console.log('question code');
                    sentResult = true;
                    sendResponse({ result: 'question code', x: msg.x, y: msg.y });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer code');
                        sentResult = true;
                        sendResponse({ result: 'answer code', x: msg.x, y: msg.y });
                        return;
                    }
                }
            }
    
            if (element.tagName == 'IMG') {
                if (questionElement.contains(element)) {
                    // question code
                    console.log('question image');
                    sentResult = true;
                    sendResponse({ result: 'question image', x: msg.x, y: msg.y });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer image');
                        sentResult = true;
                        sendResponse({ result: 'answer image', x: msg.x, y: msg.y });
                        return;
                    }
                }
            }
    
            if (element.classList.contains('post-text')) {
                if (questionElement.contains(element)) {
                    // question code
                    console.log('question text');
                    sentResult = true;
                    sendResponse({ result: 'question text', x: msg.x, y: msg.y });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer text');
                        sentResult = true;
                        sendResponse({ result: 'answer text', x: msg.x, y: msg.y });
                        return;
                    }
                }
            }
    
            if (element.classList.contains('post-tag')) {
                console.log('question-tag');
                sentResult = true;
                sendResponse({ result: 'question tag', x: msg.x, y: msg.y });
                return;
            }
    
            if (element.classList.contains('vote')) {
                if (questionElement.contains(element)) {
                    // question code
                    console.log('question vote');
                    sentResult = true;
                    sendResponse({ result: 'question vote', x: msg.x, y: msg.y });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer vote');
                        sentResult = true;
                        sendResponse({ result: 'answer vote', x: msg.x, y: msg.y });
                        return;
                    }
                }
            }
    
            if (element.Id == 'question-header') {
                console.log('question-title');
                sentResult = true;
                sendResponse({ result: 'question-title', x: msg.x, y: msg.y });
                return;
            }
        }
    }

    if (!sentResult) {
        sendResponse(null);
    }
});