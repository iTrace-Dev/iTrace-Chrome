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

// Listen for messages - logs and sends response based on search result, currently listesn for a question and its summary,
// a vote and its count, and a summary

console.log('Get Google Coordinates Script Started');

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    var elements = document.elementsFromPoint(msg.x, msg.y);

    var fixationElement = document.getElementById('fixationMover');
    if (fixationElement == null) {
        fixationElement = document.createElement("DIV");
        fixationElement.setAttribute('id', 'fixationMover');
        fixationElement.setAttribute('style', 'border-radius:100%;border:5px red solid;height:30px;width:30px;position:fixed');
        document.body.appendChild(fixationElement);
    }

    fixationElement.style.left = msg.x + "px";
    fixationElement.style.top = msg.y + "px";

    var sentResult = false;
    // console.log('Hello');
    for (element of elements) {
        if (element.classList.contains('question-summary search-result')) {
            console.log('question summary-search');
            sentResult = true;
            sendResponse({
                result: 'question summary-search',
                x: msg.x,
                y: msg.y,
                time: msg.time,
                tagname: element.tagName,
                id: element.id,
                url: msg.url
            });
            return;
        }
        if (element.classList.contains('s-post-summary--stats-item-number')) {
            console.log('question-vote count');
            sentResult = true;
            sendResponse({
                result: 'question vote count',
                x: msg.x,
                y: msg.y,
                time: msg.time,
                tagname: element.tagName,
                id: element.id,
                url: msg.url
            });
            return;
        }
        if (element.classList.contains('s-post-summary--content-excerpt')) {
            console.log('summary');
            sentResult = true;
            sendResponse({
                result: 'summary',
                x: msg.x,
                y: msg.y,
                time: msg.time,
                tagname: element.tagName,
                id: element.id,
                url: msg.url
            });
            return;
        }
    }

    if (!sentResult) {
        sendResponse(null);
    }
});