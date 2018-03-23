// main JavaScript driver for the iTrace-Chrome plugin, all data will be handled here

/**
 * Get the current URL.
 *
 * @param {function(string)} callback called when the URL of the current tab
 *   is found.
 */
function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, (tabs) => {
    var tab = tabs[0];

    var url = tab.url;

    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}

function translateCoordinates(x, y) {
    // broswer viewport dimensions

    // screen dimensions
    var screenX = screen.height;
    var screenY = screen.width;

    var offsetX = screenX - this.browserX;
    var offsetY = screenY - this.browserY;

    if (x < offsetX || y < offsetY) {
        // user is looking outside of the broswer viewport, most likely at the broswer's shell
        return null;
    } else {
        // user is looking in the broswer viewport, return the translated coordinates
        return { x: x - offsetX, y: y - offsetY };
    }
}

function getSOElementResult(elements) {
    for (element of elements) {
        if (element.tagName == 'CODE') {
            if (this.questionElement.contains(element)) {
                // question code
                console.log('question code');
                return 'question code';
            }
            for (answer in this.answerElements) {
                if (answer.contains(element)) {
                    // answer code
                    console.log('answer code');
                    return 'answer code';
                }
            }
        }

        if (element.tagName == 'IMG') {
            if (this.questionElement.contains(element)) {
                // question code
                console.log('question image');
                return 'question image';
            }
            for (answer in this.answerElements) {
                if (answer.contains(element)) {
                    // answer code
                    console.log('answer image');
                    return 'answer image';
                }
            }
        }

        if (element.classList.contains('post-text')) {
            if (this.questionElement.contains(element)) {
                // question code
                console.log('question text');
                return 'question text';
            }
            for (answer in this.answerElements) {
                if (answer.contains(element)) {
                    // answer code
                    console.log('answer text');
                    return 'answer text';
                }
            }
        }

        if (element.classList.contains('post-tag')) {
            console.log('question-tag');
            return 'question tag';
        }

        if (element.classList.contains('vote')) {
            if (this.questionElement.contains(element)) {
                // question code
                console.log('question vote');
                return 'question vote';
            }
            for (answer in this.answerElements) {
                if (answer.contains(element)) {
                    // answer code
                    console.log('answer vote');
                    return 'answer vote';
                }
            }
        }

        if (element.Id == 'question-header') {
            console.log('question-title');
            return 'question-title';
        }
    }
}

function getBZElementResult(elements) {
    for (element of elements) {
       if (element.classList.contains('bz_show_bug_column')) {
           console.log('question info - 1');
       }

       if (element.classList.contains('bz_alias_short_desc_container')) {
           console.log('question title');
       }

       if (element.classList.contains('bz_comment_text')) {
           console.log('answer info');
       }

       if (element.classList.contains('bz_attach_extra_info')) {
           console.log('attachment info');
       }
   }
}

// establish the websocket connection
document.getElementById('start').addEventListener('click', function () {
    console.log('START SESSION');

    chrome.management.getAll(function (x) {
        console.log(x);
    });

    chrome.tabs.query({ 'active': true }, function (tabs) {
        var url = tabs[0].url;
        this.currentTab = tabs[0];
        if (url.includes('stackoverflow.com')) {
            chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
                console.log('message recieved')
                if (request.type == "question") {
                    var element = request.element;
                    console.log('question element');
                    console.log(element);
                    this.questionElement = element;
                }

                if (request.type == "answer") {
                    var element = request.element;
                    console.log('answer elements');
                    console.log(element);
                    this.answerElements = element;
                }
            }.bind(this));

            chrome.tabs.executeScript({
                'code': 'var x = document.getElementById("question"); console.log(x); var editorExtensionId = "cmaiacaepfmjfnbbjjpddglgaaellakb"; chrome.runtime.sendMessage(editorExtensionId, { element: x, type: "question" });'
            });

            chrome.tabs.executeScript({
                'code': 'var y = document.getElementById("answers"); console.log(y); var editorExtensionId = "cmaiacaepfmjfnbbjjpddglgaaellakb"; chrome.runtime.sendMessage(editorExtensionId, { element: y, type: "answer" });'
            });
        }

        chrome.tabs.executeScript({
			'code': 'window.innerHeight'
		}, function (result) {
			console.log('browserX');
			console.log(result);
			this.browserX = result[0];
		}.bind(this));

        chrome.tabs.executeScript({
			'code': 'window.innerWidth'
		}, function (result) {
			console.log('browserY');
			console.log(result);
			this.browserY = result[0];
		}.bind(this));
    }.bind(this));

    // var websocket = new WebSocket('ws://localhost:7007');

    // listen for eye gaze data coming from the server
    /*websocket.onmessage = function (e) {
        // deal with incoming eyegaze data
        var eyeGazeData = e.data;
        var timeStamp = eyeGazeData.substring(0, eyeGazeData.indexOf(','));

        var coordString = eyeGazeData.substring(eyeGazeData.indexOf(',') + 1);

        var x = coordString.substring(0                           , coordString.indexOf(','));
        var y = coordString.substring(coordString.indexOf(',') + 1, coordString.length      );

        // parse values
        x = parseInt(x);
        y = parseInt(y);

        // get translated coordinates
        var coords = translateCoordinates(x, y);

        if (!coords) {
            // user is not looking in the html viewport
        } else {
            // user is looking in the html viewport
            // need to check which website the user is looking at
            chrome.tabs.query({ 'active': true }, function (tabs) {
                var url = tabs[0].url;
                this.currentTab = tabs[0];
                if (url.includes('stackoverflow.com/questions/')) {
                    chrome.tabs.executeScript({
                        'code': 'document.elementsFromPoint(' + coords.x + ',' + coords.y + ')'
                    }, function (result) {
                        // all results for the above funciton call held in results[0]
                        console.log(result[0]);
                        var elementResult = this.getSOElement(result[0]);
                        // TODO: add result to buffer to be saved off after excecution ends
                    }.bind(this));
                }
                if (url.includes('bugzilla')) { // NOTE: This include may be incorect, will need to do some more research
                    chrome.tabs.executeScript({
                        'code': 'document.elementsFromPoint(' + coords.x + ',' + coords.y + ')'
                    }, function (result) {
                        // all results for the above funciton call held in results[0]
                        console.log(result[0]);
                        var elementResult = this.getBZElementResult(result[0]);
                        // TODO: add result to buffer to be saved off after excecution ends
                    }.bind(this));
                }
            }.bind(this));
        }
    }.bind(this);*/
}.bind(this));

/*$(document).ready(function () {
    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var url = tabs[0].url;
        this.currentTab = tabs[0];
        if (url.includes('stackoverflow.com/questions/')) {
            chrome.tabs.executeScript(this.currentTab.Id, {
                'code': 'document.getElementById("question")'
            }, function (result) {
                // all results for the above funciton call held in results[0]
                this.questionElement = result[0][0];
            }.bind(this));
        }
    }.bind(this));

    chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
        var url = tabs[0].url;
        this.currentTab = tabs[0];
        if (url.includes('stackoverflow.com/questions/')) {
            chrome.tabs.executeScript(this.currentTab.Id, {
                'code': 'document.getElementById("answers")'
            }, function (result) {
                // all results for the above funciton call held in results[0]
                this.answerElements = result[0];
            }.bind(this));
        }
    }.bind(this));

    // establish the websocket connection
    $('#start').on('click', function () {
        var websocket = new WebSocket('ws://localhost:7007');

        // listen for eye gaze data coming from the server
        websocket.onmessage = function (e) {
            // deal with incoming eyegaze data
            var eyeGazeData = e.data;
            var timeStamp = eyeGazeData.substring(0, string.indexOf(','));

            var coordString = eyeGazeData.substring(string.indexOf(',') + 1);

            var x = coordString.substring(0                           , coordString.indexOf(','));
            var y = coordString.substring(coordString.indexOf(',') + 1, coordString.length      );

            // parse values
            x = parseInt(x);
            y = parseInt(y);

            // get translated coordinates
            var coords = translateCoordinates(x, y);

            if (!coords) {
                // user is not looking in the html viewport
            } else {
                // user is looking in the html viewport
                // need to check which website the user is looking at
                chrome.tabs.query({ 'active': true, 'lastFocusedWindow': true }, function (tabs) {
                    var url = tabs[0].url;
                    this.currentTab = tabs[0];
                    if (url.includes('stackoverflow.com/questions/')) {
                        chrome.tabs.executeScript(this.currentTab.Id, {
                            'code': 'document.elementsFromPoint(' + coords.x + ',' + coords.y + ')'
                        }, function (result) {
                            // all results for the above funciton call held in results[0]
                            console.log(result[0]);
                            var elementResult = this.getSOElement(result[0]);
                            // TODO: add result to buffer to be saved off after excecution ends
                        }.bind(this));
                    }
                    if (url.includes('bugzilla')) { // NOTE: This include may be incorect, will need to do some more research
                        chrome.tabs.executeScript(this.currentTab.Id, {
                            'code': 'document.elementsFromPoint(' + coords.x + ',' + coords.y + ')'
                        }, function (result) {
                            // all results for the above funciton call held in results[0]
                            console.log(result[0]);
                            var elementResult = this.getBZElementResult(result[0]);
                            // TODO: add result to buffer to be saved off after excecution ends
                        }.bind(this));
                    }
                }.bind(this));
            }
        }
    }.bind(this));
});*/
