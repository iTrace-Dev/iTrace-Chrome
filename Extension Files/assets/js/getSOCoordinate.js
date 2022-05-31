/****************************************************************************************************************************
 ****************************
 * @file FILE.EXT
 * 
 * @copyright (C) 2022 i-trace.org
 * 
 * This file is part of iTrace Infrastructure http://www.i-trace.org/.
 * iTrace Infrastructure is free software: you can redistribute it and/or modify it under the terms of the GNU General Public
 * License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later
 * version.
 * 
 * iTrace Infrastructure is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the
 * implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License
 * for more details.
 * 
 * You should have received a copy of the GNU General Public License along with iTrace Infrastructure. If not, see
 * https://www.gnu.org/licenses/.
 ************************************************************************************************************************
 ********************************/

// Listen for messages, (stackoverflow) currently listens for code, images, the post's text
// the post's tags, and the question itself, it also logs and sends a response based on the result/data
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
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
                    sendResponse({ result: 'question code', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer code');
                        sentResult = true;
                        sendResponse({ result: 'answer code', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                        return;
                    }
                }
            }
    
            if (element.tagName == 'IMG') {
                if (questionElement.contains(element)) {
                    // question code
                    console.log('question image');
                    sentResult = true;
                    sendResponse({ result: 'question image', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer image');
                        sentResult = true;
                        sendResponse({ result: 'answer image', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                        return;
                    }
                }
            }
    
            if (element.classList.contains('post-text')) {
                if (questionElement.contains(element)) {
                    // question code
                    console.log('question text');
                    sentResult = true;
                    sendResponse({ result: 'question text', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer text');
                        sentResult = true;
                        sendResponse({ result: 'answer text', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                        return;
                    }
                }
            }
    
            if (element.classList.contains('post-tag')) {
                console.log('question-tag');
                sentResult = true;
                sendResponse({ result: 'question tag', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                return;
            }
    
            if (element.classList.contains('vote')) {
                if (questionElement.contains(element)) {
                    // question code
                    console.log('question vote');
                    sentResult = true;
                    sendResponse({ result: 'question vote', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                    return;
                }
                for (answer of answerElements) {
                    if (answer.contains(element)) {
                        // answer code
                        console.log('answer vote');
                        sentResult = true;
                        sendResponse({ result: 'answer vote', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                        return;
                    }
                }
            }
    
            if (element.id == 'question-header') {
                console.log('question-title');
                sentResult = true;
                sendResponse({ result: 'question-title', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
                return;
            }
        }
    }

    if (!sentResult) {
        sendResponse(null);
    }
});