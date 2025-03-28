"use strict";
// 拡張機能のポップアップを開いたときに、保存されている todo があればそれを textarea に表示する
chrome.storage.local.get(["todoData"], function (storage) {
    const todoTextArea = document.getElementById("todo");
    if (todoTextArea && storage.todoData) {
        todoTextArea.value = storage.todoData; // 保存されている todo を textarea に表示
    }
});
// 拡張機能のポップアップを開いたときに、保存されている残り時間があればそれを表示させる
chrome.storage.local.get(["state", "minute", "second"], function (storage) {
    const timer = document.getElementById("timer");
    if (timer && storage.state === "countDown" && storage.minute !== "undefined" && storage.second !== "undefined") {
        const minute = String(storage.minute).padStart(2, "0");
        const second = String(storage.second).padStart(2, "0");
        timer.textContent = `${minute}:${second}`;
    }
});
// カウントダウン処理
setInterval(() => {
    chrome.storage.local.get(["state", "minute", "second"], function (storage) {
        if (storage.state === "countDown") {
            const timer = document.getElementById("timer");
            const minute = storage.minute;
            const second = storage.second;
            const restSecond = 60 * minute + second;
            const nextSecond = restSecond - 1;
            if (nextSecond === 0) {
                timer.textContent = "00:00";
                chrome.storage.local.set({ "state": "wait" });
            }
            else {
                const newMinute = Math.floor(nextSecond / 60);
                const newSecond = nextSecond % 60;
                const displayMinute = String(newMinute).padStart(2, "0");
                const displaySecond = String(newSecond).padStart(2, "0");
                timer.textContent = `${displayMinute}:${displaySecond}`;
                chrome.storage.local.set({ "minute": newMinute, "second": newSecond });
            }
        }
    });
}, 1000);
// ボタンをクリックしたときの処理
document.addEventListener("click", (e) => {
    const btn = e.target;
    switch (btn?.id) {
        case "start-btn":
            btn.id = "reset-btn";
            btn.textContent = "リセット";
            chrome.storage.local.set({
                "state": "countDown",
                "minute": 25,
                "second": 0,
            }, function () {
                const timer = document.getElementById("timer");
                timer.textContent = "25:00";
            });
            break;
        case "reset-btn":
            btn.id = "start-btn";
            btn.textContent = "スタート";
            chrome.storage.local.set({
                "state": "wait",
                "minute": 25,
                "second": 0,
            }, function () {
                const timer = document.getElementById("timer");
                timer.textContent = "25:00";
            });
            break;
        case "save-todo-btn":
            chrome.runtime.sendMessage({
                action: "click-save-todo-btn",
                todoData: document.getElementById("todo").value
            }, function (response) {
                alert(response.replyMessage);
            });
            break;
        default:
            console.log("ボタンでない箇所をクリックしました。");
            break;
    }
});
