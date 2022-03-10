console.log('Github Pull Requests Script Started');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    for (element of elements) {
        if(element.tagName === 'A' && element.classList.contains('text-red')) {
          console.log("Travis CI Failure")
          sentResult = true;
          sendResponse({ result: `CITests-Failing`, x: msg.x, y: msg.y, time: msg.time, url: msg.url });
          return;
        }
        if(element.tagName === 'A' && element.classList.contains('text-green')) {
            console.log("Travis CI Passing")
            sentResult = true;
            sendResponse({ result: `CITests-Passing`, x: msg.x, y: msg.y, time: msg.time, url: msg.url });
            return;
        }
        if (element.classList.contains('btn-link') && element.innerHTML.includes('Open') && element.tagName === 'A') {
            console.log("Number of PRs open");
            const numberOpen = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `NumPROpen-${numberOpen}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('url') && element.classList.contains('fn') && element.tagName === 'A') {
            if (!element.attributes.getNamedItem('data-hovercard-type')) {
                return;
            } 
            if (element.attributes.getNamedItem('data-hovercard-type') === 'organization') {
                console.log("Project/Organization Name");
                const organization = element.innerHTML.trim();
                sentResult = true;
                sendResponse({ result: `ProjectName - ${organization}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
        }
        if (element.classList.contains('social-count') && element.tagName === 'A') {
            const ariaLabel = element.attributes.getNamedItem('aria-label').value;
            if (ariaLabel.includes('forked')) {
                console.log('Number of users who have forked repository');
                const numberForked = element.innerHTML.trim();
                sentResult = true;
                sendResponse({ result: `NumOfForked-${numberForked}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            } else if (ariaLabel.includes('watching')) {
                console.log('Number of users who are watching repository');
                const numberWatching = element.innerHTML.trim();
                sentResult = true;
                sendResponse({ result: `NumOfWatching-${numberWatching}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            } else if (ariaLabel.includes('starred')) {
                console.log('Number of users who starred repository');
                const numberStarred= element.innerHTML.trim();
                sentResult = true;
                sendResponse({ result: `NumOfStarred-${numberStarred}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            }
        }
        if (element.tagName === 'A' && element.attributes.getNamedItem("aria-label") && element.attributes.getNamedItem("aria-label").value.includes("comments")) {
            console.log('Number of comments')
            const numberOfComments = element.attributes.getNamedItem('aria-label').value;
            sentResult = true;
            sendResponse({ result: `NumOfComments-${numberOfComments}`, x: msg.x, y: msg.y, time: msg.time, url: msg.url });
            return;
        }
        if (element.classList.contains('muted-link') && element.attributes.getNamedItem('data-hovercard-type')) {
            const linkType = element.attributes.getNamedItem('data-hovercard-type').value;
            if (linkType === 'user') {
                console.log('User')
                const user = element.innerHTML.trim();
                sentResult = true;
                sendResponse({ result: `Username-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            } else if (linkType === 'pull_requires') {
                console.log('Pull request')
                const pullRequest = element.innerHTML.trim();
                sentResult = true;
                sendResponse({ result: `PullRequest-${pullRequest}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
                return;
            } else if (linkType.includes("review approval")) {
                console.log('# of approvals')
                const numApprovals = element.attributes.getNamedItem('aria-label').value;
                sentResult = true;
                sendResponse({ result: `NumApprovals-${numApprovals}`, x: msg.x, y: msg.y, time: msg.time, url: msg.url });
                return;
            }
        }
        if (element.classList.contains('muted-link') && element.attributes.getNamedItem('aria-label')) {
            const label = element.attributes.getNamedItem('aria-label').value;
            if (label.includes('approval')) {
                console.log('Approval')
                sentResult = true;
                sendResponse({ result: `PRStatus-Approval`, x: msg.x, y: msg.y, time: msg.time, url: msg.url });
                return;
            } else if (label.includes('requesting changes')) {
                console.log('Changes requested')
                sentResult = true;
                sendResponse({ result: `PRStatus-Changes Requested`, x: msg.x, y: msg.y, time: msg.time, url: msg.url });
                return;
            }
        }
        if (element.tagName === 'RELATIVE-TIME') {
            console.log('Time opened')
            const opened = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `PullRequestOpened-${opened}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains('task-progress-counts')) {
            console.log('Task progress count')
            const taskProgress = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `TaskCompletion-${taskProgress}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.id.includes('issue_') && element.id.includes("link")) {
            console.log("PR Title");
            const title = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `PRTitle-${title}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
    }
    if (!sentResult) {
        sendResponse(null);
    }
});