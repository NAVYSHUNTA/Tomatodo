"use strict";
let countDownInterval = undefined;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "click-save-todo-btn":
            // todo を保存する
            chrome.storage.local.set({ "todoData": message.todoData }, function () {
                if (chrome.runtime.lastError) {
                    sendResponse({ status: false, replyMessage: "todo を保存できませんでした。\nエラーの詳細：" + chrome.runtime.lastError });
                }
                else {
                    sendResponse({ status: true, replyMessage: "todo を保存しました。" });
                }
            });
            break;
        case "click-clear-todo-btn":
            // todo をクリアする
            chrome.storage.local.set({ "todoData": "" }, function () {
                if (chrome.runtime.lastError) {
                    sendResponse({ status: false, replyMessage: "todo をクリアできませんでした。\nエラーの詳細：" + chrome.runtime.lastError });
                }
                else {
                    sendResponse({ status: true, replyMessage: "todo をクリアしました。" });
                }
            });
            break;
        case "click-start-btn":
            // カウントダウンを開始する
            countDownInterval = setInterval(() => {
                chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
                    if (storage.state === "countDown") {
                        const minute = storage.minute;
                        const second = storage.second;
                        const restSecond = 60 * minute + second;
                        const nextSecond = restSecond - 1;
                        if (nextSecond === -1) {
                            if (storage.task === "work") {
                                alert("休憩時間に入ります。");
                                chrome.storage.local.set({ "task": "break", "minute": 5, "second": 0 });
                            }
                            else if (storage.task === TASK_BREAK) {
                                alert("作業時間に入ります。");
                                chrome.storage.local.set({ "task": "work", "minute": 25, "second": 0 });
                            }
                        }
                        else {
                            const newMinute = Math.floor(nextSecond / 60);
                            const newSecond = nextSecond % 60;
                            chrome.storage.local.set({ "minute": newMinute, "second": newSecond });
                        }
                    }
                });
            }, 1000);
            break;
        case "click-reset-btn":
            // カウントダウンを終了する
            clearInterval(countDownInterval);
            break;
        default:
            // 何もしない
            console.log("ポップアップからのメッセージを受信しましたが、処理するアクションがありません。");
            console.log("受信したアクション：" + message.action);
            break;
    }
    return true;
});
