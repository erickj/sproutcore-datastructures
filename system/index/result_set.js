sc_require('mixins/simple_cache');
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
DataStructures.Index.ResultSet = SC.Object.extend(DS.SimpleCache, SC.CoreArray, SC.Enumerable,
  /* DataStructures.Index.ResultSet.prototype */ {

  isSCArray: NO, // subvert needing to support range observers

  DEBUG_RESULT_SET: NO,

  isResultSet: YES,

  keySet: null,
  index: null,

  indexSet: function() {
//    var cached,cacheArgs = SC.A(arguments);
//    if ((cached = this._simpleCacheFetch(arguments.callee,cacheArgs))) {
//      return cached;
//    }

    var index = this.get('index');
    if (!index) return null;

    var doKeyTransform = this.get('doKeyTransform');
    var set = index.indexSetForKeys(this.get('keySet'), doKeyTransform);
    set.source = index;

    return set; //this._simpleCacheStore(arguments.callee,cacheArgs,set);
  }.dsProfile('DS.ResultSet.indexSet').property('index', 'doKeyTransform').cacheable(),

  // you probably just want to leave this alone
  doKeyTransform: NO,

  init: function() {
    if (this.get('index') || this.get('keySet')) {
      this.notifyPropertyChange('*');
      this._simpleCacheClear();
    }
  },

  _keySetDidChange: function() {
    this._simpleCacheClear();

    // TODO: this keySet -> indexSet property observing is a hack for cache clears
    this.notifyPropertyChange('indexSet');
  }.observes('keySet','keySet.*'),

  _cachedIndex: null,
  _indexObjectDidChange: function() {
    this._simpleCacheClear();

    // setup indexDidChange observers
    var i = this.get('index');

    if (i === this._cachedIndex) return;

    if (this._cachedIndex) {
      this._cachedIndex.removeIndexObserver({
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
  }.dsProfile('DS.ResultSet._indexObjectDidChange').observes('index'),

  _indexWillChange: function(keySet, removed, added) {
    return;
  },

  _indexDidChange: function(keySet, removed, added) {
    if (this.DEBUG_RESULT_SET) {
      SC.Logger.log('DS.ResultSet._indexDidChange: index changing for keys',
                    SC.A(keySet),
                    arguments);
    }

    // must call intersection on this.keySet if we are matching w/ regexs
    var intersection = this.get('keySet').intersection(keySet);

    if (intersection && intersection.length) {
      if (this.DEBUG_RESULT_SET) SC.Logger.log('DS.ResultSet._indexDidChange: have key intersection', intersection);
      this._simpleCacheClear();
      this.notifyPropertyChange('indexSet');
    }
  }.dsProfile('DS.ResultSet._indexDidChange'),

  _prevIndexSetLen: null,
  _arrayChangeNotificationObserver: function() {
    var set = this.get('indexSet');
    if (!(set && set.get('isIndexSet'))) return;

    var prevLength = this.get('length') ? this.get('length') : 0;
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

    var start = this._calculateStartIndexOnChange(isAdd);

    this.arrayContentWillChange(start,removed,added);

    this.set('length',set.get('length'));

    this.arrayContentDidChange(start,removed,added);

    if (this.DEBUG_RESULT_SET) SC.Logger.log('Result Set content changed',[start,removed,added]);
    this._prevIndexSetLen = set.get('length');

    this._clone = set.clone(); // this is used by _calculateStartIndexOnChange for historical comparison
  }.dsProfile('DS.ResultSet._arrayChangeNotificationObserver').observes('indexSet'),

  // need to calculate the right deltas for incremental changes for query arrays
  _calculateStartIndexOnChange: function(isAdd) {
    if (!this._clone) return 0;

    var ret;
    var set = this.get('indexSet');

    var outer = isAdd ? set : this._clone;
    var inner = isAdd ? this._clone : set;

    outer.forEachRange(function(rngStart,rngLen) {
      if (!SC.none(ret)) return;
      if (!inner.contains(rngStart,rngLen)) {
        outer.forEachIn(rngStart,rngLen,function(i) {
          if (!SC.none(ret)) return;
          if (!inner.contains(i)) ret = i;
        });
      }
    });

    return ret;
  }.dsProfile('DS.ResultSet._calculateStartIndexOnChange'),

  _teardownContentObservers: function() {
    // avoid error: "Uncaught TypeError: Cannot call method '_kvo_for' of null"
    // when ranges are removed from this.index
    //
    // this is a hacky override of _teardownContentObservers.  when I
    // implemented the array observers above w/
    // _arrayChangeNotificationObserver I don't have access to the
    // remove (or add) ranges at the appropriate time for the
    // arrayContentWillChange function call, so by the time
    // _teardownContentObservers tries to run all the values are
    // already removed and null - it throws the messy error above.
    // (try digging into _indexWillChange to figure out why for
    // yourself - hint start in DS.Index.remove).  since i haven't
    // implmenented range observers I think overriding this is safe
    // here.
  },

  /* SC.Array.prototype overrides */
  length: 0,

  objectAt: function(idx) {
    var indexSet = this.get('indexSet'),
      index = this.get('index');

    if (!indexSet || !index || index.get('isDestroyed')) return undefined;

    var cached,cacheArgs = SC.A(arguments);
    if ((cached = this._simpleCacheFetch(arguments.callee,cacheArgs))) {
      return cached;
    }

    var innerIdx = indexSet.firstObject();
    while(idx--) {
      innerIdx = this.get('indexSet').indexAfter(innerIdx);
    }

    return this._simpleCacheStore(arguments.callee,
                                  cacheArgs,
                                  this.get('index').objectAt(innerIdx));
  }.dsProfile('DS.ResultSet.objectAt'),

  replace: function() {
    throw new Error("ResultSets are immutable!");
  }
});
