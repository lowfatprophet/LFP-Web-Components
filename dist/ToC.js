import { addStylesheet } from "./utilities.js";
const SHEET = `@layer lfp {
  lfp-toc {
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
  }
}`;
export default class LFPToC extends HTMLElement {
    maxLevel;
    minLevel;
    headings;
    constructor() {
        super();
        this.maxLevel = this.#isValidAttr('max-level', true) ?
            Number(this.getAttribute('max-level')) : 2;
        this.minLevel = this.#isValidAttr('min-level', true) ?
            Number(this.getAttribute('min-level')) : 6;
        this.headings = this.#collectHeadings();
        addStylesheet(SHEET);
    }
    connectedCallback() {
        document.addEventListener('DOMContentLoaded', this.#createToC.bind(this));
        document.addEventListener('lfp:update-toc', this.#createToC.bind(this));
        if (this.#isValidAttr('mark-current', true)) {
            this.#setupObserver();
        }
    }
    #isValidAttr(attr, bool = false) {
        let val = this.getAttribute(attr);
        if (bool) {
            return val !== null;
        }
        else {
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
                if (!entry.isIntersecting)
                    return;
                this.headings.forEach(heading => {
                    let tocItem = this.querySelector(`a[href="#${heading.id}"]`);
                    if (!tocItem)
                        return;
                    tocItem.classList[entry.target.id === heading.id ? 'add' : 'remove']('current-heading');
                });
            });
        }, {
            root: document,
            rootMargin: `0px 0px -${window.innerHeight * 0.4}px 0px`,
        });
        this.headings.forEach(heading => observer.observe(heading));
    }
    #createToC() {
        if (this.headings.length === 0)
            throw ReferenceError(`No headings with specified levels between h${this.maxLevel} and h${this.minLevel} found.`);
        if (this.#isValidAttr('set-id', true))
            this.#setId(this.headings);
        let list = this.#createListElement(this.headings, 0)[0];
        list.ariaDescription = 'Table of Contents';
        this.replaceChildren(list);
    }
    #collectHeadings() {
        const root = (this.#isValidAttr('toc-root') && document.querySelector(this.getAttribute('toc-root'))) || document;
        return root.querySelectorAll(this.minLevel === 0 && this.maxLevel === 0 && this.#isValidAttr('add-items') ? this.getAttribute('add-items') : this.#createSelectorStr());
    }
    #setId(headings) {
        let ids = {};
        headings.forEach(heading => {
            if (!heading.textContent || heading.id !== '')
                return;
            let id = heading.textContent
                .replaceAll(' ', '-')
                .toLowerCase();
            ids[id] = ids[id] ? ids[id] + 1 : 1;
            heading.id = ids[id] > 1 ? `${id}-${ids[id]}` : id;
        });
    }
    #createSelectorStr() {
        try {
            return Array(this.minLevel - this.maxLevel)
                .fill(this.maxLevel)
                .reduce((acc, cv, idx, arr) => {
                return acc += `h${cv + idx + 1}${arr.length - 1 !== idx ? ',' : ''}`;
            }, `h${this.maxLevel}${this.minLevel !== this.maxLevel ? ',' : ''}`)
                .concat(this.#isValidAttr('add-items') ? `${this.getAttribute('add-items')}` : '');
        }
        catch {
            throw RangeError('`min-level` has to be larger than `max-level`');
        }
    }
    #createListElement(headings, idx) {
        const getLevel = (h) => Number(h?.tagName[1]);
        const isAlone = () => {
            let alone = true;
            [...headings].slice(idx).find((_, i) => {
                if (getLevel(headings[idx]) === getLevel(headings[idx + i + 1]))
                    alone = false;
                return getLevel(headings[idx]) >= getLevel(headings[idx + i + 1]);
            });
            return alone;
        };
        let list = document.createElement(isAlone() || this.#isValidAttr('no-numeration', true) ? 'ul' : 'ol');
        while (idx < headings.length) {
            if (getLevel(headings[idx]) < this.maxLevel) {
                this.maxLevel--;
                break;
            }
            let li = document.createElement('li');
            li.innerHTML = `<a href="#${headings[idx].id}">${headings[idx].textContent}</a>`;
            idx++;
            if (getLevel(headings[idx]) > this.maxLevel) {
                this.maxLevel = getLevel(headings[idx]);
                let subList;
                [subList, idx] = this.#createListElement(headings, idx);
                li.append(subList);
            }
            list.append(li);
        }
        return [list, idx];
    }
}
customElements.define('lfp-toc', LFPToC);
