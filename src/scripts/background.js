"use strict";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "click-save-todo-btn") {
        chrome.storage.local.set({ "todoData": message.todoData }, function () {
            if (chrome.runtime.lastError) {
                sendResponse({ status: false, replyMessage: chrome.runtime.lastError });
            }
            else {
                sendResponse({ status: true, replyMessage: "todo を保存しました" });
            }
        });
    }
    return true;
});
