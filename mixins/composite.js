// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
/*globals DS */
sc_require('perf/function_stats');

/** @namespace
  TODO
  @see <a href="http://en.wikipedia.org/wiki/Composite_pattern">Composite Pattern</a>
*/
DataStructures.Composite = {

  taskQueue: DS.bgTasks,

  /**
    Walk like a duck.
    @type Boolean
    @default YES
   */
  isCompositePiece: YES,

  /**
    The ancestors that this node is connected to in the DAG.

    Altering `compositeParents` inline will update the
    DAG to account for the changes.

    When `compositeParents` set to `null`, the composite
    is the root of the DAG.

    Adding any parents appends this composite node as
    a leaf to each of the parents defined (altering
    `compositeChildren` of each of the `compositeParents`).

    Remember that this is a DAG, cycles are forbidden!
    This means that creating a cycle in the composite
    will result in an error being thrown.

    @type Array|Object
    @default null
   */
  compositeParents: null,

  /**
   * TODO
   */
  compositeChildren: null,

  /**
    The list of properties that should percolate up the DAG.

    If properties of the same name exist for a given path
    on the DAG, they will be catenated together in an Array.

    This means that if you have:
        var library = SC.Object.create(DS.Composite, {
          compositeProperties: ['books', 'author']
        });

        SC.Object.create(DS.Composite, {
          compositeParents: [library],
          author: "Douglas Adams",
          books: ["Hitchhiker's Guide to the Galaxy",
                  "The Restaurant at the End of the Universe",
                  "Life, the Universe and Everything",
                  "So Long, and Thanks For ALl the Fish",
                  "Mostly Harmless"]
        });

        SC.Object.create(DS.Composite, {
          compositeParents: [library],
          author: "Neil Gaiman",
          books: ["American Gods"],
        });

        library.get('author'); // ["Douglas Adams", "Neil Gaiman"]
        library.get('books');  // ["Hitchhiker's Guide to the Galaxy", "The Restaurant at the End of the Universe", "Life, the Universe and Everything", "So Long, and Thanks For ALl the Fish", "Mostly Harmless", "American Gods"]

    Note that if you tried to `get` `authors` in the previous
    example, it would not work. Naming is not changed to
    account for the fact that an item changed from being
    singular to plural.

    A simple workaround for that would be to have a one-way
    binding that hooks `authors` to `author`.

    TODO: should these be added to `concatenatedProperties`?

    @type Array
    @default null
   */
  compositeProperties: null,

  /**
    Return only unique values for each compositeProperty.
    You probably want this to be YES but for legacy compliance it
    defaults to NO.
   */
  compositeUniqueValues: NO,

  /**
    Whether this composite should display it's actions.
    Useful for debugging purposes.
    @type Boolean
    @default NO
   */
  DEBUG_COMPOSITE: NO,

  _cmpst_ChildIndex: null,
  _cmpst_Parents: null,
  _cmpst_ParentIndex: null,

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
  }.dsProfile('initMixin'),

  /**
   * destroying a composite piece will effectively leave all of
   * its children orphaned in relation to the composite. no attempt
   * should be made to include them nor destroy them, only remove
   * the current object from the composite both up and down the DAG
   */
  destroyMixin: function() {
    // N.B. 6/30/11:
    // Without using +copy+ on these arrays, _parents_ gets assigned
    // as a reference to _this.get('compositeParents')_ .  When
    // +forEach+ iterates over the array, if it is modified, then that
    // modification affects the current iteration.  need to grab a
    // static copy of this array now, so modifications in
    // +removeCompositeChild+ don't break iteration
    //
    // @see tests/mixins/composite/multi_parent_destroy_bug.js
    var parents = this.get('compositeParents').copy();
    parents.forEach(function _anon_parentsDestoyIterator(p) {
      if (!arguments[0] || p.get('isDestroyed')) return;
      p.removeCompositeChild(this);
    },this);

    var children = this.get('compositeChildren').copy();
    children.forEach(function _anon_childDestroyIterator(c) {
      if (!arguments[0] || c.get('isDestroyed')) return;
      this.removeCompositeChild(c);
    },this);

    this.removeObserver('compositeChildren',
                        '_cmpst_unbound_compositeChildrenDidChange');
    this.removeObserver('compositeChildren.[]',
                        '_cmpst_unbound_compositeChildrenDidChange');

    this._cmpst_destroyCompositeProperties();
    this._cmpst_destroyCompositeParents();

    var debug = this.DEBUG_COMPOSITE;

    // remove all dynamic computed properties and return the values
    // to their original states
    for (var p in this) if (this[p] && this[p].isDynamicCompositeProperty) {
      this._cmpst_resetDynamicProperty(p);
    }
  }.dsProfile('destroyMixin'),

  /**
   * from a composite element or leaf perspective there may
   * be multiple parents, and thus possibly multiple roots.
   * @return Array
   */
  compositeRoot: function() {
    if (this.get('compositeParents').get('length') == 0) {
      return [this];
    } else {
      var ret = this
                  .get('compositeParents')
                  .getEach('compositeRoot')
                  .fastFlatten()
                  .uniq();
      return ret;
    }
  }.dsProfile('compositeRoot').property(/* see _cmpst_notifyChildrenIfRootChanged */),//.cacheable(),

  // TODO: this isn't cacheable currently due to hack above
  compositeIsRoot: function() {
    var cr = this.get('compositeRoot');
    return cr.length == 1 && cr[0] === this;
  }.dsProfile('compositeIsRoot').property('compositeRoot'),//.cacheable(),

  compositeSupplant: function(composite) {
    var children = composite.get('compositeChildren');
    children.compact().forEach(function(c) {
      this.addCompositeChild(c);
      composite.removeCompositeChild(c);
    },this);
  }.dsProfile('compositeSupplant'),

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

    var composites = [this].concat(this.get('compositeChildren')),
      ret = [];

    args = SC.A(args);
    for (var i=0;i<composites.length;i++) {
      var c = composites[i];
      if (!c) continue;

      c._cmpst_isCollecting = YES;

      var v = c[op].apply(c,args);
      if (!SC.none(v)) ret = ret.concat(v);
      c._cmpst_isCollecting = NO;
    };

    return ret;
  }.dsProfile('doCompositeOperation'),

  compositeInspect: function() {
    SC.Logger.group("Composite %@".fmt(this.toString()));
    if (this.get('compositeIsRoot')) {
      SC.Logger.log("-> ROOT");
    } else {
      SC.Logger.log("-> child of %@: [%@]".fmt(this.get('compositeParents').length,
                                               this.get('compositeParents').invoke('toString')));
    }

    this._compositeInspectHook();

    SC.Logger.log("-> properties: [%@]".fmt(this.get('compositeProperties')));
    SC.Logger.log("-> property values: [%@]".fmt(this.get('compositeProperties').map(function(p) {
                                                                                       return "%@:[%@]".fmt(p,this.get(p));
                                                                                     }.bind(this))));
    if (!!this.compositeCompare) SC.Logger.log("-> is comparable");

    if (!this.get('compositeIsLeaf')) {
      var sortedChidren = this.compositeSortChildren();
      SC.Logger.log("-> composite contains %@ pieces (including self)".fmt(this.get('compositeList').length));
      SC.Logger.log("-> parent of %@: [%@]".fmt(sortedChidren.length,
                                                sortedChidren.invoke('toString')));
      this.get('compositeChildren').invoke('compositeInspect');
    } else {
      SC.Logger.log("-> LEAF");
    }

    SC.Logger.groupEnd();
  }.dsProfile('compositeInspect'),

  _compositeInspectHook: function() {}, // override in implementations

  compositeIsLeaf: function() {
    return !this.get('compositeHasChildren');
  }.dsProfile('compositeIsLeaf').property('compositeHasChildren'),//.cacheable(),

  compositeHasChildren: function() {
    return this.get('isCompositePiece')
      && this.get('compositeChildren')
      && this.get('compositeChildren').compact().length > 0;
  }.dsProfile('compositeHasChildren').property('compositeList', 'isCompositePiece').cacheable(),

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
    this.compositeSortChildren().forEach(function(c) {
      if (!arguments[0]) return;
      ret = ret.concat(c.get('compositeList'));
    });

    // don't flatten the result - it's tooooo slooooowwww - make sure
    // we build a flattened list
    return ret;

  // EJ 11/2/11 - THIS MUST BE CACHEABLE - otherwise compositeProperty
  // updates can take upwards of 1/2 a second w/ external observers
  // requesting the compositeList.  Caching this saves time on sorting
  // which is.dsProfile('compositeList') expensive
  }.dsProfile('compositeList').property('isCompositePiece','compositeChildren').cacheable(),

  compositeCompare: null,
  compositeSortChildren: function() {
    // make sure to take a copy here so we don't sort in place.
    // removing child composites relies on consistent indices in the
    // array since they are cached for fast lookup
    var children = this.compositeChildren.compact().copy(),
      that = this,
      boundCompareFn = this.compositeCompare && function() {
        return that.compositeCompare.apply(that, arguments);
      };

    return boundCompareFn ? children.sort(boundCompareFn) : children;
  }.dsProfile('compositeSortChildren'),

  compositeHasChild: function(c) {
    var h = SC.hashFor(c);
    return !SC.empty(this._cmpst_ChildIndex[h]);
  }.dsProfile('compositeHasChild'),

  compositeHasParent: function(p) {
    var h = SC.hashFor(p);
    return !SC.empty(this._cmpst_ParentIndex[h]);
  }.dsProfile('compositeHasParent'),

  /**
   * TODO: the last big todo is to avoid creating loops with
   * the composite.  currently i check to see if the compositeHasChildren,
   * (direct children).  what also needs to occur is the check needs to be
   * made up the composite as well.  it would be nice to somehow
   * make teh compositeParentIndex a composite property that is auto updated
   * for each node up the composite as nodes are added... but who knows
   */
  _cmpst_addCompositeChildNotifyScheduled: null,
  addCompositeChild: function(c) {
    if (this.compositeHasChild(c)) return c;

    // TODO: see the note above about avoiding loops
    if (this.compositeHasParent(c)) return null;

    if (c.get('isDestroyed')) {
      throw new Error("unable to add destroyed object as composite child");
    }

    if (!c.isCompositePiece) {
      throw new Error("only composite pieces may be added as a child - try mixing DataStructures.Composite into your child object first");
    }

    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('Composite.addCompositeChild: %@ (%@) added composite child: %@ (%@)'.fmt(this.toString(),SC.hashFor(this),c.toString(),SC.hashFor(c)));

    // work around a bug with SC.Array double notifying for the
    // enumerable property
    this.compositeChildren.push(c);
    this.compositeChildren.notifyPropertyChange('[]');

    var cLen = this.compositeChildren.length;
    this._cmpst_ChildIndex[SC.hashFor(c)] = cLen - 1;

    c._addCompositeParent(this);

    // update the composite property list from new children
    // so that we're sure those changes get propogated
    this._cmpst_notifyOfChildProvidedCompositePropertiesChange(c);

    return c;
  }.dsProfile('addCompositeChild'),

  removeCompositeChild: function(c) {
    if (!c.isCompositePiece) {
      throw new Error("only composite pieces may be removed - try mixing DataStructures.Composite into your child object first");
    }

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
  }.dsProfile('removeCompositeChild'),

  addCompositeParent: function(p) {
    if (this.compositeHasParent(p)) return p;

    // TODO: see the note above about avoiding loops
    if (this.compositeHasChild(p)) return null;

    if (p.get('isDestroyed')) {
      throw new Error("unable to add destroyed object as composite parent");
    }

    if (!p.isCompositePiece) {
      throw new Error("only composite pieces may be added as a parent - try mixing DataStructures.Composite into your parent object first");
    }

    p.addCompositeChild(this);
    return p;
  }.dsProfile('addCompositeParent'),

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
  }.dsProfile('_cmpst_initCompositeParents'),

  /* desroy */
  _cmpst_destroyCompositeParents: function() {
    this.removeObserver('compositeParents.[]',
                        '_cmpst_unbound_compositeParentsDidChange');
    this.removeObserver('compositeParents',
                        '_cmpst_unbound_compositeParentsDidChange');
  }.dsProfile('_cmpst_destroyCompositeParents'),

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
  }.dsProfile('_cmpst_initCompositeProperties'),

  /* private */
  _cmpst_destroyCompositeProperties: function() {
    this.removeObserver('compositeProperties.[]',
                        '_cmpst_unbound_compositePropertiesDidChange');
    this.removeObserver('compositeProperties',
                        '_cmpst_unbound_compositePropertiesDidChange');
  }.dsProfile('_cmpst_destroyCompositeProperties'),

  /* private */
  _addCompositeParent: function(p) {
    if (this.compositeHasParent(p)) return p;

    var pLen;
    this._cmpst_Parents.push(p);
    pLen = this._cmpst_Parents.length;
    this._cmpst_ParentIndex[SC.hashFor(p)] = pLen - 1;

    if (this.get('compositeParents').indexOf(p) < 0) {
      // don't alert the observers here:
      //
      // updates to _compositeParents_ and _compositeParents.[]_ will
      // trigger +_cmpst_unbound_compositeParentsDidChange+.  This
      // function loops over all parents of _this_, adding _this_ as a
      // composite child.  What we're doing here in
      // +_addCompositeParent+ is actually adding a new parent, if we
      // notified the observers here then we'd be doing redundant
      // work, adding _p_ as a parent here and later telling _p_ to
      // add _this_ as a child.  This should have no negative side
      // effects since adding children checks that the child isn't
      // already a child, however it would be wasted cycles
      this.get('compositeParents').push(p);

      // TODO: dumb hack
      // should be cleaned up when compositeParents get reworked
      this._cmpst_notifyChildrenIfRootChanged();
    }

    return p;
  }.dsProfile('_addCompositeParent'),

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
  }.dsProfile('_removeCompositeParent'),

  /**
   * @private
   *
   * a hack i can live with... for now..
   *
   * since we can't notify a change to _compositeParents_ (see note in
   * +_addCompositeParent+), _compositeRoot_ won't be updated
   * naturally.  if _this_ is the root, and we're adding a parent to
   * it, let everyone know that root has changed
   */
  _cmpst_notifyChildrenIfRootChanged: function() {
    var root = this.get('compositeRoot'),
      rootParents = this.get('compositeParents').filter(function(p) {
        return p.get('compositeParents').length == 0;
      }),
      needUpdate = rootParents.reduce(function(prev, parent) {
        return prev || !root.contains(parent);
      },false);

    if (needUpdate) {
      this.get('compositeList').forEach(function(piece) {
        piece.notifyPropertyChange('compositeRoot');
      });
    }
  }.dsProfile('_cmpst_notifyChildrenIfRootChanged'),

  _cmpst_unbound_compositeChildrenDidChangeScheduled: null,
  _cmpst_unbound_compositeChildrenDidChange: function(target,key,val,rev) {
    if (this._cmpst_unbound_compositeChildrenDidChangeScheduled) return;

    var task = { run: function() {
      if (this.DEBUG_COMPOSITE)
        SC.Logger.log('Composite._cmpst_unbound_compositeChildrenDidChange.task: %@ (%@) at %@ - key = %@ compositeChildrenDidChange'.fmt(this.toString(), SC.hashFor(this), rev, key),  SC.A(arguments).join(':'));

      this.notifyPropertyChange('compositeList');
      this.get('compositeParents').forEach(function(p) {
        p.notifyPropertyChange('compositeChildren');
      });
      this._cmpst_unbound_compositeChildrenDidChangeScheduled = null;
    }.bind(this).dsProfile('_cmpst_unbound_compositeChildrenDidChange.task')};

    this._cmpst_unbound_compositeChildrenDidChangeScheduled = true;
    this.get('taskQueue').push(task);
  }.dsProfile('_cmpst_unbound_compositeChildrenDidChange'),

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
      SC.Logger.log('Composite._cmpst_unbound_compositeParentsDidChange: %@ - compositeParentsDidChange'.fmt(this.toString()), SC.A(arguments).join(':'));

    this.get('compositeParents').forEach(function compositeParentsIterator(p) {
      if (!arguments[0]) return;

      if (this.DEBUG_COMPOSITE)
        SC.Logger.log('Composite._cmpst_unbound_compositeParentsDidChange: %@ adding child %@'.fmt(p.toString(), this.toString()));

      p.addCompositeChild(this);
    },this);
  }.dsProfile('_cmpst_unbound_compositeParentsDidChange'),

  /**
   * private
   *
   * propogates properties from composite children into this object
   */
  _cmpst_pendingChildPropertyChanges: null,
  _cmpst_notifyOfChildProvidedCompositePropertiesChange: function(child,keys) {
    if (!this._cmpst_pendingChildPropertyChanges) {
      this._cmpst_pendingChildPropertyChanges = [];
    }

    var scheduled = !!this._cmpst_pendingChildPropertyChanges.length;

    keys = keys ? SC.A(keys) : child.get('compositeProperties');
    this._cmpst_pendingChildPropertyChanges = this._cmpst_pendingChildPropertyChanges.concat(keys);

    if (scheduled) return;

    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('Composite._cmpst_notifyOfChildProvidedCompositePropertiesChange: %@ scheduled for keys %@'.fmt(this.toString(), keys));

    var task = { run: function() {
      if (!this._cmpst_pendingChildPropertyChanges) return;

      var myCompProps = this.get('compositeProperties');
      var changed = false;
      var keys = this._cmpst_pendingChildPropertyChanges.fastFlatten().uniq();

      if (this.DEBUG_COMPOSITE)
        SC.Logger.log('Composite._cmpst_notifyOfChildProvidedCompositePropertiesChange.task: %@ running for keys %@'.fmt(this.toString(), keys));

      this._cmpst_pendingChildPropertyChanges = null;

      keys.forEach(function childCompPropsIterator(p) {
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

          // TODO: track this hack down more - this hack fixes the
          // cached property key from being incorrect. here's what I
          // know, after an object calls notifyPropertyChange(p)
          // above, this._kvo_cache is cleared for the current dynamic
          // property.  Somewhere between here and the end of the
          // runLoop this._kvo_cache is repopulated with the old
          // value.  Getting the value here seems to cache the correct
          // value.  Commenting out this line will make two of the
          // assertions in the composite/kvo_and_properties test fail
//          this.get(p);
        }
      }, this);

      // send the KVO notifications we avoided earlier - this will
      // trigger _cmpst_updateCompositePropertyMonitors to run and add
      // all the new composite properties that we don't know about
      if (changed) this.notifyPropertyChange('compositeProperties');
    }.bind(this).dsProfile('_cmpst_notifyOfChildProvidedCompositePropertiesChange.task')};

    this.get('taskQueue').push(task);
  }.dsProfile('_cmpst_notifyOfChildProvidedCompositePropertiesChange'),

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
      SC.Logger.log('Composite._cmpst_unbound_ownPropertyDidChange: %@ - own property'.fmt(this.toString()),key,'did change', SC.A(arguments).join(':'));

    var parents = this._cmpst_Parents,
      args = SC.A(arguments);

    // this inverts standard OO practice in encapsulating the behavior
    // of the parent object here in the child - however it is more
    // efficient for children to schedule task runs for parents rather
    // than the more sensible things of creating tasks for each child
    // to notify all its parents with a unique set of keys.  this is
    // because the most common dag will have more leaves than roots,
    // thus there will be orders of magnitude less parents than
    // children.  for instance, if 3 children schedule the same parent for an
    // update - that task will already be scheduled since the parents
    // are being scheduled not children - so in this case we would
    // have 1 task fire instead of 3.
    parents.forEach(function(p) {
      if (!arguments[0]) return;
      // since we're circumventing the normal KVO for notifying
      // parents of property changes - we should make sure to do
      // it on the NEXT run loop
      var that = this;

      if (p._cmpst_pendingNotifications) {
        p._cmpst_pendingNotifications = p._cmpst_pendingNotifications.concat(key).uniq();
        return; // don't schedule the task - its already scheduled
      } else {
        p._cmpst_pendingNotifications = [key];
      }

      if (this.DEBUG_COMPOSITE)
        SC.Logger.log('Composite._cmpst_unbound_ownPropertyDidChange: child %@ adding notification for parent %@ on key %@'.fmt(this.toString(), p.toString(), key));

      var t = { run: function() {
        if (!this.get('isCompositePiece')) return;

        var keys = this._cmpst_pendingNotifications;
        if (this.DEBUG_COMPOSITE) {
          SC.Logger.group('Composite._cmpst_unbound_ownPropertyDidChange.task:');
          SC.Logger.log('update notifications for parent: %@ on keys:'.fmt(SC.hashFor(this)),keys);
        }

        this._cmpst_notifyOfChildProvidedCompositePropertiesChange(that,keys);

        if (this.DEBUG_COMPOSITE) {
          SC.Logger.groupEnd();
        }

        this._cmpst_pendingNotifications = null;
      }.bind(p).dsProfile('_cmpst_unbound_ownPropertyDidChange.task')};
      this.get('taskQueue').push(t);
    },this);
  }.dsProfile('_cmpst_unbound_ownPropertyDidChange'),

  _cmpst_monitoredProperties: null,
  /**
   * private
   */
  _cmpst_updateCompositePropertyMonitorsScheduled: null,
  _cmpst_unbound_compositePropertiesDidChange: function(target, key, value, rev) {
    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('Composite._cmpst_unbound_compositePropertiesDidChange: for object %@'.fmt(this.toString()), SC.A(arguments).join(": "));

    if (!this._cmpst_updateCompositePropertyMonitorsScheduled) {
      var task = { run: function() {
        this._cmpst_updateCompositePropertyMonitorsScheduled = null;
        this._cmpst_updateCompositePropertyMonitors();
      }.bind(this).dsProfile('_cmpst_unbound_compositePropertiesDidChange.task')};
      this.get('taskQueue').push(task);
    }
  }.dsProfile('_cmpst_unbound_compositePropertiesDidChange'),

  _cmpst_updateCompositePropertyMonitors: function() {
    if (!this._cmpst_monitoredProperties)this._cmpst_monitoredProperties = {};
    if (!this._cmpst_unmonitoredProperties) this._cmpst_unmonitoredProperties = {};

    this.compositeProperties.forEach(function(cProp) {
      if (!arguments[0]) return;
      if (this._cmpst_monitoredProperties[cProp]) return;// || this[cProp] === undefined) return;

      // turn this property into something different... mwahahahahahaha
      this._cmpst_addDynamicProperty(cProp);

      this.addObserver(cProp, '_cmpst_unbound_ownPropertyDidChange');

      this.notifyPropertyChange(cProp); // alert the parents
      this._cmpst_monitoredProperties[cProp] = true;
    },this);
  }.dsProfile('_cmpst_updateCompositePropertyMonitors'),

  // TODO: this probably isn't even close to robust... but it works enough
  _cmpst_localPropertyFromPath: function(path) {
    return path.split('.').slice(-1)[0]; // MAKE SURE THIS RETURNS A STRING
  }.dsProfile('_cmpst_localPropertyFromPath'),

  /**
   * TODO: some of this is scary shit stolen from observable.js +initObservable+
   *
   * There be dragons here
   */
  set: function(key,value) {
    var func = this[key];
    if (func && func.isProperty && func.isCacheable && this._kvo_cache) {
      this._kvo_cache[func.cacheKey] = undefined ;
    }
    return sc_super();
  },

  _cmpst_dynamicPropertyScheduledNotify: null,
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
        if (!this._cmpst_dynamicPropertyScheduledNotify) {
          var task = { run: function() {
            // move a property from unmonitored to monitored
            this.notifyPropertyChange('compositeProperties');
            this._cmpst_dynamicPropertyScheduledNotify = null;
          }.bind(this)};
          this.get('taskQueue').push(task);
          this._cmpst_dynamicPropertyScheduledNotify = true;
        }
      }

      var cached = this._cmpst_accessPropertyCache(key),
        ret = cached;

      if (!this.get('compositeIsLeaf')) {
        ret = SC.A(cached);

        var children = this.compositeSortChildren(); //this.get('compositeChildren');
        for (var i=0;i<children.length;i++) {
          if (!children[i]) continue;
          ret = ret.concat(children[i].get(key)).compact().without(undefined);
        }

        if (this.compositeUniqueValues && ret.uniq)
          ret = ret.uniq();
      }

      return ret;
    }.dsProfile('_cmpst_dynamicProperty.%@'.fmt(prop)).property().cacheable(); //.dynamicCompositeProperty();
    dynamicPropertyFunction.isDynamicCompositeProperty = true;

    // retain any computed property keys
    if (this[prop] && this[prop].isProperty && this[prop].dependentKeys) {
      var dependentKeys = this[prop].dependentKeys;
      dynamicPropertyFunction.dependentKeys = dependentKeys;
      this.registerDependentKey(prop, dependentKeys);
    }

    if (this.DEBUG_COMPOSITE)
      SC.Logger.log('Composite._cmpst_addDynamicProperty: added dynamic computed property %@ to '.fmt(prop),this);

    this[prop] = dynamicPropertyFunction;

    // add our new prop to the properties array
    if (this._properties.indexOf(prop) < 0) {
      // TODO: make less scary - replicating SC._object_extend stuff
      this._properties.push(prop);
    }
  }.dsProfile('_cmpst_addDynamicProperty'),

  _cmpst_resetDynamicProperty: function(prop) {
    if (!this._cmpst_propertyCache) {
      this._cmpst_propertyCache = {};
    }

    if (this[prop].isDynamicCompositeProperty) {
      this[prop] = this._cmpst_propertyCache[prop];
      delete this._cmpst_propertyCache[prop];
    }
  }.dsProfile('_cmpst_resetDynamicProperty'),

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

    return this; // consisten with +set+, but.dsProfile unnecessary
  }.dsProfile('_cmpst_mutatePropertyCache'),

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

    var oldProperty = this._cmpst_propertyCache[k], ret;
    if (SC.typeOf(oldProperty) == SC.T_FUNCTION && oldProperty.isProperty) {
      return oldProperty.apply(this, [k]);
    }

    return this._cmpst_propertyCache[k];
  }.dsProfile('_cmpst_accessPropertyCache')
};
