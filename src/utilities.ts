export const CSS_LAYER = 'lfp';

/**
 * Class representing a storage interface to save items to window.localStorage
 * or similar structures and retrieve it from there.
 * This class does *not* provide asynchronous functionality.
 */
export class StorageController {
  private readonly storage: StorageFacility;
  private readonly name: string;
  /**
   * 
   * @param {string} name The main key of the structure. The relevant data structure is
   * located on the second level of the storage object.
   * @param {StorageFacility} [storage=window.localStorage] The storage object.
   */
  constructor(name: string, storage = window.localStorage) {
    this.storage = storage;
    this.name = name;

    // create dictionary if not present
    if (!this.storage.getItem(this.name)) {
      this.storage.setItem(this.name, '{}');
    }
  }
  /**
   * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
   */
  #replacer(_: string, value: any): any {
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: [...value]
      };
    } else {
      return value;
    }
  }
  /**
   * https://stackoverflow.com/questions/29085197/how-do-you-json-stringify-an-es6-map
   */
  #reviver(_: string, value: any): any {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }
  /**
   * Adds one of more key/value pairs to the storage object.
   * @param {string} items Map of items to add to the storage
   */
  public save(items: Map<string, any>): void {
    let storage = this.loadAll();
    items.forEach((key, value) => storage.set(key, value));
    this.saveAll(storage);
  }
  /**
   * Returns a specific value to a given key.
   * @param {string} key a key of the storage object
   * @returns {any|undefined} the value behind the key (if existent), otherwise `undefined`
   */
  public load(key: string): any | undefined {
    let value = this.loadAll().get(key);
    if (!value) return;
    return JSON.parse(value, this.#reviver);
  }
  /**
   * Saves a map to the storage object.
   * 
   * **Beware**: `saveAll` overwrites all entries in the storage object. For
   * adding values without overwriting unaffected ones, use `save`.
   * @param {Map<string, any>} input the map to be stored in the storage object
   */
  public saveAll(input: Map<string, any>): void {
    this.storage.setItem(this.name, JSON.stringify(input, this.#replacer));
  }
  /**
   * Returns a map with the entire storage object content.
   * @returns {Map<string, any>}
   */
  public loadAll(): Map<string, any> {
    return JSON.parse(this.storage.getItem(this.name) ?? '{}', this.#reviver);
  }
}

/**
 * Wraps the given string of CSS settings with the 
 * @param {string} styles String of valid CSS settings.
 * @param {string} [layer=CSS_LAYER] The CSS layer the styles should be placed on.
 * @returns String of valid CSS settings wrapped with the approbriate layer.
 */
export function addLayer(styles: string, layer: string = CSS_LAYER): string {
  return `@layer ${layer} {${styles}}`;
}

/**
 * Adds the given text, which must comply to CSS standards, as a `CSSStyleSheet`
 * object to the documents list of adopted stylesheets.
 * @param {string} stylestring the given CSS styles (must comply to CSS standards!)
 */
export function addStylesheet(stylestring: string) {
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(addLayer(stylestring));
  document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
}

export function css(temps: TemplateStringsArray, ...args: string[]) {
  const sheet = new CSSStyleSheet();
  let text = temps.reduce((pv, cv, i) => {
    return i !== temps.length - 1 ? pv + cv + args[i] : pv;
  }, '');
  console.log(text);
  sheet.replaceSync(addLayer(
    temps.reduce((pv, cv, i) => {
      return i !== temps.length - 1 ? pv + cv + args[i] : pv;
    }, '')
  ));
  document.adoptedStyleSheets.push(sheet);
}

/**
 * `element.getAttribute()` returns the factual value the element's attribute
 * actually has. This means that it returns a truish empty string if the
 * attribute is present but there is no value given. If you want to verify that
 * there is a value (because your component depends on it) you have to actively
 * check for this, too. This function offers a short-hand for this process.
 * @param {string} attr The attribute's name.
 * @param {HTMLElement} target The target element from which the attribute should
 * be taken. Use `this` in class context of web components.
 * @param {boolean} bool Flag if you expect the attribute to function as a
 * boolean indicator, i.e., the attribute does not need a value and this
 * function is only checking if the attribute is present on the element at all
 * @returns {boolean}
 */
export function isValidAttr(attr: string, target: HTMLElement, bool: boolean = false): boolean {
  let val = target.getAttribute(attr);
  if (bool) {
    return val !== null;
  } else {
    return val !== '' || val !== null;
  }
}