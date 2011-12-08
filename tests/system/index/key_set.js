// ==========================================================================
// Project:   DataStructures.Index.KeySet Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var Klass = DataStructures.Index.KeySet,
  key = "foo",
  set;

module("DataStructures.Index.KeySet", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      set = Klass.create().set('keys',key);
    });
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');

      set.destroy();
    });

    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("Index.KeySets are enumerable objects", function() {
  ok(SC.typeOf(Klass, SC.T_CLASS), "DataStructures.Index.KeySet is an SC class");
  ok(SC.kindOf(set, Klass), "set is a kind of Index.KeySet");
  ok(set.isEnumerable, 'set should be enumerable');
  ok(set.isKeySet, 'quack');
});

test("Index.KeySets can set both nonenumerable and enumerables for _keys_", function() {
  var keyDummy = Klass.create().set('keys',1);
  ok([1].isEqual(keyDummy.get('keys')), 'can set non-enumerable for keys');

  keyDummy.set('keys',[1,2,3]);
  ok([1,2,3].isEqual(keyDummy.get('keys')), 'can set enumerable for keys');
});

test("Index.KeySets length is equals to keys.length ", function() {
  var keys = set.get('keys'),
    len = set.get('length');
  equals(keys.length, 1, 'prereq - keys should have length 1');
  equals(len, keys.length, 'set length should equal keys length');
});

test("Index.KeySets are enumerable", function() {
  var len = 5,
    tpl = "%@-%@",
    keys = function() {
      return SC.IndexSet.create(0,len).map(function(i) {
        return tpl.fmt(key, i);
      },this);
    }();

  set.set('keys', keys);

  expect(len);
  set.forEach(function(k,index) {
    equals(k, tpl.fmt(key, index),
           "set should be able to enumerate over key %@".fmt(index));
  });
});

test("Index.KeySet keys are always flat", function() {
  set.set('keys', [[key]]);
  equals(set.objectAt(0), key, 'set.keys should be flattened');
});

test("Index.KeySet keys are always unique", function() {
  set.set('keys', [key,key,key,key]);
  equals(set.get('length'), 1, 'set.keys should be unique');
});

test("Index.KeySet keys are non-null", function() {
  set.set('keys', [key, null]);
  equals(set.get('length'), 1, 'set.keys should have 1 item');
  equals(set.objectAt(0), key, 'that 1 item should be key');
});

test("Index.KeySet can add keys with +addKeys+", function() {
  equals(set.get('length'),1, 'prereq - set.length should be 1');

  //
  // add 1 key
  //
  var ret;
  SC.run(function() {
    ret = set.addKeys('key2');
  });
  same(set, ret, 'addKeys should return the KeySet');

  equals(set.get('length'),2, 'set.length should be 2');
  ok([key,'key2'].isEqual(set.get('keys')),
    'addKeys should have added "key2"');

  //
  // add many keys with variable arugment list
  //
  SC.run(function() {
    set.addKeys('key3','key4','key5');
  });

  equals(set.get('length'),5, 'set.length should be 5');
  ok([key,'key2','key3','key4','key5'].isEqual(set.get('keys')),
    'addKeys with variable argument list should have added keys');

  //
  // add keys with array argument
  //
  var otherKeys = [1,2,3,4].map(function(i) { return "key-%@".fmt(i); });
  SC.run(function() {
    set.addKeys(otherKeys);
  });

  var newSet = [key,'key2','key3','key4','key5'].concat(otherKeys);
  equals(set.get('length'),newSet.length, 'set.length should be %@'.fmt(newSet.length));
  ok(newSet.isEqual(set.get('keys')), 'addKeys with array should have added keys');
});

test("Index.KeySet can remove keys with +removeKeys+", function() {
  var otherKeys = [1,2,3,4].map(function(i) { return "key-%@".fmt(i); });
  set.addKeys(otherKeys);

  equals(set.get('length'),5, 'prereq - set should have 5 keys');

  //
  // remove 1 key
  //
  var ret;
  SC.run(function() {
    ret = set.removeKeys(otherKeys[0]);
  });
  same(set, ret, 'removeKeys should return the KeySet');

  equals(set.get('length'),4, 'set should have 4 keys');
  equals(set.indexOf(otherKeys[0]), -1, 'set should NOT have %@'.fmt(otherKeys[0]));

  //
  // remove many keys with variable argument list
  //
  SC.run(function() {
    set.removeKeys(otherKeys[1],otherKeys[2]);
  });

  equals(set.get('length'),2, 'set should have 2 keys');
  [1,2].forEach(function(i) {
    equals(set.indexOf(otherKeys[i]), -1,
           'set should NOT have %@'.fmt(otherKeys[i]));
  });

  //
  // remove many keys with array argument
  //
  SC.run(function() {
    set.removeKeys(set.get('keys'));
  });
  equals(set.get('length'),0, 'set should have removed all of it\'s keys');
});

test("Index.KeySets compare themselves to other KeySets", function() {
  var keySet2 = Klass.create().set('keys',key);
  var keySet3 = Klass.create().set('keys',key + "no-match");

  // same result set
  ok(set.isEqual(keySet2), 'key set should be equal to key set with matching keys');

  // different result set
  ok(!set.isEqual(keySet3), 'key set should NOT be equal to key set w/ non-matching keys');
});

test("Index.KeySets intersect", function() {
  var keySet2 = Klass.create().set('keys',[key,key+key]);
  var keySet3 = Klass.create().set('keys',key+"no-match");

  ok(set.intersects(keySet2), 'set and keySet2 do intersect');
  ok(!set.intersects(keySet3), 'set and keySet3 do NOT intersect');
});

test("Index.KeySet does return intersection", function() {
  var keySet2 = Klass.create().set('keys',key);
  var keySet3 = Klass.create().set('keys',key+"no-match");

  ok(set.intersection(keySet2).isEqual([key]), 'set and keySet2 intersection should be [%@]'.fmt(key));
  equals(set.intersection(keySet3).length, 0, 'set and keySet3 should have an empty intersection');
});

test("Index.KeySet can use regexp to compare intersections", function() { // not recommended
  var set = Klass.create().set('keys',['foo','moo','mop']);

  var ooKey = Klass.create().set('keys',/oo/);
  var mKey = Klass.create().set('keys',/^m/);

  var ooIntersection = ooKey.intersection(set);
  var mIntersection = mKey.intersection(set);

  ok(ooIntersection.get('length') == 2, 'ooIntersection should have 2 elements');
  ok(mIntersection.get('length') == 2, 'mIntersection should have 2 elements');

  equals(ooIntersection.objectAt(0),'foo');
  equals(ooIntersection.objectAt(1),'moo');

  equals(mIntersection.objectAt(0),'moo');
  equals(mIntersection.objectAt(1),'mop');
});

test("Index.KeySet do generate consistent hashes for the similar keySets", function() {
  var set1 = Klass.create().set('keys',['foo','moo','mop']);
  var set2 = Klass.create().set('keys',['mop','moo','foo']);

  ok(SC.hashFor(set1) == SC.hashFor(set2), 'set1 and set2 should have the same hash');

  var oldHash = SC.hashFor(set1);
  set1.addKeys('bar');

  ok(SC.hashFor(set1) != oldHash, 'the hash for set1 is different');
});
