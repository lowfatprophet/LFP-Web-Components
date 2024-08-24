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

class LFPToast extends HTMLElement {
  ul = document.createElement('ul');
  delay = Number(this.getAttribute('close-delay') ?? 4000);
  dismissable = !!this.getAttribute('close-button');
  animationDelay: number;
  constructor() {
    super();

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