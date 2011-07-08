// ==========================================================================
// Project:   DataStructures.IndexShift Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var demoArray, indexSet, indexShift, lastIndex,
arrayObservers = {
  target: this, // global object
  willChange: function(start,removed,added) {
    indexShift.beginPropertyChanges();
    indexShift.set('start',start);
    indexShift.set('added',added);
    indexShift.set('removed',removed);
    indexShift.endPropertyChanges();
  },
  didChange: function(start,removed,added) {}
};

module("DataStructures.IndexShift IndexSet Translations", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    /* @see comments at top of system/index_shift.js */

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      demoArray = [1,2,3,4,5,6,7];
      demoArray.addArrayObservers(arrayObservers);
      lastIndex = demoArray.length - 1;

      indexShift = DataStructures.IndexShift.create({
        DEBUG: YES,
        length: demoArray.length
      });

      indexSet = SC.IndexSet.create(1,3);
      indexSet.source = demoArray;
    });

    equals(indexShift.get('length'), demoArray.length, 'prereq - indexShift.length should be set to demoArray.length');

    var tmp = [];
    indexSet.forEachObject(function(v) {
      tmp.push(v);
    });
    ok([2,3,4].isEqual(tmp), 'prereq - indexSet should contain indices for values 2,3,4');
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');

      indexShift.destroy();
      demoArray.removeArrayObservers(arrayObservers);

      delete demoArray;
      delete indexSet;
    });

    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

function testExpectedResult(expectedResult) {
  var tmp = [];
  indexSet.forEachObject(function(v) {
    tmp.push(v);
  });
  ok(expectedResult.isEqual(tmp),
    'indexSet should contain indices for values: %@, indexSet contains: %@'.fmt(expectedResult, tmp));
}

/**
 * left/positive/*
 */
test("IndexShift can translate left/positive/simple shift", function() {
  SC.run(function() {
    demoArray.replace(0,0,[0]);
  });

  ok([0,1,2,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "left/positive/simple",
         'prereq - indexShift should indicat a left/positive/simple shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

test("IndexShift can translate left/positive/complex shift", function() {
  SC.run(function() {
    demoArray.replace(0,1,[-1,0]);
  });

  ok([-1,0,2,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "left/positive/complex",
         'prereq - indexShift should indicat a left/positive/complex shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

/**
 * left/negative/*
 */
test("IndexShift can translate left/negative/simple shift", function() {
  SC.run(function() {
    demoArray.replace(0,1);
  });

  ok([2,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "left/negative/simple",
         'prereq - indexShift should indicat a left/negative/simple shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

test("IndexShift can translate left/negative/complex shift", function() {
  SC.run(function() {
    demoArray.replace(0,2,[0]);
  });

  ok([0,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "left/negative/complex",
         'prereq - indexShift should indicat a left/negative/complex shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [3,4];
  testExpectedResult(expectedResult);
});


/**
 * inner/positive/*
 */
test("IndexShift can translate inner/positive/simple shift", function() {
  SC.run(function() {
    demoArray.replace(1,0,[0]);
  });

  ok([1,0,2,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "inner/positive/simple",
         'prereq - indexShift should indicat a inner/positive/simple shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

test("IndexShift can translate inner/positive/complex shift", function() {
  SC.run(function() {
    demoArray.replace(1,1,[-1,0]);
  });

  ok([1,-1,0,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "inner/positive/complex",
         'prereq - indexShift should indicat a inner/positive/complex shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [3,4];
  testExpectedResult(expectedResult);
});

/**
 * inner/negative/*
 */
test("IndexShift can translate inner/negative/simple shift", function() {
  SC.run(function() {
    demoArray.replace(1,1);
  });

  ok([1,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "inner/negative/simple",
         'prereq - indexShift should indicat a inner/negative/simple shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [3,4];
  testExpectedResult(expectedResult);
});

test("IndexShift can translate inner/negative/complex shift", function() {
  SC.run(function() {
    demoArray.replace(1,2,[0]);
  });

  ok([1,0,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "inner/negative/complex",
         'prereq - indexShift should indicat a inner/negative/complex shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [4];
  testExpectedResult(expectedResult);
});

/**
 * right/positive/*
 */
test("IndexShift can translate right/positive/simple shift", function() {
  SC.run(function() {
    demoArray.replace(lastIndex+1,0,[0]);
  });

  ok([1,2,3,4,5,6,7,0].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "right/positive/simple",
         'prereq - indexShift should indicat a right/positive/simple shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

test("IndexShift can translate right/positive/complex shift", function() {
  SC.run(function() {
    demoArray.replace(lastIndex,1,[-1,0]);
  });

  ok([1,2,3,4,5,6,-1,0].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "right/positive/complex",
         'prereq - indexShift should indicat a right/positive/complex shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

/**
 * right/negative/*
 */
test("IndexShift can translate right/negative/simple shift", function() {
  SC.run(function() {
    demoArray.replace(lastIndex,1);
  });

  ok([1,2,3,4,5,6].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "right/negative/simple",
         'prereq - indexShift should indicat a right/negative/simple shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

test("IndexShift can translate right/negative/complex shift", function() {
  SC.run(function() {
    demoArray.replace(lastIndex-1,2,[0]);
  });

  ok([1,2,3,4,5,0].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "right/negative/complex",
         'prereq - indexShift should indicat a right/negative/complex shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});

/**
 * special cases
 */
test("IndexShift can translate split shift - inner/positive/simple", function() {
  SC.run(function() {
    demoArray.replace(2,0,[0]);
  });

  ok([1,2,0,3,4,5,6,7].isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), "inner/positive/simple",
         'prereq - indexShift should indicat a inner/positive/simple shift');

  indexSet = indexShift.translateIndexSet(indexSet);

  var expectedResult = [2,3,4];
  testExpectedResult(expectedResult);
});
