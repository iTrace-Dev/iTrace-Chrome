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

console.log('Github Issuees Script Started');

// listens for the different GitHub issue coordinates and data associated with it, then sends
// response based on its results
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    for (element of elements) {
        console.log("looping");
        if (element.tagName === 'A' && element.querySelector('div')?.textContent.trim() === 'Open') {
            const numberOpen = element.querySelector('span[aria-hidden="true"]')?.textContent.trim();
            console.log('Number of Open issues:', numberOpen);
            sentResult = true;
            sendResponse({
                result: `NumIssuesOpen-${numberOpen}`,
                x: msg.x,
                y: msg.y,
                time: msg.time,
                id: element.id,
                url: msg.url
            });
            return;
        }
        if (
            element.tagName === "A" &&
            element.hasAttribute("data-hovercard-type")
        ) {
            const type = element.getAttribute("data-hovercard-type");

            if (type === "organization") {
                console.log("Project/Organization Name");

                const organization = element.textContent.trim();

                sentResult = true;
                sendResponse({
                    result: `ProjectName-${organization}`,
                    x: msg.x,
                    y: msg.y,
                    time: msg.time,
                    id: element.id,
                    url: msg.url
                });
                return;
            }else if (type === 'user') {
                console.log('user link')
                const user = element.innerHTML;
                sentResult = true;
                sendResponse({
                    result: `Username-${user}`,
                    x: msg.x,
                    y: msg.y,
                    time: msg.time,
                    id: element.id,
                    url: msg.url
                });
                return;
            } else if (type === 'issue') {
                console.log('issue link')
                const issue = element.innerHTML;
                sentResult = true;
                sendResponse({
                    result: `Issue-${issue}`,
                    x: msg.x,
                    y: msg.y,
                    time: msg.time,
                    id: element.id,
                    url: msg.url
                });
                return;
            } else if (type.includes
            ("comments")) {
                const numberOfComments = element.attributes.getNamedItem('aria-label').value;
                sentResult = true;
                sendResponse({
                    result: `NumOfComments-${numberOfComments}`,
                    x: msg.x,
                    y: msg.y,
                    time: msg.time,
                    url: msg.url
                });
                return;
            }
        }

        if (
            element.tagName === "A" &&
            (
                element.href.includes("label%3A") ||
                element.href.includes("/labels/")
            )
        ) {
            console.log('Issue label')
            const labelTitle = element.innerHTML;
            sentResult = true;
            sendResponse({
                result: `IssueLabel-${labelTitle}`,
                x: msg.x,
                y: msg.y,
                time: msg.time,
                id: element.id,
                url: msg.url
            });
            return;
        }
        if (element.tagName === 'RELATIVE-TIME') {
            console.log('Time open')
            const opened = element.innerHTML;
            const timestamp = element.attributes.getNamedItem('title').value;
            sentResult = true;
            sendResponse({
                result: `IssueOpened-${opened} on ${timestamp}`,
                x: msg.x,
                y: msg.y,
                time: msg.time,
                id: element.id,
                url: msg.url
            });
            return;
        }
        if (element.closest('[data-listview-component="trailing-badge"]') &&
            /\d+\s*\/\s*\d+/.test(element.textContent)) {
            console.log('Task progress bar')
            const taskProgress = element.innerHTML;
            sentResult = true;
            sendResponse({
                result: `TaskCompletion-${taskProgress}`,
                x: msg.x,
                y: msg.y,
                time: msg.time,
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
