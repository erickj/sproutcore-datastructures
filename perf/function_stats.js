DataStructures.TRACK_STATS = NO;

DataStructures.FunctionStats = {
  _callStats: {},
  _fnProfiles: {},

  startFunction: function(name) {
    if (!DataStructures.TRACK_STATS) return this;

    this._callStats[name] = this._callStats[name] || {};
    this._callStats[name].count = this._callStats[name].count || 0;
    this._callStats[name].count++;
    return this;
  },

  dump: function() {
    SC.Logger.group('FunctionStats Dump');
    var countTotal = 0;

    for(var p in this._callStats) if (this._callStats.hasOwnProperty(p)) {
      var count = this._callStats[p].count;
      SC.Logger.group(p);
      SC.Logger.log("Call Count: %@".fmt(count));
      countTotal += count;

      if (this._fnProfiles && this._fnProfiles[p]) {
        SC.Logger.log("Avg. Execution Time: %@ ms".fmt(this._fnProfiles[p]/count));
      }
      SC.Logger.groupEnd();
    }
    SC.Logger.log("Total Count:",countTotal);
    SC.Logger.groupEnd();

    SC.Logger.log(DataStructures.FunctionStats._fnProfiles);

    return this;
  },

  clear: function() {
    this._callStats = {};
    this._fnProfiles = {};
    return this;
  },

  countsFor: function(name) {
    return this._callStats[name] && this._callStats[name].count || null;
  }
};

Function.prototype.dsProfile = function(name) {
  var that = this;

  return function() {
    DataStructures.FunctionStats.startFunction(name);
    DataStructures.FunctionStats._fnProfiles[name] = DataStructures.FunctionStats._fnProfiles[name] || 0;
    var start = new Date();
    var ret = that.apply(this,arguments);
    DataStructures.FunctionStats._fnProfiles[name] += new Date() - start;
    return ret;
  };
};
