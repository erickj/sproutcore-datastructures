// ==========================================================================
// Project:   Contact.SuffixHash Unit Test
// Copyright: ©2011 Junction Networks
// ==========================================================================
/*globals Contact module test ok equals same stop start */
var h;
module("Contact Substring Hash", {
  setup: function () {
    SC.Logger.group('--> Setup Test: "%@"'.fmt(this.working.test));

    h = Contact.SubstringHash.create();

    SC.run(function() {
      SC.Logger.log('setup runloop execute');
    });
  },

  teardown: function() {
    SC.run(function() {
      SC.Logger.log('teardown runloop execute');
    });
    delete h;
    SC.Logger.log('--> Teardown Test: "%@"'.fmt(this.working.test));
    SC.Logger.groupEnd();
  }
});

test("substring hash does exist", function() {
  ok(Contact.SubstringHash, "Contact.SubstringHash should exist");

  var methods = ['index','lookup','remove'];
  methods.forEach(function(m) {
    ok(this.respondsTo(m), 'Indexer h should respond to method +%@+'.fmt(m));
  },h);
});

test("substring hash can index and lookup values", function() {
  var larry = { name: "Larry David" },
    moe = { name: "Moe Syzlack",
            phone: "15083339876"},
    curly = { name: "I can't think of a famous Curly",
              phone: "+1 (508) 555 1234"};

  h.index(larry.name, larry);
  h.index(moe.name, moe);
  h.index(moe.phone, moe);
  h.index(curly.name, curly);
  h.index(curly.phone, curly);

  // test index & lookup
  ok(h.lookup('l').indexOf(larry) >= 0, 'larry should be accessible');
  ok(h.lookup('L').indexOf(larry) >= 0, 'larry should be accessible');
  ok(h.lookup('Larry').indexOf(larry) >= 0, 'larry should be accessible');
  ok(h.lookup('David').indexOf(larry) >= 0, 'larry should be accessible');
  ok(h.lookup('lar').indexOf(larry) >= 0, 'larry should be accessible');
  ok(h.lookup('rry d').indexOf(larry) >= 0, 'larry should be accessible');

  ok(h.lookup('i can\'t think of a famous').indexOf(curly) >= 0, 'curly should be accessible with long lookups');
  ok(h.lookup('icant').indexOf(curly) >= 0, 'non alpha/num get squashed');

  ok(h.lookup('1508').length == 2, 'phone number search for 1 508 should have 2 results');

  ok(h.lookup('1508555').indexOf(curly) >= 0, 'phone number search - squashed');
  ok(h.lookup('5551234').indexOf(curly) >= 0, 'phone number search - squashed and offset');

  ok(h.lookup('+1 (508) 555').indexOf(curly) >= 0, 'phone number search - full format');

  // test multiple results
  var larryBird = { name: "Larry Bird" };
  h.index(larryBird.name, larryBird);

  ok(h.lookup('Larry').length == 2, 'larry should have 2 results');

  // test remove
  h.remove('Larry', larry);
  ok(h.lookup('Larry').indexOf(larry) == -1, 'larry should be inaccessible via "Larry"');
  ok(h.lookup('Larry').indexOf(larryBird) >= 0, 'larry bird should be accessible via "Larry"');

  ok(h.lookup('David').indexOf(larry) >= 0, 'but larry should be accessible via "David"');
});
