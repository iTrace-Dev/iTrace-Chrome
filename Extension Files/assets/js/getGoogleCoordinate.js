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
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
	var elements = document.elementsFromPoint(msg.x, msg.y);

    var sentResult = false;
	console.log('hello-1');
    for (element of elements) {
		if (element.classList.contains('r')) {
			console.log('search title');
			sentResult = true;
			sendResponse({ result: 'search title', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.textContent, url: msg.url });
			return;	
		}
		if (element.classList.contains('st')) {
			console.log('search description');
			sentResult = true;
			sendResponse({ result: 'search description', x: msg.x, y: msg.y, time: msg.time, tagname: element.tagName, id: element.textContent, url: msg.url });
			return;	
		}	
	}
	if (!sentResult) {
        sendResponse(null);
    }
});

