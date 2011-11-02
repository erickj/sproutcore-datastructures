// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/*globals DataStructures DS*/

/** @namespace

  Common assets for the DataStructures projects.

  @extends SC.Object
 */
DataStructures = DS = SC.Object.create(
  /** @scope DataStructures.prototype */{

  NAMESPACE: 'DataStructures',
  VERSION: '0.1.0',

  bgTasks: SC.TaskQueue.create({
    runLimit: 1200,
    interval: 200,
    runWhenIdle: YES,
    minimumIdleDuration: 300,

    _last: Date.now(),

    run: function() {
      sc_super();
      this._last = Date.now();
    },

    /**
      The entry point for the idle.
      @private
     */
    _idleEntry: function() {
      this._idleIsScheduled = NO;
      var last = this._last;//SC.RunLoop.lastRunLoopEnd;

      // if no recent events (within < 1s)
      if (Date.now() - last > this.get('minimumIdleDuration')) {
        SC.run(this.run, this);
//        SC.RunLoop.lastRunLoopEnd = last; // we were never here
      }

      // set up idle timer if needed
      this._setupIdle();
    }

  })
});
