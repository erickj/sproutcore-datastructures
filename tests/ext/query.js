// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
var q;
module("DataStructures.QueryTokens Extension", {
  setup: function() {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      q = SC.Query.create();
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

test("query extension should allow mapping arrays", function() {
  var params = {
    array: [0,1,2],
    mapFn: function(i) {
      var str = "abcdefghijklmnopqrstuvwxyz";
      return str[i];
    }
  };

  q.conditions = "({array} MAP {mapFn}) CONTAINS 'a'";
  q.parse();
  ok(q._tokenTree.evaluate(null,params), "array should be mapped from [0,1,2] to [a,b,c]");
});

test("query extension should allow reducing arrays", function() {
  var params = {
    array: [0,1,2],
    rdcFn: function(prev,cur) {
      return prev + cur;
    }
  };

  q.conditions = "{array} REDUCE {rdcFn}";
  q.parse();
  ok(q._tokenTree.evaluate(null,params) == 3, "array should reduce [0,1,2] to 3");
});
