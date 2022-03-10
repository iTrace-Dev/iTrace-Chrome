console.log('Github Pull Request Script Started');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    let startTime = new Date().getTime();
    let endTime = 0;
    for (element of elements) {
        if (element.id === 'files_tab_counter') {
            console.log('# of files changed');
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `NumOfFilesChanged-${element.innerHTML.trim()}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.id === 'checks_tab_counter') {
            console.log('# Checks');
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `NumOfChecks-${element.innerHTML.trim()}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.id === 'commits_tab_counter') {
            console.log('# Commits');
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `NumOfCommits-${element.innerHTML.trim()}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.id === 'conversation_tab_counter') {
            console.log('# Conversations');
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `NumOfConversationComments-${element.innerHTML.trim()}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('diffstat')) {
            if (element.id === 'diffstat') {
                console.log('Number of total diffs');
                sentResult = true;
                endTime = new Date().getTime();
                // TODO Get children
                sendResponse({ result: `TotalDiffs- -${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
            if (element.classList.contains('tooltipped')) {
                console.log('Number of file diffs');
                const numChanges = element.attributes.getNamedItem('aria-label').value;
                endTime = new Date().getTime();
                // TODO get filename
                sentResult = true;
                endTime = new Date().getTime();
                sendResponse({ result: `NumOfFileDiffs-${numChanges.trim()}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
        }
        if (element.tagName === 'TD' && element.classList.contains('blob-code-deletion')) {
            console.log('Deleted Line of Code');
            // TODO need to get the filename somehow
            let lineNumber = 0;
            if (element.attributes.getNamedItem('data-line-number')) {
                lineNumber = element.attributes.getNamedItem('data-line-number').value;
            }
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `DeletedLOC-${lineNumber}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.tagName === 'TD' && element.classList.contains('blob-code-addition')) {
            console.log('Added Line of Code');
            // TODO need to get the filename somehow
            let lineNumber = 0;
            if (element.attributes.getNamedItem('data-line-number')) {
                lineNumber = element.attributes.getNamedItem('data-line-number').value;
            }
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `AddedLOC-${lineNumber}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.tagName === 'TD' && element.classList.contains('blob-code-context')) {
            console.log('Unchanged Line of Code');
            // TODO need to get the filename somehow
            let lineNumber = 0;
            if (element.attributes.getNamedItem('data-line-number')) {
                lineNumber = element.attributes.getNamedItem('data-line-number').value;
            }
            sendResponse({ result: `UnchangedLOC-${lineNumber}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.tagName === 'A' && element.attributes.getNamedItem('href')) {
            if (element.attributes.getNamedItem('href').value.includes("#diff-")) {
                console.log("Filename")
                const fileName = element.attributes.getNamedItem('title').value;
                sentResult = true;
                endTime = new Date().getTime();
                sendResponse({ result: `File-${fileName.trim()}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
            if (element.attributes.getNamedItem('href').value.includes("/commits/")) {
                console.log("Commit name");
                // TODO get verified or not
                const commitTitle = element.innerHTML;
                sentResult = true;
                endTime = new Date().getTime();
                sendResponse({ result: `CommitName-${commitTitle.trim()}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
        }
        if (element.attributes.getNamedItem('data-hovercard-type') && element.attributes.getNamedItem('data-hovercard-type').value === 'user' && element.tagName != 'IMG') {
            console.log('username')
            let user = element.innerHTML.trim();
            if (element.tagName === 'SPAN') {
                user = element.attributes.getNamedItem('data-assignee-name').value;
            }
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `Username-${user}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        }
        if (element.classList.contains('g-emoji')) {
            console.log("Emoji");
            sentResult = true;
            endTime = new Date().getTime();
            const emojiType = element.attributes.getNamedItem('alias') ? element.attributes.getNamedItem('alias').value : '';
            sendResponse({ result: `Emoji-${emojiType}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('gh-header-title')) {
            console.log('PR Title');
            sentResult = true;
            const titleText = element.firstChild.nextSibling ? element.firstChild.nextSibling.innerHTML.trim() : '';
            endTime = new Date().getTime();
            sendResponse({ result: `PRTitle-${titleText}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.tagName === 'IMG' && element.classList.contains('avatar')) {
            // Avatar in Timeline
            if (element.parentNode.parentNode.classList.contains('TimelineItem')) {
                console.log('User avatar - Timeline Item');
                sentResult = true;
                endTime = new Date().getTime();
                const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                sendResponse({ result: `TimelineAvatarImage-${user}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
            // Avatar in Comment Header
            if (element.classList.contains('rounded-1')) {
                console.log('User avatar - Comment header');
                sentResult = true;
                endTime = new Date().getTime();
                const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                sendResponse({ result: `HeaderAvatarImage-${user}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
            // Avatar in Code Review Comment
            if (element.parentNode.parentNode.classList.contains('mt-1')||element.parentNode.parentNode.classList.contains('mr-2')) {
                console.log('User avatar - Code Review Comment');
                sentResult = true;
                endTime = new Date().getTime();
                const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                sendResponse({ result: `HeaderAvatarImage-${user}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
            // Avatar in Sidebar - Participants
            if (element.parentNode.classList.contains('participant-avatar')) {
                console.log('User avatar - Participant');
                sentResult = true;
                endTime = new Date().getTime();
                const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                sendResponse({ result: `ParticipantAvatarImage-${user}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
            // Avatar in Sidebar - Reviewers
            else {
                console.log('User avatar - Reviewers');
                sentResult = true;
                endTime = new Date().getTime();
                const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
                sendResponse({ result: `ReviewerAvatarImage-${user}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
        }
        // Item in Timeline
        // if (element.classList.contains('TimelineItem-body')) {
        //     console.log('Timeline Item');
        //     sentResult = true;
        //     endTime = new Date().getTime();
        //     const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
        //     sendResponse({ result: `TimelineItem-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        //     return;
        // }
        const sidebarElements = ['Reviewers', 'Projects', 'Milestones', 'Labels', 'Assignees'];
        if (element.classList.contains('discussion-sidebar-heading') && sidebarElements.includes(element.innerHTML.trim())) {
            console.log(element.innerHTML.trim());
            sentResult = true;
            endTime = new Date().getTime();
            const header = element.innerHTML.trim();
            sendResponse({ result: `${header}-${header}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('participation')) {
            console.log("Sidebar - Participation")
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `Sidebar-Participation-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('IssueLabel')) {
            console.log("Issue Label");
            sentResult = true;
            endTime = new Date().getTime();
            const labelName = element.firstChild.nextSibling ? element.firstChild.nextSibling.innerHTML : '';
            sendResponse({ result: `IssueLabel-${labelName}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.tagName === 'RELATIVE-TIME') {
            console.log("Time");
            sentResult = true;
            endTime = new Date().getTime();
            sendResponse({ result: `CommentDate-${element.innerHTML}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Image within comment body
        if (element.tagName === 'IMG' && element.parentNode.parentNode.parentNode.classList.contains('comment-body')) {
            console.log("Image");
            sentResult = true;
            endTime = new Date().getTime();
            const imgUrl = element.parentNode.attributes.getNamedItem('href') ? element.parentNode.attributes.getNamedItem('href').value : '';
            sendResponse({ result: `Image-${imgUrl}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        }
        // Comment body
        if (element.tagName === 'TD' && element.classList.contains('comment-body')) {
            console.log('Comment body');
            sentResult = true;
            endTime = new Date().getTime();
            const timelineBody = element.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
            const commentID = timelineBody.attributes.getNamedItem('id') ? timelineBody.attributes.getNamedItem('id').value : '';
            sendResponse({ result: `Comment Body-${commentID}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Comment body within discussion
        if (element.classList.contains('width-auto') && element.classList.contains('comment-body')) {
            console.log('Comment body - Discussion');
            sentResult = true;
            endTime = new Date().getTime();
            const timelineBody = element.parentNode.parentNode.parentNode.parentNode.parentNode;
            const commentID = timelineBody.attributes.getNamedItem('id') ? timelineBody.attributes.getNamedItem('id').value : '';
            sendResponse({ result: `Comment Body-${commentID}-${startTime - endTime}ms`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
    }

    if (!sentResult) {
        sendResponse(null);
    }
});
