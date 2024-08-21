export class StorageController {
    storage;
    name;
    constructor(name, storage = window.localStorage) {
        this.storage = storage;
        this.name = name;
        if (!this.storage.getItem(this.name)) {
            this.storage.setItem(this.name, '{}');
        }
    }
    #replacer(_, value) {
        if (value instanceof Map) {
            return {
                dataType: 'Map',
                value: [...value]
            };
        }
        else {
            return value;
        }
    }
    #reviver(_, value) {
        if (typeof value === 'object' && value !== null) {
            if (value.dataType === 'Map') {
                return new Map(value.value);
            }
        }
        return value;
    }
    save(items) {
        let storage = this.loadAll();
        items.forEach((key, value) => storage.set(key, value));
        this.saveAll(storage);
    }
    load(key) {
        let value = this.loadAll().get(key);
        if (!value)
            return;
        return JSON.parse(value, this.#reviver);
    }
    saveAll(input) {
        this.storage.setItem(this.name, JSON.stringify(input, this.#replacer));
    }
    loadAll() {
        return JSON.parse(this.storage.getItem(this.name) ?? '{}', this.#reviver);
    }
}
