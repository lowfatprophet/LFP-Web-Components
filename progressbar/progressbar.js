"use strict";
class LFPProgressbar extends HTMLElement {
    showValue;
    notify = false;
    min;
    max;
    textLabel;
    range = document.createElement('div');
    output;
    constructor() {
        super();
        this.showValue = !!this.getAttribute('show-value');
        this.notify = !!this.getAttribute('aria-notify');
        this.min = Number(this.getAttribute('progress-min') ?? this.getAttribute('aria-valuemin'));
        this.max = Number(this.getAttribute('progress-max') ?? this.getAttribute('aria-valuemax'));
        this.textLabel = this.getAttribute('text-label');
        if (this.showValue) {
            this.output = document.createElement('div');
            this.output.setAttribute('role', 'status');
            if (this.notify)
                this.output.ariaLive = 'polite';
            this.prepend(this.output);
        }
        new Map([
            ['aria-valuemin', this.min.toString()],
            ['aria-valuemax', this.max.toString()],
            ['role', 'progressbar'],
        ]).forEach((val, attr) => this.setAttribute(attr, val));
        this.range.classList.add('range');
        this.setValue(Number(this.getAttribute('progress-now') ?? 0));
        this.prepend(this.range);
    }
    connectedCallback() {
        document.addEventListener('lfp:progressbar-update', e => {
            if (e.detail.id.replace('#', '') === this.id)
                this.setValue(e.detail.value);
        });
    }
    #setTextLabel(rel, abs) {
        if (!this.output || !this.textLabel)
            return;
        let string = this.textLabel;
        string = string.replace('${rel}', rel.toString());
        string = string.replace('${abs}', abs ? abs.toString() : '');
        this.range.setAttribute('aria-valuetext', string);
        this.output.textContent = string;
    }
    setValue(value, abs = true) {
        let newValue = value;
        if (abs)
            newValue /= this.max;
        newValue = Math.min(newValue, 1);
        this.range.style.scale = `${newValue} 1`;
        this.ariaValueNow = value.toString();
        if (this.showValue)
            this.#setTextLabel(abs ? this.max / 100 * value : this.max * newValue, abs ? newValue : undefined);
    }
    static update(id, value) {
        let progressbar = document.querySelector(id.startsWith('#') ? id : `#${id}`);
        if (!progressbar)
            return;
        progressbar.setValue(value);
    }
}
customElements.define('lfp-progressbar', LFPProgressbar);
