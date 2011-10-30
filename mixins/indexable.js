// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
DataStructures.Indexable = {

  DEBUG_INDEXABLE: NO,

  /* quack */
  isIndexable: YES,

  index: null,

  indexable: null, // [key, value]

  // add to index
  initMixin: function() {
    this.addObserver('index', '_indexDidChange');
    this.addObserver('indexable', '_indexingDidChange');

    this._indexDidChange();
    this._indexingDidChange();
  },

  // remove from index
  destroyMixin: function() {
    this._removeFromIndex(this.get('index'), SC.A(this._cachedIndexable));

    this.removeObserver('index', '_indexDidChange');
    this.removeObserver('indexable', '_indexingDidChange');

    this._cachedIndex     = null;
    this._cachedIndexable = null;
    this.index            = null;
    this.indexable        = null;
  },

  _cachedIndex: null,
  _indexDidChange: function() {
    var idx = this.get('index');

    if (this._cachedIndex == idx) return;

    if (this._cachedIndex && this._cachedIndexable) {
      this._removeFromIndex(this._cachedIndex, SC.A(this._cachedIndexable));
    }

    if (idx && this._cachedIndexable) {
      this._addToIndex(idx, SC.A(this._cachedIndexable));
    }

    this._cachedIndex = idx;
  },

  _cachedIndexable: null,
  _indexingDidChange: function() {
    if (this.DEBUG_INDEXABLE)
      SC.Logger.log('DS.Indexable+_indexingDidChange+:',arguments);

    var indexable = SC.A(this.get('indexable')),
      changed = !this._cachedIndexable; // first time through this will be true

    if (this._cachedIndexable
        && ((this._cachedIndexable[0] != indexable[0]) // detect changes
            ||this._cachedIndexable[1] != indexable[1])) {
      this._removeFromIndex(this.get('index'), this._cachedIndexable);
      this._cachedIndexable = null;

      changed = true;
    }

    if (indexable[0] && indexable[1] && changed) { // only add if changed
      this._addToIndex(this.get('index'), indexable);
      this._cachedIndexable = indexable;
    }
  },

  _addToIndex: function(index,indexable) {
    if (this.DEBUG_INDEXABLE)
      SC.Logger.log('DS.Indexable+_indexingDidChange+: adding to index with args',index, indexable);

    var key = indexable[0],
      value = indexable[1];
    if (index && key && value) {
      index.insert(SC.A(key),value);
    }
  },

  _removeFromIndex: function(index,indexable) {
    if (this.DEBUG_INDEXABLE)
      SC.Logger.log('DS.Indexable+_indexingDidChange+: removing from index with args',index, indexable);

    var key = indexable[0],
      value = indexable[1];
    if (index && key && value) {
      index.remove(SC.A(key),value);
    }
  }
};
