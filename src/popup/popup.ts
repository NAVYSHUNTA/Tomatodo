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

const DEFAULT_WORK_MINUTE: number = 25;
const DEFAULT_WORK_SECOND: number = 0;
const DEFAULT_BREAK_MINUTE: number = 5;
const DEFAULT_BREAK_SECOND: number = 0;

// デバッグ用
// const DEFAULT_WORK_MINUTE: number = 0;
// const DEFAULT_WORK_SECOND: number = 4;
// const DEFAULT_BREAK_MINUTE: number = 0;
// const DEFAULT_BREAK_SECOND: number = 6;

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
document.addEventListener("click", (e: MouseEvent) => {
    const btnElement = e.target as HTMLButtonElement;

    switch (btnElement?.id) {
        case START_BTN_ID:
            setButtonTextContentAndIdNameById(START_BTN_ID, RESET_BTN_ID);
            chrome.storage.local.set(
                {
                    "state": COUNTDOWN_STATE,
                    "task": TASK_WORK,
                    "minute": DEFAULT_WORK_MINUTE,
                    "second": DEFAULT_WORK_SECOND,
                }
            );

            chrome.runtime.sendMessage({ action: "clickStartBtn" });
            break;

        case RESET_BTN_ID:
            setButtonTextContentAndIdNameById(RESET_BTN_ID, START_BTN_ID);
            chrome.storage.local.set(
                {
                    "state": WAIT_STATE,
                    "task": TASK_NOTHING,
                    "minute": DEFAULT_WORK_MINUTE,
                    "second": DEFAULT_WORK_SECOND,
                }
            );

            chrome.runtime.sendMessage({ action: "clickResetBtn" });
            break;

        case SAVE_TODO_BTN_ID:
            chrome.runtime.sendMessage(
                {
                    action: "clickSaveTodoBtn",
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
                    action: "clickClearTodoBtn",
                    todoData: todoTextContent,
                },
                function (response) {
                    alert(response.replyMessage);
                }
            );
            break;

        default:
            break;
    }
});

// カウントダウンが終わったことを通知し、storage の内容を更新する
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "countDownEnd") {
        switch (message.task) {
            case TASK_WORK:
                alert("休憩時間に入ります。");
                chrome.storage.local.set({ "task": TASK_BREAK, "minute": DEFAULT_BREAK_MINUTE, "second": DEFAULT_BREAK_SECOND });
                chrome.runtime.sendMessage({ action: "restartCountDown" });
                break;

            case TASK_BREAK:
                alert("作業時間に入ります。");
                chrome.storage.local.set({ "task": TASK_WORK, "minute": DEFAULT_WORK_MINUTE, "second": DEFAULT_WORK_SECOND });
                chrome.runtime.sendMessage({ action: "restartCountDown" });
                break;

            default:
                // 何もしない
                break;
        }
    }
    return true;
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
        const MAX_DIGIT_LENGTH: number = 2;
        const FILL_ZERO: string = "0";
        const displayMinute = String(minute).padStart(MAX_DIGIT_LENGTH, FILL_ZERO);
        const displaySecond = String(second).padStart(MAX_DIGIT_LENGTH, FILL_ZERO);
        const newTextContent = `${displayMinute}:${displaySecond}`;
        setTextContentById(TIMER_ID, newTextContent);
    } else {
        console.error(`分または秒の値が未定義です。minute: ${minute}, second: ${second}`);
    }
}