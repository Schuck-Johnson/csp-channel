var chan = csp_channel;
var timeout = function(msecs) {
    var ch = chan.chan();
    setTimeout(function() {
        chan.close(ch);
    }, msecs);
    return ch;
};

var fake_search = function(kind) {
    return function(c, query) {
        var tc = timeout(Math.floor(Math.random() * 100));
        chan.take(tc, function() {
            chan.put(c, [kind, query]);
        });
        return c;
    }
};

var web1 = fake_search('web1');
var web2 = fake_search('web2');
var image1 = fake_search('image1');
var image2 = fake_search('image2');
var video1 = fake_search('video1');
var video2 = fake_search('video2');

var fastest = function() {
    var query = arguments[0],
        rlen = arguments.length,
        c = chan.chan(),
        i;
    for(i = 1; i < rlen; i++) {
        arguments[i](c, query);
    }
    return c;
};

var google = function(query) {
    var c = chan.chan(),
        t = timeout(80),
        ret = [], i;
    chan.take(fastest(query, web1, web2), function(v) { return chan.put(c, v);});
    chan.take(fastest(query, image1, image2), function(v) { return chan.put(c, v);});
    chan.take(fastest(query, video1, video2), function(v) { return chan.put(c, v);});
    for(i = 0; i < 3; i++) {
        chan.alts([c, t], function(v, p) { ret.push(v);});
    }
    return ret;
};

var search = google('clojure');
