chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    switch (message.action) {
        case "click-save-todo-btn":
            // todo を保存する
            chrome.storage.local.set(
                { "todoData": message.todoData },
                function () {
                    if (chrome.runtime.lastError) {
                        sendResponse({ status: false, replyMessage: "todo を保存できませんでした。\nエラーの詳細：" + chrome.runtime.lastError });
                    } else {
                        sendResponse({ status: true, replyMessage: "todo を保存しました。" });
                    }
                }
            );
            break;

        case "click-clear-todo-btn":
            // todo をクリアする
            chrome.storage.local.set(
                { "todoData": "" },
                function () {
                    if (chrome.runtime.lastError) {
                        sendResponse({ status: false, replyMessage: "todo をクリアできませんでした。\nエラーの詳細：" + chrome.runtime.lastError });
                    } else {
                        sendResponse({ status: true, replyMessage: "todo をクリアしました。" });
                    }
                }
            );
            break;

        case "click-start-btn":
            // カウントダウンを開始する（TODO：後で書く）
            break;

        case "click-reset-btn":
            // カウントダウンを終了する（TODO：後で書く）
            break;

        default:
            // 何もしない
            console.log("ポップアップからのメッセージを受信しましたが、処理するアクションがありません。");
            console.log("受信したアクション：" + message.action);
            break;
    }
    return true;
});