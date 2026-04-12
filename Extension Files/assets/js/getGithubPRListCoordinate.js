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
            if (element.classList && element.classList.contains('btn-link') && element.innerHTML && element.innerHTML.includes('Open') && element.tagName === 'A') {
                const numberOpen = element.textContent.trim();
                sendResponse({
                    result: `NumPROpen-${numberOpen}`,
                    relX: relX,
                    relY: relY,
                    time: msg.time,
                    id: element.id || null,
                    url: msg.url || location.href
                });
                return;
            }

            // NumPRClosed
            if (element.classList && element.classList.contains('btn-link') && element.innerHTML && element.innerHTML.includes('Closed') && element.tagName === 'A') {
                const numClosed = element.textContent.trim();
                sendResponse({
                    result: `NumPRClosed-${numClosed}`,
                    relX: relX,
                    relY: relY,
                    time: msg.time,
                    id: element.id || null,
                    url: msg.url || location.href
                });
                return;
            }

            // Organization (legacy org link)
            if (element.classList && element.classList.contains('url') && element.classList.contains('fn') && element.tagName === 'A') {
                const attr = element.getAttribute('data-hovercard-type');
                if (attr === 'organization') {
                    const organization = element.textContent.trim();
                    sendResponse({
                        result: `Organization - ${organization}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
            }

            // ProjectName
            if (element.tagName === 'A') {
                const projNode = element.closest && element.closest('strong[itemprop="name"]');
                if (projNode) {
                    const projectName = element.textContent.trim();
                    sendResponse({
                        result: `ProjectName - ${projectName}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
            }

            // NumOfStarred
            if (element.tagName === 'A') {
                const starCounter = element.querySelector && element.querySelector('#repo-stars-counter-star, .js-social-count, .Counter.js-social-count');
                if (starCounter) {
                    const numberStarred = starCounter.textContent.trim();
                    sendResponse({
                        result: `NumOfStarred-${numberStarred}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: starCounter.id || element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
            }

            // NumOfForked
            if (element.tagName === 'A') {
                const forkCounter = element.querySelector && element.querySelector('#repo-network-counter, .Counter, .Counter.js-social-count');
                if (forkCounter && (forkCounter.id === 'repo-network-counter' || forkCounter.classList.contains('Counter') || forkCounter.classList.contains('js-social-count'))) {
                    const numberForked = forkCounter.textContent.trim();
                    sendResponse({
                        result: `NumOfForked-${numberForked}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: forkCounter.id || element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
            }

            // Username
            if (element.tagName === 'A') {
                const hoverType = element.getAttribute && element.getAttribute('data-hovercard-type');
                if (hoverType === 'user') {
                    const username = element.textContent.trim();
                    if (username) {
                        sendResponse({
                            result: `Username-${username}`,
                            relX: relX,
                            relY: relY,
                            time: msg.time,
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
                    const title = element.textContent.trim();
                    const href = element.getAttribute('href') || '';
                    const m = href.match(/\/pull\/(\d+)(?:\/|$)/);
                    const prNumber = m ? m[1] : null;
                    const res = {
                        result: `PullRequest-${prNumber ? ('#' + prNumber + ' ') : ''}${title}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
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
                    const numberOfComments = ariaAttr.match(/\d+/)?.[0] || ariaAttr;
                    sendResponse({
                        result: `NumOfComments-${numberOfComments}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        url: msg.url || location.href
                    });
                    return;
                }
            }

            // PR status: review required / approvals / changes requested
            if (element.tagName === 'A') {
                const aria = (element.getAttribute('aria-label') || '').toLowerCase();
                if (aria.includes('review required')) {
                    sendResponse({
                        result: `PRStatus-Review Required`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
                if (aria.includes('review approval') || aria.includes('review approvals') || /\d+\s+review\s+approvals?/.test(aria)) {
                    sendResponse({
                        result: `PRStatus-Approval`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
                if (aria.includes('requesting changes') || aria.includes('changes requested') || aria.includes('request changes')) {
                    sendResponse({
                        result: `PRStatus-Changes Requested`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: element.id || null,
                        url: msg.url || location.href
                    });
                    return;
                }
            }

            // Time opened (relative-time element)
            if (element.tagName === 'RELATIVE-TIME') {
                const opened = element.innerHTML;
                const timestamp = (element.getAttribute && element.getAttribute('title')) || null;
                sendResponse({
                    result: `PullRequestOpened-${opened}${timestamp ? (' on ' + timestamp) : ''}`,
                    relX: relX,
                    relY: relY,
                    time: msg.time,
                    id: element.id || null,
                    url: msg.url || location.href
                });
                return;
            }

            // Task progress count
            if (element.tagName === 'TRACKED-ISSUES-PROGRESS') {
                const taskProgress = element.dataset.total;
                sendResponse({
                    result: `TaskCompletion-${taskProgress}`,
                    relX: relX,
                    relY: relY,
                    time: msg.time,
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

/**
 * This page currently logs:
 * - Num PR Open/Closed
 * - Project name
 * - Organization name
 * - Number of forked
 * - Number of starred
 * - Number of comments on PR
 * - Username (opened PR)
 * - PR Title
 * - Relative time (e.g. opened 2 days ago)
 * - Status (approved, review required, changes requested)
 */