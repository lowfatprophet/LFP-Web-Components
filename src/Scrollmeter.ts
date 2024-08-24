import { addStylesheet } from "./utilities.js";

const SHEET = `@layer lfp {
  lfp-scrollmeter {
    display: block;
    width: 100%;
    height: 5px;

    .meter {
      width: 100%;
      height: 100%;
      background: green;
      scale: 0 1;
      transform-origin: left;
    }
  }
}`;

export default class LFPScrollMeter extends HTMLElement {
  viewportHeight!: number;
  pageHeight!: number;
  barSize!: number;
  meterSize!: number;
  meter = document.createElement('div');
  constructor() {
    super();

    this.meter.classList.add('meter');
    this.append(this.meter);

    addStylesheet(SHEET);

    window.addEventListener('load', this.#init.bind(this));

    window.addEventListener('scroll', _ => {
      requestAnimationFrame(
        () => this.meter.style.scale = `${window.scrollY / this.pageHeight} 1`
      );
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