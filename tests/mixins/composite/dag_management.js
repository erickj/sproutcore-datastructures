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

module("DataStructures.Composite DAG Managment", {
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

test("composite root", function() {
  var camaro, camaro2011, v8Engine, superCharger, intakeValve;

  camaro = Car.create({
    compositeProperties: ['weight','horsePower'],
    weight: 2000,
    horsePower: 250,
    name: 'camaro'
  });

  SC.run(function() {
    v8Engine = Part.create({
      compositeProperties: ['weight','horsePower'],
      compositeParents: camaro,
      weight: 300,
      horsePower: 100,
      name: 'v8Engine'
    });

    superCharger = Part.create({
      compositeProperties: ['weight','horsePower'],
      compositeParents: v8Engine,
      weight: 10,
      horsePower: 50,
      name: 'superCharger'
    });

    intakeValve = Part.create({
      compositeProperties: ['weight','horsePower'],
      compositeParents: superCharger,
      weight: 10,
      name: 'intakeValve'
    });
  });

  var carsAndParts = [camaro, v8Engine, superCharger, intakeValve];

  ok(camaro.get('compositeIsRoot'), 'camaro is the root of the composite');

  carsAndParts.forEach(function(piece) {
    ok(SC.isArray(piece.get('compositeRoot')), 'the composite root should always be an array at piece %@'.fmt(piece.name));
    same(piece.get('compositeRoot')[0],
         camaro,
         'camaro should be the root of the composite at piece %@'.fmt(piece.name));
  });

  //
  // test compositeRoot can change
  //
  var dealership;

  SC.run(function() {
    dealership = SC.Object.create(DataStructures.Composite);
    dealership.addCompositeChild(camaro);
  });

  ok(dealership.get('compositeIsRoot'), 'dealership is the root of the composite');

  ok(camaro.compositeHasParent(dealership),
    'prereq - delearship should be the composite parent of camaro');

  ok(!camaro.get('compositeIsRoot'), 'camaro is no longer the root of the composite');

  carsAndParts.forEach(function(piece) {
    same(piece.get('compositeRoot')[0],
         dealership,
         'the composite root should have changed for piece: %@'.fmt(piece));
  });

  //
  // test multiple roots
  //
  var deliveryTruck;

  SC.run(function() {
    deliveryTruck = SC.Object.create(DataStructures.Composite);
    deliveryTruck.addCompositeChild(camaro);
  });

  ok(deliveryTruck.get('compositeIsRoot'), 'deliveryTruck is also a root of the composite');

  ok(camaro.compositeHasParent(dealership)
     && camaro.compositeHasParent(deliveryTruck),
    'prereq - camaro should have 2 compositeParents');

  var root, rootOK;
  carsAndParts.forEach(function(piece) {
    root = piece.get('compositeRoot');
    rootOK = root.length == 2
               && SC.isEqual(root[0], dealership)
               && SC.isEqual(root[1], deliveryTruck);
    ok(rootOK, 'compositeRoot should be length 2 and have the correct members for piece %@'.fmt(piece));
  });

  //
  // test staggered roots
  //
  var staggeredParent;
  SC.run(function() {
    staggeredParent = SC.Object.create(DataStructures.Composite);
    staggeredParent.addCompositeChild(intakeValve);
  });

  ok(intakeValve.compositeHasParent(staggeredParent)
     && intakeValve.compositeHasParent(superCharger),
     'prereq - intakeValve should have 2 parents');

  ok(intakeValve.get('compositeRoot').length == 3
     && intakeValve.get('compositeRoot').contains(staggeredParent),
     'intakeValve should now have 3 compositeRoots, one should be staggeredParent');
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

  SC.run(function() {
    camaro2011.compositeSupplant(camaro);
  });

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

  SC.run(function() {
    v8Engine.addCompositeChild(superCharger);
    camaro.addCompositeChild(v8Engine);
  });

  equals(v8Engine.getWeight(), 310, 'calculating engine weight');
  equals(camaro.getWeight(), 2310, 'calculating modified camaro weight');

  var removeSuccess;
  SC.run(function() {
    removeSuccess = v8Engine.removeCompositeChild(superCharger);
  });

  ok(removeSuccess, 'should be able to remove superCharger');

  equals(v8Engine.get('compositeList').length, 1, 'composite list length is 1');
  equals(v8Engine.getWeight(), 300, 'calculating un-supercharged engine weight');
  equals(camaro.getWeight(), 2300, 'calculating un-supercharged camaro weight');

  var racingSeats = Part.create({
    weight: 50,
    horsePower: null
  });

  SC.RunLoop.begin();
  camaro.addCompositeChild(racingSeats);
  SC.RunLoop.end();

  equals(camaro.getWeight(), 2350, 'weigth with racing seats');
  equals(camaro.getHorsePower(), 350, 'racing seats shouldn\'t affect hp');

  // composing bottom up also works
  var mustang = Car.create({
    weight: 2200,
    horsePower: 280
  });

  SC.RunLoop.begin();
  v8Engine.addCompositeParent(mustang);
  SC.RunLoop.end();

  equals(mustang.getWeight(), 2500, 'can also add composite pieces bottom up');

  var restrictorPlate = Part.create({
    weight: 30,
    horsePower: -50
  });

  SC.RunLoop.begin();
  restrictorPlate.addCompositeParent(v8Engine);
  SC.RunLoop.end();

  equals(mustang.getHorsePower(), 330, 'deeper bottom up composite addition');
  equals(camaro.getHorsePower(), 300, 'deeper bottom up composite addition');
});

test("composite should throw error when adding a destroyed child/parent", function() {
  var camaro = Car.create({
    weight: 2000,
    horsePower: 250
  });

  var v8Engine = Part.create({
    weight: 300,
    horsePower: 100
  });

  var superCharger = Part.create({
    weight: 10,
    horsePower: 50
  });

  ok(camaro.get('isCompositePiece'), 'prereq - camaro is a composite piece');
  ok(v8Engine.get('isCompositePiece'), 'prereq - v8Engine is a composite piece');
  ok(superCharger.get('isCompositePiece'), 'prereq - superCharger is a composite piece');

  camaro.destroy();
  superCharger.destroy();

  ok(camaro.get('isDestroyed'), 'prereq - camaro should be destroyed');
  ok(superCharger.get('isDestroyed'), 'prereq - superCharger should be destroyed');

  should_throw(function() { v8Engine.addCompositeParent(camaro); },
               null, // passes for any error
               'expect an error when adding a destroyed parent to a composite piece');
  should_throw(function() { v8Engine.addCompositeChild(superCharger); },
               null, // passes for any error
               'expect an error when adding a destroyed child to a composite piece');
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

test("a composite member can have multiple parents... watch out for paradoxes", function() {
  var _1985 = SC.Object.create(DataStructures.Composite, { year: '1985'}),
    _1955 = SC.Object.create(DataStructures.Composite, { year: '1955'}),
    _1885 = SC.Object.create(DataStructures.Composite, { year: '1885'});

  var delorian = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['characters'],
    compositeParents: [_1985, _1955, _1885],

    characters: null
  });

  SC.RunLoop.begin();
  delorian.set('characters',['Marty McFly',
                             'Doc Brown']);
  SC.RunLoop.end();

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

  SC.RunLoop.begin();
  var timeTrain = SC.Object.create(DataStructures.Composite, {
    compositeProperties: ['characters'],
    compositeParents: [_1985, _1885],
    characters: ['Wild West Doc Brown', 'Mrs. Clara Brown']
  });
  SC.RunLoop.end();

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
  SC.RunLoop.begin();
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
  SC.RunLoop.end();

  equals(_1985.get('characters').length, 2, '1985 has 2 characters');

  // test observing compositeParents
  SC.RunLoop.begin();
  delorian.set('compositeParents', [_1985, _1955]);
  SC.RunLoop.end();
  equals(_1985.get('characters').length, 2, '1985 has 2 characters');
  equals(_1955.get('characters').length, 2, '1955 has 2 characters');
});
