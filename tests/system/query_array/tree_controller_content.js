
var queryArray, qry, a, dummyTree;
module("DataStructures Query Array", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    qry = SC.Query.create({
      conditions: 'value >= 5 AND value < 10'
    });

    a = [];
    for(var i=0;i<20;i++) {
      a.push(SC.Object.create({value: i}));
    }

    queryArray = DataStructures.QueryArray.create({
      query: qry
    });

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
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

test("use query array as content item for a tree controller", function() {
  dummyTree = SC.TreeController.create({
    content: null,
    treeItemChildrenKey: "items"
  });

  ok(queryArray.isQueryArray, 'queryArray should be a queryArray');

  SC.run(function() {
    dummyTree.set('content', SC.Object.create({
      items: queryArray
    }));

    queryArray.set('referenceArray', a);
  });

  ok(queryArray.get('length') == 5, "prereq - query array should have 5 elements");
  ok(dummyTree.get('arrangedObjects').get('length') == 5, "dummyTree should have 5 elements");
});

