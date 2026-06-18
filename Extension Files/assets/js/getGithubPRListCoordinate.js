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

if (window.iTrace_getGithubPRListCoordinate_Loaded) {
} else {
    window.iTrace_getGithubPRListCoordinate_Loaded = true;
    console.log('Github List of Pull Requests Script Started');
    // looks at list of pull requests and logs its data
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        try {
            const relX = msg.relX;
            const relY = msg.relY;
            const elements = document.elementsFromPoint(relX, relY) || [];

            for (const element of elements) {
                if (!element) continue;

                // NumPROpen
                if (element.classList && element.classList.contains("btn-link") && element.innerHTML && element.innerHTML.includes('Open') && element.tagName === 'A') {
                    console.log("NumPROpen")
                    const numberOpen = element.textContent.trim();
                    sendResponse({
                        result: `NumPROpen-${numberOpen}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }

                // NumPRClosed
                if (element.classList && element.classList.contains('btn-link') && element.innerHTML && element.innerHTML.includes('Closed') && element.tagName === 'A') {
                    console.log("NumPRClosed")
                    const numClosed = element.textContent.trim();
                    sendResponse({
                        result: `NumPRClosed-${numClosed}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }

                // Organization/Project Link
                if (element.dataset.component === "Breadcrumbs.Item") {
                    console.log("Project/Organization Name");

                    const organization = element.textContent.trim();

                    sentResult = true;
                    sendResponse({
                        result: `Organization/ProjectName-${organization}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id,
                        url: msg.url
                    });
                    return;
                }

                // Username
                if (element.tagName === 'A') {
                    const hoverType = element.getAttribute && element.getAttribute('data-hovercard-type');
                    if (hoverType === 'user') {
                        console.log("Username")
                        const username = element.textContent.trim();
                        if (username) {
                            sendResponse({
                                result: `Username-${username}`,
                                relX: relX,
                                relY: relY,
                                time: msg.time,
                                tagname: element.tagName,
                                id: element.id || null,
                                url: msg.url || location.href
                            });
                            return;
                        }
                    }
                }

                // PullRequest link
                if (element.tagName === 'A') {
                    const hover = element.getAttribute && element.getAttribute('data-hovercard-type');
                    if (hover === 'pull_request') {
                        console.log("PullReqest link")
                        const title = element.textContent.trim();
                        const href = element.getAttribute('href') || '';
                        const m = href.match(/\/pull\/(\d+)(?:\/|$)/);
                        const prNumber = m ? m[1] : null;
                        const res = {
                            result: `PullRequest-${prNumber ? ('#' + prNumber + ' ') : ''}${title}`,
                            relX: relX,
                            relY: relY,
                            time: msg.time,
                            tagname: element.tagName,
                            id: element.id || null,
                            url: msg.url || location.href
                        };
                        sendResponse(res);
                        return;
                    }
                }

                // NumOfComments
                if (element.tagName === 'A') {
                    const ariaAttr = element.getAttribute && element.getAttribute('aria-label');
                    if (ariaAttr && ariaAttr.toLowerCase().includes('comment')) {
                        console.log("NumOfComments")
                        const numberOfComments = ariaAttr.match(/\d+/)?.[0] || ariaAttr;
                        sendResponse({
                            result: `NumOfComments-${numberOfComments}`,
                            relX: relX,
                            relY: relY,
                            time: msg.time,
                            tagname: element.tagName,
                            url: msg.url || location.href
                        });
                        return;
                    }
                }

                // Time opened (relative-time element)
                if (element.tagName === 'RELATIVE-TIME') {
                    console.log("Time opened (relative-time element)")
                    const opened = element.innerHTML;
                    const timestamp = (element.getAttribute && element.getAttribute('title')) || null;
                    sendResponse({
                        result: `PullRequestOpened-${opened}${timestamp ? (' on ' + timestamp) : ''}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }

                // Task progress count
                if (element.tagName === 'TRACKED-ISSUES-PROGRESS') {
                    console.log("Task progress count")
                    const taskProgress = element.dataset.total;
                    sendResponse({
                        result: `TaskCompletion-${taskProgress}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
            }

            // nothing matched
            sendResponse({
                result: null,
                time: msg.time,
                relX: msg.relX,
                relY: msg.relY
            }
            )
        } catch (e) {
            try {
                sendResponse({
                    result: null,
                    time: msg.time,
                    relX: msg.relX,
                    relY: msg.relY
                }
                )
            } catch (er) {
            }
        }
    });
}

/**
 * This page currently logs:
 * - Num PR Open/Closed
 * - Project name
 * - Organization name
 * - Number of comments on PR
 * - Username (opened PR)
 * - PR Title
 * - Relative time (e.g. opened 2 days ago)
 * - Status (approved, review required, changes requested)
 */