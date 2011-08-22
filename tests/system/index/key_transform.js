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

test("Index does allow enabling/disabling +keyTransform+ via setting doTransform flag", function() {
  var transformIndex = Klass.create({
    keyTransform: function(key,doTransform) {
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
