import { addStylesheet } from "./utilities.js";

/**
 * Create a simple Nixie tube element to use on your site, for example to
 * build a clock, countdown, timer or a visitor counter. Your imagination is the
 * limit.
 * 
 * @attr {string} active-digit - The digit that the element should display (must
 * be a single-digit integer between 0 and 9, including 0 and 9).
 * @attr {boolean} preserve-stack - Set to `false` if the active digit should be
 * displayed in front of all the others; default is `true`.
 */
export default class LFPNixieTube extends HTMLElement {
  /** @internal */
  private clsPrefix = 'digit-';
  /** @internal */
  private digitAttr = 'active-digit';
  /** @internal */
  private activeDigit: number;
  /** @internal */
  static observedAttributes = ['active-digit'];
  
  constructor() {
    super();

    addStylesheet(/* css */ `lfp-nixie-tube {
      --_transition-speed: 250ms;
      --_font-clr: #000;
      display: inline-grid;
      grid-template-areas: "digit";
      block-size: 1lh;
      inline-size: 1ch;
      font-family: "Advent Pro", monospace;
      font-size: 4rem;
      
      > div {
        grid-area: digit;
        color: color(from var(--_font-clr) srgb r g b / 0.125);
        font-weight: 300;
        /* opacity: 0.125; */
        text-align: center;
        transition: color var(--_transition-speed) ease-in-out;
        will-change: opacity;
        user-select: none;
        isolation: isolate;
        
        &.selected {
          color: red;
          font-weight: 400;
          text-shadow: 0 0 5px #f00a;
          /* color: color(from currentcolor srgb r g b / 1); */
          backdrop-filter: blur(1px);
          transition: color var(--_transition-speed) ease-in-out,
            font-weight var(--_transition-speed) ease-in-out;
        }
      }
      
      /* &:has(.selected) > div:not(.selected) {
        color: color(from var(--_font-clr) srgb r g b / 0.07);
      } */
      /* &:has(.selected) > div:not(.selected) {
        color: rgb(0 0 0 / 0.07);
      } */
      
      &:not([preserve-stack]) > div.selected { z-index: 1; }
    }`);

    /** @internal */
    this.activeDigit = Number(this.getAttribute(this.digitAttr));
    for (let i = 0; i < 10; i++) {
      this.innerHTML += `<div class="${this.clsPrefix}${i}" aria-hidden="${this.activeDigit === i ? 'false' : 'true'}">${i}</div>`;
    }
  }
  
  attributeChangedCallback(attr: string, ov: string, nv: string) {
    // 1. is nv not null (i.e., if the attribute got removed)?
    // 2. is nv a string consisting of a single digit integer?
    const isNotValid = (v: string) => !v || !/^[0-9]$/.test(v);
    if (attr === this.digitAttr) {
      if (ov) {
        if (ov === nv || isNotValid(ov)) return;
        const $ov = this.querySelector(`.${this.clsPrefix}${ov}`);
        if ($ov) {
          $ov.classList.remove('selected');
          $ov.ariaHidden = 'true';
        }
      }
      if (isNotValid(nv)) return;
      const $nv =  this.querySelector(`.${this.clsPrefix}${nv}`);
      if ($nv) {
        $nv.classList.add('selected');
        $nv.ariaHidden = 'false';
      }
    }
  }
}

customElements.define('lfp-nixie-tube', LFPNixieTube);
