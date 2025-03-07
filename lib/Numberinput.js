import { addStylesheet } from "./utilities.js";
/**
 * Creates a simple numerical input widget that can be used inside of tool boxes
 * or other UI controls.
 *
 * @example
 * ```html
 * <lfp-numberinput>
 *   <label for="number-input">Enter number here:</label>
 *   <input type="number" id="number-input" value="42">
 * </lfp-numberinput>
 * ```
 */
export default class LFPNumberInput extends HTMLElement {
    /**
     * @internal
     * @prop {HTMLInputElement|null} input - The input element, that is mandatory
     * to be inside the web component. If `null`, the input element was not found
     * inside the web component and the `constructor` exits prematurely, not
     * instantiating the component. No errors are emitted.
     */
    input;
    /**
     * @internal
     * @prop {HTMLButtonElement|undefined} decrementButton - The button to
     * decrement the counter. Is `undefined` in case `this.input` is not found.
     */
    decrementButton;
    /**
     * @internal
     * @prop {HTMLButtonElement|undefined} decrementButton - The button to
     * decrement the counter. Is `undefined` in case `this.input` is not found.
     */
    incrementButton;
    constructor() {
        super();
        this.input = this.querySelector('input[type="number"]');
        if (!this.input)
            return;
        addStylesheet(/* css */ `lfp-numberinput {
      input {
        text-align: right;
        
        &[type="number"] { appearance: textfield; }

        &::-webkit-outer-spin-button,
        &::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
      }
    }`);
        this.decrementButton = this.#createButton('-');
        this.incrementButton = this.#createButton('+');
        this.insertBefore(this.decrementButton, this.input);
        this.input.after(this.incrementButton);
        this.#clickAndHold(this.decrementButton, () => {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const currentVal = this.input.value;
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            this.input.value = (Number(currentVal) - 1).toString();
        });
        this.#clickAndHold(this.incrementButton, () => {
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            const currentVal = this.input.value;
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            this.input.value = (Number(currentVal) + 1).toString();
        });
    }
    #createButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        return button;
    }
    #clickAndHold(btnEl, callback) {
        let intervalId;
        let timeoutId;
        const DURATION = 100;
        const DELAY = 50;
        // handle when clicking down
        const onMouseDown = (e) => {
            e.preventDefault();
            callback();
            timeoutId = setTimeout(() => {
                intervalId = setInterval(() => {
                    callback();
                }, DURATION);
            }, DELAY);
        };
        // stop or clear interval
        const clearTimer = (e) => {
            e.preventDefault();
            if (intervalId)
                clearInterval(intervalId);
            if (timeoutId)
                clearTimeout(timeoutId);
        };
        // handle when mouse is clicked
        btnEl.addEventListener('mousedown', onMouseDown);
        // handle when mouse is raised
        btnEl.addEventListener('mouseup', clearTimer);
        // handle mouse leaving the clicked button
        btnEl.addEventListener('mouseout', clearTimer);
    }
}
customElements.define('lfp-numberinput', LFPNumberInput);
