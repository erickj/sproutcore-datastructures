// ==========================================================================
// Project:   Contact.QueryArray Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals Contact module test ok equals same stop start */
var q, a, qa;
var EXPECTED_LENGTH = 10;
var EXPECTED_START = 4;
var EXPECTED_END = 13;
var CONDITION = "value <= %@ AND value > %@".fmt(EXPECTED_END, EXPECTED_START - 1);

module("Contact Query Array", {
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
    qa = Contact.QueryArray.create({
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
  var c = [];
  qa.forEach(function(obj,idx) {
    c.push(idx);
  });

  ok(c.length == qa.get('length'), 'TODO: this test sucks');
});

test("QueryArrays update live", function() {
  SC.run(function() {
    qa = Contact.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq - query array should be EXPECTED_LENGTH elements");

  //
  // test additions
  //
  a.pushObject(SC.Object.create({value: (EXPECTED_START + 0.5)}));
  equals(qa.get('length'), (EXPECTED_LENGTH + 1), "query array should be (EXPECTED_LENGTH + 1) elements after addition");

  //
  // test removals - this should remove 2 elements from our query array
  //
  SC.run(function() {
    a.removeAt(0,(EXPECTED_START + 2));
  });
  equals(qa.get('length'), (EXPECTED_LENGTH - 1), "query array should be (EXPECTED_LENGTH - 1) elements after removals");

  //
  // test noops
  //
  a.pushObject(SC.Object.create({value: EXPECTED_END + 1}));
  equals(qa.get('length'), (EXPECTED_LENGTH - 1), "query array should be (EXPECTED_LENGTH - 1) elements after noop");
});

test("QueryArrays observe reference array object updates", function() {
  SC.run(function() {
    qa = Contact.QueryArray.create();
    qa.set('referenceArray',a);
    qa.set('query',q);
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "prereq1 - query array should be EXPECTED_LENGTH elements");

  SC.run(function() {
    a[EXPECTED_END].set('value',0);
  });

  equals(qa.get('length'), (EXPECTED_LENGTH - 1), "t1 - query array should be (EXPECTED_LENGTH - 1) elements");

  //
  // test obj property changes to objects that are added after instantiation
  //

  // addition
  var obj = SC.Object.create({value:(EXPECTED_START + 0.5)});
  a.pushObject(obj);
  equals(qa.get('length'), EXPECTED_LENGTH, "prereq2 - query array should be EXPECTED_LENGTH elements");

  SC.run(function() {
    obj.set('value',0);
  });

  equals(qa.get('length'), (EXPECTED_LENGTH - 1), "t2 - query array should be (EXPECTED_LENGTH - 1) elements");

  // removal
  var obj2 = SC.Object.create({value:EXPECTED_END + 1});
  a.pushObject(obj2);
  equals(qa.get('length'), (EXPECTED_LENGTH - 1), "prereq3 - query array should be (EXPECTED_LENGTH - 1) elements");

  SC.run(function() {
    obj.set('value',(EXPECTED_START + 0.5));
  });

  equals(qa.get('length'), EXPECTED_LENGTH, "t3 - query array should be EXPECTED_LENGTH elements");
});

test("QueryArrays content is accessible with objectAt", function() {
  var c = 0;

  SC.run(function() {
    qa = Contact.QueryArray.create({
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
    qa = Contact.QueryArray.create({
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
    qa = Contact.QueryArray.create({
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

test("QueryArrays have observable enumerable content", function() {
  var c = 0;

  SC.run(function() {
    qa = Contact.QueryArray.create({
      referenceArray: a,
      query: q,
      _cqa_test_enumContentObserver: function() {
        SC.Logger.log('_cqa_test_enumContentObserver:', arguments, "length: ", this.get('length'));
        c++;
      }.observes('[]')
    });
  });

  // test observability
  ok(c > 0, 'c should be greater than zero');

  var lastCount = c;

  // add an object to the reference array that matches the query filter
  SC.run(function() {
    SC.Logger.log('adding object');
    a.pushObject(a.objectAt(EXPECTED_START));
  });

  ok(c > lastCount, 'c should have been updated for an object add');

  lastCount = c;

  // remove an object from the refernce array that matched the query filter
  SC.run(function() {
    SC.Logger.log('removing object');
    a.removeAt(EXPECTED_START,1);
  });

  ok(c > lastCount, 'c should have been updated for an object removed');

  //
  // observe enumerable property changes externally
  //
  var peepingTom = SC.Object.create({
    enumDidChange: false,
    lenDidChange: false,

    queryArray: qa,
    length: null,
    init: function() {
      var ret = sc_super();
      this.bind('length', this.get('queryArray'), 'length');
      return ret;
    },

    _lenObserver: function() {
      this.lenDidChange = true;
    }.observes('.queryArray.length'),
    _enumObserver: function() {
      this.enumDidChange = true;
    }.observes('.queryArray.[]'),

    _starCount: 0,
    _starObserver: function() {
      console.warn('starObserver', arguments);
      this._starCount++;
    }.observes('*queryArray.*')
  });

  lastCount = c;

  SC.run(function() {
    SC.Logger.log('adding object');
    a.pushObject(a.objectAt(EXPECTED_START));
  });

  ok(c > lastCount, 'prereq - count should have been up\'d for an object add');
  ok(peepingTom.enumDidChange, 'external observer should see enumerable content changes');
  ok(peepingTom.get('length'), qa.get('length'), 'qa properties are bindable');
  ok(peepingTom._starCount > 0, 'startCount should be > 0');
});

test("QueryArrays behavew with addArrayObservers/removeArrayObservers", function() {
  qa = Contact.QueryArray.create();

  var didChangeArgs = { count: 0 },
    didChange = function(start, removed, added) {
      didChangeArgs.count++;
      didChangeArgs.start = start;
      didChangeArgs.removed = removed;
      didChangeArgs.added = added;
    };

  var willChangeArgs = { count: 0 },
    willChange = function(start, removed, added) {
      willChangeArgs.count++;
      willChangeArgs.start = start;
      willChangeArgs.removed = removed;
      willChangeArgs.added = added;
    };

  qa.addArrayObservers({
    target: this,
    didChange: didChange,
    willChange: willChange
  });

  SC.run(function() {
    qa.beginPropertyChanges();
    qa.set('referenceArray',a).set('query',q);
    qa.endPropertyChanges();
  });

  ok(didChangeArgs.count > 0, 'didChange should have been called');
  ok(willChangeArgs.count > 0, 'willChange should have been called');

});

test("QueryArrays can add range observers", function() {
  var c = 0;

  SC.run(function() {
    qa = Contact.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  var rangeArgs = { callCount: 0 };
  var observer = {
    _cb: function(array, objects, key, indices, context) {
      rangeArgs.callCount++;
      rangeArgs.lastArguments = SC.A(arguments);
      rangeArgs.lastKey = key;
      rangeArgs.indices = indices;
    }
  };

  //
  // null indicates we want to observe the whole array
  //
  var theObserver = qa.addRangeObserver(null, observer, observer._cb);

  ok(theObserver.isRangeObserver, "add: +addRangeObserver+ should return a range observer");

  SC.run(function() {
    a.pushObject(a.objectAt(EXPECTED_START));
  });

  equals(qa.get('length'), (EXPECTED_LENGTH + 1), 'prereq - a new object should have modified qa');
  ok(rangeArgs.callCount > 0, "add: the observer should have been called once");
  equals(rangeArgs.lastKey, '[]',"add: the observer should have been called for key []");
  equals(rangeArgs.indices.firstObject(), qa.get('length') - 1, "add: each index in the range observer call back should be mapped to public space");

  var lastCallCount = rangeArgs.callCount;

  //
  // our null observer on qa shouldn't catch observations
  // for objects added to the reference array outside of the filter
  //
  SC.run(function() {
    a.pushObject(SC.Object.create({value: EXPECTED_END + 100}));
  });

  equals(rangeArgs.callCount, lastCallCount, "noop: rangeArgs.callCount should NOT have been up'd");

  lastCallCount = rangeArgs.callCount;

  //
  // update theObserver
  //
  theObserver = qa.updateRangeObserver(theObserver, SC.IndexSet.create().add(0,3));
  ok(theObserver.isRangeObserver, "update: +updateRangeObserver+ should return a range observer");

  // insert inside of update range
  a.insertAt(EXPECTED_START, SC.Object.create({value: EXPECTED_START + 1}));

  ok(rangeArgs.callCount > lastCallCount, "update: the observer should have been called again");

  // insert outside of updated range
  lastCallCount = rangeArgs.callCount;

  a.insertAt(EXPECTED_START + 4, SC.Object.create({value: EXPECTED_START + 1}));
  ok(rangeArgs.callCount == lastCallCount, "update: the observer should NOT have been called");

  //
  // remove theObserver
  //
  qa.removeRangeObserver(theObserver);

  a.insertAt(EXPECTED_START, SC.Object.create({value: EXPECTED_START + 1}));

  ok(rangeArgs.callCount == lastCallCount, "remove: the observer should NOT have been called again");
});

test("large modifications will get chunked up on timeout", function() {
  SC.run(function() {
    qa = Contact.QueryArray.create({
      referenceArray: a,
      query: q
    });
  });

  var objs = [];

  SC.run(function() {
    SC.Logger.log('-- adding lots of items');
    for(var i=0; i<1000; i++) {
      var v = i % EXPECTED_END; // create chunks
      objs.push(SC.Object.create({value: v}));
    }
    qa.set('referenceArray', objs);
  });

  equals(objs.get('length'), 1000, 'prereq - 1000 items were added to objs');
  equals(qa.get('length'), 692, 'there should be a bunch of objects in qa');

  SC.Logger.log('-- removing slice');

  SC.run(function() {
    objs.removeAt(0, 1000);
  });

//  equals(qa.get('length'), 0, 'prereq - there should less objects in qa');
});
