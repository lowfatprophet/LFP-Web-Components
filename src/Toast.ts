import { addStylesheet, isValidAttr } from "./utilities.js";

export interface LFPToastEvent extends CustomEvent {
  detail: {
    title?: string;
    description: string;
    dismissable?: boolean;
  },
}

/**
 * @attr {number} close-delay - Specify how long the toast should be visible on
 * screen in milliseconds. Defaults to 4000.
 * @attr {boolean} close-button - Specify whether the toast element should be 
 * dismissable. If set to `true`, a button is appended to the toast allowing
 * the user to remove the toast from the view.
 * @attr {number} animation-delay - Specify how long the 
 */
export default class LFPToast extends HTMLElement {
  /** @internal */
  ul = document.createElement('ul');
  /** @internal */
  delay = Number(this.getAttribute('close-delay') ?? 4000);
  /** @internal */
  dismissable = isValidAttr('close-button', this, true);
  /** @internal */
  animationDelay: number;
  constructor() {
    super();

    addStylesheet(/* css */  `lfp-toast {
      ul {
        box-sizing: border-box;
        list-style: none;
        position: fixed;
        bottom: 1rem;
        inset-inline-start: 1rem;
        display: flex;
        flex-direction: column-reverse;
        gap: 1rem;
        max-inline-size: min(65ch, calc(100% - 2rem));
        margin: 0;
        padding: 0;
        font-size: 0.875rem;
        hyphens: auto;
        overflow: auto;
        z-index: 999;
  
        li {
          animation: toast-blend paused 1000ms ease-in-out;
          flex-grow: 0;
          display: grid;
          gap: 0.125em 0.25rem;
          align-self: first baseline;
          margin: 0;
          padding: 1rem;
          border-radius: 2px;
          background-color: oklch(33.29% 0 0);
          color: oklch(94.91% 0 0);
  
          span {
            &:first-of-type {
              grid-row: 1;
              font-size: 0.75em;
              text-transform: uppercase;
            }
  
            &:last-of-type {
              grid-row: 2;
            }
          }
  
          button {
            grid-row: 1 / 3;
            align-self: center;
            block-size: 20px;
            aspect-ratio: 1;
            padding: 0.75rem;
            border: none;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 16 16"><path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/></svg>');
            background-color: transparent;
            background-position: center;
            background-repeat: no-repeat;
            cursor: pointer;
          }
        }
      }
    }
  
    @keyframes toast-blend {
      100% {
        opacity: 0;
      }
    }`);

    this.setAttribute('role', 'alert');
    this.append(this.ul);

    this.animationDelay = Number(this.getAttribute('animation-delay')) ?? 0;
  }

  connectedCallback() {
    document.addEventListener('lfp:toast', this);
  }

  handleEvent(event: LFPToastEvent) {
    if (!event.detail.description) return;
    const toast = document.createElement('li');
    toast.setAttribute('role', 'status');

    const description = document.createElement('span');

    this.ul.prepend(toast);
    
    setTimeout(() => {
      if (event.detail.title) {
        const title = document.createElement('span');
        toast.append(title);
        title.textContent = event.detail.title;
      }

      toast.append(description);
      description.textContent = event.detail.description;

      if (this.dismissable || event.detail.dismissable) {
        const closeBtn = document.createElement('button');
        closeBtn.setAttribute('aria-label', 'dismiss status message');
        closeBtn.addEventListener('click', () => this.#remove(closeBtn.parentElement));
        toast.append(closeBtn);
      }
    }, 1);

    setTimeout(() => this.#remove(toast), this.delay);
  }

  #remove(element: ChildNode | HTMLElement | null) {
    if (!element) return;
    if (this.animationDelay) (element as HTMLElement).style.animationPlayState = 'play';
    setTimeout(() => element.remove(), this.animationDelay);
  }

  /**
   * Emits a signal that is catched by the toast component to give out a toast.
   * Keep in mind, that in order to use this static method, you have to import
   * the base class for the toast component into your project.
   * 
   * @param {string} description Text to describe what the user is informed
   * about (keep it short!)
   * @param {string?} title An optional title for the toast.
   * @param {boolean} [dismissable=false] Toggle if the dismissable with a close button.
   * @example
   * ```js
   * import LFPToast from 'lfp-wc/Toast';
   * LFPToast.emit('Toast description', 'Toast title', true);
   * ```
   */
  static emit(description: string, title: string, dismissable = false) {
    document.dispatchEvent(new CustomEvent('lfp:toast', {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: { title, description, dismissable }
    }));
  }
}

customElements.define('lfp-toast', LFPToast);