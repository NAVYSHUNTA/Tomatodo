// ↓ は後で消す
console.log("file_name : popup.ts or popup.js");

if (typeof document === "undefined") {
    console.log("document is undefined");
} else {
    document.addEventListener("click", (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target && target.id === "start-btn") {
            target.id = "reset-btn";
            target.textContent = "リセット";

            const today = new Date();
            const hour = today.getHours();
            const minute = today.getMinutes();
            const second = today.getSeconds();

            const current_time = hour + "時" + minute + "分" + second + "秒";
            console.log("time: " + current_time);
        } else if (target && target.id === "reset-btn") {
            target.id = "start-btn";
            target.textContent = "スタート";
        } else {
            console.log("nothing process");
        }
    });
}