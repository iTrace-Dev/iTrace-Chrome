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
this.isSessionActive = false;
this.sessionData = [];
this.currentUrl = "";

var _this = this;
debugger;


chrome.runtime.sendMessage({type: "isInitializedITraceChrome"}, (response) => {
    if (!response) {
        chrome.runtime.sendMessage({type: "initializeITraceChrome"});
    }
});

$(document).ready(function () {
    $("#start_session").on("click", function (event) {
        chrome.tabs.query({active: true, currentWindow: true}).then((tabs) => {
            chrome.runtime.sendMessage({type: "startSessionITraceChrome", vars: [tabs]}, () => {
                $("#websocket_status").html("Attempting to Connect to Core");
            });
        });
    });

    $("#write_xml").on("click", function (event) {
        chrome.runtime.sendMessage({type: "writeXMLDataITraceChrome"});
    });

    $("#config").on("click", function () {
        $("#main_window").hide();
        $("#config_window").show();
        $("#config").hide();
        $("#back_to_main").show();
    });

    $("#back_to_main").on("click", function () {
        $("#config_window").hide();
        $("#main_window").show();
        $("#back_to_main").hide();
        $("#config").show();
    });

    $("#empty_responses").on("change", function () {
        const enabled = $(this).is(":checked");

        chrome.runtime.sendMessage({
            type: "toggleEmptyResponses",
            enabled: enabled
        });
    });

    $("#persist_core_connection").on("change", function () {
        const enabled = $(this).is(":checked");

        chrome.runtime.sendMessage({
            type: "togglePersistCoreConnection",
            enabled: enabled
        });
    });

    chrome.storage.local.get("emptyResponsesEnabled", (data) => {
        $("#empty_responses").prop("checked", data.emptyResponsesEnabled || false);
    });

    chrome.storage.local.get("persistCoreConnectionEnabled", (data) => {
        $("#persist_core_connection").prop("checked", data.persistCoreConnectionEnabled || false);
    });

    chrome.runtime.sendMessage({type: "isConnectedITraceChrome"}, (response) => {
        $("#websocket_status").html(
            response ? "Connected To Core" : "Not Connected To Core"
        );
    });

    chrome.runtime.sendMessage({type: "isActiveITraceChrome"}, (response) => {
        $("#session_status").html(
            response ? "Session Started" : "No Active Session"
        );
    });
});

/* This listener displays the HTML text upon its status*/
chrome.runtime.onMessage.addListener((message) => {
    if (message.type === "websocketStatus") {
        if (message.status === "connected") {
            $("#websocket_status").html("Connected To Core");
        } else if (message.status === "disconnected") {
            $("#websocket_status").html("Not Connected To Core");
        } else if (message.status === "error") {
            $("#websocket_status").html("Connection Error: " + message.error);
        }
    }

    if (message.type === "sessionStatus") {
        if (message.status === "started") {
            $("#session_status").html("Session Started");
        }

        if (message.status === "ended") {
            $("#session_status").html("No Active Session");
        }
    }
});