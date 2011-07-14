/**
 * this algorithm has avg case complexity O(n^2)
 * not so good... make sure you use min and max to cap it
 *
 * TODO: implement a suffix trie
 */
String.prototype.substrings = function(min,max) {
  var ret = [], shrinkingMax;
  min = [min || 1, 1].max();
  max = [max || this.length,this.length].min();
  for (var cursorStart=0,l=this.length; cursorStart<l; cursorStart++) {
    shrinkingMax = [max,this.length - cursorStart].min();
    for (var substrLen=min; substrLen<=shrinkingMax; substrLen++ ) {
      var cursorEnd = substrLen + cursorStart;
      ret.push(this.substring(cursorStart,cursorEnd));
    }
  }
  return ret;
};
