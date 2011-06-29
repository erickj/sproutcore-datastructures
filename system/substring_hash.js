// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
require("system/basic_index");

/**
 * this datastructure would be much better off as a suffix trie
 */
DataStructures.SubstringHash = DataStructures.BasicIndex.extend({
  min: 1,
  max: 15,

  _substrs: null,
  _values: null,

  init: function() {
    var ret = sc_super();
    this._substrs = {};
    this._values = [];
    return ret;
  },

  destroy: function() {
    delete this._substrs;
    delete this._values;
    return sc_super();
  },

  /**
   * construction time see +substrings+ below
   */
  index: function(key, value) {
    var h = this._substrs,
      idx = this._addValue(value),
      substrings = this._normalize(key)
                     .substrings(this.get('min'),this.get('max'));

    substrings.forEach(function(sub) {
      if (!h[sub]) h[sub] = [];
      h[sub].push(idx);
    },this);
    this.notifyPropertyChange('keyValues');
  },

  /**
   * lookup time: O(1)
   */
  lookup: function(str) {
    if (!str || str.length < this.get('min')) return null;
    str = this._normalize(str).substring(0,this.get('max'));
    var idxs = this._substrs[str] || [];
    return idxs.uniq().map(function(i) {
      return this._values[i];
    },this).compact();
  },

  // TODO: value is never actually removed from this._values
  remove: function(key, value) {
    var h = this._substrs,
      idx = this._values.indexOf(value);

    if (idx < 0) return;

    var substrings = this._normalize(key)
                       .substrings(this.get('min'),this.get('max'));

    substrings.forEach(function(sub) {
      var j;
      if (h[sub] && (j = h[sub].indexOf(idx)) >= 0) {
        h[sub].removeAt(j);
      }
    },this);
    this.notifyPropertyChange('keyValues');
  },

  /* private */
  _addValue: function(val) {
    var idx = this._values.indexOf(val);
    if (idx < 0) {
      idx = this._values.push(val) - 1;
    }
    return idx;
  },

  _removeValue: function() {
    var idx = this._values.indexOf(val);
    if (idx < 0) return null;
    this._values.replace(idx,1,[null]);
    return idx;
  }
});

/**
 * this algorithm has runtime complexity of O(n*(n+1)/2)
 * not so good... make sure you use min and max to cap it
 *
 * TODO: implement a suffix trie
 */
String.prototype.substrings = function(min,max) {
  var ret = [];
  min = [min || 1, 1].max();
  max = [max || this.length,this.length].min();
  for (var s=0,l=this.length; s<=l; s++) {
    for (var e=s+min; e<=max; e++ ) {
      ret.push(this.substring(e,s));
    }
  }
  return ret.uniq();
};
