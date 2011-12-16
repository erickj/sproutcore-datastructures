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

var Part, Car;

module("DataStructures.Composite KVO and Property Tracking", {
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

test("compositeList is observable", function() {
  var soapBoxCar = Car.create({
    weight: 5,
    horsePower: 0,
    numChildren: 0,

    _compositesDidChange: function() {
      this.set('numChildren', this.get('compositeChildren').compact().length);
    }.observes('compositeList')
  }),
  aPart = Part.create({
    weight: 5
  });

  SC.RunLoop.begin();
  soapBoxCar.addCompositeChild(aPart);
  SC.RunLoop.end();

  equals(soapBoxCar.get('numChildren'),1,'observer should fire for _compositeChildren after adding parts');

  SC.RunLoop.begin();
  soapBoxCar.removeCompositeChild(aPart);
  SC.RunLoop.end();

  equals(soapBoxCar.get('numChildren'),0,'observer should fire for _compositeChildren after removing parts');
});

test("DataStructures.Composite can NOT add noncomposites", function() {
  var veyron = Car.create({
    weight: 1000,
    horsePower: 500
  });

  var catchCount = 0;

  try {
    veyron.addCompositeChild(SC.Object.create({
      weight: 100,
      horsePower: 50
    }));
  } catch(e) {
    catchCount++;
  }

  ok(catchCount == 1, 'an error should have been thrown for adding a non composite child');

  try {
    veyron.addCompositeParent(SC.Object.create({
      weight: 100,
      horsePower: 50
    }));
  } catch(e) {
    catchCount++;
  }

  ok(catchCount == 2, 'an error should have been thrown for adding a non composite parent');
});

test("compositeProperties should be observable and propogate changes up the composite", function() {
  var forest, Tree;

  forest = SC.Object.create(DataStructures.Composite, {
    name: 'forest',
    didChangeCount: 0,
    allTheLeaves: function() {
      return SC.A(this.get('leaves'))
        .reduce(function(prev,cur) {
          return prev + cur;
        },0);
    },
    _leavesDidChange: function() {
      var val = this.allTheLeaves();
      this._unboundValue = val;
    }.observes('leaves')
  });

  Tree = SC.Object.extend(DataStructures.Composite, {
    DEBUG_COMPOSITE: YES,
    compositeProperties: ['leaves', 'branches'],
    compositeParents: forest,
    leaves: null,

    branches: function() {
      return 1;
    }.property()
  });

  SC.RunLoop.begin();
  SC.Logger.log('creating tree 1');
  var tree1 = Tree.create({
    leaves: 100,
    name: 'tree1'
  });
  SC.Logger.log('end creating tree 1');

  SC.Logger.log('creating tree 2');
  var tree2 = Tree.create({
    leaves: 20,
    name: 'tree2'
  });
  SC.Logger.log('end creating tree 2');
  SC.RunLoop.end();

  equals(forest._unboundValue, 120, 'forest should have 120 leaves');

  ok(tree1.compositeProperties.indexOf('branches') > -1, "branches should be in tree1's compositeProperties array");

  var branches = forest.get('branches'),
    branchCount = SC.A(branches).reduce(function(p,c) {
      return p+c;
    });
  equals(branchCount, 2, '2 branches should have been auto added to the compositeProperty list (one from each tree)');

  [20,100].forEach(function(i) {
    var leaves = forest.get('leaves');
    ok(leaves.indexOf(i) > -1, "%@ should be in array".fmt(i));
  });

  SC.RunLoop.begin();
  SC.Logger.log('begin setting leaves values on tree1 and tree2');
  tree1.set('leaves', 150);
  tree2.set('leaves', 50);
  SC.Logger.log('end setting leaves values on tree1 and tree2');
  SC.RunLoop.end();

  equals(forest._unboundValue, 200, 'forest should have 200 leaves');

  // and it should continue through multiple levels
  var Branch = SC.Object.extend(DataStructures.Composite, {
    compositeProperties: ['leaves']
  });

  SC.RunLoop.begin();
  SC.Logger.log('add branch1 child to tree1');
  var branch1 = Branch.create({
    name: 'branch1',
    compositeParents: tree1,
    leaves: 1000
  });
  SC.RunLoop.end();

  equals(forest._unboundValue, 1200, 'branch additions should percolate up');

  SC.RunLoop.begin();
  SC.Logger.log('add branch2 child to tree2');
  var branch2 = Branch.create({
    name: 'branch2',
    compositeParents: tree2,
    leaves: 200
  });

  SC.Logger.log('add branch3 child to tree2');
  var branch3 = Branch.create({
    name: 'branch3',
    compositeParents: tree2,
    leaves: 400
  });
  SC.RunLoop.end();

  equals(SC.A(tree1.get('leaves')).reduce(function(p,c){return p+c;}), 1150);
  equals(SC.A(tree2.get('leaves')).reduce(function(p,c){return p+c;}), 650);
  equals(forest._unboundValue, 1800, 'branch additions should percolate up');

  SC.run(function() {
    SC.Logger.log('set branch3 leaves to 600');
    branch3.set('leaves', 600);
  });

  equals(forest._unboundValue, 2000, 'branch changes should percolate up');

  // removals
  SC.run(function() {
    SC.Logger.log('remove branch3 from tree2');
    tree2.removeCompositeChild(branch3);
  });

  ok(!tree2.compositeHasChild(branch3), 'branch3 should not be in the composite');
  equals(forest._unboundValue, 1400, 'composite should update on removal');
});

test("composite should notify of property change when a composite child is removed", function() {
  var Comp = SC.Object.extend(DataStructures.Composite);

  SC.RunLoop.begin();
  var contact = Comp.create({
    propUpdateCounts: {},

    _observer: function(target,key,val,rev) {
      var c = this.propUpdateCounts[key] || 0;
      this.propUpdateCounts[key] = c + 1;
    }.observes('name','catchPhrase','fuzzy')
  });

  var ident = Comp.create({
  });

  var detail = Comp.create({
    compositeProperties: ['name'],
    name: 'Fozzy Bear'
  });
  var detail2 = Comp.create({
    compositeProperties: ['catchPhrase','fuzzy'],
    catchPhrase: 'Wokka-Wokka',
    fuzzy: true
  });

  ident.addCompositeChild(detail);
  ident.addCompositeChild(detail2);
  contact.addCompositeChild(ident);
  SC.RunLoop.end();

  equals(contact.propUpdateCounts.name,1,'prereq - there should be 1 update for name');
  equals(contact.propUpdateCounts.catchPhrase,1,'prereq - there should be 1 update for catchPhrase');
  equals(contact.propUpdateCounts.fuzzy,1,'prereq - there should be 1 update for fuzzy');

  SC.run(function() {
    detail2.destroy();
  });

  equals(contact.propUpdateCounts.name,1,'there should be 1 update for name');
  equals(contact.propUpdateCounts.catchPhrase,2,'there should be 2 update for catchPhrase after delete');
  equals(contact.propUpdateCounts.fuzzy,2,'there should be 2 update for fuzzy after delete');
});

test("composite should propogate new computed properties through caches", function() {
  var Comp = SC.Object.extend(DataStructures.Composite);

  var contact = Comp.create();
  var ident = Comp.create();
  var detail = Comp.create({
    compositeProperties: ['name'],
    name: 'Fozzy Bear'
  });

  SC.run(function() {
    ident.addCompositeChild(detail);
    contact.addCompositeChild(ident);
  });

  equals(contact.get('name'), 'Fozzy Bear', 'prereq - contact should have name Fozzy Bear');

  var decorativeDetail = Comp.create({
    compositeProperties: ['hairColor'],
    hairColor: 'brown'
  });

  SC.run(function() {
    detail.addCompositeChild(decorativeDetail);
  });

  contact.compositeInspect();
  equals(contact.get('hairColor'), 'brown', 'contact should have hairColor');
});

test("dynamic composite properties aren't totally fucking insane", function() {
  var UPSTruck = SC.Object.extend(DataStructures.Composite, {
    compositeProperties: ['cargo'],
    _assortedItems: null,

    // use cargo to test computed property setters
    cargo: function(k,v) {
      if (!this._assortedItems) {
        this._assortedItems = [];
      }

      if (arguments.length == 2) {
        this._assortedItems = this._assortedItems.concat(SC.A(v));
      }

      var ret = SC.A(this.get('boxedItems')).concat(this._assortedItems);
      return ret;
    }.property('boxedItems').cacheable()
  });

  var BagOfStuff = SC.Object.extend(DataStructures.Composite, {
    compositeProperties: ['cargo'],
    cargo: null
  });

  var truck1 = UPSTruck.create();
  truck1.set('cargo',['marbles',
                      'dice',
                      'tacks',
                      'nails']);

  truck1.set('boxedItems', ['mousetraps',
                            'acme anvils',
                            'exploding cigars']);

  equals(truck1.get('cargo').length, 7, 'the truck should have 7 pieces of cargo');

  SC.run(function() {
    var netflixDvds = BagOfStuff.create({
      compositeParents: truck1,
      cargo: ['Back to the Future: Trilogy',
              'Star Wars: The Empire Strikes Back',
              'Total Recall']
    });
  });

  // check that composite properties work still
  equals(truck1.get('cargo').length, 10, 'the truck should have 10 pieces of cargo');

  // add more cargo with a setter - my setter is actually a bit
  // whacky - just to be sure to test computedProperty functions
  // this should NOT override the values there - instead it should
  // append
  truck1.set('cargo',['snowboard',
                      'parachute',
                      'crampons']);

  equals(truck1.get('cargo').length, 13, 'the truck should have 13 pieces of cargo');
});

/**
 * the rules for composite values returning arrays or primitives:
 *
 * if the composite value is NOT a leaf then the return of all
 * compositeProperties is a FLATTENED array
 *
 * if the composite is a leaf return the current value as is
 */
test('orig values remain as primitive or array', function() {
  SC.RunLoop.begin();
  var aComposite = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['anArray', 'aPrimitive'],
    anArray: [1],
    aPrimitive: 1
  });
  SC.RunLoop.end();

  ok(aComposite.get('aPrimitive') === 1, 'aPrimitive should equal 1 - while aComposite is a leaf');
  equals(SC.typeOf(aComposite.get('anArray')),SC.T_ARRAY,'anArray should be an array');
  ok(aComposite.get('anArray').indexOf(1) >= 0, 'anArray should contain "1"');

  SC.RunLoop.begin();
  var aCompositeChild = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['anArray', 'aPrimitive'],
    compositeParents: [aComposite],
    anArray: ['d','e','f'],
    aPrimitive: null
  });
  SC.RunLoop.end();

  SC.RunLoop.begin();
  aComposite.set('aPrimitive',2);
  aComposite.set('anArray',['a','b','c']);
  SC.RunLoop.end();

  ok(aComposite.get('aPrimitive').indexOf(2) === 0, 'aPrimitive should be an array that contains 2 once aComposite hasChildren');
  ok(aComposite.get('anArray').indexOf('a') >= 0, 'anArray should contain "a"');
  ok(aComposite.get('anArray').indexOf('d') >= 0, 'anArray should contain "a"');
});
