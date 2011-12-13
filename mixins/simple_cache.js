DS.SimpleCache = {
  /**
   * caching
   */
  _caches: null, // if _caches === undefined then caching is disabled

  _simpleCacheFetch: function(cache,keys) {
    if (!this._caches) return null;

    var cacheHash = SC.hashFor(cache);
    var keyHash = this._simpleCacheMakeHashKey(keys);

    return this._caches[cacheHash] && this._caches[cacheHash][keyHash] || null;
  },

  _simpleCacheStore: function(cache,keys,val) {
    if (this._caches === undefined) return val;
    if (!this._caches) this._caches = {};

    var cacheHash = SC.hashFor(cache);
    var keyHash = this._simpleCacheMakeHashKey(keys);

    this._caches[cacheHash] = this._caches[cacheHash] || {};
    this._caches[cacheHash][keyHash] = val;

    return this._caches[cacheHash][keyHash];
  },

  /**
   * Disables and resets the caches
   */
  _simpleCacheDisable: function() {
    this._caches = undefined;
  },

  _simpleCacheClear: function(cache,keys) {
    var cacheHash = SC.hashFor(cache);
    var hashKey = this._simpleCacheMakeHashKey(keys);

    if (!cache) {
      this._caches = {};
    } else if (!keys && this._caches) {
      this._caches[cacheHash] = {};
    } else if (this._caches[cacheHash]) {
      this._caches[cacheHash][hashKey] = undefined;
    }
  },

  /**
   * Reenable caching after it has been disabled
   */
  _simpleCacheEnable: function() {
    if (this._caches === undefined) {
      this._simpleCacheClear();
    }
  },

  _simpleCacheMakeHashKey: function(keys) {
    return SC.hashFor(SC.A(keys).map(function(i) { return SC.hashFor(i); }).join());
  }
}
