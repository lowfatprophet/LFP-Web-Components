import { addStylesheet } from "./utilities.js";
/**
 * A web component signalling the user's scroll progress over a given containing
 * element on the page. Currently, only `document` (i.e., the `body` element) is
 * available for scroll tracking; more to come in the near future.
 * @attr scroll-element - Specify the element on which the scroll meter should
 * be applied. **Important**: Currently not implemented.
 */
export default class LFPScrollMeter extends HTMLElement {
    // container: Element | null;
    /**
     * @internal
     */
    viewportHeight;
    /**
     * @internal
     */
    pageHeight;
    /**
     * @internal
     */
    barSize;
    /**
     * @internal
     */
    meterSize;
    /**
     * @internal
     */
    meter = document.createElement('div');
    constructor() {
        super();
        // this.container = isValidAttr('scroll-element', this, true) ?
        //   document.querySelector('scroll-element') : null;
        this.meter.classList.add('meter');
        this.append(this.meter);
        addStylesheet(/* css */ `lfp-scrollmeter {
      display: block;
      inline-size: 100%;
      block-size: 5px;

      .meter {
        inline-size: 100%;
        block-size: 100%;
        background: green;
        scale: 0 1;
        transform-origin: left;
      }
    }`);
        window.addEventListener('load', this.#init.bind(this));
        window.addEventListener('scroll', _ => {
            requestAnimationFrame(() => {
                this.meter.style.scale = `${window.scrollY / this.pageHeight} 1`;
            });
        });
        window.addEventListener('resize', this.#init.bind(this));
    }
    #init() {
        this.barSize = this.getBoundingClientRect().width;
        this.viewportHeight = window.innerHeight;
        this.pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.scrollHeight) - this.viewportHeight;
        // this.pageHeight = this.container ?
        //   this.container.getBoundingClientRect().height :
        //   Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.scrollHeight) - this.viewportHeight;
    }
}
customElements.define('lfp-scrollmeter', LFPScrollMeter);
