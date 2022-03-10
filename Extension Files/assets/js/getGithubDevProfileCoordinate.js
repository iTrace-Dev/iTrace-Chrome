console.log('Developer Profile Script Started');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    for (element of elements) {
        if (element.classList.contains("avatar") && element.tagName === 'IMG') {
            console.log('avatar image'); 
            sentResult = true;
            sendResponse({ result: `AvatarImage-`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains("js-activity-overview-graph-container") && element.attributes.getNamedItem('data-percentages')) {
            console.log("activity overview");
            let activityOverview = element.attributes.getNamedItem('data-percentages').value;
            activityOverview = JSON.parse(activityOverview);
            const percentCommits = activityOverview["Commits"];
            const percentCodeReview = activityOverview["Code review"];
            const percentPullRequests = activityOverview["Pull requests"];
            sentResult = true;
            sendResponse({ result: `ActivityOverview-Commit:${percentCommits}%,CodeReview:${percentCodeReview}%,PullRequest:${percentPullRequests}%`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.tagName === 'DIV' && element.classList.contains("graph-before-activity-overview")) {
            console.log('contribution heat map')
            sentResult = true;
            sendResponse({ result: `ContributionHeatMap`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.id.includes("year-link")) {
            console.log('Year Link')
            const year = element.id;
            sentResult = true;
            sendResponse({ result: `Year-${year}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.tagName === 'SPAN' && element.classList.contains("label")) {
            console.log('profile label')
            const labelName = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `ProfileLabel-${labelName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.tagName === 'A' && element.attributes.getNamedItem("data-hovercard-type") && element.attributes.getNamedItem("data-hovercard-type").value === "organization"
            && element.classList.contains("avatar-group-item")) {
            console.log('Organization')
            console.log(element);
            const organizationName = element.attributes.getNamedItem("aria-label").value;
            sentResult = true;
            sendResponse({ result: `Organization-${organizationName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.tagName === 'A' && element.attributes.getNamedItem("itemprop") && element.attributes.getNamedItem("itemprop").value.includes("codeRepository")) {
            console.log('Contributed repositories')
            const repoName = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `Repository-${repoName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.classList.contains("Counter")) {
            console.log("tab Counter")
            const tab = element.parentElement.innerHTML; 
            const number = element.innerHTML
            sentResult = true;
            sendResponse({ result: `Num${tab}-${number}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains("Profile-rollup-wrapper")) {
            console.log("Contribution Acitivty Entry")
            // Need more info on the contribution 
            sentResult = true;
            sendResponse({ result: `ContributionActivity-`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        
    }
    if (!sentResult) {
        sendResponse(null);
    }


    // Still need to check: Profile label, URL pattern matching, contribution activity entry, organizations, counters
});