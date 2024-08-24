import { addStylesheet } from "./utilities.js";

interface LFPToastEvent extends CustomEvent {
  detail: {
    title?: string;
    description: string;
    dismissable?: boolean;
  },
}

// interface GlobalEventHandlersEventMap {
//   'lfp:toast': LFPToastEvent,
// }

const SHEET = `@layer lfp {
  lfp-toast {
    ul {
      box-sizing: border-box;
      list-style: none;
      position: fixed;
      bottom: 1rem;
      left: 1rem;
      display: flex;
      flex-direction: column-reverse;
      gap: 1rem;
      max-width: min(65ch, calc(100% - 2rem));
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
          width: 20px;
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
  }
}`;

export default class LFPToast extends HTMLElement {
  ul = document.createElement('ul');
  delay = Number(this.getAttribute('close-delay') ?? 4000);
  dismissable = !!this.getAttribute('close-button');
  animationDelay: number;
  constructor() {
    super();

    addStylesheet(SHEET);

    this.setAttribute('role', 'alert');
    this.append(this.ul);

    this.animationDelay = Number(this.getAttribute('animation-delay')) ?? 0;
  }

  connectedCallback() {
    document.addEventListener('lfp:toast', this);
  }

  handleEvent(event: LFPToastEvent) {
    if (!event.detail.description) return;
    let toast = document.createElement('li');
    toast.setAttribute('role', 'status');

    let description = document.createElement('span');

    this.ul.prepend(toast);
    
    setTimeout(() => {
      if (event.detail.title) {
        // conditionally add title
        let title = document.createElement('span');
        toast.append(title);
        title.textContent = event.detail.title;
      }

      toast.append(description);
      description.textContent = event.detail.description;

      if (this.dismissable || event.detail.dismissable) {
        let closeBtn = document.createElement('button');
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
   * @param {String}  description         Text to describe what the user is informed about (keep it short!)
   * @param {String?} title               An optional title for the toast.
   * @param {Boolean} [dismissable=false] Toggle if the dismissable with a close button.
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