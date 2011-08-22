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

test("Index does allow multiplexing key inserts via +keyTransform+", function() {
  var transformIndex = Klass.create({
    keyTransform: function(key, doTransform) {
      if (!doTransform) return key;

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

test("Index calls +keyTransform+ ALWAYS with the doTransform flag passed as an argument", function() {
  var keyTransformCalled;
  var keyTransformArgs;

  var transformIndex = Klass.create({
    keyTransform: function(key,doTransform) {
      keyTransformCalled = true;
      keyTransformArgs = SC.A(arguments);
      return key;
    }
  });

  var checkValues = function(key,doTransform) {
    ok(keyTransformCalled, 'keyTransform should be called for value "%@"'.fmt(doTransform));
    equals(keyTransformArgs.length,2,'keyTransform should be passed 2 arguments');
    equals(SC.typeOf(keyTransformArgs[1]), SC.T_BOOL, 'the doTransform arg should be a boolean');
    ok(keyTransformArgs[1] === doTransform, 'doTransform should triple equal %@'.fmt(doTransform));
    ok(keyTransformArgs[0] === key, 'key should triple equal %@'.fmt(key));
  };

  // +lookup+ just happens to be a public API function that passes
  // through doTransform
  transformIndex.lookup('foo',true);
  checkValues('foo',true);

  keyTransformCalled = undefined;
  keyTransformArgs = undefined;
  transformIndex.lookup('foo',false);
  checkValues('foo',false);
});

test("Index does allow enabling/disabling +keyTransform+ via setting doTransform flag", function() {
  var transformIndex = Klass.create({
    keyTransform: function(key,doTransform) {
      if (!doTransform) return key;

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
    keyTransform: function(key, doTransform) {
      if (!doTransform) return key;

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
