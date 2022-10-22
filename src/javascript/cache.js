export default Map;

/**
 * Little cache system used to cache API responses (mainly used by the Servers component)
 */
export class Cache {
  constructor() {
    this.cache = {};
  }

  get(key) {
    return this.cache[key];
  }

  set(key, value) {
    this.cache[key] = value;
  }

  has(key) {
    return Object.prototype.hasOwnProperty.call(this.cache, key);
  }
}
