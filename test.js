(function(chan) {
    var debug = function(str) {
        console.log(str);
    };
    var assert = function (x, message) {
        var pass = x ? "Passed" : "Failed";
        debug(message + " - " + pass);
    };
    var is_eq = function(x, y, message) {
        assert(x === y, message + ": " + JSON.stringify(x) + " = " + JSON.stringify(y));
    };
    var test = function(message, fn) {
        debug("Testing: " + message);
        fn();
    };
    test("fixed buffer", function() {
        var fb = chan.fixed_buffer(2);
        is_eq(0, chan.impl.count(fb), "Count zero with no items added");
        chan.impl.add(fb, 1);
        is_eq(1, chan.impl.count(fb), "Count one with 1 item added");
        chan.impl.add(fb, 2);
        is_eq(2, chan.impl.count(fb), "Count two with 2 items added");
        assert(chan.impl.full(fb), "Full Buffer");
        is_eq(1, chan.impl.remove(fb), "First item removed is the same as first item added");
        assert(! chan.impl.full(fb), "Non Full Buffer");
        is_eq(2, chan.impl.remove(fb), "Second item removed is the same as second item added");
    });
    test("dropping buffer", function() {
        var db = chan.dropping_buffer(2);
        is_eq(0, chan.impl.count(db), "Count zero with no items added");
        chan.impl.add(db, 1);
        is_eq(1, chan.impl.count(db), "Count one with 1 item added");
        chan.impl.add(db, 2);
        is_eq(2, chan.impl.count(db), "Count two with 2 items added");
        assert(! chan.impl.full(db), "Buffer is never full");
        chan.impl.add(db, 3);
        is_eq(2, chan.impl.count(db), "Count two with 3 items added");
        is_eq(1, chan.impl.remove(db), "First item removed is the same as first item added");
        assert(! chan.impl.full(db), "Non Full Buffer");
        is_eq(2, chan.impl.remove(db), "Second item removed is the same as second item added");
    });
    test("sliding buffer", function() {
        var sb = chan.sliding_buffer(2);
        is_eq(0, chan.impl.count(sb), "Count zero with no items added");
        chan.impl.add(sb, 1);
        is_eq(1, chan.impl.count(sb), "Count one with 1 item added");
        chan.impl.add(sb, 2);
        is_eq(2, chan.impl.count(sb), "Count two with 2 items added");
        assert(! chan.impl.full(sb), "Buffer is never full");
        chan.impl.add(sb, 3);
        is_eq(2, chan.impl.count(sb), "Count two with 3 items added");
        is_eq(2, chan.impl.remove(sb), "First item removed is the same as second item added");
        assert(! chan.impl.full(sb), "Non Full Buffer");
        is_eq(3, chan.impl.remove(sb), "Second item removed is the same as third item added");
    });
    test("channel with no buffer", function() {
        var c = chan.chan();
        chan.put(c, 42, function() { assert(true, "Basic put worked"); });
        chan.take(c, function(val) { is_eq(val, 42, "Value of take is what was put"); });
    });
    test("channel with buffer", function() {
        var c = chan.chan(1);
        chan.put(c, 42, function() { assert(true, "Basic put worked"); });
        chan.take(c, function(val) { is_eq(val, 42, "Value of take is what was put"); });
    });
    var identity_chan = function(val) {
        var c = chan.chan(1);
        chan.put(c, val);
        chan.close(c);
        return c;
    };
    test("Alts", function() {
        var c = identity_chan(42);
        chan.alts([c], function(val, ch) {
            is_eq(c, ch, "Channels are equal");
            is_eq(42, val, "Return values are equal");
        });
        var pc = chan.chan();
        chan.alts([[pc, 42]], function() { assert(true, "Put works"); });
        chan.take(pc, function(val) { is_eq(val, 42, "Put value is the take value"); });
        chan.alts([chan.chan(1)], function(val, ch) {
            is_eq("default", ch, "Default retutned instead of channel");
            is_eq(42, val, "Default value returned");
        }, {"default": 42});
    });
    test('timeout', function(){
        var t1 = chan.timeout(10), t2 = chan.timeout(5), t3 = chan.timeout(50);
        chan.take(t1, function(val) {
            var dt = chan.timeout(10);
            assert(t1 !== dt, "Timeout channels created after call removal aren't equal");
        });
        assert(t1 === t2, "Timeout channels created within resolution are equal");
        assert(t3 !== t2, "Timeout channels created outside resolution are not equal");
    });
})(csp_channel);
