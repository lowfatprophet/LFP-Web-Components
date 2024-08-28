/**
 * A a11y conform simple and easy to customize disclosure component.
 * 
 *  * @example
 * ```html
 * <lfp-disclosure>
 *   <button trigger>Click to reveal</button>
 *   <p content>
 *     If the component instantiates successfully this text is hidden.<br>
 *     If it fails to instantiate, the content is visible as a fallback
 *   </p>
 * </lfp-disclosure>
 * ```
 */
export default class LFPDisclosure extends HTMLElement {
  /**
   * @prop {HTMLButtonElement|null} trigger - The element that toggles the
   * component's visibility state. Is `null` if `[trigger]` is not found inside
   * the web component.
   */
  trigger: HTMLButtonElement | null;
  /**
   * @prop {HTMLElement|null} content - The element that holds the component's
   * main content. Is `null` if `[content]` is not found inside
   * the web component.
   */
  content: HTMLElement | null;
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
}

customElements.define('lfp-disclosure', LFPDisclosure);