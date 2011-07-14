// ==========================================================================
// Project:   DataStructures & Design Pattern Library
// Copyright: ©2011 Junction Networks
// Author:    Erick Johnson
// ==========================================================================
sc_require('system/index');

/**
 * All Index keys are:
 *   - lower case
 *   - white space trimmed
 *   - alphanumeric
 *
 * Some example key transforms would be:
 *
 *   Input                 Result
 *   -----                 ------
 *   "Bob"              => "bob"
 *   "Bob G. Smith"     => "bobgsmith"
 *   "1 (555) 123.5678" => "15551235678"
 *   "  Wasted Space  " => "wastedspace"
 */
DataStructures.NormalKeyIndex = DataStructures.Index.extend({
  keyTransform: function(key) {
    return key
      .toString()
      .toLowerCase()
      .trim()
      .replace(/([^a-z0-9])/g,'');
  }
});
