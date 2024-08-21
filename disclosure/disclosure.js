"use strict";
customElements.define('lfp-disclosure', class extends HTMLElement {
    trigger;
    content;
    constructor() {
        super();
        this.trigger = this.querySelector('[trigger]');
        this.content = this.querySelector('[content]');
        if (!this.trigger || !this.content)
            return;
        this.trigger.removeAttribute('hidden');
        this.trigger.setAttribute('aria-expanded', 'false');
        this.content.setAttribute('hidden', '');
        this.trigger.addEventListener('click', this);
    }
    handleEvent(event) {
        event.preventDefault();
        if (!this.trigger || !this.content)
            return;
        if (this.trigger.getAttribute('aria-expanded') === 'true') {
            this.trigger.setAttribute('aria-expanded', 'false');
            this.content.setAttribute('hidden', '');
        }
        else {
            this.trigger.setAttribute('aria-expanded', 'true');
            this.content.removeAttribute('hidden');
        }
    }
});
