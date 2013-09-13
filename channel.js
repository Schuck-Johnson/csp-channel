(function(definition){if(typeof exports==="object"){module.exports=definition();}else if(typeof define==="function"&&define.amd){define(definition);}else{csp_channel=definition();}})(function(){return function(){
var chan = {}, protocol_error = function(a, b) {
  var c = typeof b;
  "object" == c && (c = b ? b.constructor === Array ? "array" : Object.prototype.toString.call(b) : "null");
  return Error(["No protocol method ", a, " defined for type ", c, ": ", b].join(""))
};
chan.impl = {};
chan.impl.cleanup = function(a) {
  if(a && a.csp$channel$MMC$cleanup) {
    return a.csp$channel$MMC$cleanup(a)
  }
  throw protocol_error("csp.channel.MMC/cleanup", a);
};
chan.impl.take = function(a, b) {
  if(a && a.csp$channel$ReadPort$take) {
    return a.csp$channel$ReadPort$take(a, b)
  }
  throw protocol_error("csp.channel.ReadPort/take", a);
};
chan.impl.put = function(a, b, c) {
  if(a && a.csp$channel$WritePort$put) {
    return a.csp$channel$WritePort$put(a, b, c)
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
(function(a, b, c, d) {
  a.Channel = function(a, b, d, c) {
    this.takes = a;
    this.puts = b;
    this.buffer = d;
    this.closed = {csp$Core$deref:function() {
      return c
    }}
  };
  a = a.Channel.prototype;
  a.csp$channel$MMC$cleanup = function(a) {
    var d, c, h = a.takes.length, l = a.puts.length;
    for(d = 0;d < l;) {
      c = a.puts[d][0], b.active(c) ? d++ : (a.puts.splice(d, 1), l--)
    }
    for(d = 0;d < h;) {
      c = a.takes[d], b.active(c) ? d++ : (a.takes.splice(d, 1), h--)
    }
    return null
  };
  a.csp$channel$WritePort$put = function(a, e, f) {
    if(null === e) {
      throw Error("Cant put null in a channel");
    }
    b.cleanup(a);
    if(b.closed(a)) {
      return c(null)
    }
    var h, l, n, g, k = a.takes.length;
    for(g = 0;g < k;g++) {
      if(n = a.takes[g], b.active(n) && b.active(f)) {
        a.takes.splice(g, 1);
        h = b.commit(n);
        l = b.commit(f);
        break
      }
    }
    if(h && l) {
      return d.run(function() {
        return h(e)
      }), c(null)
    }
    if(a.buffer && !b.full(a.buffer)) {
      if(b.active(f) && b.commit(f)) {
        return b.add(a.buffer, e), c(null)
      }
    }else {
      a.puts.unshift([f, e])
    }
    return null
  };
  a.csp$channel$ReadPort$take = function(a, e) {
    b.cleanup(a);
    if(a.buffer && 0 < b.count(a.buffer)) {
      return b.active(e) && b.commit(e) ? c(b.remove(a.buffer)) : null
    }
    var f, h, l, n, g, k = a.puts.length;
    for(g = 0;g < k;g++) {
      if(n = a.puts[g][0], b.active(n) && b.active(e)) {
        a.takes.splice(g, 1);
        f = b.commit(e);
        h = b.commit(n);
        l = a.puts[g][1];
        break
      }
    }
    if(f && h) {
      return d.run(h), c(l)
    }
    if(b.closed(a)) {
      return b.active(e) && b.commit(e) ? c(null) : null
    }
    a.takes.unshift(e);
    return null
  };
  a.csp$channel$Channel$close = function(a) {
    b.cleanup(a);
    if(!b.closed(a)) {
      a.closed = {csp$Core$deref:function() {
        return!0
      }};
      var c, f, h = a.takes.length;
      for(f = 0;f < h;f++) {
        c = a.takes[f], c = b.active(c) && b.commit(c), function(a) {
          a && d.run(function() {
            return a(null)
          })
        }(c)
      }
    }
    return null
  };
  a.csp$channel$Channel$closed = function(a) {
    return!0 === b.deref(a.closed)
  }
})(chan.types, chan.impl, box, dispatch);
(function(a, b) {
  a.FixedBuffer = function(a, b) {
    this.buffer = a;
    this.n = b
  };
  var c = a.FixedBuffer.prototype;
  c.csp$channel$Buffer$full = function(a) {
    return a.buffer.length === a.n
  };
  c.csp$channel$Buffer$remove = function(a) {
    return a.buffer.pop()
  };
  c.csp$channel$Buffer$add = function(a, c) {
    if(b.full(a)) {
      throw Error("Can't add to a full buffer");
    }
    return a.buffer.unshift(c)
  };
  c.csp$Core$count = function(a) {
    return a.buffer.length
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
    return a.buffer.pop()
  };
  c.csp$channel$Buffer$add = function(a, b) {
    return a.buffer.length !== a.n ? a.buffer.unshift(b) : null
  };
  c.csp$Core$count = function(a) {
    return a.buffer.length
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
    return a.buffer.pop()
  };
  c.csp$channel$Buffer$add = function(a, c) {
    a.buffer.length === a.n && b.remove(a);
    return a.buffer.unshift(c)
  };
  c.csp$Core$count = function(a) {
    return a.buffer.length
  }
})(chan.types, chan.impl);
chan.util = function() {
  return{handler:function(a) {
    return{csp$channel$Handler$active:function(a) {
      return!0
    }, csp$channel$Handler$commit:function(b) {
      return a
    }}
  }}
}();
(function(a, b, c, d, t) {
  var e = function() {
    return null
  }, f = function(a) {
    var b, c, d = [];
    for(b = 0;b < a;b++) {
      d.push(0)
    }
    for(b = 1;b < a;b++) {
      c = Math.floor(Math.random() * b), d[b] = d[c], d[c] = b
    }
    return d
  }, h = function() {
    var a = !0;
    return{csp$channel$Handler$active:function(b) {
      return a
    }, csp$channel$Handler$commit:function(b) {
      a = null;
      return!0
    }}
  }, l = function(a, c) {
    return{csp$channel$Handler$active:function(c) {
      return b.active(a)
    }, csp$channel$Handler$commit:function(d) {
      b.commit(a);
      return c
    }}
  };
  a.chan = function(b) {
    return new a.types.Channel([], [], b, null)
  };
  a.take = function(a, g, k) {
    k = k || !0;
    if(a = b.take(a, c(g))) {
      var e = b.deref(a);
      k ? g(e) : d(function() {
        return g(e)
      })
    }
    return null
  };
  a.put = function(a, g, k, f) {
    k = k || e;
    f = f || !0;
    b.put(a, g, c(k)) && k !== e && (f ? k() : d(k));
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
    var e = h(), u = a.length, v = f(u), w = d.hasOwnProperty("priority"), s, q, m, p, r;
    for(q = 0;q < u;q++) {
      m = w ? q : v[q], p = a[m], m = p.constructor === Array ? p[0] : null, r = function(a, b) {
        return a ? l(e, function() {
          return c(null, a)
        }) : l(e, function(a) {
          return c(a, b)
        })
      }(m, p), (r = m ? b.put(m, p[1], r) : b.take(p, r)) && (s = t([b.deref(r), m ? m : p]))
    }
    if(s) {
      return s
    }
    d.hasOwnProperty("default") && b.active(e) && b.commit(e) && t([d["default"], "default"]);
    return null
  };
  a.fixed_buffer = function(b) {
    return new a.types.FixedBuffer([], b)
  };
  a.dropping_buffer = function(b) {
    return new a.types.DroppingBuffer([], b)
  };
  a.sliding_buffer = function(b) {
    return new a.types.SlidingBuffer([], b)
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
