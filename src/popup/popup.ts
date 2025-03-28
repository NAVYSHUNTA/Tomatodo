// 拡張機能のポップアップを開いたときに、保存されている todo があればそれを textarea に表示する
chrome.storage.local.get(["todoData"], function (storage) {
    const todoTextArea = document.getElementById("todo") as HTMLInputElement;
    if (todoTextArea && storage.todoData) {
        todoTextArea.value = storage.todoData; // 保存されている todo を textarea に表示
    }
});

// 拡張機能のポップアップを開いたときに、保存されている残り時間と作業内容があればそれらを表示させる
chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
    const timer = document.getElementById("timer") as HTMLElement;
    if (timer && storage.state === "countDown" && storage.minute !== "undefined" && storage.second !== "undefined") {
        const minute = String(storage.minute).padStart(2, "0");
        const second = String(storage.second).padStart(2, "0");
        timer.textContent = `${minute}:${second}`;
    }
    const task = document.getElementById("task") as HTMLElement;
    if (task && storage.task !== "undefined") {
        switch (storage.task) {
            case "work":
                task.textContent = "Tomatodo（作業中）";
                break;
            case "break":
                task.textContent = "Tomatodo（休憩中）";
                break;
            default:
                task.textContent = "Tomatodo（待機中）";
                break;
        }
    }
});

// カウントダウン処理
setInterval(() => {
    chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
        if (storage.state === "countDown") {
            const timer = document.getElementById("timer") as HTMLElement;
            const minute = storage.minute;
            const second = storage.second;
            const restSecond = 60 * minute + second;
            const nextSecond = restSecond - 1;

            if (nextSecond === -1) {
                if (storage.task === "work") {
                    alert("休憩時間に入ります。");
                    timer.textContent = "05:00";
                    chrome.storage.local.set({ "state": "countDown", "task": "break", "minute": 5, "second": 0 });
                    const task = document.getElementById("task") as HTMLElement;
                    task.textContent = "Tomatodo（休憩中）";
                } else if (storage.task === "break") {
                    alert("作業時間に入ります。");
                    timer.textContent = "25:00";
                    chrome.storage.local.set({ "state": "countDown", "task": "work", "minute": 25, "second": 0 });
                    const task = document.getElementById("task") as HTMLElement;
                    task.textContent = "Tomatodo（作業中）";
                }
            } else {
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
document.addEventListener("click", (e: MouseEvent) => {
    const btn = e.target as HTMLButtonElement;

    switch (btn?.id) {
        case "start-btn":
            btn.id = "reset-btn";
            btn.textContent = "リセット";
            chrome.storage.local.set(
                {
                    "state": "countDown",
                    "task": "work",
                    "minute": 25,
                    "second": 0,
                },
                function () {
                    const timer = document.getElementById("timer") as HTMLElement;
                    timer.textContent = "25:00";
                    const task = document.getElementById("task") as HTMLElement;
                    task.textContent = "Tomatodo（作業中）";
                }
            );
            break;

        case "reset-btn":
            btn.id = "start-btn";
            btn.textContent = "スタート";
            chrome.storage.local.set(
                {
                    "state": "wait",
                    "task": "nothing",
                    "minute": 25,
                    "second": 0,
                },
                function () {
                    const timer = document.getElementById("timer") as HTMLElement;
                    timer.textContent = "25:00";
                    const task = document.getElementById("task") as HTMLElement;
                    task.textContent = "Tomatodo（待機中）";
                }
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

        default:
            console.log("ボタンでない箇所をクリックしました。");
            break;
    }
});