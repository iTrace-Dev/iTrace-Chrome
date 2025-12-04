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

console.log('Developer Profile Script Started');

// listens for data from different GitHub profile attributes then sends a response based on its results
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    for (element of elements) {
        // Avatar
        if (element.classList.contains("d-block") && element.tagName === 'A') {
            console.log('Avatar Image'); 
            
            const avatarHref = element.getAttribute('href') || '';

            sentResult = true;
            sendResponse({ result: `AvatarImage-${avatarHref}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Activity overview (deprecated?)
        if (element.classList.contains("js-activity-overview-graph-container") && element.attributes.getNamedItem('data-percentages')) {
            console.log("Activity Overview");
            let activityOverview = element.attributes.getNamedItem('data-percentages').value;
            activityOverview = JSON.parse(activityOverview);
            const percentCommits = activityOverview["Commits"];
            const percentCodeReview = activityOverview["Code review"];
            const percentPullRequests = activityOverview["Pull requests"];
            sentResult = true;
            sendResponse({ result: `ActivityOverview-Commit:${percentCommits}%,CodeReview:${percentCodeReview}%,PullRequest:${percentPullRequests}%`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Contribution heat map
        if (element.tagName === 'DIV' && element.classList.contains("graph-before-activity-overview")) {
            console.log('Contribution Heat Map')
            sentResult = true;
            sendResponse({ result: `ContributionHeatMap`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Year link
        if (element.id.includes("year-link")) {
            console.log('Year Link')
            const year = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `Year-${year}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Profile label (depcrecated?)
        if (element.tagName === 'SPAN' && element.classList.contains("label")) {
            console.log('Profile Label')
            const labelName = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `ProfileLabel-${labelName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Profile bio
        if (element.tagName === 'DIV' && element.classList.contains("user-profile-bio")) {
            console.log('Profile Bio')
            const bioText = element.innerText;
            sentResult = true;
            sendResponse({ result: `ProfileBio-${bioText}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Follower count
        if (element.tagName === 'DIV' && element.classList.contains("flex-order-1") && element.classList.contains("mt-md-0")) {
            console.log('Follower Count')
            const followerLink = element.querySelector('a[href$="?tab=followers"]');
            const followerCount = followerLink.querySelector('span').innerHTML;
            const followingLink = element.querySelector('a[href$="?tab=following"]');
            const followingCount = followingLink.querySelector('span').innerHTML;
        
            sentResult = true;
            sendResponse({ result: `FollowerCount-${followerCount} followers, ${followingCount} following`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Profile details section
        if (element.tagName === 'UL' && element.classList.contains("vcard-details")) {
            console.log('Profile Details Section')
            sentResult = true;
            sendResponse({ result: `VcardSection`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Achievements section
        if (element.tagName === 'DIV' && element.classList.contains("border-top") && element.querySelector("h2")?.textContent.includes("Achievements")) {
            console.log('Achievements Section')
            sentResult = true;
            sendResponse({ result: `AchievementsSection`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Highlights section
        if (element.tagName === 'DIV' && element.classList.contains("border-top") && element.querySelector("h2")?.textContent.includes("Highlights")) {
            console.log('Highlights Section')
            sentResult = true;
            sendResponse({ result: `HighlightsSection`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Organization icon and link
        // if (element.tagName === 'A' && element.attributes.getNamedItem("data-hovercard-type") && element.attributes.getNamedItem("data-hovercard-type").value === "organization"
            // && element.classList.contains("avatar-group-item")) {
        if (element.classList.contains("pt-3") && element.classList.contains("clearfix")){
            console.log('Organizations Section');
            // const organizationName = element.attributes.getNamedItem("aria-label").value;
            sentResult = true;
            sendResponse({ result: `Organizations`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Contributed repository link (deprecated?)
        if (element.tagName === 'A' && element.attributes.getNamedItem("itemprop") && element.attributes.getNamedItem("itemprop").value.includes("codeRepository")) {
            console.log('Contributed repositories')
            const repoName = element.innerHTML;
            sentResult = true;
            sendResponse({ result: `Repository-${repoName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // Pinned repository link
        if (element.tagName === 'DIV' && element.classList.contains("public") && element.classList.contains("source")) {
            console.log('Pinned Repository')

            const repoLink = element.querySelector('a.Link.text-bold');
            let ownerRepo = '';
            if (repoLink) {
                const ownerSpan = repoLink.querySelector('span.owner');
                const repoSpan = repoLink.querySelector('span.repo');
                const owner = ownerSpan ? ownerSpan.textContent.trim() : '';
                const repo = repoSpan ? repoSpan.textContent.trim() : '';
                ownerRepo = `${owner}${repo}`; // e.g., "iTrace-Dev/iTrace-Toolkit"
            }

            sentResult = true;
            sendResponse({ result: `PinnedRepository-${ownerRepo}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return; 
        }
        // tab and counter
        if (element.classList.contains("Counter")) {
            console.log("Tab Counter")
            const tab = element.parentElement.innerHTML; 
            const number = element.innerHTML
            sentResult = true;
            sendResponse({ result: `Num${tab}-${number}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // tab but no counter
        if (element.classList.contains("UnderlineNav-item")) {
            const tabName = element.innerText.replace(/\s+/g, ' ').trim(); // clean up whitespace
            console.log(`Tab (no counter) ${tabName}`)
            sentResult = true;
            sendResponse({ result: `Tab-${tabName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Contribution activity entry
        if (element.classList.contains("TimelineItem")) {
            console.log("Contribution Activity Entry");
            const summary = element.querySelector("h4 span.color-fg-default");
            activityText = summary ? summary.textContent.trim(): '';
            
            sentResult = true;
            sendResponse({ result: `ContributionActivity-${activityText}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
    }
    if (!sentResult) {
        sendResponse(null);
    }

    // Still need to check: Profile label, URL pattern matching, contribution activity entry, organizations, counters
});