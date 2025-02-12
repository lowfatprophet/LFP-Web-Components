import { addStylesheet } from './utilities.js';
/**
 * Enhance your headings with automatic link insertion.
 *
 * @attr {string} link-symbol - Specify the symbol that should prefix the
 * heading itself.
 * @attr {boolean} link-all - Set to `true` if the entire heading should
 * be embedded in an anchor-element (be a link).
 * @attr {boolean} symbol-hidden - Set to `true` if the symbol prefixing the
 * heading should not be visible (use this attribute instead of passing an empty
 * string to `link-symbol` as `symbol-hidden` affects default styling as well)
 *
 * @example
 * ```html
 * <lfp-h link-symbol="§" link-all>
 *   <h2>Welcome to the Jungle</h2>
 * </lfp-h>
 * ```
 */
export default class LFPHeading extends HTMLElement {
    constructor() {
        super();
        let heading = this.children[0];
        if (!heading)
            return;
        let id = heading.id === '' ? heading.textContent?.replaceAll(' ', '-').toLowerCase() : heading.id;
        if (!id)
            return;
        addStylesheet(/* css */ `lfp-h {
      --_indent: 0.875rem;
      display: block;
      
      &[link-symbol] {
        &[link-all] a,
        &:not([link-all]) {
          display: grid;
          grid-template-columns: var(--_indent) 1fr;
          align-items: baseline;
          margin-inline-start: calc(-1 * var(--_indent));
        }
      }

      &[symbol-hidden] {
        .link-symbol {
          text-decoration: none;
          /* The following styles are include, because "visibility: hidden/visible" would make the link inaccessible for keyboard users (tabbing through the page would not detect this link). Would this be actually a good thing? I don't know. */
          inline-size: 1px;
          block-size: 1px;
          margin: -1px;
          clip: (0, 0, 0, 0);
          overflow: hidden;

          &:hover { text-decoration: underline; }
        }

        &:is(:hover, :focus, :focus-within) .link-symbol {
          inline-size: auto;
          block-size: auto;
          margin: initial;
          clip: auto;
          overflow: auto;
        }
      }
    }`);
        /** @internal */
        heading.id = id;
        let link = document.createElement('a');
        let symbol;
        if (this.hasAttribute('link-symbol')) {
            let arg = !!this.getAttribute('link-symbol');
            symbol = arg ? this.getAttribute('link-symbol') : '#';
        }
        if (this.hasAttribute('link-all')) {
            link.append(heading);
            if (this.hasAttribute('link-symbol')) {
                let span = document.createElement('span');
                span.textContent = symbol;
                span.classList.add('link-symbol');
                link.prepend(span);
            }
        }
        else if (this.hasAttribute('link-symbol')) {
            link.textContent = symbol;
            link.classList.add('link-symbol');
        }
        /** @internal */
        link.href = `#${id}`;
        this.prepend(link);
    }
}
customElements.define('lfp-h', LFPHeading);
