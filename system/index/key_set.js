sc_require('system/index');

DataStructures.Index.KeySet = SC.Object.extend(SC.Array, {
  key: null,

  transform: function() {
    return [this.get('key')];
  }, // this is a property, but NOT a computed property - the value is the function

  /** don't edit from here down **/

  keys: function() {
    var keys = this.get('transform').call(this, (this.get('key')));
    return SC.A(keys).compact().flatten().uniq();
  }.property('key','transform').cacheable(),

  length: function() {
    return this.get('keys').length;
  }.property('keys').cacheable(),

  objectAt: function(i) {
    if (!this._keys) {
      this._keys = this.transform(this.get('key'));
    }
    return this.get('keys').objectAt(i);
  }
});
