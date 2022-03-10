console.log('Github Issues Script Started');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    for (element of elements) {
        if (element.id.includes('issue_') && element.id.includes("link")) {
            console.log("Issue Title");
            const title = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `IssueTitle-${title}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }

        if (element.classList.contains('btn-link') && element.innerHTML.includes('Open') && element.tagName === 'A') {
            console.log("Number of issues open");
            const numberOpen = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `NumIssuesOpen-${numberOpen}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('social-count') && element.tagName === 'A') {
            const ariaLabel = element.attributes.getNamedItem('aria-label').value;
            if (ariaLabel.includes('forked')) {
                console.log('Number of users who have forked repository');
                const numberForked = element.innerHTML;
                sentResult = true;
                sendResponse({ result: `NumOfForked-${numberForked}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;

            } else if (ariaLabel.includes('watching')) {
                console.log('Number of users who are watching repository');
                const numberWatching = element.innerHTML;
                sentResult = true;
                sendResponse({ result: `NumOfWatching- ${numberWatching}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            } else if (ariaLabel.includes('starred')) {
                console.log('Number of users who starred repository');
                const numberStarred= element.innerHTML;
                sentResult = true;
                sendResponse({ result: `NumOfStarred-${numberStarred}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
        }
        if (element.classList.contains('url') && element.classList.contains('fn') && element.tagName === 'A') {
            if (!element.attributes.getNamedItem('data-hovercard-type')) {
                return;
            } 
            if (element.attributes.getNamedItem('data-hovercard-type') === 'organization') {
                console.log("Project/Organization Name");
                const organization = element.innerHTML;
                sentResult = true;
                sendResponse({ result: `ProjectName-${organization}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
        }
        if (element.classList.contains('IssueLabel')) {
            console.log('Issue label')
            const labelTitle = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `IssueLabel-${labelTitle}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('muted-link')) {
            if (!element.attributes.getNamedItem('data-hovercard-type')) {
                return;
            }
            const linkType = element.attributes.getNamedItem('data-hovercard-type').value 
            if (linkType === 'user') {
                console.log('user link')
                const user = element.innerHTML;
                sentResult = true;
                sendResponse({ result: `Username-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            } else if (linkType === 'issue') {
                console.log('issue link')
                const issue = element.innerHTML;
                sentResult = true;
                sendResponse({ result: `Issue-${issue}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            } else if (linkType.includes("comments")) {
                const numberOfComments = element.attributes.getNamedItem('aria-label').value;
                sentResult = true;
                sendResponse({ result: `NumOfComments-${numberOfComments}`, x: msg.x, y: msg.y, time: msg.time, url: msg.url });
                return;
            }
        }
        if (element.tagName === 'RELATIVE-TIME') {
            console.log('Time open')
            const opened = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `IssueOpened-${opened}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('task-progress-counts')) {
            console.log('Task progress bar')
            const taskProgress = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `TaskCompletion-${taskProgress}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
    }
    if (!sentResult) {
        sendResponse(null);
    }
});
