/**
 * This class creates a comprehensive table of contents from a list of given
 * headings found in the document. The ToC can be updated during runtime through
 * listening to the `lfp:update-toc` event on the document root.
 */
class LFPToc extends HTMLElement {
  private maxLevel: number;
  private readonly minLevel: number;
  private headings: NodeListOf<HTMLHeadingElement>;
  constructor() {
    super();
    this.maxLevel = this.#isValidAttr('max-level', true) ?
      Number(this.getAttribute('max-level')) : 2;
    this.minLevel = this.#isValidAttr('min-level', true) ?
      Number(this.getAttribute('min-level')) : 6;
    this.headings = this.#collectHeadings();
  }

  connectedCallback() {
    document.addEventListener(
      'DOMContentLoaded', this.#createToC.bind(this)
    );

    document.addEventListener(
      'lfp:update-toc', this.#createToC.bind(this)
    );

    if (this.#isValidAttr('mark-current', true)) {
      this.#setupObserver();
    }
  }

  /**
   * `element.getAttribute()` returns the factual value the element's attribute
   * actually has. This means that it returns a truish empty string if the
   * attribute is present but there is no value given. If you want to verify that
   * there is a value (because your component depends on it) you have to actively
   * check for this, too. This function offers a short-hand for this process.
   * @param {string} attr the attribute's name
   * @param {boolean} bool flag if you expect the attribute to function as a
   * boolean indicator, i.e., the attribute does not need a value and this
   * function is only checking if the attribute is present on the element at all
   * @returns {boolean}
   */
  #isValidAttr(attr: string, bool = false): boolean {
    let val = this.getAttribute(attr);
    if (bool) {
      return val !== null;
    } else {
      return val !== '' || val !== null;
    }
  }

  #setupObserver() {
    const observer = new IntersectionObserver(entries => {
      if (entries.length === 0) {
        this.headings.forEach(h => {
          this.querySelector(`a[href="${h.id}"]`)?.classList.remove('current-heading');
        });
      }
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        this.headings.forEach(heading => {
          let tocItem = this.querySelector(`a[href="#${heading.id}"]`);
          if (!tocItem) return;
          tocItem.classList[
            entry.target.id === heading.id ? 'add' : 'remove'
          ]('current-heading');
        });
      });
    }, {
      root: document,
      rootMargin: `0px 0px -${window.innerHeight * 0.4}px 0px`,
    });

    this.headings.forEach(heading => observer.observe(heading));
  }

  /**
   * @throws Searches the specified 
   */
  #createToC() {
    if (this.headings.length === 0) throw ReferenceError(`No headings with specified levels between h${this.maxLevel} and h${this.minLevel} found.`);
    
    if (this.#isValidAttr('set-id', true)) this.#setId(this.headings);

    this.replaceChildren(this.#createListElement(this.headings, 0)[0]);
  }

  #collectHeadings() {
    const root = (this.#isValidAttr('toc-root') && document.querySelector(this.getAttribute('toc-root')!)) || document;
    
    return root.querySelectorAll<HTMLHeadingElement>(
      this.minLevel === 0 && this.maxLevel === 0 && this.#isValidAttr('add-items') ? this.getAttribute('add-items')! : this.#createSelectorStr()
    );
  }

  #setId(headings: NodeListOf<HTMLHeadingElement>) {
    let ids: Record<string, number> = {};
    headings.forEach(heading => {
      if (!heading.textContent || heading.id !== '') return;
      let id = heading.textContent
        .replaceAll(' ', '-')
        .toLowerCase();
      ids[id] = ids[id] ? ids[id] + 1 : 1;
      heading.id = ids[id] > 1 ? `${id}-${ids[id]}` : id;
    });
  }

  /**
   * Creates a valid selector string from a range of numbers to gather a
   * NodeList of headings of the document
   * @returns {string} the combined heading elements as valid css selector
   * @throws {RangeError} Trys to create an array created with min and max
   * values as lower and upper bounds, throws if the resulting array is not
   * viable.
   */
  #createSelectorStr(): string {
    try {
      return Array(this.minLevel - this.maxLevel)
      .fill(this.maxLevel)
      .reduce((acc, cv, idx, arr) => {
        return acc += `h${cv + idx + 1}${arr.length - 1 !== idx ? ',' : ''}`
      }, `h${this.maxLevel}${this.minLevel !== this.maxLevel ? ',' : ''}`)
      .concat(this.#isValidAttr('add-items') ? `${this.getAttribute('add-items')}` : '');
    } catch {
      throw RangeError('`min-level` has to be larger than `max-level`');
    }
  }

  /**
   * Creates the content for the ToC by iterating recursively over all given headings
   * @param {NodeListOf<HTMLHeadingElement>} headings a NodeList of heading
   * elements to be included in the table of content
   * @param {number} idx the starting point at which to enter the node list
   * @returns an array with the created list element (`HTMLOListElement` or
   * `HTMLUListElemnet`) at index 0 and the current iteration's index at index 1
   */
  #createListElement(headings: NodeListOf<HTMLHeadingElement>, idx: number) {
    const getLevel = (h: HTMLHeadingElement | undefined) => Number(h?.tagName[1]);
    const isAlone = () => {
      let alone = true;
      [...headings].slice(idx).find((_, i) => {
        if (getLevel(headings[idx]) === getLevel(headings[idx + i + 1])) alone = false;
        return getLevel(headings[idx]) >= getLevel(headings[idx + i + 1]);
      });
      return alone;
    }

    let list = document.createElement(
      isAlone() || this.#isValidAttr('no-numeration', true) ? 'ul' : 'ol'
    );
    
    while (idx < headings.length) {
      if (getLevel(headings[idx]) < this.maxLevel) {
        this.maxLevel--;
        break;
      }
      
      let li = document.createElement('li');
      li.innerHTML = `<a href="#${headings[idx]!.id}">${headings[idx]!.textContent}</a>`;
      
      idx++;

      if (getLevel(headings[idx]) > this.maxLevel) {
        this.maxLevel = getLevel(headings[idx]);
        let subList: HTMLOListElement | HTMLUListElement;
        [subList, idx] = this.#createListElement(headings, idx);
        li.append(subList);
      }
      
      list.append(li);
    }

    return [list, idx] as const;
  }
}

customElements.define('lfp-toc', LFPToc);