// ==========================================================================
// Project:   DataStructures.Index IndexObservable Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var i, Klass = DataStructures.Index;

module("DataStructures.Index Index Observable", {
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

function setupIndexObservers(index) {
  var observer = SC.Object.create({
    didChangeCount: 0,
    didChangeArgs: [],
    indexDidChange: function(keySet, removed, added) {
      this.didChangeCount++;
      this.didChangeArgs.push({
        keySet: keySet,
        added: added,
        removed: removed
      });
    },

    willChangeCount: 0,
    willChangeArgs: [],
    indexWillChange: function(keySet, removed, added) {
      this.willChangeCount++;
      this.willChangeArgs.push({
        keySet: keySet,
        added: added,
        removed: removed
      });
    }
  });

  var observerOptions = {
    target: observer,
    willChange: observer.indexWillChange,
    didChange: observer.indexDidChange
  };
  observer.options = observerOptions;

  index.addIndexObserver(observerOptions);

  return observer;
}

function testIndexObserverFired(observerArgs, keySet, added, removed, prefix) {
  ok(observerArgs.keySet && observerArgs.keySet.isKeySet,
    '%@keySet passed to willChange/didChange should be a KeySet'.fmt(prefix));

  ok(observerArgs.keySet.contains(DataStructures.Index.LOOKUP_KEY_ALL),
    'keySet should contain special ALL lookup key');

  ok(keySet.intersects(observerArgs.keySet),
    '%@observer keySet should be equal'.fmt(prefix));

  equals(observerArgs.added,
         added,
         '%@expected %@ items to be added'.fmt(prefix,added));

  equals(observerArgs.removed,
         removed,
         '%@expected %@ items to be removed'.fmt(prefix,removed));
};

test("Index willChange/didChange fires on inserting a single object", function() {
  var observer = setupIndexObservers(i);

  var obj = {val:'foo'},
    keySet = DS.Index.KeySet.create().addKeys('foo');

  SC.run(function() {
    i.insert('foo',obj);
  });

  ok(i.get('indexLength') == 1, 'prereq - index should have indexLength 1');

  ok(observer.willChangeCount == 1, 'willChange should fire once');
  testIndexObserverFired(observer.willChangeArgs[0], keySet, 1, 0, 'single-insert/willChange: ');
  ok(observer.didChangeCount == 1, 'didChange should fire once');
  testIndexObserverFired(observer.didChangeArgs[0], keySet, 1, 0, 'single-insert/didChange: ');
});

test("Index willChange/didChange fires on adding multiple object", function() {
  var observer = setupIndexObservers(i);

  var obj = {val:'foo'}, obj2 = {val: 'bar'},
    keySet = DS.Index.KeySet.create().addKeys('foo','bar');

  SC.run(function() {
    i.insert(keySet,obj,obj2);
  });

  ok(i.get('indexLength') == 2, 'prereq - index should have indexLength 1');

  ok(observer.willChangeCount == 1, 'willChange should fire once');
  testIndexObserverFired(observer.willChangeArgs[0], keySet, 2, 0, 'multi-insert/willChange: ');
  ok(observer.didChangeCount == 1, 'didChange should fire once');
  testIndexObserverFired(observer.didChangeArgs[0], keySet, 2, 0, 'multi-insert/didChange: ');
});

test("Index willChange/didChange fires on removing a single object", function() {
  var obj = {val:'foo'},
    keySet = DS.Index.KeySet.create().addKeys('foo');

  SC.run(function() {
    i.insert('foo',obj);
  });

  ok(i.get('indexLength') == 1, 'prereq - index should have indexLength 1');

  var observer = setupIndexObservers(i);
  SC.run(function() {
    i.remove('foo',obj);
  });

  ok(i.get('indexLength') == 0, 'prereq - index should have indexLength 0');

  ok(observer.willChangeCount == 1, 'willChange should fire once');
  testIndexObserverFired(observer.willChangeArgs[0], keySet, 0, 1, 'single-remove/willChange: ');
  ok(observer.didChangeCount == 1, 'didChange should fire once');
  testIndexObserverFired(observer.didChangeArgs[0], keySet, 0, 1, 'single-remove/didChange: ');
});

test("Index willChange/didChange fires on removing multiple object", function() {
  var obj = {val:'foo'}, obj2 = {val: 'bar'},
    keySet = DS.Index.KeySet.create().addKeys('foo','bar');

  SC.run(function() {
    i.insert(keySet,obj,obj2);
  });

  ok(i.get('indexLength') == 2, 'prereq - index should have indexLength 1');

  var observer = setupIndexObservers(i);
  SC.run(function() {
    i.remove(keySet,obj,obj2);
  });

  ok(i.get('indexLength') == 0, 'prereq - index should have indexLength 0');

  ok(observer.willChangeCount == 1, 'willChange should fire once');
  testIndexObserverFired(observer.willChangeArgs[0], keySet, 0, 2, 'multi-remove/willChange: ');
  ok(observer.didChangeCount == 1, 'didChange should fire once');
  testIndexObserverFired(observer.didChangeArgs[0], keySet, 0, 2, 'multi-remove/didChange: ');
});

//
// firing multiple observers
//
test("Index willChange/didChange notifies multiple observers", function() {
  var observer1 = setupIndexObservers(i),
    observer2 = setupIndexObservers(i);

  var obj = {val:'foo'},
    keySet = DS.Index.KeySet.create().addKeys('foo');

  SC.run(function() {
    i.insert('foo',obj);
  });

  ok(i.get('indexLength') == 1, 'prereq - index should have indexLength 1');

  ok(observer1.willChangeCount == 1, 'willChange should fire once for observer1');
  ok(observer1.didChangeCount == 1, 'didChange should fire once for observer1');
  ok(observer2.willChangeCount == 1, 'willChange should fire once for observer2');
  ok(observer2.didChangeCount == 1, 'didChange should fire once for observer2');

  SC.run(function() {
    i.remove('foo',obj);
  });

  ok(i.get('indexLength') == 0, 'prereq - index should have indexLength 0');

  ok(observer1.willChangeCount == 2, 'willChange should fire again for observer1');
  ok(observer1.didChangeCount == 2, 'didChange should fire again for observer1');
  ok(observer2.willChangeCount == 2, 'willChange should fire again for observer2');
  ok(observer2.didChangeCount == 2, 'didChange should fire again for observer2');
});

//
// remove observers
//
test("Index willChange/didChange observers can be removed", function() {
  var observer1 = setupIndexObservers(i),
    observer2 = setupIndexObservers(i),
    observer3 = setupIndexObservers(i);

  var obj = {val:'foo'},
    keySet = DS.Index.KeySet.create().addKeys('foo');

  // remove observer3 immediately
  i.removeIndexObserver(observer3.options);

  SC.run(function() {
    i.insert('foo',obj);
  });

  ok(i.get('indexLength') == 1, 'prereq - index should have indexLength 1');

  ok(observer1.willChangeCount == 1, 'willChange should fire once for observer1');
  ok(observer1.didChangeCount == 1, 'didChange should fire once for observer1');
  ok(observer2.willChangeCount == 1, 'willChange should fire once for observer2');
  ok(observer2.didChangeCount == 1, 'didChange should fire once for observer2');
  ok(observer3.willChangeCount == 0, 'willChange should NOT fire for observer3');
  ok(observer3.didChangeCount == 0, 'didChange should NOT fire for observer3');

  // remove observer1 before remove
  i.removeIndexObserver(observer1.options);

  SC.run(function() {
    i.remove('foo',obj);
  });

  ok(i.get('indexLength') == 0, 'prereq - index should have indexLength 0');

  ok(observer1.willChangeCount == 1, 'willChange should NOT fire for observer1');
  ok(observer1.didChangeCount == 1, 'didChange should NOT fire for observer1');
  ok(observer2.willChangeCount == 2, 'willChange should fire again for observer2');
  ok(observer2.didChangeCount == 2, 'didChange should fire again for observer2');
  ok(observer3.willChangeCount == 0, 'willChange should NOT fire for observer3');
  ok(observer3.didChangeCount == 0, 'didChange should NOT fire for observer3');
});
