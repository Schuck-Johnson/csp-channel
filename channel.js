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
var box = function(a) {
  return{csp$Core$deref:function(b) {
    return a
  }}
}, dispatch = function() {
  return{run:function(a) {
    setTimeout(a, 0)
  }}
}();
chan.types = {};
(function(a, b, d, c) {
  var e = function(a, e) {
    this.handler = a;
    this.val = e
  }, f = function(a) {
    return b.active(a.handler)
  };
  a.Channel = function(a, e, b, g, l, f) {
    this.takes = a;
    this.dirty_takes = e;
    this.puts = b;
    this.dirty_puts = g;
    this.buffer = l;
    this.closed = null
  };
  a = a.Channel.prototype;
  a.csp$channel$WritePort$put = function(a, p, k) {
    if(null === p) {
      throw Error("Cant put null in a channel");
    }
    if(a.closed || !b.active(k)) {
      return d(null)
    }
    for(var g, l, h = !0;h;) {
      if(h = !1, l = a.takes.pop(a.takes), null !== l) {
        if(b.active(l)) {
          return g = b.commit(l), b.commit(k), c.run(function() {
            return g(p)
          }), d(null)
        }
        h = !0
      }else {
        if(a.buffer && !b.full(a.buffer)) {
          return b.commit(k), b.add(a.buffer, p), d(null)
        }
        if(64 < a.dirty_puts) {
          a.dirty_puts = 0, a.puts.cleanup(a.puts, f)
        }else {
          if(a.dirty_puts += 1, 1024 < a.puts.len) {
            throw Error("No more than 1024 pending takes on a single channel");
          }
        }
        a.puts.unbounded_unshift(a.puts, new e(k, p))
      }
    }
  };
  a.csp$channel$ReadPort$take = function(a, e) {
    if(!b.active(e)) {
      return null
    }
    if(a.buffer && 0 < b.count(a.buffer)) {
      return b.commit(e), d(b.remove(a.buffer))
    }
    var f, g;
    for(f = !0;f;) {
      if(g = a.puts.pop(a.puts), null !== g) {
        f = g.handler;
        g = g.val;
        if(b.active(f)) {
          return f = b.commit(f), b.commit(e), c.run(f), d(g)
        }
        f = !0
      }else {
        if(a.closed) {
          return b.commit(e), d(null)
        }
        64 < a.dirty_takes ? (a.dirty_takes = 0, a.takes.cleanup(a.takes, b.active)) : a.dirty_takes += 1;
        if(1024 < a.takes.len) {
          throw Error("No more than 1024 pending takes on a single channel");
        }
        a.takes.unbounded_unshift(a.takes, e);
        return null
      }
    }
  };
  a.csp$channel$Channel$close = function(a) {
    if(!a.closed) {
      a.closed = !0;
      for(var e, f, g = !0;g;) {
        g = !1, e = a.takes.pop(a.takes), null !== e && (b.active(e) && (f = b.commit(e), c.run(function() {
          return f(null)
        })), g = !0)
      }
    }
    return null
  };
  a.csp$channel$Channel$closed = function(a) {
    return!0 === a.closed
  }
})(chan.types, chan.impl, box, dispatch);
(function(a, b) {
  a.RingBuffer = function(a, b, c, d) {
    this.head = a;
    this.tail = b;
    this.len = c;
    this.arr = d
  };
  var d = function(a, b, c, d, k) {
    var g;
    for(g = 0;g < k;g++) {
      c[d + g] = a[b + g]
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
    for(var c;0 < a.len;a++) {
      c = a.pop(a), b(c) && a.unshift(a, c)
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
chan.util = function() {
  return{handler:function(a) {
    return{csp$channel$Handler$active:function(a) {
      return!0
    }, csp$channel$Handler$commit:function(b) {
      return a
    }}
  }}
}();
(function(a, b, d, c, e) {
  var f = function() {
    return null
  }, u = function(a) {
    var b, c, d = [];
    for(b = 0;b < a;b++) {
      d.push(0)
    }
    for(b = 1;b < a;b++) {
      c = Math.floor(Math.random() * b), d[b] = d[c], d[c] = b
    }
    return d
  }, p = function() {
    var a = !0;
    return{csp$channel$Handler$active:function(b) {
      return a
    }, csp$channel$Handler$commit:function(b) {
      a = null;
      return!0
    }}
  }, k = function(a, c) {
    return{csp$channel$Handler$active:function(c) {
      return b.active(a)
    }, csp$channel$Handler$commit:function(d) {
      b.commit(a);
      return c
    }}
  };
  a.chan = function(b) {
    return new a.types.Channel(a.ring_buffer(32), 0, a.ring_buffer(32), 0, b, null)
  };
  a.take = function(a, l, h) {
    h = h || !0;
    if(a = b.take(a, d(l))) {
      var e = b.deref(a);
      h ? l(e) : c(function() {
        return l(e)
      })
    }
    return null
  };
  a.put = function(a, e, h, k) {
    h = h || f;
    k = k || !0;
    b.put(a, e, d(h)) && h !== f && (k ? h() : c(h));
    return null
  };
  a.close = function(a) {
    return b.close(a)
  };
  a.closed = function(a) {
    return b.closed(a)
  };
  a.alts = function(a, c, d) {
    d = d || {};
    var f = p(), t = a.length, v = u(t), w = d.hasOwnProperty("priority"), s, q, m, n, r;
    for(q = 0;q < t;q++) {
      m = w ? q : v[q], n = a[m], m = n.constructor === Array ? n[0] : null, r = function(a, b) {
        return a ? k(f, function() {
          return c(null, a)
        }) : k(f, function(a) {
          return c(a, b)
        })
      }(m, n), (r = m ? b.put(m, n[1], r) : b.take(n, r)) && (s = e([b.deref(r), m ? m : n]))
    }
    if(s) {
      return s
    }
    d.hasOwnProperty("default") && b.active(f) && b.commit(f) && e([d["default"], "default"]);
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
  a.loop = function() {
    var a = Array.prototype.slice.call(arguments), b = a.pop(), c = function() {
      b.apply(null, [c].concat(Array.prototype.slice.call(arguments)))
    };
    c.apply(null, a)
  }
})(chan, chan.impl, chan.util.handler, dispatch.run, box);

return chan;}.call({});});
