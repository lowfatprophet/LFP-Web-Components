import { addStylesheet, idify } from "./utilities.js";

type ButtonPosition = 'both' | 'none' | 'left' | 'right';

/**
 * This class creates a horizontally scrollable navigation menu. Parts of the
 * menu that overflow the containing element's width are accessible via scrolling
 * or optionally buttons. This kind of navigation is often seen as top level
 * navigation with news sites or shops.
 * @attr {number} scroll-distance -
 * @attr {number} scroll-offset - 
 * @attr {number} toggle-buttons - 
 * @attr {"none", "both", "left", "right"} hide-buttons - 
 * @attr {string} scroll-target - 
 * @attr {string} previous-text - 
 * @attr {string} next-text - 
 * @example
 * ```html
 * <lfp-scroll-nav
 *   scroll-distance="0.5"
 *   scroll-offset="400"
 *   scroll-target="#navigation-menu"
 *   toggle-buttons="20"
 *   hide-buttons="left"
 *   previous-text="&#8592;"
 *   next-text="&#8594;"
 * ></lfp-scroll-nav>
 * ```
 */
export class LFPScrollNav extends HTMLElement {
  static observedAttributes = ['scroll-target'];
  static elementName = 'lfp-scroll-nav';
  private _$scrollContainer = this.querySelector('[scroll-container]');
  private _$scrollTarget!: HTMLElement | null;
  private _$prevBtn = this.#createBtn(
    this.getAttribute('previous-text') || '❮', 'afterbegin'
  );
  private _$nextBtn = this.#createBtn(
    this.getAttribute('next-text') || '❯', 'beforeend'
  );
  private _hideBtns = (["left", "right", "both", "none"] as ButtonPosition[]).find(
      d => d === this.getAttribute("hide-buttons")?.toLowerCase()
    ) || "none";
  private _toggleBtns = Number(this.getAttribute('toggle-buttons')) || 10;
  private _gap = Number(this.getAttribute('test'));
  private _scrollFactor = Number(this.getAttribute('scroll-distance')) || 1;
  private _scrollOffset = Number(this.getAttribute('scroll-offset')) || 0;
  private _listWidth!: number;
  private _inlinePadding!: number;

  constructor() {
    super();

    if (!this._$scrollContainer) return;

    addStylesheet(/* css */ `${LFPScrollNav.elementName} {
      position: relative;
      display: block;
      overflow: hidden;

      [scroll-container] {
        list-style-type: none;
        display: flex;
        gap: 2ch;
        margin: 0;
        padding: 1ch;
        overflow-x: auto;
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* IE 10+ */

        &::-webkit-scrollbar {
          /* Chromium/Safari */
          height: 0px;
          background: transparent;
        }

        & > * {
          flex-shrink: 0;
        }

        @media (prefers-reduced-motion: no-preference) {
          scroll-behavior: smooth;
        }
      }

      ${
        this._hideBtns !== 'none'
          ? /* css */ `[data-trigger]${
              this._hideBtns === 'left'
                ? ':first-of-type'
                : this._hideBtns === 'right'
                ? ':last-of-type'
                : ''
            }[disabled] { display: none; }`
          : ''
      }

      [data-trigger] {
        position: absolute;
        block-size: 100%;

        &:first-of-type {
          inset: 0 auto 0 0;
        }

        &:last-of-type {
          inset: 0 0 0 auto;
        }
      }
    }`);

    this._gap = this.#pxStr2Num(
      this.#getStyle(getComputedStyle(this._$scrollContainer), 'gap')
    );
  }

  connectedCallback() {
    // bail early if no `[scroll-container]` element found
    if (!this._$scrollContainer) return;

    if (this._scrollOffset !== 0) {
      const itemWidths = [...this._$scrollContainer.querySelectorAll(':scope > *')];
      this._scrollOffset =
        itemWidths.length <= this._scrollOffset
          ? itemWidths.length
          : this._scrollOffset;
      const offset = itemWidths.reduce((offset, element) => {
        return offset + element.getBoundingClientRect().width + this._gap;
      }, 0);
      this._$scrollContainer.scroll(
        offset - (this._hideBtns === 'both' ? 0 : this._gap),
        0
      );
    }

    // get scroll target modifier
    // overwrites scroll offset setting
    const scrollTargetId = this.getAttribute('scroll-target');
    if (scrollTargetId) this.#scrollToTarget(idify(scrollTargetId));

    // set up layout
    this._listWidth = this._$scrollContainer.getBoundingClientRect().width;
    const computedStyles = getComputedStyle(this);
    this._inlinePadding =
      this.#pxStr2Num(this.#getStyle(computedStyles, 'padding-inline-start')) +
      this.#pxStr2Num(this.#getStyle(computedStyles, 'padding-inline-end'));

    // make room for buttons if they should be shown persistently
    if (['none', 'right'].includes(this._hideBtns)) {
      this.style.paddingInlineStart = `${this._$prevBtn.offsetWidth}px`;
    }
    if (['none', 'left'].includes(this._hideBtns)) {
      this.style.paddingInlineEnd = `${this._$nextBtn.offsetWidth}px`;
    }

    // initialize button layout
    this.#toggleBtns();

    // start listening
    window.addEventListener("resize", this);
    this._$scrollContainer.addEventListener("scroll", this);
    this.addEventListener("click", this);
  }

  disconnectedCallback(): void {
    window.removeEventListener('resize', this);
  }

  attributeChangedCallback(name: string, _: string | null, newVal: string | null): void {
    switch (name) {
      case 'scroll-target':
        // scroll to element with given id if attribute gets changed
        if (newVal) this.#scrollToTarget(idify(newVal));
        break;
    }
  }

  handleEvent(event: Event): void {
    if (!this._$scrollContainer) return;
    switch (event.type) {
      case 'resize':
      case 'scroll':
        // toggle button visibility on window resize and list scroll
        this.#toggleBtns();
        break;
      case 'click': {
        // listen for button clicks
        const btn = (event.target as HTMLElement)?.closest('[data-trigger]');
        if (!btn) return;
        // if true, go left, else go right
        const isFirst = btn === this.firstElementChild;
        let scrollDistance =
          this._$scrollContainer.scrollLeft +
          this._scrollFactor * this._$scrollContainer.clientWidth * (isFirst ? -1 : 1);
        if (scrollDistance <= this._toggleBtns) {
          scrollDistance = 0;
        } else if (
          scrollDistance >=
          this._$scrollContainer.scrollWidth - this._toggleBtns
        ) {
          scrollDistance = this._$scrollContainer.scrollWidth;
        }
        this._$scrollContainer.scroll(scrollDistance, 0);
        break;
      }
    }
  }

  /**
   * Scrolls to the element with given id.
   * @param {string} id The id of the element to look for
   */
  #scrollToTarget(id: string): void {
    if (!this._$scrollContainer) return;
    const scrollTarget = this._$scrollContainer.querySelector(id);
    if (!scrollTarget) return;
    if (this._$scrollTarget)
      this._$scrollTarget.classList.remove('scroll-target');
    scrollTarget.classList.add('scroll-target');
    this._$scrollTarget = scrollTarget as HTMLElement;
    this._$scrollContainer.scroll(this._$scrollTarget.offsetLeft - this._gap * 1.5, 0);
  }

  /**
   * Check if the list is overflowing within the scroll element.
   * @returns {boolean} True if list is overflowing
   */
  #isOverflowing(): boolean {
    return !(
      this.getBoundingClientRect().width - this._inlinePadding <
      this._listWidth
    );
  }

  /**
   * Toggles button visibility determined by scroll position and
   * container width.
   */
  #toggleBtns(): void {
    if (!this._$scrollContainer) return;
    if (this.#isOverflowing()) {
      this._$prevBtn[
        this._$scrollContainer.scrollLeft >= this._toggleBtns
          ? 'removeAttribute'
          : 'setAttribute'
      ]('disabled', '');
      // could use scrollLeftMax but is non-standard
      this._$nextBtn[
        this._$scrollContainer.scrollLeft <
        this._$scrollContainer.scrollWidth - this._$scrollContainer.clientWidth - this._toggleBtns
          ? 'removeAttribute'
          : 'setAttribute'
      ]('disabled', '');
    } else {
      if (this._$scrollContainer.scrollLeft < this._toggleBtns)
        this._$prevBtn.setAttribute('disabled', '');
      // could use scrollLeftMax but is non-standard
      if (
        this._$scrollContainer.scrollLeft > this._$scrollContainer.clientWidth ||
        this._$scrollContainer.clientWidth < this.clientWidth
      )
        this._$nextBtn.setAttribute('disabled', '');
    }
  }

  /**
   * Creates a button with given label and position.
   * @param {string} label `textContent` for the button element
   * @param {InsertPosition} pos The position at which the button element is
   * inserted inside the component (must comply to `insertAdjacentElement`)
   * @returns {HTMLButtonElement}
   */
  #createBtn(label: string, pos: InsertPosition): HTMLButtonElement {
    const btn = document.createElement('button');
    btn.textContent = label;
    btn.dataset.trigger = pos;
    btn.ariaHidden = 'true';
    if (!this.#isOverflowing()) btn.setAttribute('disabled', '');
    this.insertAdjacentElement(pos, btn);
    return btn;
  }

  /**
   * Gets the associated value for the given property
   * @param {CSSStyleDeclaration} styles The element's styles from with the
   * property value should be taken
   * @param {string} property The requested property
   * @returns {string}
   */
  #getStyle(styles: CSSStyleDeclaration, property: string): string {
    return styles.getPropertyValue(property);
  }

  /**
   * Removes the 'px' suffix of strings and converts to number.
   * @param {string} str The string to convert
   * @returns {number}
   */
  #pxStr2Num(str: string): number {
    return Number(str.slice(0, -2));
  }
}

customElements.define(LFPScrollNav.elementName, LFPScrollNav);