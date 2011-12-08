DataStructures.TRACK_STATS = NO;

DataStructures.FunctionStats = {
  _callStats: {},

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
      SC.Logger.groupEnd();
    }
    SC.Logger.log("Total Count:",countTotal);
    SC.Logger.groupEnd();
    return this;
  },

  clear: function() {
    this._callStats = {};
    return this;
  }
};

