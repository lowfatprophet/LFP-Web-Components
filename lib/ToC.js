import { addStylesheet, isValidAttr } from "./utilities.js";
/**
 * This class creates a comprehensive table of contents from a list of given
 * headings found in the document. The ToC can be updated during runtime through
 * listening to the `lfp:update-toc` event on the document root.
 * @attr {number} min-level - Set the lowest hierarchy of headings included in
 * the ToC, defaults to 6 (e.g., includes all headings up to and including `h6`).
 * @attr {number} max-level - Set the highest hierarchy of headings included in
 * the ToC, defaults to 2 (e.g., includes all headings up to and including `h2`).
 * @attr {boolean} set-id - IDs are needed when you want to link to the headings
 * gathered in the ToC. If `set-id` is set, the component creates IDs for every
 * heading that does not yet have one.
 * @attr {string} toc-root - By default, the component searches the entire
 * document for headings. If you want to focus the table of content on specific
 * parts of your site, pass a valid CSS selector to this attribute.
 * @attr {string} add-items - By default, the component looks for
 * HTMLHeadingElements only. If you want to add other items that qualify as
 * ToC items, provide a list of valid CSS selectors.
 * **Note**: if `min-level` and `max-level` are both set to `0` and `add-items`
 * is set with a valid list of selectors, only these will get added to the ToC.
 * @attr {boolean} no-numeration - By default, the component enumerates the
 * ToC's entries (e.g., creates `HTMLOListElement`s). If you do not want
 * enumerated entries (e.g., `HTMLUListElement`), set this attribute.
 * @example
 * ```html
 * <lfp-toc
 *   min-level="5"
 *   max-level="3"
 *   toc-root="main"
 *   add-items="dl,summary"
 *   no-numeration
 *   set-id
 * ></lfp-toc>
 * ```
 */
export default class LFPToC extends HTMLElement {
    /** @internal */
    maxLevel;
    /** @internal */
    minLevel;
    /** @internal */
    headings;
    constructor() {
        super();
        this.maxLevel = isValidAttr('max-level', this, true) ?
            Number(this.getAttribute('max-level')) : 2;
        this.minLevel = isValidAttr('min-level', this, true) ?
            Number(this.getAttribute('min-level')) : 6;
        this.headings = this.#collectHeadings();
        addStylesheet(/* css */ `lfp-toc {
      ol {
        list-style-type: none;
        counter-reset: item;
        margin: 0;
        padding: 0;

        & > li {
          display: table;
          counter-increment: item;
        }

        & > li::before {
          content: counters(item, ".") ". ";
          display: table-cell;
          padding-inline-end: 0.6em;
        }
      }

      li ol > li::before { content: counters(item, ".") " "; }
    }`);
    }
    connectedCallback() {
        document.addEventListener('DOMContentLoaded', this.#createToC.bind(this));
        document.addEventListener('lfp:update-toc', this.#createToC.bind(this));
        if (isValidAttr('mark-current', this, true))
            this.#setupObserver();
    }
    #setupObserver() {
        const observer = new IntersectionObserver(entries => {
            if (entries.length === 0) {
                for (const h of this.headings) {
                    this.querySelector(`a[href="${h.id}"]`)?.classList.remove('current-heading');
                }
            }
            for (const entry of entries) {
                if (!entry.isIntersecting)
                    return;
                for (const heading of this.headings) {
                    const tocItem = this.querySelector(`a[href="#${heading.id}"]`);
                    if (!tocItem)
                        return;
                    tocItem.classList[entry.target.id === heading.id ? 'add' : 'remove']('current-heading');
                }
            }
        }, {
            root: document,
            rootMargin: `0px 0px -${window.innerHeight * 0.4}px 0px`,
        });
        for (const heading of this.headings) {
            observer.observe(heading);
        }
    }
    /**
     * @throws {ReferenceError} Checks if `this.headings` has any entry, and backs
     * out of the function if the node list is empty. The reason for this is that
     * most likely either `maxLevel` or `minLevel` are configured with wrong values
     * or that no headings are found on the current page. In either case, creating
     * the ToC makes no sense, thus throwing an error.
     */
    #createToC() {
        if (this.headings.length === 0)
            throw ReferenceError(`No headings with specified levels between h${this.maxLevel} and h${this.minLevel} found.`);
        if (isValidAttr('set-id', this, true))
            this.#setId(this.headings);
        const list = this.#createListElement(this.headings, 0)[0];
        list.ariaDescription = 'Table of Contents';
        this.replaceChildren(list);
    }
    #collectHeadings() {
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        const root = (isValidAttr('toc-root', this) && document.querySelector(this.getAttribute('toc-root'))) || document;
        return root.querySelectorAll(
        // biome-ignore lint/style/noNonNullAssertion: <explanation>
        this.minLevel === 0 && this.maxLevel === 0 && isValidAttr('add-items', this) ? this.getAttribute('add-items') : this.#createSelectorStr());
    }
    #setId(headings) {
        const ids = {};
        for (const heading of headings) {
            if (!heading.textContent || heading.id !== '')
                continue;
            const id = heading.textContent
                .replaceAll(' ', '-')
                .toLowerCase();
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            ids[id] = id in ids ? ids[id] + 1 : 1;
            // biome-ignore lint/style/noNonNullAssertion: <explanation>
            heading.id = id in ids && ids[id] > 1 ? `${id}-${ids[id]}` : id;
        }
    }
    /**
     * Creates a valid selector string from a range of numbers to gather a
     * NodeList of headings of the document.
     * @returns {string} The combined heading elements as valid css selector.
     * @throws {RangeError} Trys to create an array created with min and max
     * values as lower and upper bounds, throws if the resulting array is not
     * viable.
     */
    #createSelectorStr() {
        try {
            return Array(this.minLevel - this.maxLevel)
                .fill(this.maxLevel)
                .reduce((acc, cv, idx, arr) => {
                return `${acc}h${cv + idx + 1}${arr.length - 1 !== idx ? ',' : ''}`;
            }, `h${this.maxLevel}${this.minLevel !== this.maxLevel ? ',' : ''}`)
                .concat(isValidAttr('add-items', this) ? `${this.getAttribute('add-items')}` : '');
        }
        catch {
            throw RangeError('`min-level` has to be larger than `max-level`');
        }
    }
    /**
     * Creates the content for the ToC by iterating recursively over all given headings
     * @param {NodeListOf<HTMLHeadingElement>} headings A NodeList of heading
     * elements to be included in the table of content.
     * @param {number} idx The starting point at which to enter the node list.
     * @returns An array with the created list element (`HTMLOListElement` or
     * `HTMLUListElemnet`) at index 0 and the current iteration's index at index 1.
     */
    #createListElement(headings, idx) {
        let index = idx;
        const getLevel = (h) => Number(h?.tagName[1]);
        const isAlone = () => {
            let alone = true;
            [...headings].slice(index).find((_, i) => {
                if (getLevel(headings[index]) === getLevel(headings[index + i + 1]))
                    alone = false;
                return getLevel(headings[index]) >= getLevel(headings[index + i + 1]);
            });
            return alone;
        };
        const list = document.createElement(isAlone() || isValidAttr('no-numeration', this, true) ? 'ul' : 'ol');
        while (index < headings.length) {
            if (getLevel(headings[index]) < this.maxLevel) {
                this.maxLevel--;
                break;
            }
            const li = document.createElement('li');
            li.innerHTML = `<a href="#${headings[index]?.id}">${headings[index]?.textContent}</a>`;
            index++;
            if (getLevel(headings[index]) > this.maxLevel) {
                this.maxLevel = getLevel(headings[index]);
                let subList;
                [subList, index] = this.#createListElement(headings, index);
                li.append(subList);
            }
            list.append(li);
        }
        return [list, index];
    }
}
customElements.define('lfp-toc', LFPToC);
