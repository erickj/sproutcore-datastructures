// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================

/**
 * IndexShifts are used to relate changes in an array's indices to an
 * IndexSet.  For example, given the following array, IndexSet, and a
 * transformation:
 *
 *   before transform: [1,2,3,4,5,6,7]
 *   with IndexSet:    {start: 1, length: 3}
 *   yields values:    [2,3,4]
 *
 *   after transform: [1,2,9,10,3,4,5,6,7]
 *   with IndexSet:   {start: 1, length: 3}
 *   yields values:   [2,9,10]
 *
 * In order for the IndexSet to be able to yield the original values,
 * the IndexSet must become:
 *
 *   IndexSet: {start: 1, length: 1}, {start: 4, length: 2}
 *
 * IndexShifts are defined as net changes in the size of a reference
 * array. There are 3 dimensions of shifts, the class, the sign, and
 * the complexity.
 *
 * Shift Class:
 * There are 3 classes of shifts: left, inner, and right.
 * See the following for examples of each:
 *
 * leftShift:  [1,2,3] =>
 *             [2,3] or [0,1,2,3]
 *              . .          . .
 *
 * innerShift: [1,2,3] =>
 *             [1,3] or [1,5,9,3]
 *              . .      .     .
 *
 * rightShift: [1,2,3] =>
 *             [1,2] or [1,2,4,5]
 *              . .      . .
 *
 * The dots (.) above help to display what each class is.  A left
 * shift has elements in the original array anchored to the right,
 * an inner shift has anchors on the left and right, and a right
 * shift has anchors to the left.
 *
 * Shift Sign:
 * negativeShift:
 *   a negative net change
 *
 * positiveShift:
 *   a positive net change
 *
 * Each shift class example above lists a negativeShift on the left
 * and a positiveShift on the right.
 *
 * Shift Complexity:
 * A complex shift is a shift with both additions and removals.  A
 * simple shift is one which only has additions OR removals.
 *
 * This yields 12 permutations of shifts.
 */
DataStructures.IndexShift = SC.Object.extend({
  added: null,
  removed: null,
  start: null,
  length: null,

  net: function() {
    return this.get('added') - this.get('removed');
  }.property('added','removed'),

  isComplex: function() {
    return this.get('added') > 0 && this.get('removed') > 0;
  }.property('added','removed'),

  isShift: function() {
    return ['left','inner','right'].contains(this.get('class'));
  }.property('class'),

  isRight: function() {
    return this.get('class') == 'right';
  }.property('class'),

  isLeft: function() {
    return this.get('class') == 'left';;
  }.property('class'),

  isInner: function() {
    return this.get('class') == 'inner';
  }.property('class'),

  sign: function() {
    return this.get('net') >= 0 ? 'positive' : 'negative';
  }.property('net'),

  complexity: function() {
    return this.get('isComplex') ? 'complex' : 'simple';
  }.property('isComplex'),

  'class': function() {
    var start = this.get('start'),
      added = this.get('added'),
      removed = this.get('removed'),
      lastAffectedIndex = start + added - removed,
      lastIndex = this.get('length') - 1,
      newLength = this.get('length') + this.get('net'),
      newLastIndex = newLength - 1;

    /**
     * TODO: hacky special case - there is probably a more elegant
     * answer to this question. to see the bug set
     * _specialCaseSolution_ to false and run
     * tests/system/index_shift.  Track down the bug you find there to
     * figure out the question to the problem.  Seeing the problem
     * will be better than I can do explaining it.
     */
    var specialCase = (this.get('length') == start + removed);

    if (this.DEBUG) {
      SC.Logger.log('start/added/removed',start,added,removed);
      SC.Logger.log('lastAffectedIndex/newLastIndex',lastAffectedIndex,newLastIndex);
      SC.Logger.log('length/newLength',this.get('length'),newLength);
    }

    if (this.get('net') == 0) return 'noshift';

    if (start == 0 && lastAffectedIndex < newLastIndex)
      return 'left';

    if (start > 0 && lastAffectedIndex < newLastIndex && !specialCase)
      return 'inner';

    if (start > 0 && lastAffectedIndex >= newLastIndex || specialCase)
      return 'right';

    return 'unknown';
  }.property('net', 'start', 'added', 'removed'),

  desc: function() {
    return [this.get('class'),this.get('sign'),this.get('complexity')].join('/');
  }.property('class','sign','complexity'),

  toString: function() {
    return "IndexShift:<%@>".fmt(this.get('desc'));
  },

  translateIndexSet: function(indexSet) {
    if (!this.get('isShift') || this.get('isRight')) {
      return indexSet;
    }
    var ret = SC.IndexSet.create(indexSet),
      start = this.get('start'),
      st = function() {
        var ret = indexSet.firstObject();
        while (ret < start && ret >= 0) ret = indexSet.indexAfter(ret);
        return indexSet.rangeStartForIndex(ret);
      }(),
      ln = ret.get('length');

    var newIndices = [], removeIndices = [];
    indexSet.forEachIn(st, ln, function(idx, set, source) {
      var translated = this.translateIndex(idx);

      if (this.DEBUG) {
        SC.Logger.warn("Index %@ translated to %@".fmt(idx,translated));
      }

      if (translated != idx) {
        removeIndices.push(idx);
        newIndices.push(translated);
      }
    },this);

    ret.removeEach(removeIndices);
    ret.addEach(newIndices.compact());

    return ret;
  },

  /**
   * translate an index in this shift, null indicates it was removed
   */
  translateIndex: function(index) {
    var start = this.get('start');

    if (start > index)
      return index; // unaffected by shift

    if (this._wasIndexRemoved(index))
      return null;

    if (this.get('isComplex'))
      return this._complextTranslateIndex(index);

    return this._simpleTranslateIndex(index);
  },

  _complextTranslateIndex: function(index) {
    var net = this.get('net');
    return index + net;
  },

  _simpleTranslateIndex: function(index) {
    var net = this.get('net');
    return index + net;
  },

  _wasIndexRemoved: function(index) {
    var removed = this.get('removed'),
      start = this.get('start'),
      lastRemovedIndex = this.get('start') + removed - 1;

    return removed && start <= index && index <= lastRemovedIndex;
  }
});
