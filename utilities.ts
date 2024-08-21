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