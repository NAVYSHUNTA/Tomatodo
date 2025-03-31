const START_BTN_ID: string = "start-btn";
const RESET_BTN_ID: string = "reset-btn";
const SAVE_TODO_BTN_ID: string = "save-todo-btn";
const CLEAR_TODO_BTN_ID: string = "clear-todo-btn";

const TODO_TEXTAREA_ID: string = "todo";
const TIMER_ID: string = "timer";
const TASK_ID: string = "task";

const TASK_WORK: string = "work";
const TASK_BREAK: string = "break";
const TASK_NOTHING: string = "nothing";

const COUNTDOWN_STATE: string = "countDown";
const WAIT_STATE: string = "wait";

// 拡張機能のポップアップを開いたときに、保存されている todo があればそれを textarea に表示する
chrome.storage.local.get(["todoData"], function (storage) {
    setTextContentById(TODO_TEXTAREA_ID, storage.todoData);
});

// 拡張機能のポップアップを開いたときに、保存されている残り時間と作業内容があればそれらを表示させる
chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
    setMinuteAndSecondDisplay(storage.minute, storage.second);

    const taskTextContent = getTaskTextContent(storage.task);
    setTextContentById(TASK_ID, taskTextContent);

    switch (storage.state) {
        case COUNTDOWN_STATE:
            setButtonTextContentAndIdNameById(START_BTN_ID, RESET_BTN_ID);
            break;

        default:
            setButtonTextContentAndIdNameById(RESET_BTN_ID, START_BTN_ID);
            break;
    }
});

// カウントダウン処理
setInterval(() => {
    chrome.storage.local.get(["state", "task", "minute", "second"], function (storage) {
        if (storage.state === COUNTDOWN_STATE) {
            const minute = storage.minute;
            const second = storage.second;
            const restSecond = 60 * minute + second;
            const nextSecond = restSecond - 1;

            if (nextSecond === -1) {
                if (storage.task === TASK_WORK) {
                    alert("休憩時間に入ります。");
                    chrome.storage.local.set({ "task": TASK_BREAK, "minute": 5, "second": 0 });
                } else if (storage.task === TASK_BREAK) {
                    alert("作業時間に入ります。");
                    chrome.storage.local.set({ "task": TASK_WORK, "minute": 25, "second": 0 });
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
        case START_BTN_ID:
            setButtonTextContentAndIdNameById(START_BTN_ID, RESET_BTN_ID);
            chrome.storage.local.set(
                {
                    "state": COUNTDOWN_STATE,
                    "task": TASK_WORK,
                    "minute": 25,
                    "second": 0,
                },
                function () { }
            );
            break;

        case RESET_BTN_ID:
            setButtonTextContentAndIdNameById(RESET_BTN_ID, START_BTN_ID);
            chrome.storage.local.set(
                {
                    "state": WAIT_STATE,
                    "task": TASK_NOTHING,
                    "minute": 25,
                    "second": 0,
                },
                function () { }
            );
            break;

        case SAVE_TODO_BTN_ID:
            chrome.runtime.sendMessage(
                {
                    action: "click-save-todo-btn",
                    todoData: (document.getElementById(TODO_TEXTAREA_ID) as HTMLInputElement).value
                },
                function (response) {
                    alert(response.replyMessage);
                }
            );
            break;

        case CLEAR_TODO_BTN_ID:
            const todoTextContent: string = "";
            setValueById(TODO_TEXTAREA_ID, todoTextContent); // 保存せずに入力された todo もクリアする

            chrome.runtime.sendMessage(
                {
                    action: "click-clear-todo-btn",
                    todoData: todoTextContent,
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
function getTaskTextContent(task: string): string {
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
function setTextContentById(targetElementName: string, newTextContent: string): void {
    const targetElement = document.getElementById(targetElementName) as HTMLElement;
    if (targetElement) {
        targetElement.textContent = newTextContent;
    } else {
        console.error(`要素が見つかりませんでした。要素名: ${targetElementName}`);
    }
}

// 入力欄の内容を設定する関数
function setValueById(targetElementName: string, newValue: string): void {
    const targetElement = document.getElementById(targetElementName) as HTMLInputElement;
    if (targetElement) {
        targetElement.value = newValue;
    } else {
        console.error(`要素が見つかりませんでした。要素名: ${targetElementName}`);
    }
}

// id を変更する関数
function setIdById(targetElementName: string, newId: string): void {
    const targetElement = document.getElementById(targetElementName) as HTMLButtonElement;
    if (targetElement) {
        targetElement.id = newId;
    } else {
        console.error(`要素が見つかりませんでした。要素名: ${targetElementName}`);
    }
}

// 変更後の id 名を引数として受け取り、変更後のボタン名を取得する関数
function getNewButtonName(newIdName: string): string {
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
function setButtonTextContentAndIdNameById(currentButtonIdName: string, newIdName: string): void {
    const newButtonName = getNewButtonName(newIdName);
    setTextContentById(currentButtonIdName, newButtonName);
    setIdById(currentButtonIdName, newIdName); // id 変更は処理の最後で行う
}

// 分と秒を表示する関数
function setMinuteAndSecondDisplay(minute: number, second: number): void {
    if (minute !== undefined && second !== undefined) {
        const displayMinute = String(minute).padStart(2, "0");
        const displaySecond = String(second).padStart(2, "0");
        const newTextContent = `${displayMinute}:${displaySecond}`;
        setTextContentById(TIMER_ID, newTextContent);
    } else {
        console.error(`分または秒の値が未定義です。minute: ${minute}, second: ${second}`);
    }
}