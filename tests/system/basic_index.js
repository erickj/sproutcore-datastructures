// ==========================================================================
// Project:   DataStructures.BasicIndex Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var b;
module("DataStructures.BasicIndex", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    b = DataStructures.BasicIndex.create();

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
    });
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
    });
    delete b;
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("basic indexes can add values", function() {
  ok(!b.isIndexed("foo","bar"), "prereq - foo should NOT be indexed");

  b.index("foo","bar");

  ok(b.isIndexed("foo","bar"), "foo should be indexed");

  //
  // test adding additional values to the index
  //
  b.index("foo", "baz");
  b.index("foo", "buzz");
  b.index("foo", "fuzz");

  ok(b.isIndexed("foo","baz"), "foo should also be indexed to baz");
  ok(b.isIndexed("foo","buzz"), "foo should also be indexed to buzz");
  ok(b.isIndexed("foo","fuzz"), "foo should also be indexed to fuzz");
});

test("basic index is destroyable", function() {
  var bi = DataStructures.BasicIndex.create();
  bi.destroy();
  ok(bi.get('isDestroyed'), 'bi should be destroyed');
});

test("basic indexes can add objects", function() {
  var obj = {
    aKey: 'a value'
  };

  ok(!b.isIndexed("foo",obj), "prereq - foo should NOT be indexed against obj");

  b.index("foo",obj);
  ok(b.isIndexed("foo",obj), "foo should be indexed against obj");
});

test("basic index lookups", function() {
  ok(SC.isArray(b.lookup("foo")), "foo lookup should be an array even when empty");

  b.index("foo", "bar"); // enter bar once
  b.index("foo", "baz");
  b.index("foo", "buzz");
  b.index("foo", "fuzz");

  ok(SC.isArray(b.lookup("foo")), "foo lookup should be an array");

  //
  // test multiple entries
  //
  b.index("foo", "bar"); // enter bar twice
  var l = b.lookup("foo"), c = 0;
  for (var i=0;i<l.length;i++) {
    if (l[i] == "bar") c++;
  }
  equals(c, 2, "there should be 2 instances of 'bar' in the lookup result");
});

test("basic indexes can remove indexed values", function() {
  b.index("foo","bar");
  ok(b.isIndexed("foo","bar"), "prereq - foo should be indexed");

  b.remove("foo","bar");
  ok(!b.isIndexed("foo","bar"), "foo should no longer be indexed to bar");

  //
  // test removing indexes w/ additional values in place
  //
  b.index("foo","bar");
  b.index("foo","baz");
  ok(b.isIndexed("foo","bar") && b.isIndexed("foo","baz"),
    "prereq - foo should be indexed to bar and baz");

  b.remove("foo","bar");
  ok(b.isIndexed("foo","baz"), "foo should still be indexed to baz");
});
