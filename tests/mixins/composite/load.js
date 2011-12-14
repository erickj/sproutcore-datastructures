/**
 * Load Test for composites
 *
 * N.B. Internet Explorer
 * IE.8 runs the composite load test CRAZY slow
 *
 * i am 99% convinced it is not an algorithmic complexity problem, the
 * slowness of IE is intermittent for long batches of iterations, it
 * seems more like IE running something else on a timer that slows down
 * the currently running javascript.  There are LOTs of stats logged when
 * running the final composite test, just look at the results of creating
 * leaves for each branch:
 *
>> begin logs >>
LOG: branch leaf times 0:,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,94,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,0,109,0,0,0,0,16,0,0,0,0,0,16,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,0,109,0,0,0,0,16,0
LOG: branch-leaf set total/avg/min/max,548,5.48,0,109
LOG: branch leaf times 1:,0,0,16,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,110,0,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,109,0,0,0,0,16
LOG: branch-leaf set total/avg/min/max,485,4.85,0,110
LOG: branch leaf times 2:,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,359,0,0,16,0,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,109,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,110,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0
LOG: branch-leaf set total/avg/min/max,828,8.28,0,359
LOG: branch leaf times 3:,0,0,0,15,0,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,109,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,110,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,109,0,0,0,16,0
LOG: branch-leaf set total/avg/min/max,578,5.78,0,110
LOG: branch leaf times 4:,47,171,188,187,204,203,203,203,0,109,0,16,0,16,15,31,141,47,156,156,188,172,203,187,188,219,203,328,203,141,109,156,172,156,140,172,140,172,157,203,157,156,203,172,219,172,188,219,172,219,343,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0
LOG: branch-leaf set total/avg/min/max,8047,80.47,0,343
LOG: branch leaf times 5:,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,0,0,15,0,0,0,16,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0
LOG: branch-leaf set total/avg/min/max,297,2.97,0,16
LOG: branch leaf times 6:,78,94,93,110,125,140,141,187,157,203,297,203,235,219,219,234,219,250,250,235,125,16,0,16,15,16,15,16,31,31,47,63,62,63,62,78,78,78,79,93,78,94,78,125,125,125,110,125,93,125,94,156,109,125,157,140,125,156,141,156,156,156,125,156,157,203,187,188,156,219,15,0,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,16
LOG: branch-leaf set total/avg/min/max,8907,89.07,0,297
LOG: branch leaf times 7:,0,15,0,0,0,16,0,0,0,0,16,0,0,0,0,0,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,0,15
LOG: branch-leaf set total/avg/min/max,297,2.97,0,16
LOG: branch leaf times 8:,78,219,16,47,62,78,110,156,172,187,219,343,281,203,188,203,219,219,203,234,203,188,187,188,187,188,172,187,203,203,156,219,187,172,203,250,219,203,188,250,219,203,203,235,219,218,250,250,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,0,15
LOG: branch-leaf set total/avg/min/max,9359,93.59,0,343
LOG: branch leaf times 9:,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,15,0,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,31,62,94,78,32,62,219,187,188,204,203,110,31,62,110,140,219,219,203,219,250,234,266,265,235
LOG: branch-leaf set total/avg/min/max,4158,41.58,0,266
<< end logs <<
 *
 * fast avg (per leaf) run times on branches:
 *    0 (5.48 ms)
 *    1 (4.85 ms)
 *    2 (8.28 ms)
 *    3 (5.78 ms)
 *    5 (2.97 ms)
 *    7 (2.97 ms)
 *
 * slow avg (per leaf) run times on branches:
 *    4 (80.47 ms)
 *    6 (89.07 ms)
 *    8 (93.59 ms)
 *    9 (41.58 ms)
 *
 * further the pattern of slowness is more than odd and consistently
 * reproducible, for instance looking at...
 *
 * iteration 4:
 *
 * average time of the first 51 leaves: 155 ms
 *                 the last 49 leaves:    2 ms
 *
 * iteration 6:
 *
 * average time of the first 70 leaves: 125 ms
 *                 the last 30 leaves:    3 ms
 *
 * iterations 8 and 9 exhibit similar patterns.  none of which seems
 * to be consistent with any kind of expected algorithmic slow down.
 * NONE of this is found in chrome or firefox.
 *
 * Looking at a single branch with 1000 leaves we see similar slow patches:

>> begin logs >>
LOG: 0,16,0,0,15,16,0,0,15,0,16,16,0,15,0,16,0,16,0,15,0,16,0,15,0,16,0,0,16,15,0,0,16,0,0,16,0,0,0,15,0,0,16,0,0,15,0,0,16,0,0,16,0,0,0,15,0,0,16,0,0,0,16,0,0,15,0,0,0,16,0,0,15,0,0,16,0,16,0,0,15,0,16,0,0,16,0,15,0,0,16,0,15,0,0,0,16,0,0,16,0,0,15,0,0,0,16,0,0,16,0,0,0,15,0,0,16,0,0,0,15,0,0,16,0,0,16,0,0,0,15,0,0,16,0,0,0,16,0,0,15,0,0,0,16,0,0,0,15,0,0,16,0,0,0,16,0,0,0,15,0,94,0,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,0,16,0,0,0,15,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,16,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,16,0,0,0,15,0,0,0,16,0,0,0,15,0,0,0,16,0,0,0,16,0,0,15,0,0,0,16,0,0,0,16,0,0,0,15,0,0,16,0,0,0,15,0,0,16,0,0,16,0,0,15,0,0,0,16,0,0,0,16,0,0,15,0,0,16,0,0,0,15,0,0,16,0,0,16,0,15,0,0,16,0,0,16,0,0,15,0,0,16,0,0,15,0,0,0,16,0,0,0,16,0,0,0,15,0,0,16,0,0,16,0,0,15,0,0,0,16,0,0,15,0,0,16,0,0,0,16,0,15,0,0,16,0,16,15,0,0,16,0,0,15,0,0,16,0,0,16,0,0,15,0,0,16,0,16,0,0,15,0,16,0,0,15,0,16,0,0,16,0,15,0,0,16,0,16,0,15,0,16,0,47,140,235,15,0,0,0,0,16,0,0,0,16,0,0,15,0,0,31,0,32,0,0,15,0,0,16,16,0,15,0,0,0,16,0,0,15,0,0,0,16,0,0,0,16,0,0,15,0,0,16,0,0,0,16,0,0,15,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,16,0,0,0,15,0,0,0,16,0,0,0,16,0,0,0,15,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,16,0,0,0,15,0,16,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,15,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,16,0,0,31,47,0,15,0,16,16,15,16,31,47,31,63,62,78,125,79,78,78,79,78,109,94,94,94,125,125,0,16,15,0,16,15,32,31,31,31,63,62,63,78,78,110,78,125,109,94,109,94,141,140,110,187,156,125,94,156,125,188,187,188,250,250,187,250,188,219,187,141,235,312,219,219,203,329,234,250,250,203,234,313,0,0,0,15,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,0,0,15,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,15,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,0,16,0,0,0,0,15,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,16,0,0,0,15,0,0,16,15,79,125,31,62,125,250,219,343,266,250,234,234,266,328,250,219,235,328,360,328,297,62,0,0,16,0,16,15,16,16,15,16,31,31,47,47,63,46,79,62,78,63,78,78,109,78,110,94,78,93,157,375,234,156,203,172,171,157,234,156,188,140,188,141,172,141,172,0,0,15,0,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,0,15,0,0,0,0,16,0,0,0,0,16,0,0,0,15,0,0,0,16,0,0,15,0
<< end logs <<

 * This is 1 iteration of 1000 leaf nodes, breaking the single run up
 * into 5 specifically chosen batches the average times look like:
 *   1-610  : 5 ms
 *   611-690: 115 ms
 *   691-850: 3 ms
 *   851-919: 135ms
 *   920-1000: 3 ms
 *
 * for the time being i'm going to ignore this problem
 */
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

var Forest = SC.Object.extend(DataStructures.Composite, {
    compositeProperties: ['trees'],
    trees: null,

    reducedCount: function(key) {
      try {
        var val = SC.A(this.get(key)).reduce(function(prev,current) {
          var val = SC.isArray(current) ? current.length : parseInt(current);
          return prev + val;
        });
        return val;
      } catch(e) {
        SC.Logger.error(e);
        return 0;
      }
    }
  }),
  Tree = SC.Object.extend(DataStructures.Composite, {
    compositeProperties: ['branches'],
    branches: null
  }),
  Branch = SC.Object.extend(DataStructures.Composite, {
    compositeProperties: ['leaves'],
    leaves: null
  }),
  Leaf = SC.Object.extend(DataStructures.Composite, {
    compositeProperties: ['stomata'],
    stomata: null
  });

module("DataStructures.Composite Load Testing", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

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

test("test load for composite supplant", function() {
  var numTrees = 1;
  var numBranches = 10;
  var numLeaves = 100;

  var stomataCount = 0;
  var tree = Tree.create({
    branches: null
  });


  //
  // build a forest
  //
  SC.run(function() {
    var branch, leaf;
    var treeBranches = [];

    for (var b=0; b<numBranches;b++) {
      branch = Branch.create({
        compositeParents: tree,
        leaves: null
      });

      treeBranches.push(branch);
      var branchLeaves = [];

      for (var l=0; l<numLeaves; l++) {
        var numStomata = 1;
        stomataCount += numStomata;
        leaf = Leaf.create({
          compositeParents: branch,
          stomata: numStomata
        });
        branchLeaves.push(leaf);
      }

      branch.set('leaves',branchLeaves); // this is the 'hoop jumping' referred to above
    }
    tree.set('branches',treeBranches); // this is the 'hoop jumping' referred to above
  });

  DS.TRACK_STATS = YES;
  DS.FunctionStats.clear();

  var s;
  // loop multiple times - we're checking that property access gets
  // cached
  for (var i=0;i<100;i++) s = tree.get('stomata');

  DS.FunctionStats.dump();

  equals(s.length, numBranches * numLeaves, 'prereq - sanity check that we have the correct number of elements');
  equals(s.reduce(s.reduceSum),stomataCount, 'prereq - the total should be %@'.fmt(stomataCount));

  ['_cmpst_accessPropertyCache','_cmpst_dynamicProperty.stomata'].forEach(function(fName) {
    var fnCallCounts = DS.FunctionStats.countsFor(fName);
    same(fnCallCounts, 1012, 'after +get+ calls to %@ should be cached on init'.fmt(fName));
  });

  //
  // test caching after a set
  //
  var increment = 10;
  SC.RunLoop.begin();
  tree.get('branches')[0].get('leaves')[0].set('stomata',1 + increment);
  SC.RunLoop.end();

  DS.TRACK_STATS = YES;
  DS.FunctionStats.clear();

  s = tree.get('stomata');

  DS.FunctionStats.dump();

  equals(s.reduce(s.reduceSum),stomataCount, 'prereq - the total should be %@'.fmt(stomataCount + increment));

  ['_cmpst_accessPropertyCache','_cmpst_dynamicProperty.stomata'].forEach(function(fName) {
    var fnCallCounts = DS.FunctionStats.countsFor(fName);
    same(fnCallCounts, 12, 'after +set+ on 1 leaf, calls to %@ should be cached for the rest of the dag'.fmt(fName));
  });

});

test("test load for building composites bottom up", function() {
  var aForest = Forest.create();

  var numTrees = 5;
  var numBranches = 10;
  var numLeaves = 100;

  var stomataCount = 0;
  var trees = [];
  var leafTimes = [], branchTimes = [], treeTimes = [], branchLeafTimes = [];
  var runLoopWrapUpTimeStart, runLoopStartTime = new Date();

  SC.AUDIT_OBSERVERS = YES;
  SC.ObserverAuditLog.clear();

  DS.TRACK_STATS = YES;
  DS.FunctionStats.clear();

  //
  // top down build
  //
  SC.run(function() {
//    SC.LOG_OBSERVERS = YES;
    for (var t=0;t<numTrees;t++) {
      var tt = new Date();

      var tree, branch, leaf;

      tree = Tree.create({
        compositeParents: aForest,
        branches: null
      });

      trees.push(tree);

//      var treeBranches = tree.get('branches');
      var treeBranches = [];

//      SC.Logger.group('created tree %@'.fmt(tree.toString()));
      var btOuter = new Date();
      for (var b=0; b<numBranches;b++) {
        var bt = new Date();

        branch = Branch.create({
          compositeParents: tree,
          leaves: null
        });

        treeBranches.push(branch);

//        var branchLeaves = branch.get('leaves');
        var branchLeaves = [];

        branchLeafTimes.push([]);

        var ltOuter = new Date();
//        SC.Logger.profile('build leaves');

//        SC.Logger.group('created branch %@'.fmt(branch.toString()));
        for (var l=0; l<numLeaves; l++) {
          var lt = new Date();

          var numStomata = 1;
          stomataCount += numStomata;
//          SC.Logger.group('begin create leaf');
          leaf = Leaf.create({
            compositeParents: branch,
            stomata: numStomata
          });
//          SC.Logger.log('done created leaf %@'.fmt(leaf.toString()));
          var lt2 = new Date();
          leafTimes.push(lt2 - lt);
          branchLeafTimes[branchLeafTimes.length - 1].push(lt2 - lt);

          branchLeaves.push(leaf);

//          SC.Logger.log('end create leaf loop'.fmt(leaf.toString()));
//          SC.Logger.groupEnd();
        }
//        SC.Logger.profileEnd();
        branch.set('leaves',branchLeaves); // this is the 'hoop jumping' referred to above

        var ltOuterEnd = new Date();

        var bt2 = new Date();
        branchTimes.push(bt2 - bt - (ltOuterEnd - ltOuter));

//        SC.Logger.log('end create branch %@'.fmt(branch.toString()));
//        SC.Logger.groupEnd();
      }
      tree.set('branches',treeBranches); // this is the 'hoop jumping' referred to above

      var btOuterEnd = new Date();

      var tt2 = new Date();
      treeTimes.push(tt2 - tt - (btOuterEnd - btOuter));

//      SC.Logger.log('end create tree %@'.fmt(tree.toString()));
//      SC.Logger.groupEnd();
    }
//      SC.LOG_OBSERVERS = NO;
    aForest.set('trees',trees);

    runLoopWrapUpTimeStart = new Date();
  });

  var runLoopEndTime = new Date(),
    runLoopWrapUpTime = runLoopEndTime - runLoopWrapUpTimeStart,
    runLoopTotalTime = runLoopEndTime - runLoopStartTime;

  SC.AUDIT_OBSERVERS = NO;
  SC.ObserverAuditLog.dump().clear();
  DS.FunctionStats.dump().clear();

  SC.Logger.log('end run loop: ', runLoopTotalTime);
  SC.Logger.log('wrap up time: ', runLoopWrapUpTime);

  SC.Logger.log('leaf times total/avg/min/max',
    leafTimes.reduce(treeTimes.reduceSum),
    leafTimes.reduce(leafTimes.reduceAverage),
    leafTimes.reduce(leafTimes.reduceMin),
    leafTimes.reduce(leafTimes.reduceMax));
  SC.Logger.log(leafTimes);

  SC.Logger.log('branch times total/avg/min/max',
      branchTimes.reduce(treeTimes.reduceSum),
      branchTimes.reduce(branchTimes.reduceAverage),
      branchTimes.reduce(branchTimes.reduceMin),
      branchTimes.reduce(branchTimes.reduceMax));
  SC.Logger.log(branchTimes);

  SC.Logger.log('tree times total/avg/min/max',
    treeTimes.reduce(treeTimes.reduceSum),
    treeTimes.reduce(treeTimes.reduceAverage),
    treeTimes.reduce(treeTimes.reduceMin),
    treeTimes.reduce(treeTimes.reduceMax));

  SC.Logger.log(treeTimes);
  SC.Logger.log(aForest);

  branchLeafTimes.forEach(function(leafTimeSet,i) {
    SC.Logger.log("branch leaf times %@:".fmt(i), leafTimeSet);
    SC.Logger.log('branch-leaf set total/avg/min/max',
      leafTimeSet.reduce(leafTimeSet.reduceSum),
      leafTimeSet.reduce(leafTimeSet.reduceAverage),
      leafTimeSet.reduce(leafTimeSet.reduceMin),
      leafTimeSet.reduce(leafTimeSet.reduceMax));
  });

  equals(aForest.reducedCount('stomata'),
         stomataCount,
         'There are lots of stomata');

  equals(aForest.get('leaves').length,
         numTrees * numBranches * numLeaves,
         'There are lots of leaves');

  equals(aForest.get('branches').length,
         numTrees * numBranches,
         'There are lots of brances');

  equals(aForest.get('trees').length,
         numTrees,
         'There are lots of trees');

  // I had a problem w/ algorithmic complexity - this calculation
  // helps determine the algorithm did NOT slow down with the number
  // of elements and compute it's statistical significance

  // determine standard deviation of the first 25% and last 25% of the
  // leaf creation times
  var setSize = Math.ceil(leafTimes.length * .25);

  var populationVariance = function(set) {
      var mean = set.reduce(Array.prototype.reduceAverage),
      diffMeanSquares = set.map(function(i) {
        return Math.pow(i - mean, 2);
      });

      return diffMeanSquares.reduce(Array.prototype.reduceAverage);
    },
    sampleVariance = function(set) {
      var mean = set.reduce(Array.prototype.reduceAverage),
      diffMeanSquares = set.map(function(i) {
        return Math.pow(i - mean, 2);
      });

      var tot = diffMeanSquares.reduce(Array.prototype.reduceSum);
      return tot / (set.length - 1); // bessels correction
    },
    stdDev = function(variance) {
      return Math.sqrt(variance);
    },
    lookupPValue = function(t,df,twoTail) {
      twoTail = arguments.length >= 4 ? twoTail : true;
      df = Math.abs(Math.ceil(df));
      var tTable = {
        /** see http://www.math.unb.ca/~knight/utility/t-table.htm */
        p: [[0.10,0.20],[0.05,0.10],[0.025,0.05],[0.01,0.02],[0.005,0.01],[0.001,0.002],[0.0005,0.001]],
        table: [{df:1,values: [3.078,6.314,12.71,31.82,63.66,318.3,637]},{df:2,values: [1.886,2.920,4.303,6.965,9.925,22.330,31.6]},{df:3,values: [1.638,2.353,3.182,4.541,5.841,10.210,12.92]},{df:4,values: [1.533,2.132,2.776,3.747,4.604,7.173,8.610]},{df:5,values: [1.476,2.015,2.571,3.365,4.032,5.893,6.869]},{df:6,values: [1.440,1.943,2.447,3.143,3.707,5.208,5.959]},{df:7,values: [1.415,1.895,2.365,2.998,3.499,4.785,5.408]},{df:8,values: [1.397,1.860,2.306,2.896,3.355,4.501,5.041]},{df:9,values: [1.383,1.833,2.262,2.821,3.250,4.297,4.781]},{df:10,values: [1.372,1.812,2.228,2.764,3.169,4.144,4.587]},{df:11,values: [1.363,1.796,2.201,2.718,3.106,4.025,4.437]},{df:12,values: [1.356,1.782,2.179,2.681,3.055,3.930,4.318]},{df:13,values: [1.350,1.771,2.160,2.650,3.012,3.852,4.221]},{df:14,values: [1.345,1.761,2.145,2.624,2.977,3.787,4.140]},{df:15,values: [1.341,1.753,2.131,2.602,2.947,3.733,4.073]},{df:16,values: [1.337,1.746,2.120,2.583,2.921,3.686,4.015]},{df:17,values: [1.333,1.740,2.110,2.567,2.898,3.646,3.965]},{df:18,values: [1.330,1.734,2.101,2.552,2.878,3.610,3.922]},{df:19,values: [1.328,1.729,2.093,2.539,2.861,3.579,3.883]},{df:20,values: [1.325,1.725,2.086,2.528,2.845,3.552,3.850]},{df:21,values: [1.323,1.721,2.080,2.518,2.831,3.527,3.819]},{df:22,values: [1.321,1.717,2.074,2.508,2.819,3.505,3.792]},{df:23,values: [1.319,1.714,2.069,2.500,2.807,3.485,3.768]},{df:24,values: [1.318,1.711,2.064,2.492,2.797,3.467,3.745]},{df:25,values: [1.316,1.708,2.060,2.485,2.787,3.450,3.725]},{df:26,values: [1.315,1.706,2.056,2.479,2.779,3.435,3.707]},{df:27,values: [1.314,1.703,2.052,2.473,2.771,3.421,3.690]},{df:28,values: [1.313,1.701,2.048,2.467,2.763,3.408,3.674]},{df:29,values: [1.311,1.699,2.045,2.462,2.756,3.396,3.659]},{df:30,values: [1.310,1.697,2.042,2.457,2.750,3.385,3.646]},{df:32,values: [1.309,1.694,2.037,2.449,2.738,3.365,3.622]},{df:34,values: [1.307,1.691,2.032,2.441,2.728,3.348,3.601]},{df:36,values: [1.306,1.688,2.028,2.434,2.719,3.333,3.582]},{df:38,values: [1.304,1.686,2.024,2.429,2.712,3.319,3.566]},{df:40,values: [1.303,1.684,2.021,2.423,2.704,3.307,3.551]},{df:42,values: [1.302,1.682,2.018,2.418,2.698,3.296,3.538]},{df:44,values: [1.301,1.680,2.015,2.414,2.692,3.286,3.526]},{df:46,values: [1.300,1.679,2.013,2.410,2.687,3.277,3.515]},{df:48,values: [1.299,1.677,2.011,2.407,2.682,3.269,3.505]},{df:50,values: [1.299,1.676,2.009,2.403,2.678,3.261,3.496]},{df:55,values: [1.297,1.673,2.004,2.396,2.668,3.245,3.476]},{df:60,values: [1.296,1.671,2.000,2.390,2.660,3.232,3.460]},{df:65,values: [1.295,1.669,1.997,2.385,2.654,3.220,3.447]},{df:70,values: [1.294,1.667,1.994,2.381,2.648,3.211,3.435]},{df:80,values: [1.292,1.664,1.990,2.374,2.639,3.195,3.416]},{df:100,values: [1.290,1.660,1.984,2.364,2.626,3.174,3.390]},{df:150,values: [1.287,1.655,1.976,2.351,2.609,3.145,3.357]},{df:200,values: [1.286,1.653,1.972,2.345,2.601,3.131,3.340]}]
      };

      var lookupTable = tTable.table;
      var i=0;
      for (var l=lookupTable.length;i<l;i++) {
        if (df <= lookupTable[i].df) break;
      }

      var tValues = (lookupTable[i] || lookupTable.slice(-1)[0]).values;
      var pIdx;
      for (pIdx=0;pIdx<tValues.length;pIdx++) {
        if (t <= tValues[pIdx]) break;
      }

      var pValues = (tTable.p[pIdx] || tTable.p.slice(-1)[0]);
      return twoTail ? pValues[1] : pValues[0];
    };

  // remove the top and bottom 1% of outliers, the outliers on the
  // maximum end of the range, as I've noted above, are due to GC I
  // believe
  var sortFn = function(a,b) { return a < b ? -1 : 1; };
  var outliers = Math.floor(setSize * 0.01);
  var firstSet = leafTimes.slice(0,setSize).sort(sortFn).slice(outliers,-1 * outliers),
    lastSet = leafTimes.slice(setSize * -1).sort(sortFn).slice(outliers,-1 * outliers);

  var firstSetMean = firstSet.reduce(firstSet.reduceAverage),
    firstSetVariance = populationVariance(firstSet),
    firstSetStdDev = stdDev(firstSetVariance),

    lastSetMean = lastSet.reduce(lastSet.reduceAverage),
    lastSetVariance = populationVariance(lastSet),
    lastSetStdDev = stdDev(lastSetVariance),

    popMean = leafTimes.reduce(leafTimes.reduceAverage),
    popVariance = populationVariance(leafTimes),
    popStdDev = stdDev(popVariance);

  SC.Logger.log("first set size/avg/var/std dev,samp var, samp std dev", firstSet.length, firstSetMean, firstSetVariance, firstSetStdDev,sampleVariance(firstSet),stdDev(sampleVariance(firstSet)));
  SC.Logger.log("last set size/avg/var/std dev,samp var, samp std dev", lastSet.length, lastSetMean, lastSetVariance, lastSetStdDev,sampleVariance(lastSet),stdDev(sampleVariance(lastSet)));

  // calculate t value using Welch's t-test
  // http://en.wikipedia.org/wiki/Welch's_t_test
  try {
  var Xi = firstSetMean - lastSetMean,
    sTwo1 = sampleVariance(firstSet),
    sTwo2 = sampleVariance(lastSet),
    stdError = Math.sqrt(sTwo1/firstSet.length + sTwo2/lastSet.length),
    t = Math.abs(Xi/stdError);

  // calculate degrees of freedom
  var dfNumerator = Math.pow(sTwo1/firstSet.length + sTwo2/lastSet.length,2),
    df1Denominator = Math.pow(sTwo1/firstSet.length,2)/(firstSet.length - 1),
    df2Denominator =  Math.pow(sTwo2/lastSet.length,2)/(lastSet.length - 1),
    df = Math.round(dfNumerator/(df1Denominator + df2Denominator)),
    pValue = lookupPValue(t,df);

  SC.Logger.log('sTwo1/sTwo2', sTwo1, sTwo2);
  SC.Logger.log('std1/std2',firstSetStdDev,lastSetStdDev);
  SC.Logger.log('Xi', Xi);
  SC.Logger.log('stdError',stdError);
  SC.Logger.log('t/df/p-value',t,df,pValue);

  var significant = pValue <= 0.05;
  if (significant) {
    // arbitrary comparison: set 2 should be no more than 20% slower
    // than set 1.  In reality the observations I've made show set 2
    // run faster than set 1 - but minor variations can spoil that
    // comparison.  +20% is used as a buffer for variations in run
    // time
    ok(lastSetMean <= firstSetMean * 1.2, 'the second set should not be more than 20% slower than the first set');
  } else {
    ok(true, "the result is not statistically signficant");
  }

  var finalWrapUpTime = (new Date()) - runLoopEndTime;
  SC.Logger.log('wrap up time: ', finalWrapUpTime);
} catch(e) {
  SC.Logger.error(e);

  SC.Logger.log('sTwo1/sTwo2', sTwo1, sTwo2);
  SC.Logger.log('std1/std2',firstSetStdDev,lastSetStdDev);
  SC.Logger.log('Xi', Xi);
  SC.Logger.log('stdError',stdError);
  SC.Logger.log('t/df/p-value',t,df,pValue);

  ok(false, 'the tests ran fine but the statistical analysis (in the test code) failed - erick (or someone) needs to fix this crash w/ calculating pValue - there is a null (or undefined) value that is acted on in the lookupPValue function.  look at that big tTable.  See the console for the error');
}
});
