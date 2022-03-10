console.log('Github Issue Page Script Started');
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
            sendResponse({ result: `NumOfWatching-${numberWatching}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        } else if (ariaLabel.includes('starred')) {
            console.log('Number of users who starred repository');
            const numberStarred= element.innerHTML;
            sentResult = true;
            sendResponse({ result: `NumOfStarred-${numberStarred}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
            return;
        }
    }
      if (element.classList.contains('js-issue-title')) {
        console.log('Issue title');
        sentResult = true;
        sendResponse({ result: `IssueTitle-${element.innerHTML.trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });
        return;
      }

      if (element.classList.contains('State')) {
        console.log('Issue status')
        const state = element.attributes.getNamedItem('title').value;
        const split = state.split(':');
        sentResult = true;
        sendResponse({ result: `IssueStatus-${split[1].trim()}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
        return;
      }

      if (element.attributes.getNamedItem('data-hovercard-type') && element.attributes.getNamedItem('data-hovercard-type').value === 'user') {
        console.log('username')
        let user = element.innerHTML.trim();
        if (element.tagName === 'SPAN') {
          user = element.attributes.getNamedItem('data-assignee-name').value;
        }
        sentResult = true;
        sendResponse({ result: `Username-${user}`, x: msg.x, y: msg.y, time: msg.time, id: element.id, url: msg.url });  
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

    }
    if (!sentResult) {
        sendResponse(null);
    }
});
