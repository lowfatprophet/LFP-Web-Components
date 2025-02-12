import { addStylesheet } from './utilities.js';

export default class LFPGallery extends HTMLElement {
  constructor() {
    super();

    addStylesheet(/* css */`lfp-gallery {
      block-size: max-content;
      inline-size: 100cqw;

      img {
        display: block;
        max-inline-size: 100cqw;
        max-block-size: 100cqh;
        margin-inline: auto;
      }
    }`);

    console.log('Alles fertig!');
  }
}

customElements.define('lfp-gallery', LFPGallery);