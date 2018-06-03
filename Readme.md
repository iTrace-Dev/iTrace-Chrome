### Setting up iTrace-Chrome extension
(This is only done once as long as you are consistent with the extension location. If you change the folder, you need to re-setup.)
* Clone the repository [iTrace-Chrome].
* Start Google Chrome, and click on ```menu -> tools -> Extensions```.
* Enable ```Developer Mode``` by ticking the checkbox in the upper-right corner.
* Click on ```Load Unpacked```. [This will open a file dialog box.]
* Choose the folder ```Extension Files```, located inside iTrace-Chrome that you've cloned.
* This will load up our unpacked extension called ```iTrace```. Now, you've setup the extension.

### Running the iTrace-Chrome extension

* Make sure you have ```iTrace-Core``` up and running.
* Start Google Chrome, and launch one of the following websites:
    - www.google.com
    - www.stackoverflow.com
    - www.stackoverflow.com/questions [Could be any question for stack overflow]
    - bugzilla
    - amiga.cs.unlv.edu/div/EPI [This is a specific research-task website supported by iTrace]
* You can now ```Start Tracking``` in ```iTrace-Core```.
* You can now click on the extension icon for iTrace in Google Chrome. [Please keep in mind that it doesn't notify that the recording has started. Once you've clicked it, recording has started.]
* Now, go on with your normal web surfing, and once you're done recording, click on the extension again.
* This will save an xml file to your ```downloads``` immediately.

###### Notes

You need to close the browser and re-open it for each new session. The extension is not refreshed automatically.
