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

module("DataStructures QueryArray", {
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
  msg += ("QueryArray values [%@] should be equal to"
         + " provided values [%@]").fmt(qaValues, valueArray);

  ok(qaValues.isEqual(valueArray), msg);
};

var testIndexValidity = function(qa, msgPrefix) {
  var last = -1;
  var msgTpl = msgPrefix ? "%@ ".fmt(msgPrefix) : "";
  msgTpl += "index %@ should be 1 greater than the last";

  var sameTpl = msgPrefix ? "%@ ".fmt(msgPrefix) : "";
  sameTpl += "QueryArray iteration is intact with object %@";

  qa.forEach(function(obj,i) {
    same(obj, qa.objectAt(last + 1), sameTpl.fmt(last + 1));
    equals(i, (last + 1), msgTpl.fmt(i));
    last = i;
  });
};

test("QueryArrays have length and map indexes to the hidden array", function() {
  equals(qa.get('length'), EXPECTED_LENGTH, "QueryArray should be EXPECTED_LENGTH elements");

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
    innerContext = this;
  },qa);

  same(innerContext, qa, '_this_ in the +forEach+ should have been qa');
  ok(c.length == qa.get('length'), 'c should match the length of qa');

  // test index validity
  testIndexValidity(qa);
});

test("QueryArray works with contains", function() {
  var allContained = true;
  for(var i=0;i<qa.get('length');i++) {
    allContained = allContained && qa.contains(qa.objectAt(i));
  }
  ok(allContained, 'QueryArray should contain all the objects that it can iterate over');

  ok(!qa.contains({}), 'QueryArray should NOT contain objects that it doesn\'t contain');
});

test("QueryArray works with slice", function() {
  var slice = qa.slice(0,3);

  equals(slice.length, 3, 'slice should have 3 elements');

  expect(slice.length + 2);
  slice.forEach(function(obj,i) {
    same(obj, qa.objectAt(i), 'slice object and qa object %@ should be the same'.fmt(i));
  });
});

test("QueryArrays observe array member properties", function() {
  equals(qa.get('length'), EXPECTED_LENGTH, "prereq1 - QueryArray should be EXPECTED_LENGTH elements");

  //
  // test change to array member does remove element
  //
  SC.run(function() {
    a[EXPECTED_END].set('value',0);
  });

  equals(qa.get('length'), (EXPECTED_LENGTH - 1), "QueryArray should be (EXPECTED_LENGTH - 1) elements");

  //
  // test changes to array members will add the element to the QueryArray
  //
  var obj = SC.Object.create({value:(EXPECTED_START + 0.5)});
  a.pushObject(obj);
  equals(qa.get('length'), EXPECTED_LENGTH, "prereq2 - QueryArray should be EXPECTED_LENGTH elements");
});

test("QueryArrays content is accessible with objectAt", function() {
  var c = 0;

  //
  // objectAt - calls to objectAt are SLOOOOOOWWWWWWWWW - known issue
  //
  equals(qa.objectAt(0), a.objectAt(EXPECTED_START), 'QueryArray should offset it\'s indices');
  equals(qa.objectAt((EXPECTED_LENGTH - 1)), a.objectAt(EXPECTED_END), 'QueryArray should offset it\'s indices');
});

test("QueryArray can be replaced and all is well", function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - QueryArray should be EXPECTED_LENGTH elements");

  //
  // test swapping arrays
  //
  var newArray = [];
  qa.set('referenceArray',newArray);
  equals(qa.get('length'), 0, "QueryArray should be 0 elements after replace");

  //
  // test old objects property observer was unbound
  //
  a[0].set('value',(EXPECTED_START + 1)); // TODO: exposes unbind error - propDidChange is still called... we only avoid it by checking that the obj idx is -1
  equals(qa.get('length'), 0, "QueryArray should have stopped watching old array values");

  //
  // test new array is observed
  //
  newArray.pushObject(SC.Object.create({value: 5}));
  equals(qa.get('length'), 1, "QueryArray should be 1 elements after replace and push");

  //
  // test new array element properties are observed
  //
  newArray[0].set('value',0);
  equals(qa.get('length'), 0, "QueryArray should be 0 after newArray element property change");
});

test("QueryArray indexOf and lastIndexOf", function() {
  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - QueryArray should be EXPECTED_LENGTH elements");

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

test("QueryArray can be a referenceArray", function() {
  var qaCannibal;
  SC.run(function() {
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

test("QueryArray can provide query parameters", function() {
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

test("QueryArray can provide observeProperties to specify @each observers", function() {
  SC.RunLoop.begin();
  qa = DataStructures.QueryArray.create({
    referenceArray: [1,2,3,4,5,6,7,8,9,10].map(function(i) { return SC.Object.create({value:i}); }),
    query: SC.Query.create({
      conditions: 'value > 5',
      observeProperties: 'value'
    })
  });

  var qa2 = DataStructures.QueryArray.create({
    referenceArray: [1,2,3,4,5,6,7,8,9,10].map(function(i) { return SC.Object.create({value:i}); }),
    query: SC.Query.create({
      conditions: 'value > 5',
      observeProperties: 'foobar'
    })
  });
  SC.RunLoop.end();

  equals(qa.get('length'),5, 'prereq - the qa should have 5 elements');
  equals(qa2.get('length'),5, 'prereq - the qa2 should have 5 elements');

  SC.RunLoop.begin();
  qa.referenceArray.lastObject().set('value',0);
  qa2.referenceArray.lastObject().set('value',0);
  SC.RunLoop.end();

  equals(qa.get('length'),4, 'qa should have observed changed value');
  equals(qa2.get('length'),5, 'qa2 should have been oblivious to changed value');
});

test("QueryArray can be given query objects with no +parse+ method", function() {
  var noParseQuery = {
    contains: function() {
      return true;
    }
  };

  SC.run(function() {
    qa.set('query', noParseQuery);
  });

  testCompareQueryArrayValues(qa, a.getEach('value'), "noParseQuery:");
});

test("QueryArray MUST be given a query object the responds to +contains+", function() {
  var caught = 0,
    err;

  try {
    SC.run(function() {
      qa.set('query', {});
    });
  } catch(e) {
    err = e;
    caught++;

    if (SC.RunLoop.isRunLoopInProgress)
      SC.RunLoop.end(); // need to end the existed run loop
  }

  ok(caught == 1, "setting a query object with no +contains+ method throws an error");
  ok(err.isBadQueryError, "error should be a bad query error");
});
