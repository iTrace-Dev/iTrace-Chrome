console.log('iTrace Webcam Study Script Started');

// Looks at the element under the coordinates and returns its data-stim-id.
// If the hit target is in a code line wrapper, include that line number too.
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    try {
        const relX = msg.relX;
        const relY = msg.relY;
        const elements = document.elementsFromPoint(relX, relY) || [];
        let responseData = null;

        for (const element of elements) {
            if (!element) continue;

            const stimOwner = element.closest ? element.closest('[data-stim-id]') : null;
            const stimId = stimOwner && stimOwner.getAttribute
                ? stimOwner.getAttribute('data-stim-id')
                : null;
            if (stimId) {
<<<<<<< Updated upstream
                responseData = {
=======
                const codeLineOwner = element.closest ? element.closest('[data-code-line]') : null;
                const codeLine = codeLineOwner && codeLineOwner.getAttribute
                    ? codeLineOwner.getAttribute('data-code-line')
                    : null;

                sendResponse({
>>>>>>> Stashed changes
                    result: `${stimId}`,
                    line: codeLine || undefined,
                    relX: relX,
                    relY: relY,
                    time: msg.time,
                    id: element.id || null,
                    url: msg.url || location.href
                };
                console.log("[ContentScript] Hit:", responseData);
                break;
            }
        }

        // Fallback path for non-interactive overlays (for example pointer-events:none).
        // Use the same coordinate system as elementsFromPoint by temporarily enabling pointer events.
        if (!responseData) {
            const stimTargets = document.querySelectorAll('[data-stim-id]');
            const previousPointerEvents = [];

            try {
                for (const element of stimTargets) {
                    previousPointerEvents.push({
                        element: element,
                        value: element.style.getPropertyValue('pointer-events'),
                        priority: element.style.getPropertyPriority('pointer-events')
                    });
                    element.style.setProperty('pointer-events', 'auto', 'important');
                }

                const fallbackElements = document.elementsFromPoint(relX, relY) || [];
                for (const element of fallbackElements) {
                    if (!element) continue;

                    const stimId = element.getAttribute && element.getAttribute('data-stim-id');
                    if (!stimId) continue;

                    responseData = {
                        result: `${stimId}`,
                        relX: relX,
                        relY: relY,
                        time: msg.time,
                        id: element.id || null,
                        url: msg.url || location.href
                    };
                    console.log('[ContentScript] Hit via pointer-events fallback:', responseData);
                    break;
                }
            } finally {
                for (const previous of previousPointerEvents) {
                    if (!previous.value) {
                        previous.element.style.removeProperty('pointer-events');
                    } else {
                        previous.element.style.setProperty('pointer-events', previous.value, previous.priority || '');
                    }
                }
            }
        }

        if (!responseData) {
            responseData = {result: null};
        }

    
    sendResponse(responseData);
    return true;

    } catch (e) {
        console.error('[ContentScript] Error while handling message:', e);
        try {
            sendResponse({ result: null, error: 'Handler failure' });
        } catch (er) {
        }
    }
});


// // UNCOMMENT THE CODE BELOW TO SHOW BOUNDING BOXES
// const DEBUG_BOX_ID = 'itrace-debug-box';
// const DEBUG_LABEL_ID = 'itrace-debug-label';
// const DEBUG_ROOT_ID = 'itrace-debug-root';

// function clearDebugOverlay() {
//     const oldBox = document.getElementById(DEBUG_BOX_ID);
//     const oldLabel = document.getElementById(DEBUG_LABEL_ID);
//     const oldRoot = document.getElementById(DEBUG_ROOT_ID);

//     if (oldBox && oldBox.parentNode) {
//         oldBox.parentNode.removeChild(oldBox);
//     }
//     if (oldLabel && oldLabel.parentNode) {
//         oldLabel.parentNode.removeChild(oldLabel);
//     }
//     if (oldRoot && oldRoot.parentNode) {
//         oldRoot.parentNode.removeChild(oldRoot);
//     }
// }

// function drawDebugOverlay(targetElement, stimId) {
//     const rect = targetElement.getBoundingClientRect();
//     if (!rect || rect.width <= 0 || rect.height <= 0) return null;

//     const wrapper = document.createElement('div');

//     const box = document.createElement('div');
//     box.id = DEBUG_BOX_ID;
//     box.style.position = 'fixed';
//     box.style.left = `${rect.left}px`;
//     box.style.top = `${rect.top}px`;
//     box.style.width = `${rect.width}px`;
//     box.style.height = `${rect.height}px`;
//     box.style.border = '2px solid #ff2d55';
//     box.style.background = 'rgba(255, 45, 85, 0.08)';
//     box.style.pointerEvents = 'none';
//     box.style.zIndex = '2147483646';
//     box.style.boxSizing = 'border-box';

//     const label = document.createElement('div');
//     label.id = DEBUG_LABEL_ID;
//     label.textContent = `#sym:${stimId}`;
//     label.style.position = 'fixed';
//     label.style.left = `${Math.max(0, rect.left)}px`;
//     label.style.top = `${Math.max(0, rect.top - 26)}px`;
//     label.style.padding = '2px 6px';
//     label.style.fontSize = '12px';
//     label.style.fontFamily = 'monospace';
//     label.style.color = '#ffffff';
//     label.style.background = '#ff2d55';
//     label.style.borderRadius = '4px';
//     label.style.pointerEvents = 'none';
//     label.style.zIndex = '2147483647';
//     label.style.whiteSpace = 'nowrap';

//     wrapper.appendChild(box);
//     wrapper.appendChild(label);
//     return wrapper;
// }

// function drawPageStimDebugOverlays() {
//     clearDebugOverlay();

//     const root = document.createElement('div');
//     root.id = DEBUG_ROOT_ID;
//     root.style.position = 'fixed';
//     root.style.left = '0';
//     root.style.top = '0';
//     root.style.width = '100vw';
//     root.style.height = '100vh';
//     root.style.pointerEvents = 'none';
//     root.style.zIndex = '2147483645';

//     const targets = document.querySelectorAll('[data-stim-id]');
//     for (const element of targets) {
//         const stimId = element.getAttribute && element.getAttribute('data-stim-id');
//         if (!stimId) continue;

//         const overlay = drawDebugOverlay(element, stimId);
//         if (overlay) root.appendChild(overlay);
//     }

//     document.documentElement.appendChild(root);
// }

// let redrawTimeout = null;
// function scheduleDebugOverlayRedraw() {
//     if (redrawTimeout) {
//         clearTimeout(redrawTimeout);
//     }
//     redrawTimeout = setTimeout(function () {
//         drawPageStimDebugOverlays();
//         redrawTimeout = null;
//     }, 75);
// }

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', drawPageStimDebugOverlays, { once: true });
// } else {
//     drawPageStimDebugOverlays();
// }
// window.addEventListener('resize', scheduleDebugOverlayRedraw);
// window.addEventListener('scroll', scheduleDebugOverlayRedraw, true);
