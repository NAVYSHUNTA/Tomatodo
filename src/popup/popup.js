"use strict";
const START_BTN_ID = "start-btn";
const RESET_BTN_ID = "reset-btn";
const SAVE_TODO_BTN_ID = "save-todo-btn";
const CLEAR_TODO_BTN_ID = "clear-todo-btn";
const TODO_TEXTAREA_ID = "todo";
const TIMER_ID = "timer";
const TASK_ID = "task";
const TASK_WORK = "work";
const TASK_BREAK = "break";
const TASK_NOTHING = "nothing";
const COUNTDOWN_STATE = "countDown";
const WAIT_STATE = "wait";
// 拡張機能のポップアップを開いたときに、保存されている todo があればそれを textarea に表示する
chrome.storage.local.get(["todoData"], function (storage) {
    setTextContentById(TODO_TEXTAREA_ID, storage.todoData);
});
// 拡張機能のポップアップを開いたときに、保存されている残り時間と作業内容があればそれらを表示させる
chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
    setMinuteAndSecondDisplay(storage.minute, storage.second);
    const taskTextContent = getTaskTextContent(storage.task);
    setTextContentById(TASK_ID, taskTextContent);
    // スタートボタン以外で表示する必要がある場合のみ処理
    if (storage && storage.state === COUNTDOWN_STATE) {
        setButtonTextContentAndIdNameById(START_BTN_ID, RESET_BTN_ID);
    }
});
// ボタンをクリックしたときの処理
document.addEventListener("click", (e) => {
    const btnElement = e.target;
    switch (btnElement?.id) {
        case START_BTN_ID:
            setButtonTextContentAndIdNameById(START_BTN_ID, RESET_BTN_ID);
            chrome.storage.local.set({
                "state": COUNTDOWN_STATE,
                "task": TASK_WORK,
                "minute": 25,
                "second": 0,
            });
            chrome.runtime.sendMessage({ action: "click-start-btn" });
            break;
        case RESET_BTN_ID:
            setButtonTextContentAndIdNameById(RESET_BTN_ID, START_BTN_ID);
            chrome.storage.local.set({
                "state": WAIT_STATE,
                "task": TASK_NOTHING,
                "minute": 25,
                "second": 0,
            });
            chrome.runtime.sendMessage({ action: "click-reset-btn" });
            break;
        case SAVE_TODO_BTN_ID:
            chrome.runtime.sendMessage({
                action: "click-save-todo-btn",
                todoData: document.getElementById(TODO_TEXTAREA_ID).value
            }, function (response) {
                alert(response.replyMessage);
            });
            break;
        case CLEAR_TODO_BTN_ID:
            const todoTextContent = "";
            setValueById(TODO_TEXTAREA_ID, todoTextContent); // 保存せずに入力された todo もクリアする
            chrome.runtime.sendMessage({
                action: "click-clear-todo-btn",
                todoData: todoTextContent,
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
    // todo の更新
    if ("todoData" in changes) {
        setTextContentById(TODO_TEXTAREA_ID, changes.todoData.newValue);
    }
    // 残り時間の更新
    if ("minute" in changes || "second" in changes) {
        chrome.storage.local.get(["minute", "second"], function (storage) {
            setMinuteAndSecondDisplay(storage.minute, storage.second);
        });
    }
    // 作業内容の更新
    if ("task" in changes) {
        const taskTextContent = getTaskTextContent(changes.task.newValue);
        setTextContentById(TASK_ID, taskTextContent);
    }
});
// テキストコンテンツに格納するタスクの内容を取得する関数
function getTaskTextContent(task) {
    switch (task) {
        case TASK_WORK:
            return "TOMATODO（作業中）";
        case TASK_BREAK:
            return "TOMATODO（休憩中）";
        default:
            return "TOMATODO（待機中）";
    }
}
// テキストコンテンツを設定する関数
function setTextContentById(targetElementName, newTextContent) {
    const targetElement = document.getElementById(targetElementName);
    if (targetElement) {
        targetElement.textContent = newTextContent;
    }
    else {
        console.error(`要素が見つかりませんでした。要素名: ${targetElementName}`);
    }
}
// 入力欄の内容を設定する関数
function setValueById(targetElementName, newValue) {
    const targetElement = document.getElementById(targetElementName);
    if (targetElement) {
        targetElement.value = newValue;
    }
    else {
        console.error(`要素が見つかりませんでした。要素名: ${targetElementName}`);
    }
}
// id を変更する関数
function setIdById(targetElementName, newId) {
    const targetElement = document.getElementById(targetElementName);
    if (targetElement) {
        targetElement.id = newId;
    }
    else {
        console.error(`要素が見つかりませんでした。要素名: ${targetElementName}`);
    }
}
// 変更後の id 名を引数として受け取り、変更後のボタン名を取得する関数
function getNewButtonName(newIdName) {
    switch (newIdName) {
        case START_BTN_ID:
            return "スタート";
        case RESET_BTN_ID:
            return "リセット";
        default:
            console.error(`要素が見つかりませんでした。要素名: ${newIdName}`);
            return "";
    }
}
// ボタンのテキストコンテンツと id を更新する関数
function setButtonTextContentAndIdNameById(currentButtonIdName, newIdName) {
    const newButtonName = getNewButtonName(newIdName);
    setTextContentById(currentButtonIdName, newButtonName);
    setIdById(currentButtonIdName, newIdName); // id 変更は処理の最後で行う
}
// 分と秒を表示する関数
function setMinuteAndSecondDisplay(minute, second) {
    if (minute !== undefined && second !== undefined) {
        const displayMinute = String(minute).padStart(2, "0");
        const displaySecond = String(second).padStart(2, "0");
        const newTextContent = `${displayMinute}:${displaySecond}`;
        setTextContentById(TIMER_ID, newTextContent);
    }
    else {
        console.error(`分または秒の値が未定義です。minute: ${minute}, second: ${second}`);
    }
}
