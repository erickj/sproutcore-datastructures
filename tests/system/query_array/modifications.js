// ==========================================================================
// Project:   DataStructures.QueryArray Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var q, a, qa, initialState = [4,5,6,7,8,9,10,11,12,13];
var EXPECTED_LENGTH = 10;
var EXPECTED_START = 4;
var EXPECTED_END = 13;
var CONDITION = "value <= %@ AND value > %@".fmt(EXPECTED_END, EXPECTED_START - 1);

module("DataStructures Query Array Modifications", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    q = SC.Query.create({
      conditions: CONDITION
    });

    a = [];
    while (a.get('length') < (EXPECTED_END * 2)) {
      a.push(SC.Object.create({value: a.length}));
    };

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      qa = DataStructures.QueryArray.create({
        referenceArray: a,
        query: q
      });
    });

    testCompareQueryArrayValues(qa, initialState, "prereq -");
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
    });
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

var testCompareQueryArrayValues = function(qa, valueArray, msgPrefix) {
  var qaValues = qa.map(function(obj) {
    return obj.get('value');
  });

  var msg = msgPrefix ? "%@ ".fmt(msgPrefix) : "";
  msg += ("query array values [%@] should be equal to"
         + " provided values [%@]").fmt(qaValues, valueArray);

  ok(qaValues.isEqual(valueArray), msg);
};

var testIndexValidity = function(qa, msgPrefix) {
  var last = -1;
  var msgTpl = msgPrefix ? "%@ ".fmt(msgPrefix) : "";
  msgTpl += "index %@ should be 1 greater than the last";

  var sameTpl = msgPrefix ? "%@ ".fmt(msgPrefix) : "";
  sameTpl += "query array iteration is intact with object %@";

  qa.forEach(function(obj,i) {
    same(obj, qa.objectAt(last + 1), sameTpl.fmt(last + 1));
    equals(i, (last + 1), msgTpl.fmt(i));
    last = i;
  });
};

test("QueryArrays observe modifications to the reference array: additions", function() {
  var values = qa.getEach('value');

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - query array should be EXPECTED_LENGTH elements");

  //
  // test additions to end of referencArray
  //
  qa.DEBUG_QUERY_ARRAY = YES;
  SC.run(function() {
    a.pushObject(SC.Object.create({value: (EXPECTED_START + 0.5)}));
    values.push(EXPECTED_START + 0.5);
  });
  qa.DEBUG_QUERY_ARRAY = NO;

  equals(qa.get('length'), (EXPECTED_LENGTH + 1), "pushObject: query array should be (EXPECTED_LENGTH + 1) elements after addition");

  testCompareQueryArrayValues(qa, values, "pushObject:");
  testIndexValidity(qa, "pushObject:");
});

test("QueryArrays observe modifications to the reference array: removals", function() {
  var values = qa.getEach('value'),
    sliceSize = 2;

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - query array should be EXPECTED_LENGTH elements");

  //
  // test removing from front of array
  //
  var removed = qa.slice(0,sliceSize);

  qa.DEBUG_QUERY_ARRAY = YES;
  SC.run(function() {
    a.removeAt(0,(EXPECTED_START + sliceSize));
  });
  qa.DEBUG_QUERY_ARRAY = NO;

  equals(qa.get('length'), (EXPECTED_LENGTH - sliceSize), "removeAt: query array should have lost its first %@ objects".fmt(sliceSize));
  removed.forEach(function(obj,i) {
    ok(!qa.contains(obj), 'removeAt: should have removed object at index %@'.fmt(i));
  });

  // test values
  values = values.slice(sliceSize,values.get('length'));
  testCompareQueryArrayValues(qa, values, "removeAt:");
  testIndexValidity(qa, "removeAt:");
});

test("QueryArrays observe modifications to the reference array: noops", function() {
  var values = qa.getEach('value');

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - query array should be EXPECTED_LENGTH elements");

  //
  // test noops
  //
  var preNoopLen = qa.get('length');
  qa.DEBUG_QUERY_ARRAY = YES;
  SC.run(function() {
    a.pushObject(SC.Object.create({value: EXPECTED_END + 1}));
  });
  qa.DEBUG_QUERY_ARRAY = NO;

  equals(qa.get('length'), preNoopLen, "noop: query array should be the same after noop");

  testCompareQueryArrayValues(qa, values, 'noop:');
  testIndexValidity(qa, "noop:");
});

test("QueryArrays observe modifications to the reference array: replaceAt", function() {
  //
  // test replaceAt
  //
  var preReplaceLen = qa.get('length');
  var values = qa.getEach('value');

  qa.DEBUG_QUERY_ARRAY = YES;
  SC.run(function() {
    a.replace(EXPECTED_START+2,1,[SC.Object.create({value: EXPECTED_END + 1})]);
    values.replace(2,1,[]);
  });
  qa.DEBUG_QUERY_ARRAY = NO;

  equals(qa.get('length'), preReplaceLen - 1, "replaceAt: query array should have lost an object");

  testCompareQueryArrayValues(qa, values, 'replaceAt:');
  testIndexValidity(qa, "replaceAt:");
});

test("QueryArrays observe modifications to the referernce array: split sets", function() {
  var values = qa.getEach('value');
  qa.DEBUG_QUERY_ARRAY = YES;
  SC.run(function() {
    // push an object onto the end
    a.pushObject(SC.Object.create({value: EXPECTED_START + 1}));
    values.push(EXPECTED_START + 1);
  });

  // let changes run between run loops
  SC.run(function() {
    // remove an object to create a shift
    a.removeAt(EXPECTED_START,1);
    values.removeAt(0);
  });
  qa.DEBUG_QUERY_ARRAY = NO;

  testCompareQueryArrayValues(qa, values, 'split modifications:');
  testIndexValidity(qa, "split modifications:");
});
