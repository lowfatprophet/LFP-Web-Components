export default class LFPToolbar extends HTMLElement {
    /**
     * @internal
     * @prop {string} orientation
     */
    orientation;
    /**
     * @internal
     * @prop {string} backKey
     * @default 'ArrowLeft'
     */
    backKey = 'ArrowLeft';
    /**
     * @internal
     * @prop {string} forwardKey
     * @default 'ArrowRight'
     */
    forwardKey = 'ArrowRight';
    items;
    selected = 0;
    constructor() {
        super();
        // set navigation orientation
        this.orientation = this.getAttribute('menu-orientation') ?? 'horizontal';
        if (this.orientation === 'vertical') {
            this.backKey = 'ArrowUp';
            this.forwardKey = 'ArrowDown';
            this.setAttribute('aria-orientation', 'vertical');
        }
        // a11y
        this.setAttribute('role', 'toolbar');
        // gather items
        this.items = [...this.querySelectorAll(`:scope > ${this.getAttribute('menu-items') ?? 'button'}`)]
            .map((item, idx) => {
            if (idx !== 0)
                item.setAttribute('tabindex', '-1');
            return item;
        });
    }
    connectedCallback() {
        this.addEventListener('keydown', e => {
            switch (e.key) {
                case this.backKey:
                    e.preventDefault();
                    this.#setFocus(this.selected - 1);
                    break;
                case this.forwardKey:
                    e.preventDefault();
                    this.#setFocus(this.selected + 1);
                    break;
                case 'Home':
                    e.preventDefault();
                    this.#setFocus(0);
                    break;
                case 'End':
                    e.preventDefault();
                    this.#setFocus(this.items.length - 1);
            }
        });
        this.addEventListener('focusin', _ => this.items[this.selected]?.focus());
    }
    #setFocus(selected) {
        this.selected = selected;
        this.selected = this.selected >= 0 ?
            this.selected === this.items.length ?
                0 : this.selected : this.items.length - 1;
        this.items.forEach((item, idx) => {
            if (idx === this.selected) {
                item.focus();
                item.removeAttribute('tabindex');
            }
            else {
                item.setAttribute('tabindex', '-1');
            }
        });
    }
}
customElements.define('lfp-toolbar', LFPToolbar);
