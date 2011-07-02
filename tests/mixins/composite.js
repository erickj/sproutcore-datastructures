// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/*globals DataStructures module test ok equals same stop start MyApp */

var Part, Car;
var basicInterface = [
  'addCompositeChild',
  'addCompositeParent',
  'removeCompositeChild',
  'doCompositeOperation',
  'compositeHasChild',
  'compositeHasParent',
  'compositeSupplant'
];

module("DataStructures Composite Mixin", {
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
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
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

  basicInterface.forEach(function(m) {
    ok(!this.respondsTo(m), 'Composite p2 should no longer respond to method +%@+'.fmt(m));
  },p2);

  ok(SC.none(p2.get('isCompositePiece')), 'p2 should was destroyed and is no longer a composite piece');
  ok(SC.none(p2.get('compositeIsLeaf')), 'asking p2 if its a compositeLeaf is Mu');
  ok(SC.none(p2.get('compositeHasChildren')), 'asking p2 if it hasChildren is Mu');

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

test("composite root", function() {
  var camaro, camaro2011, v8Engine, superCharger;

  camaro = Car.create({
    weight: 2000,
    horsePower: 250,
    name: 'camaro'
  });

  SC.run(function() {
    v8Engine = Part.create({
      compositeParents: camaro,
      weight: 300,
      horsePower: 100,
      name: 'v8Engine'
    });

    superCharger = Part.create({
      compositeParents: v8Engine,
      weight: 10,
      horsePower: 50,
      name: 'superCharger'
    });
  });

  [camaro, v8Engine, superCharger].forEach(function(piece) {
    ok(SC.isArray(piece.get('compositeRoot')), 'the composite root should always be an array at piece %@'.fmt(piece.name));
    equals(piece.get('compositeRoot')[0].toString(),
         camaro.toString(),
         'camaro should be the root of the composite at piece %@'.fmt(piece.name));
  });
});

test("composite supplant", function() {
  var camaro, camaro2011, v8Engine, superCharger;

  camaro = Car.create({
    weight: 2000,
    horsePower: 250
  });

  SC.run(function() {
    v8Engine = Part.create({
      compositeParents: camaro,
      weight: 300,
      horsePower: 100
    });

    superCharger = Part.create({
      compositeParents: v8Engine,
      weight: 10,
      horsePower: 50
    });

    camaro2011 = Car.create({
      weight: 1000,
      horsePower: 300
    });
  });

  equals(camaro.getHorsePower(), 400, 'camaro should have children as normal');
  equals(camaro2011.getHorsePower(), 300, 'camaro2011 should have no children');

  camaro2011.compositeSupplant(camaro);

  equals(camaro2011.getHorsePower(), 450, 'camaro2011 should have camaro\'s children');
  equals(camaro.getHorsePower(), 250, 'camaro should have no children now');

  ok(!camaro.get('compositeHasChildren'), 'camaro should have no children');
  equals(v8Engine.get('compositeParents').length, 1, 'v8Engine should have 1 composite parent');
});

/**
 * focus here is on composite child/parent tracking
 */
test("a composite can add/remove children and perform operations", function () {
  var camaro = Car.create({
    weight: 2000,
    horsePower: 250
  });

  equals(camaro.getWeight(), 2000, 'calculating stock camaro weight');

  var v8Engine = Part.create({
    weight: 300,
    horsePower: 100
  });

  var superCharger = Part.create({
    weight: 10,
    horsePower: 50
  });

  v8Engine.addCompositeChild(superCharger);
  equals(v8Engine.getWeight(), 310, 'calculating engine weight');

  camaro.addCompositeChild(v8Engine);
  equals(camaro.getWeight(), 2310, 'calculating modified camaro weight');

  ok(v8Engine.removeCompositeChild(superCharger), 'should be able to remove superCharger');
  equals(v8Engine.get('compositeList').length, 1, 'composite list length is 1');
  equals(v8Engine.getWeight(), 300, 'calculating un-supercharged engine weight');
  equals(camaro.getWeight(), 2300, 'calculating un-supercharged camaro weight');

  var racingSeats = Part.create({
    weight: 50,
    horsePower: null
  });

  camaro.addCompositeChild(racingSeats);
  equals(camaro.getWeight(), 2350, 'weigth with racing seats');
  equals(camaro.getHorsePower(), 350, 'racing seats shouldn\'t affect hp');

  // composing bottom up also works
  var mustang = Car.create({
    weight: 2200,
    horsePower: 280
  });

  v8Engine.addCompositeParent(mustang);
  equals(mustang.getWeight(), 2500, 'can also add composite pieces bottom up');

  var restrictorPlate = Part.create({
    weight: 30,
    horsePower: -50
  });

  restrictorPlate.addCompositeParent(v8Engine);
  equals(mustang.getHorsePower(), 330, 'deeper bottom up composite addition');
  equals(camaro.getHorsePower(), 300, 'deeper bottom up composite addition');
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

  soapBoxCar.addCompositeChild(aPart);
  equals(soapBoxCar.get('numChildren'),1,'observer should fire for _compositeChildren after adding parts');

  soapBoxCar.removeCompositeChild(aPart);
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

test("DataStructures.Composite can NOT remove noncomposites", function() {
  var veyron = Car.create(),
    obj = {};

  var catchCount = 0;

  try {
    veyron.removeCompositeChild(obj);
  } catch(e) {
    catchCount++;
  }

  equals(catchCount,1,'an error should have been thrown for removing a noncomposite');
});

/**
 * focus on hooking up compositeParent automatically (no need to call +addCompositeChild+)
 */
test("property compositeParent should auto add object as parent", function() {
  var zeus = SC.Object.create(DataStructures.Composite, {
      offspring: function() {
        return this.doCompositeOperation('get', 'name');
      }
    }),
    children = ['Aphrodite','Orion','Ares','Apollo'];

  children.forEach(function(n) {
    SC.Object.create(DataStructures.Composite, {
      compositeParents: zeus,
      name: n
    });
  });

  var offspring = zeus.offspring();
  children.forEach(function(c) {
    ok(offspring.indexOf(c) > -1, "%@ should be a child".fmt(c));
  });

  equals(offspring.length, children.length, 'offspring should have num[children] elements');
});

/**
 * this is very similar to test 2 in implementation but focuses on KVO aspects
 */
test("compositeProperties should be observable and propogate changes up the composite", function() {
   var forest = SC.Object.create(DataStructures.Composite, {
                              name: 'forest',
                              didChangeCount: 0,
                              allTheLeaves: function() {
                                return this.doCompositeOperation('get','leaves')
                                  .reduce(function(prev,cur) {
                                            return prev + cur;
                                          });
                              },
                              _leavesDidChange: function() {
                                var val = this.allTheLeaves();
                                this._unboundValue = val;
                              }.observes('leaves')
                            }),
    Tree = SC.Object.extend(DataStructures.Composite, {
                              compositeProperties: ['leaves'],
                              compositeParents: forest,
                              leaves: null,

                              branches: function() {
                                return 1;
                              }.property().compositeProperty()
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

  ok(tree1.compositeProperties.indexOf('branches') > -1, "branches should be in tree1's compositeProperties array");

  var branches = forest.get('branches'),
    branchCount = branches.reduce(function(p,c) {
      return p+c;
    });
  equals(branchCount, 2, '2 branches should have been auto added to the compositeProp list (one from each tree)');

  equals(forest._unboundValue, 120, 'forest should have 120 leaves');
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

  equals(tree1.get('leaves').reduce(function(p,c){return p+c;}), 1150);
  equals(tree2.get('leaves').reduce(function(p,c){return p+c;}), 650);
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

test("dynamic composite properties aren't totally fucking insane", function() {
  var UPSTruck = SC.Object.extend(DataStructures.Composite, {
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
    }.property('boxedItems').cacheable().compositeProperty()
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

  equals(truck1.get('cargo').length, 7, 'the truck should have 10 pieces of cargo');

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

test("a composite member can have multiple parents... watch out for paradoxes", function() {
  var _1985 = SC.Object.create(DataStructures.Composite, { year: '1985'}),
    _1955 = SC.Object.create(DataStructures.Composite, { year: '1955'}),
    _1885 = SC.Object.create(DataStructures.Composite, { year: '1885'});

  var delorian = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['characters'],
    compositeParents: [_1985, _1955, _1885],

    characters: null
  });

  delorian.set('characters',['Marty McFly',
                             'Doc Brown']);

  [_1985,_1955,_1885].forEach(function(y) {
    var characters = y.get('characters');
    equals(characters.length, 2, 'the year %@ should have 2 people'.fmt(y.get('year')));
  });

  // also test that the composites can be different
  _1955.set('characters', ['Martys Teen Mom',
                           'BTTF 1: Marty McFly',
                           'BTTF 1: Doc Brown',
                           'Young Biff',
                           'Old Biff from the Future']);

  _1885.set('characters', ['Clara Clayton', 'Maddog Tannen']);

  equals(_1985.get('characters').length, 2, '1985 has 2 characters');
  equals(_1955.get('characters').length, 7, '1985 has 7 characters');
  equals(_1885.get('characters').length, 4, '1885 has 4 characters');

  var timeTrain = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['characters'],
    compositeParents: [_1985, _1885],
    characters: ['Wild West Doc Brown', 'Mrs. Clara Brown']
  });

  equals(_1985.get('characters').length, 4, 'after train enters 1985 and 1885, 1985 has 4 characters');
  equals(_1955.get('characters').length, 7, 'after train enters 1985 and 1885, 1985 has 7 characters');
  equals(_1885.get('characters').length, 6, 'after train enters 1985 and 1885, 1885 has 6 characters');

  _1885.removeCompositeChild(delorian);

  equals(_1985.get('characters').length, 4, 'after delorian leave 1885, 1985 has 4 characters');
  equals(_1955.get('characters').length, 7, 'after delorian leave 1885, 1955 has 7 characters');
  equals(_1885.get('characters').length, 4, 'after delorian leave 1885, 1885 has 4 characters');

  equals(delorian.get('characters').length, 2, 'delorian has 2 characters');
});

test("allow modifying composite DAGs via altering compositeParents prop", function() {
  var _1985 = SC.Object.create(DataStructures.Composite, { year: '1985'}),
    _1955 = SC.Object.create(DataStructures.Composite, { year: '1955'});

  var delorian = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['characters'],
    compositeParents: null,

    characters: null
  });

  delorian.set('characters',['Marty McFly',
                             'Doc Brown']);

  // test observing compositeParents.[]
  delorian.get('compositeParents').pushObject(_1985);
  equals(_1985.get('characters').length, 2, '1985 has 2 characters');

  // test observing compositeParents
  delorian.set('compositeParents', [_1985, _1955]);
  equals(_1985.get('characters').length, 2, '1985 has 2 characters');
  equals(_1955.get('characters').length, 2, '1955 has 2 characters');
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
  var aComposite = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['anArray', 'aPrimitive'],
    anArray: [1],
    aPrimitive: 1
  });

  ok(aComposite.get('aPrimitive') === 1, 'aPrimitive should equal 1 - while aComposite is a leaf');
  ok(aComposite.get('anArray').indexOf(1) >= 0, 'anArray should contain "1"');

  var aCompositeChild = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['anArray', 'aPrimitive'],
    compositeParents: [aComposite],
    anArray: ['d','e','f'],
    aPrimitive: null
  });

  aComposite.set('aPrimitive',2);
  aComposite.set('anArray',['a','b','c']);

  ok(aComposite.get('aPrimitive').indexOf(2) >= 0, 'aPrimitive should be an array that contains 2 once aComposite hasChildren');
  ok(aComposite.get('anArray').indexOf('a') >= 0, 'anArray should contain "a"');
  ok(aComposite.get('anArray').indexOf('d') >= 0, 'anArray should contain "a"');
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
