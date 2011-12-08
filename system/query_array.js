// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
sc_require('ext/delegate_support');
sc_require('system/index_shift');

/**
 * Overview:
 * The QueryArray is designed to be a generic version of the
 * SC.RecordArray, with no coupling to the SC.Store, and a loose
 * reliance on the SC.Query.  The query array is a filtration of
 * another array, the reference array.  The query array looks like any
 * other native array object, has a 0 based index and is fully
 * observable via enumerable content, array observers, and range
 * observers.  What I mean by has a 0 based index is that if I have
 * the following reference array, ra,:
 *
 * [{v: 1},{v: 2},{v: 3},{v: 4},{v: 5},{v: 6},{v: 7},{v: 8}]
 *
 * With query, q:
 *
 * "v >= 2 AND v < 5 OR v >= 7"
 *
 * The resulting query array, qa, would resemble:
 *
 * [{v: 2},{v: 3},{v: 4},{v: 7},{v:8}]
 *
 * where {v: 2} is at index 0, and {v: 8} at index 4.  This implies that:
 *
 * qa.objectAt(0) === ra.objectAt(1)
 *
 * further, it has implications in terms of observing.  For instance,
 * if the following occurred:
 *
 * ra.pushObject({v: 2.5})
 *
 * Any range observer bound to ra would be notified of a change at
 * index 8, while observers of qa would be notified of a change at
 * index 5.
 *
 * Reference Array:
 * This is the source array for the QueryArray.  The QueryArray will
 * contain a subset of items from the ReferenceArray.  Changes to the
 * ReferenceArray involving items that match the query condition will
 * trigger observable changes on the query array.
 *
 * Query:
 * The original intention of the query object is to be used with the
 * SC.Query class, however any object that responds to +parse+ and
 * +contains+ will do.  +parse+ may return void, while +contains+ must
 * return a boolean.  See SC.Query for info on their intentions.
 * Ordering is NOT currently supported.
 *
 * QueryArray is Immutable:
 * The query array is immutable from the client perspective, any
 * changes made to the contents of the query array will NOT be
 * propogated back to the reference array.  The QueryArray
 * implementation of +replace+ throws an error.  Only the reference
 * array should be modified.
 */
DataStructures.QueryArray = SC.Object.extend(SC.Array, SC.DelegateSupport, {
  MAXTIME: 100,

  DEBUG_QUERY_ARRAY: false,
  DEBUG_QUERY_ARRAY_TIMEOUT: false,

  /* quack */
  isQueryArray: true,

  referenceArray: null,
  query: null,

  _indexSet: null,

  init: function() {
    var idxSet = SC.IndexSet.create();
    this.set('_indexSet', idxSet);

    this.beginPropertyChanges();
    ['referenceArray', 'query'].forEach(function(p) {
      if (this.get(p)) this.notifyPropertyChange(p);
    },this);
    this.endPropertyChanges();

    return sc_super();
  },

  destroy: function() {
    this._innerCacheDisable();
    return sc_super();
  },

  replace: function() {
    // TODO: do this better
    throw "Immutable!!!";
  },

  /**
   * provide support for +objectAt+
   */
  get: function(idx) {
    var cached,cacheArgs=SC.A(arguments);
    if ((cached = this._innerCacheFetch(arguments.callee,cacheArgs))) {
      return cached;
    }

    if (idx === parseInt(idx)) {
      return this._innerCacheStore(arguments.callee,
                                   cacheArgs,
                                   this.get('referenceArray').objectAt(this._mapPublicToPrivateIndex(idx)));
    }
    return sc_super();
  },

  length: function() {
    return this._indexSet.get('length');
  }.property('[]'),

  indexOf: function(obj,startAt) {
    var cached,cacheArgs=SC.A(arguments);
    if ((cached = this._innerCacheFetch(arguments.callee,cacheArgs))) {
      return cached;
    }

    startAt = this._mapPublicToPrivateIndex(startAt);
    var i = this._indexSet.indexOf(obj,startAt);

    return this._innerCacheStore(arguments.callee,
                                 cacheArgs,
                                 (i >= 0 ? this._mapPrivateToPublicIndex(i) : i));
  },

  lastIndexOf: function(obj,startAt) {
    var cached,cacheArgs=SC.A(arguments);
    if ((cached = this._innerCacheFetch(arguments.callee,cacheArgs))) {
      return cached;
    }

    startAt = this._mapPublicToPrivateIndex(startAt);
    var i = this._indexSet.lastIndexOf(obj,startAt);

    return this._innerCacheStore(arguments.callee,
                                 cacheArgs,
                                 (i >= 0 ? this._mapPrivateToPublicIndex(i) : i));

  },

  forEach: function(callback, target) {
    // wrap callback for index space translation
    var wrapped = function _qaAnonForEachCBBuilder(callback, target, that) {
      if (target === undefined) target = null;

      return function _qaAnonForEachCB(next, idx, enumerable, context) {
        return callback.call(target, next, that._mapPrivateToPublicIndex(idx), that);
      };
    }(callback, target, this);

    this._indexSet.forEachObject(wrapped);
    return this;
  },

  /**
   * @see addRangeObserver
   * modify the index spaces for addArrayObserver callbacks
   */
  addArrayObservers: function(hash) {
    var target = hash.target,
      didChange = hash.didChange,
      willChange = hash.willChange;

    var idxSpaceTranslator = function _qaIdxSpaceTranslator(target,method,that,id) {
      if (!method) return null;

      if (SC.typeOf(method) == SC.T_STRING) {
        method = target[method];
      }

      var changeFn = function _qaAnonArrayObserverIndexSetTranslationCb() {
        if (that.DEBUG_QUERY_ARRAY) {
          SC.Logger.log("_qaAnonArrayObserverIndexSetTranslationCb:", arguments, arguments.callee.isWillChange ? 'willChange' : 'didChange');
        }

        var args = SC.A(arguments),
          start = args[0],
          publicIndex = that._mapPrivateToPublicIndex(start,true);

        // TODO: fix this hack, to see what the hack is for delete the
        // whole if/elseif block and run the observable tests.  the
        // QueryArray willChange/didChange has a hard time getting the
        // right start index to send in the willChange case when the
        // objects don't exist in the array yet, and in the didChange
        // case when the objects have been removed from the array.
        if (arguments.callee.isWillChange && publicIndex < 0) {
          publicIndex = that.get('length');
        } else if (arguments.callee.isDidChange) {
          // TODO:
          // leave this big ugly conditional here to remind me to fix
          // this ugly hack
          if (that._indexShiftQueue) {
            var lastShift = that._indexShiftQueue.slice(-1);
            if (lastShift[0]) {
              if (lastShift[0].get('net') < 0) {
                publicIndex += Math.abs(lastShift[0].get('net'));
              }
            }
          }
        }

        args[0] = publicIndex;
        return method.apply(target,args);
      };
      changeFn[id] = true;

      return changeFn;
    };

    hash.didChange = idxSpaceTranslator(target, didChange, this, 'isDidChange');
    hash.willChange = idxSpaceTranslator(target, willChange, this, 'isWillChange');

    return SC.Array.addArrayObservers.apply(this,arguments);
  },

  /**
   * Array.addRangeObserver explicitly leaves out deep observing of
   * objects for setting up range observers. We shall also ignore
   * it... and that makes the probably much easier to solve. Here's the
   * issue:
   *
   * [{1},{2},{3},{4},{5},{6}] - target array
   *
   * [<--------->] - observe range 0-2
   *
   * [{1},{2},{2.5},{3},{4},{5},{6}]
   *            ^ - insertAt(2,{2.5})
   *
   * now what do I do to a rangeObserver that deeply observerd the
   * properties of objects in the original range? what do I do w/ the
   * newly inserted object? If deep observation was set up - it would
   * have been done so down inside the RangeObserve+beginObserving+
   * function. But now the range has shifted the object at index 2 out
   * of the range and inserted a new object into the range. Should the
   * range observer notice this and automatically remove observers from
   * 3 and add them to 2.5? It's unclear... instead lets ignore the
   * whole deep observation problem altogether and make the caller
   * explicitly set up observers externally based on insertions and
   * removals
   *
   * The primary role of add/update/removeRangeObserver as implemented
   * here is to translate between public/private index spaces so that
   * range observers are actually registered to the reference array
   * (private index space), but return index (start/length) info in
   * terms of the query array (public index space).
   *
   * @see DataStructures.QueryArray.RangeObserverRebuild
   *   for more range observer functionality
   */
  addRangeObserver: function(indices, target, method, context) {
    var ref = this.get('referenceArray'),
      args = SC.A(arguments);

    if (!ref) return null;

    if (indices && indices.isIndexSet) {
      args[0] = this._translateIndexSet(indices);
    }

    // we need to wrap the callback in a function that will guard
    // against changes to indices that aren't in our query array.  in
    // the case that _indices_ is null (meaning the caller wants to
    // watch the whole array) we have to pass that value into the
    // referenceArray as null.  we need to do this so future additions
    // to this queryArray (via the referenceArray) will be monitored
    // as well.  this has the side effect that any change to the
    // referenceArray, even those that are filtered out of this query
    // array will be sent to the range observer callback.  this
    // wrapper intercepts the callback and checks that the indices
    // sent to it are in the query array first.  this wrapped method
    // also translates the indices from the private index space into
    // the public index space
    method = function _qaAnonRangeObserverCbBuilder(target, method, that) {
      // the function call guards the closure scope
      if (SC.typeOf(method) == SC.T_STRING) {
        method = target[method];
      }

      /**
       * @see sproutcore/frameworks/runtime/system/range_observer.js
       * RangeObserver+rangeDidChange+
       *
       * @param source
       * @param object
       * @param key
       * @param indexSet
       * @param context
       */
      return function _qaAnonRangeObsrvrIndexSetTranslationCb() {
        var args = SC.A(arguments),
          refIndexSet = args[3],
          localIndexSet = that._indexSet;

        var first = refIndexSet.firstObject(),
          len = refIndexSet.get('length'),
          mappedIndexSet = SC.IndexSet.create();

        // the localIndexSet and refIndexSet are in the same
        // index space so indices can be compared directly.
        // loop through _localIndexSet_ since it MUST be <=
        // _refIndexSet_
        localIndexSet.forEachIn(first, len, function _qaAnonLocalIdxSetIterator(idx) {
          if (refIndexSet.contains(idx)) {
            mappedIndexSet.add(that._mapPrivateToPublicIndex(idx));
          }
        });

        args[3] = mappedIndexSet;
        args[3].freeze();

        // skip the callback if there was no intersection
        if (args[3].get('length') == 0) return;

        method.apply(target, args);
      };
    }(target, method, this); // end method = function(...)

    args[2] = method;

    return ref.addRangeObserver.apply(ref, args);
  },

  updateRangeObserver: function(rangeObserver, indices) {
    var ref = this.get('referenceArray'),
      args = SC.A(arguments);

    if (!ref) return null;

    if (indices && indices.isIndexSet) {
      args[1] = this._translateIndexSet(indices);
    }

    return ref.updateRangeObserver.apply(ref, args);
  },

  removeRangeObserver: function(rangeObserver) {
    var ref = this.get('referenceArray'),
      args = SC.A(arguments);

    if (!ref) return null;

    return ref.removeRangeObserver.apply(ref, args);
  },

  // TODO: this could be sped up by iterating over ranges rather than
  // indices, or by using the IndexSet+replace+ function, but that can
  // be done later

  /**
   * @private
   * Index spaces
   *
   * The job of the query array is to filter the contents of an array
   * like object (the reference array) via the _conditions_ of an
   * SC.Query into an object with an array inferface (the query
   * array).  The indices of the reference array should be considered
   * private, these indices will be called the private index space.
   * The clients of the query array should only concern themselves
   * with the 0 based indexing of the query array.  This will be
   * called the public index space. All access to the query array
   * through +objectAt+ and indices described in registered observers
   * must all be in the public index space in order to provide easy
   * access to the client.  +_translateIndexSet+ will take an
   * SC.IndexSet as its first parameter and return the matching
   * public/private index set for that argument.
   *
   * @param idxSet an IndexSet
   * @param publicToPrivate - bool default true
   * @param bind - bool default true
   */
  _translateIndexSet: function(idxSet, publicToPrivate, bind) {
    if (!idxSet || !idxSet.isIndexSet) return null;

    if (SC.none(publicToPrivate))
      publicToPrivate = true;

    if (SC.none(bind))
      bind = true;

    var newSet = SC.IndexSet.create(),
      ref = this.get('referenceArray'),
      len = this.get('length'),
      meth = publicToPrivate ? '_mapPublicToPrivateIndex' : '_mapPrivateToPublicIndex';

    idxSet.forEachIn(0,len,function _qaAnonTranslateIndexSet(i) {
      newSet.add(this[meth](i));
    },this);

    if (bind) {
      newSet.source = publicToPrivate ? ref : this;
    }

    return newSet;
  },

  /**
   * caching - borrowed directly from DS.Index
   * TODO: normalize
   */
  _caches: null, // if _caches === undefined then caching is disabled

  _innerCacheFetch: function(cache,keys) {
    if (!this._caches) return null;

    var cacheHash = SC.hashFor(cache);
    var keyHash = SC.hashFor(SC.A(keys).map(function(i) { return SC.hashFor(i); }).join());

    return this._caches[cacheHash] && this._caches[cacheHash][keyHash] || null;
  },

  _innerCacheStore: function(cache,keys,val) {
    if (this._caches === undefined) return val;
    if (!this._caches) this._caches = {};

    var cacheHash = SC.hashFor(cache);
    var keyHash = SC.hashFor(SC.A(keys).map(function(i) { return SC.hashFor(i); }).join());

    this._caches[cacheHash] = this._caches[cacheHash] || {};
    this._caches[cacheHash][keyHash] = val;

    return this._caches[cacheHash][keyHash];
  },

  /**
   * Disables and resets the caches
   */
  _innerCacheDisable: function() {
    this._caches = undefined;
  },

  /**
   * Reenable caching after it has been disabled
   */
  _innerCacheEnable: function() {
    if (this._caches === undefined) {
      this._caches = null;
    }
  },
  /** END TODO **/

  /**
   * @private
   * counting's hard... AHHHHHHHHHHH!!!!!!!!!!!!!!!!
   *
   * map an index from the public index space into the private index space
   */
  _mapPublicToPrivateIndex: function(publicIdx) {
    var cached, cacheArgs = publicIdx;
    if ((cached = this._innerCacheFetch(arguments.callee,cacheArgs))) {
      return cached;
    }

    var indexSet = this._indexSet,
      privateIndex = indexSet.firstObject(),
      counter = 0;

    while(!SC.none(privateIndex)
          && counter < publicIdx
          && privateIndex >= 0) {
      this._innerCacheStore(arguments.callee,counter++,privateIndex);
      privateIndex = indexSet.indexAfter(privateIndex);
    }
    privateIndex = this._indexSet.contains(privateIndex) ? privateIndex : -1;

    return this._innerCacheStore(arguments.callee,cacheArgs,privateIndex);
  },

  /**
   * @private
   * counting's hard... AHHHHHHHHHHH!!!!!!!!!!!!!!!!
   *
   * map an index from the private index space into the public index space
   */
  _mapPrivateToPublicIndex: function(privateIdx) {
    var cached,cacheArgs = privateIdx;
    if ((cached = this._innerCacheFetch(arguments.callee,cacheArgs))) {
      return cached;
    }

    var indexSet = this._indexSet,
      curPrivateIdx = indexSet.firstObject(),
      publicIdx = -1;

    while(!SC.none(curPrivateIdx)
          && privateIdx >= curPrivateIdx
          && curPrivateIdx >= 0) {
      this._innerCacheStore(arguments.callee,curPrivateIdx,++publicIdx);
      curPrivateIdx = indexSet.indexAfter(curPrivateIdx);
    }
    publicIdx = (0 <= publicIdx && publicIdx < this.get('length')) ? publicIdx : -1;

    return this._innerCacheStore(arguments.callee,cacheArgs,publicIdx);
  },

  _indexShiftQueue: null,
  _refArrElems_willChange: function(start,removed,added) {
    if (!this._indexShiftQueue) this._indexShiftQueue = [];

    var len = this.referenceArray.get('length');

    // always create a shift, let processing decide later whether or
    // not this is a shift we should care about - if it's even a shift
    // at all
    this._indexShiftQueue.push(DataStructures.IndexShift.create({
      added: added,
      removed: removed,
      start: start,
      length: len // need to capture len here BEFORE the array changes
    }));

    if (removed && removed > 0) {
      if (this.DEBUG_QUERY_ARRAY) {
        SC.Logger.debug("DS.QueryArray: _refArrElems_willChange staging removal at %@ for %@ elements, added: %@, length: %@".fmt(start,removed,added,len));
      }

      this._flushChanges(start,removed,true,this._indexShiftQueue.slice(-1)[0]);
    }
    // TODO: teardown property chains when elems are removed from array
    // @see sproutcore/f0be4029a186f5b1ce33c494878c126644dfd57f
  },

  /**
   * @private
   */
  _refArrElems_didChange: function(start,removed,added) {
    if (!this._indexShiftQueue) this._indexShiftQueue = [];

    var shift = this._indexShiftQueue.shift();
    if (added && added > 0) {
      if (this.DEBUG_QUERY_ARRAY) {
        var len = this.referenceArray.get('length');
        SC.Logger.debug("DS.QueryArray: _refArrElems_didChange staging addition at %@ for %@ elements, removed: %@, length: %@".fmt(start,added,removed,len));
      }
      this._flushChanges(start,added,false,shift);
    }
  },

  /**
   * @private
   *
   * unfortunately we need to observe EVERY property of EVERY
   * element in the reference array in order to recalculate if
   * the element ever matches our query for inclusion in this
   * QueryArray
   */

  /**
   * TODO: propertyDidChange observers fire a change to property '*'
   * when an item is added to an array - we don't want this to happen.
   * This creates duplicate notifications for the QueryArray since
   * +_refArrElems_[did|will]Change+ observers also fire.  The
   * QueryArray should work off the did/will change observers, and not
   * the property did change observer in these cases, but there is no
   * easy way of detecting this right now.  Come back to this problem.
   *
   * Current SC.Array behavior is fubar: Currently when refArray
   * changes, the +_refArray_didChange+ observer fires first, then a
   * propDidChange fires for only the LAST element in the array.  When
   * calling +referenceArray.pushObject+, the propDidChange observer
   * fires first for each object, then the +_refArrElems_didChange+
   * observer fires.  So it's actually the propDidChange observer fire
   * that is modifying the QueryArray currently.
   */
  _refArrEl_propDidChange: function(obj,prop,val,rev) {
    var i = this.get('referenceArray').indexOf(obj);

    if (obj && !SC.none(i) && i >= 0) {
      if (this.DEBUG_QUERY_ARRAY) {
        SC.Logger.log("DS.QueryArray: _refArrEl_propDidChange: staging change at %@".fmt(i), arguments);
      }

      this._flushChanges(i,1);
    }
  },

  /**
   * @private
   * need to recalculate everything
   */
  /**
   * TODO: need to cleanup indexSet and observers if the reference
   * array changes
   */
  _refArr_cached: null,
  _refArr_didChange: function() {
    if (this.DEBUG_QUERY_ARRAY) {
      SC.Logger.log("DS.QueryArray._refArr_didChange:", arguments);
    }

    if (SC.isEqual(this._refArr_cached, this.get('referenceArray')))
      return;

    var oldArray = this._refArr_cached,
      newArray = this.get('referenceArray'),
      fnArrDidChange = this._refArrElems_didChange,
      fnArrWillChange = this._refArrElems_willChange,
      fnPropDidChange = this._refArrEl_propDidChange,
      key = '@each.*';

    if (oldArray) {
      oldArray.removeArrayObservers({
        target: this,
        didChange: fnArrDidChange,
        willChange: fnArrWillChange
      });

      // TODO: this is fucked up - this doesn't unbind
      // @see query_array tests "exposes unbind error"
      oldArray.removeObserver(key,this,fnPropDidChange);
    }

    if (newArray) {
      newArray.addArrayObservers({
        target: this,
        didChange: fnArrDidChange,
        willChange: fnArrWillChange
      });

      // TODO: how slow is this?
      newArray.addObserver(key,this,fnPropDidChange);
    }

    this._indexSet.replace(SC.IndexSet.create());
    this._indexSet.source = newArray;

    this._refArr_cached = newArray;
    this._flushChanges();
  }.observes('referenceArray'),

  /**
   * @private
   * need to recalculate everything
   */
  _query_didChange: function() {
    var query = this.get('query');

    if (SC.typeOf(query.contains) != SC.T_FUNCTION) {
      var e = new Error('query for QueryArray must respond to +contains+');
      e.isBadQueryError = YES;
      throw e;
    }

    if (SC.typeOf(query.parse) == SC.T_FUNCTION) {
      query.parse();
    }
    this._flushChanges();
  }.observes('query'),

  _flushQueue: null,

  /**
   * @private
   * Here is why +_flushChanges+ and +_doModifications+ are 2 functions:
   *
   * Calculate the changes to make to our index set in +_flushChanges+
   * but delay making the changes immediately.  When the changes are made we
   * need to call the appropriate *[Will|Did]Change functions.  We want
   * to do this as few times as possible, but need to do it for each
   * contiguous set of additions and removals.  Also, if processing changes
   * takes too long we want to stop and reschedule processing the remaining
   * changes so that we don't cause browser lock or page timeouts.  So,
   * +_flushChanges+ will preprocess all the pending modifications and sort
   * them into 2 bucktes, the addSet and removeSet.  Then +_doModifications+
   * can be run on the two sets.  The sets will natively yield contiguous
   * ranges which we can wrap our *[Will|Did]Change functions around. This
   * is when the modifications will actually be made to this._indexSet,
   * resulting in newly included and excluded elements in this query array.
   * @see _doModifications
   * @see _calculateOperation
   *
   * @param start
   * @param changed
   * @param isRemoval - we can't always use +_calculateOperation+ to
   * determine if the object should be removed or not since we're
   * using removals from +refArrElems_willChange+. the objects will
   * still be in the reference array.  use isRemoval to force
   * calculating the operation as a removal
   * @param IndexShift
   */
  _flushChanges: function(start,changed,isRemoval,indexShift) {
    if (this.DEBUG_QUERY_ARRAY) {
      SC.Logger.log("DS.QueryArray._flushChanges: ", arguments);
    }
    var debugTimeStart = (new Date()).getTime();

    // we need to wait to calculate our flush changes until after
    // any currently running modification has completed
    if (this._modificationInProgress) {
      if (this.DEBUG_QUERY_ARRAY) {
        SC.Logger.warn("DS.QueryArray._flushChanges: modification is in progress, stashing changes until current modification complete");
      }
      if (!this._flushQueue) this._flushQueue = [];
      this._flushQueue.push(SC.A(arguments));
      return;
    }

    var q = this.get('query'),
      idx = this._indexSet,
      ra = this.get('referenceArray');

    if (!q || !idx || !ra) return;

    start = start || 0;
    changed = changed || ra.get('length'); // default we've changed everything

    var queryContained, idxContained, op,
      operations = [],
      removeSets = SC.IndexSet.create(),
      addSets = SC.IndexSet.create();

    for (var privateIdx=start; privateIdx<(changed+start); privateIdx++) {
      op = this._calculateOperation(ra.objectAt(privateIdx),
                                    privateIdx,
                                    q,
                                    idx,
                                    isRemoval);
      if (!op) continue;

      operations.push(op);
      if (op.isRemoval) {
        removeSets.add(operations.length - 1);
      } else if (op.isAddition) {
        addSets.add(operations.length - 1);
      }
    }

    if (this.DEBUG_QUERY_ARRAY) {
      var delta = (new Date()).getTime() - debugTimeStart;
      SC.Logger.log("DS.QueryArray._flushChanges: %@ changes calculated in %@ ms".fmt(operations.length, delta));
      delete delta;
      delete debugTimeStart;
    }

    this._doModifications(addSets, removeSets, operations, indexShift);
  },

  _modificationInProgressObserver: function() {
    if (!this.get('_modificationInProgress')
        && this._flushQueue
        && this._flushQueue.length > 0) {
      var fnArgs = this._flushQueue.shift(); // fifo them off
      this._flushChanges.apply(this, fnArgs);
    }
  }.observes('_modificationInProgress'),

  _modificationTimeExceeded: false,
  _modificationInProgress: false,

  /**
   * @private
   * THERE BE DRAGONS HERE.
   * @see _flushChanges
   *
   * @param addSets - SC.IndexSet
   * @param removeSets - SC.IndexSet
   * @param operations - array of objects that respond to +_doOperation+
   * @param IndexShift - an index shift object
   * @param _resuming - bool - internal use only
   */
  // TODO: setTimeout and the flushQueue are currently semi broken... fix this
  _doModifications: function(addSets, removeSets, operations, indexShift /*, _resuming */) {
    this._innerCacheDisable();

    var startTime = (new Date()).getTime(),
      modificationTimeExceeded = false,
      that = this,
      timeRemaining = function _qaInnerTimeRemaining() {
        var delta = (new Date()).getTime() - startTime;
        return that.MAXTIME - delta;
      },
      didExceedTime = function _qaInnerDidExceedTime() {
        return timeRemaining() <= 0;
      },
      makeCallback = function _qaInnerMakeCb(addSets, removeSets, operations, _resuming,that) {
        return function _qaInnerDoModificationCb() {
          return that._doModifications(addSets,
                                       removeSets,
                                       operations,
                                       _resuming);
        };
      };

    var _resuming = arguments[3];

    // we're resuming a delayed modification
    if (this._modificationInProgress && _resuming) {
      SC.Logger.debug("resuming delayed modification");

    // foobar case - this call to +_doModifications+ shouldn't have been made
    } else if (this._modificationInProgress) {
      // TODO: there is a bug here currently... the code path gets in here somehow
      SC.Logger.error("shit's gone awry, the _flushQueue should have prevented this");
      return;
    }

    // this will be marked false after all removeSets and addSets
    // ranges have been processed.  this may span across 0 or more
    // timeouts.  if the modification spans 1 or more timeouts then
    // queue unrelated modification requests until we've completed
    // this modification
    this._modificationInProgress = true;

    /**
     * READ THIS VERY CAREFULLY BEFORE EDITING!!!
     */
    [removeSets, addSets].forEach(function _qaInnerOpSetIterator(operativeSet) {
      // the _modificationTimeExceeded check is unnecessary here,
      // it is an optimization.  it is only necessary to check in
      // the inner +forEachRange+ loop
      if (!operativeSet || modificationTimeExceeded) return;

      // wrap processing contiguous indices of the operative set (each range)
      // in calls to arrayContentWillChange, arrayContentDidChange, and
      // enumerableContentDidChange.  this will minimize calls made to objects
      // observing this query array
      operativeSet.forEachRange(function _qaInnerOpSetRangeIterator(start, length) {
        if (that.DEBUG_QUERY_ARRAY) {
          SC.Logger.log('DS.QueryArray: Processing range from %@ to %@'.fmt(start,
                                                                            length));
        }

        // if _modificationTimeExceeded_ then we will not process the
        // remaining ranges after detecting a timeout.  if
        // _operations[start].done_ then this whole range has been
        // completed in a previous +_doModification+ call.
        if (modificationTimeExceeded || operations[start].done) {
          return;
        }

        // check if we exceeded our timelimit, if so schedule another run
        if (didExceedTime()) {
          SC.Logger.warn('query array modification time exceeded, rescheduling');

          // we don't need to modify anything for continuing the modification
          // because we're marking indices "done" as modifications are completed
          var innerCb = makeCallback(addSets, removeSets, operations, true, this),
            outerCb = function _qaInnerSetTimeoutCb() {
            // TODO: this may actually schedule a rerun when we have completed
            // all the sets... it will effectively be a noop - oh well for now
            SC.run(function _qaInnerSetTimeoutSCRunCb() {
              if (!that || that.get('isDestroyed')) {
                SC.Logger.warn('failed to complete delayed query array modification, query array does not exist');
              } else {
                innerCb(); // continue the modification
              }
              delete innerCb;
            });
          };

          // use setTimeout for same idea as in SC.RecordArray,
          // invokeLater may put us in the same event loop - so we
          // want to avoid that.  if we're trying to test however we
          // NEED to run the reschedule in invokeLater so we can try
          // this out in our testing framework
          if (this.DEBUG_QUERY_ARRAY_TIMEOUT) {
            this.invokeLater(outerCb);
          } else {
            setTimeout(outerCb,0); // end setTimeout
          }

          modificationTimeExceeded = true;
          return;
        }       // end if (didExceedTime())

        // if we haven't already exceeded our time limit then process
        // the changes for this operativeSet
        var isRemovals = operations[start].isRemoval,
          additions = isRemovals ? 0 : length,
          removals = isRemovals ? length : 0,
          notifyStart = operations[start].idx;

        this.arrayContentWillChange(notifyStart, removals, additions);

        // do all the changes
        for (var i=start;i<(length+start);i++) {
          // +_doOperation+ was set up in +_calculateOperation+
          operations[i]._doOperation();
        }

        this.arrayContentDidChange(notifyStart, removals, additions);
        this.enumerableContentDidChange();

        if (this.DEBUG_QUERY_ARRAY) {
          SC.Logger.log('DS.QueryArray: time remaining %@ ms'.fmt(timeRemaining()));
        }
      }, this); // end operativeSet.forEachRange
    }, this);   // end [removeSets, addSets].forEach

    if (modificationTimeExceeded) return;

    // only mark the _modificationInProgress done if
    // this modification did NOT timeout
    // use +set+ to alert +_modificationInProgressObserver+
    // to run any queued changes
    if (_resuming) {
      this.setIfChanged('_modificationInProgress',false);
    } else {
      this._modificationInProgress = false;
    }

    // handle any index shifts
    if (indexShift && indexShift.get('isShift')) {
      if (this.DEBUG_QUERY_ARRAY) {
        SC.Logger.warn("DS.QueryArray._modifyObserverSet: Index shift detected: %@, translating IndexSet: %@".fmt(indexShift, this._indexSet));
      }
      this._indexSet = indexShift.translateIndexSet(this._indexSet);
      if (this.DEBUG_QUERY_ARRAY) {
        SC.Logger.log("DS.QueryArray._modifyObserverSet: Translated IndexSet: %@".fmt(this._indexSet));
      }
    }

    // cleanup
    delete removeSets;
    delete addSets;
    delete operations;

    this._innerCacheEnable();
  },

  /**
   * @private
   * @see _flushChanges
   */
  /**
   * TODO: we really need to delay _calculateOperation if this._modificationInProgress
   * is true.  It will affect what is calculated for this.contains(idx)
   */
  _calculateOperation: function(obj, idx, qry, idxSet, isRemoval) {
    qry = qry || this.get('query');
    idxSet = idxSet || this._indexSet;

    var queryContained = qry.contains(obj,this.get('queryParameters')),
      contained = this._indexSet.contains(idx),
      isAddition = (!contained && queryContained),
      that = this;

    isRemoval = SC.none(isRemoval) ? (contained && !queryContained) : isRemoval;

    if (!isAddition && !isRemoval) return null; // noop

    return {
      set: idxSet,
      idx: idx,
      isAddition: isAddition,
      isRemoval: isRemoval,
      done: false,
      _doOperation: function() {
        if (this.done) return;

        if (this.isAddition) {
          if (that.DEBUG_QUERY_ARRAY) SC.Logger.warn('DS.QueryArray._calculateOperation._doOperation: item added to query array');
          this.set.add(this.idx);
        } else if (this.isRemoval) {
          if (that.DEBUG_QUERY_ARRAY) SC.Logger.warn('DS.QueryArray._calculateOperation._doOperation: item removed from query array');
          this.set.remove(this.idx);
        }

        this.done = true;
      }
    };
  }
});

/**
 * This object is used to extend DataStructures.QueryArray below.
 *
 * In the query array - range observers are actually sent down to
 * observe on the referenceArray. Since the referenceArray could be
 * swapped out at any give time, or possibly not exist at the time the
 * range observers are set up we need a way to setup all the range
 * observers everytime referenceArray gets set. I wanted this code to
 * be a bit modular and not pollute the existing implementation of
 * add/update/removeRangeObserver that exists in QueryArray proper
 * (above).  That code is responsible for translating between IndexSet
 * spaces (public/private index space).  This code is for caching what
 * is necessary to rebuild and remove array observers when the
 * referenceArrayChanges.  This code gets mixed over those functions
 * and wrap calls to them with sc_super.  It makes the whole
 * implementation that much cleaner.  It does add an extra observer on
 * _referenceArray_ but I can live with that.
 */
DataStructures.QueryArray.RangeObserverRebuild = {
  _qaRangeObs_inRestore: null,

  addRangeObserver: function(/* @see sc_super */) {
    var observer = sc_super();

    if (!this._qaRangeObs_inRestore)
      this._storeRangeObserverArgs(observer, SC.A(arguments));

    return observer;
  },

  updateRangeObserver: function(/* @see sc_super */) {
    this._storeRangeObserverArgs.apply(this, SC.A(arguments));
    return sc_super();
  },

  removeRangeObserver: function(/* @see sc_super */) {
    this._removeStoredRangeObserver(arguments[0]);
    return sc_super();
  },

  // when the referenceArray changes, we must remove all range observers
  // from the old referenceArray and add them to the new one
  _rangeObserverMap: null,

  _storeRangeObserverArgs: function(observer, args) {
    if (!this._rangeObserverMap) this._rangeObserverMap = {};
    args = SC.A(args);

    if (!observer) {
      observer = SC.Object.create({
        observerStub: true,
        message: 'reference array wasn\'t set up yet'
      });
    }

    var hash = SC.hashFor(observer),
      update = !!this._rangeObserverMap[hash];

    if (update) {
      var indexSet = args[0],
        updateArgs = this._rangeObserverMap[hash].arguments;
      updateArgs[0] = indexSet,
      this._rangeObserverMap[hash].arguments = updateArgs;
    } else {
      this._rangeObserverMap[hash] = {
        observer: observer,
        arguments: args
      };
    }
  },

  _removeStoredRangeObserver: function(observer) {
    if (!this._rangeObserverMap) this._rangeObserverMap = {};

    var hash = SC.hashFor(observer);
    delete this._rangeObserverMap[hash];
  },

  /**
   * called when a referenceArray gets unset
   */
  _teardownRangeObserversOnArray: function(array) {
    if (!this._rangeObserverMap) this._rangeObserverMap = {};

    for(var ro in this._rangeObserverMap) {
      if (!this._rangeObserverMap.hasOwnProperty(ro)) continue;
      var observer = this._rangeObserverMap[ro].observer;

      if (!observer) {
        SC.Logger.warn('bad range observer in query array... hmmm?');
        delete this._rangeObserverMap[ro];
        continue;
      }

      // don't call +removeRangeObserver+ on this!!!
      // that would remove the observer from our _rangeObserverMap.
      // we only want to unregister the observer from the old
      // reference array
      array.removeRangeObserver(observer);
    }
  },

  /**
   * called when a new referenceArray gets set
   */
  _setupRangeObserversOnThis: function() {
    if (!this._rangeObserverMap) this._rangeObserverMap = {};

    var observers = [];

    this._qaRangeObs_inRestore = true;
    for(var ro in this._rangeObserverMap) {
      if (!this._rangeObserverMap.hasOwnProperty(ro)) continue;
      var args = this._rangeObserverMap[ro].arguments;

      if (!args) {
        SC.Logger.warn('bad range observer arguments in query array... hmmm?');
        delete this._rangeObserverMap[ro];
        continue;
      }

      // as opposed to the call to +_teardownRangeObserversOnArray+
      // this function needs to run the observers through the
      // QueryArray path for adding range observers so that the
      // callbacks can be wrapped by the index set translators
      observers.push(this.addRangeObserver.apply(this, args));
    }
    this._qaRangeObs_inRestore = false;

    var changes = SC.IndexSet.create(0, this.get('referenceArray').get('length'));
    observers.forEach(function(observer) {
      observer.rangeDidChange(changes);
    });
  },

  _qaRangeObs_refArr_cached: null,
  _qaRangeObs_refArr_didChange: function() {
    var ra = this.get('referenceArray');

    if (SC.isEqual(this._qaRangeObs_refArr_cached, ra)) return;

    if (this._qaRangeObs_refArr_cached) {
      this._teardownRangeObserversOnArray(this._qaRangeObs_refArr_cached);
      delete this._qaRangeObs_refArr_cached;
    }

    if (ra) {
      this._setupRangeObserversOnThis();
      this._qaRangeObs_refArr_cached = ra;
    }
  }.observes('referenceArray')
};

// TODO: why doesn't mixing into the prototype or using +DataStructures.QueryArray.reopen+ work?
DataStructures.QueryArray = DataStructures.QueryArray.extend(DataStructures.QueryArray.RangeObserverRebuild);
