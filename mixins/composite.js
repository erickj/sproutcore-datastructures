// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/*globals DataStructures */

/**
  @namespace

  Support methods for the Composite design pattern.
  see http://en.wikipedia.org/wiki/Composite_pattern

  A mojor design goal has been to keep the composite completely
  bottom up composible.  So no part at the top needs to know about
  new composite properties added from the bottom.
*/
DataStructures.Composite = {
  DEBUG_COMPOSITE: NO,

  compositeParents: null, // can be an array or object

  /**
   * In order to understand anything about this implementation
   * you need to understand compositeProperties. Acts like the
   * component declaring the interface of compositeProperties
   */
  // TODO: should these be added to concatenate properties
  compositeProperties: null,

  compositeChildren: null,
  _cmpst_ChildIndex: null,
  _cmpst_Parents: null,
  _cmpst_ParentIndex: null,

  /** quack */
  isCompositePiece: true, // enabled in initMixin

  initMixin: function() {
    this.compositeChildren = [];
    this._cmpst_ChildIndex = {}; // speed up lookups

    this._cmpst_Parents = [];
    this._cmpst_ParentIndex = {}; // speed up lookups

    this.addObserver('compositeChildren',
                     '_cmpst_unbound_compositeChildrenDidChange');
    this.addObserver('compositeChildren.[]',
                     '_cmpst_unbound_compositeChildrenDidChange');

    this._cmpst_initCompositeProperties();
    this._cmpst_initCompositeParents();

    this.set('isCompositePiece', true);
  },

  /**
   * destroying a composite piece will effectively leave all of
   * its children orphaned in relation to the composite. no attempt
   * should be made to include them nor destroy them, only remove
   * the current object from the composite both up and down the DAG
   */
  destroyMixin: function() {
    this.get('compositeParents').forEach(function(p) {
      if (!arguments[0]) return;
      p.removeCompositeChild(this);
    },this);

    this.get('compositeChildren').forEach(function(c) {
      if (!arguments[0]) return;
      this.removeCompositeChild(c);
    },this);

    this.removeObserver('compositeChildren',
                        '_cmpst_unbound_compositeChildrenDidChange');
    this.removeObserver('compositeChildren.[]',
                        '_cmpst_unbound_compositeChildrenDidChange');

    var debug = this.DEBUG_COMPOSITE;

    // remove all dynamic computed properties and return the values
    // to their original states
    for (var p in this) if (this[p] && this[p].isDynamicCompositeProperty) {
      this._cmpst_resetDynamicProperty(p);
    }

    // this for loop is the effective opposite of SC.mixin
    for (var p in DataStructures.Composite) {
      if (DataStructures.Composite.hasOwnProperty(p)
          && this[p]
          && SC.isEqual(this[p], DataStructures.Composite[p])) {
        if (debug) SC.Logger.log('Composite+destroy+: removing property',p);

        if (this.hasOwnProperty(p)) {
          delete this[p];
        } else {
          // the property came from the prototype object and we don't want to modify
          // that in the very likely case there are other inheritors of the prototype
          this[p] = undefined;
        }
      }
    }
  },

  /**
   * from a composite element or leaf perspective there may
   * be multiple parents, and thus possibly multiple roots.
   * @return Array
   */
  compositeRoot: function() {
    if (this.get('compositeParents').get('length') == 0) {
      return [this];
    } else {
      return this.get('compositeParents').getEach('compositeRoot').uniq();
    }
  }.property('compositeParents').cacheable(),

  compositeSupplant: function(composite) {
    var children = composite.get('compositeChildren');
    children.compact().forEach(function(c) {
      this.addCompositeChild(c);
      composite.removeCompositeChild(c);
    },this);
  },

  /**
   * For 99.9% of composite operations we'll probably be doing a +get+
   * operation through here. However the +doCompositeOperation+ is a
   * function that just lets you call any function on all the members of
   * the composite. See the tests for examples
   *
   * @return Array
   */
  _cmpst_isCollecting: false,
  doCompositeOperation: function(op,args) {
    if (!this.get('isCompositePiece')) return null;

    var composites = this.get('compositeList'),
      ret = [];

    args = SC.A(args);
    composites.forEach(function(c) {
      if (!arguments[0]) return;
      try {
        c._cmpst_isCollecting = YES;
        var v = c[op].apply(c,args);
        if (SC.none(v)) return;
        ret = ret.concat(v);
      } finally {
        c._cmpst_isCollecting = NO;
      }
    });

    return ret;
  },

  compositeIsLeaf: function() {
    return this.get('isCompositePiece') && !this.get('compositeHasChildren');
  }.property('compositeHasChildren', 'isCompositePiece').cacheable(),

  compositeHasChildren: function() {
    return this.get('isCompositePiece')
      && this.get('compositeChildren')
      && this.get('compositeChildren').compact().length > 0;
  }.property('compositeList', 'isCompositePiece').cacheable(),

  /**
   * build a flattened list of all our composites objects on each
   * call to this and cache it.  when our composite changes the list
   * is invalidated and rebuilt
   */
  compositeList: function() {
    if (!this.get('isCompositePiece')) return null;

    /**
     *  beware of infinite recursions,
     *  we'll be trying to +doCompositeOperation+ on this return list
     */
    var ret = [this];
    this.compositeChildren.forEach(function(c) {
      if (!arguments[0]) return;
      ret = ret.concat(c.get('compositeList'));
    });

    return ret.flatten();
  }.property('isCompositePiece').cacheable(),

  compositeHasChild: function(c) {
    if (!this.get('isCompositePiece')) return null;

    var h = SC.hashFor(c);
    return !SC.empty(this._cmpst_ChildIndex[h]);
  },

  compositeHasParent: function(p) {
    if (!this.get('isCompositePiece')) return null;

    var h = SC.hashFor(p);
    return !SC.empty(this._cmpst_ParentIndex[h]);
  },

  /**
   * TODO: the last big todo is to avoid creating loops with
   * the composite.  currently i check to see if the compositeHasChildren,
   * (direct children).  what also needs to occur is the check needs to be
   * made up the composite as well.  it would be nice to somehow
   * make teh compositeParentIndex a composite property that is auto updated
   * for each node up the composite as nodes are added... but who knows
   */
  addCompositeChild: function(c) {
    if (this.compositeHasChild(c)) return c;

    // TODO: see the note above about avoiding loops
    if (this.compositeHasParent(c)) return null;

    if (!c.isCompositePiece) {
      throw new Error("only composite pieces may be added as a child - try mixing DataStructures.Composite into your child object first");
    }

    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('%@ - pushing object on compositeChildren'.fmt(this.toString()));

    this.compositeChildren.pushObject(c);

    var cLen = this.compositeChildren.length;
    this._cmpst_ChildIndex[SC.hashFor(c)] = cLen - 1;

    c._addCompositeParent(this);

    // update the composite property list from new children
    // so that we're sure those changes get propogated
    this._cmpst_notifyOfChildProvidedCompositePropertiesChange(c);

    return c;
  },

  removeCompositeChild: function(c) {
    if (!this.compositeHasChild(c)) return null;

    var h = SC.hashFor(c),
    idx = this._cmpst_ChildIndex[h],
    child = this.compositeChildren[idx],
    cLen;

    if (SC.none(idx)) return null;

    this.propertyWillChange('compositeChildren');
    delete this._cmpst_ChildIndex[h];
    this.compositeChildren.replace(idx,1,[null]); // need to fill with [null] so as not to shift indices
    this.propertyDidChange('compositeChildren');

    if (child) {
      // yeah yeah yeah - this is supposed to be private...
      // TODO: this can't be implemented correctly until the compositeParent
      // array observers are done properly by implementing range observers.
      // detecting removedParents on willChange and addedParents on didChange
      // would allow us to just set/modify the compositeParents array w/ array access
      // function like removeObject
      child._removeCompositeParent(this);
    }

    this._cmpst_notifyOfChildProvidedCompositePropertiesChange(c);

    return c;
  },

  addCompositeParent: function(p) {
    if (this.compositeHasParent(p)) return p;

    // TODO: see the note above about avoiding loops
    if (this.compositeHasChild(p)) return null;

    if (!p.isCompositePiece) {
      throw new Error("only composite pieces may be added as a parent - try mixing DataStructures.Composite into your parent object first");
    }

    p.addCompositeChild(this);
    return p;
  },

  /* private */
  _cmpst_initCompositeParents: function() {
    if (!this.compositeParents) {
      this.compositeParents = [];
    }
    this.compositeParents = SC.A(this.compositeParents);

    this.addObserver('compositeParents.[]',
                     '_cmpst_unbound_compositeParentsDidChange');
    this.addObserver('compositeParents',
                     '_cmpst_unbound_compositeParentsDidChange');

    //this.notifyPropertyChange('compositeParents');
    this._cmpst_unbound_compositeParentsDidChange();
  },

  /* private */
  _cmpst_initCompositeProperties: function() {
    if (!this.compositeProperties) {
      this.compositeProperties = [];
    }

    this.addObserver('compositeProperties.[]',
                     '_cmpst_unbound_compositePropertiesDidChange');
    this.addObserver('compositeProperties',
                     '_cmpst_unbound_compositePropertiesDidChange');

    for (var p in this) {
      if (this[p]
          && this[p].isCompositeProperty
          && this.compositeProperties.indexOf(p) < 0) {
        this.compositeProperties.push(p);
      }
    }

    // optimized to avoid using notifyPropertyChange for compositeProperties
    this._cmpst_updateCompositePropertyMonitors();
  },

  /* private */
  _addCompositeParent: function(p) {
    if (this.compositeHasParent(p)) return p;

    var pLen;
    this._cmpst_Parents.push(p);
    pLen = this._cmpst_Parents.length;
    this._cmpst_ParentIndex[SC.hashFor(p)] = pLen - 1;

    if (this.get('compositeParents').indexOf(p) < 0) {
      this.get('compositeParents').push(p); // don't alert the observers
    }

    return p;
  },

  /* private */
  _removeCompositeParent: function(p) {
    if (!this.compositeHasParent(p)) return null;

    var h = SC.hashFor(p),
    idx = this._cmpst_ParentIndex[h],
    parent = this._cmpst_Parents[idx],
    cLen;

    if (SC.none(idx)) return false;

    delete this._cmpst_ParentIndex[h];
    this._cmpst_Parents.replace(idx,1,[null]);  // need to fill with [null] so as not to shift indices

    this.get('compositeParents').removeObject(p);

    return true;
  },

  _cmpst_unbound_compositeChildrenDidChange: function(target,key,val,rev) {
    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('%@ at %@ - key = %@ compositeChildrenDidChange'.fmt(this.toString(), rev, key),  SC.A(arguments).join(':'));

    this._cmpst_clearCompositeListCache();
  },

  _cmpst_clearCompositeListCache: function() {
    this.notifyPropertyChange('compositeList');

    this._cmpst_Parents.forEach(function (p) {
      if (!arguments[0]) return;
      p.notifyPropertyChange('compositeList');
    });
  },

  /**
   * private
   *
   * add parents to this composite member as items on the
   * compositeParent property changes
   *
   * this function is for observing 'compositeParents' and
   * 'compositeParents.[]' ONLY.  NOT for observing '_cmpst_Parents'
   * sorry for the naming confusion.
   */
  _cmpst_unbound_compositeParentsDidChange: function() {
    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('%@ - compositeParentsDidChange'.fmt(this.toString()), SC.A(arguments).join(':'));

    this.get('compositeParents').forEach(function compositeParentsIterator(p) {
      if (!arguments[0]) return;
      if (this.DEBUG_COMPOSITE)
        SC.Logger.log('%@ adding child %@ - has child'.fmt(p.toString(), this.toString()), p.compositeHasChild(this));

      p.addCompositeChild(this);
    },this);
  },

  /**
   * private
   *
   * propogates properties from composite children into this object
   */
  _cmpst_notifyOfChildProvidedCompositePropertiesChange: function(child) {
    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('%@ - notified of child %@ property changes'.fmt(this.toString(), child.toString()));

    var childCompProps = child.get('compositeProperties'),
      myCompProps = this.get('compositeProperties');

    var changed = false;
    childCompProps.forEach(function childCompPropsIterator(p) {
      if (!arguments[0]) return;
      if (myCompProps.indexOf(p) < 0) {
        myCompProps.push(p); // avoid sending KVO notifications now
        changed = true;
      } else {
        // this is an optimization to avoid double notifying
        // for existing properties. new properties will generate
        // notifications through the call to
        // notifyPropertyChange('compositeProperties') below
        this.notifyPropertyChange(p);
      }
    }, this);

    // send the KVO notifications we avoided earlier
    if (changed) this.notifyPropertyChange('compositeProperties');
  },

  /**
   * private
   *
   * invert the normal observer pattern here... let each child
   * notify it's parent directly about property changes.  when children
   * are removed/inserted from teh index the notifications just (dis)appear,
   * leaving no need to manually (un)bind
   */
  _cmpst_unbound_ownPropertyDidChange: function(target, key, value, rev) {
    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('%@ - own property'.fmt(this.toString()),key,'did change', SC.A(arguments).join(':'));

    var parents = this._cmpst_Parents,
      args = SC.A(arguments);

    parents.forEach(function(p) {
      if (!arguments[0]) return;
      // since we're circumventing the normal KVO for notifying
      // parents of property changes - we should make sure to do
      // it on the NEXT run loop
      var that = this;

      if (!p._cmpst_pendingNotifications) {
        p._cmpst_pendingNotifications = {};
      }

      if (p._cmpst_pendingNotifications[key]) {
        // update the pending notification w/ the lastest args
        // but don't reschedule the invokeLast
        p._cmpst_pendingNotifications[key] = args;
        return;
      }

      p._cmpst_pendingNotifications[key] = args;
      if (this.DEBUG_COMPOSITE)
        SC.Logger.log('%@ - adding notification for key %@'.fmt(p.toString(), key));

      this.invokeLast(function() {
        if (!p.get('isCompositePiece')) return;

        if (this.DEBUG_COMPOSITE)
          SC.Logger.group('invokeLast: notifications for parent: ',SC.hashFor(p));

        var parentCompProps = p.get('compositeProperties'),
          args = p._cmpst_pendingNotifications[key],
          rev = args[3];

        // parent already knows this property
        if (parentCompProps.indexOf(key) >= 0) {
          if (this.DEBUG_COMPOSITE)
            SC.Logger.log('alerting parent about known property change',key,rev);

          p.notifyPropertyChange(key);

        // this property is a new one to the parent
        } else {
          if (this.DEBUG_COMPOSITE)
            SC.Logger.log('alerting parent about NEW property change',key,rev);

          p._cmpst_notifyOfChildProvidedCompositePropertiesChange(that);
        }

        if (this.DEBUG_COMPOSITE) {
          SC.Logger.log('end notifications for parent: ',SC.hashFor(p));
          SC.Logger.groupEnd();
        }

        p._cmpst_pendingNotifications[key] = null;
      });
    },this);
  },

  _cmpst_monitoredProperties: null,
  /**
   * private
   */
  _cmpst_unbound_compositePropertiesDidChange: function(target, key, value, rev) {
    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('%@ - compositePropertiesDidChange'.fmt(this.toString()), SC.A(arguments).join(": "));

    this._cmpst_updateCompositePropertyMonitors();
  },

  _cmpst_updateCompositePropertyMonitors: function() {
    if (!this._cmpst_monitoredProperties) {
      this._cmpst_monitoredProperties = {};
    }

    this.compositeProperties.forEach(function(cProp) {
      if (!arguments[0]) return;
      if (this._cmpst_monitoredProperties[cProp]) return;

      // turn this property into something different... mwahahahahahaha
      this._cmpst_addDynamicProperty(cProp);

      this.addObserver(cProp, '_cmpst_unbound_ownPropertyDidChange');

      this.notifyPropertyChange(cProp); // alert the parents
      this._cmpst_monitoredProperties[cProp] = true;
    },this);
  },

  // TODO: this probably isn't even close to robust... but it works enough
  _cmpst_localPropertyFromPath: function(path) {
    return path.split('.').slice(-1)[0]; // MAKE SURE THIS RETURNS A STRING
  },

  /**
   * TODO: some of this is scary shit stolen from observable.js +initObservable+
   *
   * There be dragons here
   */
  _cmpst_propertyCache: null,
  _cmpst_addDynamicProperty: function(fullPath) {
    var prop = this._cmpst_localPropertyFromPath(fullPath);

    // optimized
    if (this[prop] && this[prop].isDynamicCompositeProperty) return;

    if (!this._cmpst_propertyCache) {
      this._cmpst_propertyCache = {};
    }

    // cache old value
    this._cmpst_propertyCache[prop] = this[prop]; // this could be anything

    // YIKES!
    // build computed property function
    var dynamicPropertyFunction = function(key,val) {
      if (arguments.length == 2) {
        this._cmpst_mutatePropertyCache(key,val);
        this.notifyPropertyChange('compositeProperties');
      }

      var ret = null, cached = this._cmpst_accessPropertyCache(key);

      if (!this._cmpst_isCollecting) {
        ret = this.doCompositeOperation('get',[key]);
        if (this.get('compositeIsLeaf')
            && SC.typeOf(cached) != SC.T_ARRAY
            && ret.length <= 1) {
         ret = ret[0]; // preserve the array/non-arrayness of values
        }
      } else {
        ret = cached;
      }

      return ret;
    }.property(); //.dynamicCompositeProperty();
    dynamicPropertyFunction.isDynamicCompositeProperty = true;

    // retain any computed property keys
    if (this[prop] && this[prop].isProperty && this[prop].dependentKeys) {
      var dependentKeys = this[prop].dependentKeys;
      dynamicPropertyFunction.dependentKeys = dependentKeys;
      this.registerDependentKey(prop, dependentKeys);
    }

    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('added dynamic computed property %@ to '.fmt(prop),this);

    this[prop] = dynamicPropertyFunction;

    // add our new prop to the properties array
    if (this._properties.indexOf(prop) < 0) {
      // TODO: make less scary - replicating SC._object_extend stuff
      this._properties.push(prop);
    }
  },

  _cmpst_resetDynamicProperty: function(prop) {
    if (!this._cmpst_propertyCache) {
      this._cmpst_propertyCache = {};
    }

    if (this[prop].isDynamicCompositeProperty) {
      this[prop] = this._cmpst_propertyCache[prop];
      delete this._cmpst_propertyCache[prop];
    }
  },

  /**
   * these functions aren't a concern of getting in the way of the
   * observable get/set functions.  calls to these functions come through
   * get & set to the dynamicPropertyFunction then into the propertyCache
   * accessor and mutator
   */
  _cmpst_mutatePropertyCache: function(k,v) {
    if (!this._cmpst_propertyCache) {
      this._cmpst_propertyCache = {};
    }

    var oldProperty = this._cmpst_propertyCache[k];
    if (SC.typeOf(oldProperty) == SC.T_FUNCTION && oldProperty.isProperty) {
      oldProperty.apply(this, [k,v]); // call the setter form of the property
    } else {
      this._cmpst_propertyCache[k] = v;
    }

    return this; // consisten with +set+, but unnecessary
  },

  /**
   * TODO: the following is broken
   *
   * var valueArray = composite.get('propertyThatIsArray');
   * valueArray.push('a value');
   * return composite.get('propertyThatIsArray').indexOf('a value') >= 0;
   *
   * this code would yield false currently
   */
  _cmpst_accessPropertyCache: function(k) {
    if (!this._cmpst_propertyCache) {
      this._cmpst_propertyCache = {};
    }

    var oldProperty = this._cmpst_propertyCache[k];
    if (SC.typeOf(oldProperty) == SC.T_FUNCTION && oldProperty.isProperty) {
      return oldProperty.apply(this, [k]);
    }

    return this._cmpst_propertyCache[k];
  }
};

/**
 * Augment Function.prototype
 */
SC.mixin(Function.prototype, {
  /**
   * use this to mark computed properties that should be
   * included in the composite, this is equivalent to listing
   * something in the 'computedProperties' array
   */
  compositeProperty: function() {
    this.isCompositeProperty = true;
    return this;
  }
});
