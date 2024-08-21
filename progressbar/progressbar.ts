// extending the events mapping interface to include the custom updating event
interface GlobalEventHandlersEventMap {
  'lfp:progressbar-update': CustomEvent<{ value: number, id: string }>,
}

/**
 * A W3 compliant progress bar web component.
 * https://w3c.github.io/aria/#progressbar
 */
// class LFPProgressbar extends HTMLElement {
//   showValue: boolean;
//   notify = false;
//   min: number;
//   max: number;
//   textLabel: string | null;
//   range = document.createElement('input');
//   constructor() {
//     super();

//     this.showValue = !!this.getAttribute('show-value');
//     this.notify = !!this.getAttribute('aria-notify');
//     this.min = Number(this.getAttribute('progress-min') ?? this.getAttribute('aria-valuemin'));
//     this.max = Number(this.getAttribute('progress-max') ?? this.getAttribute('aria-valuemax'));
//     this.textLabel = this.getAttribute('text-label');

//     if (this.showValue) {
//       let output = document.createElement('div');
//       output.setAttribute('role', 'status');
//       if (this.notify) output.ariaLive = 'polite';
//     }

//     new Map([
//       ['aria-valuemin', this.min.toString()],
//       ['aria-valuemax', this.max.toString()],
//       ['type', 'range'],
//       ['role', 'progressbar'],
//     ]).forEach((val, attr) => this.range.setAttribute(attr, val));

//     // set initial value 
//     this.#setValue(Number(this.getAttribute('progress-now') ?? 0));

//     this.prepend(this.range);
//   }

//   connectedCallback() {
//     document.addEventListener('lfp:progressbar-update', e => {
//       if (e.detail.id.replace('#', '') === this.id) this.#setValue(e.detail.value);
//     });
//   }

//   #setTextLabel(rel: number, abs: number | undefined) {
//     if (!this.textLabel) return;
//     let string = this.textLabel;
//     string = string.replace('${rel}', rel.toString());
//     if (abs) string = string.replace('${abs}', abs.toString());
//     this.range.setAttribute('aria-valuetext', string);
//   }

//   #setValue(value: number, abs = true) {
//     this.range.value = value.toString();
//     this.range.ariaValueNow = value.toString();
    
//     if (this.showValue) this.#setTextLabel(value / this.max, abs ? value : undefined);
//   }

//   static update(id: string, value: number) {
//     let progressbar = document.querySelector(id.startsWith('#') ? 'id' : `#${id}`);
//     if (!progressbar) return;

//     (progressbar as LFPProgressbar).#setValue(value);

//     console.log('bast');
//   }
// }

class LFPProgressbar extends HTMLElement {
  showValue: boolean;
  notify = false;
  min: number;
  max: number;
  textLabel: string | null;
  range = document.createElement('div');
  output: HTMLElement | undefined;
  constructor() {
    super();

    this.showValue = !!this.getAttribute('show-value');
    this.notify = !!this.getAttribute('aria-notify');
    this.min = Number(this.getAttribute('progress-min') ?? this.getAttribute('aria-valuemin'));
    this.max = Number(this.getAttribute('progress-max') ?? this.getAttribute('aria-valuemax'));
    this.textLabel = this.getAttribute('text-label');

    if (this.showValue) {
      this.output = document.createElement('div');
      this.output.setAttribute('role', 'status');
      if (this.notify) this.output.ariaLive = 'polite';
      this.prepend(this.output);
    }

    new Map([
      ['aria-valuemin', this.min.toString()],
      ['aria-valuemax', this.max.toString()],
      ['role', 'progressbar'],
    ]).forEach((val, attr) => this.setAttribute(attr, val));

    this.range.classList.add('range');

    // set initial value 
    this.setValue(Number(this.getAttribute('progress-now') ?? 0));

    this.prepend(this.range);
  }

  connectedCallback() {
    document.addEventListener('lfp:progressbar-update', e => {
      if (e.detail.id.replace('#', '') === this.id) this.setValue(e.detail.value);
    });
  }

  #setTextLabel(rel: number, abs: number | undefined) {
    if (!this.output || !this.textLabel) return;
    let string = this.textLabel;
    string = string.replace('${rel}', rel.toString());
    string = string.replace('${abs}', abs ? abs.toString() : '');
    this.range.setAttribute('aria-valuetext', string);
    this.output.textContent = string;
  }

  setValue(value: number, abs = true) {
    let newValue = value;
    if (abs) newValue /= this.max;
    newValue = Math.min(newValue, 1);
    this.range.style.scale = `${newValue} 1`;
    this.ariaValueNow = value.toString();
    
    if (this.showValue) this.#setTextLabel(
      abs ? this.max / 100 * value : this.max * newValue,
      abs ? newValue : undefined
    );
  }
  
  static update(id: string, value: number) {
    let progressbar = document.querySelector(id.startsWith('#') ? id : `#${id}`);
    if (!progressbar) return;
    
    (progressbar as LFPProgressbar).setValue(value);
  }
}

customElements.define('lfp-progressbar', LFPProgressbar);