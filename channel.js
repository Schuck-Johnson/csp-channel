(function(definition){if(typeof exports==="object"){module.exports=definition();}else if(typeof define==="function"&&define.amd){define(definition);}else{csp_channel=definition();}})(function(){return function(){
var chan = {}, protocol_error = function(a, b) {
  var d = typeof b;
  "object" == d && (d = b ? b.constructor === Array ? "array" : Object.prototype.toString.call(b) : "null");
  return Error(["No protocol method ", a, " defined for type ", d, ": ", b].join(""))
};
chan.impl = {};
chan.impl.take = function(a, b) {
  if(a && a.csp$channel$ReadPort$take) {
    return a.csp$channel$ReadPort$take(a, b)
  }
  throw protocol_error("csp.channel.ReadPort/take", a);
};
chan.impl.put = function(a, b, d) {
  if(a && a.csp$channel$WritePort$put) {
    return a.csp$channel$WritePort$put(a, b, d)
  }
  throw protocol_error("csp.channel.WritePort/put", a);
};
chan.impl.close = function(a) {
  if(a && a.csp$channel$Channel$close) {
    return a.csp$channel$Channel$close(a)
  }
  throw protocol_error("csp.channel.Channel/close", a);
};
chan.impl.closed = function(a) {
  if(a && a.csp$channel$Channel$closed) {
    return a.csp$channel$Channel$closed(a)
  }
  throw protocol_error("csp.channel.Channel/closed", a);
};
chan.impl.full = function(a) {
  if(a && a.csp$channel$Buffer$full) {
    return a.csp$channel$Buffer$full(a)
  }
  throw protocol_error("csp.channel.Buffer/full", a);
};
chan.impl.remove = function(a) {
  if(a && a.csp$channel$Buffer$remove) {
    return a.csp$channel$Buffer$remove(a)
  }
  throw protocol_error("csp.channel.Buffer/remove", a);
};
chan.impl.add = function(a, b) {
  if(a && a.csp$channel$Buffer$add) {
    return a.csp$channel$Buffer$add(a, b)
  }
  throw protocol_error("csp.channel.Buffer/add", a);
};
chan.impl.active = function(a) {
  if(a && a.csp$channel$Handler$active) {
    return a.csp$channel$Handler$active(a)
  }
  throw protocol_error("csp.channel.Handler/active", a);
};
chan.impl.commit = function(a) {
  if(a && a.csp$channel$Handler$commit) {
    return a.csp$channel$Handler$commit(a)
  }
  throw protocol_error("csp.channel.Handler/commit", a);
};
chan.impl.deref = function(a) {
  if(a && a.csp$Core$deref) {
    return a.csp$Core$deref(a)
  }
  throw protocol_error("csp.Core/deref", a);
};
chan.impl.count = function(a) {
  if(a && a.csp$Core$count) {
    return a.csp$Core$count(a)
  }
  throw protocol_error("csp.Core/count", a);
};
chan.types = {};
(function(a, b) {
  a.RingBuffer = function(a, b, l, c) {
    this.head = a;
    this.tail = b;
    this.len = l;
    this.arr = c
  };
  var d = function(a, b, l, c, d) {
    var g;
    for(g = 0;g < d;g++) {
      l[c + g] = a[b + g]
    }
  }, c = a.RingBuffer.prototype;
  c.pop = function(a) {
    if(0 === a.len) {
      return null
    }
    var b = a.arr[a.tail];
    a.arr[a.tail] = null;
    a.tail = (a.tail + 1) % a.arr.length;
    a.len -= 1;
    return b
  };
  c.unshift = function(a, b) {
    a.arr[a.head] = b;
    a.head = (a.head + 1) % a.arr.length;
    a.len += 1;
    return null
  };
  c.unbounded_unshift = function(a, b) {
    a.len + 1 === a.arr.length && a.resize(a);
    return a.unshift(a, b)
  };
  c.resize = function(a) {
    var b = Array(2 * a.arr.length);
    a.tail < a.head ? (d(a.arr, a.tail, b, 0, a.len), a.tail = 0, a.head = a.len) : a.tail > a.head ? (d(a.arr, a.tail, b, 0, a.arr.length - a.tail, a.tail), d(a.arr, 0, b, a.arr.length - a.tail, a.head), a.tail = 0, a.head = a.len) : (a.tail = 0, a.head = 0);
    a.arr = b
  };
  c.cleanup = function(a, b) {
    for(var l;0 < a.len;a++) {
      l = a.pop(a), b(l) && a.unshift(a, l)
    }
  };
  a.FixedBuffer = function(a, b) {
    this.buffer = a;
    this.n = b
  };
  c = a.FixedBuffer.prototype;
  c.csp$channel$Buffer$full = function(a) {
    return a.buffer.len === a.n
  };
  c.csp$channel$Buffer$remove = function(a) {
    return a.buffer.pop(a.buffer)
  };
  c.csp$channel$Buffer$add = function(a, c) {
    if(b.full(a)) {
      throw Error("Can't add to a full buffer");
    }
    return a.buffer.unshift(a.buffer, c)
  };
  c.csp$Core$count = function(a) {
    return a.buffer.len
  };
  a.DroppingBuffer = function(a, b) {
    this.buffer = a;
    this.n = b
  };
  c = a.DroppingBuffer.prototype;
  c.csp$channel$Buffer$full = function(a) {
    return!1
  };
  c.csp$channel$Buffer$remove = function(a) {
    return a.buffer.pop(a.buffer)
  };
  c.csp$channel$Buffer$add = function(a, b) {
    return a.buffer.len !== a.n ? a.buffer.unshift(a.buffer, b) : null
  };
  c.csp$Core$count = function(a) {
    return a.buffer.len
  };
  a.SlidingBuffer = function(a, b) {
    this.buffer = a;
    this.n = b
  };
  c = a.SlidingBuffer.prototype;
  c.csp$channel$Buffer$full = function(a) {
    return!1
  };
  c.csp$channel$Buffer$remove = function(a) {
    return a.buffer.pop(a.buffer)
  };
  c.csp$channel$Buffer$add = function(a, c) {
    a.buffer.len === a.n && b.remove(a);
    return a.buffer.unshift(a.buffer, c)
  };
  c.csp$Core$count = function(a) {
    return a.buffer.len
  }
})(chan.types, chan.impl);
chan.ring_buffer = function(a) {
  return new chan.types.RingBuffer(0, 0, 0, Array(a))
};
var box = function(a) {
  return{csp$Core$deref:function(b) {
    return a
  }}
}, dispatch = function(a) {
  var b = !1, d = !1, c = a(32), p = function() {
    b = !0;
    d = !1;
    for(var a = !0, f = 0;a && 1024 > f;) {
      (a = c.pop(c)) && a(), f += 1
    }
    b = !1;
    !(0 < c.len) || d && b || (d = !0, m())
  }, m = function() {
    if("undefined" !== typeof MessageChannel) {
      var a = new MessageChannel;
      a.port1.onmessage = function(a) {
        p()
      };
      return function() {
        a.port2.postMessage(0)
      }
    }
    return"undefined" !== typeof setImmediate ? function() {
      setImmediate(p)
    } : function() {
      setTimeout(p, 0)
    }
  }();
  return{run:function(a) {
    c.unbounded_unshift(c, a);
    d && b || (d = !0, m())
  }}
}(chan.ring_buffer);
(function(a, b, d, c) {
  var p = function(a, b) {
    this.handler = a;
    this.val = b
  }, m = function(a) {
    return b.active(a.handler)
  };
  a.Channel = function(a, b, c, g, n, k) {
    this.takes = a;
    this.dirty_takes = b;
    this.puts = c;
    this.dirty_puts = g;
    this.buffer = n;
    this.closed = null
  };
  a = a.Channel.prototype;
  a.csp$channel$WritePort$put = function(a, f, e) {
    if(null === f) {
      throw Error("Cant put null in a channel");
    }
    if(a.closed || !b.active(e)) {
      return d(null)
    }
    for(var g, n, k = !0;k;) {
      if(k = !1, n = a.takes.pop(a.takes), null !== n) {
        if(b.active(n)) {
          return g = b.commit(n), b.commit(e), c.run(function() {
            return g(f)
          }), d(null)
        }
        k = !0
      }else {
        if(a.buffer && !b.full(a.buffer)) {
          return b.commit(e), b.add(a.buffer, f), d(null)
        }
        if(64 < a.dirty_puts) {
          a.dirty_puts = 0, a.puts.cleanup(a.puts, m)
        }else {
          if(a.dirty_puts += 1, 1024 < a.puts.len) {
            throw Error("No more than 1024 pending takes on a single channel");
          }
        }
        a.puts.unbounded_unshift(a.puts, new p(e, f))
      }
    }
  };
  a.csp$channel$ReadPort$take = function(a, f) {
    if(!b.active(f)) {
      return null
    }
    if(a.buffer && 0 < b.count(a.buffer)) {
      return b.commit(f), d(b.remove(a.buffer))
    }
    var e, g;
    for(e = !0;e;) {
      if(g = a.puts.pop(a.puts), null !== g) {
        e = g.handler;
        g = g.val;
        if(b.active(e)) {
          return e = b.commit(e), b.commit(f), c.run(e), d(g)
        }
        e = !0
      }else {
        if(a.closed) {
          return b.commit(f), d(null)
        }
        64 < a.dirty_takes ? (a.dirty_takes = 0, a.takes.cleanup(a.takes, b.active)) : a.dirty_takes += 1;
        if(1024 < a.takes.len) {
          throw Error("No more than 1024 pending takes on a single channel");
        }
        a.takes.unbounded_unshift(a.takes, f);
        return null
      }
    }
  };
  a.csp$channel$Channel$close = function(a) {
    if(!a.closed) {
      a.closed = !0;
      for(var d, e, g = !0;g;) {
        g = !1, d = a.takes.pop(a.takes), null !== d && (b.active(d) && (e = b.commit(d), c.run(function() {
          return e(null)
        })), g = !0)
      }
    }
    return null
  };
  a.csp$channel$Channel$closed = function(a) {
    return!0 === a.closed
  }
})(chan.types, chan.impl, box, dispatch);
chan.util = function() {
  return{handler:function(a) {
    return{csp$channel$Handler$active:function(a) {
      return!0
    }, csp$channel$Handler$commit:function(b) {
      return a
    }}
  }}
}();
(function(a, b, d, c, p) {
  var m = function() {
    return null
  }, l = function(a) {
    var b, c, d = [];
    for(b = 0;b < a;b++) {
      d.push(0)
    }
    for(b = 1;b < a;b++) {
      c = Math.floor(Math.random() * b), d[b] = d[c], d[c] = b
    }
    return d
  }, f = function() {
    var a = !0;
    return{csp$channel$Handler$active:function(b) {
      return a
    }, csp$channel$Handler$commit:function(b) {
      a = null;
      return!0
    }}
  }, e = function(a, c) {
    return{csp$channel$Handler$active:function(c) {
      return b.active(a)
    }, csp$channel$Handler$commit:function(d) {
      b.commit(a);
      return c
    }}
  };
  a.chan = function(b) {
    b = "number" === typeof b ? 0 !== b ? a.fixed_buffer(b) : null : b;
    return new a.types.Channel(a.ring_buffer(32), 0, a.ring_buffer(32), 0, b, null)
  };
  a.take = function(a, n, k) {
    k = k || !0;
    if(a = b.take(a, d(n))) {
      var e = b.deref(a);
      k ? n(e) : c(function() {
        return n(e)
      })
    }
    return null
  };
  a.put = function(a, n, k, e) {
    k = k || m;
    e = e || !0;
    b.put(a, n, d(k)) && k !== m && (e ? k() : c(k));
    return null
  };
  a.close = function(a) {
    return b.close(a)
  };
  a.closed = function(a) {
    return b.closed(a)
  };
  a.do_alts = function(a, c, d) {
    d = d || {};
    var u = f(), r = a.length, m = l(r), w = d.hasOwnProperty("priority"), v, s, q, h, t;
    for(s = 0;s < r;s++) {
      q = w ? s : m[s], h = a[q], q = h.constructor === Array ? h[0] : null, t = function(a, b) {
        return a ? e(u, function() {
          return c(null, a)
        }) : e(u, function(a) {
          return c(a, b)
        })
      }(q, h), (t = q ? b.put(q, h[1], t) : b.take(h, t)) && (v = p([b.deref(t), q ? q : h]))
    }
    return v ? v : d.hasOwnProperty("default") && b.active(u) && b.commit(u) ? p([d["default"], "default"]) : null
  };
  a.alts = function(d, e, k, f) {
    f = f || !0;
    if(d = a.do_alts(d, e, k)) {
      var r = b.deref(d);
      f ? e(r[0], r[1]) : c(function() {
        return e(r[0], r[1])
      })
    }
    return null
  };
  a.fixed_buffer = function(b) {
    return new a.types.FixedBuffer(a.ring_buffer(b), b)
  };
  a.dropping_buffer = function(b) {
    return new a.types.DroppingBuffer(a.ring_buffer(b), b)
  };
  a.sliding_buffer = function(b) {
    return new a.types.SlidingBuffer(a.ring_buffer(b), b)
  };
  a.timeout = function(b) {
    var c = a.chan();
    setTimeout(function() {
      a.close(c)
    }, b);
    return c
  };
  a.timeout = function(b) {
    var c = function(a, b, c) {
      this.key = a;
      this.val = b;
      this.forward = c
    }, d = function(a, b, d) {
      var h, e = Array(d + 1);
      for(h = 0;h <= d;h++) {
        e[h] = null
      }
      return new c(a, b, e)
    }, e = function(a, b, c, d) {
      d = d || null;
      var e, g, f;
      for(g = c;0 <= g;g--) {
        for(f = !0;f;) {
          f = !1, (e = a.forward[c]) && e.key < b && (a = e, f = !0)
        }
        d && (d[g] = a)
      }
      return a
    }, f = function(a, b) {
      this.header = a;
      this.level = b
    }, m = f.prototype;
    m.put = function(a, b, c) {
      var h, g, f = Array(15);
      if((h = e(a.header, b, a.level, f).forward[0]) && h.key === b) {
        h.val = c
      }else {
        a: {
          for(h = 0;15 > h;h++) {
            if(0.5 < Math.random()) {
              g = h;
              break a
            }
          }
          g = h
        }
        if(g > a.level) {
          for(h = a.level + 1;h < g;h++) {
            f[h] = a.header
          }
          a.level = g
        }
        b = d(b, c, Array(g));
        h = 0;
        h <= a.level && (a = f[h].forward, b.forward[h] = a[h], a[h] = b)
      }
    };
    m.remove = function(a, b) {
      var c, d, g = Array(15), f = e(a.header, b, a.level, g).forward[0];
      if(f && f.key === b) {
        for(c = 0;c <= a.level;c++) {
          d = g[c].forward, d[c] === f && (d[c] = f.forward[c])
        }
      }else {
        for(;0 < a.level && null === a.header.forward[a.level];) {
          a.level -= 1
        }
      }
    };
    m.ceilingEntry = function(a, b) {
      var c, d, e, g, f = a.header;
      for(c = a.level;0 <= c;c--) {
        e = f;
        for(g = !0;g;) {
          g = !1, (e = e.forward[c]) && (e.key >= b ? d = e : g = !0)
        }
        f = d ? d : f
      }
      return f !== a.header ? f : null
    };
    var l = new f(d(null, null, 0), 0);
    return function(c) {
      var d, e = (new Date).valueOf() + c, f = l.ceilingEntry(l, e);
      if(f && f.key < e + 10) {
        return f.val
      }
      d = a.chan();
      l.put(l, e, d);
      setTimeout(function() {
        l.remove(l, e);
        b.close(d)
      }, c);
      return d
    }
  }(a.impl);
  a.loop = function() {
    var a = Array.prototype.slice.call(arguments), b = a.pop(), c = function() {
      b.apply(null, [c].concat(Array.prototype.slice.call(arguments)))
    };
    c.apply(null, a)
  }
})(chan, chan.impl, chan.util.handler, dispatch.run, box);

return chan;}.call({});});
