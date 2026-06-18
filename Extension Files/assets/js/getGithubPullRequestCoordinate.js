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

if (window.iTrace_getGithubPullRequestCoordinate_Loaded) {
} else {
    window.iTrace_getGithubPullRequestCoordinate_Loaded = true;
    console.log('Github Pull Requests Script Started');
    // looks at a specific pull request and listen/logs the data and things associated with pull requests
    chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
        const elements = document.elementsFromPoint(msg.relX, msg.relY);
        let sentResult = false;
        for (element of elements) {
            // Words don't appear to work for now.
            // if (element.id.includes('word')) {
            //   console.log('word of a comment')
            //   const word = element.innerHTML.trim();
            //   sentResult = true;
            //   if (element.attributes.getNamedItem('listtype')) {
            //     const listType = element.attributes.getNamedItem('listtype').value === 'ol' ? 'NumberedList' : 'UnorderedList';
            //     const listNumber = element.attributes.getNamedItem('listnumber').value;
            //     sendResponse({ result: `CommentWordIn${listType}-${word}-${listNumber}`, relX: msg.relX, relY: msg.relY, time: msg.time, id: element.id, url: msg.url });  
            //     return;
            //   } else {
            //     sendResponse({ result: `CommentWord-${word}`, relX: msg.relX, relY: msg.relY, time: msg.time, id: element.id, url: msg.url });
            //     return;
            //   }
            // }
            if (element.classList.contains('task-list-item')) {
                console.log('Checkbox item');
                sentResult = true;
                sendResponse({
                    result: `ChecklistItem-`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            // if (element.tagName === 'A' && element.classList.contains('participant-avatar')) {
            //   console.log("participant")
            //   sentResult = true;
            //   const user = element.attributes.getNamedItem('data-hovercard-url').value.split('/')[2];
            //   console.log(user);
            //   sendResponse({ result: `Participant-${user}`, relX: msg.relX, relY: msg.relY, time: msg.time, id: element.id, url: msg.url });
            //   return; 
            // }

            // Number of files changed
            if (element.closest('a[href*="/changes"][role="tab"]')) {
                const filesTab = element.closest('a[href*="/changes"][role="tab"]');
                const counter = filesTab.querySelector(
                    '[data-component="CounterLabel"]'
                );

                if (counter) {
                    const filesCount = counter.textContent.trim();

                    console.log(`# Files Changed: ${filesCount}`);

                    sendResponse({
                        result: `NumOfFilesChanged-${filesCount}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: filesTab.id,
                        url: msg.url
                    });

                    return;
                }
            }

            // Number of checks
            if (element.closest('a[href*="/checks"][role="tab"]')) {
                const checksTab = element.closest('a[href*="/checks"][role="tab"]');
                const counter = checksTab.querySelector(
                    '[data-component="CounterLabel"]'
                );

                if (counter) {
                    const checksCount = counter.textContent.trim();

                    console.log(`# Checks: ${checksCount}`);

                    sendResponse({
                        result: `NumOfChecks-${checksCount}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: checksTab.id,
                        url: msg.url
                    });

                    return;
                }
            }

            // Number of commits
            if (element.closest('a[href*="/commits"][role="tab"]')) {
                const commitsTab = element.closest('a[href*="/commits"][role="tab"]');
                const counter = commitsTab.querySelector(
                    '[data-component="CounterLabel"]'
                );

                if (counter) {
                    const commitCount = counter.textContent.trim();

                    console.log(`# Commits: ${commitCount}`);

                    sendResponse({
                        result: `NumOfCommits-${commitCount}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: commitsTab.id,
                        url: msg.url
                    });

                    return;
                }
            }

            // Number of conversation comments
            if (element.closest('a[href*="/pull/"][role="tab"]')) {
                const conversationTab = element.closest('a[href*="/pull/"][role="tab"]');
                const counter = conversationTab.querySelector(
                    '[data-component="CounterLabel"]'
                );

                if (counter) {
                    const conversationCount = counter.textContent.trim();

                    console.log(`# Conversations: ${conversationCount}`);

                    sendResponse({
                        result: `NumOfConversationComments-${conversationCount}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: conversationTab.id,
                        url: msg.url
                    });

                    return;
                }
            }
            // Number of total diffs
            if (element.closest('.PullRequestHeader-module__diffStatesWrapper__l3nLn')) {
                const summary = element.closest('.PullRequestHeader-module__diffStatesWrapper__l3nLn').querySelector('.sr-only').textContent.trim();
                sentResult = true;
                sendResponse({
                    result: `TotalDiffs-${summary}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            // Added line of code
            if (element.closest('td.diff-text-cell[data-line-number]')) {
                const diffCell = element.closest('td.diff-text-cell[data-line-number]');
                const lineNumber = diffCell.getAttribute('data-line-number') || 'Unknown';
                if (diffCell.querySelector('code.addition')) {
                    console.log(`Added Line of Code: ${lineNumber}`);

                    sendResponse({
                        result: `AddedLOC-${lineNumber}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: diffCell.id,
                        url: msg.url
                    });

                    return;
                } else if (diffCell.querySelector('code.deletion')) {
                    console.log(`Deleted Line of Code: ${lineNumber}`);

                    sendResponse({
                        result: `DeletedLOC-${lineNumber}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: diffCell.id,
                        url: msg.url
                    });

                    return;
                } else {
                    console.log(`Context Line of Code: ${lineNumber}`);

                    sendResponse({
                        result: `ContextLOC-${lineNumber}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: diffCell.id,
                        url: msg.url
                    });

                    return;
                }
            }
            // File Name
            if (element.closest('a[href*="#diff-"]')) {
                console.log("Filename")
                // const fileName = element.attributes.getNamedItem('title').value;
                const fileName = element.innerHTML;
                sentResult = true;
                sendResponse({
                    result: `File-${fileName.trim()}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            if (element.closest('a[href*="/changes"]')) {
                // Commit name
                console.log("Commit name");
                const commitTitle = element.innerHTML;
                sentResult = true;
                sendResponse({
                    result: `CommitName-${commitTitle.trim()}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            if (element.attributes.getNamedItem('data-hovercard-type') && element.attributes.getNamedItem('data-hovercard-type').value === 'user') {
                console.log('username')
                let user = element.innerHTML.trim();
                if (element.tagName === 'SPAN') {
                    user = element.attributes.getNamedItem('data-assignee-name').value;
                }
                sentResult = true;
                sendResponse({
                    result: `Username-${user}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
            }
            if (element.closest('[data-component="PH_Title"]')) {
                const titleSpan = element.closest('[data-component="PH_Title"]')?.querySelector('span');
                const title = titleSpan?.textContent.trim();
                console.log('PR Title');
                sentResult = true;
                sendResponse({
                    result: `PRTitle-${title}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            if (element.tagName === 'IMG' && element.classList.contains('avatar')) {
                console.log('User avatar');
                sentResult = true;
                const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                sendResponse({
                    result: `AvatarImage-${user}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }

            // const sidebarElements = ['Reviewers', 'Projects', 'Milestones', 'Labels', 'Assignees'];
            // if (element.classList.contains('discussion-sidebar-heading') && sidebarElements.includes(element.innerHTML.trim())) {
            //   console.log(element.innerHTML.trim());
            //   sentResult = true;
            //   const header = element.innerHTML.trim();
            //   sendResponse({ result: `${header}-${header}`, relX: msg.relX, relY: msg.relY, time: msg.time, id: element.id, url: msg.url });
            //   return;
            // }
            if (element.tagName === 'FORM' && element.classList.contains('js-issue-sidebar-form')) {
                let ariaLabel = element.getAttribute('aria-label') || 'UnknownForm';
                ariaLabel = ariaLabel.replace(/^Select\s+/i, '')
                if (ariaLabel === "Link issues") {
                    ariaLabel = "development"
                }
                console.log(`Sidebar - ${ariaLabel}`);
                sentResult = true;
                sendResponse({
                    result: `Sidebar-${ariaLabel}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
            }
            if (element.classList.contains('participation')) {
                console.log("Sidebar - Participation")
                sentResult = true;
                sendResponse({
                    result: `Sidebar-Participation`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            if (element.classList.contains('IssueLabel')) {
                console.log("Issue Label");
                sentResult = true;
                const labelName = element.textContent.trim();
                sendResponse({
                    result: `IssueLabel-${labelName}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            if (element.tagName === 'RELATIVE-TIME') {
                console.log("Time");
                sentResult = true;
                sendResponse({
                    result: `CommentDate-${element.innerHTML}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            // Image within comment body
            if (element.tagName === 'IMG' && (element.parentNode.parentNode.parentNode.classList.contains('comment-body') ||
                element.parentNode.parentNode.parentNode.parentNode.classList.contains('comment-body'))) {
                console.log("Image");
                sentResult = true;
                const imgUrl = element.parentNode.attributes.getNamedItem('href') ? element.parentNode.attributes.getNamedItem('href').value : '';
                sendResponse({
                    result: `Image-${imgUrl}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            // Comment body
            if ((element.tagName === 'TD' || element.tagName === 'DIV') && element.classList.contains('comment-body')) {
                console.log('Comment body');
                sentResult = true;
                const timelineBody = element.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                const commentID = timelineBody.attributes.getNamedItem('id') ? timelineBody.attributes.getNamedItem('id').value : '';
                sendResponse({
                    result: `Comment Body-${commentID}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            // Comment body within discussion
            if (element.classList.contains('width-auto') && element.classList.contains('comment-body')) {
                console.log('Comment body - Discussion');
                sentResult = true;
                const timelineBody = element.parentNode.parentNode.parentNode.parentNode.parentNode;
                const commentID = timelineBody.attributes.getNamedItem('id') ? timelineBody.attributes.getNamedItem('id').value : '';
                sendResponse({
                    result: `Comment Body-${commentID}`,
                    relX: msg.relX,
                    relY: msg.relY,
                    time: msg.time,
                    tagname: element.tagName,
                    id: element.id,
                    url: msg.url
                });
                return;
            }
            if (element.tagName === 'IMG' && element.classList.contains('avatar')) {
                // Avatar in Timeline
                if (element.parentNode.parentNode.classList.contains('TimelineItem')) {
                    console.log('User avatar - Timeline Item');
                    sentResult = true;
                    const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                    sendResponse({
                        result: `TimelineAvatarImage-${user}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id,
                        url: msg.url
                    });
                    return;
                }
                // Avatar in Comment Header
                // Not entirely sure what this is referring to, may need to be updated
                if (element.classList.contains('rounded-1')) {
                    console.log('User avatar - Comment header');
                    sentResult = true;
                    const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                    sendResponse({
                        result: `HeaderAvatarImage-${user}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id,
                        url: msg.url
                    });
                    return;
                }
                // Avatar in Code Review Comment
                if (element.parentNode.parentNode.classList.contains('mt-1') || element.parentNode.parentNode.classList.contains('mr-2')) {
                    console.log('User avatar - Code Review Comment');
                    sentResult = true;
                    const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                    sendResponse({
                        result: `HeaderAvatarImage-${user}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id,
                        url: msg.url
                    });
                    return;
                }
                // Avatar in Sidebar - Participants
                if (element.parentNode.classList.contains('participant-avatar')) {
                    console.log('User avatar - Participant');
                    sentResult = true;
                    const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                    sendResponse({
                        result: `ParticipantAvatarImage-${user}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id,
                        url: msg.url
                    });
                    return;
                }
                // Avatar in Sidebar - Reviewers
                else {
                    console.log('User avatar - Reviewers');
                    sentResult = true;
                    const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                    sendResponse({
                        result: `ReviewerAvatarImage-${user}`,
                        relX: msg.relX,
                        relY: msg.relY,
                        time: msg.time,
                        tagname: element.tagName,
                        id: element.id,
                        url: msg.url
                    });
                    return;
                }
            }
        }
        if (!sentResult) {
            sendResponse({
                result: null,
                time: msg.time,
                relX: msg.relX,
                relY: msg.relY
            }
            )
        }
    });
}
