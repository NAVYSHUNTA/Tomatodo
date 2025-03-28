"use strict";
// todo を保存する処理
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "click-save-todo-btn") {
        chrome.storage.local.set({ "todoData": message.todoData }, function () {
            if (chrome.runtime.lastError) {
                sendResponse({ status: false, replyMessage: "todo を保存できませんでした。\nエラーの詳細：" + chrome.runtime.lastError });
            }
            else {
                sendResponse({ status: true, replyMessage: "todo を保存しました。" });
            }
        });
    }
    return true;
});
