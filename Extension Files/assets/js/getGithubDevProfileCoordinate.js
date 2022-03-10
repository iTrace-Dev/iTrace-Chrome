console.log('Developer Profile Script Started');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.url.includes('jabref')) {
        return;
    }
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    for (element of elements) {
        if (element.tagName === "P" && element.attributes.getNamedItem('itemprop') && msg.url.includes("repositories")) {
            console.log('Description');
            sentResult = true;
            const repoName = element.parentElement.parentElement.childNodes[1].childNodes[1].childNodes[1].innerHTML.trim();
            sendResponse({ result: `RepositoryDescription-${repoName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.tagName === "SVG" && element.attributes.getNamedItem('aria-label') && element.attributes.getNamedItem('aria-label').value === "star") {
            console.log("Repository stars");
            sentResult = true;
            const numOfStars = element.innerHTML.trim();
            sendResponse({ result: `RepositoryStars-${numOfStars}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.tagName === "SVG" && element.attributes.getNamedItem('aria-label') && element.attributes.getNamedItem('aria-label').value === "fork") {
            console.log("Repository forks");
            sentResult = true;
            const repoName = element.parentElement.parentElement.parentElement.childNodes[1].childNodes[1].childNodes[1].innerHTML.trim();
            const numOfForks = element.innerHTML.trim();
            sendResponse({ result: `RepositoryForks-${numOfForks}-${repoName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }

        if (element.attributes.getNamedItem('itemprop') && element.attributes.getNamedItem('itemprop').value === "programmingLanguage") {
            console.log("Repository Language");
            sentResult = true;
            const language = element.innerHTML.trim();
            let repoName = "";
            if (element.parentElement.parentElement.parentElement.childNodes[1].childNodes[1].childNodes[1].innerHTML) {
                repoName = element.parentElement.parentElement.parentElement.childNodes[1].childNodes[1].childNodes[1].innerHTML;
            }
            sendResponse({ result: `RepositoryLanguage-${language}-${repoName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        }

        if (element.classList.contains("avatar") && element.tagName === 'IMG') {
            console.log('avatar image'); 
            sentResult = true;
            let avatarImageLoc = "";
            if (msg.url.includes('followers')) {
                avatarImageLoc = "FollowersPage"
            } else if (msg.url.includes('following')) {
                avatarImageLoc = "FollowingPage"
            } else {
                avatarImageLoc = "Profile"
            }
            sendResponse({ result: `AvatarImage-${avatarImageLoc}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
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
            const labelName = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `ProfileLabel-${labelName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.tagName === 'A' && element.attributes.getNamedItem("data-hovercard-type") && element.attributes.getNamedItem("data-hovercard-type").value === "organization"
            && element.classList.contains("avatar-group-item")) {
            console.log('Organization')
            const organizationName = element.attributes.getNamedItem("aria-label").value.trim();
            sentResult = true;
            sendResponse({ result: `Organization-${organizationName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.tagName === 'A' && element.attributes.getNamedItem("data-hovercard-type") && element.attributes.getNamedItem("data-hovercard-type").value === "user") {
            console.log('User')
            let userLocation = ""
            if (msg.url.includes("followers")) {
                userLocation = "Followers"
            } else if (msg.url.includes("following")) {
                userLocation = "Following"
            }
            const userName = element.childNodes[3].innerHTML.trim();
            const displayName = element.childNodes[1].innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `User-${displayName}:${userName}-${userLocation}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.tagName === 'A' && element.attributes.getNamedItem("itemprop") && element.attributes.getNamedItem("itemprop").value.includes("codeRepository")) {
            console.log('Contributed repositories')
            const repoName = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `RepositoryName-${repoName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        if (element.classList.contains("Counter")) {
            console.log("tab Counter")
            const tab = element.parentElement.childNodes[0];
            const number = element.innerHTML.trim();
            sentResult = true;
            sendResponse({ result: `Num${tab}-${number}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        if (element.classList.contains("Profile-rollup-wrapper")) {
            console.log("Contribution Acitivty Entry")
            sentResult = true;
            sendResponse({ result: `ContributionActivity-`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        
    }
    if (!sentResult) {
        sendResponse(null);
    }
});