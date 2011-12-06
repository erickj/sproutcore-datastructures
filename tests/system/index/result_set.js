// ==========================================================================
// Project:   DataStructures.Index.ResultSet Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals DataStructures module test ok equals same stop start */
var Klass = DataStructures.Index.ResultSet,
  resultSet,
  index,
  values = [1,2,3,4,5].map(function(i) {
    return SC.Object.create({value: "value-%@".fmt(i)});
  }),
  bValues = [6,7,8,9,10].map(function(i) {
    return SC.Object.create({value: "b-value-%@".fmt(i)});
  }),
  key, bKey;

module("DataStructures.Index.ResultSet", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    SC.run(function() {
      SC.Logger.log('setup runloop execute');

      key = DataStructures.Index.KeySet.create().addKeys('foo'),
      bKey = DataStructures.Index.KeySet.create().addKeys('bar');

      resultSet = Klass.create();

      index = DataStructures.Index.create();
      index.insert.apply(index,[key].concat(values));
      index.insert.apply(index,[bKey].concat(bValues));
    });

    ok(index.get('isIndex'), 'prereq - index should be an index');
    equals(index.get('indexLength'), values.length + bValues.length,
           'prereq - index should have values');

    var valuesOK = true;
    values.forEach(function(v) {
      valuesOK = valuesOK && index.isIndexed(key,v);
    });
    bValues.forEach(function(v) {
      valuesOK = valuesOK && index.isIndexed(bKey,v);
    });

    ok(valuesOK, 'prereq - all values should be indexed in index');
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
      resultSet.destroy();
      index.destroy();
      values.forEach(function(v) {
        v.destroy();
      });
      key.destroy();
      bKey.destroy();
    });

    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

function loadResultSet(resultSet,key,index) {
  SC.run(function() {
    if (key) resultSet.set('keySet', key);
    if (index) resultSet.set('index', index);
  });

  if (key) {
    same(resultSet.get('keySet'), key,
         'prereq - ResultSet should have keySet %@'.fmt(key));
  }

  if (index) {
    same(resultSet.get('index'), index,
         'prereq - ResultSet should have index %@'.fmt(index));
  }
};

test("Index.ResultSets are objects", function() {
  ok(SC.typeOf(Klass, SC.T_CLASS), "DataStructures.Index.ResultSet is an SC class");
  ok(SC.kindOf(resultSet, Klass), "resultSet is a kind of Index.ResultSet");
  ok(resultSet.isEnumerable, 'resultSet should be enumerable');
  ok(resultSet.isResultSet, 'quack');
});

test("Index.ResultSets have the length of object matching their query in the index", function() {
  equals(resultSet.get('length'), 0, 'resultSet should start with length 0');

  loadResultSet(resultSet,key,index);

  equals(resultSet.get('length'), values.length,
     'resultSet should have length %@'.fmt(values.length));
});

test("Index.ResultSets return the objects for a KeySet from an Index", function() {
  var obj = resultSet.objectAt(0);
  same(obj, undefined, 'obj should be undefined to start');

  loadResultSet(resultSet,key,index);

  obj = resultSet.objectAt(0);
  same(obj, values[0], 'values[0] should be the first resultSet object');
});

test("Index.ResultSet can iterate over objects", function() {
  loadResultSet(resultSet,key,index);

  var currentExpectedIndex = 0,
    closureValues = {};

  resultSet.forEach(function(obj,idx,enumerable) {
    equals(idx, currentExpectedIndex,
           'forEach iteration should be at index %@'.fmt(currentExpectedIndex));
    same(obj, values[idx],
         'obj should be the same as object at values[%@]'.fmt(idx));

    currentExpectedIndex++;

    closureValues.enumerable = enumerable;
    closureValues.self = this;
  },values);

  equals(currentExpectedIndex, values.length, 'expected %@ iterations'.fmt(values.length));
  same(closureValues.self, values, 'resultSet forEach "this" should be values');
  same(closureValues.enumerable, resultSet, 'resultSet enumerable should be resultSet');
});

test("Index.ResultSet is immutable", function() {
  loadResultSet(resultSet,key,index);
  var caught = 0;
  try {
    resultSet.replace(0,1,[1]);
  } catch(e) {
    caught++;
  }
  equals(caught,1,'should have caught an error');
});

//
// this is the cool part
//
test("Index.ResultSet is notified of inserts to Index", function() {
  loadResultSet(resultSet,key,index);

  var currentExpectedIndex = 0,
    haveExpected = true;
  resultSet.forEach(function(obj,idx,enumerable) {
    haveExpected = haveExpected && obj === values[idx];
    currentExpectedIndex++;
  },values);

  haveExpected = haveExpected && currentExpectedIndex === values.length;
  ok(haveExpected, 'prereq - all expected objects are in ResultSet');

  var aNewObject = SC.Object.create({
    value: 'aNewObject'
  });

  var oldLen = resultSet.get('length');

  SC.run(function() {
    index.insert(key, aNewObject);
  });

  ok(index.isIndexed(key,aNewObject), 'prereq - index added new object');

  equals(resultSet.get('length'), oldLen + 1, 'a new object appeared!');
  same(resultSet.objectAt(resultSet.get('length') - 1), aNewObject,
       'aNewObject made it into resultSet!!!');
});

test("Index.ResultSet is notified of removes from Index", function() {
  loadResultSet(resultSet,key,index);

  var currentExpectedIndex = 0,
    haveExpected = true;
  resultSet.forEach(function(obj,idx,enumerable) {
    haveExpected = haveExpected && obj === values[idx];
    currentExpectedIndex++;
  },values);

  haveExpected = haveExpected && currentExpectedIndex === values.length;
  ok(haveExpected, 'prereq - all expected objects are in ResultSet');

  var oldLen = resultSet.get('length');

  SC.run(function() {
    index.remove(key, values[0]);
  });

  ok(!index.isIndexed(key,values[0]), 'prereq - value should be removed');

  equals(resultSet.get('length'), oldLen - 1, 'an object was removed');
  same(resultSet.objectAt(0), values[1],
       'values[0] was removed and resultSet was updated');
});

test("Index.ResultSet can receive values from multiple key sets", function() {
  loadResultSet(resultSet,key,index);

  var currentExpectedIndex = 0,
    haveExpected = true;
  resultSet.forEach(function(obj,idx,enumerable) {
    haveExpected = haveExpected && obj === values[idx];
    currentExpectedIndex++;
  },values);

  haveExpected = haveExpected && currentExpectedIndex === values.length;
  ok(haveExpected, 'prereq - all expected objects are in ResultSet');

  var oldLen = resultSet.get('length');

  SC.run(function() {
    resultSet.set('keySet', DS.Index.KeySet.create().addKeys(key,bKey));
  });

  equals(resultSet.get('length'), oldLen + bValues.length,
         'resultSet should now have all the values in this index');

  values.concat(bValues).forEach(function(val) {
    ok(resultSet.contains(val), "%@ is in resultSet".fmt(val));
  });
});

test("Index.ResultSet updates it's own enumerable property when changes occur", function() {
  var count = 0;
  var observer = SC.Object.create({
    resultSet: resultSet,
    _enumDidChange: function() {
      count++;
    }.observes('.resultSet.[]')
  });

  equals(count, 0, 'prereq - count should be 0');
  loadResultSet(resultSet,key,index);
  ok(count >= 1, 'count should be >= 1 after loading index');

  var base = count;

  //
  // insertions
  //
  var relevantObj = SC.Object.create({value: '?'}),
    irrelevantObj = SC.Object.create({value: 'bVal ?'});
  SC.run(function() {
    index.insert(key, relevantObj);
  });
  equals(count, base+1, 'count should be base+1 after an applicable index insert');

  SC.run(function() {
    index.insert(bKey, irrelevantObj);
  });
  equals(count, base+1, 'count should STILL be base+1 after an irrelevant index insert');

  //
  // removals
  //
  SC.run(function() {
    index.remove(key, relevantObj);
  });
  equals(count, base+2, 'count should be base+2 after an applicable index remove');

  SC.run(function() {
    index.remove(bKey, irrelevantObj);
  });
  equals(count, base+2, 'count should STILL be base+2 after an irrelevant index remove');

});

test("Index.ResultSet do index set lookups with doKeyTransform property", function() {
  var tIndex = DataStructures.Index.create({
    keyTransform: function(key,doTransform) {
      if (!doTransform) return key;
      var ret = DS.Index.KeySet.create();
      for (var i=0,l=key.length;i<l;i++) {
        ret.addKeys(key[i]);
      }
      return ret;
    }
  });

  tIndex.insert.apply(tIndex,[key].concat(values));

  equals(tIndex.get('indexLength'), values.length,
         'prereq - tIndex should have inserted values');
  ['f','o'].forEach(function(l) {
    ok(tIndex.isIndexed(l,values[0]), 'prereq - value should be indexed at \'%@\''.fmt(l));
  });

  ok(!tIndex.isIndexed('foo',values[0]), 'prereq - value should NOT be indexed at \'%@\''.fmt('foo'));

  var rs = Klass.create({
    doKeyTransform: NO
  });

  ok(!rs.get('doKeyTransform'), 'doKeyTransform should be false');

  loadResultSet(rs, key, tIndex);

  equals(rs.get('length'), 0, 'ResultSet should NOT have results for key %@'.fmt(key));

  //
  // modifiying doKeyTransform updaets the result set
  //
  SC.run(function() {
    rs.set('doKeyTransform', YES);
  });

  ok(rs.get('doKeyTransform'), 'doKeyTransform should be true');

  equals(rs.get('length'), values.length,
         'ResultSet should have %@ result for key %@'.fmt(key,values.length));
});

test("Index.ResultSet do return undefined for +objectAt+ when its index is null", function() {
  loadResultSet(resultSet,key,index);
  equals(resultSet.get('length'), values.length,
     'prereq - resultSet should have length %@'.fmt(values.length));
  ok(resultSet.objectAt(0), 'prereq - there is something at index 0');

  resultSet.set('index',null);
  same(resultSet.objectAt(0),undefined, 'index = null -> returns undefined');
});

test("Index.ResultSet do return undefined for +objectAt+ when its index is destroyed", function() {
  loadResultSet(resultSet,key,index);
  equals(resultSet.get('length'), values.length,
     'prereq - resultSet should have length %@'.fmt(values.length));
  ok(resultSet.objectAt(0), 'prereq - there is something at index 0');

  resultSet.get('index').destroy();
  same(resultSet.objectAt(0),undefined, 'index isDestroyed -> returns undefined');
});

test("Index.ResultSet should change its results when the key set changes", function() {
  var emptyKeySet = DS.Index.KeySet.create();
  loadResultSet(resultSet,emptyKeySet,index);

  equals(resultSet.get('length'), 0, 'prereq - result set should have 0 values');

  resultSet.set('keySet',key);
  equals(resultSet.get('length'), values.length, 'result set should update its values list');
});
