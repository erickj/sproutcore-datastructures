sc_require('system/index');
sc_require('system/query_array');

/**
 * ResultSet
 *
 * A ResultSet is the return of a query for values at a key or KeySet
 * in an index by using the +DS.Index.lookup+ function.  ResultSet
 * automatically subscribe to the didChange/willChange callbacks on
 * the index to watch all changes in the index.  when a change occurs
 * that affects one of its key set values then the ResultSet updates
 * its IndexSet by requerying the index for an updated version.
 */
DataStructures.Index.ResultSet = SC.Object.extend(SC.Array,
  /* DataStructures.Index.ResultSet.prototype */ {

  isResultSet: YES,

  keySet: null,
  index: null,

  indexSet: function() {
    var index = this.get('index');
    if (!index) return null;

    var doKeyTransform = this.get('doKeyTransform');
    var set = index.indexSetForKeys(this.get('keySet'), doKeyTransform);
    set.source = index;

    return set;
  }.property('keySet', 'index', 'doKeyTransform').cacheable(),

  // you probably just want to leave this alone
  doKeyTransform: NO,

  init: function() {
    if (this.get('index') || this.get('keySet')) {
      this.notifyPropertyChange('*');
    }
  },

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
        willChange: '_indexWillChange',
        didChange: '_indexDidChange'
      });
      this._cachedIndex = i;
    }
  }.observes('index'),

  _indexWillChange: function(keySet, removed, added) {
    return;
  },

  _indexDidChange: function(keySet, removed, added) {
    var intersection = keySet.intersection(this.get('keySet'));

    if (intersection && intersection.length) {
      this.notifyPropertyChange('index');
    }
  },

  /* SC.Array.prototype overrides */
  '[]': function() {
    return this;
  }.property('indexSet'),

  length: function() {
    return this.getPath('indexSet.length') || 0;
  }.property('[]'),

  objectAt: function(idx) {
    var indexSet = this.get('indexSet'),
      index = this.get('indexSet');

    if (!indexSet || !index) return undefined;

    var innerIdx = index.firstObject();
    while(idx--) {
      innerIdx = this.get('indexSet').indexAfter(innerIdx);
    }
    return this.get('index').objectAt(innerIdx);
  },

  replace: function() {
    throw new Error("ResultSets are immutable!");
  }
});
