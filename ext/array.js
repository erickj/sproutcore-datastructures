DS.Array = {
  fastFlatten: function() {
    var ret = [];
    var len = this.get ? this.get('length') : this.length;
    var cur,isEnum;
    for(var i=0;i<len;i++) {
      cur = this.constructor === Array ? this[i] : this.objectAt(i);
      isEnum = cur && (SC.isArray(cur) || cur.isEnumerable);
      ret = ret.concat(isEnum ? arguments.callee.apply(cur) : cur);
    };
    return ret;
  }
};

SC.mixin(Array.prototype,DS.Array);
SC.mixin(SC.Array,DS.Array);
