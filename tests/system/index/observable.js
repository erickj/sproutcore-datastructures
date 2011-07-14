// ==========================================================================
// Project:   DataStructures.Index Observable Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var i, Klass = DataStructures.Index;

module("DataStructures.Index Observable", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
      i = Klass.create();
    });
    ok(i.isIndex, 'prereq - i is an index');
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
      i.destroy();
    });
    delete i;
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

function setupIndexPropertyObserver(index) {
  var observer = SC.Object.create({
    index: index,

    callCount: 0,
    observedArgs: [],
    _indexPropertyObserver: function(target,key,val,rev) {
      this.callCount++;
      this.observedArgs.push({
        target: target,
        key: key,
        val: val,
        rev: rev
      });
    }.observes('.index.{}')
  });

  return observer;
}

function testIndexPropertyObserverFired(observer, firedCount, expectedLen) {
  var index = observer.index;

  ok(index.get('indexLength') == expectedLen,
    'prereq - index should have indexLength %@'.fmt(expectedLen));

  equals(observer.callCount, firedCount,
         'observer should have been notified of %@ change to {}'.fmt(firedCount));
  equals(observer.observedArgs[0].key, '{}',
         'index should notify change to {}');
};

test("Index does update property {} on insert", function() {
  var observer = setupIndexPropertyObserver(i);
  var obj = {val:'foo'};

  SC.run(function() {
    i.insert('foo',obj);
  });

  testIndexPropertyObserverFired(observer, 1, 1);
});

test("Index does update property {} on multiple insert only once", function() {
  var observer = setupIndexPropertyObserver(i);
  var objs = [
    {val:'foo'},
    {val:'bar'},
    {val:'baz'}
  ];

  SC.run(function() {
    i.insert(['foo','bar','baz'],objs[0],objs[1],objs[2]);
  });
  ok(i.get('indexLength') == 3, 'prereq - index should have indexLength 3');

  testIndexPropertyObserverFired(observer, 1, 3);
});

test("Index does update property {} on remove", function() {
  var obj = {val:'foo'};
  SC.run(function() {
    i.insert('foo',obj);
  });

  ok(i.get('indexLength') == 1, 'prereq - index should have indexLength 1');

  var observer = setupIndexPropertyObserver(i);
  SC.run(function() {
    i.remove('foo',obj);
  });

  testIndexPropertyObserverFired(observer, 1, 0);
});


test("Index does update property {} on multiple remove only once", function() {
  var objs = [
    {val:'foo'},
    {val:'bar'},
    {val:'baz'}
  ];

  SC.run(function() {
    i.insert(['foo','bar','baz'],objs[0],objs[1],objs[2]);
  });
  ok(i.get('indexLength') == 3, 'prereq - index should have indexLength 3');

  var observer = setupIndexPropertyObserver(i);
  SC.run(function() {
    i.remove(['foo','bar','baz'],objs[0],objs[1],objs[2]);
  });

  testIndexPropertyObserverFired(observer, 1, 0);
});
