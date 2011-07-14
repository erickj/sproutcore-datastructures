// ==========================================================================
// Project:   DataStructures.NormalKeyIndex Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var n;
module("DataStructures.NormalKeyIndex", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    n = DataStructures.NormalKeyIndex.create();

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
    });

    ok(n.get('isIndex'), 'prereq - NormalKeyIndex should be an Index');
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
      n.destroy();
    });
    delete n;
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("NormalKeyIndex is a...", function() {
  ok(n.get('isIndex'), "NormalKeyIndex should be an index");
  ok(n.get('isNormalKeyIndex'), "NormalKeyIndex should be a normal key index");
});

test("NormalKeyIndex does normalize keys", function() {
  var keyResultPairs = {
    "Bob": "bob",
    "Bob G. Smith": "bobgsmith",
    "1 (555) 123.5678": "15551235678",
    "  Wasted Space  ": "wastedspace"
  };

  var val,i=0;
  for (var key in keyResultPairs) if (keyResultPairs.hasOwnProperty(key)) {
    val = keyResultPairs[key];
    n.insert(key,val);

    equals(n.get('indexLength'),i+1, 'prereq - index should have %@ values'.fmt(i+1));
    ok(n.isIndexed(val,val), 'value should be indexed at %@'.fmt(val));
    ok(n.isIndexed(key,val), 'value appears to be indexed at %@'.fmt(key));
    i++;
  }
});
