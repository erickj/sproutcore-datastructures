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

test("test load for aggregating composites", function() {
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

  var aForest = Forest.create();

  var numTrees = 1;
  var numBranches = 1;
  var numLeaves = 1000;

  var stomataCount = 0;
  var trees = [];
  var leafTimes = [], branchTimes = [], treeTimes = [], branchLeafTimes = [];
  var runLoopWrapUpTimeStart, runLoopStartTime = new Date();

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

          var numStomata = Math.floor(Math.random() * 100);
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

  // I had a problem w/ complexity this calculation was to determine the algorithm
  // did NOT slow down with the number of elements and compute it's statistical
  // significance

  // determine standard deviation of the first 10% and last 10% of the leaf times
  var setSize = leafTimes.length * .1;

  var populationVariance = function(set) {
      var mean = set.reduce(Array.prototype.reduceAverage),
      diffMeanSquares = set.map(function(i) {
        return Math.pow(i - mean, 2);
      });

      return diffMeanSquares.reduce(Array.prototype.reduceAverage);
    },
    stdVariance = function(set) {
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
    // from http://home.ubalt.edu/ntsbarsh/Business-stat/otherapplets/pvalues.htm
    pValueStudT = function pValueStudT(t,n) {
      t=Math.abs(t); var w=t/Math.sqrt(n); var th=Math.atan(w);
      if(n==1) { return 1-th/PiD2; }
        var sth=Math.sin(th); var cth=Math.cos(th);
        if((n%2)==1)
          { return 1-(th+sth*cth*pValueStatCom(cth*cth,2,n-3,-1))/PiD2; }
        else
          { return 1-sth*pValueStatCom(cth*cth,1,n-3,-1); }
      },
    pValueStatCom = function pValueStatCom(q,i,j,b) {
      var zz=1; var z=zz; var k=i; while(k<=j) { zz=zz*q*k/(k-b); z=z+zz; k=k+2; }
	    return z / 2; // one-tail
    };

  var firstSet = leafTimes.slice(setSize*.1,setSize*1.1).sort().slice(0,-(0.05*setSize)),
    lastSet = leafTimes.slice(setSize * -1).sort().slice(0,-(0.05*setSize));

  var firstSetMean = firstSet.reduce(firstSet.reduceAverage),
    firstSetVariance = populationVariance(firstSet),
    firstSetStdDev = stdDev(firstSetVariance),

    lastSetMean = lastSet.reduce(lastSet.reduceAverage),
    lastSetVariance = populationVariance(lastSet),
    lastSetStdDev = stdDev(lastSetVariance);

    SC.Logger.log("First set size/avg/variance/std dev", firstSet.length, firstSetMean, firstSetVariance, firstSetStdDev);
    SC.Logger.log("Last set size/avg/variance/std dev", lastSet.length, lastSetMean, lastSetVariance, lastSetStdDev);

  SC.Logger.log('first set std var/std dev', stdVariance(firstSet), stdDev(stdVariance(firstSet)));
  SC.Logger.log('last set std var/std dev', stdVariance(lastSet), stdDev(stdVariance(lastSet)));

  // calculate t value using Welch's t-test
  var Xi = Math.max(firstSetMean, lastSetMean) - Math.min(firstSetMean, lastSetMean),
    sTwo1 = stdVariance(firstSet),
    sTwo2 = stdVariance(lastSet),
    stdError = Math.sqrt(sTwo1/firstSet.length + sTwo2/lastSet.length),
    t = Xi/stdError;

  var dfNumerator = Math.pow(sTwo1/firstSet.length + sTwo2/lastSet.length,2),
    df1Denominator = Math.pow(sTwo1/firstSet.length,2)/(firstSet.length - 1),
    df2Denominator =  Math.pow(sTwo2/lastSet.length,2)/(lastSet.length - 1),
    df = dfNumerator/(df1Denominator + df2Denominator),
    pValue = pValueStudT(t,df);

    SC.Logger.log('sTwo1/sTwo2', sTwo1, sTwo2);
    SC.Logger.log('std1/std2',firstSetStdDev,lastSetStdDev);
    SC.Logger.log('Xi', Xi);
    SC.Logger.log('stdError',stdError);
    SC.Logger.log('t/df/p-value', t,df,pValue);

  var significant = pValue < 0.05;

  var nullHyp = 'there are no difference in the means';

  if (significant) {
    SC.Logger.log('first set',firstSet);
    SC.Logger.log('last set',lastSet);
    // arbitrary failure decision:
    // the second set must be no slower than 150% the first set
    ok(lastSetMean <= firstSetMean * 1.5, 'the second set should not be more than 150% slower than the first set');
  } else {
    ok(true, nullHyp);
  }

  var finalWrapUpTime = (new Date()) - runLoopEndTime;
  SC.Logger.log('wrap up time: ', finalWrapUpTime);
});
