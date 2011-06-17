// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/**
 * an extremely basic index, effectively just a hash of arrays
 */
DataStructures.BasicIndex = SC.Object.extend({
  isIndexer: YES,

  table: null,

  init: function() {
    this.table = {};
    return sc_super();
  },

  destroy: function() {
    delete this.table;
    return sc_super();
  },

  isIndexed: function(key, val) {
    return this.lookup(key).indexOf(val) >= 0;
  },

  index: function(key,val) {
    key = this._normalize(key);
    if (!this.table[key]) {
      this.table[key] = [];
    }
//    if (this.table[key].indexOf(val) < 0) {
    this.table[key].push(val);
//    }
  },

  lookup: function(key) {
    key = this._normalize(key);
    return this.table[key] || [];
  },

  remove: function(key,val) {
    var i;
    key = this._normalize(key);
    if (!this.table[key]) {
      this.table[key] = [];
    }

    i = this.table[key].indexOf(val);
    if (i >= 0) {
      this.table[key] = this.table[key].removeAt(i).compact();
    }
  },

  /* private */
  _normalize: function(key) {
    return key
      .toString()
      .toLowerCase()
//    .replace(/([\s]+)/g,' ')
      .trim()
      .replace(/([^a-z0-9])/g,''); // TODO: should this be done?
  }
});
