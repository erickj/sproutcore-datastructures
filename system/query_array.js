require('ext/delegate_support');

Contact.QueryArray = SC.Object.extend(SC.Array, SC.DelegateSupport, {
  MAXTIME: 100,

  referenceArray: null,
  query: null,

  _indexSet: null,

  init: function() {
    var idxSet = SC.IndexSet.create();
    this.set('_indexSet', idxSet);

    var delegatedAPI = {
      // TODO: contains is wrong
      contains      : idxSet.contains,
      forEachObject : idxSet.forEachObject,
      forEach       : idxSet.forEachObject
    };

    this.delegateAPI(idxSet, delegatedAPI);

    this.beginPropertyChanges();
    ['referenceArray', 'query'].forEach(function(p) {
      if (this.get(p)) this.notifyPropertyChange(p);
    },this);
    this.endPropertyChanges();
  },

  replace: function() {
    // TODO: do this better
    throw "Immutable!!!";
  },

  /**
   * provide support for +objectAt+
   */
  get: function(idx) {
    if (idx === parseInt(idx)) {
      return this.get('referenceArray').objectAt(this._mapPublicToPrivateIndex(idx));
    }
    return sc_super();
  },

  length: function() {
    return this._indexSet.get('length');
  }.property('[]'),

  indexOf: function(obj,startAt) {
    startAt = this._mapPublicToPrivateIndex(startAt);
    var i = this._indexSet.indexOf(obj,startAt);
    return this._mapPrivateToPublicIndex(i);
  },

  lastIndexOf: function(obj,startAt) {
    startAt = this._mapPublicToPrivateIndex(startAt);
    var i = this._indexSet.lastIndexOf(obj,startAt);
    return this._mapPrivateToPublicIndex(i);
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
   */

  // TODO - override add/removeArrayObserver to curry mapped
  // indices into the willChange/didChange callbacks into the referenceArray

  /**
   * proxy all range observer calls into the reference array after
   * mapping the indices appropriately
   */
  addRangeObserver: function(indices, target, method, context) {
    var ref = this.get('referenceArray'),
      args = SC.A(arguments);

    if (indices && indices.isIndexSet) {
      args[0] = this._translateIndexSet(indices);
    }

    // we need to wrap the callback in a function that will guard
    // against changes to indices that aren't in our query array.
    // in the case that _indcies_ is null (meaning the caller wants
    // to watch the whole array) we have to pass that value into
    // the referenceArray as null.  we need to do this so future
    // additions to this queryArray (via the referenceArray) will
    // be monitored as well.  this has the side effect that any change
    // to the referenceArray, even those that are filtered out of
    // this query array will be sent to the range observer callback.
    // this wrapper intercepts the callback and checks that the
    // indices sent to it are in the query array first.  this wrapped
    // method also translates the indices from the private index space
    // into the public index space
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
      return function _qaAnonProxiedRangeObserverCb() {
        var args = SC.A(arguments),
          refIndexSet = args[3],
          localIndexSet = that._indexSet;

        var first = refIndexSet.firstObject(),
          len = refIndexSet.get('length'),
          mappedIndexSet = SC.IndexSet.create();

        // the localIndexSet and refIndexSet are in the same
        // vector space so indexes can be compared directly.
        // loop through _localIndexSet_ since it MUST be <=
        // _refIndexSet_
        localIndexSet.forEachIn(first, len, function(idx) {
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

    if (indices && indices.isIndexSet) {
      args[1] = this._translateIndexSet(indices);
    }

    return ref.updateRangeObserver.apply(ref, args);
  },

  removeRangeObserver: function(rangeObserver) {
    var ref = this.get('referenceArray'),
      args = SC.A(arguments);
    return ref.removeRangeObserver.apply(ref, args);
  },

  /**
   * TODO: this could be sped up by iterating over ranges rather than
   * indices, or by using the IndexSet+replace+ function, but that can
   * be done later
   */
  /**
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
   * TODO: this is implemented in the most naive approach possible
   * currently. no care has been taken for speed optimizations.
   *
   * THIS WILL MAKE SHIT SLOOOOOOOOOWWWWWWWWW!!!!!!!!!!!!!!!!!!!
   */
  /**
   * @private
   * counting's hard... AHHHHHHHHHHH!!!!!!!!!!!!!!!!
   *
   * map an index from the public index space into the private index space
   */
  _mapPublicToPrivateIndex: function(publicIdx) {
    var indexSet = this._indexSet,
      privateIndex = indexSet.firstObject();

    while(!SC.none(privateIndex)
          && publicIdx > 0
          && privateIndex >= 0) {
      publicIdx--;
      privateIndex = indexSet.indexAfter(privateIndex);
    }
    return (0 <= publicIdx && publicIdx < this.get('length')) ? privateIndex : -1;
  },

  /**
   * TODO: this is implemented in the most naive approach possible
   * currently. no care has been taken for speed optimizations.
   *
   * THIS WILL MAKE SHIT SLOOOOOOOOOWWWWWWWWW!!!!!!!!!!!!!!!!!!!
   */
  /**
   * @private
   * counting's hard... AHHHHHHHHHHH!!!!!!!!!!!!!!!!
   *
   * map an index from the private index space into the public index space
   */
  _mapPrivateToPublicIndex: function(privateIdx) {
    var indexSet = this._indexSet,
      curPrivateIdx = indexSet.firstObject(),
      publicIdx = -1;

    while(!SC.none(curPrivateIdx)
          && privateIdx >= curPrivateIdx
          && curPrivateIdx >= 0) {
      publicIdx++;
      curPrivateIdx = indexSet.indexAfter(curPrivateIdx);
    }
    return (curPrivateIdx == ++privateIdx) ? publicIdx : -1;
  },

  /**
   * @private
   */
  _refArrElems_willChange: function(start,removed,added) {
    if (removed && removed > 0) {
      this._flushChanges(start,removed,true);
    }
    // TODO: teardown property chains when elems are removed from array
    // @see sproutcore/f0be4029a186f5b1ce33c494878c126644dfd57f
  },

  /**
   * @private
   */
  _refArrElems_didChange: function(start,removed,added) {
    if (added && added > 0) {
      this._flushChanges(start,added);
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
  _refArrEl_propDidChange: function(obj,prop,val,rev) {
    var i = this.get('referenceArray').indexOf(obj);

    if (obj && !SC.none(i) && i >= 0) {
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
    this.get('query').parse();
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
   * @param isRemoval - we can't always use +_calculateOperation+ to determine if the object should be removed or not since we're using removals from +refArrElems_willChange+. the objects will still be in the reference array.  use isRemoval to force calculating the operation as a removal
   */
  _flushChanges: function(start,changed,isRemoval) {
    // we need to wait to calculate our flush changes until after
    // any currently running modification has completed
    if (this._modificationInProgress) {
      if (!this._flushQueue) this._flushQueue = [];
      this._flushQueue.push(SC.A(arguments));
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

    this._doModifications(addSets, removeSets, operations);
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
   * @param _resuming - bool - internal use only
   */
  _doModifications: function(addSets, removeSets, operations /*, _resuming */) {
    var startTime = (new Date()).getTime(),
      modificationTimeExceeded = false,
      that = this,
      didExceedTime = function _qaInnerDidExceedTime() {
        var delta = (new Date()).getTime() - startTime;
        return delta > that.MAXTIME;
      },
      makeCallback = function _qaInnerMakeCb(addSets, removeSets, operations, _resuming) {
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

      // mark which indices have completed so we can resume at the
      // proper point later if we hit the timeout
      if (!operativeSet._qa_done) operativeSet._qa_done = [];

      // wrap processing contiguous indices of the operative set (each range)
      // in calls to arrayContentWillChange, arrayContentDidChange, and
      // enumerableContentDidChange.  this will minimize calls made to objects
      // observing this query array
      operativeSet.forEachRange(function _qaInnerOpSetRangeIterator(start, length) {
        // if modificationTimeExceeded then we will not process the
        // remaining ranges after detecting a timeout.
        // if operativeSet._qa_done.contains(start) then this whole range has
        // been completed in a previous _doModification call.
        if (modificationTimeExceeded
            || operativeSet._qa_done.contains(start)) {
          return;
        }

        var isRemovals = operations[start].isRemoval,
          additions = isRemovals ? 0 : length,
          removals = isRemovals ? length : 0;

        // notify observers
        this.arrayContentWillChange(start, removals, additions);

        // TODO: timeout batching doesn't work at the current level.
        // it needs to move into a record by record basis check
        for (var i=start;i<(length+start);i++) {
          operations[i]._doOperation(); // +_doOperation+ was set up in +_calculateOperation+
          operativeSet._qa_done.push(i); // mark this range as done (this really only needs to be done for _start_)
        }

        // notify observers
        this.beginPropertyChanges();
        this.arrayContentDidChange(start, removals, additions);
        this.enumerableContentDidChange();
        this.endPropertyChanges();

        // we've finished processing the entire current range -
        // check if we exceeded our timelimit, if so schedule another run
        if (didExceedTime()) {
          SC.Logger.warn('query array modification time exceeded, rescheduling');

          // we don't need to modify anything for continuing the modification
          // because we're marking indices "done" as modifications are completed
          var cb = makeCallback(addSets, removeSets, operations, true);

          // use setTimeout for same idea as in SC.RecordArray,
          // invokeLater may put us in the same event loop - so
          // we want to avoid that
          setTimeout(function _qaInnerSetTimeoutCb() {
            // TODO: this may actually schedule a rerun when we have completed
            // all the sets... it will effectively be a noop - oh well for now
            SC.run(function _qaInnerSetTimeoutSCRunCb() {
              if (!that || that.get('isDestroyed')) {
                SC.Logger.warn('failed to complete delayed query array modification, query array does not exist');
              } else {
                cb(); // continue the modification
              }
              delete cb;
            });
          },0); // end setTimeout
          modificationTimeExceeded = true;
        }       // end if (didExceedTime())
      }, this); // end operativeSet.forEachRange
    }, this);   // end [removeSets, addSets].forEach

    if (modificationTimeExceeded) return;

    // only mark the _modificationInProgress done if
    // this modification did NOT timeout
    // use +set+ to alert +_modificationInProgressObserver+
    // to run any queued changes
    this.set('_modificationInProgress',false);

    // cleanup
    delete removeSets._qa_done;
    delete addSets._qa_done;
    delete removeSets;
    delete addSets;
    delete operations;
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

    var queryContained = qry.contains(obj),
      contained = this.contains(idx),
      isAddition = (!contained && queryContained);

    isRemoval = SC.none(isRemoval) ? (contained && !queryContained) : isRemoval;

    if (!isAddition && !isRemoval) return null; // noop

    return {
      set: idxSet,
      idx: idx,
      isAddition: isAddition,
      isRemoval: isRemoval,
      _doOperation: function() {
        if (this.isAddition) {
          SC.Logger.warn('item added to query array');
          this.set.add(this.idx);
        } else if (this.isRemoval) {
          SC.Logger.warn('item removed from query array');
          this.set.remove(this.idx);
        }
      }
    };
  }
});
