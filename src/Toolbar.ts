export default class LFPToolbar extends HTMLElement {
  /**
   * @internal
   * @prop {string} orientation
   */
  private readonly orientation: 'horizontal' | 'vertical' | {};
  /**
   * @internal
   * @prop {string} backKey
   * @default 'ArrowLeft'
   */
  private readonly backKey: 'ArrowLeft' | 'ArrowUp' = 'ArrowLeft';
  /**
   * @internal
   * @prop {string} forwardKey
   * @default 'ArrowRight'
   */
  private readonly forwardKey: 'ArrowRight' | 'ArrowDown' = 'ArrowRight';
  private readonly items: HTMLElement[];
  private selected = 0;
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
    this.items = [...this.querySelectorAll<HTMLElement>(`:scope > ${this.getAttribute('menu-items') ?? 'button'}`)]
      .map((item, idx) => {
        if (idx !== 0) item.setAttribute('tabindex', '-1');
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

    this.addEventListener('focusin',
      _ => this.items[this.selected]?.focus()
    );
  }

  #setFocus(selected: number) {
    this.selected = selected;
    this.selected = this.selected >= 0 ?
      this.selected === this.items.length ?
      0 : this.selected : this.items.length - 1;
    this.items.forEach((item, idx) => {
      if (idx === this.selected) {
        item.focus();
        item.removeAttribute('tabindex');
      } else {
        item.setAttribute('tabindex', '-1');
      }
    });
  }
}

customElements.define('lfp-toolbar', LFPToolbar);