// ==========================================================================
// Project:   DataStructures.Index.ResultSet.ArrayObservers Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var Klass = DataStructures.Index.ResultSet,
  resultSet,
  index,
  values,
  key;

module("DataStructures.Index.ResultSet.ArrayObservers", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      key = DataStructures.Index.KeySet.create().addKeys('foo'),
      resultSet = Klass.create();
      values = [1,2,3,4,5].map(function(i) {
        return SC.Object.create({value: "value-%@".fmt(i)});
      }),

      index = DataStructures.Index.create();
      index.insert.apply(index,[key].concat(values));
    });

    ok(index.get('isIndex'), 'prereq - index should be an index');
    equals(index.get('indexLength'), values.length,
           'prereq - index should have values');

    var valuesOK = true;
    values.forEach(function(v) {
      valuesOK = valuesOK && index.isIndexed(key,v);
    });

    ok(valuesOK, 'prereq - all values should be indexed in index');
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
      resultSet.destroy();
      index.destroy();
      values.forEach(function(v) {
        v.destroy();
      });
      key.destroy();
    });

    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

function loadResultSet(resultSet,key,index) {
  SC.run(function() {
    if (key) resultSet.set('keySet', key);
    if (index) resultSet.set('index', index);
  });

  if (key) {
    same(resultSet.get('keySet'), key,
         'prereq - ResultSet should have keySet %@'.fmt(key));
  }

  if (index) {
    same(resultSet.get('index'), index,
         'prereq - ResultSet should have index %@'.fmt(index));
  }
};

var setupArrayObservers = function(arrayLikeObject) {
  var didChangeArgs = { count: 0, added: 0, removed: 0 },
    didChange = function(start, removed, added) {
      didChangeArgs.start = start;
      didChangeArgs.removed = removed;
      didChangeArgs.added = added;
    };

  var willChangeArgs = { count: 0, added: 0, removed: 0 },
    willChange = function(start, removed, added) {
      willChangeArgs.start = start;
      willChangeArgs.removed = removed;
      willChangeArgs.added = added;
    };

  SC.run(function() {
    arrayLikeObject.addArrayObservers({
      target: this,  // global object
      didChange: didChange,
      willChange: willChange
    });
  });

  ok(didChangeArgs.count == 0, 'prereq - didChange should be zero');
  ok(willChangeArgs.count == 0, 'prereq - willChange should be zero');

  return {
    willChangeArgs: willChangeArgs,
    didChangeArgs: didChangeArgs
  };
};

test("Index.ResultSet calls array observers on additions", function() {
  var observerArgs = setupArrayObservers(resultSet),
    didChangeArgs = observerArgs.didChangeArgs,
    willChangeArgs = observerArgs.willChangeArgs;

  loadResultSet(resultSet,key,index);

  equals(willChangeArgs.start,0,'willChange.start should be tracked at 0 on load');
  equals(didChangeArgs.start,0,'didChange.start should be tracked at 0 on load');

  equals(willChangeArgs.removed, 0, 'willChange should track no removals on load');
  equals(didChangeArgs.removed, 0, 'didChange should track no removals on load');

  equals(willChangeArgs.added, 5, 'willChange should track 5 additions on load');
  equals(didChangeArgs.added, 5, 'didChange should track 5 additions on load');

  SC.run(function() {
    var otherValues = values = [6,7,8].map(function(i) {
      return SC.Object.create({value: "value-%@".fmt(i)});
    });
    index.insert(key,otherValues[0],otherValues[1],otherValues[2]);
  });

  equals(willChangeArgs.start,5,'willChange.start should be tracked at 5 after insert');
  equals(didChangeArgs.start,5,'didChange.start should be tracked at 5 after insert');

  equals(willChangeArgs.removed, 0, 'willChange should track no removals after insert');
  equals(didChangeArgs.removed, 0, 'didChange should track no removals after insert');

  equals(willChangeArgs.added, 3, 'willChange should track 3 additions after insert');
  equals(didChangeArgs.added, 3, 'didChange should track 3 additions after insert');
});

test("Index.ResultSet calls array observers on removals", function() {
  var observerArgs = setupArrayObservers(resultSet),
    didChangeArgs = observerArgs.didChangeArgs,
    willChangeArgs = observerArgs.willChangeArgs;

  loadResultSet(resultSet,key,index);

  equals(willChangeArgs.start,0,'prereq - willChange.start should be tracked at 0 on load');
  equals(didChangeArgs.start,0,'prereq - didChange.start should be tracked at 0 on load');

  equals(willChangeArgs.removed, 0, 'prereq - willChange should track no removals on load');
  equals(didChangeArgs.removed, 0, 'prereq - didChange should track no removals on load');

  equals(willChangeArgs.added, 5, 'prereq - willChange should track 5 additions on load');
  equals(didChangeArgs.added, 5, 'prereq - didChange should track 5 additions on load');

  SC.run(function() {
    index.remove(key,values[0],values[1]);
  });

  SC.Logger.warn('TODO: fix this test once the TODO at DS.ResultSet+_arrayChangeNotificationObserver+ is fixed');
  equals(willChangeArgs.start,0,'willChange.start should be tracked at 0 on load: ONLY TEMPORARY - see warning log');
  equals(didChangeArgs.start,0,'didChange.start should be tracked at 0 on load: ONLY TRACKED - see warning log');

  equals(willChangeArgs.removed, 2, 'willChange should track 2 removals after removal');
  equals(didChangeArgs.removed, 2, 'didChange should track 2 removals after removal');

  equals(willChangeArgs.added, 0, 'willChange should track no additions after removal');
  equals(didChangeArgs.added, 0, 'didChange should track no additions after removal');
});
