import { addStylesheet } from "./utilities.js";

export interface LFPScrollProgressEvent extends CustomEvent {
  detail: {
    emitter: string;
    progress: number;
  },
}

/**
 * A web component signalling the user's scroll progress over a given containing
 * element on the page. Currently, only `document` (i.e., the `body` element) is
 * available for scroll tracking; more to come in the near future.
 */
export default class LFPScrollMeter extends HTMLElement {
  /**
   * @internal
   */
  viewportHeight!: number;
  /**
   * @internal
   */
  pageHeight!: number;
  /**
   * @internal
   */
  barSize!: number;
  /**
   * @internal
   */
  meterSize!: number;
  /**
   * @internal
   */
  meter = document.createElement('div');
  constructor() {
    super();

    this.meter.classList.add('meter');
    this.append(this.meter);
    this.id = this.id.length === 0 ? `scrollmeter-${crypto.randomUUID()}` : this.id;

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

    window.addEventListener('scroll', () => {
      const progress = window.scrollY / this.pageHeight;
      this.dispatchEvent(new CustomEvent('lfp:scrollprogress', {
        bubbles: true,
        detail: { progress: progress, emitter: this.id },
      }) as LFPScrollProgressEvent);
      requestAnimationFrame(() => { this.meter.style.scale = `${progress} 1` });
    });

    window.addEventListener('resize', this.#init.bind(this));
  }

  #init() {
    this.barSize = this.getBoundingClientRect().width;
    this.viewportHeight = window.innerHeight;
    this.pageHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.scrollHeight) - this.viewportHeight;
  }
}

customElements.define('lfp-scrollmeter', LFPScrollMeter);