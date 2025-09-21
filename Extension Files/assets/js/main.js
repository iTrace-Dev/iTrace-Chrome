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

// main JavaScript driver for the iTrace-Chrome plugin, all data will be handled here
this.isActive = false;
this.sessionData = [];
this.currentUrl = "";

var _this = this;
debugger;

var iTraceChrome = chrome.extension.getBackgroundPage().iTraceChrome;
if(iTraceChrome.isInitialized == false) {
    iTraceChrome.initialize(); //initializing if it's not initialized
}

/* This function displays the HTML text upon its status*/
function afterSessionSetup(websocket) {    
    $("#session_status").html("Session Started - Attempting To Connect");
  
    websocket.onopen = function() {
        $("#session_status").html("Session Started - Connected");
    }

    websocket.onclose = function() {
        $("#session_status").html("Not Connected To Core");
    }
}

$(document).ready(function() {
    $("#start_session").on("click", function(event) {
        chrome.tabs.query({ active: true, currentWindow: true}).then((tabs) => {iTraceChrome.startSession(tabs, afterSessionSetup);});
    });
    
    $("#write_xml").on("click", function(event) {
        iTraceChrome.writeXMLData();
    });

    if (iTraceChrome.isActive) {
        $("#session_status").html("Session Started - Connected");
    }
});