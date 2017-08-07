class Timer {
    constructor() {
        this.start();
    }

    start() {
        this.delayed = 0;
        this.time = new Date();
        this.stoped = false;
    }

    stop() {
        if (!this.stoped) {
            this.delayed = new Date() - this.time;
            this.stoped = true;
        }
    }

    elapsed() {
        const hour = 1000 * 3600, minute = 1000 * 60, second = 1000;
        const calc = (x) => {
            const result = Math.floor(millisecond / x);
            millisecond -= result * x;
            return result;
        };
        const padLeft = (x, n) => ("0".repeat(n) + x.toString()).slice(-n);
        this.stop();
        let millisecond = this.delayed;
        const h = calc(hour);
        const m = calc(minute);
        const s = calc(second);
        const z = millisecond;
        return h + ":" + padLeft(m, 2) + ":" + padLeft(s, 2) + "." + padLeft(z, 3);
    }
}
module.exports = Timer;