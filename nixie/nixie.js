"use strict";
class LFPNixieTube extends HTMLElement {
    clsPrefix = 'digit-';
    digitAttr = 'active-digit';
    activeDigit;
    static observedAttributes = ['active-digit'];
    constructor() {
        super();
        this.activeDigit = Number(this.getAttribute(this.digitAttr));
        for (let i = 0; i < 10; i++) {
            this.innerHTML += `<div class="${this.clsPrefix}${i}" aria-hidden="${this.activeDigit === i ? 'false' : 'true'}">${i}</div>`;
        }
    }
    attributeChangedCallback(attr, ov, nv) {
        const isNotValid = (v) => !v || !/^[0-9]$/.test(v);
        if (attr === this.digitAttr) {
            if (ov) {
                if (ov === nv || isNotValid(ov))
                    return;
                let $ov = this.querySelector(`.${this.clsPrefix}${ov}`);
                if ($ov) {
                    $ov.classList.remove('selected');
                    $ov.ariaHidden = 'true';
                }
            }
            if (isNotValid(nv))
                return;
            let $nv = this.querySelector(`.${this.clsPrefix}${nv}`);
            if ($nv) {
                $nv.classList.add('selected');
                $nv.ariaHidden = 'false';
            }
        }
    }
}
customElements.define('lfp-nixie-tube', LFPNixieTube);
