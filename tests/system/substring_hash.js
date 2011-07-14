// ==========================================================================
// Project:   DataStructures.SubstringHash Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var h;
module("DataStructures Substring Hash", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    h = DataStructures.SubstringHash.create();

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
    });
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
      h.destroy();
    });
    delete h;
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("SubstringHash is a...", function() {
  ok(h.get('isIndex'), "SubstringHash should be an Index");
  ok(h.get('isNormalKeyIndex'), "SubstringHash should be a NormalKeyIndex");
  ok(h.get('isSubstringHash'), "SubstringHash should be a SubstringHash");
});

test("SubstringHash can indexes on substrings", function() {
  var bob = SC.Object.create({bob: 'bob'});

  h.insert("bob", bob);

  ["b","o","bo","ob","bob"].forEach(function(sub) {
    ok(h.isIndexed(sub,bob), "bob should be indexed on \'%@\'".fmt(sub));
  });
});

test("SubstringHash can constrain min index length on substrings", function() {
  var bob = SC.Object.create({bob: 'bob'});

  h.set('keyMin',2);
  h.insert("bob", bob);

  ["bo","ob","bob"].forEach(function(sub) {
    ok(h.isIndexed(sub,bob), "bob should be indexed on \'%@\'".fmt(sub));
  });

  ["b","o"].forEach(function(sub) {
    ok(!h.isIndexed(sub,bob), "bob should NOT be indexed on \'%@\'".fmt(sub));
  });
});

test("SubstringHash can constrain max index on substrings", function() {
  var bob = SC.Object.create({bob: 'bob'});

  h.set('keyMax',2);
  h.insert("bob", bob);

  ["b", "o", "bo","ob"].forEach(function(sub) {
    ok(h.isIndexed(sub,bob), "bob should be indexed on \'%@\'".fmt(sub));
  });

  // not actually indexed on bob, bobo or fobo, but that's the price
  // to pay for short max's
  ["bob","bobo","fobo"].forEach(function(sub) {
    ok(h.isIndexed(sub,bob), "bob appears to be indexed on \'%@\'".fmt(sub));
  });
});
