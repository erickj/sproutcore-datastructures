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
    ok(h.isIndexed(sub,bob), "object {bob} should be indexed on  key \'%@\'".fmt(sub));
  });

  // not actually indexed on bobo or fobo
  ["bobo","fobo"].forEach(function(sub) {
    ok(!h.isIndexed(sub,bob),
       "bob should NOT appear to be indexed on \'%@\', a string that would generate matching substrings".fmt(sub));
  });
});

// TODO: there is still a hole to fill - see the false negatives
// "TODO" in substring_hash.js above keyTransform
test("SubstringHash can have a low keyMax and still not create false negatives and false positives on zero indexed lookups", function() {
  var bob = SC.Object.create({name: 'robert'});

  h.set('keyMax',4);
  h.insert("robert", bob);

  // make sure we don't report false negatives for zero indexed keys like robert and rober
  ok(h.isIndexed("robert",bob), "object {bob} should be index on key \'%@\'".fmt("robert"));
  ok(h.isIndexed("rober",bob), "object {bob} should be index on key \'%@\'".fmt("rober"));

  // make sure we don't report false positives for non-matching zero indexed keys over the keyMax
  ok(!h.isIndexed("roberto",bob), "object {bob} should NOT be index on key \'%@\'".fmt("roberto"));
});

test("SubstringHash can lookup all records", function() {
  var objs = [0,1,2,3,4,5,6,7,8,9].map(function(i) {
    return {val: 'value-%@'.fmt(i)};
  });

  SC.run(function() {
    h.insert.apply(h, ['foo'].concat(objs));
  });

  var result = h.lookup();
  equals(result.get('length'),h.get('indexLength'), 'looking up with NO key should return all records');
});

test("SubstringHash throws an error on regexp lookups", function() {
  var objs = [0,1,2,3,4,5,6,7,8,9].map(function(i) {
    return {val: 'value-%@'.fmt(i)};
  });

  SC.run(function() {
    h.insert.apply(h, ['foo'].concat(objs));
  });

  should_throw(function() { h.lookup(/foo/); }, null,
               'regexp lookups in substring hashes should not be permitted. its performance suicide');

  should_throw(function() { h.lookup(/foo/,false); }, null,
               'it should also throw an error on doTransform=false');
});
