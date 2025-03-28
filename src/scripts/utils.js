"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentTimer = getCurrentTimer;
// 現在時刻を取得する関数
function getCurrentTimer() {
    const today = new Date();
    const hour = today.getHours();
    const minute = today.getMinutes();
    const second = today.getSeconds();
    return {
        "hour": hour,
        "minute": minute,
        "second": second,
    };
}
