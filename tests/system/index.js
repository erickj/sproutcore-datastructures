// ==========================================================================
// Project:   DataStructures.Index Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var i, Klass = DataStructures.Index;

module("DataStructures.Index", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
      i = Klass.create();
    });
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

test("Index is an object", function() {
  ok(SC.typeOf(Klass, SC.T_CLASS), "DataStructures.Index is an SC class");
  ok(SC.kindOf(i, Klass), "i is a kind of Index");
  ok(i.isIndex, 'quack');
});

test("Index is destroyable", function() {
  var iToDestroy = DataStructures.Index.create();

  iToDestroy.insert('foo','bar');
  ok(iToDestroy.get('indexLength') === 1, 'prereq - iToDestroy should have indexLength 1');

  SC.run(function() {
    iToDestroy.destroy();
  });
  ok(iToDestroy.get('indexLength') === 0, 'iToDestroy should have indexLength 0');

  ok(iToDestroy.get('isDestroyed'), 'Index should be destroyed');
});

test("Index does transform keys via +keyNormalize+", function() {
  var transformIndex = Klass.create({
    keyNormalize: function(key) {
      return key && key[0];
    }
  });

  var fooObj = { val: 'foo' },
    keys = ['foo','bar','zab'];

  transformIndex.insert(keys, fooObj);

  keys.forEach(function(k) {
    ok(transformIndex.isIndexed(k, fooObj),
      'fooObj should look like it\'s indexed at \'%@\' - but its really indexed at the transform value \'%@\''.fmt(k,k[0]));
    ok(transformIndex.isIndexed(k[0], fooObj),
      'fooObj should be indexed at \'%@\''.fmt(k[0]));
  });
});

test("Index does allow multiplexing key inserts via +keyTransform+", function() {
  var transformIndex = Klass.create({
    keyTransform: function(key) {
      var ret = [];
      for(var i=0;i<key.length;i++) {
        ret.push(key[i]);
      }
      return ret;
    }
  });

  var fooObj = { val: 'foo' },
    keys = ['foo','bar'];

  transformIndex.insert(keys, fooObj);

  keys.forEach(function(k) {
    for(var i=0;i<k.length;i++) {
      ok(transformIndex.isIndexed(k[i], fooObj),
        'fooObj should be multiplexed into index at \'%@\''.fmt(k[i]));
    }
  });
});

test("Index does allow enabling/disabling +keyTransform+", function() {
  var transformIndex = Klass.create({
    keyTransform: function(key) {
      var ret = [];
      for(var i=0;i<key.length;i++) {
        ret.push(key[i]);
      }
      return ret;
    }
  });

  var fooObj = { val: 'foo' },
    keys = ['foo','bar'];

  transformIndex.insert(keys, fooObj);

  keys.forEach(function(k) {
    for(var i=0;i<k.length;i++) {
      ok(transformIndex.isIndexed(k[i], fooObj),
        'prereq - fooObj should be multiplexed into index at \'%@\''.fmt(k[i]));
    }

    ok(!transformIndex.isIndexed(k, fooObj),
      'by default fooObj should NOT be indexed at \'%@\''.fmt(k));
    ok(transformIndex.isIndexed(k, fooObj, true),
      'fooObj should look like it\'s indexed at \'%@\' - but its really indexed at the transform values'.fmt(k));
  });
});

test("Index does not mutate key during a index/normalize/transform", function() {
  var transformIndex = Klass.create({
    keyTransform: function(key) {
      var ret = DS.Index.KeySet.create();
      for(var i=0;i<key.length;i++) {
        ret.addKeys(key[i]);
      }
      return ret;
    }
  });

  var fooObj = { val: 'foo' },
    keys = ['foo','bar'];

  keys.fooID = "test!";
  transformIndex.insert(keys, fooObj);

  ok(keys.fooID == "test!" && ['foo','bar'].isEqual(keys),
     "keys should not be modified after insert");
});


test("Index can tell if a value is indexed at a key", function() {
  var fooObj = { val: 'foo' },
    barObj =  { val: 'bar' };

  i.insert(['foo','bar','baz'],fooObj);

  //
  // isIndexed with single key
  //
  ['foo','bar','baz'].forEach(function(key) {
    ok(i.isIndexed(key,fooObj), 'isIndexed should show fooObj indexed at %@'.fmt(key));
    ok(!i.isIndexed(key,barObj), 'isIndexed should NOT show barObj indexed at %@'.fmt(key));
  });

  //
  // multiple keys as array
  //
  ok(i.isIndexed(['foo','bar','baz'],fooObj), 'passing an array of keys to isIndexed shows fooObj is indexed');
  ok(!i.isIndexed(['foo','bar','baz'],barObj), 'passing an array of keys to isIndexed shows barObj is NOT indexed');

  //
  // passing a KeySet
  //
  ok(i.isIndexed(DS.Index.KeySet.create().addKeys('foo'), fooObj), 'passing a key set to isIndexed shows fooObj is indexed');
  ok(!i.isIndexed(DS.Index.KeySet.create().addKeys('foo'), barObj), 'passing a key set to isIndexed shows barObj is NOT indexed');
});

test("Index can insert values at single key", function() {
  //
  // insert single value at single key
  //
  var fooObj = {foo: true}, barObj = {bar: true};
  var res = i.insert('foo',fooObj);

  var fooIndex = i.indexOf(fooObj);
  equals(fooIndex, 0, 'fooObj should be indexed into index at position 0');

  same(i, res, 'Index should return itself after call to +insert+');
  equals(i.get('indexLength'), 1, 'Index.indexLength should indicate the number of values in the index');

  ok(i.isIndexed('foo', fooObj), 'fooObj should be indexed at \'foo\'');
  ok(!i.isIndexed('foo', barObj), 'barObj should NOT be indexed at \'foo\'');
});

test("Index can insert values at array of keys", function() {
  var fooObj = {foo: true}, barObj = {bar: true};

  //
  // insert single value at multiple keys
  //
  i.insert(['bar','baz','fiz'],barObj);
  equals(i.get('indexLength'), 1, 'Index +insert+ should only have inserted 1 additional object');

  ok(i.isIndexed('bar', barObj), 'barObj should be indexed at bar');
  ok(!i.isIndexed('bar', fooObj), 'fooObj should NOT be indexed at bar');

  //
  // insert multiple values at multiple keys
  //
  var buzObj = {buz: true},
    muzObj = {muz: true},
    cuzObj = {cuz: true};

  i.insert(['buz','muz','cuz'], buzObj, muzObj, cuzObj);
  equals(i.get('indexLength'), 4, 'Index +insert+ should have inserted 3 additional values');

  ok(i.isIndexed('buz', buzObj)
     && i.isIndexed('muz', buzObj)
     && i.isIndexed('cuz', buzObj),
     'buzObj should be indexed at buz, muz, and cuz');
  ok(i.isIndexed('buz', muzObj)
     && i.isIndexed('muz', muzObj)
     && i.isIndexed('cuz', muzObj),
     'muzObj should be indexed at buz, muz, and cuz');
  ok(i.isIndexed('buz', cuzObj)
     && i.isIndexed('muz', cuzObj)
     && i.isIndexed('cuz', cuzObj),
     'cuzObj should be indexed at buz, muz, and cuz');
});

test("Index can insert values at a KeySet", function() {
  //
  // insert multiple values at multiple keys
  //
  var buzObj = {buz: true},
    muzObj = {muz: true},
    cuzObj = {cuz: true};

  var keySet = DS.Index.KeySet.create();
  keySet.set('keys', ['buz','muz','cuz']);

  i.insert(keySet, buzObj, muzObj, cuzObj);
  equals(i.get('indexLength'), 3, 'Index +insert+ should have inserted 3 values');

  ok(i.isIndexed('buz', buzObj)
     && i.isIndexed('muz', buzObj)
     && i.isIndexed('cuz', buzObj),
     'buzObj should be indexed at buz, muz, and cuz');
  ok(i.isIndexed('buz', muzObj)
     && i.isIndexed('muz', muzObj)
     && i.isIndexed('cuz', muzObj),
     'muzObj should be indexed at buz, muz, and cuz');
  ok(i.isIndexed('buz', cuzObj)
     && i.isIndexed('muz', cuzObj)
     && i.isIndexed('cuz', cuzObj),
     'cuzObj should be indexed at buz, muz, and cuz');
});

test("Index can remove a value on a single key", function() {
  //
  // insert multiple values at multiple keys
  //
  var buzObj = {buz: true},
    muzObj = {muz: true},
    cuzObj = {cuz: true};

  i.insert(['buz','muz','cuz'], buzObj, muzObj, cuzObj);
  equals(i.get('indexLength'), 3, 'prereq - Index +insert+ should have inserted 3 values');

  ['buz','muz','cuz'].forEach(function(key) {
    ok(i.isIndexed(key,buzObj), 'prereq - buzObj should be indexed at key %@'.fmt(key));
    ok(i.isIndexed(key,muzObj), 'prereq - muzObj should be indexed at key %@'.fmt(key));
    ok(i.isIndexed(key,cuzObj), 'prereq - cuzObj should be indexed at key %@'.fmt(key));
  });

  SC.run(function() {
    i.remove('buz',buzObj);
  });

  ok(i.indexOf(buzObj) >= 0, 'buzObj should still be in the index');

  ok(!i.isIndexed('buz',buzObj), 'buzObj should NOT be indexed at key buz');

  ['muz','cuz'].forEach(function(key) {
    ok(i.isIndexed(key,buzObj), 'buzObj should still be indexed at key %@'.fmt(key));
  });

  ['buz','muz','cuz'].forEach(function(key) {
    ok(i.isIndexed(key,muzObj), 'muzObj should still be indexed at key %@'.fmt(key));
    ok(i.isIndexed(key,cuzObj), 'cuzObj should still be indexed at key %@'.fmt(key));
  });

  // remove all references
  SC.run(function() {
    i.remove('muz',buzObj);
    i.remove('cuz',buzObj);
  });

  ok(!i.isIndexed('buz','muz','cuz',buzObj), 'buzObj should NOT be indexed anywhere');
  equals(i.indexOf(buzObj), -1, 'buzObj should be entirely removed from the index');
});

test("Index can remove a value on an array of keys", function() {
  //
  // insert multiple values at multiple keys
  //
  var buzObj = {buz: true},
    muzObj = {muz: true},
    cuzObj = {cuz: true};

  i.insert(['buz','muz','cuz'], buzObj, muzObj, cuzObj);
  equals(i.get('indexLength'), 3, 'prereq - Index +insert+ should have inserted 3 values');

  ['buz','muz','cuz'].forEach(function(key) {
    ok(i.isIndexed(key,buzObj), 'prereq - buzObj should be indexed at key %@'.fmt(key));
    ok(i.isIndexed(key,muzObj), 'prereq - muzObj should be indexed at key %@'.fmt(key));
    ok(i.isIndexed(key,cuzObj), 'prereq - cuzObj should be indexed at key %@'.fmt(key));
  });

  SC.run(function() {
    i.remove(['buz','muz'],buzObj);
  });

  ok(i.isIndexed('cuz',buzObj), 'buzObj should still be indexed at key cuz');

  ['buz','muz'].forEach(function(key) {
    ok(!i.isIndexed(key,buzObj), 'buzObj should NOT be indexed at key %@'.fmt(key));
  });

  ['buz','muz','cuz'].forEach(function(key) {
    ok(i.isIndexed(key,muzObj), 'muzObj should still be indexed at key %@'.fmt(key));
    ok(i.isIndexed(key,cuzObj), 'cuzObj should still be indexed at key %@'.fmt(key));
  });
});

test("Index indexLength is decremented on remove", function() {
  var obj = {val: 'foo'};
  i.insert('foo', obj);
  equals(i.get('indexLength'), 1, 'prereq - Index +insert+ should have inserted 1 value');

  SC.run(function() {
    i.remove('foo', obj);
  });

  ok(!i.isIndexed('foo',obj), 'prereq - obj should not be indexed at foo');
  ok(i.get('indexLength') == 0, 'index indexLength should be equal to 0');

  // add an object back in
  i.insert('foo', obj);

  ok(i.get('indexLength') == 1, 'index indexLength should be equal to 1 after reinsert');
});

function testIndexRemovals(index, objs, idxToRemove, prefix) {
  // remove a second object, farther up
  var nextToGo = objs[idxToRemove],
    newLen = objs.length;

  SC.run(function() {
    index.remove('foo', nextToGo);
    objs = objs.replace(idxToRemove,1,[null]);
  });

  /**
   * TODO: SC.Enumerable.reduce is broken compared to chrome and
   * firefox 5!!! it skips null values
   */
  /*
  var numRemovals = objs.reduce(function(prev,cur) {
      if (SC.none(cur)) {
        prev++;
      }
      return prev;
    },0),
   */
  var numRemovals = 0,
    indexSetSize = index.get('indexLength');

  for (var i=0;i<objs.length; i++) {
    if (SC.none(objs[i]) && objs[i] === null) {
      ++numRemovals;
    }
  }

  equals(indexSetSize, newLen - numRemovals, "%@ prereq - indexLength should equal reference array length - numRemovals".fmt(prefix));

  equals(index.get('length'), newLen,
         '%@ prereq - Index should have %@ values'.fmt(prefix, newLen));
  equals(objs.get('length'), newLen,
         '%@ prereq - objs should have %@ objects'.fmt(prefix, newLen));
  equals(objs.indexOf(nextToGo), -1,
         '%@ prereq - the correct object was removed from objs'.fmt(prefix));

  SC.Logger.group("Test objs array");
  objs.forEach(function(obj,idx) {
    var val = obj && obj.val || obj;
    same(index.objectAt(idx), obj,
         '%@ prereq - obj{%@} should be at %@'.fmt(prefix, val,idx));
    if (val !== null) {
      equals(index.indexOf(obj), idx,
             '%@ indexOf(obj{%@}) should be %@'.fmt(prefix, val,idx));
    } else {
      equals(index.indexOf(obj), -1,
             '%@ indexOf(null) should be -1'.fmt(prefix));
    }
  });
  SC.Logger.groupEnd();

  SC.Logger.group("Test indexSet");
  var indexSet = index.indexSetForKeys('foo');
  equals(indexSet.get('length'), indexSetSize,
         '%@ the indexSet should reference %@ objects'.fmt(prefix, indexSetSize));
  SC.Logger.groupEnd();
}

test("Index remove does not shift references to other objects", function() {
  var objs = [0,1,2,3,4,5,6,7,8,9].map(function(i) {
    return {val: 'value-%@'.fmt(i)};
  });

  i.insert.apply(i, ['foo'].concat(objs));

  equals(i.get('indexLength'), objs.length,
         'prereq - Index +insert+ should have inserted %@ values'.fmt(objs.length));
  equals(i.indexSetForKeys('foo').get('length'),objs.length,
         'prereq - the indexSet should reference %@ objects'.fmt(objs.length));

  //
  // remove one object => [1,2,3,4,5,6,7,8,9]
  //
  SC.Logger.group('remove at 0');
  testIndexRemovals(i, objs, 0, 'remove at 0:');
  SC.Logger.groupEnd();

  //
  // remove a second object, farther up => [1,2,4,5,6,7,8,9]
  //
  SC.Logger.group('remove at 2');
  testIndexRemovals(i, objs, 2, 'remove at 2:');
  SC.Logger.groupEnd();

  //
  // remove another object, in succession with the last => [1,2,4,6,7,8,9]
  //
  SC.Logger.group('remove at 3');
  testIndexRemovals(i, objs, 3, 'remove at 3:');
  SC.Logger.groupEnd();
});

test("Index lookups do return ResultSets", function() {
  var result = i.lookup('foo');
  ok(result.get('isResultSet'), 'lookup should return a result set');

  same(result.get('index'), i, 'i should be set as the index of result');
  ok(DS.Index.KeySet.create().addKeys('foo').isEqual(result.get('keySet')),
     'result should have been given a proper keySet');

  var objs = [0,1,2,3,4,5,6,7,8,9].map(function(i) {
    return {val: 'value-%@'.fmt(i)};
  });

  SC.run(function() {
    i.insert.apply(i, ['foo'].concat(objs));
  });

  equals(result.get('length'),objs.length,
         'result should have %@ values'.fmt(objs.length));
});

test("Index lookups do set _doKeyTransform_ on ResultSets", function() {
  var resultDefault = i.lookup('foo');
  ok(!resultDefault.get('doKeyTransform'),
    'resultDefault set should have doKeyTransform disabled by default');

  var resultDisabled = i.lookup('foo',false);
  ok(!resultDisabled.get('doKeyTransform'),
    'resultDisabled set should have doKeyTransform disabled');

  var resultEnabled = i.lookup('foo',true);
  ok(resultEnabled.get('doKeyTransform'),
    'resultEnabled set should have doKeyTransform enabled');
});
