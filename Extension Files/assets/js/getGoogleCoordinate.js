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

console.log('Get Google Coordinates Script Started');

// listens and logs for google's data
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("[ContentScript] Message received:", msg);

    if (!msg || !msg.text) {
        console.warn("[ContentScript] Invalid message", msg);
        sendResponse({error: "Invalid message"});
        return true;
    }

    const elements = document.elementsFromPoint(msg.x, msg.y);
    console.log("[ContentScript] Found", elements.length, "elements at point", msg.x, msg.y);

    let responseData = null;

    for (const element of elements) {
        console.log("Element: ", element);
        if (element.classList.contains('yuRUbf')) {
            console.log('[ContentScript] Matched search title');
            responseData = {
                result: 'search title',
                text: element.textContent,
                url: msg.url,
                time: msg.time,
                x: msg.x,
                y: msg.y,
                tagname: element.tagName,
            };
            break;
        }
        if (element.classList.contains('VwiC3b')) {
            console.log('[ContentScript] Matched search description');
            responseData = {
                result: 'search description',
                text: element.textContent,
                url: msg.url,
                time: msg.time,
                x: msg.x,
                y: msg.y,
                tagname: element.tagName,
            };
            break;
        }
    }

    if (!responseData) {
        console.log("[ContentScript] No matching element found");
        responseData = {result: null};
    }

    console.log("[ContentScript] Sending response:", responseData);
    sendResponse(responseData);
    return true;
});


