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


chrome.runtime.sendMessage({ type: "isInitializedITraceChrome" }, (response) => {
    if (!response) {
        chrome.runtime.sendMessage({ type: "initializeITraceChrome" });
    }
});

$(document).ready(function() {
    $("#start_session").on("click", function(event) {
        chrome.tabs.query({ active: true, currentWindow: true}).then((tabs) => {chrome.runtime.sendMessage({ type: "startSessionITraceChrome", vars: [tabs] }, () => {
            $("#session_status").html("Session Started - Attempting to Connect");
        });});
    });
    
    $("#write_xml").on("click", function(event) {
        chrome.runtime.sendMessage({ type: "writeXMLDataITraceChrome" });
    });

    chrome.runtime.sendMessage({ type: "isActiveITraceChrome"}, (response) => {
        if (response) {
            $("#session_status").html("Session Started - Connected");
        }
    });
});

/* This listener displays the HTML text upon its status*/
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "websocketStatus") {
        if (message.status === "connected") {
            $("#session_status").html("Session Started - Connected");
        } else if (message.status === "disconnected") {
            $("#session_status").html("Not Connected To Core");
        } else if (message.status === "error") {
            $("#session_status").html("Connection Error: " + message.error);
        }
    }
});