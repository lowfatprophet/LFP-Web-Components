import { addStylesheet } from './utilities.js';

const SHEET = `@layer lfp {
  lfp-h {
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
        width: 1px;
        height: 1px;
        margin: -1px;
        clip: (0, 0, 0, 0);
        overflow: hidden;

        &:hover { text-decoration: underline; }
      }

      &:is(:hover, :focus, :focus-within) .link-symbol {
        width: auto;
        height: auto;
        margin: initial;
        clip: auto;
        overflow: auto;
      }
    }
  }
}`;

export default class LFPHeading extends HTMLElement {
  constructor() {
    super();

    let heading = this.children[0];
    
    if (!heading) return;
    
    let id = heading.id === '' ? heading.textContent?.replaceAll(' ', '-').toLowerCase() : heading.id;

    if (!id) return;

    addStylesheet(SHEET);

    heading.id = id;

    let link = document.createElement('a');

    let symbol: string | undefined;
    if (this.hasAttribute('link-symbol')) {
      let arg = !!this.getAttribute('link-symbol');
      symbol = arg ? this.getAttribute('link-symbol')! : '#';
    }
    
    if (this.hasAttribute('link-all')) {
      link.append(heading);
      if (this.hasAttribute('link-symbol')) {
        let span = document.createElement('span');
        span.textContent = symbol!;
        span.classList.add('link-symbol');
        link.prepend(span);
      }
    } else if (this.hasAttribute('link-symbol')) {
      link.textContent = symbol!;
      link.classList.add('link-symbol');
    }

    link.href = `#${id}`;
    this.prepend(link);
  }
}

customElements.define('lfp-h', LFPHeading);