SC.mixin(SC.DelegateSupport, {
  delegateAPI: function(target, api, targetScope) {
    var scope = targetScope || this;

    for (var fnName in api) {
      if (!(api.hasOwnProperty(fnName) && SC.typeOf(api[fnName]) == SC.T_FUNCTION))
        continue;

      this[fnName] = function(/* protect fnName from closure scope in loop */) {
        var fnName = arguments[0];
        return function() {
          target = (typeof target == "string") ? targetScope.get(target) : target;
          return api[fnName].apply(target, arguments);
        }.delegatedAs(fnName);
      }(fnName, target);
    }
  }
});

Function.prototype.delegatedAs = function(n) {
  this.displayName = n;
  return this;
};

