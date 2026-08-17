function procesKey(e) {
  for (var t = e.split("\n"), r = "", n = 0; n < t.length; n++)
    t[n].indexOf("-----") < 0 && (r += t[n]);
  return r;
}
async function fetchData() {
  var e = config.publicKey;
  var t = config.keyId,
    r =
      `${t.split("-")[0]}-${Math.round(1e11 * Math.random())}-` +
      t.split("-")[1],
    r =
      ((r = r),
      (e = e),
      (e = forge.pki.publicKeyFromPem(e)),
      (r = forge.util.createBuffer(r, "utf8").getBytes()),
      (e = e.encrypt(r)),
      forge.util.encode64(e));
  return await fetch("https://api.dynamipay.io/services/secure/checkout/view", {
    method: "POST",
    headers: { authorization: r + ":" + t, "content-type": "application/json" },
  }).then((e) => e.text());
}
!(function (e, t) {
  "function" == typeof define && define.amd ? define([], t) : (e.forge = t());
})(this, function () {
  var e, o, c, f, a, p, d, y, h, r, n, g, m, C, s;
  return (
    (p = {}),
    (d = {}),
    (y = {}),
    (h = {}),
    (r = Object.prototype.hasOwnProperty),
    (n = [].slice),
    (g = /\.js$/),
    (m = function (e, t) {
      var r,
        n,
        i = l(e),
        a = i[0];
      return (
        (e = i[1]),
        a && (r = S((a = u(a, t)))),
        a
          ? (e =
              r && r.normalize
                ? r.normalize(
                    e,
                    ((n = t),
                    function (e) {
                      return u(e, n);
                    }),
                  )
                : u(e, t))
          : ((a = (i = l((e = u(e, t))))[0]), (e = i[1]), a && (r = S(a))),
        { f: a ? a + "!" + e : e, n: e, pr: a, p: r }
      );
    }),
    (C = {
      require: function (e) {
        return E(e);
      },
      exports: function (e) {
        var t = p[e];
        return void 0 !== t ? t : (p[e] = {});
      },
      module: function (e) {
        return {
          id: e,
          uri: "",
          exports: p[e],
          config:
            ((t = e),
            function () {
              return (y && y.config && y.config[t]) || {};
            }),
        };
        var t;
      },
    }),
    (s = function (e, t, r, n) {
      var i,
        a,
        s,
        o,
        c,
        u = [],
        l = typeof r;
      if (((n = n || e), "undefined" == l || "function" == l)) {
        for (
          t = !t.length && r.length ? ["require", "exports", "module"] : t,
            o = 0;
          o < t.length;
          o += 1
        )
          if ("require" === (a = (s = m(t[o], n)).f)) u[o] = C.require(e);
          else if ("exports" === a) ((u[o] = C.exports(e)), (c = !0));
          else if ("module" === a) i = u[o] = C.module(e);
          else if (v(p, a) || v(d, a) || v(h, a)) u[o] = S(a);
          else {
            if (!s.p) throw new Error(e + " missing " + a);
            (s.p.load(
              s.n,
              E(n, !0),
              (function (t) {
                return function (e) {
                  p[t] = e;
                };
              })(a),
              {},
            ),
              (u[o] = p[a]));
          }
        ((l = r ? r.apply(p[e], u) : void 0),
          e &&
            (i && i.exports !== f && i.exports !== p[e]
              ? (p[e] = i.exports)
              : (l === f && c) || (p[e] = l)));
      } else e && (p[e] = r);
    }),
    (e =
      o =
      a =
        function (e, t, r, n, i) {
          if ("string" == typeof e) return C[e] ? C[e](t) : S(m(e, t).f);
          if (!e.splice) {
            if (((y = e).deps && a(y.deps, y.callback), !t)) return;
            t.splice ? ((e = t), (t = r), (r = null)) : (e = f);
          }
          return (
            (t = t || function () {}),
            "function" == typeof r && ((r = n), (n = i)),
            n
              ? s(f, e, t, r)
              : setTimeout(function () {
                  s(f, e, t, r);
                }, 4),
            a
          );
        }),
    (a.config = function (e) {
      return a(e);
    }),
    (e._defined = p),
    ((c = function (e, t, r) {
      (t.splice || ((r = t), (t = [])),
        v(p, e) || v(d, e) || (d[e] = [e, t, r]));
    }).amd = { jQuery: !0 }),
    c("node_modules/almond/almond", function () {}),
    (function () {
      function i(e) {
        function n(e) {
          if (((this.data = ""), (this.read = 0), "string" == typeof e))
            this.data = e;
          else if (d.isArrayBuffer(e) || d.isArrayBufferView(e)) {
            var t = new Uint8Array(e);
            try {
              this.data = String.fromCharCode.apply(null, t);
            } catch (e) {
              for (var r = 0; r < t.length; ++r) this.putByte(t[r]);
            }
          } else
            (e instanceof n ||
              ("object" == typeof e &&
                "string" == typeof e.data &&
                "number" == typeof e.read)) &&
              ((this.data = e.data), (this.read = e.read));
          this._constructedStringLength = 0;
        }
        function s(e, t, r) {
          if (!e) throw new Error("WebStorage not available.");
          if (
            void 0 !==
              (e =
                null === r
                  ? e.removeItem(t)
                  : ((r = d.encode64(JSON.stringify(r))), e.setItem(t, r))) &&
            !0 !== e.rval
          )
            throw (
              ((t = new Error(e.error.message)).id = e.error.id),
              (t.name = e.error.name),
              t
            );
        }
        function o(e, t) {
          if (!e) throw new Error("WebStorage not available.");
          if (((t = e.getItem(t)), e.init))
            if (null === t.rval) {
              if (t.error)
                throw (
                  ((e = new Error(t.error.message)).id = t.error.id),
                  (e.name = t.error.name),
                  e
                );
              t = null;
            } else t = t.rval;
          return (t = null !== t ? JSON.parse(d.decode64(t)) : t);
        }
        function a(e, t, r, n) {
          var i = o(e, t);
          (((i = null === i ? {} : i)[r] = n), s(e, t, i));
        }
        function i(e, t, r) {
          return (e = null !== (e = o(e, t)) ? (r in e ? e[r] : null) : e);
        }
        function c(e, t, r) {
          var n = o(e, t);
          if (null !== n && r in n) {
            delete n[r];
            var i,
              a = !0;
            for (i in n) {
              a = !1;
              break;
            }
            s(e, t, (n = a ? null : n));
          }
        }
        function u(e, t) {
          s(e, t, null);
        }
        function l(e, t, r) {
          var n,
            i,
            a = null,
            s = !1,
            o = null;
          for (i in (r = void 0 === r ? ["web", "flash"] : r)) {
            n = r[i];
            try {
              if ("flash" === n || "both" === n) {
                if (null === t[0])
                  throw new Error("Flash local storage not available.");
                ((a = e.apply(this, t)), (s = "flash" === n));
              }
              ("web" !== n && "both" !== n) ||
                ((t[0] = localStorage), (a = e.apply(this, t)), (s = !0));
            } catch (e) {
              o = e;
            }
            if (s) break;
          }
          if (s) return a;
          throw o;
        }
        var d = (e.util = e.util || {}),
          r =
            ("undefined" != typeof process && process.nextTick
              ? ((d.nextTick = process.nextTick),
                "function" == typeof setImmediate
                  ? (d.setImmediate = setImmediate)
                  : (d.setImmediate = d.nextTick))
              : "function" == typeof setImmediate
                ? ((d.setImmediate = setImmediate),
                  (d.nextTick = function (e) {
                    return setImmediate(e);
                  }))
                : ((d.setImmediate = function (e) {
                    setTimeout(e, 0);
                  }),
                  (d.nextTick = d.setImmediate)),
            (d.isArray =
              Array.isArray ||
              function (e) {
                return "[object Array]" === Object.prototype.toString.call(e);
              }),
            (d.isArrayBuffer = function (e) {
              return (
                "undefined" != typeof ArrayBuffer && e instanceof ArrayBuffer
              );
            }),
            []),
          f =
            ("undefined" != typeof DataView && r.push(DataView),
            "undefined" != typeof Int8Array && r.push(Int8Array),
            "undefined" != typeof Uint8Array && r.push(Uint8Array),
            "undefined" != typeof Uint8ClampedArray &&
              r.push(Uint8ClampedArray),
            "undefined" != typeof Int16Array && r.push(Int16Array),
            "undefined" != typeof Uint16Array && r.push(Uint16Array),
            "undefined" != typeof Int32Array && r.push(Int32Array),
            "undefined" != typeof Uint32Array && r.push(Uint32Array),
            "undefined" != typeof Float32Array && r.push(Float32Array),
            "undefined" != typeof Float64Array && r.push(Float64Array),
            (d.isArrayBufferView = function (e) {
              for (var t = 0; t < r.length; ++t)
                if (e instanceof r[t]) return !0;
              return !1;
            }),
            (d.ByteBuffer = n),
            (d.ByteStringBuffer = n),
            (d.ByteStringBuffer.prototype._optimizeConstructedString =
              function (e) {
                ((this._constructedStringLength += e),
                  4096 < this._constructedStringLength &&
                    (this.data.substr(0, 1),
                    (this._constructedStringLength = 0)));
              }),
            (d.ByteStringBuffer.prototype.length = function () {
              return this.data.length - this.read;
            }),
            (d.ByteStringBuffer.prototype.isEmpty = function () {
              return this.length() <= 0;
            }),
            (d.ByteStringBuffer.prototype.putByte = function (e) {
              return this.putBytes(String.fromCharCode(e));
            }),
            (d.ByteStringBuffer.prototype.fillWithByte = function (e, t) {
              e = String.fromCharCode(e);
              for (var r = this.data; 0 < t;)
                (1 & t && (r += e), 0 < (t >>>= 1) && (e += e));
              return (
                (this.data = r),
                this._optimizeConstructedString(t),
                this
              );
            }),
            (d.ByteStringBuffer.prototype.putBytes = function (e) {
              return (
                (this.data += e),
                this._optimizeConstructedString(e.length),
                this
              );
            }),
            (d.ByteStringBuffer.prototype.putString = function (e) {
              return this.putBytes(d.encodeUtf8(e));
            }),
            (d.ByteStringBuffer.prototype.putInt16 = function (e) {
              return this.putBytes(
                String.fromCharCode((e >> 8) & 255) +
                  String.fromCharCode(255 & e),
              );
            }),
            (d.ByteStringBuffer.prototype.putInt24 = function (e) {
              return this.putBytes(
                String.fromCharCode((e >> 16) & 255) +
                  String.fromCharCode((e >> 8) & 255) +
                  String.fromCharCode(255 & e),
              );
            }),
            (d.ByteStringBuffer.prototype.putInt32 = function (e) {
              return this.putBytes(
                String.fromCharCode((e >> 24) & 255) +
                  String.fromCharCode((e >> 16) & 255) +
                  String.fromCharCode((e >> 8) & 255) +
                  String.fromCharCode(255 & e),
              );
            }),
            (d.ByteStringBuffer.prototype.putInt16Le = function (e) {
              return this.putBytes(
                String.fromCharCode(255 & e) +
                  String.fromCharCode((e >> 8) & 255),
              );
            }),
            (d.ByteStringBuffer.prototype.putInt24Le = function (e) {
              return this.putBytes(
                String.fromCharCode(255 & e) +
                  String.fromCharCode((e >> 8) & 255) +
                  String.fromCharCode((e >> 16) & 255),
              );
            }),
            (d.ByteStringBuffer.prototype.putInt32Le = function (e) {
              return this.putBytes(
                String.fromCharCode(255 & e) +
                  String.fromCharCode((e >> 8) & 255) +
                  String.fromCharCode((e >> 16) & 255) +
                  String.fromCharCode((e >> 24) & 255),
              );
            }),
            (d.ByteStringBuffer.prototype.putInt = function (e, t) {
              for (
                var r = "";
                (t -= 8), (r += String.fromCharCode((e >> t) & 255)), 0 < t;
              );
              return this.putBytes(r);
            }),
            (d.ByteStringBuffer.prototype.putSignedInt = function (e, t) {
              return (e < 0 && (e += 2 << (t - 1)), this.putInt(e, t));
            }),
            (d.ByteStringBuffer.prototype.putBuffer = function (e) {
              return this.putBytes(e.getBytes());
            }),
            (d.ByteStringBuffer.prototype.getByte = function () {
              return this.data.charCodeAt(this.read++);
            }),
            (d.ByteStringBuffer.prototype.getInt16 = function () {
              var e =
                (this.data.charCodeAt(this.read) << 8) ^
                this.data.charCodeAt(this.read + 1);
              return ((this.read += 2), e);
            }),
            (d.ByteStringBuffer.prototype.getInt24 = function () {
              var e =
                (this.data.charCodeAt(this.read) << 16) ^
                (this.data.charCodeAt(this.read + 1) << 8) ^
                this.data.charCodeAt(this.read + 2);
              return ((this.read += 3), e);
            }),
            (d.ByteStringBuffer.prototype.getInt32 = function () {
              var e =
                (this.data.charCodeAt(this.read) << 24) ^
                (this.data.charCodeAt(this.read + 1) << 16) ^
                (this.data.charCodeAt(this.read + 2) << 8) ^
                this.data.charCodeAt(this.read + 3);
              return ((this.read += 4), e);
            }),
            (d.ByteStringBuffer.prototype.getInt16Le = function () {
              var e =
                this.data.charCodeAt(this.read) ^
                (this.data.charCodeAt(this.read + 1) << 8);
              return ((this.read += 2), e);
            }),
            (d.ByteStringBuffer.prototype.getInt24Le = function () {
              var e =
                this.data.charCodeAt(this.read) ^
                (this.data.charCodeAt(this.read + 1) << 8) ^
                (this.data.charCodeAt(this.read + 2) << 16);
              return ((this.read += 3), e);
            }),
            (d.ByteStringBuffer.prototype.getInt32Le = function () {
              var e =
                this.data.charCodeAt(this.read) ^
                (this.data.charCodeAt(this.read + 1) << 8) ^
                (this.data.charCodeAt(this.read + 2) << 16) ^
                (this.data.charCodeAt(this.read + 3) << 24);
              return ((this.read += 4), e);
            }),
            (d.ByteStringBuffer.prototype.getInt = function (e) {
              for (
                var t = 0;
                (t = (t << 8) + this.data.charCodeAt(this.read++)),
                  0 < (e -= 8);
              );
              return t;
            }),
            (d.ByteStringBuffer.prototype.getSignedInt = function (e) {
              var t = this.getInt(e),
                e = 2 << (e - 2);
              return (e <= t && (t -= e << 1), t);
            }),
            (d.ByteStringBuffer.prototype.getBytes = function (e) {
              var t;
              return (
                e
                  ? ((e = Math.min(this.length(), e)),
                    (t = this.data.slice(this.read, this.read + e)),
                    (this.read += e))
                  : 0 === e
                    ? (t = "")
                    : ((t =
                        0 === this.read
                          ? this.data
                          : this.data.slice(this.read)),
                      this.clear()),
                t
              );
            }),
            (d.ByteStringBuffer.prototype.bytes = function (e) {
              return void 0 === e
                ? this.data.slice(this.read)
                : this.data.slice(this.read, this.read + e);
            }),
            (d.ByteStringBuffer.prototype.at = function (e) {
              return this.data.charCodeAt(this.read + e);
            }),
            (d.ByteStringBuffer.prototype.setAt = function (e, t) {
              return (
                (this.data =
                  this.data.substr(0, this.read + e) +
                  String.fromCharCode(t) +
                  this.data.substr(this.read + e + 1)),
                this
              );
            }),
            (d.ByteStringBuffer.prototype.last = function () {
              return this.data.charCodeAt(this.data.length - 1);
            }),
            (d.ByteStringBuffer.prototype.copy = function () {
              var e = d.createBuffer(this.data);
              return ((e.read = this.read), e);
            }),
            (d.ByteStringBuffer.prototype.compact = function () {
              return (
                0 < this.read &&
                  ((this.data = this.data.slice(this.read)), (this.read = 0)),
                this
              );
            }),
            (d.ByteStringBuffer.prototype.clear = function () {
              return ((this.data = ""), (this.read = 0), this);
            }),
            (d.ByteStringBuffer.prototype.truncate = function (e) {
              e = Math.max(0, this.length() - e);
              return (
                (this.data = this.data.substr(this.read, e)),
                (this.read = 0),
                this
              );
            }),
            (d.ByteStringBuffer.prototype.toHex = function () {
              for (var e = "", t = this.read; t < this.data.length; ++t) {
                var r = this.data.charCodeAt(t);
                (r < 16 && (e += "0"), (e += r.toString(16)));
              }
              return e;
            }),
            (d.ByteStringBuffer.prototype.toString = function () {
              return d.decodeUtf8(this.bytes());
            }),
            (d.DataBuffer = function (e, t) {
              ((this.read = (t = t || {}).readOffset || 0),
                (this.growSize = t.growSize || 1024));
              var r = d.isArrayBuffer(e),
                n = d.isArrayBufferView(e);
              r || n
                ? ((this.data = r
                    ? new DataView(e)
                    : new DataView(e.buffer, e.byteOffset, e.byteLength)),
                  (this.write =
                    "writeOffset" in t ? t.writeOffset : this.data.byteLength))
                : ((this.data = new DataView(new ArrayBuffer(0))),
                  (this.write = 0),
                  null != e && this.putBytes(e),
                  "writeOffset" in t && (this.write = t.writeOffset));
            }),
            (d.DataBuffer.prototype.length = function () {
              return this.write - this.read;
            }),
            (d.DataBuffer.prototype.isEmpty = function () {
              return this.length() <= 0;
            }),
            (d.DataBuffer.prototype.accommodate = function (e, t) {
              return (
                this.length() >= e ||
                  ((t = Math.max(t || this.growSize, e)),
                  (e = new Uint8Array(
                    this.data.buffer,
                    this.data.byteOffset,
                    this.data.byteLength,
                  )),
                  (t = new Uint8Array(this.length() + t)).set(e),
                  (this.data = new DataView(t.buffer))),
                this
              );
            }),
            (d.DataBuffer.prototype.putByte = function (e) {
              return (
                this.accommodate(1),
                this.data.setUint8(this.write++, e),
                this
              );
            }),
            (d.DataBuffer.prototype.fillWithByte = function (e, t) {
              this.accommodate(t);
              for (var r = 0; r < t; ++r) this.data.setUint8(e);
              return this;
            }),
            (d.DataBuffer.prototype.putBytes = function (e, t) {
              var r, n, i;
              if (d.isArrayBufferView(e))
                return (
                  (r =
                    (n = new Uint8Array(e.buffer, e.byteOffset, e.byteLength))
                      .byteLength - n.byteOffset),
                  this.accommodate(r),
                  new Uint8Array(this.data.buffer, this.write).set(n),
                  (this.write += r),
                  this
                );
              if (d.isArrayBuffer(e))
                return (
                  (n = new Uint8Array(e)),
                  this.accommodate(n.byteLength),
                  new Uint8Array(this.data.buffer).set(n, this.write),
                  (this.write += n.byteLength),
                  this
                );
              if (
                e instanceof d.DataBuffer ||
                ("object" == typeof e &&
                  "number" == typeof e.read &&
                  "number" == typeof e.write &&
                  d.isArrayBufferView(e.data))
              )
                return (
                  (n = new Uint8Array(e.data.byteLength, e.read, e.length())),
                  this.accommodate(n.byteLength),
                  new Uint8Array(e.data.byteLength, this.write).set(n),
                  (this.write += n.byteLength),
                  this
                );
              if (
                (e instanceof d.ByteStringBuffer &&
                  ((e = e.data), (t = "binary")),
                (t = t || "binary"),
                "string" != typeof e)
              )
                throw Error("Invalid parameter: " + e);
              if ("hex" === t)
                return (
                  this.accommodate(Math.ceil(e.length / 2)),
                  (i = new Uint8Array(this.data.buffer, this.write)),
                  (this.write += d.binary.hex.decode(e, i, this.write)),
                  this
                );
              if ("base64" === t)
                return (
                  this.accommodate(3 * Math.ceil(e.length / 4)),
                  (i = new Uint8Array(this.data.buffer, this.write)),
                  (this.write += d.binary.base64.decode(e, i, this.write)),
                  this
                );
              if (
                ("utf8" === t && ((e = d.encodeUtf8(e)), (t = "binary")),
                "binary" === t || "raw" === t)
              )
                return (
                  this.accommodate(e.length),
                  (i = new Uint8Array(this.data.buffer, this.write)),
                  (this.write += d.binary.raw.decode(i)),
                  this
                );
              if ("utf16" === t)
                return (
                  this.accommodate(2 * e.length),
                  (i = new Uint16Array(this.data.buffer, this.write)),
                  (this.write += d.text.utf16.encode(i)),
                  this
                );
              throw new Error("Invalid encoding: " + t);
            }),
            (d.DataBuffer.prototype.putBuffer = function (e) {
              return (this.putBytes(e), e.clear(), this);
            }),
            (d.DataBuffer.prototype.putString = function (e) {
              return this.putBytes(e, "utf16");
            }),
            (d.DataBuffer.prototype.putInt16 = function (e) {
              return (
                this.accommodate(2),
                this.data.setInt16(this.write, e),
                (this.write += 2),
                this
              );
            }),
            (d.DataBuffer.prototype.putInt24 = function (e) {
              return (
                this.accommodate(3),
                this.data.setInt16(this.write, (e >> 8) & 65535),
                this.data.setInt8(this.write, (e >> 16) & 255),
                (this.write += 3),
                this
              );
            }),
            (d.DataBuffer.prototype.putInt32 = function (e) {
              return (
                this.accommodate(4),
                this.data.setInt32(this.write, e),
                (this.write += 4),
                this
              );
            }),
            (d.DataBuffer.prototype.putInt16Le = function (e) {
              return (
                this.accommodate(2),
                this.data.setInt16(this.write, e, !0),
                (this.write += 2),
                this
              );
            }),
            (d.DataBuffer.prototype.putInt24Le = function (e) {
              return (
                this.accommodate(3),
                this.data.setInt8(this.write, (e >> 16) & 255),
                this.data.setInt16(this.write, (e >> 8) & 65535, !0),
                (this.write += 3),
                this
              );
            }),
            (d.DataBuffer.prototype.putInt32Le = function (e) {
              return (
                this.accommodate(4),
                this.data.setInt32(this.write, e, !0),
                (this.write += 4),
                this
              );
            }),
            (d.DataBuffer.prototype.putInt = function (e, t) {
              for (
                this.accommodate(t / 8);
                (t -= 8),
                  this.data.setInt8(this.write++, (e >> t) & 255),
                  0 < t;
              );
              return this;
            }),
            (d.DataBuffer.prototype.putSignedInt = function (e, t) {
              return (
                this.accommodate(t / 8),
                e < 0 && (e += 2 << (t - 1)),
                this.putInt(e, t)
              );
            }),
            (d.DataBuffer.prototype.getByte = function () {
              return this.data.getInt8(this.read++);
            }),
            (d.DataBuffer.prototype.getInt16 = function () {
              var e = this.data.getInt16(this.read);
              return ((this.read += 2), e);
            }),
            (d.DataBuffer.prototype.getInt24 = function () {
              var e =
                (this.data.getInt16(this.read) << 8) ^
                this.data.getInt8(this.read + 2);
              return ((this.read += 3), e);
            }),
            (d.DataBuffer.prototype.getInt32 = function () {
              var e = this.data.getInt32(this.read);
              return ((this.read += 4), e);
            }),
            (d.DataBuffer.prototype.getInt16Le = function () {
              var e = this.data.getInt16(this.read, !0);
              return ((this.read += 2), e);
            }),
            (d.DataBuffer.prototype.getInt24Le = function () {
              var e =
                this.data.getInt8(this.read) ^
                (this.data.getInt16(this.read + 1, !0) << 8);
              return ((this.read += 3), e);
            }),
            (d.DataBuffer.prototype.getInt32Le = function () {
              var e = this.data.getInt32(this.read, !0);
              return ((this.read += 4), e);
            }),
            (d.DataBuffer.prototype.getInt = function (e) {
              for (
                var t = 0;
                (t = (t << 8) + this.data.getInt8(this.read++)), 0 < (e -= 8);
              );
              return t;
            }),
            (d.DataBuffer.prototype.getSignedInt = function (e) {
              var t = this.getInt(e),
                e = 2 << (e - 2);
              return (e <= t && (t -= e << 1), t);
            }),
            (d.DataBuffer.prototype.getBytes = function (e) {
              var t;
              return (
                e
                  ? ((e = Math.min(this.length(), e)),
                    (t = this.data.slice(this.read, this.read + e)),
                    (this.read += e))
                  : 0 === e
                    ? (t = "")
                    : ((t =
                        0 === this.read
                          ? this.data
                          : this.data.slice(this.read)),
                      this.clear()),
                t
              );
            }),
            (d.DataBuffer.prototype.bytes = function (e) {
              return void 0 === e
                ? this.data.slice(this.read)
                : this.data.slice(this.read, this.read + e);
            }),
            (d.DataBuffer.prototype.at = function (e) {
              return this.data.getUint8(this.read + e);
            }),
            (d.DataBuffer.prototype.setAt = function (e, t) {
              return (this.data.setUint8(e, t), this);
            }),
            (d.DataBuffer.prototype.last = function () {
              return this.data.getUint8(this.write - 1);
            }),
            (d.DataBuffer.prototype.copy = function () {
              return new d.DataBuffer(this);
            }),
            (d.DataBuffer.prototype.compact = function () {
              var e, t;
              return (
                0 < this.read &&
                  ((e = new Uint8Array(this.data.buffer, this.read)),
                  (t = new Uint8Array(e.byteLength)).set(e),
                  (this.data = new DataView(t)),
                  (this.write -= this.read),
                  (this.read = 0)),
                this
              );
            }),
            (d.DataBuffer.prototype.clear = function () {
              return (
                (this.data = new DataView(new ArrayBuffer(0))),
                (this.read = this.write = 0),
                this
              );
            }),
            (d.DataBuffer.prototype.truncate = function (e) {
              return (
                (this.write = Math.max(0, this.length() - e)),
                (this.read = Math.min(this.read, this.write)),
                this
              );
            }),
            (d.DataBuffer.prototype.toHex = function () {
              for (var e = "", t = this.read; t < this.data.byteLength; ++t) {
                var r = this.data.getUint8(t);
                (r < 16 && (e += "0"), (e += r.toString(16)));
              }
              return e;
            }),
            (d.DataBuffer.prototype.toString = function (e) {
              var t = new Uint8Array(this.data, this.read, this.length());
              if ("binary" === (e = e || "utf8") || "raw" === e)
                return d.binary.raw.encode(t);
              if ("hex" === e) return d.binary.hex.encode(t);
              if ("base64" === e) return d.binary.base64.encode(t);
              if ("utf8" === e) return d.text.utf8.decode(t);
              if ("utf16" === e) return d.text.utf16.decode(t);
              throw new Error("Invalid encoding: " + e);
            }),
            (d.createBuffer = function (e, t) {
              return (
                (t = t || "raw"),
                void 0 !== e && "utf8" === t && (e = d.encodeUtf8(e)),
                new d.ByteBuffer(e)
              );
            }),
            (d.fillString = function (e, t) {
              for (var r = ""; 0 < t;)
                (1 & t && (r += e), 0 < (t >>>= 1) && (e += e));
              return r;
            }),
            (d.xorBytes = function (e, t, r) {
              for (var n, i = "", a = "", s = 0, o = 0; 0 < r; --r, ++s)
                ((n = e.charCodeAt(s) ^ t.charCodeAt(s)),
                  10 <= o && ((i += a), (a = ""), (o = 0)),
                  (a += String.fromCharCode(n)),
                  ++o);
              return (i += a);
            }),
            (d.hexToBytes = function (e) {
              var t = "",
                r = 0;
              for (
                !0 & e.length &&
                ((r = 1), (t += String.fromCharCode(parseInt(e[0], 16))));
                r < e.length;
                r += 2
              )
                t += String.fromCharCode(parseInt(e.substr(r, 2), 16));
              return t;
            }),
            (d.bytesToHex = function (e) {
              return d.createBuffer(e).toHex();
            }),
            (d.int32ToBytes = function (e) {
              return (
                String.fromCharCode((e >> 24) & 255) +
                String.fromCharCode((e >> 16) & 255) +
                String.fromCharCode((e >> 8) & 255) +
                String.fromCharCode(255 & e)
              );
            }),
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/="),
          p = [
            62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1,
            -1, 64, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
            14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1,
            -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41,
            42, 43, 44, 45, 46, 47, 48, 49, 50, 51,
          ],
          h =
            ((d.encode64 = function (e, t) {
              for (var r, n, i, a = "", s = "", o = 0; o < e.length;)
                ((r = e.charCodeAt(o++)),
                  (n = e.charCodeAt(o++)),
                  (i = e.charCodeAt(o++)),
                  (a =
                    (a += f.charAt(r >> 2)) +
                    f.charAt(((3 & r) << 4) | (n >> 4))),
                  isNaN(n)
                    ? (a += "==")
                    : (a =
                        (a += f.charAt(((15 & n) << 2) | (i >> 6))) +
                        (isNaN(i) ? "=" : f.charAt(63 & i))),
                  t &&
                    a.length > t &&
                    ((s += a.substr(0, t) + "\r\n"), (a = a.substr(t))));
              return (s += a);
            }),
            (d.decode64 = function (e) {
              e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
              for (var t, r, n, i, a = "", s = 0; s < e.length;)
                ((t = p[e.charCodeAt(s++) - 43]),
                  (r = p[e.charCodeAt(s++) - 43]),
                  (n = p[e.charCodeAt(s++) - 43]),
                  (i = p[e.charCodeAt(s++) - 43]),
                  (a += String.fromCharCode((t << 2) | (r >> 4))),
                  64 !== n &&
                    ((a += String.fromCharCode(((15 & r) << 4) | (n >> 2))),
                    64 !== i) &&
                    (a += String.fromCharCode(((3 & n) << 6) | i)));
              return a;
            }),
            (d.encodeUtf8 = function (e) {
              return unescape(encodeURIComponent(e));
            }),
            (d.decodeUtf8 = function (e) {
              return decodeURIComponent(escape(e));
            }),
            (d.binary = { raw: {}, hex: {}, base64: {} }),
            (d.binary.raw.encode = function (e) {
              return String.fromCharCode.apply(null, e);
            }),
            (d.binary.raw.decode = function (e, t, r) {
              for (
                var n = (n = t) || new Uint8Array(e.length),
                  i = (r = r || 0),
                  a = 0;
                a < e.length;
                ++a
              )
                n[i++] = e.charCodeAt(a);
              return t ? i - r : n;
            }),
            (d.binary.hex.encode = d.bytesToHex),
            (d.binary.hex.decode = function (e, t, r) {
              var n = (n = t) || new Uint8Array(Math.ceil(e.length / 2)),
                i = 0,
                a = (r = r || 0);
              for (
                1 & e.length && ((i = 1), (n[a++] = parseInt(e[0], 16)));
                i < e.length;
                i += 2
              )
                n[a++] = parseInt(e.substr(i, 2), 16);
              return t ? a - r : n;
            }),
            (d.binary.base64.encode = function (e, t) {
              for (var r, n, i, a = "", s = "", o = 0; o < e.byteLength;)
                ((r = e[o++]),
                  (n = e[o++]),
                  (i = e[o++]),
                  (a =
                    (a += f.charAt(r >> 2)) +
                    f.charAt(((3 & r) << 4) | (n >> 4))),
                  isNaN(n)
                    ? (a += "==")
                    : (a =
                        (a += f.charAt(((15 & n) << 2) | (i >> 6))) +
                        (isNaN(i) ? "=" : f.charAt(63 & i))),
                  t &&
                    a.length > t &&
                    ((s += a.substr(0, t) + "\r\n"), (a = a.substr(t))));
              return (s += a);
            }),
            (d.binary.base64.decode = function (e, t, r) {
              var n = (n = t) || new Uint8Array(3 * Math.ceil(e.length / 4));
              e = e.replace(/[^A-Za-z0-9\+\/\=]/g, "");
              for (var i, a, s, o, c = 0, u = (r = r || 0); c < e.length;)
                ((i = p[e.charCodeAt(c++) - 43]),
                  (a = p[e.charCodeAt(c++) - 43]),
                  (s = p[e.charCodeAt(c++) - 43]),
                  (o = p[e.charCodeAt(c++) - 43]),
                  (n[u++] = (i << 2) | (a >> 4)),
                  64 !== s &&
                    ((n[u++] = ((15 & a) << 4) | (s >> 2)), 64 !== o) &&
                    (n[u++] = ((3 & s) << 6) | o));
              return t ? u - r : n.subarray(0, u);
            }),
            (d.text = { utf8: {}, utf16: {} }),
            (d.text.utf8.encode = function (e, t, r) {
              e = d.encodeUtf8(e);
              for (
                var n = (n = t) || new Uint8Array(e.length),
                  i = (r = r || 0),
                  a = 0;
                a < e.length;
                ++a
              )
                n[i++] = e.charCodeAt(a);
              return t ? i - r : n;
            }),
            (d.text.utf8.decode = function (e) {
              return d.decodeUtf8(String.fromCharCode.apply(null, e));
            }),
            (d.text.utf16.encode = function (e, t, r) {
              for (
                var n = (n = t) || new Uint8Array(e.length),
                  i = new Uint16Array(n),
                  a = (r = r || 0),
                  s = r,
                  o = 0;
                o < e.length;
                ++o
              )
                ((i[s++] = e.charCodeAt(o)), (a += 2));
              return t ? a - r : n;
            }),
            (d.text.utf16.decode = function (e) {
              return String.fromCharCode.apply(null, new Uint16Array(e));
            }),
            (d.deflate = function (e, t, r) {
              return (
                (t = d.decode64(e.deflate(d.encode64(t)).rval)),
                r &&
                  ((e = 2),
                  (r = t.charCodeAt(1)),
                  (t = t.substring((e = 32 & r ? 6 : e), t.length - 4))),
                t
              );
            }),
            (d.inflate = function (e, t, r) {
              e = e.inflate(d.encode64(t)).rval;
              return null === e ? null : d.decode64(e);
            }),
            (d.setItem = function (e, t, r, n, i) {
              l(a, arguments, i);
            }),
            (d.getItem = function (e, t, r, n) {
              return l(i, arguments, n);
            }),
            (d.removeItem = function (e, t, r, n) {
              l(c, arguments, n);
            }),
            (d.clearItems = function (e, t, r) {
              l(u, arguments, r);
            }),
            (d.parseUrl = function (e) {
              var t = /^(https?):\/\/([^:&^\/]*):?(\d*)(.*)$/g,
                t = ((t.lastIndex = 0), t.exec(e)),
                e =
                  null === t
                    ? null
                    : {
                        full: e,
                        scheme: t[1],
                        host: t[2],
                        port: t[3],
                        path: t[4],
                      };
              return (
                e &&
                  ((e.fullHost = e.host),
                  e.port
                    ? ((80 !== e.port && "http" === e.scheme) ||
                        (443 !== e.port && "https" === e.scheme)) &&
                      (e.fullHost += ":" + e.port)
                    : "http" === e.scheme
                      ? (e.port = 80)
                      : "https" === e.scheme && (e.port = 443),
                  (e.full = e.scheme + "://" + e.fullHost)),
                e
              );
            }),
            null);
        ((d.getQueryVariables = function (e) {
          function t(e) {
            for (var t = {}, r = e.split("&"), n = 0; n < r.length; n++) {
              var i,
                a = r[n].indexOf("="),
                a =
                  0 < a
                    ? ((i = r[n].substring(0, a)), r[n].substring(a + 1))
                    : ((i = r[n]), null);
              (i in t || (t[i] = []),
                i in Object.prototype || null === a || t[i].push(unescape(a)));
            }
            return t;
          }
          e =
            void 0 === e
              ? (h =
                  null === h
                    ? "undefined" == typeof window
                      ? {}
                      : t(window.location.search.substring(1))
                    : h)
              : t(e);
          return e;
        }),
          (d.parseFragment = function (e) {
            var t = e,
              r = "",
              n = e.indexOf("?"),
              e =
                (0 < n && ((t = e.substring(0, n)), (r = e.substring(n + 1))),
                t.split("/")),
              n =
                (0 < e.length && "" === e[0] && e.shift(),
                "" === r ? {} : d.getQueryVariables(r));
            return { pathString: t, queryString: r, path: e, query: n };
          }),
          (d.makeRequest = function (e) {
            var n = d.parseFragment(e),
              r = {
                path: n.pathString,
                query: n.queryString,
                getPath: function (e) {
                  return void 0 === e ? n.path : n.path[e];
                },
                getQuery: function (e, t) {
                  var r;
                  return (
                    void 0 === e
                      ? (r = n.query)
                      : (r = n.query[e]) && void 0 !== t && (r = r[t]),
                    r
                  );
                },
                getQueryLast: function (e, t) {
                  ((e = r.getQuery(e)), (e = e ? e[e.length - 1] : t));
                  return e;
                },
              };
            return r;
          }),
          (d.makeLink = function (e, t, r) {
            e = jQuery.isArray(e) ? e.join("/") : e;
            t = jQuery.param(t || {});
            return (
              e +
              (0 < t.length ? "?" + t : "") +
              (0 < (r = r || "").length ? "#" + r : "")
            );
          }),
          (d.setPath = function (e, t, r) {
            if ("object" == typeof e && null !== e)
              for (var n = 0, i = t.length; n < i;) {
                var a,
                  s = t[n++];
                n == i
                  ? (e[s] = r)
                  : ((!(a = s in e) ||
                      "object" != typeof e[s] ||
                      (a && null === e[s])) &&
                      (e[s] = {}),
                    (e = e[s]));
              }
          }),
          (d.getPath = function (e, t, r) {
            for (
              var n = 0, i = t.length, a = !0;
              a && n < i && "object" == typeof e && null !== e;
            ) {
              var s = t[n++];
              (a = s in e) && (e = e[s]);
            }
            return a ? e : r;
          }),
          (d.deletePath = function (e, t) {
            if ("object" == typeof e && null !== e)
              for (var r = 0, n = t.length; r < n;) {
                var i = t[r++];
                if (r == n) delete e[i];
                else {
                  if (!(i in e && "object" == typeof e[i] && null !== e[i]))
                    break;
                  e = e[i];
                }
              }
          }),
          (d.isEmpty = function (e) {
            for (var t in e) if (e.hasOwnProperty(t)) return !1;
            return !0;
          }),
          (d.format = function (e) {
            for (var t, r, n = /%./g, i = 0, a = [], s = 0; (t = n.exec(e));) {
              0 < (r = e.substring(s, n.lastIndex - 2)).length && a.push(r);
              var s = n.lastIndex,
                o = t[0][1];
              switch (o) {
                case "s":
                case "o":
                  a.push(i < arguments.length ? arguments[1 + i++] : "<?>");
                  break;
                case "%":
                  a.push("%");
                  break;
                default:
                  a.push("<%" + o + "?>");
              }
            }
            return (a.push(e.substring(s)), a.join(""));
          }),
          (d.formatNumber = function (e, t, r, n) {
            var t = isNaN((t = Math.abs(t))) ? 2 : t,
              r = void 0 === r ? "," : r,
              n = void 0 === n ? "." : n,
              i = e < 0 ? "-" : "",
              a = parseInt((e = Math.abs(+e || 0).toFixed(t)), 10) + "",
              s = 3 < a.length ? a.length % 3 : 0;
            return (
              i +
              (s ? a.substr(0, s) + n : "") +
              a.substr(s).replace(/(\d{3})(?=\d)/g, "$1" + n) +
              (t
                ? r +
                  Math.abs(e - a)
                    .toFixed(t)
                    .slice(2)
                : "")
            );
          }),
          (d.formatSize = function (e) {
            return (e =
              1073741824 <= e
                ? d.formatNumber(e / 1073741824, 2, ".", "") + " GiB"
                : 1048576 <= e
                  ? d.formatNumber(e / 1048576, 2, ".", "") + " MiB"
                  : 1024 <= e
                    ? d.formatNumber(e / 1024, 0) + " KiB"
                    : d.formatNumber(e, 0) + " bytes");
          }),
          (d.bytesFromIP = function (e) {
            return -1 !== e.indexOf(".")
              ? d.bytesFromIPv4(e)
              : -1 !== e.indexOf(":")
                ? d.bytesFromIPv6(e)
                : null;
          }),
          (d.bytesFromIPv4 = function (e) {
            if (4 !== (e = e.split(".")).length) return null;
            for (var t = d.createBuffer(), r = 0; r < e.length; ++r) {
              var n = parseInt(e[r], 10);
              if (isNaN(n)) return null;
              t.putByte(n);
            }
            return t.getBytes();
          }),
          (d.bytesFromIPv6 = function (e) {
            for (
              var t,
                r = 0,
                n =
                  2 *
                  (8 -
                    (e = e.split(":").filter(function (e) {
                      return (0 === e.length && ++r, !0);
                    })).length +
                    r),
                i = d.createBuffer(),
                a = 0;
              a < 8;
              ++a
            )
              e[a] && 0 !== e[a].length
                ? ((t = d.hexToBytes(e[a])).length < 2 && i.putByte(0),
                  i.putBytes(t))
                : (i.fillWithByte(0, n), (n = 0));
            return i.getBytes();
          }),
          (d.bytesToIP = function (e) {
            return 4 === e.length
              ? d.bytesToIPv4(e)
              : 16 === e.length
                ? d.bytesToIPv6(e)
                : null;
          }),
          (d.bytesToIPv4 = function (e) {
            if (4 !== e.length) return null;
            for (var t = [], r = 0; r < e.length; ++r) t.push(e.charCodeAt(r));
            return t.join(".");
          }),
          (d.bytesToIPv6 = function (e) {
            if (16 !== e.length) return null;
            for (var t, r = [], n = [], i = 0, a = 0; a < e.length; a += 2) {
              for (
                var s, o, c = d.bytesToHex(e[a] + e[a + 1]);
                "0" === c[0] && "0" !== c;
              )
                c = c.substr(1);
              ("0" === c &&
                ((s = n[n.length - 1]),
                (o = r.length),
                s && o === s.end + 1
                  ? ((s.end = o),
                    s.end - s.start > n[i].end - n[i].start &&
                      (i = n.length - 1))
                  : n.push({ start: o, end: o })),
                r.push(c));
            }
            return (
              0 < n.length &&
                0 < (t = n[i]).end - t.start &&
                (r.splice(t.start, t.end - t.start + 1, ""),
                0 === t.start && r.unshift(""),
                7 === t.end) &&
                r.push(""),
              r.join(":")
            );
          }),
          (d.estimateCores = function (e, f) {
            var p;
            return (
              "function" == typeof e && ((f = e), (e = {})),
              (e = e || {}),
              "cores" in d && !e.update
                ? f(null, d.cores)
                : "undefined" != typeof navigator &&
                    "hardwareConcurrency" in navigator &&
                    0 < navigator.hardwareConcurrency
                  ? ((d.cores = navigator.hardwareConcurrency),
                    f(null, d.cores))
                  : "undefined" == typeof Worker
                    ? ((d.cores = 1), f(null, d.cores))
                    : "undefined" == typeof Blob
                      ? ((d.cores = 2), f(null, d.cores))
                      : ((p = URL.createObjectURL(
                          new Blob(
                            [
                              "(",
                              function () {
                                self.addEventListener("message", function (e) {
                                  for (
                                    var t = Date.now(), r = t + 4;
                                    Date.now() < r;
                                  );
                                  self.postMessage({ st: t, et: r });
                                });
                              }.toString(),
                              ")()",
                            ],
                            { type: "application/javascript" },
                          ),
                        )),
                        void (function r(n, i, a) {
                          var e;
                          if (0 === i)
                            return (
                              (e = Math.floor(
                                n.reduce(function (e, t) {
                                  return e + t;
                                }, 0) / n.length,
                              )),
                              (d.cores = Math.max(1, e)),
                              URL.revokeObjectURL(p),
                              f(null, d.cores)
                            );
                          for (
                            var s = a,
                              o = function (e, t) {
                                (n.push(
                                  (function (e, t) {
                                    for (var r = [], n = 0; n < e; ++n)
                                      for (
                                        var i, a = t[n], s = (r[n] = []), o = 0;
                                        o < e;
                                        ++o
                                      )
                                        n !== o &&
                                          ((i = t[o]),
                                          (a.st > i.st && a.st < i.et) ||
                                            (i.st > a.st && i.st < a.et)) &&
                                          s.push(o);
                                    return r.reduce(function (e, t) {
                                      return Math.max(e, t.length);
                                    }, 0);
                                  })(a, t),
                                ),
                                  r(n, i - 1, a));
                              },
                              c = [],
                              u = [],
                              t = 0;
                            t < s;
                            ++t
                          ) {
                            var l = new Worker(p);
                            (l.addEventListener("message", function (e) {
                              if ((u.push(e.data), u.length === s)) {
                                for (var t = 0; t < s; ++t) c[t].terminate();
                                o(null, u);
                              }
                            }),
                              c.push(l));
                          }
                          for (t = 0; t < s; ++t) c[t].postMessage(t);
                        })([], 5, 16))
            );
          }));
      }
      var a = "util";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/util", ["require", "module"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(n) {
        ((n.cipher = n.cipher || {}),
          (n.cipher.algorithms = n.cipher.algorithms || {}),
          (n.cipher.createCipher = function (e, t) {
            var r = e;
            if (
              (r =
                "string" == typeof r
                  ? (r = n.cipher.getAlgorithm(r)) && r()
                  : r)
            )
              return new n.cipher.BlockCipher({
                algorithm: r,
                key: t,
                decrypt: !1,
              });
            throw new Error("Unsupported algorithm: " + e);
          }),
          (n.cipher.createDecipher = function (e, t) {
            var r = e;
            if (
              (r =
                "string" == typeof r
                  ? (r = n.cipher.getAlgorithm(r)) && r()
                  : r)
            )
              return new n.cipher.BlockCipher({
                algorithm: r,
                key: t,
                decrypt: !0,
              });
            throw new Error("Unsupported algorithm: " + e);
          }),
          (n.cipher.registerAlgorithm = function (e, t) {
            ((e = e.toUpperCase()), (n.cipher.algorithms[e] = t));
          }),
          (n.cipher.getAlgorithm = function (e) {
            return (e = e.toUpperCase()) in n.cipher.algorithms
              ? n.cipher.algorithms[e]
              : null;
          }));
        var e = (n.cipher.BlockCipher = function (e) {
          ((this.algorithm = e.algorithm),
            (this.mode = this.algorithm.mode),
            (this.blockSize = this.mode.blockSize),
            (this._finish = !1),
            (this._input = null),
            (this.output = null),
            (this._op = e.decrypt ? this.mode.decrypt : this.mode.encrypt),
            (this._decrypt = e.decrypt),
            this.algorithm.initialize(e));
        });
        ((e.prototype.start = function (e) {
          var t,
            r = {};
          for (t in (e = e || {})) r[t] = e[t];
          ((r.decrypt = this._decrypt),
            (this._finish = !1),
            (this._input = n.util.createBuffer()),
            (this.output = e.output || n.util.createBuffer()),
            this.mode.start(r));
        }),
          (e.prototype.update = function (e) {
            for (
              this._finish || this._input.putBuffer(e);
              this._input.length() >= this.blockSize ||
              (0 < this._input.length() && this._finish);
            )
              this._op.call(this.mode, this._input, this.output);
            this._input.compact();
          }),
          (e.prototype.finish = function (t) {
            t &&
              "CBC" === this.mode.name &&
              ((this.mode.pad = function (e) {
                return t(this.blockSize, e, !1);
              }),
              (this.mode.unpad = function (e) {
                return t(this.blockSize, e, !0);
              }));
            var e = {};
            return (
              (e.decrypt = this._decrypt),
              (e.overflow = this._input.length() % this.blockSize),
              !(
                (!this._decrypt &&
                  this.mode.pad &&
                  !this.mode.pad(this._input, e)) ||
                ((this._finish = !0),
                this.update(),
                this._decrypt &&
                  this.mode.unpad &&
                  !this.mode.unpad(this.output, e)) ||
                (this.mode.afterFinish &&
                  !this.mode.afterFinish(this.output, e))
              )
            );
          }));
      }
      var a = "cipher";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/cipher", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(a) {
        function t(e) {
          if (
            ("string" == typeof e && (e = a.util.createBuffer(e)),
            a.util.isArray(e) && 4 < e.length)
          ) {
            var t = e;
            e = a.util.createBuffer();
            for (var r = 0; r < t.length; ++r) e.putByte(t[r]);
          }
          return (e = a.util.isArray(e)
            ? e
            : [e.getInt32(), e.getInt32(), e.getInt32(), e.getInt32()]);
        }
        function s(e) {
          e[e.length - 1] = (e[e.length - 1] + 1) & 4294967295;
        }
        function o(e) {
          return [(e / 4294967296) | 0, 4294967295 & e];
        }
        a.cipher = a.cipher || {};
        var e = (a.cipher.modes = a.cipher.modes || {});
        ((e.ecb = function (e) {
          ((e = e || {}),
            (this.name = "ECB"),
            (this.cipher = e.cipher),
            (this.blockSize = e.blockSize || 16),
            (this._blocks = this.blockSize / 4),
            (this._inBlock = new Array(this._blocks)),
            (this._outBlock = new Array(this._blocks)));
        }),
          (e.ecb.prototype.start = function (e) {}),
          (e.ecb.prototype.encrypt = function (e, t) {
            for (var r = 0; r < this._blocks; ++r)
              this._inBlock[r] = e.getInt32();
            this.cipher.encrypt(this._inBlock, this._outBlock);
            for (r = 0; r < this._blocks; ++r) t.putInt32(this._outBlock[r]);
          }),
          (e.ecb.prototype.decrypt = function (e, t) {
            for (var r = 0; r < this._blocks; ++r)
              this._inBlock[r] = e.getInt32();
            this.cipher.decrypt(this._inBlock, this._outBlock);
            for (r = 0; r < this._blocks; ++r) t.putInt32(this._outBlock[r]);
          }),
          (e.ecb.prototype.pad = function (e, t) {
            var r =
              e.length() === this.blockSize
                ? this.blockSize
                : this.blockSize - e.length();
            return (e.fillWithByte(r, r), !0);
          }),
          (e.ecb.prototype.unpad = function (e, t) {
            return !(
              0 < t.overflow ||
              ((t = e.length()), (t = e.at(t - 1)) > this.blockSize << 2) ||
              (e.truncate(t), 0)
            );
          }),
          (e.cbc = function (e) {
            ((e = e || {}),
              (this.name = "CBC"),
              (this.cipher = e.cipher),
              (this.blockSize = e.blockSize || 16),
              (this._blocks = this.blockSize / 4),
              (this._inBlock = new Array(this._blocks)),
              (this._outBlock = new Array(this._blocks)));
          }),
          (e.cbc.prototype.start = function (e) {
            if (null === e.iv) {
              if (!this._prev) throw new Error("Invalid IV parameter.");
              this._iv = this._prev.slice(0);
            } else {
              if (!("iv" in e)) throw new Error("Invalid IV parameter.");
              ((this._iv = t(e.iv)), (this._prev = this._iv.slice(0)));
            }
          }),
          (e.cbc.prototype.encrypt = function (e, t) {
            for (var r = 0; r < this._blocks; ++r)
              this._inBlock[r] = this._prev[r] ^ e.getInt32();
            this.cipher.encrypt(this._inBlock, this._outBlock);
            for (r = 0; r < this._blocks; ++r) t.putInt32(this._outBlock[r]);
            this._prev = this._outBlock;
          }),
          (e.cbc.prototype.decrypt = function (e, t) {
            for (var r = 0; r < this._blocks; ++r)
              this._inBlock[r] = e.getInt32();
            this.cipher.decrypt(this._inBlock, this._outBlock);
            for (r = 0; r < this._blocks; ++r)
              t.putInt32(this._prev[r] ^ this._outBlock[r]);
            this._prev = this._inBlock.slice(0);
          }),
          (e.cbc.prototype.pad = function (e, t) {
            var r =
              e.length() === this.blockSize
                ? this.blockSize
                : this.blockSize - e.length();
            return (e.fillWithByte(r, r), !0);
          }),
          (e.cbc.prototype.unpad = function (e, t) {
            return !(
              0 < t.overflow ||
              ((t = e.length()), (t = e.at(t - 1)) > this.blockSize << 2) ||
              (e.truncate(t), 0)
            );
          }),
          (e.cfb = function (e) {
            ((e = e || {}),
              (this.name = "CFB"),
              (this.cipher = e.cipher),
              (this.blockSize = e.blockSize || 16),
              (this._blocks = this.blockSize / 4),
              (this._inBlock = null),
              (this._outBlock = new Array(this._blocks)));
          }),
          (e.cfb.prototype.start = function (e) {
            if (!("iv" in e)) throw new Error("Invalid IV parameter.");
            ((this._iv = t(e.iv)), (this._inBlock = this._iv.slice(0)));
          }),
          (e.cfb.prototype.encrypt = function (e, t) {
            this.cipher.encrypt(this._inBlock, this._outBlock);
            for (var r = 0; r < this._blocks; ++r)
              ((this._inBlock[r] = e.getInt32() ^ this._outBlock[r]),
                t.putInt32(this._inBlock[r]));
          }),
          (e.cfb.prototype.decrypt = function (e, t) {
            this.cipher.encrypt(this._inBlock, this._outBlock);
            for (var r = 0; r < this._blocks; ++r)
              ((this._inBlock[r] = e.getInt32()),
                t.putInt32(this._inBlock[r] ^ this._outBlock[r]));
          }),
          (e.cfb.prototype.afterFinish = function (e, t) {
            return (
              0 < t.overflow && e.truncate(this.blockSize - t.overflow),
              !0
            );
          }),
          (e.ofb = function (e) {
            ((e = e || {}),
              (this.name = "OFB"),
              (this.cipher = e.cipher),
              (this.blockSize = e.blockSize || 16),
              (this._blocks = this.blockSize / 4),
              (this._inBlock = null),
              (this._outBlock = new Array(this._blocks)));
          }),
          (e.ofb.prototype.start = function (e) {
            if (!("iv" in e)) throw new Error("Invalid IV parameter.");
            ((this._iv = t(e.iv)), (this._inBlock = this._iv.slice(0)));
          }),
          (e.ofb.prototype.encrypt = function (e, t) {
            this.cipher.encrypt(this._inBlock, this._outBlock);
            for (var r = 0; r < this._blocks; ++r)
              (t.putInt32(e.getInt32() ^ this._outBlock[r]),
                (this._inBlock[r] = this._outBlock[r]));
          }),
          (e.ofb.prototype.decrypt = e.ofb.prototype.encrypt),
          (e.ofb.prototype.afterFinish = function (e, t) {
            return (
              0 < t.overflow && e.truncate(this.blockSize - t.overflow),
              !0
            );
          }),
          (e.ctr = function (e) {
            ((e = e || {}),
              (this.name = "CTR"),
              (this.cipher = e.cipher),
              (this.blockSize = e.blockSize || 16),
              (this._blocks = this.blockSize / 4),
              (this._inBlock = null),
              (this._outBlock = new Array(this._blocks)));
          }),
          (e.ctr.prototype.start = function (e) {
            if (!("iv" in e)) throw new Error("Invalid IV parameter.");
            ((this._iv = t(e.iv)), (this._inBlock = this._iv.slice(0)));
          }),
          (e.ctr.prototype.encrypt = function (e, t) {
            (this.cipher.encrypt(this._inBlock, this._outBlock),
              s(this._inBlock));
            for (var r = 0; r < this._blocks; ++r)
              t.putInt32(e.getInt32() ^ this._outBlock[r]);
          }),
          (e.ctr.prototype.decrypt = e.ctr.prototype.encrypt),
          (e.ctr.prototype.afterFinish = function (e, t) {
            return (
              0 < t.overflow && e.truncate(this.blockSize - t.overflow),
              !0
            );
          }),
          (e.gcm = function (e) {
            ((e = e || {}),
              (this.name = "GCM"),
              (this.cipher = e.cipher),
              (this.blockSize = e.blockSize || 16),
              (this._blocks = this.blockSize / 4),
              (this._inBlock = new Array(this._blocks)),
              (this._outBlock = new Array(this._blocks)),
              (this._R = 3774873600));
          }),
          (e.gcm.prototype.start = function (e) {
            if (!("iv" in e)) throw new Error("Invalid IV parameter.");
            var t,
              r = a.util.createBuffer(e.iv);
            if (
              ((this._cipherLength = 0),
              (t =
                "additionalData" in e
                  ? a.util.createBuffer(e.additionalData)
                  : a.util.createBuffer()),
              "tagLength" in e
                ? (this._tagLength = e.tagLength)
                : (this._tagLength = 128),
              (this._tag = null),
              e.decrypt &&
                ((this._tag = a.util.createBuffer(e.tag).getBytes()),
                this._tag.length !== this._tagLength / 8))
            )
              throw new Error("Authentication tag does not match tag length.");
            ((this._hashBlock = new Array(this._blocks)),
              (this.tag = null),
              (this._hashSubkey = new Array(this._blocks)),
              this.cipher.encrypt([0, 0, 0, 0], this._hashSubkey),
              (this.componentBits = 4),
              (this._m = this.generateHashTable(
                this._hashSubkey,
                this.componentBits,
              )));
            e = r.length();
            if (12 === e)
              this._j0 = [r.getInt32(), r.getInt32(), r.getInt32(), 1];
            else {
              for (this._j0 = [0, 0, 0, 0]; 0 < r.length();)
                this._j0 = this.ghash(this._hashSubkey, this._j0, [
                  r.getInt32(),
                  r.getInt32(),
                  r.getInt32(),
                  r.getInt32(),
                ]);
              this._j0 = this.ghash(
                this._hashSubkey,
                this._j0,
                [0, 0].concat(o(8 * e)),
              );
            }
            ((this._inBlock = this._j0.slice(0)),
              s(this._inBlock),
              (t = a.util.createBuffer(t)),
              (this._aDataLength = o(8 * t.length())));
            e = t.length() % this.blockSize;
            for (
              e && t.fillWithByte(0, this.blockSize - e),
                this._s = [0, 0, 0, 0];
              0 < t.length();
            )
              this._s = this.ghash(this._hashSubkey, this._s, [
                t.getInt32(),
                t.getInt32(),
                t.getInt32(),
                t.getInt32(),
              ]);
          }),
          (e.gcm.prototype.encrypt = function (e, t) {
            (this.cipher.encrypt(this._inBlock, this._outBlock),
              s(this._inBlock));
            for (var r, n = e.length(), i = 0; i < this._blocks; ++i)
              this._outBlock[i] ^= e.getInt32();
            n < this.blockSize
              ? ((n = n % this.blockSize),
                (this._cipherLength += n),
                (r = a.util.createBuffer()).putInt32(this._outBlock[0]),
                r.putInt32(this._outBlock[1]),
                r.putInt32(this._outBlock[2]),
                r.putInt32(this._outBlock[3]),
                r.truncate(this.blockSize - n),
                (this._outBlock[0] = r.getInt32()),
                (this._outBlock[1] = r.getInt32()),
                (this._outBlock[2] = r.getInt32()),
                (this._outBlock[3] = r.getInt32()))
              : (this._cipherLength += this.blockSize);
            for (i = 0; i < this._blocks; ++i) t.putInt32(this._outBlock[i]);
            this._s = this.ghash(this._hashSubkey, this._s, this._outBlock);
          }),
          (e.gcm.prototype.decrypt = function (e, t) {
            (this.cipher.encrypt(this._inBlock, this._outBlock),
              s(this._inBlock));
            var r = e.length();
            ((this._hashBlock[0] = e.getInt32()),
              (this._hashBlock[1] = e.getInt32()),
              (this._hashBlock[2] = e.getInt32()),
              (this._hashBlock[3] = e.getInt32()),
              (this._s = this.ghash(
                this._hashSubkey,
                this._s,
                this._hashBlock,
              )));
            for (var n = 0; n < this._blocks; ++n)
              t.putInt32(this._outBlock[n] ^ this._hashBlock[n]);
            r < this.blockSize
              ? (this._cipherLength += r % this.blockSize)
              : (this._cipherLength += this.blockSize);
          }),
          (e.gcm.prototype.afterFinish = function (e, t) {
            var r = !0,
              e =
                (t.overflow && e.truncate(this.blockSize - t.overflow),
                (this.tag = a.util.createBuffer()),
                this._aDataLength.concat(o(8 * this._cipherLength))),
              n = ((this._s = this.ghash(this._hashSubkey, this._s, e)), []);
            this.cipher.encrypt(this._j0, n);
            for (var i = 0; i < this._blocks; ++i)
              this.tag.putInt32(this._s[i] ^ n[i]);
            return (
              this.tag.truncate(this.tag.length() % (this._tagLength / 8)),
              (r = t.decrypt && this.tag.bytes() !== this._tag ? !1 : r)
            );
          }),
          (e.gcm.prototype.multiply = function (e, t) {
            for (var r = [0, 0, 0, 0], n = t.slice(0), i = 0; i < 128; ++i)
              (e[(i / 32) | 0] & (1 << (31 - (i % 32))) &&
                ((r[0] ^= n[0]),
                (r[1] ^= n[1]),
                (r[2] ^= n[2]),
                (r[3] ^= n[3])),
                this.pow(n, n));
            return r;
          }),
          (e.gcm.prototype.pow = function (e, t) {
            for (var r = 1 & e[3], n = 3; 0 < n; --n)
              t[n] = (e[n] >>> 1) | ((1 & e[n - 1]) << 31);
            ((t[0] = e[0] >>> 1), r && (t[0] ^= this._R));
          }),
          (e.gcm.prototype.tableMultiply = function (e) {
            for (var t = [0, 0, 0, 0], r = 0; r < 32; ++r) {
              var n = (e[(r / 8) | 0] >>> (4 * (7 - (r % 8)))) & 15,
                n = this._m[r][n];
              ((t[0] ^= n[0]), (t[1] ^= n[1]), (t[2] ^= n[2]), (t[3] ^= n[3]));
            }
            return t;
          }),
          (e.gcm.prototype.ghash = function (e, t, r) {
            return (
              (t[0] ^= r[0]),
              (t[1] ^= r[1]),
              (t[2] ^= r[2]),
              (t[3] ^= r[3]),
              this.tableMultiply(t)
            );
          }),
          (e.gcm.prototype.generateHashTable = function (e, t) {
            for (
              var r = 8 / t, n = 4 * r, i = 16 * r, a = new Array(i), s = 0;
              s < i;
              ++s
            ) {
              var o = [0, 0, 0, 0];
              ((o[(s / n) | 0] = (1 << (t - 1)) << ((n - 1 - (s % n)) * t)),
                (a[s] = this.generateSubHashTable(this.multiply(o, e), t)));
            }
            return a;
          }),
          (e.gcm.prototype.generateSubHashTable = function (e, t) {
            for (
              var r = 1 << t,
                n = r >>> 1,
                i = new Array(r),
                a = ((i[n] = e.slice(0)), n >>> 1);
              0 < a;
            )
              (this.pow(i[2 * a], (i[a] = [])), (a >>= 1));
            for (a = 2; a < n;) {
              for (var s = 1; s < a; ++s) {
                var o = i[a],
                  c = i[s];
                i[a + s] = [o[0] ^ c[0], o[1] ^ c[1], o[2] ^ c[2], o[3] ^ c[3]];
              }
              a *= 2;
            }
            for (i[0] = [0, 0, 0, 0], a = 1 + n; a < r; ++a) {
              var u = i[a ^ n];
              i[a] = [e[0] ^ u[0], e[1] ^ u[1], e[2] ^ u[2], e[3] ^ u[3]];
            }
            return i;
          }));
      }
      var a = "cipherModes";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/cipherModes", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(s) {
        function e(e, t) {
          s.cipher.registerAlgorithm(e, function () {
            return new s.aes.Algorithm(e, t);
          });
        }
        function n() {
          ((f = !0), (g = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54]));
          for (var e = new Array(256), t = 0; t < 128; ++t)
            ((e[t] = t << 1), (e[t + 128] = ((t + 128) << 1) ^ 283));
          ((v = new Array(256)),
            (E = new Array(256)),
            (S = new Array(4)),
            (T = new Array(4)));
          for (t = 0; t < 4; ++t)
            ((S[t] = new Array(256)), (T[t] = new Array(256)));
          for (var r, n = 0, i = 0, t = 0; t < 256; ++t) {
            ((v[n] = r =
              ((r = i ^ (i << 1) ^ (i << 2) ^ (i << 3) ^ (i << 4)) >> 8) ^
              (255 & r) ^
              99),
              (E[r] = n));
            for (
              var a,
                s,
                o,
                c = ((a = e[r]) << 24) ^ (r << 16) ^ (r << 8) ^ r ^ a,
                u =
                  (((a = e[n]) ^ (s = e[a]) ^ (o = e[s])) << 24) ^
                  ((n ^ o) << 16) ^
                  ((n ^ s ^ o) << 8) ^
                  n ^
                  a ^
                  o,
                l = 0;
              l < 4;
              ++l
            )
              ((c = ((S[l][n] = c) << 24) | (c >>> 8)),
                (u = ((T[l][r] = u) << 24) | (u >>> 8)));
            0 === n ? (n = i = 1) : ((n = a ^ e[e[e[a ^ o]]]), (i ^= e[e[i]]));
          }
        }
        function o(e, t) {
          for (
            var r,
              n = e.slice(0),
              i = 1,
              a = n.length,
              s = m * (a + 6 + 1),
              o = a;
            o < s;
            ++o
          )
            ((r = n[o - 1]),
              o % a == 0
                ? ((r =
                    (v[(r >>> 16) & 255] << 24) ^
                    (v[(r >>> 8) & 255] << 16) ^
                    (v[255 & r] << 8) ^
                    v[r >>> 24] ^
                    (g[i] << 24)),
                  i++)
                : 6 < a &&
                  o % a == 4 &&
                  (r =
                    (v[r >>> 24] << 24) ^
                    (v[(r >>> 16) & 255] << 16) ^
                    (v[(r >>> 8) & 255] << 8) ^
                    v[255 & r]),
              (n[o] = n[o - a] ^ r));
          if (t) {
            for (
              var c,
                u = T[0],
                l = T[1],
                f = T[2],
                p = T[3],
                d = n.slice(0),
                o = 0,
                h = (s = n.length) - m;
              o < s;
              o += m, h -= m
            )
              if (0 === o || o === s - m)
                ((d[o] = n[h]),
                  (d[o + 1] = n[h + 3]),
                  (d[o + 2] = n[h + 2]),
                  (d[o + 3] = n[h + 1]));
              else
                for (var y = 0; y < m; ++y)
                  ((c = n[h + y]),
                    (d[o + (3 & -y)] =
                      u[v[c >>> 24]] ^
                      l[v[(c >>> 16) & 255]] ^
                      f[v[(c >>> 8) & 255]] ^
                      p[v[255 & c]]));
            n = d;
          }
          return n;
        }
        function i(e, t, r, n) {
          for (
            var i,
              a,
              s,
              o,
              c,
              u,
              l,
              f = e.length / 4 - 1,
              p = n
                ? ((i = T[0]), (a = T[1]), (s = T[2]), (o = T[3]), E)
                : ((i = S[0]), (a = S[1]), (s = S[2]), (o = S[3]), v),
              d = t[0] ^ e[0],
              h = t[n ? 3 : 1] ^ e[1],
              y = t[2] ^ e[2],
              g = t[n ? 1 : 3] ^ e[3],
              m = 3,
              C = 1;
            C < f;
            ++C
          )
            ((c =
              i[d >>> 24] ^
              a[(h >>> 16) & 255] ^
              s[(y >>> 8) & 255] ^
              o[255 & g] ^
              e[++m]),
              (u =
                i[h >>> 24] ^
                a[(y >>> 16) & 255] ^
                s[(g >>> 8) & 255] ^
                o[255 & d] ^
                e[++m]),
              (l =
                i[y >>> 24] ^
                a[(g >>> 16) & 255] ^
                s[(d >>> 8) & 255] ^
                o[255 & h] ^
                e[++m]),
              (g =
                i[g >>> 24] ^
                a[(d >>> 16) & 255] ^
                s[(h >>> 8) & 255] ^
                o[255 & y] ^
                e[++m]),
              (d = c),
              (h = u),
              (y = l));
          ((r[0] =
            (p[d >>> 24] << 24) ^
            (p[(h >>> 16) & 255] << 16) ^
            (p[(y >>> 8) & 255] << 8) ^
            p[255 & g] ^
            e[++m]),
            (r[n ? 3 : 1] =
              (p[h >>> 24] << 24) ^
              (p[(y >>> 16) & 255] << 16) ^
              (p[(g >>> 8) & 255] << 8) ^
              p[255 & d] ^
              e[++m]),
            (r[2] =
              (p[y >>> 24] << 24) ^
              (p[(g >>> 16) & 255] << 16) ^
              (p[(d >>> 8) & 255] << 8) ^
              p[255 & h] ^
              e[++m]),
            (r[n ? 1 : 3] =
              (p[g >>> 24] << 24) ^
              (p[(d >>> 16) & 255] << 16) ^
              (p[(h >>> 8) & 255] << 8) ^
              p[255 & y] ^
              e[++m]));
        }
        function a(e) {
          var t = "AES-" + ((e = e || {}).mode || "CBC").toUpperCase(),
            n = e.decrypt
              ? s.cipher.createDecipher(t, e.key)
              : s.cipher.createCipher(t, e.key),
            i = n.start;
          return (
            (n.start = function (e, t) {
              var r = null;
              (t instanceof s.util.ByteBuffer && ((r = t), (t = {})),
                ((t = t || {}).output = r),
                (t.iv = e),
                i.call(n, t));
            }),
            n
          );
        }
        ((s.aes = s.aes || {}),
          (s.aes.startEncrypting = function (e, t, r, n) {
            e = a({ key: e, output: r, decrypt: !1, mode: n });
            return (e.start(t), e);
          }),
          (s.aes.createEncryptionCipher = function (e, t) {
            return a({ key: e, output: null, decrypt: !1, mode: t });
          }),
          (s.aes.startDecrypting = function (e, t, r, n) {
            e = a({ key: e, output: r, decrypt: !0, mode: n });
            return (e.start(t), e);
          }),
          (s.aes.createDecryptionCipher = function (e, t) {
            return a({ key: e, output: null, decrypt: !0, mode: t });
          }),
          (s.aes.Algorithm = function (e, t) {
            f || n();
            var r = this;
            ((r.name = e),
              (r.mode = new t({
                blockSize: 16,
                cipher: {
                  encrypt: function (e, t) {
                    return i(r._w, e, t, !1);
                  },
                  decrypt: function (e, t) {
                    return i(r._w, e, t, !0);
                  },
                },
              })),
              (r._init = !1));
          }),
          (s.aes.Algorithm.prototype.initialize = function (e) {
            if (!this._init) {
              if (
                "string" != typeof (r = e.key) ||
                (16 !== r.length && 24 !== r.length && 32 !== r.length)
              ) {
                if (
                  s.util.isArray(r) &&
                  (16 === r.length || 24 === r.length || 32 === r.length)
                )
                  for (
                    var t = r, r = s.util.createBuffer(), n = 0;
                    n < t.length;
                    ++n
                  )
                    r.putByte(t[n]);
              } else r = s.util.createBuffer(r);
              if (!s.util.isArray(r)) {
                ((t = r), (r = []));
                var i = t.length();
                if (16 === i || 24 === i || 32 === i) {
                  i >>>= 2;
                  for (n = 0; n < i; ++n) r.push(t.getInt32());
                }
              }
              if (
                !s.util.isArray(r) ||
                (4 !== r.length && 6 !== r.length && 8 !== r.length)
              )
                throw new Error("Invalid key parameter.");
              var a = this.mode.name,
                a = -1 !== ["CFB", "OFB", "CTR", "GCM"].indexOf(a);
              ((this._w = o(r, e.decrypt && !a)), (this._init = !0));
            }
          }),
          (s.aes._expandKey = function (e, t) {
            return (f || n(), o(e, t));
          }),
          (s.aes._updateBlock = i),
          e("AES-CBC", s.cipher.modes.cbc),
          e("AES-CFB", s.cipher.modes.cfb),
          e("AES-OFB", s.cipher.modes.ofb),
          e("AES-CTR", s.cipher.modes.ctr),
          e("AES-GCM", s.cipher.modes.gcm));
        var v,
          E,
          g,
          S,
          T,
          f = !1,
          m = 4;
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/aes",
        ["require", "module", "./cipher", "./cipherModes", "./util"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.aes)) {
                e.defined.aes = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.aes;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(e) {
        e.pki = e.pki || {};
        e = e.pki.oids = e.oids = e.oids || {};
        ((e["1.2.840.113549.1.1.1"] = "rsaEncryption"),
          (e.rsaEncryption = "1.2.840.113549.1.1.1"),
          (e["1.2.840.113549.1.1.4"] = "md5WithRSAEncryption"),
          (e.md5WithRSAEncryption = "1.2.840.113549.1.1.4"),
          (e["1.2.840.113549.1.1.5"] = "sha1WithRSAEncryption"),
          (e.sha1WithRSAEncryption = "1.2.840.113549.1.1.5"),
          (e["1.2.840.113549.1.1.7"] = "RSAES-OAEP"),
          (e["RSAES-OAEP"] = "1.2.840.113549.1.1.7"),
          (e["1.2.840.113549.1.1.8"] = "mgf1"),
          (e.mgf1 = "1.2.840.113549.1.1.8"),
          (e["1.2.840.113549.1.1.9"] = "pSpecified"),
          (e.pSpecified = "1.2.840.113549.1.1.9"),
          (e["1.2.840.113549.1.1.10"] = "RSASSA-PSS"),
          (e["RSASSA-PSS"] = "1.2.840.113549.1.1.10"),
          (e["1.2.840.113549.1.1.11"] = "sha256WithRSAEncryption"),
          (e.sha256WithRSAEncryption = "1.2.840.113549.1.1.11"),
          (e["1.2.840.113549.1.1.12"] = "sha384WithRSAEncryption"),
          (e.sha384WithRSAEncryption = "1.2.840.113549.1.1.12"),
          (e["1.2.840.113549.1.1.13"] = "sha512WithRSAEncryption"),
          (e.sha512WithRSAEncryption = "1.2.840.113549.1.1.13"),
          (e["1.3.14.3.2.7"] = "desCBC"),
          (e.desCBC = "1.3.14.3.2.7"),
          (e["1.3.14.3.2.26"] = "sha1"),
          (e.sha1 = "1.3.14.3.2.26"),
          (e["2.16.840.1.101.3.4.2.1"] = "sha256"),
          (e.sha256 = "2.16.840.1.101.3.4.2.1"),
          (e["2.16.840.1.101.3.4.2.2"] = "sha384"),
          (e.sha384 = "2.16.840.1.101.3.4.2.2"),
          (e["2.16.840.1.101.3.4.2.3"] = "sha512"),
          (e.sha512 = "2.16.840.1.101.3.4.2.3"),
          (e["1.2.840.113549.2.5"] = "md5"),
          (e.md5 = "1.2.840.113549.2.5"),
          (e["1.2.840.113549.1.7.1"] = "data"),
          (e.data = "1.2.840.113549.1.7.1"),
          (e["1.2.840.113549.1.7.2"] = "signedData"),
          (e.signedData = "1.2.840.113549.1.7.2"),
          (e["1.2.840.113549.1.7.3"] = "envelopedData"),
          (e.envelopedData = "1.2.840.113549.1.7.3"),
          (e["1.2.840.113549.1.7.4"] = "signedAndEnvelopedData"),
          (e.signedAndEnvelopedData = "1.2.840.113549.1.7.4"),
          (e["1.2.840.113549.1.7.5"] = "digestedData"),
          (e.digestedData = "1.2.840.113549.1.7.5"),
          (e["1.2.840.113549.1.7.6"] = "encryptedData"),
          (e.encryptedData = "1.2.840.113549.1.7.6"),
          (e["1.2.840.113549.1.9.1"] = "emailAddress"),
          (e.emailAddress = "1.2.840.113549.1.9.1"),
          (e["1.2.840.113549.1.9.2"] = "unstructuredName"),
          (e.unstructuredName = "1.2.840.113549.1.9.2"),
          (e["1.2.840.113549.1.9.3"] = "contentType"),
          (e.contentType = "1.2.840.113549.1.9.3"),
          (e["1.2.840.113549.1.9.4"] = "messageDigest"),
          (e.messageDigest = "1.2.840.113549.1.9.4"),
          (e["1.2.840.113549.1.9.5"] = "signingTime"),
          (e.signingTime = "1.2.840.113549.1.9.5"),
          (e["1.2.840.113549.1.9.6"] = "counterSignature"),
          (e.counterSignature = "1.2.840.113549.1.9.6"),
          (e["1.2.840.113549.1.9.7"] = "challengePassword"),
          (e.challengePassword = "1.2.840.113549.1.9.7"),
          (e["1.2.840.113549.1.9.8"] = "unstructuredAddress"),
          (e.unstructuredAddress = "1.2.840.113549.1.9.8"),
          (e["1.2.840.113549.1.9.14"] = "extensionRequest"),
          (e.extensionRequest = "1.2.840.113549.1.9.14"),
          (e["1.2.840.113549.1.9.20"] = "friendlyName"),
          (e.friendlyName = "1.2.840.113549.1.9.20"),
          (e["1.2.840.113549.1.9.21"] = "localKeyId"),
          (e.localKeyId = "1.2.840.113549.1.9.21"),
          (e["1.2.840.113549.1.9.22.1"] = "x509Certificate"),
          (e.x509Certificate = "1.2.840.113549.1.9.22.1"),
          (e["1.2.840.113549.1.12.10.1.1"] = "keyBag"),
          (e.keyBag = "1.2.840.113549.1.12.10.1.1"),
          (e["1.2.840.113549.1.12.10.1.2"] = "pkcs8ShroudedKeyBag"),
          (e.pkcs8ShroudedKeyBag = "1.2.840.113549.1.12.10.1.2"),
          (e["1.2.840.113549.1.12.10.1.3"] = "certBag"),
          (e.certBag = "1.2.840.113549.1.12.10.1.3"),
          (e["1.2.840.113549.1.12.10.1.4"] = "crlBag"),
          (e.crlBag = "1.2.840.113549.1.12.10.1.4"),
          (e["1.2.840.113549.1.12.10.1.5"] = "secretBag"),
          (e.secretBag = "1.2.840.113549.1.12.10.1.5"),
          (e["1.2.840.113549.1.12.10.1.6"] = "safeContentsBag"),
          (e.safeContentsBag = "1.2.840.113549.1.12.10.1.6"),
          (e["1.2.840.113549.1.5.13"] = "pkcs5PBES2"),
          (e.pkcs5PBES2 = "1.2.840.113549.1.5.13"),
          (e["1.2.840.113549.1.5.12"] = "pkcs5PBKDF2"),
          (e.pkcs5PBKDF2 = "1.2.840.113549.1.5.12"),
          (e["1.2.840.113549.1.12.1.1"] = "pbeWithSHAAnd128BitRC4"),
          (e.pbeWithSHAAnd128BitRC4 = "1.2.840.113549.1.12.1.1"),
          (e["1.2.840.113549.1.12.1.2"] = "pbeWithSHAAnd40BitRC4"),
          (e.pbeWithSHAAnd40BitRC4 = "1.2.840.113549.1.12.1.2"),
          (e["1.2.840.113549.1.12.1.3"] = "pbeWithSHAAnd3-KeyTripleDES-CBC"),
          (e["pbeWithSHAAnd3-KeyTripleDES-CBC"] = "1.2.840.113549.1.12.1.3"),
          (e["1.2.840.113549.1.12.1.4"] = "pbeWithSHAAnd2-KeyTripleDES-CBC"),
          (e["pbeWithSHAAnd2-KeyTripleDES-CBC"] = "1.2.840.113549.1.12.1.4"),
          (e["1.2.840.113549.1.12.1.5"] = "pbeWithSHAAnd128BitRC2-CBC"),
          (e["pbeWithSHAAnd128BitRC2-CBC"] = "1.2.840.113549.1.12.1.5"),
          (e["1.2.840.113549.1.12.1.6"] = "pbewithSHAAnd40BitRC2-CBC"),
          (e["pbewithSHAAnd40BitRC2-CBC"] = "1.2.840.113549.1.12.1.6"),
          (e["1.2.840.113549.3.7"] = "des-EDE3-CBC"),
          (e["des-EDE3-CBC"] = "1.2.840.113549.3.7"),
          (e["2.16.840.1.101.3.4.1.2"] = "aes128-CBC"),
          (e["aes128-CBC"] = "2.16.840.1.101.3.4.1.2"),
          (e["2.16.840.1.101.3.4.1.22"] = "aes192-CBC"),
          (e["aes192-CBC"] = "2.16.840.1.101.3.4.1.22"),
          (e["2.16.840.1.101.3.4.1.42"] = "aes256-CBC"),
          (e["aes256-CBC"] = "2.16.840.1.101.3.4.1.42"),
          (e["2.5.4.3"] = "commonName"),
          (e.commonName = "2.5.4.3"),
          (e["2.5.4.5"] = "serialName"),
          (e.serialName = "2.5.4.5"),
          (e["2.5.4.6"] = "countryName"),
          (e.countryName = "2.5.4.6"),
          (e["2.5.4.7"] = "localityName"),
          (e.localityName = "2.5.4.7"),
          (e["2.5.4.8"] = "stateOrProvinceName"),
          (e.stateOrProvinceName = "2.5.4.8"),
          (e["2.5.4.10"] = "organizationName"),
          (e.organizationName = "2.5.4.10"),
          (e["2.5.4.11"] = "organizationalUnitName"),
          (e.organizationalUnitName = "2.5.4.11"),
          (e["2.16.840.1.113730.1.1"] = "nsCertType"),
          (e.nsCertType = "2.16.840.1.113730.1.1"),
          (e["2.5.29.1"] = "authorityKeyIdentifier"),
          (e["2.5.29.2"] = "keyAttributes"),
          (e["2.5.29.3"] = "certificatePolicies"),
          (e["2.5.29.4"] = "keyUsageRestriction"),
          (e["2.5.29.5"] = "policyMapping"),
          (e["2.5.29.6"] = "subtreesConstraint"),
          (e["2.5.29.7"] = "subjectAltName"),
          (e["2.5.29.8"] = "issuerAltName"),
          (e["2.5.29.9"] = "subjectDirectoryAttributes"),
          (e["2.5.29.10"] = "basicConstraints"),
          (e["2.5.29.11"] = "nameConstraints"),
          (e["2.5.29.12"] = "policyConstraints"),
          (e["2.5.29.13"] = "basicConstraints"),
          (e["2.5.29.14"] = "subjectKeyIdentifier"),
          (e.subjectKeyIdentifier = "2.5.29.14"),
          (e["2.5.29.15"] = "keyUsage"),
          (e.keyUsage = "2.5.29.15"),
          (e["2.5.29.16"] = "privateKeyUsagePeriod"),
          (e["2.5.29.17"] = "subjectAltName"),
          (e.subjectAltName = "2.5.29.17"),
          (e["2.5.29.18"] = "issuerAltName"),
          (e.issuerAltName = "2.5.29.18"),
          (e["2.5.29.19"] = "basicConstraints"),
          (e.basicConstraints = "2.5.29.19"),
          (e["2.5.29.20"] = "cRLNumber"),
          (e["2.5.29.21"] = "cRLReason"),
          (e["2.5.29.22"] = "expirationDate"),
          (e["2.5.29.23"] = "instructionCode"),
          (e["2.5.29.24"] = "invalidityDate"),
          (e["2.5.29.25"] = "cRLDistributionPoints"),
          (e["2.5.29.26"] = "issuingDistributionPoint"),
          (e["2.5.29.27"] = "deltaCRLIndicator"),
          (e["2.5.29.28"] = "issuingDistributionPoint"),
          (e["2.5.29.29"] = "certificateIssuer"),
          (e["2.5.29.30"] = "nameConstraints"),
          (e["2.5.29.31"] = "cRLDistributionPoints"),
          (e["2.5.29.32"] = "certificatePolicies"),
          (e["2.5.29.33"] = "policyMappings"),
          (e["2.5.29.34"] = "policyConstraints"),
          (e["2.5.29.35"] = "authorityKeyIdentifier"),
          (e["2.5.29.36"] = "policyConstraints"),
          (e["2.5.29.37"] = "extKeyUsage"),
          (e.extKeyUsage = "2.5.29.37"),
          (e["2.5.29.46"] = "freshestCRL"),
          (e["2.5.29.54"] = "inhibitAnyPolicy"),
          (e["1.3.6.1.5.5.7.3.1"] = "serverAuth"),
          (e.serverAuth = "1.3.6.1.5.5.7.3.1"),
          (e["1.3.6.1.5.5.7.3.2"] = "clientAuth"),
          (e.clientAuth = "1.3.6.1.5.5.7.3.2"),
          (e["1.3.6.1.5.5.7.3.3"] = "codeSigning"),
          (e.codeSigning = "1.3.6.1.5.5.7.3.3"),
          (e["1.3.6.1.5.5.7.3.4"] = "emailProtection"),
          (e.emailProtection = "1.3.6.1.5.5.7.3.4"),
          (e["1.3.6.1.5.5.7.3.8"] = "timeStamping"),
          (e.timeStamping = "1.3.6.1.5.5.7.3.8"));
      }
      var a = "oids";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/oids", ["require", "module"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(p) {
        function d(e) {
          var t = e.getByte();
          if (128 !== t) return 128 & t ? e.getInt((127 & t) << 3) : t;
        }
        var h = (p.asn1 = p.asn1 || {}),
          u =
            ((h.Class = {
              UNIVERSAL: 0,
              APPLICATION: 64,
              CONTEXT_SPECIFIC: 128,
              PRIVATE: 192,
            }),
            (h.Type = {
              NONE: 0,
              BOOLEAN: 1,
              INTEGER: 2,
              BITSTRING: 3,
              OCTETSTRING: 4,
              NULL: 5,
              OID: 6,
              ODESC: 7,
              EXTERNAL: 8,
              REAL: 9,
              ENUMERATED: 10,
              EMBEDDED: 11,
              UTF8: 12,
              ROID: 13,
              SEQUENCE: 16,
              SET: 17,
              PRINTABLESTRING: 19,
              IA5STRING: 22,
              UTCTIME: 23,
              GENERALIZEDTIME: 24,
              BMPSTRING: 30,
            }),
            (h.create = function (e, t, r, n) {
              if (p.util.isArray(n)) {
                for (var i = [], a = 0; a < n.length; ++a)
                  void 0 !== n[a] && i.push(n[a]);
                n = i;
              }
              return {
                tagClass: e,
                type: t,
                constructed: r,
                composed: r || p.util.isArray(n),
                value: n,
              };
            }),
            (h.fromDer = function (e, t) {
              if (
                (void 0 === t && (t = !0),
                (e =
                  "string" == typeof e ? p.util.createBuffer(e) : e).length() <
                  2)
              )
                throw (
                  ((a = new Error("Too few bytes to parse DER.")).bytes =
                    e.length()),
                  a
                );
              var r = 192 & (o = e.getByte()),
                n = 31 & o,
                i = d(e);
              if (e.length() < i) {
                if (t)
                  throw (
                    ((a = new Error(
                      "Too few bytes to read ASN.1 value.",
                    )).detail = e.length() + " < " + i),
                    a
                  );
                i = e.length();
              }
              var a = 32 == (32 & o);
              if (
                !(o = a) &&
                r === h.Class.UNIVERSAL &&
                n === h.Type.BITSTRING &&
                1 < i
              ) {
                var s = e.read;
                if (0 === e.getByte()) {
                  var o,
                    c = 192 & e.getByte();
                  if (c === h.Class.UNIVERSAL || c === h.Class.CONTEXT_SPECIFIC)
                    try {
                      (o = d(e) === i - (e.read - s)) && (++s, --i);
                    } catch (e) {}
                }
                e.read = s;
              }
              if (o)
                if (((l = []), void 0 === i))
                  for (;;) {
                    if (e.bytes(2) === String.fromCharCode(0, 0)) {
                      e.getBytes(2);
                      break;
                    }
                    l.push(h.fromDer(e, t));
                  }
                else
                  for (var u = e.length(); 0 < i;)
                    (l.push(h.fromDer(e, t)),
                      (i -= u - e.length()),
                      (u = e.length()));
              else {
                if (void 0 === i) {
                  if (t)
                    throw new Error(
                      "Non-constructed ASN.1 object of indefinite length.",
                    );
                  i = e.length();
                }
                if (n === h.Type.BMPSTRING)
                  for (var l = "", f = 0; f < i; f += 2)
                    l += String.fromCharCode(e.getInt16());
                else l = e.getBytes(i);
              }
              return h.create(r, n, a, l);
            }),
            (h.toDer = function (e) {
              var t = p.util.createBuffer(),
                r = e.tagClass | e.type,
                n = p.util.createBuffer();
              if (e.composed) {
                e.constructed ? (r |= 32) : n.putByte(0);
                for (var i = 0; i < e.value.length; ++i)
                  void 0 !== e.value[i] && n.putBuffer(h.toDer(e.value[i]));
              } else if (e.type === h.Type.BMPSTRING)
                for (i = 0; i < e.value.length; ++i)
                  n.putInt16(e.value.charCodeAt(i));
              else n.putBytes(e.value);
              if ((t.putByte(r), n.length() <= 127))
                t.putByte(127 & n.length());
              else {
                for (
                  var a = n.length(), s = "";
                  (s += String.fromCharCode(255 & a)), 0 < (a >>>= 8);
                );
                t.putByte(128 | s.length);
                for (i = s.length - 1; 0 <= i; --i) t.putByte(s.charCodeAt(i));
              }
              return (t.putBuffer(n), t);
            }),
            (h.oidToDer = function (e) {
              var t,
                r,
                n,
                i,
                a = e.split("."),
                s = p.util.createBuffer();
              s.putByte(40 * parseInt(a[0], 10) + parseInt(a[1], 10));
              for (var o = 2; o < a.length; ++o) {
                for (
                  t = !0, r = [], n = parseInt(a[o], 10);
                  (i = 127 & n),
                    (n >>>= 7),
                    t || (i |= 128),
                    r.push(i),
                    (t = !1),
                    0 < n;
                );
                for (var c = r.length - 1; 0 <= c; --c) s.putByte(r[c]);
              }
              return s;
            }),
            (h.derToOid = function (e) {
              for (
                var t = (e =
                    "string" == typeof e
                      ? p.util.createBuffer(e)
                      : e).getByte(),
                  r = Math.floor(t / 40) + "." + (t % 40),
                  n = 0;
                0 < e.length();
              )
                ((n <<= 7),
                  128 & (t = e.getByte())
                    ? (n += 127 & t)
                    : ((r += "." + (n + t)), (n = 0)));
              return r;
            }),
            (h.utcTimeToDate = function (e) {
              var t,
                r,
                n = new Date(),
                i =
                  50 <= (i = parseInt(e.substr(0, 2), 10)) ? 1900 + i : 2e3 + i,
                a = parseInt(e.substr(2, 2), 10) - 1,
                s = parseInt(e.substr(4, 2), 10),
                o = parseInt(e.substr(6, 2), 10),
                c = parseInt(e.substr(8, 2), 10),
                u = 0;
              return (
                11 < e.length &&
                  "+" !== (r = e.charAt((t = 10))) &&
                  "-" !== r &&
                  ((u = parseInt(e.substr(10, 2), 10)), (t += 2)),
                n.setUTCFullYear(i, a, s),
                n.setUTCHours(o, c, u, 0),
                !t ||
                  ("+" !== (r = e.charAt(t)) && "-" !== r) ||
                  ((i =
                    60 * parseInt(e.substr(t + 1, 2), 10) +
                    parseInt(e.substr(t + 4, 2), 10)),
                  (i *= 6e4),
                  "+" === r ? n.setTime(+n - i) : n.setTime(+n + i)),
                n
              );
            }),
            (h.generalizedTimeToDate = function (e) {
              var t = new Date(),
                r = parseInt(e.substr(0, 4), 10),
                n = parseInt(e.substr(4, 2), 10) - 1,
                i = parseInt(e.substr(6, 2), 10),
                a = parseInt(e.substr(8, 2), 10),
                s = parseInt(e.substr(10, 2), 10),
                o = parseInt(e.substr(12, 2), 10),
                c = 0,
                u = 0,
                l = !1,
                f = ("Z" === e.charAt(e.length - 1) && (l = !0), e.length - 5),
                p = e.charAt(f);
              return (
                ("+" !== p && "-" !== p) ||
                  ((u =
                    60 * parseInt(e.substr(1 + f, 2), 10) +
                    parseInt(e.substr(4 + f, 2), 10)),
                  (u *= 6e4),
                  "+" === p && (u *= -1),
                  (l = !0)),
                "." === e.charAt(14) &&
                  (c = 1e3 * parseFloat(e.substr(14), 10)),
                l
                  ? (t.setUTCFullYear(r, n, i),
                    t.setUTCHours(a, s, o, c),
                    t.setTime(+t + u))
                  : (t.setFullYear(r, n, i), t.setHours(a, s, o, c)),
                t
              );
            }),
            (h.dateToUtcTime = function (e) {
              var t = "",
                r = [];
              (r.push(("" + e.getUTCFullYear()).substr(2)),
                r.push("" + (e.getUTCMonth() + 1)),
                r.push("" + e.getUTCDate()),
                r.push("" + e.getUTCHours()),
                r.push("" + e.getUTCMinutes()),
                r.push("" + e.getUTCSeconds()));
              for (var n = 0; n < r.length; ++n)
                (r[n].length < 2 && (t += "0"), (t += r[n]));
              return (t += "Z");
            }),
            (h.integerToDer = function (e) {
              var t = p.util.createBuffer();
              if (-128 <= e && e < 128) return t.putSignedInt(e, 8);
              if (-32768 <= e && e < 32768) return t.putSignedInt(e, 16);
              if (-8388608 <= e && e < 8388608) return t.putSignedInt(e, 24);
              if (-2147483648 <= e && e < 2147483648)
                return t.putSignedInt(e, 32);
              t = new Error("Integer too large; max is 32-bits.");
              throw ((t.integer = e), t);
            }),
            (h.derToInteger = function (e) {
              var t =
                8 *
                (e =
                  "string" == typeof e ? p.util.createBuffer(e) : e).length();
              if (32 < t) throw new Error("Integer too large; max is 32-bits.");
              return e.getSignedInt(t);
            }),
            (h.validate = function (e, t, r, n) {
              var i = !1;
              if (
                (e.tagClass !== t.tagClass && void 0 !== t.tagClass) ||
                (e.type !== t.type && void 0 !== t.type)
              )
                n &&
                  (e.tagClass !== t.tagClass &&
                    n.push(
                      "[" +
                        t.name +
                        '] Expected tag class "' +
                        t.tagClass +
                        '", got "' +
                        e.tagClass +
                        '"',
                    ),
                  e.type !== t.type) &&
                  n.push(
                    "[" +
                      t.name +
                      '] Expected type "' +
                      t.type +
                      '", got "' +
                      e.type +
                      '"',
                  );
              else if (
                e.constructed === t.constructed ||
                void 0 === t.constructed
              ) {
                if (((i = !0), t.value && p.util.isArray(t.value)))
                  for (var a = 0, s = 0; i && s < t.value.length; ++s)
                    ((i = t.value[s].optional || !1),
                      e.value[a] &&
                        ((i = h.validate(e.value[a], t.value[s], r, n))
                          ? ++a
                          : t.value[s].optional && (i = !0)),
                      !i &&
                        n &&
                        n.push(
                          "[" +
                            t.name +
                            '] Tag class "' +
                            t.tagClass +
                            '", type "' +
                            t.type +
                            '" expected value length "' +
                            t.value.length +
                            '", got "' +
                            e.value.length +
                            '"',
                        ));
                i &&
                  r &&
                  (t.capture && (r[t.capture] = e.value), t.captureAsn1) &&
                  (r[t.captureAsn1] = e);
              } else
                n &&
                  n.push(
                    "[" +
                      t.name +
                      '] Expected constructed "' +
                      t.constructed +
                      '", got "' +
                      e.constructed +
                      '"',
                  );
              return i;
            }),
            /[^\\u0000-\\u00ff]/);
        h.prettyPrint = function (t, e, r) {
          for (
            var n,
              i = "",
              a = ((r = r || 2), 0 < (e = e || 0) && (i += "\n"), ""),
              s = 0;
            s < e * r;
            ++s
          )
            a += " ";
          switch (((i += a + "Tag: "), t.tagClass)) {
            case h.Class.UNIVERSAL:
              i += "Universal:";
              break;
            case h.Class.APPLICATION:
              i += "Application:";
              break;
            case h.Class.CONTEXT_SPECIFIC:
              i += "Context-Specific:";
              break;
            case h.Class.PRIVATE:
              i += "Private:";
          }
          if (t.tagClass === h.Class.UNIVERSAL)
            switch (((i += t.type), t.type)) {
              case h.Type.NONE:
                i += " (None)";
                break;
              case h.Type.BOOLEAN:
                i += " (Boolean)";
                break;
              case h.Type.BITSTRING:
                i += " (Bit string)";
                break;
              case h.Type.INTEGER:
                i += " (Integer)";
                break;
              case h.Type.OCTETSTRING:
                i += " (Octet string)";
                break;
              case h.Type.NULL:
                i += " (Null)";
                break;
              case h.Type.OID:
                i += " (Object Identifier)";
                break;
              case h.Type.ODESC:
                i += " (Object Descriptor)";
                break;
              case h.Type.EXTERNAL:
                i += " (External or Instance of)";
                break;
              case h.Type.REAL:
                i += " (Real)";
                break;
              case h.Type.ENUMERATED:
                i += " (Enumerated)";
                break;
              case h.Type.EMBEDDED:
                i += " (Embedded PDV)";
                break;
              case h.Type.UTF8:
                i += " (UTF8)";
                break;
              case h.Type.ROID:
                i += " (Relative Object Identifier)";
                break;
              case h.Type.SEQUENCE:
                i += " (Sequence)";
                break;
              case h.Type.SET:
                i += " (Set)";
                break;
              case h.Type.PRINTABLESTRING:
                i += " (Printable String)";
                break;
              case h.Type.IA5String:
                i += " (IA5String (ASCII))";
                break;
              case h.Type.UTCTIME:
                i += " (UTC time)";
                break;
              case h.Type.GENERALIZEDTIME:
                i += " (Generalized time)";
                break;
              case h.Type.BMPSTRING:
                i += " (BMP String)";
            }
          else i += t.type;
          if (
            ((i = i + "\n" + (a + "Constructed: " + t.constructed + "\n")),
            t.composed)
          ) {
            for (var o = 0, c = "", s = 0; s < t.value.length; ++s)
              void 0 !== t.value[s] &&
                ((o += 1),
                (c += h.prettyPrint(t.value[s], e + 1, r)),
                s + 1 < t.value.length) &&
                (c += ",");
            i += a + "Sub values: " + o + c;
          } else if (
            ((i += a + "Value: "),
            t.type === h.Type.OID &&
              ((i += n = h.derToOid(t.value)), p.pki) &&
              p.pki.oids &&
              n in p.pki.oids &&
              (i += " (" + p.pki.oids[n] + ") "),
            t.type === h.Type.INTEGER)
          )
            try {
              i += h.derToInteger(t.value);
            } catch (e) {
              i += "0x" + p.util.bytesToHex(t.value);
            }
          else
            t.type === h.Type.OCTETSTRING
              ? (u.test(t.value) || (i += "(" + t.value + ") "),
                (i += "0x" + p.util.bytesToHex(t.value)))
              : t.type === h.Type.UTF8
                ? (i += p.util.decodeUtf8(t.value))
                : t.type === h.Type.PRINTABLESTRING ||
                    t.type === h.Type.IA5String
                  ? (i += t.value)
                  : u.test(t.value)
                    ? (i += "0x" + p.util.bytesToHex(t.value))
                    : 0 === t.value.length
                      ? (i += "[null]")
                      : (i += t.value);
          return i;
        };
      }
      var a = "asn1";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/asn1", ["require", "module", "./util", "./oids"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(s) {
        function o(e, t, r) {
          for (var n, i, a, s, o, c, u, l = r.length(); 64 <= l;) {
            for (i = e.h0, a = e.h1, s = e.h2, o = e.h3, u = 0; u < 16; ++u)
              ((t[u] = r.getInt32Le()),
                (n = i + (o ^ (a & (s ^ o))) + d[u] + t[u]),
                (i = o),
                (o = s),
                (s = a),
                (a += (n << (c = p[u])) | (n >>> (32 - c))));
            for (; u < 32; ++u)
              ((n = i + (s ^ (o & (a ^ s))) + d[u] + t[f[u]]),
                (i = o),
                (o = s),
                (s = a),
                (a += (n << (c = p[u])) | (n >>> (32 - c))));
            for (; u < 48; ++u)
              ((n = i + (a ^ s ^ o) + d[u] + t[f[u]]),
                (i = o),
                (o = s),
                (s = a),
                (a += (n << (c = p[u])) | (n >>> (32 - c))));
            for (; u < 64; ++u)
              ((n = i + (s ^ (a | ~o)) + d[u] + t[f[u]]),
                (i = o),
                (o = s),
                (s = a),
                (a += (n << (c = p[u])) | (n >>> (32 - c))));
            ((e.h0 = (e.h0 + i) | 0),
              (e.h1 = (e.h1 + a) | 0),
              (e.h2 = (e.h2 + s) | 0),
              (e.h3 = (e.h3 + o) | 0),
              (l -= 64));
          }
        }
        var e = (s.md5 = s.md5 || {}),
          c =
            ((s.md = s.md || {}),
            (s.md.algorithms = s.md.algorithms || {}),
            ((s.md.md5 = s.md.algorithms.md5 = e).create = function () {
              if (!t) {
                ((c = String.fromCharCode(128)),
                  (c += s.util.fillString(String.fromCharCode(0), 64)),
                  (f = [
                    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 1, 6,
                    11, 0, 5, 10, 15, 4, 9, 14, 3, 8, 13, 2, 7, 12, 5, 8, 11,
                    14, 1, 4, 7, 10, 13, 0, 3, 6, 9, 12, 15, 2, 0, 7, 14, 5, 12,
                    3, 10, 1, 8, 15, 6, 13, 4, 11, 2, 9,
                  ]),
                  (p = [
                    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
                    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4,
                    11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 6,
                    10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
                  ]),
                  (d = new Array(64)));
                for (var e = 0; e < 64; ++e)
                  d[e] = Math.floor(4294967296 * Math.abs(Math.sin(e + 1)));
                t = !0;
              }
              var r = null,
                n = s.util.createBuffer(),
                i = new Array(16),
                a = {
                  algorithm: "md5",
                  blockLength: 64,
                  digestLength: 16,
                  messageLength: 0,
                  messageLength64: [0, 0],
                  start: function () {
                    return (
                      (a.messageLength = 0),
                      (a.messageLength64 = [0, 0]),
                      (n = s.util.createBuffer()),
                      (r = {
                        h0: 1732584193,
                        h1: 4023233417,
                        h2: 2562383102,
                        h3: 271733878,
                      }),
                      a
                    );
                  },
                };
              return (
                a.start(),
                (a.update = function (e, t) {
                  return (
                    "utf8" === t && (e = s.util.encodeUtf8(e)),
                    (a.messageLength += e.length),
                    (a.messageLength64[0] += (e.length / 4294967296) >>> 0),
                    (a.messageLength64[1] += e.length >>> 0),
                    n.putBytes(e),
                    o(r, i, n),
                    (2048 < n.read || 0 === n.length()) && n.compact(),
                    a
                  );
                }),
                (a.digest = function () {
                  var e = s.util.createBuffer(),
                    t =
                      (e.putBytes(n.bytes()),
                      e.putBytes(
                        c.substr(0, 64 - ((a.messageLength64[1] + 8) & 63)),
                      ),
                      e.putInt32Le(a.messageLength64[1] << 3),
                      e.putInt32Le(
                        (a.messageLength64[0] << 3) |
                          (a.messageLength64[0] >>> 28),
                      ),
                      { h0: r.h0, h1: r.h1, h2: r.h2, h3: r.h3 }),
                    e = (o(t, i, e), s.util.createBuffer());
                  return (
                    e.putInt32Le(t.h0),
                    e.putInt32Le(t.h1),
                    e.putInt32Le(t.h2),
                    e.putInt32Le(t.h3),
                    e
                  );
                }),
                a
              );
            }),
            null),
          f = null,
          p = null,
          d = null,
          t = !1;
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/md5", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = a
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined.md5)) {
              e.defined.md5 = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e.md5;
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(s) {
        function o(e, t, r) {
          for (var n, i, a, s, o, c, u, l = r.length(); 64 <= l;) {
            for (
              i = e.h0, a = e.h1, s = e.h2, o = e.h3, c = e.h4, u = 0;
              u < 16;
              ++u
            )
              ((n = r.getInt32()),
                (n =
                  ((i << 5) | (i >>> 27)) +
                  (o ^ (a & (s ^ o))) +
                  c +
                  1518500249 +
                  (t[u] = n)),
                (c = o),
                (o = s),
                (s = (a << 30) | (a >>> 2)),
                (a = i),
                (i = n));
            for (; u < 20; ++u)
              ((n = t[u - 3] ^ t[u - 8] ^ t[u - 14] ^ t[u - 16]),
                (n =
                  ((i << 5) | (i >>> 27)) +
                  (o ^ (a & (s ^ o))) +
                  c +
                  1518500249 +
                  (t[u] = n = (n << 1) | (n >>> 31))),
                (c = o),
                (o = s),
                (s = (a << 30) | (a >>> 2)),
                (a = i),
                (i = n));
            for (; u < 32; ++u)
              ((n = t[u - 3] ^ t[u - 8] ^ t[u - 14] ^ t[u - 16]),
                (n =
                  ((i << 5) | (i >>> 27)) +
                  (a ^ s ^ o) +
                  c +
                  1859775393 +
                  (t[u] = n = (n << 1) | (n >>> 31))),
                (c = o),
                (o = s),
                (s = (a << 30) | (a >>> 2)),
                (a = i),
                (i = n));
            for (; u < 40; ++u)
              ((n = t[u - 6] ^ t[u - 16] ^ t[u - 28] ^ t[u - 32]),
                (n =
                  ((i << 5) | (i >>> 27)) +
                  (a ^ s ^ o) +
                  c +
                  1859775393 +
                  (t[u] = n = (n << 2) | (n >>> 30))),
                (c = o),
                (o = s),
                (s = (a << 30) | (a >>> 2)),
                (a = i),
                (i = n));
            for (; u < 60; ++u)
              ((n = t[u - 6] ^ t[u - 16] ^ t[u - 28] ^ t[u - 32]),
                (n =
                  ((i << 5) | (i >>> 27)) +
                  ((a & s) | (o & (a ^ s))) +
                  c +
                  2400959708 +
                  (t[u] = n = (n << 2) | (n >>> 30))),
                (c = o),
                (o = s),
                (s = (a << 30) | (a >>> 2)),
                (a = i),
                (i = n));
            for (; u < 80; ++u)
              ((n = t[u - 6] ^ t[u - 16] ^ t[u - 28] ^ t[u - 32]),
                (n =
                  ((i << 5) | (i >>> 27)) +
                  (a ^ s ^ o) +
                  c +
                  3395469782 +
                  (t[u] = n = (n << 2) | (n >>> 30))),
                (c = o),
                (o = s),
                (s = (a << 30) | (a >>> 2)),
                (a = i),
                (i = n));
            ((e.h0 = (e.h0 + i) | 0),
              (e.h1 = (e.h1 + a) | 0),
              (e.h2 = (e.h2 + s) | 0),
              (e.h3 = (e.h3 + o) | 0),
              (e.h4 = (e.h4 + c) | 0),
              (l -= 64));
          }
        }
        var e = (s.sha1 = s.sha1 || {}),
          c =
            ((s.md = s.md || {}),
            (s.md.algorithms = s.md.algorithms || {}),
            ((s.md.sha1 = s.md.algorithms.sha1 = e).create = function () {
              t ||
                ((c = String.fromCharCode(128)),
                (c += s.util.fillString(String.fromCharCode(0), 64)),
                (t = !0));
              var r = null,
                n = s.util.createBuffer(),
                i = new Array(80),
                a = {
                  algorithm: "sha1",
                  blockLength: 64,
                  digestLength: 20,
                  messageLength: 0,
                  messageLength64: [0, 0],
                  start: function () {
                    return (
                      (a.messageLength = 0),
                      (a.messageLength64 = [0, 0]),
                      (n = s.util.createBuffer()),
                      (r = {
                        h0: 1732584193,
                        h1: 4023233417,
                        h2: 2562383102,
                        h3: 271733878,
                        h4: 3285377520,
                      }),
                      a
                    );
                  },
                };
              return (
                a.start(),
                (a.update = function (e, t) {
                  return (
                    "utf8" === t && (e = s.util.encodeUtf8(e)),
                    (a.messageLength += e.length),
                    (a.messageLength64[0] += (e.length / 4294967296) >>> 0),
                    (a.messageLength64[1] += e.length >>> 0),
                    n.putBytes(e),
                    o(r, i, n),
                    (2048 < n.read || 0 === n.length()) && n.compact(),
                    a
                  );
                }),
                (a.digest = function () {
                  var e = s.util.createBuffer(),
                    t =
                      (e.putBytes(n.bytes()),
                      e.putBytes(
                        c.substr(0, 64 - ((a.messageLength64[1] + 8) & 63)),
                      ),
                      e.putInt32(
                        (a.messageLength64[0] << 3) |
                          (a.messageLength64[0] >>> 28),
                      ),
                      e.putInt32(a.messageLength64[1] << 3),
                      { h0: r.h0, h1: r.h1, h2: r.h2, h3: r.h3, h4: r.h4 }),
                    e = (o(t, i, e), s.util.createBuffer());
                  return (
                    e.putInt32(t.h0),
                    e.putInt32(t.h1),
                    e.putInt32(t.h2),
                    e.putInt32(t.h3),
                    e.putInt32(t.h4),
                    e
                  );
                }),
                a
              );
            }),
            null),
          t = !1;
      }
      var a = "sha1";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/sha1", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(s) {
        function o(e, t, r) {
          for (
            var n, i, a, s, o, c, u, l, f, p, d, h, y = r.length();
            64 <= y;
          ) {
            for (s = 0; s < 16; ++s) t[s] = r.getInt32();
            for (; s < 64; ++s)
              ((n = t[s - 2]),
                (i = t[s - 15]),
                (t[s] =
                  ((n =
                    ((n >>> 17) | (n << 15)) ^
                    ((n >>> 19) | (n << 13)) ^
                    (n >>> 10)) +
                    t[s - 7] +
                    (i =
                      ((i >>> 7) | (i << 25)) ^
                      ((i >>> 18) | (i << 14)) ^
                      (i >>> 3)) +
                    t[s - 16]) |
                  0));
            for (
              o = e.h0,
                c = e.h1,
                u = e.h2,
                l = e.h3,
                f = e.h4,
                p = e.h5,
                d = e.h6,
                h = e.h7,
                s = 0;
              s < 64;
              ++s
            )
              ((a = (o & c) | (u & (o ^ c))),
                (n =
                  h +
                  (((f >>> 6) | (f << 26)) ^
                    ((f >>> 11) | (f << 21)) ^
                    ((f >>> 25) | (f << 7))) +
                  (d ^ (f & (p ^ d))) +
                  g[s] +
                  t[s]),
                (h = d),
                (d = p),
                (p = f),
                (f = (l + n) | 0),
                (l = u),
                (u = c),
                (o =
                  (n +
                    (i =
                      ((((c = o) >>> 2) | (o << 30)) ^
                        ((o >>> 13) | (o << 19)) ^
                        ((o >>> 22) | (o << 10))) +
                      a)) |
                  0));
            ((e.h0 = (e.h0 + o) | 0),
              (e.h1 = (e.h1 + c) | 0),
              (e.h2 = (e.h2 + u) | 0),
              (e.h3 = (e.h3 + l) | 0),
              (e.h4 = (e.h4 + f) | 0),
              (e.h5 = (e.h5 + p) | 0),
              (e.h6 = (e.h6 + d) | 0),
              (e.h7 = (e.h7 + h) | 0),
              (y -= 64));
          }
        }
        var e = (s.sha256 = s.sha256 || {}),
          c =
            ((s.md = s.md || {}),
            (s.md.algorithms = s.md.algorithms || {}),
            ((s.md.sha256 = s.md.algorithms.sha256 = e).create = function () {
              t ||
                ((c = String.fromCharCode(128)),
                (c += s.util.fillString(String.fromCharCode(0), 64)),
                (g = [
                  1116352408, 1899447441, 3049323471, 3921009573, 961987163,
                  1508970993, 2453635748, 2870763221, 3624381080, 310598401,
                  607225278, 1426881987, 1925078388, 2162078206, 2614888103,
                  3248222580, 3835390401, 4022224774, 264347078, 604807628,
                  770255983, 1249150122, 1555081692, 1996064986, 2554220882,
                  2821834349, 2952996808, 3210313671, 3336571891, 3584528711,
                  113926993, 338241895, 666307205, 773529912, 1294757372,
                  1396182291, 1695183700, 1986661051, 2177026350, 2456956037,
                  2730485921, 2820302411, 3259730800, 3345764771, 3516065817,
                  3600352804, 4094571909, 275423344, 430227734, 506948616,
                  659060556, 883997877, 958139571, 1322822218, 1537002063,
                  1747873779, 1955562222, 2024104815, 2227730452, 2361852424,
                  2428436474, 2756734187, 3204031479, 3329325298,
                ]),
                (t = !0));
              var r = null,
                n = s.util.createBuffer(),
                i = new Array(64),
                a = {
                  algorithm: "sha256",
                  blockLength: 64,
                  digestLength: 32,
                  messageLength: 0,
                  messageLength64: [0, 0],
                  start: function () {
                    return (
                      (a.messageLength = 0),
                      (a.messageLength64 = [0, 0]),
                      (n = s.util.createBuffer()),
                      (r = {
                        h0: 1779033703,
                        h1: 3144134277,
                        h2: 1013904242,
                        h3: 2773480762,
                        h4: 1359893119,
                        h5: 2600822924,
                        h6: 528734635,
                        h7: 1541459225,
                      }),
                      a
                    );
                  },
                };
              return (
                a.start(),
                (a.update = function (e, t) {
                  return (
                    "utf8" === t && (e = s.util.encodeUtf8(e)),
                    (a.messageLength += e.length),
                    (a.messageLength64[0] += (e.length / 4294967296) >>> 0),
                    (a.messageLength64[1] += e.length >>> 0),
                    n.putBytes(e),
                    o(r, i, n),
                    (2048 < n.read || 0 === n.length()) && n.compact(),
                    a
                  );
                }),
                (a.digest = function () {
                  var e = s.util.createBuffer(),
                    t =
                      (e.putBytes(n.bytes()),
                      e.putBytes(
                        c.substr(0, 64 - ((a.messageLength64[1] + 8) & 63)),
                      ),
                      e.putInt32(
                        (a.messageLength64[0] << 3) |
                          (a.messageLength64[0] >>> 28),
                      ),
                      e.putInt32(a.messageLength64[1] << 3),
                      {
                        h0: r.h0,
                        h1: r.h1,
                        h2: r.h2,
                        h3: r.h3,
                        h4: r.h4,
                        h5: r.h5,
                        h6: r.h6,
                        h7: r.h7,
                      }),
                    e = (o(t, i, e), s.util.createBuffer());
                  return (
                    e.putInt32(t.h0),
                    e.putInt32(t.h1),
                    e.putInt32(t.h2),
                    e.putInt32(t.h3),
                    e.putInt32(t.h4),
                    e.putInt32(t.h5),
                    e.putInt32(t.h6),
                    e.putInt32(t.h7),
                    e
                  );
                }),
                a
              );
            }),
            null),
          t = !1,
          g = null;
      }
      var a = "sha256";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/sha256", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(f) {
        function p(e, t, r) {
          for (
            var n,
              i,
              a,
              s,
              o,
              c,
              u,
              l,
              f,
              p,
              d,
              h,
              y,
              g,
              m,
              C,
              v,
              E,
              S,
              T,
              I,
              A,
              b,
              B,
              k,
              N = r.length();
            128 <= N;
          ) {
            for (I = 0; I < 16; ++I)
              ((t[I][0] = r.getInt32() >>> 0), (t[I][1] = r.getInt32() >>> 0));
            for (; I < 80; ++I)
              ((n =
                ((((A = (B = t[I - 2])[0]) >>> 19) | ((b = B[1]) << 13)) ^
                  ((b >>> 29) | (A << 3)) ^
                  (A >>> 6)) >>>
                0),
                (i =
                  (((A << 13) | (b >>> 19)) ^
                    ((b << 3) | (A >>> 29)) ^
                    ((A << 26) | (b >>> 6))) >>>
                  0),
                (a =
                  ((((A = (B = t[I - 15])[0]) >>> 1) | ((b = B[1]) << 31)) ^
                    ((A >>> 8) | (b << 24)) ^
                    (A >>> 7)) >>>
                  0),
                (B = t[I - 7]),
                (k = t[I - 16]),
                (b =
                  i +
                  B[1] +
                  (s =
                    (((A << 31) | (b >>> 1)) ^
                      ((A << 24) | (b >>> 8)) ^
                      ((A << 25) | (b >>> 7))) >>>
                    0) +
                  k[1]),
                (t[I][0] =
                  (n + B[0] + a + k[0] + ((b / 4294967296) >>> 0)) >>> 0),
                (t[I][1] = b >>> 0));
            for (
              o = e[0][0],
                c = e[0][1],
                u = e[1][0],
                l = e[1][1],
                f = e[2][0],
                p = e[2][1],
                d = e[3][0],
                h = e[3][1],
                y = e[4][0],
                g = e[4][1],
                m = e[5][0],
                C = e[5][1],
                v = e[6][0],
                E = e[6][1],
                S = e[7][0],
                T = e[7][1],
                I = 0;
              I < 80;
              ++I
            )
              ((b =
                T +
                ((((y << 18) | (g >>> 14)) ^
                  ((y << 14) | (g >>> 18)) ^
                  ((g << 23) | (y >>> 9))) >>>
                  0) +
                ((E ^ (g & (C ^ E))) >>> 0) +
                R[I][1] +
                t[I][1]),
                (n =
                  (S +
                    ((((y >>> 14) | (g << 18)) ^
                      ((y >>> 18) | (g << 14)) ^
                      ((g >>> 9) | (y << 23))) >>>
                      0) +
                    ((v ^ (y & (m ^ v))) >>> 0) +
                    R[I][0] +
                    t[I][0] +
                    ((b / 4294967296) >>> 0)) >>>
                  0),
                (i = b >>> 0),
                (a =
                  (((((o >>> 28) | (c << 4)) ^
                    ((c >>> 2) | (o << 30)) ^
                    ((c >>> 7) | (o << 25))) >>>
                    0) +
                    (((o & u) | (f & (o ^ u))) >>> 0) +
                    (((b =
                      ((((o << 4) | (c >>> 28)) ^
                        ((c << 30) | (o >>> 2)) ^
                        ((c << 25) | (o >>> 7))) >>>
                        0) +
                      (((c & l) | (p & (c ^ l))) >>> 0)) /
                      4294967296) >>>
                      0)) >>>
                  0),
                (s = b >>> 0),
                (S = v),
                (T = E),
                (v = m),
                (E = C),
                (m = y),
                (C = g),
                (y = (d + n + (((b = h + i) / 4294967296) >>> 0)) >>> 0),
                (g = b >>> 0),
                (d = f),
                (h = p),
                (f = u),
                (p = l),
                (u = o),
                (l = c),
                (o = (n + a + (((b = i + s) / 4294967296) >>> 0)) >>> 0),
                (c = b >>> 0));
            ((b = e[0][1] + c),
              (e[0][0] = (e[0][0] + o + ((b / 4294967296) >>> 0)) >>> 0),
              (e[0][1] = b >>> 0),
              (b = e[1][1] + l),
              (e[1][0] = (e[1][0] + u + ((b / 4294967296) >>> 0)) >>> 0),
              (e[1][1] = b >>> 0),
              (b = e[2][1] + p),
              (e[2][0] = (e[2][0] + f + ((b / 4294967296) >>> 0)) >>> 0),
              (e[2][1] = b >>> 0),
              (b = e[3][1] + h),
              (e[3][0] = (e[3][0] + d + ((b / 4294967296) >>> 0)) >>> 0),
              (e[3][1] = b >>> 0),
              (b = e[4][1] + g),
              (e[4][0] = (e[4][0] + y + ((b / 4294967296) >>> 0)) >>> 0),
              (e[4][1] = b >>> 0),
              (b = e[5][1] + C),
              (e[5][0] = (e[5][0] + m + ((b / 4294967296) >>> 0)) >>> 0),
              (e[5][1] = b >>> 0),
              (b = e[6][1] + E),
              (e[6][0] = (e[6][0] + v + ((b / 4294967296) >>> 0)) >>> 0),
              (e[6][1] = b >>> 0),
              (b = e[7][1] + T),
              (e[7][0] = (e[7][0] + S + ((b / 4294967296) >>> 0)) >>> 0),
              (e[7][1] = b >>> 0),
              (N -= 128));
          }
        }
        var e = (f.sha512 = f.sha512 || {}),
          t =
            ((f.md = f.md || {}),
            (f.md.algorithms = f.md.algorithms || {}),
            (f.md.sha512 = f.md.algorithms.sha512 = e),
            (f.sha384 = f.sha512.sha384 = f.sha512.sha384 || {})),
          d =
            ((t.create = function () {
              return e.create("SHA-384");
            }),
            (f.md.sha384 = f.md.algorithms.sha384 = t),
            (f.sha512.sha256 = f.sha512.sha256 || {
              create: function () {
                return e.create("SHA-512/256");
              },
            }),
            (f.md["sha512/256"] = f.md.algorithms["sha512/256"] =
              f.sha512.sha256),
            (f.sha512.sha224 = f.sha512.sha224 || {
              create: function () {
                return e.create("SHA-512/224");
              },
            }),
            (f.md["sha512/224"] = f.md.algorithms["sha512/224"] =
              f.sha512.sha224),
            (e.create = function (s) {
              if (
                (r ||
                  ((d = String.fromCharCode(128)),
                  (d += f.util.fillString(String.fromCharCode(0), 128)),
                  (R = [
                    [1116352408, 3609767458],
                    [1899447441, 602891725],
                    [3049323471, 3964484399],
                    [3921009573, 2173295548],
                    [961987163, 4081628472],
                    [1508970993, 3053834265],
                    [2453635748, 2937671579],
                    [2870763221, 3664609560],
                    [3624381080, 2734883394],
                    [310598401, 1164996542],
                    [607225278, 1323610764],
                    [1426881987, 3590304994],
                    [1925078388, 4068182383],
                    [2162078206, 991336113],
                    [2614888103, 633803317],
                    [3248222580, 3479774868],
                    [3835390401, 2666613458],
                    [4022224774, 944711139],
                    [264347078, 2341262773],
                    [604807628, 2007800933],
                    [770255983, 1495990901],
                    [1249150122, 1856431235],
                    [1555081692, 3175218132],
                    [1996064986, 2198950837],
                    [2554220882, 3999719339],
                    [2821834349, 766784016],
                    [2952996808, 2566594879],
                    [3210313671, 3203337956],
                    [3336571891, 1034457026],
                    [3584528711, 2466948901],
                    [113926993, 3758326383],
                    [338241895, 168717936],
                    [666307205, 1188179964],
                    [773529912, 1546045734],
                    [1294757372, 1522805485],
                    [1396182291, 2643833823],
                    [1695183700, 2343527390],
                    [1986661051, 1014477480],
                    [2177026350, 1206759142],
                    [2456956037, 344077627],
                    [2730485921, 1290863460],
                    [2820302411, 3158454273],
                    [3259730800, 3505952657],
                    [3345764771, 106217008],
                    [3516065817, 3606008344],
                    [3600352804, 1432725776],
                    [4094571909, 1467031594],
                    [275423344, 851169720],
                    [430227734, 3100823752],
                    [506948616, 1363258195],
                    [659060556, 3750685593],
                    [883997877, 3785050280],
                    [958139571, 3318307427],
                    [1322822218, 3812723403],
                    [1537002063, 2003034995],
                    [1747873779, 3602036899],
                    [1955562222, 1575990012],
                    [2024104815, 1125592928],
                    [2227730452, 2716904306],
                    [2361852424, 442776044],
                    [2428436474, 593698344],
                    [2756734187, 3733110249],
                    [3204031479, 2999351573],
                    [3329325298, 3815920427],
                    [3391569614, 3928383900],
                    [3515267271, 566280711],
                    [3940187606, 3454069534],
                    [4118630271, 4000239992],
                    [116418474, 1914138554],
                    [174292421, 2731055270],
                    [289380356, 3203993006],
                    [460393269, 320620315],
                    [685471733, 587496836],
                    [852142971, 1086792851],
                    [1017036298, 365543100],
                    [1126000580, 2618297676],
                    [1288033470, 3409855158],
                    [1501505948, 4234509866],
                    [1607167915, 987167468],
                    [1816402316, 1246189591],
                  ]),
                  (n = {
                    "SHA-512": [
                      [1779033703, 4089235720],
                      [3144134277, 2227873595],
                      [1013904242, 4271175723],
                      [2773480762, 1595750129],
                      [1359893119, 2917565137],
                      [2600822924, 725511199],
                      [528734635, 4215389547],
                      [1541459225, 327033209],
                    ],
                    "SHA-384": [
                      [3418070365, 3238371032],
                      [1654270250, 914150663],
                      [2438529370, 812702999],
                      [355462360, 4144912697],
                      [1731405415, 4290775857],
                      [2394180231, 1750603025],
                      [3675008525, 1694076839],
                      [1203062813, 3204075428],
                    ],
                    "SHA-512/256": [
                      [573645204, 4230739756],
                      [2673172387, 3360449730],
                      [596883563, 1867755857],
                      [2520282905, 1497426621],
                      [2519219938, 2827943907],
                      [3193839141, 1401305490],
                      [721525244, 746961066],
                      [246885852, 2177182882],
                    ],
                    "SHA-512/224": [
                      [2352822216, 424955298],
                      [1944164710, 2312950998],
                      [502970286, 855612546],
                      [1738396948, 1479516111],
                      [258812777, 2077511080],
                      [2011393907, 79989058],
                      [1067287976, 1780299464],
                      [286451373, 2446758561],
                    ],
                  }),
                  (r = !0)),
                (s = void 0 === s ? "SHA-512" : s) in n)
              ) {
                for (
                  var t = n[s],
                    o = null,
                    c = f.util.createBuffer(),
                    u = new Array(80),
                    e = 0;
                  e < 80;
                  ++e
                )
                  u[e] = new Array(2);
                var l = {
                  algorithm: s.replace("-", "").toLowerCase(),
                  blockLength: 128,
                  digestLength: 64,
                  messageLength: 0,
                  messageLength128: [0, 0, 0, 0],
                  start: function () {
                    ((l.messageLength = 0),
                      (l.messageLength128 = [0, 0, 0, 0]),
                      (c = f.util.createBuffer()),
                      (o = new Array(t.length)));
                    for (var e = 0; e < t.length; ++e) o[e] = t[e].slice(0);
                    return l;
                  },
                };
                return (
                  l.start(),
                  (l.update = function (e, t) {
                    ("utf8" === t && (e = f.util.encodeUtf8(e)),
                      (l.messageLength += e.length));
                    for (
                      var r = [((r = e.length) / 4294967296) >>> 0, r >>> 0],
                        n = 3;
                      0 <= n;
                      --n
                    )
                      ((l.messageLength128[n] += r[1]),
                        (r[1] =
                          r[0] + ((l.messageLength128[n] / 4294967296) >>> 0)),
                        (l.messageLength128[n] = l.messageLength128[n] >>> 0),
                        (r[0] = (r[1] / 4294967296) >>> 0));
                    return (
                      c.putBytes(e),
                      p(o, u, c),
                      (2048 < c.read || 0 === c.length()) && c.compact(),
                      l
                    );
                  }),
                  (l.digest = function () {
                    for (
                      var e = f.util.createBuffer(),
                        t =
                          (e.putBytes(c.bytes()),
                          e.putBytes(
                            d.substr(
                              0,
                              128 - ((l.messageLength128[3] + 16) & 127),
                            ),
                          ),
                          []),
                        r = 0;
                      r < 3;
                      ++r
                    )
                      t[r] =
                        (l.messageLength128[r] << 3) |
                        (l.messageLength128[r - 1] >>> 28);
                    ((t[3] = l.messageLength128[3] << 3),
                      e.putInt32(t[0]),
                      e.putInt32(t[1]),
                      e.putInt32(t[2]),
                      e.putInt32(t[3]));
                    for (var n = new Array(o.length), r = 0; r < o.length; ++r)
                      n[r] = o[r].slice(0);
                    p(n, u, e);
                    for (
                      var i = f.util.createBuffer(),
                        a =
                          "SHA-512" === s
                            ? n.length
                            : "SHA-384" === s
                              ? n.length - 2
                              : n.length - 4,
                        r = 0;
                      r < a;
                      ++r
                    )
                      (i.putInt32(n[r][0]),
                        (r === a - 1 && "SHA-512/224" === s) ||
                          i.putInt32(n[r][1]));
                    return i;
                  }),
                  l
                );
              }
              throw new Error("Invalid SHA-512 algorithm: " + s);
            }),
            null),
          r = !1,
          R = null,
          n = null;
      }
      var a = "sha512";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/sha512", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(e) {
        ((e.md = e.md || {}),
          (e.md.algorithms = { md5: e.md5, sha1: e.sha1, sha256: e.sha256 }),
          (e.md.md5 = e.md5),
          (e.md.sha1 = e.sha1),
          (e.md.sha256 = e.sha256));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/md",
        ["require", "module", "./md5", "./sha1", "./sha256", "./sha512"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.md)) {
                e.defined.md = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.md;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(u) {
        (u.hmac = u.hmac || {}).create = function () {
          var a = null,
            s = null,
            o = null,
            c = null,
            e = {
              start: function (e, t) {
                if (null !== e)
                  if ("string" == typeof e) {
                    if (!((e = e.toLowerCase()) in u.md.algorithms))
                      throw new Error('Unknown hash algorithm "' + e + '"');
                    s = u.md.algorithms[e].create();
                  } else s = e;
                if (null === t) t = a;
                else {
                  if ("string" == typeof t) t = u.util.createBuffer(t);
                  else if (u.util.isArray(t)) {
                    var r = t;
                    t = u.util.createBuffer();
                    for (var n = 0; n < r.length; ++n) t.putByte(r[n]);
                  }
                  (t.length() > s.blockLength &&
                    (s.start(), s.update(t.bytes()), (t = s.digest())),
                    (o = u.util.createBuffer()),
                    (c = u.util.createBuffer()));
                  for (var i = t.length(), n = 0; n < i; ++n) {
                    r = t.at(n);
                    (o.putByte(54 ^ r), c.putByte(92 ^ r));
                  }
                  if (i < s.blockLength)
                    for (r = s.blockLength - i, n = 0; n < r; ++n)
                      (o.putByte(54), c.putByte(92));
                  ((a = t), (o = o.bytes()), (c = c.bytes()));
                }
                (s.start(), s.update(o));
              },
              update: function (e) {
                s.update(e);
              },
              getMac: function () {
                var e = s.digest().bytes();
                return (s.start(), s.update(c), s.update(e), s.digest());
              },
            };
          return ((e.digest = e.getMac), e);
        };
      }
      var a = "hmac";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/hmac", ["require", "module", "./md", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(y) {
        function a(e) {
          function t(e, t) {
            return " " + t;
          }
          for (var r = e.name + ": ", n = [], i = 0; i < e.values.length; ++i)
            n.push(e.values[i].replace(/^(\S+\r\n)/, t));
          r += n.join(",") + "\r\n";
          for (var a, s = 0, o = -1, i = 0; i < r.length; ++i, ++s)
            65 < s && -1 !== o
              ? ((r =
                  "," === (a = r[o])
                    ? (++o, r.substr(0, o) + "\r\n " + r.substr(o))
                    : r.substr(0, o) + "\r\n" + a + r.substr(o + 1)),
                (s = i - o - 1),
                (o = -1),
                ++i)
              : (" " !== r[i] && "\t" !== r[i] && "," !== r[i]) || (o = i);
          return r;
        }
        var e = (y.pem = y.pem || {});
        ((e.encode = function (e, t) {
          t = t || {};
          var r,
            n = "-----BEGIN " + e.type + "-----\r\n";
          if (
            (e.procType &&
              (n += a(
                (r = {
                  name: "Proc-Type",
                  values: [String(e.procType.version), e.procType.type],
                }),
              )),
            e.contentDomain &&
              (n += a(
                (r = { name: "Content-Domain", values: [e.contentDomain] }),
              )),
            e.dekInfo &&
              ((r = { name: "DEK-Info", values: [e.dekInfo.algorithm] }),
              e.dekInfo.parameters && r.values.push(e.dekInfo.parameters),
              (n += a(r))),
            e.headers)
          )
            for (var i = 0; i < e.headers.length; ++i) n += a(e.headers[i]);
          return (
            e.procType && (n += "\r\n"),
            (n =
              (n += y.util.encode64(e.body, t.maxline || 64) + "\r\n") +
              ("-----END " + e.type + "-----\r\n"))
          );
        }),
          (e.decode = function (e) {
            for (
              var t,
                r = [],
                n =
                  /\s*-----BEGIN ([A-Z0-9- ]+)-----\r?\n?([\x21-\x7e\s]+?(?:\r?\n\r?\n))?([:A-Za-z0-9+\/=\s]+?)-----END \1-----/g,
                i = /([\x21-\x7e]+):\s*([\x21-\x7e\s^:]+)/,
                a = /\r?\n/;
              (t = n.exec(e));
            ) {
              var s = {
                type: t[1],
                procType: null,
                contentDomain: null,
                dekInfo: null,
                headers: [],
                body: y.util.decode64(t[3]),
              };
              if ((r.push(s), t[2])) {
                for (var o = t[2].split(a), c = 0; t && c < o.length;) {
                  for (
                    var u = o[c].replace(/\s+$/, ""), l = c + 1;
                    l < o.length;
                    ++l
                  ) {
                    var f = o[l];
                    if (!/\s/.test(f[0])) break;
                    ((u += f), (c = l));
                  }
                  if ((t = u.match(i))) {
                    for (
                      var p = { name: t[1], values: [] },
                        d = t[2].split(","),
                        h = 0;
                      h < d.length;
                      ++h
                    )
                      p.values.push(d[h].replace(/^\s+/, ""));
                    if (s.procType)
                      if (s.contentDomain || "Content-Domain" !== p.name)
                        if (s.dekInfo || "DEK-Info" !== p.name)
                          s.headers.push(p);
                        else {
                          if (0 === p.values.length)
                            throw new Error(
                              'Invalid PEM formatted message. The "DEK-Info" header must have at least one subfield.',
                            );
                          s.dekInfo = {
                            algorithm: d[0],
                            parameters: d[1] || null,
                          };
                        }
                      else s.contentDomain = d[0] || "";
                    else {
                      if ("Proc-Type" !== p.name)
                        throw new Error(
                          'Invalid PEM formatted message. The first encapsulated header must be "Proc-Type".',
                        );
                      if (2 !== p.values.length)
                        throw new Error(
                          'Invalid PEM formatted message. The "Proc-Type" header must have two subfields.',
                        );
                      s.procType = { version: d[0], type: d[1] };
                    }
                  }
                  ++c;
                }
                if ("ENCRYPTED" === s.procType && !s.dekInfo)
                  throw new Error(
                    'Invalid PEM formatted message. The "DEK-Info" header must be present if "Proc-Type" is "ENCRYPTED".',
                  );
              }
            }
            if (0 === r.length)
              throw new Error("Invalid PEM formatted message.");
            return r;
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/pem", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = a
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined.pem)) {
              e.defined.pem = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e.pem;
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(a) {
        function e(e, t) {
          a.cipher.registerAlgorithm(e, function () {
            return new a.des.Algorithm(e, t);
          });
        }
        function n(e, t, r, n) {
          var i = 32 === e.length ? 3 : 9,
            a =
              3 == i
                ? n
                  ? [30, -2, -2]
                  : [0, 32, 2]
                : n
                  ? [94, 62, -2, 32, 64, 2, 30, -2, -2]
                  : [0, 32, 2, 62, 30, -2, 64, 96, 2],
            s = t[0];
          ((s =
            ((s =
              (s =
                (s =
                  (s =
                    (s ^= (d = 252645135 & ((s >>> 4) ^ (h = t[1]))) << 4) ^
                    ((d = 65535 & ((s >>> 16) ^ (h ^= d))) << 16)) ^
                  (d = 858993459 & (((h ^= d) >>> 2) ^ s))) ^
                (d = 16711935 & (((h ^= d << 2) >>> 8) ^ s))) ^
              ((d = 1431655765 & ((s >>> 1) ^ (h ^= d << 8))) << 1)) <<
              1) |
            (s >>> 31)),
            (h = ((h ^= d) << 1) | (h >>> 31)));
          for (var o = 0; o < i; o += 3) {
            for (var c = a[o + 1], u = a[o + 2], l = a[o]; l != c; l += u)
              var f = h ^ e[l],
                p = ((h >>> 4) | (h << 28)) ^ e[l + 1],
                d = s,
                s = h,
                h =
                  d ^
                  (g[(f >>> 24) & 63] |
                    C[(f >>> 16) & 63] |
                    E[(f >>> 8) & 63] |
                    T[63 & f] |
                    y[(p >>> 24) & 63] |
                    m[(p >>> 16) & 63] |
                    v[(p >>> 8) & 63] |
                    S[63 & p]);
            ((d = s), (s = h), (h = d));
          }
          ((h = (h >>> 1) | (h << 31)),
            (h =
              (h =
                (h =
                  (h =
                    (h ^= d =
                      1431655765 & (((s = (s >>> 1) | (s << 31)) >>> 1) ^ h)) ^
                    ((d = 16711935 & ((h >>> 8) ^ (s ^= d << 1))) << 8)) ^
                  ((d = 858993459 & ((h >>> 2) ^ (s ^= d))) << 2)) ^
                (d = 65535 & (((s ^= d) >>> 16) ^ h))) ^
              (d = 252645135 & (((s ^= d << 16) >>> 4) ^ h))),
            (r[0] = s ^= d << 4),
            (r[1] = h));
        }
        function i(e) {
          var t = "DES-" + ((e = e || {}).mode || "CBC").toUpperCase(),
            n = e.decrypt
              ? a.cipher.createDecipher(t, e.key)
              : a.cipher.createCipher(t, e.key),
            i = n.start;
          return (
            (n.start = function (e, t) {
              var r = null;
              (t instanceof a.util.ByteBuffer && ((r = t), (t = {})),
                ((t = t || {}).output = r),
                (t.iv = e),
                i.call(n, t));
            }),
            n
          );
        }
        ((a.des = a.des || {}),
          (a.des.startEncrypting = function (e, t, r, n) {
            e = i({
              key: e,
              output: r,
              decrypt: !1,
              mode: n || (null === t ? "ECB" : "CBC"),
            });
            return (e.start(t), e);
          }),
          (a.des.createEncryptionCipher = function (e, t) {
            return i({ key: e, output: null, decrypt: !1, mode: t });
          }),
          (a.des.startDecrypting = function (e, t, r, n) {
            e = i({
              key: e,
              output: r,
              decrypt: !0,
              mode: n || (null === t ? "ECB" : "CBC"),
            });
            return (e.start(t), e);
          }),
          (a.des.createDecryptionCipher = function (e, t) {
            return i({ key: e, output: null, decrypt: !0, mode: t });
          }),
          (a.des.Algorithm = function (e, t) {
            var r = this;
            ((r.name = e),
              (r.mode = new t({
                blockSize: 8,
                cipher: {
                  encrypt: function (e, t) {
                    return n(r._keys, e, t, !1);
                  },
                  decrypt: function (e, t) {
                    return n(r._keys, e, t, !0);
                  },
                },
              })),
              (r._init = !1));
          }),
          (a.des.Algorithm.prototype.initialize = function (e) {
            if (!this._init) {
              e = a.util.createBuffer(e.key);
              if (0 === this.name.indexOf("3DES") && 24 !== e.length())
                throw new Error(
                  "Invalid Triple-DES key size: " + 8 * e.length(),
                );
              ((this._keys = (function (e) {
                for (
                  var t = [
                      0, 4, 536870912, 536870916, 65536, 65540, 536936448,
                      536936452, 512, 516, 536871424, 536871428, 66048, 66052,
                      536936960, 536936964,
                    ],
                    r = [
                      0, 1, 1048576, 1048577, 67108864, 67108865, 68157440,
                      68157441, 256, 257, 1048832, 1048833, 67109120, 67109121,
                      68157696, 68157697,
                    ],
                    n = [
                      0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272,
                      0, 8, 2048, 2056, 16777216, 16777224, 16779264, 16779272,
                    ],
                    i = [
                      0, 2097152, 134217728, 136314880, 8192, 2105344,
                      134225920, 136323072, 131072, 2228224, 134348800,
                      136445952, 139264, 2236416, 134356992, 136454144,
                    ],
                    a = [
                      0, 262144, 16, 262160, 0, 262144, 16, 262160, 4096,
                      266240, 4112, 266256, 4096, 266240, 4112, 266256,
                    ],
                    s = [
                      0, 1024, 32, 1056, 0, 1024, 32, 1056, 33554432, 33555456,
                      33554464, 33555488, 33554432, 33555456, 33554464,
                      33555488,
                    ],
                    o = [
                      0, 268435456, 524288, 268959744, 2, 268435458, 524290,
                      268959746, 0, 268435456, 524288, 268959744, 2, 268435458,
                      524290, 268959746,
                    ],
                    c = [
                      0, 65536, 2048, 67584, 536870912, 536936448, 536872960,
                      536938496, 131072, 196608, 133120, 198656, 537001984,
                      537067520, 537004032, 537069568,
                    ],
                    u = [
                      0, 262144, 0, 262144, 2, 262146, 2, 262146, 33554432,
                      33816576, 33554432, 33816576, 33554434, 33816578,
                      33554434, 33816578,
                    ],
                    l = [
                      0, 268435456, 8, 268435464, 0, 268435456, 8, 268435464,
                      1024, 268436480, 1032, 268436488, 1024, 268436480, 1032,
                      268436488,
                    ],
                    f = [
                      0, 32, 0, 32, 1048576, 1048608, 1048576, 1048608, 8192,
                      8224, 8192, 8224, 1056768, 1056800, 1056768, 1056800,
                    ],
                    p = [
                      0, 16777216, 512, 16777728, 2097152, 18874368, 2097664,
                      18874880, 67108864, 83886080, 67109376, 83886592,
                      69206016, 85983232, 69206528, 85983744,
                    ],
                    d = [
                      0, 4096, 134217728, 134221824, 524288, 528384, 134742016,
                      134746112, 16, 4112, 134217744, 134221840, 524304, 528400,
                      134742032, 134746128,
                    ],
                    h = [
                      0, 4, 256, 260, 0, 4, 256, 260, 1, 5, 257, 261, 1, 5, 257,
                      261,
                    ],
                    y = 8 < e.length() ? 3 : 1,
                    g = [],
                    m = [0, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0],
                    C = 0,
                    v = 0;
                  v < y;
                  v++
                ) {
                  var E = e.getInt32();
                  ((T =
                    ((E =
                      (E =
                        (E =
                          (E =
                            (E =
                              (E =
                                (E ^=
                                  (T =
                                    252645135 &
                                    ((E >>> 4) ^ (I = e.getInt32()))) << 4) ^
                                (T = 65535 & (((I ^= T) >>> -16) ^ E))) ^
                              ((T =
                                858993459 & ((E >>> 2) ^ (I ^= T << -16))) <<
                                2)) ^ (T = 65535 & (((I ^= T) >>> -16) ^ E))) ^
                          ((T = 1431655765 & ((E >>> 1) ^ (I ^= T << -16))) <<
                            1)) ^ (T = 16711935 & (((I ^= T) >>> 8) ^ E))) ^
                      ((T = 1431655765 & ((E >>> 1) ^ (I ^= T << 8))) << 1)) <<
                      8) |
                    (((I ^= T) >>> 20) & 240)),
                    (E =
                      (I << 24) |
                      ((I << 8) & 16711680) |
                      ((I >>> 8) & 65280) |
                      ((I >>> 24) & 240)),
                    (I = T));
                  for (var S = 0; S < m.length; ++S) {
                    var T,
                      I = m[S]
                        ? ((E = (E << 2) | (E >>> 26)), (I << 2) | (I >>> 26))
                        : ((E = (E << 1) | (E >>> 27)), (I << 1) | (I >>> 27)),
                      A =
                        t[(E &= -15) >>> 28] |
                        r[(E >>> 24) & 15] |
                        n[(E >>> 20) & 15] |
                        i[(E >>> 16) & 15] |
                        a[(E >>> 12) & 15] |
                        s[(E >>> 8) & 15] |
                        o[(E >>> 4) & 15],
                      b =
                        c[(I &= -15) >>> 28] |
                        u[(I >>> 24) & 15] |
                        l[(I >>> 20) & 15] |
                        f[(I >>> 16) & 15] |
                        p[(I >>> 12) & 15] |
                        d[(I >>> 8) & 15] |
                        h[(I >>> 4) & 15];
                    ((g[C++] = A ^ (T = 65535 & ((b >>> 16) ^ A))),
                      (g[C++] = b ^ (T << 16)));
                  }
                }
                return g;
              })(e)),
                (this._init = !0));
            }
          }),
          e("DES-ECB", a.cipher.modes.ecb),
          e("DES-CBC", a.cipher.modes.cbc),
          e("DES-CFB", a.cipher.modes.cfb),
          e("DES-OFB", a.cipher.modes.ofb),
          e("DES-CTR", a.cipher.modes.ctr),
          e("3DES-ECB", a.cipher.modes.ecb),
          e("3DES-CBC", a.cipher.modes.cbc),
          e("3DES-CFB", a.cipher.modes.cfb),
          e("3DES-OFB", a.cipher.modes.ofb),
          e("3DES-CTR", a.cipher.modes.ctr));
        var y = [
            16843776, 0, 65536, 16843780, 16842756, 66564, 4, 65536, 1024,
            16843776, 16843780, 1024, 16778244, 16842756, 16777216, 4, 1028,
            16778240, 16778240, 66560, 66560, 16842752, 16842752, 16778244,
            65540, 16777220, 16777220, 65540, 0, 1028, 66564, 16777216, 65536,
            16843780, 4, 16842752, 16843776, 16777216, 16777216, 1024, 16842756,
            65536, 66560, 16777220, 1024, 4, 16778244, 66564, 16843780, 65540,
            16842752, 16778244, 16777220, 1028, 66564, 16843776, 1028, 16778240,
            16778240, 0, 65540, 66560, 0, 16842756,
          ],
          g = [
            -2146402272, -2147450880, 32768, 1081376, 1048576, 32, -2146435040,
            -2147450848, -2147483616, -2146402272, -2146402304, -2147483648,
            -2147450880, 1048576, 32, -2146435040, 1081344, 1048608,
            -2147450848, 0, -2147483648, 32768, 1081376, -2146435072, 1048608,
            -2147483616, 0, 1081344, 32800, -2146402304, -2146435072, 32800, 0,
            1081376, -2146435040, 1048576, -2147450848, -2146435072,
            -2146402304, 32768, -2146435072, -2147450880, 32, -2146402272,
            1081376, 32, 32768, -2147483648, 32800, -2146402304, 1048576,
            -2147483616, 1048608, -2147450848, -2147483616, 1048608, 1081344, 0,
            -2147450880, 32800, -2147483648, -2146435040, -2146402272, 1081344,
          ],
          m = [
            520, 134349312, 0, 134348808, 134218240, 0, 131592, 134218240,
            131080, 134217736, 134217736, 131072, 134349320, 131080, 134348800,
            520, 134217728, 8, 134349312, 512, 131584, 134348800, 134348808,
            131592, 134218248, 131584, 131072, 134218248, 8, 134349320, 512,
            134217728, 134349312, 134217728, 131080, 520, 131072, 134349312,
            134218240, 0, 512, 131080, 134349320, 134218240, 134217736, 512, 0,
            134348808, 134218248, 131072, 134217728, 134349320, 8, 131592,
            131584, 134217736, 134348800, 134218248, 520, 134348800, 131592, 8,
            134348808, 131584,
          ],
          C = [
            8396801, 8321, 8321, 128, 8396928, 8388737, 8388609, 8193, 0,
            8396800, 8396800, 8396929, 129, 0, 8388736, 8388609, 1, 8192,
            8388608, 8396801, 128, 8388608, 8193, 8320, 8388737, 1, 8320,
            8388736, 8192, 8396928, 8396929, 129, 8388736, 8388609, 8396800,
            8396929, 129, 0, 0, 8396800, 8320, 8388736, 8388737, 1, 8396801,
            8321, 8321, 128, 8396929, 129, 1, 8192, 8388609, 8193, 8396928,
            8388737, 8193, 8320, 8388608, 8396801, 128, 8388608, 8192, 8396928,
          ],
          v = [
            256, 34078976, 34078720, 1107296512, 524288, 256, 1073741824,
            34078720, 1074266368, 524288, 33554688, 1074266368, 1107296512,
            1107820544, 524544, 1073741824, 33554432, 1074266112, 1074266112, 0,
            1073742080, 1107820800, 1107820800, 33554688, 1107820544,
            1073742080, 0, 1107296256, 34078976, 33554432, 1107296256, 524544,
            524288, 1107296512, 256, 33554432, 1073741824, 34078720, 1107296512,
            1074266368, 33554688, 1073741824, 1107820544, 34078976, 1074266368,
            256, 33554432, 1107820544, 1107820800, 524544, 1107296256,
            1107820800, 34078720, 0, 1074266112, 1107296256, 524544, 33554688,
            1073742080, 524288, 0, 1074266112, 34078976, 1073742080,
          ],
          E = [
            536870928, 541065216, 16384, 541081616, 541065216, 16, 541081616,
            4194304, 536887296, 4210704, 4194304, 536870928, 4194320, 536887296,
            536870912, 16400, 0, 4194320, 536887312, 16384, 4210688, 536887312,
            16, 541065232, 541065232, 0, 4210704, 541081600, 16400, 4210688,
            541081600, 536870912, 536887296, 16, 541065232, 4210688, 541081616,
            4194304, 16400, 536870928, 4194304, 536887296, 536870912, 16400,
            536870928, 541081616, 4210688, 541065216, 4210704, 541081600, 0,
            541065232, 16, 16384, 541065216, 4210704, 16384, 4194320, 536887312,
            0, 541081600, 536870912, 4194320, 536887312,
          ],
          S = [
            2097152, 69206018, 67110914, 0, 2048, 67110914, 2099202, 69208064,
            69208066, 2097152, 0, 67108866, 2, 67108864, 69206018, 2050,
            67110912, 2099202, 2097154, 67110912, 67108866, 69206016, 69208064,
            2097154, 69206016, 2048, 2050, 69208066, 2099200, 2, 67108864,
            2099200, 67108864, 2099200, 2097152, 67110914, 67110914, 69206018,
            69206018, 2, 2097154, 67108864, 67110912, 2097152, 69208064, 2050,
            2099202, 69208064, 2050, 67108866, 69208066, 69206016, 2099200, 0,
            2, 69208066, 0, 2099202, 69206016, 2048, 67108866, 67110912, 2048,
            2097154,
          ],
          T = [
            268439616, 4096, 262144, 268701760, 268435456, 268439616, 64,
            268435456, 262208, 268697600, 268701760, 266240, 268701696, 266304,
            4096, 64, 268697600, 268435520, 268439552, 4160, 266240, 262208,
            268697664, 268701696, 4160, 0, 0, 268697664, 268435520, 268439552,
            266304, 262144, 266304, 262144, 268701696, 4096, 64, 268697664,
            4096, 266304, 268439552, 64, 268435520, 268697600, 268697664,
            268435456, 262144, 268439616, 0, 268701760, 262208, 268435520,
            268697600, 268439552, 268439616, 0, 268701760, 266240, 266240, 4160,
            4160, 262208, 268435456, 268701696,
          ];
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/des",
        ["require", "module", "./cipher", "./cipherModes", "./util"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.des)) {
                e.defined.des = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.des;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(v) {
        var e = (v.pkcs5 = v.pkcs5 || {});
        v.pbkdf2 = e.pbkdf2 = function (e, t, r, n, i, a) {
          function s() {
            if (p < g) return a(null, y);
            (h.start(null, null),
              h.update(t),
              h.update(v.util.int32ToBytes(g)),
              (m = f = h.digest().getBytes()),
              (C = 2),
              o());
          }
          function o() {
            if (C <= r)
              return (
                h.start(null, null),
                h.update(f),
                (l = h.digest().getBytes()),
                (m = v.util.xorBytes(m, l, c)),
                (f = l),
                ++C,
                v.util.setImmediate(o)
              );
            ((y += g < p ? m : m.substr(0, d)), ++g, s());
          }
          "function" == typeof i && ((a = i), (i = null));
          var c = (i = null == i ? v.md.sha1.create() : i).digestLength;
          if (4294967295 * c < n) {
            var u = new Error("Derived key is too long.");
            if (a) return a(u);
            throw u;
          }
          var l,
            f,
            p = Math.ceil(n / c),
            d = n - (p - 1) * c,
            h = v.hmac.create(),
            y = (h.start(i, e), "");
          if (!a) {
            for (var g = 1; g <= p; ++g) {
              (h.start(null, null),
                h.update(t),
                h.update(v.util.int32ToBytes(g)));
              for (var m = (f = h.digest().getBytes()), C = 2; C <= r; ++C)
                (h.start(null, null),
                  h.update(f),
                  (l = h.digest().getBytes()),
                  (m = v.util.xorBytes(m, l, c)),
                  (f = l));
              y += g < p ? m : m.substr(0, d);
            }
            return y;
          }
          g = 1;
          s();
        };
      }
      var a = "pbkdf2";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/pbkdf2",
        ["require", "module", "./hmac", "./md", "./util"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(f) {
        var e =
            "undefined" != typeof process &&
            process.versions &&
            process.versions.node,
          a = null;
        (f.disableNativeCode ||
          !e ||
          process.versions["node-webkit"] ||
          (a = o("crypto")),
          ((f.prng = f.prng || {}).create = function (e) {
            function u() {
              for (
                var e = l.plugin.md.create(),
                  t =
                    (e.update(l.pools[0].digest().getBytes()),
                    l.pools[0].start(),
                    1),
                  r = 1;
                r < 32;
                ++r
              )
                (t = 31 === t ? 2147483648 : t << 2) % l.reseeds == 0 &&
                  (e.update(l.pools[r].digest().getBytes()),
                  l.pools[r].start());
              var n = e.digest().getBytes(),
                i = (e.start(), e.update(n), e.digest().getBytes());
              ((l.key = l.plugin.formatKey(n)),
                (l.seed = l.plugin.formatSeed(i)),
                (l.reseeds = 4294967295 === l.reseeds ? 0 : l.reseeds + 1),
                (l.generated = 0));
            }
            function r(e) {
              var t,
                r = null,
                n =
                  ("undefined" != typeof window &&
                    (t = window.crypto || window.msCrypto) &&
                    t.getRandomValues &&
                    (r = function (e) {
                      return t.getRandomValues(e);
                    }),
                  f.util.createBuffer());
              if (r)
                for (; n.length() < e;) {
                  var i = Math.max(1, Math.min(e - n.length(), 65536) / 4),
                    a = new Uint32Array(Math.floor(i));
                  try {
                    r(a);
                    for (var s = 0; s < a.length; ++s) n.putInt32(a[s]);
                  } catch (e) {
                    if (!(
                      "undefined" != typeof QuotaExceededError &&
                      e instanceof QuotaExceededError
                    ))
                      throw e;
                  }
                }
              if (n.length() < e)
                for (
                  var o, c, u = Math.floor(65536 * Math.random());
                  n.length() < e;
                )
                  for (
                    var l,
                      u =
                        4294967295 &
                        (l =
                          (2147483647 &
                            (l =
                              (l = 16807 * (65535 & u)) +
                              ((32767 & (o = 16807 * (u >> 16))) << 16) +
                              (o >> 15))) +
                          (l >> 31)),
                      s = 0;
                    s < 3;
                    ++s
                  )
                    ((c = u >>> (s << 3)),
                      (c ^= Math.floor(256 * Math.random())),
                      n.putByte(String.fromCharCode(255 & c)));
              return n.getBytes(e);
            }
            for (
              var l = {
                  plugin: e,
                  key: null,
                  seed: null,
                  time: null,
                  reseeds: 0,
                  generated: 0,
                },
                t = e.md,
                n = new Array(32),
                i = 0;
              i < 32;
              ++i
            )
              n[i] = t.create();
            return (
              (l.pools = n),
              (l.pool = 0),
              (l.generate = function (r, n) {
                if (!n) return l.generateSync(r);
                var i = l.plugin.cipher,
                  a = l.plugin.increment,
                  s = l.plugin.formatKey,
                  o = l.plugin.formatSeed,
                  c = f.util.createBuffer();
                ((l.key = null),
                  (function t(e) {
                    return e
                      ? n(e)
                      : c.length() >= r
                        ? n(null, c.getBytes(r))
                        : (1048575 < l.generated && (l.key = null),
                          null === l.key
                            ? f.util.nextTick(function () {
                                var e,
                                  r = t;
                                32 <= l.pools[0].messageLength
                                  ? (u(), r())
                                  : ((e = (32 - l.pools[0].messageLength) << 5),
                                    l.seedFile(e, function (e, t) {
                                      if (e) return r(e);
                                      (l.collect(t), u(), r());
                                    }));
                              })
                            : ((e = i(l.key, l.seed)),
                              (l.generated += e.length),
                              c.putBytes(e),
                              (l.key = s(i(l.key, a(l.seed)))),
                              (l.seed = o(i(l.key, l.seed))),
                              void f.util.setImmediate(t)));
                  })());
              }),
              (l.generateSync = function (e) {
                for (
                  var t = l.plugin.cipher,
                    r = l.plugin.increment,
                    n = l.plugin.formatKey,
                    i = l.plugin.formatSeed,
                    a = ((l.key = null), f.util.createBuffer());
                  a.length() < e;
                ) {
                  (1048575 < l.generated && (l.key = null),
                    null === l.key &&
                      (function () {
                        if (32 <= l.pools[0].messageLength) return u();
                        var e = (32 - l.pools[0].messageLength) << 5;
                        (l.collect(l.seedFileSync(e)), u());
                      })());
                  var s = t(l.key, l.seed);
                  ((l.generated += s.length),
                    a.putBytes(s),
                    (l.key = n(t(l.key, r(l.seed)))),
                    (l.seed = i(t(l.key, l.seed))));
                }
                return a.getBytes(e);
              }),
              a
                ? ((l.seedFile = function (e, r) {
                    a.randomBytes(e, function (e, t) {
                      if (e) return r(e);
                      r(null, t.toString());
                    });
                  }),
                  (l.seedFileSync = function (e) {
                    return a.randomBytes(e).toString();
                  }))
                : ((l.seedFile = function (e, t) {
                    try {
                      t(null, r(e));
                    } catch (e) {
                      t(e);
                    }
                  }),
                  (l.seedFileSync = r)),
              (l.collect = function (e) {
                for (var t = e.length, r = 0; r < t; ++r)
                  (l.pools[l.pool].update(e.substr(r, 1)),
                    (l.pool = 31 === l.pool ? 0 : l.pool + 1));
              }),
              (l.collectInt = function (e, t) {
                for (var r = "", n = 0; n < t; n += 8)
                  r += String.fromCharCode((e >> n) & 255);
                l.collect(r);
              }),
              (l.registerWorker = function (r) {
                r === self
                  ? (l.seedFile = function (e, r) {
                      (self.addEventListener("message", function e(t) {
                        t = t.data;
                        t.forge &&
                          t.forge.prng &&
                          (self.removeEventListener("message", e),
                          r(t.forge.prng.err, t.forge.prng.bytes));
                      }),
                        self.postMessage({ forge: { prng: { needed: e } } }));
                    })
                  : r.addEventListener("message", function (e) {
                      e = e.data;
                      e.forge &&
                        e.forge.prng &&
                        l.seedFile(e.forge.prng.needed, function (e, t) {
                          r.postMessage({
                            forge: { prng: { err: e, bytes: t } },
                          });
                        });
                    });
              }),
              l
            );
          }));
      }
      var a = "prng";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/prng", ["require", "module", "./md", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(n) {
        if (!n.random || !n.random.getBytes) {
          var e = "undefined" != typeof jQuery ? jQuery : null;
          function t() {
            var r = n.prng.create(i);
            return (
              (r.getBytes = function (e, t) {
                return r.generate(e, t);
              }),
              (r.getBytesSync = function (e) {
                return r.generate(e);
              }),
              r
            );
          }
          var r,
            i = {},
            a = new Array(4),
            s = n.util.createBuffer(),
            o =
              ((i.formatKey = function (e) {
                var t = n.util.createBuffer(e);
                return (
                  ((e = new Array(4))[0] = t.getInt32()),
                  (e[1] = t.getInt32()),
                  (e[2] = t.getInt32()),
                  (e[3] = t.getInt32()),
                  n.aes._expandKey(e, !1)
                );
              }),
              (i.formatSeed = function (e) {
                var t = n.util.createBuffer(e);
                return (
                  ((e = new Array(4))[0] = t.getInt32()),
                  (e[1] = t.getInt32()),
                  (e[2] = t.getInt32()),
                  (e[3] = t.getInt32()),
                  e
                );
              }),
              (i.cipher = function (e, t) {
                return (
                  n.aes._updateBlock(e, t, a, !1),
                  s.putInt32(a[0]),
                  s.putInt32(a[1]),
                  s.putInt32(a[2]),
                  s.putInt32(a[3]),
                  s.getBytes()
                );
              }),
              (i.increment = function (e) {
                return (++e[3], e);
              }),
              (i.md = n.md.sha256),
              t()),
            c =
              "undefined" != typeof process &&
              process.versions &&
              process.versions.node,
            u = null;
          if (
            ("undefined" != typeof window &&
              (r = window.crypto || window.msCrypto) &&
              r.getRandomValues &&
              (u = function (e) {
                return r.getRandomValues(e);
              }),
            n.disableNativeCode || (!c && !u))
          ) {
            if (
              (o.collectInt(+new Date(), 32), "undefined" != typeof navigator)
            ) {
              var l = "";
              for (f in navigator)
                try {
                  "string" == typeof navigator[f] && (l += navigator[f]);
                } catch (e) {}
              (o.collect(l), (l = null));
            }
            e &&
              (e().mousemove(function (e) {
                (o.collectInt(e.clientX, 16), o.collectInt(e.clientY, 16));
              }),
              e().keypress(function (e) {
                o.collectInt(e.charCode, 8);
              }));
          }
          if (n.random) for (var f in o) n.random[f] = o[f];
          else n.random = o;
          n.random.createInstance = t;
        }
      }
      var a = "random";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/random",
        ["require", "module", "./aes", "./md", "./prng", "./util"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(y) {
        function r(e, t, s) {
          var o,
            c,
            u,
            l = !1,
            f = null,
            p = null,
            d = null,
            n = [];
          for (e = y.rc2.expandKey(e, t), c = 0; c < 64; c++)
            n.push(e.getInt16Le());
          var h = s
              ? ((o = function (e) {
                  for (c = 0; c < 4; c++)
                    ((e[c] +=
                      n[u] +
                      (e[(c + 3) % 4] & e[(c + 2) % 4]) +
                      (~e[(c + 3) % 4] & e[(c + 1) % 4])),
                      (e[c] =
                        (((t = e[c]) << (r = a[c])) & 65535) |
                        ((65535 & t) >> (16 - r))),
                      u++);
                  var t, r;
                }),
                function (e) {
                  for (c = 0; c < 4; c++) e[c] += n[63 & e[(c + 3) % 4]];
                })
              : ((o = function (e) {
                  for (c = 3; 0 <= c; c--)
                    ((e[c] =
                      ((65535 & (t = e[c])) >> (r = a[c])) |
                      ((t << (16 - r)) & 65535)),
                      (e[c] -=
                        n[u] +
                        (e[(c + 3) % 4] & e[(c + 2) % 4]) +
                        (~e[(c + 3) % 4] & e[(c + 1) % 4])),
                      u--);
                  var t, r;
                }),
                function (e) {
                  for (c = 3; 0 <= c; c--) e[c] -= n[63 & e[(c + 3) % 4]];
                }),
            i = null;
          return (i = {
            start: function (e, t) {
              (e && "string" == typeof e && (e = y.util.createBuffer(e)),
                (l = !1),
                (f = y.util.createBuffer()),
                (p = t || new y.util.createBuffer()),
                (d = e),
                (i.output = p));
            },
            update: function (e) {
              for (l || f.putBuffer(e); 8 <= f.length();) {
                r = void 0;
                n = void 0;
                i = void 0;
                a = void 0;
                var t = [
                  [5, o],
                  [1, h],
                  [6, o],
                  [1, h],
                  [5, o],
                ];
                var r = [];
                for (c = 0; c < 4; c++) {
                  var n = f.getInt16Le();
                  (null !== d && (s ? (n ^= d.getInt16Le()) : d.putInt16Le(n)),
                    r.push(65535 & n));
                }
                u = s ? 0 : 63;
                for (var i = 0; i < t.length; i++)
                  for (var a = 0; a < t[i][0]; a++) t[i][1](r);
                for (c = 0; c < 4; c++)
                  (null !== d &&
                    (s ? d.putInt16Le(r[c]) : (r[c] ^= d.getInt16Le())),
                    p.putInt16Le(r[c]));
              }
            },
            finish: function (e) {
              var t,
                r = !0;
              return (
                s &&
                  (e
                    ? (r = e(8, f, !s))
                    : ((t = 8 === f.length() ? 8 : 8 - f.length()),
                      f.fillWithByte(t, t))),
                r && ((l = !0), i.update()),
                s ||
                  ((r = 0 === f.length()) &&
                    (e
                      ? (r = e(8, p, !s))
                      : (t = p.length()) < (e = p.at(t - 1))
                        ? (r = !1)
                        : p.truncate(e))),
                r
              );
            },
          });
        }
        var s = [
            217, 120, 249, 196, 25, 221, 181, 237, 40, 233, 253, 121, 74, 160,
            216, 157, 198, 126, 55, 131, 43, 118, 83, 142, 98, 76, 100, 136, 68,
            139, 251, 162, 23, 154, 89, 245, 135, 179, 79, 19, 97, 69, 109, 141,
            9, 129, 125, 50, 189, 143, 64, 235, 134, 183, 123, 11, 240, 149, 33,
            34, 92, 107, 78, 130, 84, 214, 101, 147, 206, 96, 178, 28, 115, 86,
            192, 20, 167, 140, 241, 220, 18, 117, 202, 31, 59, 190, 228, 209,
            66, 61, 212, 48, 163, 60, 182, 38, 111, 191, 14, 218, 70, 105, 7,
            87, 39, 242, 29, 155, 188, 148, 67, 3, 248, 17, 199, 246, 144, 239,
            62, 231, 6, 195, 213, 47, 200, 102, 30, 215, 8, 232, 234, 222, 128,
            82, 238, 247, 132, 170, 114, 172, 53, 77, 106, 42, 150, 26, 210,
            113, 90, 21, 73, 116, 75, 159, 208, 94, 4, 24, 164, 236, 194, 224,
            65, 110, 15, 81, 203, 204, 36, 145, 175, 80, 161, 244, 112, 57, 153,
            124, 58, 133, 35, 184, 180, 122, 252, 2, 54, 91, 37, 85, 151, 49,
            45, 93, 250, 152, 227, 138, 146, 174, 5, 223, 41, 16, 103, 108, 186,
            201, 211, 0, 230, 207, 225, 158, 168, 44, 99, 22, 1, 63, 88, 226,
            137, 169, 13, 56, 52, 27, 171, 51, 255, 176, 187, 72, 12, 95, 185,
            177, 205, 46, 197, 243, 219, 71, 229, 165, 156, 119, 10, 166, 32,
            104, 254, 127, 193, 173,
          ],
          a = [1, 2, 3, 5];
        ((y.rc2 = y.rc2 || {}),
          (y.rc2.expandKey = function (e, t) {
            t = t || 128;
            for (
              var r = (e = "string" == typeof e ? y.util.createBuffer(e) : e),
                n = e.length(),
                e = t,
                i = Math.ceil(e / 8),
                t = 255 >> (7 & e),
                a = n;
              a < 128;
              a++
            )
              r.putByte(s[(r.at(a - 1) + r.at(a - n)) & 255]);
            for (
              r.setAt(128 - i, s[r.at(128 - i) & t]), a = 127 - i;
              0 <= a;
              a--
            )
              r.setAt(a, s[r.at(a + 1) ^ r.at(a + i)]);
            return r;
          }));
        ((y.rc2.startEncrypting = function (e, t, r) {
          e = y.rc2.createEncryptionCipher(e, 128);
          return (e.start(t, r), e);
        }),
          (y.rc2.createEncryptionCipher = function (e, t) {
            return r(e, t, !0);
          }),
          (y.rc2.startDecrypting = function (e, t, r) {
            e = y.rc2.createDecryptionCipher(e, 128);
            return (e.start(t, r), e);
          }),
          (y.rc2.createDecryptionCipher = function (e, t) {
            return r(e, t, !1);
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/rc2", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = a
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined.rc2)) {
              e.defined.rc2 = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e.rc2;
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(e) {
        function m(e, t, r) {
          ((this.data = []),
            null != e &&
              ("number" == typeof e
                ? this.fromNumber(e, t, r)
                : null == t && "string" != typeof e
                  ? this.fromString(e, 256)
                  : this.fromString(e, t)));
        }
        function C() {
          return new m(null);
        }
        function t(e, t, r, n, i, a) {
          for (var s = 16383 & t, o = t >> 14; 0 <= --a;) {
            var c = 16383 & this.data[e],
              u = this.data[e++] >> 14,
              l = o * c + u * s;
            ((i =
              ((c = s * c + ((16383 & l) << 14) + r.data[n] + i) >> 28) +
              (l >> 14) +
              o * u),
              (r.data[n++] = 268435455 & c));
          }
          return i;
        }
        function c(e) {
          return f.charAt(e);
        }
        function u(e, t) {
          e = p[e.charCodeAt(t)];
          return null == e ? -1 : e;
        }
        function g(e) {
          var t = C();
          return (t.fromInt(e), t);
        }
        function v(e) {
          var t,
            r = 1;
          return (
            0 != (t = e >>> 16) && ((e = t), (r += 16)),
            0 != (t = e >> 8) && ((e = t), (r += 8)),
            0 != (t = e >> 4) && ((e = t), (r += 4)),
            0 != (t = e >> 2) && ((e = t), (r += 2)),
            0 != (t = e >> 1) && ((e = t), (r += 1)),
            r
          );
        }
        function E(e) {
          this.m = e;
        }
        function S(e) {
          ((this.m = e),
            (this.mp = e.invDigit()),
            (this.mpl = 32767 & this.mp),
            (this.mph = this.mp >> 15),
            (this.um = (1 << (e.DB - 15)) - 1),
            (this.mt2 = 2 * e.t));
        }
        function r(e, t) {
          return e & t;
        }
        function i(e, t) {
          return e | t;
        }
        function n(e, t) {
          return e ^ t;
        }
        function a(e, t) {
          return e & ~t;
        }
        function s() {}
        function o(e) {
          return e;
        }
        function T(e) {
          ((this.r2 = C()),
            (this.q3 = C()),
            m.ONE.dlShiftTo(2 * e.t, this.r2),
            (this.mu = this.r2.divide(e)),
            (this.m = e));
        }
        for (
          var l =
              "undefined" == typeof navigator
                ? ((m.prototype.am = t), 28)
                : "Microsoft Internet Explorer" == navigator.appName
                  ? ((m.prototype.am = function (e, t, r, n, i, a) {
                      for (var s = 32767 & t, o = t >> 15; 0 <= --a;) {
                        var c = 32767 & this.data[e],
                          u = this.data[e++] >> 15,
                          l = o * c + u * s;
                        ((i =
                          ((c =
                            s * c +
                            ((32767 & l) << 15) +
                            r.data[n] +
                            (1073741823 & i)) >>>
                            30) +
                          (l >>> 15) +
                          o * u +
                          (i >>> 30)),
                          (r.data[n++] = 1073741823 & c));
                      }
                      return i;
                    }),
                    30)
                  : "Netscape" != navigator.appName
                    ? ((m.prototype.am = function (e, t, r, n, i, a) {
                        for (; 0 <= --a;) {
                          var s = t * this.data[e++] + r.data[n] + i;
                          ((i = Math.floor(s / 67108864)),
                            (r.data[n++] = 67108863 & s));
                        }
                        return i;
                      }),
                      26)
                    : ((m.prototype.am = t), 28),
            f =
              ((m.prototype.DB = l),
              (m.prototype.DM = (1 << l) - 1),
              (m.prototype.DV = 1 << l),
              (m.prototype.FV = Math.pow(2, 52)),
              (m.prototype.F1 = 52 - l),
              (m.prototype.F2 = 2 * l - 52),
              "0123456789abcdefghijklmnopqrstuvwxyz"),
            p = new Array(),
            d = "0".charCodeAt(0),
            h = 0;
          h <= 9;
          ++h
        )
          p[d++] = h;
        for (d = "a".charCodeAt(0), h = 10; h < 36; ++h) p[d++] = h;
        for (d = "A".charCodeAt(0), h = 10; h < 36; ++h) p[d++] = h;
        ((E.prototype.convert = function (e) {
          return e.s < 0 || 0 <= e.compareTo(this.m) ? e.mod(this.m) : e;
        }),
          (E.prototype.revert = function (e) {
            return e;
          }),
          (E.prototype.reduce = function (e) {
            e.divRemTo(this.m, null, e);
          }),
          (E.prototype.mulTo = function (e, t, r) {
            (e.multiplyTo(t, r), this.reduce(r));
          }),
          (E.prototype.sqrTo = function (e, t) {
            (e.squareTo(t), this.reduce(t));
          }),
          (S.prototype.convert = function (e) {
            var t = C();
            return (
              e.abs().dlShiftTo(this.m.t, t),
              t.divRemTo(this.m, null, t),
              e.s < 0 && 0 < t.compareTo(m.ZERO) && this.m.subTo(t, t),
              t
            );
          }),
          (S.prototype.revert = function (e) {
            var t = C();
            return (e.copyTo(t), this.reduce(t), t);
          }),
          (S.prototype.reduce = function (e) {
            for (; e.t <= this.mt2;) e.data[e.t++] = 0;
            for (var t = 0; t < this.m.t; ++t) {
              var r =
                  ((n = 32767 & e.data[t]) * this.mpl +
                    (((n * this.mph + (e.data[t] >> 15) * this.mpl) &
                      this.um) <<
                      15)) &
                  e.DM,
                n = t + this.m.t;
              for (
                e.data[n] += this.m.am(0, r, e, t, 0, this.m.t);
                e.data[n] >= e.DV;
              )
                ((e.data[n] -= e.DV), e.data[++n]++);
            }
            (e.clamp(),
              e.drShiftTo(this.m.t, e),
              0 <= e.compareTo(this.m) && e.subTo(this.m, e));
          }),
          (S.prototype.mulTo = function (e, t, r) {
            (e.multiplyTo(t, r), this.reduce(r));
          }),
          (S.prototype.sqrTo = function (e, t) {
            (e.squareTo(t), this.reduce(t));
          }),
          (m.prototype.copyTo = function (e) {
            for (var t = this.t - 1; 0 <= t; --t) e.data[t] = this.data[t];
            ((e.t = this.t), (e.s = this.s));
          }),
          (m.prototype.fromInt = function (e) {
            ((this.t = 1),
              (this.s = e < 0 ? -1 : 0),
              0 < e
                ? (this.data[0] = e)
                : e < -1
                  ? (this.data[0] = e + this.DV)
                  : (this.t = 0));
          }),
          (m.prototype.fromString = function (e, t) {
            var r;
            if (16 == t) r = 4;
            else if (8 == t) r = 3;
            else if (256 == t) r = 8;
            else if (2 == t) r = 1;
            else if (32 == t) r = 5;
            else {
              if (4 != t) return void this.fromRadix(e, t);
              r = 2;
            }
            ((this.t = 0), (this.s = 0));
            for (var n = e.length, i = !1, a = 0; 0 <= --n;) {
              var s = 8 == r ? 255 & e[n] : u(e, n);
              s < 0
                ? "-" == e.charAt(n) && (i = !0)
                : ((i = !1),
                  0 == a
                    ? (this.data[this.t++] = s)
                    : a + r > this.DB
                      ? ((this.data[this.t - 1] |=
                          (s & ((1 << (this.DB - a)) - 1)) << a),
                        (this.data[this.t++] = s >> (this.DB - a)))
                      : (this.data[this.t - 1] |= s << a),
                  (a += r) >= this.DB && (a -= this.DB));
            }
            (8 == r &&
              0 != (128 & e[0]) &&
              ((this.s = -1), 0 < a) &&
              (this.data[this.t - 1] |= ((1 << (this.DB - a)) - 1) << a),
              this.clamp(),
              i && m.ZERO.subTo(this, this));
          }),
          (m.prototype.clamp = function () {
            for (
              var e = this.s & this.DM;
              0 < this.t && this.data[this.t - 1] == e;
            )
              --this.t;
          }),
          (m.prototype.dlShiftTo = function (e, t) {
            for (var r = this.t - 1; 0 <= r; --r) t.data[r + e] = this.data[r];
            for (r = e - 1; 0 <= r; --r) t.data[r] = 0;
            ((t.t = this.t + e), (t.s = this.s));
          }),
          (m.prototype.drShiftTo = function (e, t) {
            for (var r = e; r < this.t; ++r) t.data[r - e] = this.data[r];
            ((t.t = Math.max(this.t - e, 0)), (t.s = this.s));
          }),
          (m.prototype.lShiftTo = function (e, t) {
            for (
              var r = e % this.DB,
                n = this.DB - r,
                i = (1 << n) - 1,
                a = Math.floor(e / this.DB),
                s = (this.s << r) & this.DM,
                o = this.t - 1;
              0 <= o;
              --o
            )
              ((t.data[o + a + 1] = (this.data[o] >> n) | s),
                (s = (this.data[o] & i) << r));
            for (o = a - 1; 0 <= o; --o) t.data[o] = 0;
            ((t.data[a] = s),
              (t.t = this.t + a + 1),
              (t.s = this.s),
              t.clamp());
          }),
          (m.prototype.rShiftTo = function (e, t) {
            t.s = this.s;
            var r = Math.floor(e / this.DB);
            if (r >= this.t) t.t = 0;
            else {
              var n = e % this.DB,
                i = this.DB - n,
                a = (1 << n) - 1;
              t.data[0] = this.data[r] >> n;
              for (var s = r + 1; s < this.t; ++s)
                ((t.data[s - r - 1] |= (this.data[s] & a) << i),
                  (t.data[s - r] = this.data[s] >> n));
              (0 < n && (t.data[this.t - r - 1] |= (this.s & a) << i),
                (t.t = this.t - r),
                t.clamp());
            }
          }),
          (m.prototype.subTo = function (e, t) {
            for (var r = 0, n = 0, i = Math.min(e.t, this.t); r < i;)
              ((n += this.data[r] - e.data[r]),
                (t.data[r++] = n & this.DM),
                (n >>= this.DB));
            if (e.t < this.t) {
              for (n -= e.s; r < this.t;)
                ((n += this.data[r]),
                  (t.data[r++] = n & this.DM),
                  (n >>= this.DB));
              n += this.s;
            } else {
              for (n += this.s; r < e.t;)
                ((n -= e.data[r]),
                  (t.data[r++] = n & this.DM),
                  (n >>= this.DB));
              n -= e.s;
            }
            ((t.s = n < 0 ? -1 : 0),
              n < -1 ? (t.data[r++] = this.DV + n) : 0 < n && (t.data[r++] = n),
              (t.t = r),
              t.clamp());
          }),
          (m.prototype.multiplyTo = function (e, t) {
            var r = this.abs(),
              n = e.abs(),
              i = r.t;
            for (t.t = i + n.t; 0 <= --i;) t.data[i] = 0;
            for (i = 0; i < n.t; ++i)
              t.data[i + r.t] = r.am(0, n.data[i], t, i, 0, r.t);
            ((t.s = 0), t.clamp(), this.s != e.s && m.ZERO.subTo(t, t));
          }),
          (m.prototype.squareTo = function (e) {
            for (var t = this.abs(), r = (e.t = 2 * t.t); 0 <= --r;)
              e.data[r] = 0;
            for (r = 0; r < t.t - 1; ++r) {
              var n = t.am(r, t.data[r], e, 2 * r, 0, 1);
              (e.data[r + t.t] += t.am(
                r + 1,
                2 * t.data[r],
                e,
                2 * r + 1,
                n,
                t.t - r - 1,
              )) >= t.DV &&
                ((e.data[r + t.t] -= t.DV), (e.data[r + t.t + 1] = 1));
            }
            (0 < e.t && (e.data[e.t - 1] += t.am(r, t.data[r], e, 2 * r, 0, 1)),
              (e.s = 0),
              e.clamp());
          }),
          (m.prototype.divRemTo = function (e, t, r) {
            var n = e.abs();
            if (!(n.t <= 0)) {
              var i = this.abs();
              if (i.t < n.t)
                (null != t && t.fromInt(0), null != r && this.copyTo(r));
              else {
                null == r && (r = C());
                var a = C(),
                  s = this.s,
                  e = e.s,
                  o = this.DB - v(n.data[n.t - 1]),
                  c =
                    (0 < o
                      ? (n.lShiftTo(o, a), i.lShiftTo(o, r))
                      : (n.copyTo(a), i.copyTo(r)),
                    a.t),
                  u = a.data[c - 1];
                if (0 != u) {
                  var n =
                      u * (1 << this.F1) +
                      (1 < c ? a.data[c - 2] >> this.F2 : 0),
                    l = this.FV / n,
                    f = (1 << this.F1) / n,
                    p = 1 << this.F2,
                    d = r.t,
                    h = d - c,
                    y = null == t ? C() : t;
                  for (
                    a.dlShiftTo(h, y),
                      0 <= r.compareTo(y) &&
                        ((r.data[r.t++] = 1), r.subTo(y, r)),
                      m.ONE.dlShiftTo(c, y),
                      y.subTo(a, a);
                    a.t < c;
                  )
                    a.data[a.t++] = 0;
                  for (; 0 <= --h;) {
                    var g =
                      r.data[--d] == u
                        ? this.DM
                        : Math.floor(r.data[d] * l + (r.data[d - 1] + p) * f);
                    if ((r.data[d] += a.am(0, g, r, h, 0, c)) < g)
                      for (a.dlShiftTo(h, y), r.subTo(y, r); r.data[d] < --g;)
                        r.subTo(y, r);
                  }
                  (null != t &&
                    (r.drShiftTo(c, t), s != e) &&
                    m.ZERO.subTo(t, t),
                    (r.t = c),
                    r.clamp(),
                    0 < o && r.rShiftTo(o, r),
                    s < 0 && m.ZERO.subTo(r, r));
                }
              }
            }
          }),
          (m.prototype.invDigit = function () {
            var e, t;
            return this.t < 1 || 0 == (1 & (e = this.data[0]))
              ? 0
              : 0 <
                  (t =
                    ((t =
                      ((t =
                        ((t = ((t = 3 & e) * (2 - (15 & e) * t)) & 15) *
                          (2 - (255 & e) * t)) &
                        255) *
                        (2 - (((65535 & e) * t) & 65535))) &
                      65535) *
                      (2 - ((e * t) % this.DV))) %
                    this.DV)
                ? this.DV - t
                : -t;
          }),
          (m.prototype.isEven = function () {
            return 0 == (0 < this.t ? 1 & this.data[0] : this.s);
          }),
          (m.prototype.exp = function (e, t) {
            if (4294967295 < e || e < 1) return m.ONE;
            var r,
              n = C(),
              i = C(),
              a = t.convert(this),
              s = v(e) - 1;
            for (a.copyTo(n); 0 <= --s;)
              (t.sqrTo(n, i),
                0 < (e & (1 << s))
                  ? t.mulTo(i, a, n)
                  : ((r = n), (n = i), (i = r)));
            return t.revert(n);
          }),
          (m.prototype.toString = function (e) {
            if (this.s < 0) return "-" + this.negate().toString(e);
            var t;
            if (16 == e) t = 4;
            else if (8 == e) t = 3;
            else if (2 == e) t = 1;
            else if (32 == e) t = 5;
            else {
              if (4 != e) return this.toRadix(e);
              t = 2;
            }
            var r,
              n = (1 << t) - 1,
              i = !1,
              a = "",
              s = this.t,
              o = this.DB - ((s * this.DB) % t);
            if (0 < s--)
              for (
                o < this.DB &&
                0 < (r = this.data[s] >> o) &&
                ((i = !0), (a = c(r)));
                0 <= s;
              )
                (o < t
                  ? ((r = (this.data[s] & ((1 << o) - 1)) << (t - o)),
                    (r |= this.data[--s] >> (o += this.DB - t)))
                  : ((r = (this.data[s] >> (o -= t)) & n),
                    o <= 0 && ((o += this.DB), --s)),
                  (i = 0 < r ? !0 : i) && (a += c(r)));
            return i ? a : "0";
          }),
          (m.prototype.negate = function () {
            var e = C();
            return (m.ZERO.subTo(this, e), e);
          }),
          (m.prototype.abs = function () {
            return this.s < 0 ? this.negate() : this;
          }),
          (m.prototype.compareTo = function (e) {
            var t = this.s - e.s;
            if (0 != t) return t;
            var r = this.t;
            if (0 != (t = r - e.t)) return this.s < 0 ? -t : t;
            for (; 0 <= --r;) if (0 != (t = this.data[r] - e.data[r])) return t;
            return 0;
          }),
          (m.prototype.bitLength = function () {
            return this.t <= 0
              ? 0
              : this.DB * (this.t - 1) +
                  v(this.data[this.t - 1] ^ (this.s & this.DM));
          }),
          (m.prototype.mod = function (e) {
            var t = C();
            return (
              this.abs().divRemTo(e, null, t),
              this.s < 0 && 0 < t.compareTo(m.ZERO) && e.subTo(t, t),
              t
            );
          }),
          (m.prototype.modPowInt = function (e, t) {
            return (
              (t = new (e < 256 || t.isEven() ? E : S)(t)),
              this.exp(e, t)
            );
          }),
          (m.ZERO = g(0)),
          (m.ONE = g(1)),
          (s.prototype.convert = o),
          (s.prototype.revert = o),
          (s.prototype.mulTo = function (e, t, r) {
            e.multiplyTo(t, r);
          }),
          (s.prototype.sqrTo = function (e, t) {
            e.squareTo(t);
          }),
          (T.prototype.convert = function (e) {
            var t;
            return e.s < 0 || e.t > 2 * this.m.t
              ? e.mod(this.m)
              : e.compareTo(this.m) < 0
                ? e
                : ((t = C()), e.copyTo(t), this.reduce(t), t);
          }),
          (T.prototype.revert = function (e) {
            return e;
          }),
          (T.prototype.reduce = function (e) {
            for (
              e.drShiftTo(this.m.t - 1, this.r2),
                e.t > this.m.t + 1 && ((e.t = this.m.t + 1), e.clamp()),
                this.mu.multiplyUpperTo(this.r2, this.m.t + 1, this.q3),
                this.m.multiplyLowerTo(this.q3, this.m.t + 1, this.r2);
              e.compareTo(this.r2) < 0;
            )
              e.dAddOffset(1, this.m.t + 1);
            for (e.subTo(this.r2, e); 0 <= e.compareTo(this.m);)
              e.subTo(this.m, e);
          }),
          (T.prototype.mulTo = function (e, t, r) {
            (e.multiplyTo(t, r), this.reduce(r));
          }),
          (T.prototype.sqrTo = function (e, t) {
            (e.squareTo(t), this.reduce(t));
          }));
        var y = [
            2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61,
            67, 71, 73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137,
            139, 149, 151, 157, 163, 167, 173, 179, 181, 191, 193, 197, 199,
            211, 223, 227, 229, 233, 239, 241, 251, 257, 263, 269, 271, 277,
            281, 283, 293, 307, 311, 313, 317, 331, 337, 347, 349, 353, 359,
            367, 373, 379, 383, 389, 397, 401, 409, 419, 421, 431, 433, 439,
            443, 449, 457, 461, 463, 467, 479, 487, 491, 499, 503, 509,
          ],
          I = (1 << 26) / y[y.length - 1];
        ((m.prototype.chunkSize = function (e) {
          return Math.floor((Math.LN2 * this.DB) / Math.log(e));
        }),
          (m.prototype.toRadix = function (e) {
            if ((null == e && (e = 10), 0 == this.signum() || e < 2 || 36 < e))
              return "0";
            var t = this.chunkSize(e),
              r = Math.pow(e, t),
              n = g(r),
              i = C(),
              a = C(),
              s = "";
            for (this.divRemTo(n, i, a); 0 < i.signum();)
              ((s = (r + a.intValue()).toString(e).substr(1) + s),
                i.divRemTo(n, i, a));
            return a.intValue().toString(e) + s;
          }),
          (m.prototype.fromRadix = function (e, t) {
            this.fromInt(0);
            for (
              var r = this.chunkSize((t = null == t ? 10 : t)),
                n = Math.pow(t, r),
                i = !1,
                a = 0,
                s = 0,
                o = 0;
              o < e.length;
              ++o
            ) {
              var c = u(e, o);
              c < 0
                ? "-" == e.charAt(o) && 0 == this.signum() && (i = !0)
                : ((s = t * s + c),
                  ++a >= r &&
                    (this.dMultiply(n), this.dAddOffset(s, 0), (s = a = 0)));
            }
            (0 < a && (this.dMultiply(Math.pow(t, a)), this.dAddOffset(s, 0)),
              i && m.ZERO.subTo(this, this));
          }),
          (m.prototype.fromNumber = function (e, t, r) {
            if ("number" == typeof t)
              if (e < 2) this.fromInt(1);
              else
                for (
                  this.fromNumber(e, r),
                    this.testBit(e - 1) ||
                      this.bitwiseTo(m.ONE.shiftLeft(e - 1), i, this),
                    this.isEven() && this.dAddOffset(1, 0);
                  !this.isProbablePrime(t);
                )
                  (this.dAddOffset(2, 0),
                    this.bitLength() > e &&
                      this.subTo(m.ONE.shiftLeft(e - 1), this));
            else {
              var r = new Array(),
                n = 7 & e;
              ((r.length = 1 + (e >> 3)),
                t.nextBytes(r),
                0 < n ? (r[0] &= (1 << n) - 1) : (r[0] = 0),
                this.fromString(r, 256));
            }
          }),
          (m.prototype.bitwiseTo = function (e, t, r) {
            for (var n, i = Math.min(e.t, this.t), a = 0; a < i; ++a)
              r.data[a] = t(this.data[a], e.data[a]);
            if (e.t < this.t) {
              for (n = e.s & this.DM, a = i; a < this.t; ++a)
                r.data[a] = t(this.data[a], n);
              r.t = this.t;
            } else {
              for (n = this.s & this.DM, a = i; a < e.t; ++a)
                r.data[a] = t(n, e.data[a]);
              r.t = e.t;
            }
            ((r.s = t(this.s, e.s)), r.clamp());
          }),
          (m.prototype.changeBit = function (e, t) {
            return ((e = m.ONE.shiftLeft(e)), this.bitwiseTo(e, t, e), e);
          }),
          (m.prototype.addTo = function (e, t) {
            for (var r = 0, n = 0, i = Math.min(e.t, this.t); r < i;)
              ((n += this.data[r] + e.data[r]),
                (t.data[r++] = n & this.DM),
                (n >>= this.DB));
            if (e.t < this.t) {
              for (n += e.s; r < this.t;)
                ((n += this.data[r]),
                  (t.data[r++] = n & this.DM),
                  (n >>= this.DB));
              n += this.s;
            } else {
              for (n += this.s; r < e.t;)
                ((n += e.data[r]),
                  (t.data[r++] = n & this.DM),
                  (n >>= this.DB));
              n += e.s;
            }
            ((t.s = n < 0 ? -1 : 0),
              0 < n ? (t.data[r++] = n) : n < -1 && (t.data[r++] = this.DV + n),
              (t.t = r),
              t.clamp());
          }),
          (m.prototype.dMultiply = function (e) {
            ((this.data[this.t] = this.am(0, e - 1, this, 0, 0, this.t)),
              ++this.t,
              this.clamp());
          }),
          (m.prototype.dAddOffset = function (e, t) {
            if (0 != e) {
              for (; this.t <= t;) this.data[this.t++] = 0;
              for (this.data[t] += e; this.data[t] >= this.DV;)
                ((this.data[t] -= this.DV),
                  ++t >= this.t && (this.data[this.t++] = 0),
                  ++this.data[t]);
            }
          }),
          (m.prototype.multiplyLowerTo = function (e, t, r) {
            var n,
              i = Math.min(this.t + e.t, t);
            for (r.s = 0, r.t = i; 0 < i;) r.data[--i] = 0;
            for (n = r.t - this.t; i < n; ++i)
              r.data[i + this.t] = this.am(0, e.data[i], r, i, 0, this.t);
            for (n = Math.min(e.t, t); i < n; ++i)
              this.am(0, e.data[i], r, i, 0, t - i);
            r.clamp();
          }),
          (m.prototype.multiplyUpperTo = function (e, t, r) {
            var n = (r.t = this.t + e.t - --t);
            for (r.s = 0; 0 <= --n;) r.data[n] = 0;
            for (n = Math.max(t - this.t, 0); n < e.t; ++n)
              r.data[this.t + n - t] = this.am(
                t - n,
                e.data[n],
                r,
                0,
                0,
                this.t + n - t,
              );
            (r.clamp(), r.drShiftTo(1, r));
          }),
          (m.prototype.modInt = function (e) {
            if (e <= 0) return 0;
            var t = this.DV % e,
              r = this.s < 0 ? e - 1 : 0;
            if (0 < this.t)
              if (0 == t) r = this.data[0] % e;
              else
                for (var n = this.t - 1; 0 <= n; --n)
                  r = (t * r + this.data[n]) % e;
            return r;
          }),
          (m.prototype.millerRabin = function (e) {
            var t = this.subtract(m.ONE),
              r = t.getLowestSetBit();
            if (r <= 0) return !1;
            for (
              var n,
                i = t.shiftRight(r),
                a = {
                  nextBytes: function (e) {
                    for (var t = 0; t < e.length; ++t)
                      e[t] = Math.floor(255 * Math.random());
                  },
                },
                s = 0;
              s < e;
              ++s
            ) {
              for (
                ;
                (n = new m(this.bitLength(), a)).compareTo(m.ONE) <= 0 ||
                0 <= n.compareTo(t);
              );
              var o = n.modPow(i, this);
              if (0 != o.compareTo(m.ONE) && 0 != o.compareTo(t)) {
                for (var c = 1; c++ < r && 0 != o.compareTo(t);)
                  if (0 == (o = o.modPowInt(2, this)).compareTo(m.ONE))
                    return !1;
                if (0 != o.compareTo(t)) return !1;
              }
            }
            return !0;
          }),
          (m.prototype.clone = function () {
            var e = C();
            return (this.copyTo(e), e);
          }),
          (m.prototype.intValue = function () {
            if (this.s < 0) {
              if (1 == this.t) return this.data[0] - this.DV;
              if (0 == this.t) return -1;
            } else {
              if (1 == this.t) return this.data[0];
              if (0 == this.t) return 0;
            }
            return (
              ((this.data[1] & ((1 << (32 - this.DB)) - 1)) << this.DB) |
              this.data[0]
            );
          }),
          (m.prototype.byteValue = function () {
            return 0 == this.t ? this.s : (this.data[0] << 24) >> 24;
          }),
          (m.prototype.shortValue = function () {
            return 0 == this.t ? this.s : (this.data[0] << 16) >> 16;
          }),
          (m.prototype.signum = function () {
            return this.s < 0
              ? -1
              : this.t <= 0 || (1 == this.t && this.data[0] <= 0)
                ? 0
                : 1;
          }),
          (m.prototype.toByteArray = function () {
            var e,
              t = this.t,
              r = new Array(),
              n = ((r[0] = this.s), this.DB - ((t * this.DB) % 8)),
              i = 0;
            if (0 < t--)
              for (
                n < this.DB &&
                (e = this.data[t] >> n) != (this.s & this.DM) >> n &&
                (r[i++] = e | (this.s << (this.DB - n)));
                0 <= t;
              )
                (n < 8
                  ? ((e = (this.data[t] & ((1 << n) - 1)) << (8 - n)),
                    (e |= this.data[--t] >> (n += this.DB - 8)))
                  : ((e = (this.data[t] >> (n -= 8)) & 255),
                    n <= 0 && ((n += this.DB), --t)),
                  0 != (128 & e) && (e |= -256),
                  0 == i && (128 & this.s) != (128 & e) && ++i,
                  (0 < i || e != this.s) && (r[i++] = e));
            return r;
          }),
          (m.prototype.equals = function (e) {
            return 0 == this.compareTo(e);
          }),
          (m.prototype.min = function (e) {
            return this.compareTo(e) < 0 ? this : e;
          }),
          (m.prototype.max = function (e) {
            return 0 < this.compareTo(e) ? this : e;
          }),
          (m.prototype.and = function (e) {
            var t = C();
            return (this.bitwiseTo(e, r, t), t);
          }),
          (m.prototype.or = function (e) {
            var t = C();
            return (this.bitwiseTo(e, i, t), t);
          }),
          (m.prototype.xor = function (e) {
            var t = C();
            return (this.bitwiseTo(e, n, t), t);
          }),
          (m.prototype.andNot = function (e) {
            var t = C();
            return (this.bitwiseTo(e, a, t), t);
          }),
          (m.prototype.not = function () {
            for (var e = C(), t = 0; t < this.t; ++t)
              e.data[t] = this.DM & ~this.data[t];
            return ((e.t = this.t), (e.s = ~this.s), e);
          }),
          (m.prototype.shiftLeft = function (e) {
            var t = C();
            return (e < 0 ? this.rShiftTo(-e, t) : this.lShiftTo(e, t), t);
          }),
          (m.prototype.shiftRight = function (e) {
            var t = C();
            return (e < 0 ? this.lShiftTo(-e, t) : this.rShiftTo(e, t), t);
          }),
          (m.prototype.getLowestSetBit = function () {
            for (var e, t, r = 0; r < this.t; ++r)
              if (0 != this.data[r])
                return (
                  r * this.DB +
                  ((e = this.data[r]),
                  (t = void 0),
                  0 == e
                    ? -1
                    : ((t = 0) == (65535 & e) && ((e >>= 16), (t += 16)),
                      0 == (255 & e) && ((e >>= 8), (t += 8)),
                      0 == (15 & e) && ((e >>= 4), (t += 4)),
                      0 == (3 & e) && ((e >>= 2), (t += 2)),
                      0 == (1 & e) && ++t,
                      t))
                );
            return this.s < 0 ? this.t * this.DB : -1;
          }),
          (m.prototype.bitCount = function () {
            for (var e = 0, t = this.s & this.DM, r = 0; r < this.t; ++r)
              e += (function (e) {
                for (var t = 0; 0 != e;) ((e &= e - 1), ++t);
                return t;
              })(this.data[r] ^ t);
            return e;
          }),
          (m.prototype.testBit = function (e) {
            var t = Math.floor(e / this.DB);
            return t >= this.t
              ? 0 != this.s
              : 0 != (this.data[t] & (1 << (e % this.DB)));
          }),
          (m.prototype.setBit = function (e) {
            return this.changeBit(e, i);
          }),
          (m.prototype.clearBit = function (e) {
            return this.changeBit(e, a);
          }),
          (m.prototype.flipBit = function (e) {
            return this.changeBit(e, n);
          }),
          (m.prototype.add = function (e) {
            var t = C();
            return (this.addTo(e, t), t);
          }),
          (m.prototype.subtract = function (e) {
            var t = C();
            return (this.subTo(e, t), t);
          }),
          (m.prototype.multiply = function (e) {
            var t = C();
            return (this.multiplyTo(e, t), t);
          }),
          (m.prototype.divide = function (e) {
            var t = C();
            return (this.divRemTo(e, t, null), t);
          }),
          (m.prototype.remainder = function (e) {
            var t = C();
            return (this.divRemTo(e, null, t), t);
          }),
          (m.prototype.divideAndRemainder = function (e) {
            var t = C(),
              r = C();
            return (this.divRemTo(e, t, r), new Array(t, r));
          }),
          (m.prototype.modPow = function (e, t) {
            var r = e.bitLength(),
              n = g(1);
            if (r <= 0) return n;
            var i = r < 18 ? 1 : r < 48 ? 3 : r < 144 ? 4 : r < 768 ? 5 : 6,
              a = new (r < 8 ? E : t.isEven() ? T : S)(t),
              s = new Array(),
              o = 3,
              c = i - 1,
              u = (1 << i) - 1;
            if (((s[1] = a.convert(this)), 1 < i)) {
              var l = C();
              for (a.sqrTo(s[1], l); o <= u;)
                ((s[o] = C()), a.mulTo(l, s[o - 2], s[o]), (o += 2));
            }
            for (
              var f, p, d = e.t - 1, h = !0, y = C(), r = v(e.data[d]) - 1;
              0 <= d;
            ) {
              for (
                c <= r
                  ? (f = (e.data[d] >> (r - c)) & u)
                  : ((f = (e.data[d] & ((1 << (r + 1)) - 1)) << (c - r)),
                    0 < d && (f |= e.data[d - 1] >> (this.DB + r - c))),
                  o = i;
                0 == (1 & f);
              )
                ((f >>= 1), --o);
              if (((r -= o) < 0 && ((r += this.DB), --d), h))
                (s[f].copyTo(n), (h = !1));
              else {
                for (; 1 < o;) (a.sqrTo(n, y), a.sqrTo(y, n), (o -= 2));
                (0 < o ? a.sqrTo(n, y) : ((p = n), (n = y), (y = p)),
                  a.mulTo(y, s[f], n));
              }
              for (; 0 <= d && 0 == (e.data[d] & (1 << r));)
                (a.sqrTo(n, y),
                  (p = n),
                  (n = y),
                  (y = p),
                  --r < 0 && ((r = this.DB - 1), --d));
            }
            return a.revert(n);
          }),
          (m.prototype.modInverse = function (e) {
            var t = e.isEven();
            if ((this.isEven() && t) || 0 == e.signum()) return m.ZERO;
            for (
              var r = e.clone(),
                n = this.clone(),
                i = g(1),
                a = g(0),
                s = g(0),
                o = g(1);
              0 != r.signum();
            ) {
              for (; r.isEven();)
                (r.rShiftTo(1, r),
                  t
                    ? ((i.isEven() && a.isEven()) ||
                        (i.addTo(this, i), a.subTo(e, a)),
                      i.rShiftTo(1, i))
                    : a.isEven() || a.subTo(e, a),
                  a.rShiftTo(1, a));
              for (; n.isEven();)
                (n.rShiftTo(1, n),
                  t
                    ? ((s.isEven() && o.isEven()) ||
                        (s.addTo(this, s), o.subTo(e, o)),
                      s.rShiftTo(1, s))
                    : o.isEven() || o.subTo(e, o),
                  o.rShiftTo(1, o));
              0 <= r.compareTo(n)
                ? (r.subTo(n, r), t && i.subTo(s, i), a.subTo(o, a))
                : (n.subTo(r, n), t && s.subTo(i, s), o.subTo(a, o));
            }
            return 0 != n.compareTo(m.ONE)
              ? m.ZERO
              : 0 <= o.compareTo(e)
                ? o.subtract(e)
                : o.signum() < 0 && (o.addTo(e, o), o.signum() < 0)
                  ? o.add(e)
                  : o;
          }),
          (m.prototype.pow = function (e) {
            return this.exp(e, new s());
          }),
          (m.prototype.gcd = function (e) {
            var t = this.s < 0 ? this.negate() : this.clone(),
              r = e.s < 0 ? e.negate() : e.clone(),
              n =
                (t.compareTo(r) < 0 && ((e = t), (t = r), (r = e)),
                t.getLowestSetBit());
            if ((e = r.getLowestSetBit()) < 0) return t;
            for (
              0 < (e = n < e ? n : e) && (t.rShiftTo(e, t), r.rShiftTo(e, r));
              0 < t.signum();
            )
              (0 < (n = t.getLowestSetBit()) && t.rShiftTo(n, t),
                0 < (n = r.getLowestSetBit()) && r.rShiftTo(n, r),
                0 <= t.compareTo(r)
                  ? (t.subTo(r, t), t.rShiftTo(1, t))
                  : (r.subTo(t, r), r.rShiftTo(1, r)));
            return (0 < e && r.lShiftTo(e, r), r);
          }),
          (m.prototype.isProbablePrime = function (e) {
            var t,
              r = this.abs();
            if (1 == r.t && r.data[0] <= y[y.length - 1]) {
              for (t = 0; t < y.length; ++t) if (r.data[0] == y[t]) return !0;
              return !1;
            }
            if (r.isEven()) return !1;
            for (t = 1; t < y.length;) {
              for (var n = y[t], i = t + 1; i < y.length && n < I;) n *= y[i++];
              for (n = r.modInt(n); t < i;) if (n % y[t++] == 0) return !1;
            }
            return r.millerRabin(e);
          }),
          (e.jsbn = e.jsbn || {}),
          (e.jsbn.BigInteger = m));
      }
      var a = "jsbn";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/jsbn", ["require", "module"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(v) {
        function E(e, t, r) {
          r = r || v.md.sha1.create();
          for (
            var n = "", i = Math.ceil(t / r.digestLength), a = 0;
            a < i;
            ++a
          ) {
            var s = String.fromCharCode(
              (a >> 24) & 255,
              (a >> 16) & 255,
              (a >> 8) & 255,
              255 & a,
            );
            (r.start(), r.update(e + s), (n += r.digest().getBytes()));
          }
          return n.substring(0, t);
        }
        var e = (v.pkcs1 = v.pkcs1 || {});
        ((e.encode_rsa_oaep = function (e, t, r) {
          ("string" == typeof r
            ? ((c = r),
              (n = arguments[3] || void 0),
              (i = arguments[4] || void 0))
            : r &&
              ((c = r.label || void 0),
              (n = r.seed || void 0),
              (i = r.md || void 0),
              r.mgf1) &&
              r.mgf1.md &&
              (a = r.mgf1.md),
            i ? i.start() : (i = v.md.sha1.create()),
            (a = a || i));
          var n,
            i,
            a,
            s = Math.ceil(e.n.bitLength() / 8),
            o = s - 2 * i.digestLength - 2;
          if (t.length > o)
            throw (
              ((p = new Error(
                "RSAES-OAEP input message length is too long.",
              )).length = t.length),
              (p.maxLength = o),
              p
            );
          i.update((c = c || ""), "raw");
          for (var c = i.digest(), u = "", l = o - t.length, f = 0; f < l; f++)
            u += "\0";
          o = c.getBytes() + u + "" + t;
          if (n) {
            if (n.length !== i.digestLength)
              throw (
                ((p = new Error(
                  "Invalid RSAES-OAEP seed. The seed length must match the digest length.",
                )).seedLength = n.length),
                (p.digestLength = i.digestLength),
                p
              );
          } else n = v.random.getBytes(i.digestLength);
          var c = E(n, s - i.digestLength - 1, a),
            p = v.util.xorBytes(o, c, o.length),
            s = E(p, i.digestLength, a);
          return "\0" + v.util.xorBytes(n, s, n.length) + p;
        }),
          (e.decode_rsa_oaep = function (e, t, r) {
            "string" == typeof r
              ? ((o = r), (n = arguments[3] || void 0))
              : r &&
                ((o = r.label || void 0), (n = r.md || void 0), r.mgf1) &&
                r.mgf1.md &&
                (i = r.mgf1.md);
            var n,
              i,
              a = Math.ceil(e.n.bitLength() / 8);
            if (t.length !== a)
              throw (
                ((d = new Error(
                  "RSAES-OAEP encoded message length is invalid.",
                )).length = t.length),
                (d.expectedLength = a),
                d
              );
            if (
              (void 0 === n ? (n = v.md.sha1.create()) : n.start(),
              (i = i || n),
              a < 2 * n.digestLength + 2)
            )
              throw new Error(
                "RSAES-OAEP key is too short for the hash function.",
              );
            n.update((o = o || ""), "raw");
            for (
              var s = n.digest().getBytes(),
                o = t.charAt(0),
                c = t.substring(1, n.digestLength + 1),
                u = t.substring(1 + n.digestLength),
                l = E(u, n.digestLength, i),
                l = E(
                  v.util.xorBytes(c, l, c.length),
                  a - n.digestLength - 1,
                  i,
                ),
                f = v.util.xorBytes(u, l, u.length),
                p = f.substring(0, n.digestLength),
                d = "\0" !== o,
                h = 0;
              h < n.digestLength;
              ++h
            )
              d |= s.charAt(h) !== p.charAt(h);
            for (
              var y = 1, g = n.digestLength, m = n.digestLength;
              m < f.length;
              m++
            ) {
              var C = f.charCodeAt(m);
              ((d |= C & (y ? 65534 : 0)), (g += y &= (1 & C) ^ 1));
            }
            if (d || 1 !== f.charCodeAt(g))
              throw new Error("Invalid RSAES-OAEP padding.");
            return f.substring(g + 1);
          }));
      }
      var a = "pkcs1";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/pkcs1",
        ["require", "module", "./util", "./random", "./sha1"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(h) {
        function a(e, t, r, n) {
          return "workers" in r
            ? ((a = e),
              (s = t),
              (o = r),
              (c = n),
              "undefined" == typeof Worker
                ? y(a, s, o, c)
                : ((u = g(a, s)),
                  (l = o.workers),
                  (f = o.workLoad || 100),
                  (p = (30 * f) / 8),
                  (d = o.workerScript || "forge/prime.worker.js"),
                  -1 === l
                    ? h.util.estimateCores(function (e, t) {
                        ((l = (t = e ? 2 : t) - 1), i());
                      })
                    : void i()))
            : y(e, t, r, n);
          function i() {
            function e(e) {
              if (!i) {
                0;
                var t = e.data;
                if (t.found) {
                  for (var r = 0; r < n.length; ++r) n[r].terminate();
                  return ((i = !0), c(null, new m(t.prime, 16)));
                }
                t = (u = u.bitLength() > a ? g(a, s) : u).toString(16);
                (e.target.postMessage({ hex: t, workLoad: f }),
                  u.dAddOffset(p, 0));
              }
            }
            l = Math.max(1, l);
            for (var n = [], t = 0; t < l; ++t) n[t] = new Worker(d);
            for (t = 0; t < l; ++t) n[t].addEventListener("message", e);
            var i = !1;
          }
          var a, s, o, c, u, l, f, p, d;
        }
        function y(e, t, r, n) {
          var i,
            a = g(e, t),
            s = 0,
            o =
              (i = a.bitLength()) <= 100
                ? 27
                : i <= 150
                  ? 18
                  : i <= 200
                    ? 15
                    : i <= 250
                      ? 12
                      : i <= 300
                        ? 9
                        : i <= 350
                          ? 8
                          : i <= 400
                            ? 7
                            : i <= 500
                              ? 6
                              : i <= 600
                                ? 5
                                : i <= 800
                                  ? 4
                                  : i <= 1250
                                    ? 3
                                    : 2,
            c = ("millerRabinTests" in r && (o = r.millerRabinTests), 10),
            u = ("maxBlockTime" in r && (c = r.maxBlockTime), +new Date());
          do {
            if ((a = a.bitLength() > e ? g(e, t) : a).isProbablePrime(o))
              return n(null, a);
          } while ((a.dAddOffset(l[s++ % 8], 0), c < 0 || +new Date() - u < c));
          h.util.setImmediate(function () {
            y(e, t, r, n);
          });
        }
        function g(e, t) {
          ((t = new m(e, t)), (e -= 1));
          return (
            t.testBit(e) || t.bitwiseTo(m.ONE.shiftLeft(e), n, t),
            t.dAddOffset(31 - t.mod(r).byteValue(), 0),
            t
          );
        }
        var e, m, l, r, n;
        h.prime ||
          ((e = h.prime = h.prime || {}),
          (m = h.jsbn.BigInteger),
          (l = [6, 4, 2, 4, 2, 4, 6, 2]),
          (r = new m(null)).fromInt(30),
          (n = function (e, t) {
            return e | t;
          }),
          (e.generateProbablePrime = function (e, t, r) {
            "function" == typeof t && ((r = t), (t = {}));
            var n = (t = t || {}).algorithm || "PRIMEINC",
              i =
                (((n = "string" == typeof n ? { name: n } : n).options =
                  n.options || {}),
                t.prng || h.random);
            if ("PRIMEINC" === n.name)
              return a(
                e,
                {
                  nextBytes: function (e) {
                    for (
                      var t = i.getBytesSync(e.length), r = 0;
                      r < e.length;
                      ++r
                    )
                      e[r] = t.charCodeAt(r);
                  },
                },
                n.options,
                r,
              );
            throw new Error("Invalid prime generation algorithm: " + n.name);
          }));
      }
      var a = "prime";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/prime",
        ["require", "module", "./util", "./jsbn", "./random"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(f) {
        function c(e, t, r) {
          var n,
            i = f.util.createBuffer(),
            t = Math.ceil(t.n.bitLength() / 8);
          if (e.length > t - 11)
            throw (
              ((n = new Error(
                "Message is too long for PKCS#1 v1.5 padding.",
              )).length = e.length),
              (n.max = t - 11),
              n
            );
          (i.putByte(0), i.putByte(r));
          var a = t - 3 - e.length;
          if (0 === r || 1 === r)
            for (var s = 0 === r ? 0 : 255, o = 0; o < a; ++o) i.putByte(s);
          else
            for (; 0 < a;) {
              for (var c = 0, u = f.random.getBytes(a), o = 0; o < a; ++o)
                0 === (s = u.charCodeAt(o)) ? ++c : i.putByte(s);
              a = c;
            }
          return (i.putByte(0), i.putBytes(e), i);
        }
        function u(e, t, r, n) {
          var t = Math.ceil(t.n.bitLength() / 8),
            i = f.util.createBuffer(e),
            e = i.getByte(),
            a = i.getByte();
          if (
            0 !== e ||
            (r && 0 !== a && 1 !== a) ||
            (!r && 2 != a) ||
            (r && 0 === a && void 0 === n)
          )
            throw new Error("Encryption block is invalid.");
          var s = 0;
          if (0 === a) {
            for (var s = t - 3 - n, o = 0; o < s; ++o)
              if (0 !== i.getByte())
                throw new Error("Encryption block is invalid.");
          } else if (1 === a)
            for (s = 0; 1 < i.length();) {
              if (255 !== i.getByte()) {
                --i.read;
                break;
              }
              ++s;
            }
          else if (2 === a)
            for (s = 0; 1 < i.length();) {
              if (0 === i.getByte()) {
                --i.read;
                break;
              }
              ++s;
            }
          if (0 !== i.getByte() || s !== t - 3 - i.length())
            throw new Error("Encryption block is invalid.");
          return i.getBytes();
        }
        function t(e) {
          e = e.toString(16);
          return ("8" <= e[0] && (e = "00" + e), f.util.hexToBytes(e));
        }
        function l(e) {
          var t, r;
          if (e.algorithm in y.oids)
            return (
              (r = y.oids[e.algorithm]),
              (r = h.oidToDer(r).getBytes()),
              (t = h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [])),
              (n = h.create(
                h.Class.UNIVERSAL,
                h.Type.SEQUENCE,
                !0,
                [],
              )).value.push(h.create(h.Class.UNIVERSAL, h.Type.OID, !1, r)),
              n.value.push(h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, "")),
              (r = h.create(
                h.Class.UNIVERSAL,
                h.Type.OCTETSTRING,
                !1,
                e.digest().getBytes(),
              )),
              t.value.push(n),
              t.value.push(r),
              h.toDer(t).getBytes()
            );
          var n = new Error("Unknown message digest algorithm.");
          throw ((n.algorithm = e.algorithm), n);
        }
        function p(e, t, r) {
          if (r) return e.modPow(t.e, t.n);
          if (!t.p || !t.q) return e.modPow(t.d, t.n);
          var n;
          for (
            t.dP || (t.dP = t.d.mod(t.p.subtract(d.ONE))),
              t.dQ || (t.dQ = t.d.mod(t.q.subtract(d.ONE))),
              t.qInv || (t.qInv = t.q.modInverse(t.p));
            (n = new d(
              f.util.bytesToHex(f.random.getBytes(t.n.bitLength() / 8)),
              16,
            ).mod(t.n)).equals(d.ZERO);
          );
          for (
            var i = (e = e.multiply(n.modPow(t.e, t.n)).mod(t.n))
                .mod(t.p)
                .modPow(t.dP, t.p),
              a = e.mod(t.q).modPow(t.dQ, t.q);
            i.compareTo(a) < 0;
          )
            i = i.add(t.p);
          return i
            .subtract(a)
            .multiply(t.qInv)
            .mod(t.p)
            .multiply(t.q)
            .add(a)
            .multiply(n.modInverse(t.n))
            .mod(t.n);
        }
        void 0 === d && (d = f.jsbn.BigInteger);
        var d,
          h = f.asn1,
          y = ((f.pki = f.pki || {}), (f.pki.rsa = f.rsa = f.rsa || {}), f.pki),
          g = [6, 4, 2, 4, 2, 4, 6, 2],
          m = {
            name: "PrivateKeyInfo",
            tagClass: h.Class.UNIVERSAL,
            type: h.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "PrivateKeyInfo.version",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyVersion",
              },
              {
                name: "PrivateKeyInfo.privateKeyAlgorithm",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "AlgorithmIdentifier.algorithm",
                    tagClass: h.Class.UNIVERSAL,
                    type: h.Type.OID,
                    constructed: !1,
                    capture: "privateKeyOid",
                  },
                ],
              },
              {
                name: "PrivateKeyInfo",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.OCTETSTRING,
                constructed: !1,
                capture: "privateKey",
              },
            ],
          },
          C = {
            name: "RSAPrivateKey",
            tagClass: h.Class.UNIVERSAL,
            type: h.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "RSAPrivateKey.version",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyVersion",
              },
              {
                name: "RSAPrivateKey.modulus",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyModulus",
              },
              {
                name: "RSAPrivateKey.publicExponent",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyPublicExponent",
              },
              {
                name: "RSAPrivateKey.privateExponent",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyPrivateExponent",
              },
              {
                name: "RSAPrivateKey.prime1",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyPrime1",
              },
              {
                name: "RSAPrivateKey.prime2",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyPrime2",
              },
              {
                name: "RSAPrivateKey.exponent1",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyExponent1",
              },
              {
                name: "RSAPrivateKey.exponent2",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyExponent2",
              },
              {
                name: "RSAPrivateKey.coefficient",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "privateKeyCoefficient",
              },
            ],
          },
          i = {
            name: "RSAPublicKey",
            tagClass: h.Class.UNIVERSAL,
            type: h.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "RSAPublicKey.modulus",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "publicKeyModulus",
              },
              {
                name: "RSAPublicKey.exponent",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.INTEGER,
                constructed: !1,
                capture: "publicKeyExponent",
              },
            ],
          },
          a = (f.pki.rsa.publicKeyValidator = {
            name: "SubjectPublicKeyInfo",
            tagClass: h.Class.UNIVERSAL,
            type: h.Type.SEQUENCE,
            constructed: !0,
            captureAsn1: "subjectPublicKeyInfo",
            value: [
              {
                name: "SubjectPublicKeyInfo.AlgorithmIdentifier",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "AlgorithmIdentifier.algorithm",
                    tagClass: h.Class.UNIVERSAL,
                    type: h.Type.OID,
                    constructed: !1,
                    capture: "publicKeyOid",
                  },
                ],
              },
              {
                name: "SubjectPublicKeyInfo.subjectPublicKey",
                tagClass: h.Class.UNIVERSAL,
                type: h.Type.BITSTRING,
                constructed: !1,
                value: [
                  {
                    name: "SubjectPublicKeyInfo.subjectPublicKey.RSAPublicKey",
                    tagClass: h.Class.UNIVERSAL,
                    type: h.Type.SEQUENCE,
                    constructed: !0,
                    optional: !0,
                    captureAsn1: "rsaPublicKey",
                  },
                ],
              },
            ],
          });
        ((y.rsa.encrypt = function (e, t, r) {
          for (
            var n,
              i = r,
              a = Math.ceil(t.n.bitLength() / 8),
              r =
                (!1 !== r && !0 !== r
                  ? ((i = 2 === r), (n = c(e, t, r)))
                  : (n = f.util.createBuffer()).putBytes(e),
                new d(n.toHex(), 16)),
              e = p(r, t, i).toString(16),
              s = f.util.createBuffer(),
              o = a - Math.ceil(e.length / 2);
            0 < o;
          )
            (s.putByte(0), --o);
          return (s.putBytes(f.util.hexToBytes(e)), s.getBytes());
        }),
          (y.rsa.decrypt = function (e, t, r, n) {
            var i = Math.ceil(t.n.bitLength() / 8);
            if (e.length !== i)
              throw (
                ((a = new Error(
                  "Encrypted message length is invalid.",
                )).length = e.length),
                (a.expected = i),
                a
              );
            var a = new d(f.util.createBuffer(e).toHex(), 16);
            if (0 <= a.compareTo(t.n))
              throw new Error("Encrypted message is invalid.");
            for (
              var e = p(a, t, r).toString(16),
                s = f.util.createBuffer(),
                o = i - Math.ceil(e.length / 2);
              0 < o;
            )
              (s.putByte(0), --o);
            return (
              s.putBytes(f.util.hexToBytes(e)),
              !1 !== n ? u(s.getBytes(), t, r) : s.getBytes()
            );
          }),
          (y.rsa.createKeyPairGenerationState = function (e, t, r) {
            e = (e = "string" == typeof e ? parseInt(e, 10) : e) || 2048;
            var n = (r = r || {}).prng || f.random,
              i = {
                nextBytes: function (e) {
                  for (
                    var t = n.getBytesSync(e.length), r = 0;
                    r < e.length;
                    ++r
                  )
                    e[r] = t.charCodeAt(r);
                },
              },
              r = r.algorithm || "PRIMEINC";
            if ("PRIMEINC" !== r)
              throw new Error("Invalid key generation algorithm: " + r);
            return (
              (r = {
                algorithm: r,
                state: 0,
                bits: e,
                rng: i,
                eInt: t || 65537,
                e: new d(null),
                p: null,
                q: null,
                qBits: e >> 1,
                pBits: e - (e >> 1),
                pqState: 0,
                num: null,
                keys: null,
              }).e.fromInt(r.eInt),
              r
            );
          }),
          (y.rsa.stepKeyPairGenerationState = function (e, t) {
            "algorithm" in e || (e.algorithm = "PRIMEINC");
            function r(e, t) {
              return e | t;
            }
            for (
              var n,
                i,
                a = new d(null),
                s = (a.fromInt(30), 0),
                o = +new Date(),
                c = 0;
              null === e.keys && (t <= 0 || c < t);
            )
              (0 === e.state
                ? ((i = (n = null === e.p ? e.pBits : e.qBits) - 1),
                  0 === e.pqState
                    ? ((e.num = new d(n, e.rng)),
                      e.num.testBit(i) ||
                        e.num.bitwiseTo(d.ONE.shiftLeft(i), r, e.num),
                      e.num.dAddOffset(31 - e.num.mod(a).byteValue(), 0),
                      (s = 0),
                      ++e.pqState)
                    : 1 === e.pqState
                      ? e.num.bitLength() > n
                        ? (e.pqState = 0)
                        : e.num.isProbablePrime(
                              (i = e.num.bitLength()) <= 100
                                ? 27
                                : i <= 150
                                  ? 18
                                  : i <= 200
                                    ? 15
                                    : i <= 250
                                      ? 12
                                      : i <= 300
                                        ? 9
                                        : i <= 350
                                          ? 8
                                          : i <= 400
                                            ? 7
                                            : i <= 500
                                              ? 6
                                              : i <= 600
                                                ? 5
                                                : i <= 800
                                                  ? 4
                                                  : i <= 1250
                                                    ? 3
                                                    : 2,
                            )
                          ? ++e.pqState
                          : e.num.dAddOffset(g[s++ % 8], 0)
                      : 2 === e.pqState
                        ? (e.pqState =
                            0 ===
                            e.num.subtract(d.ONE).gcd(e.e).compareTo(d.ONE)
                              ? 3
                              : 0)
                        : 3 === e.pqState &&
                          ((e.pqState = 0),
                          null === e.p ? (e.p = e.num) : (e.q = e.num),
                          null !== e.p && null !== e.q && ++e.state,
                          (e.num = null)))
                : 1 === e.state
                  ? (e.p.compareTo(e.q) < 0 &&
                      ((e.num = e.p), (e.p = e.q), (e.q = e.num)),
                    ++e.state)
                  : 2 === e.state
                    ? ((e.p1 = e.p.subtract(d.ONE)),
                      (e.q1 = e.q.subtract(d.ONE)),
                      (e.phi = e.p1.multiply(e.q1)),
                      ++e.state)
                    : 3 === e.state
                      ? 0 === e.phi.gcd(e.e).compareTo(d.ONE)
                        ? ++e.state
                        : ((e.p = null), (e.q = null), (e.state = 0))
                      : 4 === e.state
                        ? ((e.n = e.p.multiply(e.q)),
                          e.n.bitLength() === e.bits
                            ? ++e.state
                            : ((e.q = null), (e.state = 0)))
                        : 5 === e.state &&
                          ((n = e.e.modInverse(e.phi)),
                          (e.keys = {
                            privateKey: y.rsa.setPrivateKey(
                              e.n,
                              e.e,
                              n,
                              e.p,
                              e.q,
                              n.mod(e.p1),
                              n.mod(e.q1),
                              e.q.modInverse(e.p),
                            ),
                            publicKey: y.rsa.setPublicKey(e.n, e.e),
                          })),
                (c += (i = +new Date()) - o),
                (o = i));
            return null !== e.keys;
          }),
          (y.rsa.generateKeyPair = function (e, t, r, n) {
            (1 === arguments.length
              ? "object" == typeof e
                ? ((r = e), (e = void 0))
                : "function" == typeof e && ((n = e), (e = void 0))
              : 2 === arguments.length
                ? "number" == typeof e
                  ? "function" == typeof t
                    ? ((n = t), (t = void 0))
                    : "number" != typeof t && ((r = t), (t = void 0))
                  : ((r = e), (n = t), (t = e = void 0))
                : 3 === arguments.length &&
                  ("number" == typeof t
                    ? "function" == typeof r && ((n = r), (r = void 0))
                    : ((n = r), (r = t), (t = void 0))),
              (r = r || {}),
              void 0 === e && (e = r.bits || 2048),
              void 0 === t && (t = r.e || 65537));
            var i,
              a,
              s,
              o = y.rsa.createKeyPairGenerationState(e, t, r);
            if (!n) return (y.rsa.stepKeyPairGenerationState(o, 0), o.keys);
            function c() {
              u(i.pBits, function (e, t) {
                return e
                  ? a(e)
                  : ((i.p = t), null !== i.q ? l(e, i.q) : void u(i.qBits, l));
              });
            }
            function u(e, t) {
              f.prime.generateProbablePrime(e, s, t);
            }
            function l(e, t) {
              if (e) return a(e);
              ((i.q = t),
                i.p.compareTo(i.q) < 0 && ((e = i.p), (i.p = i.q), (i.q = e)),
                0 !== i.p.subtract(d.ONE).gcd(i.e).compareTo(d.ONE)
                  ? ((i.p = null), c())
                  : 0 !== i.q.subtract(d.ONE).gcd(i.e).compareTo(d.ONE)
                    ? ((i.q = null), u(i.qBits, l))
                    : ((i.p1 = i.p.subtract(d.ONE)),
                      (i.q1 = i.q.subtract(d.ONE)),
                      (i.phi = i.p1.multiply(i.q1)),
                      0 !== i.phi.gcd(i.e).compareTo(d.ONE)
                        ? ((i.p = i.q = null), c())
                        : ((i.n = i.p.multiply(i.q)),
                          i.n.bitLength() !== i.bits
                            ? ((i.q = null), u(i.qBits, l))
                            : ((t = i.e.modInverse(i.phi)),
                              (i.keys = {
                                privateKey: y.rsa.setPrivateKey(
                                  i.n,
                                  i.e,
                                  t,
                                  i.p,
                                  i.q,
                                  t.mod(i.p1),
                                  t.mod(i.q1),
                                  i.q.modInverse(i.p),
                                ),
                                publicKey: y.rsa.setPublicKey(i.n, i.e),
                              }),
                              a(null, i.keys)))));
            }
            ((i = o),
              (a = n),
              "function" == typeof (o = r) && ((a = o), (o = {})),
              (s = {
                algorithm: {
                  name: (o = o || {}).algorithm || "PRIMEINC",
                  options: {
                    workers: o.workers || 2,
                    workLoad: o.workLoad || 100,
                    workerScript: o.workerScript,
                  },
                },
              }),
              "prng" in o && (s.prng = o.prng),
              c());
          }),
          (y.setRsaPublicKey = y.rsa.setPublicKey =
            function (e, t) {
              var n = {
                n: e,
                e: t,
                encrypt: function (e, t, r) {
                  if (
                    ("string" == typeof t
                      ? (t = t.toUpperCase())
                      : void 0 === t && (t = "RSAES-PKCS1-V1_5"),
                    "RSAES-PKCS1-V1_5" === t)
                  )
                    t = {
                      encode: function (e, t, r) {
                        return c(e, t, 2).getBytes();
                      },
                    };
                  else if ("RSA-OAEP" === t || "RSAES-OAEP" === t)
                    t = {
                      encode: function (e, t) {
                        return f.pkcs1.encode_rsa_oaep(t, e, r);
                      },
                    };
                  else if (-1 !== ["RAW", "NONE", "NULL", null].indexOf(t))
                    t = {
                      encode: function (e) {
                        return e;
                      },
                    };
                  else if ("string" == typeof t)
                    throw new Error(
                      'Unsupported encryption scheme: "' + t + '".',
                    );
                  t = t.encode(e, n, !0);
                  return y.rsa.encrypt(t, n, !0);
                },
                verify: function (e, t, r) {
                  ("string" == typeof r
                    ? (r = r.toUpperCase())
                    : void 0 === r && (r = "RSASSA-PKCS1-V1_5"),
                    "RSASSA-PKCS1-V1_5" === r
                      ? (r = {
                          verify: function (e, t) {
                            return (
                              (t = u(t, n, !0)),
                              e === h.fromDer(t).value[1].value
                            );
                          },
                        })
                      : ("NONE" !== r && "NULL" !== r && null !== r) ||
                        (r = {
                          verify: function (e, t) {
                            return e === (t = u(t, n, !0));
                          },
                        }));
                  t = y.rsa.decrypt(t, n, !0, !1);
                  return r.verify(e, t, n.n.bitLength());
                },
              };
              return n;
            }),
          (y.setRsaPrivateKey = y.rsa.setPrivateKey =
            function (e, t, r, n, i, a, s, o) {
              var c = {
                n: e,
                e: t,
                d: r,
                p: n,
                q: i,
                dP: a,
                dQ: s,
                qInv: o,
                decrypt: function (e, t, r) {
                  "string" == typeof t
                    ? (t = t.toUpperCase())
                    : void 0 === t && (t = "RSAES-PKCS1-V1_5");
                  e = y.rsa.decrypt(e, c, !1, !1);
                  if ("RSAES-PKCS1-V1_5" === t) t = { decode: u };
                  else if ("RSA-OAEP" === t || "RSAES-OAEP" === t)
                    t = {
                      decode: function (e, t) {
                        return f.pkcs1.decode_rsa_oaep(t, e, r);
                      },
                    };
                  else {
                    if (-1 === ["RAW", "NONE", "NULL", null].indexOf(t))
                      throw new Error(
                        'Unsupported encryption scheme: "' + t + '".',
                      );
                    t = {
                      decode: function (e) {
                        return e;
                      },
                    };
                  }
                  return t.decode(e, c, !1);
                },
                sign: function (e, t) {
                  var r = !1,
                    t =
                      (void 0 ===
                        (t = "string" == typeof t ? t.toUpperCase() : t) ||
                      "RSASSA-PKCS1-V1_5" === t
                        ? ((t = { encode: l }), (r = 1))
                        : ("NONE" !== t && "NULL" !== t && null !== t) ||
                          ((t = {
                            encode: function () {
                              return e;
                            },
                          }),
                          (r = 1)),
                      t.encode(e, c.n.bitLength()));
                  return y.rsa.encrypt(t, c, r);
                },
              };
              return c;
            }),
          (y.wrapRsaPrivateKey = function (e) {
            return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
              h.create(
                h.Class.UNIVERSAL,
                h.Type.INTEGER,
                !1,
                h.integerToDer(0).getBytes(),
              ),
              h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
                h.create(
                  h.Class.UNIVERSAL,
                  h.Type.OID,
                  !1,
                  h.oidToDer(y.oids.rsaEncryption).getBytes(),
                ),
                h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, ""),
              ]),
              h.create(
                h.Class.UNIVERSAL,
                h.Type.OCTETSTRING,
                !1,
                h.toDer(e).getBytes(),
              ),
            ]);
          }),
          (y.privateKeyFromAsn1 = function (e) {
            var t,
              r,
              n,
              i,
              a,
              s,
              o,
              c = {};
            if (
              (h.validate(e, m, c, []) &&
                (e = h.fromDer(f.util.createBuffer(c.privateKey))),
              h.validate(e, C, (c = {}), (e = [])))
            )
              return (
                (t = f.util.createBuffer(c.privateKeyModulus).toHex()),
                (r = f.util.createBuffer(c.privateKeyPublicExponent).toHex()),
                (n = f.util.createBuffer(c.privateKeyPrivateExponent).toHex()),
                (i = f.util.createBuffer(c.privateKeyPrime1).toHex()),
                (a = f.util.createBuffer(c.privateKeyPrime2).toHex()),
                (s = f.util.createBuffer(c.privateKeyExponent1).toHex()),
                (o = f.util.createBuffer(c.privateKeyExponent2).toHex()),
                (c = f.util.createBuffer(c.privateKeyCoefficient).toHex()),
                y.setRsaPrivateKey(
                  new d(t, 16),
                  new d(r, 16),
                  new d(n, 16),
                  new d(i, 16),
                  new d(a, 16),
                  new d(s, 16),
                  new d(o, 16),
                  new d(c, 16),
                )
              );
            throw (
              ((t = new Error(
                "Cannot read private key. ASN.1 object does not contain an RSAPrivateKey.",
              )).errors = e),
              t
            );
          }),
          (y.privateKeyToAsn1 = y.privateKeyToRSAPrivateKey =
            function (e) {
              return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
                h.create(
                  h.Class.UNIVERSAL,
                  h.Type.INTEGER,
                  !1,
                  h.integerToDer(0).getBytes(),
                ),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.n)),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.e)),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.d)),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.p)),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.q)),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.dP)),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.dQ)),
                h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.qInv)),
              ]);
            }),
          (y.publicKeyFromAsn1 = function (e) {
            var t = {};
            if (h.validate(e, a, t, [])) {
              var r,
                n = h.derToOid(t.publicKeyOid);
              if (n !== y.oids.rsaEncryption)
                throw (
                  ((r = new Error("Cannot read public key. Unknown OID.")).oid =
                    n),
                  r
                );
              e = t.rsaPublicKey;
            }
            if (h.validate(e, i, t, (n = [])))
              return (
                (e = f.util.createBuffer(t.publicKeyModulus).toHex()),
                (t = f.util.createBuffer(t.publicKeyExponent).toHex()),
                y.setRsaPublicKey(new d(e, 16), new d(t, 16))
              );
            throw (
              ((r = new Error(
                "Cannot read public key. ASN.1 object does not contain an RSAPublicKey.",
              )).errors = n),
              r
            );
          }),
          (y.publicKeyToAsn1 = y.publicKeyToSubjectPublicKeyInfo =
            function (e) {
              return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
                h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
                  h.create(
                    h.Class.UNIVERSAL,
                    h.Type.OID,
                    !1,
                    h.oidToDer(y.oids.rsaEncryption).getBytes(),
                  ),
                  h.create(h.Class.UNIVERSAL, h.Type.NULL, !1, ""),
                ]),
                h.create(h.Class.UNIVERSAL, h.Type.BITSTRING, !1, [
                  y.publicKeyToRSAPublicKey(e),
                ]),
              ]);
            }),
          (y.publicKeyToRSAPublicKey = function (e) {
            return h.create(h.Class.UNIVERSAL, h.Type.SEQUENCE, !0, [
              h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.n)),
              h.create(h.Class.UNIVERSAL, h.Type.INTEGER, !1, t(e.e)),
            ]);
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/rsa",
        [
          "require",
          "module",
          "./asn1",
          "./jsbn",
          "./oids",
          "./pkcs1",
          "./prime",
          "./random",
          "./util",
        ],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.rsa)) {
                e.defined.rsa = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.rsa;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(R) {
        function o(e, t) {
          return e.start().update(t).digest().getBytes();
        }
        R.jsbn.BigInteger;
        var m = R.asn1,
          C = (R.pki = R.pki || {}),
          v = ((C.pbe = R.pbe = R.pbe || {}), C.oids),
          a = {
            name: "EncryptedPrivateKeyInfo",
            tagClass: m.Class.UNIVERSAL,
            type: m.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "EncryptedPrivateKeyInfo.encryptionAlgorithm",
                tagClass: m.Class.UNIVERSAL,
                type: m.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "AlgorithmIdentifier.algorithm",
                    tagClass: m.Class.UNIVERSAL,
                    type: m.Type.OID,
                    constructed: !1,
                    capture: "encryptionOid",
                  },
                  {
                    name: "AlgorithmIdentifier.parameters",
                    tagClass: m.Class.UNIVERSAL,
                    type: m.Type.SEQUENCE,
                    constructed: !0,
                    captureAsn1: "encryptionParams",
                  },
                ],
              },
              {
                name: "EncryptedPrivateKeyInfo.encryptedData",
                tagClass: m.Class.UNIVERSAL,
                type: m.Type.OCTETSTRING,
                constructed: !1,
                capture: "encryptedData",
              },
            ],
          },
          c = {
            name: "PBES2Algorithms",
            tagClass: m.Class.UNIVERSAL,
            type: m.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "PBES2Algorithms.keyDerivationFunc",
                tagClass: m.Class.UNIVERSAL,
                type: m.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "PBES2Algorithms.keyDerivationFunc.oid",
                    tagClass: m.Class.UNIVERSAL,
                    type: m.Type.OID,
                    constructed: !1,
                    capture: "kdfOid",
                  },
                  {
                    name: "PBES2Algorithms.params",
                    tagClass: m.Class.UNIVERSAL,
                    type: m.Type.SEQUENCE,
                    constructed: !0,
                    value: [
                      {
                        name: "PBES2Algorithms.params.salt",
                        tagClass: m.Class.UNIVERSAL,
                        type: m.Type.OCTETSTRING,
                        constructed: !1,
                        capture: "kdfSalt",
                      },
                      {
                        name: "PBES2Algorithms.params.iterationCount",
                        tagClass: m.Class.UNIVERSAL,
                        type: m.Type.INTEGER,
                        onstructed: !0,
                        capture: "kdfIterationCount",
                      },
                    ],
                  },
                ],
              },
              {
                name: "PBES2Algorithms.encryptionScheme",
                tagClass: m.Class.UNIVERSAL,
                type: m.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "PBES2Algorithms.encryptionScheme.oid",
                    tagClass: m.Class.UNIVERSAL,
                    type: m.Type.OID,
                    constructed: !1,
                    capture: "encOid",
                  },
                  {
                    name: "PBES2Algorithms.encryptionScheme.iv",
                    tagClass: m.Class.UNIVERSAL,
                    type: m.Type.OCTETSTRING,
                    constructed: !1,
                    capture: "encIv",
                  },
                ],
              },
            ],
          },
          u = {
            name: "pkcs-12PbeParams",
            tagClass: m.Class.UNIVERSAL,
            type: m.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "pkcs-12PbeParams.salt",
                tagClass: m.Class.UNIVERSAL,
                type: m.Type.OCTETSTRING,
                constructed: !1,
                capture: "salt",
              },
              {
                name: "pkcs-12PbeParams.iterations",
                tagClass: m.Class.UNIVERSAL,
                type: m.Type.INTEGER,
                constructed: !1,
                capture: "iterations",
              },
            ],
          };
        ((C.encryptPrivateKeyInfo = function (e, t, r) {
          (((r = r || {}).saltSize = r.saltSize || 8),
            (r.count = r.count || 2048),
            (r.algorithm = r.algorithm || "aes128"));
          var n,
            i,
            a,
            s,
            o,
            c,
            u = R.random.getBytesSync(r.saltSize),
            l = r.count,
            f = m.integerToDer(l);
          if (0 === r.algorithm.indexOf("aes") || "des" === r.algorithm) {
            switch (r.algorithm) {
              case "aes128":
                ((a = y = 16),
                  (s = v["aes128-CBC"]),
                  (o = R.aes.createEncryptionCipher));
                break;
              case "aes192":
                ((y = 24),
                  (a = 16),
                  (s = v["aes192-CBC"]),
                  (o = R.aes.createEncryptionCipher));
                break;
              case "aes256":
                ((y = 32),
                  (a = 16),
                  (s = v["aes256-CBC"]),
                  (o = R.aes.createEncryptionCipher));
                break;
              case "des":
                ((a = y = 8),
                  (s = v.desCBC),
                  (o = R.des.createEncryptionCipher));
                break;
              default:
                throw (
                  ((c = new Error(
                    "Cannot encrypt private key. Unknown encryption algorithm.",
                  )).algorithm = r.algorithm),
                  c
                );
            }
            var p = R.pkcs5.pbkdf2(t, u, l, y),
              d = R.random.getBytesSync(a);
            ((h = o(p)).start(d),
              h.update(m.toDer(e)),
              h.finish(),
              (i = h.output.getBytes()),
              (n = m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
                m.create(
                  m.Class.UNIVERSAL,
                  m.Type.OID,
                  !1,
                  m.oidToDer(v.pkcs5PBES2).getBytes(),
                ),
                m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
                  m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
                    m.create(
                      m.Class.UNIVERSAL,
                      m.Type.OID,
                      !1,
                      m.oidToDer(v.pkcs5PBKDF2).getBytes(),
                    ),
                    m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
                      m.create(m.Class.UNIVERSAL, m.Type.OCTETSTRING, !1, u),
                      m.create(
                        m.Class.UNIVERSAL,
                        m.Type.INTEGER,
                        !1,
                        f.getBytes(),
                      ),
                    ]),
                  ]),
                  m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
                    m.create(
                      m.Class.UNIVERSAL,
                      m.Type.OID,
                      !1,
                      m.oidToDer(s).getBytes(),
                    ),
                    m.create(m.Class.UNIVERSAL, m.Type.OCTETSTRING, !1, d),
                  ]),
                ]),
              ])));
          } else {
            if ("3des" !== r.algorithm)
              throw (
                ((c = new Error(
                  "Cannot encrypt private key. Unknown encryption algorithm.",
                )).algorithm = r.algorithm),
                c
              );
            var h,
              y = 24,
              g = new R.util.ByteBuffer(u),
              p = C.pbe.generatePkcs12Key(t, g, 1, l, y),
              d = C.pbe.generatePkcs12Key(t, g, 2, l, y);
            ((h = R.des.createEncryptionCipher(p)).start(d),
              h.update(m.toDer(e)),
              h.finish(),
              (i = h.output.getBytes()),
              (n = m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
                m.create(
                  m.Class.UNIVERSAL,
                  m.Type.OID,
                  !1,
                  m.oidToDer(v["pbeWithSHAAnd3-KeyTripleDES-CBC"]).getBytes(),
                ),
                m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
                  m.create(m.Class.UNIVERSAL, m.Type.OCTETSTRING, !1, u),
                  m.create(m.Class.UNIVERSAL, m.Type.INTEGER, !1, f.getBytes()),
                ]),
              ])));
          }
          return m.create(m.Class.UNIVERSAL, m.Type.SEQUENCE, !0, [
            n,
            m.create(m.Class.UNIVERSAL, m.Type.OCTETSTRING, !1, i),
          ]);
        }),
          (C.decryptPrivateKeyInfo = function (e, t) {
            var r = null,
              n = {},
              i = [];
            if (m.validate(e, a, n, i))
              return (
                (e = m.derToOid(n.encryptionOid)),
                (e = C.pbe.getCipher(e, n.encryptionParams, t)),
                (t = R.util.createBuffer(n.encryptedData)),
                e.update(t),
                e.finish() ? m.fromDer(e.output) : r
              );
            throw (
              ((n = new Error(
                "Cannot read encrypted private key. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",
              )).errors = i),
              n
            );
          }),
          (C.encryptedPrivateKeyToPem = function (e, t) {
            e = { type: "ENCRYPTED PRIVATE KEY", body: m.toDer(e).getBytes() };
            return R.pem.encode(e, { maxline: t });
          }),
          (C.encryptedPrivateKeyFromPem = function (e) {
            var t,
              e = R.pem.decode(e)[0];
            if ("ENCRYPTED PRIVATE KEY" !== e.type)
              throw (
                ((t = new Error(
                  'Could not convert encrypted private key from PEM; PEM header type is "ENCRYPTED PRIVATE KEY".',
                )).headerType = e.type),
                t
              );
            if (e.procType && "ENCRYPTED" === e.procType.type)
              throw new Error(
                "Could not convert encrypted private key from PEM; PEM is encrypted.",
              );
            return m.fromDer(e.body);
          }),
          (C.encryptRsaPrivateKey = function (e, t, r) {
            var n, i, a, s;
            if (!(r = r || {}).legacy)
              return (
                (c = C.wrapRsaPrivateKey(C.privateKeyToAsn1(e))),
                (c = C.encryptPrivateKeyInfo(c, t, r)),
                C.encryptedPrivateKeyToPem(c)
              );
            switch (r.algorithm) {
              case "aes128":
                ((n = "AES-128-CBC"),
                  (i = R.random.getBytesSync((a = 16))),
                  (s = R.aes.createEncryptionCipher));
                break;
              case "aes192":
                ((n = "AES-192-CBC"),
                  (a = 24),
                  (i = R.random.getBytesSync(16)),
                  (s = R.aes.createEncryptionCipher));
                break;
              case "aes256":
                ((n = "AES-256-CBC"),
                  (a = 32),
                  (i = R.random.getBytesSync(16)),
                  (s = R.aes.createEncryptionCipher));
                break;
              case "3des":
                ((n = "DES-EDE3-CBC"),
                  (a = 24),
                  (i = R.random.getBytesSync(8)),
                  (s = R.des.createEncryptionCipher));
                break;
              case "des":
                ((n = "DES-CBC"),
                  (i = R.random.getBytesSync((a = 8))),
                  (s = R.des.createEncryptionCipher));
                break;
              default:
                var o = new Error(
                  'Could not encrypt RSA private key; unsupported encryption algorithm "' +
                    r.algorithm +
                    '".',
                );
                throw ((o.algorithm = r.algorithm), o);
            }
            var c = s(R.pbe.opensslDeriveBytes(t, i.substr(0, 8), a)),
              t =
                (c.start(i),
                c.update(m.toDer(C.privateKeyToAsn1(e))),
                c.finish(),
                {
                  type: "RSA PRIVATE KEY",
                  procType: { version: "4", type: "ENCRYPTED" },
                  dekInfo: {
                    algorithm: n,
                    parameters: R.util.bytesToHex(i).toUpperCase(),
                  },
                  body: c.output.getBytes(),
                });
            return R.pem.encode(t);
          }),
          (C.decryptRsaPrivateKey = function (e, t) {
            var r,
              n,
              i,
              a = null,
              s = R.pem.decode(e)[0];
            if (
              "ENCRYPTED PRIVATE KEY" !== s.type &&
              "PRIVATE KEY" !== s.type &&
              "RSA PRIVATE KEY" !== s.type
            )
              throw ((i = new Error(
                'Could not convert private key from PEM; PEM header type is not "ENCRYPTED PRIVATE KEY", "PRIVATE KEY", or "RSA PRIVATE KEY".',
              )).headerType = i);
            if (s.procType && "ENCRYPTED" === s.procType.type) {
              switch (s.dekInfo.algorithm) {
                case "DES-CBC":
                  ((r = 8), (n = R.des.createDecryptionCipher));
                  break;
                case "DES-EDE3-CBC":
                  ((r = 24), (n = R.des.createDecryptionCipher));
                  break;
                case "AES-128-CBC":
                  ((r = 16), (n = R.aes.createDecryptionCipher));
                  break;
                case "AES-192-CBC":
                  ((r = 24), (n = R.aes.createDecryptionCipher));
                  break;
                case "AES-256-CBC":
                  ((r = 32), (n = R.aes.createDecryptionCipher));
                  break;
                case "RC2-40-CBC":
                  ((r = 5),
                    (n = function (e) {
                      return R.rc2.createDecryptionCipher(e, 40);
                    }));
                  break;
                case "RC2-64-CBC":
                  ((r = 8),
                    (n = function (e) {
                      return R.rc2.createDecryptionCipher(e, 64);
                    }));
                  break;
                case "RC2-128-CBC":
                  ((r = 16),
                    (n = function (e) {
                      return R.rc2.createDecryptionCipher(e, 128);
                    }));
                  break;
                default:
                  throw (
                    ((i = new Error(
                      'Could not decrypt private key; unsupported encryption algorithm "' +
                        s.dekInfo.algorithm +
                        '".',
                    )).algorithm = s.dekInfo.algorithm),
                    i
                  );
              }
              var e = R.util.hexToBytes(s.dekInfo.parameters),
                o = n(R.pbe.opensslDeriveBytes(t, e.substr(0, 8), r));
              if (
                (o.start(e), o.update(R.util.createBuffer(s.body)), !o.finish())
              )
                return a;
              a = o.output.getBytes();
            } else a = s.body;
            return (a =
              null !==
              (a =
                "ENCRYPTED PRIVATE KEY" === s.type
                  ? C.decryptPrivateKeyInfo(m.fromDer(a), t)
                  : m.fromDer(a))
                ? C.privateKeyFromAsn1(a)
                : a);
          }),
          (C.pbe.generatePkcs12Key = function (e, t, r, n, i, a) {
            var s = (a = null == a ? R.md.sha1.create() : a).digestLength,
              o = a.blockLength,
              c = new R.util.ByteBuffer(),
              u = new R.util.ByteBuffer();
            if (null != e) {
              for (N = 0; N < e.length; N++) u.putInt16(e.charCodeAt(N));
              u.putInt16(0);
            }
            var l = u.length(),
              f = t.length(),
              p = new R.util.ByteBuffer(),
              d = (p.fillWithByte(r, o), o * Math.ceil(f / o)),
              h = new R.util.ByteBuffer();
            for (N = 0; N < d; N++) h.putByte(t.at(N % f));
            var y = o * Math.ceil(l / o),
              g = new R.util.ByteBuffer();
            for (N = 0; N < y; N++) g.putByte(u.at(N % l));
            for (
              var m = h, C = (m.putBuffer(g), Math.ceil(i / s)), v = 1;
              v <= C;
              v++
            ) {
              var E = new R.util.ByteBuffer();
              (E.putBytes(p.bytes()), E.putBytes(m.bytes()));
              for (var S = 0; S < n; S++)
                (a.start(), a.update(E.getBytes()), (E = a.digest()));
              var T = new R.util.ByteBuffer();
              for (N = 0; N < o; N++) T.putByte(E.at(N % s));
              for (
                var I = Math.ceil(f / o) + Math.ceil(l / o),
                  A = new R.util.ByteBuffer(),
                  b = 0;
                b < I;
                b++
              ) {
                for (
                  var B = new R.util.ByteBuffer(m.getBytes(o)),
                    k = 511,
                    N = T.length() - 1;
                  0 <= N;
                  N--
                )
                  ((k = (k >>= 8) + (T.at(N) + B.at(N))), B.setAt(N, 255 & k));
                A.putBuffer(B);
              }
              ((m = A), c.putBuffer(E));
            }
            return (c.truncate(c.length() - i), c);
          }),
          (C.pbe.getCipher = function (e, t, r) {
            switch (e) {
              case C.oids.pkcs5PBES2:
                return C.pbe.getCipherForPBES2(e, t, r);
              case C.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
              case C.oids["pbewithSHAAnd40BitRC2-CBC"]:
                return C.pbe.getCipherForPKCS12PBE(e, t, r);
              default:
                var n = new Error(
                  "Cannot read encrypted PBE data block. Unsupported OID.",
                );
                throw (
                  (n.oid = e),
                  (n.supportedOids = [
                    "pkcs5PBES2",
                    "pbeWithSHAAnd3-KeyTripleDES-CBC",
                    "pbewithSHAAnd40BitRC2-CBC",
                  ]),
                  n
                );
            }
          }),
          (C.pbe.getCipherForPBES2 = function (e, t, r) {
            var n = {},
              i = [];
            if (!m.validate(t, c, n, i))
              throw (
                ((o = new Error(
                  "Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",
                )).errors = i),
                o
              );
            if ((e = m.derToOid(n.kdfOid)) !== C.oids.pkcs5PBKDF2)
              throw (
                ((o = new Error(
                  "Cannot read encrypted private key. Unsupported key derivation function OID.",
                )).oid = e),
                (o.supportedOids = ["pkcs5PBKDF2"]),
                o
              );
            if (
              (e = m.derToOid(n.encOid)) !== C.oids["aes128-CBC"] &&
              e !== C.oids["aes192-CBC"] &&
              e !== C.oids["aes256-CBC"] &&
              e !== C.oids["des-EDE3-CBC"] &&
              e !== C.oids.desCBC
            )
              throw (
                ((o = new Error(
                  "Cannot read encrypted private key. Unsupported encryption scheme OID.",
                )).oid = e),
                (o.supportedOids = [
                  "aes128-CBC",
                  "aes192-CBC",
                  "aes256-CBC",
                  "des-EDE3-CBC",
                  "desCBC",
                ]),
                o
              );
            var a,
              s,
              t = n.kdfSalt,
              i = (i = R.util.createBuffer(n.kdfIterationCount)).getInt(
                i.length() << 3,
              );
            switch (C.oids[e]) {
              case "aes128-CBC":
                ((a = 16), (s = R.aes.createDecryptionCipher));
                break;
              case "aes192-CBC":
                ((a = 24), (s = R.aes.createDecryptionCipher));
                break;
              case "aes256-CBC":
                ((a = 32), (s = R.aes.createDecryptionCipher));
                break;
              case "des-EDE3-CBC":
                ((a = 24), (s = R.des.createDecryptionCipher));
                break;
              case "desCBC":
                ((a = 8), (s = R.des.createDecryptionCipher));
            }
            var o = R.pkcs5.pbkdf2(r, t, i, a),
              e = n.encIv,
              r = s(o);
            return (r.start(e), r);
          }),
          (C.pbe.getCipherForPKCS12PBE = function (e, t, r) {
            var n = {},
              i = [];
            if (!m.validate(t, u, n, i))
              throw (
                ((c = new Error(
                  "Cannot read password-based-encryption algorithm parameters. ASN.1 object is not a supported EncryptedPrivateKeyInfo.",
                )).errors = i),
                c
              );
            var a,
              s,
              o,
              c,
              t = R.util.createBuffer(n.salt),
              i = (i = R.util.createBuffer(n.iterations)).getInt(
                i.length() << 3,
              );
            switch (e) {
              case C.oids["pbeWithSHAAnd3-KeyTripleDES-CBC"]:
                ((a = 24), (s = 8), (o = R.des.startDecrypting));
                break;
              case C.oids["pbewithSHAAnd40BitRC2-CBC"]:
                ((a = 5),
                  (s = 8),
                  (o = function (e, t) {
                    e = R.rc2.createDecryptionCipher(e, 40);
                    return (e.start(t, null), e);
                  }));
                break;
              default:
                throw (
                  ((c = new Error(
                    "Cannot read PKCS #12 PBE data block. Unsupported OID.",
                  )).oid = e),
                  c
                );
            }
            return o(
              C.pbe.generatePkcs12Key(r, t, 1, i, a),
              C.pbe.generatePkcs12Key(r, t, 2, i, s),
            );
          }),
          (C.pbe.opensslDeriveBytes = function (e, t, r, n) {
            for (
              var i = [
                  o(
                    (n = null == n ? R.md.md5.create() : n),
                    e + (t = null === t ? "" : t),
                  ),
                ],
                a = 16,
                s = 1;
              a < r;
              ++s, a += 16
            )
              i.push(o(n, i[s - 1] + e + t));
            return i.join("").substr(0, r);
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/pbe",
        [
          "require",
          "module",
          "./aes",
          "./asn1",
          "./des",
          "./md",
          "./oids",
          "./pem",
          "./pbkdf2",
          "./random",
          "./rc2",
          "./rsa",
          "./util",
        ],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.pbe)) {
                e.defined.pbe = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.pbe;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(e) {
        var t = e.asn1,
          r = (e.pkcs7asn1 = e.pkcs7asn1 || {}),
          e =
            ((e.pkcs7 = e.pkcs7 || {}),
            (e.pkcs7.asn1 = r),
            {
              name: "ContentInfo",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.SEQUENCE,
              constructed: !0,
              value: [
                {
                  name: "ContentInfo.ContentType",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.OID,
                  constructed: !1,
                  capture: "contentType",
                },
                {
                  name: "ContentInfo.content",
                  tagClass: t.Class.CONTEXT_SPECIFIC,
                  type: 0,
                  constructed: !0,
                  optional: !0,
                  captureAsn1: "content",
                },
              ],
            }),
          n =
            ((r.contentInfoValidator = e),
            {
              name: "EncryptedContentInfo",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.SEQUENCE,
              constructed: !0,
              value: [
                {
                  name: "EncryptedContentInfo.contentType",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.OID,
                  constructed: !1,
                  capture: "contentType",
                },
                {
                  name: "EncryptedContentInfo.contentEncryptionAlgorithm",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.SEQUENCE,
                  constructed: !0,
                  value: [
                    {
                      name: "EncryptedContentInfo.contentEncryptionAlgorithm.algorithm",
                      tagClass: t.Class.UNIVERSAL,
                      type: t.Type.OID,
                      constructed: !1,
                      capture: "encAlgorithm",
                    },
                    {
                      name: "EncryptedContentInfo.contentEncryptionAlgorithm.parameter",
                      tagClass: t.Class.UNIVERSAL,
                      captureAsn1: "encParameter",
                    },
                  ],
                },
                {
                  name: "EncryptedContentInfo.encryptedContent",
                  tagClass: t.Class.CONTEXT_SPECIFIC,
                  type: 0,
                  capture: "encryptedContent",
                  captureAsn1: "encryptedContentAsn1",
                },
              ],
            }),
          n =
            ((r.envelopedDataValidator = {
              name: "EnvelopedData",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.SEQUENCE,
              constructed: !0,
              value: [
                {
                  name: "EnvelopedData.Version",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.INTEGER,
                  constructed: !1,
                  capture: "version",
                },
                {
                  name: "EnvelopedData.RecipientInfos",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.SET,
                  constructed: !0,
                  captureAsn1: "recipientInfos",
                },
              ].concat(n),
            }),
            (r.encryptedDataValidator = {
              name: "EncryptedData",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.SEQUENCE,
              constructed: !0,
              value: [
                {
                  name: "EncryptedData.Version",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.INTEGER,
                  constructed: !1,
                  capture: "version",
                },
              ].concat(n),
            }),
            {
              name: "SignerInfo",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.SEQUENCE,
              constructed: !0,
              value: [
                {
                  name: "SignerInfo.Version",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.INTEGER,
                  constructed: !1,
                },
                {
                  name: "SignerInfo.IssuerAndSerialNumber",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.SEQUENCE,
                  constructed: !0,
                },
                {
                  name: "SignerInfo.DigestAlgorithm",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.SEQUENCE,
                  constructed: !0,
                },
                {
                  name: "SignerInfo.AuthenticatedAttributes",
                  tagClass: t.Class.CONTEXT_SPECIFIC,
                  type: 0,
                  constructed: !0,
                  optional: !0,
                  capture: "authenticatedAttributes",
                },
                {
                  name: "SignerInfo.DigestEncryptionAlgorithm",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.SEQUENCE,
                  constructed: !0,
                },
                {
                  name: "SignerInfo.EncryptedDigest",
                  tagClass: t.Class.UNIVERSAL,
                  type: t.Type.OCTETSTRING,
                  constructed: !1,
                  capture: "signature",
                },
                {
                  name: "SignerInfo.UnauthenticatedAttributes",
                  tagClass: t.Class.CONTEXT_SPECIFIC,
                  type: 1,
                  constructed: !0,
                  optional: !0,
                },
              ],
            });
        ((r.signedDataValidator = {
          name: "SignedData",
          tagClass: t.Class.UNIVERSAL,
          type: t.Type.SEQUENCE,
          constructed: !0,
          value: [
            {
              name: "SignedData.Version",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.INTEGER,
              constructed: !1,
              capture: "version",
            },
            {
              name: "SignedData.DigestAlgorithms",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.SET,
              constructed: !0,
              captureAsn1: "digestAlgorithms",
            },
            e,
            {
              name: "SignedData.Certificates",
              tagClass: t.Class.CONTEXT_SPECIFIC,
              type: 0,
              optional: !0,
              captureAsn1: "certificates",
            },
            {
              name: "SignedData.CertificateRevocationLists",
              tagClass: t.Class.CONTEXT_SPECIFIC,
              type: 1,
              optional: !0,
              captureAsn1: "crls",
            },
            {
              name: "SignedData.SignerInfos",
              tagClass: t.Class.UNIVERSAL,
              type: t.Type.SET,
              capture: "signerInfos",
              optional: !0,
              value: [n],
            },
          ],
        }),
          (r.recipientInfoValidator = {
            name: "RecipientInfo",
            tagClass: t.Class.UNIVERSAL,
            type: t.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "RecipientInfo.version",
                tagClass: t.Class.UNIVERSAL,
                type: t.Type.INTEGER,
                constructed: !1,
                capture: "version",
              },
              {
                name: "RecipientInfo.issuerAndSerial",
                tagClass: t.Class.UNIVERSAL,
                type: t.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "RecipientInfo.issuerAndSerial.issuer",
                    tagClass: t.Class.UNIVERSAL,
                    type: t.Type.SEQUENCE,
                    constructed: !0,
                    captureAsn1: "issuer",
                  },
                  {
                    name: "RecipientInfo.issuerAndSerial.serialNumber",
                    tagClass: t.Class.UNIVERSAL,
                    type: t.Type.INTEGER,
                    constructed: !1,
                    capture: "serial",
                  },
                ],
              },
              {
                name: "RecipientInfo.keyEncryptionAlgorithm",
                tagClass: t.Class.UNIVERSAL,
                type: t.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "RecipientInfo.keyEncryptionAlgorithm.algorithm",
                    tagClass: t.Class.UNIVERSAL,
                    type: t.Type.OID,
                    constructed: !1,
                    capture: "encAlgorithm",
                  },
                  {
                    name: "RecipientInfo.keyEncryptionAlgorithm.parameter",
                    tagClass: t.Class.UNIVERSAL,
                    constructed: !1,
                    captureAsn1: "encParameter",
                  },
                ],
              },
              {
                name: "RecipientInfo.encryptedKey",
                tagClass: t.Class.UNIVERSAL,
                type: t.Type.OCTETSTRING,
                constructed: !1,
                capture: "encKey",
              },
            ],
          }));
      }
      var a = "pkcs7asn1";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/pkcs7asn1",
        ["require", "module", "./asn1", "./util"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(o) {
        ((o.mgf = o.mgf || {}),
          ((o.mgf.mgf1 = o.mgf1 = o.mgf1 || {}).create = function (s) {
            return {
              generate: function (e, t) {
                for (
                  var r = new o.util.ByteBuffer(),
                    n = Math.ceil(t / s.digestLength),
                    i = 0;
                  i < n;
                  i++
                ) {
                  var a = new o.util.ByteBuffer();
                  (a.putInt32(i),
                    s.start(),
                    s.update(e + a.getBytes()),
                    r.putBuffer(s.digest()));
                }
                return (r.truncate(r.length() - t), r.getBytes());
              },
            };
          }));
      }
      var a = "mgf1";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/mgf1", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(e) {
        ((e.mgf = e.mgf || {}), (e.mgf.mgf1 = e.mgf1));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/mgf", ["require", "module", "./mgf1"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = a
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined.mgf)) {
              e.defined.mgf = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e.mgf;
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(g) {
        (g.pss = g.pss || {}).create = function (e) {
          var l,
            f = (e =
              3 === arguments.length
                ? {
                    md: arguments[0],
                    mgf: arguments[1],
                    saltLength: arguments[2],
                  }
                : e).md,
            p = e.mgf,
            d = f.digestLength,
            h = e.salt || null;
          if (
            ("string" == typeof h && (h = g.util.createBuffer(h)),
            "saltLength" in e)
          )
            l = e.saltLength;
          else {
            if (null === h)
              throw new Error(
                "Salt length not specified or specific salt not given.",
              );
            l = h.length();
          }
          if (null !== h && h.length() !== l)
            throw new Error(
              "Given salt length does not match length of given salt.",
            );
          var y = e.prng || g.random,
            t = {
              encode: function (e, t) {
                var t = t - 1,
                  r = Math.ceil(t / 8),
                  e = e.digest().getBytes();
                if (r < d + l + 2)
                  throw new Error("Message is too long to encrypt.");
                for (
                  var n = null === h ? y.getBytesSync(l) : h.bytes(),
                    i = new g.util.ByteBuffer(),
                    e =
                      (i.fillWithByte(0, 8),
                      i.putBytes(e),
                      i.putBytes(n),
                      f.start(),
                      f.update(i.getBytes()),
                      f.digest().getBytes()),
                    i = new g.util.ByteBuffer(),
                    a =
                      (i.fillWithByte(0, r - l - d - 2),
                      i.putByte(1),
                      i.putBytes(n),
                      i.getBytes()),
                    s = r - d - 1,
                    o = p.generate(e, s),
                    c = "",
                    u = 0;
                  u < s;
                  u++
                )
                  c += String.fromCharCode(a.charCodeAt(u) ^ o.charCodeAt(u));
                n = (65280 >> (8 * r - t)) & 255;
                return (
                  (c =
                    String.fromCharCode(c.charCodeAt(0) & ~n) + c.substr(1)) +
                  e +
                  String.fromCharCode(188)
                );
              },
              verify: function (e, t, r) {
                var r = r - 1,
                  n = Math.ceil(r / 8);
                if (((t = t.substr(-n)), n < d + l + 2))
                  throw new Error(
                    "Inconsistent parameters to PSS signature verification.",
                  );
                if (188 !== t.charCodeAt(n - 1))
                  throw new Error("Encoded message does not end in 0xBC.");
                var i = n - d - 1,
                  a = t.substr(0, i),
                  t = t.substr(i, d),
                  r = (65280 >> (8 * n - r)) & 255;
                if (0 != (a.charCodeAt(0) & r))
                  throw new Error("Bits beyond keysize not zero as expected.");
                for (var s = p.generate(t, i), o = "", c = 0; c < i; c++)
                  o += String.fromCharCode(a.charCodeAt(c) ^ s.charCodeAt(c));
                var o = String.fromCharCode(o.charCodeAt(0) & ~r) + o.substr(1),
                  u = n - d - l - 2;
                for (c = 0; c < u; c++)
                  if (0 !== o.charCodeAt(c))
                    throw new Error("Leftmost octets not zero as expected");
                if (1 !== o.charCodeAt(u))
                  throw new Error(
                    "Inconsistent PSS signature, 0x01 marker not found",
                  );
                ((r = o.substr(-l)), (n = new g.util.ByteBuffer()));
                return (
                  n.fillWithByte(0, 8),
                  n.putBytes(e),
                  n.putBytes(r),
                  f.start(),
                  f.update(n.getBytes()),
                  t === f.digest().getBytes()
                );
              },
            };
          return t;
        };
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/pss", ["require", "module", "./random", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = a
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined.pss)) {
              e.defined.pss = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e.pss;
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(m) {
        function c(e, t) {
          "string" == typeof t && (t = { shortName: t });
          for (
            var r, n = null, i = 0;
            null === n && i < e.attributes.length;
            ++i
          )
            ((r = e.attributes[i]),
              ((t.type && t.type === r.type) ||
                (t.name && t.name === r.name) ||
                (t.shortName && t.shortName === r.shortName)) &&
                (n = r));
          return n;
        }
        function a(e) {
          for (
            var t = f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, []),
              r = e.attributes,
              n = 0;
            n < r.length;
            ++n
          ) {
            var i,
              a = (i = r[n]).value,
              s = f.Type.PRINTABLESTRING;
            ("valueTagClass" in i &&
              (s = i.valueTagClass) === f.Type.UTF8 &&
              (a = m.util.encodeUtf8(a)),
              (i = f.create(f.Class.UNIVERSAL, f.Type.SET, !0, [
                f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                  f.create(
                    f.Class.UNIVERSAL,
                    f.Type.OID,
                    !1,
                    f.oidToDer(i.type).getBytes(),
                  ),
                  f.create(f.Class.UNIVERSAL, s, !1, a),
                ]),
              ])),
              t.value.push(i));
          }
          return t;
        }
        function l(e) {
          for (var t, r, n = 0; n < e.length; ++n) {
            if (
              (void 0 === (t = e[n]).name &&
                (t.type && t.type in C.oids
                  ? (t.name = C.oids[t.type])
                  : t.shortName &&
                    t.shortName in d &&
                    (t.name = C.oids[d[t.shortName]])),
              void 0 === t.type)
            ) {
              if (!(t.name && t.name in C.oids))
                throw (
                  ((r = new Error("Attribute type not specified.")).attribute =
                    t),
                  r
                );
              t.type = C.oids[t.name];
            }
            if (
              (void 0 === t.shortName &&
                t.name &&
                t.name in d &&
                (t.shortName = d[t.name]),
              t.type === p.extensionRequest &&
                ((t.valueConstructed = !0),
                (t.valueTagClass = f.Type.SEQUENCE),
                !t.value) &&
                t.extensions)
            ) {
              t.value = [];
              for (var i = 0; i < t.extensions.length; ++i)
                t.value.push(C.certificateExtensionToAsn1(s(t.extensions[i])));
            }
            if (void 0 === t.value)
              throw (
                ((r = new Error("Attribute value not specified.")).attribute =
                  t),
                r
              );
          }
        }
        function s(e, t) {
          if (
            ((t = t || {}),
            void 0 === e.name &&
              e.id &&
              e.id in C.oids &&
              (e.name = C.oids[e.id]),
            void 0 === e.id)
          ) {
            if (!(e.name && e.name in C.oids))
              throw (
                ((l = new Error("Extension ID not specified.")).extension = e),
                l
              );
            e.id = C.oids[e.name];
          }
          if (void 0 === e.value) {
            if ("keyUsage" === e.name) {
              var r = 0,
                n = 0,
                i = 0,
                a =
                  (e.digitalSignature && ((n |= 128), (r = 7)),
                  e.nonRepudiation && ((n |= 64), (r = 6)),
                  e.keyEncipherment && ((n |= 32), (r = 5)),
                  e.dataEncipherment && ((n |= 16), (r = 4)),
                  e.keyAgreement && ((n |= 8), (r = 3)),
                  e.keyCertSign && ((n |= 4), (r = 2)),
                  e.cRLSign && ((n |= 2), (r = 1)),
                  e.encipherOnly && ((n |= 1), (r = 0)),
                  e.decipherOnly && ((i |= 128), (r = 7)),
                  String.fromCharCode(r));
              (0 !== i
                ? (a += String.fromCharCode(n) + String.fromCharCode(i))
                : 0 !== n && (a += String.fromCharCode(n)),
                (e.value = f.create(
                  f.Class.UNIVERSAL,
                  f.Type.BITSTRING,
                  !1,
                  a,
                )));
            } else if ("basicConstraints" === e.name)
              ((e.value = f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [])),
                e.cA &&
                  e.value.value.push(
                    f.create(
                      f.Class.UNIVERSAL,
                      f.Type.BOOLEAN,
                      !1,
                      String.fromCharCode(255),
                    ),
                  ),
                "pathLenConstraint" in e &&
                  e.value.value.push(
                    f.create(
                      f.Class.UNIVERSAL,
                      f.Type.INTEGER,
                      !1,
                      f.integerToDer(e.pathLenConstraint).getBytes(),
                    ),
                  ));
            else if ("extKeyUsage" === e.name) {
              e.value = f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, []);
              var s,
                o = e.value.value;
              for (s in e)
                !0 === e[s] &&
                  (s in p
                    ? o.push(
                        f.create(
                          f.Class.UNIVERSAL,
                          f.Type.OID,
                          !1,
                          f.oidToDer(p[s]).getBytes(),
                        ),
                      )
                    : -1 !== s.indexOf(".") &&
                      o.push(
                        f.create(
                          f.Class.UNIVERSAL,
                          f.Type.OID,
                          !1,
                          f.oidToDer(s).getBytes(),
                        ),
                      ));
            } else if ("nsCertType" === e.name) {
              ((r = 0),
                (n = 0),
                (a =
                  (e.client && ((n |= 128), (r = 7)),
                  e.server && ((n |= 64), (r = 6)),
                  e.email && ((n |= 32), (r = 5)),
                  e.objsign && ((n |= 16), (r = 4)),
                  e.reserved && ((n |= 8), (r = 3)),
                  e.sslCA && ((n |= 4), (r = 2)),
                  e.emailCA && ((n |= 2), (r = 1)),
                  e.objCA && ((n |= 1), (r = 0)),
                  String.fromCharCode(r))));
              (0 !== n && (a += String.fromCharCode(n)),
                (e.value = f.create(
                  f.Class.UNIVERSAL,
                  f.Type.BITSTRING,
                  !1,
                  a,
                )));
            } else if (
              "subjectAltName" === e.name ||
              "issuerAltName" === e.name
            ) {
              e.value = f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, []);
              for (var c = 0; c < e.altNames.length; ++c) {
                var u,
                  a = (u = e.altNames[c]).value;
                if (7 === u.type && u.ip) {
                  if (null === (a = m.util.bytesFromIP(u.ip)))
                    throw (
                      ((l = new Error(
                        'Extension "ip" value is not a valid IPv4 or IPv6 address.',
                      )).extension = e),
                      l
                    );
                } else
                  8 === u.type &&
                    (a = u.oid ? f.oidToDer(f.oidToDer(u.oid)) : f.oidToDer(a));
                e.value.value.push(
                  f.create(f.Class.CONTEXT_SPECIFIC, u.type, !1, a),
                );
              }
            } else
              "subjectKeyIdentifier" === e.name &&
                t.cert &&
                ((i = t.cert.generateSubjectKeyIdentifier()),
                (e.subjectKeyIdentifier = i.toHex()),
                (e.value = f.create(
                  f.Class.UNIVERSAL,
                  f.Type.OCTETSTRING,
                  !1,
                  i.getBytes(),
                )));
            var l;
            if (void 0 === e.value)
              throw (
                ((l = new Error("Extension value not specified.")).extension =
                  e),
                l
              );
            return e;
          }
        }
        function r(e, t) {
          return e !== p["RSASSA-PSS"]
            ? f.create(f.Class.UNIVERSAL, f.Type.NULL, !1, "")
            : ((e = []),
              void 0 !== t.hash.algorithmOid &&
                e.push(
                  f.create(f.Class.CONTEXT_SPECIFIC, 0, !0, [
                    f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                      f.create(
                        f.Class.UNIVERSAL,
                        f.Type.OID,
                        !1,
                        f.oidToDer(t.hash.algorithmOid).getBytes(),
                      ),
                      f.create(f.Class.UNIVERSAL, f.Type.NULL, !1, ""),
                    ]),
                  ]),
                ),
              void 0 !== t.mgf.algorithmOid &&
                e.push(
                  f.create(f.Class.CONTEXT_SPECIFIC, 1, !0, [
                    f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                      f.create(
                        f.Class.UNIVERSAL,
                        f.Type.OID,
                        !1,
                        f.oidToDer(t.mgf.algorithmOid).getBytes(),
                      ),
                      f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                        f.create(
                          f.Class.UNIVERSAL,
                          f.Type.OID,
                          !1,
                          f.oidToDer(t.mgf.hash.algorithmOid).getBytes(),
                        ),
                        f.create(f.Class.UNIVERSAL, f.Type.NULL, !1, ""),
                      ]),
                    ]),
                  ]),
                ),
              void 0 !== t.saltLength &&
                e.push(
                  f.create(f.Class.CONTEXT_SPECIFIC, 2, !0, [
                    f.create(
                      f.Class.UNIVERSAL,
                      f.Type.INTEGER,
                      !1,
                      f.integerToDer(t.saltLength).getBytes(),
                    ),
                  ]),
                ),
              f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, e));
        }
        function u(e, t, r) {
          var n = {};
          if (e !== p["RSASSA-PSS"]) return n;
          if (
            (r &&
              (n = {
                hash: { algorithmOid: p.sha1 },
                mgf: { algorithmOid: p.mgf1, hash: { algorithmOid: p.sha1 } },
                saltLength: 20,
              }),
            (e = {}),
            (r = []),
            f.validate(t, i, e, r))
          )
            return (
              void 0 !== e.hashOid &&
                ((n.hash = n.hash || {}),
                (n.hash.algorithmOid = f.derToOid(e.hashOid))),
              void 0 !== e.maskGenOid &&
                ((n.mgf = n.mgf || {}),
                (n.mgf.algorithmOid = f.derToOid(e.maskGenOid)),
                (n.mgf.hash = n.mgf.hash || {}),
                (n.mgf.hash.algorithmOid = f.derToOid(e.maskGenHashOid))),
              void 0 !== e.saltLength &&
                (n.saltLength = e.saltLength.charCodeAt(0)),
              n
            );
          throw (
            ((t = new Error("Cannot read RSASSA-PSS parameter block.")).errors =
              r),
            t
          );
        }
        var f = m.asn1,
          C = (m.pki = m.pki || {}),
          p = C.oids,
          d = {},
          e =
            ((d.CN = p.commonName),
            (d.commonName = "CN"),
            (d.C = p.countryName),
            (d.countryName = "C"),
            (d.L = p.localityName),
            (d.localityName = "L"),
            (d.ST = p.stateOrProvinceName),
            (d.stateOrProvinceName = "ST"),
            (d.O = p.organizationName),
            (d.organizationName = "O"),
            (d.OU = p.organizationalUnitName),
            (d.organizationalUnitName = "OU"),
            (d.E = p.emailAddress),
            m.pki.rsa.publicKeyValidator),
          h = {
            name: "Certificate",
            tagClass: f.Class.UNIVERSAL,
            type: f.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "Certificate.TBSCertificate",
                tagClass: f.Class.UNIVERSAL,
                type: f.Type.SEQUENCE,
                constructed: !0,
                captureAsn1: "tbsCertificate",
                value: [
                  {
                    name: "Certificate.TBSCertificate.version",
                    tagClass: f.Class.CONTEXT_SPECIFIC,
                    type: 0,
                    constructed: !0,
                    optional: !0,
                    value: [
                      {
                        name: "Certificate.TBSCertificate.version.integer",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.INTEGER,
                        constructed: !(d.emailAddress = "E"),
                        capture: "certVersion",
                      },
                    ],
                  },
                  {
                    name: "Certificate.TBSCertificate.serialNumber",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.INTEGER,
                    constructed: !1,
                    capture: "certSerialNumber",
                  },
                  {
                    name: "Certificate.TBSCertificate.signature",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.SEQUENCE,
                    constructed: !0,
                    value: [
                      {
                        name: "Certificate.TBSCertificate.signature.algorithm",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.OID,
                        constructed: !1,
                        capture: "certinfoSignatureOid",
                      },
                      {
                        name: "Certificate.TBSCertificate.signature.parameters",
                        tagClass: f.Class.UNIVERSAL,
                        optional: !0,
                        captureAsn1: "certinfoSignatureParams",
                      },
                    ],
                  },
                  {
                    name: "Certificate.TBSCertificate.issuer",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.SEQUENCE,
                    constructed: !0,
                    captureAsn1: "certIssuer",
                  },
                  {
                    name: "Certificate.TBSCertificate.validity",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.SEQUENCE,
                    constructed: !0,
                    value: [
                      {
                        name: "Certificate.TBSCertificate.validity.notBefore (utc)",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.UTCTIME,
                        constructed: !1,
                        optional: !0,
                        capture: "certValidity1UTCTime",
                      },
                      {
                        name: "Certificate.TBSCertificate.validity.notBefore (generalized)",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.GENERALIZEDTIME,
                        constructed: !1,
                        optional: !0,
                        capture: "certValidity2GeneralizedTime",
                      },
                      {
                        name: "Certificate.TBSCertificate.validity.notAfter (utc)",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.UTCTIME,
                        constructed: !1,
                        optional: !0,
                        capture: "certValidity3UTCTime",
                      },
                      {
                        name: "Certificate.TBSCertificate.validity.notAfter (generalized)",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.GENERALIZEDTIME,
                        constructed: !1,
                        optional: !0,
                        capture: "certValidity4GeneralizedTime",
                      },
                    ],
                  },
                  {
                    name: "Certificate.TBSCertificate.subject",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.SEQUENCE,
                    constructed: !0,
                    captureAsn1: "certSubject",
                  },
                  e,
                  {
                    name: "Certificate.TBSCertificate.issuerUniqueID",
                    tagClass: f.Class.CONTEXT_SPECIFIC,
                    type: 1,
                    constructed: !0,
                    optional: !0,
                    value: [
                      {
                        name: "Certificate.TBSCertificate.issuerUniqueID.id",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.BITSTRING,
                        constructed: !1,
                        capture: "certIssuerUniqueId",
                      },
                    ],
                  },
                  {
                    name: "Certificate.TBSCertificate.subjectUniqueID",
                    tagClass: f.Class.CONTEXT_SPECIFIC,
                    type: 2,
                    constructed: !0,
                    optional: !0,
                    value: [
                      {
                        name: "Certificate.TBSCertificate.subjectUniqueID.id",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.BITSTRING,
                        constructed: !1,
                        capture: "certSubjectUniqueId",
                      },
                    ],
                  },
                  {
                    name: "Certificate.TBSCertificate.extensions",
                    tagClass: f.Class.CONTEXT_SPECIFIC,
                    type: 3,
                    constructed: !0,
                    captureAsn1: "certExtensions",
                    optional: !0,
                  },
                ],
              },
              {
                name: "Certificate.signatureAlgorithm",
                tagClass: f.Class.UNIVERSAL,
                type: f.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "Certificate.signatureAlgorithm.algorithm",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.OID,
                    constructed: !1,
                    capture: "certSignatureOid",
                  },
                  {
                    name: "Certificate.TBSCertificate.signature.parameters",
                    tagClass: f.Class.UNIVERSAL,
                    optional: !0,
                    captureAsn1: "certSignatureParams",
                  },
                ],
              },
              {
                name: "Certificate.signatureValue",
                tagClass: f.Class.UNIVERSAL,
                type: f.Type.BITSTRING,
                constructed: !1,
                capture: "certSignature",
              },
            ],
          },
          i = {
            name: "rsapss",
            tagClass: f.Class.UNIVERSAL,
            type: f.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "rsapss.hashAlgorithm",
                tagClass: f.Class.CONTEXT_SPECIFIC,
                type: 0,
                constructed: !0,
                value: [
                  {
                    name: "rsapss.hashAlgorithm.AlgorithmIdentifier",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Class.SEQUENCE,
                    constructed: !0,
                    optional: !0,
                    value: [
                      {
                        name: "rsapss.hashAlgorithm.AlgorithmIdentifier.algorithm",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.OID,
                        constructed: !1,
                        capture: "hashOid",
                      },
                    ],
                  },
                ],
              },
              {
                name: "rsapss.maskGenAlgorithm",
                tagClass: f.Class.CONTEXT_SPECIFIC,
                type: 1,
                constructed: !0,
                value: [
                  {
                    name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Class.SEQUENCE,
                    constructed: !0,
                    optional: !0,
                    value: [
                      {
                        name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.algorithm",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.OID,
                        constructed: !1,
                        capture: "maskGenOid",
                      },
                      {
                        name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.SEQUENCE,
                        constructed: !0,
                        value: [
                          {
                            name: "rsapss.maskGenAlgorithm.AlgorithmIdentifier.params.algorithm",
                            tagClass: f.Class.UNIVERSAL,
                            type: f.Type.OID,
                            constructed: !1,
                            capture: "maskGenHashOid",
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                name: "rsapss.saltLength",
                tagClass: f.Class.CONTEXT_SPECIFIC,
                type: 2,
                optional: !0,
                value: [
                  {
                    name: "rsapss.saltLength.saltLength",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Class.INTEGER,
                    constructed: !1,
                    capture: "saltLength",
                  },
                ],
              },
              {
                name: "rsapss.trailerField",
                tagClass: f.Class.CONTEXT_SPECIFIC,
                type: 3,
                optional: !0,
                value: [
                  {
                    name: "rsapss.trailer.trailer",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Class.INTEGER,
                    constructed: !1,
                    capture: "trailer",
                  },
                ],
              },
            ],
          },
          e = {
            name: "CertificationRequestInfo",
            tagClass: f.Class.UNIVERSAL,
            type: f.Type.SEQUENCE,
            constructed: !0,
            captureAsn1: "certificationRequestInfo",
            value: [
              {
                name: "CertificationRequestInfo.integer",
                tagClass: f.Class.UNIVERSAL,
                type: f.Type.INTEGER,
                constructed: !1,
                capture: "certificationRequestInfoVersion",
              },
              {
                name: "CertificationRequestInfo.subject",
                tagClass: f.Class.UNIVERSAL,
                type: f.Type.SEQUENCE,
                constructed: !0,
                captureAsn1: "certificationRequestInfoSubject",
              },
              e,
              {
                name: "CertificationRequestInfo.attributes",
                tagClass: f.Class.CONTEXT_SPECIFIC,
                type: 0,
                constructed: !0,
                optional: !0,
                capture: "certificationRequestInfoAttributes",
                value: [
                  {
                    name: "CertificationRequestInfo.attributes",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.SEQUENCE,
                    constructed: !0,
                    value: [
                      {
                        name: "CertificationRequestInfo.attributes.type",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.OID,
                        constructed: !1,
                      },
                      {
                        name: "CertificationRequestInfo.attributes.value",
                        tagClass: f.Class.UNIVERSAL,
                        type: f.Type.SET,
                        constructed: !0,
                      },
                    ],
                  },
                ],
              },
            ],
          },
          y = {
            name: "CertificationRequest",
            tagClass: f.Class.UNIVERSAL,
            type: f.Type.SEQUENCE,
            constructed: !0,
            captureAsn1: "csr",
            value: [
              e,
              {
                name: "CertificationRequest.signatureAlgorithm",
                tagClass: f.Class.UNIVERSAL,
                type: f.Type.SEQUENCE,
                constructed: !0,
                value: [
                  {
                    name: "CertificationRequest.signatureAlgorithm.algorithm",
                    tagClass: f.Class.UNIVERSAL,
                    type: f.Type.OID,
                    constructed: !1,
                    capture: "csrSignatureOid",
                  },
                  {
                    name: "CertificationRequest.signatureAlgorithm.parameters",
                    tagClass: f.Class.UNIVERSAL,
                    optional: !0,
                    captureAsn1: "csrSignatureParams",
                  },
                ],
              },
              {
                name: "CertificationRequest.signature",
                tagClass: f.Class.UNIVERSAL,
                type: f.Type.BITSTRING,
                constructed: !1,
                capture: "csrSignature",
              },
            ],
          };
        ((C.RDNAttributesAsArray = function (e, t) {
          for (var r, n, i = [], a = 0; a < e.value.length; ++a)
            for (var s = e.value[a], o = 0; o < s.value.length; ++o)
              ((r = s.value[o]),
                ((n = {}).type = f.derToOid(r.value[0].value)),
                (n.value = r.value[1].value),
                (n.valueTagClass = r.value[1].type),
                n.type in p &&
                  ((n.name = p[n.type]), n.name in d) &&
                  (n.shortName = d[n.name]),
                t && (t.update(n.type), t.update(n.value)),
                i.push(n));
          return i;
        }),
          (C.CRIAttributesAsArray = function (e) {
            for (var t = [], r = 0; r < e.length; ++r)
              for (
                var n = e[r],
                  i = f.derToOid(n.value[0].value),
                  a = n.value[1].value,
                  s = 0;
                s < a.length;
                ++s
              ) {
                var o = {};
                if (
                  ((o.type = i),
                  (o.value = a[s].value),
                  (o.valueTagClass = a[s].type),
                  o.type in p &&
                    ((o.name = p[o.type]), o.name in d) &&
                    (o.shortName = d[o.name]),
                  o.type === p.extensionRequest)
                ) {
                  o.extensions = [];
                  for (var c = 0; c < o.value.length; ++c)
                    o.extensions.push(
                      C.certificateExtensionFromAsn1(o.value[c]),
                    );
                }
                t.push(o);
              }
            return t;
          }));
        ((C.certificateFromPem = function (e, t, r) {
          e = m.pem.decode(e)[0];
          if (
            "CERTIFICATE" !== e.type &&
            "X509 CERTIFICATE" !== e.type &&
            "TRUSTED CERTIFICATE" !== e.type
          )
            throw (
              ((n = new Error(
                'Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".',
              )).headerType = e.type),
              n
            );
          if (e.procType && "ENCRYPTED" === e.procType.type)
            throw new Error(
              "Could not convert certificate from PEM; PEM is encrypted.",
            );
          var n = f.fromDer(e.body, r);
          return C.certificateFromAsn1(n, t);
        }),
          (C.certificateToPem = function (e, t) {
            e = {
              type: "CERTIFICATE",
              body: f.toDer(C.certificateToAsn1(e)).getBytes(),
            };
            return m.pem.encode(e, { maxline: t });
          }),
          (C.publicKeyFromPem = function (e) {
            e = m.pem.decode(e)[0];
            if ("PUBLIC KEY" !== e.type && "RSA PUBLIC KEY" !== e.type)
              throw (
                ((t = new Error(
                  'Could not convert public key from PEM; PEM header type is not "PUBLIC KEY" or "RSA PUBLIC KEY".',
                )).headerType = e.type),
                t
              );
            if (e.procType && "ENCRYPTED" === e.procType.type)
              throw new Error(
                "Could not convert public key from PEM; PEM is encrypted.",
              );
            var t = f.fromDer(e.body);
            return C.publicKeyFromAsn1(t);
          }),
          (C.publicKeyToPem = function (e, t) {
            e = {
              type: "PUBLIC KEY",
              body: f.toDer(C.publicKeyToAsn1(e)).getBytes(),
            };
            return m.pem.encode(e, { maxline: t });
          }),
          (C.publicKeyToRSAPublicKeyPem = function (e, t) {
            e = {
              type: "RSA PUBLIC KEY",
              body: f.toDer(C.publicKeyToRSAPublicKey(e)).getBytes(),
            };
            return m.pem.encode(e, { maxline: t });
          }),
          (C.getPublicKeyFingerprint = function (e, t) {
            var r,
              n = (t = t || {}).md || m.md.sha1.create();
            switch (t.type || "RSAPublicKey") {
              case "RSAPublicKey":
                r = f.toDer(C.publicKeyToRSAPublicKey(e)).getBytes();
                break;
              case "SubjectPublicKeyInfo":
                r = f.toDer(C.publicKeyToAsn1(e)).getBytes();
                break;
              default:
                throw new Error('Unknown fingerprint type "' + t.type + '".');
            }
            (n.start(), n.update(r));
            var i,
              n = n.digest();
            if ("hex" === t.encoding)
              return (
                (i = n.toHex()),
                t.delimiter ? i.match(/.{2}/g).join(t.delimiter) : i
              );
            if ("binary" === t.encoding) return n.getBytes();
            if (t.encoding)
              throw new Error('Unknown encoding "' + t.encoding + '".');
            return n;
          }),
          (C.certificationRequestFromPem = function (e, t, r) {
            e = m.pem.decode(e)[0];
            if ("CERTIFICATE REQUEST" !== e.type)
              throw (
                ((n = new Error(
                  'Could not convert certification request from PEM; PEM header type is not "CERTIFICATE REQUEST".',
                )).headerType = e.type),
                n
              );
            if (e.procType && "ENCRYPTED" === e.procType.type)
              throw new Error(
                "Could not convert certification request from PEM; PEM is encrypted.",
              );
            var n = f.fromDer(e.body, r);
            return C.certificationRequestFromAsn1(n, t);
          }),
          (C.certificationRequestToPem = function (e, t) {
            e = {
              type: "CERTIFICATE REQUEST",
              body: f.toDer(C.certificationRequestToAsn1(e)).getBytes(),
            };
            return m.pem.encode(e, { maxline: t });
          }),
          (C.createCertificate = function () {
            var u = {
              version: 2,
              serialNumber: "00",
              signatureOid: null,
              signature: null,
              siginfo: {},
            };
            return (
              (u.siginfo.algorithmOid = null),
              (u.validity = {}),
              (u.validity.notBefore = new Date()),
              (u.validity.notAfter = new Date()),
              (u.issuer = {}),
              (u.issuer.getField = function (e) {
                return c(u.issuer, e);
              }),
              (u.issuer.addField = function (e) {
                (l([e]), u.issuer.attributes.push(e));
              }),
              (u.issuer.attributes = []),
              (u.issuer.hash = null),
              (u.subject = {}),
              (u.subject.getField = function (e) {
                return c(u.subject, e);
              }),
              (u.subject.addField = function (e) {
                (l([e]), u.subject.attributes.push(e));
              }),
              (u.subject.attributes = []),
              (u.subject.hash = null),
              (u.extensions = []),
              (u.publicKey = null),
              (u.md = null),
              (u.setSubject = function (e, t) {
                (l(e),
                  (u.subject.attributes = e),
                  delete u.subject.uniqueId,
                  t && (u.subject.uniqueId = t),
                  (u.subject.hash = null));
              }),
              (u.setIssuer = function (e, t) {
                (l(e),
                  (u.issuer.attributes = e),
                  delete u.issuer.uniqueId,
                  t && (u.issuer.uniqueId = t),
                  (u.issuer.hash = null));
              }),
              (u.setExtensions = function (e) {
                for (var t = 0; t < e.length; ++t) s(e[t], { cert: u });
                u.extensions = e;
              }),
              (u.getExtension = function (e) {
                "string" == typeof e && (e = { name: e });
                for (
                  var t, r = null, n = 0;
                  null === r && n < u.extensions.length;
                  ++n
                )
                  ((t = u.extensions[n]),
                    ((e.id && t.id === e.id) ||
                      (e.name && t.name === e.name)) &&
                      (r = t));
                return r;
              }),
              (u.sign = function (e, t) {
                u.md = t || m.md.sha1.create();
                t = p[u.md.algorithm + "WithRSAEncryption"];
                if (!t)
                  throw (
                    ((r = new Error(
                      "Could not compute certificate digest. Unknown message digest algorithm OID.",
                    )).algorithm = u.md.algorithm),
                    r
                  );
                ((u.signatureOid = u.siginfo.algorithmOid = t),
                  (u.tbsCertificate = C.getTBSCertificate(u)));
                var r = f.toDer(u.tbsCertificate);
                (u.md.update(r.getBytes()), (u.signature = e.sign(u.md)));
              }),
              (u.verify = function (e) {
                var t = !1;
                if (!u.issued(e))
                  throw (
                    (i = e.issuer),
                    (a = u.subject),
                    ((o = new Error(
                      "The parent certificate did not issue the given child certificate; the child certificate's issuer does not match the parent's subject.",
                    )).expectedIssuer = i.attributes),
                    (o.actualIssuer = a.attributes),
                    o
                  );
                var r,
                  n = e.md;
                if (null === n) {
                  if (e.signatureOid in p)
                    switch (p[e.signatureOid]) {
                      case "sha1WithRSAEncryption":
                        n = m.md.sha1.create();
                        break;
                      case "md5WithRSAEncryption":
                        n = m.md.md5.create();
                        break;
                      case "sha256WithRSAEncryption":
                      case "RSASSA-PSS":
                        n = m.md.sha256.create();
                    }
                  if (null === n)
                    throw (
                      ((o = new Error(
                        "Could not compute certificate digest. Unknown signature OID.",
                      )).signatureOid = e.signatureOid),
                      o
                    );
                  var i = e.tbsCertificate || C.getTBSCertificate(e),
                    a = f.toDer(i);
                  n.update(a.getBytes());
                }
                if (null !== n) {
                  switch (e.signatureOid) {
                    case p.sha1WithRSAEncryption:
                      r = void 0;
                      break;
                    case p["RSASSA-PSS"]:
                      var s,
                        o,
                        c = p[e.signatureParameters.mgf.hash.algorithmOid];
                      if (void 0 === c || void 0 === m.md[c])
                        throw (
                          ((o = new Error(
                            "Unsupported MGF hash function.",
                          )).oid = e.signatureParameters.mgf.hash.algorithmOid),
                          (o.name = c),
                          o
                        );
                      if (
                        void 0 ===
                          (s = p[e.signatureParameters.mgf.algorithmOid]) ||
                        void 0 === m.mgf[s]
                      )
                        throw (
                          ((o = new Error("Unsupported MGF function.")).oid =
                            e.signatureParameters.mgf.algorithmOid),
                          (o.name = s),
                          o
                        );
                      if (
                        ((s = m.mgf[s].create(m.md[c].create())),
                        void 0 ===
                          (c = p[e.signatureParameters.hash.algorithmOid]) ||
                          void 0 === m.md[c])
                      )
                        throw {
                          message: "Unsupported RSASSA-PSS hash function.",
                          oid: e.signatureParameters.hash.algorithmOid,
                          name: c,
                        };
                      r = m.pss.create(
                        m.md[c].create(),
                        s,
                        e.signatureParameters.saltLength,
                      );
                  }
                  t = u.publicKey.verify(n.digest().getBytes(), e.signature, r);
                }
                return t;
              }),
              (u.isIssuer = function (e) {
                var t = !1,
                  r = u.issuer,
                  n = e.subject;
                if (r.hash && n.hash) t = r.hash === n.hash;
                else if (r.attributes.length === n.attributes.length)
                  for (
                    var i, a, t = !0, s = 0;
                    t && s < r.attributes.length;
                    ++s
                  )
                    ((i = r.attributes[s]),
                      (a = n.attributes[s]),
                      (i.type === a.type && i.value === a.value) || (t = !1));
                return t;
              }),
              (u.issued = function (e) {
                return e.isIssuer(u);
              }),
              (u.generateSubjectKeyIdentifier = function () {
                return C.getPublicKeyFingerprint(u.publicKey, {
                  type: "RSAPublicKey",
                });
              }),
              (u.verifySubjectKeyIdentifier = function () {
                for (
                  var e = p.subjectKeyIdentifier, t = 0;
                  t < u.extensions.length;
                  ++t
                ) {
                  var r,
                    n = u.extensions[t];
                  if (n.id === e)
                    return (
                      (r = u.generateSubjectKeyIdentifier().getBytes()),
                      m.util.hexToBytes(n.subjectKeyIdentifier) === r
                    );
                }
                return !1;
              }),
              u
            );
          }),
          (C.certificateFromAsn1 = function (e, t) {
            var r = {},
              n = [];
            if (!f.validate(e, h, r, n))
              throw (
                ((s = new Error(
                  "Cannot read X.509 certificate. ASN.1 object is not an X509v3 Certificate.",
                )).errors = n),
                s
              );
            if ("string" != typeof r.certSignature) {
              for (var i = "\0", a = 0; a < r.certSignature.length; ++a)
                i += f.toDer(r.certSignature[a]).getBytes();
              r.certSignature = i;
            }
            if (f.derToOid(r.publicKeyOid) !== C.oids.rsaEncryption)
              throw new Error("Cannot read public key. OID is not RSA.");
            var s,
              o = C.createCertificate(),
              e =
                ((o.version = r.certVersion ? r.certVersion.charCodeAt(0) : 0),
                m.util.createBuffer(r.certSerialNumber)),
              n =
                ((o.serialNumber = e.toHex()),
                (o.signatureOid = m.asn1.derToOid(r.certSignatureOid)),
                (o.signatureParameters = u(
                  o.signatureOid,
                  r.certSignatureParams,
                  !0,
                )),
                (o.siginfo.algorithmOid = m.asn1.derToOid(
                  r.certinfoSignatureOid,
                )),
                (o.siginfo.parameters = u(
                  o.siginfo.algorithmOid,
                  r.certinfoSignatureParams,
                  !1,
                )),
                m.util.createBuffer(r.certSignature)),
              e = (++n.read, (o.signature = n.getBytes()), []);
            if (
              (void 0 !== r.certValidity1UTCTime &&
                e.push(f.utcTimeToDate(r.certValidity1UTCTime)),
              void 0 !== r.certValidity2GeneralizedTime &&
                e.push(f.generalizedTimeToDate(r.certValidity2GeneralizedTime)),
              void 0 !== r.certValidity3UTCTime &&
                e.push(f.utcTimeToDate(r.certValidity3UTCTime)),
              void 0 !== r.certValidity4GeneralizedTime &&
                e.push(f.generalizedTimeToDate(r.certValidity4GeneralizedTime)),
              2 < e.length)
            )
              throw new Error(
                "Cannot read notBefore/notAfter validity times; more than two times were provided in the certificate.",
              );
            if (e.length < 2)
              throw new Error(
                "Cannot read notBefore/notAfter validity times; they were not provided as either UTCTime or GeneralizedTime.",
              );
            if (
              ((o.validity.notBefore = e[0]),
              (o.validity.notAfter = e[1]),
              (o.tbsCertificate = r.tbsCertificate),
              t)
            ) {
              if (((o.md = null), o.signatureOid in p))
                switch (p[o.signatureOid]) {
                  case "sha1WithRSAEncryption":
                    o.md = m.md.sha1.create();
                    break;
                  case "md5WithRSAEncryption":
                    o.md = m.md.md5.create();
                    break;
                  case "sha256WithRSAEncryption":
                  case "RSASSA-PSS":
                    o.md = m.md.sha256.create();
                }
              if (null === o.md)
                throw (
                  ((s = new Error(
                    "Could not compute certificate digest. Unknown signature OID.",
                  )).signatureOid = o.signatureOid),
                  s
                );
              n = f.toDer(o.tbsCertificate);
              o.md.update(n.getBytes());
            }
            ((e = m.md.sha1.create()),
              (o.issuer.getField = function (e) {
                return c(o.issuer, e);
              }),
              (o.issuer.addField = function (e) {
                (l([e]), o.issuer.attributes.push(e));
              }),
              (o.issuer.attributes = C.RDNAttributesAsArray(r.certIssuer, e)),
              r.certIssuerUniqueId &&
                (o.issuer.uniqueId = r.certIssuerUniqueId),
              (o.issuer.hash = e.digest().toHex()),
              (t = m.md.sha1.create()));
            return (
              (o.subject.getField = function (e) {
                return c(o.subject, e);
              }),
              (o.subject.addField = function (e) {
                (l([e]), o.subject.attributes.push(e));
              }),
              (o.subject.attributes = C.RDNAttributesAsArray(r.certSubject, t)),
              r.certSubjectUniqueId &&
                (o.subject.uniqueId = r.certSubjectUniqueId),
              (o.subject.hash = t.digest().toHex()),
              r.certExtensions
                ? (o.extensions = C.certificateExtensionsFromAsn1(
                    r.certExtensions,
                  ))
                : (o.extensions = []),
              (o.publicKey = C.publicKeyFromAsn1(r.subjectPublicKeyInfo)),
              o
            );
          }),
          (C.certificateExtensionsFromAsn1 = function (e) {
            for (var t = [], r = 0; r < e.value.length; ++r)
              for (var n = e.value[r], i = 0; i < n.value.length; ++i)
                t.push(C.certificateExtensionFromAsn1(n.value[i]));
            return t;
          }),
          (C.certificateExtensionFromAsn1 = function (e) {
            var t = {};
            if (
              ((t.id = f.derToOid(e.value[0].value)),
              (t.critical = !1),
              e.value[1].type === f.Type.BOOLEAN
                ? ((t.critical = 0 !== e.value[1].value.charCodeAt(0)),
                  (t.value = e.value[2].value))
                : (t.value = e.value[1].value),
              t.id in p)
            )
              if (((t.name = p[t.id]), "keyUsage" === t.name)) {
                var r = 0,
                  e = 0;
                (1 < (n = f.fromDer(t.value)).value.length &&
                  ((r = n.value.charCodeAt(1)),
                  (e = 2 < n.value.length ? n.value.charCodeAt(2) : 0)),
                  (t.digitalSignature = 128 == (128 & r)),
                  (t.nonRepudiation = 64 == (64 & r)),
                  (t.keyEncipherment = 32 == (32 & r)),
                  (t.dataEncipherment = 16 == (16 & r)),
                  (t.keyAgreement = 8 == (8 & r)),
                  (t.keyCertSign = 4 == (4 & r)),
                  (t.cRLSign = 2 == (2 & r)),
                  (t.encipherOnly = 1 == (1 & r)),
                  (t.decipherOnly = 128 == (128 & e)));
              } else if ("basicConstraints" === t.name) {
                0 < (n = f.fromDer(t.value)).value.length &&
                n.value[0].type === f.Type.BOOLEAN
                  ? (t.cA = 0 !== n.value[0].value.charCodeAt(0))
                  : (t.cA = !1);
                e = null;
                (0 < n.value.length && n.value[0].type === f.Type.INTEGER
                  ? (e = n.value[0].value)
                  : 1 < n.value.length && (e = n.value[1].value),
                  null !== e && (t.pathLenConstraint = f.derToInteger(e)));
              } else if ("extKeyUsage" === t.name)
                for (
                  var n = f.fromDer(t.value), i = 0;
                  i < n.value.length;
                  ++i
                ) {
                  var a = f.derToOid(n.value[i].value);
                  a in p ? (t[p[a]] = !0) : (t[a] = !0);
                }
              else if ("nsCertType" === t.name) {
                r = 0;
                (1 < (n = f.fromDer(t.value)).value.length &&
                  (r = n.value.charCodeAt(1)),
                  (t.client = 128 == (128 & r)),
                  (t.server = 64 == (64 & r)),
                  (t.email = 32 == (32 & r)),
                  (t.objsign = 16 == (16 & r)),
                  (t.reserved = 8 == (8 & r)),
                  (t.sslCA = 4 == (4 & r)),
                  (t.emailCA = 2 == (2 & r)),
                  (t.objCA = 1 == (1 & r)));
              } else if (
                "subjectAltName" === t.name ||
                "issuerAltName" === t.name
              ) {
                t.altNames = [];
                for (
                  var n = f.fromDer(t.value), s = 0;
                  s < n.value.length;
                  ++s
                ) {
                  var o,
                    c = { type: (o = n.value[s]).type, value: o.value };
                  switch ((t.altNames.push(c), o.type)) {
                    case 1:
                    case 2:
                    case 6:
                      break;
                    case 7:
                      c.ip = m.util.bytesToIP(o.value);
                      break;
                    case 8:
                      c.oid = f.derToOid(o.value);
                  }
                }
              } else
                "subjectKeyIdentifier" === t.name &&
                  ((n = f.fromDer(t.value)),
                  (t.subjectKeyIdentifier = m.util.bytesToHex(n.value)));
            return t;
          }),
          (C.certificationRequestFromAsn1 = function (e, t) {
            var r = {},
              n = [];
            if (!f.validate(e, y, r, n))
              throw (
                ((s = new Error(
                  "Cannot read PKCS#10 certificate request. ASN.1 object is not a PKCS#10 CertificationRequest.",
                )).errors = n),
                s
              );
            if ("string" != typeof r.csrSignature) {
              for (var i = "\0", a = 0; a < r.csrSignature.length; ++a)
                i += f.toDer(r.csrSignature[a]).getBytes();
              r.csrSignature = i;
            }
            if (f.derToOid(r.publicKeyOid) !== C.oids.rsaEncryption)
              throw new Error("Cannot read public key. OID is not RSA.");
            var s,
              o = C.createCertificationRequest(),
              e =
                ((o.version = r.csrVersion ? r.csrVersion.charCodeAt(0) : 0),
                (o.signatureOid = m.asn1.derToOid(r.csrSignatureOid)),
                (o.signatureParameters = u(
                  o.signatureOid,
                  r.csrSignatureParams,
                  !0,
                )),
                (o.siginfo.algorithmOid = m.asn1.derToOid(r.csrSignatureOid)),
                (o.siginfo.parameters = u(
                  o.siginfo.algorithmOid,
                  r.csrSignatureParams,
                  !1,
                )),
                m.util.createBuffer(r.csrSignature));
            if (
              (++e.read,
              (o.signature = e.getBytes()),
              (o.certificationRequestInfo = r.certificationRequestInfo),
              t)
            ) {
              if (((o.md = null), o.signatureOid in p))
                switch (p[o.signatureOid]) {
                  case "sha1WithRSAEncryption":
                    o.md = m.md.sha1.create();
                    break;
                  case "md5WithRSAEncryption":
                    o.md = m.md.md5.create();
                    break;
                  case "sha256WithRSAEncryption":
                  case "RSASSA-PSS":
                    o.md = m.md.sha256.create();
                }
              if (null === o.md)
                throw (
                  ((s = new Error(
                    "Could not compute certification request digest. Unknown signature OID.",
                  )).signatureOid = o.signatureOid),
                  s
                );
              n = f.toDer(o.certificationRequestInfo);
              o.md.update(n.getBytes());
            }
            e = m.md.sha1.create();
            return (
              (o.subject.getField = function (e) {
                return c(o.subject, e);
              }),
              (o.subject.addField = function (e) {
                (l([e]), o.subject.attributes.push(e));
              }),
              (o.subject.attributes = C.RDNAttributesAsArray(
                r.certificationRequestInfoSubject,
                e,
              )),
              (o.subject.hash = e.digest().toHex()),
              (o.publicKey = C.publicKeyFromAsn1(r.subjectPublicKeyInfo)),
              (o.getAttribute = function (e) {
                return c(o, e);
              }),
              (o.addAttribute = function (e) {
                (l([e]), o.attributes.push(e));
              }),
              (o.attributes = C.CRIAttributesAsArray(
                r.certificationRequestInfoAttributes || [],
              )),
              o
            );
          }),
          (C.createCertificationRequest = function () {
            var o = {
              version: 0,
              signatureOid: null,
              signature: null,
              siginfo: {},
            };
            return (
              (o.siginfo.algorithmOid = null),
              (o.subject = {}),
              (o.subject.getField = function (e) {
                return c(o.subject, e);
              }),
              (o.subject.addField = function (e) {
                (l([e]), o.subject.attributes.push(e));
              }),
              (o.subject.attributes = []),
              (o.subject.hash = null),
              (o.publicKey = null),
              (o.attributes = []),
              (o.getAttribute = function (e) {
                return c(o, e);
              }),
              (o.addAttribute = function (e) {
                (l([e]), o.attributes.push(e));
              }),
              (o.md = null),
              (o.setSubject = function (e) {
                (l(e), (o.subject.attributes = e), (o.subject.hash = null));
              }),
              (o.setAttributes = function (e) {
                (l(e), (o.attributes = e));
              }),
              (o.sign = function (e, t) {
                o.md = t || m.md.sha1.create();
                t = p[o.md.algorithm + "WithRSAEncryption"];
                if (!t)
                  throw (
                    ((r = new Error(
                      "Could not compute certification request digest. Unknown message digest algorithm OID.",
                    )).algorithm = o.md.algorithm),
                    r
                  );
                ((o.signatureOid = o.siginfo.algorithmOid = t),
                  (o.certificationRequestInfo =
                    C.getCertificationRequestInfo(o)));
                var r = f.toDer(o.certificationRequestInfo);
                (o.md.update(r.getBytes()), (o.signature = e.sign(o.md)));
              }),
              (o.verify = function () {
                var e,
                  t = !1,
                  r = o.md;
                if (null === r) {
                  if (o.signatureOid in p)
                    switch (p[o.signatureOid]) {
                      case "sha1WithRSAEncryption":
                        r = m.md.sha1.create();
                        break;
                      case "md5WithRSAEncryption":
                        r = m.md.md5.create();
                        break;
                      case "sha256WithRSAEncryption":
                      case "RSASSA-PSS":
                        r = m.md.sha256.create();
                    }
                  if (null === r)
                    throw (
                      ((a = new Error(
                        "Could not compute certification request digest. Unknown signature OID.",
                      )).signatureOid = o.signatureOid),
                      a
                    );
                  var n =
                      o.certificationRequestInfo ||
                      C.getCertificationRequestInfo(o),
                    n = f.toDer(n);
                  r.update(n.getBytes());
                }
                if (null !== r) {
                  switch (o.signatureOid) {
                    case p.sha1WithRSAEncryption:
                      break;
                    case p["RSASSA-PSS"]:
                      var i,
                        a,
                        s = p[o.signatureParameters.mgf.hash.algorithmOid];
                      if (void 0 === s || void 0 === m.md[s])
                        throw (
                          ((a = new Error(
                            "Unsupported MGF hash function.",
                          )).oid = o.signatureParameters.mgf.hash.algorithmOid),
                          (a.name = s),
                          a
                        );
                      if (
                        void 0 ===
                          (i = p[o.signatureParameters.mgf.algorithmOid]) ||
                        void 0 === m.mgf[i]
                      )
                        throw (
                          ((a = new Error("Unsupported MGF function.")).oid =
                            o.signatureParameters.mgf.algorithmOid),
                          (a.name = i),
                          a
                        );
                      if (
                        ((i = m.mgf[i].create(m.md[s].create())),
                        void 0 ===
                          (s = p[o.signatureParameters.hash.algorithmOid]) ||
                          void 0 === m.md[s])
                      )
                        throw (
                          ((a = new Error(
                            "Unsupported RSASSA-PSS hash function.",
                          )).oid = o.signatureParameters.hash.algorithmOid),
                          (a.name = s),
                          a
                        );
                      e = m.pss.create(
                        m.md[s].create(),
                        i,
                        o.signatureParameters.saltLength,
                      );
                  }
                  t = o.publicKey.verify(r.digest().getBytes(), o.signature, e);
                }
                return t;
              }),
              o
            );
          }),
          (C.getTBSCertificate = function (e) {
            var t = f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
              f.create(f.Class.CONTEXT_SPECIFIC, 0, !0, [
                f.create(
                  f.Class.UNIVERSAL,
                  f.Type.INTEGER,
                  !1,
                  f.integerToDer(e.version).getBytes(),
                ),
              ]),
              f.create(
                f.Class.UNIVERSAL,
                f.Type.INTEGER,
                !1,
                m.util.hexToBytes(e.serialNumber),
              ),
              f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                f.create(
                  f.Class.UNIVERSAL,
                  f.Type.OID,
                  !1,
                  f.oidToDer(e.siginfo.algorithmOid).getBytes(),
                ),
                r(e.siginfo.algorithmOid, e.siginfo.parameters),
              ]),
              a(e.issuer),
              f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                f.create(
                  f.Class.UNIVERSAL,
                  f.Type.UTCTIME,
                  !1,
                  f.dateToUtcTime(e.validity.notBefore),
                ),
                f.create(
                  f.Class.UNIVERSAL,
                  f.Type.UTCTIME,
                  !1,
                  f.dateToUtcTime(e.validity.notAfter),
                ),
              ]),
              a(e.subject),
              C.publicKeyToAsn1(e.publicKey),
            ]);
            return (
              e.issuer.uniqueId &&
                t.value.push(
                  f.create(f.Class.CONTEXT_SPECIFIC, 1, !0, [
                    f.create(
                      f.Class.UNIVERSAL,
                      f.Type.BITSTRING,
                      !1,
                      String.fromCharCode(0) + e.issuer.uniqueId,
                    ),
                  ]),
                ),
              e.subject.uniqueId &&
                t.value.push(
                  f.create(f.Class.CONTEXT_SPECIFIC, 2, !0, [
                    f.create(
                      f.Class.UNIVERSAL,
                      f.Type.BITSTRING,
                      !1,
                      String.fromCharCode(0) + e.subject.uniqueId,
                    ),
                  ]),
                ),
              0 < e.extensions.length &&
                t.value.push(C.certificateExtensionsToAsn1(e.extensions)),
              t
            );
          }),
          (C.getCertificationRequestInfo = function (e) {
            return f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
              f.create(
                f.Class.UNIVERSAL,
                f.Type.INTEGER,
                !1,
                f.integerToDer(e.version).getBytes(),
              ),
              a(e.subject),
              C.publicKeyToAsn1(e.publicKey),
              (function (e) {
                var t = f.create(f.Class.CONTEXT_SPECIFIC, 0, !0, []);
                if (0 !== e.attributes.length)
                  for (var r = e.attributes, n = 0; n < r.length; ++n) {
                    var i = r[n],
                      a = i.value,
                      s = f.Type.UTF8,
                      o =
                        ((s = "valueTagClass" in i ? i.valueTagClass : s) ===
                          f.Type.UTF8 && (a = m.util.encodeUtf8(a)),
                        !1),
                      i =
                        ("valueConstructed" in i && (o = i.valueConstructed),
                        f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                          f.create(
                            f.Class.UNIVERSAL,
                            f.Type.OID,
                            !1,
                            f.oidToDer(i.type).getBytes(),
                          ),
                          f.create(f.Class.UNIVERSAL, f.Type.SET, !0, [
                            f.create(f.Class.UNIVERSAL, s, o, a),
                          ]),
                        ]));
                    t.value.push(i);
                  }
                return t;
              })(e),
            ]);
          }),
          (C.distinguishedNameToAsn1 = a),
          (C.certificateToAsn1 = function (e) {
            var t = e.tbsCertificate || C.getTBSCertificate(e);
            return f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
              t,
              f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                f.create(
                  f.Class.UNIVERSAL,
                  f.Type.OID,
                  !1,
                  f.oidToDer(e.signatureOid).getBytes(),
                ),
                r(e.signatureOid, e.signatureParameters),
              ]),
              f.create(
                f.Class.UNIVERSAL,
                f.Type.BITSTRING,
                !1,
                String.fromCharCode(0) + e.signature,
              ),
            ]);
          }),
          (C.certificateExtensionsToAsn1 = function (e) {
            var t = f.create(f.Class.CONTEXT_SPECIFIC, 3, !0, []),
              r = f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, []);
            t.value.push(r);
            for (var n = 0; n < e.length; ++n)
              r.value.push(C.certificateExtensionToAsn1(e[n]));
            return t;
          }),
          (C.certificateExtensionToAsn1 = function (e) {
            var t = f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, []),
              r =
                (t.value.push(
                  f.create(
                    f.Class.UNIVERSAL,
                    f.Type.OID,
                    !1,
                    f.oidToDer(e.id).getBytes(),
                  ),
                ),
                e.critical &&
                  t.value.push(
                    f.create(
                      f.Class.UNIVERSAL,
                      f.Type.BOOLEAN,
                      !1,
                      String.fromCharCode(255),
                    ),
                  ),
                e.value);
            return (
              "string" != typeof e.value && (r = f.toDer(r).getBytes()),
              t.value.push(
                f.create(f.Class.UNIVERSAL, f.Type.OCTETSTRING, !1, r),
              ),
              t
            );
          }),
          (C.certificationRequestToAsn1 = function (e) {
            var t =
              e.certificationRequestInfo || C.getCertificationRequestInfo(e);
            return f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
              t,
              f.create(f.Class.UNIVERSAL, f.Type.SEQUENCE, !0, [
                f.create(
                  f.Class.UNIVERSAL,
                  f.Type.OID,
                  !1,
                  f.oidToDer(e.signatureOid).getBytes(),
                ),
                r(e.signatureOid, e.signatureParameters),
              ]),
              f.create(
                f.Class.UNIVERSAL,
                f.Type.BITSTRING,
                !1,
                String.fromCharCode(0) + e.signature,
              ),
            ]);
          }),
          (C.createCaStore = function (e) {
            function i(e) {
              var t;
              return (
                e.hash ||
                  ((t = m.md.sha1.create()),
                  (e.attributes = C.RDNAttributesAsArray(a(e), t)),
                  (e.hash = t.digest().toHex())),
                r.certs[e.hash] || null
              );
            }
            var r = {
              certs: {},
              getIssuer: function (e) {
                return i(e.issuer);
              },
              addCertificate: function (e) {
                var t;
                ((e = "string" == typeof e ? m.pki.certificateFromPem(e) : e)
                  .subject.hash ||
                  ((t = m.md.sha1.create()),
                  (e.subject.attributes = C.RDNAttributesAsArray(
                    a(e.subject),
                    t,
                  )),
                  (e.subject.hash = t.digest().toHex())),
                  e.subject.hash in r.certs
                    ? ((t = r.certs[e.subject.hash]),
                      (t = m.util.isArray(t) ? t : [t]).push(e))
                    : (r.certs[e.subject.hash] = e));
              },
              hasCertificate: function (e) {
                var t = i(e.subject);
                if (t) {
                  m.util.isArray(t) || (t = [t]);
                  for (
                    var r = f.toDer(C.certificateToAsn1(e)).getBytes(), n = 0;
                    n < t.length;
                    ++n
                  )
                    if (r === f.toDer(C.certificateToAsn1(t[n])).getBytes())
                      return !0;
                }
                return !1;
              },
            };
            if (e)
              for (var t = 0; t < e.length; ++t) {
                var n = e[t];
                r.addCertificate(n);
              }
            return r;
          }),
          (C.certificateError = {
            bad_certificate: "forge.pki.BadCertificate",
            unsupported_certificate: "forge.pki.UnsupportedCertificate",
            certificate_revoked: "forge.pki.CertificateRevoked",
            certificate_expired: "forge.pki.CertificateExpired",
            certificate_unknown: "forge.pki.CertificateUnknown",
            unknown_ca: "forge.pki.UnknownCertificateAuthority",
          }),
          (C.verifyCertificateChain = function (e, t, r) {
            var n = (t = t.slice(0)).slice(0),
              i = new Date(),
              a = !0,
              s = null,
              o = 0;
            do {
              var c = t.shift(),
                u = null,
                l = !1;
              if (
                null ===
                (s =
                  i < c.validity.notBefore || i > c.validity.notAfter
                    ? {
                        message: "Certificate is not valid yet or has expired.",
                        error: C.certificateError.certificate_expired,
                        notBefore: c.validity.notBefore,
                        notAfter: c.validity.notAfter,
                        now: i,
                      }
                    : s)
              ) {
                if (
                  (null === (u = t[0] || e.getIssuer(c)) &&
                    c.isIssuer(c) &&
                    ((l = !0), (u = c)),
                  u)
                ) {
                  for (
                    var f = u, p = (m.util.isArray(f) || (f = [f]), !1);
                    !p && 0 < f.length;
                  ) {
                    u = f.shift();
                    try {
                      p = u.verify(c);
                    } catch (e) {}
                  }
                  p ||
                    (s = {
                      message: "Certificate signature is invalid.",
                      error: C.certificateError.bad_certificate,
                    });
                }
                null !== s ||
                  (u && !l) ||
                  e.hasCertificate(c) ||
                  (s = {
                    message: "Certificate is not trusted.",
                    error: C.certificateError.unknown_ca,
                  });
              }
              if (
                null ===
                (s =
                  null === s && u && !c.isIssuer(u)
                    ? {
                        message: "Certificate issuer is invalid.",
                        error: C.certificateError.bad_certificate,
                      }
                    : s)
              )
                for (
                  var d = { keyUsage: !0, basicConstraints: !0 }, h = 0;
                  null === s && h < c.extensions.length;
                  ++h
                ) {
                  var y = c.extensions[h];
                  !y.critical ||
                    y.name in d ||
                    (s = {
                      message:
                        "Certificate has an unsupported critical extension.",
                      error: C.certificateError.unsupported_certificate,
                    });
                }
              null !== s ||
                (a && (0 !== t.length || (u && !l))) ||
                ((l = c.getExtension("basicConstraints")),
                null ===
                  (s =
                    null !==
                      (s =
                        null === (g = c.getExtension("keyUsage")) ||
                        (g.keyCertSign && null !== l)
                          ? s
                          : {
                              message:
                                "Certificate keyUsage or basicConstraints conflict or indicate that the certificate is not a CA. If the certificate is the only one in the chain or isn't the first then the certificate must be a valid CA.",
                              error: C.certificateError.bad_certificate,
                            }) ||
                    null === l ||
                    l.cA
                      ? s
                      : {
                          message:
                            "Certificate basicConstraints indicates the certificate is not a CA.",
                          error: C.certificateError.bad_certificate,
                        }) &&
                  null !== g &&
                  "pathLenConstraint" in l &&
                  o - 1 > l.pathLenConstraint &&
                  (s = {
                    message:
                      "Certificate basicConstraints pathLenConstraint violated.",
                    error: C.certificateError.bad_certificate,
                  }));
              var g = null === s || s.error,
                l = r ? r(g, o, n) : g;
              if (!0 !== l)
                throw (
                  !0 === g &&
                    (s = {
                      message: "The application rejected the certificate.",
                      error: C.certificateError.bad_certificate,
                    }),
                  (!l && 0 !== l) ||
                    ("object" != typeof l || m.util.isArray(l)
                      ? "string" == typeof l && (s.error = l)
                      : (l.message && (s.message = l.message),
                        l.error && (s.error = l.error))),
                  s
                );
            } while (((s = null), (a = !1), ++o, 0 < t.length));
            return !0;
          }));
      }
      var a = "x509";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/x509",
        [
          "require",
          "module",
          "./aes",
          "./asn1",
          "./des",
          "./md",
          "./mgf",
          "./oids",
          "./pem",
          "./pss",
          "./rsa",
          "./util",
        ],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), e.defined[a]))
                return e[a];
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
              return e.pki;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(y) {
        function u(e, t, r, n) {
          for (var i = [], a = 0; a < e.length; a++)
            for (var s = 0; s < e[a].safeBags.length; s++) {
              var o = e[a].safeBags[s];
              (void 0 !== n && o.type !== n) ||
                ((null === t ||
                  (void 0 !== o.attributes[t] &&
                    0 <= o.attributes[t].indexOf(r))) &&
                  i.push(o));
            }
          return i;
        }
        function p(e) {
          if (e.composed || e.constructed) {
            for (var t = y.util.createBuffer(), r = 0; r < e.value.length; ++r)
              t.putBytes(e.value[r].value);
            ((e.composed = e.constructed = !1), (e.value = t.getBytes()));
          }
          return e;
        }
        function l(e, t, r, n) {
          if (
            (t = g.fromDer(t, r)).tagClass !== g.Class.UNIVERSAL ||
            t.type !== g.Type.SEQUENCE ||
            !0 !== t.constructed
          )
            throw new Error(
              "PKCS#12 AuthenticatedSafe expected to be a SEQUENCE OF ContentInfo",
            );
          for (var i = 0; i < t.value.length; i++) {
            var a = t.value[i],
              s = {},
              o = [];
            if (!g.validate(a, d, s, o))
              throw (
                ((c = new Error("Cannot read ContentInfo.")).errors = o),
                c
              );
            var c,
              u = { encrypted: !1 },
              l = null,
              f = s.content.value[0];
            switch (g.derToOid(s.contentType)) {
              case m.oids.data:
                if (
                  f.tagClass !== g.Class.UNIVERSAL ||
                  f.type !== g.Type.OCTETSTRING
                )
                  throw new Error(
                    "PKCS#12 SafeContents Data is not an OCTET STRING.",
                  );
                l = p(f).value;
                break;
              case m.oids.encryptedData:
                ((l = (function (e, t) {
                  var r = {},
                    n = [];
                  if (!g.validate(e, y.pkcs7.asn1.encryptedDataValidator, r, n))
                    throw (
                      ((i = new Error(
                        "Cannot read EncryptedContentInfo.",
                      )).errors = n),
                      i
                    );
                  e = g.derToOid(r.contentType);
                  if (e !== m.oids.data)
                    throw (
                      ((i = new Error(
                        "PKCS#12 EncryptedContentInfo ContentType is not Data.",
                      )).oid = e),
                      i
                    );
                  e = g.derToOid(r.encAlgorithm);
                  var n = m.pbe.getCipher(e, r.encParameter, t),
                    i = p(r.encryptedContentAsn1),
                    e = y.util.createBuffer(i.value);
                  if ((n.update(e), n.finish())) return n.output.getBytes();
                  throw new Error("Failed to decrypt PKCS#12 SafeContents.");
                })(f, n)),
                  (u.encrypted = !0));
                break;
              default:
                throw (
                  ((c = new Error(
                    "Unsupported PKCS#12 contentType.",
                  )).contentType = g.derToOid(s.contentType)),
                  c
                );
            }
            ((u.safeBags = (function (e, t, r) {
              if (!t && 0 === e.length) return [];
              if (
                (e = g.fromDer(e, t)).tagClass !== g.Class.UNIVERSAL ||
                e.type !== g.Type.SEQUENCE ||
                !0 !== e.constructed
              )
                throw new Error(
                  "PKCS#12 SafeContents expected to be a SEQUENCE OF SafeBag.",
                );
              for (var n = [], i = 0; i < e.value.length; i++) {
                var a = e.value[i],
                  s = {},
                  o = [];
                if (!g.validate(a, h, s, o))
                  throw (
                    ((f = new Error("Cannot read SafeBag.")).errors = o),
                    f
                  );
                var c = {
                  type: g.derToOid(s.bagId),
                  attributes: (function (e) {
                    var t = {};
                    if (void 0 !== e)
                      for (var r = 0; r < e.length; ++r) {
                        var n,
                          i = {},
                          a = [];
                        if (!g.validate(e[r], v, i, a))
                          throw (
                            ((n = new Error(
                              "Cannot read PKCS#12 BagAttribute.",
                            )).errors = a),
                            n
                          );
                        var s = g.derToOid(i.oid);
                        if (void 0 !== m.oids[s]) {
                          t[m.oids[s]] = [];
                          for (var o = 0; o < i.values.length; ++o)
                            t[m.oids[s]].push(i.values[o].value);
                        }
                      }
                    return t;
                  })(s.bagAttributes),
                };
                n.push(c);
                var u,
                  l,
                  f,
                  p = s.bagValue.value[0];
                switch (c.type) {
                  case m.oids.pkcs8ShroudedKeyBag:
                    if (null === (p = m.decryptPrivateKeyInfo(p, r)))
                      throw new Error(
                        "Unable to decrypt PKCS#8 ShroudedKeyBag, wrong password?",
                      );
                  case m.oids.keyBag:
                    c.key = m.privateKeyFromAsn1(p);
                    continue;
                  case m.oids.certBag:
                    ((u = E),
                      (l = function () {
                        var e;
                        if (g.derToOid(s.certId) !== m.oids.x509Certificate)
                          throw (
                            ((e = new Error(
                              "Unsupported certificate type, only X.509 supported.",
                            )).oid = g.derToOid(s.certId)),
                            e
                          );
                        c.cert = m.certificateFromAsn1(
                          g.fromDer(s.cert, t),
                          !0,
                        );
                      }));
                    break;
                  default:
                    throw (
                      ((f = new Error(
                        "Unsupported PKCS#12 SafeBag type.",
                      )).oid = c.type),
                      f
                    );
                }
                if (void 0 !== u && !g.validate(p, u, s, o))
                  throw (
                    ((f = new Error("Cannot read PKCS#12 " + u.name)).errors =
                      o),
                    f
                  );
                l();
              }
              return n;
            })(l, r, n)),
              e.safeContents.push(u));
          }
        }
        var g = y.asn1,
          m = y.pki,
          C = (y.pkcs12 = y.pkcs12 || {}),
          d = {
            name: "ContentInfo",
            tagClass: g.Class.UNIVERSAL,
            type: g.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "ContentInfo.contentType",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.OID,
                constructed: !1,
                capture: "contentType",
              },
              {
                name: "ContentInfo.content",
                tagClass: g.Class.CONTEXT_SPECIFIC,
                constructed: !0,
                captureAsn1: "content",
              },
            ],
          },
          f = {
            name: "PFX",
            tagClass: g.Class.UNIVERSAL,
            type: g.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "PFX.version",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.INTEGER,
                constructed: !1,
                capture: "version",
              },
              d,
              {
                name: "PFX.macData",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.SEQUENCE,
                constructed: !0,
                optional: !0,
                captureAsn1: "mac",
                value: [
                  {
                    name: "PFX.macData.mac",
                    tagClass: g.Class.UNIVERSAL,
                    type: g.Type.SEQUENCE,
                    constructed: !0,
                    value: [
                      {
                        name: "PFX.macData.mac.digestAlgorithm",
                        tagClass: g.Class.UNIVERSAL,
                        type: g.Type.SEQUENCE,
                        constructed: !0,
                        value: [
                          {
                            name: "PFX.macData.mac.digestAlgorithm.algorithm",
                            tagClass: g.Class.UNIVERSAL,
                            type: g.Type.OID,
                            constructed: !1,
                            capture: "macAlgorithm",
                          },
                          {
                            name: "PFX.macData.mac.digestAlgorithm.parameters",
                            tagClass: g.Class.UNIVERSAL,
                            captureAsn1: "macAlgorithmParameters",
                          },
                        ],
                      },
                      {
                        name: "PFX.macData.mac.digest",
                        tagClass: g.Class.UNIVERSAL,
                        type: g.Type.OCTETSTRING,
                        constructed: !1,
                        capture: "macDigest",
                      },
                    ],
                  },
                  {
                    name: "PFX.macData.macSalt",
                    tagClass: g.Class.UNIVERSAL,
                    type: g.Type.OCTETSTRING,
                    constructed: !1,
                    capture: "macSalt",
                  },
                  {
                    name: "PFX.macData.iterations",
                    tagClass: g.Class.UNIVERSAL,
                    type: g.Type.INTEGER,
                    constructed: !1,
                    optional: !0,
                    capture: "macIterations",
                  },
                ],
              },
            ],
          },
          h = {
            name: "SafeBag",
            tagClass: g.Class.UNIVERSAL,
            type: g.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "SafeBag.bagId",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.OID,
                constructed: !1,
                capture: "bagId",
              },
              {
                name: "SafeBag.bagValue",
                tagClass: g.Class.CONTEXT_SPECIFIC,
                constructed: !0,
                captureAsn1: "bagValue",
              },
              {
                name: "SafeBag.bagAttributes",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.SET,
                constructed: !0,
                optional: !0,
                capture: "bagAttributes",
              },
            ],
          },
          v = {
            name: "Attribute",
            tagClass: g.Class.UNIVERSAL,
            type: g.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "Attribute.attrId",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.OID,
                constructed: !1,
                capture: "oid",
              },
              {
                name: "Attribute.attrValues",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.SET,
                constructed: !0,
                capture: "values",
              },
            ],
          },
          E = {
            name: "CertBag",
            tagClass: g.Class.UNIVERSAL,
            type: g.Type.SEQUENCE,
            constructed: !0,
            value: [
              {
                name: "CertBag.certId",
                tagClass: g.Class.UNIVERSAL,
                type: g.Type.OID,
                constructed: !1,
                capture: "certId",
              },
              {
                name: "CertBag.certValue",
                tagClass: g.Class.CONTEXT_SPECIFIC,
                constructed: !0,
                value: [
                  {
                    name: "CertBag.certValue[0]",
                    tagClass: g.Class.UNIVERSAL,
                    type: g.Class.OCTETSTRING,
                    constructed: !1,
                    capture: "cert",
                  },
                ],
              },
            ],
          };
        ((C.pkcs12FromAsn1 = function (e, t, r) {
          "string" == typeof t ? ((r = t), (t = !0)) : void 0 === t && (t = !0);
          var n = {};
          if (!g.validate(e, f, n, []))
            throw ((o = new Error(
              "Cannot read PKCS#12 PFX. ASN.1 object is not an PKCS#12 PFX.",
            )).errors = o);
          var i = {
            version: n.version.charCodeAt(0),
            safeContents: [],
            getBags: function (e) {
              var t,
                r = {};
              return (
                "localKeyId" in e
                  ? (t = e.localKeyId)
                  : "localKeyIdHex" in e &&
                    (t = y.util.hexToBytes(e.localKeyIdHex)),
                void 0 === t &&
                  !("friendlyName" in e) &&
                  "bagType" in e &&
                  (r[e.bagType] = u(i.safeContents, null, null, e.bagType)),
                void 0 !== t &&
                  (r.localKeyId = u(
                    i.safeContents,
                    "localKeyId",
                    t,
                    e.bagType,
                  )),
                "friendlyName" in e &&
                  (r.friendlyName = u(
                    i.safeContents,
                    "friendlyName",
                    e.friendlyName,
                    e.bagType,
                  )),
                r
              );
            },
            getBagsByFriendlyName: function (e, t) {
              return u(i.safeContents, "friendlyName", e, t);
            },
            getBagsByLocalKeyId: function (e, t) {
              return u(i.safeContents, "localKeyId", e, t);
            },
          };
          if (3 !== n.version.charCodeAt(0))
            throw (
              ((o = new Error(
                "PKCS#12 PFX of version other than 3 not supported.",
              )).version = n.version.charCodeAt(0)),
              o
            );
          if (g.derToOid(n.contentType) !== m.oids.data)
            throw (
              ((o = new Error(
                "Only PKCS#12 PFX in password integrity mode supported.",
              )).oid = g.derToOid(n.contentType)),
              o
            );
          e = n.content.value[0];
          if (e.tagClass !== g.Class.UNIVERSAL || e.type !== g.Type.OCTETSTRING)
            throw new Error(
              "PKCS#12 authSafe content data is not an OCTET STRING.",
            );
          if (((e = p(e)), n.mac)) {
            var a = null,
              s = 0,
              o = g.derToOid(n.macAlgorithm);
            switch (o) {
              case m.oids.sha1:
                ((a = y.md.sha1.create()), (s = 20));
                break;
              case m.oids.sha256:
                ((a = y.md.sha256.create()), (s = 32));
                break;
              case m.oids.sha384:
                ((a = y.md.sha384.create()), (s = 48));
                break;
              case m.oids.sha512:
                ((a = y.md.sha512.create()), (s = 64));
                break;
              case m.oids.md5:
                ((a = y.md.md5.create()), (s = 16));
            }
            if (null === a)
              throw new Error("PKCS#12 uses unsupported MAC algorithm: " + o);
            var o = new y.util.ByteBuffer(n.macSalt),
              c =
                "macIterations" in n
                  ? parseInt(y.util.bytesToHex(n.macIterations), 16)
                  : 1,
              o = C.generateKey(r, o, 3, c, s, a),
              c = y.hmac.create();
            if (
              (c.start(a, o),
              c.update(e.value),
              c.getMac().getBytes() !== n.macDigest)
            )
              throw new Error(
                "PKCS#12 MAC could not be verified. Invalid password?",
              );
          }
          return (l(i, e.value, t, r), i);
        }),
          (C.toPkcs12Asn1 = function (e, t, r, n) {
            (((n = n || {}).saltSize = n.saltSize || 8),
              (n.count = n.count || 2048),
              (n.algorithm = n.algorithm || n.encAlgorithm || "aes128"),
              "useMac" in n || (n.useMac = !0),
              "localKeyId" in n || (n.localKeyId = null),
              "generateLocalKeyId" in n || (n.generateLocalKeyId = !0));
            for (
              var i,
                a = n.localKeyId,
                s =
                  (null !== a
                    ? (a = y.util.hexToBytes(a))
                    : n.generateLocalKeyId &&
                      (a = t
                        ? ("string" ==
                            typeof (s = y.util.isArray(t) ? t[0] : t) &&
                            (s = m.certificateFromPem(s)),
                          (p = y.md.sha1.create()).update(
                            g.toDer(m.certificateToAsn1(s)).getBytes(),
                          ),
                          p.digest().getBytes())
                        : y.random.getBytes(20)),
                  []),
                a =
                  (null !== a &&
                    s.push(
                      g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                        g.create(
                          g.Class.UNIVERSAL,
                          g.Type.OID,
                          !1,
                          g.oidToDer(m.oids.localKeyId).getBytes(),
                        ),
                        g.create(g.Class.UNIVERSAL, g.Type.SET, !0, [
                          g.create(
                            g.Class.UNIVERSAL,
                            g.Type.OCTETSTRING,
                            !1,
                            a,
                          ),
                        ]),
                      ]),
                    ),
                  ("friendlyName" in n) &&
                    s.push(
                      g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                        g.create(
                          g.Class.UNIVERSAL,
                          g.Type.OID,
                          !1,
                          g.oidToDer(m.oids.friendlyName).getBytes(),
                        ),
                        g.create(g.Class.UNIVERSAL, g.Type.SET, !0, [
                          g.create(
                            g.Class.UNIVERSAL,
                            g.Type.BMPSTRING,
                            !1,
                            n.friendlyName,
                          ),
                        ]),
                      ]),
                    ),
                  0 < s.length &&
                    (i = g.create(g.Class.UNIVERSAL, g.Type.SET, !0, s)),
                  []),
                o = [],
                c = (null !== t && (o = y.util.isArray(t) ? t : [t]), []),
                u = 0;
              u < o.length;
              ++u
            ) {
              "string" == typeof (t = o[u]) && (t = m.certificateFromPem(t));
              var l = 0 === u ? i : void 0,
                f = m.certificateToAsn1(t),
                f = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                  g.create(
                    g.Class.UNIVERSAL,
                    g.Type.OID,
                    !1,
                    g.oidToDer(m.oids.certBag).getBytes(),
                  ),
                  g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
                    g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                      g.create(
                        g.Class.UNIVERSAL,
                        g.Type.OID,
                        !1,
                        g.oidToDer(m.oids.x509Certificate).getBytes(),
                      ),
                      g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
                        g.create(
                          g.Class.UNIVERSAL,
                          g.Type.OCTETSTRING,
                          !1,
                          g.toDer(f).getBytes(),
                        ),
                      ]),
                    ]),
                  ]),
                  l,
                ]);
              c.push(f);
            }
            0 < c.length &&
              ((s = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, c)),
              (s = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                g.create(
                  g.Class.UNIVERSAL,
                  g.Type.OID,
                  !1,
                  g.oidToDer(m.oids.data).getBytes(),
                ),
                g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
                  g.create(
                    g.Class.UNIVERSAL,
                    g.Type.OCTETSTRING,
                    !1,
                    g.toDer(s).getBytes(),
                  ),
                ]),
              ])),
              a.push(s));
            var p,
              d,
              s = null,
              h =
                (null !== e &&
                  ((h = m.wrapRsaPrivateKey(m.privateKeyToAsn1(e))),
                  (s =
                    null === r
                      ? g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                          g.create(
                            g.Class.UNIVERSAL,
                            g.Type.OID,
                            !1,
                            g.oidToDer(m.oids.keyBag).getBytes(),
                          ),
                          g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [h]),
                          i,
                        ])
                      : g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                          g.create(
                            g.Class.UNIVERSAL,
                            g.Type.OID,
                            !1,
                            g.oidToDer(m.oids.pkcs8ShroudedKeyBag).getBytes(),
                          ),
                          g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
                            m.encryptPrivateKeyInfo(h, r, n),
                          ]),
                          i,
                        ])),
                  (h = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [s])),
                  (s = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                    g.create(
                      g.Class.UNIVERSAL,
                      g.Type.OID,
                      !1,
                      g.oidToDer(m.oids.data).getBytes(),
                    ),
                    g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
                      g.create(
                        g.Class.UNIVERSAL,
                        g.Type.OCTETSTRING,
                        !1,
                        g.toDer(h).getBytes(),
                      ),
                    ]),
                  ])),
                  a.push(s)),
                g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, a));
            return (
              n.useMac &&
                ((p = y.md.sha1.create()),
                (s = new y.util.ByteBuffer(y.random.getBytes(n.saltSize))),
                (a = n.count),
                (e = C.generateKey(r, s, 3, a, 20)),
                (n = y.hmac.create()).start(p, e),
                n.update(g.toDer(h).getBytes()),
                (r = n.getMac()),
                (d = g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                  g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                    g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                      g.create(
                        g.Class.UNIVERSAL,
                        g.Type.OID,
                        !1,
                        g.oidToDer(m.oids.sha1).getBytes(),
                      ),
                      g.create(g.Class.UNIVERSAL, g.Type.NULL, !1, ""),
                    ]),
                    g.create(
                      g.Class.UNIVERSAL,
                      g.Type.OCTETSTRING,
                      !1,
                      r.getBytes(),
                    ),
                  ]),
                  g.create(
                    g.Class.UNIVERSAL,
                    g.Type.OCTETSTRING,
                    !1,
                    s.getBytes(),
                  ),
                  g.create(
                    g.Class.UNIVERSAL,
                    g.Type.INTEGER,
                    !1,
                    g.integerToDer(a).getBytes(),
                  ),
                ]))),
              g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                g.create(
                  g.Class.UNIVERSAL,
                  g.Type.INTEGER,
                  !1,
                  g.integerToDer(3).getBytes(),
                ),
                g.create(g.Class.UNIVERSAL, g.Type.SEQUENCE, !0, [
                  g.create(
                    g.Class.UNIVERSAL,
                    g.Type.OID,
                    !1,
                    g.oidToDer(m.oids.data).getBytes(),
                  ),
                  g.create(g.Class.CONTEXT_SPECIFIC, 0, !0, [
                    g.create(
                      g.Class.UNIVERSAL,
                      g.Type.OCTETSTRING,
                      !1,
                      g.toDer(h).getBytes(),
                    ),
                  ]),
                ]),
                d,
              ])
            );
          }),
          (C.generateKey = y.pbe.generatePkcs12Key));
      }
      var a = "pkcs12";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/pkcs12",
        [
          "require",
          "module",
          "./asn1",
          "./hmac",
          "./oids",
          "./pkcs7asn1",
          "./pbe",
          "./random",
          "./rsa",
          "./sha1",
          "./util",
          "./x509",
        ],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(r) {
        var n = r.asn1,
          i = (r.pki = r.pki || {});
        ((i.pemToDer = function (e) {
          e = r.pem.decode(e)[0];
          if (e.procType && "ENCRYPTED" === e.procType.type)
            throw new Error("Could not convert PEM to DER; PEM is encrypted.");
          return r.util.createBuffer(e.body);
        }),
          (i.privateKeyFromPem = function (e) {
            e = r.pem.decode(e)[0];
            if ("PRIVATE KEY" !== e.type && "RSA PRIVATE KEY" !== e.type)
              throw (
                ((t = new Error(
                  'Could not convert private key from PEM; PEM header type is not "PRIVATE KEY" or "RSA PRIVATE KEY".',
                )).headerType = e.type),
                t
              );
            if (e.procType && "ENCRYPTED" === e.procType.type)
              throw new Error(
                "Could not convert private key from PEM; PEM is encrypted.",
              );
            var t = n.fromDer(e.body);
            return i.privateKeyFromAsn1(t);
          }),
          (i.privateKeyToPem = function (e, t) {
            e = {
              type: "RSA PRIVATE KEY",
              body: n.toDer(i.privateKeyToAsn1(e)).getBytes(),
            };
            return r.pem.encode(e, { maxline: t });
          }),
          (i.privateKeyInfoToPem = function (e, t) {
            e = { type: "PRIVATE KEY", body: n.toDer(e).getBytes() };
            return r.pem.encode(e, { maxline: t });
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/pki",
        [
          "require",
          "module",
          "./asn1",
          "./oids",
          "./pbe",
          "./pem",
          "./pbkdf2",
          "./pkcs12",
          "./pss",
          "./rsa",
          "./util",
          "./x509",
        ],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.pki)) {
                e.defined.pki = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.pki;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(y) {
        function o(e, t, r, n) {
          var i = y.util.createBuffer(),
            a = e.length >> 1,
            s = a + (1 & e.length),
            o = e.substr(0, s),
            e = e.substr(a, s),
            c = y.util.createBuffer(),
            u = y.hmac.create(),
            l = ((r = t + r), Math.ceil(n / 16)),
            f = Math.ceil(n / 20),
            p = (u.start("MD5", o), y.util.createBuffer());
          c.putBytes(r);
          for (var d = 0; d < l; ++d)
            (u.start(null, null),
              u.update(c.getBytes()),
              c.putBuffer(u.digest()),
              u.start(null, null),
              u.update(c.bytes() + r),
              p.putBuffer(u.digest()));
          u.start("SHA1", e);
          var h = y.util.createBuffer();
          for (c.clear(), c.putBytes(r), d = 0; d < f; ++d)
            (u.start(null, null),
              u.update(c.getBytes()),
              c.putBuffer(u.digest()),
              u.start(null, null),
              u.update(c.bytes() + r),
              h.putBuffer(u.digest()));
          return (
            i.putBytes(y.util.xorBytes(p.getBytes(), h.getBytes(), n)),
            i
          );
        }
        function a(e, t, r) {
          var n = !1;
          try {
            var i = e.deflate(t.fragment.getBytes());
            ((t.fragment = y.util.createBuffer(i)),
              (t.length = i.length),
              (n = !0));
          } catch (e) {}
          return n;
        }
        function s(e, t, r) {
          var n = !1;
          try {
            var i = e.inflate(t.fragment.getBytes());
            ((t.fragment = y.util.createBuffer(i)),
              (t.length = i.length),
              (n = !0));
          } catch (e) {}
          return n;
        }
        function f(e, t) {
          var r = 0;
          switch (t) {
            case 1:
              r = e.getByte();
              break;
            case 2:
              r = e.getInt16();
              break;
            case 3:
              r = e.getInt24();
              break;
            case 4:
              r = e.getInt32();
          }
          return y.util.createBuffer(e.getBytes(r));
        }
        function p(e, t, r) {
          (e.putInt(r.length(), t << 3), e.putBuffer(r));
        }
        function i(e) {
          switch (e) {
            case !0:
              return !0;
            case y.pki.certificateError.bad_certificate:
              return d.Alert.Description.bad_certificate;
            case y.pki.certificateError.unsupported_certificate:
              return d.Alert.Description.unsupported_certificate;
            case y.pki.certificateError.certificate_revoked:
              return d.Alert.Description.certificate_revoked;
            case y.pki.certificateError.certificate_expired:
              return d.Alert.Description.certificate_expired;
            case y.pki.certificateError.certificate_unknown:
              return d.Alert.Description.certificate_unknown;
            case y.pki.certificateError.unknown_ca:
              return d.Alert.Description.unknown_ca;
            default:
              return d.Alert.Description.bad_certificate;
          }
        }
        var e,
          d = {
            Versions: {
              TLS_1_0: { major: 3, minor: 1 },
              TLS_1_1: { major: 3, minor: 2 },
              TLS_1_2: { major: 3, minor: 3 },
            },
          },
          n =
            ((d.SupportedVersions = [d.Versions.TLS_1_1, d.Versions.TLS_1_0]),
            (d.Version = d.SupportedVersions[0]),
            (d.MaxFragment = 15360),
            (d.ConnectionEnd = { server: 0, client: 1 }),
            (d.PRFAlgorithm = { tls_prf_sha256: 0 }),
            (d.BulkCipherAlgorithm = { none: null, rc4: 0, des3: 1, aes: 2 }),
            (d.CipherType = { stream: 0, block: 1, aead: 2 }),
            (d.MACAlgorithm = {
              none: null,
              hmac_md5: 0,
              hmac_sha1: 1,
              hmac_sha256: 2,
              hmac_sha384: 3,
              hmac_sha512: 4,
            }),
            (d.CompressionMethod = { none: 0, deflate: 1 }),
            (d.ContentType = {
              change_cipher_spec: 20,
              alert: 21,
              handshake: 22,
              application_data: 23,
              heartbeat: 24,
            }),
            (d.HandshakeType = {
              hello_request: 0,
              client_hello: 1,
              server_hello: 2,
              certificate: 11,
              server_key_exchange: 12,
              certificate_request: 13,
              server_hello_done: 14,
              certificate_verify: 15,
              client_key_exchange: 16,
              finished: 20,
            }),
            (d.Alert = {}),
            (d.Alert.Level = { warning: 1, fatal: 2 }),
            (d.Alert.Description = {
              close_notify: 0,
              unexpected_message: 10,
              bad_record_mac: 20,
              decryption_failed: 21,
              record_overflow: 22,
              decompression_failure: 30,
              handshake_failure: 40,
              bad_certificate: 42,
              unsupported_certificate: 43,
              certificate_revoked: 44,
              certificate_expired: 45,
              certificate_unknown: 46,
              illegal_parameter: 47,
              unknown_ca: 48,
              access_denied: 49,
              decode_error: 50,
              decrypt_error: 51,
              export_restriction: 60,
              protocol_version: 70,
              insufficient_security: 71,
              internal_error: 80,
              user_canceled: 90,
              no_renegotiation: 100,
            }),
            (d.HeartbeatMessageType = {
              heartbeat_request: 1,
              heartbeat_response: 2,
            }),
            (d.CipherSuites = {}),
            (d.getCipherSuite = function (e) {
              var t,
                r = null;
              for (t in d.CipherSuites) {
                var n = d.CipherSuites[t];
                if (
                  n.id[0] === e.charCodeAt(0) &&
                  n.id[1] === e.charCodeAt(1)
                ) {
                  r = n;
                  break;
                }
              }
              return r;
            }),
            (d.handleUnexpected = function (e, t) {
              (!e.open && e.entity === d.ConnectionEnd.client) ||
                e.error(e, {
                  message:
                    "Unexpected message. Received TLS record out of order.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.unexpected_message,
                  },
                });
            }),
            (d.handleHelloRequest = function (e, t, r) {
              (!e.handshaking &&
                0 < e.handshakes &&
                (d.queue(
                  e,
                  d.createAlert(e, {
                    level: d.Alert.Level.warning,
                    description: d.Alert.Description.no_renegotiation,
                  }),
                ),
                d.flush(e)),
                e.process());
            }),
            (d.parseHelloMessage = function (e, t, r) {
              var n = null,
                i = e.entity === d.ConnectionEnd.client;
              if (r < 38)
                e.error(e, {
                  message: i
                    ? "Invalid ServerHello message. Message too short."
                    : "Invalid ClientHello message. Message too short.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.illegal_parameter,
                  },
                });
              else {
                var t = t.fragment,
                  a = t.length(),
                  n = {
                    version: { major: t.getByte(), minor: t.getByte() },
                    random: y.util.createBuffer(t.getBytes(32)),
                    session_id: f(t, 1),
                    extensions: [],
                  };
                if (
                  (i
                    ? ((n.cipher_suite = t.getBytes(2)),
                      (n.compression_method = t.getByte()))
                    : ((n.cipher_suites = f(t, 2)),
                      (n.compression_methods = f(t, 1))),
                  0 < r - (a - t.length()))
                ) {
                  for (var s = f(t, 2); 0 < s.length();)
                    n.extensions.push({
                      type: [s.getByte(), s.getByte()],
                      data: f(s, 2),
                    });
                  if (!i)
                    for (var o = 0; o < n.extensions.length; ++o) {
                      var c = n.extensions[o];
                      if (0 === c.type[0] && 0 === c.type[1])
                        for (var u = f(c.data, 2); 0 < u.length();) {
                          if (0 !== u.getByte()) break;
                          e.session.extensions.server_name.serverNameList.push(
                            f(u, 2).getBytes(),
                          );
                        }
                    }
                }
                if (
                  e.session.version &&
                  (n.version.major !== e.session.version.major ||
                    n.version.minor !== e.session.version.minor)
                )
                  return e.error(e, {
                    message:
                      "TLS version change is disallowed during renegotiation.",
                    send: !0,
                    alert: {
                      level: d.Alert.Level.fatal,
                      description: d.Alert.Description.protocol_version,
                    },
                  });
                if (i) e.session.cipherSuite = d.getCipherSuite(n.cipher_suite);
                else
                  for (
                    var l = y.util.createBuffer(n.cipher_suites.bytes());
                    0 < l.length() &&
                    ((e.session.cipherSuite = d.getCipherSuite(l.getBytes(2))),
                    null === e.session.cipherSuite);
                  );
                if (null === e.session.cipherSuite)
                  return e.error(e, {
                    message: "No cipher suites in common.",
                    send: !0,
                    alert: {
                      level: d.Alert.Level.fatal,
                      description: d.Alert.Description.handshake_failure,
                    },
                    cipherSuite: y.util.bytesToHex(n.cipher_suite),
                  });
                e.session.compressionMethod = i
                  ? n.compression_method
                  : d.CompressionMethod.none;
              }
              return n;
            }),
            (d.createSecurityParameters = function (e, t) {
              var r = e.entity === d.ConnectionEnd.client,
                t = t.random.bytes(),
                n = r ? e.session.sp.client_random : t,
                r = r ? t : d.createRandom().getBytes();
              e.session.sp = {
                entity: e.entity,
                prf_algorithm: d.PRFAlgorithm.tls_prf_sha256,
                bulk_cipher_algorithm: null,
                cipher_type: null,
                enc_key_length: null,
                block_length: null,
                fixed_iv_length: null,
                record_iv_length: null,
                mac_algorithm: null,
                mac_length: null,
                mac_key_length: null,
                compression_algorithm: e.session.compressionMethod,
                pre_master_secret: null,
                master_secret: null,
                client_random: n,
                server_random: r,
              };
            }),
            (d.handleServerHello = function (e, t, r) {
              t = d.parseHelloMessage(e, t, r);
              if (!e.fail) {
                if (!(t.version.minor <= e.version.minor))
                  return e.error(e, {
                    message: "Incompatible TLS version.",
                    send: !0,
                    alert: {
                      level: d.Alert.Level.fatal,
                      description: d.Alert.Description.protocol_version,
                    },
                  });
                ((e.version.minor = t.version.minor),
                  (e.session.version = e.version));
                r = t.session_id.bytes();
                (0 < r.length && r === e.session.id
                  ? ((e.expect = h),
                    (e.session.resuming = !0),
                    (e.session.sp.server_random = t.random.bytes()))
                  : ((e.expect = n),
                    (e.session.resuming = !1),
                    d.createSecurityParameters(e, t)),
                  (e.session.id = r),
                  e.process());
              }
            }),
            (d.handleClientHello = function (e, t, r) {
              var n = d.parseHelloMessage(e, t, r);
              if (!e.fail) {
                ((t = n.session_id.bytes()), (r = null));
                if (
                  (e.sessionCache &&
                    (null === (r = e.sessionCache.getSession(t))
                      ? (t = "")
                      : (r.version.major !== n.version.major ||
                          r.version.minor > n.version.minor) &&
                        ((r = null), (t = ""))),
                  0 === t.length && (t = y.random.getBytes(32)),
                  (e.session.id = t),
                  (e.session.clientHelloVersion = n.version),
                  (e.session.sp = {}),
                  r)
                )
                  ((e.version = e.session.version = r.version),
                    (e.session.sp = r.sp));
                else {
                  for (
                    var i, a = 1;
                    a < d.SupportedVersions.length &&
                    !((i = d.SupportedVersions[a]).minor <= n.version.minor);
                    ++a
                  );
                  ((e.version = { major: i.major, minor: i.minor }),
                    (e.session.version = e.version));
                }
                (null !== r
                  ? ((e.expect = S),
                    (e.session.resuming = !0),
                    (e.session.sp.client_random = n.random.bytes()))
                  : ((e.expect = !1 !== e.verifyClient ? C : v),
                    (e.session.resuming = !1),
                    d.createSecurityParameters(e, n)),
                  (e.open = !0),
                  d.queue(
                    e,
                    d.createRecord(e, {
                      type: d.ContentType.handshake,
                      data: d.createServerHello(e),
                    }),
                  ),
                  e.session.resuming
                    ? (d.queue(
                        e,
                        d.createRecord(e, {
                          type: d.ContentType.change_cipher_spec,
                          data: d.createChangeCipherSpec(),
                        }),
                      ),
                      (e.state.pending = d.createConnectionState(e)),
                      (e.state.current.write = e.state.pending.write),
                      d.queue(
                        e,
                        d.createRecord(e, {
                          type: d.ContentType.handshake,
                          data: d.createFinished(e),
                        }),
                      ))
                    : (d.queue(
                        e,
                        d.createRecord(e, {
                          type: d.ContentType.handshake,
                          data: d.createCertificate(e),
                        }),
                      ),
                      e.fail ||
                        (d.queue(
                          e,
                          d.createRecord(e, {
                            type: d.ContentType.handshake,
                            data: d.createServerKeyExchange(e),
                          }),
                        ),
                        !1 !== e.verifyClient &&
                          d.queue(
                            e,
                            d.createRecord(e, {
                              type: d.ContentType.handshake,
                              data: d.createCertificateRequest(e),
                            }),
                          ),
                        d.queue(
                          e,
                          d.createRecord(e, {
                            type: d.ContentType.handshake,
                            data: d.createServerHelloDone(e),
                          }),
                        ))),
                  d.flush(e),
                  e.process());
              }
            }),
            (d.handleCertificate = function (t, e, r) {
              if (r < 3)
                return t.error(t, {
                  message: "Invalid Certificate message. Message too short.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.illegal_parameter,
                  },
                });
              var n,
                i,
                r = e.fragment,
                a = { certificate_list: f(r, 3) },
                s = [];
              try {
                for (; 0 < a.certificate_list.length();)
                  ((n = f(a.certificate_list, 3)),
                    (i = y.asn1.fromDer(n)),
                    (n = y.pki.certificateFromAsn1(i, !0)),
                    s.push(n));
              } catch (e) {
                return t.error(t, {
                  message: "Could not parse certificate list.",
                  cause: e,
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.bad_certificate,
                  },
                });
              }
              e = t.entity === d.ConnectionEnd.client;
              ((!e && !0 !== t.verifyClient) || 0 !== s.length
                ? (0 !== s.length &&
                    (e
                      ? (t.session.serverCertificate = s[0])
                      : (t.session.clientCertificate = s[0]),
                    !d.verifyCertificateChain(t, s))) ||
                  (t.expect = e ? c : v)
                : t.error(t, {
                    message: e
                      ? "No server certificate provided."
                      : "No client certificate provided.",
                    send: !0,
                    alert: {
                      level: d.Alert.Level.fatal,
                      description: d.Alert.Description.illegal_parameter,
                    },
                  }),
                t.process());
            }),
            (d.handleServerKeyExchange = function (e, t, r) {
              if (0 < r)
                return e.error(e, {
                  message: "Invalid key parameters. Only RSA is supported.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.unsupported_certificate,
                  },
                });
              ((e.expect = u), e.process());
            }),
            (d.handleClientKeyExchange = function (t, e, r) {
              if (r < 48)
                return t.error(t, {
                  message: "Invalid key parameters. Only RSA is supported.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.unsupported_certificate,
                  },
                });
              ((r = e.fragment),
                (e = { enc_pre_master_secret: f(r, 2).getBytes() }),
                (r = null));
              if (t.getPrivateKey)
                try {
                  ((r = t.getPrivateKey(t, t.session.serverCertificate)),
                    (r = y.pki.privateKeyFromPem(r)));
                } catch (e) {
                  t.error(t, {
                    message: "Could not get private key.",
                    cause: e,
                    send: !0,
                    alert: {
                      level: d.Alert.Level.fatal,
                      description: d.Alert.Description.internal_error,
                    },
                  });
                }
              if (null === r)
                return t.error(t, {
                  message: "No private key set.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.internal_error,
                  },
                });
              try {
                var n = t.session.sp,
                  i =
                    ((n.pre_master_secret = r.decrypt(e.enc_pre_master_secret)),
                    t.session.clientHelloVersion);
                if (
                  i.major !== n.pre_master_secret.charCodeAt(0) ||
                  i.minor !== n.pre_master_secret.charCodeAt(1)
                )
                  throw new Error("TLS version rollback attack detected.");
              } catch (e) {
                n.pre_master_secret = y.random.getBytes(48);
              }
              ((t.expect = S),
                null !== t.session.clientCertificate && (t.expect = E),
                t.process());
            }),
            (d.handleCertificateRequest = function (e, t, r) {
              if (r < 3)
                return e.error(e, {
                  message: "Invalid CertificateRequest. Message too short.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.illegal_parameter,
                  },
                });
              ((r = t.fragment),
                (t = {
                  certificate_types: f(r, 1),
                  certificate_authorities: f(r, 2),
                }));
              ((e.session.certificateRequest = t), (e.expect = l), e.process());
            }),
            (d.handleCertificateVerify = function (t, e, r) {
              if (r < 2)
                return t.error(t, {
                  message: "Invalid CertificateVerify. Message too short.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.illegal_parameter,
                  },
                });
              var r = e.fragment,
                e = ((r.read -= 4), r.bytes()),
                r = ((r.read += 4), { signature: f(r, 2).getBytes() }),
                n = y.util.createBuffer();
              (n.putBuffer(t.session.md5.digest()),
                n.putBuffer(t.session.sha1.digest()),
                (n = n.getBytes()));
              try {
                if (
                  !t.session.clientCertificate.publicKey.verify(
                    n,
                    r.signature,
                    "NONE",
                  )
                )
                  throw new Error(
                    "CertificateVerify signature does not match.",
                  );
                (t.session.md5.update(e), t.session.sha1.update(e));
              } catch (e) {
                return t.error(t, {
                  message: "Bad signature in CertificateVerify.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.handshake_failure,
                  },
                });
              }
              ((t.expect = S), t.process());
            }),
            (d.handleServerHelloDone = function (e, t, r) {
              if (0 < r)
                return e.error(e, {
                  message: "Invalid ServerHelloDone message. Invalid length.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.record_overflow,
                  },
                });
              if (null === e.serverCertificate) {
                var r = {
                    message:
                      "No server certificate provided. Not enough security.",
                    send: !0,
                    alert: {
                      level: d.Alert.Level.fatal,
                      description: d.Alert.Description.insufficient_security,
                    },
                  },
                  n = e.verify(e, r.alert.description, 0, []);
                if (!0 !== n)
                  return (
                    (!n && 0 !== n) ||
                      ("object" != typeof n || y.util.isArray(n)
                        ? "number" == typeof n && (r.alert.description = n)
                        : (n.message && (r.message = n.message),
                          n.alert && (r.alert.description = n.alert))),
                    e.error(e, r)
                  );
              }
              (null !== e.session.certificateRequest &&
                ((t = d.createRecord(e, {
                  type: d.ContentType.handshake,
                  data: d.createCertificate(e),
                })),
                d.queue(e, t)),
                (t = d.createRecord(e, {
                  type: d.ContentType.handshake,
                  data: d.createClientKeyExchange(e),
                })),
                d.queue(e, t),
                (e.expect = m));
              function i(e, t) {
                (null !== e.session.certificateRequest &&
                  null !== e.session.clientCertificate &&
                  d.queue(
                    e,
                    d.createRecord(e, {
                      type: d.ContentType.handshake,
                      data: d.createCertificateVerify(e, t),
                    }),
                  ),
                  d.queue(
                    e,
                    d.createRecord(e, {
                      type: d.ContentType.change_cipher_spec,
                      data: d.createChangeCipherSpec(),
                    }),
                  ),
                  (e.state.pending = d.createConnectionState(e)),
                  (e.state.current.write = e.state.pending.write),
                  d.queue(
                    e,
                    d.createRecord(e, {
                      type: d.ContentType.handshake,
                      data: d.createFinished(e),
                    }),
                  ),
                  (e.expect = h),
                  d.flush(e),
                  e.process());
              }
              if (
                null === e.session.certificateRequest ||
                null === e.session.clientCertificate
              )
                return i(e, null);
              d.getClientSignature(e, i);
            }),
            (d.handleChangeCipherSpec = function (e, t) {
              if (1 !== t.fragment.getByte())
                return e.error(e, {
                  message: "Invalid ChangeCipherSpec message received.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.illegal_parameter,
                  },
                });
              t = e.entity === d.ConnectionEnd.client;
              (((e.session.resuming && t) || (!e.session.resuming && !t)) &&
                (e.state.pending = d.createConnectionState(e)),
                (e.state.current.read = e.state.pending.read),
                ((!e.session.resuming && t) || (e.session.resuming && !t)) &&
                  (e.state.pending = null),
                (e.expect = t ? r : T),
                e.process());
            }),
            (d.handleFinished = function (e, t, r) {
              var n = t.fragment,
                i = ((n.read -= 4), n.bytes()),
                t = ((n.read += 4), t.fragment.getBytes()),
                a =
                  ((n = y.util.createBuffer()).putBuffer(
                    e.session.md5.digest(),
                  ),
                  n.putBuffer(e.session.sha1.digest()),
                  e.entity === d.ConnectionEnd.client),
                s = e.session.sp;
              if (
                (n = o(
                  s.master_secret,
                  a ? "server finished" : "client finished",
                  n.getBytes(),
                  12,
                )).getBytes() !== t
              )
                return e.error(e, {
                  message: "Invalid verify_data in Finished message.",
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.decrypt_error,
                  },
                });
              (e.session.md5.update(i),
                e.session.sha1.update(i),
                ((e.session.resuming && a) || (!e.session.resuming && !a)) &&
                  (d.queue(
                    e,
                    d.createRecord(e, {
                      type: d.ContentType.change_cipher_spec,
                      data: d.createChangeCipherSpec(),
                    }),
                  ),
                  (e.state.current.write = e.state.pending.write),
                  (e.state.pending = null),
                  d.queue(
                    e,
                    d.createRecord(e, {
                      type: d.ContentType.handshake,
                      data: d.createFinished(e),
                    }),
                  )),
                (e.expect = a ? g : I),
                (e.handshaking = !1),
                ++e.handshakes,
                (e.peerCertificate = a
                  ? e.session.serverCertificate
                  : e.session.clientCertificate),
                d.flush(e),
                (e.isConnected = !0),
                e.connected(e),
                e.process());
            }),
            (d.handleAlert = function (e, t) {
              var r,
                t = t.fragment,
                t = { level: t.getByte(), description: t.getByte() };
              switch (t.description) {
                case d.Alert.Description.close_notify:
                  r = "Connection closed.";
                  break;
                case d.Alert.Description.unexpected_message:
                  r = "Unexpected message.";
                  break;
                case d.Alert.Description.bad_record_mac:
                  r = "Bad record MAC.";
                  break;
                case d.Alert.Description.decryption_failed:
                  r = "Decryption failed.";
                  break;
                case d.Alert.Description.record_overflow:
                  r = "Record overflow.";
                  break;
                case d.Alert.Description.decompression_failure:
                  r = "Decompression failed.";
                  break;
                case d.Alert.Description.handshake_failure:
                  r = "Handshake failure.";
                  break;
                case d.Alert.Description.bad_certificate:
                  r = "Bad certificate.";
                  break;
                case d.Alert.Description.unsupported_certificate:
                  r = "Unsupported certificate.";
                  break;
                case d.Alert.Description.certificate_revoked:
                  r = "Certificate revoked.";
                  break;
                case d.Alert.Description.certificate_expired:
                  r = "Certificate expired.";
                  break;
                case d.Alert.Description.certificate_unknown:
                  r = "Certificate unknown.";
                  break;
                case d.Alert.Description.illegal_parameter:
                  r = "Illegal parameter.";
                  break;
                case d.Alert.Description.unknown_ca:
                  r = "Unknown certificate authority.";
                  break;
                case d.Alert.Description.access_denied:
                  r = "Access denied.";
                  break;
                case d.Alert.Description.decode_error:
                  r = "Decode error.";
                  break;
                case d.Alert.Description.decrypt_error:
                  r = "Decrypt error.";
                  break;
                case d.Alert.Description.export_restriction:
                  r = "Export restriction.";
                  break;
                case d.Alert.Description.protocol_version:
                  r = "Unsupported protocol version.";
                  break;
                case d.Alert.Description.insufficient_security:
                  r = "Insufficient security.";
                  break;
                case d.Alert.Description.internal_error:
                  r = "Internal error.";
                  break;
                case d.Alert.Description.user_canceled:
                  r = "User canceled.";
                  break;
                case d.Alert.Description.no_renegotiation:
                  r = "Renegotiation not supported.";
                  break;
                default:
                  r = "Unknown error.";
              }
              if (t.description === d.Alert.Description.close_notify)
                return e.close();
              (e.error(e, {
                message: r,
                send: !1,
                origin:
                  e.entity === d.ConnectionEnd.client ? "server" : "client",
                alert: t,
              }),
                e.process());
            }),
            (d.handleHandshake = function (e, t) {
              var r = t.fragment,
                n = r.getByte(),
                i = r.getInt24();
              if (i > r.length())
                return (
                  ((e.fragmented = t).fragment = y.util.createBuffer()),
                  (r.read -= 4),
                  e.process()
                );
              ((e.fragmented = null), (r.read -= 4));
              var a = r.bytes(i + 4);
              ((r.read += 4),
                n in L[e.entity][e.expect]
                  ? (e.entity !== d.ConnectionEnd.server ||
                      e.open ||
                      e.fail ||
                      ((e.handshaking = !0),
                      (e.session = {
                        version: null,
                        extensions: { server_name: { serverNameList: [] } },
                        cipherSuite: null,
                        compressionMethod: null,
                        serverCertificate: null,
                        clientCertificate: null,
                        md5: y.md.md5.create(),
                        sha1: y.md.sha1.create(),
                      })),
                    n !== d.HandshakeType.hello_request &&
                      n !== d.HandshakeType.certificate_verify &&
                      n !== d.HandshakeType.finished &&
                      (e.session.md5.update(a), e.session.sha1.update(a)),
                    L[e.entity][e.expect][n](e, t, i))
                  : d.handleUnexpected(e, t));
            }),
            (d.handleApplicationData = function (e, t) {
              (e.data.putBuffer(t.fragment), e.dataReady(e), e.process());
            }),
            (d.handleHeartbeat = function (e, t) {
              var t = t.fragment,
                r = t.getByte(),
                n = t.getInt16(),
                t = t.getBytes(n);
              if (r === d.HeartbeatMessageType.heartbeat_request) {
                if (e.handshaking || n > t.length) return e.process();
                (d.queue(
                  e,
                  d.createRecord(e, {
                    type: d.ContentType.heartbeat,
                    data: d.createHeartbeat(
                      d.HeartbeatMessageType.heartbeat_response,
                      t,
                    ),
                  }),
                ),
                  d.flush(e));
              } else if (r === d.HeartbeatMessageType.heartbeat_response) {
                if (t !== e.expectedHeartbeatPayload) return e.process();
                e.heartbeatReceived &&
                  e.heartbeatReceived(e, y.util.createBuffer(t));
              }
              e.process();
            }),
            1),
          c = 2,
          u = 3,
          l = 4,
          h = 5,
          r = 6,
          g = 7,
          m = 8,
          C = 1,
          v = 2,
          E = 3,
          S = 4,
          T = 5,
          I = 6,
          t = d.handleUnexpected,
          A = d.handleChangeCipherSpec,
          b = d.handleAlert,
          B = d.handleHandshake,
          k = d.handleApplicationData,
          N = d.handleHeartbeat,
          R = [],
          A =
            ((R[d.ConnectionEnd.client] = [
              [t, b, B, t, N],
              [t, b, B, t, N],
              [t, b, B, t, N],
              [t, b, B, t, N],
              [t, b, B, t, N],
              [A, b, t, t, N],
              [t, b, B, t, N],
              [t, b, B, k, N],
              [t, b, B, t, N],
            ]),
            (R[d.ConnectionEnd.server] = [
              [t, b, B, t, N],
              [t, b, B, t, N],
              [t, b, B, t, N],
              [t, b, B, t, N],
              [A, b, t, t, N],
              [t, b, B, t, N],
              [t, b, B, k, N],
              [t, b, B, t, N],
            ]),
            d.handleHelloRequest),
          k = d.handleCertificate,
          b = d.handleServerKeyExchange,
          B = d.handleCertificateRequest,
          N = d.handleServerHelloDone,
          w = d.handleFinished,
          L = [],
          b =
            ((L[d.ConnectionEnd.client] = [
              [
                t,
                t,
                d.handleServerHello,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
                t,
              ],
              [A, t, t, t, t, t, t, t, t, t, t, k, b, B, N, t, t, t, t, t, t],
              [A, t, t, t, t, t, t, t, t, t, t, t, b, B, N, t, t, t, t, t, t],
              [A, t, t, t, t, t, t, t, t, t, t, t, t, B, N, t, t, t, t, t, t],
              [A, t, t, t, t, t, t, t, t, t, t, t, t, t, N, t, t, t, t, t, t],
              [A, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
              [A, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, w],
              [A, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
              [A, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
            ]),
            d.handleClientHello);
        ((L[d.ConnectionEnd.server] = [
          [t, b, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
          [t, t, t, t, t, t, t, t, t, t, t, k, t, t, t, t, t, t, t, t, t],
          [
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            d.handleClientKeyExchange,
            t,
            t,
            t,
            t,
          ],
          [
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            t,
            d.handleCertificateVerify,
            t,
            t,
            t,
            t,
            t,
          ],
          [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
          [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, w],
          [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
          [t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t, t],
        ]),
          (d.generateKeys = function (e, t) {
            var r = o,
              n = t.client_random + t.server_random,
              i =
                (e.session.resuming ||
                  ((t.master_secret = r(
                    t.pre_master_secret,
                    "master secret",
                    n,
                    48,
                  ).bytes()),
                  (t.pre_master_secret = null)),
                (n = t.server_random + t.client_random),
                2 * t.mac_key_length + 2 * t.enc_key_length),
              e =
                e.version.major === d.Versions.TLS_1_0.major &&
                e.version.minor === d.Versions.TLS_1_0.minor,
              r =
                (e && (i += 2 * t.fixed_iv_length),
                r(t.master_secret, "key expansion", n, i)),
              n = {
                client_write_MAC_key: r.getBytes(t.mac_key_length),
                server_write_MAC_key: r.getBytes(t.mac_key_length),
                client_write_key: r.getBytes(t.enc_key_length),
                server_write_key: r.getBytes(t.enc_key_length),
              };
            return (
              e &&
                ((n.client_write_IV = r.getBytes(t.fixed_iv_length)),
                (n.server_write_IV = r.getBytes(t.fixed_iv_length))),
              n
            );
          }),
          (d.createConnectionState = function (e) {
            function t() {
              var e = {
                sequenceNumber: [0, 0],
                macKey: null,
                macLength: 0,
                macFunction: null,
                cipherState: null,
                cipherFunction: function (e) {
                  return !0;
                },
                compressionState: null,
                compressFunction: function (e) {
                  return !0;
                },
                updateSequenceNumber: function () {
                  4294967295 === e.sequenceNumber[1]
                    ? ((e.sequenceNumber[1] = 0), ++e.sequenceNumber[0])
                    : ++e.sequenceNumber[1];
                },
              };
              return e;
            }
            var r = e.entity === d.ConnectionEnd.client,
              n = { read: t(), write: t() };
            if (
              ((n.read.update = function (e, t) {
                return (
                  n.read.cipherFunction(t, n.read)
                    ? n.read.compressFunction(e, t, n.read) ||
                      e.error(e, {
                        message: "Could not decompress record.",
                        send: !0,
                        alert: {
                          level: d.Alert.Level.fatal,
                          description:
                            d.Alert.Description.decompression_failure,
                        },
                      })
                    : e.error(e, {
                        message: "Could not decrypt record or bad MAC.",
                        send: !0,
                        alert: {
                          level: d.Alert.Level.fatal,
                          description: d.Alert.Description.bad_record_mac,
                        },
                      }),
                  !e.fail
                );
              }),
              (n.write.update = function (e, t) {
                return (
                  n.write.compressFunction(e, t, n.write)
                    ? n.write.cipherFunction(t, n.write) ||
                      e.error(e, {
                        message: "Could not encrypt record.",
                        send: !1,
                        alert: {
                          level: d.Alert.Level.fatal,
                          description: d.Alert.Description.internal_error,
                        },
                      })
                    : e.error(e, {
                        message: "Could not compress record.",
                        send: !1,
                        alert: {
                          level: d.Alert.Level.fatal,
                          description: d.Alert.Description.internal_error,
                        },
                      }),
                  !e.fail
                );
              }),
              e.session)
            ) {
              var i = e.session.sp;
              switch (
                (e.session.cipherSuite.initSecurityParameters(i),
                (i.keys = d.generateKeys(e, i)),
                (n.read.macKey = r
                  ? i.keys.server_write_MAC_key
                  : i.keys.client_write_MAC_key),
                (n.write.macKey = r
                  ? i.keys.client_write_MAC_key
                  : i.keys.server_write_MAC_key),
                e.session.cipherSuite.initConnectionState(n, e, i),
                i.compression_algorithm)
              ) {
                case d.CompressionMethod.none:
                  break;
                case d.CompressionMethod.deflate:
                  ((n.read.compressFunction = s),
                    (n.write.compressFunction = a));
                  break;
                default:
                  throw new Error("Unsupported compression algorithm.");
              }
            }
            return n;
          }),
          (d.createRandom = function () {
            var e = new Date(),
              e = +e + 6e4 * e.getTimezoneOffset(),
              t = y.util.createBuffer();
            return (t.putInt32(e), t.putBytes(y.random.getBytes(28)), t);
          }),
          (d.createRecord = function (e, t) {
            return t.data
              ? {
                  type: t.type,
                  version: { major: e.version.major, minor: e.version.minor },
                  length: t.data.length(),
                  fragment: t.data,
                }
              : null;
          }),
          (d.createAlert = function (e, t) {
            var r = y.util.createBuffer();
            return (
              r.putByte(t.level),
              r.putByte(t.description),
              d.createRecord(e, { type: d.ContentType.alert, data: r })
            );
          }),
          (d.createClientHello = function (e) {
            e.session.clientHelloVersion = {
              major: e.version.major,
              minor: e.version.minor,
            };
            for (
              var t = y.util.createBuffer(), r = 0;
              r < e.cipherSuites.length;
              ++r
            ) {
              var n = e.cipherSuites[r];
              (t.putByte(n.id[0]), t.putByte(n.id[1]));
            }
            var i = t.length(),
              a = y.util.createBuffer(),
              s = (a.putByte(d.CompressionMethod.none), a.length()),
              o = y.util.createBuffer(),
              c =
                (e.virtualHost &&
                  ((l = y.util.createBuffer()).putByte(0),
                  l.putByte(0),
                  (c = y.util.createBuffer()).putByte(0),
                  p(c, 2, y.util.createBuffer(e.virtualHost)),
                  (u = y.util.createBuffer()),
                  p(u, 2, c),
                  p(l, 2, u),
                  o.putBuffer(l)),
                o.length()),
              u = (0 < c && (c += 2), e.session.id),
              l = u.length + 1 + 2 + 4 + 28 + 2 + i + 1 + s + c,
              i = y.util.createBuffer();
            return (
              i.putByte(d.HandshakeType.client_hello),
              i.putInt24(l),
              i.putByte(e.version.major),
              i.putByte(e.version.minor),
              i.putBytes(e.session.sp.client_random),
              p(i, 1, y.util.createBuffer(u)),
              p(i, 2, t),
              p(i, 1, a),
              0 < c && p(i, 2, o),
              i
            );
          }),
          (d.createServerHello = function (e) {
            var t = e.session.id,
              r = t.length + 1 + 2 + 4 + 28 + 2 + 1,
              n = y.util.createBuffer();
            return (
              n.putByte(d.HandshakeType.server_hello),
              n.putInt24(r),
              n.putByte(e.version.major),
              n.putByte(e.version.minor),
              n.putBytes(e.session.sp.server_random),
              p(n, 1, y.util.createBuffer(t)),
              n.putByte(e.session.cipherSuite.id[0]),
              n.putByte(e.session.cipherSuite.id[1]),
              n.putByte(e.session.compressionMethod),
              n
            );
          }),
          (d.createCertificate = function (t) {
            var e = t.entity === d.ConnectionEnd.client,
              r = null,
              n =
                (t.getCertificate &&
                  ((l = e
                    ? t.session.certificateRequest
                    : t.session.extensions.server_name.serverNameList),
                  (r = t.getCertificate(t, l))),
                y.util.createBuffer());
            if (null !== r)
              try {
                y.util.isArray(r) || (r = [r]);
                for (var i = null, a = 0; a < r.length; ++a) {
                  var s,
                    o = y.pem.decode(r[a])[0];
                  if (
                    "CERTIFICATE" !== o.type &&
                    "X509 CERTIFICATE" !== o.type &&
                    "TRUSTED CERTIFICATE" !== o.type
                  )
                    throw (
                      ((s = new Error(
                        'Could not convert certificate from PEM; PEM header type is not "CERTIFICATE", "X509 CERTIFICATE", or "TRUSTED CERTIFICATE".',
                      )).headerType = o.type),
                      s
                    );
                  if (o.procType && "ENCRYPTED" === o.procType.type)
                    throw new Error(
                      "Could not convert certificate from PEM; PEM is encrypted.",
                    );
                  var c = y.util.createBuffer(o.body),
                    u =
                      (null === i && (i = y.asn1.fromDer(c.bytes(), !1)),
                      y.util.createBuffer());
                  (p(u, 3, c), n.putBuffer(u));
                }
                ((r = y.pki.certificateFromAsn1(i)),
                  e
                    ? (t.session.clientCertificate = r)
                    : (t.session.serverCertificate = r));
              } catch (e) {
                return t.error(t, {
                  message: "Could not send certificate list.",
                  cause: e,
                  send: !0,
                  alert: {
                    level: d.Alert.Level.fatal,
                    description: d.Alert.Description.bad_certificate,
                  },
                });
              }
            var l = 3 + n.length(),
              e = y.util.createBuffer();
            return (
              e.putByte(d.HandshakeType.certificate),
              e.putInt24(l),
              p(e, 3, n),
              e
            );
          }),
          (d.createClientKeyExchange = function (e) {
            var t = y.util.createBuffer(),
              r =
                (t.putByte(e.session.clientHelloVersion.major),
                t.putByte(e.session.clientHelloVersion.minor),
                t.putBytes(y.random.getBytes(46)),
                e.session.sp);
            r.pre_master_secret = t.getBytes();
            ((e =
              (t = e.session.serverCertificate.publicKey.encrypt(
                r.pre_master_secret,
              )).length + 2),
              (r = y.util.createBuffer()));
            return (
              r.putByte(d.HandshakeType.client_key_exchange),
              r.putInt24(e),
              r.putInt16(t.length),
              r.putBytes(t),
              r
            );
          }),
          (d.createServerKeyExchange = function (e) {
            var t = y.util.createBuffer();
            return t;
          }),
          (d.getClientSignature = function (e, t) {
            var r = y.util.createBuffer();
            (r.putBuffer(e.session.md5.digest()),
              r.putBuffer(e.session.sha1.digest()),
              (r = r.getBytes()),
              (e.getSignature =
                e.getSignature ||
                function (t, e, r) {
                  var n = null;
                  if (t.getPrivateKey)
                    try {
                      ((n = t.getPrivateKey(t, t.session.clientCertificate)),
                        (n = y.pki.privateKeyFromPem(n)));
                    } catch (e) {
                      t.error(t, {
                        message: "Could not get private key.",
                        cause: e,
                        send: !0,
                        alert: {
                          level: d.Alert.Level.fatal,
                          description: d.Alert.Description.internal_error,
                        },
                      });
                    }
                  (null === n
                    ? t.error(t, {
                        message: "No private key set.",
                        send: !0,
                        alert: {
                          level: d.Alert.Level.fatal,
                          description: d.Alert.Description.internal_error,
                        },
                      })
                    : (e = n.sign(e, null)),
                    r(t, e));
                }),
              e.getSignature(e, r, t));
          }),
          (d.createCertificateVerify = function (e, t) {
            var r = t.length + 2,
              n = y.util.createBuffer();
            return (
              n.putByte(d.HandshakeType.certificate_verify),
              n.putInt24(r),
              n.putInt16(t.length),
              n.putBytes(t),
              n
            );
          }),
          (d.createCertificateRequest = function (e) {
            var t,
              r = y.util.createBuffer(),
              n = (r.putByte(1), y.util.createBuffer());
            for (t in e.caStore.certs) {
              var i = e.caStore.certs[t],
                i = y.pki.distinguishedNameToAsn1(i.subject);
              n.putBuffer(y.asn1.toDer(i));
            }
            var a = 1 + r.length() + 2 + n.length(),
              s = y.util.createBuffer();
            return (
              s.putByte(d.HandshakeType.certificate_request),
              s.putInt24(a),
              p(s, 1, r),
              p(s, 2, n),
              s
            );
          }),
          (d.createServerHelloDone = function (e) {
            var t = y.util.createBuffer();
            return (
              t.putByte(d.HandshakeType.server_hello_done),
              t.putInt24(0),
              t
            );
          }),
          (d.createChangeCipherSpec = function () {
            var e = y.util.createBuffer();
            return (e.putByte(1), e);
          }),
          (d.createFinished = function (e) {
            ((r = y.util.createBuffer()).putBuffer(e.session.md5.digest()),
              r.putBuffer(e.session.sha1.digest()));
            var t = e.entity === d.ConnectionEnd.client,
              e = e.session.sp,
              r = o(
                e.master_secret,
                t ? "client finished" : "server finished",
                r.getBytes(),
                12,
              ),
              e = y.util.createBuffer();
            return (
              e.putByte(d.HandshakeType.finished),
              e.putInt24(r.length()),
              e.putBuffer(r),
              e
            );
          }),
          (d.createHeartbeat = function (e, t, r) {
            void 0 === r && (r = t.length);
            var n = y.util.createBuffer(),
              e = (n.putByte(e), n.putInt16(r), n.putBytes(t), n.length()),
              t = Math.max(16, e - r - 3);
            return (n.putBytes(y.random.getBytes(t)), n);
          }),
          (d.queue = function (e, t) {
            if (t) {
              var r;
              if (
                (t.type === d.ContentType.handshake &&
                  ((r = t.fragment.bytes()),
                  e.session.md5.update(r),
                  e.session.sha1.update(r),
                  (r = null)),
                t.fragment.length() <= d.MaxFragment)
              )
                n = [t];
              else {
                for (
                  var n = [], i = t.fragment.bytes();
                  i.length > d.MaxFragment;
                )
                  (n.push(
                    d.createRecord(e, {
                      type: t.type,
                      data: y.util.createBuffer(i.slice(0, d.MaxFragment)),
                    }),
                  ),
                    (i = i.slice(d.MaxFragment)));
                0 < i.length &&
                  n.push(
                    d.createRecord(e, {
                      type: t.type,
                      data: y.util.createBuffer(i),
                    }),
                  );
              }
              for (var a = 0; a < n.length && !e.fail; ++a) {
                var s = n[a];
                e.state.current.write.update(e, s) && e.records.push(s);
              }
            }
          }),
          (d.flush = function (e) {
            for (var t = 0; t < e.records.length; ++t) {
              var r = e.records[t];
              (e.tlsData.putByte(r.type),
                e.tlsData.putByte(r.version.major),
                e.tlsData.putByte(r.version.minor),
                e.tlsData.putInt16(r.fragment.length()),
                e.tlsData.putBuffer(e.records[t].fragment));
            }
            return ((e.records = []), e.tlsDataReady(e));
          }));
        for (e in ((d.verifyCertificateChain = function (n, t) {
          try {
            y.pki.verifyCertificateChain(n.caStore, t, function (e, t, r) {
              i(e);
              t = n.verify(n, e, t, r);
              if (!0 !== t) {
                if ("object" == typeof t && !y.util.isArray(t))
                  throw (
                    ((r = new Error(
                      "The application rejected the certificate.",
                    )).send = !0),
                    (r.alert = {
                      level: d.Alert.Level.fatal,
                      description: d.Alert.Description.bad_certificate,
                    }),
                    t.message && (r.message = t.message),
                    t.alert && (r.alert.description = t.alert),
                    r
                  );
                t !== e &&
                  (t = (function (e) {
                    switch (e) {
                      case !0:
                        return !0;
                      case d.Alert.Description.bad_certificate:
                        return y.pki.certificateError.bad_certificate;
                      case d.Alert.Description.unsupported_certificate:
                        return y.pki.certificateError.unsupported_certificate;
                      case d.Alert.Description.certificate_revoked:
                        return y.pki.certificateError.certificate_revoked;
                      case d.Alert.Description.certificate_expired:
                        return y.pki.certificateError.certificate_expired;
                      case d.Alert.Description.certificate_unknown:
                        return y.pki.certificateError.certificate_unknown;
                      case d.Alert.Description.unknown_ca:
                        return y.pki.certificateError.unknown_ca;
                      default:
                        return y.pki.certificateError.bad_certificate;
                    }
                  })(t));
              }
              return t;
            });
          } catch (e) {
            t = e;
            ("send" in
              (t =
                "object" == typeof t && !y.util.isArray(t)
                  ? t
                  : {
                      send: !0,
                      alert: { level: d.Alert.Level.fatal, description: i(e) },
                    }) || (t.send = !0),
              "alert" in t ||
                (t.alert = {
                  level: d.Alert.Level.fatal,
                  description: i(t.error),
                }),
              n.error(n, t));
          }
          return !n.fail;
        }),
        (d.createSessionCache = function (e, t) {
          var i = null;
          if (e && e.getSession && e.setSession && e.order) i = e;
          else {
            for (var r in (((i = {}).cache = e || {}),
            (i.capacity = Math.max(t || 100, 1)),
            (i.order = []),
            e))
              i.order.length <= t ? i.order.push(r) : delete e[r];
            ((i.getSession = function (e) {
              var t = null,
                r = null;
              if (
                (e
                  ? (r = y.util.bytesToHex(e))
                  : 0 < i.order.length && (r = i.order[0]),
                null !== r && r in i.cache)
              )
                for (var n in ((t = i.cache[r]), delete i.cache[r], i.order))
                  if (i.order[n] === r) {
                    i.order.splice(n, 1);
                    break;
                  }
              return t;
            }),
              (i.setSession = function (e, t) {
                i.order.length === i.capacity &&
                  ((r = i.order.shift()), delete i.cache[r]);
                var r = y.util.bytesToHex(e);
                (i.order.push(r), (i.cache[r] = t));
              }));
          }
          return i;
        }),
        (d.createConnection = function (n) {
          var e = null,
            e = n.caStore
              ? y.util.isArray(n.caStore)
                ? y.pki.createCaStore(n.caStore)
                : n.caStore
              : y.pki.createCaStore(),
            t = n.cipherSuites || null;
          if (null === t)
            for (var r in ((t = []), d.CipherSuites)) t.push(d.CipherSuites[r]);
          var i = n.server ? d.ConnectionEnd.server : d.ConnectionEnd.client,
            a = n.sessionCache ? d.createSessionCache(n.sessionCache) : null,
            c = {
              version: { major: d.Version.major, minor: d.Version.minor },
              entity: i,
              sessionId: n.sessionId,
              caStore: e,
              sessionCache: a,
              cipherSuites: t,
              connected: n.connected,
              virtualHost: n.virtualHost || null,
              verifyClient: n.verifyClient || !1,
              verify:
                n.verify ||
                function (e, t, r, n) {
                  return t;
                },
              getCertificate: n.getCertificate || null,
              getPrivateKey: n.getPrivateKey || null,
              getSignature: n.getSignature || null,
              input: y.util.createBuffer(),
              tlsData: y.util.createBuffer(),
              data: y.util.createBuffer(),
              tlsDataReady: n.tlsDataReady,
              dataReady: n.dataReady,
              heartbeatReceived: n.heartbeatReceived,
              closed: n.closed,
              error: function (e, t) {
                ((t.origin =
                  t.origin ||
                  (e.entity === d.ConnectionEnd.client ? "client" : "server")),
                  t.send &&
                    (d.queue(e, d.createAlert(e, t.alert)), d.flush(e)));
                var r = !1 !== t.fatal;
                (r && (e.fail = !0), n.error(e, t), r && e.close(!1));
              },
              deflate: n.deflate || null,
              inflate: n.inflate || null,
              reset: function (e) {
                ((c.version = {
                  major: d.Version.major,
                  minor: d.Version.minor,
                }),
                  (c.record = null),
                  (c.session = null),
                  (c.peerCertificate = null),
                  (c.state = { pending: null, current: null }),
                  (c.expect = (d.ConnectionEnd.client, 0)),
                  (c.fragmented = null),
                  (c.records = []),
                  (c.open = !1),
                  (c.handshakes = 0),
                  (c.handshaking = !1),
                  (c.isConnected = !1),
                  (c.fail = !e && void 0 !== e),
                  c.input.clear(),
                  c.tlsData.clear(),
                  c.data.clear(),
                  (c.state.current = d.createConnectionState(c)));
              },
            };
          c.reset();
          return (
            (c.handshake = function (e) {
              var t;
              c.entity !== d.ConnectionEnd.client
                ? c.error(c, {
                    message: "Cannot initiate handshake as a server.",
                    fatal: !1,
                  })
                : c.handshaking
                  ? c.error(c, {
                      message: "Handshake already in progress.",
                      fatal: !1,
                    })
                  : (c.fail && !c.open && 0 === c.handshakes && (c.fail = !1),
                    (c.handshaking = !0),
                    (t = null),
                    0 ===
                      (e =
                        0 < (e = e || "").length &&
                        null ===
                          (t = c.sessionCache
                            ? c.sessionCache.getSession(e)
                            : t)
                          ? ""
                          : e).length &&
                      c.sessionCache &&
                      null !== (t = c.sessionCache.getSession()) &&
                      (e = t.id),
                    (c.session = {
                      id: e,
                      version: null,
                      cipherSuite: null,
                      compressionMethod: null,
                      serverCertificate: null,
                      certificateRequest: null,
                      clientCertificate: null,
                      sp: {},
                      md5: y.md.md5.create(),
                      sha1: y.md.sha1.create(),
                    }),
                    t && ((c.version = t.version), (c.session.sp = t.sp)),
                    (c.session.sp.client_random = d.createRandom().getBytes()),
                    (c.open = !0),
                    d.queue(
                      c,
                      d.createRecord(c, {
                        type: d.ContentType.handshake,
                        data: d.createClientHello(c),
                      }),
                    ),
                    d.flush(c));
            }),
            (c.process = function (e) {
              var t,
                r,
                n,
                i,
                a,
                s,
                o = 0;
              return (
                e && c.input.putBytes(e),
                c.fail ||
                  (null !== c.record &&
                    c.record.ready &&
                    c.record.fragment.isEmpty() &&
                    (c.record = null),
                  null === c.record &&
                    ((e = 0),
                    (a = (i = c).input),
                    (s = a.length()) < 5
                      ? (e = 5 - s)
                      : ((i.record = {
                          type: a.getByte(),
                          version: { major: a.getByte(), minor: a.getByte() },
                          length: a.getInt16(),
                          fragment: y.util.createBuffer(),
                          ready: !1,
                        }),
                        (s =
                          (s = i.record.version.major === i.version.major) &&
                          i.session &&
                          i.session.version
                            ? i.record.version.minor === i.version.minor
                            : s) ||
                          i.error(i, {
                            message: "Incompatible TLS version.",
                            send: !0,
                            alert: {
                              level: d.Alert.Level.fatal,
                              description: d.Alert.Description.protocol_version,
                            },
                          })),
                    (o = e)),
                  c.fail ||
                    null === c.record ||
                    c.record.ready ||
                    ((a = 0),
                    (i = (s = c).input),
                    (e = i.length()) < s.record.length
                      ? (a = s.record.length - e)
                      : (s.record.fragment.putBytes(
                          i.getBytes(s.record.length),
                        ),
                        i.compact(),
                        s.state.current.read.update(s, s.record) &&
                          (null !== s.fragmented &&
                            (s.fragmented.type === s.record.type
                              ? (s.fragmented.fragment.putBuffer(
                                  s.record.fragment,
                                ),
                                (s.record = s.fragmented))
                              : s.error(s, {
                                  message: "Invalid fragmented record.",
                                  send: !0,
                                  alert: {
                                    level: d.Alert.Level.fatal,
                                    description:
                                      d.Alert.Description.unexpected_message,
                                  },
                                })),
                          (s.record.ready = !0))),
                    (o = a)),
                  !c.fail &&
                    null !== c.record &&
                    c.record.ready &&
                    ((r =
                      (t = (e = c).record).type -
                      d.ContentType.change_cipher_spec),
                    (n = R[e.entity][e.expect]),
                    r in n ? n[r](e, t) : d.handleUnexpected(e, t))),
                o
              );
            }),
            (c.prepare = function (e) {
              return (
                d.queue(
                  c,
                  d.createRecord(c, {
                    type: d.ContentType.application_data,
                    data: y.util.createBuffer(e),
                  }),
                ),
                d.flush(c)
              );
            }),
            (c.prepareHeartbeatRequest = function (e, t) {
              return (
                e instanceof y.util.ByteBuffer && (e = e.bytes()),
                void 0 === t && (t = e.length),
                (c.expectedHeartbeatPayload = e),
                d.queue(
                  c,
                  d.createRecord(c, {
                    type: d.ContentType.heartbeat,
                    data: d.createHeartbeat(
                      d.HeartbeatMessageType.heartbeat_request,
                      e,
                      t,
                    ),
                  }),
                ),
                d.flush(c)
              );
            }),
            (c.close = function (e) {
              var t;
              (!c.fail &&
                c.sessionCache &&
                c.session &&
                (((t = {
                  id: c.session.id,
                  version: c.session.version,
                  sp: c.session.sp,
                }).sp.keys = null),
                c.sessionCache.setSession(t.id, t)),
                c.open &&
                  ((c.open = !1),
                  c.input.clear(),
                  (c.isConnected || c.handshaking) &&
                    ((c.isConnected = c.handshaking = !1),
                    d.queue(
                      c,
                      d.createAlert(c, {
                        level: d.Alert.Level.warning,
                        description: d.Alert.Description.close_notify,
                      }),
                    ),
                    d.flush(c)),
                  c.closed(c)),
                c.reset(e));
            }),
            c
          );
        }),
        (y.tls = y.tls || {}),
        d))
          "function" != typeof d[e] && (y.tls[e] = d[e]);
        ((y.tls.prf_tls1 = o),
          (y.tls.hmac_sha1 = function (e, t, r) {
            var n = y.hmac.create(),
              e = (n.start("SHA1", e), y.util.createBuffer());
            return (
              e.putInt32(t[0]),
              e.putInt32(t[1]),
              e.putByte(r.type),
              e.putByte(r.version.major),
              e.putByte(r.version.minor),
              e.putInt16(r.length),
              e.putBytes(r.fragment.bytes()),
              n.update(e.getBytes()),
              n.digest().getBytes()
            );
          }),
          (y.tls.createSessionCache = d.createSessionCache),
          (y.tls.createConnection = d.createConnection));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/tls",
        [
          "require",
          "module",
          "./asn1",
          "./hmac",
          "./md",
          "./pem",
          "./pki",
          "./random",
          "./util",
        ],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.tls)) {
                e.defined.tls = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.tls;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(c) {
        function e(e, t, r) {
          t = t.entity === c.tls.ConnectionEnd.client;
          ((e.read.cipherState = {
            init: !1,
            cipher: c.cipher.createDecipher(
              "AES-CBC",
              t ? r.keys.server_write_key : r.keys.client_write_key,
            ),
            iv: t ? r.keys.server_write_IV : r.keys.client_write_IV,
          }),
            (e.write.cipherState = {
              init: !1,
              cipher: c.cipher.createCipher(
                "AES-CBC",
                t ? r.keys.client_write_key : r.keys.server_write_key,
              ),
              iv: t ? r.keys.client_write_IV : r.keys.server_write_IV,
            }),
            (e.read.cipherFunction = a),
            (e.write.cipherFunction = n),
            (e.read.macLength = e.write.macLength = r.mac_length),
            (e.read.macFunction = e.write.macFunction = l.hmac_sha1));
        }
        function n(e, t) {
          var r = !1,
            n = t.macFunction(t.macKey, t.sequenceNumber, e),
            t =
              (e.fragment.putBytes(n),
              t.updateSequenceNumber(),
              (n =
                e.version.minor === l.Versions.TLS_1_0.minor
                  ? t.cipherState.init
                    ? null
                    : t.cipherState.iv
                  : c.random.getBytesSync(16)),
              (t.cipherState.init = !0),
              t.cipherState.cipher);
          return (
            t.start({ iv: n }),
            e.version.minor >= l.Versions.TLS_1_1.minor && t.output.putBytes(n),
            t.update(e.fragment),
            t.finish(i) &&
              ((e.fragment = t.output),
              (e.length = e.fragment.length()),
              (r = !0)),
            r
          );
        }
        function i(e, t, r) {
          return (
            r || ((r = e - (t.length() % e)), t.fillWithByte(r - 1, r)),
            !0
          );
        }
        function u(e, t, r) {
          var n = !0;
          if (r) {
            for (
              var i = t.length(), a = t.last(), s = i - 1 - a;
              s < i - 1;
              ++s
            )
              n = n && t.at(s) == a;
            n && t.truncate(a + 1);
          }
          return n;
        }
        function a(e, t) {
          ((r =
            e.version.minor === l.Versions.TLS_1_0.minor
              ? t.cipherState.init
                ? null
                : t.cipherState.iv
              : e.fragment.getBytes(16)),
            (t.cipherState.init = !0));
          for (
            var r,
              n = t.cipherState.cipher,
              i =
                (n.start({ iv: r }),
                n.update(e.fragment),
                (r = n.finish(u)),
                t.macLength),
              a = "",
              s = 0;
            s < i;
            ++s
          )
            a += String.fromCharCode(0);
          var o = n.output.length(),
            o =
              (i <= o
                ? ((e.fragment = n.output.getBytes(o - i)),
                  (a = n.output.getBytes(i)))
                : (e.fragment = n.output.getBytes()),
              (e.fragment = c.util.createBuffer(e.fragment)),
              (e.length = e.fragment.length()),
              t.macFunction(t.macKey, t.sequenceNumber, e));
          return (t.updateSequenceNumber(), o === a && r);
        }
        var l = c.tls;
        ((l.CipherSuites.TLS_RSA_WITH_AES_128_CBC_SHA = {
          id: [0, 47],
          name: "TLS_RSA_WITH_AES_128_CBC_SHA",
          initSecurityParameters: function (e) {
            ((e.bulk_cipher_algorithm = l.BulkCipherAlgorithm.aes),
              (e.cipher_type = l.CipherType.block),
              (e.enc_key_length = 16),
              (e.block_length = 16),
              (e.fixed_iv_length = 16),
              (e.record_iv_length = 16),
              (e.mac_algorithm = l.MACAlgorithm.hmac_sha1),
              (e.mac_length = 20),
              (e.mac_key_length = 20));
          },
          initConnectionState: e,
        }),
          (l.CipherSuites.TLS_RSA_WITH_AES_256_CBC_SHA = {
            id: [0, 53],
            name: "TLS_RSA_WITH_AES_256_CBC_SHA",
            initSecurityParameters: function (e) {
              ((e.bulk_cipher_algorithm = l.BulkCipherAlgorithm.aes),
                (e.cipher_type = l.CipherType.block),
                (e.enc_key_length = 32),
                (e.block_length = 16),
                (e.fixed_iv_length = 16),
                (e.record_iv_length = 16),
                (e.mac_algorithm = l.MACAlgorithm.hmac_sha1),
                (e.mac_length = 20),
                (e.mac_key_length = 20));
            },
            initConnectionState: e,
          }));
      }
      var a = "aesCipherSuites";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/aesCipherSuites",
        ["require", "module", "./aes", "./tls"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(n) {
        ((n.debug = n.debug || {}),
          (n.debug.storage = {}),
          (n.debug.get = function (e, t) {
            var r;
            return (
              void 0 === e
                ? (r = n.debug.storage)
                : e in n.debug.storage &&
                  (r =
                    void 0 === t ? n.debug.storage[e] : n.debug.storage[e][t]),
              r
            );
          }),
          (n.debug.set = function (e, t, r) {
            (e in n.debug.storage || (n.debug.storage[e] = {}),
              (n.debug.storage[e][t] = r));
          }),
          (n.debug.clear = function (e, t) {
            void 0 === e
              ? (n.debug.storage = {})
              : e in n.debug.storage &&
                (void 0 === t
                  ? delete n.debug.storage[e]
                  : delete n.debug.storage[e][t]);
          }));
      }
      var a = "debug";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/debug", ["require", "module"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = s
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
              e.defined[a] = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e[a];
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(l) {
        function r(e, o, c, u) {
          e.generate = function (e, t) {
            for (
              var r = new l.util.ByteBuffer(),
                n = Math.ceil(t / u) + c,
                i = new l.util.ByteBuffer(),
                a = c;
              a < n;
              ++a
            ) {
              (i.putInt32(a), o.start(), o.update(e + i.getBytes()));
              var s = o.digest();
              r.putBytes(s.getBytes(u));
            }
            return (r.truncate(r.length() - t), r.getBytes());
          };
        }
        l.kem = l.kem || {};
        var o = l.jsbn.BigInteger;
        ((l.kem.rsa = {}),
          (l.kem.rsa.create = function (a, e) {
            var s = (e = e || {}).prng || l.random,
              e = {
                encrypt: function (e, t) {
                  for (
                    var r = Math.ceil(e.n.bitLength() / 8);
                    (n = new o(l.util.bytesToHex(s.getBytesSync(r)), 16).mod(
                      e.n,
                    )).equals(o.ZERO);
                  );
                  var n,
                    i = r - (n = l.util.hexToBytes(n.toString(16))).length;
                  return (
                    0 < i &&
                      (n = l.util.fillString(String.fromCharCode(0), i) + n),
                    {
                      encapsulation: e.encrypt(n, "NONE"),
                      key: a.generate(n, t),
                    }
                  );
                },
                decrypt: function (e, t, r) {
                  e = e.decrypt(t, "NONE");
                  return a.generate(e, r);
                },
              };
            return e;
          }),
          (l.kem.kdf1 = function (e, t) {
            r(this, e, 0, t || e.digestLength);
          }),
          (l.kem.kdf2 = function (e, t) {
            r(this, e, 1, t || e.digestLength);
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/kem",
        ["require", "module", "./util", "./random", "./jsbn"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.kem)) {
                e.defined.kem = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.kem;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(i) {
        ((i.log = i.log || {}),
          (i.log.levels = [
            "none",
            "error",
            "warning",
            "info",
            "debug",
            "verbose",
            "max",
          ]));
        var a = {},
          s = [],
          e = null;
        ((i.log.LEVEL_LOCKED = 2),
          (i.log.NO_LEVEL_CHECK = 4),
          (i.log.INTERPOLATE = 8));
        for (var t = 0; t < i.log.levels.length; ++t) {
          var r = i.log.levels[t];
          a[r] = { index: t, name: r.toUpperCase() };
        }
        ((i.log.logMessage = function (e) {
          for (var t = a[e.level].index, r = 0; r < s.length; ++r) {
            var n = s[r];
            n.flags & i.log.NO_LEVEL_CHECK
              ? n.f(e)
              : t <= a[n.level].index && n.f(n, e);
          }
        }),
          (i.log.prepareStandard = function (e) {
            "standard" in e ||
              (e.standard =
                a[e.level].name + " [" + e.category + "] " + e.message);
          }),
          (i.log.prepareFull = function (e) {
            var t;
            "full" in e ||
              ((t = (t = [e.message]).concat([])),
              (e.full = i.util.format.apply(this, t)));
          }),
          (i.log.prepareStandardFull = function (e) {
            "standardFull" in e ||
              (i.log.prepareStandard(e), (e.standardFull = e.standard));
          }));
        for (
          var o, n, c = ["error", "warning", "info", "debug", "verbose"], t = 0;
          t < c.length;
          ++t
        )
          !(function (n) {
            i.log[n] = function (e, t) {
              var r = Array.prototype.slice.call(arguments).slice(2),
                r = {
                  timestamp: new Date(),
                  level: n,
                  category: e,
                  message: t,
                  arguments: r,
                };
              i.log.logMessage(r);
            };
          })(c[t]);
        ((i.log.makeLogger = function (e) {
          e = { flags: 0, f: e };
          return (i.log.setLevel(e, "none"), e);
        }),
          (i.log.setLevel = function (e, t) {
            var r = !1;
            if (e && !(e.flags & i.log.LEVEL_LOCKED))
              for (var n = 0; n < i.log.levels.length; ++n)
                if (t == i.log.levels[n]) {
                  ((e.level = t), (r = !0));
                  break;
                }
            return r;
          }),
          (i.log.lock = function (e, t) {
            void 0 === t || t
              ? (e.flags |= i.log.LEVEL_LOCKED)
              : (e.flags &= ~i.log.LEVEL_LOCKED);
          }),
          (i.log.addLogger = function (e) {
            s.push(e);
          }),
          "undefined" != typeof console && "log" in console
            ? ((n =
                console.error && console.warn && console.info && console.debug
                  ? ((o = {
                      error: console.error,
                      warning: console.warn,
                      info: console.info,
                      debug: console.debug,
                      verbose: console.debug,
                    }),
                    i.log.makeLogger(function (e, t) {
                      i.log.prepareStandard(t);
                      var r = o[t.level],
                        n = (n = [t.standard]).concat(t.arguments.slice());
                      r.apply(console, n);
                    }))
                  : i.log.makeLogger(function (e, t) {
                      (i.log.prepareStandardFull(t),
                        console.log(t.standardFull));
                    })),
              i.log.setLevel(n, "debug"),
              i.log.addLogger(n),
              (e = n))
            : (console = { log: function () {} }),
          null !== e &&
            ("console.level" in (n = i.util.getQueryVariables()) &&
              i.log.setLevel(e, n["console.level"].slice(-1)[0]),
            "console.lock" in n) &&
            "true" == n["console.lock"].slice(-1)[0] &&
            i.log.lock(e),
          (i.log.consoleLogger = e));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })("js/log", ["require", "module", "./util"], function () {
        !function (n, e) {
          e.exports = function (e) {
            var t = a
              .map(function (e) {
                return n(e);
              })
              .concat(i);
            if ((((e = e || {}).defined = e.defined || {}), !e.defined.log)) {
              e.defined.log = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
            }
            return e.log;
          };
        }.apply(null, Array.prototype.slice.call(arguments, 0));
      });
    })(),
    (function () {
      function i(c) {
        function t(e) {
          for (var t = [], r = 0; r < e.length; r++)
            t.push(
              (function (e) {
                var t = {},
                  r = [];
                if (s.validate(e, a.asn1.recipientInfoValidator, t, r))
                  return {
                    version: t.version.charCodeAt(0),
                    issuer: c.pki.RDNAttributesAsArray(t.issuer),
                    serialNumber: c.util.createBuffer(t.serial).toHex(),
                    encryptedContent: {
                      algorithm: s.derToOid(t.encAlgorithm),
                      parameter: t.encParameter.value,
                      content: t.encKey,
                    },
                  };
                throw (
                  ((e = new Error(
                    "Cannot read PKCS#7 message. ASN.1 object is not an PKCS#7 EnvelopedData.",
                  )).errors = r),
                  e
                );
              })(e[r]),
            );
          return t;
        }
        function r(e) {
          for (var t, r = [], n = 0; n < e.length; n++)
            r.push(
              ((t = e[n]),
              s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                s.create(
                  s.Class.UNIVERSAL,
                  s.Type.INTEGER,
                  !1,
                  s.integerToDer(t.version).getBytes(),
                ),
                s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                  c.pki.distinguishedNameToAsn1({ attributes: t.issuer }),
                  s.create(
                    s.Class.UNIVERSAL,
                    s.Type.INTEGER,
                    !1,
                    c.util.hexToBytes(t.serialNumber),
                  ),
                ]),
                s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                  s.create(
                    s.Class.UNIVERSAL,
                    s.Type.OID,
                    !1,
                    s.oidToDer(t.encryptedContent.algorithm).getBytes(),
                  ),
                  s.create(s.Class.UNIVERSAL, s.Type.NULL, !1, ""),
                ]),
                s.create(
                  s.Class.UNIVERSAL,
                  s.Type.OCTETSTRING,
                  !1,
                  t.encryptedContent.content,
                ),
              ])),
            );
          return r;
        }
        function i(e, t, r) {
          var n = {};
          if (!s.validate(t, r, n, []))
            throw ((t = new Error(
              "Cannot read PKCS#7 message. ASN.1 object is not a supported PKCS#7 message.",
            )).errors = t);
          if (s.derToOid(n.contentType) !== c.pki.oids.data)
            throw new Error(
              "Unsupported PKCS#7 message. Only wrapped ContentType Data supported.",
            );
          if (n.encryptedContent) {
            var i = "";
            if (c.util.isArray(n.encryptedContent))
              for (var a = 0; a < n.encryptedContent.length; ++a) {
                if (n.encryptedContent[a].type !== s.Type.OCTETSTRING)
                  throw new Error(
                    "Malformed PKCS#7 message, expecting encrypted content constructed of only OCTET STRING objects.",
                  );
                i += n.encryptedContent[a].value;
              }
            else i = n.encryptedContent;
            e.encryptedContent = {
              algorithm: s.derToOid(n.encAlgorithm),
              parameter: c.util.createBuffer(n.encParameter.value),
              content: c.util.createBuffer(i),
            };
          }
          if (n.content) {
            i = "";
            if (c.util.isArray(n.content))
              for (a = 0; a < n.content.length; ++a) {
                if (n.content[a].type !== s.Type.OCTETSTRING)
                  throw new Error(
                    "Malformed PKCS#7 message, expecting content constructed of only OCTET STRING objects.",
                  );
                i += n.content[a].value;
              }
            else i = n.content;
            e.content = c.util.createBuffer(i);
          }
          return ((e.version = n.version.charCodeAt(0)), (e.rawCapture = n));
        }
        function n(e) {
          if (void 0 === e.encryptedContent.key)
            throw new Error("Symmetric key not available.");
          if (void 0 === e.content) {
            var t;
            switch (e.encryptedContent.algorithm) {
              case c.pki.oids["aes128-CBC"]:
              case c.pki.oids["aes192-CBC"]:
              case c.pki.oids["aes256-CBC"]:
                t = c.aes.createDecryptionCipher(e.encryptedContent.key);
                break;
              case c.pki.oids.desCBC:
              case c.pki.oids["des-EDE3-CBC"]:
                t = c.des.createDecryptionCipher(e.encryptedContent.key);
                break;
              default:
                throw new Error(
                  "Unsupported symmetric cipher, OID " +
                    e.encryptedContent.algorithm,
                );
            }
            if (
              (t.start(e.encryptedContent.parameter),
              t.update(e.encryptedContent.content),
              !t.finish())
            )
              throw new Error("Symmetric decryption failed.");
            e.content = t.output;
          }
        }
        var s = c.asn1,
          a = (c.pkcs7 = c.pkcs7 || {});
        ((a.messageFromPem = function (e) {
          e = c.pem.decode(e)[0];
          if ("PKCS7" !== e.type)
            throw (
              ((t = new Error(
                'Could not convert PKCS#7 message from PEM; PEM header type is not "PKCS#7".',
              )).headerType = e.type),
              t
            );
          if (e.procType && "ENCRYPTED" === e.procType.type)
            throw new Error(
              "Could not convert PKCS#7 message from PEM; PEM is encrypted.",
            );
          var t = s.fromDer(e.body);
          return a.messageFromAsn1(t);
        }),
          (a.messageToPem = function (e, t) {
            e = { type: "PKCS7", body: s.toDer(e.toAsn1()).getBytes() };
            return c.pem.encode(e, { maxline: t });
          }),
          (a.messageFromAsn1 = function (e) {
            var t = {},
              r = [];
            if (!s.validate(e, a.asn1.contentInfoValidator, t, r))
              throw (
                ((e = new Error(
                  "Cannot read PKCS#7 message. ASN.1 object is not an PKCS#7 ContentInfo.",
                )).errors = r),
                e
              );
            var n,
              i = s.derToOid(t.contentType);
            switch (i) {
              case c.pki.oids.envelopedData:
                n = a.createEnvelopedData();
                break;
              case c.pki.oids.encryptedData:
                n = a.createEncryptedData();
                break;
              case c.pki.oids.signedData:
                n = a.createSignedData();
                break;
              default:
                throw new Error(
                  "Cannot read PKCS#7 message. ContentType with OID " +
                    i +
                    " is not (yet) supported.",
                );
            }
            return (n.fromAsn1(t.content.value[0]), n);
          }));
        ((a.createSignedData = function () {
          var n = null;
          return (n = {
            type: c.pki.oids.signedData,
            version: 1,
            certificates: [],
            crls: [],
            digestAlgorithmIdentifiers: [],
            contentInfo: null,
            signerInfos: [],
            fromAsn1: function (e) {
              (i(n, e, a.asn1.signedDataValidator),
                (n.certificates = []),
                (n.crls = []),
                (n.digestAlgorithmIdentifiers = []),
                (n.contentInfo = null),
                (n.signerInfos = []));
              for (
                var t = n.rawCapture.certificates.value, r = 0;
                r < t.length;
                ++r
              )
                n.certificates.push(c.pki.certificateFromAsn1(t[r]));
            },
            toAsn1: function () {
              if ("content" in n)
                throw new Error("Signing PKCS#7 content not yet implemented.");
              n.contentInfo || n.sign();
              for (var e = [], t = 0; t < n.certificates.length; ++t)
                e.push(c.pki.certificateToAsn1(n.certificates[0]));
              return s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                s.create(
                  s.Class.UNIVERSAL,
                  s.Type.OID,
                  !1,
                  s.oidToDer(n.type).getBytes(),
                ),
                s.create(s.Class.CONTEXT_SPECIFIC, 0, !0, [
                  s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                    s.create(
                      s.Class.UNIVERSAL,
                      s.Type.INTEGER,
                      !1,
                      s.integerToDer(n.version).getBytes(),
                    ),
                    s.create(
                      s.Class.UNIVERSAL,
                      s.Type.SET,
                      !0,
                      n.digestAlgorithmIdentifiers,
                    ),
                    n.contentInfo,
                    s.create(s.Class.CONTEXT_SPECIFIC, 0, !0, e),
                    s.create(s.Class.CONTEXT_SPECIFIC, 1, !0, []),
                    s.create(s.Class.UNIVERSAL, s.Type.SET, !0, n.signerInfos),
                  ]),
                ]),
              ]);
            },
            sign: function (e) {
              if ("content" in n)
                throw new Error("PKCS#7 signing not yet implemented.");
              "object" != typeof n.content &&
                ((n.contentInfo = s.create(
                  s.Class.UNIVERSAL,
                  s.Type.SEQUENCE,
                  !0,
                  [
                    s.create(
                      s.Class.UNIVERSAL,
                      s.Type.OID,
                      !1,
                      s.oidToDer(c.pki.oids.data).getBytes(),
                    ),
                  ],
                )),
                "content" in n) &&
                n.contentInfo.value.push(
                  s.create(s.Class.CONTEXT_SPECIFIC, 0, !0, [
                    s.create(
                      s.Class.UNIVERSAL,
                      s.Type.OCTETSTRING,
                      !1,
                      n.content,
                    ),
                  ]),
                );
            },
            verify: function () {
              throw new Error(
                "PKCS#7 signature verification not yet implemented.",
              );
            },
            addCertificate: function (e) {
              ("string" == typeof e && (e = c.pki.certificateFromPem(e)),
                n.certificates.push(e));
            },
            addCertificateRevokationList: function (e) {
              throw new Error("PKCS#7 CRL support not yet implemented.");
            },
          });
        }),
          (a.createEncryptedData = function () {
            var t = null;
            return (t = {
              type: c.pki.oids.encryptedData,
              version: 0,
              encryptedContent: { algorithm: c.pki.oids["aes256-CBC"] },
              fromAsn1: function (e) {
                i(t, e, a.asn1.encryptedDataValidator);
              },
              decrypt: function (e) {
                (void 0 !== e && (t.encryptedContent.key = e), n(t));
              },
            });
          }),
          (a.createEnvelopedData = function () {
            var o = null;
            return (o = {
              type: c.pki.oids.envelopedData,
              version: 0,
              recipients: [],
              encryptedContent: { algorithm: c.pki.oids["aes256-CBC"] },
              fromAsn1: function (e) {
                e = i(o, e, a.asn1.envelopedDataValidator);
                o.recipients = t(e.recipientInfos.value);
              },
              toAsn1: function () {
                return s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                  s.create(
                    s.Class.UNIVERSAL,
                    s.Type.OID,
                    !1,
                    s.oidToDer(o.type).getBytes(),
                  ),
                  s.create(s.Class.CONTEXT_SPECIFIC, 0, !0, [
                    s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                      s.create(
                        s.Class.UNIVERSAL,
                        s.Type.INTEGER,
                        !1,
                        s.integerToDer(o.version).getBytes(),
                      ),
                      s.create(
                        s.Class.UNIVERSAL,
                        s.Type.SET,
                        !0,
                        r(o.recipients),
                      ),
                      s.create(
                        s.Class.UNIVERSAL,
                        s.Type.SEQUENCE,
                        !0,
                        ((e = o.encryptedContent),
                        [
                          s.create(
                            s.Class.UNIVERSAL,
                            s.Type.OID,
                            !1,
                            s.oidToDer(c.pki.oids.data).getBytes(),
                          ),
                          s.create(s.Class.UNIVERSAL, s.Type.SEQUENCE, !0, [
                            s.create(
                              s.Class.UNIVERSAL,
                              s.Type.OID,
                              !1,
                              s.oidToDer(e.algorithm).getBytes(),
                            ),
                            s.create(
                              s.Class.UNIVERSAL,
                              s.Type.OCTETSTRING,
                              !1,
                              e.parameter.getBytes(),
                            ),
                          ]),
                          s.create(s.Class.CONTEXT_SPECIFIC, 0, !0, [
                            s.create(
                              s.Class.UNIVERSAL,
                              s.Type.OCTETSTRING,
                              !1,
                              e.content.getBytes(),
                            ),
                          ]),
                        ]),
                      ),
                    ]),
                  ]),
                ]);
                var e;
              },
              findRecipient: function (e) {
                for (
                  var t = e.issuer.attributes, r = 0;
                  r < o.recipients.length;
                  ++r
                ) {
                  var n = o.recipients[r],
                    i = n.issuer;
                  if (
                    n.serialNumber === e.serialNumber &&
                    i.length === t.length
                  ) {
                    for (var a = !0, s = 0; s < t.length; ++s)
                      if (
                        i[s].type !== t[s].type ||
                        i[s].value !== t[s].value
                      ) {
                        a = !1;
                        break;
                      }
                    if (a) return n;
                  }
                }
                return null;
              },
              decrypt: function (e, t) {
                if (
                  void 0 === o.encryptedContent.key &&
                  void 0 !== e &&
                  void 0 !== t
                )
                  switch (e.encryptedContent.algorithm) {
                    case c.pki.oids.rsaEncryption:
                    case c.pki.oids.desCBC:
                      var r = t.decrypt(e.encryptedContent.content);
                      o.encryptedContent.key = c.util.createBuffer(r);
                      break;
                    default:
                      throw new Error(
                        "Unsupported asymmetric cipher, OID " +
                          e.encryptedContent.algorithm,
                      );
                  }
                n(o);
              },
              addRecipient: function (e) {
                o.recipients.push({
                  version: 0,
                  issuer: e.issuer.attributes,
                  serialNumber: e.serialNumber,
                  encryptedContent: {
                    algorithm: c.pki.oids.rsaEncryption,
                    key: e.publicKey,
                  },
                });
              },
              encrypt: function (e, t) {
                if (void 0 === o.encryptedContent.content) {
                  var r, n, i;
                  switch (
                    ((t = t || o.encryptedContent.algorithm),
                    (e = e || o.encryptedContent.key),
                    t)
                  ) {
                    case c.pki.oids["aes128-CBC"]:
                      ((n = r = 16), (i = c.aes.createEncryptionCipher));
                      break;
                    case c.pki.oids["aes192-CBC"]:
                      ((r = 24), (n = 16), (i = c.aes.createEncryptionCipher));
                      break;
                    case c.pki.oids["aes256-CBC"]:
                      ((r = 32), (n = 16), (i = c.aes.createEncryptionCipher));
                      break;
                    case c.pki.oids["des-EDE3-CBC"]:
                      ((r = 24), (n = 8), (i = c.des.createEncryptionCipher));
                      break;
                    default:
                      throw new Error("Unsupported symmetric cipher, OID " + t);
                  }
                  if (void 0 === e)
                    e = c.util.createBuffer(c.random.getBytes(r));
                  else if (e.length() != r)
                    throw new Error(
                      "Symmetric key has wrong length; got " +
                        e.length() +
                        " bytes, expected " +
                        r +
                        ".",
                    );
                  ((o.encryptedContent.algorithm = t),
                    (o.encryptedContent.key = e),
                    (o.encryptedContent.parameter = c.util.createBuffer(
                      c.random.getBytes(n),
                    )));
                  e = i(e);
                  if (
                    (e.start(o.encryptedContent.parameter.copy()),
                    e.update(o.content),
                    !e.finish())
                  )
                    throw new Error("Symmetric encryption failed.");
                  o.encryptedContent.content = e.output;
                }
                for (var a = 0; a < o.recipients.length; a++) {
                  var s = o.recipients[a];
                  if (void 0 === s.encryptedContent.content) {
                    if (
                      s.encryptedContent.algorithm !== c.pki.oids.rsaEncryption
                    )
                      throw new Error(
                        "Unsupported asymmetric cipher, OID " +
                          s.encryptedContent.algorithm,
                      );
                    s.encryptedContent.content = s.encryptedContent.key.encrypt(
                      o.encryptedContent.key.data,
                    );
                  }
                }
              },
            });
          }));
      }
      var a = "pkcs7";
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var s,
        n = c;
      (c = function (e, t) {
        return (
          (s = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/pkcs7",
        [
          "require",
          "module",
          "./aes",
          "./asn1",
          "./des",
          "./oids",
          "./pem",
          "./pkcs7asn1",
          "./random",
          "./util",
          "./x509",
        ],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = s
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined[a])) {
                e.defined[a] = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e[a];
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(u) {
        function l(e, t) {
          ((t = t.toString(16)),
            "8" <= t[0] && (t = "00" + t),
            (t = u.util.hexToBytes(t)));
          (e.putInt32(t.length), e.putBytes(t));
        }
        function f(e, t) {
          (e.putInt32(t.length), e.putString(t));
        }
        function p() {
          for (
            var e = u.md.sha1.create(), t = arguments.length, r = 0;
            r < t;
            ++r
          )
            e.update(arguments[r]);
          return e.digest();
        }
        var e = (u.ssh = u.ssh || {});
        ((e.privateKeyToPutty = function (e, t, r) {
          var n = "ssh-rsa",
            i = "" === (t = t || "") ? "none" : "aes256-cbc",
            a = "PuTTY-User-Key-File-2: ssh-rsa\r\n",
            s =
              ((a =
                a +
                ("Encryption: " + i + "\r\n") +
                ("Comment: " + (r = r || "") + "\r\n")),
              u.util.createBuffer()),
            o = (f(s, n), l(s, e.e), l(s, e.n), u.util.encode64(s.bytes(), 64)),
            o =
              ((a =
                a +
                ("Public-Lines: " + (Math.floor(o.length / 66) + 1) + "\r\n") +
                o),
              u.util.createBuffer()),
            e =
              (l(o, e.d),
              l(o, e.p),
              l(o, e.q),
              l(o, e.qInv),
              (c = t
                ? ((e = o.length() + 16 - 1),
                  (e -= e % 16),
                  (c = p(o.bytes())).truncate(c.length() - e + o.length()),
                  o.putBuffer(c),
                  (e = u.util.createBuffer()).putBuffer(p("\0\0\0\0", t)),
                  e.putBuffer(p("\0\0\0", t)),
                  (c = u.aes.createEncryptionCipher(
                    e.truncate(8),
                    "CBC",
                  )).start(u.util.createBuffer().fillWithByte(0, 16)),
                  c.update(o.copy()),
                  c.finish(),
                  (e = c.output).truncate(16),
                  u.util.encode64(e.bytes(), 64))
                : u.util.encode64(o.bytes(), 64)),
              (a =
                a +
                ("\r\nPrivate-Lines: " +
                  (Math.floor(c.length / 66) + 1) +
                  "\r\n") +
                c),
              p("putty-private-key-file-mac-key", t)),
            c = u.util.createBuffer(),
            t =
              (f(c, n),
              f(c, i),
              f(c, r),
              c.putInt32(s.length()),
              c.putBuffer(s),
              c.putInt32(o.length()),
              c.putBuffer(o),
              u.hmac.create());
          return (
            t.start("sha1", e),
            t.update(c.bytes()),
            (a += "\r\nPrivate-MAC: " + t.digest().toHex() + "\r\n")
          );
        }),
          (e.publicKeyToOpenSSH = function (e, t) {
            t = t || "";
            var r = u.util.createBuffer();
            return (
              f(r, "ssh-rsa"),
              l(r, e.e),
              l(r, e.n),
              "ssh-rsa " + u.util.encode64(r.bytes()) + " " + t
            );
          }),
          (e.privateKeyToOpenSSH = function (e, t) {
            return t
              ? u.pki.encryptRsaPrivateKey(e, t, {
                  legacy: !0,
                  algorithm: "aes128",
                })
              : u.pki.privateKeyToPem(e);
          }),
          (e.getPublicKeyFingerprint = function (e, t) {
            var r = (t = t || {}).md || u.md.md5.create(),
              n = u.util.createBuffer(),
              e =
                (f(n, "ssh-rsa"),
                l(n, e.e),
                l(n, e.n),
                r.start(),
                r.update(n.getBytes()),
                r.digest());
            if ("hex" === t.encoding)
              return (
                (n = e.toHex()),
                t.delimiter ? n.match(/.{2}/g).join(t.delimiter) : n
              );
            if ("binary" === t.encoding) return e.getBytes();
            if (t.encoding)
              throw new Error('Unknown encoding "' + t.encoding + '".');
            return e;
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/ssh",
        ["require", "module", "./aes", "./hmac", "./md5", "./sha1", "./util"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if ((((e = e || {}).defined = e.defined || {}), !e.defined.ssh)) {
                e.defined.ssh = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.ssh;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      function i(a) {
        function n(e) {
          ((this.id = -1),
            (this.name = e.name || "?"),
            (this.parent = e.parent || null),
            (this.run = e.run),
            (this.subtasks = []),
            (this.error = !1),
            (this.state = o),
            (this.blocks = 0),
            (this.timeoutId = null),
            (this.swapTime = null),
            (this.userData = null),
            (this.id = t++),
            (i[this.id] = this));
        }
        var r = "forge.task",
          i = {},
          t = 0,
          s = (a.debug.set(r, "tasks", i), {}),
          o = (a.debug.set(r, "queues", s), "ready"),
          c = "running",
          e = "blocked",
          u = "sleeping",
          l = "done",
          f = "error",
          p = "start",
          d = "block",
          h = "unblock",
          y = "sleep",
          g = "wakeup",
          m = "cancel",
          C = { ready: {} },
          v =
            ((C[o].stop = o),
            (C[o][p] = c),
            (C[o][m] = l),
            (C[o].fail = f),
            (C[c] = {}),
            (C[c].stop = o),
            (C[c][p] = c),
            (C[c][d] = e),
            (C[c][h] = c),
            (C[c][y] = u),
            (C[c][g] = c),
            (C[c][m] = l),
            (C[c].fail = f),
            (C[e] = {}),
            (C[e].stop = e),
            (C[e][p] = e),
            (C[e][d] = e),
            (C[e][h] = e),
            (C[e][y] = e),
            (C[e][g] = e),
            (C[e][m] = l),
            (C[e].fail = f),
            (C[u] = {}),
            (C[u].stop = u),
            (C[u][p] = u),
            (C[u][d] = u),
            (C[u][h] = u),
            (C[u][y] = u),
            (C[u][g] = u),
            (C[u][m] = l),
            (C[u].fail = f),
            (C.done = {}),
            (C.done.stop = l),
            (C.done[p] = l),
            (C.done[d] = l),
            (C.done[h] = l),
            (C.done[y] = l),
            (C.done[g] = l),
            (C.done[m] = l),
            (C.done.fail = f),
            (C[f] = {}),
            (C[f].stop = f),
            (C[f][p] = f),
            (C[f][d] = f),
            (C[f][h] = f),
            (C[f][y] = f),
            (C[f][g] = f),
            (C[f][m] = f),
            (C[f].fail = f),
            (n.prototype.debug = function (e) {
              a.log.debug(
                r,
                (e = e || ""),
                "[%s][%s] task:",
                this.id,
                this.name,
                this,
                "subtasks:",
                this.subtasks.length,
                "queue:",
                s,
              );
            }),
            (n.prototype.next = function (e, t) {
              "function" == typeof e && ((t = e), (e = this.name));
              t = new n({ run: t, name: e, parent: this });
              return (
                (t.state = c),
                (t.type = this.type),
                (t.successCallback = this.successCallback || null),
                (t.failureCallback = this.failureCallback || null),
                this.subtasks.push(t),
                this
              );
            }),
            (n.prototype.parallel = function (n, i) {
              return (
                a.util.isArray(n) && ((i = n), (n = this.name)),
                this.next(n, function (e) {
                  for (var r = e, t = (r.block(i.length), 0); t < i.length; t++)
                    !(function (e, t) {
                      a.task.start({
                        type: e,
                        run: function (e) {
                          i[t](e);
                        },
                        success: function (e) {
                          r.unblock();
                        },
                        failure: function (e) {
                          r.unblock();
                        },
                      });
                    })(n + "__parallel-" + e.id + "-" + t, t);
                })
              );
            }),
            (n.prototype.stop = function () {
              this.state = C[this.state].stop;
            }),
            (n.prototype.start = function () {
              ((this.error = !1),
                (this.state = C[this.state][p]),
                this.state === c &&
                  ((this.start = new Date()), this.run(this), v(this, 0)));
            }),
            (n.prototype.block = function (e) {
              ((this.blocks += e = void 0 === e ? 1 : e),
                0 < this.blocks && (this.state = C[this.state][d]));
            }),
            (n.prototype.unblock = function (e) {
              return (
                (this.blocks -= e = void 0 === e ? 1 : e),
                0 === this.blocks &&
                  this.state !== l &&
                  ((this.state = c), v(this, 0)),
                this.blocks
              );
            }),
            (n.prototype.sleep = function (e) {
              ((e = void 0 === e ? 0 : e), (this.state = C[this.state][y]));
              var t = this;
              this.timeoutId = setTimeout(function () {
                ((t.timeoutId = null), (t.state = c), v(t, 0));
              }, e);
            }),
            (n.prototype.wait = function (e) {
              e.wait(this);
            }),
            (n.prototype.wakeup = function () {
              this.state === u &&
                (cancelTimeout(this.timeoutId),
                (this.timeoutId = null),
                (this.state = c),
                v(this, 0));
            }),
            (n.prototype.cancel = function () {
              ((this.state = C[this.state][m]),
                (this.permitsNeeded = 0),
                null !== this.timeoutId &&
                  (cancelTimeout(this.timeoutId), (this.timeoutId = null)),
                (this.subtasks = []));
            }),
            (n.prototype.fail = function (e) {
              if (((this.error = !0), E(this, !0), e))
                ((e.error = this.error),
                  (e.swapTime = this.swapTime),
                  (e.userData = this.userData),
                  v(e, 0));
              else {
                if (null !== this.parent) {
                  for (var t = this.parent; null !== t.parent;)
                    ((t.error = this.error),
                      (t.swapTime = this.swapTime),
                      (t.userData = this.userData),
                      (t = t.parent));
                  E(t, !0);
                }
                this.failureCallback && this.failureCallback(this);
              }
            }),
            function (r, e) {
              function t(e) {
                var t;
                (e++,
                  r.state === c &&
                    (n && (r.swapTime = +new Date()),
                    0 < r.subtasks.length
                      ? (((t = r.subtasks.shift()).error = r.error),
                        (t.swapTime = r.swapTime),
                        (t.userData = r.userData),
                        t.run(t),
                        t.error || v(t, e))
                      : (E(r),
                        r.error ||
                          (null !== r.parent &&
                            ((r.parent.error = r.error),
                            (r.parent.swapTime = r.swapTime),
                            (r.parent.userData = r.userData),
                            v(r.parent, e))))));
              }
              var n = 30 < e || 20 < +new Date() - r.swapTime;
              n ? setTimeout(t, 0) : t(e);
            }),
          E = function (e, t) {
            ((e.state = l),
              delete i[e.id],
              null === e.parent &&
                (e.type in s
                  ? 0 === s[e.type].length
                    ? a.log.error(
                        r,
                        "[%s][%s] task queue empty [%s]",
                        e.id,
                        e.name,
                        e.type,
                      )
                    : s[e.type][0] !== e
                      ? a.log.error(
                          r,
                          "[%s][%s] task not first in queue [%s]",
                          e.id,
                          e.name,
                          e.type,
                        )
                      : (s[e.type].shift(),
                        0 === s[e.type].length
                          ? delete s[e.type]
                          : s[e.type][0].start())
                  : a.log.error(
                      r,
                      "[%s][%s] task queue missing [%s]",
                      e.id,
                      e.name,
                      e.type,
                    ),
                t ||
                  (e.error && e.failureCallback
                    ? e.failureCallback(e)
                    : !e.error && e.successCallback && e.successCallback(e))));
          };
        ((a.task = a.task || {}),
          (a.task.start = function (e) {
            var t,
              r = new n({ run: e.run, name: e.name || "?" });
            ((r.type = e.type),
              (r.successCallback = e.success || null),
              (r.failureCallback = e.failure || null),
              r.type in s
                ? s[e.type].push(r)
                : ((s[r.type] = [r]),
                  ((t = r).error = !1),
                  (t.state = C[t.state][p]),
                  setTimeout(function () {
                    t.state === c &&
                      ((t.swapTime = +new Date()), t.run(t), v(t, 0));
                  }, 0)));
          }),
          (a.task.cancel = function (e) {
            e in s && (s[e] = [s[e][0]]);
          }),
          (a.task.createCondition = function () {
            var r = {
              tasks: {},
              wait: function (e) {
                e.id in r.tasks || (e.block(), (r.tasks[e.id] = e));
              },
              notify: function () {
                var e,
                  t = r.tasks;
                for (e in ((r.tasks = {}), t)) t[e].unblock();
              },
            };
            return r;
          }));
      }
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return i((forge = "undefined" == typeof forge ? {} : forge));
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var a,
        n = c;
      (c = function (e, t) {
        return (
          (a = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/task",
        ["require", "module", "./debug", "./log", "./util"],
        function () {
          !function (n, e) {
            e.exports = function (e) {
              var t = a
                .map(function (e) {
                  return n(e);
                })
                .concat(i);
              if (
                (((e = e || {}).defined = e.defined || {}), !e.defined.task)
              ) {
                e.defined.task = !0;
                for (var r = 0; r < t.length; ++r) t[r](e);
              }
              return e.task;
            };
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    (function () {
      if ("function" != typeof c) {
        if ("object" != typeof module || !module.exports)
          return (
            "undefined" == typeof forge && (forge = { disableNativeCode: !1 })
          );
        var r = !0;
        c = function (e, t) {
          t(o, module);
        };
      }
      var i,
        n = c;
      (c = function (e, t) {
        return (
          (i = ("string" == typeof e ? t : e).slice(2)),
          (r ? (delete c, n) : (c = n)).apply(
            null,
            Array.prototype.slice.call(arguments, 0),
          )
        );
      })(
        "js/forge",
        [
          "require",
          "module",
          "./aes",
          "./aesCipherSuites",
          "./asn1",
          "./cipher",
          "./cipherModes",
          "./debug",
          "./des",
          "./hmac",
          "./kem",
          "./log",
          "./md",
          "./mgf1",
          "./pbkdf2",
          "./pem",
          "./pkcs7",
          "./pkcs1",
          "./pkcs12",
          "./pki",
          "./prime",
          "./prng",
          "./pss",
          "./random",
          "./rc2",
          "./ssh",
          "./task",
          "./tls",
          "./util",
        ],
        function () {
          !function (n, e) {
            ((e.exports = function (e) {
              var t = i.map(function (e) {
                return n(e);
              });
              if ((((e = e || {}).defined = e.defined || {}), e.defined.forge))
                return e.forge;
              e.defined.forge = !0;
              for (var r = 0; r < t.length; ++r) t[r](e);
              return e;
            }),
              (e.exports.disableNativeCode = !1),
              e.exports(e.exports));
          }.apply(null, Array.prototype.slice.call(arguments, 0));
        },
      );
    })(),
    o("js/forge")
  );
  function v(e, t) {
    return r.call(e, t);
  }
  function u(e, t) {
    var r,
      n,
      i,
      a,
      s,
      o,
      c,
      u,
      l,
      f,
      p = t && t.split("/"),
      d = y.map,
      h = (d && d["*"]) || {};
    if (e && "." === e.charAt(0))
      if (t) {
        for (
          p = p.slice(0, p.length - 1),
            t = (e = e.split("/")).length - 1,
            y.nodeIdCompat && g.test(e[t]) && (e[t] = e[t].replace(g, "")),
            e = p.concat(e),
            u = 0;
          u < e.length;
          u += 1
        )
          if ("." === (f = e[u])) (e.splice(u, 1), --u);
          else if (".." === f) {
            if (1 === u && (".." === e[2] || ".." === e[0])) break;
            0 < u && (e.splice(u - 1, 2), (u -= 2));
          }
        e = e.join("/");
      } else 0 === e.indexOf("./") && (e = e.substring(2));
    if ((p || h) && d) {
      for (u = (r = e.split("/")).length; 0 < u; --u) {
        if (((n = r.slice(0, u).join("/")), p))
          for (l = p.length; 0 < l; --l)
            if ((i = (i = d[p.slice(0, l).join("/")]) && i[n])) {
              ((a = i), (s = u));
              break;
            }
        if (a) break;
        !o && h && h[n] && ((o = h[n]), (c = u));
      }
      (!a && o && ((a = o), (s = c)),
        a && (r.splice(0, s, a), (e = r.join("/"))));
    }
    return e;
  }
  function E(e, t) {
    return function () {
      return a.apply(f, n.call(arguments, 0).concat([e, t]));
    };
  }
  function S(e) {
    var t;
    if (
      (v(d, e) && ((t = d[e]), delete d[e], (h[e] = !0), s.apply(f, t)),
      v(p, e) || v(h, e))
    )
      return p[e];
    throw new Error("No " + e);
  }
  function l(e) {
    var t,
      r = e ? e.indexOf("!") : -1;
    return (
      -1 < r && ((t = e.substring(0, r)), (e = e.substring(r + 1, e.length))),
      [t, e]
    );
  }
});
const main = async () => {
  var e = (await fetchData().then((e) => e))
      .replace("{authRandomKey}", config.publicKey)
      .replace("{kIT}", config.keyId),
    t = document.getElementById(config.targetIFrame);
  ((t.style.width = "800px"),
    (t.style.height = "500px"),
    (t.style.margin = "80px auto"),
    t.contentWindow.document.open(),
    t.contentWindow.document.write(e),
    t.contentWindow.document.close());
};
setTimeout(() => {
  main();
}, 500);
