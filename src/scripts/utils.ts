// 現在時刻を取得する関数
export function getCurrentTimer(): { hour: number, minute: number, second: number } {
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