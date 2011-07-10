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

function testTranslation(lambda, expectedDemo, expectedDesc, expectedResult) {
  // modify demoArray
  SC.run(lambda);

  // prereqs
  ok(expectedDemo.isEqual(demoArray),
    'prereq - demoArray was modified appropriately');
  equals(indexShift.get('desc'), expectedDesc,
         'prereq - indexShift should indicat a left/positive/simple shift');

  // do translation
  indexSet = indexShift.translateIndexSet(indexSet);

  // check indexSet
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
  var fn = function() {
    demoArray.replace(0,0,[0]);
  };

  testTranslation(fn,[0,1,2,3,4,5,6,7],"left/positive/simple",[2,3,4]);
});

test("IndexShift can translate left/positive/complex shift", function() {
  var fn = function() {
    demoArray.replace(0,1,[-1,0]);
  };

  testTranslation(fn,[-1,0,2,3,4,5,6,7],"left/positive/complex",[2,3,4]);
});

/**
 * left/negative/*
 */
test("IndexShift can translate left/negative/simple shift", function() {
  var fn = function() {
    demoArray.replace(0,1);
  };

  testTranslation(fn,[2,3,4,5,6,7], "left/negative/simple",[2,3,4]);
});

test("IndexShift can translate left/negative/complex shift", function() {
  var fn = function() {
    demoArray.replace(0,2,[0]);
  };

  testTranslation(fn,[0,3,4,5,6,7], "left/negative/complex",[3,4]);
});


/**
 * inner/positive/*
 */
test("IndexShift can translate inner/positive/simple shift", function() {
  var fn = function() {
    demoArray.replace(1,0,[0]);
  };

  testTranslation(fn,[1,0,2,3,4,5,6,7], "inner/positive/simple",[2,3,4]);
});

test("IndexShift can translate inner/positive/complex shift", function() {
  var fn = function() {
    demoArray.replace(1,1,[-1,0]);
  };

  testTranslation(fn,[1,-1,0,3,4,5,6,7], "inner/positive/complex",[3,4]);
});

/**
 * inner/negative/*
 */
test("IndexShift can translate inner/negative/simple shift", function() {
  var fn = function() {
    demoArray.replace(1,1);
  };

  testTranslation(fn,[1,3,4,5,6,7], "inner/negative/simple",[3,4]);
});

test("IndexShift can translate inner/negative/complex shift", function() {
  var fn = function() {
    demoArray.replace(1,2,[0]);
  };

  testTranslation(fn,[1,0,4,5,6,7], "inner/negative/complex",[4]);
});

/**
 * right/positive/*
 */
test("IndexShift can translate right/positive/simple shift", function() {
  var fn = function() {
    demoArray.replace(lastIndex+1,0,[0]);
  };

  testTranslation(fn,[1,2,3,4,5,6,7,0], "right/positive/simple",[2,3,4]);
});

test("IndexShift can translate right/positive/complex shift", function() {
  var fn = function() {
    demoArray.replace(lastIndex,1,[-1,0]);
  };

  testTranslation(fn,[1,2,3,4,5,6,-1,0], "right/positive/complex",[2,3,4]);
});

/**
 * right/negative/*
 */
test("IndexShift can translate right/negative/simple shift", function() {
  var fn = function() {
    demoArray.replace(lastIndex,1);
  };

  testTranslation(fn,[1,2,3,4,5,6], "right/negative/simple",[2,3,4]);
});

test("IndexShift can translate right/negative/complex shift", function() {
  var fn = function() {
    demoArray.replace(lastIndex-1,2,[0]);
  };

  testTranslation(fn,[1,2,3,4,5,0], "right/negative/complex",[2,3,4]);
});

/**
 * special cases
 */
test("IndexShift can translate split shift - inner/positive/simple", function() {
  var fn = function() {
    demoArray.replace(2,0,[0]);
  };

  testTranslation(fn,[1,2,0,3,4,5,6,7], "inner/positive/simple",[2,3,4]);
});
