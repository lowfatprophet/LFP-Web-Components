/**
 * A W3 compliant tab list web component.
 * https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 */
class LFPTablist extends HTMLElement {
  private readonly tabMenu = document.createElement('nav');
  private readonly panels!: NodeListOf<Element>;
  private readonly orientation: 'horizontal' | 'vertical' | string;
  private readonly backKey: 'ArrowLeft' | 'ArrowUp' = 'ArrowLeft';
  private readonly forwardKey: 'ArrowRight' | 'ArrowDown' = 'ArrowRight';
  private buttons: HTMLButtonElement[] = [];
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

    // a11y compatibility
    this.setAttribute('role', 'tablist');
    let label = this.querySelector('[label]');
    if (label) {
      this.setAttribute('aria-labelledby', label.getAttribute('label')!);
      this.removeAttribute('aria-label');
    }

    // create tab panels
    this.panels = this.querySelectorAll('[tab-description]');
    if (this.panels.length === 0) this.panels = this.childNodes as NodeListOf<Element>;
    if (this.panels.length === 0) return;
    this.panels.forEach(el => {
      this.#setAttributes(el, new Map([['role', 'tabpanel'], ['aria-selected', 'false']]));
    });

    this.prepend(this.tabMenu);

    // create tab nav menu
    let ul = document.createElement('ul');
    this.panels.forEach((el, idx) => {
      let li = document.createElement('li');
      let button = this.#createTabButton(
        el.getAttribute('tab-description') ?? `${idx + 1}`, idx, idx === 0 ? true : false
      );
      this.buttons.push(button);
      li.append(button);
      ul.append(li);
    });
    this.tabMenu.append(ul);

    // make sure the correct tab is open
    this.#setLinkedHeading(location.href);
    window.addEventListener('hashchange', (e) => this.#setLinkedHeading(e.newURL));
  }

  #setLinkedHeading(url: string) {
    let heading = url.split('#')[1];
    const setSelected = (list: Element[]) => {
      list.forEach((el, idx) => {
        try {
          if (el.querySelector(`#${heading}`)) this.selected = idx;
        } catch (_) {}  // catch is necessary in case heading is malformed or empty
      });
    };
    setSelected([...this.buttons, ...this.panels]);
    this.#toggleVisibility();
  }

  connectedCallback() {
    this.tabMenu.addEventListener('keydown', e => {
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
          this.#setFocus(this.panels.length - 1);
          break;
      }
    });
    this.tabMenu.addEventListener('focusin', _ => this.buttons[this.selected]?.focus());
    this.tabMenu.addEventListener('click', e => {
      let button = (e.target as Element).closest('button');
      if (!button) return;
      e.preventDefault();
      this.selected = Number(button.getAttribute('index'));
      this.#toggleVisibility();
    });
  }

  #setFocus(selected: number) {
    this.selected = selected;
    this.selected =
      this.selected >= 0 ? this.selected === this.panels.length ? 0 : this.selected : this.panels.length - 1;
    this.buttons[this.selected]?.focus();
    this.#toggleVisibility();
  }

  #createTabButton(description: string, idx: number, tabindex = false): HTMLButtonElement {
    let button = document.createElement('button');
    let headingLevel = this.getAttribute('heading-level');
    if (headingLevel) {
      let heading = document.createElement(`h${headingLevel}`);
      heading.id = description.replaceAll(' ', '-').toLowerCase();
      heading.textContent = description;
      button.append(heading);
    } else {
      button.textContent = description;
    }
    this.#setAttributes(button, new Map([['role', 'tab'], ['index', idx.toString()]]));
    this.tabMenu.append(button);
    if (!tabindex) button.setAttribute('tabindex', '-1');
    return button;
  }

  #toggleVisibility() {
    this.panels.forEach((el, idx) => {
      if (idx === this.selected) {
        this.#setAttributes(el, new Map([['aria-selected', 'true'], ['aria-hidden', 'false']]));
        el.removeAttribute('tabindex');
        (el as HTMLElement).style.visibility = '';
      } else {
        el.removeAttribute('aria-selected');
        this.#setAttributes(el, new Map([['aria-hidden', 'true'], ['tabindex', '-1']]));
        (el as HTMLElement).style.visibility = 'hidden';
      }
    });
    this.buttons.forEach((btn, idx) => {
      if (idx === this.selected) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    })
  }

  #setAttributes(el: Element, items: Map<string, string>) {
    items.forEach((value, attr) => el.setAttribute(attr, value));
  }
}

customElements.define('lfp-tablist', LFPTablist);