sc_require('system/index');

/**
 * Important:
 *
 * SC.hashFor(aKeySet) will NOT generate a unique hash for the object
 * instance.
 *
 * 2 different KeySets with the same uniq keys will generate identical
 * hash values.  This allows for DS.Index to cache a KeySet based on
 * its contents rather than its existence
 */
DataStructures.Index.KeySet = SC.Object.extend(SC.Array, {
  /* quack */
  isKeySet: true,

  _keys: null,
  keys: function(k,v) {
    this._keys = this._keys || [];
    if (arguments.length == 2) {
      this._keys = SC.A(v).fastFlatten().compact().uniq();
    }
    return this._keys;
  }.property().cacheable(),

  length: function() {
    return this.get('keys').length;
  }.property('keys').cacheable(),

  objectAt: function(i) {
    var keys = this.get('keys');
    return this.get('keys').objectAt(i);
  },

  addKeys: function(k /*, k2, k3, ... kN */) {
    this.set('keys',this.get('keys').concat(SC.A(arguments)));
    return this;
  },

  removeKeys: function(k /* k2, k3, ...kN */) {
    var keys = this.get('keys'),
      removeKeys = SC.A(arguments).fastFlatten(),
      len = removeKeys.length,
      count = 0,
      idx;

    for(var i=0;i<len;i++) {
      // the inner while loop should be unnecessary, since keys are
      // supposed to be unique
      while ((idx = keys.indexOf(removeKeys[i])) >= 0) { // <-- assign idx, :(
        keys.removeAt(idx,1);
        count++;
      }
    }

    if (count > 0) {
      this.notifyPropertyChange('keys');
    }
    return this;
  },

  /**
   * return true if _this_ and _otherKeySet_ share a common key
   *
   * @param {DataStructures.KeySet}
   * @return {Boolean}
   */
  intersects: function(otherKeySet) {
    return this.intersection(otherKeySet).length > 0;
  },

  /**
   * @return {Array}
   */
  intersection: function(otherKeySet) {
    var ret = [];
    if (!otherKeySet.isKeySet) {
      return ret;
    }

    var len = this.get('length'), key;
    for (var i=0;i<len;i++) {
      key = this.objectAt(i);
      if (SC.typeOf(key) == 'regexp') {
        for (var j=0,innerLen=otherKeySet.get('length');j<innerLen;j++) {
          var tmp = otherKeySet.objectAt(j);
          if (key.test(tmp)) ret.push(tmp);
        }
      } else if (otherKeySet.contains(key)) ret.push(key);
    }
    return ret;
  },

  hash: function(keySet) {
    var ret = keySet.get('keys').sort().join();
    return SC.hashFor(ret);
  }
});
