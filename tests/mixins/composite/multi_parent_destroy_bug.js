// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/*globals DataStructures module test ok equals same stop start MyApp */

/**
 * This test is to specifically check for a bug come across on
 * 6/30/11, see the note in composite.js +destroyMixin+, dated with
 * the same date.
 */
module("DataStructures.Composite Mixin Multi Parent Destroy", {
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

test("DataStructures.Composite can destroy a DAG bottom up where a child has multiple parents", function () {
  var Tree = SC.Object.extend(DataStructures.Composite, {
      compositeProperties: ['branches'],
      branches: null
    }),
    Branch = SC.Object.extend(DataStructures.Composite, {
      compositeProperties: ['leaves'],
      leaves: null
    });

  var trees, branch;
  SC.run(function() {
    trees = [1,2].map(function(i) {
      return Tree.create();
    });
    branch = Branch.create({
      compositeParents: trees
    });
  });

  ok(trees[0].compositeHasChild(branch)
     && trees[1].compositeHasChild(branch), 'prereq - dag is constructed');

  var catchCount = 0;
  try {
    SC.run(function() {
      branch.destroy();

      trees.forEach(function(t) {
        t.destroy();
      });
    });
  } catch(e) {
    catchCount++;
  }

  ok(trees[0].get('isDestroyed')
     && trees[0].get('isDestroyed')
     && branch.get('isDestroyed'), 'prereq - dag should be deconstructed');

  equals(catchCount, 0, 'no error should have been thrown');
});
