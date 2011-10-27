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
DataStructures.Index.ResultSet = SC.Object.extend(SC.CoreArray, SC.Enumerable,
  /* DataStructures.Index.ResultSet.prototype */ {

  isSCArray: NO, // subvert needing to support range observers

  DEBUG_RESULT_SET: NO,

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
    if (this.DEBUG_RESULT_SET) {
      SC.Logger.log('DS.ResultSet._indexDidChange: index changing for keys',
                    SC.A(keySet),
                    arguments);
    }

    var intersection = keySet.intersection(this.get('keySet'));

    if (intersection && intersection.length) {
      if (this.DEBUG_RESULT_SET) SC.Logger.log('DS.ResultSet._indexDidChange: have key intersection', intersection);
      this.notifyPropertyChange('indexSet');
    }
  },

  _prevIndexSetLen: null,
  _arrayChangeNotificationObserver: function() {
    var set = this.get('indexSet');
    if (!(set && set.get('isIndexSet'))) return;

    var prevLength = this._prevIndexSetLen ? this._prevIndexSetLen : 0;
    var diff = set.get('length') - prevLength;

    // TODO: this is technically incorrect - but oh well, it won't be
    // an issue until someone updates DS.Index to both add & remove in
    // a single function (thus, in a single call to
    // indexWillChange/indexDidChange).  It is incorrect because if
    // this result set were wrapped by a query array and both an
    // addition/removal were to happen (a point substitution) - then
    // we would want to alert the query array to evaluate the
    // substitution at the point to assure the new value does(n't)
    // match the +contains+ function of the query
    if (diff === 0) return; // no net change

    var isAdd = diff > 0;
    var added = isAdd ? Math.abs(diff) : 0;
    var removed = isAdd ? 0 : Math.abs(diff);

    // TODO: in the removal case using a start value of 0 is
    // technically wrong.  however the calculation is extremely
    // involved and I am just making a quick fix here.  i belive 0
    // works in all cases however because it will invoke a left shift
    // on the index set thus causing any query array that wraps this
    // result set to trigger.  the downside here is that it is
    // inefficient
    var start = isAdd ? prevLength : 0;

    this.arrayContentWillChange(start,removed,added);
    this.arrayContentDidChange(start,removed,added);

    if (this.DEBUG_RESULT_SET) SC.Logger.log('Result Set content changed',[start,removed,added]);
    this._prevIndexSetLen = set.get('length');
  }.observes('indexSet'),

  /* SC.Array.prototype overrides */
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
