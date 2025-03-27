"use strict";
// ↓ は後で消す
console.log("file_name : popup.ts or popup.js");
if (typeof document === "undefined") {
    console.log("document is undefined");
}
else {
    document.addEventListener("click", (e) => {
        const btn = e.target;
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
            default:
                console.log("nothing process");
                break;
        }
    });
}
