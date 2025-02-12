import { addStylesheet } from './utilities.js';
/**
 * Creates a simple progressbar, that can be updated with the use of `setValue()`
 * on the instance, or `update()` as static method on the class.
 *
 * @summary A W3 compliant progress bar web component, https://w3c.github.io/aria/#progressbar.
 *
 * @attr show-value - Specify if the current progress should get a numerical
 * representation as well.
 * @attr progress-min - Set the minimum value for the progress bar.
 * @attr progress-max - Set the maximum value for the progress bar.
 * @attr text-label - Set an optional text label for the progressbar. Use
 * `${rel}` and `${abs}` to display the current relative and absolute progress
 * value.
 */
export default class LFPProgressbar extends HTMLElement {
    /**
     * @internal
     * @prop {boolean} showValue - Specifies if the element display the current
     * progress status numerically additonally to the graphical representation.
     */
    showValue;
    /**
     * @internal
     * @prop {boolean} showValue - Specifies if `aria-notify` is set to
     * true, when the progressbar finishes. Defaults to `false`.
     * @default false
     */
    notify = false;
    /**
     * @internal
     * @prop {number} min - The minimum value for the progressbar.
     */
    min;
    /**
     * @internal
     * @prop {number} max - The maximum value for the progressbar.
     */
    max;
    /**
     * @internal
     * @prop {string|null} textLabel - The description text for the progressbar.
     */
    textLabel;
    /**
     * @internal
     * @prop {HTMLDivElement} range - The containing element for the progress indicator.
     */
    range = document.createElement('div');
    /**
     * @internal
     * @prop {HTMLElement|undefined} output
     */
    output;
    constructor() {
        super();
        this.showValue = !!this.getAttribute('show-value');
        this.notify = !!this.getAttribute('aria-notify');
        this.min = Number(this.getAttribute('progress-min') ?? this.getAttribute('aria-valuemin'));
        this.max = Number(this.getAttribute('progress-max') ?? this.getAttribute('aria-valuemax'));
        this.textLabel = this.getAttribute('text-label');
        addStylesheet(/* css */ `lfp-progressbar {
      position: relative;
      display: inline-block;
      inline-size: min(30ch, 100%);
      block-size: 15px;
      border: 1px solid lightgray;
      pointer-events: none;
      overflow: hidden;

      .range {
        block-size: 100%;
        background: lightgray;
        transform-origin: left;
        transition: scale 900ms ease-in-out;
      }

      [role="status"] {
        position: absolute;
        inset-block-start: 0;
        inset-inline-start: 0;
      }
    }`);
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
        // set initial value 
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
    /**
     * Set a new value for the progressbar. Call this method periodically
     * so that the progressbar is updated continuously.
     *
     * @param {number} value The new value for the progressbar.
     * @param {boolean} [abs=true] Specify if the value passed should be handled
     * in relation to the progressbar's maximum value or if value is just to be
     * added as is.
     * @example
     * ```html
     * <lfp-progressbar id="load-progress"></lfp-progressbar>
     * <script>
     *   const $loadProgress = document.querySelector('#load-progress');
     *   $loadProgress.setValue(10);
     * </script>
     * ```
     */
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
    /**
     * Use this `static` method to update the progressbar's current value.
     * Alternatively, use the `setValue` method on the component's instance itself.
     * @param {string} id The progressbar's unique ID
     * @param {number} value The new value for the progressbar.
     * @example
     * ```html
     * <lfp-progressbar id="load-progress"></lfp-progressbar>
     * <script>
     *   import LFPProgressbar from 'Progressbar.js';
     *   LFPProgressbar.update('load-progress', 10);
     * </script>
     * ```
     */
    static update(id, value) {
        let progressbar = document.querySelector(id.startsWith('#') ? id : `#${id}`);
        if (!progressbar)
            return;
        progressbar.setValue(value);
    }
}
customElements.define('lfp-progressbar', LFPProgressbar);
