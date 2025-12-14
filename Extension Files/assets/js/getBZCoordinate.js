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

console.log('Get BZ Coordinates Script Started');

// listens for data of the different BZ columns and the data associated with and logs it
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
    for (element of elements) {
        if (element.classList.contains('module-categories')) {
            console.log('question info - categories');
            sentResult = true;
            sendResponse({ result: 'question info - categories', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
        }

        if (element.id === 'module-tracking') {
            console.log('question info - tracking');
            sentResult = true;
            sendResponse({ result: 'question info - tracking', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.id, url: msg.url });
            return;
        }
 
        if (element.classList.contains('comment-text')) {
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