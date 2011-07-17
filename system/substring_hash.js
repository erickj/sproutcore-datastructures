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
 */
DataStructures.SubstringHash = DataStructures.NormalKeyIndex.extend({
  keyMin: 1,
  keyMax: 20,

  isSubstringHash: YES,

  keyTransform: function(key) {
    return key.substrings(this.get('keyMin'), this.get('keyMax'));
  }
});
