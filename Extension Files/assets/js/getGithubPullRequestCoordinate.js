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


console.log('Github Pull Requests Script Started');
// looks at a specific pull request and listen/logs the data and things associated with pull requests
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
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
      //     sendResponse({ result: `CommentWordIn${listType}-${word}-${listNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
      //     return;
      //   } else {
      //     sendResponse({ result: `CommentWord-${word}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
      //     return;
      //   }
      // }
      if (element.classList.contains('task-list-item')) {
        console.log('Checkbox item');
        sentResult = true;
        sendResponse({ result: `ChecklistItem-`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // if (element.tagName === 'A' && element.classList.contains('participant-avatar')) {
      //   console.log("participant")
      //   sentResult = true;
      //   const user = element.attributes.getNamedItem('data-hovercard-url').value.split('/')[2];
      //   console.log(user);
      //   sendResponse({ result: `Participant-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
      //   return; 
      // }

      // Number of files changed
      if (element.attributes.getNamedItem('href')?.value.includes("/files") && element.classList.contains('tabnav-tab')) {
        console.log('# of files changed');
        const filesCounter = element.querySelector('#files_tab_counter');
        const filesCount = filesCounter ? filesCounter.innerHTML.trim() : 'Unknown';
        sentResult = true;
        sendResponse({ result: `NumOfFilesChanged-${filesCount}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Number of checks
      if (element.attributes.getNamedItem('href')?.value.includes("/checks") && element.classList.contains('tabnav-tab')) {
        console.log('# Checks');
        const checksCounter = element.querySelector('#checks_tab_counter');
        const checksCount = checksCounter ? checksCounter.innerHTML.trim() : 'Unknown';
        sentResult = true;
        sendResponse({ result: `NumOfChecks-${checksCount}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Number of commits
      if (element.attributes.getNamedItem('href')?.value.includes("/commits") && element.classList.contains('tabnav-tab')) {
        console.log('# Commits');
        const commitCounter = element.querySelector('#commits_tab_counter');
        const commitCount = commitCounter ? commitCounter.innerHTML.trim() : 'Unknown';
        sentResult = true;
        sendResponse({ result: `NumOfCommits-${commitCount}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Number of conversations
      if (element.attributes.getNamedItem('href')?.value.includes("/pull/") && element.classList.contains('tabnav-tab') &&
      element.querySelector('#conversation_tab_counter')) {
        console.log('# Conversations');
        const conversationCounter = element.querySelector('#conversation_tab_counter');
        const conversationCount = conversationCounter ? conversationCounter.innerHTML.trim() : 'Unknown';
        sentResult = true;
        sendResponse({ result: `NumOfConversationComments-${conversationCount}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Number of total diffs
      if (element.classList.contains('diffstat')) {
        if (element.id === 'diffstat') {
          console.log('Number of total diffs');
          const diffAdd = element.querySelector(".color-fg-success");
          const diffSub = element.querySelector(".color-fg-danger");
          sentResult = true;
          sendResponse({ result: `TotalDiffs- ${diffAdd}, ${diffSub}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
          return;
        }
        // Number of file diffs (deprecated)
        // if (element.classList.contains('tooltipped')) {
        //   console.log('Number of file diffs');
        //   const numChanges = element.attributes.getNamedItem('aria-label').value;
        //   sentResult = true;
        //   sendResponse({ result: `NumOfFileDiffs-${numChanges.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        //   return;
        // }
      } 
      // Deleted line of code
      if (element.tagName === 'TD' && element.classList.contains('blob-code-deletion')) {
        console.log('Deleted Line of Code');
        let lineNumber = 0;
        const lineNumberCell = element.previousElementSibling;
        if (lineNumberCell && lineNumberCell.hasAttribute('data-line-number')) {
            lineNumber = lineNumberCell.getAttribute('data-line-number');
        }
        sentResult = true;
        sendResponse({ result: `DeletedLOC-${lineNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Added line of code
      if (element.tagName === 'TD' && element.classList.contains('blob-code-addition')) {
        console.log('Added Line of Code');
        let lineNumber = 0;    
        const lineNumberCell = element.previousElementSibling;
        if (lineNumberCell && lineNumberCell.hasAttribute('data-line-number')) {
            lineNumber = lineNumberCell.getAttribute('data-line-number');
        }

        sentResult = true;
        sendResponse({ result: `AddedLOC-${lineNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Unchanged line of code
      if (element.tagName === 'TD' && element.classList.contains('blob-code-context')) {
        console.log('Unchanged Line of Code');
        let lineNumber = 0;
        const lineNumberCell = element.previousElementSibling;
        if (lineNumberCell && lineNumberCell.hasAttribute('data-line-number')) {
            lineNumber = lineNumberCell.getAttribute('data-line-number');
        } 
        sendResponse({ result: `UnchangedLOC-${lineNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'a' && element.attributes.getNamedItem('href')) {
        // File name
        if (element.attributes.getNamedItem('href').value.includes("#diff-") && element.classList.contains('text-mono')) {
          console.log("Filename")
          // const fileName = element.attributes.getNamedItem('title').value;
          const fileName = element.innerHTML;
          sentResult = true;
          sendResponse({ result: `File-${fileName.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
          return; 
        }
        // Commit name
        if (element.attributes.getNamedItem('href').value.includes("commits/")) {
          console.log("Commit name");
          const commitTitle = element.innerHTML;
          sentResult = true;
          sendResponse({ result: `CommitName-${commitTitle.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
          return; 
        }
      }
      if (element.attributes.getNamedItem('data-hovercard-type') && element.attributes.getNamedItem('data-hovercard-type').value === 'user') {
        console.log('username')
        let user = element.innerHTML.trim();
        if (element.tagName === 'SPAN') {
          user = element.attributes.getNamedItem('data-assignee-name').value;
        }
        sentResult = true;
        sendResponse({ result: `Username-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
      }
      if (element.classList.contains('js-issue-title')) {
        console.log('PR Title');
        sentResult = true;
        sendResponse({ result: `PRTitle-${element.innerHTML.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'IMG' && element.classList.contains('avatar')) {
        console.log('User avatar');
        sentResult = true;
        const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
        sendResponse({ result: `AvatarImage-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      
      // const sidebarElements = ['Reviewers', 'Projects', 'Milestones', 'Labels', 'Assignees'];
      // if (element.classList.contains('discussion-sidebar-heading') && sidebarElements.includes(element.innerHTML.trim())) {
      //   console.log(element.innerHTML.trim());
      //   sentResult = true;
      //   const header = element.innerHTML.trim();
      //   sendResponse({ result: `${header}-${header}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
      //   return;
      // }
      if (element.tagName === 'FORM' && element.classList.contains('js-issue-sidebar-form')){
        let ariaLabel = element.getAttribute('aria-label') || 'UnknownForm';
        ariaLabel = ariaLabel.replace(/^Select\s+/i, '')
        if (ariaLabel === "Link issues"){
          ariaLabel = "development"
        }
        console.log(`Sidebar - ${ariaLabel}`);
        sentResult = true;
        sendResponse({result: `Sidebar-${ariaLabel}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url});
      }
      if (element.classList.contains('participation')) {
        console.log("Sidebar - Participation")
        sentResult = true;
        sendResponse({ result: `Sidebar-Participation`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
        }
      if (element.classList.contains('IssueLabel')) {
        console.log("Issue Label");
        sentResult = true;
        const labelName = element.firstChild.nextSibling ? element.firstChild.nextSibling.innerHTML : '';
        sendResponse({ result: `IssueLabel-${labelName}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'RELATIVE-TIME') {
        console.log("Time");
        sentResult = true;
        sendResponse({ result: `CommentDate-${element.innerHTML}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Image within comment body
      if (element.tagName === 'IMG' && (element.parentNode.parentNode.parentNode.classList.contains('comment-body') ||
      element.parentNode.parentNode.parentNode.parentNode.classList.contains('comment-body'))) {
        console.log("Image");
        sentResult = true;
        const imgUrl = element.parentNode.attributes.getNamedItem('href') ? element.parentNode.attributes.getNamedItem('href').value : '';
        sendResponse({ result: `Image-${imgUrl}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Comment body
      if ((element.tagName === 'TD' || element.tagName === 'DIV') && element.classList.contains('comment-body')) {
        console.log('Comment body');
        sentResult = true;  
        const timelineBody = element.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
        const commentID = timelineBody.attributes.getNamedItem('id') ? timelineBody.attributes.getNamedItem('id').value : '';
        sendResponse({ result: `Comment Body-${commentID}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      // Comment body within discussion
      if (element.classList.contains('width-auto') && element.classList.contains('comment-body')) {
        console.log('Comment body - Discussion');
        sentResult = true;
        const timelineBody = element.parentNode.parentNode.parentNode.parentNode.parentNode;
        const commentID = timelineBody.attributes.getNamedItem('id') ? timelineBody.attributes.getNamedItem('id').value : '';
        sendResponse({ result: `Comment Body-${commentID}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'IMG' && element.classList.contains('avatar')) {
        // Avatar in Timeline
        if (element.parentNode.parentNode.classList.contains('TimelineItem')) {
            console.log('User avatar - Timeline Item');
            sentResult = true;
            const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
            sendResponse({ result: `TimelineAvatarImage-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Avatar in Comment Header
        if (element.classList.contains('rounded-1')) {
            console.log('User avatar - Comment header');
            sentResult = true;
            const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
            sendResponse({ result: `HeaderAvatarImage-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Avatar in Code Review Comment
        if (element.parentNode.parentNode.classList.contains('mt-1')||element.parentNode.parentNode.classList.contains('mr-2')) {
            console.log('User avatar - Code Review Comment');
            sentResult = true;
            const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
            sendResponse({ result: `HeaderAvatarImage-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Avatar in Sidebar - Participants
        if (element.parentNode.classList.contains('participant-avatar')) {
            console.log('User avatar - Participant');
            sentResult = true;
            const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
            sendResponse({ result: `ParticipantAvatarImage-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
        // Avatar in Sidebar - Reviewers
        else {
            console.log('User avatar - Reviewers');
            sentResult = true;
            const user = element.attributes.getNamedItem('alt') ? element.attributes.getNamedItem('alt').value : '';
            sendResponse({ result: `ReviewerAvatarImage-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
      }
    }
    if (!sentResult) {
        sendResponse(null);
    }
});
