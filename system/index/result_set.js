sc_require('system/index');
sc_require('sysetm/query_array');

DataStructures.Index.ResultSet = DataStructures.QueryArray.extend(
  /* DataStructures.Index.ResultSet.prototype */ {
  keySet: null,
  index: null,

  _values: null,

  indexSet: function() {
    var index = this.get('index'),
      keys = this.get('keySet');
    return index && keys && index.indexSetForKeys(keys);
  }.property('keySet', 'index').cacheable(),

  _keySetDidChange: function() {
    this.notifyPropertyChange('keySet');
  }.observes('keySet.*'),

  _cachedIndex: null,
  _indexObjectDidChange: function() {
    // setup indexDidChange observers
    var i = this.get('index');

    if (i === this._cachedIndex) return;

    if (this._cachedIndex) {
      this._cachedIndex.removeIndexObsever({
        target: this,
        indexWillChange: '_indexWillChange',
        indexDidChange: '_indexDidChange'
      });
      delete this._cachedIndex;
    }

    if (i && !i.get('isIndex')) {
      throw new Error("Unable to set non index for Index.ResultSet.index property");
    }

    if (i) {
      i.addIndexObserver({
        target: this,
        indexWillChange: '_indexWillChange',
        indexDidChange: '_indexDidChange'
      });
      this._cachedIndex = i;
    }
  }.observes('index'),

  _indexWillChange: function(keySet, removed, added) {
    return;
  },

  _indexDidChange: function(keySet, removed, added) {
    var intersection = keySet.intersection(this.get('keySet'));

    if (!(intersection && intersection.length)) {
      return;
    }

    this.notifyPropertyChange('referenceArray');
  }
});
