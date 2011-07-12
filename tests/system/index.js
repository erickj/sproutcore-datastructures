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
  ok(i.isEnumerable, 'i should be enumerable');
  ok(i.isIndex, 'quack');
});

test("Index is destroyable", function() {
  var iToDestroy = DataStructures.Index.create();

  iToDestroy.insert('foo','bar');
  ok(iToDestroy.get('length') === 1, 'prereq - iToDestroy should have length 1');

  SC.run(function() {
    iToDestroy.destroy();
  });
  ok(iToDestroy.get('length') === 0, 'iToDestroy should have length 0');

  ok(iToDestroy.get('isDestroyed'), 'Index should be destroyed');
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
  equals(i.get('length'), 1, 'Index.length should indicate the number of values in the index');

  ok(i.isIndexed('foo', fooObj), 'fooObj should be indexed at \'foo\'');
  ok(!i.isIndexed('foo', barObj), 'barObj should NOT be indexed at \'foo\'');
});

test("Index can insert values at array of keys", function() {
  var fooObj = {foo: true}, barObj = {bar: true};

  //
  // insert single value at multiple keys
  //
  i.insert(['bar','baz','fiz'],barObj);
  equals(i.get('length'), 1, 'Index +insert+ should only have inserted 1 additional object');

  ok(i.isIndexed('bar', barObj), 'barObj should be indexed at bar');
  ok(!i.isIndexed('bar', fooObj), 'fooObj should NOT be indexed at bar');

  //
  // insert multiple values at multiple keys
  //
  var buzObj = {buz: true},
    muzObj = {muz: true},
    cuzObj = {cuz: true};

  i.insert(['buz','muz','cuz'], buzObj, muzObj, cuzObj);
  equals(i.get('length'), 4, 'Index +insert+ should have inserted 3 additional values');

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
  equals(i.get('length'), 3, 'Index +insert+ should have inserted 3 values');

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
  equals(i.get('length'), 3, 'prereq - Index +insert+ should have inserted 3 values');

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
  equals(i.get('length'), 3, 'prereq - Index +insert+ should have inserted 3 values');

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

test("Index length is decremented on remove", function() {
  var obj = {val: 'foo'};
  i.insert('foo', obj);
  equals(i.get('length'), 1, 'prereq - Index +insert+ should have inserted 1 value');

  SC.run(function() {
    i.remove('foo', obj);
  });

  ok(!i.isIndexed('foo',obj), 'prereq - obj should not be indexed at foo');
  ok(i.get('length') == 0, 'index length should be equal to zero');
});

test("Index remove does not shift references to other objects", function() {
  var obj = {val: 'foo'},
    obj2 = {val: 'bar'},
    obj3 = {val: 'cuz'};

  i.insert('foo', obj,obj2,obj3);
  equals(i.get('length'), 3, 'prereq - Index +insert+ should have inserted 3 values');

  SC.run(function() {
    i.remove('foo', obj);
  });

  equals(i.get('length'), 2, 'prereq - Index should have 2 values');
  same(i.objectAt(0), obj2, 'prereq - obj2 should be at zero');
  same(i.objectAt(1), obj3, 'prereq - obj3 should be at one');

  var indexSet = i.indexSetForKeys('foo');
  same(indexSet.firstObject(), 0, 'the indexSet should get the new index for obj2');
  same(indexSet.indexAfter(0), 1, 'the indexSet should get the new index for obj3');
});
