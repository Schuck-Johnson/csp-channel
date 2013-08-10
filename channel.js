var chan = (function() {
    'use strict';
    var protocol_error = function(name, o) {
        var type = typeof o;
        if ('object' == type) {
            if (o){
                if(o.constructor === Array) {
                    type = "array";
                } else {
                    type = Object.prototype.toString.call(o);
                }
            } else {
                type = 'null';
            }
        }
        return new Error(["No protocol method ", name, " defined for type ", type, ": ", o].join(""));
    };
    var protocols = {
        MMC: {
            cleanup: function(o) {
                if (o && o.csp$channel$MMC$cleanup) {
                    return o.csp$channel$MMC$cleanup(o);
                }
                throw protocol_error('csp.channel.MMC/cleanup', o);
            }
        },
        ReadPort: {
            take: function(o, handler) {
                if (o && o.csp$channel$ReadPort$take) {
                    return o.csp$channel$ReadPort$take(o, handler);
                }
                throw protocol_error('csp.channel.ReadPort/take', o);
            }
        },
        WritePort: {
            put: function(o, val, handler) {
                if (o && o.csp$channel$WritePort$put) {
                    return o.csp$channel$WritePort$put(o, val, handler);
                }
                throw protocol_error('csp.channel.WritePort/put', o);
            }
        },
        Channel: {
            close: function(o) {
                if (o && o.csp$channel$Channel$close) {
                    return o.csp$channel$Channel$close(o);
                }
                throw protocol_error('csp.channel.Channel/close', o);
            },
            closed: function(o) {
                if (o && o.csp$channel$Channel$closed) {
                    return o.csp$channel$Channel$closed(o);
                }
                throw protocol_error('csp.channel.Channel/closed', o);
            }
        },
        Buffer: {
            full: function(o) {
                if (o && o.csp$channel$Buffer$full) {
                    return o.csp$channel$Buffer$full(o);
                }
                throw protocol_error('csp.channel.Buffer/full', o);
            },
            remove: function(o) {
                if (o && o.csp$channel$Buffer$remove) {
                    return o.csp$channel$Buffer$remove(o);
                }
                throw protocol_error('csp.channel.Buffer/remove', o);
            },
            add: function(o, item) {
                if (o && o.csp$channel$Buffer$add) {
                    return o.csp$channel$Buffer$add(o, item);
                }
                throw protocol_error('csp.channel.Buffer/add', o);
            }
        },
        Handler: {
            active: function(o) {
                if (o && o.csp$channel$Handler$active) {
                    return o.csp$channel$Handler$active(o);
                }
                throw protocol_error('csp.channel.Handler/active', o);
            },
            commit: function(o) {
                if (o && o.csp$channel$Channel$commit) {
                    return o.csp$channel$Channel$commit(o);
                }
                throw protocol_error('csp.channel.Handler/commit', o);
            }
        },
        Core: {
            deref: function(o) {
                if (o && o.csp$Core$deref) {
                    return o.csp$Core$deref(o);
                }
                throw protocol_error('csp.Core/deref', o);
            },
            count: function(o) {
                if (o && o.csp$Core$count) {
                    return o.csp$Core$count(o);
                }
                throw protocol_error('csp.Core/count', o);
            }
        },
    };

    var impl = (function(p){
        var i,j, impl = {};
        for(i in p) {
            if (p.hasOwnProperty(i)) {
                for (j in p[i]) {
                    if (p[i].hasOwnProperty(j)) {
                        impl[j] = p[i][j];
                    }
                }
            }
        }
        return impl;
    })(protocols);

    var box = function(val) {
        return {
            csp$Core$deref: function(o) {
                return val;
            }
        };
    };
    var dispatch = (function() {
        return {
            run: function(f) {
                setTimeout(f, 0);
            }
        };
    })();
    var Channel = (function(impl, box, dispatch) {
        var Channel = function(takes, puts, buffer, closed) {
            this.takes = takes;
            this.puts = puts;
            this.buffer = buffer;
            this.closed = {csp$Core$deref: function() { return closed;}};
        };

        var p = Channel.prototype;

        p.csp$channel$MMC$cleanup = function(o) {
            var i, item, tlen = o.takes.length, plen = o.puts.length;
            for(i = 0; i < plen; i++) {
                item = o.puts[i][0];
                if (! impl.active(item)) {
                    o.puts.splice(i, 1);
                }
            }
            for(i = 0; i < tlen; i++) {
                item = o.takes[i];
                if (! impl.active(item)) {
                    o.takes.splice(i, 1);
                }
            }
            return null;
        };

        p.csp$channel$WritePort$put = function(o, val, handler) {
            if (val === null) {
                throw (new Error("Cant put null in a channel"));
            }
            impl.cleanup(o);
            if (impl.closed(o)) {
                return box(null);
            } else {
                var take_cb, put_cb, taker, i, tlen = o.takes.length;
                for (i = 0; i < tlen; i++) {
                    taker = o.takes[i];
                    if (impl.active(taker) && impl.active(handler)) {
                        o.takes.splice(i, 1);
                        take_cb = impl.commit(taker);
                        put_cb = impl.commit(handler);
                        break;
                    }
                }
                if (take_cb && put_cb) {
                    dispatch.run(function() { return take_cb(val);});
                    return box(null);
                } else {
                    if (o.buffer && (! impl.full(o.buffer))) {
                        if (impl.active(handler) && impl.commit(handler)) {
                            impl.add(o.buffer, val);
                            return box(null);
                        }
                        return null;
                    } else {
                        o.puts.unshift([handler, val]);
                        return null;
                    }
                }
            }
            return null;
        };

        p.csp$channel$ReadPort$take = function(o, handler) {
            impl.cleanup(o);
            if (o.buffer && (impl.count(o.buffer) > 0)) {
                if (impl.active(handler) && impl.commit(handler)) {
                    return box(impl.remove(o.buffer));
                }
                return null;
            } else {
                var take_cb, put_cb, val, putter, i, plen = o.puts.length;
                for (i = 0; i < plen; i++) {
                    putter = o.puts[i][0];
                    if (impl.active(putter) && impl.active(handler)) {
                        o.takes.splice(i, 1);
                        take_cb = impl.commit(handler);
                        put_cb = impl.commit(putter);
                        val = o.puts[i][1];
                        break;
                    }
                }

                if (take_cb && put_cb) {
                    dispatch.run(put_cb);
                    return box(val);
                } else {
                    if (impl.closed(o)) {
                        if (impl.active(handler) && impl.commit(handler)) {
                            return box(null);
                        }
                        return null;
                    } else {
                        o.takes.unshift(handler);
                        return null;
                    }
                }
            }
            return null;
        };

        p.csp$channel$Channel$close = function(o) {
            impl.cleanup(o);
            if (impl.closed(o)) {
                return null;
            } else {
                o.closed = {csp$Core$deref: function() { return true;}};
                var taker, take_cb, i, tlen = o.takes.length;
                for (i = 0; i < tlen; i++) {
                    taker = o.takes[i];
                    take_cb = (impl.active(taker) && impl.commit(taker));
                    (function(take_cb){
                        if (take_cb) {
                            dispatch.run(function() { return take_cb(null); });
                        }
                    })(take_cb);
                }
                return null;
            }
            return null;
        };

        p.csp$channel$Channel$closed = function(o) {
            return impl.deref(o.closed) === true;
        };
        return Channel;
    })(impl, box, dispatch);

    var Buffers = (function(){
        var FixedBuffer = function(buffer, n) {
            this.buffer = buffer;
            this.n = n;
        };
        var fb = FixedBuffer.prototype;
        fb.csp$channel$Buffer$full = function(b) {
            return (b.buffer.length === b.n);
        };
        fb.csp$channel$Buffer$remove = function(b) {
            return b.buffer.pop();
        };
        fb.csp$channel$Buffer$add = function(b, item) {
            if (impl.full(b)) {
                throw (new Error("Can't add to a full buffer"));
            }
            return b.buffer.unshift(item);
        };
        fb.csp$Core$count = function(o) {
            return o.buffer.length;
        };
        return {
            Fixed: FixedBuffer
        };
    })(impl);

    var util = (function(){
        return {
            handler: function(f) {
                return {
                    csp$channel$Handler$active: function(o) { return true;},
                    csp$channel$Channel$commit: function(o) { return f;}
                };
            }
        };
    })();

    var show = (function(impl, handler, run, Buffers){
        var nop = function() {return null; };
        return {
            chan: function(buffer) {
                return new Channel([], [], buffer, null);
            },
            take: function(port, fn1, on_caller) {
                on_caller = on_caller || true;
                var ret = impl.take(port, handler(fn1));
                if (ret) {
                    var val = impl.deref(ret);
                    if (on_caller) {
                        fn1(val);
                    } else {
                        run(function() { return fn1(val);});
                    }
                }
                return null;
            },
            put: function(port, val, fn0, on_caller) {
                fn0 = fn0 || nop;
                on_caller = on_caller || true;
                var ret = impl.put(port, val, handler(fn0));
                if (ret && (fn0  !== nop)) {
                    if (on_caller) {
                        fn0();
                    } else {
                        run(fn0);
                    }
                }
                return null;
            },
            close: function(port) {
                return impl.close(port);
            },
            closed: function(port) {
                return impl.closed(port);
            },
            fixed_buffer: function(n) {
                return new Buffers.Fixed([], n);
            }
        };
    })(impl, util.handler, dispatch.run, Buffers);
    return {
        "impl": {
            "cleanup": impl.cleanup,
            "take": impl.take,
            "put": impl.put,
            "close": impl.close,
            "closed": impl.closed,
            "full": impl.full,
            "remove": impl.remove,
            "add": impl.add,
            "active": impl.active,
            "commit": impl.commit
        },
        "types": {
            "Channel": Channel,
            "FixedBuffer": Buffers.Fixed
        },
        "util": {
            "handler": util.handler
        },
        "chan": show.chan,
        "take": show.take,
        "put": show.put,
        "close": show.close,
        "closed": show.closed,
        "fixed_buffer": show.fixed_buffer
    };
})();
