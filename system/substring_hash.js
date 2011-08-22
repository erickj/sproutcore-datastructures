// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
sc_require("ext/string.js");
sc_require("system/normal_key_index");

/**
 * TODO: This datastructure would be much better off as a suffix trie.
 */

/**
 * The substring hash will trade gobs and gobs of memory in order to
 * give you extremely fast lookups on any substring of a key. For
 * instance, if I want to index the object Bob on key "bob", then the
 * SubstringHash would allow me to make O(1) lookups on "b", "o",
 * "bo", "ob", and "bob".
 *
 * n^2 is a reasonable estimate for the number of substrings in any
 * given string.  The actual number can be constrained by setting the
 * keyMin and keyMax properties.  min 2 for instance would only index
 * "bob" on "bo", "ob", and "bob".
 *
 * False positive and long lookup fix:
 * In order to get around the following problem I potentially index on
 * more than just the substrings less than the keyMax. here's the
 * problem - let's say you set the keyMax to 5, and you ask to index
 * on "foobar", then just indexing on substrings beteen keyMin and
 * keyMax we'll actually index on foobars.substrings(1,5). that is all
 * substrings in length between 1 and 5.  that means on a lookup if
 * you ask for "foobar" - that substring isn't actually part of that
 * set.  so... easy fix right?  just cut "foobar" down to "fooba" you
 * say.  well if the lookup key was "foobad" then cutting the key down
 * to "fooba" would generate a false positive.
 *
 * To get around this the indexed keySet is actually the unique set of
 * the original key, plus all zero indexed substrings of the key, plus
 * all substrings between keyMin and keyMax.
 */
DataStructures.SubstringHash = DataStructures.NormalKeyIndex.extend({

  /* key size constraints */
  keyMin: 1,
  keyMax: 20,

  isSubstringHash: YES,

  // TODO: there is still a bug with false negatives - if the keyMax
  // is 4 and the key is robert - then the zeroIndexedStrings will
  // make sure keys "robert" and "rober" return matches - however the
  // key "obert" will NOT match.  this needs to be looked at - but
  // short of getting rid of key constraints I don't see a simple way
  // to do this
  keyTransform: function(key,doTransform) {
    if (!doTransform) return key;

    var zeroIndexed = this._zeroIndexedSubstrings(key);
    return zeroIndexed.concat(key.substrings(this.get('keyMin'), this.get('keyMax'))).uniq();
  },

  _zeroIndexedSubstrings: function(key) {
    var ret = [key];
    var keyMin = this.get('keyMin') + 1;

    while(ret[0].length > keyMin) {
      ret.unshift(ret[0].slice(0,ret[0].length-1));
    }

    return ret;
  }
});
