import { addStylesheet } from "./utilities.js";
const SHEET = `@layer lfp {
  lfp-numberinput {
    input {
      text-align: right;
      
      &[type="number"] { appearance: textfield; }

      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
    }
  }
}`;
export default class LFPNumberInput extends HTMLElement {
    input;
    decrementButton;
    incrementButton;
    constructor() {
        super();
        this.input = this.querySelector('input[type="number"]');
        if (!this.input)
            return;
        addStylesheet(SHEET);
        this.decrementButton = this.#createButton('-');
        this.incrementButton = this.#createButton('+');
        this.insertBefore(this.decrementButton, this.input);
        this.input.after(this.incrementButton);
        this.#clickAndHold(this.decrementButton, () => {
            let currentVal = this.input.value;
            this.input.value = (Number(currentVal) - 1).toString();
        });
        this.#clickAndHold(this.incrementButton, () => {
            let currentVal = this.input.value;
            this.input.value = (Number(currentVal) + 1).toString();
        });
    }
    #createButton(text) {
        let button = document.createElement('button');
        button.textContent = text;
        return button;
    }
    #clickAndHold(btnEl, callback) {
        let intervalId;
        let timeoutId;
        const DURATION = 100;
        const DELAY = 50;
        const onMouseDown = (e) => {
            e.preventDefault();
            callback();
            timeoutId = setTimeout(() => {
                intervalId = setInterval(() => {
                    callback();
                }, DURATION);
            }, DELAY);
        };
        const clearTimer = (e) => {
            e.preventDefault();
            if (intervalId)
                clearInterval(intervalId);
            if (timeoutId)
                clearTimeout(timeoutId);
        };
        btnEl.addEventListener('mousedown', onMouseDown);
        btnEl.addEventListener('mouseup', clearTimer);
        btnEl.addEventListener('mouseout', clearTimer);
    }
}
customElements.define('lfp-numberinput', LFPNumberInput);
