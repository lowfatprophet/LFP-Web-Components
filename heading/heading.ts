class LFPHeading extends HTMLElement {
  constructor() {
    super();

    let heading = this.children[0];
    
    if (!heading) return;
    
    let id = heading.id === '' ? heading.textContent?.replaceAll(' ', '-').toLowerCase() : heading.id;

    if (!id) return;

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