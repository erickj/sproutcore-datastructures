// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================

/**
 * Overview:
 *
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
 * IndexShifts are used to provide a canonical description of these
 * array modifications to an IndexSet, so that a new set may be
 * created that yields the same result as the original set.
 *
 * IndexShifts are defined as net changes in the size of a reference
 * array. There are 3 dimensions of shifts: the class, the sign, and
 * the complexity.
 *
 * Class:
 *
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
 * shift has elements in the original array anchored to the right
 * (additions/removals happen on the left), an inner shift has anchors
 * on the left and right (additions/removals are in between), and a
 * right shift has anchors to the left (additions/removals occur on
 * the right).
 *
 * Sign:
 *
 * negativeShift:
 *   a negative net change
 *
 * positiveShift:
 *   a positive net change
 *
 * Each shift class example above lists a negativeShift on the left
 * and a positiveShift on the right.
 *
 * Complexity:
 *
 * A complex shift is a shift with both additions AND removals.  A
 * simple shift is one which only has additions OR removals.
 *
 * Usage:
 *
 * To create an index shift, do it from the +willChange+ function of
 * an array observer. Create the IndexShift with the parameters
 * supplied to the +willChange+ function plus the current array
 * length:
 *
 * willChange: function(start, removed, added) {
 *   var shift = DataStructures.IndexShift.create({
 *     start: start,
 *     added: added,
 *     removed: removed,
 *     length: array.get('length')
 *   });
 * }
 *
 * Once you have a shift and the changes have processed in the array,
 * then apply the changes to the IndexSet in the +didChange+ function
 * of an array observer.
 *
 * didChange: function(start, removed, added) {
 *   var newIndexSet = shift.translateIndexSet(oldIndexSet);
 * }
 */
DataStructures.IndexShift = SC.Object.extend({

  DEBUG: NO,

  /**
   * these values can be set directly from parameters passed to
   * +arrayWillChange+
   */
  added: null,
  removed: null,
  start: null,

  /**
   * this should be the length of the array BEFORE the change occurs
   * (i.e. the length at the time +arrayWillChange+ observer fires)
   */
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
     * N.B.: hacky special case - there is probably a more elegant
     * answer to this question. to see the bug set
     * _specialCaseSolution_ to false and run
     * tests/system/index_shift.  Track down the bug you find there to
     * figure out the question to the problem.  Seeing the problem
     * will be better than I can do explaining it, but here's my
     * attempt:
     *
     * In my original implementation, when a complex negaitve right
     * shift occured, if the start index plus the number of removed
     * elements is equal to the length of the array, the original
     * heuristic calculated it as an inner shift, when it was actually
     * a right shift.  There is probably a more normal form for the
     * left/inner/right calculation below, but this works.
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
  }.property('net', 'start', 'added', 'removed', 'length'),

  desc: function() {
    return [this.get('class'),this.get('sign'),this.get('complexity')].join('/');
  }.property('class','sign','complexity'),

  toString: function() {
    return "IndexShift:<%@>".fmt(this.get('desc'));
  },

  /**
   * @param {SC.IndexSet}
   * @return {SC.IndexSet}
   */
  translateIndexSet: function(indexSet) {
    // right shifts don't require any work - hooray!
    if (!this.get('isShift') || this.get('isRight')) {
      return indexSet;
    }

    var ret = SC.IndexSet.create(indexSet),
      start = this.get('start'),
      indexStart = function() {
        var ret = indexSet.firstObject();
        while (ret < start && ret >= 0) ret = indexSet.indexAfter(ret);
        return indexSet.rangeStartForIndex(ret);
      }(),
      len = ret.get('length');

    var newIndices = [], removeIndices = [];
    indexSet.forEachIn(indexStart, len, function(idx, set, source) {
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
   *
   * @param {Number} - index to translate
   * @return {Number} - translated index
   */
  translateIndex: function(index) {
    var start = this.get('start');

    if (start > index)
      return index; // unaffected by shift

    if (this._wasIndexRemoved(index))
      return null;

    if (this.get('isComplex'))
      return this._complextTranslation(index);

    return this._simpleTranslation(index);
  },

  _simpleTranslation: function(index) {
    var net = this.get('net');
    return index + net;
  },

  // TODO: currently this is IDENTICAL to +_simpleTranslation+,
  // however I believe there may be more to a complex shift.  I think
  // it may be necessary to process the additions and removals
  // separately - however I would need to study shifts more to
  // determine whether this is true or not.
  _complextTranslation: function(index) {
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
