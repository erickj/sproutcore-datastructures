DataStructures.SourceDestructor = {
  initMixin: function() {
    this.addObserver('shouldDestroy', '_sd_sourceIsDestroyedObserver');
  },

  destroyMixin: function() {
    this.removeObserver('shouldDestroy', '_sd_sourceIsDestroyedObserver');
  },

  sourceDestructor: null,

  shouldDestroy: function() {
    return this.get('sourceDestructor')
      && this.getPath('sourceDestructor.isDestroyed')
      && !this.get('isDestroyed');
  }.property('sourceDestructor'),

  _sd_sourceIsDestroyedObserver: function() {
    if (this.get('shouldDestroy')) {
      // TODO: should this be done in an +invokeLater+?
      this.destroy();
    }
  },

  _sourceDestructorDidDestroy: function() {
    var sd = this.get('sourceDestructor');
    if (sd && sd.get('isDestroyed')) {
      this.notifyPropertyChange('sourceDestructor');
    }
  }.observes('*sourceDestructor.isDestroyed')
};
