function HideScrollbar() {
    var style = document.createElement("style");
    style.innerHTML = `body::-webkit-scrollbar {display: none;}`;
    document.head.appendChild(style);
}
HideScrollbar();
var replacedWords = [];

var paragraphs = document.getElementsByTagName("p");
for(var i = 0; i < paragraphs.length; i++) {
    paragraphs[i].id = 'paragraph_' + i;

    var wordCount = 0;

    var wrapWords = function(element) {
        var childrenNodes = element.childNodes;
        var newNodes = [];
        for(var j = 0; j < childrenNodes.length; j++) {
            if(element.childNodes[j].nodeType == 3) {//Node.TEXT_NODE
                var elementText = element.childNodes[j].textContent.replaceAll('\n', ' ').split(' ');

                for(var k = 0; k < elementText.length; k++) {
                    if(elementText[k].replaceAll('/\s+/', '').length > 0) {
                        var newSpan = document.createElement('span');
                        newSpan.id = 'paragraph_' + i + "_word_" + wordCount;
                        newSpan.classList = 'wordSpan';
                        newSpan.innerText = elementText[k];
                        newNodes.push(newSpan);
                        wordCount++;
                    }
                    else {
                        newNodes.push(document.createTextNode(elementText[k]));
                    }

                    if(k != elementText.length - 1) {
                        newNodes.push(document.createTextNode(' '));
                    }
                }
            }
            else {
                newNodes.push(wrapWords(element.childNodes[j]));
            }
        }
        element.replaceChildren(...newNodes);
        return element;
    }
    wrapWords(paragraphs[i]);
}
replacedWords = document.getElementsByClassName('replacedWord');
console.log(replacedWords);
// Listen for messages
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
    for (element of elements) {
        if (element) {
            if(element.classList.contains('wordSpan')) {
                for(var replacedWord of replacedWords) {
                    if(replacedWord.contains(element)) {
                        sendResponse({ result: 'replacedWord', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url, word:element.innerText});
                        return;
                    }
                }
                sendResponse({ result: 'word', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url, word:element.innerText});
                return;
            }
        }
    }

    if (!sentResult) {
        sendResponse(null);
    }
});
