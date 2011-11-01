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

test("NormalKeyIndex can lookup all records", function() {
  var objs = [0,1,2,3,4,5,6,7,8,9].map(function(i) {
    return {val: 'value-%@'.fmt(i)};
  });

  SC.run(function() {
    n.insert.apply(n, ['foo'].concat(objs));
  });

  var result = n.lookup();
  equals(result.get('length'),n.get('indexLength'), 'looking up with NO key should return all records');
});

test("NormalKeyIndex lookups can match on regexes", function() {
  var fooObjs = [0,1,2,3,4,5,6,7,8,9,11].map(function(i) {
    return {val: 'foo-%@'.fmt(i)};
  });
  var booObjs = [0,1,2,3,4,5,6,7,8,9,11].map(function(i) {
    return {val: 'boo-%@'.fmt(i)};
  });

  SC.run(function() {
    n.insert.apply(n, ['foo'].concat(fooObjs));
    n.insert.apply(n, ['boo'].concat(booObjs));
  });

  var result = n.lookup(/[fb]oo/,false);
  var expected = fooObjs.length + booObjs.length;

  equals(result.get('length'), expected, 'looking up with this regex should return %@ values'.fmt(expected));
});
