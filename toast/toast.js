"use strict";
class LFPToast extends HTMLElement {
    ul = document.createElement('ul');
    delay = Number(this.getAttribute('close-delay') ?? 4000);
    dismissable = !!this.getAttribute('close-button');
    animationDelay;
    constructor() {
        super();
        this.setAttribute('role', 'alert');
        this.append(this.ul);
        this.animationDelay = Number(this.getAttribute('animation-delay')) ?? 0;
    }
    connectedCallback() {
        document.addEventListener('lfp:toast', this);
    }
    handleEvent(event) {
        if (!event.detail.description)
            return;
        let toast = document.createElement('li');
        toast.setAttribute('role', 'status');
        let description = document.createElement('span');
        this.ul.prepend(toast);
        setTimeout(() => {
            if (event.detail.title) {
                let title = document.createElement('span');
                toast.append(title);
                title.textContent = event.detail.title;
            }
            toast.append(description);
            description.textContent = event.detail.description;
            if (this.dismissable || event.detail.dismissable) {
                let closeBtn = document.createElement('button');
                closeBtn.setAttribute('aria-label', 'dismiss status message');
                closeBtn.addEventListener('click', () => this.#remove(closeBtn.parentElement));
                toast.append(closeBtn);
            }
        }, 1);
        setTimeout(() => this.#remove(toast), this.delay);
    }
    #remove(element) {
        if (!element)
            return;
        if (this.animationDelay)
            element.style.animationPlayState = 'play';
        setTimeout(() => element.remove(), this.animationDelay);
    }
    static emit(description, title, dismissable = false) {
        document.dispatchEvent(new CustomEvent('lfp:toast', {
            bubbles: true,
            cancelable: true,
            composed: true,
            detail: { title, description, dismissable }
        }));
    }
}
customElements.define('lfp-toast', LFPToast);
