// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
var Klass, index;
module("DataStructures.Indexable Mixin", {
  setup: function() {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    index = DataStructures.BasicIndex.create();
    Klass = SC.Object.extend(DataStructures.Indexable, {
      indexable: function() {
        return [this.get('key'),this.get('val')];
      }.property('key','val').cacheable(),

      key: null,
      val: null
    });

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
    });
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
      delete Index;
      delete Klass;
    });

    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("indexable basics", function() {
  var i;
  SC.run(function() {
    i = Klass.create({
      index: index,
      key: 'indexMe',
      val: 1
    });
  });

  ok(i.isIndexable, 'check the duck typing property');
  ok(index.isIndexed('indexMe',1), 'our object should have been indexed');
});

test("indexables can index on multiple keys", function() {
  var i;
  SC.run(function() {
    i = Klass.create({
      index: index,
      key: ['indexMe3','indexMe4','indexMe5'],
      val: 2
    });
  });

  ['indexMe3','indexMe4','indexMe5'].forEach(function(str) {
    ok(index.isIndexed(str,2), 'our object should be indexed on key %@'.fmt(str));
  });
});

test("indexable gets removed on destroy", function() {
  var i;
  SC.run(function() {
    i = Klass.create({
      index: index,
      key: 'indexMe',
      val: 1
    });
  });

  ok(index.isIndexed('indexMe',1), 'prereq - our object should have been indexed');

  SC.run(function() {
    i.destroy();
  });

  ok(!index.isIndexed('indexMe',1), 'our object should have been removed from the index');
});

test("indexables are mutable", function() {
  var i;
  SC.run(function() {
    i = Klass.create({
      index: index,
      key: 'indexMe2',
      val: 2
    });
  });

  ok(index.isIndexed('indexMe2',2), 'prereq - our object should have been indexed');

  i.set('key','indexMe2New');

  ok(!index.isIndexed('indexMe2',2), 'our old key should be removed');
  ok(index.isIndexed('indexMe2New',2), 'our new key should have been indexed');
});

test("indexes can change", function() {
  var i, index2 = DataStructures.BasicIndex.create();
  SC.run(function() {
    i = Klass.create({
      index: index,
      key: 'indexMe2',
      val: 2
    });
  });

  ok(index.isIndexed('indexMe2',2), 'prereq - our object should have been indexed');

  SC.run(function() {
    i.set('index', index2);
  });

  ok(!index.isIndexed('indexMe2',2), 'index should have been removed');
  ok(index2.isIndexed('indexMe2',2), 'should be indexed in index2 now');
});

