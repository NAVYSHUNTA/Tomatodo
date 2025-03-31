"use strict";
let countDownInterval = undefined;
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "clickSaveTodoBtn":
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
        case "clickClearTodoBtn":
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
        case "clickStartBtn":
            // カウントダウンを開始する
            countDownInterval = setInterval(setCountDownInterval, 1000);
            break;
        case "clickResetBtn":
            // カウントダウンを終了する
            clearInterval(countDownInterval);
            break;
        case "restartCountDown":
            // カウントダウンを再開する
            countDownInterval = setInterval(setCountDownInterval, 1000);
            break;
        default:
            // 何もしない
            console.log("ポップアップからのメッセージを受信しましたが、処理するアクションがありません。");
            console.log("受信したアクション：" + message.action);
            break;
    }
    return true;
});
// カウントダウンを行う関数
function setCountDownInterval() {
    chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
        if (storage.state === "countDown") {
            const minute = storage.minute;
            const second = storage.second;
            const restSecond = 60 * minute + second;
            const nextSecond = restSecond - 1;
            if (nextSecond === -1) {
                chrome.runtime.sendMessage({
                    action: "countDownEnd",
                    task: storage.task,
                });
                clearInterval(countDownInterval);
            }
            else {
                const newMinute = Math.floor(nextSecond / 60);
                const newSecond = nextSecond % 60;
                chrome.storage.local.set({ "minute": newMinute, "second": newSecond });
            }
        }
    });
}
