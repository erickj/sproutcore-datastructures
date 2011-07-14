// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/**
 * Overview:
 *
 * As with other DataStructures in this project, the Index should be
 * considered low level, and an application specific API should be
 * placed on top of it.
 *
 * An Index is any data structure that improves lookup performance on
 * a key/value based lookup.  Typically 0 or more values may be
 * returned on the lookup of any key.  The goal of the Index is to
 * make index reads O(1) in the worst case, and less performant on
 * index writes.  The use case is for when applications have data that
 * are very read heavy, and write light.
 *
 * This class provides a KVO friendly implementation of an indexed
 * hash table.  Like SC.Array provides the enumerable property ('[]')
 * and array observers, the DataStructures.Index class provides the
 * index property ('{}') and index observers.  Index observers alert
 * clients when values a certain Index.KeySet will change and did
 * change.  The index property ('{}') alerts clients when any entry in
 * the index has been added or removed.
 *
 * Lookups can be performed on the index that will return an
 * Index.ResultSet for the original lookup query.  If the index is
 * updated at any point in the future, and the values in the original
 * queried KeySet have changed, then bthe Index.ResultSet object will
 * automatically be updated via KVO.
 */
DataStructures.INDEX_INSERTION_EXCEPTION = "No insertions allowed on an index";
DataStructures.INDEX_REPLACE_EXCEPTION = "No replacing values in an index";

DataStructures.Index = SC.Object.extend(SC.Array, {
  DEBUG_INDEX: NO,

  isIndex: YES,

  init: function() {
    this._keyMap = {};        // { key => SC.IndexSet }
    this._reverseKeyMap = {}; // hashFor(obj) => [key, key, key] }
    this._valueList = [];     // [obj,obj,obj]
    this._valueMap = {};      // { hashFor(obj) => idx }

    // removing objects from the value map is dealt with by replacing
    // with [null], this way we don't shift the indices of other
    // objects in the map.  _nextInsertionPoint lets us reuse those
    // slots so our _valueList doesn't look like swiss cheese.
    this._nextInsertionPoint = [];

    this.set('length',0);
    return sc_super();
  },

  destroy: function() {
    delete this._keyMap;
    delete this._reverseKeyMap;
    delete this._valueList;
    delete this._valueMap;
    delete this._nextInsertionPoint;
    this.set('length', 0);
    return sc_super();
  },

  /**
   * implementations should define their own keyTransform
   */
  keyTransform: function(key) {
    return key; // wysiwyg keys
  },

  /**
   * The number of unique values in the index.  This property should
   * be used instead of _length_ to determine the number of items in
   * the index.
   */
  indexLength: function() {
    // _nextInsertionPoint is length zero when there are NO holes to
    // fill in from removals
    var removals = this._nextInsertionPoint && this._nextInsertionPoint.length || 0;
    return this.get('length') - removals;
  }.property('{}'),

  /**
   * Indicates if val is indexed at any of the named keys
   * @param {String} {Array} or {DS.KeySet}
   * @param {Mixed}
   * @return {Boolean}
   */
  isIndexed: function(key, val) {
    var indexKeySet = this.indexSetForKeys(key),
      indexOfVal = this.indexOf(val);

    if (indexOfVal < 0) return false;

    var tmpSet = SC.IndexSet.create(indexOfVal,1);
    return tmpSet.intersects(indexKeySet);
  },

  /**
   * @param {String}, {Array}, or {DS.KeySet}
   * @return {SC.IndexSet}
   */
  indexSetForKeys: function(keys) {
    var keySet = this._keySetForKey(keys),
      lenKeys = keySet.get('length'),
      indexSetForKey;

    var ret = SC.IndexSet.create();

    for(var i=0;i<lenKeys;i++) {
      indexSetForKey = this._keyMap[keySet.objectAt(i)];
      ret.add(indexSetForKey); // union the SC.IndexSets
    }

    return ret; //this._translateIndexSet(ret);
  },

  /**
   * @return {DataStructures.Index.ResultSet}
   */
  lookup: function(keys) {
    return this._lookup.apply(this, arguments);
  },

  /**
   * @param {Mixed} - a single key, an array of keys, or a KeySet
   * @param {Object} - a value object to insert
   */
  insert: function(keys, val /* val2,val3,valN */) {
    this._insertValuesAtKeys.apply(this,arguments);
    return this;
  },

  /**
   * @param {Mixed} - a single key, an array of keys, or a KeySet
   * @param {Object} - a value object to insert
   */
  remove: function(keys, val /* val2,val3,valN */) {
    this._removeValuesAtKeys.apply(this,arguments);
    return this;
  },

  /**
   * @private
   */
  _keySetForKey: function(key) {
    var keySet = key.isKeySet ? key : DS.Index.KeySet.create().set('keys',key),
      keys = keySet.get('keys').map(function(key) {
        return this.keyTransform(key);
      },this);

    return keySet.set('keys',key);
  },

  /**
   * @private
   */
  _insertValuesAtKeys: function(keys,val) {
    var vals = SC.A(arguments).slice(1);

    vals.forEach(function(val) {
      var keySet = this._keySetForKey(keys),
        hashForVal = SC.hashFor(val),
        idx = this._insertValue(val),
        idxSet;

      var reverseMap = this._reverseKeyMap[hashForVal];
      if (!reverseMap) {
        this._reverseKeyMap[hashForVal] = [];
        reverseMap = this._reverseKeyMap[hashForVal];
      }

      keySet.forEach(function(insertionKey) {
        // edit keyMap
        idxSet = this._keyMap[insertionKey];
        if (!idxSet) {
          idxSet = SC.IndexSet.create({
            source: this
          });
          this._keyMap[insertionKey] = idxSet;
        }
        idxSet.add(idx); // idxSet should maintain uniqueness for us

        if (this.DEBUG_INDEX) {
          SC.Logger.log("DS.Index._insertValuesAtKeys: adding index set key %@ with index %@; indexSet after insert %@".fmt(insertionKey,idx,idxSet));
        }

        // edit reverseMap
        reverseMap.push(insertionKey);
      },this);

      // make sure the reverseMap stays unique
      this._reverseKeyMap[hashForVal] = reverseMap.uniq();
    },this);
  },

  /**
   * @private
   */
  _removeValuesAtKeys: function(keys,val) {
    var vals = SC.A(arguments).slice(1);

    vals.forEach(function(val) {
      var keySet = this._keySetForKey(keys),
        hashForVal = SC.hashFor(val),
        idx = this.indexOf(val);

      if (idx < 0) return;

      var reverseMap = this._reverseKeyMap[hashForVal];

      // remove idx from each index set
      keySet.forEach(function(removeKey) {
        // edit reverseMap
        if (reverseMap) {
          reverseMap.removeObject(removeKey);
        } // TODO: should we error if no reverseMap?

        // edit keyMap
        var idxSet = this._keyMap[removeKey];
        idxSet.remove(idx,1);
        if (!idxSet.get('length')) delete this._keyMap[removeKey];

        if (this.DEBUG_INDEX) {
          SC.Logger.log("DS.Index._removeValuesAtKeys: removing index set key %@ with index %@, index set after removal: %@".fmt(removeKey,idx,idxSet));
        }
      },this);

      // check _reverseMap to see if we should remove val
      if (reverseMap.length == 0) {
        this._removeValue(val);
        delete this._reverseKeyMap[hashForVal];
      }
    },this);
  },

  /* @private */
  _insertValue: function(val) {
    var idx = this.indexOf(val);
    if (idx < 0) {
      if (this.DEBUG_INDEX) SC.Logger.log("DS.Index: _insertValue",val);

      // fill in gaps left by _removeValue
      if (this._nextInsertionPoint.length) {
        idx = this._nextInsertionPoint.shift();
      } else {
        idx = this.get('length');
      }

      this.replace(idx,1,[val]);
    }
    return idx;
  },

  /* @private */
  _removeValue: function(val) {
    var idx = this.indexOf(val);
    if (idx >= 0) {
      if (this.DEBUG_INDEX) SC.Logger.log("DS.Index: _removeValue",val);

      // replace with [null] so we don't shift the indexes, EJ spent
      // MANY HOURS trying to close the holes, but instead found inner
      // peace in accepting them.  Instead, let's just mark the holes
      // for reuse on the next insert
      this.replace(idx,1,[null]);

      // reuse this index for the next _insertValue
      this._nextInsertionPoint.push(idx);
    }
    return idx;
  },

  /**
   * Take Notice:
   *
   * Begin array implementation.  The arrayness of an index should be
   * considered private.  This is being done as a poor man's array
   * proxy for _valueList
   *
   * Consider this implmentation private! DO NOT USE THE ARRAY
   * FUNCTIONS, you probably won't get the results you
   * expect... especially the length property!!!  Calling +replace+
   * will just totally F things up. DONT DO IT.
   */
  replace: function(start,rmv,objs) {
    // remove objs from fast lookup map
    if (rmv && rmv > 0) {
      var tmp = rmv;
      while(tmp--) {
        delete this._valueMap[SC.hashFor(this.objectAt(start + tmp))];
      }
    }

    // modify the under lying array
    var ret = this._valueList.replace.apply(this._valueList, arguments);
    this.set('length', this._valueList.length);

    // manually track indexes of objects to make +indexOf+ O(1)
    var objCount = objs && objs.length;
    for (var i=0; i<objCount; i++) if (objs[i]) {
      this._valueMap[SC.hashFor(objs[i])] = start + i;
    }

    return ret;
  },

  objectAt: function(i) {
    var arr = this._valueList;
    return arr.objectAt ? arr.objectAt(i) : arr[i];
  },

  /* O(1) array lookups */
  indexOf: function(obj) {
    var tmp = this._valueMap[SC.hashFor(obj)], ret;
    ret = SC.none(tmp) ? -1 : tmp;
    return ret;
  },

  lastIndexOf: function(obj) {
    return this.indexOf(obj); // there should only be 1!!!
  }

  /**
   * end PRIVATE array implementation
   */
});

/**
 * Observable Mixin, extend BasicIndex so that sc_super is hooked up
 * correctly.  Do the mix-over technique here to separate out the
 * indexObserver implementation from the core implementation above of
 * hash table management.
 */
DataStructures.Index = DataStructures.Index.extend({
  insert: function(key, val /*,val2,val3,...valN */) {
    var ret, keySet,
      vals = SC.A(arguments).slice(1);

    keySet = this._keySetForKey(key);
    this.indexContentWillChange(keySet, 0, vals.length);
    ret = sc_super();
    this.indexContentDidChange(keySet, 0, vals.length);

    return ret;
  },

  remove: function(key, val /*,val2,val3,...valN */) {
    var ret, keySet,
      vals = SC.A(arguments).slice(1);

    keySet = this._keySetForKey(key);
    this.indexContentWillChange(keySet, vals.length, 0);
    ret = sc_super();
    this.indexContentDidChange(keySet, vals.length, 0);

    return ret;
  },

  indexDidChange: function() {
    this.notifyPropertyChange('{}');
  },

  '{}': null,

  /**
   * indexWillChange: function(keySet, removedCount, addedCount, index) {}
   * indexDidChange: function(keySet, removedCount, addedCount, index) {}
   *
   * @param options {Object}
   */
  addIndexObsever: function(options) {
    this._modifyObserverSet('add', options);
  },

  removeIndexObsever: function(options) {
    this._modifyObserverSet('remove', options);
  },

  /* scoped from sproutcore/runtime/array.js */
  _modifyObserverSet: function(method, options) {
    var willChangeObservers, didChangeObservers;

    var target     = options.target || this;
    var willChange = options.willChange || 'indexWillChange';
    var didChange  = options.didChange || 'indexDidChange';
    var context    = options.context;

    if (typeof willChange === "string") {
      willChange = target[willChange];
    }

    if (typeof didChange === "string") {
      didChange = target[didChange];
    }

    willChangeObservers = this._kvo_for('_kvo_index_will_change', SC.ObserverSet);
    didChangeObservers  = this._kvo_for('_kvo_index_did_change', SC.ObserverSet);

    willChangeObservers[method](target, willChange, context);
    didChangeObservers[method](target, didChange, context);
  },

  indexContentWillChange: function(keySet, removedCount, addedCount) {
    // TODO: content observers for indexed content?
//    this._teardownContentObservers(start, removedCount);

    var member, members, membersLen, idx;
    var target, action;
    var willChangeObservers = this._kvo_index_will_change;
    if (willChangeObservers) {
      members = willChangeObservers.members;
      membersLen = members.length;

      for (idx = 0; idx < membersLen; idx++) {
        member = members[idx];
        target = member[0];
        action = member[1];
        action.call(target, keySet, removedCount, addedCount, this);
      }
    }
  },

  indexContentDidChange: function(keySet, removedCount, addedCount) {
    var rangeob = this._array_rangeObservers,
        newlen, length, changes ;

    this.beginPropertyChanges();

    // TODO: content observers for indexed content?
//    this._setupContentObservers(start, addedCount);

    var member, members, membersLen, idx;
    var target, action;
    var didChangeObservers = this._kvo_index_did_change;
    if (didChangeObservers) {
      members = didChangeObservers.members;
      membersLen = members.length;

      for (idx = 0; idx < membersLen; idx++) {
        member = members[idx];
        target = member[0];
        action = member[1];
        action.call(target, keySet, removedCount, addedCount, this);
      }
    }

    this.indexDidChange();
    this.endPropertyChanges();

    return this ;
  }
});
