// 拡張機能のポップアップを開いたときに、保存されている todo があればそれを textarea に表示する
chrome.storage.local.get(["todoData"], function (storage) {
    const todoElement = document.getElementById("todo") as HTMLInputElement;
    if (todoElement && storage.todoData) {
        todoElement.value = storage.todoData;
    }
});

// 拡張機能のポップアップを開いたときに、保存されている残り時間と作業内容があればそれらを表示させる
chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
    const timerElement = document.getElementById("timer") as HTMLElement;
    if (timerElement && storage.state === "countDown" && storage.minute !== undefined && storage.second !== undefined) {
        const minute = String(storage.minute).padStart(2, "0");
        const second = String(storage.second).padStart(2, "0");
        timerElement.textContent = `${minute}:${second}`;
    }
    const taskElement = document.getElementById("task") as HTMLElement;
    if (taskElement && storage.task !== undefined) {
        taskElement.textContent = getTaskTextContent(storage.task);
    }
    switch (storage.state) {
        case "countDown":
            const startBtnElement = document.getElementById("start-btn") as HTMLButtonElement;
            if (startBtnElement) {
                startBtnElement.id = "reset-btn";
                startBtnElement.textContent = "リセット";
            }
            break;

        default:
            const resetBtnElement = document.getElementById("reset-btn") as HTMLButtonElement;
            if (resetBtnElement) {
                resetBtnElement.id = "start-btn";
                resetBtnElement.textContent = "スタート";
            }
            break;
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
                } else if (storage.task === "break") {
                    alert("作業時間に入ります。");
                    chrome.storage.local.set({ "task": "work", "minute": 25, "second": 0 });
                }
            } else {
                const newMinute = Math.floor(nextSecond / 60);
                const newSecond = nextSecond % 60;
                chrome.storage.local.set({ "minute": newMinute, "second": newSecond });
            }
        }
    });
}, 1000);

// ボタンをクリックしたときの処理
document.addEventListener("click", (e: MouseEvent) => {
    const btnElement = e.target as HTMLButtonElement;

    switch (btnElement?.id) {
        case "start-btn":
            btnElement.id = "reset-btn";
            btnElement.textContent = "リセット";
            chrome.storage.local.set(
                {
                    "state": "countDown",
                    "task": "work",
                    "minute": 25,
                    "second": 0,
                },
                function () { }
            );
            break;

        case "reset-btn":
            btnElement.id = "start-btn";
            btnElement.textContent = "スタート";
            chrome.storage.local.set(
                {
                    "state": "wait",
                    "task": "nothing",
                    "minute": 25,
                    "second": 0,
                },
                function () { }
            );
            break;

        case "save-todo-btn":
            chrome.runtime.sendMessage(
                {
                    action: "click-save-todo-btn",
                    todoData: (document.getElementById("todo") as HTMLInputElement).value
                },
                function (response) {
                    alert(response.replyMessage);
                }
            );
            break;

        case "clear-todo-btn":
            chrome.runtime.sendMessage(
                {
                    action: "click-clear-todo-btn",
                    todoData: (document.getElementById("todo") as HTMLInputElement).value
                },
                function (response) {
                    alert(response.replyMessage);
                }
            );
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
        const todoElement = document.getElementById("todo") as HTMLInputElement;
        const todo = changes.todoData.newValue;
        if (todoElement) {
            todoElement.value = todo;
        }
    }

    // 残り時間の更新
    if ("minute" in changes || "second" in changes) {
        chrome.storage.local.get(["minute", "second"], function (storage) {
            const minute = storage.minute;
            const second = storage.second;
            if (minute !== undefined && second !== undefined) {
                const timerElement = document.getElementById("timer") as HTMLElement;
                const displayMinute = String(minute).padStart(2, "0");
                const displaySecond = String(second).padStart(2, "0");
                timerElement.textContent = `${displayMinute}:${displaySecond}`;
            }
        });
    }

    // 作業内容の更新
    if ("task" in changes) {
        const taskElement = document.getElementById("task") as HTMLElement;
        const task = changes.task.newValue;
        taskElement.textContent = getTaskTextContent(task);
    }
});

// タスクの内容を取得する関数
function getTaskTextContent(task: string): string {
    switch (task) {
        case "work":
            return "TOMATODO（作業中）";
        case "break":
            return "TOMATODO（休憩中）";
        default:
            return "TOMATODO（待機中）";
    }
}