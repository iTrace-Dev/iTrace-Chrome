console.log('Github List of Pull Requests Script Started');
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    const elements = document.elementsFromPoint(msg.x, msg.y);
    let sentResult = false;
    for (element of elements) {
      if (element.id.includes('word')) {
        console.log('word of a comment')
        const word = element.innerHTML.trim();
        sentResult = true;
        if (element.attributes.getNamedItem('listtype')) {
          const listType = element.attributes.getNamedItem('listtype').value === 'ol' ? 'NumberedList' : 'UnorderedList';
          const listNumber = element.attributes.getNamedItem('listnumber').value;
          sendResponse({ result: `CommentWordIn${listType}-${word}-${listNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
          return;
        } else {
          sendResponse({ result: `CommentWord-${word}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
          return;
        }
      }
      if (element.classList.contains('task-list-item')) {
        console.log('Checkbox item');
        sentResult = true;
        sendResponse({ result: `ChecklistItem-`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'A' && element.classList.contains('participant-avatar')) {
        console.log("participant")
        sentResult = true;
        const user = element.attributes.getNamedItem('data-hovercard-url').value.split('/')[2];
        console.log(user);
        sendResponse({ result: `Participant-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return; 
      }
      if (element.id === 'files_tab_counter') {
        console.log('# of files changed');
        sentResult = true;
        sendResponse({ result: `NumOfFilesChanged-${element.innerHTML.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.id === 'checks_tab_counter') {
        console.log('# Checks');
        sentResult = true;
        sendResponse({ result: `NumOfChecks-${element.innerHTML.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.id === 'commits_tab_counter') {
        console.log('# Commits');
        sentResult = true;
        sendResponse({ result: `NumOfCommits-${element.innerHTML.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.id === 'conversation_tab_counter') {
        console.log('# Conversations');
        sentResult = true;
        sendResponse({ result: `NumOfConversationComments-${element.innerHTML.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.classList.contains('diffstat')) {
        if (element.id === 'diffstat') {
          console.log('Number of total diffs');
          sentResult = true;
          sendResponse({ result: `TotalDiffs- `, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
          return;
        }
        if (element.classList.contains('tooltipped')) {
          console.log('Number of file diffs');
          const numChanges = element.attributes.getNamedItem('aria-label').value;
          sentResult = true;
          sendResponse({ result: `NumOfFileDiffs-${numChanges.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
          return;
        }
      } 
      if (element.tagName === 'TD' && element.classList.contains('blob-code-deletion')) {
        console.log('Deleted Line of Code');
        let lineNumber = 0;
        if (element.attributes.getNamedItem('data-line-number')) {
          lineNumber = element.attributes.getNamedItem('data-line-number').value;
        }  
        sentResult = true;
        sendResponse({ result: `DeletedLOC-${lineNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'TD' && element.classList.contains('blob-code-addition')) {
        console.log('Added Line of Code');
        let lineNumber = 0;
        if (element.attributes.getNamedItem('data-line-number')) {
          lineNumber = element.attributes.getNamedItem('data-line-number').value;
        }
        sentResult = true;
        sendResponse({ result: `AddedLOC-${lineNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'TD' && element.classList.contains('blob-code-context')) {
        console.log('Unchanged Line of Code');
        let lineNumber = 0;
        if (element.attributes.getNamedItem('data-line-number')) {
          lineNumber = element.attributes.getNamedItem('data-line-number').value;
        } 
        sendResponse({ result: `UnchangedLOC-${lineNumber}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
      if (element.tagName === 'A' && element.attributes.getNamedItem('href')) {
        if (element.attributes.getNamedItem('href').value.includes("#diff-")) {
          console.log("Filename")
          const fileName = element.attributes.getNamedItem('title').value;
          sentResult = true;
          sendResponse({ result: `File-${fileName.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
          return; 
        }
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
      
      const sidebarElements = ['Reviewers', 'Projects', 'Milestones', 'Labels', 'Assignees'];
      if (element.classList.contains('discussion-sidebar-heading') && sidebarElements.includes(element.innerHTML.trim())) {
        console.log(element.innerHTML.trim());
        sentResult = true;
        const header = element.innerHTML.trim();
        sendResponse({ result: `${header}-${header}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
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
      if (element.tagName === 'TD' && element.classList.contains('comment-body')) {
        console.log('Comment body');
        sentResult = true;
        sendResponse({ result: `Comment- `, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }
    }
    if (!sentResult) {
        sendResponse(null);
    }
});
