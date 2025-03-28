"use strict";
// 拡張機能のポップアップを開いたときに、保存されている todo があればそれを textarea に表示する
chrome.storage.local.get(["todoData"], function (storage) {
    const todoTextArea = document.getElementById("todo");
    if (todoTextArea && storage.todoData) {
        todoTextArea.value = storage.todoData; // 保存されている todo を textarea に表示
    }
});
// ボタンをクリックしたときの処理
document.addEventListener("click", (e) => {
    const btn = e.target;
    switch (btn?.id) {
        case "start-btn":
            btn.id = "reset-btn";
            btn.textContent = "リセット";
            // ここに background.ts にメッセージを送る処理を書く
            // chrome.runtime.sendMessage(
            //     { action: "click-start-btn" },
            //     function () { }
            // );
            break;
        case "reset-btn":
            btn.id = "start-btn";
            btn.textContent = "スタート";
            break;
        case "save-todo-btn":
            chrome.runtime.sendMessage({ action: "click-save-todo-btn", todoData: document.getElementById("todo").value }, function (response) {
                alert(response.replyMessage);
            });
            break;
        default:
            console.log("ボタンでない箇所をクリックしました。");
            break;
    }
});
