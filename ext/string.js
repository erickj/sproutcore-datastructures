/**
 * this algorithm has runtime complexity of O(n*(n+1)/2)
 * not so good... make sure you use min and max to cap it
 *
 * TODO: implement a suffix trie
 */
String.prototype.substrings = function(min,max) {
  var ret = [];
  min = [min || 1, 1].max();
  max = [max || this.length,this.length].min();
  for (var s=0,l=this.length; s<=l; s++) {
    for (var e=s+min; e<=max; e++ ) {
      ret.push(this.substring(e,s));
    }
  }
  return ret.uniq();
};
