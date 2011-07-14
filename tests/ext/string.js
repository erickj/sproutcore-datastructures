// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
var s;
module("String Extension", {
  setup: function() {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      s = new String("string");
    });
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
    });

    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("String objects respond to substrings", function() {
  ok(SC.typeOf(s.substrings) == SC.T_FUNCTION,
    "string objects should respond to the +substrings+ function");
});

test("String.prototype.substrings does generate all substrings of a string", function() {
  var substrings = s.substrings(),
    expected = ["s", "st", "str", "stri", "strin", "string",
                "t", "tr", "tri", "trin", "tring",
                "r", "ri", "rin", "ring",
                "i", "in", "ing",
                "n", "ng",
                "g"];

  expect(expected.length + 1);
  expected.forEach(function(e) {
    ok(substrings.contains(e), "substrings of 'string' should contain '%@'".fmt(e));
  });

  equals(substrings.length, expected.length,
         "substrings should have %@ values".fmt(substrings.length));
});

test("String.prototype.substrings should produce n*(n+1)/2 results", function() {
  var testValues = [
    "abcdefghijklmnopqrstuvwxyz",
    "Mississippi",
    "a",
    "super-cala-fragelistic-expialidocious"
  ];

  var expectedLen = function(str) {
    var l = str.length;
    return l*(l+1)/2;
  };

  expect(testValues.length);
  testValues.forEach(function(v) {
    equals(v.substrings().length, expectedLen(v),
           "string '%@' should have %@ substrings".fmt(v,expectedLen(v)));
  });
});

test("String.prototype.substrings will cap results with min", function() {
  var substrings = s.substrings(3),
    expected = ["str", "stri", "strin", "string",
                "tri", "trin", "tring",
                "rin", "ring",
                "ing"];

  expect(expected.length + 1);
  expected.forEach(function(e) {
    ok(substrings.contains(e), "substrings of 'string' should contain '%@'".fmt(e));
  });

  equals(substrings.length, expected.length,
         "substrings should have %@ values".fmt(expected.length));
});

test("String.prototype.substrings will cap results with max", function() {
  var substrings = s.substrings(1,3),
    expected = ["s", "st", "str",
                "t", "tr", "tri",
                "r", "ri", "rin",
                "i", "in", "ing",
                "n", "ng",
                "g"];

  expect(expected.length + 1);
  expected.forEach(function(e) {
    ok(substrings.contains(e), "substrings of 'string' should contain '%@'".fmt(e));
  });

  equals(substrings.length, expected.length,
         "substrings should have %@ values".fmt(substrings.length));
});
