// ==========================================================================
// Project:   DataStructures.IndexShift Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var array, shift, hash, lastIndex;
module("DataStructures.IndexShift", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    array = [1,2,3,4]; // you need at least 4 elements for an inner complex negative shift
    lastIndex = array.length - 1;
    hash = {
      DEBUG: YES,
      length: array.length
    };

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      shift = DataStructures.IndexShift.create(hash);
    });

    ok(SC.instanceOf(shift, DS.IndexShift), "prereq - shift is an IndexShift");
    equals(shift.length, array.length, "prereq - shift has length %@".fmt(array.length));
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');

      shift.destroy();
    });
    delete array;
    delete hash;

    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

/**
 * Nonshifts
 */
test("IndexShift knows when it's not a shift", function() {
  /**
   * left simple net 0
   */
  shift.beginPropertyChanges();
  shift.set('start',0);
  shift.set('added',0);
  shift.set('removed',0);
  shift.endPropertyChanges();

  ok(!shift.get('isShift'), 'left simple net 0 shifts should NOT be an index shift');

  /**
   * left complex net 0
   */
  shift.beginPropertyChanges();
  shift.set('start',0);
  shift.set('added',1);
  shift.set('removed',1);
  shift.endPropertyChanges();

  ok(!shift.get('isShift'), 'left complex net 0 shifts should NOT be an index shift');

  /**
   * inner simple net 0
   */
  shift.beginPropertyChanges();
  shift.set('start',1);
  shift.set('added',0);
  shift.set('removed',0);
  shift.endPropertyChanges();

  ok(!shift.get('isShift'), 'inner simple net 0 shifts should NOT be an index shift');

  /**
   * inner complex net 0
   */
  shift.beginPropertyChanges();
  shift.set('start',1);
  shift.set('added',1);
  shift.set('removed',1);
  shift.endPropertyChanges();

  ok(!shift.get('isShift'), 'inner complex net 0 shifts should NOT be an index shift');

  /**
   * right simple net 0
   */
  shift.beginPropertyChanges();
  shift.set('start',lastIndex);
  shift.set('added',0);
  shift.set('removed',0);
  shift.endPropertyChanges();

  ok(!shift.get('isShift'), 'right simple net 0 shifts should NOT be an index shift');

  /**
   * inner complex net 0
   */
  shift.beginPropertyChanges();
  shift.set('start',lastIndex);
  shift.set('added',1);
  shift.set('removed',1);
  shift.endPropertyChanges();

  ok(!shift.get('isShift'), 'right complex net 0 shifts should NOT be an index shift');
});

/**
 * Left shifts
 */

/* simple negative */
test("IndexShift calculates simple negative left shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',0);
  shift.set('added',0);
  shift.set('removed',1);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'left', 'shift should be a left shift');
  equals(shift.get('net'), -1, 'shift should have a net -1');
  ok(!shift.get('isComplex'), 'shift should be a simple shift');
});

/* complex negative */
test("IndexShift calculates complex negative left shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',0);
  shift.set('added',1);
  shift.set('removed',2);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'left', 'shift should be a left shift');
  equals(shift.get('net'), -1, 'shift should have a net -1');
  ok(shift.get('isComplex'), 'shift should be a complex shift');
});

/* simple positive */
test("IndexShift calculates simple positive left shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',0);
  shift.set('added',1);
  shift.set('removed',0);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'left', 'shift should be a left shift');
  equals(shift.get('net'), 1, 'shift should have a net 1');
  ok(!shift.get('isComplex'), 'shift should be a simple shift');
});

/* complex positive */
test("IndexShift calculates complex positive left shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',0);
  shift.set('added',2);
  shift.set('removed',1);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'left', 'shift should be a left shift');
  equals(shift.get('net'), 1, 'shift should have a net 1');
  ok(shift.get('isComplex'), 'shift should be a complex shift');
});

/**
 * Inner shifts
 */

/* simple negative */
test("IndexShift calculates simple negative inner shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',1);
  shift.set('added',0);
  shift.set('removed',1);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'inner', 'shift should be a inner shift');
  equals(shift.get('net'), -1, 'shift should have a net -1');
  ok(!shift.get('isComplex'), 'shift should be a simple shift');
});

/* complex negative */
test("IndexShift calculates complex negative inner shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',1);
  shift.set('added',1);
  shift.set('removed',2);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'inner', 'shift should be a inner shift');
  equals(shift.get('net'), -1, 'shift should have a net -1');
  ok(shift.get('isComplex'), 'shift should be a complex shift');
});

/* simple positive */
test("IndexShift calculates simple positive inner shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',1);
  shift.set('added',1);
  shift.set('removed',0);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'inner', 'shift should be a inner shift');
  equals(shift.get('net'), 1, 'shift should have a net 1');
  ok(!shift.get('isComplex'), 'shift should be a simple shift');
});

/* complex positive */
test("IndexShift calculates complex positive inner shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',1);
  shift.set('added',2);
  shift.set('removed',1);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'inner', 'shift should be a inner shift');
  equals(shift.get('net'), 1, 'shift should have a net 1');
  ok(shift.get('isComplex'), 'shift should be a complex shift');
});

/**
 * Right shifts
 */

/* simple negative */
test("IndexShift calculates simple negative right shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',lastIndex);
  shift.set('added',0);
  shift.set('removed',1);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'right', 'shift should be a right shift');
  equals(shift.get('net'), -1, 'shift should have a net -1');
  ok(!shift.get('isComplex'), 'shift should be a simple shift');
});

/* complex negative */
test("IndexShift calculates complex negative right shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',lastIndex);
  shift.set('added',1);
  shift.set('removed',2);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'right', 'shift should be a right shift');
  equals(shift.get('net'), -1, 'shift should have a net -1');
  ok(shift.get('isComplex'), 'shift should be a complex shift');
});

/* simple positive */
test("IndexShift calculates simple positive right shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',lastIndex);
  shift.set('added',1);
  shift.set('removed',0);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'right', 'shift should be a right shift');
  equals(shift.get('net'), 1, 'shift should have a net 1');
  ok(!shift.get('isComplex'), 'shift should be a simple shift');
});

/* complex positive */
test("IndexShift calculates complex positive right shifts", function() {
  shift.beginPropertyChanges();
  shift.set('start',lastIndex);
  shift.set('added',2);
  shift.set('removed',1);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'right', 'shift should be a right shift');
  equals(shift.get('net'), 1, 'shift should have a net 1');
  ok(shift.get('isComplex'), 'shift should be a complex shift');
});

/* found bug when doing translations.js tests */
/*
 * [1,2,3,4] => [1,2,0] should be a right shift
 */
test("IndexShift calculates complex positive right shifts - regression bug test", function() {
  shift.beginPropertyChanges();
  shift.set('start',lastIndex-1);
  shift.set('added',1);
  shift.set('removed',2);
  shift.endPropertyChanges();

  equals(shift.get('class'), 'right', 'shift should be a right shift');
  equals(shift.get('net'), -1, 'shift should have a net -1');
  ok(shift.get('isComplex'), 'shift should be a complex shift');
});
