(function(definition){if(typeof exports==="object"){module.exports=definition();}else if(typeof define==="function"&&define.amd){define(definition);}else{csp_channel=definition();}})(function(){return function(){
'use strict';
/** @type {Object} */
var chan = {};
/**
 * Generate error for when a object does not implement a protocol
 */
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
chan.impl = {};
/**
 * MMC
 * Multi Message Channel protocol for cleanup of various take / put callbacks.
 * ---------
 * Removes any inactive put and take requests.
 */
chan.impl.cleanup = function(o) {
    if (o && o.csp$channel$MMC$cleanup) {
        return o.csp$channel$MMC$cleanup(o);
    }
    throw protocol_error('csp.channel.MMC/cleanup', o);
};
/**
 * ReadPort
 * Read port for a channel (taking values from a channel with a callback).
 * ----------
 * Puts a take callback on a channel.  The take request is parked (waiting for a put request) if there in no put request
 * enqued.  If the channel is closed the callback is called with a null value.
 */
chan.impl.take = function(o, handler) {
    if (o && o.csp$channel$ReadPort$take) {
        return o.csp$channel$ReadPort$take(o, handler);
    }
    throw protocol_error('csp.channel.ReadPort/take', o);
};
/**
 * WritePort
 * Write port for a channel (putting values on a channel with a callback).
 * ---------
 * Puts a put callback and value on a channel.  If no take callbacks are the the put request is parked
 * (waiting for a take request).  The value cannot be null.
 */
chan.impl.put = function(o, val, handler) {
    if (o && o.csp$channel$WritePort$put) {
        return o.csp$channel$WritePort$put(o, val, handler);
    }
    throw protocol_error('csp.channel.WritePort/put', o);
};
/**
 * Channel
 * Channel protocol for closing and check if a channel is closed.
 * ---------
 * Closes a channel.  All parked take rcllbacks are called with null values.
 */
chan.impl.close = function(o) {
    if (o && o.csp$channel$Channel$close) {
        return o.csp$channel$Channel$close(o);
    }
    throw protocol_error('csp.channel.Channel/close', o);
};
/**
 * Returns if a channel is closed.
 */
chan.impl.closed = function(o) {
    if (o && o.csp$channel$Channel$closed) {
        return o.csp$channel$Channel$closed(o);
    }
    throw protocol_error('csp.channel.Channel/closed', o);
};
/**
 * Buffer
 * Buffer protocols for buffer management.
 * ---------
 * Checks if a buffer is full.
 */
chan.impl.full = function(o) {
    if (o && o.csp$channel$Buffer$full) {
        return o.csp$channel$Buffer$full(o);
    }
    throw protocol_error('csp.channel.Buffer/full', o);
};
/**
 * Removes a value from the buffer and returns it.
 */
chan.impl.remove = function(o) {
    if (o && o.csp$channel$Buffer$remove) {
        return o.csp$channel$Buffer$remove(o);
    }
    throw protocol_error('csp.channel.Buffer/remove', o);
};
/**
 * Adds a value to the buffer and returns it.
 */
chan.impl.add = function(o, item) {
    if (o && o.csp$channel$Buffer$add) {
        return o.csp$channel$Buffer$add(o, item);
    }
    throw protocol_error('csp.channel.Buffer/add', o);
};
/**
 * Handler
 * Handler for channel callbacks to check if they are still atcive.
 * ---------
 * Checks if the callback in a channel is active
 */
chan.impl.active = function(o) {
    if (o && o.csp$channel$Handler$active) {
        return o.csp$channel$Handler$active(o);
    }
    throw protocol_error('csp.channel.Handler/active', o);
};
/**
 * Returns the callback function contained in the handler.
 */
chan.impl.commit = function(o) {
    if (o && o.csp$channel$Handler$commit) {
        return o.csp$channel$Handler$commit(o);
    }
    throw protocol_error('csp.channel.Handler/commit', o);
};
/**
 * Core
 * Base protocols for channel library.
 * ---------
 * Derefences a reference value.
 */
chan.impl.deref = function(o) {
    if (o && o.csp$Core$deref) {
        return o.csp$Core$deref(o);
    }
    throw protocol_error('csp.Core/deref', o);
};
/**
 * Gets the number of items in a collection.
 */
chan.impl.count = function(o) {
    if (o && o.csp$Core$count) {
        return o.csp$Core$count(o);
    }
    throw protocol_error('csp.Core/count', o);
};
/**
 * Makes a value a reference value.
 */
var box = function(val) {
    return {
        csp$Core$deref: function(o) {
            return val;
        }
    };
};
/**
 * Dispatching functionality.
 */
var dispatch = (function() {
    return {
        /**
         * Runs a function outside of the main program.
         */
        run: function(f) {
            setTimeout(f, 0);
        }
    };
})();
/**
 * Conatiner for the types of the library.
 */
chan.types = {};
(function(types, impl, box, dispatch) {
    /**
     * Multi Message Channel type with buffer.
     */
    types.Channel = function(takes, puts, buffer, closed) {
        this.takes = takes;
        this.puts = puts;
        this.buffer = buffer;
        this.closed = {csp$Core$deref: function() { return closed;}};
    };
    //Channels prototype
    var p = types.Channel.prototype;
    /**
     * Channels Channel cleanup protocol method.
     */
    p.csp$channel$MMC$cleanup = function(o) {
        var i, item, tlen = o.takes.length, plen = o.puts.length;
        i = 0;
        while (i < plen) {
            item = o.puts[i][0];
            if (! impl.active(item)) {
                o.puts.splice(i, 1);
                plen--;
            } else {
                i++;
            }
        }
        i = 0;
        while(i < tlen) {
            item = o.takes[i];
            if (! impl.active(item)) {
                o.takes.splice(i, 1);
                tlen--;
            } else {
                i++;
            }
        }
        return null;
    };
    /**
     * Channels WritePort put protocol method.
     */
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
    /**
     * Channels ReadPort take protocol method.
     */
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
    /**
     * Channels Channel close protocol method.
     */
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
    /**
     * Channels Channel closed protocol method.
     */
    p.csp$channel$Channel$closed = function(o) {
        return impl.deref(o.closed) === true;
    };
})(chan.types, chan.impl, box, dispatch);

(function(types, impl){
    /**
     * Fixed buffer type that can only hold a fixed number of items.
     */
    types.FixedBuffer = function(buffer, n) {
        this.buffer = buffer;
        this.n = n;
    };
    //Fixed buffers prototype.
    var fb = types.FixedBuffer.prototype;
    /**
     * FixedBuffer Buffer full protocol method.
     */
    fb.csp$channel$Buffer$full = function(b) {
        return (b.buffer.length === b.n);
    };
    /**
     * FixedBuffer Buffer remove protocol method.
     */
    fb.csp$channel$Buffer$remove = function(b) {
        return b.buffer.pop();
    };
    /**
     * FixedBuffer Buffer add protocol method.
     */
    fb.csp$channel$Buffer$add = function(b, item) {
        if (impl.full(b)) {
            throw (new Error("Can't add to a full buffer"));
        }
        return b.buffer.unshift(item);
    };
    /**
     * FixedBuffer Buffer count protocol method.
     */
    fb.csp$Core$count = function(o) {
        return o.buffer.length;
    };
    /**
     * Dropping buffer type that drops any items added after it is full.
     */
    types.DroppingBuffer = function(buffer, n) {
        this.buffer = buffer;
        this.n = n;
    };
    //DroppingBuffer prototype.
    var db = types.DroppingBuffer.prototype;
    /**
     * DroppingBuffer Buffer full protocol method.
     */
    db.csp$channel$Buffer$full = function(b) {
        return false;
    };
    /**
     * DroppingBuffer Buffer remove protocol method.
     */
    db.csp$channel$Buffer$remove = function(b) {
        return b.buffer.pop();
    };
    /**
     * DroppingBuffer Buffer add protocol method.
     */
    db.csp$channel$Buffer$add = function(b, item) {
        if (b.buffer.length !== b.n) {
            return b.buffer.unshift(item);
        }
        return null;
    };
    /**
     * DroppingBuffer Buffer count protocol method.
     */
    db.csp$Core$count = function(o) {
        return o.buffer.length;
    };
    /**
     * Sliding buffer type that drops the least recently add item when a new item is added and it is full.
     */
    types.SlidingBuffer = function(buffer, n) {
        this.buffer = buffer;
        this.n = n;
    };
    //SlidingBuffer
    var sb = types.SlidingBuffer.prototype;
    /**
     * Sliding Buffer full protocol method.
     */
    sb.csp$channel$Buffer$full = function(b) {
        return false;
    };
    /**
     * Sliding Buffer remove protocol method.
     */
    sb.csp$channel$Buffer$remove = function(b) {
        return b.buffer.pop();
    };
    /**
     * Sliding Buffer add protocol method.
     */
    sb.csp$channel$Buffer$add = function(b, item) {
        if (b.buffer.length === b.n) {
            impl.remove(b);
        }
        return b.buffer.unshift(item);
    };
    /**
     * Sliding Buffer count protocol method.
     */
    sb.csp$Core$count = function(o) {
        return o.buffer.length;
    };
})(chan.types, chan.impl);
/**
 * Any channel utility functions
 */
chan.util = (function(){
    return {
        /**
         * Makes a function (callback) into a handler.
         */
        handler: function(f) {
            return {
                csp$channel$Handler$active: function(o) { return true;},
                csp$channel$Handler$commit: function(o) { return f;}
            };
        }
    };
})();

(function(chan, impl, handler, run, box){
    /**
     * Function that does nothing
     */
    var nop = function() { return null; };
    /**
     * Generates a random array of size n of values 0 through n
     */
    var random_array = function(n) {
        var i, j, a = [];
        for(i = 0; i < n; i++) {
            a.push(0);
        }
        for(i = 1; i < n; i++) {
            j = Math.floor(Math.random() * i);
            a[i] = a[j];
            a[j] = i;
        }
        return a;
    };
    /**
     * Makes a flag handler for use in the alts function.
     */
    var alt_flag = function() {
        var flag = true;
        return {
            csp$channel$Handler$active: function(o) { return flag;},
            csp$channel$Handler$commit: function(o) {
                flag = null;
                return true;
            }
        };
    };
    /**
     * Makes a handler for use in the alts function.
     */
    var alt_handler = function(flag, cb) {
        return {
            csp$channel$Handler$active: function(o) { return impl.active(flag);},
            csp$channel$Handler$commit: function(o) {
                impl.commit(flag);
                return cb;
            }
        };
    };
    /**
     * Frontend api constructor for a Mutli message channel.
     */
    chan.chan = function(buffer) {
        return new chan.types.Channel([], [], buffer, null);
    };
    /**
     * Frontend api for taking value from a channel.
     */
    chan.take = function(port, fn1, on_caller) {
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
    };
    /**
     * Frontend api for putiing a value into a channel.
     */
    chan.put =  function(port, val, fn0, on_caller) {
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
    };
    /**
     * Frontend api for closing a channel.
     */
    chan.close = function(port) {
        return impl.close(port);
    };
    /**
     * Frontend api for checking if a channel is closed.
     */
    chan.closed = function(port) {
        return impl.closed(port);
    };
    /**
     * Frontend api for taking or putting a value across multiple channels.
     */
    chan.alts = function(ports, fret, options) {
        options = options || {};
        var flag = alt_flag(), 
            n = ports.length, 
            idxs = random_array(n),
            priority = (options.hasOwnProperty('priority')),
            ret, i, idx, wport, port, val, h, vbox;
        for(i = 0; i < n; i++) {
            idx = priority ? i : idxs[i];
            port = ports[idx];
            wport = (port.constructor === Array) ? port[0] : null;
            h = (function(wport, port){
                if (wport) {
                    return alt_handler(flag, function() { return fret(null, wport);});
                }
                return alt_handler(flag, function(v) { return fret(v, port);});
            })(wport, port);
            if (wport) {
                vbox = impl.put(wport, port[1], h);
            } else {
                vbox = impl.take(port, h);
            }
            if (vbox) {
                ret = box([impl.deref(vbox), (wport ? wport : port)]);
            }
        }
        if (ret) {
            return ret;
        }
        if (options.hasOwnProperty('default')) {
            if (impl.active(flag) && impl.commit(flag)) {
                box([options['default'], 'default']);
            }
        }
        return null;
    };
    /**
     * Frontend api for creating a fixed buffer.
     */
    chan.fixed_buffer = function(n) {
        return new chan.types.FixedBuffer([], n);
    };
    /**
     * Frontend api for creating a dropping buffer.
     */
    chan.dropping_buffer = function(n) {
        return new chan.types.DroppingBuffer([], n);
    };
    /**
     * Frontend api for creating a sliding buffer.
     */
    chan.sliding_buffer = function(n) {
        return new chan.types.SlidingBuffer([], n);
    };
})(chan, chan.impl, chan.util.handler, dispatch.run, box);
return chan;
;return this.csp_channel;}.call({});});
