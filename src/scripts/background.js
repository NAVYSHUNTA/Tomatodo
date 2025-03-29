"use strict";
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "click-save-todo-btn") {
        // todo を保存する
        chrome.storage.local.set({ "todoData": message.todoData }, function () {
            if (chrome.runtime.lastError) {
                sendResponse({ status: false, replyMessage: "todo を保存できませんでした。\nエラーの詳細：" + chrome.runtime.lastError });
            }
            else {
                sendResponse({ status: true, replyMessage: "todo を保存しました。" });
            }
        });
    }
    else if (message.action === "click-clear-todo-btn") {
        // todo をクリアする
        chrome.storage.local.set({ "todoData": "" }, function () {
            if (chrome.runtime.lastError) {
                sendResponse({ status: false, replyMessage: "todo をクリアできませんでした。\nエラーの詳細：" + chrome.runtime.lastError });
            }
            else {
                sendResponse({ status: true, replyMessage: "todo をクリアしました。" });
            }
        });
    }
    return true;
});
