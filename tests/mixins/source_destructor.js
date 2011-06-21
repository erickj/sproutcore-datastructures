// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
module("DataStructures.SourceDestructor Mixin", {
  setup: function() {
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

test("DataStructures.SourceDestructor is an object literal", function() {
  ok(DataStructures.SourceDestructor
     && SC.typeOf(DataStructures.SourceDestructor) == SC.T_HASH, "DataStructures.SourceDestructor is an object literal");
});

test("DataStructures.SourceDestructor destroys objects", function() {
  var destroyCount = 0,
    source = SC.Object.create(),
    dependent = SC.Object.create(DataStructures.SourceDestructor, {
      destroy: function() {
        var ret = sc_super();
        destroyCount++;
        return ret;
      },
      sourceDestructor: source
    });

  ok(!source.get('isDestroyed'), 'prereq - source should NOT be destroyed');
  ok(!dependent.get('shouldDestroy'), 'prereq - dependent should NOT be set to shouldDestroy');

  SC.run(function() {
    source.destroy();
  });

  ok(source.get('isDestroyed'), 'prereq - source should be destroyed');
  ok(dependent.get('isDestroyed'), 'dependent should get destroyed');
  ok(destroyCount == 1, 'destroyCount should have been incremented');
});
