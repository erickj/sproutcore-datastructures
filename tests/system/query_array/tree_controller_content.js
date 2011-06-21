
var queryArray, qry, a;
module("DataStructures Query Array", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    qry = SC.Query.create({
      conditions: 'value >= 5 AND value < 10'
    });

    a = [];
    for(var i=0;i<20;i++) {
      a.push(SC.Object.create({
        value: i,
        name: 'object %@'.fmt(i)
      }));
    }

    queryArray = DataStructures.QueryArray.create({
      query: qry
    });

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

test("use query array as content item for a tree controller", function() {
  ok(queryArray.isQueryArray, 'prereq - queryArray should be a queryArray');

  var dummyTree = SC.TreeController.create({
    content: null
  });

  var items = [1,2,3,4,5].map(function(i) {
    return SC.Object.create({
      name: 'object %@'.fmt(i),
      value: i
    });
  });

  SC.run(function() {
    var root = SC.Object.create({
      name: 'root',
      treeItemIsExpanded: YES,
      treeItemChildren: items
    });

    dummyTree.set('content', root);
  });

  var ao = dummyTree.get('arrangedObjects');
  equals(ao.get('length'), items.length, "prereq - dummyTree works w/ normal arrays");

  items.pushObject(SC.Object.create({name: 'object %@'.fmt(items.length + 1)}));

  equals(ao.get('length'), items.length, "prereq - dummyTree with plain old array updates with content");

  // setup an observer to prove the observers on query array are firing
  var observerResults = {
    qaDidChange: {
      counts: 0
    },
    qaWillChange: {
      counts: 0
    },
    rangeObserver: {
      counts: 0
    },
    enumObserver: {
      counts: 0
    }
  },
    anObserver = SC.Object.create({
      qa: queryArray,

      qaDidChange: function() {
        observerResults.qaDidChange.lastArgs = SC.A(arguments);
        observerResults.qaDidChange.counts++;
      },
      qaWillChange: function() {
        observerResults.qaWillChange.lastArgs = SC.A(arguments);
        observerResults.qaWillChange.counts++;
      },
      rangeObserver: function() {
        observerResults.rangeObserver.lastArgs = SC.A(arguments);
        observerResults.rangeObserver.counts++;
      },
      _enumerableObserver: function() {
        observerResults.enumObserver.lastArgs = SC.A(arguments);
        observerResults.enumObserver.counts++;
      }.observes('.qa.[]')
    });

  queryArray.addArrayObservers({
    target: anObserver,
    willChange: anObserver.qaWillChange,
    didChange: anObserver.qaDidChange
  });

  // use will change to add the range observer
  queryArray.addRangeObserver(null, anObserver, anObserver.rangeObserver);

  // reset dummyTree
  dummyTree = SC.TreeController.create({
    content: null
  });

  SC.run(function() {
    dummyTree.set('content', SC.Object.create({
      treeItemChildren: queryArray,
      treeItemIsExpanded: YES
    }));

    queryArray.set('referenceArray', a);
  });

  ok(queryArray.get('length') == 5, "prereq - query array should have 5 elements");
  ok(observerResults.qaDidChange.counts > 0, "prereq - didChange did fire");
  ok(observerResults.qaWillChange.counts > 0, "prereq - willChange did fire");
  ok(observerResults.rangeObserver.counts > 0, "prereq - rangeObservers did fire");
  ok(observerResults.enumObserver.counts > 0, "prereq - enumObservers did fire");

  ao = dummyTree.get('arrangedObjects');
  ok(ao.get('length') == 5, "dummyTree should have 5 elements");

  a.pushObject(SC.Object.create({value: 6}));

  ok(ao.get('length') == 6, "dummyTree should have 6 elements after pushing new matching object onto query array");
});
