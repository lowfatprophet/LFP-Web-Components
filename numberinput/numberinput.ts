class LFPNumberInput extends HTMLElement {
  input: HTMLInputElement | null;
  decrementButton: HTMLButtonElement | undefined;
  incrementButton: HTMLButtonElement | undefined;
  constructor() {
    super();

    this.input = this.querySelector('input[type="number"]');

    if (!this.input) return;

    this.decrementButton = this.#createButton('-');
    this.incrementButton = this.#createButton('+');

    this.insertBefore(this.decrementButton, this.input);
    this.input.after(this.incrementButton);

    this.#clickAndHold(this.decrementButton, () => {
      let currentVal = this.input!.value;
      this.input!.value = (Number(currentVal) - 1).toString();
    });

    this.#clickAndHold(this.incrementButton, () => {
      let currentVal = this.input!.value;
      this.input!.value = (Number(currentVal) + 1).toString();
    });
  }

  #createButton(text: string) {
    let button = document.createElement('button');
    button.textContent = text;
    return button;
  }

  #clickAndHold(btnEl: HTMLButtonElement, callback: CallableFunction) {
    let intervalId: number;
    let timeoutId: number;
    const DURATION = 100;
    const DELAY = 50;

    // handle when clicking down
    const onMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      callback();

      timeoutId = setTimeout(() => {
        intervalId = setInterval(() => {
          callback();
        }, DURATION);
      }, DELAY);
    };

    // stop or clear interval
    const clearTimer = (e: MouseEvent) => {
      e.preventDefault();
      if (intervalId) clearInterval(intervalId);
      if (timeoutId) clearTimeout(timeoutId);
    };

    // handle when mouse is clicked
    btnEl.addEventListener('mousedown', onMouseDown);
    // handle when mouse is raised
    btnEl.addEventListener('mouseup', clearTimer);
    // handle mouse leaving the clicked button
    btnEl.addEventListener('mouseout', clearTimer);
  }
}

customElements.define('lfp-numberinput', LFPNumberInput);