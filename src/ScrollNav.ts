class ScrollNavComponent extends HTMLElement {
  _$list!: HTMLUListElement | null;
  _listWidth!: number;
  inlinePadding!: number;
  prevBtn!: HTMLButtonElement;
  nextBtn!: HTMLButtonElement;
  connectedCallback() {
    const getStyle =
      (styles: CSSStyleDeclaration, value: string) => styles.getPropertyValue(value);
    const pxStr2Num = (str: string) => Number(str.slice(0, -2));

    // check for `ul` element and bail early if not found
    this._$list = this.querySelector("ul");
    if (!this._$list) return;

    // add styles with JavaScript for non-JS compatibility
    const styles = new CSSStyleSheet();
    styles.replaceSync(/* css */ `scroll-nav ul {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none; /* IE 10+ */
      &::-webkit-scrollbar {
        /* Chromium/Safari */
        height: 0px;
        background: transparent;
      }
    }`);
    document.adoptedStyleSheets.push(styles);

    // set up layout
    this._listWidth = this._$list.getBoundingClientRect().width;
    const computedStyles = getComputedStyle(this);
    this.inlinePadding =
      pxStr2Num(getStyle(computedStyles, "padding-inline-start")) +
      pxStr2Num(getStyle(computedStyles, "padding-inline-end"));
    this.prevBtn = this.#createBtn(
      this.getAttribute("previous-text") || "❮",
      "afterbegin"
    );
    this.nextBtn = this.#createBtn(
      this.getAttribute("next-text") || "❯",
      "beforeend"
    );

    // initialize button layout
    this.#toggleBtns();

    // start listening
    window.addEventListener("resize", this);
    this._$list.addEventListener("scroll", this);
    this.addEventListener("click", this);
  }

  disconnectedCallback() {
    window.removeEventListener("resize", this);
  }

  handleEvent(event: Event) {
    switch (event.type) {
      case "resize":
      case "scroll":
        // toggle button visibility on window resize and list scroll
        this.#toggleBtns();
        break;
      case "click":
        // listen for button clicks
        const btn = (event.target as Element | null)?.closest("[data-trigger]");
        if (!btn) return;
        this._$list!.scroll(
          this._$list!.scrollLeft +
            this._$list!.clientWidth * (btn === this.firstElementChild ? -1 : 1),
          0
        );
        break;
    }
  }

  /**
   * Check if the list is overflowing within the scroll element.
   * @returns {boolean} True if list is overflowing
   */
  #isOverflowing() {
    return !(
      this.getBoundingClientRect().width - this.inlinePadding <
      this._listWidth
    );
  }

  /**
   * Toggles button visibility determined by scroll position and
   * container width.
   */
  #toggleBtns() {
    if (this.#isOverflowing()) {
      this.prevBtn[
        this._$list!.scrollLeft >= 10 ? "removeAttribute" : "setAttribute"
      ]("hidden", "");
      // could use scrollLeftMax but is non-standard
      this.nextBtn[
        this._$list!.scrollLeft <
        this._$list!.scrollWidth - this._$list!.clientWidth - 10
          ? "removeAttribute"
          : "setAttribute"
      ]("hidden", "");
    } else {
      if (this._$list!.scrollLeft < 10) this.prevBtn.setAttribute("hidden", "");
      // could use scrollLeftMax but is non-standard
      if (
        this._$list!.scrollLeft > this._$list!.clientWidth ||
        this._$list!.clientWidth < this.clientWidth
      )
        this.nextBtn.setAttribute("hidden", "");
    }
  }

  /**
   * Creates a button with given label and position.
   * @param label {string} `textContent` for the button element
   * @param pos {string} The position at which the button element is inserted inside the component (must comply to `insertAdjacentElement`)
   * @returns {HTMLButtonElement}
   */
  #createBtn(label: string, pos: InsertPosition) {
    const btn = document.createElement("button");
    btn.textContent = label;
    btn.dataset.trigger = pos;
    if (!this.#isOverflowing()) btn.setAttribute("hidden", "");
    this.insertAdjacentElement(pos, btn);
    return btn;
  }
}

customElements.define("scroll-nav", ScrollNavComponent);
