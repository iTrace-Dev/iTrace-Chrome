scripts = [];
function onLocationChanged(lastUrl) {
  if ((new RegExp('github.com/.*/.*/issues.*')).test(lastUrl)){
    if (!scripts.includes('getGithubIssueListCoordinate')){
      var filename = '/assets/js/getGithubIssueListCoordinate.js';
      chrome.runtime.sendMessage({injectSpecific : true, file: filename}, function(response) {
        if(response.done) {
          console.log(filename + ' carregado!'); 
          scripts.push('getGithubIssueListCoordinate');
        }
        else {
          console.log('erro!'); }
      });
    }
  }
  else if ((new RegExp('github.com/.*/.*/pulls')).test(lastUrl)){
    if (!scripts.includes('getGithubPRListCoordinate')){
      var filename = '/assets/js/getGithubPRListCoordinate.js';
      chrome.runtime.sendMessage({injectSpecific : true, file: filename}, function(response) {
        if(response.done) {
          console.log(filename + ' carregado!'); 
          scripts.push('getGithubPRListCoordinate');
        }
        else {
          console.log('erro!'); }
      });
    }
  }
  else if ((new RegExp('github.com/.*/.*/pull/.*')).test(lastUrl)){
    if (!scripts.includes('getGithubPullRequestCoordinate')){
      var filename = '/assets/js/getGithubPullRequestCoordinate.js';
      chrome.runtime.sendMessage({injectSpecific : true, file: filename}, function(response) {
        if(response.done) {
          console.log(filename + ' carregado!'); 
          scripts.push('getGithubPullRequestCoordinate');
        }
        else {
          console.log('erro!'); }
      });
    }
  }
  else if ((new RegExp('github.com\/[^\/|^?]+$|github.com\/[^\/]+\/[^\/]+$')).test(lastUrl)){
    if (!scripts.includes('getGithubDevProfileCoordinate')){
      var filename = '/assets/js/getGithubDevProfileCoordinate.js';
      chrome.runtime.sendMessage({injectSpecific : true, file: filename}, function(response) {
        if(response.done) {
          console.log(filename + ' carregado!'); 
          scripts.push('getGithubDevProfileCoordinate');
        }
        else {
          console.log('erro!'); }
      });
    }
  }
  else if ((new RegExp('github.com/(.*)tab(.*)')).test(lastUrl)){
    if (!scripts.includes('getGithubDevProfileCoordinate')){
      var filename = '/assets/js/getGithubDevProfileCoordinate.js';
      chrome.runtime.sendMessage({injectSpecific : true, file: filename}, function(response) {
        if(response.done) {
          console.log(filename + ' carregado!'); 
          scripts.push('getGithubDevProfileCoordinate');
        }
        else {
          console.log('erro!'); }
      });
    }
  }
}
onLocationChanged(); // executed when the page is initially loaded

let lastUrl;

const observer = new MutationObserver(mutations => {
  // executed on any dynamic change in the page
  if (location.href == lastUrl)
    return;
  lastUrl = location.href;
  onLocationChanged(lastUrl);
});
const config = {
  childList: true,
  subtree: true
};
observer.observe(document.body, config);