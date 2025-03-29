"use strict";
// 拡張機能のポップアップを開いたときに、保存されている todo があればそれを textarea に表示する
chrome.storage.local.get(["todoData"], function (storage) {
    const todoElement = document.getElementById("todo");
    if (todoElement && storage.todoData) {
        todoElement.value = storage.todoData; // 保存されている todo を textarea に表示
    }
});
// 拡張機能のポップアップを開いたときに、保存されている残り時間と作業内容があればそれらを表示させる
chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
    const timerElement = document.getElementById("timer");
    if (timerElement && storage.state === "countDown" && storage.minute !== undefined && storage.second !== undefined) {
        const minute = String(storage.minute).padStart(2, "0");
        const second = String(storage.second).padStart(2, "0");
        timerElement.textContent = `${minute}:${second}`;
    }
    const taskElement = document.getElementById("task");
    if (taskElement && storage.task !== undefined) {
        switch (storage.task) {
            case "work":
                taskElement.textContent = "TOMATODO（作業中）";
                break;
            case "break":
                taskElement.textContent = "TOMATODO（休憩中）";
                break;
            default:
                taskElement.textContent = "TOMATODO（待機中）";
                break;
        }
    }
});
// カウントダウン処理
setInterval(() => {
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
                else if (storage.task === "break") {
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
// ボタンをクリックしたときの処理
document.addEventListener("click", (e) => {
    const btnElement = e.target;
    switch (btnElement?.id) {
        case "start-btn":
            btnElement.id = "reset-btn";
            btnElement.textContent = "リセット";
            chrome.storage.local.set({
                "state": "countDown",
                "task": "work",
                "minute": 25,
                "second": 0,
            }, function () { });
            break;
        case "reset-btn":
            btnElement.id = "start-btn";
            btnElement.textContent = "スタート";
            chrome.storage.local.set({
                "state": "wait",
                "task": "nothing",
                "minute": 25,
                "second": 0,
            }, function () { });
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
// storage の内容が書き換えられたらポップアップの内容を更新する
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") {
        return;
    }
    // 残り時間の更新
    if ("minute" in changes || "second" in changes) {
        chrome.storage.local.get(["minute", "second"], function (storage) {
            const minute = storage.minute;
            const second = storage.second;
            if (minute !== undefined && second !== undefined) {
                const timerElement = document.getElementById("timer");
                const displayMinute = String(minute).padStart(2, "0");
                const displaySecond = String(second).padStart(2, "0");
                timerElement.textContent = `${displayMinute}:${displaySecond}`;
            }
        });
    }
    // 作業内容の更新
    if ("task" in changes) {
        const taskElement = document.getElementById("task");
        const task = changes.task.newValue;
        switch (task) {
            case "work":
                taskElement.textContent = "TOMATODO（作業中）";
                break;
            case "break":
                taskElement.textContent = "TOMATODO（休憩中）";
                break;
            default:
                taskElement.textContent = "TOMATODO（待機中）";
                break;
        }
    }
});
