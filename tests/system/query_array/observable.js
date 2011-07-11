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

var testCompareQueryArrayValues = function(qa, valueArray, msgPrefix) {
  var qaValues = qa.map(function(obj) {
    return obj.get('value');
  });

  var msg = msgPrefix ? "%@ ".fmt(msgPrefix) : "";
  msg += ("query array values [%@] should be equal to"
         + " provided values [%@]").fmt(qaValues, valueArray);

  ok(qaValues.isEqual(valueArray), msg);
};

test("QueryArrays have observable enumerable content", function() {
  var c = 0;

  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: a,
      query: q,
      _cqa_test_enumContentObserver: function() {
        SC.Logger.log('_cqa_test_enumContentObserver:', arguments, "length: ", this.get('length'));
        c++;
      }.observes('[]')
    });
  });

  testCompareQueryArrayValues(qa, initialState, 'prereq 1 -');

  // test observability
  ok(c > 0, 'c should be greater than zero');

  var lastCount = c;

  // add an object to the reference array that matches the query filter
  SC.run(function() {
    SC.Logger.log('adding object');
    a.pushObject(a.objectAt(EXPECTED_START));
  });

  initialState.push(a.objectAt(EXPECTED_START).get('value'));
  testCompareQueryArrayValues(qa, initialState, 'prereq 2 -');

  ok(c > lastCount, 'c should have been updated for an object add');

  lastCount = c;

  // remove an object from the refernce array that matched the query filter
  SC.run(function() {
    SC.Logger.log('removing object');
    a.removeAt(EXPECTED_START,1);
  });

  initialState.shift();
  testCompareQueryArrayValues(qa, initialState, 'prereq 3 -');
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
    initialState.push(a.objectAt(EXPECTED_START).get('value'));
  });

  testCompareQueryArrayValues(qa, initialState, 'prereq 4 -');
  ok(c > lastCount, 'prereq - count should have been up\'d for an object add');
  ok(peepingTom.enumDidChange, 'external observer should see enumerable content changes');
  ok(peepingTom.get('length'), qa.get('length'), 'qa properties are bindable');
  ok(peepingTom._starCount > 0, 'startCount should be > 0');
});

test("QueryArrays behaves with addArrayObservers/removeArrayObservers", function() {
  qa = DataStructures.QueryArray.create();

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

  //
  // test array observers on setting referenceArray
  //
  SC.run(function() {
    qa.beginPropertyChanges();
    qa.set('referenceArray',a).set('query',q);
    qa.endPropertyChanges();
  });

  ok(didChangeArgs.count > 0, 'didChange should have been called');
  ok(willChangeArgs.count > 0, 'willChange should have been called');

  equals(willChangeArgs.start, 0, 'willChange should be changed at 0');
  equals(willChangeArgs.added, qa.get('length'), 'willChange should be N additions');
  equals(didChangeArgs.start, 0, 'didChange should be changed at 0');
  equals(didChangeArgs.added, qa.get('length'), 'didChange should be N additions');

  //
  // test arrayObserver on updates
  //
  SC.run(function() {
    a.pushObject(SC.Object.create({
      value: EXPECTED_END - 1
    }));
  });

  equals(willChangeArgs.start, qa.get('length') - 1,
         'willChange should be changed at the last index');
  equals(willChangeArgs.added, 1,
         'willChange should be notified of one addition');

  equals(didChangeArgs.start, qa.get('length') - 1,
         'didChange should be changed at the last index');
  equals(didChangeArgs.added, 1,
         'didChange should be notified of one addition');

  //
  // test arrayObservers on removals
  //
  SC.run(function() {
    a.removeAt(EXPECTED_START + 2,1);
  });

  equals(willChangeArgs.start, 2,
         'willChange removal should start at index 2');
  equals(willChangeArgs.removed, 1,
         'willChange should be notified of one removal');

  equals(didChangeArgs.start, 2,
         'didChange removal should start at index 2');
  equals(didChangeArgs.removed, 1,
         'didChange should be notified of one removal');
});

test("adding range observers before setting referenceArray is ok... but returns null", function() {
  qa = DataStructures.QueryArray.create();
  var foo = SC.Object.create({bar: function() {}});
  ok(SC.none(qa.addRangeObserver(null, foo, foo.bar)), 'adding a range observer before the reference array is set doesn\'t crash');
});


test("QueryArrays can add range observers", function() {
  var c = 0;

  SC.run(function() {
    qa = DataStructures.QueryArray.create({
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

test("QueryArray range observers can be set up before a reference array",function() {
  SC.run(function() {
    qa = DataStructures.QueryArray.create({
      referenceArray: null,
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

  var theObserver = qa.addRangeObserver(null, observer, observer._cb);

  SC.run(function() {
    qa.set('referenceArray', a);
  });

  ok(rangeArgs.callCount > 0, "after setting a referenceArray the range observer is called");
});
