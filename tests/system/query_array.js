// ==========================================================================
// Project:   DataStructures.QueryArray Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var q, a, qa;
var EXPECTED_LENGTH = 10;
var EXPECTED_START = 4;
var EXPECTED_END = 13;
var CONDITION = "value <= %@ AND value > %@".fmt(EXPECTED_END, EXPECTED_START - 1);

module("DataStructures Query Array", {
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
    });
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
    });
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("QueryArrays have length and map indexes to the hidden array", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "query array should be EXPECTED_LENGTH elements");

  // check that indexOf maps indexes properly
  equals(qa.indexOf(a.objectAt(EXPECTED_START)), 0, '+indexOf+ should show this is the first element');
  equals(qa.indexOf(a.objectAt(EXPECTED_END)), qa.get('length') - 1, '+indexOf+ should show this is the last element');

  //
  // test forEach
  //
  var c = [],
    innerContext;
  qa.forEach(function(obj,idx) {
    c.push(idx);
    same(obj, qa.objectAt(idx), 'object at %@ should be the same here and in qa'.fmt(idx));
    innerContext = this;
  },qa);

  same(innerContext, qa, '_this_ in the +forEach+ should have been qa');
  ok(c.length == qa.get('length'), 'c should match the length of qa');

  // test index validity
  var last = -1;
  qa.forEach(function(obj,i) {
    equals(i, (last + 1), 'index %@ should be 1 greater than the last'.fmt(i));
    last = i;
  });
});

test("QueryArray works with contains", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  var allContained = true;
  for(var i=0;i<qa.get('length');i++) {
    allContained = allContained && qa.contains(qa.objectAt(i));
  }
  ok(allContained, 'QueryArray should contain all the objects that it can iterate over');

  ok(!qa.contains({}), 'QueryArray should NOT contain objects that it doesn\'t contain');
});

test("QueryArray works with slice", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  var slice = qa.slice(0,3);

  equals(slice.length, 3, 'slice should have 3 elements');

  expect(slice.length + 1);
  slice.forEach(function(obj,i) {
    same(obj, qa.objectAt(i), 'slice object and qa object %@ should be the same'.fmt(i));
  });
});

test("QueryArrays observe modifications to the reference array: additions", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  var values = qa.getEach('value');

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - query array should be EXPECTED_LENGTH elements");

  //
  // test additions to end of referencArray
  //
  qa.DEBUG_QUERY_ARRAY = YES;
  SC.run(function() {
    a.pushObject(SC.Object.create({value: (EXPECTED_START + 0.5)}));
  });
  qa.DEBUG_QUERY_ARRAY = NO;

  equals(qa.get('length'), (EXPECTED_LENGTH + 1), "pushObject: query array should be (EXPECTED_LENGTH + 1) elements after addition");
  same(qa.objectAt(qa.get('length') - 1),
       a.objectAt(a.get('length') - 1),
       'pushObject: queryArray did add new member');

  // test index validity
  var last = -1;
  qa.forEach(function(obj,i) {
    same(obj, qa.objectAt(last + 1), 'pushObject: query array iteration is intact at object %@'.fmt(last + 1));
    equals(i, (last + 1), 'pushObject: index %@ should be 1 greater than the last'.fmt(i));
    last++;
  });

  // test values
  values.forEach(function(v,i) {
    equals(qa.objectAt(i).get('value'), v, 'pushObject: value %@ should be in query array at %@'.fmt(v,i));
  });
});

test("QueryArrays observe modifications to the reference array: removals", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

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

  // test index validity
  var last = -1;
  qa.forEach(function(obj,i) {
    same(obj, qa.objectAt(last + 1), 'removeAt: query array iteration is intact at object %@'.fmt(last + 1));
    equals(i, (last + 1), 'removeAt: index %@ should be 1 greater than the last'.fmt(i));
    last++;
  });

  // test values
  values = values.slice(sliceSize,values.get('length'));
  values.forEach(function(v,i) {
    equals(qa.objectAt(i).get('value'), v, 'removeAt: value %@ should be in query array at %@'.fmt(v,i));
  });
});

test("QueryArrays observe modifications to the reference array: noops", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

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

  // test index validity
  var last = -1;
  qa.forEach(function(obj,i) {
    same(obj, qa.objectAt(last + 1), 'noop: query array iteration is intact at object %@'.fmt(last + 1));
    equals(i, (last + 1), 'noop: index %@ should be 1 greater than the last'.fmt(i));
    last++;
  });
});

test("QueryArrays observe modifications to the reference array: replaceAt", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  //
  // test replaceAt
  //
  var preReplaceLen = qa.get('length');
  var values = qa.getEach('value');

  qa.DEBUG_QUERY_ARRAY = YES;
  SC.run(function() {
    a.replace(EXPECTED_START+2,1,[SC.Object.create({value: EXPECTED_END + 1})]);
  });
  qa.DEBUG_QUERY_ARRAY = NO;

  equals(qa.get('length'), preReplaceLen - 1, "replaceAt: query array should have lost an object");
  equals(qa.objectAt(2).get('value'), values.objectAt(3), 'replaceAt: queryArray should have lost the object at 2');
});

test("QueryArrays observe array member properties", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create();
    qa.set('referenceArray',a);
    qa.set('query',q);
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq1 - query array should be EXPECTED_LENGTH elements");

  //
  // test change to array member does remove element
  //
  SC.run(function() {
    a[EXPECTED_END].set('value',0);
  });

  equals(qa.get('length'), (EXPECTED_LENGTH - 1), "query array should be (EXPECTED_LENGTH - 1) elements");

  //
  // test changes to array members will add the element to the query array
  //
  var obj = SC.Object.create({value:(EXPECTED_START + 0.5)});
  a.pushObject(obj);
  equals(qa.get('length'), EXPECTED_LENGTH, "prereq2 - query array should be EXPECTED_LENGTH elements");
});

test("QueryArrays content is accessible with objectAt", function() {
  var c = 0;

  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  //
  // objectAt - calls to objectAt are SLOOOOOOWWWWWWWWW - known issue
  //
  equals(qa.objectAt(0), a.objectAt(EXPECTED_START), 'query array should offset it\'s indices');
  equals(qa.objectAt((EXPECTED_LENGTH - 1)), a.objectAt(EXPECTED_END), 'query array should offset it\'s indices');
});

test("Query array can be replaced and all is well", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - query array should be EXPECTED_LENGTH elements");

  //
  // test swapping arrays
  //
  var newArray = [];
  qa.set('referenceArray',newArray);
  equals(qa.get('length'), 0, "query array should be 0 elements after replace");

  //
  // test old objects property observer was unbound
  //
  a[0].set('value',(EXPECTED_START + 1)); // TODO: exposes unbind error - propDidChange is still called... we only avoid it by checking that the obj idx is -1
  equals(qa.get('length'), 0, "query array should have stopped watching old array values");

  //
  // test new array is observed
  //
  newArray.pushObject(SC.Object.create({value: 5}));
  equals(qa.get('length'), 1, "query array should be 1 elements after replace and push");

  //
  // test new array element properties are observed
  //
  newArray[0].set('value',0);
  equals(qa.get('length'), 0, "query array should be 0 after newArray element property change");
});

test("Query Array indexOf and lastIndexOf", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - query array should be EXPECTED_LENGTH elements");

  var first = qa.objectAt(0),
    firstInA = a.objectAt(EXPECTED_START);

  same(first, firstInA, 'prereq - these should be the same');
  equals(qa.indexOf(first), 0, 'the object should have index 0');

  SC.run(function() {
    // we know our first object matches the query,
    // add it on to the back of the reference array and test lastIndexOf
    a.pushObject(first);
  });

  var lastIndex = qa.lastIndexOf(first);
  equals(lastIndex, qa.get('length') - 1, 'lastIndexOf should show the last object position');

  // test indexOf w/ startAt parameter
  // TODO: indexSet doesn't properly implement _startAt_ parameter for +indexOf+ or +lastIndexOf+
//  equals(qa.indexOf(first,1), lastIndex, 'this should equal the lastIndex now');
});

test("large modifications will get chunked up on timeout", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      DEBUG_QUERY_ARRAY: NO,
      referenceArray: a,
      query: SC.Query.create({
        conditions: 'value < 900'
      })
    });
  });

  var objs = [];

  SC.run(function() {
    SC.Logger.log('-- adding lots of items');
    for(var i=0; i<1000; i++) {
      objs.push(SC.Object.create({value: i}));
    }
    qa.set('referenceArray', objs);

    for(i=0; i<500; i++) {
      objs.pushObject(SC.Object.create({value: -i}));
    }
  });

  equals(objs.get('length'), 1500, 'prereq - 1500 items were added to objs');
  equals(qa.get('length'), 1400, 'there should be a bunch of objects in qa');

  SC.Logger.log('-- removing slice');

  SC.run(function() {
    objs.removeAt(0, 100);
  });

  equals(qa.get('length'), 1300, 'prereq - there should be less objects in qa');
});

test("query array can be a referenceArray", function() {
  var qaCannibal;
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });

    qaCannibal = DataStructures.QueryArray.create({
      referenceArray: qa,
      query: SC.Query.create({
        conditions: 'value = 6 OR value = 7'
      })
    });
  });

  equals(qaCannibal.get('length'), 2, 'qaCannibal should have 2 values in it');
  equals(qaCannibal.objectAt(0).get('value'), 6, 'first object should be 6');
  equals(qaCannibal.objectAt(1).get('value'), 7, 'first object should be 6');
});

test("query array can provide query parameters", function() {
  var qaCannibal;
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: [
        [0,1],[2,9],[0,12],[0,3,4],[5,6]
      ].map(function (arr) { return SC.Object.create({props: arr}); }),
      query: SC.Query.create({
        conditions: '(props MAP {mapAlphabet}) CONTAINS "a"'
      }),
      queryParameters: {
        mapAlphabet: function(i) {
          var alpha = "abcdefghijklmnopqrstuvwxyz";
          return alpha[i % alpha.length];
        }
      }
    });
  });

  ok(qa.get('length') === 3, 'the query reference array values should get mapped on comparison');
});
