// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/*globals DataStructures module test ok equals same stop start MyApp */

SC.mixin(DS.Composite, {
  taskQueue: SC.TaskQueue.create({
    runLimit: 10000000000000000,
    _taskCountObserver: function() {
      this.run();
    }.observes('taskCount')
  })
});

var Part, Car;
var basicInterface = [
  'addCompositeChild',
  'addCompositeParent',
  'removeCompositeChild',
  'doCompositeOperation',
  'compositeHasChild',
  'compositeHasParent',
  'compositeSupplant',
  'compositeInspect'
];

module("DataStructures.Composite Mixin Basics", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    var component = {
      horsePower: null,
      getHorsePower: function() {
        var hp = this.doCompositeOperation('get', 'horsePower');

        return hp.reduce(function(prev,item) {
          return prev + item;
        },0);
      },

      weight: null,
      getWeight: function() {
        var componentWeights = this.doCompositeOperation('get', 'weight');

        return componentWeights.reduce(function(prev,item) {
                                         return prev + item;
                                       },0);
      }
    };

    Car = SC.Object.extend(DataStructures.Composite, component);
    Part = SC.Object.extend(DataStructures.Composite, component);

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

test("DataStructures.Composite are inited", function () {
  var c = Car.create({
    DEBUG_COMPOSITE: true
  });

  // check basic interface

  basicInterface.forEach(function(m) {
    ok(this.respondsTo(m), 'Composite c should respond to method +%@+'.fmt(m));
  },c);

  // check composite leaf/parent status

  ok(c.get('compositeIsLeaf'), 'c is a composite leaf as long as nothing has been added');
  ok(!c.get('compositeHasChildren'), 'c doesn\t have any children... yet');

  var part;
  SC.run(function() {
    part = Part.create({
      weight: 10
    });
    c.addCompositeChild(part);
  });

  ok(!c.get('compositeIsLeaf'), 'c is no longer a composite leaf');
  ok(c.get('compositeHasChildren'), 'c should now have a child');

  SC.Logger.log('part destroyed');
  SC.run(function() {
    part.destroy();
  });

  ok(!c.get('compositeHasChildren'), 'c should return to having no children');
  ok(c.get('compositeIsLeaf'), 'c should return to being a leaf');

  // check other initialization stuff

  var c2,p1,p2;
  SC.run(function() {
    c2 = Car.create();
    p1 = Part.create({
      compositeProperties: ['weight', 'horsePower'],
      compositeParents: c2,
      weight: 100,
      horsePower: 100
    });
    p2 = Part.create({
      compositeProperties: ['weight', 'horsePower'],
      compositeParents: c2,
      weight: 10,
      horsePower: 10
    });
  });

  ok(c2.get('isCompositePiece'), 'c2 should be a composite piece now');
  ok(p1.get('isCompositePiece'), 'p1 should be a composite piece now');
  ok(p2.get('isCompositePiece'), 'p2 should be a composite piece now');

  ok(c2.compositeHasChild(p1) && c2.compositeHasChild(p2),
     'c2 should have composite children [p1,p2]');
  ok(p1.compositeHasParent(c2) && p2.compositeHasParent(c2),
     'p1 and p2 should have c2 as a parent');

  ok(c2.get('weight').indexOf(10) >= 0, 'c2 composite value should include p2\'s weight');
  ok(c2.get('weight').indexOf(100) >= 0, 'c2 composite value should include p1\'s weight');

  ok(p2.weight.isDynamicCompositeProperty, 'p2[weight] should be a dynamic computed property');
});

test("DataStructures.Composite are destroyed", function () {
  var c2,p1,p2;
  SC.run(function() {
    c2 = Car.create();
    p1 = Part.create({
      compositeProperties: ['weight', 'horsePower'],
      compositeParents: c2,
      weight: 100,
      horsePower: 100
    });
    p2 = Part.create({
      compositeProperties: ['weight', 'horsePower'],
      compositeParents: c2,
      weight: 10,
      horsePower: 10
    });
  });

  // test destroying composite pieces

  SC.run(function() {
    p2.destroy(); // destroy a composite child
  });

  equals(p2.tryToPerform('compositeHasParent',c2), false, 'p2 is no longer a composite and should have no parents');

  ok(!c2.compositeHasChild(p2), 'c2 should no longer have compositeChild p2');

  ok(c2.get('weight').length == 1, 'c2 should only have one value in its weight composite property');
  ok(c2.get('weight').indexOf(10) == -1, 'c2 composite value should NOT include p2\'s weight after the destroy');
  ok(c2.get('weight').indexOf(100) >= 0, 'c2 composite value should still include p1\'s weight after the destroy');

  // test dynamicCompositeProperties are reset to regular properties after the destroy
  ok(!p2.weight.isDynamicCompositeProperty, 'p2[weight] should NOT be a dynamic computed property...');
  ok(p2.get('weight') == 10, '...although p2.weight should still have its value');

  SC.run(function() {
    c2.destroy(); // destroy a composite parent
  });

  ok(!p1.compositeHasParent(c2), 'p1 should no longer be a child of c2');
  ok(SC.none(c2.get('weight')), 'c2 should no longer have the dynamic computed property \'weight\'');
});

/**
 * these tests are currently failing need to do some hoop jumping until they're fixed...
 * see 'hoop jumping' below
 * also see the TODO on _cmpst_accessPropertyCache
 */
/*
test("modifying an array value is possible", function() {
  var aComposite = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['anArray'],
    anArray: []
  });

  var arrayVal = aComposite.get('anArray');
  arrayVal.push(1);

  ok(aComposite.get('anArray').indexOf(1) >= 0, 'TODO: anArray should contain 1');

  var aCompositeChild = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['anArray'],
    compositeParents: [aComposite],
    anArray: null
  });

  SC.run(function() {
    aCompositeChild.set('anArray',2);
  });

  ok(SC.A(aComposite.get('anArray')).indexOf(1) >= 0, 'TODO: anArray should still contain 1');
  ok(SC.A(aComposite.get('anArray')).indexOf(2) >= 0, 'anArray should now also contain 2');
});
*/

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
