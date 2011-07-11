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

      set = Klass.create({
        key: key
      });
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
});

test("Index.KeySets do transform key", function() {
  ok([key].isEqual(set.get('keys')), "set should provide _keys_ property");
});

test("Index.KeySets are enumerable", function() {
  var len = 5;

  set.set('transform', function() {
    return SC.IndexSet.create(0,len).map(function(i) {
      return "%@-%@".fmt(this.get('key'), i);
    },this);
  });

  expect(len);
  set.forEach(function(k,index) {
    equals(k, "%@-%@".fmt(set.get('key'), index), "set should be able to enumerate over key %@".fmt(index));
  });
});
