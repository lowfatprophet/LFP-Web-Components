customElements.define('lfp-disclosure', class extends HTMLElement {
  trigger: HTMLButtonElement | null;
  content: HTMLElement | null;
  /**
   * Instantiate Disclosure web component
   */
  constructor() {
    super();

    this.trigger = this.querySelector('[trigger]');
    this.content = this.querySelector('[content]');
    if (!this.trigger || !this.content) return;

    // Setup
    this.trigger.removeAttribute('hidden');
    this.trigger.setAttribute('aria-expanded', 'false');
    this.content.setAttribute('hidden', '');

    // Interactivity
    this.trigger.addEventListener('click', this);
  }

  /**
   * Handle click events
   * @param event The event object
   */
  handleEvent(event: Event) {
    event.preventDefault();

    if (!this.trigger || !this.content) return;

    if (this.trigger.getAttribute('aria-expanded') === 'true') {
      this.trigger.setAttribute('aria-expanded', 'false');
      this.content.setAttribute('hidden', '');
    } else {
      this.trigger.setAttribute('aria-expanded', 'true');
      this.content.removeAttribute('hidden');
    }
  }
});