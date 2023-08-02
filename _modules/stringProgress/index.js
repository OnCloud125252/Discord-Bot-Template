function bar(line, progressLine, slider, _this) {
    if (_this.current > _this.total) {
        const bar = slider.repeat(_this.size + 2);
        const percentage = (_this.current / _this.total) * 100;
        return {
            bar,
            percentage
        };
    } else {
        const percentage = _this.current / _this.total;
        const progress = Math.round((_this.size * percentage));
        const emptyProgress = _this.size - progress;
        const progressText = progressLine.repeat(progress).replace(/.$/, slider);
        const emptyProgressText = line.repeat(emptyProgress);
        const bar = progressText + emptyProgressText;
        const calculated = percentage * 100;
        return {
            bar,
            calculated
        };
    }
}

export default class stringProgress {
    constructor(total, current, size = 40) {
        if (!total) throw new Error("Total value is either not provided or invalid");
        if (!current && current !== 0) throw new Error("Current value is either not provided or invalid");
        if (isNaN(total)) throw new Error("Total value is not an integer");
        if (isNaN(current)) throw new Error("Current value is not an integer");
        if (isNaN(size)) throw new Error("Size is not an integer");

        this.total = total;
        this.current = current;
        this.size = size;
    }

    splitBar() {
        const line = "▬";
        const progressLine = "▬";
        const slider = "🔘";
        return bar(line, progressLine, slider, this);
    }

    filledBar() {
        const line = "□";
        const progressLine = "■";
        const slider = "■";
        return bar(line, progressLine, slider, this);
    }

    customBar(line, progressLine = slider, slider) {
        return bar(line, progressLine, slider, this);
    }
}