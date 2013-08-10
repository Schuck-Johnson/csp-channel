var chan = (function() {
    'use strict';
    var protocol_error = function(name, o) {
        var type = typeof o;
        if ('object' == type) {
            if(o.constructor === Array) {
                type = "array";
            } else if (o === null) {
                type =  "null";
            } else {
                type = Object.prototype.toString.call(o);
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
                if (o && o.csp$channel$Buffer$item) {
                    return o.csp$channel$Buffer$item(o, item);
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
        }
    };
})();
