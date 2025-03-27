if (typeof document === "undefined") {
    console.log("document is undefined");
} else {
    chrome.storage.local.get(["todoData"], function (storage) {
        const todoTextArea = document.getElementById("todo") as HTMLInputElement;
        if (todoTextArea && storage.todoData) {
            todoTextArea.value = storage.todoData;
        }
    });

    document.addEventListener("click", (e: MouseEvent) => {
        const btn = e.target as HTMLButtonElement;

        switch (btn?.id) {
            case "start-btn":
                btn.id = "reset-btn";
                btn.textContent = "リセット";

                const today = new Date();
                const hour = today.getHours();
                const minute = today.getMinutes();
                const second = today.getSeconds();

                const current_time = hour + "時" + minute + "分" + second + "秒";
                console.log("time: " + current_time);
                break;

            case "reset-btn":
                btn.id = "start-btn";
                btn.textContent = "スタート";
                break;

            case "save-todo-btn":
                chrome.runtime.sendMessage(
                    { action: "click-save-todo-btn", todoData: (document.getElementById("todo") as HTMLInputElement).value },
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
}