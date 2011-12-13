// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/*globals DataStructures module test ok equals same stop start MyApp */

SC.mixin(DS.Composite, {
  taskQueue: SC.TaskQueue.create({
    runLimit: 10000000000000000,

    _scheduled: null,
    _taskCountObserver: function() {
      if (!this._scheduled) {
        this.invokeLast(function() {
          this._scheduled = false;
          this.run();
        });
        this._scheduled = true;
      }
    }.observes('taskCount')
  })
});

module("DataStructures.Composite Mixin Sorting", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
    });

    DS.TRACK_STATS = YES;
    SC.AUDIT_OBSERVERS = YES;
    SC.ObserverAuditLog.clear();
  },

  teardown: function() {
    SC.AUDIT_OBSERVERS = NO;
    DS.TRACK_STATS = NO;

    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
      DS.FunctionStats.dump().clear();
      SC.ObserverAuditLog.dump().clear();
    });
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test('composite children can be sorted', function() {
  var aSortedComposite = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['theCompositeValue'],

    compositeCompare: function(a,b) {
      var aSortValue = a.sortValue,
        bSortValue = b.sortValue,
        chooseB = 1,
        chooseA = -1;

      if (SC.none(aSortValue)) return chooseB;
      if (SC.none(bSortValue)) return chooseA;

      return a.sortValue <= b.sortValue ? chooseB : chooseA; // reverse sort
    }
  });

  var children = [1,2,3,4,5].map(function(i) {
    return SC.Object.create(DataStructures.Composite, {
      compositeParents: aSortedComposite,
      compositeProperties: ['theCompositeValue'],
      sortValue: i,
      theCompositeValue: i*100 // just to be different than sortValue
    });
  });

  //
  // test composite children who provide matching sort criteria
  //
  equals(aSortedComposite.get('theCompositeValue')[0], 500, 'the last child should provide the first value in the composite');
  equals(aSortedComposite.get('theCompositeValue')[4], 100, 'the first child should provide the last value in the composite');

  //
  // test that recursive sort is applied properly, i.e. subsorts
  //
  var subchildrenParent = children[3]; // the 2nd to last child
  subchildrenParent.compositeCompare = aSortedComposite.compositeCompare;

  SC.run(function() {
    var subchildren = [4.1, 4.2, 4.3, 4.4, 4.5].map(function(i) {
      return SC.Object.create(DataStructures.Composite, {
        compositeParents: subchildrenParent,
        compositeProperties: ['theCompositeValue'],
        sortValue: i,
        theCompositeValue: i*1000
      });
    });
  });

  var expectedValueOrder = [500,400,4500,4400,4300,4200,4100,300,200,100];

  expect(expectedValueOrder.length + 2);
  expectedValueOrder.forEach(function(i,idx) {
    equals(aSortedComposite.get('theCompositeValue')[idx], i, '%@ should be the value at %@'.fmt(i,idx));
  });
});
