DataStructures.QueryTokenExtensions = {
  MAP: {
    reservedWord: true,
    evalType:     'PRIMITIVE',
    leftType:     'PRIMITIVE',
    rightType:    'PRIMITIVE',
    evaluate: function(r,w) {
      var toMap = this.leftSide.evaluate(r,w);
      var mapFn = this.rightSide.evaluate(r,w);

      if (!SC.isArray(toMap)) return null; // TODO: what do to here?
      if (!mapFn['call']) return null;

      return toMap.map(mapFn);
    }
  },

  REDUCE: {
    reservedWord: true,
    evalType:     'PRIMITIVE',
    leftType:     'PRIMITIVE',
    rightType:    'PRIMITIVE',
    evaluate: function(r,w) {
      var to = this.leftSide.evaluate(r,w);
      var rdcFn = this.rightSide.evaluate(r,w);

      if (!SC.isArray(to)) return null; // TODO: what do to here?
      if (!rdcFn['call']) return null;

      return to.reduce(rdcFn);
    }
  }

};

for(var ext in DataStructures.QueryTokenExtensions) {
  var extension;
  if (DataStructures.QueryTokenExtensions.hasOwnProperty(ext)) {
    SC.Query.registerQueryExtension(ext, DataStructures.QueryTokenExtensions[ext]);
  }
}

