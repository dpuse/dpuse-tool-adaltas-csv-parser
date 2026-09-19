//#region node_modules/csv-parse/dist/esm/index.js
var e = typeof global < "u" ? global : typeof self < "u" ? self : typeof window < "u" ? window : {}, t = [], n = [], r = typeof Uint8Array < "u" ? Uint8Array : Array, i = !1;
function a() {
	i = !0;
	for (var e = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", r = 0, a = e.length; r < a; ++r) t[r] = e[r], n[e.charCodeAt(r)] = r;
	n[45] = 62, n[95] = 63;
}
function o(e) {
	i || a();
	var t, o, s, c, l, u, d = e.length;
	if (d % 4 > 0) throw Error("Invalid string. Length must be a multiple of 4");
	l = e[d - 2] === "=" ? 2 : +(e[d - 1] === "="), u = new r(d * 3 / 4 - l), s = l > 0 ? d - 4 : d;
	var f = 0;
	for (t = 0, o = 0; t < s; t += 4, o += 3) c = n[e.charCodeAt(t)] << 18 | n[e.charCodeAt(t + 1)] << 12 | n[e.charCodeAt(t + 2)] << 6 | n[e.charCodeAt(t + 3)], u[f++] = c >> 16 & 255, u[f++] = c >> 8 & 255, u[f++] = c & 255;
	return l === 2 ? (c = n[e.charCodeAt(t)] << 2 | n[e.charCodeAt(t + 1)] >> 4, u[f++] = c & 255) : l === 1 && (c = n[e.charCodeAt(t)] << 10 | n[e.charCodeAt(t + 1)] << 4 | n[e.charCodeAt(t + 2)] >> 2, u[f++] = c >> 8 & 255, u[f++] = c & 255), u;
}
function s(e) {
	return t[e >> 18 & 63] + t[e >> 12 & 63] + t[e >> 6 & 63] + t[e & 63];
}
function c(e, t, n) {
	for (var r, i = [], a = t; a < n; a += 3) r = (e[a] << 16) + (e[a + 1] << 8) + e[a + 2], i.push(s(r));
	return i.join("");
}
function l(e) {
	i || a();
	for (var n, r = e.length, o = r % 3, s = "", l = [], u = 16383, d = 0, f = r - o; d < f; d += u) l.push(c(e, d, d + u > f ? f : d + u));
	return o === 1 ? (n = e[r - 1], s += t[n >> 2], s += t[n << 4 & 63], s += "==") : o === 2 && (n = (e[r - 2] << 8) + e[r - 1], s += t[n >> 10], s += t[n >> 4 & 63], s += t[n << 2 & 63], s += "="), l.push(s), l.join("");
}
function u(e, t, n, r, i) {
	var a, o, s = i * 8 - r - 1, c = (1 << s) - 1, l = c >> 1, u = -7, d = n ? i - 1 : 0, f = n ? -1 : 1, p = e[t + d];
	for (d += f, a = p & (1 << -u) - 1, p >>= -u, u += s; u > 0; a = a * 256 + e[t + d], d += f, u -= 8);
	for (o = a & (1 << -u) - 1, a >>= -u, u += r; u > 0; o = o * 256 + e[t + d], d += f, u -= 8);
	if (a === 0) a = 1 - l;
	else if (a === c) return o ? NaN : (p ? -1 : 1) * Infinity;
	else o += 2 ** r, a -= l;
	return (p ? -1 : 1) * o * 2 ** (a - r);
}
function d(e, t, n, r, i, a) {
	var o, s, c, l = a * 8 - i - 1, u = (1 << l) - 1, d = u >> 1, f = i === 23 ? 2 ** -24 - 2 ** -77 : 0, p = r ? 0 : a - 1, m = r ? 1 : -1, h = +(t < 0 || t === 0 && 1 / t < 0);
	for (t = Math.abs(t), isNaN(t) || t === Infinity ? (s = +!!isNaN(t), o = u) : (o = Math.floor(Math.log(t) / Math.LN2), t * (c = 2 ** -o) < 1 && (o--, c *= 2), o + d >= 1 ? t += f / c : t += f * 2 ** (1 - d), t * c >= 2 && (o++, c /= 2), o + d >= u ? (s = 0, o = u) : o + d >= 1 ? (s = (t * c - 1) * 2 ** i, o += d) : (s = t * 2 ** (d - 1) * 2 ** i, o = 0)); i >= 8; e[n + p] = s & 255, p += m, s /= 256, i -= 8);
	for (o = o << i | s, l += i; l > 0; e[n + p] = o & 255, p += m, o /= 256, l -= 8);
	e[n + p - m] |= h * 128;
}
var f = {}.toString, p = Array.isArray || function(e) {
	return f.call(e) == "[object Array]";
}, m = 50;
_.TYPED_ARRAY_SUPPORT = e.TYPED_ARRAY_SUPPORT === void 0 || e.TYPED_ARRAY_SUPPORT, h();
function h() {
	return _.TYPED_ARRAY_SUPPORT ? 2147483647 : 1073741823;
}
function g(e, t) {
	if (h() < t) throw RangeError("Invalid typed array length");
	return _.TYPED_ARRAY_SUPPORT ? (e = new Uint8Array(t), e.__proto__ = _.prototype) : (e === null && (e = new _(t)), e.length = t), e;
}
function _(e, t, n) {
	if (!_.TYPED_ARRAY_SUPPORT && !(this instanceof _)) return new _(e, t, n);
	if (typeof e == "number") {
		if (typeof t == "string") throw Error("If encoding is specified then the first argument must be a string");
		return x(this, e);
	}
	return v(this, e, t, n);
}
_.poolSize = 8192, _._augment = function(e) {
	return e.__proto__ = _.prototype, e;
};
function v(e, t, n, r) {
	if (typeof t == "number") throw TypeError("\"value\" argument must not be a number");
	return typeof ArrayBuffer < "u" && t instanceof ArrayBuffer ? S(e, t, n, r) : typeof t == "string" ? ee(e, t, n) : ne(e, t);
}
_.from = function(e, t, n) {
	return v(null, e, t, n);
}, _.TYPED_ARRAY_SUPPORT && (_.prototype.__proto__ = Uint8Array.prototype, _.__proto__ = Uint8Array, typeof Symbol < "u" && Symbol.species && _[Symbol.species]);
function y(e) {
	if (typeof e != "number") throw TypeError("\"size\" argument must be a number");
	if (e < 0) throw RangeError("\"size\" argument must not be negative");
}
function b(e, t, n, r) {
	return y(t), t <= 0 || n === void 0 ? g(e, t) : typeof r == "string" ? g(e, t).fill(n, r) : g(e, t).fill(n);
}
_.alloc = function(e, t, n) {
	return b(null, e, t, n);
};
function x(e, t) {
	if (y(t), e = g(e, t < 0 ? 0 : re(t) | 0), !_.TYPED_ARRAY_SUPPORT) for (var n = 0; n < t; ++n) e[n] = 0;
	return e;
}
_.allocUnsafe = function(e) {
	return x(null, e);
}, _.allocUnsafeSlow = function(e) {
	return x(null, e);
};
function ee(e, t, n) {
	if ((typeof n != "string" || n === "") && (n = "utf8"), !_.isEncoding(n)) throw TypeError("\"encoding\" must be a valid string encoding");
	var r = w(t, n) | 0;
	e = g(e, r);
	var i = e.write(t, n);
	return i !== r && (e = e.slice(0, i)), e;
}
function te(e, t) {
	var n = t.length < 0 ? 0 : re(t.length) | 0;
	e = g(e, n);
	for (var r = 0; r < n; r += 1) e[r] = t[r] & 255;
	return e;
}
function S(e, t, n, r) {
	if (t.byteLength, n < 0 || t.byteLength < n) throw RangeError("'offset' is out of bounds");
	if (t.byteLength < n + (r || 0)) throw RangeError("'length' is out of bounds");
	return t = n === void 0 && r === void 0 ? new Uint8Array(t) : r === void 0 ? new Uint8Array(t, n) : new Uint8Array(t, n, r), _.TYPED_ARRAY_SUPPORT ? (e = t, e.__proto__ = _.prototype) : e = te(e, t), e;
}
function ne(e, t) {
	if (C(t)) {
		var n = re(t.length) | 0;
		return e = g(e, n), e.length === 0 || t.copy(e, 0, 0, n), e;
	}
	if (t) {
		if (typeof ArrayBuffer < "u" && t.buffer instanceof ArrayBuffer || "length" in t) return typeof t.length != "number" || Fe(t.length) ? g(e, 0) : te(e, t);
		if (t.type === "Buffer" && p(t.data)) return te(e, t.data);
	}
	throw TypeError("First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.");
}
function re(e) {
	if (e >= h()) throw RangeError("Attempt to allocate Buffer larger than maximum size: 0x" + h().toString(16) + " bytes");
	return e | 0;
}
_.isBuffer = O;
function C(e) {
	return !!(e != null && e._isBuffer);
}
_.compare = function(e, t) {
	if (!C(e) || !C(t)) throw TypeError("Arguments must be Buffers");
	if (e === t) return 0;
	for (var n = e.length, r = t.length, i = 0, a = Math.min(n, r); i < a; ++i) if (e[i] !== t[i]) {
		n = e[i], r = t[i];
		break;
	}
	return n < r ? -1 : +(r < n);
}, _.isEncoding = function(e) {
	switch (String(e).toLowerCase()) {
		case "hex":
		case "utf8":
		case "utf-8":
		case "ascii":
		case "latin1":
		case "binary":
		case "base64":
		case "ucs2":
		case "ucs-2":
		case "utf16le":
		case "utf-16le": return !0;
		default: return !1;
	}
}, _.concat = function(e, t) {
	if (!p(e)) throw TypeError("\"list\" argument must be an Array of Buffers");
	if (e.length === 0) return _.alloc(0);
	var n;
	if (t === void 0) for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
	var r = _.allocUnsafe(t), i = 0;
	for (n = 0; n < e.length; ++n) {
		var a = e[n];
		if (!C(a)) throw TypeError("\"list\" argument must be an Array of Buffers");
		a.copy(r, i), i += a.length;
	}
	return r;
};
function w(e, t) {
	if (C(e)) return e.length;
	if (typeof ArrayBuffer < "u" && typeof ArrayBuffer.isView == "function" && (ArrayBuffer.isView(e) || e instanceof ArrayBuffer)) return e.byteLength;
	typeof e != "string" && (e = "" + e);
	var n = e.length;
	if (n === 0) return 0;
	for (var r = !1;;) switch (t) {
		case "ascii":
		case "latin1":
		case "binary": return n;
		case "utf8":
		case "utf-8":
		case void 0: return Ae(e).length;
		case "ucs2":
		case "ucs-2":
		case "utf16le":
		case "utf-16le": return n * 2;
		case "hex": return n >>> 1;
		case "base64": return Ne(e).length;
		default:
			if (r) return Ae(e).length;
			t = ("" + t).toLowerCase(), r = !0;
	}
}
_.byteLength = w;
function ie(e, t, n) {
	var r = !1;
	if ((t === void 0 || t < 0) && (t = 0), t > this.length || ((n === void 0 || n > this.length) && (n = this.length), n <= 0) || (n >>>= 0, t >>>= 0, n <= t)) return "";
	for (e ||= "utf8";;) switch (e) {
		case "hex": return ye(this, t, n);
		case "utf8":
		case "utf-8": return me(this, t, n);
		case "ascii": return _e(this, t, n);
		case "latin1":
		case "binary": return ve(this, t, n);
		case "base64": return pe(this, t, n);
		case "ucs2":
		case "ucs-2":
		case "utf16le":
		case "utf-16le": return be(this, t, n);
		default:
			if (r) throw TypeError("Unknown encoding: " + e);
			e = (e + "").toLowerCase(), r = !0;
	}
}
_.prototype._isBuffer = !0;
function T(e, t, n) {
	var r = e[t];
	e[t] = e[n], e[n] = r;
}
_.prototype.swap16 = function() {
	var e = this.length;
	if (e % 2 != 0) throw RangeError("Buffer size must be a multiple of 16-bits");
	for (var t = 0; t < e; t += 2) T(this, t, t + 1);
	return this;
}, _.prototype.swap32 = function() {
	var e = this.length;
	if (e % 4 != 0) throw RangeError("Buffer size must be a multiple of 32-bits");
	for (var t = 0; t < e; t += 4) T(this, t, t + 3), T(this, t + 1, t + 2);
	return this;
}, _.prototype.swap64 = function() {
	var e = this.length;
	if (e % 8 != 0) throw RangeError("Buffer size must be a multiple of 64-bits");
	for (var t = 0; t < e; t += 8) T(this, t, t + 7), T(this, t + 1, t + 6), T(this, t + 2, t + 5), T(this, t + 3, t + 4);
	return this;
}, _.prototype.toString = function() {
	var e = this.length | 0;
	return e === 0 ? "" : arguments.length === 0 ? me(this, 0, e) : ie.apply(this, arguments);
}, _.prototype.equals = function(e) {
	if (!C(e)) throw TypeError("Argument must be a Buffer");
	return this === e || _.compare(this, e) === 0;
}, _.prototype.inspect = function() {
	var e = "", t = m;
	return this.length > 0 && (e = this.toString("hex", 0, t).match(/.{2}/g).join(" "), this.length > t && (e += " ... ")), "<Buffer " + e + ">";
}, _.prototype.compare = function(e, t, n, r, i) {
	if (!C(e)) throw TypeError("Argument must be a Buffer");
	if (t === void 0 && (t = 0), n === void 0 && (n = e ? e.length : 0), r === void 0 && (r = 0), i === void 0 && (i = this.length), t < 0 || n > e.length || r < 0 || i > this.length) throw RangeError("out of range index");
	if (r >= i && t >= n) return 0;
	if (r >= i) return -1;
	if (t >= n) return 1;
	if (t >>>= 0, n >>>= 0, r >>>= 0, i >>>= 0, this === e) return 0;
	for (var a = i - r, o = n - t, s = Math.min(a, o), c = this.slice(r, i), l = e.slice(t, n), u = 0; u < s; ++u) if (c[u] !== l[u]) {
		a = c[u], o = l[u];
		break;
	}
	return a < o ? -1 : +(o < a);
};
function ae(e, t, n, r, i) {
	if (e.length === 0) return -1;
	if (typeof n == "string" ? (r = n, n = 0) : n > 2147483647 ? n = 2147483647 : n < -2147483648 && (n = -2147483648), n = +n, isNaN(n) && (n = i ? 0 : e.length - 1), n < 0 && (n = e.length + n), n >= e.length) {
		if (i) return -1;
		n = e.length - 1;
	} else if (n < 0) {
		if (i) n = 0;
		else return -1;
	}
	if (typeof t == "string" && (t = _.from(t, r)), C(t)) return t.length === 0 ? -1 : oe(e, t, n, r, i);
	if (typeof t == "number") return t &= 255, _.TYPED_ARRAY_SUPPORT && typeof Uint8Array.prototype.indexOf == "function" ? i ? Uint8Array.prototype.indexOf.call(e, t, n) : Uint8Array.prototype.lastIndexOf.call(e, t, n) : oe(e, [t], n, r, i);
	throw TypeError("val must be string, number or Buffer");
}
function oe(e, t, n, r, i) {
	var a = 1, o = e.length, s = t.length;
	if (r !== void 0 && (r = String(r).toLowerCase(), r === "ucs2" || r === "ucs-2" || r === "utf16le" || r === "utf-16le")) {
		if (e.length < 2 || t.length < 2) return -1;
		a = 2, o /= 2, s /= 2, n /= 2;
	}
	function c(e, t) {
		return a === 1 ? e[t] : e.readUInt16BE(t * a);
	}
	var l;
	if (i) {
		var u = -1;
		for (l = n; l < o; l++) if (c(e, l) === c(t, u === -1 ? 0 : l - u)) {
			if (u === -1 && (u = l), l - u + 1 === s) return u * a;
		} else u !== -1 && (l -= l - u), u = -1;
	} else for (n + s > o && (n = o - s), l = n; l >= 0; l--) {
		for (var d = !0, f = 0; f < s; f++) if (c(e, l + f) !== c(t, f)) {
			d = !1;
			break;
		}
		if (d) return l;
	}
	return -1;
}
_.prototype.includes = function(e, t, n) {
	return this.indexOf(e, t, n) !== -1;
}, _.prototype.indexOf = function(e, t, n) {
	return ae(this, e, t, n, !0);
}, _.prototype.lastIndexOf = function(e, t, n) {
	return ae(this, e, t, n, !1);
};
function se(e, t, n, r) {
	n = Number(n) || 0;
	var i = e.length - n;
	r ? (r = Number(r), r > i && (r = i)) : r = i;
	var a = t.length;
	if (a % 2 != 0) throw TypeError("Invalid hex string");
	r > a / 2 && (r = a / 2);
	for (var o = 0; o < r; ++o) {
		var s = parseInt(t.substr(o * 2, 2), 16);
		if (isNaN(s)) return o;
		e[n + o] = s;
	}
	return o;
}
function ce(e, t, n, r) {
	return Pe(Ae(t, e.length - n), e, n, r);
}
function le(e, t, n, r) {
	return Pe(je(t), e, n, r);
}
function ue(e, t, n, r) {
	return le(e, t, n, r);
}
function de(e, t, n, r) {
	return Pe(Ne(t), e, n, r);
}
function fe(e, t, n, r) {
	return Pe(Me(t, e.length - n), e, n, r);
}
_.prototype.write = function(e, t, n, r) {
	if (t === void 0) r = "utf8", n = this.length, t = 0;
	else if (n === void 0 && typeof t == "string") r = t, n = this.length, t = 0;
	else if (isFinite(t)) t |= 0, isFinite(n) ? (n |= 0, r === void 0 && (r = "utf8")) : (r = n, n = void 0);
	else throw Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
	var i = this.length - t;
	if ((n === void 0 || n > i) && (n = i), e.length > 0 && (n < 0 || t < 0) || t > this.length) throw RangeError("Attempt to write outside buffer bounds");
	r ||= "utf8";
	for (var a = !1;;) switch (r) {
		case "hex": return se(this, e, t, n);
		case "utf8":
		case "utf-8": return ce(this, e, t, n);
		case "ascii": return le(this, e, t, n);
		case "latin1":
		case "binary": return ue(this, e, t, n);
		case "base64": return de(this, e, t, n);
		case "ucs2":
		case "ucs-2":
		case "utf16le":
		case "utf-16le": return fe(this, e, t, n);
		default:
			if (a) throw TypeError("Unknown encoding: " + r);
			r = ("" + r).toLowerCase(), a = !0;
	}
}, _.prototype.toJSON = function() {
	return {
		type: "Buffer",
		data: Array.prototype.slice.call(this._arr || this, 0)
	};
};
function pe(e, t, n) {
	return t === 0 && n === e.length ? l(e) : l(e.slice(t, n));
}
function me(e, t, n) {
	n = Math.min(e.length, n);
	for (var r = [], i = t; i < n;) {
		var a = e[i], o = null, s = a > 239 ? 4 : a > 223 ? 3 : a > 191 ? 2 : 1;
		if (i + s <= n) {
			var c, l, u, d;
			switch (s) {
				case 1:
					a < 128 && (o = a);
					break;
				case 2:
					c = e[i + 1], (c & 192) == 128 && (d = (a & 31) << 6 | c & 63, d > 127 && (o = d));
					break;
				case 3:
					c = e[i + 1], l = e[i + 2], (c & 192) == 128 && (l & 192) == 128 && (d = (a & 15) << 12 | (c & 63) << 6 | l & 63, d > 2047 && (d < 55296 || d > 57343) && (o = d));
					break;
				case 4: c = e[i + 1], l = e[i + 2], u = e[i + 3], (c & 192) == 128 && (l & 192) == 128 && (u & 192) == 128 && (d = (a & 15) << 18 | (c & 63) << 12 | (l & 63) << 6 | u & 63, d > 65535 && d < 1114112 && (o = d));
			}
		}
		o === null ? (o = 65533, s = 1) : o > 65535 && (o -= 65536, r.push(o >>> 10 & 1023 | 55296), o = 56320 | o & 1023), r.push(o), i += s;
	}
	return ge(r);
}
var he = 4096;
function ge(e) {
	var t = e.length;
	if (t <= he) return String.fromCharCode.apply(String, e);
	for (var n = "", r = 0; r < t;) n += String.fromCharCode.apply(String, e.slice(r, r += he));
	return n;
}
function _e(e, t, n) {
	var r = "";
	n = Math.min(e.length, n);
	for (var i = t; i < n; ++i) r += String.fromCharCode(e[i] & 127);
	return r;
}
function ve(e, t, n) {
	var r = "";
	n = Math.min(e.length, n);
	for (var i = t; i < n; ++i) r += String.fromCharCode(e[i]);
	return r;
}
function ye(e, t, n) {
	var r = e.length;
	(!t || t < 0) && (t = 0), (!n || n < 0 || n > r) && (n = r);
	for (var i = "", a = t; a < n; ++a) i += ke(e[a]);
	return i;
}
function be(e, t, n) {
	for (var r = e.slice(t, n), i = "", a = 0; a < r.length; a += 2) i += String.fromCharCode(r[a] + r[a + 1] * 256);
	return i;
}
_.prototype.slice = function(e, t) {
	var n = this.length;
	e = ~~e, t = t === void 0 ? n : ~~t, e < 0 ? (e += n, e < 0 && (e = 0)) : e > n && (e = n), t < 0 ? (t += n, t < 0 && (t = 0)) : t > n && (t = n), t < e && (t = e);
	var r;
	if (_.TYPED_ARRAY_SUPPORT) r = this.subarray(e, t), r.__proto__ = _.prototype;
	else {
		var i = t - e;
		r = new _(i, void 0);
		for (var a = 0; a < i; ++a) r[a] = this[a + e];
	}
	return r;
};
function E(e, t, n) {
	if (e % 1 != 0 || e < 0) throw RangeError("offset is not uint");
	if (e + t > n) throw RangeError("Trying to access beyond buffer length");
}
_.prototype.readUIntLE = function(e, t, n) {
	e |= 0, t |= 0, n || E(e, t, this.length);
	for (var r = this[e], i = 1, a = 0; ++a < t && (i *= 256);) r += this[e + a] * i;
	return r;
}, _.prototype.readUIntBE = function(e, t, n) {
	e |= 0, t |= 0, n || E(e, t, this.length);
	for (var r = this[e + --t], i = 1; t > 0 && (i *= 256);) r += this[e + --t] * i;
	return r;
}, _.prototype.readUInt8 = function(e, t) {
	return t || E(e, 1, this.length), this[e];
}, _.prototype.readUInt16LE = function(e, t) {
	return t || E(e, 2, this.length), this[e] | this[e + 1] << 8;
}, _.prototype.readUInt16BE = function(e, t) {
	return t || E(e, 2, this.length), this[e] << 8 | this[e + 1];
}, _.prototype.readUInt32LE = function(e, t) {
	return t || E(e, 4, this.length), (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
}, _.prototype.readUInt32BE = function(e, t) {
	return t || E(e, 4, this.length), this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
}, _.prototype.readIntLE = function(e, t, n) {
	e |= 0, t |= 0, n || E(e, t, this.length);
	for (var r = this[e], i = 1, a = 0; ++a < t && (i *= 256);) r += this[e + a] * i;
	return i *= 128, r >= i && (r -= 2 ** (8 * t)), r;
}, _.prototype.readIntBE = function(e, t, n) {
	e |= 0, t |= 0, n || E(e, t, this.length);
	for (var r = t, i = 1, a = this[e + --r]; r > 0 && (i *= 256);) a += this[e + --r] * i;
	return i *= 128, a >= i && (a -= 2 ** (8 * t)), a;
}, _.prototype.readInt8 = function(e, t) {
	return t || E(e, 1, this.length), this[e] & 128 ? (255 - this[e] + 1) * -1 : this[e];
}, _.prototype.readInt16LE = function(e, t) {
	t || E(e, 2, this.length);
	var n = this[e] | this[e + 1] << 8;
	return n & 32768 ? n | 4294901760 : n;
}, _.prototype.readInt16BE = function(e, t) {
	t || E(e, 2, this.length);
	var n = this[e + 1] | this[e] << 8;
	return n & 32768 ? n | 4294901760 : n;
}, _.prototype.readInt32LE = function(e, t) {
	return t || E(e, 4, this.length), this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
}, _.prototype.readInt32BE = function(e, t) {
	return t || E(e, 4, this.length), this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
}, _.prototype.readFloatLE = function(e, t) {
	return t || E(e, 4, this.length), u(this, e, !0, 23, 4);
}, _.prototype.readFloatBE = function(e, t) {
	return t || E(e, 4, this.length), u(this, e, !1, 23, 4);
}, _.prototype.readDoubleLE = function(e, t) {
	return t || E(e, 8, this.length), u(this, e, !0, 52, 8);
}, _.prototype.readDoubleBE = function(e, t) {
	return t || E(e, 8, this.length), u(this, e, !1, 52, 8);
};
function D(e, t, n, r, i, a) {
	if (!C(e)) throw TypeError("\"buffer\" argument must be a Buffer instance");
	if (t > i || t < a) throw RangeError("\"value\" argument is out of bounds");
	if (n + r > e.length) throw RangeError("Index out of range");
}
_.prototype.writeUIntLE = function(e, t, n, r) {
	if (e = +e, t |= 0, n |= 0, !r) {
		var i = 2 ** (8 * n) - 1;
		D(this, e, t, n, i, 0);
	}
	var a = 1, o = 0;
	for (this[t] = e & 255; ++o < n && (a *= 256);) this[t + o] = e / a & 255;
	return t + n;
}, _.prototype.writeUIntBE = function(e, t, n, r) {
	if (e = +e, t |= 0, n |= 0, !r) {
		var i = 2 ** (8 * n) - 1;
		D(this, e, t, n, i, 0);
	}
	var a = n - 1, o = 1;
	for (this[t + a] = e & 255; --a >= 0 && (o *= 256);) this[t + a] = e / o & 255;
	return t + n;
}, _.prototype.writeUInt8 = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 1, 255, 0), _.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)), this[t] = e & 255, t + 1;
};
function xe(e, t, n, r) {
	t < 0 && (t = 65535 + t + 1);
	for (var i = 0, a = Math.min(e.length - n, 2); i < a; ++i) e[n + i] = (t & 255 << 8 * (r ? i : 1 - i)) >>> (r ? i : 1 - i) * 8;
}
_.prototype.writeUInt16LE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 2, 65535, 0), _.TYPED_ARRAY_SUPPORT ? (this[t] = e & 255, this[t + 1] = e >>> 8) : xe(this, e, t, !0), t + 2;
}, _.prototype.writeUInt16BE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 2, 65535, 0), _.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8, this[t + 1] = e & 255) : xe(this, e, t, !1), t + 2;
};
function Se(e, t, n, r) {
	t < 0 && (t = 4294967295 + t + 1);
	for (var i = 0, a = Math.min(e.length - n, 4); i < a; ++i) e[n + i] = t >>> (r ? i : 3 - i) * 8 & 255;
}
_.prototype.writeUInt32LE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 4, 4294967295, 0), _.TYPED_ARRAY_SUPPORT ? (this[t + 3] = e >>> 24, this[t + 2] = e >>> 16, this[t + 1] = e >>> 8, this[t] = e & 255) : Se(this, e, t, !0), t + 4;
}, _.prototype.writeUInt32BE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 4, 4294967295, 0), _.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255) : Se(this, e, t, !1), t + 4;
}, _.prototype.writeIntLE = function(e, t, n, r) {
	if (e = +e, t |= 0, !r) {
		var i = 2 ** (8 * n - 1);
		D(this, e, t, n, i - 1, -i);
	}
	var a = 0, o = 1, s = 0;
	for (this[t] = e & 255; ++a < n && (o *= 256);) e < 0 && s === 0 && this[t + a - 1] !== 0 && (s = 1), this[t + a] = (e / o >> 0) - s & 255;
	return t + n;
}, _.prototype.writeIntBE = function(e, t, n, r) {
	if (e = +e, t |= 0, !r) {
		var i = 2 ** (8 * n - 1);
		D(this, e, t, n, i - 1, -i);
	}
	var a = n - 1, o = 1, s = 0;
	for (this[t + a] = e & 255; --a >= 0 && (o *= 256);) e < 0 && s === 0 && this[t + a + 1] !== 0 && (s = 1), this[t + a] = (e / o >> 0) - s & 255;
	return t + n;
}, _.prototype.writeInt8 = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 1, 127, -128), _.TYPED_ARRAY_SUPPORT || (e = Math.floor(e)), e < 0 && (e = 255 + e + 1), this[t] = e & 255, t + 1;
}, _.prototype.writeInt16LE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 2, 32767, -32768), _.TYPED_ARRAY_SUPPORT ? (this[t] = e & 255, this[t + 1] = e >>> 8) : xe(this, e, t, !0), t + 2;
}, _.prototype.writeInt16BE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 2, 32767, -32768), _.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 8, this[t + 1] = e & 255) : xe(this, e, t, !1), t + 2;
}, _.prototype.writeInt32LE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 4, 2147483647, -2147483648), _.TYPED_ARRAY_SUPPORT ? (this[t] = e & 255, this[t + 1] = e >>> 8, this[t + 2] = e >>> 16, this[t + 3] = e >>> 24) : Se(this, e, t, !0), t + 4;
}, _.prototype.writeInt32BE = function(e, t, n) {
	return e = +e, t |= 0, n || D(this, e, t, 4, 2147483647, -2147483648), e < 0 && (e = 4294967295 + e + 1), _.TYPED_ARRAY_SUPPORT ? (this[t] = e >>> 24, this[t + 1] = e >>> 16, this[t + 2] = e >>> 8, this[t + 3] = e & 255) : Se(this, e, t, !1), t + 4;
};
function Ce(e, t, n, r, i, a) {
	if (n + r > e.length || n < 0) throw RangeError("Index out of range");
}
function we(e, t, n, r, i) {
	return i || Ce(e, t, n, 4), d(e, t, n, r, 23, 4), n + 4;
}
_.prototype.writeFloatLE = function(e, t, n) {
	return we(this, e, t, !0, n);
}, _.prototype.writeFloatBE = function(e, t, n) {
	return we(this, e, t, !1, n);
};
function Te(e, t, n, r, i) {
	return i || Ce(e, t, n, 8), d(e, t, n, r, 52, 8), n + 8;
}
_.prototype.writeDoubleLE = function(e, t, n) {
	return Te(this, e, t, !0, n);
}, _.prototype.writeDoubleBE = function(e, t, n) {
	return Te(this, e, t, !1, n);
}, _.prototype.copy = function(e, t, n, r) {
	if (n ||= 0, !r && r !== 0 && (r = this.length), t >= e.length && (t = e.length), t ||= 0, r > 0 && r < n && (r = n), r === n || e.length === 0 || this.length === 0) return 0;
	if (t < 0) throw RangeError("targetStart out of bounds");
	if (n < 0 || n >= this.length) throw RangeError("sourceStart out of bounds");
	if (r < 0) throw RangeError("sourceEnd out of bounds");
	r > this.length && (r = this.length), e.length - t < r - n && (r = e.length - t + n);
	var i = r - n, a;
	if (this === e && n < t && t < r) for (a = i - 1; a >= 0; --a) e[a + t] = this[a + n];
	else if (i < 1e3 || !_.TYPED_ARRAY_SUPPORT) for (a = 0; a < i; ++a) e[a + t] = this[a + n];
	else Uint8Array.prototype.set.call(e, this.subarray(n, n + i), t);
	return i;
}, _.prototype.fill = function(e, t, n, r) {
	if (typeof e == "string") {
		if (typeof t == "string" ? (r = t, t = 0, n = this.length) : typeof n == "string" && (r = n, n = this.length), e.length === 1) {
			var i = e.charCodeAt(0);
			i < 256 && (e = i);
		}
		if (r !== void 0 && typeof r != "string") throw TypeError("encoding must be a string");
		if (typeof r == "string" && !_.isEncoding(r)) throw TypeError("Unknown encoding: " + r);
	} else typeof e == "number" && (e &= 255);
	if (t < 0 || this.length < t || this.length < n) throw RangeError("Out of range index");
	if (n <= t) return this;
	t >>>= 0, n = n === void 0 ? this.length : n >>> 0, e ||= 0;
	var a;
	if (typeof e == "number") for (a = t; a < n; ++a) this[a] = e;
	else {
		var o = C(e) ? e : Ae(new _(e, r).toString()), s = o.length;
		for (a = 0; a < n - t; ++a) this[a + t] = o[a % s];
	}
	return this;
};
var Ee = /[^+\/0-9A-Za-z-_]/g;
function De(e) {
	if (e = Oe(e).replace(Ee, ""), e.length < 2) return "";
	for (; e.length % 4 != 0;) e += "=";
	return e;
}
function Oe(e) {
	return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, "");
}
function ke(e) {
	return e < 16 ? "0" + e.toString(16) : e.toString(16);
}
function Ae(e, t) {
	t ||= Infinity;
	for (var n, r = e.length, i = null, a = [], o = 0; o < r; ++o) {
		if (n = e.charCodeAt(o), n > 55295 && n < 57344) {
			if (!i) {
				if (n > 56319) {
					(t -= 3) > -1 && a.push(239, 191, 189);
					continue;
				}
				if (o + 1 === r) {
					(t -= 3) > -1 && a.push(239, 191, 189);
					continue;
				}
				i = n;
				continue;
			}
			if (n < 56320) {
				(t -= 3) > -1 && a.push(239, 191, 189), i = n;
				continue;
			}
			n = (i - 55296 << 10 | n - 56320) + 65536;
		} else i && (t -= 3) > -1 && a.push(239, 191, 189);
		if (i = null, n < 128) {
			if (--t < 0) break;
			a.push(n);
		} else if (n < 2048) {
			if ((t -= 2) < 0) break;
			a.push(n >> 6 | 192, n & 63 | 128);
		} else if (n < 65536) {
			if ((t -= 3) < 0) break;
			a.push(n >> 12 | 224, n >> 6 & 63 | 128, n & 63 | 128);
		} else if (n < 1114112) {
			if ((t -= 4) < 0) break;
			a.push(n >> 18 | 240, n >> 12 & 63 | 128, n >> 6 & 63 | 128, n & 63 | 128);
		} else throw Error("Invalid code point");
	}
	return a;
}
function je(e) {
	for (var t = [], n = 0; n < e.length; ++n) t.push(e.charCodeAt(n) & 255);
	return t;
}
function Me(e, t) {
	for (var n, r, i, a = [], o = 0; o < e.length && !((t -= 2) < 0); ++o) n = e.charCodeAt(o), r = n >> 8, i = n % 256, a.push(i), a.push(r);
	return a;
}
function Ne(e) {
	return o(De(e));
}
function Pe(e, t, n, r) {
	for (var i = 0; i < r && !(i + n >= t.length || i >= e.length); ++i) t[i + n] = e[i];
	return i;
}
function Fe(e) {
	return e !== e;
}
function O(e) {
	return e != null && (!!e._isBuffer || Ie(e) || Le(e));
}
function Ie(e) {
	return !!e.constructor && typeof e.constructor.isBuffer == "function" && e.constructor.isBuffer(e);
}
function Le(e) {
	return typeof e.readFloatLE == "function" && typeof e.slice == "function" && Ie(e.slice(0, 0));
}
var Re;
function k() {}
k.prototype = Object.create(null);
function A() {
	A.init.call(this);
}
A.EventEmitter = A, A.usingDomains = !1, A.prototype.domain = void 0, A.prototype._events = void 0, A.prototype._maxListeners = void 0, A.defaultMaxListeners = 10, A.init = function() {
	this.domain = null, A.usingDomains && Re.active && !(this instanceof Re.Domain) && (this.domain = Re.active), (!this._events || this._events === Object.getPrototypeOf(this)._events) && (this._events = new k(), this._eventsCount = 0), this._maxListeners = this._maxListeners || void 0;
}, A.prototype.setMaxListeners = function(e) {
	if (typeof e != "number" || e < 0 || isNaN(e)) throw TypeError("\"n\" argument must be a positive number");
	return this._maxListeners = e, this;
};
function ze(e) {
	return e._maxListeners === void 0 ? A.defaultMaxListeners : e._maxListeners;
}
A.prototype.getMaxListeners = function() {
	return ze(this);
};
function Be(e, t, n) {
	if (t) e.call(n);
	else for (var r = e.length, i = j(e, r), a = 0; a < r; ++a) i[a].call(n);
}
function Ve(e, t, n, r) {
	if (t) e.call(n, r);
	else for (var i = e.length, a = j(e, i), o = 0; o < i; ++o) a[o].call(n, r);
}
function He(e, t, n, r, i) {
	if (t) e.call(n, r, i);
	else for (var a = e.length, o = j(e, a), s = 0; s < a; ++s) o[s].call(n, r, i);
}
function Ue(e, t, n, r, i, a) {
	if (t) e.call(n, r, i, a);
	else for (var o = e.length, s = j(e, o), c = 0; c < o; ++c) s[c].call(n, r, i, a);
}
function We(e, t, n, r) {
	if (t) e.apply(n, r);
	else for (var i = e.length, a = j(e, i), o = 0; o < i; ++o) a[o].apply(n, r);
}
A.prototype.emit = function(e) {
	var t, n, r, i, a, o, s, c = e === "error";
	if (o = this._events, o) c &&= o.error == null;
	else if (!c) return !1;
	if (s = this.domain, c) {
		if (t = arguments[1], s) t ||= /* @__PURE__ */ Error("Uncaught, unspecified \"error\" event"), t.domainEmitter = this, t.domain = s, t.domainThrown = !1, s.emit("error", t);
		else if (t instanceof Error) throw t;
		else {
			var l = /* @__PURE__ */ Error("Uncaught, unspecified \"error\" event. (" + t + ")");
			throw l.context = t, l;
		}
		return !1;
	}
	if (n = o[e], !n) return !1;
	var u = typeof n == "function";
	switch (r = arguments.length, r) {
		case 1:
			Be(n, u, this);
			break;
		case 2:
			Ve(n, u, this, arguments[1]);
			break;
		case 3:
			He(n, u, this, arguments[1], arguments[2]);
			break;
		case 4:
			Ue(n, u, this, arguments[1], arguments[2], arguments[3]);
			break;
		default:
			for (i = Array(r - 1), a = 1; a < r; a++) i[a - 1] = arguments[a];
			We(n, u, this, i);
	}
	return !0;
};
function Ge(e, t, n, r) {
	var i, a, o;
	if (typeof n != "function") throw TypeError("\"listener\" argument must be a function");
	if (a = e._events, a ? (a.newListener && (e.emit("newListener", t, n.listener ? n.listener : n), a = e._events), o = a[t]) : (a = e._events = new k(), e._eventsCount = 0), !o) o = a[t] = n, ++e._eventsCount;
	else if (typeof o == "function" ? o = a[t] = r ? [n, o] : [o, n] : r ? o.unshift(n) : o.push(n), !o.warned && (i = ze(e), i && i > 0 && o.length > i)) {
		o.warned = !0;
		var s = /* @__PURE__ */ Error("Possible EventEmitter memory leak detected. " + o.length + " " + t + " listeners added. Use emitter.setMaxListeners() to increase limit");
		s.name = "MaxListenersExceededWarning", s.emitter = e, s.type = t, s.count = o.length, Ke(s);
	}
	return e;
}
function Ke(e) {
	typeof console.warn == "function" ? console.warn(e) : console.log(e);
}
A.prototype.addListener = function(e, t) {
	return Ge(this, e, t, !1);
}, A.prototype.on = A.prototype.addListener, A.prototype.prependListener = function(e, t) {
	return Ge(this, e, t, !0);
};
function qe(e, t, n) {
	var r = !1;
	function i() {
		e.removeListener(t, i), r || (r = !0, n.apply(e, arguments));
	}
	return i.listener = n, i;
}
A.prototype.once = function(e, t) {
	if (typeof t != "function") throw TypeError("\"listener\" argument must be a function");
	return this.on(e, qe(this, e, t)), this;
}, A.prototype.prependOnceListener = function(e, t) {
	if (typeof t != "function") throw TypeError("\"listener\" argument must be a function");
	return this.prependListener(e, qe(this, e, t)), this;
}, A.prototype.removeListener = function(e, t) {
	var n, r, i, a, o;
	if (typeof t != "function") throw TypeError("\"listener\" argument must be a function");
	if (r = this._events, !r || (n = r[e], !n)) return this;
	if (n === t || n.listener && n.listener === t) --this._eventsCount === 0 ? this._events = new k() : (delete r[e], r.removeListener && this.emit("removeListener", e, n.listener || t));
	else if (typeof n != "function") {
		for (i = -1, a = n.length; a-- > 0;) if (n[a] === t || n[a].listener && n[a].listener === t) {
			o = n[a].listener, i = a;
			break;
		}
		if (i < 0) return this;
		if (n.length === 1) {
			if (n[0] = void 0, --this._eventsCount === 0) return this._events = new k(), this;
			delete r[e];
		} else Ye(n, i);
		r.removeListener && this.emit("removeListener", e, o || t);
	}
	return this;
}, A.prototype.removeAllListeners = function(e) {
	var t, n = this._events;
	if (!n) return this;
	if (!n.removeListener) return arguments.length === 0 ? (this._events = new k(), this._eventsCount = 0) : n[e] && (--this._eventsCount === 0 ? this._events = new k() : delete n[e]), this;
	if (arguments.length === 0) {
		for (var r = Object.keys(n), i = 0, a; i < r.length; ++i) a = r[i], a !== "removeListener" && this.removeAllListeners(a);
		return this.removeAllListeners("removeListener"), this._events = new k(), this._eventsCount = 0, this;
	}
	if (t = n[e], typeof t == "function") this.removeListener(e, t);
	else if (t) do
		this.removeListener(e, t[t.length - 1]);
	while (t[0]);
	return this;
}, A.prototype.listeners = function(e) {
	var t, n, r = this._events;
	return r ? (t = r[e], n = t ? typeof t == "function" ? [t.listener || t] : Xe(t) : []) : n = [], n;
}, A.listenerCount = function(e, t) {
	return typeof e.listenerCount == "function" ? e.listenerCount(t) : Je.call(e, t);
}, A.prototype.listenerCount = Je;
function Je(e) {
	var t = this._events;
	if (t) {
		var n = t[e];
		if (typeof n == "function") return 1;
		if (n) return n.length;
	}
	return 0;
}
A.prototype.eventNames = function() {
	return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};
function Ye(e, t) {
	for (var n = t, r = n + 1, i = e.length; r < i; n += 1, r += 1) e[n] = e[r];
	e.pop();
}
function j(e, t) {
	for (var n = Array(t); t--;) n[t] = e[t];
	return n;
}
function Xe(e) {
	for (var t = Array(e.length), n = 0; n < t.length; ++n) t[n] = e[n].listener || e[n];
	return t;
}
function Ze() {
	throw Error("setTimeout has not been defined");
}
function Qe() {
	throw Error("clearTimeout has not been defined");
}
var M = Ze, N = Qe;
typeof e.setTimeout == "function" && (M = setTimeout), typeof e.clearTimeout == "function" && (N = clearTimeout);
function $e(e) {
	if (M === setTimeout) return setTimeout(e, 0);
	if ((M === Ze || !M) && setTimeout) return M = setTimeout, setTimeout(e, 0);
	try {
		return M(e, 0);
	} catch {
		try {
			return M.call(null, e, 0);
		} catch {
			return M.call(this, e, 0);
		}
	}
}
function et(e) {
	if (N === clearTimeout) return clearTimeout(e);
	if ((N === Qe || !N) && clearTimeout) return N = clearTimeout, clearTimeout(e);
	try {
		return N(e);
	} catch {
		try {
			return N.call(null, e);
		} catch {
			return N.call(this, e);
		}
	}
}
var P = [], F = !1, I, tt = -1;
function nt() {
	F && I && (F = !1, I.length ? P = I.concat(P) : tt = -1, P.length && rt());
}
function rt() {
	if (!F) {
		var e = $e(nt);
		F = !0;
		for (var t = P.length; t;) {
			for (I = P, P = []; ++tt < t;) I && I[tt].run();
			tt = -1, t = P.length;
		}
		I = null, F = !1, et(e);
	}
}
function L(e) {
	var t = Array(arguments.length - 1);
	if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
	P.push(new it(e, t)), P.length === 1 && !F && $e(rt);
}
function it(e, t) {
	this.fun = e, this.array = t;
}
it.prototype.run = function() {
	this.fun.apply(null, this.array);
};
var at = {}, R = e.performance || {};
R.now || R.mozNow || R.msNow || R.oNow || R.webkitNow;
var ot = { env: at }, z = typeof Object.create == "function" ? function(e, t) {
	e.super_ = t, e.prototype = Object.create(t.prototype, { constructor: {
		value: e,
		enumerable: !1,
		writable: !0,
		configurable: !0
	} });
} : function(e, t) {
	e.super_ = t;
	var n = function() {};
	n.prototype = t.prototype, e.prototype = new n(), e.prototype.constructor = e;
}, st = /%[sdj%]/g;
function ct(e) {
	if (!Et(e)) {
		for (var t = [], n = 0; n < arguments.length; n++) t.push(B(arguments[n]));
		return t.join(" ");
	}
	for (var n = 1, r = arguments, i = r.length, a = String(e).replace(st, function(e) {
		if (e === "%%") return "%";
		if (n >= i) return e;
		switch (e) {
			case "%s": return String(r[n++]);
			case "%d": return Number(r[n++]);
			case "%j": try {
				return JSON.stringify(r[n++]);
			} catch {
				return "[Circular]";
			}
			default: return e;
		}
	}), o = r[n]; n < i; o = r[++n]) wt(o) || !H(o) ? a += " " + o : a += " " + B(o);
	return a;
}
function lt(t, n) {
	if (V(e.process)) return function() {
		return lt(t, n).apply(this, arguments);
	};
	if (ot.noDeprecation === !0) return t;
	var r = !1;
	function i() {
		if (!r) {
			if (ot.throwDeprecation) throw Error(n);
			ot.traceDeprecation ? console.trace(n) : console.error(n), r = !0;
		}
		return t.apply(this, arguments);
	}
	return i;
}
var ut = {}, dt;
function ft(e) {
	if (V(dt) && (dt = ot.env.NODE_DEBUG || ""), e = e.toUpperCase(), !ut[e]) {
		if (RegExp("\\b" + e + "\\b", "i").test(dt)) {
			var t = 0;
			ut[e] = function() {
				var n = ct.apply(null, arguments);
				console.error("%s %d: %s", e, t, n);
			};
		} else ut[e] = function() {};
	}
	return ut[e];
}
function B(e, t) {
	var n = {
		seen: [],
		stylize: mt
	};
	return arguments.length >= 3 && (n.depth = arguments[2]), arguments.length >= 4 && (n.colors = arguments[3]), Ct(t) ? n.showHidden = t : t && Mt(n, t), V(n.showHidden) && (n.showHidden = !1), V(n.depth) && (n.depth = 2), V(n.colors) && (n.colors = !1), V(n.customInspect) && (n.customInspect = !0), n.colors && (n.stylize = pt), gt(n, e, n.depth);
}
B.colors = {
	bold: [1, 22],
	italic: [3, 23],
	underline: [4, 24],
	inverse: [7, 27],
	white: [37, 39],
	grey: [90, 39],
	black: [30, 39],
	blue: [34, 39],
	cyan: [36, 39],
	green: [32, 39],
	magenta: [35, 39],
	red: [31, 39],
	yellow: [33, 39]
}, B.styles = {
	special: "cyan",
	number: "yellow",
	boolean: "yellow",
	undefined: "grey",
	null: "bold",
	string: "green",
	date: "magenta",
	regexp: "red"
};
function pt(e, t) {
	var n = B.styles[t];
	return n ? "\x1B[" + B.colors[n][0] + "m" + e + "\x1B[" + B.colors[n][1] + "m" : e;
}
function mt(e, t) {
	return e;
}
function ht(e) {
	var t = {};
	return e.forEach(function(e, n) {
		t[e] = !0;
	}), t;
}
function gt(e, t, n) {
	if (e.customInspect && t && At(t.inspect) && t.inspect !== B && !(t.constructor && t.constructor.prototype === t)) {
		var r = t.inspect(n, e);
		return Et(r) || (r = gt(e, r, n)), r;
	}
	var i = _t(e, t);
	if (i) return i;
	var a = Object.keys(t), o = ht(a);
	if (e.showHidden && (a = Object.getOwnPropertyNames(t)), kt(t) && (a.indexOf("message") >= 0 || a.indexOf("description") >= 0)) return vt(t);
	if (a.length === 0) {
		if (At(t)) {
			var s = t.name ? ": " + t.name : "";
			return e.stylize("[Function" + s + "]", "special");
		}
		if (Dt(t)) return e.stylize(RegExp.prototype.toString.call(t), "regexp");
		if (Ot(t)) return e.stylize(Date.prototype.toString.call(t), "date");
		if (kt(t)) return vt(t);
	}
	var c = "", l = !1, u = ["{", "}"];
	if (St(t) && (l = !0, u = ["[", "]"]), At(t) && (c = " [Function" + (t.name ? ": " + t.name : "") + "]"), Dt(t) && (c = " " + RegExp.prototype.toString.call(t)), Ot(t) && (c = " " + Date.prototype.toUTCString.call(t)), kt(t) && (c = " " + vt(t)), a.length === 0 && (!l || t.length == 0)) return u[0] + c + u[1];
	if (n < 0) return Dt(t) ? e.stylize(RegExp.prototype.toString.call(t), "regexp") : e.stylize("[Object]", "special");
	e.seen.push(t);
	var d = l ? yt(e, t, n, o, a) : a.map(function(r) {
		return bt(e, t, n, o, r, l);
	});
	return e.seen.pop(), xt(d, c, u);
}
function _t(e, t) {
	if (V(t)) return e.stylize("undefined", "undefined");
	if (Et(t)) {
		var n = "'" + JSON.stringify(t).replace(/^"|"$/g, "").replace(/'/g, "\\'").replace(/\\"/g, "\"") + "'";
		return e.stylize(n, "string");
	}
	if (Tt(t)) return e.stylize("" + t, "number");
	if (Ct(t)) return e.stylize("" + t, "boolean");
	if (wt(t)) return e.stylize("null", "null");
}
function vt(e) {
	return "[" + Error.prototype.toString.call(e) + "]";
}
function yt(e, t, n, r, i) {
	for (var a = [], o = 0, s = t.length; o < s; ++o) Nt(t, String(o)) ? a.push(bt(e, t, n, r, String(o), !0)) : a.push("");
	return i.forEach(function(i) {
		i.match(/^\d+$/) || a.push(bt(e, t, n, r, i, !0));
	}), a;
}
function bt(e, t, n, r, i, a) {
	var o, s, c = Object.getOwnPropertyDescriptor(t, i) || { value: t[i] };
	if (c.get ? s = c.set ? e.stylize("[Getter/Setter]", "special") : e.stylize("[Getter]", "special") : c.set && (s = e.stylize("[Setter]", "special")), Nt(r, i) || (o = "[" + i + "]"), s || (e.seen.indexOf(c.value) < 0 ? (s = wt(n) ? gt(e, c.value, null) : gt(e, c.value, n - 1), s.indexOf("\n") > -1 && (s = a ? s.split("\n").map(function(e) {
		return "  " + e;
	}).join("\n").substr(2) : "\n" + s.split("\n").map(function(e) {
		return "   " + e;
	}).join("\n"))) : s = e.stylize("[Circular]", "special")), V(o)) {
		if (a && i.match(/^\d+$/)) return s;
		o = JSON.stringify("" + i), o.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/) ? (o = o.substr(1, o.length - 2), o = e.stylize(o, "name")) : (o = o.replace(/'/g, "\\'").replace(/\\"/g, "\"").replace(/(^"|"$)/g, "'"), o = e.stylize(o, "string"));
	}
	return o + ": " + s;
}
function xt(e, t, n) {
	return e.reduce(function(e, t) {
		return t.indexOf("\n"), e + t.replace(/\u001b\[\d\d?m/g, "").length + 1;
	}, 0) > 60 ? n[0] + (t === "" ? "" : t + "\n ") + " " + e.join(",\n  ") + " " + n[1] : n[0] + t + " " + e.join(", ") + " " + n[1];
}
function St(e) {
	return Array.isArray(e);
}
function Ct(e) {
	return typeof e == "boolean";
}
function wt(e) {
	return e === null;
}
function Tt(e) {
	return typeof e == "number";
}
function Et(e) {
	return typeof e == "string";
}
function V(e) {
	return e === void 0;
}
function Dt(e) {
	return H(e) && jt(e) === "[object RegExp]";
}
function H(e) {
	return typeof e == "object" && !!e;
}
function Ot(e) {
	return H(e) && jt(e) === "[object Date]";
}
function kt(e) {
	return H(e) && (jt(e) === "[object Error]" || e instanceof Error);
}
function At(e) {
	return typeof e == "function";
}
function jt(e) {
	return Object.prototype.toString.call(e);
}
function Mt(e, t) {
	if (!t || !H(t)) return e;
	for (var n = Object.keys(t), r = n.length; r--;) e[n[r]] = t[n[r]];
	return e;
}
function Nt(e, t) {
	return Object.prototype.hasOwnProperty.call(e, t);
}
function U() {
	this.head = null, this.tail = null, this.length = 0;
}
U.prototype.push = function(e) {
	var t = {
		data: e,
		next: null
	};
	this.length > 0 ? this.tail.next = t : this.head = t, this.tail = t, ++this.length;
}, U.prototype.unshift = function(e) {
	var t = {
		data: e,
		next: this.head
	};
	this.length === 0 && (this.tail = t), this.head = t, ++this.length;
}, U.prototype.shift = function() {
	if (this.length !== 0) {
		var e = this.head.data;
		return this.head = this.length === 1 ? this.tail = null : this.head.next, --this.length, e;
	}
}, U.prototype.clear = function() {
	this.head = this.tail = null, this.length = 0;
}, U.prototype.join = function(e) {
	if (this.length === 0) return "";
	for (var t = this.head, n = "" + t.data; t = t.next;) n += e + t.data;
	return n;
}, U.prototype.concat = function(e) {
	if (this.length === 0) return _.alloc(0);
	if (this.length === 1) return this.head.data;
	for (var t = _.allocUnsafe(e >>> 0), n = this.head, r = 0; n;) n.data.copy(t, r), r += n.data.length, n = n.next;
	return t;
};
var Pt = _.isEncoding || function(e) {
	switch (e && e.toLowerCase()) {
		case "hex":
		case "utf8":
		case "utf-8":
		case "ascii":
		case "binary":
		case "base64":
		case "ucs2":
		case "ucs-2":
		case "utf16le":
		case "utf-16le":
		case "raw": return !0;
		default: return !1;
	}
};
function Ft(e) {
	if (e && !Pt(e)) throw Error("Unknown encoding: " + e);
}
function W(e) {
	switch (this.encoding = (e || "utf8").toLowerCase().replace(/[-_]/, ""), Ft(e), this.encoding) {
		case "utf8":
			this.surrogateSize = 3;
			break;
		case "ucs2":
		case "utf16le":
			this.surrogateSize = 2, this.detectIncompleteChar = Lt;
			break;
		case "base64":
			this.surrogateSize = 3, this.detectIncompleteChar = Rt;
			break;
		default:
			this.write = It;
			return;
	}
	this.charBuffer = new _(6), this.charReceived = 0, this.charLength = 0;
}
W.prototype.write = function(e) {
	for (var t = ""; this.charLength;) {
		var n = e.length >= this.charLength - this.charReceived ? this.charLength - this.charReceived : e.length;
		if (e.copy(this.charBuffer, this.charReceived, 0, n), this.charReceived += n, this.charReceived < this.charLength) return "";
		e = e.slice(n, e.length), t = this.charBuffer.slice(0, this.charLength).toString(this.encoding);
		var r = t.charCodeAt(t.length - 1);
		if (r >= 55296 && r <= 56319) {
			this.charLength += this.surrogateSize, t = "";
			continue;
		}
		if (this.charReceived = this.charLength = 0, e.length === 0) return t;
		break;
	}
	this.detectIncompleteChar(e);
	var i = e.length;
	this.charLength && (e.copy(this.charBuffer, 0, e.length - this.charReceived, i), i -= this.charReceived), t += e.toString(this.encoding, 0, i);
	var i = t.length - 1, r = t.charCodeAt(i);
	if (r >= 55296 && r <= 56319) {
		var a = this.surrogateSize;
		return this.charLength += a, this.charReceived += a, this.charBuffer.copy(this.charBuffer, a, 0, a), e.copy(this.charBuffer, 0, 0, a), t.substring(0, i);
	}
	return t;
}, W.prototype.detectIncompleteChar = function(e) {
	for (var t = e.length >= 3 ? 3 : e.length; t > 0; t--) {
		var n = e[e.length - t];
		if (t == 1 && n >> 5 == 6) {
			this.charLength = 2;
			break;
		}
		if (t <= 2 && n >> 4 == 14) {
			this.charLength = 3;
			break;
		}
		if (t <= 3 && n >> 3 == 30) {
			this.charLength = 4;
			break;
		}
	}
	this.charReceived = t;
}, W.prototype.end = function(e) {
	var t = "";
	if (e && e.length && (t = this.write(e)), this.charReceived) {
		var n = this.charReceived, r = this.charBuffer, i = this.encoding;
		t += r.slice(0, n).toString(i);
	}
	return t;
};
function It(e) {
	return e.toString(this.encoding);
}
function Lt(e) {
	this.charReceived = e.length % 2, this.charLength = this.charReceived ? 2 : 0;
}
function Rt(e) {
	this.charReceived = e.length % 3, this.charLength = this.charReceived ? 3 : 0;
}
K.ReadableState = Vt;
var G = ft("stream");
z(K, A);
function zt(e, t, n) {
	if (typeof e.prependListener == "function") return e.prependListener(t, n);
	!e._events || !e._events[t] ? e.on(t, n) : Array.isArray(e._events[t]) ? e._events[t].unshift(n) : e._events[t] = [n, e._events[t]];
}
function Bt(e, t) {
	return e.listeners(t).length;
}
function Vt(e, t) {
	e ||= {}, this.objectMode = !!e.objectMode, t instanceof J && (this.objectMode = this.objectMode || !!e.readableObjectMode);
	var n = e.highWaterMark, r = this.objectMode ? 16 : 16384;
	this.highWaterMark = n || n === 0 ? n : r, this.highWaterMark = ~~this.highWaterMark, this.buffer = new U(), this.length = 0, this.pipes = null, this.pipesCount = 0, this.flowing = null, this.ended = !1, this.endEmitted = !1, this.reading = !1, this.sync = !0, this.needReadable = !1, this.emittedReadable = !1, this.readableListening = !1, this.resumeScheduled = !1, this.defaultEncoding = e.defaultEncoding || "utf8", this.ranOut = !1, this.awaitDrain = 0, this.readingMore = !1, this.decoder = null, this.encoding = null, e.encoding && (this.decoder = new W(e.encoding), this.encoding = e.encoding);
}
function K(e) {
	if (!(this instanceof K)) return new K(e);
	this._readableState = new Vt(e, this), this.readable = !0, e && typeof e.read == "function" && (this._read = e.read), A.call(this);
}
K.prototype.push = function(e, t) {
	var n = this._readableState;
	return !n.objectMode && typeof e == "string" && (t ||= n.defaultEncoding, t !== n.encoding && (e = _.from(e, t), t = "")), Ht(this, n, e, t, !1);
}, K.prototype.unshift = function(e) {
	var t = this._readableState;
	return Ht(this, t, e, "", !0);
}, K.prototype.isPaused = function() {
	return this._readableState.flowing === !1;
};
function Ht(e, t, n, r, i) {
	var a = qt(t, n);
	if (a) e.emit("error", a);
	else if (n === null) t.reading = !1, Jt(e, t);
	else if (t.objectMode || n && n.length > 0) {
		if (t.ended && !i) {
			var o = /* @__PURE__ */ Error("stream.push() after EOF");
			e.emit("error", o);
		} else if (t.endEmitted && i) {
			var s = /* @__PURE__ */ Error("stream.unshift() after end event");
			e.emit("error", s);
		} else {
			var c;
			t.decoder && !i && !r && (n = t.decoder.write(n), c = !t.objectMode && n.length === 0), i || (t.reading = !1), c || (t.flowing && t.length === 0 && !t.sync ? (e.emit("data", n), e.read(0)) : (t.length += t.objectMode ? 1 : n.length, i ? t.buffer.unshift(n) : t.buffer.push(n), t.needReadable && Yt(e))), Zt(e, t);
		}
	} else i || (t.reading = !1);
	return Ut(t);
}
function Ut(e) {
	return !e.ended && (e.needReadable || e.length < e.highWaterMark || e.length === 0);
}
K.prototype.setEncoding = function(e) {
	return this._readableState.decoder = new W(e), this._readableState.encoding = e, this;
};
var Wt = 8388608;
function Gt(e) {
	return e >= Wt ? e = Wt : (e--, e |= e >>> 1, e |= e >>> 2, e |= e >>> 4, e |= e >>> 8, e |= e >>> 16, e++), e;
}
function Kt(e, t) {
	return e <= 0 || t.length === 0 && t.ended ? 0 : t.objectMode ? 1 : e === e ? (e > t.highWaterMark && (t.highWaterMark = Gt(e)), e <= t.length ? e : t.ended ? t.length : (t.needReadable = !0, 0)) : t.flowing && t.length ? t.buffer.head.data.length : t.length;
}
K.prototype.read = function(e) {
	G("read", e), e = parseInt(e, 10);
	var t = this._readableState, n = e;
	if (e !== 0 && (t.emittedReadable = !1), e === 0 && t.needReadable && (t.length >= t.highWaterMark || t.ended)) return G("read: emitReadable", t.length, t.ended), t.length === 0 && t.ended ? ln(this) : Yt(this), null;
	if (e = Kt(e, t), e === 0 && t.ended) return t.length === 0 && ln(this), null;
	var r = t.needReadable;
	G("need readable", r), (t.length === 0 || t.length - e < t.highWaterMark) && (r = !0, G("length less than watermark", r)), t.ended || t.reading ? (r = !1, G("reading or ended", r)) : r && (G("do read"), t.reading = !0, t.sync = !0, t.length === 0 && (t.needReadable = !0), this._read(t.highWaterMark), t.sync = !1, t.reading || (e = Kt(n, t)));
	var i = e > 0 ? an(e, t) : null;
	return i === null ? (t.needReadable = !0, e = 0) : t.length -= e, t.length === 0 && (t.ended || (t.needReadable = !0), n !== e && t.ended && ln(this)), i !== null && this.emit("data", i), i;
};
function qt(e, t) {
	var n = null;
	return !O(t) && typeof t != "string" && t != null && !e.objectMode && (n = /* @__PURE__ */ TypeError("Invalid non-string/buffer chunk")), n;
}
function Jt(e, t) {
	if (!t.ended) {
		if (t.decoder) {
			var n = t.decoder.end();
			n && n.length && (t.buffer.push(n), t.length += t.objectMode ? 1 : n.length);
		}
		t.ended = !0, Yt(e);
	}
}
function Yt(e) {
	var t = e._readableState;
	t.needReadable = !1, t.emittedReadable || (G("emitReadable", t.flowing), t.emittedReadable = !0, t.sync ? L(Xt, e) : Xt(e));
}
function Xt(e) {
	G("emit readable"), e.emit("readable"), rn(e);
}
function Zt(e, t) {
	t.readingMore || (t.readingMore = !0, L(Qt, e, t));
}
function Qt(e, t) {
	for (var n = t.length; !t.reading && !t.flowing && !t.ended && t.length < t.highWaterMark && (G("maybeReadMore read 0"), e.read(0), n !== t.length);) n = t.length;
	t.readingMore = !1;
}
K.prototype._read = function(e) {
	this.emit("error", /* @__PURE__ */ Error("not implemented"));
}, K.prototype.pipe = function(e, t) {
	var n = this, r = this._readableState;
	switch (r.pipesCount) {
		case 0:
			r.pipes = e;
			break;
		case 1:
			r.pipes = [r.pipes, e];
			break;
		default: r.pipes.push(e);
	}
	r.pipesCount += 1, G("pipe count=%d opts=%j", r.pipesCount, t);
	var i = !t || t.end !== !1 ? o : l;
	r.endEmitted ? L(i) : n.once("end", i), e.on("unpipe", a);
	function a(e) {
		G("onunpipe"), e === n && l();
	}
	function o() {
		G("onend"), e.end();
	}
	var s = $t(n);
	e.on("drain", s);
	var c = !1;
	function l() {
		G("cleanup"), e.removeListener("close", p), e.removeListener("finish", m), e.removeListener("drain", s), e.removeListener("error", f), e.removeListener("unpipe", a), n.removeListener("end", o), n.removeListener("end", l), n.removeListener("data", d), c = !0, r.awaitDrain && (!e._writableState || e._writableState.needDrain) && s();
	}
	var u = !1;
	n.on("data", d);
	function d(t) {
		G("ondata"), u = !1, !1 === e.write(t) && !u && ((r.pipesCount === 1 && r.pipes === e || r.pipesCount > 1 && fn(r.pipes, e) !== -1) && !c && (G("false write response, pause", n._readableState.awaitDrain), n._readableState.awaitDrain++, u = !0), n.pause());
	}
	function f(t) {
		G("onerror", t), h(), e.removeListener("error", f), Bt(e, "error") === 0 && e.emit("error", t);
	}
	zt(e, "error", f);
	function p() {
		e.removeListener("finish", m), h();
	}
	e.once("close", p);
	function m() {
		G("onfinish"), e.removeListener("close", p), h();
	}
	e.once("finish", m);
	function h() {
		G("unpipe"), n.unpipe(e);
	}
	return e.emit("pipe", n), r.flowing || (G("pipe resume"), n.resume()), e;
};
function $t(e) {
	return function() {
		var t = e._readableState;
		G("pipeOnDrain", t.awaitDrain), t.awaitDrain && t.awaitDrain--, t.awaitDrain === 0 && e.listeners("data").length && (t.flowing = !0, rn(e));
	};
}
K.prototype.unpipe = function(e) {
	var t = this._readableState;
	if (t.pipesCount === 0) return this;
	if (t.pipesCount === 1) return e && e !== t.pipes ? this : (e ||= t.pipes, t.pipes = null, t.pipesCount = 0, t.flowing = !1, e && e.emit("unpipe", this), this);
	if (!e) {
		var n = t.pipes, r = t.pipesCount;
		t.pipes = null, t.pipesCount = 0, t.flowing = !1;
		for (var i = 0; i < r; i++) n[i].emit("unpipe", this);
		return this;
	}
	var a = fn(t.pipes, e);
	return a === -1 ? this : (t.pipes.splice(a, 1), --t.pipesCount, t.pipesCount === 1 && (t.pipes = t.pipes[0]), e.emit("unpipe", this), this);
}, K.prototype.on = function(e, t) {
	var n = A.prototype.on.call(this, e, t);
	if (e === "data") this._readableState.flowing !== !1 && this.resume();
	else if (e === "readable") {
		var r = this._readableState;
		!r.endEmitted && !r.readableListening && (r.readableListening = r.needReadable = !0, r.emittedReadable = !1, r.reading ? r.length && Yt(this) : L(en, this));
	}
	return n;
}, K.prototype.addListener = K.prototype.on;
function en(e) {
	G("readable nexttick read 0"), e.read(0);
}
K.prototype.resume = function() {
	var e = this._readableState;
	return e.flowing || (G("resume"), e.flowing = !0, tn(this, e)), this;
};
function tn(e, t) {
	t.resumeScheduled || (t.resumeScheduled = !0, L(nn, e, t));
}
function nn(e, t) {
	t.reading || (G("resume read 0"), e.read(0)), t.resumeScheduled = !1, t.awaitDrain = 0, e.emit("resume"), rn(e), t.flowing && !t.reading && e.read(0);
}
K.prototype.pause = function() {
	return G("call pause flowing=%j", this._readableState.flowing), !1 !== this._readableState.flowing && (G("pause"), this._readableState.flowing = !1, this.emit("pause")), this;
};
function rn(e) {
	var t = e._readableState;
	for (G("flow", t.flowing); t.flowing && e.read() !== null;);
}
K.prototype.wrap = function(e) {
	var t = this._readableState, n = !1, r = this;
	for (var i in e.on("end", function() {
		if (G("wrapped end"), t.decoder && !t.ended) {
			var e = t.decoder.end();
			e && e.length && r.push(e);
		}
		r.push(null);
	}), e.on("data", function(i) {
		G("wrapped data"), t.decoder && (i = t.decoder.write(i)), !(t.objectMode && i == null) && (t.objectMode || i && i.length) && (r.push(i) || (n = !0, e.pause()));
	}), e) this[i] === void 0 && typeof e[i] == "function" && (this[i] = function(t) {
		return function() {
			return e[t].apply(e, arguments);
		};
	}(i));
	return dn([
		"error",
		"close",
		"destroy",
		"pause",
		"resume"
	], function(t) {
		e.on(t, r.emit.bind(r, t));
	}), r._read = function(t) {
		G("wrapped _read", t), n && (n = !1, e.resume());
	}, r;
}, K._fromList = an;
function an(e, t) {
	if (t.length === 0) return null;
	var n;
	return t.objectMode ? n = t.buffer.shift() : !e || e >= t.length ? (n = t.decoder ? t.buffer.join("") : t.buffer.length === 1 ? t.buffer.head.data : t.buffer.concat(t.length), t.buffer.clear()) : n = on(e, t.buffer, t.decoder), n;
}
function on(e, t, n) {
	var r;
	return e < t.head.data.length ? (r = t.head.data.slice(0, e), t.head.data = t.head.data.slice(e)) : r = e === t.head.data.length ? t.shift() : n ? sn(e, t) : cn(e, t), r;
}
function sn(e, t) {
	var n = t.head, r = 1, i = n.data;
	for (e -= i.length; n = n.next;) {
		var a = n.data, o = e > a.length ? a.length : e;
		if (o === a.length ? i += a : i += a.slice(0, e), e -= o, e === 0) {
			o === a.length ? (++r, t.head = n.next ? n.next : t.tail = null) : (t.head = n, n.data = a.slice(o));
			break;
		}
		++r;
	}
	return t.length -= r, i;
}
function cn(e, t) {
	var n = _.allocUnsafe(e), r = t.head, i = 1;
	for (r.data.copy(n), e -= r.data.length; r = r.next;) {
		var a = r.data, o = e > a.length ? a.length : e;
		if (a.copy(n, n.length - e, 0, o), e -= o, e === 0) {
			o === a.length ? (++i, t.head = r.next ? r.next : t.tail = null) : (t.head = r, r.data = a.slice(o));
			break;
		}
		++i;
	}
	return t.length -= i, n;
}
function ln(e) {
	var t = e._readableState;
	if (t.length > 0) throw Error("\"endReadable()\" called on non-empty stream");
	t.endEmitted || (t.ended = !0, L(un, t, e));
}
function un(e, t) {
	!e.endEmitted && e.length === 0 && (e.endEmitted = !0, t.readable = !1, t.emit("end"));
}
function dn(e, t) {
	for (var n = 0, r = e.length; n < r; n++) t(e[n], n);
}
function fn(e, t) {
	for (var n = 0, r = e.length; n < r; n++) if (e[n] === t) return n;
	return -1;
}
q.WritableState = hn, z(q, A);
function pn() {}
function mn(e, t, n) {
	this.chunk = e, this.encoding = t, this.callback = n, this.next = null;
}
function hn(e, t) {
	Object.defineProperty(this, "buffer", { get: lt(function() {
		return this.getBuffer();
	}, "_writableState.buffer is deprecated. Use _writableState.getBuffer instead.") }), e ||= {}, this.objectMode = !!e.objectMode, t instanceof J && (this.objectMode = this.objectMode || !!e.writableObjectMode);
	var n = e.highWaterMark, r = this.objectMode ? 16 : 16384;
	this.highWaterMark = n || n === 0 ? n : r, this.highWaterMark = ~~this.highWaterMark, this.needDrain = !1, this.ending = !1, this.ended = !1, this.finished = !1;
	var i = e.decodeStrings === !1;
	this.decodeStrings = !i, this.defaultEncoding = e.defaultEncoding || "utf8", this.length = 0, this.writing = !1, this.corked = 0, this.sync = !0, this.bufferProcessing = !1, this.onwrite = function(e) {
		Cn(t, e);
	}, this.writecb = null, this.writelen = 0, this.bufferedRequest = null, this.lastBufferedRequest = null, this.pendingcb = 0, this.prefinished = !1, this.errorEmitted = !1, this.bufferedRequestCount = 0, this.corkedRequestsFree = new jn(this);
}
hn.prototype.getBuffer = function() {
	for (var e = this.bufferedRequest, t = []; e;) t.push(e), e = e.next;
	return t;
};
function q(e) {
	if (!(this instanceof q) && !(this instanceof J)) return new q(e);
	this._writableState = new hn(e, this), this.writable = !0, e && (typeof e.write == "function" && (this._write = e.write), typeof e.writev == "function" && (this._writev = e.writev)), A.call(this);
}
q.prototype.pipe = function() {
	this.emit("error", /* @__PURE__ */ Error("Cannot pipe, not readable"));
};
function gn(e, t) {
	var n = /* @__PURE__ */ Error("write after end");
	e.emit("error", n), L(t, n);
}
function _n(e, t, n, r) {
	var i = !0, a = !1;
	return n === null ? a = /* @__PURE__ */ TypeError("May not write null values to stream") : !_.isBuffer(n) && typeof n != "string" && n !== void 0 && !t.objectMode && (a = /* @__PURE__ */ TypeError("Invalid non-string/buffer chunk")), a && (e.emit("error", a), L(r, a), i = !1), i;
}
q.prototype.write = function(e, t, n) {
	var r = this._writableState, i = !1;
	return typeof t == "function" && (n = t, t = null), _.isBuffer(e) ? t = "buffer" : t ||= r.defaultEncoding, typeof n != "function" && (n = pn), r.ended ? gn(this, n) : _n(this, r, e, n) && (r.pendingcb++, i = yn(this, r, e, t, n)), i;
}, q.prototype.cork = function() {
	var e = this._writableState;
	e.corked++;
}, q.prototype.uncork = function() {
	var e = this._writableState;
	e.corked && (e.corked--, !e.writing && !e.corked && !e.finished && !e.bufferProcessing && e.bufferedRequest && En(this, e));
}, q.prototype.setDefaultEncoding = function(e) {
	if (typeof e == "string" && (e = e.toLowerCase()), !([
		"hex",
		"utf8",
		"utf-8",
		"ascii",
		"binary",
		"base64",
		"ucs2",
		"ucs-2",
		"utf16le",
		"utf-16le",
		"raw"
	].indexOf((e + "").toLowerCase()) > -1)) throw TypeError("Unknown encoding: " + e);
	return this._writableState.defaultEncoding = e, this;
};
function vn(e, t, n) {
	return !e.objectMode && e.decodeStrings !== !1 && typeof t == "string" && (t = _.from(t, n)), t;
}
function yn(e, t, n, r, i) {
	n = vn(t, n, r), _.isBuffer(n) && (r = "buffer");
	var a = t.objectMode ? 1 : n.length;
	t.length += a;
	var o = t.length < t.highWaterMark;
	if (o || (t.needDrain = !0), t.writing || t.corked) {
		var s = t.lastBufferedRequest;
		t.lastBufferedRequest = new mn(n, r, i), s ? s.next = t.lastBufferedRequest : t.bufferedRequest = t.lastBufferedRequest, t.bufferedRequestCount += 1;
	} else bn(e, t, !1, a, n, r, i);
	return o;
}
function bn(e, t, n, r, i, a, o) {
	t.writelen = r, t.writecb = o, t.writing = !0, t.sync = !0, n ? e._writev(i, t.onwrite) : e._write(i, a, t.onwrite), t.sync = !1;
}
function xn(e, t, n, r, i) {
	--t.pendingcb, n ? L(i, r) : i(r), e._writableState.errorEmitted = !0, e.emit("error", r);
}
function Sn(e) {
	e.writing = !1, e.writecb = null, e.length -= e.writelen, e.writelen = 0;
}
function Cn(e, t) {
	var n = e._writableState, r = n.sync, i = n.writecb;
	if (Sn(n), t) xn(e, n, r, t, i);
	else {
		var a = Dn(n);
		!a && !n.corked && !n.bufferProcessing && n.bufferedRequest && En(e, n), r ? L(wn, e, n, a, i) : wn(e, n, a, i);
	}
}
function wn(e, t, n, r) {
	n || Tn(e, t), t.pendingcb--, r(), kn(e, t);
}
function Tn(e, t) {
	t.length === 0 && t.needDrain && (t.needDrain = !1, e.emit("drain"));
}
function En(e, t) {
	t.bufferProcessing = !0;
	var n = t.bufferedRequest;
	if (e._writev && n && n.next) {
		var r = t.bufferedRequestCount, i = Array(r), a = t.corkedRequestsFree;
		a.entry = n;
		for (var o = 0; n;) i[o] = n, n = n.next, o += 1;
		bn(e, t, !0, t.length, i, "", a.finish), t.pendingcb++, t.lastBufferedRequest = null, a.next ? (t.corkedRequestsFree = a.next, a.next = null) : t.corkedRequestsFree = new jn(t);
	} else {
		for (; n;) {
			var s = n.chunk, c = n.encoding, l = n.callback;
			if (bn(e, t, !1, t.objectMode ? 1 : s.length, s, c, l), n = n.next, t.writing) break;
		}
		n === null && (t.lastBufferedRequest = null);
	}
	t.bufferedRequestCount = 0, t.bufferedRequest = n, t.bufferProcessing = !1;
}
q.prototype._write = function(e, t, n) {
	n(/* @__PURE__ */ Error("not implemented"));
}, q.prototype._writev = null, q.prototype.end = function(e, t, n) {
	var r = this._writableState;
	typeof e == "function" ? (n = e, e = null, t = null) : typeof t == "function" && (n = t, t = null), e != null && this.write(e, t), r.corked && (r.corked = 1, this.uncork()), !r.ending && !r.finished && An(this, r, n);
};
function Dn(e) {
	return e.ending && e.length === 0 && e.bufferedRequest === null && !e.finished && !e.writing;
}
function On(e, t) {
	t.prefinished || (t.prefinished = !0, e.emit("prefinish"));
}
function kn(e, t) {
	var n = Dn(t);
	return n && (t.pendingcb === 0 ? (On(e, t), t.finished = !0, e.emit("finish")) : On(e, t)), n;
}
function An(e, t, n) {
	t.ending = !0, kn(e, t), n && (t.finished ? L(n) : e.once("finish", n)), t.ended = !0, e.writable = !1;
}
function jn(e) {
	var t = this;
	this.next = null, this.entry = null, this.finish = function(n) {
		var r = t.entry;
		for (t.entry = null; r;) {
			var i = r.callback;
			e.pendingcb--, i(n), r = r.next;
		}
		e.corkedRequestsFree ? e.corkedRequestsFree.next = t : e.corkedRequestsFree = t;
	};
}
z(J, K);
for (var Mn = Object.keys(q.prototype), Nn = 0; Nn < Mn.length; Nn++) {
	var Pn = Mn[Nn];
	J.prototype[Pn] || (J.prototype[Pn] = q.prototype[Pn]);
}
function J(e) {
	if (!(this instanceof J)) return new J(e);
	K.call(this, e), q.call(this, e), e && e.readable === !1 && (this.readable = !1), e && e.writable === !1 && (this.writable = !1), this.allowHalfOpen = !0, e && e.allowHalfOpen === !1 && (this.allowHalfOpen = !1), this.once("end", Fn);
}
function Fn() {
	this.allowHalfOpen || this._writableState.ended || L(In, this);
}
function In(e) {
	e.end();
}
z(Y, J);
function Ln(e) {
	this.afterTransform = function(t, n) {
		return Rn(e, t, n);
	}, this.needTransform = !1, this.transforming = !1, this.writecb = null, this.writechunk = null, this.writeencoding = null;
}
function Rn(e, t, n) {
	var r = e._transformState;
	r.transforming = !1;
	var i = r.writecb;
	if (!i) return e.emit("error", /* @__PURE__ */ Error("no writecb in Transform class"));
	r.writechunk = null, r.writecb = null, n != null && e.push(n), i(t);
	var a = e._readableState;
	a.reading = !1, (a.needReadable || a.length < a.highWaterMark) && e._read(a.highWaterMark);
}
function Y(e) {
	if (!(this instanceof Y)) return new Y(e);
	J.call(this, e), this._transformState = new Ln(this);
	var t = this;
	this._readableState.needReadable = !0, this._readableState.sync = !1, e && (typeof e.transform == "function" && (this._transform = e.transform), typeof e.flush == "function" && (this._flush = e.flush)), this.once("prefinish", function() {
		typeof this._flush == "function" ? this._flush(function(e) {
			zn(t, e);
		}) : zn(t);
	});
}
Y.prototype.push = function(e, t) {
	return this._transformState.needTransform = !1, J.prototype.push.call(this, e, t);
}, Y.prototype._transform = function(e, t, n) {
	throw Error("Not implemented");
}, Y.prototype._write = function(e, t, n) {
	var r = this._transformState;
	if (r.writecb = n, r.writechunk = e, r.writeencoding = t, !r.transforming) {
		var i = this._readableState;
		(r.needTransform || i.needReadable || i.length < i.highWaterMark) && this._read(i.highWaterMark);
	}
}, Y.prototype._read = function(e) {
	var t = this._transformState;
	t.writechunk !== null && t.writecb && !t.transforming ? (t.transforming = !0, this._transform(t.writechunk, t.writeencoding, t.afterTransform)) : t.needTransform = !0;
};
function zn(e, t) {
	if (t) return e.emit("error", t);
	var n = e._writableState, r = e._transformState;
	if (n.length) throw Error("Calling transform done when ws.length != 0");
	if (r.transforming) throw Error("Calling transform done when still transforming");
	return e.push(null);
}
z(X, Y);
function X(e) {
	if (!(this instanceof X)) return new X(e);
	Y.call(this, e);
}
X.prototype._transform = function(e, t, n) {
	n(null, e);
}, z(Z, A), Z.Readable = K, Z.Writable = q, Z.Duplex = J, Z.Transform = Y, Z.PassThrough = X, Z.Stream = Z;
function Z() {
	A.call(this);
}
Z.prototype.pipe = function(e, t) {
	var n = this;
	function r(t) {
		e.writable && !1 === e.write(t) && n.pause && n.pause();
	}
	n.on("data", r);
	function i() {
		n.readable && n.resume && n.resume();
	}
	e.on("drain", i), !e._isStdio && (!t || t.end !== !1) && (n.on("end", o), n.on("close", s));
	var a = !1;
	function o() {
		a || (a = !0, e.end());
	}
	function s() {
		a || (a = !0, typeof e.destroy == "function" && e.destroy());
	}
	function c(e) {
		if (l(), A.listenerCount(this, "error") === 0) throw e;
	}
	n.on("error", c), e.on("error", c);
	function l() {
		n.removeListener("data", r), e.removeListener("drain", i), n.removeListener("end", o), n.removeListener("close", s), n.removeListener("error", c), e.removeListener("error", c), n.removeListener("end", l), n.removeListener("close", l), e.removeListener("close", l);
	}
	return n.on("end", l), n.on("close", l), e.on("close", l), e.emit("pipe", n), e;
};
var Bn = function(e) {
	return typeof e == "object" && !!e && !Array.isArray(e);
}, Q = class e extends Error {
	constructor(t, n, r, ...i) {
		Array.isArray(n) && (n = n.join(" ").trim()), super(n), Error.captureStackTrace !== void 0 && Error.captureStackTrace(this, e), this.code = t;
		for (let e of i) for (let t in e) {
			let n = e[t];
			this[t] = O(n) ? n.toString(r.encoding) : n == null ? n : JSON.parse(JSON.stringify(n));
		}
	}
}, Vn = function(e) {
	let t = [];
	for (let n = 0, r = e.length; n < r; n++) {
		let r = e[n];
		if (r == null || r === !1) t[n] = { disabled: !0 };
		else if (typeof r == "string" || typeof r == "number") t[n] = { name: `${r}` };
		else if (Bn(r)) {
			if (typeof r.name != "string") throw new Q("CSV_OPTION_COLUMNS_MISSING_NAME", [
				"Option columns missing name:",
				`property "name" is required at position ${n}`,
				"when column is an object literal"
			]);
			t[n] = r;
		} else throw new Q("CSV_INVALID_COLUMN_DEFINITION", [
			"Invalid column definition:",
			"expect a string or a literal object,",
			`got ${JSON.stringify(r)} at position ${n}`
		]);
	}
	return t;
}, Hn = class {
	constructor(e = 100) {
		this.size = e, this.length = 0, this.buf = _.allocUnsafe(e);
	}
	prepend(e) {
		if (O(e)) {
			let t = this.length + e.length;
			if (t >= this.size && (this.resize(), t >= this.size)) throw Error("INVALID_BUFFER_STATE");
			let n = this.buf;
			this.buf = _.allocUnsafe(this.size), e.copy(this.buf, 0), n.copy(this.buf, e.length), this.length += e.length;
		} else {
			let t = this.length++;
			t === this.size && this.resize();
			let n = this.clone();
			this.buf[0] = e, n.copy(this.buf, 1, 0, t);
		}
	}
	append(e) {
		let t = this.length++;
		t === this.size && this.resize(), this.buf[t] = e;
	}
	clone() {
		return _.from(this.buf.slice(0, this.length));
	}
	resize() {
		let e = this.length;
		this.size *= 2;
		let t = _.allocUnsafe(this.size);
		this.buf.copy(t, 0, 0, e), this.buf = t;
	}
	toString(e) {
		return e ? this.buf.toString(e, 0, this.length) : Uint8Array.prototype.slice.call(this.buf.slice(0, this.length));
	}
	toJSON() {
		return this.toString("utf8");
	}
	reset() {
		this.length = 0;
	}
}, Un = function(e) {
	let t = [
		32,
		9,
		10,
		13,
		12,
		11,
		160,
		5760,
		8192,
		8193,
		8194,
		8195,
		8196,
		8197,
		8198,
		8199,
		8200,
		8201,
		8202,
		8232,
		8233,
		8239,
		8287,
		12288,
		65279
	].reduce((t, n) => {
		let r = _.from(String.fromCharCode(n), e.encoding);
		return n !== 63 && r.length === 1 && r[0] === 63 || t.push(r), t;
	}, []), n = /* @__PURE__ */ new Uint8Array(256);
	for (let e of t) n[e[0]] = 1;
	return {
		bomSkipped: !1,
		bufBytesStart: 0,
		castField: e.cast_function,
		commenting: !1,
		delimiterBufPrevious: void 0,
		delimiterDiscovered: !1,
		error: void 0,
		enabled: e.from_line === 1,
		escaping: !1,
		escapeIsQuote: O(e.escape) && O(e.quote) && _.compare(e.escape, e.quote) === 0,
		expectedRecordLength: Array.isArray(e.columns) ? e.columns.length : void 0,
		field: new Hn(20),
		firstLineToHeaders: e.cast_first_line_to_header,
		needMoreDataSize: Math.max(e.comment === null ? 0 : e.comment.length, ...e.delimiter ? e.delimiter.map((e) => e.length) : [], +!!e.delimiter_auto, e.quote === null ? 0 : e.quote.length, ...t.map((e) => e.length)),
		previousBuf: void 0,
		quoting: !1,
		stop: !1,
		rawBuffer: new Hn(100),
		record: [],
		recordHasError: !1,
		record_length: 0,
		recordDelimiterMaxLength: e.record_delimiter.length === 0 ? 0 : Math.max(...e.record_delimiter.map((e) => e.length)),
		trimChars: [_.from(" ", e.encoding)[0], _.from("	", e.encoding)[0]],
		wasQuoting: !1,
		wasRowDelimiter: !1,
		timchars: t,
		timcharFirstBytes: n
	};
}, Wn = function(e) {
	return e.replace(/([A-Z])/g, function(e, t) {
		return "_" + t.toLowerCase();
	});
}, Gn = function(e) {
	let t = {};
	for (let n in e) t[Wn(n)] = e[n];
	if (t.encoding === void 0 || t.encoding === !0) t.encoding = "utf8";
	else if (t.encoding === null || t.encoding === !1) t.encoding = null;
	else if (typeof t.encoding != "string" && t.encoding !== null) throw new Q("CSV_INVALID_OPTION_ENCODING", [
		"Invalid option encoding:",
		"encoding must be a string or null to return a buffer,",
		`got ${JSON.stringify(t.encoding)}`
	], t);
	if (t.bom === void 0 || t.bom === null || t.bom === !1) t.bom = !1;
	else if (t.bom !== !0) throw new Q("CSV_INVALID_OPTION_BOM", [
		"Invalid option bom:",
		"bom must be true,",
		`got ${JSON.stringify(t.bom)}`
	], t);
	if (t.cast_function = null, t.cast === void 0 || t.cast === null || t.cast === !1 || t.cast === "") t.cast = void 0;
	else if (typeof t.cast == "function") t.cast_function = t.cast, t.cast = !0;
	else if (t.cast !== !0) throw new Q("CSV_INVALID_OPTION_CAST", [
		"Invalid option cast:",
		"cast must be true or a function,",
		`got ${JSON.stringify(t.cast)}`
	], t);
	if (t.cast_date === void 0 || t.cast_date === null || t.cast_date === !1 || t.cast_date === "") t.cast_date = !1;
	else if (t.cast_date === !0) t.cast_date = function(e) {
		let t = Date.parse(e);
		return isNaN(t) ? e : new Date(t);
	};
	else if (typeof t.cast_date != "function") throw new Q("CSV_INVALID_OPTION_CAST_DATE", [
		"Invalid option cast_date:",
		"cast_date must be true or a function,",
		`got ${JSON.stringify(t.cast_date)}`
	], t);
	if (t.cast_first_line_to_header = void 0, t.columns === !0) t.cast_first_line_to_header = void 0;
	else if (typeof t.columns == "function") t.cast_first_line_to_header = t.columns, t.columns = !0;
	else if (Array.isArray(t.columns)) t.columns = Vn(t.columns);
	else if (t.columns === void 0 || t.columns === null || t.columns === !1) t.columns = !1;
	else throw new Q("CSV_INVALID_OPTION_COLUMNS", [
		"Invalid option columns:",
		"expect an array, a function or true,",
		`got ${JSON.stringify(t.columns)}`
	], t);
	if (t.group_columns_by_name === void 0 || t.group_columns_by_name === null || t.group_columns_by_name === !1) t.group_columns_by_name = !1;
	else if (t.group_columns_by_name !== !0) throw new Q("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", [
		"Invalid option group_columns_by_name:",
		"expect an boolean,",
		`got ${JSON.stringify(t.group_columns_by_name)}`
	], t);
	else if (t.columns === !1) throw new Q("CSV_INVALID_OPTION_GROUP_COLUMNS_BY_NAME", ["Invalid option group_columns_by_name:", "the `columns` mode must be activated."], t);
	if (t.comment === void 0 || t.comment === null || t.comment === !1 || t.comment === "") t.comment = null;
	else if (typeof t.comment == "string" && (t.comment = _.from(t.comment, t.encoding)), !O(t.comment)) throw new Q("CSV_INVALID_OPTION_COMMENT", [
		"Invalid option comment:",
		"comment must be a buffer or a string,",
		`got ${JSON.stringify(t.comment)}`
	], t);
	if (t.comment_no_infix === void 0 || t.comment_no_infix === null || t.comment_no_infix === !1) t.comment_no_infix = !1;
	else if (t.comment_no_infix !== !0) throw new Q("CSV_INVALID_OPTION_COMMENT", [
		"Invalid option comment_no_infix:",
		"value must be a boolean,",
		`got ${JSON.stringify(t.comment_no_infix)}`
	], t);
	if (t.delimiter_auto === void 0 || t.delimiter_auto === null || t.delimiter_auto === !1) t.delimiter_auto = !1;
	else if (t.delimiter_auto === !0) t.delimiter_auto = {};
	else if (!Bn(t.delimiter_auto)) throw new Q("CSV_INVALID_OPTION_DELIMITER_AUTO", [
		"Invalid option delimiter_auto:",
		"delimiter_auto must be a boolean or a configuration object,",
		`got ${JSON.stringify(t.delimiter_auto)}`
	], t);
	if (t.delimiter_auto) {
		if (t.delimiter_auto.preferred === void 0) t.delimiter_auto.preferred = {
			44: 1.8,
			9: 1.8,
			59: 1.6,
			32: 1.6,
			58: 1.5,
			46: 1.4,
			47: 1.4
		};
		else if (!Bn(t.delimiter_auto.preferred)) throw new Q("CSV_INVALID_OPTION_DELIMITER_AUTO", [
			"Invalid option delimiter_auto:",
			"preferred must be an object,",
			`got ${JSON.stringify(t.delimiter_auto.preferred)}`
		], t);
		if (t.delimiter_auto.score === void 0) t.delimiter_auto.score = (e, t) => (e.total - e.std) * (t.preferred[e.char_code] || 1);
		else if (typeof t.delimiter_auto.score != "function") throw new Q("CSV_INVALID_OPTION_DELIMITER_AUTO", [
			"Invalid option delimiter_auto:",
			"score must be a function,",
			`got ${JSON.stringify(t.delimiter_auto.score)}`
		], t);
		if (t.delimiter_auto.size === void 0) t.delimiter_auto.size = 2048;
		else if (typeof t.delimiter_auto.size != "number") throw new Q("CSV_INVALID_OPTION_DELIMITER_AUTO", [
			"Invalid option delimiter_auto:",
			"size must be a number,",
			`got ${JSON.stringify(t.delimiter_auto.size)}`
		], t);
	}
	let n = JSON.stringify(t.delimiter);
	if (t.delimiter_auto !== !1 && (t.delimiter = []), Array.isArray(t.delimiter) || ((t.delimiter === void 0 || t.delimiter === null || t.delimiter === !1) && (t.delimiter = _.from(",", t.encoding)), t.delimiter = [t.delimiter]), t.delimiter = t.delimiter.map(function(e) {
		if (typeof e == "string" && (e = _.from(e, t.encoding)), !O(e) || e.length === 0) throw new Q("CSV_INVALID_OPTION_DELIMITER", [
			"Invalid option delimiter:",
			"delimiter must be a non empty string or buffer or array of string|buffer,",
			`got ${n}`
		], t);
		return e;
	}), t.escape === void 0 || t.escape === !0 ? t.escape = _.from("\"", t.encoding) : typeof t.escape == "string" ? t.escape = _.from(t.escape, t.encoding) : (t.escape === null || t.escape === !1) && (t.escape = null), t.escape !== null && !O(t.escape)) throw Error(`Invalid Option: escape must be a buffer, a string or a boolean, got ${JSON.stringify(t.escape)}`);
	if (t.from === void 0 || t.from === null) t.from = 1;
	else if (typeof t.from == "string" && /\d+/.test(t.from) && (t.from = parseInt(t.from)), Number.isInteger(t.from)) {
		if (t.from < 0) throw Error(`Invalid Option: from must be a positive integer, got ${JSON.stringify(e.from)}`);
	} else throw Error(`Invalid Option: from must be an integer, got ${JSON.stringify(t.from)}`);
	if (t.from_line === void 0 || t.from_line === null) t.from_line = 1;
	else if (typeof t.from_line == "string" && /\d+/.test(t.from_line) && (t.from_line = parseInt(t.from_line)), Number.isInteger(t.from_line)) {
		if (t.from_line <= 0) throw Error(`Invalid Option: from_line must be a positive integer greater than 0, got ${JSON.stringify(e.from_line)}`);
	} else throw Error(`Invalid Option: from_line must be an integer, got ${JSON.stringify(e.from_line)}`);
	if (t.ignore_last_delimiters === void 0 || t.ignore_last_delimiters === null) t.ignore_last_delimiters = !1;
	else if (typeof t.ignore_last_delimiters == "number") t.ignore_last_delimiters = Math.floor(t.ignore_last_delimiters), t.ignore_last_delimiters === 0 && (t.ignore_last_delimiters = !1);
	else if (typeof t.ignore_last_delimiters != "boolean") throw new Q("CSV_INVALID_OPTION_IGNORE_LAST_DELIMITERS", [
		"Invalid option `ignore_last_delimiters`:",
		"the value must be a boolean value or an integer,",
		`got ${JSON.stringify(t.ignore_last_delimiters)}`
	], t);
	if (t.ignore_last_delimiters === !0 && t.columns === !1) throw new Q("CSV_IGNORE_LAST_DELIMITERS_REQUIRES_COLUMNS", ["The option `ignore_last_delimiters`", "requires the activation of the `columns` option"], t);
	if (t.info === void 0 || t.info === null || t.info === !1) t.info = !1;
	else if (t.info !== !0) throw Error(`Invalid Option: info must be true, got ${JSON.stringify(t.info)}`);
	if (t.max_record_size === void 0 || t.max_record_size === null || t.max_record_size === !1) t.max_record_size = 0;
	else if (!(Number.isInteger(t.max_record_size) && t.max_record_size >= 0)) {
		if (typeof t.max_record_size == "string" && /\d+/.test(t.max_record_size)) t.max_record_size = parseInt(t.max_record_size);
		else throw Error(`Invalid Option: max_record_size must be a positive integer, got ${JSON.stringify(t.max_record_size)}`);
	}
	if (t.objname === void 0 || t.objname === null || t.objname === !1) t.objname = void 0;
	else if (O(t.objname)) {
		if (t.objname.length === 0) throw Error("Invalid Option: objname must be a non empty buffer");
		t.encoding === null || (t.objname = t.objname.toString(t.encoding));
	} else if (typeof t.objname == "string") {
		if (t.objname.length === 0) throw Error("Invalid Option: objname must be a non empty string");
	} else if (typeof t.objname != "number") throw Error(`Invalid Option: objname must be a string or a buffer, got ${t.objname}`);
	if (t.objname !== void 0) {
		if (typeof t.objname == "number") {
			if (t.columns !== !1) throw Error("Invalid Option: objname index cannot be combined with columns or be defined as a field");
		} else if (t.columns === !1) throw Error("Invalid Option: objname field must be combined with columns or be defined as an index");
	}
	if (t.on_record === void 0 || t.on_record === null) t.on_record = void 0;
	else if (typeof t.on_record != "function") throw new Q("CSV_INVALID_OPTION_ON_RECORD", [
		"Invalid option `on_record`:",
		"expect a function,",
		`got ${JSON.stringify(t.on_record)}`
	], t);
	if (t.on_skip !== void 0 && t.on_skip !== null && typeof t.on_skip != "function") throw Error(`Invalid Option: on_skip must be a function, got ${JSON.stringify(t.on_skip)}`);
	if (t.quote === null || t.quote === !1 || t.quote === "") t.quote = null;
	else if (t.quote === void 0 || t.quote === !0 ? t.quote = _.from("\"", t.encoding) : typeof t.quote == "string" && (t.quote = _.from(t.quote, t.encoding)), !O(t.quote)) throw Error(`Invalid Option: quote must be a buffer or a string, got ${JSON.stringify(t.quote)}`);
	if (t.raw === void 0 || t.raw === null || t.raw === !1) t.raw = !1;
	else if (t.raw !== !0) throw Error(`Invalid Option: raw must be true, got ${JSON.stringify(t.raw)}`);
	if (t.record_delimiter === void 0) t.record_delimiter = [];
	else if (typeof t.record_delimiter == "string" || O(t.record_delimiter)) {
		if (t.record_delimiter.length === 0) throw new Q("CSV_INVALID_OPTION_RECORD_DELIMITER", [
			"Invalid option `record_delimiter`:",
			"value must be a non empty string or buffer,",
			`got ${JSON.stringify(t.record_delimiter)}`
		], t);
		t.record_delimiter = [t.record_delimiter];
	} else if (!Array.isArray(t.record_delimiter)) throw new Q("CSV_INVALID_OPTION_RECORD_DELIMITER", [
		"Invalid option `record_delimiter`:",
		"value must be a string, a buffer or array of string|buffer,",
		`got ${JSON.stringify(t.record_delimiter)}`
	], t);
	if (t.record_delimiter = t.record_delimiter.map(function(e, n) {
		if (typeof e != "string" && !O(e)) throw new Q("CSV_INVALID_OPTION_RECORD_DELIMITER", [
			"Invalid option `record_delimiter`:",
			"value must be a string, a buffer or array of string|buffer",
			`at index ${n},`,
			`got ${JSON.stringify(e)}`
		], t);
		if (e.length === 0) throw new Q("CSV_INVALID_OPTION_RECORD_DELIMITER", [
			"Invalid option `record_delimiter`:",
			"value must be a non empty string or buffer",
			`at index ${n},`,
			`got ${JSON.stringify(e)}`
		], t);
		return typeof e == "string" && (e = _.from(e, t.encoding)), e;
	}), typeof t.relax_column_count != "boolean") {
		if (t.relax_column_count === void 0 || t.relax_column_count === null) t.relax_column_count = !1;
		else throw Error(`Invalid Option: relax_column_count must be a boolean, got ${JSON.stringify(t.relax_column_count)}`);
	}
	if (typeof t.relax_column_count_less != "boolean") {
		if (t.relax_column_count_less === void 0 || t.relax_column_count_less === null) t.relax_column_count_less = !1;
		else throw Error(`Invalid Option: relax_column_count_less must be a boolean, got ${JSON.stringify(t.relax_column_count_less)}`);
	}
	if (typeof t.relax_column_count_more != "boolean") {
		if (t.relax_column_count_more === void 0 || t.relax_column_count_more === null) t.relax_column_count_more = !1;
		else throw Error(`Invalid Option: relax_column_count_more must be a boolean, got ${JSON.stringify(t.relax_column_count_more)}`);
	}
	if (typeof t.relax_quotes != "boolean") {
		if (t.relax_quotes === void 0 || t.relax_quotes === null) t.relax_quotes = !1;
		else throw Error(`Invalid Option: relax_quotes must be a boolean, got ${JSON.stringify(t.relax_quotes)}`);
	}
	if (typeof t.skip_empty_lines != "boolean") {
		if (t.skip_empty_lines === void 0 || t.skip_empty_lines === null) t.skip_empty_lines = !1;
		else throw Error(`Invalid Option: skip_empty_lines must be a boolean, got ${JSON.stringify(t.skip_empty_lines)}`);
	}
	if (typeof t.skip_records_with_empty_values != "boolean") {
		if (t.skip_records_with_empty_values === void 0 || t.skip_records_with_empty_values === null) t.skip_records_with_empty_values = !1;
		else throw Error(`Invalid Option: skip_records_with_empty_values must be a boolean, got ${JSON.stringify(t.skip_records_with_empty_values)}`);
	}
	if (typeof t.skip_records_with_error != "boolean") {
		if (t.skip_records_with_error === void 0 || t.skip_records_with_error === null) t.skip_records_with_error = !1;
		else throw Error(`Invalid Option: skip_records_with_error must be a boolean, got ${JSON.stringify(t.skip_records_with_error)}`);
	}
	if (t.rtrim === void 0 || t.rtrim === null || t.rtrim === !1) t.rtrim = !1;
	else if (t.rtrim !== !0) throw Error(`Invalid Option: rtrim must be a boolean, got ${JSON.stringify(t.rtrim)}`);
	if (t.ltrim === void 0 || t.ltrim === null || t.ltrim === !1) t.ltrim = !1;
	else if (t.ltrim !== !0) throw Error(`Invalid Option: ltrim must be a boolean, got ${JSON.stringify(t.ltrim)}`);
	if (t.trim === void 0 || t.trim === null || t.trim === !1) t.trim = !1;
	else if (t.trim !== !0) throw Error(`Invalid Option: trim must be a boolean, got ${JSON.stringify(t.trim)}`);
	if (t.trim === !0 && e.ltrim !== !1 ? t.ltrim = !0 : t.ltrim !== !0 && (t.ltrim = !1), t.trim === !0 && e.rtrim !== !1 ? t.rtrim = !0 : t.rtrim !== !0 && (t.rtrim = !1), t.to === void 0 || t.to === null) t.to = -1;
	else if (t.to !== -1) {
		if (typeof t.to == "string" && /\d+/.test(t.to) && (t.to = parseInt(t.to)), Number.isInteger(t.to)) {
			if (t.to <= 0) throw Error(`Invalid Option: to must be a positive integer greater than 0, got ${JSON.stringify(e.to)}`);
		} else throw Error(`Invalid Option: to must be an integer, got ${JSON.stringify(e.to)}`);
	}
	if (t.to_line === void 0 || t.to_line === null) t.to_line = -1;
	else if (t.to_line !== -1) {
		if (typeof t.to_line == "string" && /\d+/.test(t.to_line) && (t.to_line = parseInt(t.to_line)), Number.isInteger(t.to_line)) {
			if (t.to_line <= 0) throw Error(`Invalid Option: to_line must be a positive integer greater than 0, got ${JSON.stringify(e.to_line)}`);
		} else throw Error(`Invalid Option: to_line must be an integer, got ${JSON.stringify(e.to_line)}`);
	}
	return t;
}, Kn = function(e, t) {
	t || ({delimiter_auto: t} = Gn({ delimiter_auto: !0 })), typeof e == "string" && (e = _.from(e)), O(e) && (e = ((e) => {
		let t = [], n = Zn({ delimiter: [] }).parse(e, !0, (e) => t.push(e), () => {});
		if (n !== void 0) throw n;
		return t;
	})(e));
	let n = Array(127).fill().map(() => ({ lines: [] }));
	e.map(([e], t) => {
		for (let r = 0, i = e.length; r < i; r++) {
			let i = e.charCodeAt(r);
			n[i].lines[t] === void 0 && (n[i].lines[t] = 0), n[i].lines[t]++;
		}
	}), n.map((e, n) => {
		e.char_code = n, e.std = qn(e.lines), e.total = e.lines.reduce((e, t) => e + t, 0), e.preferred = !!t.preferred[n], e.score = t.score(e, t);
	});
	let r = n.reduce((e, t) => e.score > t.score ? e : t, {});
	return String.fromCharCode(r.char_code);
}, qn = function(e) {
	let t = e.length;
	if (t === 0) return 0;
	let n = e.reduce((e, t) => e + t) / t;
	return Math.sqrt(e.map((e) => (e - n) ** 2).reduce((e, t) => e + t) / t);
}, Jn = function(e) {
	return e.every((e) => e == null || e.toString && e.toString().trim() === "");
}, Yn = 13, Xn = 10, $ = {
	utf8: _.from([
		239,
		187,
		191
	]),
	utf16le: _.from([255, 254])
}, Zn = function(e = {}) {
	let t = {
		bytes: 0,
		bytes_records: 0,
		comment_lines: 0,
		empty_lines: 0,
		invalid_field_length: 0,
		lines: 1,
		records: 0
	}, n = Gn(e);
	return {
		info: t,
		original_options: e,
		options: n,
		state: Un(n),
		__needMoreData: function(e, t, n) {
			if (n) return !1;
			let { encoding: r, escape: i, quote: a } = this.options, { quoting: o, needMoreDataSize: s, recordDelimiterMaxLength: c } = this.state;
			return t - e - 1 < Math.max(s, c === 0 ? _.from("\r\n", r).length : c, o ? (i === null ? 0 : i.length) + a.length : 0, o ? a.length + c : 0);
		},
		parse: function(e, t, n, r) {
			let { bom: i, comment_no_infix: a, delimiter_auto: o, encoding: s, from_line: c, ltrim: l, max_record_size: u, raw: d, relax_quotes: f, rtrim: p, skip_empty_lines: m, to: h, to_line: g } = this.options, { comment: v, escape: y, quote: b, record_delimiter: x } = this.options, { bomSkipped: ee, delimiterDiscovered: te, delimiterBufPrevious: S, rawBuffer: ne, escapeIsQuote: re } = this.state;
			if (!te && o) {
				let n;
				if (n = S === void 0 ? e : S !== void 0 && e === void 0 ? S : _.concat([S, e]), e = void 0, t || n.length > o.size) this.options.delimiter = [_.from(Kn(n, this.options.delimiter_auto))], this.state.previousBuf = n, this.state.delimiterBufPrevious = void 0, this.state.delimiterDiscovered = !0;
				else {
					this.state.delimiterBufPrevious = n;
					return;
				}
			}
			let { previousBuf: C } = this.state, w;
			if (C === void 0) {
				if (e === void 0) {
					r();
					return;
				}
				w = e;
			} else w = C !== void 0 && e === void 0 ? C : _.concat([C, e]);
			if (ee === !1) {
				if (i === !1) this.state.bomSkipped = !0;
				else if (w.length < 3) {
					if (t === !1) {
						this.state.previousBuf = w;
						return;
					}
				} else {
					for (let e in $) if ($[e].compare(w, 0, $[e].length) === 0) {
						let t = $[e].length;
						this.state.bufBytesStart += t, w = w.slice(t);
						let n = Gn({
							...this.original_options,
							encoding: e
						});
						for (let e in n) this.options[e] = n[e];
						({comment: v, escape: y, quote: b} = this.options);
						break;
					}
					this.state.bomSkipped = !0;
				}
			}
			let ie = w.length, T = 0;
			for (; T < ie && !this.__needMoreData(T, ie, t); T++) {
				if (this.state.wasRowDelimiter === !0 && (this.info.lines++, this.state.wasRowDelimiter = !1), g !== -1 && this.info.lines > g) {
					this.state.stop = !0, r();
					return;
				}
				this.state.quoting === !1 && x.length === 0 && this.__autoDiscoverRecordDelimiter(w, T) && (x = this.options.record_delimiter);
				let e = w[T];
				if (d === !0 && ne.append(e), (e === Yn || e === Xn) && this.state.wasRowDelimiter === !1 && (this.state.wasRowDelimiter = !0), this.state.escaping === !0) this.state.escaping = !1;
				else {
					if (y !== null && this.state.quoting === !0 && this.__isEscape(w, T, e) && T + y.length < ie) {
						if (re) {
							if (this.__isQuote(w, T + y.length)) {
								this.state.escaping = !0, T += y.length - 1;
								continue;
							}
						} else {
							this.state.escaping = !0, T += y.length - 1;
							continue;
						}
					}
					if (this.state.commenting === !1 && this.__isQuote(w, T)) {
						if (this.state.quoting === !0) {
							let t = w[T + b.length], n = p && this.__isCharTrimable(w, T + b.length), r = v !== null && this.__compareBytes(v, w, T + b.length, t), i = this.__isDelimiter(w, T + b.length, t), a = x.length === 0 ? this.__autoDiscoverRecordDelimiter(w, T + b.length) : this.__isRecordDelimiter(t, w, T + b.length);
							if (y !== null && this.__isEscape(w, T, e) && this.__isQuote(w, T + y.length)) T += y.length - 1;
							else if (!t || i || a || r || n) {
								this.state.quoting = !1, this.state.wasQuoting = !0, T += b.length - 1;
								continue;
							} else if (f === !1) {
								let e = this.__error(new Q("CSV_INVALID_CLOSING_QUOTE", [
									"Invalid Closing Quote:",
									`got "${String.fromCharCode(t)}"`,
									`at line ${this.info.lines}`,
									"instead of delimiter, record delimiter, trimable character",
									"(if activated) or comment"
								], this.options, this.__infoField()));
								if (e !== void 0) return e;
							} else this.state.quoting = !1, this.state.wasQuoting = !0, this.state.field.prepend(b), T += b.length - 1;
						} else if (this.state.field.length !== 0) {
							if (f === !1) {
								let e = this.__infoField(), t = Object.keys($).map((e) => $[e].equals(this.state.field.toString()) ? e : !1).filter(Boolean)[0], n = this.__error(new Q("INVALID_OPENING_QUOTE", [
									"Invalid Opening Quote:",
									`a quote is found on field ${JSON.stringify(e.column)} at line ${e.lines}, value is ${JSON.stringify(this.state.field.toString(s))}`,
									t ? `(${t} bom)` : void 0
								], this.options, e, { field: this.state.field }));
								if (n !== void 0) return n;
							}
						} else {
							this.state.quoting = !0, T += b.length - 1;
							continue;
						}
					}
					if (this.state.quoting === !1) {
						let t = this.__isRecordDelimiter(e, w, T);
						if (t !== 0) {
							if (this.state.commenting && this.state.wasQuoting === !1 && this.state.record.length === 0 && this.state.field.length === 0) this.info.comment_lines++;
							else {
								if (this.state.enabled === !1 && this.info.lines + +(this.state.wasRowDelimiter === !0) >= c) {
									this.state.enabled = !0, this.__resetField(), this.__resetRecord(), T += t - 1;
									continue;
								}
								if (m === !0 && this.state.wasQuoting === !1 && this.state.record.length === 0 && this.state.field.length === 0) {
									this.info.empty_lines++, T += t - 1;
									continue;
								}
								this.info.bytes = this.state.bufBytesStart + T;
								let e = this.__onField();
								if (e !== void 0) return e;
								this.info.bytes = this.state.bufBytesStart + T + t;
								let i = this.__onRecord(n);
								if (i !== void 0) return i;
								if (h !== -1 && this.info.records >= h) {
									this.state.stop = !0, r();
									return;
								}
							}
							this.state.commenting = !1, T += t - 1;
							continue;
						}
						if (this.state.commenting) continue;
						if (v !== null && (a === !1 || this.state.record.length === 0 && this.state.field.length === 0) && this.__compareBytes(v, w, T, e) !== 0) {
							this.state.commenting = !0;
							continue;
						}
						let i = this.__isDelimiter(w, T, e);
						if (i !== 0) {
							this.info.bytes = this.state.bufBytesStart + T;
							let e = this.__onField();
							if (e !== void 0) return e;
							T += i - 1;
							continue;
						}
					}
				}
				if (this.state.commenting === !1 && u !== 0 && this.state.record_length + this.state.field.length > u) return this.__error(new Q("CSV_MAX_RECORD_SIZE", [
					"Max Record Size:",
					"record exceed the maximum number of tolerated bytes",
					`of ${u}`,
					`at line ${this.info.lines}`
				], this.options, this.__infoField()));
				let t = l === !1 || this.state.quoting === !0 || this.state.field.length !== 0 || !this.__isCharTrimable(w, T), i = p === !1 || this.state.wasQuoting === !1;
				if (t === !0 && i === !0) this.state.field.append(e);
				else if (p === !0 && !this.__isCharTrimable(w, T)) return this.__error(new Q("CSV_NON_TRIMABLE_CHAR_AFTER_CLOSING_QUOTE", [
					"Invalid Closing Quote:",
					"found non trimable byte after quote",
					`at line ${this.info.lines}`
				], this.options, this.__infoField()));
				else {
					t === !1 && (T += this.__isCharTrimable(w, T) - 1);
					continue;
				}
			}
			if (t === !0) {
				if (this.state.quoting === !0) {
					let e = this.__error(new Q("CSV_QUOTE_NOT_CLOSED", ["Quote Not Closed:", `the parsing is finished with an opening quote at line ${this.info.lines}`], this.options, this.__infoField()));
					if (e !== void 0) return e;
				} else if (this.state.wasQuoting === !0 || this.state.record.length !== 0 || this.state.field.length !== 0) {
					this.info.bytes = this.state.bufBytesStart + T;
					let e = this.__onField();
					if (e !== void 0) return e;
					let t = this.__onRecord(n);
					if (t !== void 0) return t;
				} else this.state.wasRowDelimiter === !0 ? this.info.empty_lines++ : this.state.commenting === !0 && this.info.comment_lines++;
			} else this.state.bufBytesStart += T, this.state.previousBuf = w.slice(T);
			this.state.wasRowDelimiter === !0 && (this.info.lines++, this.state.wasRowDelimiter = !1);
		},
		__onRecord: function(e) {
			let { columns: t, group_columns_by_name: n, encoding: r, info: i, from: a, relax_column_count: o, relax_column_count_less: s, relax_column_count_more: c, raw: l, skip_records_with_empty_values: u } = this.options, { enabled: d, record: f } = this.state;
			if (d === !1) return this.__resetRecord();
			let p = f.length;
			if (t === !0) {
				if (u === !0 && Jn(f)) {
					this.__resetRecord();
					return;
				}
				return this.__firstLineToColumns(f);
			}
			if (t === !1 && this.info.records === 0 && (this.state.expectedRecordLength = p), p !== this.state.expectedRecordLength) {
				let e = t === !1 ? new Q("CSV_RECORD_INCONSISTENT_FIELDS_LENGTH", [
					"Invalid Record Length:",
					`expect ${this.state.expectedRecordLength},`,
					`got ${p} on line ${this.info.lines}`
				], this.options, this.__infoField(), { record: f }) : new Q("CSV_RECORD_INCONSISTENT_COLUMNS", [
					"Invalid Record Length:",
					`columns length is ${t.length},`,
					`got ${p} on line ${this.info.lines}`
				], this.options, this.__infoField(), { record: f });
				if (o === !0 || s === !0 && p < this.state.expectedRecordLength || c === !0 && p > this.state.expectedRecordLength) this.info.invalid_field_length++, this.state.error = e;
				else {
					let t = this.__error(e);
					if (t) return t;
				}
			}
			if (u === !0 && Jn(f)) {
				this.__resetRecord();
				return;
			}
			if (this.state.recordHasError === !0) {
				this.__resetRecord(), this.state.recordHasError = !1;
				return;
			}
			if (this.info.records++, a === 1 || this.info.records >= a) {
				let { objname: a } = this.options;
				if (t !== !1) {
					let o = {};
					for (let e = 0, r = f.length; e < r; e++) t[e] === void 0 || t[e].disabled || (n === !0 && Object.hasOwn(o, t[e].name) ? Array.isArray(o[t[e].name]) ? o[t[e].name] = o[t[e].name].concat(f[e]) : o[t[e].name] = [o[t[e].name], f[e]] : Object.defineProperty(o, t[e].name, {
						value: f[e],
						enumerable: !0,
						writable: !0,
						configurable: !0
					}));
					if (l === !0 || i === !0) {
						let t = Object.assign({ record: o }, l === !0 ? { raw: this.state.rawBuffer.toString(r) } : {}, i === !0 ? { info: this.__infoRecord() } : {}), n = this.__push(a === void 0 ? t : [o[a], t], e);
						if (n) return n;
					} else {
						let t = this.__push(a === void 0 ? o : [o[a], o], e);
						if (t) return t;
					}
				} else if (l === !0 || i === !0) {
					let t = Object.assign({ record: f }, l === !0 ? { raw: this.state.rawBuffer.toString(r) } : {}, i === !0 ? { info: this.__infoRecord() } : {}), n = this.__push(a === void 0 ? t : [f[a], t], e);
					if (n) return n;
				} else {
					let t = this.__push(a === void 0 ? f : [f[a], f], e);
					if (t) return t;
				}
			}
			this.__resetRecord();
		},
		__firstLineToColumns: function(e) {
			let { firstLineToHeaders: t } = this.state;
			try {
				let n = t === void 0 ? e : t.call(null, e);
				if (!Array.isArray(n)) return this.__error(new Q("CSV_INVALID_COLUMN_MAPPING", [
					"Invalid Column Mapping:",
					"expect an array from column function,",
					`got ${JSON.stringify(n)}`
				], this.options, this.__infoField(), { headers: n }));
				let r = Vn(n);
				this.state.expectedRecordLength = r.length, this.options.columns = r, this.__resetRecord();
				return;
			} catch (e) {
				return e;
			}
		},
		__resetRecord: function() {
			this.options.raw === !0 && this.state.rawBuffer.reset(), this.state.error = void 0, this.state.record = [], this.state.record_length = 0;
		},
		__onField: function() {
			let { cast: e, encoding: t, rtrim: n, max_record_size: r } = this.options, { enabled: i, wasQuoting: a } = this.state;
			if (i === !1) return this.__resetField();
			let o = this.state.field.toString(t);
			if (n === !0 && a === !1 && (o = o.trimRight()), e === !0) {
				let [e, t] = this.__cast(o);
				if (e !== void 0) return e;
				o = t;
			}
			this.state.record.push(o), r !== 0 && typeof o == "string" && (this.state.record_length += o.length), this.__resetField();
		},
		__resetField: function() {
			this.state.field.reset(), this.state.wasQuoting = !1;
		},
		__push: function(e, t) {
			let { on_record: n } = this.options;
			if (n !== void 0) {
				let t = this.__infoRecord();
				try {
					e = n.call(null, e, t);
				} catch (e) {
					return e;
				}
				if (e == null) return;
			}
			this.info.bytes_records += this.info.bytes, t(e);
		},
		__cast: function(e) {
			let { columns: t, relax_column_count: n } = this.options;
			if (Array.isArray(t) === !0 && n && this.options.columns.length <= this.state.record.length) return [void 0, void 0];
			if (this.state.castField !== null) try {
				let t = this.__infoField();
				return [void 0, this.state.castField.call(null, e, t)];
			} catch (e) {
				return [e];
			}
			if (this.__isFloat(e)) return [void 0, parseFloat(e)];
			if (this.options.cast_date !== !1) {
				let t = this.__infoField();
				return [void 0, this.options.cast_date.call(null, e, t)];
			}
			return [void 0, e];
		},
		__compareBytes: function(e, t, n, r) {
			if (e[0] !== r) return 0;
			let i = e.length;
			for (let r = 1; r < i; r++) if (e[r] !== t[n + r]) return 0;
			return i;
		},
		__isCharTrimable: function(e, t) {
			let { timchars: n, timcharFirstBytes: r } = this.state, i = e[t];
			if (i === void 0 || r[i] === 0) return 0;
			loop1: for (let r = 0; r < n.length; r++) {
				let i = n[r];
				for (let n = 0; n < i.length; n++) if (i[n] !== e[t + n]) continue loop1;
				return i.length;
			}
			return 0;
		},
		__isDelimiter: function(e, t, n) {
			let { delimiter: r, ignore_last_delimiters: i } = this.options;
			if (i === !0 && this.state.record.length === this.options.columns.length - 1 || i !== !1 && typeof i == "number" && this.state.record.length === i - 1) return 0;
			loop1: for (let i = 0; i < r.length; i++) {
				let a = r[i];
				if (a[0] === n) {
					for (let n = 1; n < a.length; n++) if (a[n] !== e[t + n]) continue loop1;
					return a.length;
				}
			}
			return 0;
		},
		__isEscape: function(e, t, n) {
			let { escape: r } = this.options;
			if (r === null) return !1;
			let i = r.length;
			if (r[0] === n) {
				for (let n = 0; n < i; n++) if (r[n] !== e[t + n]) return !1;
				return !0;
			}
			return !1;
		},
		__isFloat: function(e) {
			return e - parseFloat(e) + 1 >= 0;
		},
		__isQuote: function(e, t) {
			let { quote: n } = this.options;
			if (n === null) return !1;
			let r = n.length;
			for (let i = 0; i < r; i++) if (n[i] !== e[t + i]) return !1;
			return !0;
		},
		__isRecordDelimiter: function(e, t, n) {
			let { record_delimiter: r } = this.options, i = r.length;
			loop1: for (let a = 0; a < i; a++) {
				let i = r[a], o = i.length;
				if (i[0] === e) {
					for (let e = 1; e < o; e++) if (i[e] !== t[n + e]) continue loop1;
					return i.length;
				}
			}
			return 0;
		},
		__autoDiscoverRecordDelimiter: function(e, t) {
			let { encoding: n } = this.options, r = [
				_.from("\r\n", n),
				_.from("\n", n),
				_.from("\r", n)
			];
			loop: for (let n = 0; n < r.length; n++) {
				let i = r[n].length;
				for (let a = 0; a < i; a++) if (r[n][a] !== e[t + a]) continue loop;
				return this.options.record_delimiter.push(r[n]), this.state.recordDelimiterMaxLength = r[n].length, r[n].length;
			}
			return 0;
		},
		__error: function(e) {
			let { encoding: t, raw: n, skip_records_with_error: r } = this.options, i = typeof e == "string" ? Error(e) : e;
			if (r) {
				if (this.state.recordHasError = !0, this.options.on_skip !== void 0) try {
					this.options.on_skip(i, n ? this.state.rawBuffer.toString(t) : void 0);
				} catch (e) {
					return e;
				}
				return;
			}
			return i;
		},
		__infoDataSet: function() {
			return {
				...this.info,
				columns: this.options.columns
			};
		},
		__infoRecord: function() {
			let { columns: e, raw: t, encoding: n } = this.options;
			return {
				...this.__infoDataSet(),
				bytes_records: this.info.bytes,
				error: this.state.error,
				header: e === !0,
				index: this.state.record.length,
				raw: t ? this.state.rawBuffer.toString(n) : void 0
			};
		},
		__infoField: function() {
			let { columns: e } = this.options, t = Array.isArray(e), n = this.info.bytes_records;
			return {
				...this.__infoRecord(),
				bytes_records: n,
				column: t === !0 ? e.length > this.state.record.length ? e[this.state.record.length].name : null : this.state.record.length,
				quoting: this.state.wasQuoting
			};
		}
	};
}, Qn = class extends Y {
	constructor(e = {}) {
		super({
			readableObjectMode: !0,
			...e,
			encoding: null
		}), this.api = Zn({
			on_skip: (e, t) => {
				this.emit("skip", e, t);
			},
			...e
		}), this.state = this.api.state, this.options = this.api.options, this.info = this.api.info;
	}
	_transform(e, t, n) {
		if (this.state.stop === !0) return;
		let r = this.api.parse(e, !1, (e) => {
			this.push(e);
		}, () => {
			this.push(null), this.end(), this.on("end", this.destroy);
		});
		r !== void 0 && (this.state.stop = !0), n(r);
	}
	_flush(e) {
		this.state.stop !== !0 && e(this.api.parse(void 0, !0, (e) => {
			this.push(e);
		}, () => {
			this.push(null), this.on("end", this.destroy);
		}));
	}
}, $n = function() {
	let e, t, n;
	for (let r in arguments) {
		let i = arguments[r], a = typeof i;
		if (e === void 0 && (typeof i == "string" || O(i))) e = i;
		else if (t === void 0 && Bn(i)) t = i;
		else if (n === void 0 && a === "function") n = i;
		else throw new Q("CSV_INVALID_ARGUMENT", ["Invalid argument:", `got ${JSON.stringify(i)} at index ${r}`], t || {});
	}
	let r = new Qn(t);
	if (n) {
		let e = t === void 0 || t.objname === void 0 ? [] : Object.create(null);
		r.on("readable", function() {
			let n;
			for (; (n = this.read()) !== null;) t === void 0 || t.objname === void 0 ? e.push(n) : Object.assign(e, { [n[0]]: n[1] });
		}), r.on("error", function(e) {
			n(e, void 0, r.api.__infoDataSet());
		}), r.on("end", function() {
			n(void 0, e, r.api.__infoDataSet());
		});
	}
	if (e !== void 0) {
		let t = function() {
			r.write(e), r.end();
		};
		typeof setImmediate == "function" ? setImmediate(t) : setTimeout(t, 0);
	}
	return r;
}, er = 2048, tr = class extends Error {
	data;
	locator;
	constructor(e, t, n, r) {
		super(e, r), this.name = "DPUseError", this.data = n, this.locator = t;
	}
}, nr = class extends tr {
	constructor(e, t, n, r) {
		super(e, t, n, r), this.name = "FetchError";
	}
};
async function rr(e, t, n) {
	let r = ` - ${e.statusText}`, i = `${t} Response status '${String(e.status)}${e.statusText ? r : ""}' received.`, a;
	try {
		a = await e.text();
	} catch (e) {
		a = `<body unavailable: ${ar(e).message}>`;
	}
	return new nr(i, n, { body: or(a) });
}
function ir(e) {
	try {
		e();
	} catch {}
}
function ar(e) {
	if (e instanceof Error) return e;
	if (typeof e == "string") return Error(e);
	if (typeof e == "number" || typeof e == "boolean" || typeof e == "bigint") return Error(String(e));
	if (typeof e == "symbol") return Error(e.description ?? "Unknown error");
	if (typeof e == "object") try {
		return Error(JSON.stringify(e));
	} catch {
		return /* @__PURE__ */ Error("Unknown error");
	}
	return /* @__PURE__ */ Error("Unknown error");
}
function or(e) {
	if (e != null && e !== "") return e.length > er ? `${e.slice(0, er)}... [truncated]` : e;
}
//#endregion
//#region src/index.ts
var sr = {
	bom: !1,
	cast_date: !1,
	columns: !1,
	comment: "",
	comment_no_infix: !1,
	delimiter: ",",
	encoding: "utf8",
	escape: "\"",
	from: 1,
	from_line: 1,
	group_columns_by_name: !1,
	ignore_last_delimiters: !1,
	info: !1,
	ltrim: !1,
	max_record_size: 0,
	quote: "\"",
	raw: !1,
	record_delimiter: [],
	relax_column_count: !1,
	relax_column_count_less: !1,
	relax_column_count_more: !1,
	relax_quotes: !1,
	rtrim: !1,
	skip_empty_lines: !1,
	skip_records_with_empty_values: !1,
	skip_records_with_error: !1,
	to_line: -1,
	trim: !1
}, cr = 4, lr = 1e4, ur = class {
	async parseStream(e, t, n, r, i) {
		return new Promise((a, o) => {
			let s, c, l, u = !1, d = !1, f = () => {
				if (d) return;
				d = !0;
				let e = s;
				s = void 0, l = void 0, e != null && (ir(() => e.removeAllListeners()), ir(() => e.end())), ir(() => void c?.cancel()), c = void 0;
			};
			r.signal.addEventListener("abort", f, { once: !0 });
			let p = (e) => {
				u || (u = !0, f(), r.signal.aborted || r.abort(e), o(e instanceof Error ? e : Error(String(e))));
			};
			(async () => {
				s = $n({
					...sr,
					...t,
					cast: (e, t) => ({
						value: e,
						wasValueQuoted: t.quoting
					})
				}), l = dr({
					chunk: i,
					chunkSize: e.chunkSize ?? lr
				}), s.on("readable", () => {
					try {
						if (s == null || l == null) return;
						let e;
						for (; (e = s.read()) != null;) {
							if (u) return;
							r.signal.throwIfAborted(), l.push(e);
						}
					} catch (e) {
						p(e);
					}
				}), s.on("error", (e) => {
					p(e);
				}), s.on("end", () => {
					u || (l?.flush(), a(fr(s)));
				});
				let o = await fetch(encodeURI(n), { signal: r.signal });
				if (!o.ok || o.body == null) throw await rr(o, `Failed to fetch '${n}' file.`, "dpuse-connector-file-store-emulator|Connector|retrieve");
				c = o.body.getReader();
				let d = new TextDecoder(e.encodingId), f = await c.read();
				for (; !f.done;) {
					if (u) return;
					r.signal.throwIfAborted();
					let e = d.decode(f.value, { stream: !0 });
					e.length > 0 && s.write(e), f = await c.read();
				}
				if (u) return;
				let m = d.decode();
				m.length > 0 && s.write(m), s.end();
			})().catch((e) => {
				p(e);
			});
		});
	}
	async parseText(e, t) {
		let n = pr(e), { parsedRecords: r, valueDelimiterId: i } = await mr(e, t);
		return {
			parsedRecords: r,
			recordDelimiterId: n,
			valueDelimiterId: i
		};
	}
};
function dr(e) {
	let t = Math.max(1, Math.floor(e.chunkSize)), n = [], r = o(), i = 0, a = () => {
		if (i === 0) return;
		let t = r;
		t.length = i, r = o(), i = 0, e.chunk("parsingRecordArray", t), n.length < cr && n.push(t);
	};
	return {
		flush: a,
		push: (e) => {
			r[i++] = e, i >= t && a();
		}
	};
	function o() {
		let e = n.pop();
		if (e != null) return e.length = 0, e;
		let r = Array.from({ length: t });
		return r.length = 0, r;
	}
}
function fr(e) {
	return {
		byteCount: e?.info.bytes ?? -1,
		commentLineCount: e?.info.comment_lines ?? -1,
		emptyLineCount: e?.info.empty_lines ?? -1,
		nonUniformRecordCount: e?.info.invalid_field_length ?? -1,
		lineCount: e?.info.lines ?? -1,
		recordCount: e?.info.records ?? -1
	};
}
function pr(e) {
	let t = (e.match(/\r\n/g) ?? []).length, n = (e.match(/(?<!\r)\n/g) ?? []).length, r = (e.match(/\r(?!\n)/g) ?? []).length;
	return t >= n && t >= r ? "\r\n" : n >= t && n >= r ? "\n" : r >= t && r >= n ? "\r" : "\n";
}
async function mr(e, t) {
	let n, r, i, a = [];
	for (let o of t) try {
		let t = 0, s, c = 0, l = 0, u = $n({
			...sr,
			cast: (e, t) => ({
				value: e,
				wasValueQuoted: t.quoting
			}),
			delimiter: o,
			relax_column_count: !0
		});
		await new Promise((d) => {
			try {
				let f = [];
				u.on("readable", () => {
					let e;
					for (; (e = u.read()) != null;) {
						c++;
						let n = e.length;
						s != null && (l += Math.abs(n - s)), s = n, t += n, f.push(e);
					}
				}), u.on("error", () => {
					d();
				}), u.on("end", () => {
					let e = t / c;
					(!i || l <= i) && (!r || e > r) && (n = o, r = e, i = l, a = [...f]), d();
				}), u.write(e), u.end();
			} catch {
				d();
			}
		});
	} catch {}
	return {
		parsedRecords: a,
		valueDelimiterId: n ?? ","
	};
}
//#endregion
export { ur as Tool };
