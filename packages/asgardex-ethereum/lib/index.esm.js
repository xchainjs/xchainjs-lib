import buffer from 'buffer';
import stream from 'stream';
import string_decoder from 'string_decoder';
import { ethers } from 'ethers';
import http from 'http';
import https from 'https';
import { parse as parse$1 } from 'url';
import { getAddress as getAddress$1, formatEther } from 'ethers/lib/utils';

var Network;
(function (Network) {
    Network["TEST"] = "rinkeby";
    Network["MAIN"] = "homestead";
})(Network || (Network = {}));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

function getCjsExportFromNamespace (n) {
	return n && n['default'] || n;
}

var inherits_browser = createCommonjsModule(function (module) {
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
          value: ctor,
          enumerable: false,
          writable: true,
          configurable: true
        }
      });
    }
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    if (superCtor) {
      ctor.super_ = superCtor;
      var TempCtor = function () {};
      TempCtor.prototype = superCtor.prototype;
      ctor.prototype = new TempCtor();
      ctor.prototype.constructor = ctor;
    }
  };
}
});

var safeBuffer = createCommonjsModule(function (module, exports) {
/* eslint-disable node/no-deprecated-api */

var Buffer = buffer.Buffer;

// alternative to using Object.keys for old browsers
function copyProps (src, dst) {
  for (var key in src) {
    dst[key] = src[key];
  }
}
if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
  module.exports = buffer;
} else {
  // Copy properties from require('buffer')
  copyProps(buffer, exports);
  exports.Buffer = SafeBuffer;
}

function SafeBuffer (arg, encodingOrOffset, length) {
  return Buffer(arg, encodingOrOffset, length)
}

SafeBuffer.prototype = Object.create(Buffer.prototype);

// Copy static methods from Buffer
copyProps(Buffer, SafeBuffer);

SafeBuffer.from = function (arg, encodingOrOffset, length) {
  if (typeof arg === 'number') {
    throw new TypeError('Argument must not be a number')
  }
  return Buffer(arg, encodingOrOffset, length)
};

SafeBuffer.alloc = function (size, fill, encoding) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  var buf = Buffer(size);
  if (fill !== undefined) {
    if (typeof encoding === 'string') {
      buf.fill(fill, encoding);
    } else {
      buf.fill(fill);
    }
  } else {
    buf.fill(0);
  }
  return buf
};

SafeBuffer.allocUnsafe = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return Buffer(size)
};

SafeBuffer.allocUnsafeSlow = function (size) {
  if (typeof size !== 'number') {
    throw new TypeError('Argument must be a number')
  }
  return buffer.SlowBuffer(size)
};
});
var safeBuffer_1 = safeBuffer.Buffer;

var Buffer$1 = safeBuffer.Buffer;
var Transform = stream.Transform;


function throwIfNotStringOrBuffer (val, prefix) {
  if (!Buffer$1.isBuffer(val) && typeof val !== 'string') {
    throw new TypeError(prefix + ' must be a string or a buffer')
  }
}

function HashBase (blockSize) {
  Transform.call(this);

  this._block = Buffer$1.allocUnsafe(blockSize);
  this._blockSize = blockSize;
  this._blockOffset = 0;
  this._length = [0, 0, 0, 0];

  this._finalized = false;
}

inherits_browser(HashBase, Transform);

HashBase.prototype._transform = function (chunk, encoding, callback) {
  var error = null;
  try {
    this.update(chunk, encoding);
  } catch (err) {
    error = err;
  }

  callback(error);
};

HashBase.prototype._flush = function (callback) {
  var error = null;
  try {
    this.push(this.digest());
  } catch (err) {
    error = err;
  }

  callback(error);
};

HashBase.prototype.update = function (data, encoding) {
  throwIfNotStringOrBuffer(data, 'Data');
  if (this._finalized) throw new Error('Digest already called')
  if (!Buffer$1.isBuffer(data)) data = Buffer$1.from(data, encoding);

  // consume data
  var block = this._block;
  var offset = 0;
  while (this._blockOffset + data.length - offset >= this._blockSize) {
    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++];
    this._update();
    this._blockOffset = 0;
  }
  while (offset < data.length) block[this._blockOffset++] = data[offset++];

  // update length
  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
    this._length[j] += carry;
    carry = (this._length[j] / 0x0100000000) | 0;
    if (carry > 0) this._length[j] -= 0x0100000000 * carry;
  }

  return this
};

HashBase.prototype._update = function () {
  throw new Error('_update is not implemented')
};

HashBase.prototype.digest = function (encoding) {
  if (this._finalized) throw new Error('Digest already called')
  this._finalized = true;

  var digest = this._digest();
  if (encoding !== undefined) digest = digest.toString(encoding);

  // reset state
  this._block.fill(0);
  this._blockOffset = 0;
  for (var i = 0; i < 4; ++i) this._length[i] = 0;

  return digest
};

HashBase.prototype._digest = function () {
  throw new Error('_digest is not implemented')
};

var hashBase = HashBase;

var Buffer$2 = safeBuffer.Buffer;

var ARRAY16 = new Array(16);

function MD5 () {
  hashBase.call(this, 64);

  // state
  this._a = 0x67452301;
  this._b = 0xefcdab89;
  this._c = 0x98badcfe;
  this._d = 0x10325476;
}

inherits_browser(MD5, hashBase);

MD5.prototype._update = function () {
  var M = ARRAY16;
  for (var i = 0; i < 16; ++i) M[i] = this._block.readInt32LE(i * 4);

  var a = this._a;
  var b = this._b;
  var c = this._c;
  var d = this._d;

  a = fnF(a, b, c, d, M[0], 0xd76aa478, 7);
  d = fnF(d, a, b, c, M[1], 0xe8c7b756, 12);
  c = fnF(c, d, a, b, M[2], 0x242070db, 17);
  b = fnF(b, c, d, a, M[3], 0xc1bdceee, 22);
  a = fnF(a, b, c, d, M[4], 0xf57c0faf, 7);
  d = fnF(d, a, b, c, M[5], 0x4787c62a, 12);
  c = fnF(c, d, a, b, M[6], 0xa8304613, 17);
  b = fnF(b, c, d, a, M[7], 0xfd469501, 22);
  a = fnF(a, b, c, d, M[8], 0x698098d8, 7);
  d = fnF(d, a, b, c, M[9], 0x8b44f7af, 12);
  c = fnF(c, d, a, b, M[10], 0xffff5bb1, 17);
  b = fnF(b, c, d, a, M[11], 0x895cd7be, 22);
  a = fnF(a, b, c, d, M[12], 0x6b901122, 7);
  d = fnF(d, a, b, c, M[13], 0xfd987193, 12);
  c = fnF(c, d, a, b, M[14], 0xa679438e, 17);
  b = fnF(b, c, d, a, M[15], 0x49b40821, 22);

  a = fnG(a, b, c, d, M[1], 0xf61e2562, 5);
  d = fnG(d, a, b, c, M[6], 0xc040b340, 9);
  c = fnG(c, d, a, b, M[11], 0x265e5a51, 14);
  b = fnG(b, c, d, a, M[0], 0xe9b6c7aa, 20);
  a = fnG(a, b, c, d, M[5], 0xd62f105d, 5);
  d = fnG(d, a, b, c, M[10], 0x02441453, 9);
  c = fnG(c, d, a, b, M[15], 0xd8a1e681, 14);
  b = fnG(b, c, d, a, M[4], 0xe7d3fbc8, 20);
  a = fnG(a, b, c, d, M[9], 0x21e1cde6, 5);
  d = fnG(d, a, b, c, M[14], 0xc33707d6, 9);
  c = fnG(c, d, a, b, M[3], 0xf4d50d87, 14);
  b = fnG(b, c, d, a, M[8], 0x455a14ed, 20);
  a = fnG(a, b, c, d, M[13], 0xa9e3e905, 5);
  d = fnG(d, a, b, c, M[2], 0xfcefa3f8, 9);
  c = fnG(c, d, a, b, M[7], 0x676f02d9, 14);
  b = fnG(b, c, d, a, M[12], 0x8d2a4c8a, 20);

  a = fnH(a, b, c, d, M[5], 0xfffa3942, 4);
  d = fnH(d, a, b, c, M[8], 0x8771f681, 11);
  c = fnH(c, d, a, b, M[11], 0x6d9d6122, 16);
  b = fnH(b, c, d, a, M[14], 0xfde5380c, 23);
  a = fnH(a, b, c, d, M[1], 0xa4beea44, 4);
  d = fnH(d, a, b, c, M[4], 0x4bdecfa9, 11);
  c = fnH(c, d, a, b, M[7], 0xf6bb4b60, 16);
  b = fnH(b, c, d, a, M[10], 0xbebfbc70, 23);
  a = fnH(a, b, c, d, M[13], 0x289b7ec6, 4);
  d = fnH(d, a, b, c, M[0], 0xeaa127fa, 11);
  c = fnH(c, d, a, b, M[3], 0xd4ef3085, 16);
  b = fnH(b, c, d, a, M[6], 0x04881d05, 23);
  a = fnH(a, b, c, d, M[9], 0xd9d4d039, 4);
  d = fnH(d, a, b, c, M[12], 0xe6db99e5, 11);
  c = fnH(c, d, a, b, M[15], 0x1fa27cf8, 16);
  b = fnH(b, c, d, a, M[2], 0xc4ac5665, 23);

  a = fnI(a, b, c, d, M[0], 0xf4292244, 6);
  d = fnI(d, a, b, c, M[7], 0x432aff97, 10);
  c = fnI(c, d, a, b, M[14], 0xab9423a7, 15);
  b = fnI(b, c, d, a, M[5], 0xfc93a039, 21);
  a = fnI(a, b, c, d, M[12], 0x655b59c3, 6);
  d = fnI(d, a, b, c, M[3], 0x8f0ccc92, 10);
  c = fnI(c, d, a, b, M[10], 0xffeff47d, 15);
  b = fnI(b, c, d, a, M[1], 0x85845dd1, 21);
  a = fnI(a, b, c, d, M[8], 0x6fa87e4f, 6);
  d = fnI(d, a, b, c, M[15], 0xfe2ce6e0, 10);
  c = fnI(c, d, a, b, M[6], 0xa3014314, 15);
  b = fnI(b, c, d, a, M[13], 0x4e0811a1, 21);
  a = fnI(a, b, c, d, M[4], 0xf7537e82, 6);
  d = fnI(d, a, b, c, M[11], 0xbd3af235, 10);
  c = fnI(c, d, a, b, M[2], 0x2ad7d2bb, 15);
  b = fnI(b, c, d, a, M[9], 0xeb86d391, 21);

  this._a = (this._a + a) | 0;
  this._b = (this._b + b) | 0;
  this._c = (this._c + c) | 0;
  this._d = (this._d + d) | 0;
};

MD5.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80;
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64);
    this._update();
    this._blockOffset = 0;
  }

  this._block.fill(0, this._blockOffset, 56);
  this._block.writeUInt32LE(this._length[0], 56);
  this._block.writeUInt32LE(this._length[1], 60);
  this._update();

  // produce result
  var buffer = Buffer$2.allocUnsafe(16);
  buffer.writeInt32LE(this._a, 0);
  buffer.writeInt32LE(this._b, 4);
  buffer.writeInt32LE(this._c, 8);
  buffer.writeInt32LE(this._d, 12);
  return buffer
};

function rotl (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fnF (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + b) | 0
}

function fnG (a, b, c, d, m, k, s) {
  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + b) | 0
}

function fnH (a, b, c, d, m, k, s) {
  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + b) | 0
}

function fnI (a, b, c, d, m, k, s) {
  return (rotl((a + ((c ^ (b | (~d)))) + m + k) | 0, s) + b) | 0
}

var md5_js = MD5;

var Buffer$3 = buffer.Buffer;



var ARRAY16$1 = new Array(16);

var zl = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
];

var zr = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
];

var sl = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
];

var sr = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
];

var hl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
var hr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

function RIPEMD160 () {
  hashBase.call(this, 64);

  // state
  this._a = 0x67452301;
  this._b = 0xefcdab89;
  this._c = 0x98badcfe;
  this._d = 0x10325476;
  this._e = 0xc3d2e1f0;
}

inherits_browser(RIPEMD160, hashBase);

RIPEMD160.prototype._update = function () {
  var words = ARRAY16$1;
  for (var j = 0; j < 16; ++j) words[j] = this._block.readInt32LE(j * 4);

  var al = this._a | 0;
  var bl = this._b | 0;
  var cl = this._c | 0;
  var dl = this._d | 0;
  var el = this._e | 0;

  var ar = this._a | 0;
  var br = this._b | 0;
  var cr = this._c | 0;
  var dr = this._d | 0;
  var er = this._e | 0;

  // computation
  for (var i = 0; i < 80; i += 1) {
    var tl;
    var tr;
    if (i < 16) {
      tl = fn1(al, bl, cl, dl, el, words[zl[i]], hl[0], sl[i]);
      tr = fn5(ar, br, cr, dr, er, words[zr[i]], hr[0], sr[i]);
    } else if (i < 32) {
      tl = fn2(al, bl, cl, dl, el, words[zl[i]], hl[1], sl[i]);
      tr = fn4(ar, br, cr, dr, er, words[zr[i]], hr[1], sr[i]);
    } else if (i < 48) {
      tl = fn3(al, bl, cl, dl, el, words[zl[i]], hl[2], sl[i]);
      tr = fn3(ar, br, cr, dr, er, words[zr[i]], hr[2], sr[i]);
    } else if (i < 64) {
      tl = fn4(al, bl, cl, dl, el, words[zl[i]], hl[3], sl[i]);
      tr = fn2(ar, br, cr, dr, er, words[zr[i]], hr[3], sr[i]);
    } else { // if (i<80) {
      tl = fn5(al, bl, cl, dl, el, words[zl[i]], hl[4], sl[i]);
      tr = fn1(ar, br, cr, dr, er, words[zr[i]], hr[4], sr[i]);
    }

    al = el;
    el = dl;
    dl = rotl$1(cl, 10);
    cl = bl;
    bl = tl;

    ar = er;
    er = dr;
    dr = rotl$1(cr, 10);
    cr = br;
    br = tr;
  }

  // update state
  var t = (this._b + cl + dr) | 0;
  this._b = (this._c + dl + er) | 0;
  this._c = (this._d + el + ar) | 0;
  this._d = (this._e + al + br) | 0;
  this._e = (this._a + bl + cr) | 0;
  this._a = t;
};

RIPEMD160.prototype._digest = function () {
  // create padding and handle blocks
  this._block[this._blockOffset++] = 0x80;
  if (this._blockOffset > 56) {
    this._block.fill(0, this._blockOffset, 64);
    this._update();
    this._blockOffset = 0;
  }

  this._block.fill(0, this._blockOffset, 56);
  this._block.writeUInt32LE(this._length[0], 56);
  this._block.writeUInt32LE(this._length[1], 60);
  this._update();

  // produce result
  var buffer = Buffer$3.alloc ? Buffer$3.alloc(20) : new Buffer$3(20);
  buffer.writeInt32LE(this._a, 0);
  buffer.writeInt32LE(this._b, 4);
  buffer.writeInt32LE(this._c, 8);
  buffer.writeInt32LE(this._d, 12);
  buffer.writeInt32LE(this._e, 16);
  return buffer
};

function rotl$1 (x, n) {
  return (x << n) | (x >>> (32 - n))
}

function fn1 (a, b, c, d, e, m, k, s) {
  return (rotl$1((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
}

function fn2 (a, b, c, d, e, m, k, s) {
  return (rotl$1((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
}

function fn3 (a, b, c, d, e, m, k, s) {
  return (rotl$1((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
}

function fn4 (a, b, c, d, e, m, k, s) {
  return (rotl$1((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
}

function fn5 (a, b, c, d, e, m, k, s) {
  return (rotl$1((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
}

var ripemd160 = RIPEMD160;

var Buffer$4 = safeBuffer.Buffer;

// prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = Buffer$4.alloc(blockSize);
  this._finalSize = finalSize;
  this._blockSize = blockSize;
  this._len = 0;
}

Hash.prototype.update = function (data, enc) {
  if (typeof data === 'string') {
    enc = enc || 'utf8';
    data = Buffer$4.from(data, enc);
  }

  var block = this._block;
  var blockSize = this._blockSize;
  var length = data.length;
  var accum = this._len;

  for (var offset = 0; offset < length;) {
    var assigned = accum % blockSize;
    var remainder = Math.min(length - offset, blockSize - assigned);

    for (var i = 0; i < remainder; i++) {
      block[assigned + i] = data[offset + i];
    }

    accum += remainder;
    offset += remainder;

    if ((accum % blockSize) === 0) {
      this._update(block);
    }
  }

  this._len += length;
  return this
};

Hash.prototype.digest = function (enc) {
  var rem = this._len % this._blockSize;

  this._block[rem] = 0x80;

  // zero (rem + 1) trailing bits, where (rem + 1) is the smallest
  // non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
  this._block.fill(0, rem + 1);

  if (rem >= this._finalSize) {
    this._update(this._block);
    this._block.fill(0);
  }

  var bits = this._len * 8;

  // uint32
  if (bits <= 0xffffffff) {
    this._block.writeUInt32BE(bits, this._blockSize - 4);

  // uint64
  } else {
    var lowBits = (bits & 0xffffffff) >>> 0;
    var highBits = (bits - lowBits) / 0x100000000;

    this._block.writeUInt32BE(highBits, this._blockSize - 8);
    this._block.writeUInt32BE(lowBits, this._blockSize - 4);
  }

  this._update(this._block);
  var hash = this._hash();

  return enc ? hash.toString(enc) : hash
};

Hash.prototype._update = function () {
  throw new Error('_update must be implemented by subclass')
};

var hash = Hash;

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
 * in FIPS PUB 180-1
 * This source code is derived from sha1.js of the same repository.
 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
 * operation was added.
 */



var Buffer$5 = safeBuffer.Buffer;

var K = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
];

var W = new Array(80);

function Sha () {
  this.init();
  this._w = W;

  hash.call(this, 64, 56);
}

inherits_browser(Sha, hash);

Sha.prototype.init = function () {
  this._a = 0x67452301;
  this._b = 0xefcdab89;
  this._c = 0x98badcfe;
  this._d = 0x10325476;
  this._e = 0xc3d2e1f0;

  return this
};

function rotl5 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30 (num) {
  return (num << 30) | (num >>> 2)
}

function ft (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha.prototype._update = function (M) {
  var W = this._w;

  var a = this._a | 0;
  var b = this._b | 0;
  var c = this._c | 0;
  var d = this._d | 0;
  var e = this._e | 0;

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4);
  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20);
    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0;

    e = d;
    d = c;
    c = rotl30(b);
    b = a;
    a = t;
  }

  this._a = (a + this._a) | 0;
  this._b = (b + this._b) | 0;
  this._c = (c + this._c) | 0;
  this._d = (d + this._d) | 0;
  this._e = (e + this._e) | 0;
};

Sha.prototype._hash = function () {
  var H = Buffer$5.allocUnsafe(20);

  H.writeInt32BE(this._a | 0, 0);
  H.writeInt32BE(this._b | 0, 4);
  H.writeInt32BE(this._c | 0, 8);
  H.writeInt32BE(this._d | 0, 12);
  H.writeInt32BE(this._e | 0, 16);

  return H
};

var sha = Sha;

/*
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
 * in FIPS PUB 180-1
 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 * Distributed under the BSD License
 * See http://pajhome.org.uk/crypt/md5 for details.
 */



var Buffer$6 = safeBuffer.Buffer;

var K$1 = [
  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
];

var W$1 = new Array(80);

function Sha1 () {
  this.init();
  this._w = W$1;

  hash.call(this, 64, 56);
}

inherits_browser(Sha1, hash);

Sha1.prototype.init = function () {
  this._a = 0x67452301;
  this._b = 0xefcdab89;
  this._c = 0x98badcfe;
  this._d = 0x10325476;
  this._e = 0xc3d2e1f0;

  return this
};

function rotl1 (num) {
  return (num << 1) | (num >>> 31)
}

function rotl5$1 (num) {
  return (num << 5) | (num >>> 27)
}

function rotl30$1 (num) {
  return (num << 30) | (num >>> 2)
}

function ft$1 (s, b, c, d) {
  if (s === 0) return (b & c) | ((~b) & d)
  if (s === 2) return (b & c) | (b & d) | (c & d)
  return b ^ c ^ d
}

Sha1.prototype._update = function (M) {
  var W = this._w;

  var a = this._a | 0;
  var b = this._b | 0;
  var c = this._c | 0;
  var d = this._d | 0;
  var e = this._e | 0;

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4);
  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]);

  for (var j = 0; j < 80; ++j) {
    var s = ~~(j / 20);
    var t = (rotl5$1(a) + ft$1(s, b, c, d) + e + W[j] + K$1[s]) | 0;

    e = d;
    d = c;
    c = rotl30$1(b);
    b = a;
    a = t;
  }

  this._a = (a + this._a) | 0;
  this._b = (b + this._b) | 0;
  this._c = (c + this._c) | 0;
  this._d = (d + this._d) | 0;
  this._e = (e + this._e) | 0;
};

Sha1.prototype._hash = function () {
  var H = Buffer$6.allocUnsafe(20);

  H.writeInt32BE(this._a | 0, 0);
  H.writeInt32BE(this._b | 0, 4);
  H.writeInt32BE(this._c | 0, 8);
  H.writeInt32BE(this._d | 0, 12);
  H.writeInt32BE(this._e | 0, 16);

  return H
};

var sha1 = Sha1;

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */



var Buffer$7 = safeBuffer.Buffer;

var K$2 = [
  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
];

var W$2 = new Array(64);

function Sha256 () {
  this.init();

  this._w = W$2; // new Array(64)

  hash.call(this, 64, 56);
}

inherits_browser(Sha256, hash);

Sha256.prototype.init = function () {
  this._a = 0x6a09e667;
  this._b = 0xbb67ae85;
  this._c = 0x3c6ef372;
  this._d = 0xa54ff53a;
  this._e = 0x510e527f;
  this._f = 0x9b05688c;
  this._g = 0x1f83d9ab;
  this._h = 0x5be0cd19;

  return this
};

function ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0 (x) {
  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
}

function sigma1 (x) {
  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
}

function gamma0 (x) {
  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
}

function gamma1 (x) {
  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
}

Sha256.prototype._update = function (M) {
  var W = this._w;

  var a = this._a | 0;
  var b = this._b | 0;
  var c = this._c | 0;
  var d = this._d | 0;
  var e = this._e | 0;
  var f = this._f | 0;
  var g = this._g | 0;
  var h = this._h | 0;

  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4);
  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0;

  for (var j = 0; j < 64; ++j) {
    var T1 = (h + sigma1(e) + ch(e, f, g) + K$2[j] + W[j]) | 0;
    var T2 = (sigma0(a) + maj(a, b, c)) | 0;

    h = g;
    g = f;
    f = e;
    e = (d + T1) | 0;
    d = c;
    c = b;
    b = a;
    a = (T1 + T2) | 0;
  }

  this._a = (a + this._a) | 0;
  this._b = (b + this._b) | 0;
  this._c = (c + this._c) | 0;
  this._d = (d + this._d) | 0;
  this._e = (e + this._e) | 0;
  this._f = (f + this._f) | 0;
  this._g = (g + this._g) | 0;
  this._h = (h + this._h) | 0;
};

Sha256.prototype._hash = function () {
  var H = Buffer$7.allocUnsafe(32);

  H.writeInt32BE(this._a, 0);
  H.writeInt32BE(this._b, 4);
  H.writeInt32BE(this._c, 8);
  H.writeInt32BE(this._d, 12);
  H.writeInt32BE(this._e, 16);
  H.writeInt32BE(this._f, 20);
  H.writeInt32BE(this._g, 24);
  H.writeInt32BE(this._h, 28);

  return H
};

var sha256 = Sha256;

/**
 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
 * in FIPS 180-2
 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
 *
 */




var Buffer$8 = safeBuffer.Buffer;

var W$3 = new Array(64);

function Sha224 () {
  this.init();

  this._w = W$3; // new Array(64)

  hash.call(this, 64, 56);
}

inherits_browser(Sha224, sha256);

Sha224.prototype.init = function () {
  this._a = 0xc1059ed8;
  this._b = 0x367cd507;
  this._c = 0x3070dd17;
  this._d = 0xf70e5939;
  this._e = 0xffc00b31;
  this._f = 0x68581511;
  this._g = 0x64f98fa7;
  this._h = 0xbefa4fa4;

  return this
};

Sha224.prototype._hash = function () {
  var H = Buffer$8.allocUnsafe(28);

  H.writeInt32BE(this._a, 0);
  H.writeInt32BE(this._b, 4);
  H.writeInt32BE(this._c, 8);
  H.writeInt32BE(this._d, 12);
  H.writeInt32BE(this._e, 16);
  H.writeInt32BE(this._f, 20);
  H.writeInt32BE(this._g, 24);

  return H
};

var sha224 = Sha224;

var Buffer$9 = safeBuffer.Buffer;

var K$3 = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

var W$4 = new Array(160);

function Sha512 () {
  this.init();
  this._w = W$4;

  hash.call(this, 128, 112);
}

inherits_browser(Sha512, hash);

Sha512.prototype.init = function () {
  this._ah = 0x6a09e667;
  this._bh = 0xbb67ae85;
  this._ch = 0x3c6ef372;
  this._dh = 0xa54ff53a;
  this._eh = 0x510e527f;
  this._fh = 0x9b05688c;
  this._gh = 0x1f83d9ab;
  this._hh = 0x5be0cd19;

  this._al = 0xf3bcc908;
  this._bl = 0x84caa73b;
  this._cl = 0xfe94f82b;
  this._dl = 0x5f1d36f1;
  this._el = 0xade682d1;
  this._fl = 0x2b3e6c1f;
  this._gl = 0xfb41bd6b;
  this._hl = 0x137e2179;

  return this
};

function Ch (x, y, z) {
  return z ^ (x & (y ^ z))
}

function maj$1 (x, y, z) {
  return (x & y) | (z & (x | y))
}

function sigma0$1 (x, xl) {
  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
}

function sigma1$1 (x, xl) {
  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
}

function Gamma0 (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
}

function Gamma0l (x, xl) {
  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
}

function Gamma1 (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
}

function Gamma1l (x, xl) {
  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
}

function getCarry (a, b) {
  return (a >>> 0) < (b >>> 0) ? 1 : 0
}

Sha512.prototype._update = function (M) {
  var W = this._w;

  var ah = this._ah | 0;
  var bh = this._bh | 0;
  var ch = this._ch | 0;
  var dh = this._dh | 0;
  var eh = this._eh | 0;
  var fh = this._fh | 0;
  var gh = this._gh | 0;
  var hh = this._hh | 0;

  var al = this._al | 0;
  var bl = this._bl | 0;
  var cl = this._cl | 0;
  var dl = this._dl | 0;
  var el = this._el | 0;
  var fl = this._fl | 0;
  var gl = this._gl | 0;
  var hl = this._hl | 0;

  for (var i = 0; i < 32; i += 2) {
    W[i] = M.readInt32BE(i * 4);
    W[i + 1] = M.readInt32BE(i * 4 + 4);
  }
  for (; i < 160; i += 2) {
    var xh = W[i - 15 * 2];
    var xl = W[i - 15 * 2 + 1];
    var gamma0 = Gamma0(xh, xl);
    var gamma0l = Gamma0l(xl, xh);

    xh = W[i - 2 * 2];
    xl = W[i - 2 * 2 + 1];
    var gamma1 = Gamma1(xh, xl);
    var gamma1l = Gamma1l(xl, xh);

    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
    var Wi7h = W[i - 7 * 2];
    var Wi7l = W[i - 7 * 2 + 1];

    var Wi16h = W[i - 16 * 2];
    var Wi16l = W[i - 16 * 2 + 1];

    var Wil = (gamma0l + Wi7l) | 0;
    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0;
    Wil = (Wil + gamma1l) | 0;
    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0;
    Wil = (Wil + Wi16l) | 0;
    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0;

    W[i] = Wih;
    W[i + 1] = Wil;
  }

  for (var j = 0; j < 160; j += 2) {
    Wih = W[j];
    Wil = W[j + 1];

    var majh = maj$1(ah, bh, ch);
    var majl = maj$1(al, bl, cl);

    var sigma0h = sigma0$1(ah, al);
    var sigma0l = sigma0$1(al, ah);
    var sigma1h = sigma1$1(eh, el);
    var sigma1l = sigma1$1(el, eh);

    // t1 = h + sigma1 + ch + K[j] + W[j]
    var Kih = K$3[j];
    var Kil = K$3[j + 1];

    var chh = Ch(eh, fh, gh);
    var chl = Ch(el, fl, gl);

    var t1l = (hl + sigma1l) | 0;
    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0;
    t1l = (t1l + chl) | 0;
    t1h = (t1h + chh + getCarry(t1l, chl)) | 0;
    t1l = (t1l + Kil) | 0;
    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0;
    t1l = (t1l + Wil) | 0;
    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0;

    // t2 = sigma0 + maj
    var t2l = (sigma0l + majl) | 0;
    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0;

    hh = gh;
    hl = gl;
    gh = fh;
    gl = fl;
    fh = eh;
    fl = el;
    el = (dl + t1l) | 0;
    eh = (dh + t1h + getCarry(el, dl)) | 0;
    dh = ch;
    dl = cl;
    ch = bh;
    cl = bl;
    bh = ah;
    bl = al;
    al = (t1l + t2l) | 0;
    ah = (t1h + t2h + getCarry(al, t1l)) | 0;
  }

  this._al = (this._al + al) | 0;
  this._bl = (this._bl + bl) | 0;
  this._cl = (this._cl + cl) | 0;
  this._dl = (this._dl + dl) | 0;
  this._el = (this._el + el) | 0;
  this._fl = (this._fl + fl) | 0;
  this._gl = (this._gl + gl) | 0;
  this._hl = (this._hl + hl) | 0;

  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0;
  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0;
  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0;
  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0;
  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0;
  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0;
  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0;
  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0;
};

Sha512.prototype._hash = function () {
  var H = Buffer$9.allocUnsafe(64);

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset);
    H.writeInt32BE(l, offset + 4);
  }

  writeInt64BE(this._ah, this._al, 0);
  writeInt64BE(this._bh, this._bl, 8);
  writeInt64BE(this._ch, this._cl, 16);
  writeInt64BE(this._dh, this._dl, 24);
  writeInt64BE(this._eh, this._el, 32);
  writeInt64BE(this._fh, this._fl, 40);
  writeInt64BE(this._gh, this._gl, 48);
  writeInt64BE(this._hh, this._hl, 56);

  return H
};

var sha512 = Sha512;

var Buffer$a = safeBuffer.Buffer;

var W$5 = new Array(160);

function Sha384 () {
  this.init();
  this._w = W$5;

  hash.call(this, 128, 112);
}

inherits_browser(Sha384, sha512);

Sha384.prototype.init = function () {
  this._ah = 0xcbbb9d5d;
  this._bh = 0x629a292a;
  this._ch = 0x9159015a;
  this._dh = 0x152fecd8;
  this._eh = 0x67332667;
  this._fh = 0x8eb44a87;
  this._gh = 0xdb0c2e0d;
  this._hh = 0x47b5481d;

  this._al = 0xc1059ed8;
  this._bl = 0x367cd507;
  this._cl = 0x3070dd17;
  this._dl = 0xf70e5939;
  this._el = 0xffc00b31;
  this._fl = 0x68581511;
  this._gl = 0x64f98fa7;
  this._hl = 0xbefa4fa4;

  return this
};

Sha384.prototype._hash = function () {
  var H = Buffer$a.allocUnsafe(48);

  function writeInt64BE (h, l, offset) {
    H.writeInt32BE(h, offset);
    H.writeInt32BE(l, offset + 4);
  }

  writeInt64BE(this._ah, this._al, 0);
  writeInt64BE(this._bh, this._bl, 8);
  writeInt64BE(this._ch, this._cl, 16);
  writeInt64BE(this._dh, this._dl, 24);
  writeInt64BE(this._eh, this._el, 32);
  writeInt64BE(this._fh, this._fl, 40);

  return H
};

var sha384 = Sha384;

var sha_js = createCommonjsModule(function (module) {
var exports = module.exports = function SHA (algorithm) {
  algorithm = algorithm.toLowerCase();

  var Algorithm = exports[algorithm];
  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

  return new Algorithm()
};

exports.sha = sha;
exports.sha1 = sha1;
exports.sha224 = sha224;
exports.sha256 = sha256;
exports.sha384 = sha384;
exports.sha512 = sha512;
});

var Buffer$b = safeBuffer.Buffer;
var Transform$1 = stream.Transform;
var StringDecoder = string_decoder.StringDecoder;


function CipherBase (hashMode) {
  Transform$1.call(this);
  this.hashMode = typeof hashMode === 'string';
  if (this.hashMode) {
    this[hashMode] = this._finalOrDigest;
  } else {
    this.final = this._finalOrDigest;
  }
  if (this._final) {
    this.__final = this._final;
    this._final = null;
  }
  this._decoder = null;
  this._encoding = null;
}
inherits_browser(CipherBase, Transform$1);

CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = Buffer$b.from(data, inputEnc);
  }

  var outData = this._update(data);
  if (this.hashMode) return this

  if (outputEnc) {
    outData = this._toString(outData, outputEnc);
  }

  return outData
};

CipherBase.prototype.setAutoPadding = function () {};
CipherBase.prototype.getAuthTag = function () {
  throw new Error('trying to get auth tag in unsupported state')
};

CipherBase.prototype.setAuthTag = function () {
  throw new Error('trying to set auth tag in unsupported state')
};

CipherBase.prototype.setAAD = function () {
  throw new Error('trying to set aad in unsupported state')
};

CipherBase.prototype._transform = function (data, _, next) {
  var err;
  try {
    if (this.hashMode) {
      this._update(data);
    } else {
      this.push(this._update(data));
    }
  } catch (e) {
    err = e;
  } finally {
    next(err);
  }
};
CipherBase.prototype._flush = function (done) {
  var err;
  try {
    this.push(this.__final());
  } catch (e) {
    err = e;
  }

  done(err);
};
CipherBase.prototype._finalOrDigest = function (outputEnc) {
  var outData = this.__final() || Buffer$b.alloc(0);
  if (outputEnc) {
    outData = this._toString(outData, outputEnc, true);
  }
  return outData
};

CipherBase.prototype._toString = function (value, enc, fin) {
  if (!this._decoder) {
    this._decoder = new StringDecoder(enc);
    this._encoding = enc;
  }

  if (this._encoding !== enc) throw new Error('can\'t switch encodings')

  var out = this._decoder.write(value);
  if (fin) {
    out += this._decoder.end();
  }

  return out
};

var cipherBase = CipherBase;

function Hash$1 (hash) {
  cipherBase.call(this, 'digest');

  this._hash = hash;
}

inherits_browser(Hash$1, cipherBase);

Hash$1.prototype._update = function (data) {
  this._hash.update(data);
};

Hash$1.prototype._final = function () {
  return this._hash.digest()
};

var browser = function createHash (alg) {
  alg = alg.toLowerCase();
  if (alg === 'md5') return new md5_js()
  if (alg === 'rmd160' || alg === 'ripemd160') return new ripemd160()

  return new Hash$1(sha_js(alg))
};

var MAX_ALLOC = Math.pow(2, 30) - 1; // default in iojs

function checkBuffer (buf, name) {
  if (typeof buf !== 'string' && !Buffer.isBuffer(buf)) {
    throw new TypeError(name + ' must be a buffer or string')
  }
}

var precondition = function (password, salt, iterations, keylen) {
  checkBuffer(password, 'Password');
  checkBuffer(salt, 'Salt');

  if (typeof iterations !== 'number') {
    throw new TypeError('Iterations not a number')
  }

  if (iterations < 0) {
    throw new TypeError('Bad iterations')
  }

  if (typeof keylen !== 'number') {
    throw new TypeError('Key length not a number')
  }

  if (keylen < 0 || keylen > MAX_ALLOC || keylen !== keylen) { /* eslint no-self-compare: 0 */
    throw new TypeError('Bad key length')
  }
};

var defaultEncoding;
/* istanbul ignore next */
if (process.browser) {
  defaultEncoding = 'utf-8';
} else {
  var pVersionMajor = parseInt(process.version.split('.')[0].slice(1), 10);

  defaultEncoding = pVersionMajor >= 6 ? 'utf-8' : 'binary';
}
var defaultEncoding_1 = defaultEncoding;

var md5 = function (buffer) {
  return new md5_js().update(buffer).digest()
};

var Buffer$c = safeBuffer.Buffer;
var ZEROS = Buffer$c.alloc(128);
var sizes = {
  md5: 16,
  sha1: 20,
  sha224: 28,
  sha256: 32,
  sha384: 48,
  sha512: 64,
  rmd160: 20,
  ripemd160: 20
};

function Hmac (alg, key, saltLen) {
  var hash = getDigest(alg);
  var blocksize = (alg === 'sha512' || alg === 'sha384') ? 128 : 64;

  if (key.length > blocksize) {
    key = hash(key);
  } else if (key.length < blocksize) {
    key = Buffer$c.concat([key, ZEROS], blocksize);
  }

  var ipad = Buffer$c.allocUnsafe(blocksize + sizes[alg]);
  var opad = Buffer$c.allocUnsafe(blocksize + sizes[alg]);
  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5C;
  }

  var ipad1 = Buffer$c.allocUnsafe(blocksize + saltLen + 4);
  ipad.copy(ipad1, 0, 0, blocksize);
  this.ipad1 = ipad1;
  this.ipad2 = ipad;
  this.opad = opad;
  this.alg = alg;
  this.blocksize = blocksize;
  this.hash = hash;
  this.size = sizes[alg];
}

Hmac.prototype.run = function (data, ipad) {
  data.copy(ipad, this.blocksize);
  var h = this.hash(ipad);
  h.copy(this.opad, this.blocksize);
  return this.hash(this.opad)
};

function getDigest (alg) {
  function shaFunc (data) {
    return sha_js(alg).update(data).digest()
  }
  function rmd160Func (data) {
    return new ripemd160().update(data).digest()
  }

  if (alg === 'rmd160' || alg === 'ripemd160') return rmd160Func
  if (alg === 'md5') return md5
  return shaFunc
}

function pbkdf2 (password, salt, iterations, keylen, digest) {
  precondition(password, salt, iterations, keylen);

  if (!Buffer$c.isBuffer(password)) password = Buffer$c.from(password, defaultEncoding_1);
  if (!Buffer$c.isBuffer(salt)) salt = Buffer$c.from(salt, defaultEncoding_1);

  digest = digest || 'sha1';

  var hmac = new Hmac(digest, password, salt.length);

  var DK = Buffer$c.allocUnsafe(keylen);
  var block1 = Buffer$c.allocUnsafe(salt.length + 4);
  salt.copy(block1, 0, 0, salt.length);

  var destPos = 0;
  var hLen = sizes[digest];
  var l = Math.ceil(keylen / hLen);

  for (var i = 1; i <= l; i++) {
    block1.writeUInt32BE(i, salt.length);

    var T = hmac.run(block1, hmac.ipad1);
    var U = T;

    for (var j = 1; j < iterations; j++) {
      U = hmac.run(U, hmac.ipad2);
      for (var k = 0; k < hLen; k++) T[k] ^= U[k];
    }

    T.copy(DK, destPos);
    destPos += hLen;
  }

  return DK
}

var syncBrowser = pbkdf2;

var Buffer$d = safeBuffer.Buffer;

var ZERO_BUF;
var subtle = commonjsGlobal.crypto && commonjsGlobal.crypto.subtle;
var toBrowser = {
  'sha': 'SHA-1',
  'sha-1': 'SHA-1',
  'sha1': 'SHA-1',
  'sha256': 'SHA-256',
  'sha-256': 'SHA-256',
  'sha384': 'SHA-384',
  'sha-384': 'SHA-384',
  'sha-512': 'SHA-512',
  'sha512': 'SHA-512'
};
var checks = [];
function checkNative (algo) {
  if (commonjsGlobal.process && !commonjsGlobal.process.browser) {
    return Promise.resolve(false)
  }
  if (!subtle || !subtle.importKey || !subtle.deriveBits) {
    return Promise.resolve(false)
  }
  if (checks[algo] !== undefined) {
    return checks[algo]
  }
  ZERO_BUF = ZERO_BUF || Buffer$d.alloc(8);
  var prom = browserPbkdf2(ZERO_BUF, ZERO_BUF, 10, 128, algo)
    .then(function () {
      return true
    }).catch(function () {
      return false
    });
  checks[algo] = prom;
  return prom
}

function browserPbkdf2 (password, salt, iterations, length, algo) {
  return subtle.importKey(
    'raw', password, {name: 'PBKDF2'}, false, ['deriveBits']
  ).then(function (key) {
    return subtle.deriveBits({
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: {
        name: algo
      }
    }, key, length << 3)
  }).then(function (res) {
    return Buffer$d.from(res)
  })
}

function resolvePromise (promise, callback) {
  promise.then(function (out) {
    process.nextTick(function () {
      callback(null, out);
    });
  }, function (e) {
    process.nextTick(function () {
      callback(e);
    });
  });
}
var async = function (password, salt, iterations, keylen, digest, callback) {
  if (typeof digest === 'function') {
    callback = digest;
    digest = undefined;
  }

  digest = digest || 'sha1';
  var algo = toBrowser[digest.toLowerCase()];

  if (!algo || typeof commonjsGlobal.Promise !== 'function') {
    return process.nextTick(function () {
      var out;
      try {
        out = syncBrowser(password, salt, iterations, keylen, digest);
      } catch (e) {
        return callback(e)
      }
      callback(null, out);
    })
  }

  precondition(password, salt, iterations, keylen);
  if (typeof callback !== 'function') throw new Error('No callback provided to pbkdf2')
  if (!Buffer$d.isBuffer(password)) password = Buffer$d.from(password, defaultEncoding_1);
  if (!Buffer$d.isBuffer(salt)) salt = Buffer$d.from(salt, defaultEncoding_1);

  resolvePromise(checkNative(algo).then(function (resp) {
    if (resp) return browserPbkdf2(password, salt, iterations, keylen, algo)

    return syncBrowser(password, salt, iterations, keylen, digest)
  }), callback);
};

var pbkdf2$1 = async;
var pbkdf2Sync = syncBrowser;

var browser$1 = {
	pbkdf2: pbkdf2$1,
	pbkdf2Sync: pbkdf2Sync
};

var browser$2 = createCommonjsModule(function (module) {

// limit of Crypto.getRandomValues()
// https://developer.mozilla.org/en-US/docs/Web/API/Crypto/getRandomValues
var MAX_BYTES = 65536;

// Node supports requesting up to this number of bytes
// https://github.com/nodejs/node/blob/master/lib/internal/crypto/random.js#L48
var MAX_UINT32 = 4294967295;

function oldBrowser () {
  throw new Error('Secure random number generation is not supported by this browser.\nUse Chrome, Firefox or Internet Explorer 11')
}

var Buffer = safeBuffer.Buffer;
var crypto = commonjsGlobal.crypto || commonjsGlobal.msCrypto;

if (crypto && crypto.getRandomValues) {
  module.exports = randomBytes;
} else {
  module.exports = oldBrowser;
}

function randomBytes (size, cb) {
  // phantomjs needs to throw
  if (size > MAX_UINT32) throw new RangeError('requested too many random bytes')

  var bytes = Buffer.allocUnsafe(size);

  if (size > 0) {  // getRandomValues fails on IE if size == 0
    if (size > MAX_BYTES) { // this is the max bytes crypto.getRandomValues
      // can do at once see https://developer.mozilla.org/en-US/docs/Web/API/window.crypto.getRandomValues
      for (var generated = 0; generated < size; generated += MAX_BYTES) {
        // buffer.slice automatically checks if the end is past the end of
        // the buffer so we don't have to here
        crypto.getRandomValues(bytes.slice(generated, generated + MAX_BYTES));
      }
    } else {
      crypto.getRandomValues(bytes);
    }
  }

  if (typeof cb === 'function') {
    return process.nextTick(function () {
      cb(null, bytes);
    })
  }

  return bytes
}
});

var chinese_simplified = [
	"的",
	"一",
	"是",
	"在",
	"不",
	"了",
	"有",
	"和",
	"人",
	"这",
	"中",
	"大",
	"为",
	"上",
	"个",
	"国",
	"我",
	"以",
	"要",
	"他",
	"时",
	"来",
	"用",
	"们",
	"生",
	"到",
	"作",
	"地",
	"于",
	"出",
	"就",
	"分",
	"对",
	"成",
	"会",
	"可",
	"主",
	"发",
	"年",
	"动",
	"同",
	"工",
	"也",
	"能",
	"下",
	"过",
	"子",
	"说",
	"产",
	"种",
	"面",
	"而",
	"方",
	"后",
	"多",
	"定",
	"行",
	"学",
	"法",
	"所",
	"民",
	"得",
	"经",
	"十",
	"三",
	"之",
	"进",
	"着",
	"等",
	"部",
	"度",
	"家",
	"电",
	"力",
	"里",
	"如",
	"水",
	"化",
	"高",
	"自",
	"二",
	"理",
	"起",
	"小",
	"物",
	"现",
	"实",
	"加",
	"量",
	"都",
	"两",
	"体",
	"制",
	"机",
	"当",
	"使",
	"点",
	"从",
	"业",
	"本",
	"去",
	"把",
	"性",
	"好",
	"应",
	"开",
	"它",
	"合",
	"还",
	"因",
	"由",
	"其",
	"些",
	"然",
	"前",
	"外",
	"天",
	"政",
	"四",
	"日",
	"那",
	"社",
	"义",
	"事",
	"平",
	"形",
	"相",
	"全",
	"表",
	"间",
	"样",
	"与",
	"关",
	"各",
	"重",
	"新",
	"线",
	"内",
	"数",
	"正",
	"心",
	"反",
	"你",
	"明",
	"看",
	"原",
	"又",
	"么",
	"利",
	"比",
	"或",
	"但",
	"质",
	"气",
	"第",
	"向",
	"道",
	"命",
	"此",
	"变",
	"条",
	"只",
	"没",
	"结",
	"解",
	"问",
	"意",
	"建",
	"月",
	"公",
	"无",
	"系",
	"军",
	"很",
	"情",
	"者",
	"最",
	"立",
	"代",
	"想",
	"已",
	"通",
	"并",
	"提",
	"直",
	"题",
	"党",
	"程",
	"展",
	"五",
	"果",
	"料",
	"象",
	"员",
	"革",
	"位",
	"入",
	"常",
	"文",
	"总",
	"次",
	"品",
	"式",
	"活",
	"设",
	"及",
	"管",
	"特",
	"件",
	"长",
	"求",
	"老",
	"头",
	"基",
	"资",
	"边",
	"流",
	"路",
	"级",
	"少",
	"图",
	"山",
	"统",
	"接",
	"知",
	"较",
	"将",
	"组",
	"见",
	"计",
	"别",
	"她",
	"手",
	"角",
	"期",
	"根",
	"论",
	"运",
	"农",
	"指",
	"几",
	"九",
	"区",
	"强",
	"放",
	"决",
	"西",
	"被",
	"干",
	"做",
	"必",
	"战",
	"先",
	"回",
	"则",
	"任",
	"取",
	"据",
	"处",
	"队",
	"南",
	"给",
	"色",
	"光",
	"门",
	"即",
	"保",
	"治",
	"北",
	"造",
	"百",
	"规",
	"热",
	"领",
	"七",
	"海",
	"口",
	"东",
	"导",
	"器",
	"压",
	"志",
	"世",
	"金",
	"增",
	"争",
	"济",
	"阶",
	"油",
	"思",
	"术",
	"极",
	"交",
	"受",
	"联",
	"什",
	"认",
	"六",
	"共",
	"权",
	"收",
	"证",
	"改",
	"清",
	"美",
	"再",
	"采",
	"转",
	"更",
	"单",
	"风",
	"切",
	"打",
	"白",
	"教",
	"速",
	"花",
	"带",
	"安",
	"场",
	"身",
	"车",
	"例",
	"真",
	"务",
	"具",
	"万",
	"每",
	"目",
	"至",
	"达",
	"走",
	"积",
	"示",
	"议",
	"声",
	"报",
	"斗",
	"完",
	"类",
	"八",
	"离",
	"华",
	"名",
	"确",
	"才",
	"科",
	"张",
	"信",
	"马",
	"节",
	"话",
	"米",
	"整",
	"空",
	"元",
	"况",
	"今",
	"集",
	"温",
	"传",
	"土",
	"许",
	"步",
	"群",
	"广",
	"石",
	"记",
	"需",
	"段",
	"研",
	"界",
	"拉",
	"林",
	"律",
	"叫",
	"且",
	"究",
	"观",
	"越",
	"织",
	"装",
	"影",
	"算",
	"低",
	"持",
	"音",
	"众",
	"书",
	"布",
	"复",
	"容",
	"儿",
	"须",
	"际",
	"商",
	"非",
	"验",
	"连",
	"断",
	"深",
	"难",
	"近",
	"矿",
	"千",
	"周",
	"委",
	"素",
	"技",
	"备",
	"半",
	"办",
	"青",
	"省",
	"列",
	"习",
	"响",
	"约",
	"支",
	"般",
	"史",
	"感",
	"劳",
	"便",
	"团",
	"往",
	"酸",
	"历",
	"市",
	"克",
	"何",
	"除",
	"消",
	"构",
	"府",
	"称",
	"太",
	"准",
	"精",
	"值",
	"号",
	"率",
	"族",
	"维",
	"划",
	"选",
	"标",
	"写",
	"存",
	"候",
	"毛",
	"亲",
	"快",
	"效",
	"斯",
	"院",
	"查",
	"江",
	"型",
	"眼",
	"王",
	"按",
	"格",
	"养",
	"易",
	"置",
	"派",
	"层",
	"片",
	"始",
	"却",
	"专",
	"状",
	"育",
	"厂",
	"京",
	"识",
	"适",
	"属",
	"圆",
	"包",
	"火",
	"住",
	"调",
	"满",
	"县",
	"局",
	"照",
	"参",
	"红",
	"细",
	"引",
	"听",
	"该",
	"铁",
	"价",
	"严",
	"首",
	"底",
	"液",
	"官",
	"德",
	"随",
	"病",
	"苏",
	"失",
	"尔",
	"死",
	"讲",
	"配",
	"女",
	"黄",
	"推",
	"显",
	"谈",
	"罪",
	"神",
	"艺",
	"呢",
	"席",
	"含",
	"企",
	"望",
	"密",
	"批",
	"营",
	"项",
	"防",
	"举",
	"球",
	"英",
	"氧",
	"势",
	"告",
	"李",
	"台",
	"落",
	"木",
	"帮",
	"轮",
	"破",
	"亚",
	"师",
	"围",
	"注",
	"远",
	"字",
	"材",
	"排",
	"供",
	"河",
	"态",
	"封",
	"另",
	"施",
	"减",
	"树",
	"溶",
	"怎",
	"止",
	"案",
	"言",
	"士",
	"均",
	"武",
	"固",
	"叶",
	"鱼",
	"波",
	"视",
	"仅",
	"费",
	"紧",
	"爱",
	"左",
	"章",
	"早",
	"朝",
	"害",
	"续",
	"轻",
	"服",
	"试",
	"食",
	"充",
	"兵",
	"源",
	"判",
	"护",
	"司",
	"足",
	"某",
	"练",
	"差",
	"致",
	"板",
	"田",
	"降",
	"黑",
	"犯",
	"负",
	"击",
	"范",
	"继",
	"兴",
	"似",
	"余",
	"坚",
	"曲",
	"输",
	"修",
	"故",
	"城",
	"夫",
	"够",
	"送",
	"笔",
	"船",
	"占",
	"右",
	"财",
	"吃",
	"富",
	"春",
	"职",
	"觉",
	"汉",
	"画",
	"功",
	"巴",
	"跟",
	"虽",
	"杂",
	"飞",
	"检",
	"吸",
	"助",
	"升",
	"阳",
	"互",
	"初",
	"创",
	"抗",
	"考",
	"投",
	"坏",
	"策",
	"古",
	"径",
	"换",
	"未",
	"跑",
	"留",
	"钢",
	"曾",
	"端",
	"责",
	"站",
	"简",
	"述",
	"钱",
	"副",
	"尽",
	"帝",
	"射",
	"草",
	"冲",
	"承",
	"独",
	"令",
	"限",
	"阿",
	"宣",
	"环",
	"双",
	"请",
	"超",
	"微",
	"让",
	"控",
	"州",
	"良",
	"轴",
	"找",
	"否",
	"纪",
	"益",
	"依",
	"优",
	"顶",
	"础",
	"载",
	"倒",
	"房",
	"突",
	"坐",
	"粉",
	"敌",
	"略",
	"客",
	"袁",
	"冷",
	"胜",
	"绝",
	"析",
	"块",
	"剂",
	"测",
	"丝",
	"协",
	"诉",
	"念",
	"陈",
	"仍",
	"罗",
	"盐",
	"友",
	"洋",
	"错",
	"苦",
	"夜",
	"刑",
	"移",
	"频",
	"逐",
	"靠",
	"混",
	"母",
	"短",
	"皮",
	"终",
	"聚",
	"汽",
	"村",
	"云",
	"哪",
	"既",
	"距",
	"卫",
	"停",
	"烈",
	"央",
	"察",
	"烧",
	"迅",
	"境",
	"若",
	"印",
	"洲",
	"刻",
	"括",
	"激",
	"孔",
	"搞",
	"甚",
	"室",
	"待",
	"核",
	"校",
	"散",
	"侵",
	"吧",
	"甲",
	"游",
	"久",
	"菜",
	"味",
	"旧",
	"模",
	"湖",
	"货",
	"损",
	"预",
	"阻",
	"毫",
	"普",
	"稳",
	"乙",
	"妈",
	"植",
	"息",
	"扩",
	"银",
	"语",
	"挥",
	"酒",
	"守",
	"拿",
	"序",
	"纸",
	"医",
	"缺",
	"雨",
	"吗",
	"针",
	"刘",
	"啊",
	"急",
	"唱",
	"误",
	"训",
	"愿",
	"审",
	"附",
	"获",
	"茶",
	"鲜",
	"粮",
	"斤",
	"孩",
	"脱",
	"硫",
	"肥",
	"善",
	"龙",
	"演",
	"父",
	"渐",
	"血",
	"欢",
	"械",
	"掌",
	"歌",
	"沙",
	"刚",
	"攻",
	"谓",
	"盾",
	"讨",
	"晚",
	"粒",
	"乱",
	"燃",
	"矛",
	"乎",
	"杀",
	"药",
	"宁",
	"鲁",
	"贵",
	"钟",
	"煤",
	"读",
	"班",
	"伯",
	"香",
	"介",
	"迫",
	"句",
	"丰",
	"培",
	"握",
	"兰",
	"担",
	"弦",
	"蛋",
	"沉",
	"假",
	"穿",
	"执",
	"答",
	"乐",
	"谁",
	"顺",
	"烟",
	"缩",
	"征",
	"脸",
	"喜",
	"松",
	"脚",
	"困",
	"异",
	"免",
	"背",
	"星",
	"福",
	"买",
	"染",
	"井",
	"概",
	"慢",
	"怕",
	"磁",
	"倍",
	"祖",
	"皇",
	"促",
	"静",
	"补",
	"评",
	"翻",
	"肉",
	"践",
	"尼",
	"衣",
	"宽",
	"扬",
	"棉",
	"希",
	"伤",
	"操",
	"垂",
	"秋",
	"宜",
	"氢",
	"套",
	"督",
	"振",
	"架",
	"亮",
	"末",
	"宪",
	"庆",
	"编",
	"牛",
	"触",
	"映",
	"雷",
	"销",
	"诗",
	"座",
	"居",
	"抓",
	"裂",
	"胞",
	"呼",
	"娘",
	"景",
	"威",
	"绿",
	"晶",
	"厚",
	"盟",
	"衡",
	"鸡",
	"孙",
	"延",
	"危",
	"胶",
	"屋",
	"乡",
	"临",
	"陆",
	"顾",
	"掉",
	"呀",
	"灯",
	"岁",
	"措",
	"束",
	"耐",
	"剧",
	"玉",
	"赵",
	"跳",
	"哥",
	"季",
	"课",
	"凯",
	"胡",
	"额",
	"款",
	"绍",
	"卷",
	"齐",
	"伟",
	"蒸",
	"殖",
	"永",
	"宗",
	"苗",
	"川",
	"炉",
	"岩",
	"弱",
	"零",
	"杨",
	"奏",
	"沿",
	"露",
	"杆",
	"探",
	"滑",
	"镇",
	"饭",
	"浓",
	"航",
	"怀",
	"赶",
	"库",
	"夺",
	"伊",
	"灵",
	"税",
	"途",
	"灭",
	"赛",
	"归",
	"召",
	"鼓",
	"播",
	"盘",
	"裁",
	"险",
	"康",
	"唯",
	"录",
	"菌",
	"纯",
	"借",
	"糖",
	"盖",
	"横",
	"符",
	"私",
	"努",
	"堂",
	"域",
	"枪",
	"润",
	"幅",
	"哈",
	"竟",
	"熟",
	"虫",
	"泽",
	"脑",
	"壤",
	"碳",
	"欧",
	"遍",
	"侧",
	"寨",
	"敢",
	"彻",
	"虑",
	"斜",
	"薄",
	"庭",
	"纳",
	"弹",
	"饲",
	"伸",
	"折",
	"麦",
	"湿",
	"暗",
	"荷",
	"瓦",
	"塞",
	"床",
	"筑",
	"恶",
	"户",
	"访",
	"塔",
	"奇",
	"透",
	"梁",
	"刀",
	"旋",
	"迹",
	"卡",
	"氯",
	"遇",
	"份",
	"毒",
	"泥",
	"退",
	"洗",
	"摆",
	"灰",
	"彩",
	"卖",
	"耗",
	"夏",
	"择",
	"忙",
	"铜",
	"献",
	"硬",
	"予",
	"繁",
	"圈",
	"雪",
	"函",
	"亦",
	"抽",
	"篇",
	"阵",
	"阴",
	"丁",
	"尺",
	"追",
	"堆",
	"雄",
	"迎",
	"泛",
	"爸",
	"楼",
	"避",
	"谋",
	"吨",
	"野",
	"猪",
	"旗",
	"累",
	"偏",
	"典",
	"馆",
	"索",
	"秦",
	"脂",
	"潮",
	"爷",
	"豆",
	"忽",
	"托",
	"惊",
	"塑",
	"遗",
	"愈",
	"朱",
	"替",
	"纤",
	"粗",
	"倾",
	"尚",
	"痛",
	"楚",
	"谢",
	"奋",
	"购",
	"磨",
	"君",
	"池",
	"旁",
	"碎",
	"骨",
	"监",
	"捕",
	"弟",
	"暴",
	"割",
	"贯",
	"殊",
	"释",
	"词",
	"亡",
	"壁",
	"顿",
	"宝",
	"午",
	"尘",
	"闻",
	"揭",
	"炮",
	"残",
	"冬",
	"桥",
	"妇",
	"警",
	"综",
	"招",
	"吴",
	"付",
	"浮",
	"遭",
	"徐",
	"您",
	"摇",
	"谷",
	"赞",
	"箱",
	"隔",
	"订",
	"男",
	"吹",
	"园",
	"纷",
	"唐",
	"败",
	"宋",
	"玻",
	"巨",
	"耕",
	"坦",
	"荣",
	"闭",
	"湾",
	"键",
	"凡",
	"驻",
	"锅",
	"救",
	"恩",
	"剥",
	"凝",
	"碱",
	"齿",
	"截",
	"炼",
	"麻",
	"纺",
	"禁",
	"废",
	"盛",
	"版",
	"缓",
	"净",
	"睛",
	"昌",
	"婚",
	"涉",
	"筒",
	"嘴",
	"插",
	"岸",
	"朗",
	"庄",
	"街",
	"藏",
	"姑",
	"贸",
	"腐",
	"奴",
	"啦",
	"惯",
	"乘",
	"伙",
	"恢",
	"匀",
	"纱",
	"扎",
	"辩",
	"耳",
	"彪",
	"臣",
	"亿",
	"璃",
	"抵",
	"脉",
	"秀",
	"萨",
	"俄",
	"网",
	"舞",
	"店",
	"喷",
	"纵",
	"寸",
	"汗",
	"挂",
	"洪",
	"贺",
	"闪",
	"柬",
	"爆",
	"烯",
	"津",
	"稻",
	"墙",
	"软",
	"勇",
	"像",
	"滚",
	"厘",
	"蒙",
	"芳",
	"肯",
	"坡",
	"柱",
	"荡",
	"腿",
	"仪",
	"旅",
	"尾",
	"轧",
	"冰",
	"贡",
	"登",
	"黎",
	"削",
	"钻",
	"勒",
	"逃",
	"障",
	"氨",
	"郭",
	"峰",
	"币",
	"港",
	"伏",
	"轨",
	"亩",
	"毕",
	"擦",
	"莫",
	"刺",
	"浪",
	"秘",
	"援",
	"株",
	"健",
	"售",
	"股",
	"岛",
	"甘",
	"泡",
	"睡",
	"童",
	"铸",
	"汤",
	"阀",
	"休",
	"汇",
	"舍",
	"牧",
	"绕",
	"炸",
	"哲",
	"磷",
	"绩",
	"朋",
	"淡",
	"尖",
	"启",
	"陷",
	"柴",
	"呈",
	"徒",
	"颜",
	"泪",
	"稍",
	"忘",
	"泵",
	"蓝",
	"拖",
	"洞",
	"授",
	"镜",
	"辛",
	"壮",
	"锋",
	"贫",
	"虚",
	"弯",
	"摩",
	"泰",
	"幼",
	"廷",
	"尊",
	"窗",
	"纲",
	"弄",
	"隶",
	"疑",
	"氏",
	"宫",
	"姐",
	"震",
	"瑞",
	"怪",
	"尤",
	"琴",
	"循",
	"描",
	"膜",
	"违",
	"夹",
	"腰",
	"缘",
	"珠",
	"穷",
	"森",
	"枝",
	"竹",
	"沟",
	"催",
	"绳",
	"忆",
	"邦",
	"剩",
	"幸",
	"浆",
	"栏",
	"拥",
	"牙",
	"贮",
	"礼",
	"滤",
	"钠",
	"纹",
	"罢",
	"拍",
	"咱",
	"喊",
	"袖",
	"埃",
	"勤",
	"罚",
	"焦",
	"潜",
	"伍",
	"墨",
	"欲",
	"缝",
	"姓",
	"刊",
	"饱",
	"仿",
	"奖",
	"铝",
	"鬼",
	"丽",
	"跨",
	"默",
	"挖",
	"链",
	"扫",
	"喝",
	"袋",
	"炭",
	"污",
	"幕",
	"诸",
	"弧",
	"励",
	"梅",
	"奶",
	"洁",
	"灾",
	"舟",
	"鉴",
	"苯",
	"讼",
	"抱",
	"毁",
	"懂",
	"寒",
	"智",
	"埔",
	"寄",
	"届",
	"跃",
	"渡",
	"挑",
	"丹",
	"艰",
	"贝",
	"碰",
	"拔",
	"爹",
	"戴",
	"码",
	"梦",
	"芽",
	"熔",
	"赤",
	"渔",
	"哭",
	"敬",
	"颗",
	"奔",
	"铅",
	"仲",
	"虎",
	"稀",
	"妹",
	"乏",
	"珍",
	"申",
	"桌",
	"遵",
	"允",
	"隆",
	"螺",
	"仓",
	"魏",
	"锐",
	"晓",
	"氮",
	"兼",
	"隐",
	"碍",
	"赫",
	"拨",
	"忠",
	"肃",
	"缸",
	"牵",
	"抢",
	"博",
	"巧",
	"壳",
	"兄",
	"杜",
	"讯",
	"诚",
	"碧",
	"祥",
	"柯",
	"页",
	"巡",
	"矩",
	"悲",
	"灌",
	"龄",
	"伦",
	"票",
	"寻",
	"桂",
	"铺",
	"圣",
	"恐",
	"恰",
	"郑",
	"趣",
	"抬",
	"荒",
	"腾",
	"贴",
	"柔",
	"滴",
	"猛",
	"阔",
	"辆",
	"妻",
	"填",
	"撤",
	"储",
	"签",
	"闹",
	"扰",
	"紫",
	"砂",
	"递",
	"戏",
	"吊",
	"陶",
	"伐",
	"喂",
	"疗",
	"瓶",
	"婆",
	"抚",
	"臂",
	"摸",
	"忍",
	"虾",
	"蜡",
	"邻",
	"胸",
	"巩",
	"挤",
	"偶",
	"弃",
	"槽",
	"劲",
	"乳",
	"邓",
	"吉",
	"仁",
	"烂",
	"砖",
	"租",
	"乌",
	"舰",
	"伴",
	"瓜",
	"浅",
	"丙",
	"暂",
	"燥",
	"橡",
	"柳",
	"迷",
	"暖",
	"牌",
	"秧",
	"胆",
	"详",
	"簧",
	"踏",
	"瓷",
	"谱",
	"呆",
	"宾",
	"糊",
	"洛",
	"辉",
	"愤",
	"竞",
	"隙",
	"怒",
	"粘",
	"乃",
	"绪",
	"肩",
	"籍",
	"敏",
	"涂",
	"熙",
	"皆",
	"侦",
	"悬",
	"掘",
	"享",
	"纠",
	"醒",
	"狂",
	"锁",
	"淀",
	"恨",
	"牲",
	"霸",
	"爬",
	"赏",
	"逆",
	"玩",
	"陵",
	"祝",
	"秒",
	"浙",
	"貌",
	"役",
	"彼",
	"悉",
	"鸭",
	"趋",
	"凤",
	"晨",
	"畜",
	"辈",
	"秩",
	"卵",
	"署",
	"梯",
	"炎",
	"滩",
	"棋",
	"驱",
	"筛",
	"峡",
	"冒",
	"啥",
	"寿",
	"译",
	"浸",
	"泉",
	"帽",
	"迟",
	"硅",
	"疆",
	"贷",
	"漏",
	"稿",
	"冠",
	"嫩",
	"胁",
	"芯",
	"牢",
	"叛",
	"蚀",
	"奥",
	"鸣",
	"岭",
	"羊",
	"凭",
	"串",
	"塘",
	"绘",
	"酵",
	"融",
	"盆",
	"锡",
	"庙",
	"筹",
	"冻",
	"辅",
	"摄",
	"袭",
	"筋",
	"拒",
	"僚",
	"旱",
	"钾",
	"鸟",
	"漆",
	"沈",
	"眉",
	"疏",
	"添",
	"棒",
	"穗",
	"硝",
	"韩",
	"逼",
	"扭",
	"侨",
	"凉",
	"挺",
	"碗",
	"栽",
	"炒",
	"杯",
	"患",
	"馏",
	"劝",
	"豪",
	"辽",
	"勃",
	"鸿",
	"旦",
	"吏",
	"拜",
	"狗",
	"埋",
	"辊",
	"掩",
	"饮",
	"搬",
	"骂",
	"辞",
	"勾",
	"扣",
	"估",
	"蒋",
	"绒",
	"雾",
	"丈",
	"朵",
	"姆",
	"拟",
	"宇",
	"辑",
	"陕",
	"雕",
	"偿",
	"蓄",
	"崇",
	"剪",
	"倡",
	"厅",
	"咬",
	"驶",
	"薯",
	"刷",
	"斥",
	"番",
	"赋",
	"奉",
	"佛",
	"浇",
	"漫",
	"曼",
	"扇",
	"钙",
	"桃",
	"扶",
	"仔",
	"返",
	"俗",
	"亏",
	"腔",
	"鞋",
	"棱",
	"覆",
	"框",
	"悄",
	"叔",
	"撞",
	"骗",
	"勘",
	"旺",
	"沸",
	"孤",
	"吐",
	"孟",
	"渠",
	"屈",
	"疾",
	"妙",
	"惜",
	"仰",
	"狠",
	"胀",
	"谐",
	"抛",
	"霉",
	"桑",
	"岗",
	"嘛",
	"衰",
	"盗",
	"渗",
	"脏",
	"赖",
	"涌",
	"甜",
	"曹",
	"阅",
	"肌",
	"哩",
	"厉",
	"烃",
	"纬",
	"毅",
	"昨",
	"伪",
	"症",
	"煮",
	"叹",
	"钉",
	"搭",
	"茎",
	"笼",
	"酷",
	"偷",
	"弓",
	"锥",
	"恒",
	"杰",
	"坑",
	"鼻",
	"翼",
	"纶",
	"叙",
	"狱",
	"逮",
	"罐",
	"络",
	"棚",
	"抑",
	"膨",
	"蔬",
	"寺",
	"骤",
	"穆",
	"冶",
	"枯",
	"册",
	"尸",
	"凸",
	"绅",
	"坯",
	"牺",
	"焰",
	"轰",
	"欣",
	"晋",
	"瘦",
	"御",
	"锭",
	"锦",
	"丧",
	"旬",
	"锻",
	"垄",
	"搜",
	"扑",
	"邀",
	"亭",
	"酯",
	"迈",
	"舒",
	"脆",
	"酶",
	"闲",
	"忧",
	"酚",
	"顽",
	"羽",
	"涨",
	"卸",
	"仗",
	"陪",
	"辟",
	"惩",
	"杭",
	"姚",
	"肚",
	"捉",
	"飘",
	"漂",
	"昆",
	"欺",
	"吾",
	"郎",
	"烷",
	"汁",
	"呵",
	"饰",
	"萧",
	"雅",
	"邮",
	"迁",
	"燕",
	"撒",
	"姻",
	"赴",
	"宴",
	"烦",
	"债",
	"帐",
	"斑",
	"铃",
	"旨",
	"醇",
	"董",
	"饼",
	"雏",
	"姿",
	"拌",
	"傅",
	"腹",
	"妥",
	"揉",
	"贤",
	"拆",
	"歪",
	"葡",
	"胺",
	"丢",
	"浩",
	"徽",
	"昂",
	"垫",
	"挡",
	"览",
	"贪",
	"慰",
	"缴",
	"汪",
	"慌",
	"冯",
	"诺",
	"姜",
	"谊",
	"凶",
	"劣",
	"诬",
	"耀",
	"昏",
	"躺",
	"盈",
	"骑",
	"乔",
	"溪",
	"丛",
	"卢",
	"抹",
	"闷",
	"咨",
	"刮",
	"驾",
	"缆",
	"悟",
	"摘",
	"铒",
	"掷",
	"颇",
	"幻",
	"柄",
	"惠",
	"惨",
	"佳",
	"仇",
	"腊",
	"窝",
	"涤",
	"剑",
	"瞧",
	"堡",
	"泼",
	"葱",
	"罩",
	"霍",
	"捞",
	"胎",
	"苍",
	"滨",
	"俩",
	"捅",
	"湘",
	"砍",
	"霞",
	"邵",
	"萄",
	"疯",
	"淮",
	"遂",
	"熊",
	"粪",
	"烘",
	"宿",
	"档",
	"戈",
	"驳",
	"嫂",
	"裕",
	"徙",
	"箭",
	"捐",
	"肠",
	"撑",
	"晒",
	"辨",
	"殿",
	"莲",
	"摊",
	"搅",
	"酱",
	"屏",
	"疫",
	"哀",
	"蔡",
	"堵",
	"沫",
	"皱",
	"畅",
	"叠",
	"阁",
	"莱",
	"敲",
	"辖",
	"钩",
	"痕",
	"坝",
	"巷",
	"饿",
	"祸",
	"丘",
	"玄",
	"溜",
	"曰",
	"逻",
	"彭",
	"尝",
	"卿",
	"妨",
	"艇",
	"吞",
	"韦",
	"怨",
	"矮",
	"歇"
];

var chinese_simplified$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': chinese_simplified
});

var chinese_traditional = [
	"的",
	"一",
	"是",
	"在",
	"不",
	"了",
	"有",
	"和",
	"人",
	"這",
	"中",
	"大",
	"為",
	"上",
	"個",
	"國",
	"我",
	"以",
	"要",
	"他",
	"時",
	"來",
	"用",
	"們",
	"生",
	"到",
	"作",
	"地",
	"於",
	"出",
	"就",
	"分",
	"對",
	"成",
	"會",
	"可",
	"主",
	"發",
	"年",
	"動",
	"同",
	"工",
	"也",
	"能",
	"下",
	"過",
	"子",
	"說",
	"產",
	"種",
	"面",
	"而",
	"方",
	"後",
	"多",
	"定",
	"行",
	"學",
	"法",
	"所",
	"民",
	"得",
	"經",
	"十",
	"三",
	"之",
	"進",
	"著",
	"等",
	"部",
	"度",
	"家",
	"電",
	"力",
	"裡",
	"如",
	"水",
	"化",
	"高",
	"自",
	"二",
	"理",
	"起",
	"小",
	"物",
	"現",
	"實",
	"加",
	"量",
	"都",
	"兩",
	"體",
	"制",
	"機",
	"當",
	"使",
	"點",
	"從",
	"業",
	"本",
	"去",
	"把",
	"性",
	"好",
	"應",
	"開",
	"它",
	"合",
	"還",
	"因",
	"由",
	"其",
	"些",
	"然",
	"前",
	"外",
	"天",
	"政",
	"四",
	"日",
	"那",
	"社",
	"義",
	"事",
	"平",
	"形",
	"相",
	"全",
	"表",
	"間",
	"樣",
	"與",
	"關",
	"各",
	"重",
	"新",
	"線",
	"內",
	"數",
	"正",
	"心",
	"反",
	"你",
	"明",
	"看",
	"原",
	"又",
	"麼",
	"利",
	"比",
	"或",
	"但",
	"質",
	"氣",
	"第",
	"向",
	"道",
	"命",
	"此",
	"變",
	"條",
	"只",
	"沒",
	"結",
	"解",
	"問",
	"意",
	"建",
	"月",
	"公",
	"無",
	"系",
	"軍",
	"很",
	"情",
	"者",
	"最",
	"立",
	"代",
	"想",
	"已",
	"通",
	"並",
	"提",
	"直",
	"題",
	"黨",
	"程",
	"展",
	"五",
	"果",
	"料",
	"象",
	"員",
	"革",
	"位",
	"入",
	"常",
	"文",
	"總",
	"次",
	"品",
	"式",
	"活",
	"設",
	"及",
	"管",
	"特",
	"件",
	"長",
	"求",
	"老",
	"頭",
	"基",
	"資",
	"邊",
	"流",
	"路",
	"級",
	"少",
	"圖",
	"山",
	"統",
	"接",
	"知",
	"較",
	"將",
	"組",
	"見",
	"計",
	"別",
	"她",
	"手",
	"角",
	"期",
	"根",
	"論",
	"運",
	"農",
	"指",
	"幾",
	"九",
	"區",
	"強",
	"放",
	"決",
	"西",
	"被",
	"幹",
	"做",
	"必",
	"戰",
	"先",
	"回",
	"則",
	"任",
	"取",
	"據",
	"處",
	"隊",
	"南",
	"給",
	"色",
	"光",
	"門",
	"即",
	"保",
	"治",
	"北",
	"造",
	"百",
	"規",
	"熱",
	"領",
	"七",
	"海",
	"口",
	"東",
	"導",
	"器",
	"壓",
	"志",
	"世",
	"金",
	"增",
	"爭",
	"濟",
	"階",
	"油",
	"思",
	"術",
	"極",
	"交",
	"受",
	"聯",
	"什",
	"認",
	"六",
	"共",
	"權",
	"收",
	"證",
	"改",
	"清",
	"美",
	"再",
	"採",
	"轉",
	"更",
	"單",
	"風",
	"切",
	"打",
	"白",
	"教",
	"速",
	"花",
	"帶",
	"安",
	"場",
	"身",
	"車",
	"例",
	"真",
	"務",
	"具",
	"萬",
	"每",
	"目",
	"至",
	"達",
	"走",
	"積",
	"示",
	"議",
	"聲",
	"報",
	"鬥",
	"完",
	"類",
	"八",
	"離",
	"華",
	"名",
	"確",
	"才",
	"科",
	"張",
	"信",
	"馬",
	"節",
	"話",
	"米",
	"整",
	"空",
	"元",
	"況",
	"今",
	"集",
	"溫",
	"傳",
	"土",
	"許",
	"步",
	"群",
	"廣",
	"石",
	"記",
	"需",
	"段",
	"研",
	"界",
	"拉",
	"林",
	"律",
	"叫",
	"且",
	"究",
	"觀",
	"越",
	"織",
	"裝",
	"影",
	"算",
	"低",
	"持",
	"音",
	"眾",
	"書",
	"布",
	"复",
	"容",
	"兒",
	"須",
	"際",
	"商",
	"非",
	"驗",
	"連",
	"斷",
	"深",
	"難",
	"近",
	"礦",
	"千",
	"週",
	"委",
	"素",
	"技",
	"備",
	"半",
	"辦",
	"青",
	"省",
	"列",
	"習",
	"響",
	"約",
	"支",
	"般",
	"史",
	"感",
	"勞",
	"便",
	"團",
	"往",
	"酸",
	"歷",
	"市",
	"克",
	"何",
	"除",
	"消",
	"構",
	"府",
	"稱",
	"太",
	"準",
	"精",
	"值",
	"號",
	"率",
	"族",
	"維",
	"劃",
	"選",
	"標",
	"寫",
	"存",
	"候",
	"毛",
	"親",
	"快",
	"效",
	"斯",
	"院",
	"查",
	"江",
	"型",
	"眼",
	"王",
	"按",
	"格",
	"養",
	"易",
	"置",
	"派",
	"層",
	"片",
	"始",
	"卻",
	"專",
	"狀",
	"育",
	"廠",
	"京",
	"識",
	"適",
	"屬",
	"圓",
	"包",
	"火",
	"住",
	"調",
	"滿",
	"縣",
	"局",
	"照",
	"參",
	"紅",
	"細",
	"引",
	"聽",
	"該",
	"鐵",
	"價",
	"嚴",
	"首",
	"底",
	"液",
	"官",
	"德",
	"隨",
	"病",
	"蘇",
	"失",
	"爾",
	"死",
	"講",
	"配",
	"女",
	"黃",
	"推",
	"顯",
	"談",
	"罪",
	"神",
	"藝",
	"呢",
	"席",
	"含",
	"企",
	"望",
	"密",
	"批",
	"營",
	"項",
	"防",
	"舉",
	"球",
	"英",
	"氧",
	"勢",
	"告",
	"李",
	"台",
	"落",
	"木",
	"幫",
	"輪",
	"破",
	"亞",
	"師",
	"圍",
	"注",
	"遠",
	"字",
	"材",
	"排",
	"供",
	"河",
	"態",
	"封",
	"另",
	"施",
	"減",
	"樹",
	"溶",
	"怎",
	"止",
	"案",
	"言",
	"士",
	"均",
	"武",
	"固",
	"葉",
	"魚",
	"波",
	"視",
	"僅",
	"費",
	"緊",
	"愛",
	"左",
	"章",
	"早",
	"朝",
	"害",
	"續",
	"輕",
	"服",
	"試",
	"食",
	"充",
	"兵",
	"源",
	"判",
	"護",
	"司",
	"足",
	"某",
	"練",
	"差",
	"致",
	"板",
	"田",
	"降",
	"黑",
	"犯",
	"負",
	"擊",
	"范",
	"繼",
	"興",
	"似",
	"餘",
	"堅",
	"曲",
	"輸",
	"修",
	"故",
	"城",
	"夫",
	"夠",
	"送",
	"筆",
	"船",
	"佔",
	"右",
	"財",
	"吃",
	"富",
	"春",
	"職",
	"覺",
	"漢",
	"畫",
	"功",
	"巴",
	"跟",
	"雖",
	"雜",
	"飛",
	"檢",
	"吸",
	"助",
	"昇",
	"陽",
	"互",
	"初",
	"創",
	"抗",
	"考",
	"投",
	"壞",
	"策",
	"古",
	"徑",
	"換",
	"未",
	"跑",
	"留",
	"鋼",
	"曾",
	"端",
	"責",
	"站",
	"簡",
	"述",
	"錢",
	"副",
	"盡",
	"帝",
	"射",
	"草",
	"衝",
	"承",
	"獨",
	"令",
	"限",
	"阿",
	"宣",
	"環",
	"雙",
	"請",
	"超",
	"微",
	"讓",
	"控",
	"州",
	"良",
	"軸",
	"找",
	"否",
	"紀",
	"益",
	"依",
	"優",
	"頂",
	"礎",
	"載",
	"倒",
	"房",
	"突",
	"坐",
	"粉",
	"敵",
	"略",
	"客",
	"袁",
	"冷",
	"勝",
	"絕",
	"析",
	"塊",
	"劑",
	"測",
	"絲",
	"協",
	"訴",
	"念",
	"陳",
	"仍",
	"羅",
	"鹽",
	"友",
	"洋",
	"錯",
	"苦",
	"夜",
	"刑",
	"移",
	"頻",
	"逐",
	"靠",
	"混",
	"母",
	"短",
	"皮",
	"終",
	"聚",
	"汽",
	"村",
	"雲",
	"哪",
	"既",
	"距",
	"衛",
	"停",
	"烈",
	"央",
	"察",
	"燒",
	"迅",
	"境",
	"若",
	"印",
	"洲",
	"刻",
	"括",
	"激",
	"孔",
	"搞",
	"甚",
	"室",
	"待",
	"核",
	"校",
	"散",
	"侵",
	"吧",
	"甲",
	"遊",
	"久",
	"菜",
	"味",
	"舊",
	"模",
	"湖",
	"貨",
	"損",
	"預",
	"阻",
	"毫",
	"普",
	"穩",
	"乙",
	"媽",
	"植",
	"息",
	"擴",
	"銀",
	"語",
	"揮",
	"酒",
	"守",
	"拿",
	"序",
	"紙",
	"醫",
	"缺",
	"雨",
	"嗎",
	"針",
	"劉",
	"啊",
	"急",
	"唱",
	"誤",
	"訓",
	"願",
	"審",
	"附",
	"獲",
	"茶",
	"鮮",
	"糧",
	"斤",
	"孩",
	"脫",
	"硫",
	"肥",
	"善",
	"龍",
	"演",
	"父",
	"漸",
	"血",
	"歡",
	"械",
	"掌",
	"歌",
	"沙",
	"剛",
	"攻",
	"謂",
	"盾",
	"討",
	"晚",
	"粒",
	"亂",
	"燃",
	"矛",
	"乎",
	"殺",
	"藥",
	"寧",
	"魯",
	"貴",
	"鐘",
	"煤",
	"讀",
	"班",
	"伯",
	"香",
	"介",
	"迫",
	"句",
	"豐",
	"培",
	"握",
	"蘭",
	"擔",
	"弦",
	"蛋",
	"沉",
	"假",
	"穿",
	"執",
	"答",
	"樂",
	"誰",
	"順",
	"煙",
	"縮",
	"徵",
	"臉",
	"喜",
	"松",
	"腳",
	"困",
	"異",
	"免",
	"背",
	"星",
	"福",
	"買",
	"染",
	"井",
	"概",
	"慢",
	"怕",
	"磁",
	"倍",
	"祖",
	"皇",
	"促",
	"靜",
	"補",
	"評",
	"翻",
	"肉",
	"踐",
	"尼",
	"衣",
	"寬",
	"揚",
	"棉",
	"希",
	"傷",
	"操",
	"垂",
	"秋",
	"宜",
	"氫",
	"套",
	"督",
	"振",
	"架",
	"亮",
	"末",
	"憲",
	"慶",
	"編",
	"牛",
	"觸",
	"映",
	"雷",
	"銷",
	"詩",
	"座",
	"居",
	"抓",
	"裂",
	"胞",
	"呼",
	"娘",
	"景",
	"威",
	"綠",
	"晶",
	"厚",
	"盟",
	"衡",
	"雞",
	"孫",
	"延",
	"危",
	"膠",
	"屋",
	"鄉",
	"臨",
	"陸",
	"顧",
	"掉",
	"呀",
	"燈",
	"歲",
	"措",
	"束",
	"耐",
	"劇",
	"玉",
	"趙",
	"跳",
	"哥",
	"季",
	"課",
	"凱",
	"胡",
	"額",
	"款",
	"紹",
	"卷",
	"齊",
	"偉",
	"蒸",
	"殖",
	"永",
	"宗",
	"苗",
	"川",
	"爐",
	"岩",
	"弱",
	"零",
	"楊",
	"奏",
	"沿",
	"露",
	"桿",
	"探",
	"滑",
	"鎮",
	"飯",
	"濃",
	"航",
	"懷",
	"趕",
	"庫",
	"奪",
	"伊",
	"靈",
	"稅",
	"途",
	"滅",
	"賽",
	"歸",
	"召",
	"鼓",
	"播",
	"盤",
	"裁",
	"險",
	"康",
	"唯",
	"錄",
	"菌",
	"純",
	"借",
	"糖",
	"蓋",
	"橫",
	"符",
	"私",
	"努",
	"堂",
	"域",
	"槍",
	"潤",
	"幅",
	"哈",
	"竟",
	"熟",
	"蟲",
	"澤",
	"腦",
	"壤",
	"碳",
	"歐",
	"遍",
	"側",
	"寨",
	"敢",
	"徹",
	"慮",
	"斜",
	"薄",
	"庭",
	"納",
	"彈",
	"飼",
	"伸",
	"折",
	"麥",
	"濕",
	"暗",
	"荷",
	"瓦",
	"塞",
	"床",
	"築",
	"惡",
	"戶",
	"訪",
	"塔",
	"奇",
	"透",
	"梁",
	"刀",
	"旋",
	"跡",
	"卡",
	"氯",
	"遇",
	"份",
	"毒",
	"泥",
	"退",
	"洗",
	"擺",
	"灰",
	"彩",
	"賣",
	"耗",
	"夏",
	"擇",
	"忙",
	"銅",
	"獻",
	"硬",
	"予",
	"繁",
	"圈",
	"雪",
	"函",
	"亦",
	"抽",
	"篇",
	"陣",
	"陰",
	"丁",
	"尺",
	"追",
	"堆",
	"雄",
	"迎",
	"泛",
	"爸",
	"樓",
	"避",
	"謀",
	"噸",
	"野",
	"豬",
	"旗",
	"累",
	"偏",
	"典",
	"館",
	"索",
	"秦",
	"脂",
	"潮",
	"爺",
	"豆",
	"忽",
	"托",
	"驚",
	"塑",
	"遺",
	"愈",
	"朱",
	"替",
	"纖",
	"粗",
	"傾",
	"尚",
	"痛",
	"楚",
	"謝",
	"奮",
	"購",
	"磨",
	"君",
	"池",
	"旁",
	"碎",
	"骨",
	"監",
	"捕",
	"弟",
	"暴",
	"割",
	"貫",
	"殊",
	"釋",
	"詞",
	"亡",
	"壁",
	"頓",
	"寶",
	"午",
	"塵",
	"聞",
	"揭",
	"炮",
	"殘",
	"冬",
	"橋",
	"婦",
	"警",
	"綜",
	"招",
	"吳",
	"付",
	"浮",
	"遭",
	"徐",
	"您",
	"搖",
	"谷",
	"贊",
	"箱",
	"隔",
	"訂",
	"男",
	"吹",
	"園",
	"紛",
	"唐",
	"敗",
	"宋",
	"玻",
	"巨",
	"耕",
	"坦",
	"榮",
	"閉",
	"灣",
	"鍵",
	"凡",
	"駐",
	"鍋",
	"救",
	"恩",
	"剝",
	"凝",
	"鹼",
	"齒",
	"截",
	"煉",
	"麻",
	"紡",
	"禁",
	"廢",
	"盛",
	"版",
	"緩",
	"淨",
	"睛",
	"昌",
	"婚",
	"涉",
	"筒",
	"嘴",
	"插",
	"岸",
	"朗",
	"莊",
	"街",
	"藏",
	"姑",
	"貿",
	"腐",
	"奴",
	"啦",
	"慣",
	"乘",
	"夥",
	"恢",
	"勻",
	"紗",
	"扎",
	"辯",
	"耳",
	"彪",
	"臣",
	"億",
	"璃",
	"抵",
	"脈",
	"秀",
	"薩",
	"俄",
	"網",
	"舞",
	"店",
	"噴",
	"縱",
	"寸",
	"汗",
	"掛",
	"洪",
	"賀",
	"閃",
	"柬",
	"爆",
	"烯",
	"津",
	"稻",
	"牆",
	"軟",
	"勇",
	"像",
	"滾",
	"厘",
	"蒙",
	"芳",
	"肯",
	"坡",
	"柱",
	"盪",
	"腿",
	"儀",
	"旅",
	"尾",
	"軋",
	"冰",
	"貢",
	"登",
	"黎",
	"削",
	"鑽",
	"勒",
	"逃",
	"障",
	"氨",
	"郭",
	"峰",
	"幣",
	"港",
	"伏",
	"軌",
	"畝",
	"畢",
	"擦",
	"莫",
	"刺",
	"浪",
	"秘",
	"援",
	"株",
	"健",
	"售",
	"股",
	"島",
	"甘",
	"泡",
	"睡",
	"童",
	"鑄",
	"湯",
	"閥",
	"休",
	"匯",
	"舍",
	"牧",
	"繞",
	"炸",
	"哲",
	"磷",
	"績",
	"朋",
	"淡",
	"尖",
	"啟",
	"陷",
	"柴",
	"呈",
	"徒",
	"顏",
	"淚",
	"稍",
	"忘",
	"泵",
	"藍",
	"拖",
	"洞",
	"授",
	"鏡",
	"辛",
	"壯",
	"鋒",
	"貧",
	"虛",
	"彎",
	"摩",
	"泰",
	"幼",
	"廷",
	"尊",
	"窗",
	"綱",
	"弄",
	"隸",
	"疑",
	"氏",
	"宮",
	"姐",
	"震",
	"瑞",
	"怪",
	"尤",
	"琴",
	"循",
	"描",
	"膜",
	"違",
	"夾",
	"腰",
	"緣",
	"珠",
	"窮",
	"森",
	"枝",
	"竹",
	"溝",
	"催",
	"繩",
	"憶",
	"邦",
	"剩",
	"幸",
	"漿",
	"欄",
	"擁",
	"牙",
	"貯",
	"禮",
	"濾",
	"鈉",
	"紋",
	"罷",
	"拍",
	"咱",
	"喊",
	"袖",
	"埃",
	"勤",
	"罰",
	"焦",
	"潛",
	"伍",
	"墨",
	"欲",
	"縫",
	"姓",
	"刊",
	"飽",
	"仿",
	"獎",
	"鋁",
	"鬼",
	"麗",
	"跨",
	"默",
	"挖",
	"鏈",
	"掃",
	"喝",
	"袋",
	"炭",
	"污",
	"幕",
	"諸",
	"弧",
	"勵",
	"梅",
	"奶",
	"潔",
	"災",
	"舟",
	"鑑",
	"苯",
	"訟",
	"抱",
	"毀",
	"懂",
	"寒",
	"智",
	"埔",
	"寄",
	"屆",
	"躍",
	"渡",
	"挑",
	"丹",
	"艱",
	"貝",
	"碰",
	"拔",
	"爹",
	"戴",
	"碼",
	"夢",
	"芽",
	"熔",
	"赤",
	"漁",
	"哭",
	"敬",
	"顆",
	"奔",
	"鉛",
	"仲",
	"虎",
	"稀",
	"妹",
	"乏",
	"珍",
	"申",
	"桌",
	"遵",
	"允",
	"隆",
	"螺",
	"倉",
	"魏",
	"銳",
	"曉",
	"氮",
	"兼",
	"隱",
	"礙",
	"赫",
	"撥",
	"忠",
	"肅",
	"缸",
	"牽",
	"搶",
	"博",
	"巧",
	"殼",
	"兄",
	"杜",
	"訊",
	"誠",
	"碧",
	"祥",
	"柯",
	"頁",
	"巡",
	"矩",
	"悲",
	"灌",
	"齡",
	"倫",
	"票",
	"尋",
	"桂",
	"鋪",
	"聖",
	"恐",
	"恰",
	"鄭",
	"趣",
	"抬",
	"荒",
	"騰",
	"貼",
	"柔",
	"滴",
	"猛",
	"闊",
	"輛",
	"妻",
	"填",
	"撤",
	"儲",
	"簽",
	"鬧",
	"擾",
	"紫",
	"砂",
	"遞",
	"戲",
	"吊",
	"陶",
	"伐",
	"餵",
	"療",
	"瓶",
	"婆",
	"撫",
	"臂",
	"摸",
	"忍",
	"蝦",
	"蠟",
	"鄰",
	"胸",
	"鞏",
	"擠",
	"偶",
	"棄",
	"槽",
	"勁",
	"乳",
	"鄧",
	"吉",
	"仁",
	"爛",
	"磚",
	"租",
	"烏",
	"艦",
	"伴",
	"瓜",
	"淺",
	"丙",
	"暫",
	"燥",
	"橡",
	"柳",
	"迷",
	"暖",
	"牌",
	"秧",
	"膽",
	"詳",
	"簧",
	"踏",
	"瓷",
	"譜",
	"呆",
	"賓",
	"糊",
	"洛",
	"輝",
	"憤",
	"競",
	"隙",
	"怒",
	"粘",
	"乃",
	"緒",
	"肩",
	"籍",
	"敏",
	"塗",
	"熙",
	"皆",
	"偵",
	"懸",
	"掘",
	"享",
	"糾",
	"醒",
	"狂",
	"鎖",
	"淀",
	"恨",
	"牲",
	"霸",
	"爬",
	"賞",
	"逆",
	"玩",
	"陵",
	"祝",
	"秒",
	"浙",
	"貌",
	"役",
	"彼",
	"悉",
	"鴨",
	"趨",
	"鳳",
	"晨",
	"畜",
	"輩",
	"秩",
	"卵",
	"署",
	"梯",
	"炎",
	"灘",
	"棋",
	"驅",
	"篩",
	"峽",
	"冒",
	"啥",
	"壽",
	"譯",
	"浸",
	"泉",
	"帽",
	"遲",
	"矽",
	"疆",
	"貸",
	"漏",
	"稿",
	"冠",
	"嫩",
	"脅",
	"芯",
	"牢",
	"叛",
	"蝕",
	"奧",
	"鳴",
	"嶺",
	"羊",
	"憑",
	"串",
	"塘",
	"繪",
	"酵",
	"融",
	"盆",
	"錫",
	"廟",
	"籌",
	"凍",
	"輔",
	"攝",
	"襲",
	"筋",
	"拒",
	"僚",
	"旱",
	"鉀",
	"鳥",
	"漆",
	"沈",
	"眉",
	"疏",
	"添",
	"棒",
	"穗",
	"硝",
	"韓",
	"逼",
	"扭",
	"僑",
	"涼",
	"挺",
	"碗",
	"栽",
	"炒",
	"杯",
	"患",
	"餾",
	"勸",
	"豪",
	"遼",
	"勃",
	"鴻",
	"旦",
	"吏",
	"拜",
	"狗",
	"埋",
	"輥",
	"掩",
	"飲",
	"搬",
	"罵",
	"辭",
	"勾",
	"扣",
	"估",
	"蔣",
	"絨",
	"霧",
	"丈",
	"朵",
	"姆",
	"擬",
	"宇",
	"輯",
	"陝",
	"雕",
	"償",
	"蓄",
	"崇",
	"剪",
	"倡",
	"廳",
	"咬",
	"駛",
	"薯",
	"刷",
	"斥",
	"番",
	"賦",
	"奉",
	"佛",
	"澆",
	"漫",
	"曼",
	"扇",
	"鈣",
	"桃",
	"扶",
	"仔",
	"返",
	"俗",
	"虧",
	"腔",
	"鞋",
	"棱",
	"覆",
	"框",
	"悄",
	"叔",
	"撞",
	"騙",
	"勘",
	"旺",
	"沸",
	"孤",
	"吐",
	"孟",
	"渠",
	"屈",
	"疾",
	"妙",
	"惜",
	"仰",
	"狠",
	"脹",
	"諧",
	"拋",
	"黴",
	"桑",
	"崗",
	"嘛",
	"衰",
	"盜",
	"滲",
	"臟",
	"賴",
	"湧",
	"甜",
	"曹",
	"閱",
	"肌",
	"哩",
	"厲",
	"烴",
	"緯",
	"毅",
	"昨",
	"偽",
	"症",
	"煮",
	"嘆",
	"釘",
	"搭",
	"莖",
	"籠",
	"酷",
	"偷",
	"弓",
	"錐",
	"恆",
	"傑",
	"坑",
	"鼻",
	"翼",
	"綸",
	"敘",
	"獄",
	"逮",
	"罐",
	"絡",
	"棚",
	"抑",
	"膨",
	"蔬",
	"寺",
	"驟",
	"穆",
	"冶",
	"枯",
	"冊",
	"屍",
	"凸",
	"紳",
	"坯",
	"犧",
	"焰",
	"轟",
	"欣",
	"晉",
	"瘦",
	"禦",
	"錠",
	"錦",
	"喪",
	"旬",
	"鍛",
	"壟",
	"搜",
	"撲",
	"邀",
	"亭",
	"酯",
	"邁",
	"舒",
	"脆",
	"酶",
	"閒",
	"憂",
	"酚",
	"頑",
	"羽",
	"漲",
	"卸",
	"仗",
	"陪",
	"闢",
	"懲",
	"杭",
	"姚",
	"肚",
	"捉",
	"飄",
	"漂",
	"昆",
	"欺",
	"吾",
	"郎",
	"烷",
	"汁",
	"呵",
	"飾",
	"蕭",
	"雅",
	"郵",
	"遷",
	"燕",
	"撒",
	"姻",
	"赴",
	"宴",
	"煩",
	"債",
	"帳",
	"斑",
	"鈴",
	"旨",
	"醇",
	"董",
	"餅",
	"雛",
	"姿",
	"拌",
	"傅",
	"腹",
	"妥",
	"揉",
	"賢",
	"拆",
	"歪",
	"葡",
	"胺",
	"丟",
	"浩",
	"徽",
	"昂",
	"墊",
	"擋",
	"覽",
	"貪",
	"慰",
	"繳",
	"汪",
	"慌",
	"馮",
	"諾",
	"姜",
	"誼",
	"兇",
	"劣",
	"誣",
	"耀",
	"昏",
	"躺",
	"盈",
	"騎",
	"喬",
	"溪",
	"叢",
	"盧",
	"抹",
	"悶",
	"諮",
	"刮",
	"駕",
	"纜",
	"悟",
	"摘",
	"鉺",
	"擲",
	"頗",
	"幻",
	"柄",
	"惠",
	"慘",
	"佳",
	"仇",
	"臘",
	"窩",
	"滌",
	"劍",
	"瞧",
	"堡",
	"潑",
	"蔥",
	"罩",
	"霍",
	"撈",
	"胎",
	"蒼",
	"濱",
	"倆",
	"捅",
	"湘",
	"砍",
	"霞",
	"邵",
	"萄",
	"瘋",
	"淮",
	"遂",
	"熊",
	"糞",
	"烘",
	"宿",
	"檔",
	"戈",
	"駁",
	"嫂",
	"裕",
	"徙",
	"箭",
	"捐",
	"腸",
	"撐",
	"曬",
	"辨",
	"殿",
	"蓮",
	"攤",
	"攪",
	"醬",
	"屏",
	"疫",
	"哀",
	"蔡",
	"堵",
	"沫",
	"皺",
	"暢",
	"疊",
	"閣",
	"萊",
	"敲",
	"轄",
	"鉤",
	"痕",
	"壩",
	"巷",
	"餓",
	"禍",
	"丘",
	"玄",
	"溜",
	"曰",
	"邏",
	"彭",
	"嘗",
	"卿",
	"妨",
	"艇",
	"吞",
	"韋",
	"怨",
	"矮",
	"歇"
];

var chinese_traditional$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': chinese_traditional
});

var korean = [
	"가격",
	"가끔",
	"가난",
	"가능",
	"가득",
	"가르침",
	"가뭄",
	"가방",
	"가상",
	"가슴",
	"가운데",
	"가을",
	"가이드",
	"가입",
	"가장",
	"가정",
	"가족",
	"가죽",
	"각오",
	"각자",
	"간격",
	"간부",
	"간섭",
	"간장",
	"간접",
	"간판",
	"갈등",
	"갈비",
	"갈색",
	"갈증",
	"감각",
	"감기",
	"감소",
	"감수성",
	"감자",
	"감정",
	"갑자기",
	"강남",
	"강당",
	"강도",
	"강력히",
	"강변",
	"강북",
	"강사",
	"강수량",
	"강아지",
	"강원도",
	"강의",
	"강제",
	"강조",
	"같이",
	"개구리",
	"개나리",
	"개방",
	"개별",
	"개선",
	"개성",
	"개인",
	"객관적",
	"거실",
	"거액",
	"거울",
	"거짓",
	"거품",
	"걱정",
	"건강",
	"건물",
	"건설",
	"건조",
	"건축",
	"걸음",
	"검사",
	"검토",
	"게시판",
	"게임",
	"겨울",
	"견해",
	"결과",
	"결국",
	"결론",
	"결석",
	"결승",
	"결심",
	"결정",
	"결혼",
	"경계",
	"경고",
	"경기",
	"경력",
	"경복궁",
	"경비",
	"경상도",
	"경영",
	"경우",
	"경쟁",
	"경제",
	"경주",
	"경찰",
	"경치",
	"경향",
	"경험",
	"계곡",
	"계단",
	"계란",
	"계산",
	"계속",
	"계약",
	"계절",
	"계층",
	"계획",
	"고객",
	"고구려",
	"고궁",
	"고급",
	"고등학생",
	"고무신",
	"고민",
	"고양이",
	"고장",
	"고전",
	"고집",
	"고춧가루",
	"고통",
	"고향",
	"곡식",
	"골목",
	"골짜기",
	"골프",
	"공간",
	"공개",
	"공격",
	"공군",
	"공급",
	"공기",
	"공동",
	"공무원",
	"공부",
	"공사",
	"공식",
	"공업",
	"공연",
	"공원",
	"공장",
	"공짜",
	"공책",
	"공통",
	"공포",
	"공항",
	"공휴일",
	"과목",
	"과일",
	"과장",
	"과정",
	"과학",
	"관객",
	"관계",
	"관광",
	"관념",
	"관람",
	"관련",
	"관리",
	"관습",
	"관심",
	"관점",
	"관찰",
	"광경",
	"광고",
	"광장",
	"광주",
	"괴로움",
	"굉장히",
	"교과서",
	"교문",
	"교복",
	"교실",
	"교양",
	"교육",
	"교장",
	"교직",
	"교통",
	"교환",
	"교훈",
	"구경",
	"구름",
	"구멍",
	"구별",
	"구분",
	"구석",
	"구성",
	"구속",
	"구역",
	"구입",
	"구청",
	"구체적",
	"국가",
	"국기",
	"국내",
	"국립",
	"국물",
	"국민",
	"국수",
	"국어",
	"국왕",
	"국적",
	"국제",
	"국회",
	"군대",
	"군사",
	"군인",
	"궁극적",
	"권리",
	"권위",
	"권투",
	"귀국",
	"귀신",
	"규정",
	"규칙",
	"균형",
	"그날",
	"그냥",
	"그늘",
	"그러나",
	"그룹",
	"그릇",
	"그림",
	"그제서야",
	"그토록",
	"극복",
	"극히",
	"근거",
	"근교",
	"근래",
	"근로",
	"근무",
	"근본",
	"근원",
	"근육",
	"근처",
	"글씨",
	"글자",
	"금강산",
	"금고",
	"금년",
	"금메달",
	"금액",
	"금연",
	"금요일",
	"금지",
	"긍정적",
	"기간",
	"기관",
	"기념",
	"기능",
	"기독교",
	"기둥",
	"기록",
	"기름",
	"기법",
	"기본",
	"기분",
	"기쁨",
	"기숙사",
	"기술",
	"기억",
	"기업",
	"기온",
	"기운",
	"기원",
	"기적",
	"기준",
	"기침",
	"기혼",
	"기획",
	"긴급",
	"긴장",
	"길이",
	"김밥",
	"김치",
	"김포공항",
	"깍두기",
	"깜빡",
	"깨달음",
	"깨소금",
	"껍질",
	"꼭대기",
	"꽃잎",
	"나들이",
	"나란히",
	"나머지",
	"나물",
	"나침반",
	"나흘",
	"낙엽",
	"난방",
	"날개",
	"날씨",
	"날짜",
	"남녀",
	"남대문",
	"남매",
	"남산",
	"남자",
	"남편",
	"남학생",
	"낭비",
	"낱말",
	"내년",
	"내용",
	"내일",
	"냄비",
	"냄새",
	"냇물",
	"냉동",
	"냉면",
	"냉방",
	"냉장고",
	"넥타이",
	"넷째",
	"노동",
	"노란색",
	"노력",
	"노인",
	"녹음",
	"녹차",
	"녹화",
	"논리",
	"논문",
	"논쟁",
	"놀이",
	"농구",
	"농담",
	"농민",
	"농부",
	"농업",
	"농장",
	"농촌",
	"높이",
	"눈동자",
	"눈물",
	"눈썹",
	"뉴욕",
	"느낌",
	"늑대",
	"능동적",
	"능력",
	"다방",
	"다양성",
	"다음",
	"다이어트",
	"다행",
	"단계",
	"단골",
	"단독",
	"단맛",
	"단순",
	"단어",
	"단위",
	"단점",
	"단체",
	"단추",
	"단편",
	"단풍",
	"달걀",
	"달러",
	"달력",
	"달리",
	"닭고기",
	"담당",
	"담배",
	"담요",
	"담임",
	"답변",
	"답장",
	"당근",
	"당분간",
	"당연히",
	"당장",
	"대규모",
	"대낮",
	"대단히",
	"대답",
	"대도시",
	"대략",
	"대량",
	"대륙",
	"대문",
	"대부분",
	"대신",
	"대응",
	"대장",
	"대전",
	"대접",
	"대중",
	"대책",
	"대출",
	"대충",
	"대통령",
	"대학",
	"대한민국",
	"대합실",
	"대형",
	"덩어리",
	"데이트",
	"도대체",
	"도덕",
	"도둑",
	"도망",
	"도서관",
	"도심",
	"도움",
	"도입",
	"도자기",
	"도저히",
	"도전",
	"도중",
	"도착",
	"독감",
	"독립",
	"독서",
	"독일",
	"독창적",
	"동화책",
	"뒷모습",
	"뒷산",
	"딸아이",
	"마누라",
	"마늘",
	"마당",
	"마라톤",
	"마련",
	"마무리",
	"마사지",
	"마약",
	"마요네즈",
	"마을",
	"마음",
	"마이크",
	"마중",
	"마지막",
	"마찬가지",
	"마찰",
	"마흔",
	"막걸리",
	"막내",
	"막상",
	"만남",
	"만두",
	"만세",
	"만약",
	"만일",
	"만점",
	"만족",
	"만화",
	"많이",
	"말기",
	"말씀",
	"말투",
	"맘대로",
	"망원경",
	"매년",
	"매달",
	"매력",
	"매번",
	"매스컴",
	"매일",
	"매장",
	"맥주",
	"먹이",
	"먼저",
	"먼지",
	"멀리",
	"메일",
	"며느리",
	"며칠",
	"면담",
	"멸치",
	"명단",
	"명령",
	"명예",
	"명의",
	"명절",
	"명칭",
	"명함",
	"모금",
	"모니터",
	"모델",
	"모든",
	"모범",
	"모습",
	"모양",
	"모임",
	"모조리",
	"모집",
	"모퉁이",
	"목걸이",
	"목록",
	"목사",
	"목소리",
	"목숨",
	"목적",
	"목표",
	"몰래",
	"몸매",
	"몸무게",
	"몸살",
	"몸속",
	"몸짓",
	"몸통",
	"몹시",
	"무관심",
	"무궁화",
	"무더위",
	"무덤",
	"무릎",
	"무슨",
	"무엇",
	"무역",
	"무용",
	"무조건",
	"무지개",
	"무척",
	"문구",
	"문득",
	"문법",
	"문서",
	"문제",
	"문학",
	"문화",
	"물가",
	"물건",
	"물결",
	"물고기",
	"물론",
	"물리학",
	"물음",
	"물질",
	"물체",
	"미국",
	"미디어",
	"미사일",
	"미술",
	"미역",
	"미용실",
	"미움",
	"미인",
	"미팅",
	"미혼",
	"민간",
	"민족",
	"민주",
	"믿음",
	"밀가루",
	"밀리미터",
	"밑바닥",
	"바가지",
	"바구니",
	"바나나",
	"바늘",
	"바닥",
	"바닷가",
	"바람",
	"바이러스",
	"바탕",
	"박물관",
	"박사",
	"박수",
	"반대",
	"반드시",
	"반말",
	"반발",
	"반성",
	"반응",
	"반장",
	"반죽",
	"반지",
	"반찬",
	"받침",
	"발가락",
	"발걸음",
	"발견",
	"발달",
	"발레",
	"발목",
	"발바닥",
	"발생",
	"발음",
	"발자국",
	"발전",
	"발톱",
	"발표",
	"밤하늘",
	"밥그릇",
	"밥맛",
	"밥상",
	"밥솥",
	"방금",
	"방면",
	"방문",
	"방바닥",
	"방법",
	"방송",
	"방식",
	"방안",
	"방울",
	"방지",
	"방학",
	"방해",
	"방향",
	"배경",
	"배꼽",
	"배달",
	"배드민턴",
	"백두산",
	"백색",
	"백성",
	"백인",
	"백제",
	"백화점",
	"버릇",
	"버섯",
	"버튼",
	"번개",
	"번역",
	"번지",
	"번호",
	"벌금",
	"벌레",
	"벌써",
	"범위",
	"범인",
	"범죄",
	"법률",
	"법원",
	"법적",
	"법칙",
	"베이징",
	"벨트",
	"변경",
	"변동",
	"변명",
	"변신",
	"변호사",
	"변화",
	"별도",
	"별명",
	"별일",
	"병실",
	"병아리",
	"병원",
	"보관",
	"보너스",
	"보라색",
	"보람",
	"보름",
	"보상",
	"보안",
	"보자기",
	"보장",
	"보전",
	"보존",
	"보통",
	"보편적",
	"보험",
	"복도",
	"복사",
	"복숭아",
	"복습",
	"볶음",
	"본격적",
	"본래",
	"본부",
	"본사",
	"본성",
	"본인",
	"본질",
	"볼펜",
	"봉사",
	"봉지",
	"봉투",
	"부근",
	"부끄러움",
	"부담",
	"부동산",
	"부문",
	"부분",
	"부산",
	"부상",
	"부엌",
	"부인",
	"부작용",
	"부장",
	"부정",
	"부족",
	"부지런히",
	"부친",
	"부탁",
	"부품",
	"부회장",
	"북부",
	"북한",
	"분노",
	"분량",
	"분리",
	"분명",
	"분석",
	"분야",
	"분위기",
	"분필",
	"분홍색",
	"불고기",
	"불과",
	"불교",
	"불꽃",
	"불만",
	"불법",
	"불빛",
	"불안",
	"불이익",
	"불행",
	"브랜드",
	"비극",
	"비난",
	"비닐",
	"비둘기",
	"비디오",
	"비로소",
	"비만",
	"비명",
	"비밀",
	"비바람",
	"비빔밥",
	"비상",
	"비용",
	"비율",
	"비중",
	"비타민",
	"비판",
	"빌딩",
	"빗물",
	"빗방울",
	"빗줄기",
	"빛깔",
	"빨간색",
	"빨래",
	"빨리",
	"사건",
	"사계절",
	"사나이",
	"사냥",
	"사람",
	"사랑",
	"사립",
	"사모님",
	"사물",
	"사방",
	"사상",
	"사생활",
	"사설",
	"사슴",
	"사실",
	"사업",
	"사용",
	"사월",
	"사장",
	"사전",
	"사진",
	"사촌",
	"사춘기",
	"사탕",
	"사투리",
	"사흘",
	"산길",
	"산부인과",
	"산업",
	"산책",
	"살림",
	"살인",
	"살짝",
	"삼계탕",
	"삼국",
	"삼십",
	"삼월",
	"삼촌",
	"상관",
	"상금",
	"상대",
	"상류",
	"상반기",
	"상상",
	"상식",
	"상업",
	"상인",
	"상자",
	"상점",
	"상처",
	"상추",
	"상태",
	"상표",
	"상품",
	"상황",
	"새벽",
	"색깔",
	"색연필",
	"생각",
	"생명",
	"생물",
	"생방송",
	"생산",
	"생선",
	"생신",
	"생일",
	"생활",
	"서랍",
	"서른",
	"서명",
	"서민",
	"서비스",
	"서양",
	"서울",
	"서적",
	"서점",
	"서쪽",
	"서클",
	"석사",
	"석유",
	"선거",
	"선물",
	"선배",
	"선생",
	"선수",
	"선원",
	"선장",
	"선전",
	"선택",
	"선풍기",
	"설거지",
	"설날",
	"설렁탕",
	"설명",
	"설문",
	"설사",
	"설악산",
	"설치",
	"설탕",
	"섭씨",
	"성공",
	"성당",
	"성명",
	"성별",
	"성인",
	"성장",
	"성적",
	"성질",
	"성함",
	"세금",
	"세미나",
	"세상",
	"세월",
	"세종대왕",
	"세탁",
	"센터",
	"센티미터",
	"셋째",
	"소규모",
	"소극적",
	"소금",
	"소나기",
	"소년",
	"소득",
	"소망",
	"소문",
	"소설",
	"소속",
	"소아과",
	"소용",
	"소원",
	"소음",
	"소중히",
	"소지품",
	"소질",
	"소풍",
	"소형",
	"속담",
	"속도",
	"속옷",
	"손가락",
	"손길",
	"손녀",
	"손님",
	"손등",
	"손목",
	"손뼉",
	"손실",
	"손질",
	"손톱",
	"손해",
	"솔직히",
	"솜씨",
	"송아지",
	"송이",
	"송편",
	"쇠고기",
	"쇼핑",
	"수건",
	"수년",
	"수단",
	"수돗물",
	"수동적",
	"수면",
	"수명",
	"수박",
	"수상",
	"수석",
	"수술",
	"수시로",
	"수업",
	"수염",
	"수영",
	"수입",
	"수준",
	"수집",
	"수출",
	"수컷",
	"수필",
	"수학",
	"수험생",
	"수화기",
	"숙녀",
	"숙소",
	"숙제",
	"순간",
	"순서",
	"순수",
	"순식간",
	"순위",
	"숟가락",
	"술병",
	"술집",
	"숫자",
	"스님",
	"스물",
	"스스로",
	"스승",
	"스웨터",
	"스위치",
	"스케이트",
	"스튜디오",
	"스트레스",
	"스포츠",
	"슬쩍",
	"슬픔",
	"습관",
	"습기",
	"승객",
	"승리",
	"승부",
	"승용차",
	"승진",
	"시각",
	"시간",
	"시골",
	"시금치",
	"시나리오",
	"시댁",
	"시리즈",
	"시멘트",
	"시민",
	"시부모",
	"시선",
	"시설",
	"시스템",
	"시아버지",
	"시어머니",
	"시월",
	"시인",
	"시일",
	"시작",
	"시장",
	"시절",
	"시점",
	"시중",
	"시즌",
	"시집",
	"시청",
	"시합",
	"시험",
	"식구",
	"식기",
	"식당",
	"식량",
	"식료품",
	"식물",
	"식빵",
	"식사",
	"식생활",
	"식초",
	"식탁",
	"식품",
	"신고",
	"신규",
	"신념",
	"신문",
	"신발",
	"신비",
	"신사",
	"신세",
	"신용",
	"신제품",
	"신청",
	"신체",
	"신화",
	"실감",
	"실내",
	"실력",
	"실례",
	"실망",
	"실수",
	"실습",
	"실시",
	"실장",
	"실정",
	"실질적",
	"실천",
	"실체",
	"실컷",
	"실태",
	"실패",
	"실험",
	"실현",
	"심리",
	"심부름",
	"심사",
	"심장",
	"심정",
	"심판",
	"쌍둥이",
	"씨름",
	"씨앗",
	"아가씨",
	"아나운서",
	"아드님",
	"아들",
	"아쉬움",
	"아스팔트",
	"아시아",
	"아울러",
	"아저씨",
	"아줌마",
	"아직",
	"아침",
	"아파트",
	"아프리카",
	"아픔",
	"아홉",
	"아흔",
	"악기",
	"악몽",
	"악수",
	"안개",
	"안경",
	"안과",
	"안내",
	"안녕",
	"안동",
	"안방",
	"안부",
	"안주",
	"알루미늄",
	"알코올",
	"암시",
	"암컷",
	"압력",
	"앞날",
	"앞문",
	"애인",
	"애정",
	"액수",
	"앨범",
	"야간",
	"야단",
	"야옹",
	"약간",
	"약국",
	"약속",
	"약수",
	"약점",
	"약품",
	"약혼녀",
	"양념",
	"양력",
	"양말",
	"양배추",
	"양주",
	"양파",
	"어둠",
	"어려움",
	"어른",
	"어젯밤",
	"어쨌든",
	"어쩌다가",
	"어쩐지",
	"언니",
	"언덕",
	"언론",
	"언어",
	"얼굴",
	"얼른",
	"얼음",
	"얼핏",
	"엄마",
	"업무",
	"업종",
	"업체",
	"엉덩이",
	"엉망",
	"엉터리",
	"엊그제",
	"에너지",
	"에어컨",
	"엔진",
	"여건",
	"여고생",
	"여관",
	"여군",
	"여권",
	"여대생",
	"여덟",
	"여동생",
	"여든",
	"여론",
	"여름",
	"여섯",
	"여성",
	"여왕",
	"여인",
	"여전히",
	"여직원",
	"여학생",
	"여행",
	"역사",
	"역시",
	"역할",
	"연결",
	"연구",
	"연극",
	"연기",
	"연락",
	"연설",
	"연세",
	"연속",
	"연습",
	"연애",
	"연예인",
	"연인",
	"연장",
	"연주",
	"연출",
	"연필",
	"연합",
	"연휴",
	"열기",
	"열매",
	"열쇠",
	"열심히",
	"열정",
	"열차",
	"열흘",
	"염려",
	"엽서",
	"영국",
	"영남",
	"영상",
	"영양",
	"영역",
	"영웅",
	"영원히",
	"영하",
	"영향",
	"영혼",
	"영화",
	"옆구리",
	"옆방",
	"옆집",
	"예감",
	"예금",
	"예방",
	"예산",
	"예상",
	"예선",
	"예술",
	"예습",
	"예식장",
	"예약",
	"예전",
	"예절",
	"예정",
	"예컨대",
	"옛날",
	"오늘",
	"오락",
	"오랫동안",
	"오렌지",
	"오로지",
	"오른발",
	"오븐",
	"오십",
	"오염",
	"오월",
	"오전",
	"오직",
	"오징어",
	"오페라",
	"오피스텔",
	"오히려",
	"옥상",
	"옥수수",
	"온갖",
	"온라인",
	"온몸",
	"온종일",
	"온통",
	"올가을",
	"올림픽",
	"올해",
	"옷차림",
	"와이셔츠",
	"와인",
	"완성",
	"완전",
	"왕비",
	"왕자",
	"왜냐하면",
	"왠지",
	"외갓집",
	"외국",
	"외로움",
	"외삼촌",
	"외출",
	"외침",
	"외할머니",
	"왼발",
	"왼손",
	"왼쪽",
	"요금",
	"요일",
	"요즘",
	"요청",
	"용기",
	"용서",
	"용어",
	"우산",
	"우선",
	"우승",
	"우연히",
	"우정",
	"우체국",
	"우편",
	"운동",
	"운명",
	"운반",
	"운전",
	"운행",
	"울산",
	"울음",
	"움직임",
	"웃어른",
	"웃음",
	"워낙",
	"원고",
	"원래",
	"원서",
	"원숭이",
	"원인",
	"원장",
	"원피스",
	"월급",
	"월드컵",
	"월세",
	"월요일",
	"웨이터",
	"위반",
	"위법",
	"위성",
	"위원",
	"위험",
	"위협",
	"윗사람",
	"유난히",
	"유럽",
	"유명",
	"유물",
	"유산",
	"유적",
	"유치원",
	"유학",
	"유행",
	"유형",
	"육군",
	"육상",
	"육십",
	"육체",
	"은행",
	"음력",
	"음료",
	"음반",
	"음성",
	"음식",
	"음악",
	"음주",
	"의견",
	"의논",
	"의문",
	"의복",
	"의식",
	"의심",
	"의외로",
	"의욕",
	"의원",
	"의학",
	"이것",
	"이곳",
	"이념",
	"이놈",
	"이달",
	"이대로",
	"이동",
	"이렇게",
	"이력서",
	"이론적",
	"이름",
	"이민",
	"이발소",
	"이별",
	"이불",
	"이빨",
	"이상",
	"이성",
	"이슬",
	"이야기",
	"이용",
	"이웃",
	"이월",
	"이윽고",
	"이익",
	"이전",
	"이중",
	"이튿날",
	"이틀",
	"이혼",
	"인간",
	"인격",
	"인공",
	"인구",
	"인근",
	"인기",
	"인도",
	"인류",
	"인물",
	"인생",
	"인쇄",
	"인연",
	"인원",
	"인재",
	"인종",
	"인천",
	"인체",
	"인터넷",
	"인하",
	"인형",
	"일곱",
	"일기",
	"일단",
	"일대",
	"일등",
	"일반",
	"일본",
	"일부",
	"일상",
	"일생",
	"일손",
	"일요일",
	"일월",
	"일정",
	"일종",
	"일주일",
	"일찍",
	"일체",
	"일치",
	"일행",
	"일회용",
	"임금",
	"임무",
	"입대",
	"입력",
	"입맛",
	"입사",
	"입술",
	"입시",
	"입원",
	"입장",
	"입학",
	"자가용",
	"자격",
	"자극",
	"자동",
	"자랑",
	"자부심",
	"자식",
	"자신",
	"자연",
	"자원",
	"자율",
	"자전거",
	"자정",
	"자존심",
	"자판",
	"작가",
	"작년",
	"작성",
	"작업",
	"작용",
	"작은딸",
	"작품",
	"잔디",
	"잔뜩",
	"잔치",
	"잘못",
	"잠깐",
	"잠수함",
	"잠시",
	"잠옷",
	"잠자리",
	"잡지",
	"장관",
	"장군",
	"장기간",
	"장래",
	"장례",
	"장르",
	"장마",
	"장면",
	"장모",
	"장미",
	"장비",
	"장사",
	"장소",
	"장식",
	"장애인",
	"장인",
	"장점",
	"장차",
	"장학금",
	"재능",
	"재빨리",
	"재산",
	"재생",
	"재작년",
	"재정",
	"재채기",
	"재판",
	"재학",
	"재활용",
	"저것",
	"저고리",
	"저곳",
	"저녁",
	"저런",
	"저렇게",
	"저번",
	"저울",
	"저절로",
	"저축",
	"적극",
	"적당히",
	"적성",
	"적용",
	"적응",
	"전개",
	"전공",
	"전기",
	"전달",
	"전라도",
	"전망",
	"전문",
	"전반",
	"전부",
	"전세",
	"전시",
	"전용",
	"전자",
	"전쟁",
	"전주",
	"전철",
	"전체",
	"전통",
	"전혀",
	"전후",
	"절대",
	"절망",
	"절반",
	"절약",
	"절차",
	"점검",
	"점수",
	"점심",
	"점원",
	"점점",
	"점차",
	"접근",
	"접시",
	"접촉",
	"젓가락",
	"정거장",
	"정도",
	"정류장",
	"정리",
	"정말",
	"정면",
	"정문",
	"정반대",
	"정보",
	"정부",
	"정비",
	"정상",
	"정성",
	"정오",
	"정원",
	"정장",
	"정지",
	"정치",
	"정확히",
	"제공",
	"제과점",
	"제대로",
	"제목",
	"제발",
	"제법",
	"제삿날",
	"제안",
	"제일",
	"제작",
	"제주도",
	"제출",
	"제품",
	"제한",
	"조각",
	"조건",
	"조금",
	"조깅",
	"조명",
	"조미료",
	"조상",
	"조선",
	"조용히",
	"조절",
	"조정",
	"조직",
	"존댓말",
	"존재",
	"졸업",
	"졸음",
	"종교",
	"종로",
	"종류",
	"종소리",
	"종업원",
	"종종",
	"종합",
	"좌석",
	"죄인",
	"주관적",
	"주름",
	"주말",
	"주머니",
	"주먹",
	"주문",
	"주민",
	"주방",
	"주변",
	"주식",
	"주인",
	"주일",
	"주장",
	"주전자",
	"주택",
	"준비",
	"줄거리",
	"줄기",
	"줄무늬",
	"중간",
	"중계방송",
	"중국",
	"중년",
	"중단",
	"중독",
	"중반",
	"중부",
	"중세",
	"중소기업",
	"중순",
	"중앙",
	"중요",
	"중학교",
	"즉석",
	"즉시",
	"즐거움",
	"증가",
	"증거",
	"증권",
	"증상",
	"증세",
	"지각",
	"지갑",
	"지경",
	"지극히",
	"지금",
	"지급",
	"지능",
	"지름길",
	"지리산",
	"지방",
	"지붕",
	"지식",
	"지역",
	"지우개",
	"지원",
	"지적",
	"지점",
	"지진",
	"지출",
	"직선",
	"직업",
	"직원",
	"직장",
	"진급",
	"진동",
	"진로",
	"진료",
	"진리",
	"진짜",
	"진찰",
	"진출",
	"진통",
	"진행",
	"질문",
	"질병",
	"질서",
	"짐작",
	"집단",
	"집안",
	"집중",
	"짜증",
	"찌꺼기",
	"차남",
	"차라리",
	"차량",
	"차림",
	"차별",
	"차선",
	"차츰",
	"착각",
	"찬물",
	"찬성",
	"참가",
	"참기름",
	"참새",
	"참석",
	"참여",
	"참외",
	"참조",
	"찻잔",
	"창가",
	"창고",
	"창구",
	"창문",
	"창밖",
	"창작",
	"창조",
	"채널",
	"채점",
	"책가방",
	"책방",
	"책상",
	"책임",
	"챔피언",
	"처벌",
	"처음",
	"천국",
	"천둥",
	"천장",
	"천재",
	"천천히",
	"철도",
	"철저히",
	"철학",
	"첫날",
	"첫째",
	"청년",
	"청바지",
	"청소",
	"청춘",
	"체계",
	"체력",
	"체온",
	"체육",
	"체중",
	"체험",
	"초등학생",
	"초반",
	"초밥",
	"초상화",
	"초순",
	"초여름",
	"초원",
	"초저녁",
	"초점",
	"초청",
	"초콜릿",
	"촛불",
	"총각",
	"총리",
	"총장",
	"촬영",
	"최근",
	"최상",
	"최선",
	"최신",
	"최악",
	"최종",
	"추석",
	"추억",
	"추진",
	"추천",
	"추측",
	"축구",
	"축소",
	"축제",
	"축하",
	"출근",
	"출발",
	"출산",
	"출신",
	"출연",
	"출입",
	"출장",
	"출판",
	"충격",
	"충고",
	"충돌",
	"충분히",
	"충청도",
	"취업",
	"취직",
	"취향",
	"치약",
	"친구",
	"친척",
	"칠십",
	"칠월",
	"칠판",
	"침대",
	"침묵",
	"침실",
	"칫솔",
	"칭찬",
	"카메라",
	"카운터",
	"칼국수",
	"캐릭터",
	"캠퍼스",
	"캠페인",
	"커튼",
	"컨디션",
	"컬러",
	"컴퓨터",
	"코끼리",
	"코미디",
	"콘서트",
	"콜라",
	"콤플렉스",
	"콩나물",
	"쾌감",
	"쿠데타",
	"크림",
	"큰길",
	"큰딸",
	"큰소리",
	"큰아들",
	"큰어머니",
	"큰일",
	"큰절",
	"클래식",
	"클럽",
	"킬로",
	"타입",
	"타자기",
	"탁구",
	"탁자",
	"탄생",
	"태권도",
	"태양",
	"태풍",
	"택시",
	"탤런트",
	"터널",
	"터미널",
	"테니스",
	"테스트",
	"테이블",
	"텔레비전",
	"토론",
	"토마토",
	"토요일",
	"통계",
	"통과",
	"통로",
	"통신",
	"통역",
	"통일",
	"통장",
	"통제",
	"통증",
	"통합",
	"통화",
	"퇴근",
	"퇴원",
	"퇴직금",
	"튀김",
	"트럭",
	"특급",
	"특별",
	"특성",
	"특수",
	"특징",
	"특히",
	"튼튼히",
	"티셔츠",
	"파란색",
	"파일",
	"파출소",
	"판결",
	"판단",
	"판매",
	"판사",
	"팔십",
	"팔월",
	"팝송",
	"패션",
	"팩스",
	"팩시밀리",
	"팬티",
	"퍼센트",
	"페인트",
	"편견",
	"편의",
	"편지",
	"편히",
	"평가",
	"평균",
	"평생",
	"평소",
	"평양",
	"평일",
	"평화",
	"포스터",
	"포인트",
	"포장",
	"포함",
	"표면",
	"표정",
	"표준",
	"표현",
	"품목",
	"품질",
	"풍경",
	"풍속",
	"풍습",
	"프랑스",
	"프린터",
	"플라스틱",
	"피곤",
	"피망",
	"피아노",
	"필름",
	"필수",
	"필요",
	"필자",
	"필통",
	"핑계",
	"하느님",
	"하늘",
	"하드웨어",
	"하룻밤",
	"하반기",
	"하숙집",
	"하순",
	"하여튼",
	"하지만",
	"하천",
	"하품",
	"하필",
	"학과",
	"학교",
	"학급",
	"학기",
	"학년",
	"학력",
	"학번",
	"학부모",
	"학비",
	"학생",
	"학술",
	"학습",
	"학용품",
	"학원",
	"학위",
	"학자",
	"학점",
	"한계",
	"한글",
	"한꺼번에",
	"한낮",
	"한눈",
	"한동안",
	"한때",
	"한라산",
	"한마디",
	"한문",
	"한번",
	"한복",
	"한식",
	"한여름",
	"한쪽",
	"할머니",
	"할아버지",
	"할인",
	"함께",
	"함부로",
	"합격",
	"합리적",
	"항공",
	"항구",
	"항상",
	"항의",
	"해결",
	"해군",
	"해답",
	"해당",
	"해물",
	"해석",
	"해설",
	"해수욕장",
	"해안",
	"핵심",
	"핸드백",
	"햄버거",
	"햇볕",
	"햇살",
	"행동",
	"행복",
	"행사",
	"행운",
	"행위",
	"향기",
	"향상",
	"향수",
	"허락",
	"허용",
	"헬기",
	"현관",
	"현금",
	"현대",
	"현상",
	"현실",
	"현장",
	"현재",
	"현지",
	"혈액",
	"협력",
	"형부",
	"형사",
	"형수",
	"형식",
	"형제",
	"형태",
	"형편",
	"혜택",
	"호기심",
	"호남",
	"호랑이",
	"호박",
	"호텔",
	"호흡",
	"혹시",
	"홀로",
	"홈페이지",
	"홍보",
	"홍수",
	"홍차",
	"화면",
	"화분",
	"화살",
	"화요일",
	"화장",
	"화학",
	"확보",
	"확인",
	"확장",
	"확정",
	"환갑",
	"환경",
	"환영",
	"환율",
	"환자",
	"활기",
	"활동",
	"활발히",
	"활용",
	"활짝",
	"회견",
	"회관",
	"회복",
	"회색",
	"회원",
	"회장",
	"회전",
	"횟수",
	"횡단보도",
	"효율적",
	"후반",
	"후춧가루",
	"훈련",
	"훨씬",
	"휴식",
	"휴일",
	"흉내",
	"흐름",
	"흑백",
	"흑인",
	"흔적",
	"흔히",
	"흥미",
	"흥분",
	"희곡",
	"희망",
	"희생",
	"흰색",
	"힘껏"
];

var korean$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': korean
});

var french = [
	"abaisser",
	"abandon",
	"abdiquer",
	"abeille",
	"abolir",
	"aborder",
	"aboutir",
	"aboyer",
	"abrasif",
	"abreuver",
	"abriter",
	"abroger",
	"abrupt",
	"absence",
	"absolu",
	"absurde",
	"abusif",
	"abyssal",
	"académie",
	"acajou",
	"acarien",
	"accabler",
	"accepter",
	"acclamer",
	"accolade",
	"accroche",
	"accuser",
	"acerbe",
	"achat",
	"acheter",
	"aciduler",
	"acier",
	"acompte",
	"acquérir",
	"acronyme",
	"acteur",
	"actif",
	"actuel",
	"adepte",
	"adéquat",
	"adhésif",
	"adjectif",
	"adjuger",
	"admettre",
	"admirer",
	"adopter",
	"adorer",
	"adoucir",
	"adresse",
	"adroit",
	"adulte",
	"adverbe",
	"aérer",
	"aéronef",
	"affaire",
	"affecter",
	"affiche",
	"affreux",
	"affubler",
	"agacer",
	"agencer",
	"agile",
	"agiter",
	"agrafer",
	"agréable",
	"agrume",
	"aider",
	"aiguille",
	"ailier",
	"aimable",
	"aisance",
	"ajouter",
	"ajuster",
	"alarmer",
	"alchimie",
	"alerte",
	"algèbre",
	"algue",
	"aliéner",
	"aliment",
	"alléger",
	"alliage",
	"allouer",
	"allumer",
	"alourdir",
	"alpaga",
	"altesse",
	"alvéole",
	"amateur",
	"ambigu",
	"ambre",
	"aménager",
	"amertume",
	"amidon",
	"amiral",
	"amorcer",
	"amour",
	"amovible",
	"amphibie",
	"ampleur",
	"amusant",
	"analyse",
	"anaphore",
	"anarchie",
	"anatomie",
	"ancien",
	"anéantir",
	"angle",
	"angoisse",
	"anguleux",
	"animal",
	"annexer",
	"annonce",
	"annuel",
	"anodin",
	"anomalie",
	"anonyme",
	"anormal",
	"antenne",
	"antidote",
	"anxieux",
	"apaiser",
	"apéritif",
	"aplanir",
	"apologie",
	"appareil",
	"appeler",
	"apporter",
	"appuyer",
	"aquarium",
	"aqueduc",
	"arbitre",
	"arbuste",
	"ardeur",
	"ardoise",
	"argent",
	"arlequin",
	"armature",
	"armement",
	"armoire",
	"armure",
	"arpenter",
	"arracher",
	"arriver",
	"arroser",
	"arsenic",
	"artériel",
	"article",
	"aspect",
	"asphalte",
	"aspirer",
	"assaut",
	"asservir",
	"assiette",
	"associer",
	"assurer",
	"asticot",
	"astre",
	"astuce",
	"atelier",
	"atome",
	"atrium",
	"atroce",
	"attaque",
	"attentif",
	"attirer",
	"attraper",
	"aubaine",
	"auberge",
	"audace",
	"audible",
	"augurer",
	"aurore",
	"automne",
	"autruche",
	"avaler",
	"avancer",
	"avarice",
	"avenir",
	"averse",
	"aveugle",
	"aviateur",
	"avide",
	"avion",
	"aviser",
	"avoine",
	"avouer",
	"avril",
	"axial",
	"axiome",
	"badge",
	"bafouer",
	"bagage",
	"baguette",
	"baignade",
	"balancer",
	"balcon",
	"baleine",
	"balisage",
	"bambin",
	"bancaire",
	"bandage",
	"banlieue",
	"bannière",
	"banquier",
	"barbier",
	"baril",
	"baron",
	"barque",
	"barrage",
	"bassin",
	"bastion",
	"bataille",
	"bateau",
	"batterie",
	"baudrier",
	"bavarder",
	"belette",
	"bélier",
	"belote",
	"bénéfice",
	"berceau",
	"berger",
	"berline",
	"bermuda",
	"besace",
	"besogne",
	"bétail",
	"beurre",
	"biberon",
	"bicycle",
	"bidule",
	"bijou",
	"bilan",
	"bilingue",
	"billard",
	"binaire",
	"biologie",
	"biopsie",
	"biotype",
	"biscuit",
	"bison",
	"bistouri",
	"bitume",
	"bizarre",
	"blafard",
	"blague",
	"blanchir",
	"blessant",
	"blinder",
	"blond",
	"bloquer",
	"blouson",
	"bobard",
	"bobine",
	"boire",
	"boiser",
	"bolide",
	"bonbon",
	"bondir",
	"bonheur",
	"bonifier",
	"bonus",
	"bordure",
	"borne",
	"botte",
	"boucle",
	"boueux",
	"bougie",
	"boulon",
	"bouquin",
	"bourse",
	"boussole",
	"boutique",
	"boxeur",
	"branche",
	"brasier",
	"brave",
	"brebis",
	"brèche",
	"breuvage",
	"bricoler",
	"brigade",
	"brillant",
	"brioche",
	"brique",
	"brochure",
	"broder",
	"bronzer",
	"brousse",
	"broyeur",
	"brume",
	"brusque",
	"brutal",
	"bruyant",
	"buffle",
	"buisson",
	"bulletin",
	"bureau",
	"burin",
	"bustier",
	"butiner",
	"butoir",
	"buvable",
	"buvette",
	"cabanon",
	"cabine",
	"cachette",
	"cadeau",
	"cadre",
	"caféine",
	"caillou",
	"caisson",
	"calculer",
	"calepin",
	"calibre",
	"calmer",
	"calomnie",
	"calvaire",
	"camarade",
	"caméra",
	"camion",
	"campagne",
	"canal",
	"caneton",
	"canon",
	"cantine",
	"canular",
	"capable",
	"caporal",
	"caprice",
	"capsule",
	"capter",
	"capuche",
	"carabine",
	"carbone",
	"caresser",
	"caribou",
	"carnage",
	"carotte",
	"carreau",
	"carton",
	"cascade",
	"casier",
	"casque",
	"cassure",
	"causer",
	"caution",
	"cavalier",
	"caverne",
	"caviar",
	"cédille",
	"ceinture",
	"céleste",
	"cellule",
	"cendrier",
	"censurer",
	"central",
	"cercle",
	"cérébral",
	"cerise",
	"cerner",
	"cerveau",
	"cesser",
	"chagrin",
	"chaise",
	"chaleur",
	"chambre",
	"chance",
	"chapitre",
	"charbon",
	"chasseur",
	"chaton",
	"chausson",
	"chavirer",
	"chemise",
	"chenille",
	"chéquier",
	"chercher",
	"cheval",
	"chien",
	"chiffre",
	"chignon",
	"chimère",
	"chiot",
	"chlorure",
	"chocolat",
	"choisir",
	"chose",
	"chouette",
	"chrome",
	"chute",
	"cigare",
	"cigogne",
	"cimenter",
	"cinéma",
	"cintrer",
	"circuler",
	"cirer",
	"cirque",
	"citerne",
	"citoyen",
	"citron",
	"civil",
	"clairon",
	"clameur",
	"claquer",
	"classe",
	"clavier",
	"client",
	"cligner",
	"climat",
	"clivage",
	"cloche",
	"clonage",
	"cloporte",
	"cobalt",
	"cobra",
	"cocasse",
	"cocotier",
	"coder",
	"codifier",
	"coffre",
	"cogner",
	"cohésion",
	"coiffer",
	"coincer",
	"colère",
	"colibri",
	"colline",
	"colmater",
	"colonel",
	"combat",
	"comédie",
	"commande",
	"compact",
	"concert",
	"conduire",
	"confier",
	"congeler",
	"connoter",
	"consonne",
	"contact",
	"convexe",
	"copain",
	"copie",
	"corail",
	"corbeau",
	"cordage",
	"corniche",
	"corpus",
	"correct",
	"cortège",
	"cosmique",
	"costume",
	"coton",
	"coude",
	"coupure",
	"courage",
	"couteau",
	"couvrir",
	"coyote",
	"crabe",
	"crainte",
	"cravate",
	"crayon",
	"créature",
	"créditer",
	"crémeux",
	"creuser",
	"crevette",
	"cribler",
	"crier",
	"cristal",
	"critère",
	"croire",
	"croquer",
	"crotale",
	"crucial",
	"cruel",
	"crypter",
	"cubique",
	"cueillir",
	"cuillère",
	"cuisine",
	"cuivre",
	"culminer",
	"cultiver",
	"cumuler",
	"cupide",
	"curatif",
	"curseur",
	"cyanure",
	"cycle",
	"cylindre",
	"cynique",
	"daigner",
	"damier",
	"danger",
	"danseur",
	"dauphin",
	"débattre",
	"débiter",
	"déborder",
	"débrider",
	"débutant",
	"décaler",
	"décembre",
	"déchirer",
	"décider",
	"déclarer",
	"décorer",
	"décrire",
	"décupler",
	"dédale",
	"déductif",
	"déesse",
	"défensif",
	"défiler",
	"défrayer",
	"dégager",
	"dégivrer",
	"déglutir",
	"dégrafer",
	"déjeuner",
	"délice",
	"déloger",
	"demander",
	"demeurer",
	"démolir",
	"dénicher",
	"dénouer",
	"dentelle",
	"dénuder",
	"départ",
	"dépenser",
	"déphaser",
	"déplacer",
	"déposer",
	"déranger",
	"dérober",
	"désastre",
	"descente",
	"désert",
	"désigner",
	"désobéir",
	"dessiner",
	"destrier",
	"détacher",
	"détester",
	"détourer",
	"détresse",
	"devancer",
	"devenir",
	"deviner",
	"devoir",
	"diable",
	"dialogue",
	"diamant",
	"dicter",
	"différer",
	"digérer",
	"digital",
	"digne",
	"diluer",
	"dimanche",
	"diminuer",
	"dioxyde",
	"directif",
	"diriger",
	"discuter",
	"disposer",
	"dissiper",
	"distance",
	"divertir",
	"diviser",
	"docile",
	"docteur",
	"dogme",
	"doigt",
	"domaine",
	"domicile",
	"dompter",
	"donateur",
	"donjon",
	"donner",
	"dopamine",
	"dortoir",
	"dorure",
	"dosage",
	"doseur",
	"dossier",
	"dotation",
	"douanier",
	"double",
	"douceur",
	"douter",
	"doyen",
	"dragon",
	"draper",
	"dresser",
	"dribbler",
	"droiture",
	"duperie",
	"duplexe",
	"durable",
	"durcir",
	"dynastie",
	"éblouir",
	"écarter",
	"écharpe",
	"échelle",
	"éclairer",
	"éclipse",
	"éclore",
	"écluse",
	"école",
	"économie",
	"écorce",
	"écouter",
	"écraser",
	"écrémer",
	"écrivain",
	"écrou",
	"écume",
	"écureuil",
	"édifier",
	"éduquer",
	"effacer",
	"effectif",
	"effigie",
	"effort",
	"effrayer",
	"effusion",
	"égaliser",
	"égarer",
	"éjecter",
	"élaborer",
	"élargir",
	"électron",
	"élégant",
	"éléphant",
	"élève",
	"éligible",
	"élitisme",
	"éloge",
	"élucider",
	"éluder",
	"emballer",
	"embellir",
	"embryon",
	"émeraude",
	"émission",
	"emmener",
	"émotion",
	"émouvoir",
	"empereur",
	"employer",
	"emporter",
	"emprise",
	"émulsion",
	"encadrer",
	"enchère",
	"enclave",
	"encoche",
	"endiguer",
	"endosser",
	"endroit",
	"enduire",
	"énergie",
	"enfance",
	"enfermer",
	"enfouir",
	"engager",
	"engin",
	"englober",
	"énigme",
	"enjamber",
	"enjeu",
	"enlever",
	"ennemi",
	"ennuyeux",
	"enrichir",
	"enrobage",
	"enseigne",
	"entasser",
	"entendre",
	"entier",
	"entourer",
	"entraver",
	"énumérer",
	"envahir",
	"enviable",
	"envoyer",
	"enzyme",
	"éolien",
	"épaissir",
	"épargne",
	"épatant",
	"épaule",
	"épicerie",
	"épidémie",
	"épier",
	"épilogue",
	"épine",
	"épisode",
	"épitaphe",
	"époque",
	"épreuve",
	"éprouver",
	"épuisant",
	"équerre",
	"équipe",
	"ériger",
	"érosion",
	"erreur",
	"éruption",
	"escalier",
	"espadon",
	"espèce",
	"espiègle",
	"espoir",
	"esprit",
	"esquiver",
	"essayer",
	"essence",
	"essieu",
	"essorer",
	"estime",
	"estomac",
	"estrade",
	"étagère",
	"étaler",
	"étanche",
	"étatique",
	"éteindre",
	"étendoir",
	"éternel",
	"éthanol",
	"éthique",
	"ethnie",
	"étirer",
	"étoffer",
	"étoile",
	"étonnant",
	"étourdir",
	"étrange",
	"étroit",
	"étude",
	"euphorie",
	"évaluer",
	"évasion",
	"éventail",
	"évidence",
	"éviter",
	"évolutif",
	"évoquer",
	"exact",
	"exagérer",
	"exaucer",
	"exceller",
	"excitant",
	"exclusif",
	"excuse",
	"exécuter",
	"exemple",
	"exercer",
	"exhaler",
	"exhorter",
	"exigence",
	"exiler",
	"exister",
	"exotique",
	"expédier",
	"explorer",
	"exposer",
	"exprimer",
	"exquis",
	"extensif",
	"extraire",
	"exulter",
	"fable",
	"fabuleux",
	"facette",
	"facile",
	"facture",
	"faiblir",
	"falaise",
	"fameux",
	"famille",
	"farceur",
	"farfelu",
	"farine",
	"farouche",
	"fasciner",
	"fatal",
	"fatigue",
	"faucon",
	"fautif",
	"faveur",
	"favori",
	"fébrile",
	"féconder",
	"fédérer",
	"félin",
	"femme",
	"fémur",
	"fendoir",
	"féodal",
	"fermer",
	"féroce",
	"ferveur",
	"festival",
	"feuille",
	"feutre",
	"février",
	"fiasco",
	"ficeler",
	"fictif",
	"fidèle",
	"figure",
	"filature",
	"filetage",
	"filière",
	"filleul",
	"filmer",
	"filou",
	"filtrer",
	"financer",
	"finir",
	"fiole",
	"firme",
	"fissure",
	"fixer",
	"flairer",
	"flamme",
	"flasque",
	"flatteur",
	"fléau",
	"flèche",
	"fleur",
	"flexion",
	"flocon",
	"flore",
	"fluctuer",
	"fluide",
	"fluvial",
	"folie",
	"fonderie",
	"fongible",
	"fontaine",
	"forcer",
	"forgeron",
	"formuler",
	"fortune",
	"fossile",
	"foudre",
	"fougère",
	"fouiller",
	"foulure",
	"fourmi",
	"fragile",
	"fraise",
	"franchir",
	"frapper",
	"frayeur",
	"frégate",
	"freiner",
	"frelon",
	"frémir",
	"frénésie",
	"frère",
	"friable",
	"friction",
	"frisson",
	"frivole",
	"froid",
	"fromage",
	"frontal",
	"frotter",
	"fruit",
	"fugitif",
	"fuite",
	"fureur",
	"furieux",
	"furtif",
	"fusion",
	"futur",
	"gagner",
	"galaxie",
	"galerie",
	"gambader",
	"garantir",
	"gardien",
	"garnir",
	"garrigue",
	"gazelle",
	"gazon",
	"géant",
	"gélatine",
	"gélule",
	"gendarme",
	"général",
	"génie",
	"genou",
	"gentil",
	"géologie",
	"géomètre",
	"géranium",
	"germe",
	"gestuel",
	"geyser",
	"gibier",
	"gicler",
	"girafe",
	"givre",
	"glace",
	"glaive",
	"glisser",
	"globe",
	"gloire",
	"glorieux",
	"golfeur",
	"gomme",
	"gonfler",
	"gorge",
	"gorille",
	"goudron",
	"gouffre",
	"goulot",
	"goupille",
	"gourmand",
	"goutte",
	"graduel",
	"graffiti",
	"graine",
	"grand",
	"grappin",
	"gratuit",
	"gravir",
	"grenat",
	"griffure",
	"griller",
	"grimper",
	"grogner",
	"gronder",
	"grotte",
	"groupe",
	"gruger",
	"grutier",
	"gruyère",
	"guépard",
	"guerrier",
	"guide",
	"guimauve",
	"guitare",
	"gustatif",
	"gymnaste",
	"gyrostat",
	"habitude",
	"hachoir",
	"halte",
	"hameau",
	"hangar",
	"hanneton",
	"haricot",
	"harmonie",
	"harpon",
	"hasard",
	"hélium",
	"hématome",
	"herbe",
	"hérisson",
	"hermine",
	"héron",
	"hésiter",
	"heureux",
	"hiberner",
	"hibou",
	"hilarant",
	"histoire",
	"hiver",
	"homard",
	"hommage",
	"homogène",
	"honneur",
	"honorer",
	"honteux",
	"horde",
	"horizon",
	"horloge",
	"hormone",
	"horrible",
	"houleux",
	"housse",
	"hublot",
	"huileux",
	"humain",
	"humble",
	"humide",
	"humour",
	"hurler",
	"hydromel",
	"hygiène",
	"hymne",
	"hypnose",
	"idylle",
	"ignorer",
	"iguane",
	"illicite",
	"illusion",
	"image",
	"imbiber",
	"imiter",
	"immense",
	"immobile",
	"immuable",
	"impact",
	"impérial",
	"implorer",
	"imposer",
	"imprimer",
	"imputer",
	"incarner",
	"incendie",
	"incident",
	"incliner",
	"incolore",
	"indexer",
	"indice",
	"inductif",
	"inédit",
	"ineptie",
	"inexact",
	"infini",
	"infliger",
	"informer",
	"infusion",
	"ingérer",
	"inhaler",
	"inhiber",
	"injecter",
	"injure",
	"innocent",
	"inoculer",
	"inonder",
	"inscrire",
	"insecte",
	"insigne",
	"insolite",
	"inspirer",
	"instinct",
	"insulter",
	"intact",
	"intense",
	"intime",
	"intrigue",
	"intuitif",
	"inutile",
	"invasion",
	"inventer",
	"inviter",
	"invoquer",
	"ironique",
	"irradier",
	"irréel",
	"irriter",
	"isoler",
	"ivoire",
	"ivresse",
	"jaguar",
	"jaillir",
	"jambe",
	"janvier",
	"jardin",
	"jauger",
	"jaune",
	"javelot",
	"jetable",
	"jeton",
	"jeudi",
	"jeunesse",
	"joindre",
	"joncher",
	"jongler",
	"joueur",
	"jouissif",
	"journal",
	"jovial",
	"joyau",
	"joyeux",
	"jubiler",
	"jugement",
	"junior",
	"jupon",
	"juriste",
	"justice",
	"juteux",
	"juvénile",
	"kayak",
	"kimono",
	"kiosque",
	"label",
	"labial",
	"labourer",
	"lacérer",
	"lactose",
	"lagune",
	"laine",
	"laisser",
	"laitier",
	"lambeau",
	"lamelle",
	"lampe",
	"lanceur",
	"langage",
	"lanterne",
	"lapin",
	"largeur",
	"larme",
	"laurier",
	"lavabo",
	"lavoir",
	"lecture",
	"légal",
	"léger",
	"légume",
	"lessive",
	"lettre",
	"levier",
	"lexique",
	"lézard",
	"liasse",
	"libérer",
	"libre",
	"licence",
	"licorne",
	"liège",
	"lièvre",
	"ligature",
	"ligoter",
	"ligue",
	"limer",
	"limite",
	"limonade",
	"limpide",
	"linéaire",
	"lingot",
	"lionceau",
	"liquide",
	"lisière",
	"lister",
	"lithium",
	"litige",
	"littoral",
	"livreur",
	"logique",
	"lointain",
	"loisir",
	"lombric",
	"loterie",
	"louer",
	"lourd",
	"loutre",
	"louve",
	"loyal",
	"lubie",
	"lucide",
	"lucratif",
	"lueur",
	"lugubre",
	"luisant",
	"lumière",
	"lunaire",
	"lundi",
	"luron",
	"lutter",
	"luxueux",
	"machine",
	"magasin",
	"magenta",
	"magique",
	"maigre",
	"maillon",
	"maintien",
	"mairie",
	"maison",
	"majorer",
	"malaxer",
	"maléfice",
	"malheur",
	"malice",
	"mallette",
	"mammouth",
	"mandater",
	"maniable",
	"manquant",
	"manteau",
	"manuel",
	"marathon",
	"marbre",
	"marchand",
	"mardi",
	"maritime",
	"marqueur",
	"marron",
	"marteler",
	"mascotte",
	"massif",
	"matériel",
	"matière",
	"matraque",
	"maudire",
	"maussade",
	"mauve",
	"maximal",
	"méchant",
	"méconnu",
	"médaille",
	"médecin",
	"méditer",
	"méduse",
	"meilleur",
	"mélange",
	"mélodie",
	"membre",
	"mémoire",
	"menacer",
	"mener",
	"menhir",
	"mensonge",
	"mentor",
	"mercredi",
	"mérite",
	"merle",
	"messager",
	"mesure",
	"métal",
	"météore",
	"méthode",
	"métier",
	"meuble",
	"miauler",
	"microbe",
	"miette",
	"mignon",
	"migrer",
	"milieu",
	"million",
	"mimique",
	"mince",
	"minéral",
	"minimal",
	"minorer",
	"minute",
	"miracle",
	"miroiter",
	"missile",
	"mixte",
	"mobile",
	"moderne",
	"moelleux",
	"mondial",
	"moniteur",
	"monnaie",
	"monotone",
	"monstre",
	"montagne",
	"monument",
	"moqueur",
	"morceau",
	"morsure",
	"mortier",
	"moteur",
	"motif",
	"mouche",
	"moufle",
	"moulin",
	"mousson",
	"mouton",
	"mouvant",
	"multiple",
	"munition",
	"muraille",
	"murène",
	"murmure",
	"muscle",
	"muséum",
	"musicien",
	"mutation",
	"muter",
	"mutuel",
	"myriade",
	"myrtille",
	"mystère",
	"mythique",
	"nageur",
	"nappe",
	"narquois",
	"narrer",
	"natation",
	"nation",
	"nature",
	"naufrage",
	"nautique",
	"navire",
	"nébuleux",
	"nectar",
	"néfaste",
	"négation",
	"négliger",
	"négocier",
	"neige",
	"nerveux",
	"nettoyer",
	"neurone",
	"neutron",
	"neveu",
	"niche",
	"nickel",
	"nitrate",
	"niveau",
	"noble",
	"nocif",
	"nocturne",
	"noirceur",
	"noisette",
	"nomade",
	"nombreux",
	"nommer",
	"normatif",
	"notable",
	"notifier",
	"notoire",
	"nourrir",
	"nouveau",
	"novateur",
	"novembre",
	"novice",
	"nuage",
	"nuancer",
	"nuire",
	"nuisible",
	"numéro",
	"nuptial",
	"nuque",
	"nutritif",
	"obéir",
	"objectif",
	"obliger",
	"obscur",
	"observer",
	"obstacle",
	"obtenir",
	"obturer",
	"occasion",
	"occuper",
	"océan",
	"octobre",
	"octroyer",
	"octupler",
	"oculaire",
	"odeur",
	"odorant",
	"offenser",
	"officier",
	"offrir",
	"ogive",
	"oiseau",
	"oisillon",
	"olfactif",
	"olivier",
	"ombrage",
	"omettre",
	"onctueux",
	"onduler",
	"onéreux",
	"onirique",
	"opale",
	"opaque",
	"opérer",
	"opinion",
	"opportun",
	"opprimer",
	"opter",
	"optique",
	"orageux",
	"orange",
	"orbite",
	"ordonner",
	"oreille",
	"organe",
	"orgueil",
	"orifice",
	"ornement",
	"orque",
	"ortie",
	"osciller",
	"osmose",
	"ossature",
	"otarie",
	"ouragan",
	"ourson",
	"outil",
	"outrager",
	"ouvrage",
	"ovation",
	"oxyde",
	"oxygène",
	"ozone",
	"paisible",
	"palace",
	"palmarès",
	"palourde",
	"palper",
	"panache",
	"panda",
	"pangolin",
	"paniquer",
	"panneau",
	"panorama",
	"pantalon",
	"papaye",
	"papier",
	"papoter",
	"papyrus",
	"paradoxe",
	"parcelle",
	"paresse",
	"parfumer",
	"parler",
	"parole",
	"parrain",
	"parsemer",
	"partager",
	"parure",
	"parvenir",
	"passion",
	"pastèque",
	"paternel",
	"patience",
	"patron",
	"pavillon",
	"pavoiser",
	"payer",
	"paysage",
	"peigne",
	"peintre",
	"pelage",
	"pélican",
	"pelle",
	"pelouse",
	"peluche",
	"pendule",
	"pénétrer",
	"pénible",
	"pensif",
	"pénurie",
	"pépite",
	"péplum",
	"perdrix",
	"perforer",
	"période",
	"permuter",
	"perplexe",
	"persil",
	"perte",
	"peser",
	"pétale",
	"petit",
	"pétrir",
	"peuple",
	"pharaon",
	"phobie",
	"phoque",
	"photon",
	"phrase",
	"physique",
	"piano",
	"pictural",
	"pièce",
	"pierre",
	"pieuvre",
	"pilote",
	"pinceau",
	"pipette",
	"piquer",
	"pirogue",
	"piscine",
	"piston",
	"pivoter",
	"pixel",
	"pizza",
	"placard",
	"plafond",
	"plaisir",
	"planer",
	"plaque",
	"plastron",
	"plateau",
	"pleurer",
	"plexus",
	"pliage",
	"plomb",
	"plonger",
	"pluie",
	"plumage",
	"pochette",
	"poésie",
	"poète",
	"pointe",
	"poirier",
	"poisson",
	"poivre",
	"polaire",
	"policier",
	"pollen",
	"polygone",
	"pommade",
	"pompier",
	"ponctuel",
	"pondérer",
	"poney",
	"portique",
	"position",
	"posséder",
	"posture",
	"potager",
	"poteau",
	"potion",
	"pouce",
	"poulain",
	"poumon",
	"pourpre",
	"poussin",
	"pouvoir",
	"prairie",
	"pratique",
	"précieux",
	"prédire",
	"préfixe",
	"prélude",
	"prénom",
	"présence",
	"prétexte",
	"prévoir",
	"primitif",
	"prince",
	"prison",
	"priver",
	"problème",
	"procéder",
	"prodige",
	"profond",
	"progrès",
	"proie",
	"projeter",
	"prologue",
	"promener",
	"propre",
	"prospère",
	"protéger",
	"prouesse",
	"proverbe",
	"prudence",
	"pruneau",
	"psychose",
	"public",
	"puceron",
	"puiser",
	"pulpe",
	"pulsar",
	"punaise",
	"punitif",
	"pupitre",
	"purifier",
	"puzzle",
	"pyramide",
	"quasar",
	"querelle",
	"question",
	"quiétude",
	"quitter",
	"quotient",
	"racine",
	"raconter",
	"radieux",
	"ragondin",
	"raideur",
	"raisin",
	"ralentir",
	"rallonge",
	"ramasser",
	"rapide",
	"rasage",
	"ratisser",
	"ravager",
	"ravin",
	"rayonner",
	"réactif",
	"réagir",
	"réaliser",
	"réanimer",
	"recevoir",
	"réciter",
	"réclamer",
	"récolter",
	"recruter",
	"reculer",
	"recycler",
	"rédiger",
	"redouter",
	"refaire",
	"réflexe",
	"réformer",
	"refrain",
	"refuge",
	"régalien",
	"région",
	"réglage",
	"régulier",
	"réitérer",
	"rejeter",
	"rejouer",
	"relatif",
	"relever",
	"relief",
	"remarque",
	"remède",
	"remise",
	"remonter",
	"remplir",
	"remuer",
	"renard",
	"renfort",
	"renifler",
	"renoncer",
	"rentrer",
	"renvoi",
	"replier",
	"reporter",
	"reprise",
	"reptile",
	"requin",
	"réserve",
	"résineux",
	"résoudre",
	"respect",
	"rester",
	"résultat",
	"rétablir",
	"retenir",
	"réticule",
	"retomber",
	"retracer",
	"réunion",
	"réussir",
	"revanche",
	"revivre",
	"révolte",
	"révulsif",
	"richesse",
	"rideau",
	"rieur",
	"rigide",
	"rigoler",
	"rincer",
	"riposter",
	"risible",
	"risque",
	"rituel",
	"rival",
	"rivière",
	"rocheux",
	"romance",
	"rompre",
	"ronce",
	"rondin",
	"roseau",
	"rosier",
	"rotatif",
	"rotor",
	"rotule",
	"rouge",
	"rouille",
	"rouleau",
	"routine",
	"royaume",
	"ruban",
	"rubis",
	"ruche",
	"ruelle",
	"rugueux",
	"ruiner",
	"ruisseau",
	"ruser",
	"rustique",
	"rythme",
	"sabler",
	"saboter",
	"sabre",
	"sacoche",
	"safari",
	"sagesse",
	"saisir",
	"salade",
	"salive",
	"salon",
	"saluer",
	"samedi",
	"sanction",
	"sanglier",
	"sarcasme",
	"sardine",
	"saturer",
	"saugrenu",
	"saumon",
	"sauter",
	"sauvage",
	"savant",
	"savonner",
	"scalpel",
	"scandale",
	"scélérat",
	"scénario",
	"sceptre",
	"schéma",
	"science",
	"scinder",
	"score",
	"scrutin",
	"sculpter",
	"séance",
	"sécable",
	"sécher",
	"secouer",
	"sécréter",
	"sédatif",
	"séduire",
	"seigneur",
	"séjour",
	"sélectif",
	"semaine",
	"sembler",
	"semence",
	"séminal",
	"sénateur",
	"sensible",
	"sentence",
	"séparer",
	"séquence",
	"serein",
	"sergent",
	"sérieux",
	"serrure",
	"sérum",
	"service",
	"sésame",
	"sévir",
	"sevrage",
	"sextuple",
	"sidéral",
	"siècle",
	"siéger",
	"siffler",
	"sigle",
	"signal",
	"silence",
	"silicium",
	"simple",
	"sincère",
	"sinistre",
	"siphon",
	"sirop",
	"sismique",
	"situer",
	"skier",
	"social",
	"socle",
	"sodium",
	"soigneux",
	"soldat",
	"soleil",
	"solitude",
	"soluble",
	"sombre",
	"sommeil",
	"somnoler",
	"sonde",
	"songeur",
	"sonnette",
	"sonore",
	"sorcier",
	"sortir",
	"sosie",
	"sottise",
	"soucieux",
	"soudure",
	"souffle",
	"soulever",
	"soupape",
	"source",
	"soutirer",
	"souvenir",
	"spacieux",
	"spatial",
	"spécial",
	"sphère",
	"spiral",
	"stable",
	"station",
	"sternum",
	"stimulus",
	"stipuler",
	"strict",
	"studieux",
	"stupeur",
	"styliste",
	"sublime",
	"substrat",
	"subtil",
	"subvenir",
	"succès",
	"sucre",
	"suffixe",
	"suggérer",
	"suiveur",
	"sulfate",
	"superbe",
	"supplier",
	"surface",
	"suricate",
	"surmener",
	"surprise",
	"sursaut",
	"survie",
	"suspect",
	"syllabe",
	"symbole",
	"symétrie",
	"synapse",
	"syntaxe",
	"système",
	"tabac",
	"tablier",
	"tactile",
	"tailler",
	"talent",
	"talisman",
	"talonner",
	"tambour",
	"tamiser",
	"tangible",
	"tapis",
	"taquiner",
	"tarder",
	"tarif",
	"tartine",
	"tasse",
	"tatami",
	"tatouage",
	"taupe",
	"taureau",
	"taxer",
	"témoin",
	"temporel",
	"tenaille",
	"tendre",
	"teneur",
	"tenir",
	"tension",
	"terminer",
	"terne",
	"terrible",
	"tétine",
	"texte",
	"thème",
	"théorie",
	"thérapie",
	"thorax",
	"tibia",
	"tiède",
	"timide",
	"tirelire",
	"tiroir",
	"tissu",
	"titane",
	"titre",
	"tituber",
	"toboggan",
	"tolérant",
	"tomate",
	"tonique",
	"tonneau",
	"toponyme",
	"torche",
	"tordre",
	"tornade",
	"torpille",
	"torrent",
	"torse",
	"tortue",
	"totem",
	"toucher",
	"tournage",
	"tousser",
	"toxine",
	"traction",
	"trafic",
	"tragique",
	"trahir",
	"train",
	"trancher",
	"travail",
	"trèfle",
	"tremper",
	"trésor",
	"treuil",
	"triage",
	"tribunal",
	"tricoter",
	"trilogie",
	"triomphe",
	"tripler",
	"triturer",
	"trivial",
	"trombone",
	"tronc",
	"tropical",
	"troupeau",
	"tuile",
	"tulipe",
	"tumulte",
	"tunnel",
	"turbine",
	"tuteur",
	"tutoyer",
	"tuyau",
	"tympan",
	"typhon",
	"typique",
	"tyran",
	"ubuesque",
	"ultime",
	"ultrason",
	"unanime",
	"unifier",
	"union",
	"unique",
	"unitaire",
	"univers",
	"uranium",
	"urbain",
	"urticant",
	"usage",
	"usine",
	"usuel",
	"usure",
	"utile",
	"utopie",
	"vacarme",
	"vaccin",
	"vagabond",
	"vague",
	"vaillant",
	"vaincre",
	"vaisseau",
	"valable",
	"valise",
	"vallon",
	"valve",
	"vampire",
	"vanille",
	"vapeur",
	"varier",
	"vaseux",
	"vassal",
	"vaste",
	"vecteur",
	"vedette",
	"végétal",
	"véhicule",
	"veinard",
	"véloce",
	"vendredi",
	"vénérer",
	"venger",
	"venimeux",
	"ventouse",
	"verdure",
	"vérin",
	"vernir",
	"verrou",
	"verser",
	"vertu",
	"veston",
	"vétéran",
	"vétuste",
	"vexant",
	"vexer",
	"viaduc",
	"viande",
	"victoire",
	"vidange",
	"vidéo",
	"vignette",
	"vigueur",
	"vilain",
	"village",
	"vinaigre",
	"violon",
	"vipère",
	"virement",
	"virtuose",
	"virus",
	"visage",
	"viseur",
	"vision",
	"visqueux",
	"visuel",
	"vital",
	"vitesse",
	"viticole",
	"vitrine",
	"vivace",
	"vivipare",
	"vocation",
	"voguer",
	"voile",
	"voisin",
	"voiture",
	"volaille",
	"volcan",
	"voltiger",
	"volume",
	"vorace",
	"vortex",
	"voter",
	"vouloir",
	"voyage",
	"voyelle",
	"wagon",
	"xénon",
	"yacht",
	"zèbre",
	"zénith",
	"zeste",
	"zoologie"
];

var french$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': french
});

var italian = [
	"abaco",
	"abbaglio",
	"abbinato",
	"abete",
	"abisso",
	"abolire",
	"abrasivo",
	"abrogato",
	"accadere",
	"accenno",
	"accusato",
	"acetone",
	"achille",
	"acido",
	"acqua",
	"acre",
	"acrilico",
	"acrobata",
	"acuto",
	"adagio",
	"addebito",
	"addome",
	"adeguato",
	"aderire",
	"adipe",
	"adottare",
	"adulare",
	"affabile",
	"affetto",
	"affisso",
	"affranto",
	"aforisma",
	"afoso",
	"africano",
	"agave",
	"agente",
	"agevole",
	"aggancio",
	"agire",
	"agitare",
	"agonismo",
	"agricolo",
	"agrumeto",
	"aguzzo",
	"alabarda",
	"alato",
	"albatro",
	"alberato",
	"albo",
	"albume",
	"alce",
	"alcolico",
	"alettone",
	"alfa",
	"algebra",
	"aliante",
	"alibi",
	"alimento",
	"allagato",
	"allegro",
	"allievo",
	"allodola",
	"allusivo",
	"almeno",
	"alogeno",
	"alpaca",
	"alpestre",
	"altalena",
	"alterno",
	"alticcio",
	"altrove",
	"alunno",
	"alveolo",
	"alzare",
	"amalgama",
	"amanita",
	"amarena",
	"ambito",
	"ambrato",
	"ameba",
	"america",
	"ametista",
	"amico",
	"ammasso",
	"ammenda",
	"ammirare",
	"ammonito",
	"amore",
	"ampio",
	"ampliare",
	"amuleto",
	"anacardo",
	"anagrafe",
	"analista",
	"anarchia",
	"anatra",
	"anca",
	"ancella",
	"ancora",
	"andare",
	"andrea",
	"anello",
	"angelo",
	"angolare",
	"angusto",
	"anima",
	"annegare",
	"annidato",
	"anno",
	"annuncio",
	"anonimo",
	"anticipo",
	"anzi",
	"apatico",
	"apertura",
	"apode",
	"apparire",
	"appetito",
	"appoggio",
	"approdo",
	"appunto",
	"aprile",
	"arabica",
	"arachide",
	"aragosta",
	"araldica",
	"arancio",
	"aratura",
	"arazzo",
	"arbitro",
	"archivio",
	"ardito",
	"arenile",
	"argento",
	"argine",
	"arguto",
	"aria",
	"armonia",
	"arnese",
	"arredato",
	"arringa",
	"arrosto",
	"arsenico",
	"arso",
	"artefice",
	"arzillo",
	"asciutto",
	"ascolto",
	"asepsi",
	"asettico",
	"asfalto",
	"asino",
	"asola",
	"aspirato",
	"aspro",
	"assaggio",
	"asse",
	"assoluto",
	"assurdo",
	"asta",
	"astenuto",
	"astice",
	"astratto",
	"atavico",
	"ateismo",
	"atomico",
	"atono",
	"attesa",
	"attivare",
	"attorno",
	"attrito",
	"attuale",
	"ausilio",
	"austria",
	"autista",
	"autonomo",
	"autunno",
	"avanzato",
	"avere",
	"avvenire",
	"avviso",
	"avvolgere",
	"azione",
	"azoto",
	"azzimo",
	"azzurro",
	"babele",
	"baccano",
	"bacino",
	"baco",
	"badessa",
	"badilata",
	"bagnato",
	"baita",
	"balcone",
	"baldo",
	"balena",
	"ballata",
	"balzano",
	"bambino",
	"bandire",
	"baraonda",
	"barbaro",
	"barca",
	"baritono",
	"barlume",
	"barocco",
	"basilico",
	"basso",
	"batosta",
	"battuto",
	"baule",
	"bava",
	"bavosa",
	"becco",
	"beffa",
	"belgio",
	"belva",
	"benda",
	"benevole",
	"benigno",
	"benzina",
	"bere",
	"berlina",
	"beta",
	"bibita",
	"bici",
	"bidone",
	"bifido",
	"biga",
	"bilancia",
	"bimbo",
	"binocolo",
	"biologo",
	"bipede",
	"bipolare",
	"birbante",
	"birra",
	"biscotto",
	"bisesto",
	"bisnonno",
	"bisonte",
	"bisturi",
	"bizzarro",
	"blando",
	"blatta",
	"bollito",
	"bonifico",
	"bordo",
	"bosco",
	"botanico",
	"bottino",
	"bozzolo",
	"braccio",
	"bradipo",
	"brama",
	"branca",
	"bravura",
	"bretella",
	"brevetto",
	"brezza",
	"briglia",
	"brillante",
	"brindare",
	"broccolo",
	"brodo",
	"bronzina",
	"brullo",
	"bruno",
	"bubbone",
	"buca",
	"budino",
	"buffone",
	"buio",
	"bulbo",
	"buono",
	"burlone",
	"burrasca",
	"bussola",
	"busta",
	"cadetto",
	"caduco",
	"calamaro",
	"calcolo",
	"calesse",
	"calibro",
	"calmo",
	"caloria",
	"cambusa",
	"camerata",
	"camicia",
	"cammino",
	"camola",
	"campale",
	"canapa",
	"candela",
	"cane",
	"canino",
	"canotto",
	"cantina",
	"capace",
	"capello",
	"capitolo",
	"capogiro",
	"cappero",
	"capra",
	"capsula",
	"carapace",
	"carcassa",
	"cardo",
	"carisma",
	"carovana",
	"carretto",
	"cartolina",
	"casaccio",
	"cascata",
	"caserma",
	"caso",
	"cassone",
	"castello",
	"casuale",
	"catasta",
	"catena",
	"catrame",
	"cauto",
	"cavillo",
	"cedibile",
	"cedrata",
	"cefalo",
	"celebre",
	"cellulare",
	"cena",
	"cenone",
	"centesimo",
	"ceramica",
	"cercare",
	"certo",
	"cerume",
	"cervello",
	"cesoia",
	"cespo",
	"ceto",
	"chela",
	"chiaro",
	"chicca",
	"chiedere",
	"chimera",
	"china",
	"chirurgo",
	"chitarra",
	"ciao",
	"ciclismo",
	"cifrare",
	"cigno",
	"cilindro",
	"ciottolo",
	"circa",
	"cirrosi",
	"citrico",
	"cittadino",
	"ciuffo",
	"civetta",
	"civile",
	"classico",
	"clinica",
	"cloro",
	"cocco",
	"codardo",
	"codice",
	"coerente",
	"cognome",
	"collare",
	"colmato",
	"colore",
	"colposo",
	"coltivato",
	"colza",
	"coma",
	"cometa",
	"commando",
	"comodo",
	"computer",
	"comune",
	"conciso",
	"condurre",
	"conferma",
	"congelare",
	"coniuge",
	"connesso",
	"conoscere",
	"consumo",
	"continuo",
	"convegno",
	"coperto",
	"copione",
	"coppia",
	"copricapo",
	"corazza",
	"cordata",
	"coricato",
	"cornice",
	"corolla",
	"corpo",
	"corredo",
	"corsia",
	"cortese",
	"cosmico",
	"costante",
	"cottura",
	"covato",
	"cratere",
	"cravatta",
	"creato",
	"credere",
	"cremoso",
	"crescita",
	"creta",
	"criceto",
	"crinale",
	"crisi",
	"critico",
	"croce",
	"cronaca",
	"crostata",
	"cruciale",
	"crusca",
	"cucire",
	"cuculo",
	"cugino",
	"cullato",
	"cupola",
	"curatore",
	"cursore",
	"curvo",
	"cuscino",
	"custode",
	"dado",
	"daino",
	"dalmata",
	"damerino",
	"daniela",
	"dannoso",
	"danzare",
	"datato",
	"davanti",
	"davvero",
	"debutto",
	"decennio",
	"deciso",
	"declino",
	"decollo",
	"decreto",
	"dedicato",
	"definito",
	"deforme",
	"degno",
	"delegare",
	"delfino",
	"delirio",
	"delta",
	"demenza",
	"denotato",
	"dentro",
	"deposito",
	"derapata",
	"derivare",
	"deroga",
	"descritto",
	"deserto",
	"desiderio",
	"desumere",
	"detersivo",
	"devoto",
	"diametro",
	"dicembre",
	"diedro",
	"difeso",
	"diffuso",
	"digerire",
	"digitale",
	"diluvio",
	"dinamico",
	"dinnanzi",
	"dipinto",
	"diploma",
	"dipolo",
	"diradare",
	"dire",
	"dirotto",
	"dirupo",
	"disagio",
	"discreto",
	"disfare",
	"disgelo",
	"disposto",
	"distanza",
	"disumano",
	"dito",
	"divano",
	"divelto",
	"dividere",
	"divorato",
	"doblone",
	"docente",
	"doganale",
	"dogma",
	"dolce",
	"domato",
	"domenica",
	"dominare",
	"dondolo",
	"dono",
	"dormire",
	"dote",
	"dottore",
	"dovuto",
	"dozzina",
	"drago",
	"druido",
	"dubbio",
	"dubitare",
	"ducale",
	"duna",
	"duomo",
	"duplice",
	"duraturo",
	"ebano",
	"eccesso",
	"ecco",
	"eclissi",
	"economia",
	"edera",
	"edicola",
	"edile",
	"editoria",
	"educare",
	"egemonia",
	"egli",
	"egoismo",
	"egregio",
	"elaborato",
	"elargire",
	"elegante",
	"elencato",
	"eletto",
	"elevare",
	"elfico",
	"elica",
	"elmo",
	"elsa",
	"eluso",
	"emanato",
	"emblema",
	"emesso",
	"emiro",
	"emotivo",
	"emozione",
	"empirico",
	"emulo",
	"endemico",
	"enduro",
	"energia",
	"enfasi",
	"enoteca",
	"entrare",
	"enzima",
	"epatite",
	"epilogo",
	"episodio",
	"epocale",
	"eppure",
	"equatore",
	"erario",
	"erba",
	"erboso",
	"erede",
	"eremita",
	"erigere",
	"ermetico",
	"eroe",
	"erosivo",
	"errante",
	"esagono",
	"esame",
	"esanime",
	"esaudire",
	"esca",
	"esempio",
	"esercito",
	"esibito",
	"esigente",
	"esistere",
	"esito",
	"esofago",
	"esortato",
	"esoso",
	"espanso",
	"espresso",
	"essenza",
	"esso",
	"esteso",
	"estimare",
	"estonia",
	"estroso",
	"esultare",
	"etilico",
	"etnico",
	"etrusco",
	"etto",
	"euclideo",
	"europa",
	"evaso",
	"evidenza",
	"evitato",
	"evoluto",
	"evviva",
	"fabbrica",
	"faccenda",
	"fachiro",
	"falco",
	"famiglia",
	"fanale",
	"fanfara",
	"fango",
	"fantasma",
	"fare",
	"farfalla",
	"farinoso",
	"farmaco",
	"fascia",
	"fastoso",
	"fasullo",
	"faticare",
	"fato",
	"favoloso",
	"febbre",
	"fecola",
	"fede",
	"fegato",
	"felpa",
	"feltro",
	"femmina",
	"fendere",
	"fenomeno",
	"fermento",
	"ferro",
	"fertile",
	"fessura",
	"festivo",
	"fetta",
	"feudo",
	"fiaba",
	"fiducia",
	"fifa",
	"figurato",
	"filo",
	"finanza",
	"finestra",
	"finire",
	"fiore",
	"fiscale",
	"fisico",
	"fiume",
	"flacone",
	"flamenco",
	"flebo",
	"flemma",
	"florido",
	"fluente",
	"fluoro",
	"fobico",
	"focaccia",
	"focoso",
	"foderato",
	"foglio",
	"folata",
	"folclore",
	"folgore",
	"fondente",
	"fonetico",
	"fonia",
	"fontana",
	"forbito",
	"forchetta",
	"foresta",
	"formica",
	"fornaio",
	"foro",
	"fortezza",
	"forzare",
	"fosfato",
	"fosso",
	"fracasso",
	"frana",
	"frassino",
	"fratello",
	"freccetta",
	"frenata",
	"fresco",
	"frigo",
	"frollino",
	"fronde",
	"frugale",
	"frutta",
	"fucilata",
	"fucsia",
	"fuggente",
	"fulmine",
	"fulvo",
	"fumante",
	"fumetto",
	"fumoso",
	"fune",
	"funzione",
	"fuoco",
	"furbo",
	"furgone",
	"furore",
	"fuso",
	"futile",
	"gabbiano",
	"gaffe",
	"galateo",
	"gallina",
	"galoppo",
	"gambero",
	"gamma",
	"garanzia",
	"garbo",
	"garofano",
	"garzone",
	"gasdotto",
	"gasolio",
	"gastrico",
	"gatto",
	"gaudio",
	"gazebo",
	"gazzella",
	"geco",
	"gelatina",
	"gelso",
	"gemello",
	"gemmato",
	"gene",
	"genitore",
	"gennaio",
	"genotipo",
	"gergo",
	"ghepardo",
	"ghiaccio",
	"ghisa",
	"giallo",
	"gilda",
	"ginepro",
	"giocare",
	"gioiello",
	"giorno",
	"giove",
	"girato",
	"girone",
	"gittata",
	"giudizio",
	"giurato",
	"giusto",
	"globulo",
	"glutine",
	"gnomo",
	"gobba",
	"golf",
	"gomito",
	"gommone",
	"gonfio",
	"gonna",
	"governo",
	"gracile",
	"grado",
	"grafico",
	"grammo",
	"grande",
	"grattare",
	"gravoso",
	"grazia",
	"greca",
	"gregge",
	"grifone",
	"grigio",
	"grinza",
	"grotta",
	"gruppo",
	"guadagno",
	"guaio",
	"guanto",
	"guardare",
	"gufo",
	"guidare",
	"ibernato",
	"icona",
	"identico",
	"idillio",
	"idolo",
	"idra",
	"idrico",
	"idrogeno",
	"igiene",
	"ignaro",
	"ignorato",
	"ilare",
	"illeso",
	"illogico",
	"illudere",
	"imballo",
	"imbevuto",
	"imbocco",
	"imbuto",
	"immane",
	"immerso",
	"immolato",
	"impacco",
	"impeto",
	"impiego",
	"importo",
	"impronta",
	"inalare",
	"inarcare",
	"inattivo",
	"incanto",
	"incendio",
	"inchino",
	"incisivo",
	"incluso",
	"incontro",
	"incrocio",
	"incubo",
	"indagine",
	"india",
	"indole",
	"inedito",
	"infatti",
	"infilare",
	"inflitto",
	"ingaggio",
	"ingegno",
	"inglese",
	"ingordo",
	"ingrosso",
	"innesco",
	"inodore",
	"inoltrare",
	"inondato",
	"insano",
	"insetto",
	"insieme",
	"insonnia",
	"insulina",
	"intasato",
	"intero",
	"intonaco",
	"intuito",
	"inumidire",
	"invalido",
	"invece",
	"invito",
	"iperbole",
	"ipnotico",
	"ipotesi",
	"ippica",
	"iride",
	"irlanda",
	"ironico",
	"irrigato",
	"irrorare",
	"isolato",
	"isotopo",
	"isterico",
	"istituto",
	"istrice",
	"italia",
	"iterare",
	"labbro",
	"labirinto",
	"lacca",
	"lacerato",
	"lacrima",
	"lacuna",
	"laddove",
	"lago",
	"lampo",
	"lancetta",
	"lanterna",
	"lardoso",
	"larga",
	"laringe",
	"lastra",
	"latenza",
	"latino",
	"lattuga",
	"lavagna",
	"lavoro",
	"legale",
	"leggero",
	"lembo",
	"lentezza",
	"lenza",
	"leone",
	"lepre",
	"lesivo",
	"lessato",
	"lesto",
	"letterale",
	"leva",
	"levigato",
	"libero",
	"lido",
	"lievito",
	"lilla",
	"limatura",
	"limitare",
	"limpido",
	"lineare",
	"lingua",
	"liquido",
	"lira",
	"lirica",
	"lisca",
	"lite",
	"litigio",
	"livrea",
	"locanda",
	"lode",
	"logica",
	"lombare",
	"londra",
	"longevo",
	"loquace",
	"lorenzo",
	"loto",
	"lotteria",
	"luce",
	"lucidato",
	"lumaca",
	"luminoso",
	"lungo",
	"lupo",
	"luppolo",
	"lusinga",
	"lusso",
	"lutto",
	"macabro",
	"macchina",
	"macero",
	"macinato",
	"madama",
	"magico",
	"maglia",
	"magnete",
	"magro",
	"maiolica",
	"malafede",
	"malgrado",
	"malinteso",
	"malsano",
	"malto",
	"malumore",
	"mana",
	"mancia",
	"mandorla",
	"mangiare",
	"manifesto",
	"mannaro",
	"manovra",
	"mansarda",
	"mantide",
	"manubrio",
	"mappa",
	"maratona",
	"marcire",
	"maretta",
	"marmo",
	"marsupio",
	"maschera",
	"massaia",
	"mastino",
	"materasso",
	"matricola",
	"mattone",
	"maturo",
	"mazurca",
	"meandro",
	"meccanico",
	"mecenate",
	"medesimo",
	"meditare",
	"mega",
	"melassa",
	"melis",
	"melodia",
	"meninge",
	"meno",
	"mensola",
	"mercurio",
	"merenda",
	"merlo",
	"meschino",
	"mese",
	"messere",
	"mestolo",
	"metallo",
	"metodo",
	"mettere",
	"miagolare",
	"mica",
	"micelio",
	"michele",
	"microbo",
	"midollo",
	"miele",
	"migliore",
	"milano",
	"milite",
	"mimosa",
	"minerale",
	"mini",
	"minore",
	"mirino",
	"mirtillo",
	"miscela",
	"missiva",
	"misto",
	"misurare",
	"mitezza",
	"mitigare",
	"mitra",
	"mittente",
	"mnemonico",
	"modello",
	"modifica",
	"modulo",
	"mogano",
	"mogio",
	"mole",
	"molosso",
	"monastero",
	"monco",
	"mondina",
	"monetario",
	"monile",
	"monotono",
	"monsone",
	"montato",
	"monviso",
	"mora",
	"mordere",
	"morsicato",
	"mostro",
	"motivato",
	"motosega",
	"motto",
	"movenza",
	"movimento",
	"mozzo",
	"mucca",
	"mucosa",
	"muffa",
	"mughetto",
	"mugnaio",
	"mulatto",
	"mulinello",
	"multiplo",
	"mummia",
	"munto",
	"muovere",
	"murale",
	"musa",
	"muscolo",
	"musica",
	"mutevole",
	"muto",
	"nababbo",
	"nafta",
	"nanometro",
	"narciso",
	"narice",
	"narrato",
	"nascere",
	"nastrare",
	"naturale",
	"nautica",
	"naviglio",
	"nebulosa",
	"necrosi",
	"negativo",
	"negozio",
	"nemmeno",
	"neofita",
	"neretto",
	"nervo",
	"nessuno",
	"nettuno",
	"neutrale",
	"neve",
	"nevrotico",
	"nicchia",
	"ninfa",
	"nitido",
	"nobile",
	"nocivo",
	"nodo",
	"nome",
	"nomina",
	"nordico",
	"normale",
	"norvegese",
	"nostrano",
	"notare",
	"notizia",
	"notturno",
	"novella",
	"nucleo",
	"nulla",
	"numero",
	"nuovo",
	"nutrire",
	"nuvola",
	"nuziale",
	"oasi",
	"obbedire",
	"obbligo",
	"obelisco",
	"oblio",
	"obolo",
	"obsoleto",
	"occasione",
	"occhio",
	"occidente",
	"occorrere",
	"occultare",
	"ocra",
	"oculato",
	"odierno",
	"odorare",
	"offerta",
	"offrire",
	"offuscato",
	"oggetto",
	"oggi",
	"ognuno",
	"olandese",
	"olfatto",
	"oliato",
	"oliva",
	"ologramma",
	"oltre",
	"omaggio",
	"ombelico",
	"ombra",
	"omega",
	"omissione",
	"ondoso",
	"onere",
	"onice",
	"onnivoro",
	"onorevole",
	"onta",
	"operato",
	"opinione",
	"opposto",
	"oracolo",
	"orafo",
	"ordine",
	"orecchino",
	"orefice",
	"orfano",
	"organico",
	"origine",
	"orizzonte",
	"orma",
	"ormeggio",
	"ornativo",
	"orologio",
	"orrendo",
	"orribile",
	"ortensia",
	"ortica",
	"orzata",
	"orzo",
	"osare",
	"oscurare",
	"osmosi",
	"ospedale",
	"ospite",
	"ossa",
	"ossidare",
	"ostacolo",
	"oste",
	"otite",
	"otre",
	"ottagono",
	"ottimo",
	"ottobre",
	"ovale",
	"ovest",
	"ovino",
	"oviparo",
	"ovocito",
	"ovunque",
	"ovviare",
	"ozio",
	"pacchetto",
	"pace",
	"pacifico",
	"padella",
	"padrone",
	"paese",
	"paga",
	"pagina",
	"palazzina",
	"palesare",
	"pallido",
	"palo",
	"palude",
	"pandoro",
	"pannello",
	"paolo",
	"paonazzo",
	"paprica",
	"parabola",
	"parcella",
	"parere",
	"pargolo",
	"pari",
	"parlato",
	"parola",
	"partire",
	"parvenza",
	"parziale",
	"passivo",
	"pasticca",
	"patacca",
	"patologia",
	"pattume",
	"pavone",
	"peccato",
	"pedalare",
	"pedonale",
	"peggio",
	"peloso",
	"penare",
	"pendice",
	"penisola",
	"pennuto",
	"penombra",
	"pensare",
	"pentola",
	"pepe",
	"pepita",
	"perbene",
	"percorso",
	"perdonato",
	"perforare",
	"pergamena",
	"periodo",
	"permesso",
	"perno",
	"perplesso",
	"persuaso",
	"pertugio",
	"pervaso",
	"pesatore",
	"pesista",
	"peso",
	"pestifero",
	"petalo",
	"pettine",
	"petulante",
	"pezzo",
	"piacere",
	"pianta",
	"piattino",
	"piccino",
	"picozza",
	"piega",
	"pietra",
	"piffero",
	"pigiama",
	"pigolio",
	"pigro",
	"pila",
	"pilifero",
	"pillola",
	"pilota",
	"pimpante",
	"pineta",
	"pinna",
	"pinolo",
	"pioggia",
	"piombo",
	"piramide",
	"piretico",
	"pirite",
	"pirolisi",
	"pitone",
	"pizzico",
	"placebo",
	"planare",
	"plasma",
	"platano",
	"plenario",
	"pochezza",
	"poderoso",
	"podismo",
	"poesia",
	"poggiare",
	"polenta",
	"poligono",
	"pollice",
	"polmonite",
	"polpetta",
	"polso",
	"poltrona",
	"polvere",
	"pomice",
	"pomodoro",
	"ponte",
	"popoloso",
	"porfido",
	"poroso",
	"porpora",
	"porre",
	"portata",
	"posa",
	"positivo",
	"possesso",
	"postulato",
	"potassio",
	"potere",
	"pranzo",
	"prassi",
	"pratica",
	"precluso",
	"predica",
	"prefisso",
	"pregiato",
	"prelievo",
	"premere",
	"prenotare",
	"preparato",
	"presenza",
	"pretesto",
	"prevalso",
	"prima",
	"principe",
	"privato",
	"problema",
	"procura",
	"produrre",
	"profumo",
	"progetto",
	"prolunga",
	"promessa",
	"pronome",
	"proposta",
	"proroga",
	"proteso",
	"prova",
	"prudente",
	"prugna",
	"prurito",
	"psiche",
	"pubblico",
	"pudica",
	"pugilato",
	"pugno",
	"pulce",
	"pulito",
	"pulsante",
	"puntare",
	"pupazzo",
	"pupilla",
	"puro",
	"quadro",
	"qualcosa",
	"quasi",
	"querela",
	"quota",
	"raccolto",
	"raddoppio",
	"radicale",
	"radunato",
	"raffica",
	"ragazzo",
	"ragione",
	"ragno",
	"ramarro",
	"ramingo",
	"ramo",
	"randagio",
	"rantolare",
	"rapato",
	"rapina",
	"rappreso",
	"rasatura",
	"raschiato",
	"rasente",
	"rassegna",
	"rastrello",
	"rata",
	"ravveduto",
	"reale",
	"recepire",
	"recinto",
	"recluta",
	"recondito",
	"recupero",
	"reddito",
	"redimere",
	"regalato",
	"registro",
	"regola",
	"regresso",
	"relazione",
	"remare",
	"remoto",
	"renna",
	"replica",
	"reprimere",
	"reputare",
	"resa",
	"residente",
	"responso",
	"restauro",
	"rete",
	"retina",
	"retorica",
	"rettifica",
	"revocato",
	"riassunto",
	"ribadire",
	"ribelle",
	"ribrezzo",
	"ricarica",
	"ricco",
	"ricevere",
	"riciclato",
	"ricordo",
	"ricreduto",
	"ridicolo",
	"ridurre",
	"rifasare",
	"riflesso",
	"riforma",
	"rifugio",
	"rigare",
	"rigettato",
	"righello",
	"rilassato",
	"rilevato",
	"rimanere",
	"rimbalzo",
	"rimedio",
	"rimorchio",
	"rinascita",
	"rincaro",
	"rinforzo",
	"rinnovo",
	"rinomato",
	"rinsavito",
	"rintocco",
	"rinuncia",
	"rinvenire",
	"riparato",
	"ripetuto",
	"ripieno",
	"riportare",
	"ripresa",
	"ripulire",
	"risata",
	"rischio",
	"riserva",
	"risibile",
	"riso",
	"rispetto",
	"ristoro",
	"risultato",
	"risvolto",
	"ritardo",
	"ritegno",
	"ritmico",
	"ritrovo",
	"riunione",
	"riva",
	"riverso",
	"rivincita",
	"rivolto",
	"rizoma",
	"roba",
	"robotico",
	"robusto",
	"roccia",
	"roco",
	"rodaggio",
	"rodere",
	"roditore",
	"rogito",
	"rollio",
	"romantico",
	"rompere",
	"ronzio",
	"rosolare",
	"rospo",
	"rotante",
	"rotondo",
	"rotula",
	"rovescio",
	"rubizzo",
	"rubrica",
	"ruga",
	"rullino",
	"rumine",
	"rumoroso",
	"ruolo",
	"rupe",
	"russare",
	"rustico",
	"sabato",
	"sabbiare",
	"sabotato",
	"sagoma",
	"salasso",
	"saldatura",
	"salgemma",
	"salivare",
	"salmone",
	"salone",
	"saltare",
	"saluto",
	"salvo",
	"sapere",
	"sapido",
	"saporito",
	"saraceno",
	"sarcasmo",
	"sarto",
	"sassoso",
	"satellite",
	"satira",
	"satollo",
	"saturno",
	"savana",
	"savio",
	"saziato",
	"sbadiglio",
	"sbalzo",
	"sbancato",
	"sbarra",
	"sbattere",
	"sbavare",
	"sbendare",
	"sbirciare",
	"sbloccato",
	"sbocciato",
	"sbrinare",
	"sbruffone",
	"sbuffare",
	"scabroso",
	"scadenza",
	"scala",
	"scambiare",
	"scandalo",
	"scapola",
	"scarso",
	"scatenare",
	"scavato",
	"scelto",
	"scenico",
	"scettro",
	"scheda",
	"schiena",
	"sciarpa",
	"scienza",
	"scindere",
	"scippo",
	"sciroppo",
	"scivolo",
	"sclerare",
	"scodella",
	"scolpito",
	"scomparto",
	"sconforto",
	"scoprire",
	"scorta",
	"scossone",
	"scozzese",
	"scriba",
	"scrollare",
	"scrutinio",
	"scuderia",
	"scultore",
	"scuola",
	"scuro",
	"scusare",
	"sdebitare",
	"sdoganare",
	"seccatura",
	"secondo",
	"sedano",
	"seggiola",
	"segnalato",
	"segregato",
	"seguito",
	"selciato",
	"selettivo",
	"sella",
	"selvaggio",
	"semaforo",
	"sembrare",
	"seme",
	"seminato",
	"sempre",
	"senso",
	"sentire",
	"sepolto",
	"sequenza",
	"serata",
	"serbato",
	"sereno",
	"serio",
	"serpente",
	"serraglio",
	"servire",
	"sestina",
	"setola",
	"settimana",
	"sfacelo",
	"sfaldare",
	"sfamato",
	"sfarzoso",
	"sfaticato",
	"sfera",
	"sfida",
	"sfilato",
	"sfinge",
	"sfocato",
	"sfoderare",
	"sfogo",
	"sfoltire",
	"sforzato",
	"sfratto",
	"sfruttato",
	"sfuggito",
	"sfumare",
	"sfuso",
	"sgabello",
	"sgarbato",
	"sgonfiare",
	"sgorbio",
	"sgrassato",
	"sguardo",
	"sibilo",
	"siccome",
	"sierra",
	"sigla",
	"signore",
	"silenzio",
	"sillaba",
	"simbolo",
	"simpatico",
	"simulato",
	"sinfonia",
	"singolo",
	"sinistro",
	"sino",
	"sintesi",
	"sinusoide",
	"sipario",
	"sisma",
	"sistole",
	"situato",
	"slitta",
	"slogatura",
	"sloveno",
	"smarrito",
	"smemorato",
	"smentito",
	"smeraldo",
	"smilzo",
	"smontare",
	"smottato",
	"smussato",
	"snellire",
	"snervato",
	"snodo",
	"sobbalzo",
	"sobrio",
	"soccorso",
	"sociale",
	"sodale",
	"soffitto",
	"sogno",
	"soldato",
	"solenne",
	"solido",
	"sollazzo",
	"solo",
	"solubile",
	"solvente",
	"somatico",
	"somma",
	"sonda",
	"sonetto",
	"sonnifero",
	"sopire",
	"soppeso",
	"sopra",
	"sorgere",
	"sorpasso",
	"sorriso",
	"sorso",
	"sorteggio",
	"sorvolato",
	"sospiro",
	"sosta",
	"sottile",
	"spada",
	"spalla",
	"spargere",
	"spatola",
	"spavento",
	"spazzola",
	"specie",
	"spedire",
	"spegnere",
	"spelatura",
	"speranza",
	"spessore",
	"spettrale",
	"spezzato",
	"spia",
	"spigoloso",
	"spillato",
	"spinoso",
	"spirale",
	"splendido",
	"sportivo",
	"sposo",
	"spranga",
	"sprecare",
	"spronato",
	"spruzzo",
	"spuntino",
	"squillo",
	"sradicare",
	"srotolato",
	"stabile",
	"stacco",
	"staffa",
	"stagnare",
	"stampato",
	"stantio",
	"starnuto",
	"stasera",
	"statuto",
	"stelo",
	"steppa",
	"sterzo",
	"stiletto",
	"stima",
	"stirpe",
	"stivale",
	"stizzoso",
	"stonato",
	"storico",
	"strappo",
	"stregato",
	"stridulo",
	"strozzare",
	"strutto",
	"stuccare",
	"stufo",
	"stupendo",
	"subentro",
	"succoso",
	"sudore",
	"suggerito",
	"sugo",
	"sultano",
	"suonare",
	"superbo",
	"supporto",
	"surgelato",
	"surrogato",
	"sussurro",
	"sutura",
	"svagare",
	"svedese",
	"sveglio",
	"svelare",
	"svenuto",
	"svezia",
	"sviluppo",
	"svista",
	"svizzera",
	"svolta",
	"svuotare",
	"tabacco",
	"tabulato",
	"tacciare",
	"taciturno",
	"tale",
	"talismano",
	"tampone",
	"tannino",
	"tara",
	"tardivo",
	"targato",
	"tariffa",
	"tarpare",
	"tartaruga",
	"tasto",
	"tattico",
	"taverna",
	"tavolata",
	"tazza",
	"teca",
	"tecnico",
	"telefono",
	"temerario",
	"tempo",
	"temuto",
	"tendone",
	"tenero",
	"tensione",
	"tentacolo",
	"teorema",
	"terme",
	"terrazzo",
	"terzetto",
	"tesi",
	"tesserato",
	"testato",
	"tetro",
	"tettoia",
	"tifare",
	"tigella",
	"timbro",
	"tinto",
	"tipico",
	"tipografo",
	"tiraggio",
	"tiro",
	"titanio",
	"titolo",
	"titubante",
	"tizio",
	"tizzone",
	"toccare",
	"tollerare",
	"tolto",
	"tombola",
	"tomo",
	"tonfo",
	"tonsilla",
	"topazio",
	"topologia",
	"toppa",
	"torba",
	"tornare",
	"torrone",
	"tortora",
	"toscano",
	"tossire",
	"tostatura",
	"totano",
	"trabocco",
	"trachea",
	"trafila",
	"tragedia",
	"tralcio",
	"tramonto",
	"transito",
	"trapano",
	"trarre",
	"trasloco",
	"trattato",
	"trave",
	"treccia",
	"tremolio",
	"trespolo",
	"tributo",
	"tricheco",
	"trifoglio",
	"trillo",
	"trincea",
	"trio",
	"tristezza",
	"triturato",
	"trivella",
	"tromba",
	"trono",
	"troppo",
	"trottola",
	"trovare",
	"truccato",
	"tubatura",
	"tuffato",
	"tulipano",
	"tumulto",
	"tunisia",
	"turbare",
	"turchino",
	"tuta",
	"tutela",
	"ubicato",
	"uccello",
	"uccisore",
	"udire",
	"uditivo",
	"uffa",
	"ufficio",
	"uguale",
	"ulisse",
	"ultimato",
	"umano",
	"umile",
	"umorismo",
	"uncinetto",
	"ungere",
	"ungherese",
	"unicorno",
	"unificato",
	"unisono",
	"unitario",
	"unte",
	"uovo",
	"upupa",
	"uragano",
	"urgenza",
	"urlo",
	"usanza",
	"usato",
	"uscito",
	"usignolo",
	"usuraio",
	"utensile",
	"utilizzo",
	"utopia",
	"vacante",
	"vaccinato",
	"vagabondo",
	"vagliato",
	"valanga",
	"valgo",
	"valico",
	"valletta",
	"valoroso",
	"valutare",
	"valvola",
	"vampata",
	"vangare",
	"vanitoso",
	"vano",
	"vantaggio",
	"vanvera",
	"vapore",
	"varano",
	"varcato",
	"variante",
	"vasca",
	"vedetta",
	"vedova",
	"veduto",
	"vegetale",
	"veicolo",
	"velcro",
	"velina",
	"velluto",
	"veloce",
	"venato",
	"vendemmia",
	"vento",
	"verace",
	"verbale",
	"vergogna",
	"verifica",
	"vero",
	"verruca",
	"verticale",
	"vescica",
	"vessillo",
	"vestale",
	"veterano",
	"vetrina",
	"vetusto",
	"viandante",
	"vibrante",
	"vicenda",
	"vichingo",
	"vicinanza",
	"vidimare",
	"vigilia",
	"vigneto",
	"vigore",
	"vile",
	"villano",
	"vimini",
	"vincitore",
	"viola",
	"vipera",
	"virgola",
	"virologo",
	"virulento",
	"viscoso",
	"visione",
	"vispo",
	"vissuto",
	"visura",
	"vita",
	"vitello",
	"vittima",
	"vivanda",
	"vivido",
	"viziare",
	"voce",
	"voga",
	"volatile",
	"volere",
	"volpe",
	"voragine",
	"vulcano",
	"zampogna",
	"zanna",
	"zappato",
	"zattera",
	"zavorra",
	"zefiro",
	"zelante",
	"zelo",
	"zenzero",
	"zerbino",
	"zibetto",
	"zinco",
	"zircone",
	"zitto",
	"zolla",
	"zotico",
	"zucchero",
	"zufolo",
	"zulu",
	"zuppa"
];

var italian$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': italian
});

var spanish = [
	"ábaco",
	"abdomen",
	"abeja",
	"abierto",
	"abogado",
	"abono",
	"aborto",
	"abrazo",
	"abrir",
	"abuelo",
	"abuso",
	"acabar",
	"academia",
	"acceso",
	"acción",
	"aceite",
	"acelga",
	"acento",
	"aceptar",
	"ácido",
	"aclarar",
	"acné",
	"acoger",
	"acoso",
	"activo",
	"acto",
	"actriz",
	"actuar",
	"acudir",
	"acuerdo",
	"acusar",
	"adicto",
	"admitir",
	"adoptar",
	"adorno",
	"aduana",
	"adulto",
	"aéreo",
	"afectar",
	"afición",
	"afinar",
	"afirmar",
	"ágil",
	"agitar",
	"agonía",
	"agosto",
	"agotar",
	"agregar",
	"agrio",
	"agua",
	"agudo",
	"águila",
	"aguja",
	"ahogo",
	"ahorro",
	"aire",
	"aislar",
	"ajedrez",
	"ajeno",
	"ajuste",
	"alacrán",
	"alambre",
	"alarma",
	"alba",
	"álbum",
	"alcalde",
	"aldea",
	"alegre",
	"alejar",
	"alerta",
	"aleta",
	"alfiler",
	"alga",
	"algodón",
	"aliado",
	"aliento",
	"alivio",
	"alma",
	"almeja",
	"almíbar",
	"altar",
	"alteza",
	"altivo",
	"alto",
	"altura",
	"alumno",
	"alzar",
	"amable",
	"amante",
	"amapola",
	"amargo",
	"amasar",
	"ámbar",
	"ámbito",
	"ameno",
	"amigo",
	"amistad",
	"amor",
	"amparo",
	"amplio",
	"ancho",
	"anciano",
	"ancla",
	"andar",
	"andén",
	"anemia",
	"ángulo",
	"anillo",
	"ánimo",
	"anís",
	"anotar",
	"antena",
	"antiguo",
	"antojo",
	"anual",
	"anular",
	"anuncio",
	"añadir",
	"añejo",
	"año",
	"apagar",
	"aparato",
	"apetito",
	"apio",
	"aplicar",
	"apodo",
	"aporte",
	"apoyo",
	"aprender",
	"aprobar",
	"apuesta",
	"apuro",
	"arado",
	"araña",
	"arar",
	"árbitro",
	"árbol",
	"arbusto",
	"archivo",
	"arco",
	"arder",
	"ardilla",
	"arduo",
	"área",
	"árido",
	"aries",
	"armonía",
	"arnés",
	"aroma",
	"arpa",
	"arpón",
	"arreglo",
	"arroz",
	"arruga",
	"arte",
	"artista",
	"asa",
	"asado",
	"asalto",
	"ascenso",
	"asegurar",
	"aseo",
	"asesor",
	"asiento",
	"asilo",
	"asistir",
	"asno",
	"asombro",
	"áspero",
	"astilla",
	"astro",
	"astuto",
	"asumir",
	"asunto",
	"atajo",
	"ataque",
	"atar",
	"atento",
	"ateo",
	"ático",
	"atleta",
	"átomo",
	"atraer",
	"atroz",
	"atún",
	"audaz",
	"audio",
	"auge",
	"aula",
	"aumento",
	"ausente",
	"autor",
	"aval",
	"avance",
	"avaro",
	"ave",
	"avellana",
	"avena",
	"avestruz",
	"avión",
	"aviso",
	"ayer",
	"ayuda",
	"ayuno",
	"azafrán",
	"azar",
	"azote",
	"azúcar",
	"azufre",
	"azul",
	"baba",
	"babor",
	"bache",
	"bahía",
	"baile",
	"bajar",
	"balanza",
	"balcón",
	"balde",
	"bambú",
	"banco",
	"banda",
	"baño",
	"barba",
	"barco",
	"barniz",
	"barro",
	"báscula",
	"bastón",
	"basura",
	"batalla",
	"batería",
	"batir",
	"batuta",
	"baúl",
	"bazar",
	"bebé",
	"bebida",
	"bello",
	"besar",
	"beso",
	"bestia",
	"bicho",
	"bien",
	"bingo",
	"blanco",
	"bloque",
	"blusa",
	"boa",
	"bobina",
	"bobo",
	"boca",
	"bocina",
	"boda",
	"bodega",
	"boina",
	"bola",
	"bolero",
	"bolsa",
	"bomba",
	"bondad",
	"bonito",
	"bono",
	"bonsái",
	"borde",
	"borrar",
	"bosque",
	"bote",
	"botín",
	"bóveda",
	"bozal",
	"bravo",
	"brazo",
	"brecha",
	"breve",
	"brillo",
	"brinco",
	"brisa",
	"broca",
	"broma",
	"bronce",
	"brote",
	"bruja",
	"brusco",
	"bruto",
	"buceo",
	"bucle",
	"bueno",
	"buey",
	"bufanda",
	"bufón",
	"búho",
	"buitre",
	"bulto",
	"burbuja",
	"burla",
	"burro",
	"buscar",
	"butaca",
	"buzón",
	"caballo",
	"cabeza",
	"cabina",
	"cabra",
	"cacao",
	"cadáver",
	"cadena",
	"caer",
	"café",
	"caída",
	"caimán",
	"caja",
	"cajón",
	"cal",
	"calamar",
	"calcio",
	"caldo",
	"calidad",
	"calle",
	"calma",
	"calor",
	"calvo",
	"cama",
	"cambio",
	"camello",
	"camino",
	"campo",
	"cáncer",
	"candil",
	"canela",
	"canguro",
	"canica",
	"canto",
	"caña",
	"cañón",
	"caoba",
	"caos",
	"capaz",
	"capitán",
	"capote",
	"captar",
	"capucha",
	"cara",
	"carbón",
	"cárcel",
	"careta",
	"carga",
	"cariño",
	"carne",
	"carpeta",
	"carro",
	"carta",
	"casa",
	"casco",
	"casero",
	"caspa",
	"castor",
	"catorce",
	"catre",
	"caudal",
	"causa",
	"cazo",
	"cebolla",
	"ceder",
	"cedro",
	"celda",
	"célebre",
	"celoso",
	"célula",
	"cemento",
	"ceniza",
	"centro",
	"cerca",
	"cerdo",
	"cereza",
	"cero",
	"cerrar",
	"certeza",
	"césped",
	"cetro",
	"chacal",
	"chaleco",
	"champú",
	"chancla",
	"chapa",
	"charla",
	"chico",
	"chiste",
	"chivo",
	"choque",
	"choza",
	"chuleta",
	"chupar",
	"ciclón",
	"ciego",
	"cielo",
	"cien",
	"cierto",
	"cifra",
	"cigarro",
	"cima",
	"cinco",
	"cine",
	"cinta",
	"ciprés",
	"circo",
	"ciruela",
	"cisne",
	"cita",
	"ciudad",
	"clamor",
	"clan",
	"claro",
	"clase",
	"clave",
	"cliente",
	"clima",
	"clínica",
	"cobre",
	"cocción",
	"cochino",
	"cocina",
	"coco",
	"código",
	"codo",
	"cofre",
	"coger",
	"cohete",
	"cojín",
	"cojo",
	"cola",
	"colcha",
	"colegio",
	"colgar",
	"colina",
	"collar",
	"colmo",
	"columna",
	"combate",
	"comer",
	"comida",
	"cómodo",
	"compra",
	"conde",
	"conejo",
	"conga",
	"conocer",
	"consejo",
	"contar",
	"copa",
	"copia",
	"corazón",
	"corbata",
	"corcho",
	"cordón",
	"corona",
	"correr",
	"coser",
	"cosmos",
	"costa",
	"cráneo",
	"cráter",
	"crear",
	"crecer",
	"creído",
	"crema",
	"cría",
	"crimen",
	"cripta",
	"crisis",
	"cromo",
	"crónica",
	"croqueta",
	"crudo",
	"cruz",
	"cuadro",
	"cuarto",
	"cuatro",
	"cubo",
	"cubrir",
	"cuchara",
	"cuello",
	"cuento",
	"cuerda",
	"cuesta",
	"cueva",
	"cuidar",
	"culebra",
	"culpa",
	"culto",
	"cumbre",
	"cumplir",
	"cuna",
	"cuneta",
	"cuota",
	"cupón",
	"cúpula",
	"curar",
	"curioso",
	"curso",
	"curva",
	"cutis",
	"dama",
	"danza",
	"dar",
	"dardo",
	"dátil",
	"deber",
	"débil",
	"década",
	"decir",
	"dedo",
	"defensa",
	"definir",
	"dejar",
	"delfín",
	"delgado",
	"delito",
	"demora",
	"denso",
	"dental",
	"deporte",
	"derecho",
	"derrota",
	"desayuno",
	"deseo",
	"desfile",
	"desnudo",
	"destino",
	"desvío",
	"detalle",
	"detener",
	"deuda",
	"día",
	"diablo",
	"diadema",
	"diamante",
	"diana",
	"diario",
	"dibujo",
	"dictar",
	"diente",
	"dieta",
	"diez",
	"difícil",
	"digno",
	"dilema",
	"diluir",
	"dinero",
	"directo",
	"dirigir",
	"disco",
	"diseño",
	"disfraz",
	"diva",
	"divino",
	"doble",
	"doce",
	"dolor",
	"domingo",
	"don",
	"donar",
	"dorado",
	"dormir",
	"dorso",
	"dos",
	"dosis",
	"dragón",
	"droga",
	"ducha",
	"duda",
	"duelo",
	"dueño",
	"dulce",
	"dúo",
	"duque",
	"durar",
	"dureza",
	"duro",
	"ébano",
	"ebrio",
	"echar",
	"eco",
	"ecuador",
	"edad",
	"edición",
	"edificio",
	"editor",
	"educar",
	"efecto",
	"eficaz",
	"eje",
	"ejemplo",
	"elefante",
	"elegir",
	"elemento",
	"elevar",
	"elipse",
	"élite",
	"elixir",
	"elogio",
	"eludir",
	"embudo",
	"emitir",
	"emoción",
	"empate",
	"empeño",
	"empleo",
	"empresa",
	"enano",
	"encargo",
	"enchufe",
	"encía",
	"enemigo",
	"enero",
	"enfado",
	"enfermo",
	"engaño",
	"enigma",
	"enlace",
	"enorme",
	"enredo",
	"ensayo",
	"enseñar",
	"entero",
	"entrar",
	"envase",
	"envío",
	"época",
	"equipo",
	"erizo",
	"escala",
	"escena",
	"escolar",
	"escribir",
	"escudo",
	"esencia",
	"esfera",
	"esfuerzo",
	"espada",
	"espejo",
	"espía",
	"esposa",
	"espuma",
	"esquí",
	"estar",
	"este",
	"estilo",
	"estufa",
	"etapa",
	"eterno",
	"ética",
	"etnia",
	"evadir",
	"evaluar",
	"evento",
	"evitar",
	"exacto",
	"examen",
	"exceso",
	"excusa",
	"exento",
	"exigir",
	"exilio",
	"existir",
	"éxito",
	"experto",
	"explicar",
	"exponer",
	"extremo",
	"fábrica",
	"fábula",
	"fachada",
	"fácil",
	"factor",
	"faena",
	"faja",
	"falda",
	"fallo",
	"falso",
	"faltar",
	"fama",
	"familia",
	"famoso",
	"faraón",
	"farmacia",
	"farol",
	"farsa",
	"fase",
	"fatiga",
	"fauna",
	"favor",
	"fax",
	"febrero",
	"fecha",
	"feliz",
	"feo",
	"feria",
	"feroz",
	"fértil",
	"fervor",
	"festín",
	"fiable",
	"fianza",
	"fiar",
	"fibra",
	"ficción",
	"ficha",
	"fideo",
	"fiebre",
	"fiel",
	"fiera",
	"fiesta",
	"figura",
	"fijar",
	"fijo",
	"fila",
	"filete",
	"filial",
	"filtro",
	"fin",
	"finca",
	"fingir",
	"finito",
	"firma",
	"flaco",
	"flauta",
	"flecha",
	"flor",
	"flota",
	"fluir",
	"flujo",
	"flúor",
	"fobia",
	"foca",
	"fogata",
	"fogón",
	"folio",
	"folleto",
	"fondo",
	"forma",
	"forro",
	"fortuna",
	"forzar",
	"fosa",
	"foto",
	"fracaso",
	"frágil",
	"franja",
	"frase",
	"fraude",
	"freír",
	"freno",
	"fresa",
	"frío",
	"frito",
	"fruta",
	"fuego",
	"fuente",
	"fuerza",
	"fuga",
	"fumar",
	"función",
	"funda",
	"furgón",
	"furia",
	"fusil",
	"fútbol",
	"futuro",
	"gacela",
	"gafas",
	"gaita",
	"gajo",
	"gala",
	"galería",
	"gallo",
	"gamba",
	"ganar",
	"gancho",
	"ganga",
	"ganso",
	"garaje",
	"garza",
	"gasolina",
	"gastar",
	"gato",
	"gavilán",
	"gemelo",
	"gemir",
	"gen",
	"género",
	"genio",
	"gente",
	"geranio",
	"gerente",
	"germen",
	"gesto",
	"gigante",
	"gimnasio",
	"girar",
	"giro",
	"glaciar",
	"globo",
	"gloria",
	"gol",
	"golfo",
	"goloso",
	"golpe",
	"goma",
	"gordo",
	"gorila",
	"gorra",
	"gota",
	"goteo",
	"gozar",
	"grada",
	"gráfico",
	"grano",
	"grasa",
	"gratis",
	"grave",
	"grieta",
	"grillo",
	"gripe",
	"gris",
	"grito",
	"grosor",
	"grúa",
	"grueso",
	"grumo",
	"grupo",
	"guante",
	"guapo",
	"guardia",
	"guerra",
	"guía",
	"guiño",
	"guion",
	"guiso",
	"guitarra",
	"gusano",
	"gustar",
	"haber",
	"hábil",
	"hablar",
	"hacer",
	"hacha",
	"hada",
	"hallar",
	"hamaca",
	"harina",
	"haz",
	"hazaña",
	"hebilla",
	"hebra",
	"hecho",
	"helado",
	"helio",
	"hembra",
	"herir",
	"hermano",
	"héroe",
	"hervir",
	"hielo",
	"hierro",
	"hígado",
	"higiene",
	"hijo",
	"himno",
	"historia",
	"hocico",
	"hogar",
	"hoguera",
	"hoja",
	"hombre",
	"hongo",
	"honor",
	"honra",
	"hora",
	"hormiga",
	"horno",
	"hostil",
	"hoyo",
	"hueco",
	"huelga",
	"huerta",
	"hueso",
	"huevo",
	"huida",
	"huir",
	"humano",
	"húmedo",
	"humilde",
	"humo",
	"hundir",
	"huracán",
	"hurto",
	"icono",
	"ideal",
	"idioma",
	"ídolo",
	"iglesia",
	"iglú",
	"igual",
	"ilegal",
	"ilusión",
	"imagen",
	"imán",
	"imitar",
	"impar",
	"imperio",
	"imponer",
	"impulso",
	"incapaz",
	"índice",
	"inerte",
	"infiel",
	"informe",
	"ingenio",
	"inicio",
	"inmenso",
	"inmune",
	"innato",
	"insecto",
	"instante",
	"interés",
	"íntimo",
	"intuir",
	"inútil",
	"invierno",
	"ira",
	"iris",
	"ironía",
	"isla",
	"islote",
	"jabalí",
	"jabón",
	"jamón",
	"jarabe",
	"jardín",
	"jarra",
	"jaula",
	"jazmín",
	"jefe",
	"jeringa",
	"jinete",
	"jornada",
	"joroba",
	"joven",
	"joya",
	"juerga",
	"jueves",
	"juez",
	"jugador",
	"jugo",
	"juguete",
	"juicio",
	"junco",
	"jungla",
	"junio",
	"juntar",
	"júpiter",
	"jurar",
	"justo",
	"juvenil",
	"juzgar",
	"kilo",
	"koala",
	"labio",
	"lacio",
	"lacra",
	"lado",
	"ladrón",
	"lagarto",
	"lágrima",
	"laguna",
	"laico",
	"lamer",
	"lámina",
	"lámpara",
	"lana",
	"lancha",
	"langosta",
	"lanza",
	"lápiz",
	"largo",
	"larva",
	"lástima",
	"lata",
	"látex",
	"latir",
	"laurel",
	"lavar",
	"lazo",
	"leal",
	"lección",
	"leche",
	"lector",
	"leer",
	"legión",
	"legumbre",
	"lejano",
	"lengua",
	"lento",
	"leña",
	"león",
	"leopardo",
	"lesión",
	"letal",
	"letra",
	"leve",
	"leyenda",
	"libertad",
	"libro",
	"licor",
	"líder",
	"lidiar",
	"lienzo",
	"liga",
	"ligero",
	"lima",
	"límite",
	"limón",
	"limpio",
	"lince",
	"lindo",
	"línea",
	"lingote",
	"lino",
	"linterna",
	"líquido",
	"liso",
	"lista",
	"litera",
	"litio",
	"litro",
	"llaga",
	"llama",
	"llanto",
	"llave",
	"llegar",
	"llenar",
	"llevar",
	"llorar",
	"llover",
	"lluvia",
	"lobo",
	"loción",
	"loco",
	"locura",
	"lógica",
	"logro",
	"lombriz",
	"lomo",
	"lonja",
	"lote",
	"lucha",
	"lucir",
	"lugar",
	"lujo",
	"luna",
	"lunes",
	"lupa",
	"lustro",
	"luto",
	"luz",
	"maceta",
	"macho",
	"madera",
	"madre",
	"maduro",
	"maestro",
	"mafia",
	"magia",
	"mago",
	"maíz",
	"maldad",
	"maleta",
	"malla",
	"malo",
	"mamá",
	"mambo",
	"mamut",
	"manco",
	"mando",
	"manejar",
	"manga",
	"maniquí",
	"manjar",
	"mano",
	"manso",
	"manta",
	"mañana",
	"mapa",
	"máquina",
	"mar",
	"marco",
	"marea",
	"marfil",
	"margen",
	"marido",
	"mármol",
	"marrón",
	"martes",
	"marzo",
	"masa",
	"máscara",
	"masivo",
	"matar",
	"materia",
	"matiz",
	"matriz",
	"máximo",
	"mayor",
	"mazorca",
	"mecha",
	"medalla",
	"medio",
	"médula",
	"mejilla",
	"mejor",
	"melena",
	"melón",
	"memoria",
	"menor",
	"mensaje",
	"mente",
	"menú",
	"mercado",
	"merengue",
	"mérito",
	"mes",
	"mesón",
	"meta",
	"meter",
	"método",
	"metro",
	"mezcla",
	"miedo",
	"miel",
	"miembro",
	"miga",
	"mil",
	"milagro",
	"militar",
	"millón",
	"mimo",
	"mina",
	"minero",
	"mínimo",
	"minuto",
	"miope",
	"mirar",
	"misa",
	"miseria",
	"misil",
	"mismo",
	"mitad",
	"mito",
	"mochila",
	"moción",
	"moda",
	"modelo",
	"moho",
	"mojar",
	"molde",
	"moler",
	"molino",
	"momento",
	"momia",
	"monarca",
	"moneda",
	"monja",
	"monto",
	"moño",
	"morada",
	"morder",
	"moreno",
	"morir",
	"morro",
	"morsa",
	"mortal",
	"mosca",
	"mostrar",
	"motivo",
	"mover",
	"móvil",
	"mozo",
	"mucho",
	"mudar",
	"mueble",
	"muela",
	"muerte",
	"muestra",
	"mugre",
	"mujer",
	"mula",
	"muleta",
	"multa",
	"mundo",
	"muñeca",
	"mural",
	"muro",
	"músculo",
	"museo",
	"musgo",
	"música",
	"muslo",
	"nácar",
	"nación",
	"nadar",
	"naipe",
	"naranja",
	"nariz",
	"narrar",
	"nasal",
	"natal",
	"nativo",
	"natural",
	"náusea",
	"naval",
	"nave",
	"navidad",
	"necio",
	"néctar",
	"negar",
	"negocio",
	"negro",
	"neón",
	"nervio",
	"neto",
	"neutro",
	"nevar",
	"nevera",
	"nicho",
	"nido",
	"niebla",
	"nieto",
	"niñez",
	"niño",
	"nítido",
	"nivel",
	"nobleza",
	"noche",
	"nómina",
	"noria",
	"norma",
	"norte",
	"nota",
	"noticia",
	"novato",
	"novela",
	"novio",
	"nube",
	"nuca",
	"núcleo",
	"nudillo",
	"nudo",
	"nuera",
	"nueve",
	"nuez",
	"nulo",
	"número",
	"nutria",
	"oasis",
	"obeso",
	"obispo",
	"objeto",
	"obra",
	"obrero",
	"observar",
	"obtener",
	"obvio",
	"oca",
	"ocaso",
	"océano",
	"ochenta",
	"ocho",
	"ocio",
	"ocre",
	"octavo",
	"octubre",
	"oculto",
	"ocupar",
	"ocurrir",
	"odiar",
	"odio",
	"odisea",
	"oeste",
	"ofensa",
	"oferta",
	"oficio",
	"ofrecer",
	"ogro",
	"oído",
	"oír",
	"ojo",
	"ola",
	"oleada",
	"olfato",
	"olivo",
	"olla",
	"olmo",
	"olor",
	"olvido",
	"ombligo",
	"onda",
	"onza",
	"opaco",
	"opción",
	"ópera",
	"opinar",
	"oponer",
	"optar",
	"óptica",
	"opuesto",
	"oración",
	"orador",
	"oral",
	"órbita",
	"orca",
	"orden",
	"oreja",
	"órgano",
	"orgía",
	"orgullo",
	"oriente",
	"origen",
	"orilla",
	"oro",
	"orquesta",
	"oruga",
	"osadía",
	"oscuro",
	"osezno",
	"oso",
	"ostra",
	"otoño",
	"otro",
	"oveja",
	"óvulo",
	"óxido",
	"oxígeno",
	"oyente",
	"ozono",
	"pacto",
	"padre",
	"paella",
	"página",
	"pago",
	"país",
	"pájaro",
	"palabra",
	"palco",
	"paleta",
	"pálido",
	"palma",
	"paloma",
	"palpar",
	"pan",
	"panal",
	"pánico",
	"pantera",
	"pañuelo",
	"papá",
	"papel",
	"papilla",
	"paquete",
	"parar",
	"parcela",
	"pared",
	"parir",
	"paro",
	"párpado",
	"parque",
	"párrafo",
	"parte",
	"pasar",
	"paseo",
	"pasión",
	"paso",
	"pasta",
	"pata",
	"patio",
	"patria",
	"pausa",
	"pauta",
	"pavo",
	"payaso",
	"peatón",
	"pecado",
	"pecera",
	"pecho",
	"pedal",
	"pedir",
	"pegar",
	"peine",
	"pelar",
	"peldaño",
	"pelea",
	"peligro",
	"pellejo",
	"pelo",
	"peluca",
	"pena",
	"pensar",
	"peñón",
	"peón",
	"peor",
	"pepino",
	"pequeño",
	"pera",
	"percha",
	"perder",
	"pereza",
	"perfil",
	"perico",
	"perla",
	"permiso",
	"perro",
	"persona",
	"pesa",
	"pesca",
	"pésimo",
	"pestaña",
	"pétalo",
	"petróleo",
	"pez",
	"pezuña",
	"picar",
	"pichón",
	"pie",
	"piedra",
	"pierna",
	"pieza",
	"pijama",
	"pilar",
	"piloto",
	"pimienta",
	"pino",
	"pintor",
	"pinza",
	"piña",
	"piojo",
	"pipa",
	"pirata",
	"pisar",
	"piscina",
	"piso",
	"pista",
	"pitón",
	"pizca",
	"placa",
	"plan",
	"plata",
	"playa",
	"plaza",
	"pleito",
	"pleno",
	"plomo",
	"pluma",
	"plural",
	"pobre",
	"poco",
	"poder",
	"podio",
	"poema",
	"poesía",
	"poeta",
	"polen",
	"policía",
	"pollo",
	"polvo",
	"pomada",
	"pomelo",
	"pomo",
	"pompa",
	"poner",
	"porción",
	"portal",
	"posada",
	"poseer",
	"posible",
	"poste",
	"potencia",
	"potro",
	"pozo",
	"prado",
	"precoz",
	"pregunta",
	"premio",
	"prensa",
	"preso",
	"previo",
	"primo",
	"príncipe",
	"prisión",
	"privar",
	"proa",
	"probar",
	"proceso",
	"producto",
	"proeza",
	"profesor",
	"programa",
	"prole",
	"promesa",
	"pronto",
	"propio",
	"próximo",
	"prueba",
	"público",
	"puchero",
	"pudor",
	"pueblo",
	"puerta",
	"puesto",
	"pulga",
	"pulir",
	"pulmón",
	"pulpo",
	"pulso",
	"puma",
	"punto",
	"puñal",
	"puño",
	"pupa",
	"pupila",
	"puré",
	"quedar",
	"queja",
	"quemar",
	"querer",
	"queso",
	"quieto",
	"química",
	"quince",
	"quitar",
	"rábano",
	"rabia",
	"rabo",
	"ración",
	"radical",
	"raíz",
	"rama",
	"rampa",
	"rancho",
	"rango",
	"rapaz",
	"rápido",
	"rapto",
	"rasgo",
	"raspa",
	"rato",
	"rayo",
	"raza",
	"razón",
	"reacción",
	"realidad",
	"rebaño",
	"rebote",
	"recaer",
	"receta",
	"rechazo",
	"recoger",
	"recreo",
	"recto",
	"recurso",
	"red",
	"redondo",
	"reducir",
	"reflejo",
	"reforma",
	"refrán",
	"refugio",
	"regalo",
	"regir",
	"regla",
	"regreso",
	"rehén",
	"reino",
	"reír",
	"reja",
	"relato",
	"relevo",
	"relieve",
	"relleno",
	"reloj",
	"remar",
	"remedio",
	"remo",
	"rencor",
	"rendir",
	"renta",
	"reparto",
	"repetir",
	"reposo",
	"reptil",
	"res",
	"rescate",
	"resina",
	"respeto",
	"resto",
	"resumen",
	"retiro",
	"retorno",
	"retrato",
	"reunir",
	"revés",
	"revista",
	"rey",
	"rezar",
	"rico",
	"riego",
	"rienda",
	"riesgo",
	"rifa",
	"rígido",
	"rigor",
	"rincón",
	"riñón",
	"río",
	"riqueza",
	"risa",
	"ritmo",
	"rito",
	"rizo",
	"roble",
	"roce",
	"rociar",
	"rodar",
	"rodeo",
	"rodilla",
	"roer",
	"rojizo",
	"rojo",
	"romero",
	"romper",
	"ron",
	"ronco",
	"ronda",
	"ropa",
	"ropero",
	"rosa",
	"rosca",
	"rostro",
	"rotar",
	"rubí",
	"rubor",
	"rudo",
	"rueda",
	"rugir",
	"ruido",
	"ruina",
	"ruleta",
	"rulo",
	"rumbo",
	"rumor",
	"ruptura",
	"ruta",
	"rutina",
	"sábado",
	"saber",
	"sabio",
	"sable",
	"sacar",
	"sagaz",
	"sagrado",
	"sala",
	"saldo",
	"salero",
	"salir",
	"salmón",
	"salón",
	"salsa",
	"salto",
	"salud",
	"salvar",
	"samba",
	"sanción",
	"sandía",
	"sanear",
	"sangre",
	"sanidad",
	"sano",
	"santo",
	"sapo",
	"saque",
	"sardina",
	"sartén",
	"sastre",
	"satán",
	"sauna",
	"saxofón",
	"sección",
	"seco",
	"secreto",
	"secta",
	"sed",
	"seguir",
	"seis",
	"sello",
	"selva",
	"semana",
	"semilla",
	"senda",
	"sensor",
	"señal",
	"señor",
	"separar",
	"sepia",
	"sequía",
	"ser",
	"serie",
	"sermón",
	"servir",
	"sesenta",
	"sesión",
	"seta",
	"setenta",
	"severo",
	"sexo",
	"sexto",
	"sidra",
	"siesta",
	"siete",
	"siglo",
	"signo",
	"sílaba",
	"silbar",
	"silencio",
	"silla",
	"símbolo",
	"simio",
	"sirena",
	"sistema",
	"sitio",
	"situar",
	"sobre",
	"socio",
	"sodio",
	"sol",
	"solapa",
	"soldado",
	"soledad",
	"sólido",
	"soltar",
	"solución",
	"sombra",
	"sondeo",
	"sonido",
	"sonoro",
	"sonrisa",
	"sopa",
	"soplar",
	"soporte",
	"sordo",
	"sorpresa",
	"sorteo",
	"sostén",
	"sótano",
	"suave",
	"subir",
	"suceso",
	"sudor",
	"suegra",
	"suelo",
	"sueño",
	"suerte",
	"sufrir",
	"sujeto",
	"sultán",
	"sumar",
	"superar",
	"suplir",
	"suponer",
	"supremo",
	"sur",
	"surco",
	"sureño",
	"surgir",
	"susto",
	"sutil",
	"tabaco",
	"tabique",
	"tabla",
	"tabú",
	"taco",
	"tacto",
	"tajo",
	"talar",
	"talco",
	"talento",
	"talla",
	"talón",
	"tamaño",
	"tambor",
	"tango",
	"tanque",
	"tapa",
	"tapete",
	"tapia",
	"tapón",
	"taquilla",
	"tarde",
	"tarea",
	"tarifa",
	"tarjeta",
	"tarot",
	"tarro",
	"tarta",
	"tatuaje",
	"tauro",
	"taza",
	"tazón",
	"teatro",
	"techo",
	"tecla",
	"técnica",
	"tejado",
	"tejer",
	"tejido",
	"tela",
	"teléfono",
	"tema",
	"temor",
	"templo",
	"tenaz",
	"tender",
	"tener",
	"tenis",
	"tenso",
	"teoría",
	"terapia",
	"terco",
	"término",
	"ternura",
	"terror",
	"tesis",
	"tesoro",
	"testigo",
	"tetera",
	"texto",
	"tez",
	"tibio",
	"tiburón",
	"tiempo",
	"tienda",
	"tierra",
	"tieso",
	"tigre",
	"tijera",
	"tilde",
	"timbre",
	"tímido",
	"timo",
	"tinta",
	"tío",
	"típico",
	"tipo",
	"tira",
	"tirón",
	"titán",
	"títere",
	"título",
	"tiza",
	"toalla",
	"tobillo",
	"tocar",
	"tocino",
	"todo",
	"toga",
	"toldo",
	"tomar",
	"tono",
	"tonto",
	"topar",
	"tope",
	"toque",
	"tórax",
	"torero",
	"tormenta",
	"torneo",
	"toro",
	"torpedo",
	"torre",
	"torso",
	"tortuga",
	"tos",
	"tosco",
	"toser",
	"tóxico",
	"trabajo",
	"tractor",
	"traer",
	"tráfico",
	"trago",
	"traje",
	"tramo",
	"trance",
	"trato",
	"trauma",
	"trazar",
	"trébol",
	"tregua",
	"treinta",
	"tren",
	"trepar",
	"tres",
	"tribu",
	"trigo",
	"tripa",
	"triste",
	"triunfo",
	"trofeo",
	"trompa",
	"tronco",
	"tropa",
	"trote",
	"trozo",
	"truco",
	"trueno",
	"trufa",
	"tubería",
	"tubo",
	"tuerto",
	"tumba",
	"tumor",
	"túnel",
	"túnica",
	"turbina",
	"turismo",
	"turno",
	"tutor",
	"ubicar",
	"úlcera",
	"umbral",
	"unidad",
	"unir",
	"universo",
	"uno",
	"untar",
	"uña",
	"urbano",
	"urbe",
	"urgente",
	"urna",
	"usar",
	"usuario",
	"útil",
	"utopía",
	"uva",
	"vaca",
	"vacío",
	"vacuna",
	"vagar",
	"vago",
	"vaina",
	"vajilla",
	"vale",
	"válido",
	"valle",
	"valor",
	"válvula",
	"vampiro",
	"vara",
	"variar",
	"varón",
	"vaso",
	"vecino",
	"vector",
	"vehículo",
	"veinte",
	"vejez",
	"vela",
	"velero",
	"veloz",
	"vena",
	"vencer",
	"venda",
	"veneno",
	"vengar",
	"venir",
	"venta",
	"venus",
	"ver",
	"verano",
	"verbo",
	"verde",
	"vereda",
	"verja",
	"verso",
	"verter",
	"vía",
	"viaje",
	"vibrar",
	"vicio",
	"víctima",
	"vida",
	"vídeo",
	"vidrio",
	"viejo",
	"viernes",
	"vigor",
	"vil",
	"villa",
	"vinagre",
	"vino",
	"viñedo",
	"violín",
	"viral",
	"virgo",
	"virtud",
	"visor",
	"víspera",
	"vista",
	"vitamina",
	"viudo",
	"vivaz",
	"vivero",
	"vivir",
	"vivo",
	"volcán",
	"volumen",
	"volver",
	"voraz",
	"votar",
	"voto",
	"voz",
	"vuelo",
	"vulgar",
	"yacer",
	"yate",
	"yegua",
	"yema",
	"yerno",
	"yeso",
	"yodo",
	"yoga",
	"yogur",
	"zafiro",
	"zanja",
	"zapato",
	"zarza",
	"zona",
	"zorro",
	"zumo",
	"zurdo"
];

var spanish$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': spanish
});

var japanese = [
	"あいこくしん",
	"あいさつ",
	"あいだ",
	"あおぞら",
	"あかちゃん",
	"あきる",
	"あけがた",
	"あける",
	"あこがれる",
	"あさい",
	"あさひ",
	"あしあと",
	"あじわう",
	"あずかる",
	"あずき",
	"あそぶ",
	"あたえる",
	"あたためる",
	"あたりまえ",
	"あたる",
	"あつい",
	"あつかう",
	"あっしゅく",
	"あつまり",
	"あつめる",
	"あてな",
	"あてはまる",
	"あひる",
	"あぶら",
	"あぶる",
	"あふれる",
	"あまい",
	"あまど",
	"あまやかす",
	"あまり",
	"あみもの",
	"あめりか",
	"あやまる",
	"あゆむ",
	"あらいぐま",
	"あらし",
	"あらすじ",
	"あらためる",
	"あらゆる",
	"あらわす",
	"ありがとう",
	"あわせる",
	"あわてる",
	"あんい",
	"あんがい",
	"あんこ",
	"あんぜん",
	"あんてい",
	"あんない",
	"あんまり",
	"いいだす",
	"いおん",
	"いがい",
	"いがく",
	"いきおい",
	"いきなり",
	"いきもの",
	"いきる",
	"いくじ",
	"いくぶん",
	"いけばな",
	"いけん",
	"いこう",
	"いこく",
	"いこつ",
	"いさましい",
	"いさん",
	"いしき",
	"いじゅう",
	"いじょう",
	"いじわる",
	"いずみ",
	"いずれ",
	"いせい",
	"いせえび",
	"いせかい",
	"いせき",
	"いぜん",
	"いそうろう",
	"いそがしい",
	"いだい",
	"いだく",
	"いたずら",
	"いたみ",
	"いたりあ",
	"いちおう",
	"いちじ",
	"いちど",
	"いちば",
	"いちぶ",
	"いちりゅう",
	"いつか",
	"いっしゅん",
	"いっせい",
	"いっそう",
	"いったん",
	"いっち",
	"いってい",
	"いっぽう",
	"いてざ",
	"いてん",
	"いどう",
	"いとこ",
	"いない",
	"いなか",
	"いねむり",
	"いのち",
	"いのる",
	"いはつ",
	"いばる",
	"いはん",
	"いびき",
	"いひん",
	"いふく",
	"いへん",
	"いほう",
	"いみん",
	"いもうと",
	"いもたれ",
	"いもり",
	"いやがる",
	"いやす",
	"いよかん",
	"いよく",
	"いらい",
	"いらすと",
	"いりぐち",
	"いりょう",
	"いれい",
	"いれもの",
	"いれる",
	"いろえんぴつ",
	"いわい",
	"いわう",
	"いわかん",
	"いわば",
	"いわゆる",
	"いんげんまめ",
	"いんさつ",
	"いんしょう",
	"いんよう",
	"うえき",
	"うえる",
	"うおざ",
	"うがい",
	"うかぶ",
	"うかべる",
	"うきわ",
	"うくらいな",
	"うくれれ",
	"うけたまわる",
	"うけつけ",
	"うけとる",
	"うけもつ",
	"うける",
	"うごかす",
	"うごく",
	"うこん",
	"うさぎ",
	"うしなう",
	"うしろがみ",
	"うすい",
	"うすぎ",
	"うすぐらい",
	"うすめる",
	"うせつ",
	"うちあわせ",
	"うちがわ",
	"うちき",
	"うちゅう",
	"うっかり",
	"うつくしい",
	"うったえる",
	"うつる",
	"うどん",
	"うなぎ",
	"うなじ",
	"うなずく",
	"うなる",
	"うねる",
	"うのう",
	"うぶげ",
	"うぶごえ",
	"うまれる",
	"うめる",
	"うもう",
	"うやまう",
	"うよく",
	"うらがえす",
	"うらぐち",
	"うらない",
	"うりあげ",
	"うりきれ",
	"うるさい",
	"うれしい",
	"うれゆき",
	"うれる",
	"うろこ",
	"うわき",
	"うわさ",
	"うんこう",
	"うんちん",
	"うんてん",
	"うんどう",
	"えいえん",
	"えいが",
	"えいきょう",
	"えいご",
	"えいせい",
	"えいぶん",
	"えいよう",
	"えいわ",
	"えおり",
	"えがお",
	"えがく",
	"えきたい",
	"えくせる",
	"えしゃく",
	"えすて",
	"えつらん",
	"えのぐ",
	"えほうまき",
	"えほん",
	"えまき",
	"えもじ",
	"えもの",
	"えらい",
	"えらぶ",
	"えりあ",
	"えんえん",
	"えんかい",
	"えんぎ",
	"えんげき",
	"えんしゅう",
	"えんぜつ",
	"えんそく",
	"えんちょう",
	"えんとつ",
	"おいかける",
	"おいこす",
	"おいしい",
	"おいつく",
	"おうえん",
	"おうさま",
	"おうじ",
	"おうせつ",
	"おうたい",
	"おうふく",
	"おうべい",
	"おうよう",
	"おえる",
	"おおい",
	"おおう",
	"おおどおり",
	"おおや",
	"おおよそ",
	"おかえり",
	"おかず",
	"おがむ",
	"おかわり",
	"おぎなう",
	"おきる",
	"おくさま",
	"おくじょう",
	"おくりがな",
	"おくる",
	"おくれる",
	"おこす",
	"おこなう",
	"おこる",
	"おさえる",
	"おさない",
	"おさめる",
	"おしいれ",
	"おしえる",
	"おじぎ",
	"おじさん",
	"おしゃれ",
	"おそらく",
	"おそわる",
	"おたがい",
	"おたく",
	"おだやか",
	"おちつく",
	"おっと",
	"おつり",
	"おでかけ",
	"おとしもの",
	"おとなしい",
	"おどり",
	"おどろかす",
	"おばさん",
	"おまいり",
	"おめでとう",
	"おもいで",
	"おもう",
	"おもたい",
	"おもちゃ",
	"おやつ",
	"おやゆび",
	"およぼす",
	"おらんだ",
	"おろす",
	"おんがく",
	"おんけい",
	"おんしゃ",
	"おんせん",
	"おんだん",
	"おんちゅう",
	"おんどけい",
	"かあつ",
	"かいが",
	"がいき",
	"がいけん",
	"がいこう",
	"かいさつ",
	"かいしゃ",
	"かいすいよく",
	"かいぜん",
	"かいぞうど",
	"かいつう",
	"かいてん",
	"かいとう",
	"かいふく",
	"がいへき",
	"かいほう",
	"かいよう",
	"がいらい",
	"かいわ",
	"かえる",
	"かおり",
	"かかえる",
	"かがく",
	"かがし",
	"かがみ",
	"かくご",
	"かくとく",
	"かざる",
	"がぞう",
	"かたい",
	"かたち",
	"がちょう",
	"がっきゅう",
	"がっこう",
	"がっさん",
	"がっしょう",
	"かなざわし",
	"かのう",
	"がはく",
	"かぶか",
	"かほう",
	"かほご",
	"かまう",
	"かまぼこ",
	"かめれおん",
	"かゆい",
	"かようび",
	"からい",
	"かるい",
	"かろう",
	"かわく",
	"かわら",
	"がんか",
	"かんけい",
	"かんこう",
	"かんしゃ",
	"かんそう",
	"かんたん",
	"かんち",
	"がんばる",
	"きあい",
	"きあつ",
	"きいろ",
	"ぎいん",
	"きうい",
	"きうん",
	"きえる",
	"きおう",
	"きおく",
	"きおち",
	"きおん",
	"きかい",
	"きかく",
	"きかんしゃ",
	"ききて",
	"きくばり",
	"きくらげ",
	"きけんせい",
	"きこう",
	"きこえる",
	"きこく",
	"きさい",
	"きさく",
	"きさま",
	"きさらぎ",
	"ぎじかがく",
	"ぎしき",
	"ぎじたいけん",
	"ぎじにってい",
	"ぎじゅつしゃ",
	"きすう",
	"きせい",
	"きせき",
	"きせつ",
	"きそう",
	"きぞく",
	"きぞん",
	"きたえる",
	"きちょう",
	"きつえん",
	"ぎっちり",
	"きつつき",
	"きつね",
	"きてい",
	"きどう",
	"きどく",
	"きない",
	"きなが",
	"きなこ",
	"きぬごし",
	"きねん",
	"きのう",
	"きのした",
	"きはく",
	"きびしい",
	"きひん",
	"きふく",
	"きぶん",
	"きぼう",
	"きほん",
	"きまる",
	"きみつ",
	"きむずかしい",
	"きめる",
	"きもだめし",
	"きもち",
	"きもの",
	"きゃく",
	"きやく",
	"ぎゅうにく",
	"きよう",
	"きょうりゅう",
	"きらい",
	"きらく",
	"きりん",
	"きれい",
	"きれつ",
	"きろく",
	"ぎろん",
	"きわめる",
	"ぎんいろ",
	"きんかくじ",
	"きんじょ",
	"きんようび",
	"ぐあい",
	"くいず",
	"くうかん",
	"くうき",
	"くうぐん",
	"くうこう",
	"ぐうせい",
	"くうそう",
	"ぐうたら",
	"くうふく",
	"くうぼ",
	"くかん",
	"くきょう",
	"くげん",
	"ぐこう",
	"くさい",
	"くさき",
	"くさばな",
	"くさる",
	"くしゃみ",
	"くしょう",
	"くすのき",
	"くすりゆび",
	"くせげ",
	"くせん",
	"ぐたいてき",
	"くださる",
	"くたびれる",
	"くちこみ",
	"くちさき",
	"くつした",
	"ぐっすり",
	"くつろぐ",
	"くとうてん",
	"くどく",
	"くなん",
	"くねくね",
	"くのう",
	"くふう",
	"くみあわせ",
	"くみたてる",
	"くめる",
	"くやくしょ",
	"くらす",
	"くらべる",
	"くるま",
	"くれる",
	"くろう",
	"くわしい",
	"ぐんかん",
	"ぐんしょく",
	"ぐんたい",
	"ぐんて",
	"けあな",
	"けいかく",
	"けいけん",
	"けいこ",
	"けいさつ",
	"げいじゅつ",
	"けいたい",
	"げいのうじん",
	"けいれき",
	"けいろ",
	"けおとす",
	"けおりもの",
	"げきか",
	"げきげん",
	"げきだん",
	"げきちん",
	"げきとつ",
	"げきは",
	"げきやく",
	"げこう",
	"げこくじょう",
	"げざい",
	"けさき",
	"げざん",
	"けしき",
	"けしごむ",
	"けしょう",
	"げすと",
	"けたば",
	"けちゃっぷ",
	"けちらす",
	"けつあつ",
	"けつい",
	"けつえき",
	"けっこん",
	"けつじょ",
	"けっせき",
	"けってい",
	"けつまつ",
	"げつようび",
	"げつれい",
	"けつろん",
	"げどく",
	"けとばす",
	"けとる",
	"けなげ",
	"けなす",
	"けなみ",
	"けぬき",
	"げねつ",
	"けねん",
	"けはい",
	"げひん",
	"けぶかい",
	"げぼく",
	"けまり",
	"けみかる",
	"けむし",
	"けむり",
	"けもの",
	"けらい",
	"けろけろ",
	"けわしい",
	"けんい",
	"けんえつ",
	"けんお",
	"けんか",
	"げんき",
	"けんげん",
	"けんこう",
	"けんさく",
	"けんしゅう",
	"けんすう",
	"げんそう",
	"けんちく",
	"けんてい",
	"けんとう",
	"けんない",
	"けんにん",
	"げんぶつ",
	"けんま",
	"けんみん",
	"けんめい",
	"けんらん",
	"けんり",
	"こあくま",
	"こいぬ",
	"こいびと",
	"ごうい",
	"こうえん",
	"こうおん",
	"こうかん",
	"ごうきゅう",
	"ごうけい",
	"こうこう",
	"こうさい",
	"こうじ",
	"こうすい",
	"ごうせい",
	"こうそく",
	"こうたい",
	"こうちゃ",
	"こうつう",
	"こうてい",
	"こうどう",
	"こうない",
	"こうはい",
	"ごうほう",
	"ごうまん",
	"こうもく",
	"こうりつ",
	"こえる",
	"こおり",
	"ごかい",
	"ごがつ",
	"ごかん",
	"こくご",
	"こくさい",
	"こくとう",
	"こくない",
	"こくはく",
	"こぐま",
	"こけい",
	"こける",
	"ここのか",
	"こころ",
	"こさめ",
	"こしつ",
	"こすう",
	"こせい",
	"こせき",
	"こぜん",
	"こそだて",
	"こたい",
	"こたえる",
	"こたつ",
	"こちょう",
	"こっか",
	"こつこつ",
	"こつばん",
	"こつぶ",
	"こてい",
	"こてん",
	"ことがら",
	"ことし",
	"ことば",
	"ことり",
	"こなごな",
	"こねこね",
	"このまま",
	"このみ",
	"このよ",
	"ごはん",
	"こひつじ",
	"こふう",
	"こふん",
	"こぼれる",
	"ごまあぶら",
	"こまかい",
	"ごますり",
	"こまつな",
	"こまる",
	"こむぎこ",
	"こもじ",
	"こもち",
	"こもの",
	"こもん",
	"こやく",
	"こやま",
	"こゆう",
	"こゆび",
	"こよい",
	"こよう",
	"こりる",
	"これくしょん",
	"ころっけ",
	"こわもて",
	"こわれる",
	"こんいん",
	"こんかい",
	"こんき",
	"こんしゅう",
	"こんすい",
	"こんだて",
	"こんとん",
	"こんなん",
	"こんびに",
	"こんぽん",
	"こんまけ",
	"こんや",
	"こんれい",
	"こんわく",
	"ざいえき",
	"さいかい",
	"さいきん",
	"ざいげん",
	"ざいこ",
	"さいしょ",
	"さいせい",
	"ざいたく",
	"ざいちゅう",
	"さいてき",
	"ざいりょう",
	"さうな",
	"さかいし",
	"さがす",
	"さかな",
	"さかみち",
	"さがる",
	"さぎょう",
	"さくし",
	"さくひん",
	"さくら",
	"さこく",
	"さこつ",
	"さずかる",
	"ざせき",
	"さたん",
	"さつえい",
	"ざつおん",
	"ざっか",
	"ざつがく",
	"さっきょく",
	"ざっし",
	"さつじん",
	"ざっそう",
	"さつたば",
	"さつまいも",
	"さてい",
	"さといも",
	"さとう",
	"さとおや",
	"さとし",
	"さとる",
	"さのう",
	"さばく",
	"さびしい",
	"さべつ",
	"さほう",
	"さほど",
	"さます",
	"さみしい",
	"さみだれ",
	"さむけ",
	"さめる",
	"さやえんどう",
	"さゆう",
	"さよう",
	"さよく",
	"さらだ",
	"ざるそば",
	"さわやか",
	"さわる",
	"さんいん",
	"さんか",
	"さんきゃく",
	"さんこう",
	"さんさい",
	"ざんしょ",
	"さんすう",
	"さんせい",
	"さんそ",
	"さんち",
	"さんま",
	"さんみ",
	"さんらん",
	"しあい",
	"しあげ",
	"しあさって",
	"しあわせ",
	"しいく",
	"しいん",
	"しうち",
	"しえい",
	"しおけ",
	"しかい",
	"しかく",
	"じかん",
	"しごと",
	"しすう",
	"じだい",
	"したうけ",
	"したぎ",
	"したて",
	"したみ",
	"しちょう",
	"しちりん",
	"しっかり",
	"しつじ",
	"しつもん",
	"してい",
	"してき",
	"してつ",
	"じてん",
	"じどう",
	"しなぎれ",
	"しなもの",
	"しなん",
	"しねま",
	"しねん",
	"しのぐ",
	"しのぶ",
	"しはい",
	"しばかり",
	"しはつ",
	"しはらい",
	"しはん",
	"しひょう",
	"しふく",
	"じぶん",
	"しへい",
	"しほう",
	"しほん",
	"しまう",
	"しまる",
	"しみん",
	"しむける",
	"じむしょ",
	"しめい",
	"しめる",
	"しもん",
	"しゃいん",
	"しゃうん",
	"しゃおん",
	"じゃがいも",
	"しやくしょ",
	"しゃくほう",
	"しゃけん",
	"しゃこ",
	"しゃざい",
	"しゃしん",
	"しゃせん",
	"しゃそう",
	"しゃたい",
	"しゃちょう",
	"しゃっきん",
	"じゃま",
	"しゃりん",
	"しゃれい",
	"じゆう",
	"じゅうしょ",
	"しゅくはく",
	"じゅしん",
	"しゅっせき",
	"しゅみ",
	"しゅらば",
	"じゅんばん",
	"しょうかい",
	"しょくたく",
	"しょっけん",
	"しょどう",
	"しょもつ",
	"しらせる",
	"しらべる",
	"しんか",
	"しんこう",
	"じんじゃ",
	"しんせいじ",
	"しんちく",
	"しんりん",
	"すあげ",
	"すあし",
	"すあな",
	"ずあん",
	"すいえい",
	"すいか",
	"すいとう",
	"ずいぶん",
	"すいようび",
	"すうがく",
	"すうじつ",
	"すうせん",
	"すおどり",
	"すきま",
	"すくう",
	"すくない",
	"すける",
	"すごい",
	"すこし",
	"ずさん",
	"すずしい",
	"すすむ",
	"すすめる",
	"すっかり",
	"ずっしり",
	"ずっと",
	"すてき",
	"すてる",
	"すねる",
	"すのこ",
	"すはだ",
	"すばらしい",
	"ずひょう",
	"ずぶぬれ",
	"すぶり",
	"すふれ",
	"すべて",
	"すべる",
	"ずほう",
	"すぼん",
	"すまい",
	"すめし",
	"すもう",
	"すやき",
	"すらすら",
	"するめ",
	"すれちがう",
	"すろっと",
	"すわる",
	"すんぜん",
	"すんぽう",
	"せあぶら",
	"せいかつ",
	"せいげん",
	"せいじ",
	"せいよう",
	"せおう",
	"せかいかん",
	"せきにん",
	"せきむ",
	"せきゆ",
	"せきらんうん",
	"せけん",
	"せこう",
	"せすじ",
	"せたい",
	"せたけ",
	"せっかく",
	"せっきゃく",
	"ぜっく",
	"せっけん",
	"せっこつ",
	"せっさたくま",
	"せつぞく",
	"せつだん",
	"せつでん",
	"せっぱん",
	"せつび",
	"せつぶん",
	"せつめい",
	"せつりつ",
	"せなか",
	"せのび",
	"せはば",
	"せびろ",
	"せぼね",
	"せまい",
	"せまる",
	"せめる",
	"せもたれ",
	"せりふ",
	"ぜんあく",
	"せんい",
	"せんえい",
	"せんか",
	"せんきょ",
	"せんく",
	"せんげん",
	"ぜんご",
	"せんさい",
	"せんしゅ",
	"せんすい",
	"せんせい",
	"せんぞ",
	"せんたく",
	"せんちょう",
	"せんてい",
	"せんとう",
	"せんぬき",
	"せんねん",
	"せんぱい",
	"ぜんぶ",
	"ぜんぽう",
	"せんむ",
	"せんめんじょ",
	"せんもん",
	"せんやく",
	"せんゆう",
	"せんよう",
	"ぜんら",
	"ぜんりゃく",
	"せんれい",
	"せんろ",
	"そあく",
	"そいとげる",
	"そいね",
	"そうがんきょう",
	"そうき",
	"そうご",
	"そうしん",
	"そうだん",
	"そうなん",
	"そうび",
	"そうめん",
	"そうり",
	"そえもの",
	"そえん",
	"そがい",
	"そげき",
	"そこう",
	"そこそこ",
	"そざい",
	"そしな",
	"そせい",
	"そせん",
	"そそぐ",
	"そだてる",
	"そつう",
	"そつえん",
	"そっかん",
	"そつぎょう",
	"そっけつ",
	"そっこう",
	"そっせん",
	"そっと",
	"そとがわ",
	"そとづら",
	"そなえる",
	"そなた",
	"そふぼ",
	"そぼく",
	"そぼろ",
	"そまつ",
	"そまる",
	"そむく",
	"そむりえ",
	"そめる",
	"そもそも",
	"そよかぜ",
	"そらまめ",
	"そろう",
	"そんかい",
	"そんけい",
	"そんざい",
	"そんしつ",
	"そんぞく",
	"そんちょう",
	"ぞんび",
	"ぞんぶん",
	"そんみん",
	"たあい",
	"たいいん",
	"たいうん",
	"たいえき",
	"たいおう",
	"だいがく",
	"たいき",
	"たいぐう",
	"たいけん",
	"たいこ",
	"たいざい",
	"だいじょうぶ",
	"だいすき",
	"たいせつ",
	"たいそう",
	"だいたい",
	"たいちょう",
	"たいてい",
	"だいどころ",
	"たいない",
	"たいねつ",
	"たいのう",
	"たいはん",
	"だいひょう",
	"たいふう",
	"たいへん",
	"たいほ",
	"たいまつばな",
	"たいみんぐ",
	"たいむ",
	"たいめん",
	"たいやき",
	"たいよう",
	"たいら",
	"たいりょく",
	"たいる",
	"たいわん",
	"たうえ",
	"たえる",
	"たおす",
	"たおる",
	"たおれる",
	"たかい",
	"たかね",
	"たきび",
	"たくさん",
	"たこく",
	"たこやき",
	"たさい",
	"たしざん",
	"だじゃれ",
	"たすける",
	"たずさわる",
	"たそがれ",
	"たたかう",
	"たたく",
	"ただしい",
	"たたみ",
	"たちばな",
	"だっかい",
	"だっきゃく",
	"だっこ",
	"だっしゅつ",
	"だったい",
	"たてる",
	"たとえる",
	"たなばた",
	"たにん",
	"たぬき",
	"たのしみ",
	"たはつ",
	"たぶん",
	"たべる",
	"たぼう",
	"たまご",
	"たまる",
	"だむる",
	"ためいき",
	"ためす",
	"ためる",
	"たもつ",
	"たやすい",
	"たよる",
	"たらす",
	"たりきほんがん",
	"たりょう",
	"たりる",
	"たると",
	"たれる",
	"たれんと",
	"たろっと",
	"たわむれる",
	"だんあつ",
	"たんい",
	"たんおん",
	"たんか",
	"たんき",
	"たんけん",
	"たんご",
	"たんさん",
	"たんじょうび",
	"だんせい",
	"たんそく",
	"たんたい",
	"だんち",
	"たんてい",
	"たんとう",
	"だんな",
	"たんにん",
	"だんねつ",
	"たんのう",
	"たんぴん",
	"だんぼう",
	"たんまつ",
	"たんめい",
	"だんれつ",
	"だんろ",
	"だんわ",
	"ちあい",
	"ちあん",
	"ちいき",
	"ちいさい",
	"ちえん",
	"ちかい",
	"ちから",
	"ちきゅう",
	"ちきん",
	"ちけいず",
	"ちけん",
	"ちこく",
	"ちさい",
	"ちしき",
	"ちしりょう",
	"ちせい",
	"ちそう",
	"ちたい",
	"ちたん",
	"ちちおや",
	"ちつじょ",
	"ちてき",
	"ちてん",
	"ちぬき",
	"ちぬり",
	"ちのう",
	"ちひょう",
	"ちへいせん",
	"ちほう",
	"ちまた",
	"ちみつ",
	"ちみどろ",
	"ちめいど",
	"ちゃんこなべ",
	"ちゅうい",
	"ちゆりょく",
	"ちょうし",
	"ちょさくけん",
	"ちらし",
	"ちらみ",
	"ちりがみ",
	"ちりょう",
	"ちるど",
	"ちわわ",
	"ちんたい",
	"ちんもく",
	"ついか",
	"ついたち",
	"つうか",
	"つうじょう",
	"つうはん",
	"つうわ",
	"つかう",
	"つかれる",
	"つくね",
	"つくる",
	"つけね",
	"つける",
	"つごう",
	"つたえる",
	"つづく",
	"つつじ",
	"つつむ",
	"つとめる",
	"つながる",
	"つなみ",
	"つねづね",
	"つのる",
	"つぶす",
	"つまらない",
	"つまる",
	"つみき",
	"つめたい",
	"つもり",
	"つもる",
	"つよい",
	"つるぼ",
	"つるみく",
	"つわもの",
	"つわり",
	"てあし",
	"てあて",
	"てあみ",
	"ていおん",
	"ていか",
	"ていき",
	"ていけい",
	"ていこく",
	"ていさつ",
	"ていし",
	"ていせい",
	"ていたい",
	"ていど",
	"ていねい",
	"ていひょう",
	"ていへん",
	"ていぼう",
	"てうち",
	"ておくれ",
	"てきとう",
	"てくび",
	"でこぼこ",
	"てさぎょう",
	"てさげ",
	"てすり",
	"てそう",
	"てちがい",
	"てちょう",
	"てつがく",
	"てつづき",
	"でっぱ",
	"てつぼう",
	"てつや",
	"でぬかえ",
	"てぬき",
	"てぬぐい",
	"てのひら",
	"てはい",
	"てぶくろ",
	"てふだ",
	"てほどき",
	"てほん",
	"てまえ",
	"てまきずし",
	"てみじか",
	"てみやげ",
	"てらす",
	"てれび",
	"てわけ",
	"てわたし",
	"でんあつ",
	"てんいん",
	"てんかい",
	"てんき",
	"てんぐ",
	"てんけん",
	"てんごく",
	"てんさい",
	"てんし",
	"てんすう",
	"でんち",
	"てんてき",
	"てんとう",
	"てんない",
	"てんぷら",
	"てんぼうだい",
	"てんめつ",
	"てんらんかい",
	"でんりょく",
	"でんわ",
	"どあい",
	"といれ",
	"どうかん",
	"とうきゅう",
	"どうぐ",
	"とうし",
	"とうむぎ",
	"とおい",
	"とおか",
	"とおく",
	"とおす",
	"とおる",
	"とかい",
	"とかす",
	"ときおり",
	"ときどき",
	"とくい",
	"とくしゅう",
	"とくてん",
	"とくに",
	"とくべつ",
	"とけい",
	"とける",
	"とこや",
	"とさか",
	"としょかん",
	"とそう",
	"とたん",
	"とちゅう",
	"とっきゅう",
	"とっくん",
	"とつぜん",
	"とつにゅう",
	"とどける",
	"ととのえる",
	"とない",
	"となえる",
	"となり",
	"とのさま",
	"とばす",
	"どぶがわ",
	"とほう",
	"とまる",
	"とめる",
	"ともだち",
	"ともる",
	"どようび",
	"とらえる",
	"とんかつ",
	"どんぶり",
	"ないかく",
	"ないこう",
	"ないしょ",
	"ないす",
	"ないせん",
	"ないそう",
	"なおす",
	"ながい",
	"なくす",
	"なげる",
	"なこうど",
	"なさけ",
	"なたでここ",
	"なっとう",
	"なつやすみ",
	"ななおし",
	"なにごと",
	"なにもの",
	"なにわ",
	"なのか",
	"なふだ",
	"なまいき",
	"なまえ",
	"なまみ",
	"なみだ",
	"なめらか",
	"なめる",
	"なやむ",
	"ならう",
	"ならび",
	"ならぶ",
	"なれる",
	"なわとび",
	"なわばり",
	"にあう",
	"にいがた",
	"にうけ",
	"におい",
	"にかい",
	"にがて",
	"にきび",
	"にくしみ",
	"にくまん",
	"にげる",
	"にさんかたんそ",
	"にしき",
	"にせもの",
	"にちじょう",
	"にちようび",
	"にっか",
	"にっき",
	"にっけい",
	"にっこう",
	"にっさん",
	"にっしょく",
	"にっすう",
	"にっせき",
	"にってい",
	"になう",
	"にほん",
	"にまめ",
	"にもつ",
	"にやり",
	"にゅういん",
	"にりんしゃ",
	"にわとり",
	"にんい",
	"にんか",
	"にんき",
	"にんげん",
	"にんしき",
	"にんずう",
	"にんそう",
	"にんたい",
	"にんち",
	"にんてい",
	"にんにく",
	"にんぷ",
	"にんまり",
	"にんむ",
	"にんめい",
	"にんよう",
	"ぬいくぎ",
	"ぬかす",
	"ぬぐいとる",
	"ぬぐう",
	"ぬくもり",
	"ぬすむ",
	"ぬまえび",
	"ぬめり",
	"ぬらす",
	"ぬんちゃく",
	"ねあげ",
	"ねいき",
	"ねいる",
	"ねいろ",
	"ねぐせ",
	"ねくたい",
	"ねくら",
	"ねこぜ",
	"ねこむ",
	"ねさげ",
	"ねすごす",
	"ねそべる",
	"ねだん",
	"ねつい",
	"ねっしん",
	"ねつぞう",
	"ねったいぎょ",
	"ねぶそく",
	"ねふだ",
	"ねぼう",
	"ねほりはほり",
	"ねまき",
	"ねまわし",
	"ねみみ",
	"ねむい",
	"ねむたい",
	"ねもと",
	"ねらう",
	"ねわざ",
	"ねんいり",
	"ねんおし",
	"ねんかん",
	"ねんきん",
	"ねんぐ",
	"ねんざ",
	"ねんし",
	"ねんちゃく",
	"ねんど",
	"ねんぴ",
	"ねんぶつ",
	"ねんまつ",
	"ねんりょう",
	"ねんれい",
	"のいず",
	"のおづま",
	"のがす",
	"のきなみ",
	"のこぎり",
	"のこす",
	"のこる",
	"のせる",
	"のぞく",
	"のぞむ",
	"のたまう",
	"のちほど",
	"のっく",
	"のばす",
	"のはら",
	"のべる",
	"のぼる",
	"のみもの",
	"のやま",
	"のらいぬ",
	"のらねこ",
	"のりもの",
	"のりゆき",
	"のれん",
	"のんき",
	"ばあい",
	"はあく",
	"ばあさん",
	"ばいか",
	"ばいく",
	"はいけん",
	"はいご",
	"はいしん",
	"はいすい",
	"はいせん",
	"はいそう",
	"はいち",
	"ばいばい",
	"はいれつ",
	"はえる",
	"はおる",
	"はかい",
	"ばかり",
	"はかる",
	"はくしゅ",
	"はけん",
	"はこぶ",
	"はさみ",
	"はさん",
	"はしご",
	"ばしょ",
	"はしる",
	"はせる",
	"ぱそこん",
	"はそん",
	"はたん",
	"はちみつ",
	"はつおん",
	"はっかく",
	"はづき",
	"はっきり",
	"はっくつ",
	"はっけん",
	"はっこう",
	"はっさん",
	"はっしん",
	"はったつ",
	"はっちゅう",
	"はってん",
	"はっぴょう",
	"はっぽう",
	"はなす",
	"はなび",
	"はにかむ",
	"はぶらし",
	"はみがき",
	"はむかう",
	"はめつ",
	"はやい",
	"はやし",
	"はらう",
	"はろうぃん",
	"はわい",
	"はんい",
	"はんえい",
	"はんおん",
	"はんかく",
	"はんきょう",
	"ばんぐみ",
	"はんこ",
	"はんしゃ",
	"はんすう",
	"はんだん",
	"ぱんち",
	"ぱんつ",
	"はんてい",
	"はんとし",
	"はんのう",
	"はんぱ",
	"はんぶん",
	"はんぺん",
	"はんぼうき",
	"はんめい",
	"はんらん",
	"はんろん",
	"ひいき",
	"ひうん",
	"ひえる",
	"ひかく",
	"ひかり",
	"ひかる",
	"ひかん",
	"ひくい",
	"ひけつ",
	"ひこうき",
	"ひこく",
	"ひさい",
	"ひさしぶり",
	"ひさん",
	"びじゅつかん",
	"ひしょ",
	"ひそか",
	"ひそむ",
	"ひたむき",
	"ひだり",
	"ひたる",
	"ひつぎ",
	"ひっこし",
	"ひっし",
	"ひつじゅひん",
	"ひっす",
	"ひつぜん",
	"ぴったり",
	"ぴっちり",
	"ひつよう",
	"ひてい",
	"ひとごみ",
	"ひなまつり",
	"ひなん",
	"ひねる",
	"ひはん",
	"ひびく",
	"ひひょう",
	"ひほう",
	"ひまわり",
	"ひまん",
	"ひみつ",
	"ひめい",
	"ひめじし",
	"ひやけ",
	"ひやす",
	"ひよう",
	"びょうき",
	"ひらがな",
	"ひらく",
	"ひりつ",
	"ひりょう",
	"ひるま",
	"ひるやすみ",
	"ひれい",
	"ひろい",
	"ひろう",
	"ひろき",
	"ひろゆき",
	"ひんかく",
	"ひんけつ",
	"ひんこん",
	"ひんしゅ",
	"ひんそう",
	"ぴんち",
	"ひんぱん",
	"びんぼう",
	"ふあん",
	"ふいうち",
	"ふうけい",
	"ふうせん",
	"ぷうたろう",
	"ふうとう",
	"ふうふ",
	"ふえる",
	"ふおん",
	"ふかい",
	"ふきん",
	"ふくざつ",
	"ふくぶくろ",
	"ふこう",
	"ふさい",
	"ふしぎ",
	"ふじみ",
	"ふすま",
	"ふせい",
	"ふせぐ",
	"ふそく",
	"ぶたにく",
	"ふたん",
	"ふちょう",
	"ふつう",
	"ふつか",
	"ふっかつ",
	"ふっき",
	"ふっこく",
	"ぶどう",
	"ふとる",
	"ふとん",
	"ふのう",
	"ふはい",
	"ふひょう",
	"ふへん",
	"ふまん",
	"ふみん",
	"ふめつ",
	"ふめん",
	"ふよう",
	"ふりこ",
	"ふりる",
	"ふるい",
	"ふんいき",
	"ぶんがく",
	"ぶんぐ",
	"ふんしつ",
	"ぶんせき",
	"ふんそう",
	"ぶんぽう",
	"へいあん",
	"へいおん",
	"へいがい",
	"へいき",
	"へいげん",
	"へいこう",
	"へいさ",
	"へいしゃ",
	"へいせつ",
	"へいそ",
	"へいたく",
	"へいてん",
	"へいねつ",
	"へいわ",
	"へきが",
	"へこむ",
	"べにいろ",
	"べにしょうが",
	"へらす",
	"へんかん",
	"べんきょう",
	"べんごし",
	"へんさい",
	"へんたい",
	"べんり",
	"ほあん",
	"ほいく",
	"ぼうぎょ",
	"ほうこく",
	"ほうそう",
	"ほうほう",
	"ほうもん",
	"ほうりつ",
	"ほえる",
	"ほおん",
	"ほかん",
	"ほきょう",
	"ぼきん",
	"ほくろ",
	"ほけつ",
	"ほけん",
	"ほこう",
	"ほこる",
	"ほしい",
	"ほしつ",
	"ほしゅ",
	"ほしょう",
	"ほせい",
	"ほそい",
	"ほそく",
	"ほたて",
	"ほたる",
	"ぽちぶくろ",
	"ほっきょく",
	"ほっさ",
	"ほったん",
	"ほとんど",
	"ほめる",
	"ほんい",
	"ほんき",
	"ほんけ",
	"ほんしつ",
	"ほんやく",
	"まいにち",
	"まかい",
	"まかせる",
	"まがる",
	"まける",
	"まこと",
	"まさつ",
	"まじめ",
	"ますく",
	"まぜる",
	"まつり",
	"まとめ",
	"まなぶ",
	"まぬけ",
	"まねく",
	"まほう",
	"まもる",
	"まゆげ",
	"まよう",
	"まろやか",
	"まわす",
	"まわり",
	"まわる",
	"まんが",
	"まんきつ",
	"まんぞく",
	"まんなか",
	"みいら",
	"みうち",
	"みえる",
	"みがく",
	"みかた",
	"みかん",
	"みけん",
	"みこん",
	"みじかい",
	"みすい",
	"みすえる",
	"みせる",
	"みっか",
	"みつかる",
	"みつける",
	"みてい",
	"みとめる",
	"みなと",
	"みなみかさい",
	"みねらる",
	"みのう",
	"みのがす",
	"みほん",
	"みもと",
	"みやげ",
	"みらい",
	"みりょく",
	"みわく",
	"みんか",
	"みんぞく",
	"むいか",
	"むえき",
	"むえん",
	"むかい",
	"むかう",
	"むかえ",
	"むかし",
	"むぎちゃ",
	"むける",
	"むげん",
	"むさぼる",
	"むしあつい",
	"むしば",
	"むじゅん",
	"むしろ",
	"むすう",
	"むすこ",
	"むすぶ",
	"むすめ",
	"むせる",
	"むせん",
	"むちゅう",
	"むなしい",
	"むのう",
	"むやみ",
	"むよう",
	"むらさき",
	"むりょう",
	"むろん",
	"めいあん",
	"めいうん",
	"めいえん",
	"めいかく",
	"めいきょく",
	"めいさい",
	"めいし",
	"めいそう",
	"めいぶつ",
	"めいれい",
	"めいわく",
	"めぐまれる",
	"めざす",
	"めした",
	"めずらしい",
	"めだつ",
	"めまい",
	"めやす",
	"めんきょ",
	"めんせき",
	"めんどう",
	"もうしあげる",
	"もうどうけん",
	"もえる",
	"もくし",
	"もくてき",
	"もくようび",
	"もちろん",
	"もどる",
	"もらう",
	"もんく",
	"もんだい",
	"やおや",
	"やける",
	"やさい",
	"やさしい",
	"やすい",
	"やすたろう",
	"やすみ",
	"やせる",
	"やそう",
	"やたい",
	"やちん",
	"やっと",
	"やっぱり",
	"やぶる",
	"やめる",
	"ややこしい",
	"やよい",
	"やわらかい",
	"ゆうき",
	"ゆうびんきょく",
	"ゆうべ",
	"ゆうめい",
	"ゆけつ",
	"ゆしゅつ",
	"ゆせん",
	"ゆそう",
	"ゆたか",
	"ゆちゃく",
	"ゆでる",
	"ゆにゅう",
	"ゆびわ",
	"ゆらい",
	"ゆれる",
	"ようい",
	"ようか",
	"ようきゅう",
	"ようじ",
	"ようす",
	"ようちえん",
	"よかぜ",
	"よかん",
	"よきん",
	"よくせい",
	"よくぼう",
	"よけい",
	"よごれる",
	"よさん",
	"よしゅう",
	"よそう",
	"よそく",
	"よっか",
	"よてい",
	"よどがわく",
	"よねつ",
	"よやく",
	"よゆう",
	"よろこぶ",
	"よろしい",
	"らいう",
	"らくがき",
	"らくご",
	"らくさつ",
	"らくだ",
	"らしんばん",
	"らせん",
	"らぞく",
	"らたい",
	"らっか",
	"られつ",
	"りえき",
	"りかい",
	"りきさく",
	"りきせつ",
	"りくぐん",
	"りくつ",
	"りけん",
	"りこう",
	"りせい",
	"りそう",
	"りそく",
	"りてん",
	"りねん",
	"りゆう",
	"りゅうがく",
	"りよう",
	"りょうり",
	"りょかん",
	"りょくちゃ",
	"りょこう",
	"りりく",
	"りれき",
	"りろん",
	"りんご",
	"るいけい",
	"るいさい",
	"るいじ",
	"るいせき",
	"るすばん",
	"るりがわら",
	"れいかん",
	"れいぎ",
	"れいせい",
	"れいぞうこ",
	"れいとう",
	"れいぼう",
	"れきし",
	"れきだい",
	"れんあい",
	"れんけい",
	"れんこん",
	"れんさい",
	"れんしゅう",
	"れんぞく",
	"れんらく",
	"ろうか",
	"ろうご",
	"ろうじん",
	"ろうそく",
	"ろくが",
	"ろこつ",
	"ろじうら",
	"ろしゅつ",
	"ろせん",
	"ろてん",
	"ろめん",
	"ろれつ",
	"ろんぎ",
	"ろんぱ",
	"ろんぶん",
	"ろんり",
	"わかす",
	"わかめ",
	"わかやま",
	"わかれる",
	"わしつ",
	"わじまし",
	"わすれもの",
	"わらう",
	"われる"
];

var japanese$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': japanese
});

var english = [
	"abandon",
	"ability",
	"able",
	"about",
	"above",
	"absent",
	"absorb",
	"abstract",
	"absurd",
	"abuse",
	"access",
	"accident",
	"account",
	"accuse",
	"achieve",
	"acid",
	"acoustic",
	"acquire",
	"across",
	"act",
	"action",
	"actor",
	"actress",
	"actual",
	"adapt",
	"add",
	"addict",
	"address",
	"adjust",
	"admit",
	"adult",
	"advance",
	"advice",
	"aerobic",
	"affair",
	"afford",
	"afraid",
	"again",
	"age",
	"agent",
	"agree",
	"ahead",
	"aim",
	"air",
	"airport",
	"aisle",
	"alarm",
	"album",
	"alcohol",
	"alert",
	"alien",
	"all",
	"alley",
	"allow",
	"almost",
	"alone",
	"alpha",
	"already",
	"also",
	"alter",
	"always",
	"amateur",
	"amazing",
	"among",
	"amount",
	"amused",
	"analyst",
	"anchor",
	"ancient",
	"anger",
	"angle",
	"angry",
	"animal",
	"ankle",
	"announce",
	"annual",
	"another",
	"answer",
	"antenna",
	"antique",
	"anxiety",
	"any",
	"apart",
	"apology",
	"appear",
	"apple",
	"approve",
	"april",
	"arch",
	"arctic",
	"area",
	"arena",
	"argue",
	"arm",
	"armed",
	"armor",
	"army",
	"around",
	"arrange",
	"arrest",
	"arrive",
	"arrow",
	"art",
	"artefact",
	"artist",
	"artwork",
	"ask",
	"aspect",
	"assault",
	"asset",
	"assist",
	"assume",
	"asthma",
	"athlete",
	"atom",
	"attack",
	"attend",
	"attitude",
	"attract",
	"auction",
	"audit",
	"august",
	"aunt",
	"author",
	"auto",
	"autumn",
	"average",
	"avocado",
	"avoid",
	"awake",
	"aware",
	"away",
	"awesome",
	"awful",
	"awkward",
	"axis",
	"baby",
	"bachelor",
	"bacon",
	"badge",
	"bag",
	"balance",
	"balcony",
	"ball",
	"bamboo",
	"banana",
	"banner",
	"bar",
	"barely",
	"bargain",
	"barrel",
	"base",
	"basic",
	"basket",
	"battle",
	"beach",
	"bean",
	"beauty",
	"because",
	"become",
	"beef",
	"before",
	"begin",
	"behave",
	"behind",
	"believe",
	"below",
	"belt",
	"bench",
	"benefit",
	"best",
	"betray",
	"better",
	"between",
	"beyond",
	"bicycle",
	"bid",
	"bike",
	"bind",
	"biology",
	"bird",
	"birth",
	"bitter",
	"black",
	"blade",
	"blame",
	"blanket",
	"blast",
	"bleak",
	"bless",
	"blind",
	"blood",
	"blossom",
	"blouse",
	"blue",
	"blur",
	"blush",
	"board",
	"boat",
	"body",
	"boil",
	"bomb",
	"bone",
	"bonus",
	"book",
	"boost",
	"border",
	"boring",
	"borrow",
	"boss",
	"bottom",
	"bounce",
	"box",
	"boy",
	"bracket",
	"brain",
	"brand",
	"brass",
	"brave",
	"bread",
	"breeze",
	"brick",
	"bridge",
	"brief",
	"bright",
	"bring",
	"brisk",
	"broccoli",
	"broken",
	"bronze",
	"broom",
	"brother",
	"brown",
	"brush",
	"bubble",
	"buddy",
	"budget",
	"buffalo",
	"build",
	"bulb",
	"bulk",
	"bullet",
	"bundle",
	"bunker",
	"burden",
	"burger",
	"burst",
	"bus",
	"business",
	"busy",
	"butter",
	"buyer",
	"buzz",
	"cabbage",
	"cabin",
	"cable",
	"cactus",
	"cage",
	"cake",
	"call",
	"calm",
	"camera",
	"camp",
	"can",
	"canal",
	"cancel",
	"candy",
	"cannon",
	"canoe",
	"canvas",
	"canyon",
	"capable",
	"capital",
	"captain",
	"car",
	"carbon",
	"card",
	"cargo",
	"carpet",
	"carry",
	"cart",
	"case",
	"cash",
	"casino",
	"castle",
	"casual",
	"cat",
	"catalog",
	"catch",
	"category",
	"cattle",
	"caught",
	"cause",
	"caution",
	"cave",
	"ceiling",
	"celery",
	"cement",
	"census",
	"century",
	"cereal",
	"certain",
	"chair",
	"chalk",
	"champion",
	"change",
	"chaos",
	"chapter",
	"charge",
	"chase",
	"chat",
	"cheap",
	"check",
	"cheese",
	"chef",
	"cherry",
	"chest",
	"chicken",
	"chief",
	"child",
	"chimney",
	"choice",
	"choose",
	"chronic",
	"chuckle",
	"chunk",
	"churn",
	"cigar",
	"cinnamon",
	"circle",
	"citizen",
	"city",
	"civil",
	"claim",
	"clap",
	"clarify",
	"claw",
	"clay",
	"clean",
	"clerk",
	"clever",
	"click",
	"client",
	"cliff",
	"climb",
	"clinic",
	"clip",
	"clock",
	"clog",
	"close",
	"cloth",
	"cloud",
	"clown",
	"club",
	"clump",
	"cluster",
	"clutch",
	"coach",
	"coast",
	"coconut",
	"code",
	"coffee",
	"coil",
	"coin",
	"collect",
	"color",
	"column",
	"combine",
	"come",
	"comfort",
	"comic",
	"common",
	"company",
	"concert",
	"conduct",
	"confirm",
	"congress",
	"connect",
	"consider",
	"control",
	"convince",
	"cook",
	"cool",
	"copper",
	"copy",
	"coral",
	"core",
	"corn",
	"correct",
	"cost",
	"cotton",
	"couch",
	"country",
	"couple",
	"course",
	"cousin",
	"cover",
	"coyote",
	"crack",
	"cradle",
	"craft",
	"cram",
	"crane",
	"crash",
	"crater",
	"crawl",
	"crazy",
	"cream",
	"credit",
	"creek",
	"crew",
	"cricket",
	"crime",
	"crisp",
	"critic",
	"crop",
	"cross",
	"crouch",
	"crowd",
	"crucial",
	"cruel",
	"cruise",
	"crumble",
	"crunch",
	"crush",
	"cry",
	"crystal",
	"cube",
	"culture",
	"cup",
	"cupboard",
	"curious",
	"current",
	"curtain",
	"curve",
	"cushion",
	"custom",
	"cute",
	"cycle",
	"dad",
	"damage",
	"damp",
	"dance",
	"danger",
	"daring",
	"dash",
	"daughter",
	"dawn",
	"day",
	"deal",
	"debate",
	"debris",
	"decade",
	"december",
	"decide",
	"decline",
	"decorate",
	"decrease",
	"deer",
	"defense",
	"define",
	"defy",
	"degree",
	"delay",
	"deliver",
	"demand",
	"demise",
	"denial",
	"dentist",
	"deny",
	"depart",
	"depend",
	"deposit",
	"depth",
	"deputy",
	"derive",
	"describe",
	"desert",
	"design",
	"desk",
	"despair",
	"destroy",
	"detail",
	"detect",
	"develop",
	"device",
	"devote",
	"diagram",
	"dial",
	"diamond",
	"diary",
	"dice",
	"diesel",
	"diet",
	"differ",
	"digital",
	"dignity",
	"dilemma",
	"dinner",
	"dinosaur",
	"direct",
	"dirt",
	"disagree",
	"discover",
	"disease",
	"dish",
	"dismiss",
	"disorder",
	"display",
	"distance",
	"divert",
	"divide",
	"divorce",
	"dizzy",
	"doctor",
	"document",
	"dog",
	"doll",
	"dolphin",
	"domain",
	"donate",
	"donkey",
	"donor",
	"door",
	"dose",
	"double",
	"dove",
	"draft",
	"dragon",
	"drama",
	"drastic",
	"draw",
	"dream",
	"dress",
	"drift",
	"drill",
	"drink",
	"drip",
	"drive",
	"drop",
	"drum",
	"dry",
	"duck",
	"dumb",
	"dune",
	"during",
	"dust",
	"dutch",
	"duty",
	"dwarf",
	"dynamic",
	"eager",
	"eagle",
	"early",
	"earn",
	"earth",
	"easily",
	"east",
	"easy",
	"echo",
	"ecology",
	"economy",
	"edge",
	"edit",
	"educate",
	"effort",
	"egg",
	"eight",
	"either",
	"elbow",
	"elder",
	"electric",
	"elegant",
	"element",
	"elephant",
	"elevator",
	"elite",
	"else",
	"embark",
	"embody",
	"embrace",
	"emerge",
	"emotion",
	"employ",
	"empower",
	"empty",
	"enable",
	"enact",
	"end",
	"endless",
	"endorse",
	"enemy",
	"energy",
	"enforce",
	"engage",
	"engine",
	"enhance",
	"enjoy",
	"enlist",
	"enough",
	"enrich",
	"enroll",
	"ensure",
	"enter",
	"entire",
	"entry",
	"envelope",
	"episode",
	"equal",
	"equip",
	"era",
	"erase",
	"erode",
	"erosion",
	"error",
	"erupt",
	"escape",
	"essay",
	"essence",
	"estate",
	"eternal",
	"ethics",
	"evidence",
	"evil",
	"evoke",
	"evolve",
	"exact",
	"example",
	"excess",
	"exchange",
	"excite",
	"exclude",
	"excuse",
	"execute",
	"exercise",
	"exhaust",
	"exhibit",
	"exile",
	"exist",
	"exit",
	"exotic",
	"expand",
	"expect",
	"expire",
	"explain",
	"expose",
	"express",
	"extend",
	"extra",
	"eye",
	"eyebrow",
	"fabric",
	"face",
	"faculty",
	"fade",
	"faint",
	"faith",
	"fall",
	"false",
	"fame",
	"family",
	"famous",
	"fan",
	"fancy",
	"fantasy",
	"farm",
	"fashion",
	"fat",
	"fatal",
	"father",
	"fatigue",
	"fault",
	"favorite",
	"feature",
	"february",
	"federal",
	"fee",
	"feed",
	"feel",
	"female",
	"fence",
	"festival",
	"fetch",
	"fever",
	"few",
	"fiber",
	"fiction",
	"field",
	"figure",
	"file",
	"film",
	"filter",
	"final",
	"find",
	"fine",
	"finger",
	"finish",
	"fire",
	"firm",
	"first",
	"fiscal",
	"fish",
	"fit",
	"fitness",
	"fix",
	"flag",
	"flame",
	"flash",
	"flat",
	"flavor",
	"flee",
	"flight",
	"flip",
	"float",
	"flock",
	"floor",
	"flower",
	"fluid",
	"flush",
	"fly",
	"foam",
	"focus",
	"fog",
	"foil",
	"fold",
	"follow",
	"food",
	"foot",
	"force",
	"forest",
	"forget",
	"fork",
	"fortune",
	"forum",
	"forward",
	"fossil",
	"foster",
	"found",
	"fox",
	"fragile",
	"frame",
	"frequent",
	"fresh",
	"friend",
	"fringe",
	"frog",
	"front",
	"frost",
	"frown",
	"frozen",
	"fruit",
	"fuel",
	"fun",
	"funny",
	"furnace",
	"fury",
	"future",
	"gadget",
	"gain",
	"galaxy",
	"gallery",
	"game",
	"gap",
	"garage",
	"garbage",
	"garden",
	"garlic",
	"garment",
	"gas",
	"gasp",
	"gate",
	"gather",
	"gauge",
	"gaze",
	"general",
	"genius",
	"genre",
	"gentle",
	"genuine",
	"gesture",
	"ghost",
	"giant",
	"gift",
	"giggle",
	"ginger",
	"giraffe",
	"girl",
	"give",
	"glad",
	"glance",
	"glare",
	"glass",
	"glide",
	"glimpse",
	"globe",
	"gloom",
	"glory",
	"glove",
	"glow",
	"glue",
	"goat",
	"goddess",
	"gold",
	"good",
	"goose",
	"gorilla",
	"gospel",
	"gossip",
	"govern",
	"gown",
	"grab",
	"grace",
	"grain",
	"grant",
	"grape",
	"grass",
	"gravity",
	"great",
	"green",
	"grid",
	"grief",
	"grit",
	"grocery",
	"group",
	"grow",
	"grunt",
	"guard",
	"guess",
	"guide",
	"guilt",
	"guitar",
	"gun",
	"gym",
	"habit",
	"hair",
	"half",
	"hammer",
	"hamster",
	"hand",
	"happy",
	"harbor",
	"hard",
	"harsh",
	"harvest",
	"hat",
	"have",
	"hawk",
	"hazard",
	"head",
	"health",
	"heart",
	"heavy",
	"hedgehog",
	"height",
	"hello",
	"helmet",
	"help",
	"hen",
	"hero",
	"hidden",
	"high",
	"hill",
	"hint",
	"hip",
	"hire",
	"history",
	"hobby",
	"hockey",
	"hold",
	"hole",
	"holiday",
	"hollow",
	"home",
	"honey",
	"hood",
	"hope",
	"horn",
	"horror",
	"horse",
	"hospital",
	"host",
	"hotel",
	"hour",
	"hover",
	"hub",
	"huge",
	"human",
	"humble",
	"humor",
	"hundred",
	"hungry",
	"hunt",
	"hurdle",
	"hurry",
	"hurt",
	"husband",
	"hybrid",
	"ice",
	"icon",
	"idea",
	"identify",
	"idle",
	"ignore",
	"ill",
	"illegal",
	"illness",
	"image",
	"imitate",
	"immense",
	"immune",
	"impact",
	"impose",
	"improve",
	"impulse",
	"inch",
	"include",
	"income",
	"increase",
	"index",
	"indicate",
	"indoor",
	"industry",
	"infant",
	"inflict",
	"inform",
	"inhale",
	"inherit",
	"initial",
	"inject",
	"injury",
	"inmate",
	"inner",
	"innocent",
	"input",
	"inquiry",
	"insane",
	"insect",
	"inside",
	"inspire",
	"install",
	"intact",
	"interest",
	"into",
	"invest",
	"invite",
	"involve",
	"iron",
	"island",
	"isolate",
	"issue",
	"item",
	"ivory",
	"jacket",
	"jaguar",
	"jar",
	"jazz",
	"jealous",
	"jeans",
	"jelly",
	"jewel",
	"job",
	"join",
	"joke",
	"journey",
	"joy",
	"judge",
	"juice",
	"jump",
	"jungle",
	"junior",
	"junk",
	"just",
	"kangaroo",
	"keen",
	"keep",
	"ketchup",
	"key",
	"kick",
	"kid",
	"kidney",
	"kind",
	"kingdom",
	"kiss",
	"kit",
	"kitchen",
	"kite",
	"kitten",
	"kiwi",
	"knee",
	"knife",
	"knock",
	"know",
	"lab",
	"label",
	"labor",
	"ladder",
	"lady",
	"lake",
	"lamp",
	"language",
	"laptop",
	"large",
	"later",
	"latin",
	"laugh",
	"laundry",
	"lava",
	"law",
	"lawn",
	"lawsuit",
	"layer",
	"lazy",
	"leader",
	"leaf",
	"learn",
	"leave",
	"lecture",
	"left",
	"leg",
	"legal",
	"legend",
	"leisure",
	"lemon",
	"lend",
	"length",
	"lens",
	"leopard",
	"lesson",
	"letter",
	"level",
	"liar",
	"liberty",
	"library",
	"license",
	"life",
	"lift",
	"light",
	"like",
	"limb",
	"limit",
	"link",
	"lion",
	"liquid",
	"list",
	"little",
	"live",
	"lizard",
	"load",
	"loan",
	"lobster",
	"local",
	"lock",
	"logic",
	"lonely",
	"long",
	"loop",
	"lottery",
	"loud",
	"lounge",
	"love",
	"loyal",
	"lucky",
	"luggage",
	"lumber",
	"lunar",
	"lunch",
	"luxury",
	"lyrics",
	"machine",
	"mad",
	"magic",
	"magnet",
	"maid",
	"mail",
	"main",
	"major",
	"make",
	"mammal",
	"man",
	"manage",
	"mandate",
	"mango",
	"mansion",
	"manual",
	"maple",
	"marble",
	"march",
	"margin",
	"marine",
	"market",
	"marriage",
	"mask",
	"mass",
	"master",
	"match",
	"material",
	"math",
	"matrix",
	"matter",
	"maximum",
	"maze",
	"meadow",
	"mean",
	"measure",
	"meat",
	"mechanic",
	"medal",
	"media",
	"melody",
	"melt",
	"member",
	"memory",
	"mention",
	"menu",
	"mercy",
	"merge",
	"merit",
	"merry",
	"mesh",
	"message",
	"metal",
	"method",
	"middle",
	"midnight",
	"milk",
	"million",
	"mimic",
	"mind",
	"minimum",
	"minor",
	"minute",
	"miracle",
	"mirror",
	"misery",
	"miss",
	"mistake",
	"mix",
	"mixed",
	"mixture",
	"mobile",
	"model",
	"modify",
	"mom",
	"moment",
	"monitor",
	"monkey",
	"monster",
	"month",
	"moon",
	"moral",
	"more",
	"morning",
	"mosquito",
	"mother",
	"motion",
	"motor",
	"mountain",
	"mouse",
	"move",
	"movie",
	"much",
	"muffin",
	"mule",
	"multiply",
	"muscle",
	"museum",
	"mushroom",
	"music",
	"must",
	"mutual",
	"myself",
	"mystery",
	"myth",
	"naive",
	"name",
	"napkin",
	"narrow",
	"nasty",
	"nation",
	"nature",
	"near",
	"neck",
	"need",
	"negative",
	"neglect",
	"neither",
	"nephew",
	"nerve",
	"nest",
	"net",
	"network",
	"neutral",
	"never",
	"news",
	"next",
	"nice",
	"night",
	"noble",
	"noise",
	"nominee",
	"noodle",
	"normal",
	"north",
	"nose",
	"notable",
	"note",
	"nothing",
	"notice",
	"novel",
	"now",
	"nuclear",
	"number",
	"nurse",
	"nut",
	"oak",
	"obey",
	"object",
	"oblige",
	"obscure",
	"observe",
	"obtain",
	"obvious",
	"occur",
	"ocean",
	"october",
	"odor",
	"off",
	"offer",
	"office",
	"often",
	"oil",
	"okay",
	"old",
	"olive",
	"olympic",
	"omit",
	"once",
	"one",
	"onion",
	"online",
	"only",
	"open",
	"opera",
	"opinion",
	"oppose",
	"option",
	"orange",
	"orbit",
	"orchard",
	"order",
	"ordinary",
	"organ",
	"orient",
	"original",
	"orphan",
	"ostrich",
	"other",
	"outdoor",
	"outer",
	"output",
	"outside",
	"oval",
	"oven",
	"over",
	"own",
	"owner",
	"oxygen",
	"oyster",
	"ozone",
	"pact",
	"paddle",
	"page",
	"pair",
	"palace",
	"palm",
	"panda",
	"panel",
	"panic",
	"panther",
	"paper",
	"parade",
	"parent",
	"park",
	"parrot",
	"party",
	"pass",
	"patch",
	"path",
	"patient",
	"patrol",
	"pattern",
	"pause",
	"pave",
	"payment",
	"peace",
	"peanut",
	"pear",
	"peasant",
	"pelican",
	"pen",
	"penalty",
	"pencil",
	"people",
	"pepper",
	"perfect",
	"permit",
	"person",
	"pet",
	"phone",
	"photo",
	"phrase",
	"physical",
	"piano",
	"picnic",
	"picture",
	"piece",
	"pig",
	"pigeon",
	"pill",
	"pilot",
	"pink",
	"pioneer",
	"pipe",
	"pistol",
	"pitch",
	"pizza",
	"place",
	"planet",
	"plastic",
	"plate",
	"play",
	"please",
	"pledge",
	"pluck",
	"plug",
	"plunge",
	"poem",
	"poet",
	"point",
	"polar",
	"pole",
	"police",
	"pond",
	"pony",
	"pool",
	"popular",
	"portion",
	"position",
	"possible",
	"post",
	"potato",
	"pottery",
	"poverty",
	"powder",
	"power",
	"practice",
	"praise",
	"predict",
	"prefer",
	"prepare",
	"present",
	"pretty",
	"prevent",
	"price",
	"pride",
	"primary",
	"print",
	"priority",
	"prison",
	"private",
	"prize",
	"problem",
	"process",
	"produce",
	"profit",
	"program",
	"project",
	"promote",
	"proof",
	"property",
	"prosper",
	"protect",
	"proud",
	"provide",
	"public",
	"pudding",
	"pull",
	"pulp",
	"pulse",
	"pumpkin",
	"punch",
	"pupil",
	"puppy",
	"purchase",
	"purity",
	"purpose",
	"purse",
	"push",
	"put",
	"puzzle",
	"pyramid",
	"quality",
	"quantum",
	"quarter",
	"question",
	"quick",
	"quit",
	"quiz",
	"quote",
	"rabbit",
	"raccoon",
	"race",
	"rack",
	"radar",
	"radio",
	"rail",
	"rain",
	"raise",
	"rally",
	"ramp",
	"ranch",
	"random",
	"range",
	"rapid",
	"rare",
	"rate",
	"rather",
	"raven",
	"raw",
	"razor",
	"ready",
	"real",
	"reason",
	"rebel",
	"rebuild",
	"recall",
	"receive",
	"recipe",
	"record",
	"recycle",
	"reduce",
	"reflect",
	"reform",
	"refuse",
	"region",
	"regret",
	"regular",
	"reject",
	"relax",
	"release",
	"relief",
	"rely",
	"remain",
	"remember",
	"remind",
	"remove",
	"render",
	"renew",
	"rent",
	"reopen",
	"repair",
	"repeat",
	"replace",
	"report",
	"require",
	"rescue",
	"resemble",
	"resist",
	"resource",
	"response",
	"result",
	"retire",
	"retreat",
	"return",
	"reunion",
	"reveal",
	"review",
	"reward",
	"rhythm",
	"rib",
	"ribbon",
	"rice",
	"rich",
	"ride",
	"ridge",
	"rifle",
	"right",
	"rigid",
	"ring",
	"riot",
	"ripple",
	"risk",
	"ritual",
	"rival",
	"river",
	"road",
	"roast",
	"robot",
	"robust",
	"rocket",
	"romance",
	"roof",
	"rookie",
	"room",
	"rose",
	"rotate",
	"rough",
	"round",
	"route",
	"royal",
	"rubber",
	"rude",
	"rug",
	"rule",
	"run",
	"runway",
	"rural",
	"sad",
	"saddle",
	"sadness",
	"safe",
	"sail",
	"salad",
	"salmon",
	"salon",
	"salt",
	"salute",
	"same",
	"sample",
	"sand",
	"satisfy",
	"satoshi",
	"sauce",
	"sausage",
	"save",
	"say",
	"scale",
	"scan",
	"scare",
	"scatter",
	"scene",
	"scheme",
	"school",
	"science",
	"scissors",
	"scorpion",
	"scout",
	"scrap",
	"screen",
	"script",
	"scrub",
	"sea",
	"search",
	"season",
	"seat",
	"second",
	"secret",
	"section",
	"security",
	"seed",
	"seek",
	"segment",
	"select",
	"sell",
	"seminar",
	"senior",
	"sense",
	"sentence",
	"series",
	"service",
	"session",
	"settle",
	"setup",
	"seven",
	"shadow",
	"shaft",
	"shallow",
	"share",
	"shed",
	"shell",
	"sheriff",
	"shield",
	"shift",
	"shine",
	"ship",
	"shiver",
	"shock",
	"shoe",
	"shoot",
	"shop",
	"short",
	"shoulder",
	"shove",
	"shrimp",
	"shrug",
	"shuffle",
	"shy",
	"sibling",
	"sick",
	"side",
	"siege",
	"sight",
	"sign",
	"silent",
	"silk",
	"silly",
	"silver",
	"similar",
	"simple",
	"since",
	"sing",
	"siren",
	"sister",
	"situate",
	"six",
	"size",
	"skate",
	"sketch",
	"ski",
	"skill",
	"skin",
	"skirt",
	"skull",
	"slab",
	"slam",
	"sleep",
	"slender",
	"slice",
	"slide",
	"slight",
	"slim",
	"slogan",
	"slot",
	"slow",
	"slush",
	"small",
	"smart",
	"smile",
	"smoke",
	"smooth",
	"snack",
	"snake",
	"snap",
	"sniff",
	"snow",
	"soap",
	"soccer",
	"social",
	"sock",
	"soda",
	"soft",
	"solar",
	"soldier",
	"solid",
	"solution",
	"solve",
	"someone",
	"song",
	"soon",
	"sorry",
	"sort",
	"soul",
	"sound",
	"soup",
	"source",
	"south",
	"space",
	"spare",
	"spatial",
	"spawn",
	"speak",
	"special",
	"speed",
	"spell",
	"spend",
	"sphere",
	"spice",
	"spider",
	"spike",
	"spin",
	"spirit",
	"split",
	"spoil",
	"sponsor",
	"spoon",
	"sport",
	"spot",
	"spray",
	"spread",
	"spring",
	"spy",
	"square",
	"squeeze",
	"squirrel",
	"stable",
	"stadium",
	"staff",
	"stage",
	"stairs",
	"stamp",
	"stand",
	"start",
	"state",
	"stay",
	"steak",
	"steel",
	"stem",
	"step",
	"stereo",
	"stick",
	"still",
	"sting",
	"stock",
	"stomach",
	"stone",
	"stool",
	"story",
	"stove",
	"strategy",
	"street",
	"strike",
	"strong",
	"struggle",
	"student",
	"stuff",
	"stumble",
	"style",
	"subject",
	"submit",
	"subway",
	"success",
	"such",
	"sudden",
	"suffer",
	"sugar",
	"suggest",
	"suit",
	"summer",
	"sun",
	"sunny",
	"sunset",
	"super",
	"supply",
	"supreme",
	"sure",
	"surface",
	"surge",
	"surprise",
	"surround",
	"survey",
	"suspect",
	"sustain",
	"swallow",
	"swamp",
	"swap",
	"swarm",
	"swear",
	"sweet",
	"swift",
	"swim",
	"swing",
	"switch",
	"sword",
	"symbol",
	"symptom",
	"syrup",
	"system",
	"table",
	"tackle",
	"tag",
	"tail",
	"talent",
	"talk",
	"tank",
	"tape",
	"target",
	"task",
	"taste",
	"tattoo",
	"taxi",
	"teach",
	"team",
	"tell",
	"ten",
	"tenant",
	"tennis",
	"tent",
	"term",
	"test",
	"text",
	"thank",
	"that",
	"theme",
	"then",
	"theory",
	"there",
	"they",
	"thing",
	"this",
	"thought",
	"three",
	"thrive",
	"throw",
	"thumb",
	"thunder",
	"ticket",
	"tide",
	"tiger",
	"tilt",
	"timber",
	"time",
	"tiny",
	"tip",
	"tired",
	"tissue",
	"title",
	"toast",
	"tobacco",
	"today",
	"toddler",
	"toe",
	"together",
	"toilet",
	"token",
	"tomato",
	"tomorrow",
	"tone",
	"tongue",
	"tonight",
	"tool",
	"tooth",
	"top",
	"topic",
	"topple",
	"torch",
	"tornado",
	"tortoise",
	"toss",
	"total",
	"tourist",
	"toward",
	"tower",
	"town",
	"toy",
	"track",
	"trade",
	"traffic",
	"tragic",
	"train",
	"transfer",
	"trap",
	"trash",
	"travel",
	"tray",
	"treat",
	"tree",
	"trend",
	"trial",
	"tribe",
	"trick",
	"trigger",
	"trim",
	"trip",
	"trophy",
	"trouble",
	"truck",
	"true",
	"truly",
	"trumpet",
	"trust",
	"truth",
	"try",
	"tube",
	"tuition",
	"tumble",
	"tuna",
	"tunnel",
	"turkey",
	"turn",
	"turtle",
	"twelve",
	"twenty",
	"twice",
	"twin",
	"twist",
	"two",
	"type",
	"typical",
	"ugly",
	"umbrella",
	"unable",
	"unaware",
	"uncle",
	"uncover",
	"under",
	"undo",
	"unfair",
	"unfold",
	"unhappy",
	"uniform",
	"unique",
	"unit",
	"universe",
	"unknown",
	"unlock",
	"until",
	"unusual",
	"unveil",
	"update",
	"upgrade",
	"uphold",
	"upon",
	"upper",
	"upset",
	"urban",
	"urge",
	"usage",
	"use",
	"used",
	"useful",
	"useless",
	"usual",
	"utility",
	"vacant",
	"vacuum",
	"vague",
	"valid",
	"valley",
	"valve",
	"van",
	"vanish",
	"vapor",
	"various",
	"vast",
	"vault",
	"vehicle",
	"velvet",
	"vendor",
	"venture",
	"venue",
	"verb",
	"verify",
	"version",
	"very",
	"vessel",
	"veteran",
	"viable",
	"vibrant",
	"vicious",
	"victory",
	"video",
	"view",
	"village",
	"vintage",
	"violin",
	"virtual",
	"virus",
	"visa",
	"visit",
	"visual",
	"vital",
	"vivid",
	"vocal",
	"voice",
	"void",
	"volcano",
	"volume",
	"vote",
	"voyage",
	"wage",
	"wagon",
	"wait",
	"walk",
	"wall",
	"walnut",
	"want",
	"warfare",
	"warm",
	"warrior",
	"wash",
	"wasp",
	"waste",
	"water",
	"wave",
	"way",
	"wealth",
	"weapon",
	"wear",
	"weasel",
	"weather",
	"web",
	"wedding",
	"weekend",
	"weird",
	"welcome",
	"west",
	"wet",
	"whale",
	"what",
	"wheat",
	"wheel",
	"when",
	"where",
	"whip",
	"whisper",
	"wide",
	"width",
	"wife",
	"wild",
	"will",
	"win",
	"window",
	"wine",
	"wing",
	"wink",
	"winner",
	"winter",
	"wire",
	"wisdom",
	"wise",
	"wish",
	"witness",
	"wolf",
	"woman",
	"wonder",
	"wood",
	"wool",
	"word",
	"work",
	"world",
	"worry",
	"worth",
	"wrap",
	"wreck",
	"wrestle",
	"wrist",
	"write",
	"wrong",
	"yard",
	"year",
	"yellow",
	"you",
	"young",
	"youth",
	"zebra",
	"zero",
	"zone",
	"zoo"
];

var english$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': english
});

var require$$0 = getCjsExportFromNamespace(chinese_simplified$1);

var require$$1 = getCjsExportFromNamespace(chinese_traditional$1);

var require$$2 = getCjsExportFromNamespace(korean$1);

var require$$3 = getCjsExportFromNamespace(french$1);

var require$$4 = getCjsExportFromNamespace(italian$1);

var require$$5 = getCjsExportFromNamespace(spanish$1);

var require$$6 = getCjsExportFromNamespace(japanese$1);

var require$$7 = getCjsExportFromNamespace(english$1);

var _wordlists = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
// browserify by default only pulls in files that are hard coded in requires
// In order of last to first in this file, the default wordlist will be chosen
// based on what is present. (Bundles may remove wordlists they don't need)
const wordlists = {};
exports.wordlists = wordlists;
let _default;
exports._default = _default;
try {
    exports._default = _default = require$$0;
    wordlists.chinese_simplified = _default;
}
catch (err) { }
try {
    exports._default = _default = require$$1;
    wordlists.chinese_traditional = _default;
}
catch (err) { }
try {
    exports._default = _default = require$$2;
    wordlists.korean = _default;
}
catch (err) { }
try {
    exports._default = _default = require$$3;
    wordlists.french = _default;
}
catch (err) { }
try {
    exports._default = _default = require$$4;
    wordlists.italian = _default;
}
catch (err) { }
try {
    exports._default = _default = require$$5;
    wordlists.spanish = _default;
}
catch (err) { }
try {
    exports._default = _default = require$$6;
    wordlists.japanese = _default;
    wordlists.JA = _default;
}
catch (err) { }
try {
    exports._default = _default = require$$7;
    wordlists.english = _default;
    wordlists.EN = _default;
}
catch (err) { }
});

unwrapExports(_wordlists);
var _wordlists_1 = _wordlists.wordlists;
var _wordlists_2 = _wordlists._default;

var src = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });




let DEFAULT_WORDLIST = _wordlists._default;
const INVALID_MNEMONIC = 'Invalid mnemonic';
const INVALID_ENTROPY = 'Invalid entropy';
const INVALID_CHECKSUM = 'Invalid mnemonic checksum';
const WORDLIST_REQUIRED = 'A wordlist is required but a default could not be found.\n' +
    'Please explicitly pass a 2048 word array explicitly.';
function lpad(str, padString, length) {
    while (str.length < length)
        str = padString + str;
    return str;
}
function binaryToByte(bin) {
    return parseInt(bin, 2);
}
function bytesToBinary(bytes) {
    return bytes.map(x => lpad(x.toString(2), '0', 8)).join('');
}
function deriveChecksumBits(entropyBuffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = browser('sha256')
        .update(entropyBuffer)
        .digest();
    return bytesToBinary([...hash]).slice(0, CS);
}
function salt(password) {
    return 'mnemonic' + (password || '');
}
function mnemonicToSeedSync(mnemonic, password) {
    const mnemonicBuffer = Buffer.from((mnemonic || '').normalize('NFKD'), 'utf8');
    const saltBuffer = Buffer.from(salt((password || '').normalize('NFKD')), 'utf8');
    return browser$1.pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512');
}
exports.mnemonicToSeedSync = mnemonicToSeedSync;
function mnemonicToSeed(mnemonic, password) {
    return new Promise((resolve, reject) => {
        try {
            const mnemonicBuffer = Buffer.from((mnemonic || '').normalize('NFKD'), 'utf8');
            const saltBuffer = Buffer.from(salt((password || '').normalize('NFKD')), 'utf8');
            browser$1.pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512', (err, data) => {
                if (err)
                    return reject(err);
                else
                    return resolve(data);
            });
        }
        catch (error) {
            return reject(error);
        }
    });
}
exports.mnemonicToSeed = mnemonicToSeed;
function mnemonicToEntropy(mnemonic, wordlist) {
    wordlist = wordlist || DEFAULT_WORDLIST;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    const words = (mnemonic || '').normalize('NFKD').split(' ');
    if (words.length % 3 !== 0)
        throw new Error(INVALID_MNEMONIC);
    // convert word indices to 11 bit binary strings
    const bits = words
        .map(word => {
        const index = wordlist.indexOf(word);
        if (index === -1)
            throw new Error(INVALID_MNEMONIC);
        return lpad(index.toString(2), '0', 11);
    })
        .join('');
    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    const checksumBits = bits.slice(dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
    if (entropyBytes.length < 16)
        throw new Error(INVALID_ENTROPY);
    if (entropyBytes.length > 32)
        throw new Error(INVALID_ENTROPY);
    if (entropyBytes.length % 4 !== 0)
        throw new Error(INVALID_ENTROPY);
    const entropy = Buffer.from(entropyBytes);
    const newChecksum = deriveChecksumBits(entropy);
    if (newChecksum !== checksumBits)
        throw new Error(INVALID_CHECKSUM);
    return entropy.toString('hex');
}
exports.mnemonicToEntropy = mnemonicToEntropy;
function entropyToMnemonic(entropy, wordlist) {
    if (!Buffer.isBuffer(entropy))
        entropy = Buffer.from(entropy, 'hex');
    wordlist = wordlist || DEFAULT_WORDLIST;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    // 128 <= ENT <= 256
    if (entropy.length < 16)
        throw new TypeError(INVALID_ENTROPY);
    if (entropy.length > 32)
        throw new TypeError(INVALID_ENTROPY);
    if (entropy.length % 4 !== 0)
        throw new TypeError(INVALID_ENTROPY);
    const entropyBits = bytesToBinary([...entropy]);
    const checksumBits = deriveChecksumBits(entropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g);
    const words = chunks.map(binary => {
        const index = binaryToByte(binary);
        return wordlist[index];
    });
    return wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093' // Japanese wordlist
        ? words.join('\u3000')
        : words.join(' ');
}
exports.entropyToMnemonic = entropyToMnemonic;
function generateMnemonic(strength, rng, wordlist) {
    strength = strength || 128;
    if (strength % 32 !== 0)
        throw new TypeError(INVALID_ENTROPY);
    rng = rng || browser$2;
    return entropyToMnemonic(rng(strength / 8), wordlist);
}
exports.generateMnemonic = generateMnemonic;
function validateMnemonic(mnemonic, wordlist) {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
    }
    catch (e) {
        return false;
    }
    return true;
}
exports.validateMnemonic = validateMnemonic;
function setDefaultWordlist(language) {
    const result = _wordlists.wordlists[language];
    if (result)
        DEFAULT_WORDLIST = result;
    else
        throw new Error('Could not find wordlist for language "' + language + '"');
}
exports.setDefaultWordlist = setDefaultWordlist;
function getDefaultWordlist() {
    if (!DEFAULT_WORDLIST)
        throw new Error('No Default Wordlist set');
    return Object.keys(_wordlists.wordlists).filter(lang => {
        if (lang === 'JA' || lang === 'EN')
            return false;
        return _wordlists.wordlists[lang].every((word, index) => word === DEFAULT_WORDLIST[index]);
    })[0];
}
exports.getDefaultWordlist = getDefaultWordlist;
var _wordlists_2 = _wordlists;
exports.wordlists = _wordlists_2.wordlists;
});

unwrapExports(src);
var src_1 = src.mnemonicToSeedSync;
var src_2 = src.mnemonicToSeed;
var src_3 = src.mnemonicToEntropy;
var src_4 = src.entropyToMnemonic;
var src_5 = src.generateMnemonic;
var src_6 = src.validateMnemonic;
var src_7 = src.setDefaultWordlist;
var src_8 = src.getDefaultWordlist;
var src_9 = src.wordlists;

const version = "logger/5.0.5";

let _permanentCensorErrors = false;
let _censorErrors = false;
const LogLevels = { debug: 1, "default": 2, info: 2, warning: 3, error: 4, off: 5 };
let _logLevel = LogLevels["default"];
let _globalLogger = null;
function _checkNormalize() {
    try {
        const missing = [];
        // Make sure all forms of normalization are supported
        ["NFD", "NFC", "NFKD", "NFKC"].forEach((form) => {
            try {
                if ("test".normalize(form) !== "test") {
                    throw new Error("bad normalize");
                }
                ;
            }
            catch (error) {
                missing.push(form);
            }
        });
        if (missing.length) {
            throw new Error("missing " + missing.join(", "));
        }
        if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
            throw new Error("broken implementation");
        }
    }
    catch (error) {
        return error.message;
    }
    return null;
}
const _normalizeError = _checkNormalize();
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["OFF"] = "OFF";
})(LogLevel || (LogLevel = {}));
var ErrorCode;
(function (ErrorCode) {
    ///////////////////
    // Generic Errors
    // Unknown Error
    ErrorCode["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
    // Not Implemented
    ErrorCode["NOT_IMPLEMENTED"] = "NOT_IMPLEMENTED";
    // Unsupported Operation
    //   - operation
    ErrorCode["UNSUPPORTED_OPERATION"] = "UNSUPPORTED_OPERATION";
    // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
    //   - event ("noNetwork" is not re-thrown in provider.ready; otherwise thrown)
    ErrorCode["NETWORK_ERROR"] = "NETWORK_ERROR";
    // Some sort of bad response from the server
    ErrorCode["SERVER_ERROR"] = "SERVER_ERROR";
    // Timeout
    ErrorCode["TIMEOUT"] = "TIMEOUT";
    ///////////////////
    // Operational  Errors
    // Buffer Overrun
    ErrorCode["BUFFER_OVERRUN"] = "BUFFER_OVERRUN";
    // Numeric Fault
    //   - operation: the operation being executed
    //   - fault: the reason this faulted
    ErrorCode["NUMERIC_FAULT"] = "NUMERIC_FAULT";
    ///////////////////
    // Argument Errors
    // Missing new operator to an object
    //  - name: The name of the class
    ErrorCode["MISSING_NEW"] = "MISSING_NEW";
    // Invalid argument (e.g. value is incompatible with type) to a function:
    //   - argument: The argument name that was invalid
    //   - value: The value of the argument
    ErrorCode["INVALID_ARGUMENT"] = "INVALID_ARGUMENT";
    // Missing argument to a function:
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    ErrorCode["MISSING_ARGUMENT"] = "MISSING_ARGUMENT";
    // Too many arguments
    //   - count: The number of arguments received
    //   - expectedCount: The number of arguments expected
    ErrorCode["UNEXPECTED_ARGUMENT"] = "UNEXPECTED_ARGUMENT";
    ///////////////////
    // Blockchain Errors
    // Call exception
    //  - transaction: the transaction
    //  - address?: the contract address
    //  - args?: The arguments passed into the function
    //  - method?: The Solidity method signature
    //  - errorSignature?: The EIP848 error signature
    //  - errorArgs?: The EIP848 error parameters
    //  - reason: The reason (only for EIP848 "Error(string)")
    ErrorCode["CALL_EXCEPTION"] = "CALL_EXCEPTION";
    // Insufficien funds (< value + gasLimit * gasPrice)
    //   - transaction: the transaction attempted
    ErrorCode["INSUFFICIENT_FUNDS"] = "INSUFFICIENT_FUNDS";
    // Nonce has already been used
    //   - transaction: the transaction attempted
    ErrorCode["NONCE_EXPIRED"] = "NONCE_EXPIRED";
    // The replacement fee for the transaction is too low
    //   - transaction: the transaction attempted
    ErrorCode["REPLACEMENT_UNDERPRICED"] = "REPLACEMENT_UNDERPRICED";
    // The gas limit could not be estimated
    //   - transaction: the transaction passed to estimateGas
    ErrorCode["UNPREDICTABLE_GAS_LIMIT"] = "UNPREDICTABLE_GAS_LIMIT";
})(ErrorCode || (ErrorCode = {}));
class Logger {
    constructor(version) {
        Object.defineProperty(this, "version", {
            enumerable: true,
            value: version,
            writable: false
        });
    }
    _log(logLevel, args) {
        const level = logLevel.toLowerCase();
        if (LogLevels[level] == null) {
            this.throwArgumentError("invalid log level name", "logLevel", logLevel);
        }
        if (_logLevel > LogLevels[level]) {
            return;
        }
        console.log.apply(console, args);
    }
    debug(...args) {
        this._log(Logger.levels.DEBUG, args);
    }
    info(...args) {
        this._log(Logger.levels.INFO, args);
    }
    warn(...args) {
        this._log(Logger.levels.WARNING, args);
    }
    makeError(message, code, params) {
        // Errors are being censored
        if (_censorErrors) {
            return this.makeError("censored error", code, {});
        }
        if (!code) {
            code = Logger.errors.UNKNOWN_ERROR;
        }
        if (!params) {
            params = {};
        }
        const messageDetails = [];
        Object.keys(params).forEach((key) => {
            try {
                messageDetails.push(key + "=" + JSON.stringify(params[key]));
            }
            catch (error) {
                messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
            }
        });
        messageDetails.push(`code=${code}`);
        messageDetails.push(`version=${this.version}`);
        const reason = message;
        if (messageDetails.length) {
            message += " (" + messageDetails.join(", ") + ")";
        }
        // @TODO: Any??
        const error = new Error(message);
        error.reason = reason;
        error.code = code;
        Object.keys(params).forEach(function (key) {
            error[key] = params[key];
        });
        return error;
    }
    throwError(message, code, params) {
        throw this.makeError(message, code, params);
    }
    throwArgumentError(message, name, value) {
        return this.throwError(message, Logger.errors.INVALID_ARGUMENT, {
            argument: name,
            value: value
        });
    }
    assert(condition, message, code, params) {
        if (!!condition) {
            return;
        }
        this.throwError(message, code, params);
    }
    assertArgument(condition, message, name, value) {
        if (!!condition) {
            return;
        }
        this.throwArgumentError(message, name, value);
    }
    checkNormalize(message) {
        if (_normalizeError) {
            this.throwError("platform missing String.prototype.normalize", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "String.prototype.normalize", form: _normalizeError
            });
        }
    }
    checkSafeUint53(value, message) {
        if (typeof (value) !== "number") {
            return;
        }
        if (message == null) {
            message = "value not safe";
        }
        if (value < 0 || value >= 0x1fffffffffffff) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "out-of-safe-range",
                value: value
            });
        }
        if (value % 1) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "non-integer",
                value: value
            });
        }
    }
    checkArgumentCount(count, expectedCount, message) {
        if (message) {
            message = ": " + message;
        }
        else {
            message = "";
        }
        if (count < expectedCount) {
            this.throwError("missing argument" + message, Logger.errors.MISSING_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
        if (count > expectedCount) {
            this.throwError("too many arguments" + message, Logger.errors.UNEXPECTED_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
    }
    checkNew(target, kind) {
        if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    }
    checkAbstract(target, kind) {
        if (target === kind) {
            this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger.errors.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
        }
        else if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    }
    static globalLogger() {
        if (!_globalLogger) {
            _globalLogger = new Logger(version);
        }
        return _globalLogger;
    }
    static setCensorship(censorship, permanent) {
        if (!censorship && permanent) {
            this.globalLogger().throwError("cannot permanently disable censorship", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "setCensorship"
            });
        }
        if (_permanentCensorErrors) {
            if (!censorship) {
                return;
            }
            this.globalLogger().throwError("error censorship permanent", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "setCensorship"
            });
        }
        _censorErrors = !!censorship;
        _permanentCensorErrors = !!permanent;
    }
    static setLogLevel(logLevel) {
        const level = LogLevels[logLevel.toLowerCase()];
        if (level == null) {
            Logger.globalLogger().warn("invalid log level - " + logLevel);
            return;
        }
        _logLevel = level;
    }
}
Logger.errors = ErrorCode;
Logger.levels = LogLevel;

var lib_esm = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get LogLevel () { return LogLevel; },
  get ErrorCode () { return ErrorCode; },
  Logger: Logger
});

const version$1 = "bytes/5.0.4";

const logger = new Logger(version$1);
///////////////////////////////
function isHexable(value) {
    return !!(value.toHexString);
}
function addSlice(array) {
    if (array.slice) {
        return array;
    }
    array.slice = function () {
        const args = Array.prototype.slice.call(arguments);
        return addSlice(new Uint8Array(Array.prototype.slice.apply(array, args)));
    };
    return array;
}
function isBytesLike(value) {
    return ((isHexString(value) && !(value.length % 2)) || isBytes(value));
}
function isBytes(value) {
    if (value == null) {
        return false;
    }
    if (value.constructor === Uint8Array) {
        return true;
    }
    if (typeof (value) === "string") {
        return false;
    }
    if (value.length == null) {
        return false;
    }
    for (let i = 0; i < value.length; i++) {
        const v = value[i];
        if (v < 0 || v >= 256 || (v % 1)) {
            return false;
        }
    }
    return true;
}
function arrayify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger.checkSafeUint53(value, "invalid arrayify value");
        const result = [];
        while (value) {
            result.unshift(value & 0xff);
            value = parseInt(String(value / 256));
        }
        if (result.length === 0) {
            result.push(0);
        }
        return addSlice(new Uint8Array(result));
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        value = value.toHexString();
    }
    if (isHexString(value)) {
        let hex = value.substring(2);
        if (hex.length % 2) {
            if (options.hexPad === "left") {
                hex = "0x0" + hex.substring(2);
            }
            else if (options.hexPad === "right") {
                hex += "0";
            }
            else {
                logger.throwArgumentError("hex data is odd-length", "value", value);
            }
        }
        const result = [];
        for (let i = 0; i < hex.length; i += 2) {
            result.push(parseInt(hex.substring(i, i + 2), 16));
        }
        return addSlice(new Uint8Array(result));
    }
    if (isBytes(value)) {
        return addSlice(new Uint8Array(value));
    }
    return logger.throwArgumentError("invalid arrayify value", "value", value);
}
function concat(items) {
    const objects = items.map(item => arrayify(item));
    const length = objects.reduce((accum, item) => (accum + item.length), 0);
    const result = new Uint8Array(length);
    objects.reduce((offset, object) => {
        result.set(object, offset);
        return offset + object.length;
    }, 0);
    return addSlice(result);
}
function stripZeros(value) {
    let result = arrayify(value);
    if (result.length === 0) {
        return result;
    }
    // Find the first non-zero entry
    let start = 0;
    while (start < result.length && result[start] === 0) {
        start++;
    }
    // If we started with zeros, strip them
    if (start) {
        result = result.slice(start);
    }
    return result;
}
function zeroPad(value, length) {
    value = arrayify(value);
    if (value.length > length) {
        logger.throwArgumentError("value out of range", "value", arguments[0]);
    }
    const result = new Uint8Array(length);
    result.set(value, length - value.length);
    return addSlice(result);
}
function isHexString(value, length) {
    if (typeof (value) !== "string" || !value.match(/^0x[0-9A-Fa-f]*$/)) {
        return false;
    }
    if (length && value.length !== 2 + 2 * length) {
        return false;
    }
    return true;
}
const HexCharacters = "0123456789abcdef";
function hexlify(value, options) {
    if (!options) {
        options = {};
    }
    if (typeof (value) === "number") {
        logger.checkSafeUint53(value, "invalid hexlify value");
        let hex = "";
        while (value) {
            hex = HexCharacters[value & 0x0f] + hex;
            value = Math.floor(value / 16);
        }
        if (hex.length) {
            if (hex.length % 2) {
                hex = "0" + hex;
            }
            return "0x" + hex;
        }
        return "0x00";
    }
    if (options.allowMissingPrefix && typeof (value) === "string" && value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    if (isHexable(value)) {
        return value.toHexString();
    }
    if (isHexString(value)) {
        if (value.length % 2) {
            if (options.hexPad === "left") {
                value = "0x0" + value.substring(2);
            }
            else if (options.hexPad === "right") {
                value += "0";
            }
            else {
                logger.throwArgumentError("hex data is odd-length", "value", value);
            }
        }
        return value.toLowerCase();
    }
    if (isBytes(value)) {
        let result = "0x";
        for (let i = 0; i < value.length; i++) {
            let v = value[i];
            result += HexCharacters[(v & 0xf0) >> 4] + HexCharacters[v & 0x0f];
        }
        return result;
    }
    return logger.throwArgumentError("invalid hexlify value", "value", value);
}
/*
function unoddify(value: BytesLike | Hexable | number): BytesLike | Hexable | number {
    if (typeof(value) === "string" && value.length % 2 && value.substring(0, 2) === "0x") {
        return "0x0" + value.substring(2);
    }
    return value;
}
*/
function hexDataLength(data) {
    if (typeof (data) !== "string") {
        data = hexlify(data);
    }
    else if (!isHexString(data) || (data.length % 2)) {
        return null;
    }
    return (data.length - 2) / 2;
}
function hexDataSlice(data, offset, endOffset) {
    if (typeof (data) !== "string") {
        data = hexlify(data);
    }
    else if (!isHexString(data) || (data.length % 2)) {
        logger.throwArgumentError("invalid hexData", "value", data);
    }
    offset = 2 + 2 * offset;
    if (endOffset != null) {
        return "0x" + data.substring(offset, 2 + 2 * endOffset);
    }
    return "0x" + data.substring(offset);
}
function hexConcat(items) {
    let result = "0x";
    items.forEach((item) => {
        result += hexlify(item).substring(2);
    });
    return result;
}
function hexValue(value) {
    const trimmed = hexStripZeros(hexlify(value, { hexPad: "left" }));
    if (trimmed === "0x") {
        return "0x0";
    }
    return trimmed;
}
function hexStripZeros(value) {
    if (typeof (value) !== "string") {
        value = hexlify(value);
    }
    if (!isHexString(value)) {
        logger.throwArgumentError("invalid hex string", "value", value);
    }
    value = value.substring(2);
    let offset = 0;
    while (offset < value.length && value[offset] === "0") {
        offset++;
    }
    return "0x" + value.substring(offset);
}
function hexZeroPad(value, length) {
    if (typeof (value) !== "string") {
        value = hexlify(value);
    }
    else if (!isHexString(value)) {
        logger.throwArgumentError("invalid hex string", "value", value);
    }
    if (value.length > 2 * length + 2) {
        logger.throwArgumentError("value out of range", "value", arguments[1]);
    }
    while (value.length < 2 * length + 2) {
        value = "0x0" + value.substring(2);
    }
    return value;
}
function splitSignature(signature) {
    const result = {
        r: "0x",
        s: "0x",
        _vs: "0x",
        recoveryParam: 0,
        v: 0
    };
    if (isBytesLike(signature)) {
        const bytes = arrayify(signature);
        if (bytes.length !== 65) {
            logger.throwArgumentError("invalid signature string; must be 65 bytes", "signature", signature);
        }
        // Get the r, s and v
        result.r = hexlify(bytes.slice(0, 32));
        result.s = hexlify(bytes.slice(32, 64));
        result.v = bytes[64];
        // Allow a recid to be used as the v
        if (result.v < 27) {
            if (result.v === 0 || result.v === 1) {
                result.v += 27;
            }
            else {
                logger.throwArgumentError("signature invalid v byte", "signature", signature);
            }
        }
        // Compute recoveryParam from v
        result.recoveryParam = 1 - (result.v % 2);
        // Compute _vs from recoveryParam and s
        if (result.recoveryParam) {
            bytes[32] |= 0x80;
        }
        result._vs = hexlify(bytes.slice(32, 64));
    }
    else {
        result.r = signature.r;
        result.s = signature.s;
        result.v = signature.v;
        result.recoveryParam = signature.recoveryParam;
        result._vs = signature._vs;
        // If the _vs is available, use it to populate missing s, v and recoveryParam
        // and verify non-missing s, v and recoveryParam
        if (result._vs != null) {
            const vs = zeroPad(arrayify(result._vs), 32);
            result._vs = hexlify(vs);
            // Set or check the recid
            const recoveryParam = ((vs[0] >= 128) ? 1 : 0);
            if (result.recoveryParam == null) {
                result.recoveryParam = recoveryParam;
            }
            else if (result.recoveryParam !== recoveryParam) {
                logger.throwArgumentError("signature recoveryParam mismatch _vs", "signature", signature);
            }
            // Set or check the s
            vs[0] &= 0x7f;
            const s = hexlify(vs);
            if (result.s == null) {
                result.s = s;
            }
            else if (result.s !== s) {
                logger.throwArgumentError("signature v mismatch _vs", "signature", signature);
            }
        }
        // Use recid and v to populate each other
        if (result.recoveryParam == null) {
            if (result.v == null) {
                logger.throwArgumentError("signature missing v and recoveryParam", "signature", signature);
            }
            else {
                result.recoveryParam = 1 - (result.v % 2);
            }
        }
        else {
            if (result.v == null) {
                result.v = 27 + result.recoveryParam;
            }
            else if (result.recoveryParam !== (1 - (result.v % 2))) {
                logger.throwArgumentError("signature recoveryParam mismatch v", "signature", signature);
            }
        }
        if (result.r == null || !isHexString(result.r)) {
            logger.throwArgumentError("signature missing or invalid r", "signature", signature);
        }
        else {
            result.r = hexZeroPad(result.r, 32);
        }
        if (result.s == null || !isHexString(result.s)) {
            logger.throwArgumentError("signature missing or invalid s", "signature", signature);
        }
        else {
            result.s = hexZeroPad(result.s, 32);
        }
        const vs = arrayify(result.s);
        if (vs[0] >= 128) {
            logger.throwArgumentError("signature s out of range", "signature", signature);
        }
        if (result.recoveryParam) {
            vs[0] |= 0x80;
        }
        const _vs = hexlify(vs);
        if (result._vs) {
            if (!isHexString(result._vs)) {
                logger.throwArgumentError("signature invalid _vs", "signature", signature);
            }
            result._vs = hexZeroPad(result._vs, 32);
        }
        // Set or check the _vs
        if (result._vs == null) {
            result._vs = _vs;
        }
        else if (result._vs !== _vs) {
            logger.throwArgumentError("signature _vs mismatch v and s", "signature", signature);
        }
    }
    return result;
}
function joinSignature(signature) {
    signature = splitSignature(signature);
    return hexlify(concat([
        signature.r,
        signature.s,
        (signature.recoveryParam ? "0x1c" : "0x1b")
    ]));
}

var lib_esm$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  isBytesLike: isBytesLike,
  isBytes: isBytes,
  arrayify: arrayify,
  concat: concat,
  stripZeros: stripZeros,
  zeroPad: zeroPad,
  isHexString: isHexString,
  hexlify: hexlify,
  hexDataLength: hexDataLength,
  hexDataSlice: hexDataSlice,
  hexConcat: hexConcat,
  hexValue: hexValue,
  hexStripZeros: hexStripZeros,
  hexZeroPad: hexZeroPad,
  splitSignature: splitSignature,
  joinSignature: joinSignature
});

const version$2 = "properties/5.0.3";

var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$1 = new Logger(version$2);
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true,
        value: value,
        writable: false,
    });
}
// Crawl up the constructor chain to find a static method
function getStatic(ctor, key) {
    for (let i = 0; i < 32; i++) {
        if (ctor[key]) {
            return ctor[key];
        }
        if (!ctor.prototype || typeof (ctor.prototype) !== "object") {
            break;
        }
        ctor = Object.getPrototypeOf(ctor.prototype).constructor;
    }
    return null;
}
function resolveProperties(object) {
    return __awaiter$1(this, void 0, void 0, function* () {
        const promises = Object.keys(object).map((key) => {
            const value = object[key];
            return Promise.resolve(value).then((v) => ({ key: key, value: v }));
        });
        const results = yield Promise.all(promises);
        return results.reduce((accum, result) => {
            accum[(result.key)] = result.value;
            return accum;
        }, {});
    });
}
function checkProperties(object, properties) {
    if (!object || typeof (object) !== "object") {
        logger$1.throwArgumentError("invalid object", "object", object);
    }
    Object.keys(object).forEach((key) => {
        if (!properties[key]) {
            logger$1.throwArgumentError("invalid object key - " + key, "transaction:" + key, object);
        }
    });
}
function shallowCopy(object) {
    const result = {};
    for (const key in object) {
        result[key] = object[key];
    }
    return result;
}
const opaque = { bigint: true, boolean: true, "function": true, number: true, string: true };
function _isFrozen(object) {
    // Opaque objects are not mutable, so safe to copy by assignment
    if (object === undefined || object === null || opaque[typeof (object)]) {
        return true;
    }
    if (Array.isArray(object) || typeof (object) === "object") {
        if (!Object.isFrozen(object)) {
            return false;
        }
        const keys = Object.keys(object);
        for (let i = 0; i < keys.length; i++) {
            if (!_isFrozen(object[keys[i]])) {
                return false;
            }
        }
        return true;
    }
    return logger$1.throwArgumentError(`Cannot deepCopy ${typeof (object)}`, "object", object);
}
// Returns a new copy of object, such that no properties may be replaced.
// New properties may be added only to objects.
function _deepCopy(object) {
    if (_isFrozen(object)) {
        return object;
    }
    // Arrays are mutable, so we need to create a copy
    if (Array.isArray(object)) {
        return Object.freeze(object.map((item) => deepCopy(item)));
    }
    if (typeof (object) === "object") {
        const result = {};
        for (const key in object) {
            const value = object[key];
            if (value === undefined) {
                continue;
            }
            defineReadOnly(result, key, deepCopy(value));
        }
        return result;
    }
    return logger$1.throwArgumentError(`Cannot deepCopy ${typeof (object)}`, "object", object);
}
function deepCopy(object) {
    return _deepCopy(object);
}
class Description {
    constructor(info) {
        for (const key in info) {
            this[key] = deepCopy(info[key]);
        }
    }
}

const version$3 = "abstract-provider/5.0.3";

const logger$2 = new Logger(version$3);
//export type CallTransactionable = {
//    call(transaction: TransactionRequest): Promise<TransactionResponse>;
//};
class ForkEvent extends Description {
    static isForkEvent(value) {
        return !!(value && value._isForkEvent);
    }
}
///////////////////////////////
// Exported Abstracts
class Provider {
    constructor() {
        logger$2.checkAbstract(new.target, Provider);
        defineReadOnly(this, "_isProvider", true);
    }
    // Alias for "on"
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    // Alias for "off"
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
    static isProvider(value) {
        return !!(value && value._isProvider);
    }
}

const version$4 = "networks/5.0.3";

const logger$3 = new Logger(version$4);
function isRenetworkable(value) {
    return (value && typeof (value.renetwork) === "function");
}
function ethDefaultProvider(network) {
    const func = function (providers, options) {
        if (options == null) {
            options = {};
        }
        const providerList = [];
        if (providers.InfuraProvider) {
            try {
                providerList.push(new providers.InfuraProvider(network, options.infura));
            }
            catch (error) { }
        }
        if (providers.EtherscanProvider) {
            try {
                providerList.push(new providers.EtherscanProvider(network, options.etherscan));
            }
            catch (error) { }
        }
        if (providers.AlchemyProvider) {
            try {
                providerList.push(new providers.AlchemyProvider(network, options.alchemy));
            }
            catch (error) { }
        }
        if (providers.CloudflareProvider) {
            try {
                providerList.push(new providers.CloudflareProvider(network));
            }
            catch (error) { }
        }
        if (providerList.length === 0) {
            return null;
        }
        if (providers.FallbackProvider) {
            let quorum = 1;
            if (options.quorum != null) {
                quorum = options.quorum;
            }
            else if (network === "homestead") {
                quorum = 2;
            }
            return new providers.FallbackProvider(providerList, quorum);
        }
        return providerList[0];
    };
    func.renetwork = function (network) {
        return ethDefaultProvider(network);
    };
    return func;
}
function etcDefaultProvider(url, network) {
    const func = function (providers, options) {
        if (providers.JsonRpcProvider) {
            return new providers.JsonRpcProvider(url, network);
        }
        return null;
    };
    func.renetwork = function (network) {
        return etcDefaultProvider(url, network);
    };
    return func;
}
const homestead = {
    chainId: 1,
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    name: "homestead",
    _defaultProvider: ethDefaultProvider("homestead")
};
const ropsten = {
    chainId: 3,
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    name: "ropsten",
    _defaultProvider: ethDefaultProvider("ropsten")
};
const classicMordor = {
    chainId: 63,
    name: "classicMordor",
    _defaultProvider: etcDefaultProvider("https://www.ethercluster.com/mordor", "classicMordor")
};
const networks = {
    unspecified: {
        chainId: 0,
        name: "unspecified"
    },
    homestead: homestead,
    mainnet: homestead,
    morden: {
        chainId: 2,
        name: "morden"
    },
    ropsten: ropsten,
    testnet: ropsten,
    rinkeby: {
        chainId: 4,
        ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        name: "rinkeby",
        _defaultProvider: ethDefaultProvider("rinkeby")
    },
    kovan: {
        chainId: 42,
        name: "kovan",
        _defaultProvider: ethDefaultProvider("kovan")
    },
    goerli: {
        chainId: 5,
        ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        name: "goerli",
        _defaultProvider: ethDefaultProvider("goerli")
    },
    // ETC (See: #351)
    classic: {
        chainId: 61,
        name: "classic",
        _defaultProvider: etcDefaultProvider("https://www.ethercluster.com/etc", "classic")
    },
    classicMorden: {
        chainId: 62,
        name: "classicMorden",
    },
    classicMordor: classicMordor,
    classicTestnet: classicMordor,
    classicKotti: {
        chainId: 6,
        name: "classicKotti",
        _defaultProvider: etcDefaultProvider("https://www.ethercluster.com/kotti", "classicKotti")
    },
};
/**
 *  getNetwork
 *
 *  Converts a named common networks or chain ID (network ID) to a Network
 *  and verifies a network is a valid Network..
 */
function getNetwork(network) {
    // No network (null)
    if (network == null) {
        return null;
    }
    if (typeof (network) === "number") {
        for (const name in networks) {
            const standard = networks[name];
            if (standard.chainId === network) {
                return {
                    name: standard.name,
                    chainId: standard.chainId,
                    ensAddress: (standard.ensAddress || null),
                    _defaultProvider: (standard._defaultProvider || null)
                };
            }
        }
        return {
            chainId: network,
            name: "unknown"
        };
    }
    if (typeof (network) === "string") {
        const standard = networks[network];
        if (standard == null) {
            return null;
        }
        return {
            name: standard.name,
            chainId: standard.chainId,
            ensAddress: standard.ensAddress,
            _defaultProvider: (standard._defaultProvider || null)
        };
    }
    const standard = networks[network.name];
    // Not a standard network; check that it is a valid network in general
    if (!standard) {
        if (typeof (network.chainId) !== "number") {
            logger$3.throwArgumentError("invalid network chainId", "network", network);
        }
        return network;
    }
    // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)
    if (network.chainId !== 0 && network.chainId !== standard.chainId) {
        logger$3.throwArgumentError("network chainId mismatch", "network", network);
    }
    // @TODO: In the next major version add an attach function to a defaultProvider
    // class and move the _defaultProvider internal to this file (extend Network)
    let defaultProvider = network._defaultProvider || null;
    if (defaultProvider == null && standard._defaultProvider) {
        if (isRenetworkable(standard._defaultProvider)) {
            defaultProvider = standard._defaultProvider.renetwork(network);
        }
        else {
            defaultProvider = standard._defaultProvider;
        }
    }
    // Standard Network (allow overriding the ENS address)
    return {
        name: network.name,
        chainId: standard.chainId,
        ensAddress: (network.ensAddress || standard.ensAddress || null),
        _defaultProvider: defaultProvider
    };
}

var bn = createCommonjsModule(function (module) {
(function (module, exports) {

  // Utils
  function assert (val, msg) {
    if (!val) throw new Error(msg || 'Assertion failed');
  }

  // Could use `inherits` module, but don't want to move from single file
  // architecture yet.
  function inherits (ctor, superCtor) {
    ctor.super_ = superCtor;
    var TempCtor = function () {};
    TempCtor.prototype = superCtor.prototype;
    ctor.prototype = new TempCtor();
    ctor.prototype.constructor = ctor;
  }

  // BN

  function BN (number, base, endian) {
    if (BN.isBN(number)) {
      return number;
    }

    this.negative = 0;
    this.words = null;
    this.length = 0;

    // Reduction context
    this.red = null;

    if (number !== null) {
      if (base === 'le' || base === 'be') {
        endian = base;
        base = 10;
      }

      this._init(number || 0, base || 10, endian || 'be');
    }
  }
  if (typeof module === 'object') {
    module.exports = BN;
  } else {
    exports.BN = BN;
  }

  BN.BN = BN;
  BN.wordSize = 26;

  var Buffer;
  try {
    Buffer = buffer.Buffer;
  } catch (e) {
  }

  BN.isBN = function isBN (num) {
    if (num instanceof BN) {
      return true;
    }

    return num !== null && typeof num === 'object' &&
      num.constructor.wordSize === BN.wordSize && Array.isArray(num.words);
  };

  BN.max = function max (left, right) {
    if (left.cmp(right) > 0) return left;
    return right;
  };

  BN.min = function min (left, right) {
    if (left.cmp(right) < 0) return left;
    return right;
  };

  BN.prototype._init = function init (number, base, endian) {
    if (typeof number === 'number') {
      return this._initNumber(number, base, endian);
    }

    if (typeof number === 'object') {
      return this._initArray(number, base, endian);
    }

    if (base === 'hex') {
      base = 16;
    }
    assert(base === (base | 0) && base >= 2 && base <= 36);

    number = number.toString().replace(/\s+/g, '');
    var start = 0;
    if (number[0] === '-') {
      start++;
    }

    if (base === 16) {
      this._parseHex(number, start);
    } else {
      this._parseBase(number, base, start);
    }

    if (number[0] === '-') {
      this.negative = 1;
    }

    this.strip();

    if (endian !== 'le') return;

    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initNumber = function _initNumber (number, base, endian) {
    if (number < 0) {
      this.negative = 1;
      number = -number;
    }
    if (number < 0x4000000) {
      this.words = [ number & 0x3ffffff ];
      this.length = 1;
    } else if (number < 0x10000000000000) {
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff
      ];
      this.length = 2;
    } else {
      assert(number < 0x20000000000000); // 2 ^ 53 (unsafe)
      this.words = [
        number & 0x3ffffff,
        (number / 0x4000000) & 0x3ffffff,
        1
      ];
      this.length = 3;
    }

    if (endian !== 'le') return;

    // Reverse the bytes
    this._initArray(this.toArray(), base, endian);
  };

  BN.prototype._initArray = function _initArray (number, base, endian) {
    // Perhaps a Uint8Array
    assert(typeof number.length === 'number');
    if (number.length <= 0) {
      this.words = [ 0 ];
      this.length = 1;
      return this;
    }

    this.length = Math.ceil(number.length / 3);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    var off = 0;
    if (endian === 'be') {
      for (i = number.length - 1, j = 0; i >= 0; i -= 3) {
        w = number[i] | (number[i - 1] << 8) | (number[i - 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    } else if (endian === 'le') {
      for (i = 0, j = 0; i < number.length; i += 3) {
        w = number[i] | (number[i + 1] << 8) | (number[i + 2] << 16);
        this.words[j] |= (w << off) & 0x3ffffff;
        this.words[j + 1] = (w >>> (26 - off)) & 0x3ffffff;
        off += 24;
        if (off >= 26) {
          off -= 26;
          j++;
        }
      }
    }
    return this.strip();
  };

  function parseHex (str, start, end) {
    var r = 0;
    var len = Math.min(str.length, end);
    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;

      r <<= 4;

      // 'a' - 'f'
      if (c >= 49 && c <= 54) {
        r |= c - 49 + 0xa;

      // 'A' - 'F'
      } else if (c >= 17 && c <= 22) {
        r |= c - 17 + 0xa;

      // '0' - '9'
      } else {
        r |= c & 0xf;
      }
    }
    return r;
  }

  BN.prototype._parseHex = function _parseHex (number, start) {
    // Create possibly bigger array to ensure that it fits the number
    this.length = Math.ceil((number.length - start) / 6);
    this.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      this.words[i] = 0;
    }

    var j, w;
    // Scan 24-bit chunks and add them to the number
    var off = 0;
    for (i = number.length - 6, j = 0; i >= start; i -= 6) {
      w = parseHex(number, i, i + 6);
      this.words[j] |= (w << off) & 0x3ffffff;
      // NOTE: `0x3fffff` is intentional here, 26bits max shift + 24bit hex limb
      this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
      off += 24;
      if (off >= 26) {
        off -= 26;
        j++;
      }
    }
    if (i + 6 !== start) {
      w = parseHex(number, start, i + 6);
      this.words[j] |= (w << off) & 0x3ffffff;
      this.words[j + 1] |= w >>> (26 - off) & 0x3fffff;
    }
    this.strip();
  };

  function parseBase (str, start, end, mul) {
    var r = 0;
    var len = Math.min(str.length, end);
    for (var i = start; i < len; i++) {
      var c = str.charCodeAt(i) - 48;

      r *= mul;

      // 'a'
      if (c >= 49) {
        r += c - 49 + 0xa;

      // 'A'
      } else if (c >= 17) {
        r += c - 17 + 0xa;

      // '0' - '9'
      } else {
        r += c;
      }
    }
    return r;
  }

  BN.prototype._parseBase = function _parseBase (number, base, start) {
    // Initialize as zero
    this.words = [ 0 ];
    this.length = 1;

    // Find length of limb in base
    for (var limbLen = 0, limbPow = 1; limbPow <= 0x3ffffff; limbPow *= base) {
      limbLen++;
    }
    limbLen--;
    limbPow = (limbPow / base) | 0;

    var total = number.length - start;
    var mod = total % limbLen;
    var end = Math.min(total, total - mod) + start;

    var word = 0;
    for (var i = start; i < end; i += limbLen) {
      word = parseBase(number, i, i + limbLen, base);

      this.imuln(limbPow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }

    if (mod !== 0) {
      var pow = 1;
      word = parseBase(number, i, number.length, base);

      for (i = 0; i < mod; i++) {
        pow *= base;
      }

      this.imuln(pow);
      if (this.words[0] + word < 0x4000000) {
        this.words[0] += word;
      } else {
        this._iaddn(word);
      }
    }
  };

  BN.prototype.copy = function copy (dest) {
    dest.words = new Array(this.length);
    for (var i = 0; i < this.length; i++) {
      dest.words[i] = this.words[i];
    }
    dest.length = this.length;
    dest.negative = this.negative;
    dest.red = this.red;
  };

  BN.prototype.clone = function clone () {
    var r = new BN(null);
    this.copy(r);
    return r;
  };

  BN.prototype._expand = function _expand (size) {
    while (this.length < size) {
      this.words[this.length++] = 0;
    }
    return this;
  };

  // Remove leading `0` from `this`
  BN.prototype.strip = function strip () {
    while (this.length > 1 && this.words[this.length - 1] === 0) {
      this.length--;
    }
    return this._normSign();
  };

  BN.prototype._normSign = function _normSign () {
    // -0 = 0
    if (this.length === 1 && this.words[0] === 0) {
      this.negative = 0;
    }
    return this;
  };

  BN.prototype.inspect = function inspect () {
    return (this.red ? '<BN-R: ' : '<BN: ') + this.toString(16) + '>';
  };

  /*

  var zeros = [];
  var groupSizes = [];
  var groupBases = [];

  var s = '';
  var i = -1;
  while (++i < BN.wordSize) {
    zeros[i] = s;
    s += '0';
  }
  groupSizes[0] = 0;
  groupSizes[1] = 0;
  groupBases[0] = 0;
  groupBases[1] = 0;
  var base = 2 - 1;
  while (++base < 36 + 1) {
    var groupSize = 0;
    var groupBase = 1;
    while (groupBase < (1 << BN.wordSize) / base) {
      groupBase *= base;
      groupSize += 1;
    }
    groupSizes[base] = groupSize;
    groupBases[base] = groupBase;
  }

  */

  var zeros = [
    '',
    '0',
    '00',
    '000',
    '0000',
    '00000',
    '000000',
    '0000000',
    '00000000',
    '000000000',
    '0000000000',
    '00000000000',
    '000000000000',
    '0000000000000',
    '00000000000000',
    '000000000000000',
    '0000000000000000',
    '00000000000000000',
    '000000000000000000',
    '0000000000000000000',
    '00000000000000000000',
    '000000000000000000000',
    '0000000000000000000000',
    '00000000000000000000000',
    '000000000000000000000000',
    '0000000000000000000000000'
  ];

  var groupSizes = [
    0, 0,
    25, 16, 12, 11, 10, 9, 8,
    8, 7, 7, 7, 7, 6, 6,
    6, 6, 6, 6, 6, 5, 5,
    5, 5, 5, 5, 5, 5, 5,
    5, 5, 5, 5, 5, 5, 5
  ];

  var groupBases = [
    0, 0,
    33554432, 43046721, 16777216, 48828125, 60466176, 40353607, 16777216,
    43046721, 10000000, 19487171, 35831808, 62748517, 7529536, 11390625,
    16777216, 24137569, 34012224, 47045881, 64000000, 4084101, 5153632,
    6436343, 7962624, 9765625, 11881376, 14348907, 17210368, 20511149,
    24300000, 28629151, 33554432, 39135393, 45435424, 52521875, 60466176
  ];

  BN.prototype.toString = function toString (base, padding) {
    base = base || 10;
    padding = padding | 0 || 1;

    var out;
    if (base === 16 || base === 'hex') {
      out = '';
      var off = 0;
      var carry = 0;
      for (var i = 0; i < this.length; i++) {
        var w = this.words[i];
        var word = (((w << off) | carry) & 0xffffff).toString(16);
        carry = (w >>> (24 - off)) & 0xffffff;
        if (carry !== 0 || i !== this.length - 1) {
          out = zeros[6 - word.length] + word + out;
        } else {
          out = word + out;
        }
        off += 2;
        if (off >= 26) {
          off -= 26;
          i--;
        }
      }
      if (carry !== 0) {
        out = carry.toString(16) + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    if (base === (base | 0) && base >= 2 && base <= 36) {
      // var groupSize = Math.floor(BN.wordSize * Math.LN2 / Math.log(base));
      var groupSize = groupSizes[base];
      // var groupBase = Math.pow(base, groupSize);
      var groupBase = groupBases[base];
      out = '';
      var c = this.clone();
      c.negative = 0;
      while (!c.isZero()) {
        var r = c.modn(groupBase).toString(base);
        c = c.idivn(groupBase);

        if (!c.isZero()) {
          out = zeros[groupSize - r.length] + r + out;
        } else {
          out = r + out;
        }
      }
      if (this.isZero()) {
        out = '0' + out;
      }
      while (out.length % padding !== 0) {
        out = '0' + out;
      }
      if (this.negative !== 0) {
        out = '-' + out;
      }
      return out;
    }

    assert(false, 'Base should be between 2 and 36');
  };

  BN.prototype.toNumber = function toNumber () {
    var ret = this.words[0];
    if (this.length === 2) {
      ret += this.words[1] * 0x4000000;
    } else if (this.length === 3 && this.words[2] === 0x01) {
      // NOTE: at this stage it is known that the top bit is set
      ret += 0x10000000000000 + (this.words[1] * 0x4000000);
    } else if (this.length > 2) {
      assert(false, 'Number can only safely store up to 53 bits');
    }
    return (this.negative !== 0) ? -ret : ret;
  };

  BN.prototype.toJSON = function toJSON () {
    return this.toString(16);
  };

  BN.prototype.toBuffer = function toBuffer (endian, length) {
    assert(typeof Buffer !== 'undefined');
    return this.toArrayLike(Buffer, endian, length);
  };

  BN.prototype.toArray = function toArray (endian, length) {
    return this.toArrayLike(Array, endian, length);
  };

  BN.prototype.toArrayLike = function toArrayLike (ArrayType, endian, length) {
    var byteLength = this.byteLength();
    var reqLength = length || Math.max(1, byteLength);
    assert(byteLength <= reqLength, 'byte array longer than desired length');
    assert(reqLength > 0, 'Requested array length <= 0');

    this.strip();
    var littleEndian = endian === 'le';
    var res = new ArrayType(reqLength);

    var b, i;
    var q = this.clone();
    if (!littleEndian) {
      // Assume big-endian
      for (i = 0; i < reqLength - byteLength; i++) {
        res[i] = 0;
      }

      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);

        res[reqLength - i - 1] = b;
      }
    } else {
      for (i = 0; !q.isZero(); i++) {
        b = q.andln(0xff);
        q.iushrn(8);

        res[i] = b;
      }

      for (; i < reqLength; i++) {
        res[i] = 0;
      }
    }

    return res;
  };

  if (Math.clz32) {
    BN.prototype._countBits = function _countBits (w) {
      return 32 - Math.clz32(w);
    };
  } else {
    BN.prototype._countBits = function _countBits (w) {
      var t = w;
      var r = 0;
      if (t >= 0x1000) {
        r += 13;
        t >>>= 13;
      }
      if (t >= 0x40) {
        r += 7;
        t >>>= 7;
      }
      if (t >= 0x8) {
        r += 4;
        t >>>= 4;
      }
      if (t >= 0x02) {
        r += 2;
        t >>>= 2;
      }
      return r + t;
    };
  }

  BN.prototype._zeroBits = function _zeroBits (w) {
    // Short-cut
    if (w === 0) return 26;

    var t = w;
    var r = 0;
    if ((t & 0x1fff) === 0) {
      r += 13;
      t >>>= 13;
    }
    if ((t & 0x7f) === 0) {
      r += 7;
      t >>>= 7;
    }
    if ((t & 0xf) === 0) {
      r += 4;
      t >>>= 4;
    }
    if ((t & 0x3) === 0) {
      r += 2;
      t >>>= 2;
    }
    if ((t & 0x1) === 0) {
      r++;
    }
    return r;
  };

  // Return number of used bits in a BN
  BN.prototype.bitLength = function bitLength () {
    var w = this.words[this.length - 1];
    var hi = this._countBits(w);
    return (this.length - 1) * 26 + hi;
  };

  function toBitArray (num) {
    var w = new Array(num.bitLength());

    for (var bit = 0; bit < w.length; bit++) {
      var off = (bit / 26) | 0;
      var wbit = bit % 26;

      w[bit] = (num.words[off] & (1 << wbit)) >>> wbit;
    }

    return w;
  }

  // Number of trailing zero bits
  BN.prototype.zeroBits = function zeroBits () {
    if (this.isZero()) return 0;

    var r = 0;
    for (var i = 0; i < this.length; i++) {
      var b = this._zeroBits(this.words[i]);
      r += b;
      if (b !== 26) break;
    }
    return r;
  };

  BN.prototype.byteLength = function byteLength () {
    return Math.ceil(this.bitLength() / 8);
  };

  BN.prototype.toTwos = function toTwos (width) {
    if (this.negative !== 0) {
      return this.abs().inotn(width).iaddn(1);
    }
    return this.clone();
  };

  BN.prototype.fromTwos = function fromTwos (width) {
    if (this.testn(width - 1)) {
      return this.notn(width).iaddn(1).ineg();
    }
    return this.clone();
  };

  BN.prototype.isNeg = function isNeg () {
    return this.negative !== 0;
  };

  // Return negative clone of `this`
  BN.prototype.neg = function neg () {
    return this.clone().ineg();
  };

  BN.prototype.ineg = function ineg () {
    if (!this.isZero()) {
      this.negative ^= 1;
    }

    return this;
  };

  // Or `num` with `this` in-place
  BN.prototype.iuor = function iuor (num) {
    while (this.length < num.length) {
      this.words[this.length++] = 0;
    }

    for (var i = 0; i < num.length; i++) {
      this.words[i] = this.words[i] | num.words[i];
    }

    return this.strip();
  };

  BN.prototype.ior = function ior (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuor(num);
  };

  // Or `num` with `this`
  BN.prototype.or = function or (num) {
    if (this.length > num.length) return this.clone().ior(num);
    return num.clone().ior(this);
  };

  BN.prototype.uor = function uor (num) {
    if (this.length > num.length) return this.clone().iuor(num);
    return num.clone().iuor(this);
  };

  // And `num` with `this` in-place
  BN.prototype.iuand = function iuand (num) {
    // b = min-length(num, this)
    var b;
    if (this.length > num.length) {
      b = num;
    } else {
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = this.words[i] & num.words[i];
    }

    this.length = b.length;

    return this.strip();
  };

  BN.prototype.iand = function iand (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuand(num);
  };

  // And `num` with `this`
  BN.prototype.and = function and (num) {
    if (this.length > num.length) return this.clone().iand(num);
    return num.clone().iand(this);
  };

  BN.prototype.uand = function uand (num) {
    if (this.length > num.length) return this.clone().iuand(num);
    return num.clone().iuand(this);
  };

  // Xor `num` with `this` in-place
  BN.prototype.iuxor = function iuxor (num) {
    // a.length > b.length
    var a;
    var b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    for (var i = 0; i < b.length; i++) {
      this.words[i] = a.words[i] ^ b.words[i];
    }

    if (this !== a) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = a.length;

    return this.strip();
  };

  BN.prototype.ixor = function ixor (num) {
    assert((this.negative | num.negative) === 0);
    return this.iuxor(num);
  };

  // Xor `num` with `this`
  BN.prototype.xor = function xor (num) {
    if (this.length > num.length) return this.clone().ixor(num);
    return num.clone().ixor(this);
  };

  BN.prototype.uxor = function uxor (num) {
    if (this.length > num.length) return this.clone().iuxor(num);
    return num.clone().iuxor(this);
  };

  // Not ``this`` with ``width`` bitwidth
  BN.prototype.inotn = function inotn (width) {
    assert(typeof width === 'number' && width >= 0);

    var bytesNeeded = Math.ceil(width / 26) | 0;
    var bitsLeft = width % 26;

    // Extend the buffer with leading zeroes
    this._expand(bytesNeeded);

    if (bitsLeft > 0) {
      bytesNeeded--;
    }

    // Handle complete words
    for (var i = 0; i < bytesNeeded; i++) {
      this.words[i] = ~this.words[i] & 0x3ffffff;
    }

    // Handle the residue
    if (bitsLeft > 0) {
      this.words[i] = ~this.words[i] & (0x3ffffff >> (26 - bitsLeft));
    }

    // And remove leading zeroes
    return this.strip();
  };

  BN.prototype.notn = function notn (width) {
    return this.clone().inotn(width);
  };

  // Set `bit` of `this`
  BN.prototype.setn = function setn (bit, val) {
    assert(typeof bit === 'number' && bit >= 0);

    var off = (bit / 26) | 0;
    var wbit = bit % 26;

    this._expand(off + 1);

    if (val) {
      this.words[off] = this.words[off] | (1 << wbit);
    } else {
      this.words[off] = this.words[off] & ~(1 << wbit);
    }

    return this.strip();
  };

  // Add `num` to `this` in-place
  BN.prototype.iadd = function iadd (num) {
    var r;

    // negative + positive
    if (this.negative !== 0 && num.negative === 0) {
      this.negative = 0;
      r = this.isub(num);
      this.negative ^= 1;
      return this._normSign();

    // positive + negative
    } else if (this.negative === 0 && num.negative !== 0) {
      num.negative = 0;
      r = this.isub(num);
      num.negative = 1;
      return r._normSign();
    }

    // a.length > b.length
    var a, b;
    if (this.length > num.length) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) + (b.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      this.words[i] = r & 0x3ffffff;
      carry = r >>> 26;
    }

    this.length = a.length;
    if (carry !== 0) {
      this.words[this.length] = carry;
      this.length++;
    // Copy the rest of the words
    } else if (a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    return this;
  };

  // Add `num` to `this`
  BN.prototype.add = function add (num) {
    var res;
    if (num.negative !== 0 && this.negative === 0) {
      num.negative = 0;
      res = this.sub(num);
      num.negative ^= 1;
      return res;
    } else if (num.negative === 0 && this.negative !== 0) {
      this.negative = 0;
      res = num.sub(this);
      this.negative = 1;
      return res;
    }

    if (this.length > num.length) return this.clone().iadd(num);

    return num.clone().iadd(this);
  };

  // Subtract `num` from `this` in-place
  BN.prototype.isub = function isub (num) {
    // this - (-num) = this + num
    if (num.negative !== 0) {
      num.negative = 0;
      var r = this.iadd(num);
      num.negative = 1;
      return r._normSign();

    // -this - num = -(this + num)
    } else if (this.negative !== 0) {
      this.negative = 0;
      this.iadd(num);
      this.negative = 1;
      return this._normSign();
    }

    // At this point both numbers are positive
    var cmp = this.cmp(num);

    // Optimization - zeroify
    if (cmp === 0) {
      this.negative = 0;
      this.length = 1;
      this.words[0] = 0;
      return this;
    }

    // a > b
    var a, b;
    if (cmp > 0) {
      a = this;
      b = num;
    } else {
      a = num;
      b = this;
    }

    var carry = 0;
    for (var i = 0; i < b.length; i++) {
      r = (a.words[i] | 0) - (b.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }
    for (; carry !== 0 && i < a.length; i++) {
      r = (a.words[i] | 0) + carry;
      carry = r >> 26;
      this.words[i] = r & 0x3ffffff;
    }

    // Copy rest of the words
    if (carry === 0 && i < a.length && a !== this) {
      for (; i < a.length; i++) {
        this.words[i] = a.words[i];
      }
    }

    this.length = Math.max(this.length, i);

    if (a !== this) {
      this.negative = 1;
    }

    return this.strip();
  };

  // Subtract `num` from `this`
  BN.prototype.sub = function sub (num) {
    return this.clone().isub(num);
  };

  function smallMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    var len = (self.length + num.length) | 0;
    out.length = len;
    len = (len - 1) | 0;

    // Peel one iteration (compiler can't do it, because of code complexity)
    var a = self.words[0] | 0;
    var b = num.words[0] | 0;
    var r = a * b;

    var lo = r & 0x3ffffff;
    var carry = (r / 0x4000000) | 0;
    out.words[0] = lo;

    for (var k = 1; k < len; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = carry >>> 26;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);
      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = (k - j) | 0;
        a = self.words[i] | 0;
        b = num.words[j] | 0;
        r = a * b + rword;
        ncarry += (r / 0x4000000) | 0;
        rword = r & 0x3ffffff;
      }
      out.words[k] = rword | 0;
      carry = ncarry | 0;
    }
    if (carry !== 0) {
      out.words[k] = carry | 0;
    } else {
      out.length--;
    }

    return out.strip();
  }

  // TODO(indutny): it may be reasonable to omit it for users who don't need
  // to work with 256-bit numbers, otherwise it gives 20% improvement for 256-bit
  // multiplication (like elliptic secp256k1).
  var comb10MulTo = function comb10MulTo (self, num, out) {
    var a = self.words;
    var b = num.words;
    var o = out.words;
    var c = 0;
    var lo;
    var mid;
    var hi;
    var a0 = a[0] | 0;
    var al0 = a0 & 0x1fff;
    var ah0 = a0 >>> 13;
    var a1 = a[1] | 0;
    var al1 = a1 & 0x1fff;
    var ah1 = a1 >>> 13;
    var a2 = a[2] | 0;
    var al2 = a2 & 0x1fff;
    var ah2 = a2 >>> 13;
    var a3 = a[3] | 0;
    var al3 = a3 & 0x1fff;
    var ah3 = a3 >>> 13;
    var a4 = a[4] | 0;
    var al4 = a4 & 0x1fff;
    var ah4 = a4 >>> 13;
    var a5 = a[5] | 0;
    var al5 = a5 & 0x1fff;
    var ah5 = a5 >>> 13;
    var a6 = a[6] | 0;
    var al6 = a6 & 0x1fff;
    var ah6 = a6 >>> 13;
    var a7 = a[7] | 0;
    var al7 = a7 & 0x1fff;
    var ah7 = a7 >>> 13;
    var a8 = a[8] | 0;
    var al8 = a8 & 0x1fff;
    var ah8 = a8 >>> 13;
    var a9 = a[9] | 0;
    var al9 = a9 & 0x1fff;
    var ah9 = a9 >>> 13;
    var b0 = b[0] | 0;
    var bl0 = b0 & 0x1fff;
    var bh0 = b0 >>> 13;
    var b1 = b[1] | 0;
    var bl1 = b1 & 0x1fff;
    var bh1 = b1 >>> 13;
    var b2 = b[2] | 0;
    var bl2 = b2 & 0x1fff;
    var bh2 = b2 >>> 13;
    var b3 = b[3] | 0;
    var bl3 = b3 & 0x1fff;
    var bh3 = b3 >>> 13;
    var b4 = b[4] | 0;
    var bl4 = b4 & 0x1fff;
    var bh4 = b4 >>> 13;
    var b5 = b[5] | 0;
    var bl5 = b5 & 0x1fff;
    var bh5 = b5 >>> 13;
    var b6 = b[6] | 0;
    var bl6 = b6 & 0x1fff;
    var bh6 = b6 >>> 13;
    var b7 = b[7] | 0;
    var bl7 = b7 & 0x1fff;
    var bh7 = b7 >>> 13;
    var b8 = b[8] | 0;
    var bl8 = b8 & 0x1fff;
    var bh8 = b8 >>> 13;
    var b9 = b[9] | 0;
    var bl9 = b9 & 0x1fff;
    var bh9 = b9 >>> 13;

    out.negative = self.negative ^ num.negative;
    out.length = 19;
    /* k = 0 */
    lo = Math.imul(al0, bl0);
    mid = Math.imul(al0, bh0);
    mid = (mid + Math.imul(ah0, bl0)) | 0;
    hi = Math.imul(ah0, bh0);
    var w0 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w0 >>> 26)) | 0;
    w0 &= 0x3ffffff;
    /* k = 1 */
    lo = Math.imul(al1, bl0);
    mid = Math.imul(al1, bh0);
    mid = (mid + Math.imul(ah1, bl0)) | 0;
    hi = Math.imul(ah1, bh0);
    lo = (lo + Math.imul(al0, bl1)) | 0;
    mid = (mid + Math.imul(al0, bh1)) | 0;
    mid = (mid + Math.imul(ah0, bl1)) | 0;
    hi = (hi + Math.imul(ah0, bh1)) | 0;
    var w1 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w1 >>> 26)) | 0;
    w1 &= 0x3ffffff;
    /* k = 2 */
    lo = Math.imul(al2, bl0);
    mid = Math.imul(al2, bh0);
    mid = (mid + Math.imul(ah2, bl0)) | 0;
    hi = Math.imul(ah2, bh0);
    lo = (lo + Math.imul(al1, bl1)) | 0;
    mid = (mid + Math.imul(al1, bh1)) | 0;
    mid = (mid + Math.imul(ah1, bl1)) | 0;
    hi = (hi + Math.imul(ah1, bh1)) | 0;
    lo = (lo + Math.imul(al0, bl2)) | 0;
    mid = (mid + Math.imul(al0, bh2)) | 0;
    mid = (mid + Math.imul(ah0, bl2)) | 0;
    hi = (hi + Math.imul(ah0, bh2)) | 0;
    var w2 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w2 >>> 26)) | 0;
    w2 &= 0x3ffffff;
    /* k = 3 */
    lo = Math.imul(al3, bl0);
    mid = Math.imul(al3, bh0);
    mid = (mid + Math.imul(ah3, bl0)) | 0;
    hi = Math.imul(ah3, bh0);
    lo = (lo + Math.imul(al2, bl1)) | 0;
    mid = (mid + Math.imul(al2, bh1)) | 0;
    mid = (mid + Math.imul(ah2, bl1)) | 0;
    hi = (hi + Math.imul(ah2, bh1)) | 0;
    lo = (lo + Math.imul(al1, bl2)) | 0;
    mid = (mid + Math.imul(al1, bh2)) | 0;
    mid = (mid + Math.imul(ah1, bl2)) | 0;
    hi = (hi + Math.imul(ah1, bh2)) | 0;
    lo = (lo + Math.imul(al0, bl3)) | 0;
    mid = (mid + Math.imul(al0, bh3)) | 0;
    mid = (mid + Math.imul(ah0, bl3)) | 0;
    hi = (hi + Math.imul(ah0, bh3)) | 0;
    var w3 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w3 >>> 26)) | 0;
    w3 &= 0x3ffffff;
    /* k = 4 */
    lo = Math.imul(al4, bl0);
    mid = Math.imul(al4, bh0);
    mid = (mid + Math.imul(ah4, bl0)) | 0;
    hi = Math.imul(ah4, bh0);
    lo = (lo + Math.imul(al3, bl1)) | 0;
    mid = (mid + Math.imul(al3, bh1)) | 0;
    mid = (mid + Math.imul(ah3, bl1)) | 0;
    hi = (hi + Math.imul(ah3, bh1)) | 0;
    lo = (lo + Math.imul(al2, bl2)) | 0;
    mid = (mid + Math.imul(al2, bh2)) | 0;
    mid = (mid + Math.imul(ah2, bl2)) | 0;
    hi = (hi + Math.imul(ah2, bh2)) | 0;
    lo = (lo + Math.imul(al1, bl3)) | 0;
    mid = (mid + Math.imul(al1, bh3)) | 0;
    mid = (mid + Math.imul(ah1, bl3)) | 0;
    hi = (hi + Math.imul(ah1, bh3)) | 0;
    lo = (lo + Math.imul(al0, bl4)) | 0;
    mid = (mid + Math.imul(al0, bh4)) | 0;
    mid = (mid + Math.imul(ah0, bl4)) | 0;
    hi = (hi + Math.imul(ah0, bh4)) | 0;
    var w4 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w4 >>> 26)) | 0;
    w4 &= 0x3ffffff;
    /* k = 5 */
    lo = Math.imul(al5, bl0);
    mid = Math.imul(al5, bh0);
    mid = (mid + Math.imul(ah5, bl0)) | 0;
    hi = Math.imul(ah5, bh0);
    lo = (lo + Math.imul(al4, bl1)) | 0;
    mid = (mid + Math.imul(al4, bh1)) | 0;
    mid = (mid + Math.imul(ah4, bl1)) | 0;
    hi = (hi + Math.imul(ah4, bh1)) | 0;
    lo = (lo + Math.imul(al3, bl2)) | 0;
    mid = (mid + Math.imul(al3, bh2)) | 0;
    mid = (mid + Math.imul(ah3, bl2)) | 0;
    hi = (hi + Math.imul(ah3, bh2)) | 0;
    lo = (lo + Math.imul(al2, bl3)) | 0;
    mid = (mid + Math.imul(al2, bh3)) | 0;
    mid = (mid + Math.imul(ah2, bl3)) | 0;
    hi = (hi + Math.imul(ah2, bh3)) | 0;
    lo = (lo + Math.imul(al1, bl4)) | 0;
    mid = (mid + Math.imul(al1, bh4)) | 0;
    mid = (mid + Math.imul(ah1, bl4)) | 0;
    hi = (hi + Math.imul(ah1, bh4)) | 0;
    lo = (lo + Math.imul(al0, bl5)) | 0;
    mid = (mid + Math.imul(al0, bh5)) | 0;
    mid = (mid + Math.imul(ah0, bl5)) | 0;
    hi = (hi + Math.imul(ah0, bh5)) | 0;
    var w5 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w5 >>> 26)) | 0;
    w5 &= 0x3ffffff;
    /* k = 6 */
    lo = Math.imul(al6, bl0);
    mid = Math.imul(al6, bh0);
    mid = (mid + Math.imul(ah6, bl0)) | 0;
    hi = Math.imul(ah6, bh0);
    lo = (lo + Math.imul(al5, bl1)) | 0;
    mid = (mid + Math.imul(al5, bh1)) | 0;
    mid = (mid + Math.imul(ah5, bl1)) | 0;
    hi = (hi + Math.imul(ah5, bh1)) | 0;
    lo = (lo + Math.imul(al4, bl2)) | 0;
    mid = (mid + Math.imul(al4, bh2)) | 0;
    mid = (mid + Math.imul(ah4, bl2)) | 0;
    hi = (hi + Math.imul(ah4, bh2)) | 0;
    lo = (lo + Math.imul(al3, bl3)) | 0;
    mid = (mid + Math.imul(al3, bh3)) | 0;
    mid = (mid + Math.imul(ah3, bl3)) | 0;
    hi = (hi + Math.imul(ah3, bh3)) | 0;
    lo = (lo + Math.imul(al2, bl4)) | 0;
    mid = (mid + Math.imul(al2, bh4)) | 0;
    mid = (mid + Math.imul(ah2, bl4)) | 0;
    hi = (hi + Math.imul(ah2, bh4)) | 0;
    lo = (lo + Math.imul(al1, bl5)) | 0;
    mid = (mid + Math.imul(al1, bh5)) | 0;
    mid = (mid + Math.imul(ah1, bl5)) | 0;
    hi = (hi + Math.imul(ah1, bh5)) | 0;
    lo = (lo + Math.imul(al0, bl6)) | 0;
    mid = (mid + Math.imul(al0, bh6)) | 0;
    mid = (mid + Math.imul(ah0, bl6)) | 0;
    hi = (hi + Math.imul(ah0, bh6)) | 0;
    var w6 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w6 >>> 26)) | 0;
    w6 &= 0x3ffffff;
    /* k = 7 */
    lo = Math.imul(al7, bl0);
    mid = Math.imul(al7, bh0);
    mid = (mid + Math.imul(ah7, bl0)) | 0;
    hi = Math.imul(ah7, bh0);
    lo = (lo + Math.imul(al6, bl1)) | 0;
    mid = (mid + Math.imul(al6, bh1)) | 0;
    mid = (mid + Math.imul(ah6, bl1)) | 0;
    hi = (hi + Math.imul(ah6, bh1)) | 0;
    lo = (lo + Math.imul(al5, bl2)) | 0;
    mid = (mid + Math.imul(al5, bh2)) | 0;
    mid = (mid + Math.imul(ah5, bl2)) | 0;
    hi = (hi + Math.imul(ah5, bh2)) | 0;
    lo = (lo + Math.imul(al4, bl3)) | 0;
    mid = (mid + Math.imul(al4, bh3)) | 0;
    mid = (mid + Math.imul(ah4, bl3)) | 0;
    hi = (hi + Math.imul(ah4, bh3)) | 0;
    lo = (lo + Math.imul(al3, bl4)) | 0;
    mid = (mid + Math.imul(al3, bh4)) | 0;
    mid = (mid + Math.imul(ah3, bl4)) | 0;
    hi = (hi + Math.imul(ah3, bh4)) | 0;
    lo = (lo + Math.imul(al2, bl5)) | 0;
    mid = (mid + Math.imul(al2, bh5)) | 0;
    mid = (mid + Math.imul(ah2, bl5)) | 0;
    hi = (hi + Math.imul(ah2, bh5)) | 0;
    lo = (lo + Math.imul(al1, bl6)) | 0;
    mid = (mid + Math.imul(al1, bh6)) | 0;
    mid = (mid + Math.imul(ah1, bl6)) | 0;
    hi = (hi + Math.imul(ah1, bh6)) | 0;
    lo = (lo + Math.imul(al0, bl7)) | 0;
    mid = (mid + Math.imul(al0, bh7)) | 0;
    mid = (mid + Math.imul(ah0, bl7)) | 0;
    hi = (hi + Math.imul(ah0, bh7)) | 0;
    var w7 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w7 >>> 26)) | 0;
    w7 &= 0x3ffffff;
    /* k = 8 */
    lo = Math.imul(al8, bl0);
    mid = Math.imul(al8, bh0);
    mid = (mid + Math.imul(ah8, bl0)) | 0;
    hi = Math.imul(ah8, bh0);
    lo = (lo + Math.imul(al7, bl1)) | 0;
    mid = (mid + Math.imul(al7, bh1)) | 0;
    mid = (mid + Math.imul(ah7, bl1)) | 0;
    hi = (hi + Math.imul(ah7, bh1)) | 0;
    lo = (lo + Math.imul(al6, bl2)) | 0;
    mid = (mid + Math.imul(al6, bh2)) | 0;
    mid = (mid + Math.imul(ah6, bl2)) | 0;
    hi = (hi + Math.imul(ah6, bh2)) | 0;
    lo = (lo + Math.imul(al5, bl3)) | 0;
    mid = (mid + Math.imul(al5, bh3)) | 0;
    mid = (mid + Math.imul(ah5, bl3)) | 0;
    hi = (hi + Math.imul(ah5, bh3)) | 0;
    lo = (lo + Math.imul(al4, bl4)) | 0;
    mid = (mid + Math.imul(al4, bh4)) | 0;
    mid = (mid + Math.imul(ah4, bl4)) | 0;
    hi = (hi + Math.imul(ah4, bh4)) | 0;
    lo = (lo + Math.imul(al3, bl5)) | 0;
    mid = (mid + Math.imul(al3, bh5)) | 0;
    mid = (mid + Math.imul(ah3, bl5)) | 0;
    hi = (hi + Math.imul(ah3, bh5)) | 0;
    lo = (lo + Math.imul(al2, bl6)) | 0;
    mid = (mid + Math.imul(al2, bh6)) | 0;
    mid = (mid + Math.imul(ah2, bl6)) | 0;
    hi = (hi + Math.imul(ah2, bh6)) | 0;
    lo = (lo + Math.imul(al1, bl7)) | 0;
    mid = (mid + Math.imul(al1, bh7)) | 0;
    mid = (mid + Math.imul(ah1, bl7)) | 0;
    hi = (hi + Math.imul(ah1, bh7)) | 0;
    lo = (lo + Math.imul(al0, bl8)) | 0;
    mid = (mid + Math.imul(al0, bh8)) | 0;
    mid = (mid + Math.imul(ah0, bl8)) | 0;
    hi = (hi + Math.imul(ah0, bh8)) | 0;
    var w8 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w8 >>> 26)) | 0;
    w8 &= 0x3ffffff;
    /* k = 9 */
    lo = Math.imul(al9, bl0);
    mid = Math.imul(al9, bh0);
    mid = (mid + Math.imul(ah9, bl0)) | 0;
    hi = Math.imul(ah9, bh0);
    lo = (lo + Math.imul(al8, bl1)) | 0;
    mid = (mid + Math.imul(al8, bh1)) | 0;
    mid = (mid + Math.imul(ah8, bl1)) | 0;
    hi = (hi + Math.imul(ah8, bh1)) | 0;
    lo = (lo + Math.imul(al7, bl2)) | 0;
    mid = (mid + Math.imul(al7, bh2)) | 0;
    mid = (mid + Math.imul(ah7, bl2)) | 0;
    hi = (hi + Math.imul(ah7, bh2)) | 0;
    lo = (lo + Math.imul(al6, bl3)) | 0;
    mid = (mid + Math.imul(al6, bh3)) | 0;
    mid = (mid + Math.imul(ah6, bl3)) | 0;
    hi = (hi + Math.imul(ah6, bh3)) | 0;
    lo = (lo + Math.imul(al5, bl4)) | 0;
    mid = (mid + Math.imul(al5, bh4)) | 0;
    mid = (mid + Math.imul(ah5, bl4)) | 0;
    hi = (hi + Math.imul(ah5, bh4)) | 0;
    lo = (lo + Math.imul(al4, bl5)) | 0;
    mid = (mid + Math.imul(al4, bh5)) | 0;
    mid = (mid + Math.imul(ah4, bl5)) | 0;
    hi = (hi + Math.imul(ah4, bh5)) | 0;
    lo = (lo + Math.imul(al3, bl6)) | 0;
    mid = (mid + Math.imul(al3, bh6)) | 0;
    mid = (mid + Math.imul(ah3, bl6)) | 0;
    hi = (hi + Math.imul(ah3, bh6)) | 0;
    lo = (lo + Math.imul(al2, bl7)) | 0;
    mid = (mid + Math.imul(al2, bh7)) | 0;
    mid = (mid + Math.imul(ah2, bl7)) | 0;
    hi = (hi + Math.imul(ah2, bh7)) | 0;
    lo = (lo + Math.imul(al1, bl8)) | 0;
    mid = (mid + Math.imul(al1, bh8)) | 0;
    mid = (mid + Math.imul(ah1, bl8)) | 0;
    hi = (hi + Math.imul(ah1, bh8)) | 0;
    lo = (lo + Math.imul(al0, bl9)) | 0;
    mid = (mid + Math.imul(al0, bh9)) | 0;
    mid = (mid + Math.imul(ah0, bl9)) | 0;
    hi = (hi + Math.imul(ah0, bh9)) | 0;
    var w9 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w9 >>> 26)) | 0;
    w9 &= 0x3ffffff;
    /* k = 10 */
    lo = Math.imul(al9, bl1);
    mid = Math.imul(al9, bh1);
    mid = (mid + Math.imul(ah9, bl1)) | 0;
    hi = Math.imul(ah9, bh1);
    lo = (lo + Math.imul(al8, bl2)) | 0;
    mid = (mid + Math.imul(al8, bh2)) | 0;
    mid = (mid + Math.imul(ah8, bl2)) | 0;
    hi = (hi + Math.imul(ah8, bh2)) | 0;
    lo = (lo + Math.imul(al7, bl3)) | 0;
    mid = (mid + Math.imul(al7, bh3)) | 0;
    mid = (mid + Math.imul(ah7, bl3)) | 0;
    hi = (hi + Math.imul(ah7, bh3)) | 0;
    lo = (lo + Math.imul(al6, bl4)) | 0;
    mid = (mid + Math.imul(al6, bh4)) | 0;
    mid = (mid + Math.imul(ah6, bl4)) | 0;
    hi = (hi + Math.imul(ah6, bh4)) | 0;
    lo = (lo + Math.imul(al5, bl5)) | 0;
    mid = (mid + Math.imul(al5, bh5)) | 0;
    mid = (mid + Math.imul(ah5, bl5)) | 0;
    hi = (hi + Math.imul(ah5, bh5)) | 0;
    lo = (lo + Math.imul(al4, bl6)) | 0;
    mid = (mid + Math.imul(al4, bh6)) | 0;
    mid = (mid + Math.imul(ah4, bl6)) | 0;
    hi = (hi + Math.imul(ah4, bh6)) | 0;
    lo = (lo + Math.imul(al3, bl7)) | 0;
    mid = (mid + Math.imul(al3, bh7)) | 0;
    mid = (mid + Math.imul(ah3, bl7)) | 0;
    hi = (hi + Math.imul(ah3, bh7)) | 0;
    lo = (lo + Math.imul(al2, bl8)) | 0;
    mid = (mid + Math.imul(al2, bh8)) | 0;
    mid = (mid + Math.imul(ah2, bl8)) | 0;
    hi = (hi + Math.imul(ah2, bh8)) | 0;
    lo = (lo + Math.imul(al1, bl9)) | 0;
    mid = (mid + Math.imul(al1, bh9)) | 0;
    mid = (mid + Math.imul(ah1, bl9)) | 0;
    hi = (hi + Math.imul(ah1, bh9)) | 0;
    var w10 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w10 >>> 26)) | 0;
    w10 &= 0x3ffffff;
    /* k = 11 */
    lo = Math.imul(al9, bl2);
    mid = Math.imul(al9, bh2);
    mid = (mid + Math.imul(ah9, bl2)) | 0;
    hi = Math.imul(ah9, bh2);
    lo = (lo + Math.imul(al8, bl3)) | 0;
    mid = (mid + Math.imul(al8, bh3)) | 0;
    mid = (mid + Math.imul(ah8, bl3)) | 0;
    hi = (hi + Math.imul(ah8, bh3)) | 0;
    lo = (lo + Math.imul(al7, bl4)) | 0;
    mid = (mid + Math.imul(al7, bh4)) | 0;
    mid = (mid + Math.imul(ah7, bl4)) | 0;
    hi = (hi + Math.imul(ah7, bh4)) | 0;
    lo = (lo + Math.imul(al6, bl5)) | 0;
    mid = (mid + Math.imul(al6, bh5)) | 0;
    mid = (mid + Math.imul(ah6, bl5)) | 0;
    hi = (hi + Math.imul(ah6, bh5)) | 0;
    lo = (lo + Math.imul(al5, bl6)) | 0;
    mid = (mid + Math.imul(al5, bh6)) | 0;
    mid = (mid + Math.imul(ah5, bl6)) | 0;
    hi = (hi + Math.imul(ah5, bh6)) | 0;
    lo = (lo + Math.imul(al4, bl7)) | 0;
    mid = (mid + Math.imul(al4, bh7)) | 0;
    mid = (mid + Math.imul(ah4, bl7)) | 0;
    hi = (hi + Math.imul(ah4, bh7)) | 0;
    lo = (lo + Math.imul(al3, bl8)) | 0;
    mid = (mid + Math.imul(al3, bh8)) | 0;
    mid = (mid + Math.imul(ah3, bl8)) | 0;
    hi = (hi + Math.imul(ah3, bh8)) | 0;
    lo = (lo + Math.imul(al2, bl9)) | 0;
    mid = (mid + Math.imul(al2, bh9)) | 0;
    mid = (mid + Math.imul(ah2, bl9)) | 0;
    hi = (hi + Math.imul(ah2, bh9)) | 0;
    var w11 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w11 >>> 26)) | 0;
    w11 &= 0x3ffffff;
    /* k = 12 */
    lo = Math.imul(al9, bl3);
    mid = Math.imul(al9, bh3);
    mid = (mid + Math.imul(ah9, bl3)) | 0;
    hi = Math.imul(ah9, bh3);
    lo = (lo + Math.imul(al8, bl4)) | 0;
    mid = (mid + Math.imul(al8, bh4)) | 0;
    mid = (mid + Math.imul(ah8, bl4)) | 0;
    hi = (hi + Math.imul(ah8, bh4)) | 0;
    lo = (lo + Math.imul(al7, bl5)) | 0;
    mid = (mid + Math.imul(al7, bh5)) | 0;
    mid = (mid + Math.imul(ah7, bl5)) | 0;
    hi = (hi + Math.imul(ah7, bh5)) | 0;
    lo = (lo + Math.imul(al6, bl6)) | 0;
    mid = (mid + Math.imul(al6, bh6)) | 0;
    mid = (mid + Math.imul(ah6, bl6)) | 0;
    hi = (hi + Math.imul(ah6, bh6)) | 0;
    lo = (lo + Math.imul(al5, bl7)) | 0;
    mid = (mid + Math.imul(al5, bh7)) | 0;
    mid = (mid + Math.imul(ah5, bl7)) | 0;
    hi = (hi + Math.imul(ah5, bh7)) | 0;
    lo = (lo + Math.imul(al4, bl8)) | 0;
    mid = (mid + Math.imul(al4, bh8)) | 0;
    mid = (mid + Math.imul(ah4, bl8)) | 0;
    hi = (hi + Math.imul(ah4, bh8)) | 0;
    lo = (lo + Math.imul(al3, bl9)) | 0;
    mid = (mid + Math.imul(al3, bh9)) | 0;
    mid = (mid + Math.imul(ah3, bl9)) | 0;
    hi = (hi + Math.imul(ah3, bh9)) | 0;
    var w12 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w12 >>> 26)) | 0;
    w12 &= 0x3ffffff;
    /* k = 13 */
    lo = Math.imul(al9, bl4);
    mid = Math.imul(al9, bh4);
    mid = (mid + Math.imul(ah9, bl4)) | 0;
    hi = Math.imul(ah9, bh4);
    lo = (lo + Math.imul(al8, bl5)) | 0;
    mid = (mid + Math.imul(al8, bh5)) | 0;
    mid = (mid + Math.imul(ah8, bl5)) | 0;
    hi = (hi + Math.imul(ah8, bh5)) | 0;
    lo = (lo + Math.imul(al7, bl6)) | 0;
    mid = (mid + Math.imul(al7, bh6)) | 0;
    mid = (mid + Math.imul(ah7, bl6)) | 0;
    hi = (hi + Math.imul(ah7, bh6)) | 0;
    lo = (lo + Math.imul(al6, bl7)) | 0;
    mid = (mid + Math.imul(al6, bh7)) | 0;
    mid = (mid + Math.imul(ah6, bl7)) | 0;
    hi = (hi + Math.imul(ah6, bh7)) | 0;
    lo = (lo + Math.imul(al5, bl8)) | 0;
    mid = (mid + Math.imul(al5, bh8)) | 0;
    mid = (mid + Math.imul(ah5, bl8)) | 0;
    hi = (hi + Math.imul(ah5, bh8)) | 0;
    lo = (lo + Math.imul(al4, bl9)) | 0;
    mid = (mid + Math.imul(al4, bh9)) | 0;
    mid = (mid + Math.imul(ah4, bl9)) | 0;
    hi = (hi + Math.imul(ah4, bh9)) | 0;
    var w13 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w13 >>> 26)) | 0;
    w13 &= 0x3ffffff;
    /* k = 14 */
    lo = Math.imul(al9, bl5);
    mid = Math.imul(al9, bh5);
    mid = (mid + Math.imul(ah9, bl5)) | 0;
    hi = Math.imul(ah9, bh5);
    lo = (lo + Math.imul(al8, bl6)) | 0;
    mid = (mid + Math.imul(al8, bh6)) | 0;
    mid = (mid + Math.imul(ah8, bl6)) | 0;
    hi = (hi + Math.imul(ah8, bh6)) | 0;
    lo = (lo + Math.imul(al7, bl7)) | 0;
    mid = (mid + Math.imul(al7, bh7)) | 0;
    mid = (mid + Math.imul(ah7, bl7)) | 0;
    hi = (hi + Math.imul(ah7, bh7)) | 0;
    lo = (lo + Math.imul(al6, bl8)) | 0;
    mid = (mid + Math.imul(al6, bh8)) | 0;
    mid = (mid + Math.imul(ah6, bl8)) | 0;
    hi = (hi + Math.imul(ah6, bh8)) | 0;
    lo = (lo + Math.imul(al5, bl9)) | 0;
    mid = (mid + Math.imul(al5, bh9)) | 0;
    mid = (mid + Math.imul(ah5, bl9)) | 0;
    hi = (hi + Math.imul(ah5, bh9)) | 0;
    var w14 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w14 >>> 26)) | 0;
    w14 &= 0x3ffffff;
    /* k = 15 */
    lo = Math.imul(al9, bl6);
    mid = Math.imul(al9, bh6);
    mid = (mid + Math.imul(ah9, bl6)) | 0;
    hi = Math.imul(ah9, bh6);
    lo = (lo + Math.imul(al8, bl7)) | 0;
    mid = (mid + Math.imul(al8, bh7)) | 0;
    mid = (mid + Math.imul(ah8, bl7)) | 0;
    hi = (hi + Math.imul(ah8, bh7)) | 0;
    lo = (lo + Math.imul(al7, bl8)) | 0;
    mid = (mid + Math.imul(al7, bh8)) | 0;
    mid = (mid + Math.imul(ah7, bl8)) | 0;
    hi = (hi + Math.imul(ah7, bh8)) | 0;
    lo = (lo + Math.imul(al6, bl9)) | 0;
    mid = (mid + Math.imul(al6, bh9)) | 0;
    mid = (mid + Math.imul(ah6, bl9)) | 0;
    hi = (hi + Math.imul(ah6, bh9)) | 0;
    var w15 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w15 >>> 26)) | 0;
    w15 &= 0x3ffffff;
    /* k = 16 */
    lo = Math.imul(al9, bl7);
    mid = Math.imul(al9, bh7);
    mid = (mid + Math.imul(ah9, bl7)) | 0;
    hi = Math.imul(ah9, bh7);
    lo = (lo + Math.imul(al8, bl8)) | 0;
    mid = (mid + Math.imul(al8, bh8)) | 0;
    mid = (mid + Math.imul(ah8, bl8)) | 0;
    hi = (hi + Math.imul(ah8, bh8)) | 0;
    lo = (lo + Math.imul(al7, bl9)) | 0;
    mid = (mid + Math.imul(al7, bh9)) | 0;
    mid = (mid + Math.imul(ah7, bl9)) | 0;
    hi = (hi + Math.imul(ah7, bh9)) | 0;
    var w16 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w16 >>> 26)) | 0;
    w16 &= 0x3ffffff;
    /* k = 17 */
    lo = Math.imul(al9, bl8);
    mid = Math.imul(al9, bh8);
    mid = (mid + Math.imul(ah9, bl8)) | 0;
    hi = Math.imul(ah9, bh8);
    lo = (lo + Math.imul(al8, bl9)) | 0;
    mid = (mid + Math.imul(al8, bh9)) | 0;
    mid = (mid + Math.imul(ah8, bl9)) | 0;
    hi = (hi + Math.imul(ah8, bh9)) | 0;
    var w17 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w17 >>> 26)) | 0;
    w17 &= 0x3ffffff;
    /* k = 18 */
    lo = Math.imul(al9, bl9);
    mid = Math.imul(al9, bh9);
    mid = (mid + Math.imul(ah9, bl9)) | 0;
    hi = Math.imul(ah9, bh9);
    var w18 = (((c + lo) | 0) + ((mid & 0x1fff) << 13)) | 0;
    c = (((hi + (mid >>> 13)) | 0) + (w18 >>> 26)) | 0;
    w18 &= 0x3ffffff;
    o[0] = w0;
    o[1] = w1;
    o[2] = w2;
    o[3] = w3;
    o[4] = w4;
    o[5] = w5;
    o[6] = w6;
    o[7] = w7;
    o[8] = w8;
    o[9] = w9;
    o[10] = w10;
    o[11] = w11;
    o[12] = w12;
    o[13] = w13;
    o[14] = w14;
    o[15] = w15;
    o[16] = w16;
    o[17] = w17;
    o[18] = w18;
    if (c !== 0) {
      o[19] = c;
      out.length++;
    }
    return out;
  };

  // Polyfill comb
  if (!Math.imul) {
    comb10MulTo = smallMulTo;
  }

  function bigMulTo (self, num, out) {
    out.negative = num.negative ^ self.negative;
    out.length = self.length + num.length;

    var carry = 0;
    var hncarry = 0;
    for (var k = 0; k < out.length - 1; k++) {
      // Sum all words with the same `i + j = k` and accumulate `ncarry`,
      // note that ncarry could be >= 0x3ffffff
      var ncarry = hncarry;
      hncarry = 0;
      var rword = carry & 0x3ffffff;
      var maxJ = Math.min(k, num.length - 1);
      for (var j = Math.max(0, k - self.length + 1); j <= maxJ; j++) {
        var i = k - j;
        var a = self.words[i] | 0;
        var b = num.words[j] | 0;
        var r = a * b;

        var lo = r & 0x3ffffff;
        ncarry = (ncarry + ((r / 0x4000000) | 0)) | 0;
        lo = (lo + rword) | 0;
        rword = lo & 0x3ffffff;
        ncarry = (ncarry + (lo >>> 26)) | 0;

        hncarry += ncarry >>> 26;
        ncarry &= 0x3ffffff;
      }
      out.words[k] = rword;
      carry = ncarry;
      ncarry = hncarry;
    }
    if (carry !== 0) {
      out.words[k] = carry;
    } else {
      out.length--;
    }

    return out.strip();
  }

  function jumboMulTo (self, num, out) {
    var fftm = new FFTM();
    return fftm.mulp(self, num, out);
  }

  BN.prototype.mulTo = function mulTo (num, out) {
    var res;
    var len = this.length + num.length;
    if (this.length === 10 && num.length === 10) {
      res = comb10MulTo(this, num, out);
    } else if (len < 63) {
      res = smallMulTo(this, num, out);
    } else if (len < 1024) {
      res = bigMulTo(this, num, out);
    } else {
      res = jumboMulTo(this, num, out);
    }

    return res;
  };

  // Cooley-Tukey algorithm for FFT
  // slightly revisited to rely on looping instead of recursion

  function FFTM (x, y) {
    this.x = x;
    this.y = y;
  }

  FFTM.prototype.makeRBT = function makeRBT (N) {
    var t = new Array(N);
    var l = BN.prototype._countBits(N) - 1;
    for (var i = 0; i < N; i++) {
      t[i] = this.revBin(i, l, N);
    }

    return t;
  };

  // Returns binary-reversed representation of `x`
  FFTM.prototype.revBin = function revBin (x, l, N) {
    if (x === 0 || x === N - 1) return x;

    var rb = 0;
    for (var i = 0; i < l; i++) {
      rb |= (x & 1) << (l - i - 1);
      x >>= 1;
    }

    return rb;
  };

  // Performs "tweedling" phase, therefore 'emulating'
  // behaviour of the recursive algorithm
  FFTM.prototype.permute = function permute (rbt, rws, iws, rtws, itws, N) {
    for (var i = 0; i < N; i++) {
      rtws[i] = rws[rbt[i]];
      itws[i] = iws[rbt[i]];
    }
  };

  FFTM.prototype.transform = function transform (rws, iws, rtws, itws, N, rbt) {
    this.permute(rbt, rws, iws, rtws, itws, N);

    for (var s = 1; s < N; s <<= 1) {
      var l = s << 1;

      var rtwdf = Math.cos(2 * Math.PI / l);
      var itwdf = Math.sin(2 * Math.PI / l);

      for (var p = 0; p < N; p += l) {
        var rtwdf_ = rtwdf;
        var itwdf_ = itwdf;

        for (var j = 0; j < s; j++) {
          var re = rtws[p + j];
          var ie = itws[p + j];

          var ro = rtws[p + j + s];
          var io = itws[p + j + s];

          var rx = rtwdf_ * ro - itwdf_ * io;

          io = rtwdf_ * io + itwdf_ * ro;
          ro = rx;

          rtws[p + j] = re + ro;
          itws[p + j] = ie + io;

          rtws[p + j + s] = re - ro;
          itws[p + j + s] = ie - io;

          /* jshint maxdepth : false */
          if (j !== l) {
            rx = rtwdf * rtwdf_ - itwdf * itwdf_;

            itwdf_ = rtwdf * itwdf_ + itwdf * rtwdf_;
            rtwdf_ = rx;
          }
        }
      }
    }
  };

  FFTM.prototype.guessLen13b = function guessLen13b (n, m) {
    var N = Math.max(m, n) | 1;
    var odd = N & 1;
    var i = 0;
    for (N = N / 2 | 0; N; N = N >>> 1) {
      i++;
    }

    return 1 << i + 1 + odd;
  };

  FFTM.prototype.conjugate = function conjugate (rws, iws, N) {
    if (N <= 1) return;

    for (var i = 0; i < N / 2; i++) {
      var t = rws[i];

      rws[i] = rws[N - i - 1];
      rws[N - i - 1] = t;

      t = iws[i];

      iws[i] = -iws[N - i - 1];
      iws[N - i - 1] = -t;
    }
  };

  FFTM.prototype.normalize13b = function normalize13b (ws, N) {
    var carry = 0;
    for (var i = 0; i < N / 2; i++) {
      var w = Math.round(ws[2 * i + 1] / N) * 0x2000 +
        Math.round(ws[2 * i] / N) +
        carry;

      ws[i] = w & 0x3ffffff;

      if (w < 0x4000000) {
        carry = 0;
      } else {
        carry = w / 0x4000000 | 0;
      }
    }

    return ws;
  };

  FFTM.prototype.convert13b = function convert13b (ws, len, rws, N) {
    var carry = 0;
    for (var i = 0; i < len; i++) {
      carry = carry + (ws[i] | 0);

      rws[2 * i] = carry & 0x1fff; carry = carry >>> 13;
      rws[2 * i + 1] = carry & 0x1fff; carry = carry >>> 13;
    }

    // Pad with zeroes
    for (i = 2 * len; i < N; ++i) {
      rws[i] = 0;
    }

    assert(carry === 0);
    assert((carry & ~0x1fff) === 0);
  };

  FFTM.prototype.stub = function stub (N) {
    var ph = new Array(N);
    for (var i = 0; i < N; i++) {
      ph[i] = 0;
    }

    return ph;
  };

  FFTM.prototype.mulp = function mulp (x, y, out) {
    var N = 2 * this.guessLen13b(x.length, y.length);

    var rbt = this.makeRBT(N);

    var _ = this.stub(N);

    var rws = new Array(N);
    var rwst = new Array(N);
    var iwst = new Array(N);

    var nrws = new Array(N);
    var nrwst = new Array(N);
    var niwst = new Array(N);

    var rmws = out.words;
    rmws.length = N;

    this.convert13b(x.words, x.length, rws, N);
    this.convert13b(y.words, y.length, nrws, N);

    this.transform(rws, _, rwst, iwst, N, rbt);
    this.transform(nrws, _, nrwst, niwst, N, rbt);

    for (var i = 0; i < N; i++) {
      var rx = rwst[i] * nrwst[i] - iwst[i] * niwst[i];
      iwst[i] = rwst[i] * niwst[i] + iwst[i] * nrwst[i];
      rwst[i] = rx;
    }

    this.conjugate(rwst, iwst, N);
    this.transform(rwst, iwst, rmws, _, N, rbt);
    this.conjugate(rmws, _, N);
    this.normalize13b(rmws, N);

    out.negative = x.negative ^ y.negative;
    out.length = x.length + y.length;
    return out.strip();
  };

  // Multiply `this` by `num`
  BN.prototype.mul = function mul (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return this.mulTo(num, out);
  };

  // Multiply employing FFT
  BN.prototype.mulf = function mulf (num) {
    var out = new BN(null);
    out.words = new Array(this.length + num.length);
    return jumboMulTo(this, num, out);
  };

  // In-place Multiplication
  BN.prototype.imul = function imul (num) {
    return this.clone().mulTo(num, this);
  };

  BN.prototype.imuln = function imuln (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);

    // Carry
    var carry = 0;
    for (var i = 0; i < this.length; i++) {
      var w = (this.words[i] | 0) * num;
      var lo = (w & 0x3ffffff) + (carry & 0x3ffffff);
      carry >>= 26;
      carry += (w / 0x4000000) | 0;
      // NOTE: lo is 27bit maximum
      carry += lo >>> 26;
      this.words[i] = lo & 0x3ffffff;
    }

    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }

    return this;
  };

  BN.prototype.muln = function muln (num) {
    return this.clone().imuln(num);
  };

  // `this` * `this`
  BN.prototype.sqr = function sqr () {
    return this.mul(this);
  };

  // `this` * `this` in-place
  BN.prototype.isqr = function isqr () {
    return this.imul(this.clone());
  };

  // Math.pow(`this`, `num`)
  BN.prototype.pow = function pow (num) {
    var w = toBitArray(num);
    if (w.length === 0) return new BN(1);

    // Skip leading zeroes
    var res = this;
    for (var i = 0; i < w.length; i++, res = res.sqr()) {
      if (w[i] !== 0) break;
    }

    if (++i < w.length) {
      for (var q = res.sqr(); i < w.length; i++, q = q.sqr()) {
        if (w[i] === 0) continue;

        res = res.mul(q);
      }
    }

    return res;
  };

  // Shift-left in-place
  BN.prototype.iushln = function iushln (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;
    var carryMask = (0x3ffffff >>> (26 - r)) << (26 - r);
    var i;

    if (r !== 0) {
      var carry = 0;

      for (i = 0; i < this.length; i++) {
        var newCarry = this.words[i] & carryMask;
        var c = ((this.words[i] | 0) - newCarry) << r;
        this.words[i] = c | carry;
        carry = newCarry >>> (26 - r);
      }

      if (carry) {
        this.words[i] = carry;
        this.length++;
      }
    }

    if (s !== 0) {
      for (i = this.length - 1; i >= 0; i--) {
        this.words[i + s] = this.words[i];
      }

      for (i = 0; i < s; i++) {
        this.words[i] = 0;
      }

      this.length += s;
    }

    return this.strip();
  };

  BN.prototype.ishln = function ishln (bits) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushln(bits);
  };

  // Shift-right in-place
  // NOTE: `hint` is a lowest bit before trailing zeroes
  // NOTE: if `extended` is present - it will be filled with destroyed bits
  BN.prototype.iushrn = function iushrn (bits, hint, extended) {
    assert(typeof bits === 'number' && bits >= 0);
    var h;
    if (hint) {
      h = (hint - (hint % 26)) / 26;
    } else {
      h = 0;
    }

    var r = bits % 26;
    var s = Math.min((bits - r) / 26, this.length);
    var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
    var maskedWords = extended;

    h -= s;
    h = Math.max(0, h);

    // Extended mode, copy masked part
    if (maskedWords) {
      for (var i = 0; i < s; i++) {
        maskedWords.words[i] = this.words[i];
      }
      maskedWords.length = s;
    }

    if (s === 0) ; else if (this.length > s) {
      this.length -= s;
      for (i = 0; i < this.length; i++) {
        this.words[i] = this.words[i + s];
      }
    } else {
      this.words[0] = 0;
      this.length = 1;
    }

    var carry = 0;
    for (i = this.length - 1; i >= 0 && (carry !== 0 || i >= h); i--) {
      var word = this.words[i] | 0;
      this.words[i] = (carry << (26 - r)) | (word >>> r);
      carry = word & mask;
    }

    // Push carried bits as a mask
    if (maskedWords && carry !== 0) {
      maskedWords.words[maskedWords.length++] = carry;
    }

    if (this.length === 0) {
      this.words[0] = 0;
      this.length = 1;
    }

    return this.strip();
  };

  BN.prototype.ishrn = function ishrn (bits, hint, extended) {
    // TODO(indutny): implement me
    assert(this.negative === 0);
    return this.iushrn(bits, hint, extended);
  };

  // Shift-left
  BN.prototype.shln = function shln (bits) {
    return this.clone().ishln(bits);
  };

  BN.prototype.ushln = function ushln (bits) {
    return this.clone().iushln(bits);
  };

  // Shift-right
  BN.prototype.shrn = function shrn (bits) {
    return this.clone().ishrn(bits);
  };

  BN.prototype.ushrn = function ushrn (bits) {
    return this.clone().iushrn(bits);
  };

  // Test if n bit is set
  BN.prototype.testn = function testn (bit) {
    assert(typeof bit === 'number' && bit >= 0);
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) return false;

    // Check bit and return
    var w = this.words[s];

    return !!(w & q);
  };

  // Return only lowers bits of number (in-place)
  BN.prototype.imaskn = function imaskn (bits) {
    assert(typeof bits === 'number' && bits >= 0);
    var r = bits % 26;
    var s = (bits - r) / 26;

    assert(this.negative === 0, 'imaskn works only with positive numbers');

    if (this.length <= s) {
      return this;
    }

    if (r !== 0) {
      s++;
    }
    this.length = Math.min(s, this.length);

    if (r !== 0) {
      var mask = 0x3ffffff ^ ((0x3ffffff >>> r) << r);
      this.words[this.length - 1] &= mask;
    }

    return this.strip();
  };

  // Return only lowers bits of number
  BN.prototype.maskn = function maskn (bits) {
    return this.clone().imaskn(bits);
  };

  // Add plain number `num` to `this`
  BN.prototype.iaddn = function iaddn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.isubn(-num);

    // Possible sign change
    if (this.negative !== 0) {
      if (this.length === 1 && (this.words[0] | 0) < num) {
        this.words[0] = num - (this.words[0] | 0);
        this.negative = 0;
        return this;
      }

      this.negative = 0;
      this.isubn(num);
      this.negative = 1;
      return this;
    }

    // Add without checks
    return this._iaddn(num);
  };

  BN.prototype._iaddn = function _iaddn (num) {
    this.words[0] += num;

    // Carry
    for (var i = 0; i < this.length && this.words[i] >= 0x4000000; i++) {
      this.words[i] -= 0x4000000;
      if (i === this.length - 1) {
        this.words[i + 1] = 1;
      } else {
        this.words[i + 1]++;
      }
    }
    this.length = Math.max(this.length, i + 1);

    return this;
  };

  // Subtract plain number `num` from `this`
  BN.prototype.isubn = function isubn (num) {
    assert(typeof num === 'number');
    assert(num < 0x4000000);
    if (num < 0) return this.iaddn(-num);

    if (this.negative !== 0) {
      this.negative = 0;
      this.iaddn(num);
      this.negative = 1;
      return this;
    }

    this.words[0] -= num;

    if (this.length === 1 && this.words[0] < 0) {
      this.words[0] = -this.words[0];
      this.negative = 1;
    } else {
      // Carry
      for (var i = 0; i < this.length && this.words[i] < 0; i++) {
        this.words[i] += 0x4000000;
        this.words[i + 1] -= 1;
      }
    }

    return this.strip();
  };

  BN.prototype.addn = function addn (num) {
    return this.clone().iaddn(num);
  };

  BN.prototype.subn = function subn (num) {
    return this.clone().isubn(num);
  };

  BN.prototype.iabs = function iabs () {
    this.negative = 0;

    return this;
  };

  BN.prototype.abs = function abs () {
    return this.clone().iabs();
  };

  BN.prototype._ishlnsubmul = function _ishlnsubmul (num, mul, shift) {
    var len = num.length + shift;
    var i;

    this._expand(len);

    var w;
    var carry = 0;
    for (i = 0; i < num.length; i++) {
      w = (this.words[i + shift] | 0) + carry;
      var right = (num.words[i] | 0) * mul;
      w -= right & 0x3ffffff;
      carry = (w >> 26) - ((right / 0x4000000) | 0);
      this.words[i + shift] = w & 0x3ffffff;
    }
    for (; i < this.length - shift; i++) {
      w = (this.words[i + shift] | 0) + carry;
      carry = w >> 26;
      this.words[i + shift] = w & 0x3ffffff;
    }

    if (carry === 0) return this.strip();

    // Subtraction overflow
    assert(carry === -1);
    carry = 0;
    for (i = 0; i < this.length; i++) {
      w = -(this.words[i] | 0) + carry;
      carry = w >> 26;
      this.words[i] = w & 0x3ffffff;
    }
    this.negative = 1;

    return this.strip();
  };

  BN.prototype._wordDiv = function _wordDiv (num, mode) {
    var shift = this.length - num.length;

    var a = this.clone();
    var b = num;

    // Normalize
    var bhi = b.words[b.length - 1] | 0;
    var bhiBits = this._countBits(bhi);
    shift = 26 - bhiBits;
    if (shift !== 0) {
      b = b.ushln(shift);
      a.iushln(shift);
      bhi = b.words[b.length - 1] | 0;
    }

    // Initialize quotient
    var m = a.length - b.length;
    var q;

    if (mode !== 'mod') {
      q = new BN(null);
      q.length = m + 1;
      q.words = new Array(q.length);
      for (var i = 0; i < q.length; i++) {
        q.words[i] = 0;
      }
    }

    var diff = a.clone()._ishlnsubmul(b, 1, m);
    if (diff.negative === 0) {
      a = diff;
      if (q) {
        q.words[m] = 1;
      }
    }

    for (var j = m - 1; j >= 0; j--) {
      var qj = (a.words[b.length + j] | 0) * 0x4000000 +
        (a.words[b.length + j - 1] | 0);

      // NOTE: (qj / bhi) is (0x3ffffff * 0x4000000 + 0x3ffffff) / 0x2000000 max
      // (0x7ffffff)
      qj = Math.min((qj / bhi) | 0, 0x3ffffff);

      a._ishlnsubmul(b, qj, j);
      while (a.negative !== 0) {
        qj--;
        a.negative = 0;
        a._ishlnsubmul(b, 1, j);
        if (!a.isZero()) {
          a.negative ^= 1;
        }
      }
      if (q) {
        q.words[j] = qj;
      }
    }
    if (q) {
      q.strip();
    }
    a.strip();

    // Denormalize
    if (mode !== 'div' && shift !== 0) {
      a.iushrn(shift);
    }

    return {
      div: q || null,
      mod: a
    };
  };

  // NOTE: 1) `mode` can be set to `mod` to request mod only,
  //       to `div` to request div only, or be absent to
  //       request both div & mod
  //       2) `positive` is true if unsigned mod is requested
  BN.prototype.divmod = function divmod (num, mode, positive) {
    assert(!num.isZero());

    if (this.isZero()) {
      return {
        div: new BN(0),
        mod: new BN(0)
      };
    }

    var div, mod, res;
    if (this.negative !== 0 && num.negative === 0) {
      res = this.neg().divmod(num, mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.iadd(num);
        }
      }

      return {
        div: div,
        mod: mod
      };
    }

    if (this.negative === 0 && num.negative !== 0) {
      res = this.divmod(num.neg(), mode);

      if (mode !== 'mod') {
        div = res.div.neg();
      }

      return {
        div: div,
        mod: res.mod
      };
    }

    if ((this.negative & num.negative) !== 0) {
      res = this.neg().divmod(num.neg(), mode);

      if (mode !== 'div') {
        mod = res.mod.neg();
        if (positive && mod.negative !== 0) {
          mod.isub(num);
        }
      }

      return {
        div: res.div,
        mod: mod
      };
    }

    // Both numbers are positive at this point

    // Strip both numbers to approximate shift value
    if (num.length > this.length || this.cmp(num) < 0) {
      return {
        div: new BN(0),
        mod: this
      };
    }

    // Very short reduction
    if (num.length === 1) {
      if (mode === 'div') {
        return {
          div: this.divn(num.words[0]),
          mod: null
        };
      }

      if (mode === 'mod') {
        return {
          div: null,
          mod: new BN(this.modn(num.words[0]))
        };
      }

      return {
        div: this.divn(num.words[0]),
        mod: new BN(this.modn(num.words[0]))
      };
    }

    return this._wordDiv(num, mode);
  };

  // Find `this` / `num`
  BN.prototype.div = function div (num) {
    return this.divmod(num, 'div', false).div;
  };

  // Find `this` % `num`
  BN.prototype.mod = function mod (num) {
    return this.divmod(num, 'mod', false).mod;
  };

  BN.prototype.umod = function umod (num) {
    return this.divmod(num, 'mod', true).mod;
  };

  // Find Round(`this` / `num`)
  BN.prototype.divRound = function divRound (num) {
    var dm = this.divmod(num);

    // Fast case - exact division
    if (dm.mod.isZero()) return dm.div;

    var mod = dm.div.negative !== 0 ? dm.mod.isub(num) : dm.mod;

    var half = num.ushrn(1);
    var r2 = num.andln(1);
    var cmp = mod.cmp(half);

    // Round down
    if (cmp < 0 || r2 === 1 && cmp === 0) return dm.div;

    // Round up
    return dm.div.negative !== 0 ? dm.div.isubn(1) : dm.div.iaddn(1);
  };

  BN.prototype.modn = function modn (num) {
    assert(num <= 0x3ffffff);
    var p = (1 << 26) % num;

    var acc = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      acc = (p * acc + (this.words[i] | 0)) % num;
    }

    return acc;
  };

  // In-place division by number
  BN.prototype.idivn = function idivn (num) {
    assert(num <= 0x3ffffff);

    var carry = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var w = (this.words[i] | 0) + carry * 0x4000000;
      this.words[i] = (w / num) | 0;
      carry = w % num;
    }

    return this.strip();
  };

  BN.prototype.divn = function divn (num) {
    return this.clone().idivn(num);
  };

  BN.prototype.egcd = function egcd (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var x = this;
    var y = p.clone();

    if (x.negative !== 0) {
      x = x.umod(p);
    } else {
      x = x.clone();
    }

    // A * x + B * y = x
    var A = new BN(1);
    var B = new BN(0);

    // C * x + D * y = y
    var C = new BN(0);
    var D = new BN(1);

    var g = 0;

    while (x.isEven() && y.isEven()) {
      x.iushrn(1);
      y.iushrn(1);
      ++g;
    }

    var yp = y.clone();
    var xp = x.clone();

    while (!x.isZero()) {
      for (var i = 0, im = 1; (x.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        x.iushrn(i);
        while (i-- > 0) {
          if (A.isOdd() || B.isOdd()) {
            A.iadd(yp);
            B.isub(xp);
          }

          A.iushrn(1);
          B.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (y.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        y.iushrn(j);
        while (j-- > 0) {
          if (C.isOdd() || D.isOdd()) {
            C.iadd(yp);
            D.isub(xp);
          }

          C.iushrn(1);
          D.iushrn(1);
        }
      }

      if (x.cmp(y) >= 0) {
        x.isub(y);
        A.isub(C);
        B.isub(D);
      } else {
        y.isub(x);
        C.isub(A);
        D.isub(B);
      }
    }

    return {
      a: C,
      b: D,
      gcd: y.iushln(g)
    };
  };

  // This is reduced incarnation of the binary EEA
  // above, designated to invert members of the
  // _prime_ fields F(p) at a maximal speed
  BN.prototype._invmp = function _invmp (p) {
    assert(p.negative === 0);
    assert(!p.isZero());

    var a = this;
    var b = p.clone();

    if (a.negative !== 0) {
      a = a.umod(p);
    } else {
      a = a.clone();
    }

    var x1 = new BN(1);
    var x2 = new BN(0);

    var delta = b.clone();

    while (a.cmpn(1) > 0 && b.cmpn(1) > 0) {
      for (var i = 0, im = 1; (a.words[0] & im) === 0 && i < 26; ++i, im <<= 1);
      if (i > 0) {
        a.iushrn(i);
        while (i-- > 0) {
          if (x1.isOdd()) {
            x1.iadd(delta);
          }

          x1.iushrn(1);
        }
      }

      for (var j = 0, jm = 1; (b.words[0] & jm) === 0 && j < 26; ++j, jm <<= 1);
      if (j > 0) {
        b.iushrn(j);
        while (j-- > 0) {
          if (x2.isOdd()) {
            x2.iadd(delta);
          }

          x2.iushrn(1);
        }
      }

      if (a.cmp(b) >= 0) {
        a.isub(b);
        x1.isub(x2);
      } else {
        b.isub(a);
        x2.isub(x1);
      }
    }

    var res;
    if (a.cmpn(1) === 0) {
      res = x1;
    } else {
      res = x2;
    }

    if (res.cmpn(0) < 0) {
      res.iadd(p);
    }

    return res;
  };

  BN.prototype.gcd = function gcd (num) {
    if (this.isZero()) return num.abs();
    if (num.isZero()) return this.abs();

    var a = this.clone();
    var b = num.clone();
    a.negative = 0;
    b.negative = 0;

    // Remove common factor of two
    for (var shift = 0; a.isEven() && b.isEven(); shift++) {
      a.iushrn(1);
      b.iushrn(1);
    }

    do {
      while (a.isEven()) {
        a.iushrn(1);
      }
      while (b.isEven()) {
        b.iushrn(1);
      }

      var r = a.cmp(b);
      if (r < 0) {
        // Swap `a` and `b` to make `a` always bigger than `b`
        var t = a;
        a = b;
        b = t;
      } else if (r === 0 || b.cmpn(1) === 0) {
        break;
      }

      a.isub(b);
    } while (true);

    return b.iushln(shift);
  };

  // Invert number in the field F(num)
  BN.prototype.invm = function invm (num) {
    return this.egcd(num).a.umod(num);
  };

  BN.prototype.isEven = function isEven () {
    return (this.words[0] & 1) === 0;
  };

  BN.prototype.isOdd = function isOdd () {
    return (this.words[0] & 1) === 1;
  };

  // And first word and num
  BN.prototype.andln = function andln (num) {
    return this.words[0] & num;
  };

  // Increment at the bit position in-line
  BN.prototype.bincn = function bincn (bit) {
    assert(typeof bit === 'number');
    var r = bit % 26;
    var s = (bit - r) / 26;
    var q = 1 << r;

    // Fast case: bit is much higher than all existing words
    if (this.length <= s) {
      this._expand(s + 1);
      this.words[s] |= q;
      return this;
    }

    // Add bit and propagate, if needed
    var carry = q;
    for (var i = s; carry !== 0 && i < this.length; i++) {
      var w = this.words[i] | 0;
      w += carry;
      carry = w >>> 26;
      w &= 0x3ffffff;
      this.words[i] = w;
    }
    if (carry !== 0) {
      this.words[i] = carry;
      this.length++;
    }
    return this;
  };

  BN.prototype.isZero = function isZero () {
    return this.length === 1 && this.words[0] === 0;
  };

  BN.prototype.cmpn = function cmpn (num) {
    var negative = num < 0;

    if (this.negative !== 0 && !negative) return -1;
    if (this.negative === 0 && negative) return 1;

    this.strip();

    var res;
    if (this.length > 1) {
      res = 1;
    } else {
      if (negative) {
        num = -num;
      }

      assert(num <= 0x3ffffff, 'Number is too big');

      var w = this.words[0] | 0;
      res = w === num ? 0 : w < num ? -1 : 1;
    }
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Compare two numbers and return:
  // 1 - if `this` > `num`
  // 0 - if `this` == `num`
  // -1 - if `this` < `num`
  BN.prototype.cmp = function cmp (num) {
    if (this.negative !== 0 && num.negative === 0) return -1;
    if (this.negative === 0 && num.negative !== 0) return 1;

    var res = this.ucmp(num);
    if (this.negative !== 0) return -res | 0;
    return res;
  };

  // Unsigned comparison
  BN.prototype.ucmp = function ucmp (num) {
    // At this point both numbers have the same sign
    if (this.length > num.length) return 1;
    if (this.length < num.length) return -1;

    var res = 0;
    for (var i = this.length - 1; i >= 0; i--) {
      var a = this.words[i] | 0;
      var b = num.words[i] | 0;

      if (a === b) continue;
      if (a < b) {
        res = -1;
      } else if (a > b) {
        res = 1;
      }
      break;
    }
    return res;
  };

  BN.prototype.gtn = function gtn (num) {
    return this.cmpn(num) === 1;
  };

  BN.prototype.gt = function gt (num) {
    return this.cmp(num) === 1;
  };

  BN.prototype.gten = function gten (num) {
    return this.cmpn(num) >= 0;
  };

  BN.prototype.gte = function gte (num) {
    return this.cmp(num) >= 0;
  };

  BN.prototype.ltn = function ltn (num) {
    return this.cmpn(num) === -1;
  };

  BN.prototype.lt = function lt (num) {
    return this.cmp(num) === -1;
  };

  BN.prototype.lten = function lten (num) {
    return this.cmpn(num) <= 0;
  };

  BN.prototype.lte = function lte (num) {
    return this.cmp(num) <= 0;
  };

  BN.prototype.eqn = function eqn (num) {
    return this.cmpn(num) === 0;
  };

  BN.prototype.eq = function eq (num) {
    return this.cmp(num) === 0;
  };

  //
  // A reduce context, could be using montgomery or something better, depending
  // on the `m` itself.
  //
  BN.red = function red (num) {
    return new Red(num);
  };

  BN.prototype.toRed = function toRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    assert(this.negative === 0, 'red works only with positives');
    return ctx.convertTo(this)._forceRed(ctx);
  };

  BN.prototype.fromRed = function fromRed () {
    assert(this.red, 'fromRed works only with numbers in reduction context');
    return this.red.convertFrom(this);
  };

  BN.prototype._forceRed = function _forceRed (ctx) {
    this.red = ctx;
    return this;
  };

  BN.prototype.forceRed = function forceRed (ctx) {
    assert(!this.red, 'Already a number in reduction context');
    return this._forceRed(ctx);
  };

  BN.prototype.redAdd = function redAdd (num) {
    assert(this.red, 'redAdd works only with red numbers');
    return this.red.add(this, num);
  };

  BN.prototype.redIAdd = function redIAdd (num) {
    assert(this.red, 'redIAdd works only with red numbers');
    return this.red.iadd(this, num);
  };

  BN.prototype.redSub = function redSub (num) {
    assert(this.red, 'redSub works only with red numbers');
    return this.red.sub(this, num);
  };

  BN.prototype.redISub = function redISub (num) {
    assert(this.red, 'redISub works only with red numbers');
    return this.red.isub(this, num);
  };

  BN.prototype.redShl = function redShl (num) {
    assert(this.red, 'redShl works only with red numbers');
    return this.red.shl(this, num);
  };

  BN.prototype.redMul = function redMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.mul(this, num);
  };

  BN.prototype.redIMul = function redIMul (num) {
    assert(this.red, 'redMul works only with red numbers');
    this.red._verify2(this, num);
    return this.red.imul(this, num);
  };

  BN.prototype.redSqr = function redSqr () {
    assert(this.red, 'redSqr works only with red numbers');
    this.red._verify1(this);
    return this.red.sqr(this);
  };

  BN.prototype.redISqr = function redISqr () {
    assert(this.red, 'redISqr works only with red numbers');
    this.red._verify1(this);
    return this.red.isqr(this);
  };

  // Square root over p
  BN.prototype.redSqrt = function redSqrt () {
    assert(this.red, 'redSqrt works only with red numbers');
    this.red._verify1(this);
    return this.red.sqrt(this);
  };

  BN.prototype.redInvm = function redInvm () {
    assert(this.red, 'redInvm works only with red numbers');
    this.red._verify1(this);
    return this.red.invm(this);
  };

  // Return negative clone of `this` % `red modulo`
  BN.prototype.redNeg = function redNeg () {
    assert(this.red, 'redNeg works only with red numbers');
    this.red._verify1(this);
    return this.red.neg(this);
  };

  BN.prototype.redPow = function redPow (num) {
    assert(this.red && !num.red, 'redPow(normalNum)');
    this.red._verify1(this);
    return this.red.pow(this, num);
  };

  // Prime numbers with efficient reduction
  var primes = {
    k256: null,
    p224: null,
    p192: null,
    p25519: null
  };

  // Pseudo-Mersenne prime
  function MPrime (name, p) {
    // P = 2 ^ N - K
    this.name = name;
    this.p = new BN(p, 16);
    this.n = this.p.bitLength();
    this.k = new BN(1).iushln(this.n).isub(this.p);

    this.tmp = this._tmp();
  }

  MPrime.prototype._tmp = function _tmp () {
    var tmp = new BN(null);
    tmp.words = new Array(Math.ceil(this.n / 13));
    return tmp;
  };

  MPrime.prototype.ireduce = function ireduce (num) {
    // Assumes that `num` is less than `P^2`
    // num = HI * (2 ^ N - K) + HI * K + LO = HI * K + LO (mod P)
    var r = num;
    var rlen;

    do {
      this.split(r, this.tmp);
      r = this.imulK(r);
      r = r.iadd(this.tmp);
      rlen = r.bitLength();
    } while (rlen > this.n);

    var cmp = rlen < this.n ? -1 : r.ucmp(this.p);
    if (cmp === 0) {
      r.words[0] = 0;
      r.length = 1;
    } else if (cmp > 0) {
      r.isub(this.p);
    } else {
      r.strip();
    }

    return r;
  };

  MPrime.prototype.split = function split (input, out) {
    input.iushrn(this.n, 0, out);
  };

  MPrime.prototype.imulK = function imulK (num) {
    return num.imul(this.k);
  };

  function K256 () {
    MPrime.call(
      this,
      'k256',
      'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f');
  }
  inherits(K256, MPrime);

  K256.prototype.split = function split (input, output) {
    // 256 = 9 * 26 + 22
    var mask = 0x3fffff;

    var outLen = Math.min(input.length, 9);
    for (var i = 0; i < outLen; i++) {
      output.words[i] = input.words[i];
    }
    output.length = outLen;

    if (input.length <= 9) {
      input.words[0] = 0;
      input.length = 1;
      return;
    }

    // Shift by 9 limbs
    var prev = input.words[9];
    output.words[output.length++] = prev & mask;

    for (i = 10; i < input.length; i++) {
      var next = input.words[i] | 0;
      input.words[i - 10] = ((next & mask) << 4) | (prev >>> 22);
      prev = next;
    }
    prev >>>= 22;
    input.words[i - 10] = prev;
    if (prev === 0 && input.length > 10) {
      input.length -= 10;
    } else {
      input.length -= 9;
    }
  };

  K256.prototype.imulK = function imulK (num) {
    // K = 0x1000003d1 = [ 0x40, 0x3d1 ]
    num.words[num.length] = 0;
    num.words[num.length + 1] = 0;
    num.length += 2;

    // bounded at: 0x40 * 0x3ffffff + 0x3d0 = 0x100000390
    var lo = 0;
    for (var i = 0; i < num.length; i++) {
      var w = num.words[i] | 0;
      lo += w * 0x3d1;
      num.words[i] = lo & 0x3ffffff;
      lo = w * 0x40 + ((lo / 0x4000000) | 0);
    }

    // Fast length reduction
    if (num.words[num.length - 1] === 0) {
      num.length--;
      if (num.words[num.length - 1] === 0) {
        num.length--;
      }
    }
    return num;
  };

  function P224 () {
    MPrime.call(
      this,
      'p224',
      'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001');
  }
  inherits(P224, MPrime);

  function P192 () {
    MPrime.call(
      this,
      'p192',
      'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff');
  }
  inherits(P192, MPrime);

  function P25519 () {
    // 2 ^ 255 - 19
    MPrime.call(
      this,
      '25519',
      '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed');
  }
  inherits(P25519, MPrime);

  P25519.prototype.imulK = function imulK (num) {
    // K = 0x13
    var carry = 0;
    for (var i = 0; i < num.length; i++) {
      var hi = (num.words[i] | 0) * 0x13 + carry;
      var lo = hi & 0x3ffffff;
      hi >>>= 26;

      num.words[i] = lo;
      carry = hi;
    }
    if (carry !== 0) {
      num.words[num.length++] = carry;
    }
    return num;
  };

  // Exported mostly for testing purposes, use plain name instead
  BN._prime = function prime (name) {
    // Cached version of prime
    if (primes[name]) return primes[name];

    var prime;
    if (name === 'k256') {
      prime = new K256();
    } else if (name === 'p224') {
      prime = new P224();
    } else if (name === 'p192') {
      prime = new P192();
    } else if (name === 'p25519') {
      prime = new P25519();
    } else {
      throw new Error('Unknown prime ' + name);
    }
    primes[name] = prime;

    return prime;
  };

  //
  // Base reduction engine
  //
  function Red (m) {
    if (typeof m === 'string') {
      var prime = BN._prime(m);
      this.m = prime.p;
      this.prime = prime;
    } else {
      assert(m.gtn(1), 'modulus must be greater than 1');
      this.m = m;
      this.prime = null;
    }
  }

  Red.prototype._verify1 = function _verify1 (a) {
    assert(a.negative === 0, 'red works only with positives');
    assert(a.red, 'red works only with red numbers');
  };

  Red.prototype._verify2 = function _verify2 (a, b) {
    assert((a.negative | b.negative) === 0, 'red works only with positives');
    assert(a.red && a.red === b.red,
      'red works only with red numbers');
  };

  Red.prototype.imod = function imod (a) {
    if (this.prime) return this.prime.ireduce(a)._forceRed(this);
    return a.umod(this.m)._forceRed(this);
  };

  Red.prototype.neg = function neg (a) {
    if (a.isZero()) {
      return a.clone();
    }

    return this.m.sub(a)._forceRed(this);
  };

  Red.prototype.add = function add (a, b) {
    this._verify2(a, b);

    var res = a.add(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.iadd = function iadd (a, b) {
    this._verify2(a, b);

    var res = a.iadd(b);
    if (res.cmp(this.m) >= 0) {
      res.isub(this.m);
    }
    return res;
  };

  Red.prototype.sub = function sub (a, b) {
    this._verify2(a, b);

    var res = a.sub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res._forceRed(this);
  };

  Red.prototype.isub = function isub (a, b) {
    this._verify2(a, b);

    var res = a.isub(b);
    if (res.cmpn(0) < 0) {
      res.iadd(this.m);
    }
    return res;
  };

  Red.prototype.shl = function shl (a, num) {
    this._verify1(a);
    return this.imod(a.ushln(num));
  };

  Red.prototype.imul = function imul (a, b) {
    this._verify2(a, b);
    return this.imod(a.imul(b));
  };

  Red.prototype.mul = function mul (a, b) {
    this._verify2(a, b);
    return this.imod(a.mul(b));
  };

  Red.prototype.isqr = function isqr (a) {
    return this.imul(a, a.clone());
  };

  Red.prototype.sqr = function sqr (a) {
    return this.mul(a, a);
  };

  Red.prototype.sqrt = function sqrt (a) {
    if (a.isZero()) return a.clone();

    var mod3 = this.m.andln(3);
    assert(mod3 % 2 === 1);

    // Fast case
    if (mod3 === 3) {
      var pow = this.m.add(new BN(1)).iushrn(2);
      return this.pow(a, pow);
    }

    // Tonelli-Shanks algorithm (Totally unoptimized and slow)
    //
    // Find Q and S, that Q * 2 ^ S = (P - 1)
    var q = this.m.subn(1);
    var s = 0;
    while (!q.isZero() && q.andln(1) === 0) {
      s++;
      q.iushrn(1);
    }
    assert(!q.isZero());

    var one = new BN(1).toRed(this);
    var nOne = one.redNeg();

    // Find quadratic non-residue
    // NOTE: Max is such because of generalized Riemann hypothesis.
    var lpow = this.m.subn(1).iushrn(1);
    var z = this.m.bitLength();
    z = new BN(2 * z * z).toRed(this);

    while (this.pow(z, lpow).cmp(nOne) !== 0) {
      z.redIAdd(nOne);
    }

    var c = this.pow(z, q);
    var r = this.pow(a, q.addn(1).iushrn(1));
    var t = this.pow(a, q);
    var m = s;
    while (t.cmp(one) !== 0) {
      var tmp = t;
      for (var i = 0; tmp.cmp(one) !== 0; i++) {
        tmp = tmp.redSqr();
      }
      assert(i < m);
      var b = this.pow(c, new BN(1).iushln(m - i - 1));

      r = r.redMul(b);
      c = b.redSqr();
      t = t.redMul(c);
      m = i;
    }

    return r;
  };

  Red.prototype.invm = function invm (a) {
    var inv = a._invmp(this.m);
    if (inv.negative !== 0) {
      inv.negative = 0;
      return this.imod(inv).redNeg();
    } else {
      return this.imod(inv);
    }
  };

  Red.prototype.pow = function pow (a, num) {
    if (num.isZero()) return new BN(1).toRed(this);
    if (num.cmpn(1) === 0) return a.clone();

    var windowSize = 4;
    var wnd = new Array(1 << windowSize);
    wnd[0] = new BN(1).toRed(this);
    wnd[1] = a;
    for (var i = 2; i < wnd.length; i++) {
      wnd[i] = this.mul(wnd[i - 1], a);
    }

    var res = wnd[0];
    var current = 0;
    var currentLen = 0;
    var start = num.bitLength() % 26;
    if (start === 0) {
      start = 26;
    }

    for (i = num.length - 1; i >= 0; i--) {
      var word = num.words[i];
      for (var j = start - 1; j >= 0; j--) {
        var bit = (word >> j) & 1;
        if (res !== wnd[0]) {
          res = this.sqr(res);
        }

        if (bit === 0 && current === 0) {
          currentLen = 0;
          continue;
        }

        current <<= 1;
        current |= bit;
        currentLen++;
        if (currentLen !== windowSize && (i !== 0 || j !== 0)) continue;

        res = this.mul(res, wnd[current]);
        currentLen = 0;
        current = 0;
      }
      start = 26;
    }

    return res;
  };

  Red.prototype.convertTo = function convertTo (num) {
    var r = num.umod(this.m);

    return r === num ? r.clone() : r;
  };

  Red.prototype.convertFrom = function convertFrom (num) {
    var res = num.clone();
    res.red = null;
    return res;
  };

  //
  // Montgomery method engine
  //

  BN.mont = function mont (num) {
    return new Mont(num);
  };

  function Mont (m) {
    Red.call(this, m);

    this.shift = this.m.bitLength();
    if (this.shift % 26 !== 0) {
      this.shift += 26 - (this.shift % 26);
    }

    this.r = new BN(1).iushln(this.shift);
    this.r2 = this.imod(this.r.sqr());
    this.rinv = this.r._invmp(this.m);

    this.minv = this.rinv.mul(this.r).isubn(1).div(this.m);
    this.minv = this.minv.umod(this.r);
    this.minv = this.r.sub(this.minv);
  }
  inherits(Mont, Red);

  Mont.prototype.convertTo = function convertTo (num) {
    return this.imod(num.ushln(this.shift));
  };

  Mont.prototype.convertFrom = function convertFrom (num) {
    var r = this.imod(num.mul(this.rinv));
    r.red = null;
    return r;
  };

  Mont.prototype.imul = function imul (a, b) {
    if (a.isZero() || b.isZero()) {
      a.words[0] = 0;
      a.length = 1;
      return a;
    }

    var t = a.imul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;

    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.mul = function mul (a, b) {
    if (a.isZero() || b.isZero()) return new BN(0)._forceRed(this);

    var t = a.mul(b);
    var c = t.maskn(this.shift).mul(this.minv).imaskn(this.shift).mul(this.m);
    var u = t.isub(c).iushrn(this.shift);
    var res = u;
    if (u.cmp(this.m) >= 0) {
      res = u.isub(this.m);
    } else if (u.cmpn(0) < 0) {
      res = u.iadd(this.m);
    }

    return res._forceRed(this);
  };

  Mont.prototype.invm = function invm (a) {
    // (AR)^-1 * R^2 = (A^-1 * R^-1) * R^2 = A^-1 * R
    var res = this.imod(a._invmp(this.m).mul(this.r2));
    return res._forceRed(this);
  };
})( module, commonjsGlobal);
});
var bn_1 = bn.BN;

const version$5 = "bignumber/5.0.6";

const logger$4 = new Logger(version$5);
const _constructorGuard = {};
const MAX_SAFE = 0x1fffffffffffff;
class BigNumber {
    constructor(constructorGuard, hex) {
        logger$4.checkNew(new.target, BigNumber);
        if (constructorGuard !== _constructorGuard) {
            logger$4.throwError("cannot call constructor directly; use BigNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new (BigNumber)"
            });
        }
        this._hex = hex;
        this._isBigNumber = true;
        Object.freeze(this);
    }
    fromTwos(value) {
        return toBigNumber(toBN(this).fromTwos(value));
    }
    toTwos(value) {
        return toBigNumber(toBN(this).toTwos(value));
    }
    abs() {
        if (this._hex[0] === "-") {
            return BigNumber.from(this._hex.substring(1));
        }
        return this;
    }
    add(other) {
        return toBigNumber(toBN(this).add(toBN(other)));
    }
    sub(other) {
        return toBigNumber(toBN(this).sub(toBN(other)));
    }
    div(other) {
        const o = BigNumber.from(other);
        if (o.isZero()) {
            throwFault("division by zero", "div");
        }
        return toBigNumber(toBN(this).div(toBN(other)));
    }
    mul(other) {
        return toBigNumber(toBN(this).mul(toBN(other)));
    }
    mod(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault("cannot modulo negative values", "mod");
        }
        return toBigNumber(toBN(this).umod(value));
    }
    pow(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault("cannot raise to negative values", "pow");
        }
        return toBigNumber(toBN(this).pow(value));
    }
    and(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'and' negative values", "and");
        }
        return toBigNumber(toBN(this).and(value));
    }
    or(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'or' negative values", "or");
        }
        return toBigNumber(toBN(this).or(value));
    }
    xor(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'xor' negative values", "xor");
        }
        return toBigNumber(toBN(this).xor(value));
    }
    mask(value) {
        if (this.isNegative() || value < 0) {
            throwFault("cannot mask negative values", "mask");
        }
        return toBigNumber(toBN(this).maskn(value));
    }
    shl(value) {
        if (this.isNegative() || value < 0) {
            throwFault("cannot shift negative values", "shl");
        }
        return toBigNumber(toBN(this).shln(value));
    }
    shr(value) {
        if (this.isNegative() || value < 0) {
            throwFault("cannot shift negative values", "shr");
        }
        return toBigNumber(toBN(this).shrn(value));
    }
    eq(other) {
        return toBN(this).eq(toBN(other));
    }
    lt(other) {
        return toBN(this).lt(toBN(other));
    }
    lte(other) {
        return toBN(this).lte(toBN(other));
    }
    gt(other) {
        return toBN(this).gt(toBN(other));
    }
    gte(other) {
        return toBN(this).gte(toBN(other));
    }
    isNegative() {
        return (this._hex[0] === "-");
    }
    isZero() {
        return toBN(this).isZero();
    }
    toNumber() {
        try {
            return toBN(this).toNumber();
        }
        catch (error) {
            throwFault("overflow", "toNumber", this.toString());
        }
        return null;
    }
    toString() {
        // Lots of people expect this, which we do not support, so check
        if (arguments.length !== 0) {
            logger$4.throwError("bigNumber.toString does not accept parameters", Logger.errors.UNEXPECTED_ARGUMENT, {});
        }
        return toBN(this).toString(10);
    }
    toHexString() {
        return this._hex;
    }
    toJSON(key) {
        return { type: "BigNumber", hex: this.toHexString() };
    }
    static from(value) {
        if (value instanceof BigNumber) {
            return value;
        }
        if (typeof (value) === "string") {
            if (value.match(/^-?0x[0-9a-f]+$/i)) {
                return new BigNumber(_constructorGuard, toHex(value));
            }
            if (value.match(/^-?[0-9]+$/)) {
                return new BigNumber(_constructorGuard, toHex(new bn_1(value)));
            }
            return logger$4.throwArgumentError("invalid BigNumber string", "value", value);
        }
        if (typeof (value) === "number") {
            if (value % 1) {
                throwFault("underflow", "BigNumber.from", value);
            }
            if (value >= MAX_SAFE || value <= -MAX_SAFE) {
                throwFault("overflow", "BigNumber.from", value);
            }
            return BigNumber.from(String(value));
        }
        const anyValue = value;
        if (typeof (anyValue) === "bigint") {
            return BigNumber.from(anyValue.toString());
        }
        if (isBytes(anyValue)) {
            return BigNumber.from(hexlify(anyValue));
        }
        if (anyValue) {
            // Hexable interface (takes piority)
            if (anyValue.toHexString) {
                const hex = anyValue.toHexString();
                if (typeof (hex) === "string") {
                    return BigNumber.from(hex);
                }
            }
            else {
                // For now, handle legacy JSON-ified values (goes away in v6)
                let hex = anyValue._hex;
                // New-form JSON
                if (hex == null && anyValue.type === "BigNumber") {
                    hex = anyValue.hex;
                }
                if (typeof (hex) === "string") {
                    if (isHexString(hex) || (hex[0] === "-" && isHexString(hex.substring(1)))) {
                        return BigNumber.from(hex);
                    }
                }
            }
        }
        return logger$4.throwArgumentError("invalid BigNumber value", "value", value);
    }
    static isBigNumber(value) {
        return !!(value && value._isBigNumber);
    }
}
// Normalize the hex string
function toHex(value) {
    // For BN, call on the hex string
    if (typeof (value) !== "string") {
        return toHex(value.toString(16));
    }
    // If negative, prepend the negative sign to the normalized positive value
    if (value[0] === "-") {
        // Strip off the negative sign
        value = value.substring(1);
        // Cannot have mulitple negative signs (e.g. "--0x04")
        if (value[0] === "-") {
            logger$4.throwArgumentError("invalid hex", "value", value);
        }
        // Call toHex on the positive component
        value = toHex(value);
        // Do not allow "-0x00"
        if (value === "0x00") {
            return value;
        }
        // Negate the value
        return "-" + value;
    }
    // Add a "0x" prefix if missing
    if (value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    // Normalize zero
    if (value === "0x") {
        return "0x00";
    }
    // Make the string even length
    if (value.length % 2) {
        value = "0x0" + value.substring(2);
    }
    // Trim to smallest even-length string
    while (value.length > 4 && value.substring(0, 4) === "0x00") {
        value = "0x" + value.substring(4);
    }
    return value;
}
function toBigNumber(value) {
    return BigNumber.from(toHex(value));
}
function toBN(value) {
    const hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
        return (new bn_1("-" + hex.substring(3), 16));
    }
    return new bn_1(hex.substring(2), 16);
}
function throwFault(fault, operation, value) {
    const params = { fault: fault, operation: operation };
    if (value != null) {
        params.value = value;
    }
    return logger$4.throwError(fault, Logger.errors.NUMERIC_FAULT, params);
}

const logger$5 = new Logger(version$5);
const Zero = BigNumber.from(0);
const NegativeOne = BigNumber.from(-1);
// Constant to pull zeros from for multipliers
let zeros = "0";
while (zeros.length < 256) {
    zeros += zeros;
}

const AddressZero = "0x0000000000000000000000000000000000000000";
const NegativeOne$1 = BigNumber.from(-1);
const Zero$1 = BigNumber.from(0);
const One = BigNumber.from(1);
const Two = BigNumber.from(2);
const WeiPerEther = BigNumber.from("1000000000000000000");
const MaxUint256 = BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");

const version$6 = "strings/5.0.3";

const logger$6 = new Logger(version$6);
///////////////////////////////
var UnicodeNormalizationForm;
(function (UnicodeNormalizationForm) {
    UnicodeNormalizationForm["current"] = "";
    UnicodeNormalizationForm["NFC"] = "NFC";
    UnicodeNormalizationForm["NFD"] = "NFD";
    UnicodeNormalizationForm["NFKC"] = "NFKC";
    UnicodeNormalizationForm["NFKD"] = "NFKD";
})(UnicodeNormalizationForm || (UnicodeNormalizationForm = {}));
var Utf8ErrorReason;
(function (Utf8ErrorReason) {
    // A continuation byte was present where there was nothing to continue
    // - offset = the index the codepoint began in
    Utf8ErrorReason["UNEXPECTED_CONTINUE"] = "unexpected continuation byte";
    // An invalid (non-continuation) byte to start a UTF-8 codepoint was found
    // - offset = the index the codepoint began in
    Utf8ErrorReason["BAD_PREFIX"] = "bad codepoint prefix";
    // The string is too short to process the expected codepoint
    // - offset = the index the codepoint began in
    Utf8ErrorReason["OVERRUN"] = "string overrun";
    // A missing continuation byte was expected but not found
    // - offset = the index the continuation byte was expected at
    Utf8ErrorReason["MISSING_CONTINUE"] = "missing continuation byte";
    // The computed code point is outside the range for UTF-8
    // - offset       = start of this codepoint
    // - badCodepoint = the computed codepoint; outside the UTF-8 range
    Utf8ErrorReason["OUT_OF_RANGE"] = "out of UTF-8 range";
    // UTF-8 strings may not contain UTF-16 surrogate pairs
    // - offset       = start of this codepoint
    // - badCodepoint = the computed codepoint; inside the UTF-16 surrogate range
    Utf8ErrorReason["UTF16_SURROGATE"] = "UTF-16 surrogate";
    // The string is an overlong reperesentation
    // - offset       = start of this codepoint
    // - badCodepoint = the computed codepoint; already bounds checked
    Utf8ErrorReason["OVERLONG"] = "overlong representation";
})(Utf8ErrorReason || (Utf8ErrorReason = {}));
function errorFunc(reason, offset, bytes, output, badCodepoint) {
    return logger$6.throwArgumentError(`invalid codepoint at offset ${offset}; ${reason}`, "bytes", bytes);
}
function ignoreFunc(reason, offset, bytes, output, badCodepoint) {
    // If there is an invalid prefix (including stray continuation), skip any additional continuation bytes
    if (reason === Utf8ErrorReason.BAD_PREFIX || reason === Utf8ErrorReason.UNEXPECTED_CONTINUE) {
        let i = 0;
        for (let o = offset + 1; o < bytes.length; o++) {
            if (bytes[o] >> 6 !== 0x02) {
                break;
            }
            i++;
        }
        return i;
    }
    // This byte runs us past the end of the string, so just jump to the end
    // (but the first byte was read already read and therefore skipped)
    if (reason === Utf8ErrorReason.OVERRUN) {
        return bytes.length - offset - 1;
    }
    // Nothing to skip
    return 0;
}
function replaceFunc(reason, offset, bytes, output, badCodepoint) {
    // Overlong representations are otherwise "valid" code points; just non-deistingtished
    if (reason === Utf8ErrorReason.OVERLONG) {
        output.push(badCodepoint);
        return 0;
    }
    // Put the replacement character into the output
    output.push(0xfffd);
    // Otherwise, process as if ignoring errors
    return ignoreFunc(reason, offset, bytes);
}
// Common error handing strategies
const Utf8ErrorFuncs = Object.freeze({
    error: errorFunc,
    ignore: ignoreFunc,
    replace: replaceFunc
});
// http://stackoverflow.com/questions/13356493/decode-utf-8-with-javascript#13691499
function getUtf8CodePoints(bytes, onError) {
    if (onError == null) {
        onError = Utf8ErrorFuncs.error;
    }
    bytes = arrayify(bytes);
    const result = [];
    let i = 0;
    // Invalid bytes are ignored
    while (i < bytes.length) {
        const c = bytes[i++];
        // 0xxx xxxx
        if (c >> 7 === 0) {
            result.push(c);
            continue;
        }
        // Multibyte; how many bytes left for this character?
        let extraLength = null;
        let overlongMask = null;
        // 110x xxxx 10xx xxxx
        if ((c & 0xe0) === 0xc0) {
            extraLength = 1;
            overlongMask = 0x7f;
            // 1110 xxxx 10xx xxxx 10xx xxxx
        }
        else if ((c & 0xf0) === 0xe0) {
            extraLength = 2;
            overlongMask = 0x7ff;
            // 1111 0xxx 10xx xxxx 10xx xxxx 10xx xxxx
        }
        else if ((c & 0xf8) === 0xf0) {
            extraLength = 3;
            overlongMask = 0xffff;
        }
        else {
            if ((c & 0xc0) === 0x80) {
                i += onError(Utf8ErrorReason.UNEXPECTED_CONTINUE, i - 1, bytes, result);
            }
            else {
                i += onError(Utf8ErrorReason.BAD_PREFIX, i - 1, bytes, result);
            }
            continue;
        }
        // Do we have enough bytes in our data?
        if (i - 1 + extraLength >= bytes.length) {
            i += onError(Utf8ErrorReason.OVERRUN, i - 1, bytes, result);
            continue;
        }
        // Remove the length prefix from the char
        let res = c & ((1 << (8 - extraLength - 1)) - 1);
        for (let j = 0; j < extraLength; j++) {
            let nextChar = bytes[i];
            // Invalid continuation byte
            if ((nextChar & 0xc0) != 0x80) {
                i += onError(Utf8ErrorReason.MISSING_CONTINUE, i, bytes, result);
                res = null;
                break;
            }
            res = (res << 6) | (nextChar & 0x3f);
            i++;
        }
        // See above loop for invalid contimuation byte
        if (res === null) {
            continue;
        }
        // Maximum code point
        if (res > 0x10ffff) {
            i += onError(Utf8ErrorReason.OUT_OF_RANGE, i - 1 - extraLength, bytes, result, res);
            continue;
        }
        // Reserved for UTF-16 surrogate halves
        if (res >= 0xd800 && res <= 0xdfff) {
            i += onError(Utf8ErrorReason.UTF16_SURROGATE, i - 1 - extraLength, bytes, result, res);
            continue;
        }
        // Check for overlong sequences (more bytes than needed)
        if (res <= overlongMask) {
            i += onError(Utf8ErrorReason.OVERLONG, i - 1 - extraLength, bytes, result, res);
            continue;
        }
        result.push(res);
    }
    return result;
}
// http://stackoverflow.com/questions/18729405/how-to-convert-utf8-string-to-byte-array
function toUtf8Bytes(str, form = UnicodeNormalizationForm.current) {
    if (form != UnicodeNormalizationForm.current) {
        logger$6.checkNormalize();
        str = str.normalize(form);
    }
    let result = [];
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        if (c < 0x80) {
            result.push(c);
        }
        else if (c < 0x800) {
            result.push((c >> 6) | 0xc0);
            result.push((c & 0x3f) | 0x80);
        }
        else if ((c & 0xfc00) == 0xd800) {
            i++;
            const c2 = str.charCodeAt(i);
            if (i >= str.length || (c2 & 0xfc00) !== 0xdc00) {
                throw new Error("invalid utf-8 string");
            }
            // Surrogate Pair
            const pair = 0x10000 + ((c & 0x03ff) << 10) + (c2 & 0x03ff);
            result.push((pair >> 18) | 0xf0);
            result.push(((pair >> 12) & 0x3f) | 0x80);
            result.push(((pair >> 6) & 0x3f) | 0x80);
            result.push((pair & 0x3f) | 0x80);
        }
        else {
            result.push((c >> 12) | 0xe0);
            result.push(((c >> 6) & 0x3f) | 0x80);
            result.push((c & 0x3f) | 0x80);
        }
    }
    return arrayify(result);
}
function _toUtf8String(codePoints) {
    return codePoints.map((codePoint) => {
        if (codePoint <= 0xffff) {
            return String.fromCharCode(codePoint);
        }
        codePoint -= 0x10000;
        return String.fromCharCode((((codePoint >> 10) & 0x3ff) + 0xd800), ((codePoint & 0x3ff) + 0xdc00));
    }).join("");
}
function toUtf8String(bytes, onError) {
    return _toUtf8String(getUtf8CodePoints(bytes, onError));
}
function toUtf8CodePoints(str, form = UnicodeNormalizationForm.current) {
    return getUtf8CodePoints(toUtf8Bytes(str, form));
}

function bytes2(data) {
    if ((data.length % 4) !== 0) {
        throw new Error("bad data");
    }
    let result = [];
    for (let i = 0; i < data.length; i += 4) {
        result.push(parseInt(data.substring(i, i + 4), 16));
    }
    return result;
}
function createTable(data, func) {
    if (!func) {
        func = function (value) { return [parseInt(value, 16)]; };
    }
    let lo = 0;
    let result = {};
    data.split(",").forEach((pair) => {
        let comps = pair.split(":");
        lo += parseInt(comps[0], 16);
        result[lo] = func(comps[1]);
    });
    return result;
}
function createRangeTable(data) {
    let hi = 0;
    return data.split(",").map((v) => {
        let comps = v.split("-");
        if (comps.length === 1) {
            comps[1] = "0";
        }
        else if (comps[1] === "") {
            comps[1] = "1";
        }
        let lo = hi + parseInt(comps[0], 16);
        hi = parseInt(comps[1], 16);
        return { l: lo, h: hi };
    });
}
function matchMap(value, ranges) {
    let lo = 0;
    for (let i = 0; i < ranges.length; i++) {
        let range = ranges[i];
        lo += range.l;
        if (value >= lo && value <= lo + range.h && ((value - lo) % (range.d || 1)) === 0) {
            if (range.e && range.e.indexOf(value - lo) !== -1) {
                continue;
            }
            return range;
        }
    }
    return null;
}
const Table_A_1_ranges = createRangeTable("221,13-1b,5f-,40-10,51-f,11-3,3-3,2-2,2-4,8,2,15,2d,28-8,88,48,27-,3-5,11-20,27-,8,28,3-5,12,18,b-a,1c-4,6-16,2-d,2-2,2,1b-4,17-9,8f-,10,f,1f-2,1c-34,33-14e,4,36-,13-,6-2,1a-f,4,9-,3-,17,8,2-2,5-,2,8-,3-,4-8,2-3,3,6-,16-6,2-,7-3,3-,17,8,3,3,3-,2,6-3,3-,4-a,5,2-6,10-b,4,8,2,4,17,8,3,6-,b,4,4-,2-e,2-4,b-10,4,9-,3-,17,8,3-,5-,9-2,3-,4-7,3-3,3,4-3,c-10,3,7-2,4,5-2,3,2,3-2,3-2,4-2,9,4-3,6-2,4,5-8,2-e,d-d,4,9,4,18,b,6-3,8,4,5-6,3-8,3-3,b-11,3,9,4,18,b,6-3,8,4,5-6,3-6,2,3-3,b-11,3,9,4,18,11-3,7-,4,5-8,2-7,3-3,b-11,3,13-2,19,a,2-,8-2,2-3,7,2,9-11,4-b,3b-3,1e-24,3,2-,3,2-,2-5,5,8,4,2,2-,3,e,4-,6,2,7-,b-,3-21,49,23-5,1c-3,9,25,10-,2-2f,23,6,3,8-2,5-5,1b-45,27-9,2a-,2-3,5b-4,45-4,53-5,8,40,2,5-,8,2,5-,28,2,5-,20,2,5-,8,2,5-,8,8,18,20,2,5-,8,28,14-5,1d-22,56-b,277-8,1e-2,52-e,e,8-a,18-8,15-b,e,4,3-b,5e-2,b-15,10,b-5,59-7,2b-555,9d-3,5b-5,17-,7-,27-,7-,9,2,2,2,20-,36,10,f-,7,14-,4,a,54-3,2-6,6-5,9-,1c-10,13-1d,1c-14,3c-,10-6,32-b,240-30,28-18,c-14,a0,115-,3,66-,b-76,5,5-,1d,24,2,5-2,2,8-,35-2,19,f-10,1d-3,311-37f,1b,5a-b,d7-19,d-3,41,57-,68-4,29-3,5f,29-37,2e-2,25-c,2c-2,4e-3,30,78-3,64-,20,19b7-49,51a7-59,48e-2,38-738,2ba5-5b,222f-,3c-94,8-b,6-4,1b,6,2,3,3,6d-20,16e-f,41-,37-7,2e-2,11-f,5-b,18-,b,14,5-3,6,88-,2,bf-2,7-,7-,7-,4-2,8,8-9,8-2ff,20,5-b,1c-b4,27-,27-cbb1,f7-9,28-2,b5-221,56,48,3-,2-,3-,5,d,2,5,3,42,5-,9,8,1d,5,6,2-2,8,153-3,123-3,33-27fd,a6da-5128,21f-5df,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3-fffd,3,2-1d,61-ff7d");
// @TODO: Make this relative...
const Table_B_1_flags = "ad,34f,1806,180b,180c,180d,200b,200c,200d,2060,feff".split(",").map((v) => parseInt(v, 16));
const Table_B_2_ranges = [
    { h: 25, s: 32, l: 65 },
    { h: 30, s: 32, e: [23], l: 127 },
    { h: 54, s: 1, e: [48], l: 64, d: 2 },
    { h: 14, s: 1, l: 57, d: 2 },
    { h: 44, s: 1, l: 17, d: 2 },
    { h: 10, s: 1, e: [2, 6, 8], l: 61, d: 2 },
    { h: 16, s: 1, l: 68, d: 2 },
    { h: 84, s: 1, e: [18, 24, 66], l: 19, d: 2 },
    { h: 26, s: 32, e: [17], l: 435 },
    { h: 22, s: 1, l: 71, d: 2 },
    { h: 15, s: 80, l: 40 },
    { h: 31, s: 32, l: 16 },
    { h: 32, s: 1, l: 80, d: 2 },
    { h: 52, s: 1, l: 42, d: 2 },
    { h: 12, s: 1, l: 55, d: 2 },
    { h: 40, s: 1, e: [38], l: 15, d: 2 },
    { h: 14, s: 1, l: 48, d: 2 },
    { h: 37, s: 48, l: 49 },
    { h: 148, s: 1, l: 6351, d: 2 },
    { h: 88, s: 1, l: 160, d: 2 },
    { h: 15, s: 16, l: 704 },
    { h: 25, s: 26, l: 854 },
    { h: 25, s: 32, l: 55915 },
    { h: 37, s: 40, l: 1247 },
    { h: 25, s: -119711, l: 53248 },
    { h: 25, s: -119763, l: 52 },
    { h: 25, s: -119815, l: 52 },
    { h: 25, s: -119867, e: [1, 4, 5, 7, 8, 11, 12, 17], l: 52 },
    { h: 25, s: -119919, l: 52 },
    { h: 24, s: -119971, e: [2, 7, 8, 17], l: 52 },
    { h: 24, s: -120023, e: [2, 7, 13, 15, 16, 17], l: 52 },
    { h: 25, s: -120075, l: 52 },
    { h: 25, s: -120127, l: 52 },
    { h: 25, s: -120179, l: 52 },
    { h: 25, s: -120231, l: 52 },
    { h: 25, s: -120283, l: 52 },
    { h: 25, s: -120335, l: 52 },
    { h: 24, s: -119543, e: [17], l: 56 },
    { h: 24, s: -119601, e: [17], l: 58 },
    { h: 24, s: -119659, e: [17], l: 58 },
    { h: 24, s: -119717, e: [17], l: 58 },
    { h: 24, s: -119775, e: [17], l: 58 }
];
const Table_B_2_lut_abs = createTable("b5:3bc,c3:ff,7:73,2:253,5:254,3:256,1:257,5:259,1:25b,3:260,1:263,2:269,1:268,5:26f,1:272,2:275,7:280,3:283,5:288,3:28a,1:28b,5:292,3f:195,1:1bf,29:19e,125:3b9,8b:3b2,1:3b8,1:3c5,3:3c6,1:3c0,1a:3ba,1:3c1,1:3c3,2:3b8,1:3b5,1bc9:3b9,1c:1f76,1:1f77,f:1f7a,1:1f7b,d:1f78,1:1f79,1:1f7c,1:1f7d,107:63,5:25b,4:68,1:68,1:68,3:69,1:69,1:6c,3:6e,4:70,1:71,1:72,1:72,1:72,7:7a,2:3c9,2:7a,2:6b,1:e5,1:62,1:63,3:65,1:66,2:6d,b:3b3,1:3c0,6:64,1b574:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3,20:3b8,1a:3c3");
const Table_B_2_lut_rel = createTable("179:1,2:1,2:1,5:1,2:1,a:4f,a:1,8:1,2:1,2:1,3:1,5:1,3:1,4:1,2:1,3:1,4:1,8:2,1:1,2:2,1:1,2:2,27:2,195:26,2:25,1:25,1:25,2:40,2:3f,1:3f,33:1,11:-6,1:-9,1ac7:-3a,6d:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,b:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,c:-8,2:-8,2:-8,2:-8,9:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,1:-8,49:-8,1:-8,1:-4a,1:-4a,d:-56,1:-56,1:-56,1:-56,d:-8,1:-8,f:-8,1:-8,3:-7");
const Table_B_2_complex = createTable("df:00730073,51:00690307,19:02BC006E,a7:006A030C,18a:002003B9,16:03B903080301,20:03C503080301,1d7:05650582,190f:00680331,1:00740308,1:0077030A,1:0079030A,1:006102BE,b6:03C50313,2:03C503130300,2:03C503130301,2:03C503130342,2a:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F0003B9,1:1F0103B9,1:1F0203B9,1:1F0303B9,1:1F0403B9,1:1F0503B9,1:1F0603B9,1:1F0703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F2003B9,1:1F2103B9,1:1F2203B9,1:1F2303B9,1:1F2403B9,1:1F2503B9,1:1F2603B9,1:1F2703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,1:1F6003B9,1:1F6103B9,1:1F6203B9,1:1F6303B9,1:1F6403B9,1:1F6503B9,1:1F6603B9,1:1F6703B9,3:1F7003B9,1:03B103B9,1:03AC03B9,2:03B10342,1:03B1034203B9,5:03B103B9,6:1F7403B9,1:03B703B9,1:03AE03B9,2:03B70342,1:03B7034203B9,5:03B703B9,6:03B903080300,1:03B903080301,3:03B90342,1:03B903080342,b:03C503080300,1:03C503080301,1:03C10313,2:03C50342,1:03C503080342,b:1F7C03B9,1:03C903B9,1:03CE03B9,2:03C90342,1:03C9034203B9,5:03C903B9,ac:00720073,5b:00B00063,6:00B00066,d:006E006F,a:0073006D,1:00740065006C,1:0074006D,124f:006800700061,2:00610075,2:006F0076,b:00700061,1:006E0061,1:03BC0061,1:006D0061,1:006B0061,1:006B0062,1:006D0062,1:00670062,3:00700066,1:006E0066,1:03BC0066,4:0068007A,1:006B0068007A,1:006D0068007A,1:00670068007A,1:00740068007A,15:00700061,1:006B00700061,1:006D00700061,1:006700700061,8:00700076,1:006E0076,1:03BC0076,1:006D0076,1:006B0076,1:006D0076,1:00700077,1:006E0077,1:03BC0077,1:006D0077,1:006B0077,1:006D0077,1:006B03C9,1:006D03C9,2:00620071,3:00632215006B0067,1:0063006F002E,1:00640062,1:00670079,2:00680070,2:006B006B,1:006B006D,9:00700068,2:00700070006D,1:00700072,2:00730076,1:00770062,c723:00660066,1:00660069,1:0066006C,1:006600660069,1:00660066006C,1:00730074,1:00730074,d:05740576,1:05740565,1:0574056B,1:057E0576,1:0574056D", bytes2);
const Table_C_ranges = createRangeTable("80-20,2a0-,39c,32,f71,18e,7f2-f,19-7,30-4,7-5,f81-b,5,a800-20ff,4d1-1f,110,fa-6,d174-7,2e84-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,ffff-,2,1f-5f,ff7f-20001");
function flatten(values) {
    return values.reduce((accum, value) => {
        value.forEach((value) => { accum.push(value); });
        return accum;
    }, []);
}
function _nameprepTableA1(codepoint) {
    return !!matchMap(codepoint, Table_A_1_ranges);
}
function _nameprepTableB2(codepoint) {
    let range = matchMap(codepoint, Table_B_2_ranges);
    if (range) {
        return [codepoint + range.s];
    }
    let codes = Table_B_2_lut_abs[codepoint];
    if (codes) {
        return codes;
    }
    let shift = Table_B_2_lut_rel[codepoint];
    if (shift) {
        return [codepoint + shift[0]];
    }
    let complex = Table_B_2_complex[codepoint];
    if (complex) {
        return complex;
    }
    return null;
}
function _nameprepTableC(codepoint) {
    return !!matchMap(codepoint, Table_C_ranges);
}
function nameprep(value) {
    // This allows platforms with incomplete normalize to bypass
    // it for very basic names which the built-in toLowerCase
    // will certainly handle correctly
    if (value.match(/^[a-z0-9-]*$/i) && value.length <= 59) {
        return value.toLowerCase();
    }
    // Get the code points (keeping the current normalization)
    let codes = toUtf8CodePoints(value);
    codes = flatten(codes.map((code) => {
        // Substitute Table B.1 (Maps to Nothing)
        if (Table_B_1_flags.indexOf(code) >= 0) {
            return [];
        }
        if (code >= 0xfe00 && code <= 0xfe0f) {
            return [];
        }
        // Substitute Table B.2 (Case Folding)
        let codesTableB2 = _nameprepTableB2(code);
        if (codesTableB2) {
            return codesTableB2;
        }
        // No Substitution
        return [code];
    }));
    // Normalize using form KC
    codes = toUtf8CodePoints(_toUtf8String(codes), UnicodeNormalizationForm.NFKC);
    // Prohibit Tables C.1.2, C.2.2, C.3, C.4, C.5, C.6, C.7, C.8, C.9
    codes.forEach((code) => {
        if (_nameprepTableC(code)) {
            throw new Error("STRINGPREP_CONTAINS_PROHIBITED");
        }
    });
    // Prohibit Unassigned Code Points (Table A.1)
    codes.forEach((code) => {
        if (_nameprepTableA1(code)) {
            throw new Error("STRINGPREP_CONTAINS_UNASSIGNED");
        }
    });
    // IDNA extras
    let name = _toUtf8String(codes);
    // IDNA: 4.2.3.1
    if (name.substring(0, 1) === "-" || name.substring(2, 4) === "--" || name.substring(name.length - 1) === "-") {
        throw new Error("invalid hyphen");
    }
    // IDNA: 4.2.4
    if (name.length > 63) {
        throw new Error("too long");
    }
    return name;
}

var sha3 = createCommonjsModule(function (module) {
/**
 * [js-sha3]{@link https://github.com/emn178/js-sha3}
 *
 * @version 0.5.7
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2015-2016
 * @license MIT
 */
/*jslint bitwise: true */
(function () {

  var root = typeof window === 'object' ? window : {};
  var NODE_JS = !root.JS_SHA3_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
  if (NODE_JS) {
    root = commonjsGlobal;
  }
  var COMMON_JS = !root.JS_SHA3_NO_COMMON_JS && 'object' === 'object' && module.exports;
  var HEX_CHARS = '0123456789abcdef'.split('');
  var SHAKE_PADDING = [31, 7936, 2031616, 520093696];
  var KECCAK_PADDING = [1, 256, 65536, 16777216];
  var PADDING = [6, 1536, 393216, 100663296];
  var SHIFT = [0, 8, 16, 24];
  var RC = [1, 0, 32898, 0, 32906, 2147483648, 2147516416, 2147483648, 32907, 0, 2147483649,
            0, 2147516545, 2147483648, 32777, 2147483648, 138, 0, 136, 0, 2147516425, 0,
            2147483658, 0, 2147516555, 0, 139, 2147483648, 32905, 2147483648, 32771,
            2147483648, 32770, 2147483648, 128, 2147483648, 32778, 0, 2147483658, 2147483648,
            2147516545, 2147483648, 32896, 2147483648, 2147483649, 0, 2147516424, 2147483648];
  var BITS = [224, 256, 384, 512];
  var SHAKE_BITS = [128, 256];
  var OUTPUT_TYPES = ['hex', 'buffer', 'arrayBuffer', 'array'];

  var createOutputMethod = function (bits, padding, outputType) {
    return function (message) {
      return new Keccak(bits, padding, bits).update(message)[outputType]();
    };
  };

  var createShakeOutputMethod = function (bits, padding, outputType) {
    return function (message, outputBits) {
      return new Keccak(bits, padding, outputBits).update(message)[outputType]();
    };
  };

  var createMethod = function (bits, padding) {
    var method = createOutputMethod(bits, padding, 'hex');
    method.create = function () {
      return new Keccak(bits, padding, bits);
    };
    method.update = function (message) {
      return method.create().update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createOutputMethod(bits, padding, type);
    }
    return method;
  };

  var createShakeMethod = function (bits, padding) {
    var method = createShakeOutputMethod(bits, padding, 'hex');
    method.create = function (outputBits) {
      return new Keccak(bits, padding, outputBits);
    };
    method.update = function (message, outputBits) {
      return method.create(outputBits).update(message);
    };
    for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
      var type = OUTPUT_TYPES[i];
      method[type] = createShakeOutputMethod(bits, padding, type);
    }
    return method;
  };

  var algorithms = [
    {name: 'keccak', padding: KECCAK_PADDING, bits: BITS, createMethod: createMethod},
    {name: 'sha3', padding: PADDING, bits: BITS, createMethod: createMethod},
    {name: 'shake', padding: SHAKE_PADDING, bits: SHAKE_BITS, createMethod: createShakeMethod}
  ];

  var methods = {}, methodNames = [];

  for (var i = 0; i < algorithms.length; ++i) {
    var algorithm = algorithms[i];
    var bits  = algorithm.bits;
    for (var j = 0; j < bits.length; ++j) {
      var methodName = algorithm.name +'_' + bits[j];
      methodNames.push(methodName);
      methods[methodName] = algorithm.createMethod(bits[j], algorithm.padding);
    }
  }

  function Keccak(bits, padding, outputBits) {
    this.blocks = [];
    this.s = [];
    this.padding = padding;
    this.outputBits = outputBits;
    this.reset = true;
    this.block = 0;
    this.start = 0;
    this.blockCount = (1600 - (bits << 1)) >> 5;
    this.byteCount = this.blockCount << 2;
    this.outputBlocks = outputBits >> 5;
    this.extraBytes = (outputBits & 31) >> 3;

    for (var i = 0; i < 50; ++i) {
      this.s[i] = 0;
    }
  }

  Keccak.prototype.update = function (message) {
    var notString = typeof message !== 'string';
    if (notString && message.constructor === ArrayBuffer) {
      message = new Uint8Array(message);
    }
    var length = message.length, blocks = this.blocks, byteCount = this.byteCount,
      blockCount = this.blockCount, index = 0, s = this.s, i, code;

    while (index < length) {
      if (this.reset) {
        this.reset = false;
        blocks[0] = this.block;
        for (i = 1; i < blockCount + 1; ++i) {
          blocks[i] = 0;
        }
      }
      if (notString) {
        for (i = this.start; index < length && i < byteCount; ++index) {
          blocks[i >> 2] |= message[index] << SHIFT[i++ & 3];
        }
      } else {
        for (i = this.start; index < length && i < byteCount; ++index) {
          code = message.charCodeAt(index);
          if (code < 0x80) {
            blocks[i >> 2] |= code << SHIFT[i++ & 3];
          } else if (code < 0x800) {
            blocks[i >> 2] |= (0xc0 | (code >> 6)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else if (code < 0xd800 || code >= 0xe000) {
            blocks[i >> 2] |= (0xe0 | (code >> 12)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          } else {
            code = 0x10000 + (((code & 0x3ff) << 10) | (message.charCodeAt(++index) & 0x3ff));
            blocks[i >> 2] |= (0xf0 | (code >> 18)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 12) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | ((code >> 6) & 0x3f)) << SHIFT[i++ & 3];
            blocks[i >> 2] |= (0x80 | (code & 0x3f)) << SHIFT[i++ & 3];
          }
        }
      }
      this.lastByteIndex = i;
      if (i >= byteCount) {
        this.start = i - byteCount;
        this.block = blocks[blockCount];
        for (i = 0; i < blockCount; ++i) {
          s[i] ^= blocks[i];
        }
        f(s);
        this.reset = true;
      } else {
        this.start = i;
      }
    }
    return this;
  };

  Keccak.prototype.finalize = function () {
    var blocks = this.blocks, i = this.lastByteIndex, blockCount = this.blockCount, s = this.s;
    blocks[i >> 2] |= this.padding[i & 3];
    if (this.lastByteIndex === this.byteCount) {
      blocks[0] = blocks[blockCount];
      for (i = 1; i < blockCount + 1; ++i) {
        blocks[i] = 0;
      }
    }
    blocks[blockCount - 1] |= 0x80000000;
    for (i = 0; i < blockCount; ++i) {
      s[i] ^= blocks[i];
    }
    f(s);
  };

  Keccak.prototype.toString = Keccak.prototype.hex = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes, i = 0, j = 0;
    var hex = '', block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        block = s[i];
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F] +
               HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F] +
               HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F] +
               HEX_CHARS[(block >> 28) & 0x0F] + HEX_CHARS[(block >> 24) & 0x0F];
      }
      if (j % blockCount === 0) {
        f(s);
        i = 0;
      }
    }
    if (extraBytes) {
      block = s[i];
      if (extraBytes > 0) {
        hex += HEX_CHARS[(block >> 4) & 0x0F] + HEX_CHARS[block & 0x0F];
      }
      if (extraBytes > 1) {
        hex += HEX_CHARS[(block >> 12) & 0x0F] + HEX_CHARS[(block >> 8) & 0x0F];
      }
      if (extraBytes > 2) {
        hex += HEX_CHARS[(block >> 20) & 0x0F] + HEX_CHARS[(block >> 16) & 0x0F];
      }
    }
    return hex;
  };

  Keccak.prototype.arrayBuffer = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes, i = 0, j = 0;
    var bytes = this.outputBits >> 3;
    var buffer;
    if (extraBytes) {
      buffer = new ArrayBuffer((outputBlocks + 1) << 2);
    } else {
      buffer = new ArrayBuffer(bytes);
    }
    var array = new Uint32Array(buffer);
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        array[j] = s[i];
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      array[i] = s[i];
      buffer = buffer.slice(0, bytes);
    }
    return buffer;
  };

  Keccak.prototype.buffer = Keccak.prototype.arrayBuffer;

  Keccak.prototype.digest = Keccak.prototype.array = function () {
    this.finalize();

    var blockCount = this.blockCount, s = this.s, outputBlocks = this.outputBlocks,
        extraBytes = this.extraBytes, i = 0, j = 0;
    var array = [], offset, block;
    while (j < outputBlocks) {
      for (i = 0; i < blockCount && j < outputBlocks; ++i, ++j) {
        offset = j << 2;
        block = s[i];
        array[offset] = block & 0xFF;
        array[offset + 1] = (block >> 8) & 0xFF;
        array[offset + 2] = (block >> 16) & 0xFF;
        array[offset + 3] = (block >> 24) & 0xFF;
      }
      if (j % blockCount === 0) {
        f(s);
      }
    }
    if (extraBytes) {
      offset = j << 2;
      block = s[i];
      if (extraBytes > 0) {
        array[offset] = block & 0xFF;
      }
      if (extraBytes > 1) {
        array[offset + 1] = (block >> 8) & 0xFF;
      }
      if (extraBytes > 2) {
        array[offset + 2] = (block >> 16) & 0xFF;
      }
    }
    return array;
  };

  var f = function (s) {
    var h, l, n, c0, c1, c2, c3, c4, c5, c6, c7, c8, c9,
        b0, b1, b2, b3, b4, b5, b6, b7, b8, b9, b10, b11, b12, b13, b14, b15, b16, b17,
        b18, b19, b20, b21, b22, b23, b24, b25, b26, b27, b28, b29, b30, b31, b32, b33,
        b34, b35, b36, b37, b38, b39, b40, b41, b42, b43, b44, b45, b46, b47, b48, b49;
    for (n = 0; n < 48; n += 2) {
      c0 = s[0] ^ s[10] ^ s[20] ^ s[30] ^ s[40];
      c1 = s[1] ^ s[11] ^ s[21] ^ s[31] ^ s[41];
      c2 = s[2] ^ s[12] ^ s[22] ^ s[32] ^ s[42];
      c3 = s[3] ^ s[13] ^ s[23] ^ s[33] ^ s[43];
      c4 = s[4] ^ s[14] ^ s[24] ^ s[34] ^ s[44];
      c5 = s[5] ^ s[15] ^ s[25] ^ s[35] ^ s[45];
      c6 = s[6] ^ s[16] ^ s[26] ^ s[36] ^ s[46];
      c7 = s[7] ^ s[17] ^ s[27] ^ s[37] ^ s[47];
      c8 = s[8] ^ s[18] ^ s[28] ^ s[38] ^ s[48];
      c9 = s[9] ^ s[19] ^ s[29] ^ s[39] ^ s[49];

      h = c8 ^ ((c2 << 1) | (c3 >>> 31));
      l = c9 ^ ((c3 << 1) | (c2 >>> 31));
      s[0] ^= h;
      s[1] ^= l;
      s[10] ^= h;
      s[11] ^= l;
      s[20] ^= h;
      s[21] ^= l;
      s[30] ^= h;
      s[31] ^= l;
      s[40] ^= h;
      s[41] ^= l;
      h = c0 ^ ((c4 << 1) | (c5 >>> 31));
      l = c1 ^ ((c5 << 1) | (c4 >>> 31));
      s[2] ^= h;
      s[3] ^= l;
      s[12] ^= h;
      s[13] ^= l;
      s[22] ^= h;
      s[23] ^= l;
      s[32] ^= h;
      s[33] ^= l;
      s[42] ^= h;
      s[43] ^= l;
      h = c2 ^ ((c6 << 1) | (c7 >>> 31));
      l = c3 ^ ((c7 << 1) | (c6 >>> 31));
      s[4] ^= h;
      s[5] ^= l;
      s[14] ^= h;
      s[15] ^= l;
      s[24] ^= h;
      s[25] ^= l;
      s[34] ^= h;
      s[35] ^= l;
      s[44] ^= h;
      s[45] ^= l;
      h = c4 ^ ((c8 << 1) | (c9 >>> 31));
      l = c5 ^ ((c9 << 1) | (c8 >>> 31));
      s[6] ^= h;
      s[7] ^= l;
      s[16] ^= h;
      s[17] ^= l;
      s[26] ^= h;
      s[27] ^= l;
      s[36] ^= h;
      s[37] ^= l;
      s[46] ^= h;
      s[47] ^= l;
      h = c6 ^ ((c0 << 1) | (c1 >>> 31));
      l = c7 ^ ((c1 << 1) | (c0 >>> 31));
      s[8] ^= h;
      s[9] ^= l;
      s[18] ^= h;
      s[19] ^= l;
      s[28] ^= h;
      s[29] ^= l;
      s[38] ^= h;
      s[39] ^= l;
      s[48] ^= h;
      s[49] ^= l;

      b0 = s[0];
      b1 = s[1];
      b32 = (s[11] << 4) | (s[10] >>> 28);
      b33 = (s[10] << 4) | (s[11] >>> 28);
      b14 = (s[20] << 3) | (s[21] >>> 29);
      b15 = (s[21] << 3) | (s[20] >>> 29);
      b46 = (s[31] << 9) | (s[30] >>> 23);
      b47 = (s[30] << 9) | (s[31] >>> 23);
      b28 = (s[40] << 18) | (s[41] >>> 14);
      b29 = (s[41] << 18) | (s[40] >>> 14);
      b20 = (s[2] << 1) | (s[3] >>> 31);
      b21 = (s[3] << 1) | (s[2] >>> 31);
      b2 = (s[13] << 12) | (s[12] >>> 20);
      b3 = (s[12] << 12) | (s[13] >>> 20);
      b34 = (s[22] << 10) | (s[23] >>> 22);
      b35 = (s[23] << 10) | (s[22] >>> 22);
      b16 = (s[33] << 13) | (s[32] >>> 19);
      b17 = (s[32] << 13) | (s[33] >>> 19);
      b48 = (s[42] << 2) | (s[43] >>> 30);
      b49 = (s[43] << 2) | (s[42] >>> 30);
      b40 = (s[5] << 30) | (s[4] >>> 2);
      b41 = (s[4] << 30) | (s[5] >>> 2);
      b22 = (s[14] << 6) | (s[15] >>> 26);
      b23 = (s[15] << 6) | (s[14] >>> 26);
      b4 = (s[25] << 11) | (s[24] >>> 21);
      b5 = (s[24] << 11) | (s[25] >>> 21);
      b36 = (s[34] << 15) | (s[35] >>> 17);
      b37 = (s[35] << 15) | (s[34] >>> 17);
      b18 = (s[45] << 29) | (s[44] >>> 3);
      b19 = (s[44] << 29) | (s[45] >>> 3);
      b10 = (s[6] << 28) | (s[7] >>> 4);
      b11 = (s[7] << 28) | (s[6] >>> 4);
      b42 = (s[17] << 23) | (s[16] >>> 9);
      b43 = (s[16] << 23) | (s[17] >>> 9);
      b24 = (s[26] << 25) | (s[27] >>> 7);
      b25 = (s[27] << 25) | (s[26] >>> 7);
      b6 = (s[36] << 21) | (s[37] >>> 11);
      b7 = (s[37] << 21) | (s[36] >>> 11);
      b38 = (s[47] << 24) | (s[46] >>> 8);
      b39 = (s[46] << 24) | (s[47] >>> 8);
      b30 = (s[8] << 27) | (s[9] >>> 5);
      b31 = (s[9] << 27) | (s[8] >>> 5);
      b12 = (s[18] << 20) | (s[19] >>> 12);
      b13 = (s[19] << 20) | (s[18] >>> 12);
      b44 = (s[29] << 7) | (s[28] >>> 25);
      b45 = (s[28] << 7) | (s[29] >>> 25);
      b26 = (s[38] << 8) | (s[39] >>> 24);
      b27 = (s[39] << 8) | (s[38] >>> 24);
      b8 = (s[48] << 14) | (s[49] >>> 18);
      b9 = (s[49] << 14) | (s[48] >>> 18);

      s[0] = b0 ^ (~b2 & b4);
      s[1] = b1 ^ (~b3 & b5);
      s[10] = b10 ^ (~b12 & b14);
      s[11] = b11 ^ (~b13 & b15);
      s[20] = b20 ^ (~b22 & b24);
      s[21] = b21 ^ (~b23 & b25);
      s[30] = b30 ^ (~b32 & b34);
      s[31] = b31 ^ (~b33 & b35);
      s[40] = b40 ^ (~b42 & b44);
      s[41] = b41 ^ (~b43 & b45);
      s[2] = b2 ^ (~b4 & b6);
      s[3] = b3 ^ (~b5 & b7);
      s[12] = b12 ^ (~b14 & b16);
      s[13] = b13 ^ (~b15 & b17);
      s[22] = b22 ^ (~b24 & b26);
      s[23] = b23 ^ (~b25 & b27);
      s[32] = b32 ^ (~b34 & b36);
      s[33] = b33 ^ (~b35 & b37);
      s[42] = b42 ^ (~b44 & b46);
      s[43] = b43 ^ (~b45 & b47);
      s[4] = b4 ^ (~b6 & b8);
      s[5] = b5 ^ (~b7 & b9);
      s[14] = b14 ^ (~b16 & b18);
      s[15] = b15 ^ (~b17 & b19);
      s[24] = b24 ^ (~b26 & b28);
      s[25] = b25 ^ (~b27 & b29);
      s[34] = b34 ^ (~b36 & b38);
      s[35] = b35 ^ (~b37 & b39);
      s[44] = b44 ^ (~b46 & b48);
      s[45] = b45 ^ (~b47 & b49);
      s[6] = b6 ^ (~b8 & b0);
      s[7] = b7 ^ (~b9 & b1);
      s[16] = b16 ^ (~b18 & b10);
      s[17] = b17 ^ (~b19 & b11);
      s[26] = b26 ^ (~b28 & b20);
      s[27] = b27 ^ (~b29 & b21);
      s[36] = b36 ^ (~b38 & b30);
      s[37] = b37 ^ (~b39 & b31);
      s[46] = b46 ^ (~b48 & b40);
      s[47] = b47 ^ (~b49 & b41);
      s[8] = b8 ^ (~b0 & b2);
      s[9] = b9 ^ (~b1 & b3);
      s[18] = b18 ^ (~b10 & b12);
      s[19] = b19 ^ (~b11 & b13);
      s[28] = b28 ^ (~b20 & b22);
      s[29] = b29 ^ (~b21 & b23);
      s[38] = b38 ^ (~b30 & b32);
      s[39] = b39 ^ (~b31 & b33);
      s[48] = b48 ^ (~b40 & b42);
      s[49] = b49 ^ (~b41 & b43);

      s[0] ^= RC[n];
      s[1] ^= RC[n + 1];
    }
  };

  if (COMMON_JS) {
    module.exports = methods;
  } else {
    for (var i = 0; i < methodNames.length; ++i) {
      root[methodNames[i]] = methods[methodNames[i]];
    }
  }
})();
});

function keccak256(data) {
    return '0x' + sha3.keccak_256(arrayify(data));
}

const version$7 = "hash/5.0.3";

const logger$7 = new Logger(version$7);
///////////////////////////////
const Zeros = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
const Partition = new RegExp("^((.*)\\.)?([^.]+)$");
function namehash(name) {
    /* istanbul ignore if */
    if (typeof (name) !== "string") {
        logger$7.throwArgumentError("invalid address - " + String(name), "name", name);
    }
    let result = Zeros;
    while (name.length) {
        const partition = name.match(Partition);
        const label = toUtf8Bytes(nameprep(partition[3]));
        result = keccak256(concat([result, keccak256(label)]));
        name = partition[2] || "";
    }
    return hexlify(result);
}

var browser$3 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function decode(textData) {
    textData = atob(textData);
    var data = [];
    for (var i = 0; i < textData.length; i++) {
        data.push(textData.charCodeAt(i));
    }
    return lib_esm$1.arrayify(data);
}
exports.decode = decode;
function encode(data) {
    data = lib_esm$1.arrayify(data);
    var textData = "";
    for (var i = 0; i < data.length; i++) {
        textData += String.fromCharCode(data[i]);
    }
    return btoa(textData);
}
exports.encode = encode;

});

unwrapExports(browser$3);
var browser_1 = browser$3.decode;
var browser_2 = browser$3.encode;

const version$8 = "web/5.0.4";

var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$8 = new Logger(version$8);
function getResponse(request) {
    return new Promise((resolve, reject) => {
        request.once("response", (resp) => {
            const response = {
                statusCode: resp.statusCode,
                statusMessage: resp.statusMessage,
                headers: Object.keys(resp.headers).reduce((accum, name) => {
                    let value = resp.headers[name];
                    if (Array.isArray(value)) {
                        value = value.join(", ");
                    }
                    accum[name] = value;
                    return accum;
                }, {}),
                body: null
            };
            //resp.setEncoding("utf8");
            resp.on("data", (chunk) => {
                if (response.body == null) {
                    response.body = new Uint8Array(0);
                }
                response.body = concat([response.body, chunk]);
            });
            resp.on("end", () => {
                resolve(response);
            });
            resp.on("error", (error) => {
                /* istanbul ignore next */
                error.response = response;
                reject(error);
            });
        });
        request.on("error", (error) => { reject(error); });
    });
}
// The URL.parse uses null instead of the empty string
function nonnull(value) {
    if (value == null) {
        return "";
    }
    return value;
}
function getUrl(href, options) {
    return __awaiter$2(this, void 0, void 0, function* () {
        if (options == null) {
            options = {};
        }
        // @TODO: Once we drop support for node 8, we can pass the href
        //        firectly into request and skip adding the components
        //        to this request object
        const url = parse$1(href);
        const request = {
            protocol: nonnull(url.protocol),
            hostname: nonnull(url.hostname),
            port: nonnull(url.port),
            path: (nonnull(url.pathname) + nonnull(url.search)),
            method: (options.method || "GET"),
            headers: (options.headers || {}),
        };
        let req = null;
        switch (nonnull(url.protocol)) {
            case "http:":
                req = http.request(request);
                break;
            case "https:":
                req = https.request(request);
                break;
            default:
                /* istanbul ignore next */
                logger$8.throwError(`unsupported protocol ${url.protocol}`, Logger.errors.UNSUPPORTED_OPERATION, {
                    protocol: url.protocol,
                    operation: "request"
                });
        }
        if (options.body) {
            req.write(Buffer.from(options.body));
        }
        req.end();
        const response = yield getResponse(req);
        return response;
    });
}

var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$9 = new Logger(version$8);
function staller(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}
// This API is still a work in progress; the future changes will likely be:
// - ConnectionInfo => FetchDataRequest<T = any>
// - FetchDataRequest.body? = string | Uint8Array | { contentType: string, data: string | Uint8Array }
//   - If string => text/plain, Uint8Array => application/octet-stream (if content-type unspecified)
// - FetchDataRequest.processFunc = (body: Uint8Array, response: FetchDataResponse) => T
// For this reason, it should be considered internal until the API is finalized
function _fetchData(connection, body, processFunc) {
    // How many times to retry in the event of a throttle
    const attemptLimit = (typeof (connection) === "object" && connection.throttleLimit != null) ? connection.throttleLimit : 12;
    logger$9.assertArgument((attemptLimit > 0 && (attemptLimit % 1) === 0), "invalid connection throttle limit", "connection.throttleLimit", attemptLimit);
    const throttleCallback = ((typeof (connection) === "object") ? connection.throttleCallback : null);
    const throttleSlotInterval = ((typeof (connection) === "object" && typeof (connection.throttleSlotInterval) === "number") ? connection.throttleSlotInterval : 100);
    logger$9.assertArgument((throttleSlotInterval > 0 && (throttleSlotInterval % 1) === 0), "invalid connection throttle slot interval", "connection.throttleSlotInterval", throttleSlotInterval);
    const headers = {};
    let url = null;
    // @TODO: Allow ConnectionInfo to override some of these values
    const options = {
        method: "GET",
    };
    let allow304 = false;
    let timeout = 2 * 60 * 1000;
    if (typeof (connection) === "string") {
        url = connection;
    }
    else if (typeof (connection) === "object") {
        if (connection == null || connection.url == null) {
            logger$9.throwArgumentError("missing URL", "connection.url", connection);
        }
        url = connection.url;
        if (typeof (connection.timeout) === "number" && connection.timeout > 0) {
            timeout = connection.timeout;
        }
        if (connection.headers) {
            for (const key in connection.headers) {
                headers[key.toLowerCase()] = { key: key, value: String(connection.headers[key]) };
                if (["if-none-match", "if-modified-since"].indexOf(key.toLowerCase()) >= 0) {
                    allow304 = true;
                }
            }
        }
        if (connection.user != null && connection.password != null) {
            if (url.substring(0, 6) !== "https:" && connection.allowInsecureAuthentication !== true) {
                logger$9.throwError("basic authentication requires a secure https url", Logger.errors.INVALID_ARGUMENT, { argument: "url", url: url, user: connection.user, password: "[REDACTED]" });
            }
            const authorization = connection.user + ":" + connection.password;
            headers["authorization"] = {
                key: "Authorization",
                value: "Basic " + browser_2(toUtf8Bytes(authorization))
            };
        }
    }
    if (body) {
        options.method = "POST";
        options.body = body;
        if (headers["content-type"] == null) {
            headers["content-type"] = { key: "Content-Type", value: "application/octet-stream" };
        }
    }
    const flatHeaders = {};
    Object.keys(headers).forEach((key) => {
        const header = headers[key];
        flatHeaders[header.key] = header.value;
    });
    options.headers = flatHeaders;
    const runningTimeout = (function () {
        let timer = null;
        const promise = new Promise(function (resolve, reject) {
            if (timeout) {
                timer = setTimeout(() => {
                    if (timer == null) {
                        return;
                    }
                    timer = null;
                    reject(logger$9.makeError("timeout", Logger.errors.TIMEOUT, {
                        requestBody: (options.body || null),
                        requestMethod: options.method,
                        timeout: timeout,
                        url: url
                    }));
                }, timeout);
            }
        });
        const cancel = function () {
            if (timer == null) {
                return;
            }
            clearTimeout(timer);
            timer = null;
        };
        return { promise, cancel };
    })();
    const runningFetch = (function () {
        return __awaiter$3(this, void 0, void 0, function* () {
            for (let attempt = 0; attempt < attemptLimit; attempt++) {
                let response = null;
                try {
                    response = yield getUrl(url, options);
                    // Exponential back-off throttling
                    if (response.statusCode === 429 && attempt < attemptLimit) {
                        let tryAgain = true;
                        if (throttleCallback) {
                            tryAgain = yield throttleCallback(attempt, url);
                        }
                        if (tryAgain) {
                            let stall = 0;
                            const retryAfter = response.headers["retry-after"];
                            if (typeof (retryAfter) === "string" && retryAfter.match(/^[1-9][0-9]*$/)) {
                                stall = parseInt(retryAfter) * 1000;
                            }
                            else {
                                stall = throttleSlotInterval * parseInt(String(Math.random() * Math.pow(2, attempt)));
                            }
                            //console.log("Stalling 429");
                            yield staller(stall);
                            continue;
                        }
                    }
                }
                catch (error) {
                    response = error.response;
                    if (response == null) {
                        runningTimeout.cancel();
                        logger$9.throwError("missing response", Logger.errors.SERVER_ERROR, {
                            requestBody: (options.body || null),
                            requestMethod: options.method,
                            serverError: error,
                            url: url
                        });
                    }
                }
                let body = response.body;
                if (allow304 && response.statusCode === 304) {
                    body = null;
                }
                else if (response.statusCode < 200 || response.statusCode >= 300) {
                    runningTimeout.cancel();
                    logger$9.throwError("bad response", Logger.errors.SERVER_ERROR, {
                        status: response.statusCode,
                        headers: response.headers,
                        body: body,
                        requestBody: (options.body || null),
                        requestMethod: options.method,
                        url: url
                    });
                }
                if (processFunc) {
                    try {
                        const result = yield processFunc(body, response);
                        runningTimeout.cancel();
                        return result;
                    }
                    catch (error) {
                        // Allow the processFunc to trigger a throttle
                        if (error.throttleRetry && attempt < attemptLimit) {
                            let tryAgain = true;
                            if (throttleCallback) {
                                tryAgain = yield throttleCallback(attempt, url);
                            }
                            if (tryAgain) {
                                const timeout = throttleSlotInterval * parseInt(String(Math.random() * Math.pow(2, attempt)));
                                //console.log("Stalling callback");
                                yield staller(timeout);
                                continue;
                            }
                        }
                        runningTimeout.cancel();
                        logger$9.throwError("processing response error", Logger.errors.SERVER_ERROR, {
                            body: body,
                            error: error,
                            requestBody: (options.body || null),
                            requestMethod: options.method,
                            url: url
                        });
                    }
                }
                runningTimeout.cancel();
                // If we had a processFunc, it eitehr returned a T or threw above.
                // The "body" is now a Uint8Array.
                return body;
            }
            return logger$9.throwError("failed response", Logger.errors.SERVER_ERROR, {
                requestBody: (options.body || null),
                requestMethod: options.method,
                url: url
            });
        });
    })();
    return Promise.race([runningTimeout.promise, runningFetch]);
}
function fetchJson(connection, json, processFunc) {
    let processJsonFunc = (value, response) => {
        let result = null;
        if (value != null) {
            try {
                result = JSON.parse(toUtf8String(value));
            }
            catch (error) {
                logger$9.throwError("invalid JSON", Logger.errors.SERVER_ERROR, {
                    body: value,
                    error: error
                });
            }
        }
        if (processFunc) {
            result = processFunc(result, response);
        }
        return result;
    };
    // If we have json to send, we must
    // - add content-type of application/json (unless already overridden)
    // - convert the json to bytes
    let body = null;
    if (json != null) {
        body = toUtf8Bytes(json);
        // Create a connection with the content-type set for JSON
        const updated = (typeof (connection) === "string") ? ({ url: connection }) : shallowCopy(connection);
        if (updated.headers) {
            const hasContentType = (Object.keys(updated.headers).filter((k) => (k.toLowerCase() === "content-type")).length) !== 0;
            if (!hasContentType) {
                updated.headers = shallowCopy(updated.headers);
                updated.headers["content-type"] = "application/json";
            }
        }
        else {
            updated.headers = { "content-type": "application/json" };
        }
        connection = updated;
    }
    return _fetchData(connection, body, processJsonFunc);
}
function poll(func, options) {
    if (!options) {
        options = {};
    }
    options = shallowCopy(options);
    if (options.floor == null) {
        options.floor = 0;
    }
    if (options.ceiling == null) {
        options.ceiling = 10000;
    }
    if (options.interval == null) {
        options.interval = 250;
    }
    return new Promise(function (resolve, reject) {
        let timer = null;
        let done = false;
        // Returns true if cancel was successful. Unsuccessful cancel means we're already done.
        const cancel = () => {
            if (done) {
                return false;
            }
            done = true;
            if (timer) {
                clearTimeout(timer);
            }
            return true;
        };
        if (options.timeout) {
            timer = setTimeout(() => {
                if (cancel()) {
                    reject(new Error("timeout"));
                }
            }, options.timeout);
        }
        const retryLimit = options.retryLimit;
        let attempt = 0;
        function check() {
            return func().then(function (result) {
                // If we have a result, or are allowed null then we're done
                if (result !== undefined) {
                    if (cancel()) {
                        resolve(result);
                    }
                }
                else if (options.oncePoll) {
                    options.oncePoll.once("poll", check);
                }
                else if (options.onceBlock) {
                    options.onceBlock.once("block", check);
                    // Otherwise, exponential back-off (up to 10s) our next request
                }
                else if (!done) {
                    attempt++;
                    if (attempt > retryLimit) {
                        if (cancel()) {
                            reject(new Error("retry limit reached"));
                        }
                        return;
                    }
                    let timeout = options.interval * parseInt(String(Math.random() * Math.pow(2, attempt)));
                    if (timeout < options.floor) {
                        timeout = options.floor;
                    }
                    if (timeout > options.ceiling) {
                        timeout = options.ceiling;
                    }
                    setTimeout(check, timeout);
                }
                return null;
            }, function (error) {
                if (cancel()) {
                    reject(error);
                }
            });
        }
        check();
    });
}

const version$9 = "providers/5.0.6";

const version$a = "rlp/5.0.3";

const logger$a = new Logger(version$a);
function arrayifyInteger(value) {
    const result = [];
    while (value) {
        result.unshift(value & 0xff);
        value >>= 8;
    }
    return result;
}
function unarrayifyInteger(data, offset, length) {
    let result = 0;
    for (let i = 0; i < length; i++) {
        result = (result * 256) + data[offset + i];
    }
    return result;
}
function _encode(object) {
    if (Array.isArray(object)) {
        let payload = [];
        object.forEach(function (child) {
            payload = payload.concat(_encode(child));
        });
        if (payload.length <= 55) {
            payload.unshift(0xc0 + payload.length);
            return payload;
        }
        const length = arrayifyInteger(payload.length);
        length.unshift(0xf7 + length.length);
        return length.concat(payload);
    }
    if (!isBytesLike(object)) {
        logger$a.throwArgumentError("RLP object must be BytesLike", "object", object);
    }
    const data = Array.prototype.slice.call(arrayify(object));
    if (data.length === 1 && data[0] <= 0x7f) {
        return data;
    }
    else if (data.length <= 55) {
        data.unshift(0x80 + data.length);
        return data;
    }
    const length = arrayifyInteger(data.length);
    length.unshift(0xb7 + length.length);
    return length.concat(data);
}
function encode(object) {
    return hexlify(_encode(object));
}
function _decodeChildren(data, offset, childOffset, length) {
    const result = [];
    while (childOffset < offset + 1 + length) {
        const decoded = _decode(data, childOffset);
        result.push(decoded.result);
        childOffset += decoded.consumed;
        if (childOffset > offset + 1 + length) {
            logger$a.throwError("child data too short", Logger.errors.BUFFER_OVERRUN, {});
        }
    }
    return { consumed: (1 + length), result: result };
}
// returns { consumed: number, result: Object }
function _decode(data, offset) {
    if (data.length === 0) {
        logger$a.throwError("data too short", Logger.errors.BUFFER_OVERRUN, {});
    }
    // Array with extra length prefix
    if (data[offset] >= 0xf8) {
        const lengthLength = data[offset] - 0xf7;
        if (offset + 1 + lengthLength > data.length) {
            logger$a.throwError("data short segment too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            logger$a.throwError("data long segment too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        return _decodeChildren(data, offset, offset + 1 + lengthLength, lengthLength + length);
    }
    else if (data[offset] >= 0xc0) {
        const length = data[offset] - 0xc0;
        if (offset + 1 + length > data.length) {
            logger$a.throwError("data array too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        return _decodeChildren(data, offset, offset + 1, length);
    }
    else if (data[offset] >= 0xb8) {
        const lengthLength = data[offset] - 0xb7;
        if (offset + 1 + lengthLength > data.length) {
            logger$a.throwError("data array too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const length = unarrayifyInteger(data, offset + 1, lengthLength);
        if (offset + 1 + lengthLength + length > data.length) {
            logger$a.throwError("data array too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const result = hexlify(data.slice(offset + 1 + lengthLength, offset + 1 + lengthLength + length));
        return { consumed: (1 + lengthLength + length), result: result };
    }
    else if (data[offset] >= 0x80) {
        const length = data[offset] - 0x80;
        if (offset + 1 + length > data.length) {
            logger$a.throwError("data too short", Logger.errors.BUFFER_OVERRUN, {});
        }
        const result = hexlify(data.slice(offset + 1, offset + 1 + length));
        return { consumed: (1 + length), result: result };
    }
    return { consumed: 1, result: hexlify(data[offset]) };
}
function decode(data) {
    const bytes = arrayify(data);
    const decoded = _decode(bytes, 0);
    if (decoded.consumed !== bytes.length) {
        logger$a.throwArgumentError("invalid rlp data", "data", data);
    }
    return decoded.result;
}

const version$b = "address/5.0.3";

const logger$b = new Logger(version$b);
function getChecksumAddress(address) {
    if (!isHexString(address, 20)) {
        logger$b.throwArgumentError("invalid address", "address", address);
    }
    address = address.toLowerCase();
    const chars = address.substring(2).split("");
    const expanded = new Uint8Array(40);
    for (let i = 0; i < 40; i++) {
        expanded[i] = chars[i].charCodeAt(0);
    }
    const hashed = arrayify(keccak256(expanded));
    for (let i = 0; i < 40; i += 2) {
        if ((hashed[i >> 1] >> 4) >= 8) {
            chars[i] = chars[i].toUpperCase();
        }
        if ((hashed[i >> 1] & 0x0f) >= 8) {
            chars[i + 1] = chars[i + 1].toUpperCase();
        }
    }
    return "0x" + chars.join("");
}
// Shims for environments that are missing some required constants and functions
const MAX_SAFE_INTEGER = 0x1fffffffffffff;
function log10(x) {
    if (Math.log10) {
        return Math.log10(x);
    }
    return Math.log(x) / Math.LN10;
}
// See: https://en.wikipedia.org/wiki/International_Bank_Account_Number
// Create lookup table
const ibanLookup = {};
for (let i = 0; i < 10; i++) {
    ibanLookup[String(i)] = String(i);
}
for (let i = 0; i < 26; i++) {
    ibanLookup[String.fromCharCode(65 + i)] = String(10 + i);
}
// How many decimal digits can we process? (for 64-bit float, this is 15)
const safeDigits = Math.floor(log10(MAX_SAFE_INTEGER));
function ibanChecksum(address) {
    address = address.toUpperCase();
    address = address.substring(4) + address.substring(0, 2) + "00";
    let expanded = address.split("").map((c) => { return ibanLookup[c]; }).join("");
    // Javascript can handle integers safely up to 15 (decimal) digits
    while (expanded.length >= safeDigits) {
        let block = expanded.substring(0, safeDigits);
        expanded = parseInt(block, 10) % 97 + expanded.substring(block.length);
    }
    let checksum = String(98 - (parseInt(expanded, 10) % 97));
    while (checksum.length < 2) {
        checksum = "0" + checksum;
    }
    return checksum;
}
function getAddress(address) {
    let result = null;
    if (typeof (address) !== "string") {
        logger$b.throwArgumentError("invalid address", "address", address);
    }
    if (address.match(/^(0x)?[0-9a-fA-F]{40}$/)) {
        // Missing the 0x prefix
        if (address.substring(0, 2) !== "0x") {
            address = "0x" + address;
        }
        result = getChecksumAddress(address);
        // It is a checksummed address with a bad checksum
        if (address.match(/([A-F].*[a-f])|([a-f].*[A-F])/) && result !== address) {
            logger$b.throwArgumentError("bad address checksum", "address", address);
        }
        // Maybe ICAP? (we only support direct mode)
    }
    else if (address.match(/^XE[0-9]{2}[0-9A-Za-z]{30,31}$/)) {
        // It is an ICAP address with a bad checksum
        if (address.substring(2, 4) !== ibanChecksum(address)) {
            logger$b.throwArgumentError("bad icap checksum", "address", address);
        }
        result = (new bn_1(address.substring(4), 36)).toString(16);
        while (result.length < 40) {
            result = "0" + result;
        }
        result = getChecksumAddress("0x" + result);
    }
    else {
        logger$b.throwArgumentError("invalid address", "address", address);
    }
    return result;
}
// http://ethereum.stackexchange.com/questions/760/how-is-the-address-of-an-ethereum-contract-computed
function getContractAddress(transaction) {
    let from = null;
    try {
        from = getAddress(transaction.from);
    }
    catch (error) {
        logger$b.throwArgumentError("missing from address", "transaction", transaction);
    }
    const nonce = stripZeros(arrayify(BigNumber.from(transaction.nonce).toHexString()));
    return getAddress(hexDataSlice(keccak256(encode([from, nonce])), 12));
}

var name = "elliptic";
var version$c = "6.5.3";
var description = "EC cryptography";
var main = "lib/elliptic.js";
var files = [
	"lib"
];
var scripts = {
	jscs: "jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",
	jshint: "jscs benchmarks/*.js lib/*.js lib/**/*.js lib/**/**/*.js test/index.js",
	lint: "npm run jscs && npm run jshint",
	unit: "istanbul test _mocha --reporter=spec test/index.js",
	test: "npm run lint && npm run unit",
	version: "grunt dist && git add dist/"
};
var repository = {
	type: "git",
	url: "git@github.com:indutny/elliptic"
};
var keywords = [
	"EC",
	"Elliptic",
	"curve",
	"Cryptography"
];
var author = "Fedor Indutny <fedor@indutny.com>";
var license = "MIT";
var bugs = {
	url: "https://github.com/indutny/elliptic/issues"
};
var homepage = "https://github.com/indutny/elliptic";
var devDependencies = {
	brfs: "^1.4.3",
	coveralls: "^3.0.8",
	grunt: "^1.0.4",
	"grunt-browserify": "^5.0.0",
	"grunt-cli": "^1.2.0",
	"grunt-contrib-connect": "^1.0.0",
	"grunt-contrib-copy": "^1.0.0",
	"grunt-contrib-uglify": "^1.0.1",
	"grunt-mocha-istanbul": "^3.0.1",
	"grunt-saucelabs": "^9.0.1",
	istanbul: "^0.4.2",
	jscs: "^3.0.7",
	jshint: "^2.10.3",
	mocha: "^6.2.2"
};
var dependencies = {
	"bn.js": "^4.4.0",
	brorand: "^1.0.1",
	"hash.js": "^1.0.0",
	"hmac-drbg": "^1.0.0",
	inherits: "^2.0.1",
	"minimalistic-assert": "^1.0.0",
	"minimalistic-crypto-utils": "^1.0.0"
};
var _package = {
	name: name,
	version: version$c,
	description: description,
	main: main,
	files: files,
	scripts: scripts,
	repository: repository,
	keywords: keywords,
	author: author,
	license: license,
	bugs: bugs,
	homepage: homepage,
	devDependencies: devDependencies,
	dependencies: dependencies
};

var _package$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  name: name,
  version: version$c,
  description: description,
  main: main,
  files: files,
  scripts: scripts,
  repository: repository,
  keywords: keywords,
  author: author,
  license: license,
  bugs: bugs,
  homepage: homepage,
  devDependencies: devDependencies,
  dependencies: dependencies,
  'default': _package
});

var minimalisticAssert = assert;

function assert(val, msg) {
  if (!val)
    throw new Error(msg || 'Assertion failed');
}

assert.equal = function assertEqual(l, r, msg) {
  if (l != r)
    throw new Error(msg || ('Assertion failed: ' + l + ' != ' + r));
};

var utils_1 = createCommonjsModule(function (module, exports) {

var utils = exports;

function toArray(msg, enc) {
  if (Array.isArray(msg))
    return msg.slice();
  if (!msg)
    return [];
  var res = [];
  if (typeof msg !== 'string') {
    for (var i = 0; i < msg.length; i++)
      res[i] = msg[i] | 0;
    return res;
  }
  if (enc === 'hex') {
    msg = msg.replace(/[^a-z0-9]+/ig, '');
    if (msg.length % 2 !== 0)
      msg = '0' + msg;
    for (var i = 0; i < msg.length; i += 2)
      res.push(parseInt(msg[i] + msg[i + 1], 16));
  } else {
    for (var i = 0; i < msg.length; i++) {
      var c = msg.charCodeAt(i);
      var hi = c >> 8;
      var lo = c & 0xff;
      if (hi)
        res.push(hi, lo);
      else
        res.push(lo);
    }
  }
  return res;
}
utils.toArray = toArray;

function zero2(word) {
  if (word.length === 1)
    return '0' + word;
  else
    return word;
}
utils.zero2 = zero2;

function toHex(msg) {
  var res = '';
  for (var i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));
  return res;
}
utils.toHex = toHex;

utils.encode = function encode(arr, enc) {
  if (enc === 'hex')
    return toHex(arr);
  else
    return arr;
};
});

var utils_1$1 = createCommonjsModule(function (module, exports) {

var utils = exports;




utils.assert = minimalisticAssert;
utils.toArray = utils_1.toArray;
utils.zero2 = utils_1.zero2;
utils.toHex = utils_1.toHex;
utils.encode = utils_1.encode;

// Represent num in a w-NAF form
function getNAF(num, w, bits) {
  var naf = new Array(Math.max(num.bitLength(), bits) + 1);
  naf.fill(0);

  var ws = 1 << (w + 1);
  var k = num.clone();

  for (var i = 0; i < naf.length; i++) {
    var z;
    var mod = k.andln(ws - 1);
    if (k.isOdd()) {
      if (mod > (ws >> 1) - 1)
        z = (ws >> 1) - mod;
      else
        z = mod;
      k.isubn(z);
    } else {
      z = 0;
    }

    naf[i] = z;
    k.iushrn(1);
  }

  return naf;
}
utils.getNAF = getNAF;

// Represent k1, k2 in a Joint Sparse Form
function getJSF(k1, k2) {
  var jsf = [
    [],
    []
  ];

  k1 = k1.clone();
  k2 = k2.clone();
  var d1 = 0;
  var d2 = 0;
  while (k1.cmpn(-d1) > 0 || k2.cmpn(-d2) > 0) {

    // First phase
    var m14 = (k1.andln(3) + d1) & 3;
    var m24 = (k2.andln(3) + d2) & 3;
    if (m14 === 3)
      m14 = -1;
    if (m24 === 3)
      m24 = -1;
    var u1;
    if ((m14 & 1) === 0) {
      u1 = 0;
    } else {
      var m8 = (k1.andln(7) + d1) & 7;
      if ((m8 === 3 || m8 === 5) && m24 === 2)
        u1 = -m14;
      else
        u1 = m14;
    }
    jsf[0].push(u1);

    var u2;
    if ((m24 & 1) === 0) {
      u2 = 0;
    } else {
      var m8 = (k2.andln(7) + d2) & 7;
      if ((m8 === 3 || m8 === 5) && m14 === 2)
        u2 = -m24;
      else
        u2 = m24;
    }
    jsf[1].push(u2);

    // Second phase
    if (2 * d1 === u1 + 1)
      d1 = 1 - d1;
    if (2 * d2 === u2 + 1)
      d2 = 1 - d2;
    k1.iushrn(1);
    k2.iushrn(1);
  }

  return jsf;
}
utils.getJSF = getJSF;

function cachedProperty(obj, name, computer) {
  var key = '_' + name;
  obj.prototype[name] = function cachedProperty() {
    return this[key] !== undefined ? this[key] :
           this[key] = computer.call(this);
  };
}
utils.cachedProperty = cachedProperty;

function parseBytes(bytes) {
  return typeof bytes === 'string' ? utils.toArray(bytes, 'hex') :
                                     bytes;
}
utils.parseBytes = parseBytes;

function intFromLE(bytes) {
  return new bn(bytes, 'hex', 'le');
}
utils.intFromLE = intFromLE;
});

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
  __proto__: null,
  'default': _nodeResolve_empty
});

var require$$0$1 = getCjsExportFromNamespace(_nodeResolve_empty$1);

var r;

var brorand = function rand(len) {
  if (!r)
    r = new Rand(null);

  return r.generate(len);
};

function Rand(rand) {
  this.rand = rand;
}
var Rand_1 = Rand;

Rand.prototype.generate = function generate(len) {
  return this._rand(len);
};

// Emulate crypto API using randy
Rand.prototype._rand = function _rand(n) {
  if (this.rand.getBytes)
    return this.rand.getBytes(n);

  var res = new Uint8Array(n);
  for (var i = 0; i < res.length; i++)
    res[i] = this.rand.getByte();
  return res;
};

if (typeof self === 'object') {
  if (self.crypto && self.crypto.getRandomValues) {
    // Modern browsers
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      self.crypto.getRandomValues(arr);
      return arr;
    };
  } else if (self.msCrypto && self.msCrypto.getRandomValues) {
    // IE
    Rand.prototype._rand = function _rand(n) {
      var arr = new Uint8Array(n);
      self.msCrypto.getRandomValues(arr);
      return arr;
    };

  // Safari's WebWorkers do not have `crypto`
  } else if (typeof window === 'object') {
    // Old junk
    Rand.prototype._rand = function() {
      throw new Error('Not implemented yet');
    };
  }
} else {
  // Node.js or Web worker with no crypto support
  try {
    var crypto = require$$0$1;
    if (typeof crypto.randomBytes !== 'function')
      throw new Error('Not supported');

    Rand.prototype._rand = function _rand(n) {
      return crypto.randomBytes(n);
    };
  } catch (e) {
  }
}
brorand.Rand = Rand_1;

var getNAF = utils_1$1.getNAF;
var getJSF = utils_1$1.getJSF;
var assert$1 = utils_1$1.assert;

function BaseCurve(type, conf) {
  this.type = type;
  this.p = new bn(conf.p, 16);

  // Use Montgomery, when there is no fast reduction for the prime
  this.red = conf.prime ? bn.red(conf.prime) : bn.mont(this.p);

  // Useful for many curves
  this.zero = new bn(0).toRed(this.red);
  this.one = new bn(1).toRed(this.red);
  this.two = new bn(2).toRed(this.red);

  // Curve configuration, optional
  this.n = conf.n && new bn(conf.n, 16);
  this.g = conf.g && this.pointFromJSON(conf.g, conf.gRed);

  // Temporary arrays
  this._wnafT1 = new Array(4);
  this._wnafT2 = new Array(4);
  this._wnafT3 = new Array(4);
  this._wnafT4 = new Array(4);

  this._bitLength = this.n ? this.n.bitLength() : 0;

  // Generalized Greg Maxwell's trick
  var adjustCount = this.n && this.p.div(this.n);
  if (!adjustCount || adjustCount.cmpn(100) > 0) {
    this.redN = null;
  } else {
    this._maxwellTrick = true;
    this.redN = this.n.toRed(this.red);
  }
}
var base = BaseCurve;

BaseCurve.prototype.point = function point() {
  throw new Error('Not implemented');
};

BaseCurve.prototype.validate = function validate() {
  throw new Error('Not implemented');
};

BaseCurve.prototype._fixedNafMul = function _fixedNafMul(p, k) {
  assert$1(p.precomputed);
  var doubles = p._getDoubles();

  var naf = getNAF(k, 1, this._bitLength);
  var I = (1 << (doubles.step + 1)) - (doubles.step % 2 === 0 ? 2 : 1);
  I /= 3;

  // Translate into more windowed form
  var repr = [];
  for (var j = 0; j < naf.length; j += doubles.step) {
    var nafW = 0;
    for (var k = j + doubles.step - 1; k >= j; k--)
      nafW = (nafW << 1) + naf[k];
    repr.push(nafW);
  }

  var a = this.jpoint(null, null, null);
  var b = this.jpoint(null, null, null);
  for (var i = I; i > 0; i--) {
    for (var j = 0; j < repr.length; j++) {
      var nafW = repr[j];
      if (nafW === i)
        b = b.mixedAdd(doubles.points[j]);
      else if (nafW === -i)
        b = b.mixedAdd(doubles.points[j].neg());
    }
    a = a.add(b);
  }
  return a.toP();
};

BaseCurve.prototype._wnafMul = function _wnafMul(p, k) {
  var w = 4;

  // Precompute window
  var nafPoints = p._getNAFPoints(w);
  w = nafPoints.wnd;
  var wnd = nafPoints.points;

  // Get NAF form
  var naf = getNAF(k, w, this._bitLength);

  // Add `this`*(N+1) for every w-NAF index
  var acc = this.jpoint(null, null, null);
  for (var i = naf.length - 1; i >= 0; i--) {
    // Count zeroes
    for (var k = 0; i >= 0 && naf[i] === 0; i--)
      k++;
    if (i >= 0)
      k++;
    acc = acc.dblp(k);

    if (i < 0)
      break;
    var z = naf[i];
    assert$1(z !== 0);
    if (p.type === 'affine') {
      // J +- P
      if (z > 0)
        acc = acc.mixedAdd(wnd[(z - 1) >> 1]);
      else
        acc = acc.mixedAdd(wnd[(-z - 1) >> 1].neg());
    } else {
      // J +- J
      if (z > 0)
        acc = acc.add(wnd[(z - 1) >> 1]);
      else
        acc = acc.add(wnd[(-z - 1) >> 1].neg());
    }
  }
  return p.type === 'affine' ? acc.toP() : acc;
};

BaseCurve.prototype._wnafMulAdd = function _wnafMulAdd(defW,
                                                       points,
                                                       coeffs,
                                                       len,
                                                       jacobianResult) {
  var wndWidth = this._wnafT1;
  var wnd = this._wnafT2;
  var naf = this._wnafT3;

  // Fill all arrays
  var max = 0;
  for (var i = 0; i < len; i++) {
    var p = points[i];
    var nafPoints = p._getNAFPoints(defW);
    wndWidth[i] = nafPoints.wnd;
    wnd[i] = nafPoints.points;
  }

  // Comb small window NAFs
  for (var i = len - 1; i >= 1; i -= 2) {
    var a = i - 1;
    var b = i;
    if (wndWidth[a] !== 1 || wndWidth[b] !== 1) {
      naf[a] = getNAF(coeffs[a], wndWidth[a], this._bitLength);
      naf[b] = getNAF(coeffs[b], wndWidth[b], this._bitLength);
      max = Math.max(naf[a].length, max);
      max = Math.max(naf[b].length, max);
      continue;
    }

    var comb = [
      points[a], /* 1 */
      null, /* 3 */
      null, /* 5 */
      points[b] /* 7 */
    ];

    // Try to avoid Projective points, if possible
    if (points[a].y.cmp(points[b].y) === 0) {
      comb[1] = points[a].add(points[b]);
      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
    } else if (points[a].y.cmp(points[b].y.redNeg()) === 0) {
      comb[1] = points[a].toJ().mixedAdd(points[b]);
      comb[2] = points[a].add(points[b].neg());
    } else {
      comb[1] = points[a].toJ().mixedAdd(points[b]);
      comb[2] = points[a].toJ().mixedAdd(points[b].neg());
    }

    var index = [
      -3, /* -1 -1 */
      -1, /* -1 0 */
      -5, /* -1 1 */
      -7, /* 0 -1 */
      0, /* 0 0 */
      7, /* 0 1 */
      5, /* 1 -1 */
      1, /* 1 0 */
      3  /* 1 1 */
    ];

    var jsf = getJSF(coeffs[a], coeffs[b]);
    max = Math.max(jsf[0].length, max);
    naf[a] = new Array(max);
    naf[b] = new Array(max);
    for (var j = 0; j < max; j++) {
      var ja = jsf[0][j] | 0;
      var jb = jsf[1][j] | 0;

      naf[a][j] = index[(ja + 1) * 3 + (jb + 1)];
      naf[b][j] = 0;
      wnd[a] = comb;
    }
  }

  var acc = this.jpoint(null, null, null);
  var tmp = this._wnafT4;
  for (var i = max; i >= 0; i--) {
    var k = 0;

    while (i >= 0) {
      var zero = true;
      for (var j = 0; j < len; j++) {
        tmp[j] = naf[j][i] | 0;
        if (tmp[j] !== 0)
          zero = false;
      }
      if (!zero)
        break;
      k++;
      i--;
    }
    if (i >= 0)
      k++;
    acc = acc.dblp(k);
    if (i < 0)
      break;

    for (var j = 0; j < len; j++) {
      var z = tmp[j];
      var p;
      if (z === 0)
        continue;
      else if (z > 0)
        p = wnd[j][(z - 1) >> 1];
      else if (z < 0)
        p = wnd[j][(-z - 1) >> 1].neg();

      if (p.type === 'affine')
        acc = acc.mixedAdd(p);
      else
        acc = acc.add(p);
    }
  }
  // Zeroify references
  for (var i = 0; i < len; i++)
    wnd[i] = null;

  if (jacobianResult)
    return acc;
  else
    return acc.toP();
};

function BasePoint(curve, type) {
  this.curve = curve;
  this.type = type;
  this.precomputed = null;
}
BaseCurve.BasePoint = BasePoint;

BasePoint.prototype.eq = function eq(/*other*/) {
  throw new Error('Not implemented');
};

BasePoint.prototype.validate = function validate() {
  return this.curve.validate(this);
};

BaseCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
  bytes = utils_1$1.toArray(bytes, enc);

  var len = this.p.byteLength();

  // uncompressed, hybrid-odd, hybrid-even
  if ((bytes[0] === 0x04 || bytes[0] === 0x06 || bytes[0] === 0x07) &&
      bytes.length - 1 === 2 * len) {
    if (bytes[0] === 0x06)
      assert$1(bytes[bytes.length - 1] % 2 === 0);
    else if (bytes[0] === 0x07)
      assert$1(bytes[bytes.length - 1] % 2 === 1);

    var res =  this.point(bytes.slice(1, 1 + len),
                          bytes.slice(1 + len, 1 + 2 * len));

    return res;
  } else if ((bytes[0] === 0x02 || bytes[0] === 0x03) &&
              bytes.length - 1 === len) {
    return this.pointFromX(bytes.slice(1, 1 + len), bytes[0] === 0x03);
  }
  throw new Error('Unknown point format');
};

BasePoint.prototype.encodeCompressed = function encodeCompressed(enc) {
  return this.encode(enc, true);
};

BasePoint.prototype._encode = function _encode(compact) {
  var len = this.curve.p.byteLength();
  var x = this.getX().toArray('be', len);

  if (compact)
    return [ this.getY().isEven() ? 0x02 : 0x03 ].concat(x);

  return [ 0x04 ].concat(x, this.getY().toArray('be', len)) ;
};

BasePoint.prototype.encode = function encode(enc, compact) {
  return utils_1$1.encode(this._encode(compact), enc);
};

BasePoint.prototype.precompute = function precompute(power) {
  if (this.precomputed)
    return this;

  var precomputed = {
    doubles: null,
    naf: null,
    beta: null
  };
  precomputed.naf = this._getNAFPoints(8);
  precomputed.doubles = this._getDoubles(4, power);
  precomputed.beta = this._getBeta();
  this.precomputed = precomputed;

  return this;
};

BasePoint.prototype._hasDoubles = function _hasDoubles(k) {
  if (!this.precomputed)
    return false;

  var doubles = this.precomputed.doubles;
  if (!doubles)
    return false;

  return doubles.points.length >= Math.ceil((k.bitLength() + 1) / doubles.step);
};

BasePoint.prototype._getDoubles = function _getDoubles(step, power) {
  if (this.precomputed && this.precomputed.doubles)
    return this.precomputed.doubles;

  var doubles = [ this ];
  var acc = this;
  for (var i = 0; i < power; i += step) {
    for (var j = 0; j < step; j++)
      acc = acc.dbl();
    doubles.push(acc);
  }
  return {
    step: step,
    points: doubles
  };
};

BasePoint.prototype._getNAFPoints = function _getNAFPoints(wnd) {
  if (this.precomputed && this.precomputed.naf)
    return this.precomputed.naf;

  var res = [ this ];
  var max = (1 << wnd) - 1;
  var dbl = max === 1 ? null : this.dbl();
  for (var i = 1; i < max; i++)
    res[i] = res[i - 1].add(dbl);
  return {
    wnd: wnd,
    points: res
  };
};

BasePoint.prototype._getBeta = function _getBeta() {
  return null;
};

BasePoint.prototype.dblp = function dblp(k) {
  var r = this;
  for (var i = 0; i < k; i++)
    r = r.dbl();
  return r;
};

var assert$2 = utils_1$1.assert;

function ShortCurve(conf) {
  base.call(this, 'short', conf);

  this.a = new bn(conf.a, 16).toRed(this.red);
  this.b = new bn(conf.b, 16).toRed(this.red);
  this.tinv = this.two.redInvm();

  this.zeroA = this.a.fromRed().cmpn(0) === 0;
  this.threeA = this.a.fromRed().sub(this.p).cmpn(-3) === 0;

  // If the curve is endomorphic, precalculate beta and lambda
  this.endo = this._getEndomorphism(conf);
  this._endoWnafT1 = new Array(4);
  this._endoWnafT2 = new Array(4);
}
inherits_browser(ShortCurve, base);
var short_1 = ShortCurve;

ShortCurve.prototype._getEndomorphism = function _getEndomorphism(conf) {
  // No efficient endomorphism
  if (!this.zeroA || !this.g || !this.n || this.p.modn(3) !== 1)
    return;

  // Compute beta and lambda, that lambda * P = (beta * Px; Py)
  var beta;
  var lambda;
  if (conf.beta) {
    beta = new bn(conf.beta, 16).toRed(this.red);
  } else {
    var betas = this._getEndoRoots(this.p);
    // Choose the smallest beta
    beta = betas[0].cmp(betas[1]) < 0 ? betas[0] : betas[1];
    beta = beta.toRed(this.red);
  }
  if (conf.lambda) {
    lambda = new bn(conf.lambda, 16);
  } else {
    // Choose the lambda that is matching selected beta
    var lambdas = this._getEndoRoots(this.n);
    if (this.g.mul(lambdas[0]).x.cmp(this.g.x.redMul(beta)) === 0) {
      lambda = lambdas[0];
    } else {
      lambda = lambdas[1];
      assert$2(this.g.mul(lambda).x.cmp(this.g.x.redMul(beta)) === 0);
    }
  }

  // Get basis vectors, used for balanced length-two representation
  var basis;
  if (conf.basis) {
    basis = conf.basis.map(function(vec) {
      return {
        a: new bn(vec.a, 16),
        b: new bn(vec.b, 16)
      };
    });
  } else {
    basis = this._getEndoBasis(lambda);
  }

  return {
    beta: beta,
    lambda: lambda,
    basis: basis
  };
};

ShortCurve.prototype._getEndoRoots = function _getEndoRoots(num) {
  // Find roots of for x^2 + x + 1 in F
  // Root = (-1 +- Sqrt(-3)) / 2
  //
  var red = num === this.p ? this.red : bn.mont(num);
  var tinv = new bn(2).toRed(red).redInvm();
  var ntinv = tinv.redNeg();

  var s = new bn(3).toRed(red).redNeg().redSqrt().redMul(tinv);

  var l1 = ntinv.redAdd(s).fromRed();
  var l2 = ntinv.redSub(s).fromRed();
  return [ l1, l2 ];
};

ShortCurve.prototype._getEndoBasis = function _getEndoBasis(lambda) {
  // aprxSqrt >= sqrt(this.n)
  var aprxSqrt = this.n.ushrn(Math.floor(this.n.bitLength() / 2));

  // 3.74
  // Run EGCD, until r(L + 1) < aprxSqrt
  var u = lambda;
  var v = this.n.clone();
  var x1 = new bn(1);
  var y1 = new bn(0);
  var x2 = new bn(0);
  var y2 = new bn(1);

  // NOTE: all vectors are roots of: a + b * lambda = 0 (mod n)
  var a0;
  var b0;
  // First vector
  var a1;
  var b1;
  // Second vector
  var a2;
  var b2;

  var prevR;
  var i = 0;
  var r;
  var x;
  while (u.cmpn(0) !== 0) {
    var q = v.div(u);
    r = v.sub(q.mul(u));
    x = x2.sub(q.mul(x1));
    var y = y2.sub(q.mul(y1));

    if (!a1 && r.cmp(aprxSqrt) < 0) {
      a0 = prevR.neg();
      b0 = x1;
      a1 = r.neg();
      b1 = x;
    } else if (a1 && ++i === 2) {
      break;
    }
    prevR = r;

    v = u;
    u = r;
    x2 = x1;
    x1 = x;
    y2 = y1;
    y1 = y;
  }
  a2 = r.neg();
  b2 = x;

  var len1 = a1.sqr().add(b1.sqr());
  var len2 = a2.sqr().add(b2.sqr());
  if (len2.cmp(len1) >= 0) {
    a2 = a0;
    b2 = b0;
  }

  // Normalize signs
  if (a1.negative) {
    a1 = a1.neg();
    b1 = b1.neg();
  }
  if (a2.negative) {
    a2 = a2.neg();
    b2 = b2.neg();
  }

  return [
    { a: a1, b: b1 },
    { a: a2, b: b2 }
  ];
};

ShortCurve.prototype._endoSplit = function _endoSplit(k) {
  var basis = this.endo.basis;
  var v1 = basis[0];
  var v2 = basis[1];

  var c1 = v2.b.mul(k).divRound(this.n);
  var c2 = v1.b.neg().mul(k).divRound(this.n);

  var p1 = c1.mul(v1.a);
  var p2 = c2.mul(v2.a);
  var q1 = c1.mul(v1.b);
  var q2 = c2.mul(v2.b);

  // Calculate answer
  var k1 = k.sub(p1).sub(p2);
  var k2 = q1.add(q2).neg();
  return { k1: k1, k2: k2 };
};

ShortCurve.prototype.pointFromX = function pointFromX(x, odd) {
  x = new bn(x, 16);
  if (!x.red)
    x = x.toRed(this.red);

  var y2 = x.redSqr().redMul(x).redIAdd(x.redMul(this.a)).redIAdd(this.b);
  var y = y2.redSqrt();
  if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
    throw new Error('invalid point');

  // XXX Is there any way to tell if the number is odd without converting it
  // to non-red form?
  var isOdd = y.fromRed().isOdd();
  if (odd && !isOdd || !odd && isOdd)
    y = y.redNeg();

  return this.point(x, y);
};

ShortCurve.prototype.validate = function validate(point) {
  if (point.inf)
    return true;

  var x = point.x;
  var y = point.y;

  var ax = this.a.redMul(x);
  var rhs = x.redSqr().redMul(x).redIAdd(ax).redIAdd(this.b);
  return y.redSqr().redISub(rhs).cmpn(0) === 0;
};

ShortCurve.prototype._endoWnafMulAdd =
    function _endoWnafMulAdd(points, coeffs, jacobianResult) {
  var npoints = this._endoWnafT1;
  var ncoeffs = this._endoWnafT2;
  for (var i = 0; i < points.length; i++) {
    var split = this._endoSplit(coeffs[i]);
    var p = points[i];
    var beta = p._getBeta();

    if (split.k1.negative) {
      split.k1.ineg();
      p = p.neg(true);
    }
    if (split.k2.negative) {
      split.k2.ineg();
      beta = beta.neg(true);
    }

    npoints[i * 2] = p;
    npoints[i * 2 + 1] = beta;
    ncoeffs[i * 2] = split.k1;
    ncoeffs[i * 2 + 1] = split.k2;
  }
  var res = this._wnafMulAdd(1, npoints, ncoeffs, i * 2, jacobianResult);

  // Clean-up references to points and coefficients
  for (var j = 0; j < i * 2; j++) {
    npoints[j] = null;
    ncoeffs[j] = null;
  }
  return res;
};

function Point(curve, x, y, isRed) {
  base.BasePoint.call(this, curve, 'affine');
  if (x === null && y === null) {
    this.x = null;
    this.y = null;
    this.inf = true;
  } else {
    this.x = new bn(x, 16);
    this.y = new bn(y, 16);
    // Force redgomery representation when loading from JSON
    if (isRed) {
      this.x.forceRed(this.curve.red);
      this.y.forceRed(this.curve.red);
    }
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.y.red)
      this.y = this.y.toRed(this.curve.red);
    this.inf = false;
  }
}
inherits_browser(Point, base.BasePoint);

ShortCurve.prototype.point = function point(x, y, isRed) {
  return new Point(this, x, y, isRed);
};

ShortCurve.prototype.pointFromJSON = function pointFromJSON(obj, red) {
  return Point.fromJSON(this, obj, red);
};

Point.prototype._getBeta = function _getBeta() {
  if (!this.curve.endo)
    return;

  var pre = this.precomputed;
  if (pre && pre.beta)
    return pre.beta;

  var beta = this.curve.point(this.x.redMul(this.curve.endo.beta), this.y);
  if (pre) {
    var curve = this.curve;
    var endoMul = function(p) {
      return curve.point(p.x.redMul(curve.endo.beta), p.y);
    };
    pre.beta = beta;
    beta.precomputed = {
      beta: null,
      naf: pre.naf && {
        wnd: pre.naf.wnd,
        points: pre.naf.points.map(endoMul)
      },
      doubles: pre.doubles && {
        step: pre.doubles.step,
        points: pre.doubles.points.map(endoMul)
      }
    };
  }
  return beta;
};

Point.prototype.toJSON = function toJSON() {
  if (!this.precomputed)
    return [ this.x, this.y ];

  return [ this.x, this.y, this.precomputed && {
    doubles: this.precomputed.doubles && {
      step: this.precomputed.doubles.step,
      points: this.precomputed.doubles.points.slice(1)
    },
    naf: this.precomputed.naf && {
      wnd: this.precomputed.naf.wnd,
      points: this.precomputed.naf.points.slice(1)
    }
  } ];
};

Point.fromJSON = function fromJSON(curve, obj, red) {
  if (typeof obj === 'string')
    obj = JSON.parse(obj);
  var res = curve.point(obj[0], obj[1], red);
  if (!obj[2])
    return res;

  function obj2point(obj) {
    return curve.point(obj[0], obj[1], red);
  }

  var pre = obj[2];
  res.precomputed = {
    beta: null,
    doubles: pre.doubles && {
      step: pre.doubles.step,
      points: [ res ].concat(pre.doubles.points.map(obj2point))
    },
    naf: pre.naf && {
      wnd: pre.naf.wnd,
      points: [ res ].concat(pre.naf.points.map(obj2point))
    }
  };
  return res;
};

Point.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' y: ' + this.y.fromRed().toString(16, 2) + '>';
};

Point.prototype.isInfinity = function isInfinity() {
  return this.inf;
};

Point.prototype.add = function add(p) {
  // O + P = P
  if (this.inf)
    return p;

  // P + O = P
  if (p.inf)
    return this;

  // P + P = 2P
  if (this.eq(p))
    return this.dbl();

  // P + (-P) = O
  if (this.neg().eq(p))
    return this.curve.point(null, null);

  // P + Q = O
  if (this.x.cmp(p.x) === 0)
    return this.curve.point(null, null);

  var c = this.y.redSub(p.y);
  if (c.cmpn(0) !== 0)
    c = c.redMul(this.x.redSub(p.x).redInvm());
  var nx = c.redSqr().redISub(this.x).redISub(p.x);
  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
  return this.curve.point(nx, ny);
};

Point.prototype.dbl = function dbl() {
  if (this.inf)
    return this;

  // 2P = O
  var ys1 = this.y.redAdd(this.y);
  if (ys1.cmpn(0) === 0)
    return this.curve.point(null, null);

  var a = this.curve.a;

  var x2 = this.x.redSqr();
  var dyinv = ys1.redInvm();
  var c = x2.redAdd(x2).redIAdd(x2).redIAdd(a).redMul(dyinv);

  var nx = c.redSqr().redISub(this.x.redAdd(this.x));
  var ny = c.redMul(this.x.redSub(nx)).redISub(this.y);
  return this.curve.point(nx, ny);
};

Point.prototype.getX = function getX() {
  return this.x.fromRed();
};

Point.prototype.getY = function getY() {
  return this.y.fromRed();
};

Point.prototype.mul = function mul(k) {
  k = new bn(k, 16);
  if (this.isInfinity())
    return this;
  else if (this._hasDoubles(k))
    return this.curve._fixedNafMul(this, k);
  else if (this.curve.endo)
    return this.curve._endoWnafMulAdd([ this ], [ k ]);
  else
    return this.curve._wnafMul(this, k);
};

Point.prototype.mulAdd = function mulAdd(k1, p2, k2) {
  var points = [ this, p2 ];
  var coeffs = [ k1, k2 ];
  if (this.curve.endo)
    return this.curve._endoWnafMulAdd(points, coeffs);
  else
    return this.curve._wnafMulAdd(1, points, coeffs, 2);
};

Point.prototype.jmulAdd = function jmulAdd(k1, p2, k2) {
  var points = [ this, p2 ];
  var coeffs = [ k1, k2 ];
  if (this.curve.endo)
    return this.curve._endoWnafMulAdd(points, coeffs, true);
  else
    return this.curve._wnafMulAdd(1, points, coeffs, 2, true);
};

Point.prototype.eq = function eq(p) {
  return this === p ||
         this.inf === p.inf &&
             (this.inf || this.x.cmp(p.x) === 0 && this.y.cmp(p.y) === 0);
};

Point.prototype.neg = function neg(_precompute) {
  if (this.inf)
    return this;

  var res = this.curve.point(this.x, this.y.redNeg());
  if (_precompute && this.precomputed) {
    var pre = this.precomputed;
    var negate = function(p) {
      return p.neg();
    };
    res.precomputed = {
      naf: pre.naf && {
        wnd: pre.naf.wnd,
        points: pre.naf.points.map(negate)
      },
      doubles: pre.doubles && {
        step: pre.doubles.step,
        points: pre.doubles.points.map(negate)
      }
    };
  }
  return res;
};

Point.prototype.toJ = function toJ() {
  if (this.inf)
    return this.curve.jpoint(null, null, null);

  var res = this.curve.jpoint(this.x, this.y, this.curve.one);
  return res;
};

function JPoint(curve, x, y, z) {
  base.BasePoint.call(this, curve, 'jacobian');
  if (x === null && y === null && z === null) {
    this.x = this.curve.one;
    this.y = this.curve.one;
    this.z = new bn(0);
  } else {
    this.x = new bn(x, 16);
    this.y = new bn(y, 16);
    this.z = new bn(z, 16);
  }
  if (!this.x.red)
    this.x = this.x.toRed(this.curve.red);
  if (!this.y.red)
    this.y = this.y.toRed(this.curve.red);
  if (!this.z.red)
    this.z = this.z.toRed(this.curve.red);

  this.zOne = this.z === this.curve.one;
}
inherits_browser(JPoint, base.BasePoint);

ShortCurve.prototype.jpoint = function jpoint(x, y, z) {
  return new JPoint(this, x, y, z);
};

JPoint.prototype.toP = function toP() {
  if (this.isInfinity())
    return this.curve.point(null, null);

  var zinv = this.z.redInvm();
  var zinv2 = zinv.redSqr();
  var ax = this.x.redMul(zinv2);
  var ay = this.y.redMul(zinv2).redMul(zinv);

  return this.curve.point(ax, ay);
};

JPoint.prototype.neg = function neg() {
  return this.curve.jpoint(this.x, this.y.redNeg(), this.z);
};

JPoint.prototype.add = function add(p) {
  // O + P = P
  if (this.isInfinity())
    return p;

  // P + O = P
  if (p.isInfinity())
    return this;

  // 12M + 4S + 7A
  var pz2 = p.z.redSqr();
  var z2 = this.z.redSqr();
  var u1 = this.x.redMul(pz2);
  var u2 = p.x.redMul(z2);
  var s1 = this.y.redMul(pz2.redMul(p.z));
  var s2 = p.y.redMul(z2.redMul(this.z));

  var h = u1.redSub(u2);
  var r = s1.redSub(s2);
  if (h.cmpn(0) === 0) {
    if (r.cmpn(0) !== 0)
      return this.curve.jpoint(null, null, null);
    else
      return this.dbl();
  }

  var h2 = h.redSqr();
  var h3 = h2.redMul(h);
  var v = u1.redMul(h2);

  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
  var nz = this.z.redMul(p.z).redMul(h);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.mixedAdd = function mixedAdd(p) {
  // O + P = P
  if (this.isInfinity())
    return p.toJ();

  // P + O = P
  if (p.isInfinity())
    return this;

  // 8M + 3S + 7A
  var z2 = this.z.redSqr();
  var u1 = this.x;
  var u2 = p.x.redMul(z2);
  var s1 = this.y;
  var s2 = p.y.redMul(z2).redMul(this.z);

  var h = u1.redSub(u2);
  var r = s1.redSub(s2);
  if (h.cmpn(0) === 0) {
    if (r.cmpn(0) !== 0)
      return this.curve.jpoint(null, null, null);
    else
      return this.dbl();
  }

  var h2 = h.redSqr();
  var h3 = h2.redMul(h);
  var v = u1.redMul(h2);

  var nx = r.redSqr().redIAdd(h3).redISub(v).redISub(v);
  var ny = r.redMul(v.redISub(nx)).redISub(s1.redMul(h3));
  var nz = this.z.redMul(h);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.dblp = function dblp(pow) {
  if (pow === 0)
    return this;
  if (this.isInfinity())
    return this;
  if (!pow)
    return this.dbl();

  if (this.curve.zeroA || this.curve.threeA) {
    var r = this;
    for (var i = 0; i < pow; i++)
      r = r.dbl();
    return r;
  }

  // 1M + 2S + 1A + N * (4S + 5M + 8A)
  // N = 1 => 6M + 6S + 9A
  var a = this.curve.a;
  var tinv = this.curve.tinv;

  var jx = this.x;
  var jy = this.y;
  var jz = this.z;
  var jz4 = jz.redSqr().redSqr();

  // Reuse results
  var jyd = jy.redAdd(jy);
  for (var i = 0; i < pow; i++) {
    var jx2 = jx.redSqr();
    var jyd2 = jyd.redSqr();
    var jyd4 = jyd2.redSqr();
    var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

    var t1 = jx.redMul(jyd2);
    var nx = c.redSqr().redISub(t1.redAdd(t1));
    var t2 = t1.redISub(nx);
    var dny = c.redMul(t2);
    dny = dny.redIAdd(dny).redISub(jyd4);
    var nz = jyd.redMul(jz);
    if (i + 1 < pow)
      jz4 = jz4.redMul(jyd4);

    jx = nx;
    jz = nz;
    jyd = dny;
  }

  return this.curve.jpoint(jx, jyd.redMul(tinv), jz);
};

JPoint.prototype.dbl = function dbl() {
  if (this.isInfinity())
    return this;

  if (this.curve.zeroA)
    return this._zeroDbl();
  else if (this.curve.threeA)
    return this._threeDbl();
  else
    return this._dbl();
};

JPoint.prototype._zeroDbl = function _zeroDbl() {
  var nx;
  var ny;
  var nz;
  // Z = 1
  if (this.zOne) {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
    //     #doubling-mdbl-2007-bl
    // 1M + 5S + 14A

    // XX = X1^2
    var xx = this.x.redSqr();
    // YY = Y1^2
    var yy = this.y.redSqr();
    // YYYY = YY^2
    var yyyy = yy.redSqr();
    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
    s = s.redIAdd(s);
    // M = 3 * XX + a; a = 0
    var m = xx.redAdd(xx).redIAdd(xx);
    // T = M ^ 2 - 2*S
    var t = m.redSqr().redISub(s).redISub(s);

    // 8 * YYYY
    var yyyy8 = yyyy.redIAdd(yyyy);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    yyyy8 = yyyy8.redIAdd(yyyy8);

    // X3 = T
    nx = t;
    // Y3 = M * (S - T) - 8 * YYYY
    ny = m.redMul(s.redISub(t)).redISub(yyyy8);
    // Z3 = 2*Y1
    nz = this.y.redAdd(this.y);
  } else {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html
    //     #doubling-dbl-2009-l
    // 2M + 5S + 13A

    // A = X1^2
    var a = this.x.redSqr();
    // B = Y1^2
    var b = this.y.redSqr();
    // C = B^2
    var c = b.redSqr();
    // D = 2 * ((X1 + B)^2 - A - C)
    var d = this.x.redAdd(b).redSqr().redISub(a).redISub(c);
    d = d.redIAdd(d);
    // E = 3 * A
    var e = a.redAdd(a).redIAdd(a);
    // F = E^2
    var f = e.redSqr();

    // 8 * C
    var c8 = c.redIAdd(c);
    c8 = c8.redIAdd(c8);
    c8 = c8.redIAdd(c8);

    // X3 = F - 2 * D
    nx = f.redISub(d).redISub(d);
    // Y3 = E * (D - X3) - 8 * C
    ny = e.redMul(d.redISub(nx)).redISub(c8);
    // Z3 = 2 * Y1 * Z1
    nz = this.y.redMul(this.z);
    nz = nz.redIAdd(nz);
  }

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype._threeDbl = function _threeDbl() {
  var nx;
  var ny;
  var nz;
  // Z = 1
  if (this.zOne) {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html
    //     #doubling-mdbl-2007-bl
    // 1M + 5S + 15A

    // XX = X1^2
    var xx = this.x.redSqr();
    // YY = Y1^2
    var yy = this.y.redSqr();
    // YYYY = YY^2
    var yyyy = yy.redSqr();
    // S = 2 * ((X1 + YY)^2 - XX - YYYY)
    var s = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
    s = s.redIAdd(s);
    // M = 3 * XX + a
    var m = xx.redAdd(xx).redIAdd(xx).redIAdd(this.curve.a);
    // T = M^2 - 2 * S
    var t = m.redSqr().redISub(s).redISub(s);
    // X3 = T
    nx = t;
    // Y3 = M * (S - T) - 8 * YYYY
    var yyyy8 = yyyy.redIAdd(yyyy);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    yyyy8 = yyyy8.redIAdd(yyyy8);
    ny = m.redMul(s.redISub(t)).redISub(yyyy8);
    // Z3 = 2 * Y1
    nz = this.y.redAdd(this.y);
  } else {
    // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-3.html#doubling-dbl-2001-b
    // 3M + 5S

    // delta = Z1^2
    var delta = this.z.redSqr();
    // gamma = Y1^2
    var gamma = this.y.redSqr();
    // beta = X1 * gamma
    var beta = this.x.redMul(gamma);
    // alpha = 3 * (X1 - delta) * (X1 + delta)
    var alpha = this.x.redSub(delta).redMul(this.x.redAdd(delta));
    alpha = alpha.redAdd(alpha).redIAdd(alpha);
    // X3 = alpha^2 - 8 * beta
    var beta4 = beta.redIAdd(beta);
    beta4 = beta4.redIAdd(beta4);
    var beta8 = beta4.redAdd(beta4);
    nx = alpha.redSqr().redISub(beta8);
    // Z3 = (Y1 + Z1)^2 - gamma - delta
    nz = this.y.redAdd(this.z).redSqr().redISub(gamma).redISub(delta);
    // Y3 = alpha * (4 * beta - X3) - 8 * gamma^2
    var ggamma8 = gamma.redSqr();
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ggamma8 = ggamma8.redIAdd(ggamma8);
    ny = alpha.redMul(beta4.redISub(nx)).redISub(ggamma8);
  }

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype._dbl = function _dbl() {
  var a = this.curve.a;

  // 4M + 6S + 10A
  var jx = this.x;
  var jy = this.y;
  var jz = this.z;
  var jz4 = jz.redSqr().redSqr();

  var jx2 = jx.redSqr();
  var jy2 = jy.redSqr();

  var c = jx2.redAdd(jx2).redIAdd(jx2).redIAdd(a.redMul(jz4));

  var jxd4 = jx.redAdd(jx);
  jxd4 = jxd4.redIAdd(jxd4);
  var t1 = jxd4.redMul(jy2);
  var nx = c.redSqr().redISub(t1.redAdd(t1));
  var t2 = t1.redISub(nx);

  var jyd8 = jy2.redSqr();
  jyd8 = jyd8.redIAdd(jyd8);
  jyd8 = jyd8.redIAdd(jyd8);
  jyd8 = jyd8.redIAdd(jyd8);
  var ny = c.redMul(t2).redISub(jyd8);
  var nz = jy.redAdd(jy).redMul(jz);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.trpl = function trpl() {
  if (!this.curve.zeroA)
    return this.dbl().add(this);

  // hyperelliptic.org/EFD/g1p/auto-shortw-jacobian-0.html#tripling-tpl-2007-bl
  // 5M + 10S + ...

  // XX = X1^2
  var xx = this.x.redSqr();
  // YY = Y1^2
  var yy = this.y.redSqr();
  // ZZ = Z1^2
  var zz = this.z.redSqr();
  // YYYY = YY^2
  var yyyy = yy.redSqr();
  // M = 3 * XX + a * ZZ2; a = 0
  var m = xx.redAdd(xx).redIAdd(xx);
  // MM = M^2
  var mm = m.redSqr();
  // E = 6 * ((X1 + YY)^2 - XX - YYYY) - MM
  var e = this.x.redAdd(yy).redSqr().redISub(xx).redISub(yyyy);
  e = e.redIAdd(e);
  e = e.redAdd(e).redIAdd(e);
  e = e.redISub(mm);
  // EE = E^2
  var ee = e.redSqr();
  // T = 16*YYYY
  var t = yyyy.redIAdd(yyyy);
  t = t.redIAdd(t);
  t = t.redIAdd(t);
  t = t.redIAdd(t);
  // U = (M + E)^2 - MM - EE - T
  var u = m.redIAdd(e).redSqr().redISub(mm).redISub(ee).redISub(t);
  // X3 = 4 * (X1 * EE - 4 * YY * U)
  var yyu4 = yy.redMul(u);
  yyu4 = yyu4.redIAdd(yyu4);
  yyu4 = yyu4.redIAdd(yyu4);
  var nx = this.x.redMul(ee).redISub(yyu4);
  nx = nx.redIAdd(nx);
  nx = nx.redIAdd(nx);
  // Y3 = 8 * Y1 * (U * (T - U) - E * EE)
  var ny = this.y.redMul(u.redMul(t.redISub(u)).redISub(e.redMul(ee)));
  ny = ny.redIAdd(ny);
  ny = ny.redIAdd(ny);
  ny = ny.redIAdd(ny);
  // Z3 = (Z1 + E)^2 - ZZ - EE
  var nz = this.z.redAdd(e).redSqr().redISub(zz).redISub(ee);

  return this.curve.jpoint(nx, ny, nz);
};

JPoint.prototype.mul = function mul(k, kbase) {
  k = new bn(k, kbase);

  return this.curve._wnafMul(this, k);
};

JPoint.prototype.eq = function eq(p) {
  if (p.type === 'affine')
    return this.eq(p.toJ());

  if (this === p)
    return true;

  // x1 * z2^2 == x2 * z1^2
  var z2 = this.z.redSqr();
  var pz2 = p.z.redSqr();
  if (this.x.redMul(pz2).redISub(p.x.redMul(z2)).cmpn(0) !== 0)
    return false;

  // y1 * z2^3 == y2 * z1^3
  var z3 = z2.redMul(this.z);
  var pz3 = pz2.redMul(p.z);
  return this.y.redMul(pz3).redISub(p.y.redMul(z3)).cmpn(0) === 0;
};

JPoint.prototype.eqXToP = function eqXToP(x) {
  var zs = this.z.redSqr();
  var rx = x.toRed(this.curve.red).redMul(zs);
  if (this.x.cmp(rx) === 0)
    return true;

  var xc = x.clone();
  var t = this.curve.redN.redMul(zs);
  for (;;) {
    xc.iadd(this.curve.n);
    if (xc.cmp(this.curve.p) >= 0)
      return false;

    rx.redIAdd(t);
    if (this.x.cmp(rx) === 0)
      return true;
  }
};

JPoint.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC JPoint Infinity>';
  return '<EC JPoint x: ' + this.x.toString(16, 2) +
      ' y: ' + this.y.toString(16, 2) +
      ' z: ' + this.z.toString(16, 2) + '>';
};

JPoint.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.z.cmpn(0) === 0;
};

function MontCurve(conf) {
  base.call(this, 'mont', conf);

  this.a = new bn(conf.a, 16).toRed(this.red);
  this.b = new bn(conf.b, 16).toRed(this.red);
  this.i4 = new bn(4).toRed(this.red).redInvm();
  this.two = new bn(2).toRed(this.red);
  this.a24 = this.i4.redMul(this.a.redAdd(this.two));
}
inherits_browser(MontCurve, base);
var mont = MontCurve;

MontCurve.prototype.validate = function validate(point) {
  var x = point.normalize().x;
  var x2 = x.redSqr();
  var rhs = x2.redMul(x).redAdd(x2.redMul(this.a)).redAdd(x);
  var y = rhs.redSqrt();

  return y.redSqr().cmp(rhs) === 0;
};

function Point$1(curve, x, z) {
  base.BasePoint.call(this, curve, 'projective');
  if (x === null && z === null) {
    this.x = this.curve.one;
    this.z = this.curve.zero;
  } else {
    this.x = new bn(x, 16);
    this.z = new bn(z, 16);
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.z.red)
      this.z = this.z.toRed(this.curve.red);
  }
}
inherits_browser(Point$1, base.BasePoint);

MontCurve.prototype.decodePoint = function decodePoint(bytes, enc) {
  return this.point(utils_1$1.toArray(bytes, enc), 1);
};

MontCurve.prototype.point = function point(x, z) {
  return new Point$1(this, x, z);
};

MontCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
  return Point$1.fromJSON(this, obj);
};

Point$1.prototype.precompute = function precompute() {
  // No-op
};

Point$1.prototype._encode = function _encode() {
  return this.getX().toArray('be', this.curve.p.byteLength());
};

Point$1.fromJSON = function fromJSON(curve, obj) {
  return new Point$1(curve, obj[0], obj[1] || curve.one);
};

Point$1.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
};

Point$1.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.z.cmpn(0) === 0;
};

Point$1.prototype.dbl = function dbl() {
  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#doubling-dbl-1987-m-3
  // 2M + 2S + 4A

  // A = X1 + Z1
  var a = this.x.redAdd(this.z);
  // AA = A^2
  var aa = a.redSqr();
  // B = X1 - Z1
  var b = this.x.redSub(this.z);
  // BB = B^2
  var bb = b.redSqr();
  // C = AA - BB
  var c = aa.redSub(bb);
  // X3 = AA * BB
  var nx = aa.redMul(bb);
  // Z3 = C * (BB + A24 * C)
  var nz = c.redMul(bb.redAdd(this.curve.a24.redMul(c)));
  return this.curve.point(nx, nz);
};

Point$1.prototype.add = function add() {
  throw new Error('Not supported on Montgomery curve');
};

Point$1.prototype.diffAdd = function diffAdd(p, diff) {
  // http://hyperelliptic.org/EFD/g1p/auto-montgom-xz.html#diffadd-dadd-1987-m-3
  // 4M + 2S + 6A

  // A = X2 + Z2
  var a = this.x.redAdd(this.z);
  // B = X2 - Z2
  var b = this.x.redSub(this.z);
  // C = X3 + Z3
  var c = p.x.redAdd(p.z);
  // D = X3 - Z3
  var d = p.x.redSub(p.z);
  // DA = D * A
  var da = d.redMul(a);
  // CB = C * B
  var cb = c.redMul(b);
  // X5 = Z1 * (DA + CB)^2
  var nx = diff.z.redMul(da.redAdd(cb).redSqr());
  // Z5 = X1 * (DA - CB)^2
  var nz = diff.x.redMul(da.redISub(cb).redSqr());
  return this.curve.point(nx, nz);
};

Point$1.prototype.mul = function mul(k) {
  var t = k.clone();
  var a = this; // (N / 2) * Q + Q
  var b = this.curve.point(null, null); // (N / 2) * Q
  var c = this; // Q

  for (var bits = []; t.cmpn(0) !== 0; t.iushrn(1))
    bits.push(t.andln(1));

  for (var i = bits.length - 1; i >= 0; i--) {
    if (bits[i] === 0) {
      // N * Q + Q = ((N / 2) * Q + Q)) + (N / 2) * Q
      a = a.diffAdd(b, c);
      // N * Q = 2 * ((N / 2) * Q + Q))
      b = b.dbl();
    } else {
      // N * Q = ((N / 2) * Q + Q) + ((N / 2) * Q)
      b = a.diffAdd(b, c);
      // N * Q + Q = 2 * ((N / 2) * Q + Q)
      a = a.dbl();
    }
  }
  return b;
};

Point$1.prototype.mulAdd = function mulAdd() {
  throw new Error('Not supported on Montgomery curve');
};

Point$1.prototype.jumlAdd = function jumlAdd() {
  throw new Error('Not supported on Montgomery curve');
};

Point$1.prototype.eq = function eq(other) {
  return this.getX().cmp(other.getX()) === 0;
};

Point$1.prototype.normalize = function normalize() {
  this.x = this.x.redMul(this.z.redInvm());
  this.z = this.curve.one;
  return this;
};

Point$1.prototype.getX = function getX() {
  // Normalize coordinates
  this.normalize();

  return this.x.fromRed();
};

var assert$3 = utils_1$1.assert;

function EdwardsCurve(conf) {
  // NOTE: Important as we are creating point in Base.call()
  this.twisted = (conf.a | 0) !== 1;
  this.mOneA = this.twisted && (conf.a | 0) === -1;
  this.extended = this.mOneA;

  base.call(this, 'edwards', conf);

  this.a = new bn(conf.a, 16).umod(this.red.m);
  this.a = this.a.toRed(this.red);
  this.c = new bn(conf.c, 16).toRed(this.red);
  this.c2 = this.c.redSqr();
  this.d = new bn(conf.d, 16).toRed(this.red);
  this.dd = this.d.redAdd(this.d);

  assert$3(!this.twisted || this.c.fromRed().cmpn(1) === 0);
  this.oneC = (conf.c | 0) === 1;
}
inherits_browser(EdwardsCurve, base);
var edwards = EdwardsCurve;

EdwardsCurve.prototype._mulA = function _mulA(num) {
  if (this.mOneA)
    return num.redNeg();
  else
    return this.a.redMul(num);
};

EdwardsCurve.prototype._mulC = function _mulC(num) {
  if (this.oneC)
    return num;
  else
    return this.c.redMul(num);
};

// Just for compatibility with Short curve
EdwardsCurve.prototype.jpoint = function jpoint(x, y, z, t) {
  return this.point(x, y, z, t);
};

EdwardsCurve.prototype.pointFromX = function pointFromX(x, odd) {
  x = new bn(x, 16);
  if (!x.red)
    x = x.toRed(this.red);

  var x2 = x.redSqr();
  var rhs = this.c2.redSub(this.a.redMul(x2));
  var lhs = this.one.redSub(this.c2.redMul(this.d).redMul(x2));

  var y2 = rhs.redMul(lhs.redInvm());
  var y = y2.redSqrt();
  if (y.redSqr().redSub(y2).cmp(this.zero) !== 0)
    throw new Error('invalid point');

  var isOdd = y.fromRed().isOdd();
  if (odd && !isOdd || !odd && isOdd)
    y = y.redNeg();

  return this.point(x, y);
};

EdwardsCurve.prototype.pointFromY = function pointFromY(y, odd) {
  y = new bn(y, 16);
  if (!y.red)
    y = y.toRed(this.red);

  // x^2 = (y^2 - c^2) / (c^2 d y^2 - a)
  var y2 = y.redSqr();
  var lhs = y2.redSub(this.c2);
  var rhs = y2.redMul(this.d).redMul(this.c2).redSub(this.a);
  var x2 = lhs.redMul(rhs.redInvm());

  if (x2.cmp(this.zero) === 0) {
    if (odd)
      throw new Error('invalid point');
    else
      return this.point(this.zero, y);
  }

  var x = x2.redSqrt();
  if (x.redSqr().redSub(x2).cmp(this.zero) !== 0)
    throw new Error('invalid point');

  if (x.fromRed().isOdd() !== odd)
    x = x.redNeg();

  return this.point(x, y);
};

EdwardsCurve.prototype.validate = function validate(point) {
  if (point.isInfinity())
    return true;

  // Curve: A * X^2 + Y^2 = C^2 * (1 + D * X^2 * Y^2)
  point.normalize();

  var x2 = point.x.redSqr();
  var y2 = point.y.redSqr();
  var lhs = x2.redMul(this.a).redAdd(y2);
  var rhs = this.c2.redMul(this.one.redAdd(this.d.redMul(x2).redMul(y2)));

  return lhs.cmp(rhs) === 0;
};

function Point$2(curve, x, y, z, t) {
  base.BasePoint.call(this, curve, 'projective');
  if (x === null && y === null && z === null) {
    this.x = this.curve.zero;
    this.y = this.curve.one;
    this.z = this.curve.one;
    this.t = this.curve.zero;
    this.zOne = true;
  } else {
    this.x = new bn(x, 16);
    this.y = new bn(y, 16);
    this.z = z ? new bn(z, 16) : this.curve.one;
    this.t = t && new bn(t, 16);
    if (!this.x.red)
      this.x = this.x.toRed(this.curve.red);
    if (!this.y.red)
      this.y = this.y.toRed(this.curve.red);
    if (!this.z.red)
      this.z = this.z.toRed(this.curve.red);
    if (this.t && !this.t.red)
      this.t = this.t.toRed(this.curve.red);
    this.zOne = this.z === this.curve.one;

    // Use extended coordinates
    if (this.curve.extended && !this.t) {
      this.t = this.x.redMul(this.y);
      if (!this.zOne)
        this.t = this.t.redMul(this.z.redInvm());
    }
  }
}
inherits_browser(Point$2, base.BasePoint);

EdwardsCurve.prototype.pointFromJSON = function pointFromJSON(obj) {
  return Point$2.fromJSON(this, obj);
};

EdwardsCurve.prototype.point = function point(x, y, z, t) {
  return new Point$2(this, x, y, z, t);
};

Point$2.fromJSON = function fromJSON(curve, obj) {
  return new Point$2(curve, obj[0], obj[1], obj[2]);
};

Point$2.prototype.inspect = function inspect() {
  if (this.isInfinity())
    return '<EC Point Infinity>';
  return '<EC Point x: ' + this.x.fromRed().toString(16, 2) +
      ' y: ' + this.y.fromRed().toString(16, 2) +
      ' z: ' + this.z.fromRed().toString(16, 2) + '>';
};

Point$2.prototype.isInfinity = function isInfinity() {
  // XXX This code assumes that zero is always zero in red
  return this.x.cmpn(0) === 0 &&
    (this.y.cmp(this.z) === 0 ||
    (this.zOne && this.y.cmp(this.curve.c) === 0));
};

Point$2.prototype._extDbl = function _extDbl() {
  // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
  //     #doubling-dbl-2008-hwcd
  // 4M + 4S

  // A = X1^2
  var a = this.x.redSqr();
  // B = Y1^2
  var b = this.y.redSqr();
  // C = 2 * Z1^2
  var c = this.z.redSqr();
  c = c.redIAdd(c);
  // D = a * A
  var d = this.curve._mulA(a);
  // E = (X1 + Y1)^2 - A - B
  var e = this.x.redAdd(this.y).redSqr().redISub(a).redISub(b);
  // G = D + B
  var g = d.redAdd(b);
  // F = G - C
  var f = g.redSub(c);
  // H = D - B
  var h = d.redSub(b);
  // X3 = E * F
  var nx = e.redMul(f);
  // Y3 = G * H
  var ny = g.redMul(h);
  // T3 = E * H
  var nt = e.redMul(h);
  // Z3 = F * G
  var nz = f.redMul(g);
  return this.curve.point(nx, ny, nz, nt);
};

Point$2.prototype._projDbl = function _projDbl() {
  // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
  //     #doubling-dbl-2008-bbjlp
  //     #doubling-dbl-2007-bl
  // and others
  // Generally 3M + 4S or 2M + 4S

  // B = (X1 + Y1)^2
  var b = this.x.redAdd(this.y).redSqr();
  // C = X1^2
  var c = this.x.redSqr();
  // D = Y1^2
  var d = this.y.redSqr();

  var nx;
  var ny;
  var nz;
  if (this.curve.twisted) {
    // E = a * C
    var e = this.curve._mulA(c);
    // F = E + D
    var f = e.redAdd(d);
    if (this.zOne) {
      // X3 = (B - C - D) * (F - 2)
      nx = b.redSub(c).redSub(d).redMul(f.redSub(this.curve.two));
      // Y3 = F * (E - D)
      ny = f.redMul(e.redSub(d));
      // Z3 = F^2 - 2 * F
      nz = f.redSqr().redSub(f).redSub(f);
    } else {
      // H = Z1^2
      var h = this.z.redSqr();
      // J = F - 2 * H
      var j = f.redSub(h).redISub(h);
      // X3 = (B-C-D)*J
      nx = b.redSub(c).redISub(d).redMul(j);
      // Y3 = F * (E - D)
      ny = f.redMul(e.redSub(d));
      // Z3 = F * J
      nz = f.redMul(j);
    }
  } else {
    // E = C + D
    var e = c.redAdd(d);
    // H = (c * Z1)^2
    var h = this.curve._mulC(this.z).redSqr();
    // J = E - 2 * H
    var j = e.redSub(h).redSub(h);
    // X3 = c * (B - E) * J
    nx = this.curve._mulC(b.redISub(e)).redMul(j);
    // Y3 = c * E * (C - D)
    ny = this.curve._mulC(e).redMul(c.redISub(d));
    // Z3 = E * J
    nz = e.redMul(j);
  }
  return this.curve.point(nx, ny, nz);
};

Point$2.prototype.dbl = function dbl() {
  if (this.isInfinity())
    return this;

  // Double in extended coordinates
  if (this.curve.extended)
    return this._extDbl();
  else
    return this._projDbl();
};

Point$2.prototype._extAdd = function _extAdd(p) {
  // hyperelliptic.org/EFD/g1p/auto-twisted-extended-1.html
  //     #addition-add-2008-hwcd-3
  // 8M

  // A = (Y1 - X1) * (Y2 - X2)
  var a = this.y.redSub(this.x).redMul(p.y.redSub(p.x));
  // B = (Y1 + X1) * (Y2 + X2)
  var b = this.y.redAdd(this.x).redMul(p.y.redAdd(p.x));
  // C = T1 * k * T2
  var c = this.t.redMul(this.curve.dd).redMul(p.t);
  // D = Z1 * 2 * Z2
  var d = this.z.redMul(p.z.redAdd(p.z));
  // E = B - A
  var e = b.redSub(a);
  // F = D - C
  var f = d.redSub(c);
  // G = D + C
  var g = d.redAdd(c);
  // H = B + A
  var h = b.redAdd(a);
  // X3 = E * F
  var nx = e.redMul(f);
  // Y3 = G * H
  var ny = g.redMul(h);
  // T3 = E * H
  var nt = e.redMul(h);
  // Z3 = F * G
  var nz = f.redMul(g);
  return this.curve.point(nx, ny, nz, nt);
};

Point$2.prototype._projAdd = function _projAdd(p) {
  // hyperelliptic.org/EFD/g1p/auto-twisted-projective.html
  //     #addition-add-2008-bbjlp
  //     #addition-add-2007-bl
  // 10M + 1S

  // A = Z1 * Z2
  var a = this.z.redMul(p.z);
  // B = A^2
  var b = a.redSqr();
  // C = X1 * X2
  var c = this.x.redMul(p.x);
  // D = Y1 * Y2
  var d = this.y.redMul(p.y);
  // E = d * C * D
  var e = this.curve.d.redMul(c).redMul(d);
  // F = B - E
  var f = b.redSub(e);
  // G = B + E
  var g = b.redAdd(e);
  // X3 = A * F * ((X1 + Y1) * (X2 + Y2) - C - D)
  var tmp = this.x.redAdd(this.y).redMul(p.x.redAdd(p.y)).redISub(c).redISub(d);
  var nx = a.redMul(f).redMul(tmp);
  var ny;
  var nz;
  if (this.curve.twisted) {
    // Y3 = A * G * (D - a * C)
    ny = a.redMul(g).redMul(d.redSub(this.curve._mulA(c)));
    // Z3 = F * G
    nz = f.redMul(g);
  } else {
    // Y3 = A * G * (D - C)
    ny = a.redMul(g).redMul(d.redSub(c));
    // Z3 = c * F * G
    nz = this.curve._mulC(f).redMul(g);
  }
  return this.curve.point(nx, ny, nz);
};

Point$2.prototype.add = function add(p) {
  if (this.isInfinity())
    return p;
  if (p.isInfinity())
    return this;

  if (this.curve.extended)
    return this._extAdd(p);
  else
    return this._projAdd(p);
};

Point$2.prototype.mul = function mul(k) {
  if (this._hasDoubles(k))
    return this.curve._fixedNafMul(this, k);
  else
    return this.curve._wnafMul(this, k);
};

Point$2.prototype.mulAdd = function mulAdd(k1, p, k2) {
  return this.curve._wnafMulAdd(1, [ this, p ], [ k1, k2 ], 2, false);
};

Point$2.prototype.jmulAdd = function jmulAdd(k1, p, k2) {
  return this.curve._wnafMulAdd(1, [ this, p ], [ k1, k2 ], 2, true);
};

Point$2.prototype.normalize = function normalize() {
  if (this.zOne)
    return this;

  // Normalize coordinates
  var zi = this.z.redInvm();
  this.x = this.x.redMul(zi);
  this.y = this.y.redMul(zi);
  if (this.t)
    this.t = this.t.redMul(zi);
  this.z = this.curve.one;
  this.zOne = true;
  return this;
};

Point$2.prototype.neg = function neg() {
  return this.curve.point(this.x.redNeg(),
                          this.y,
                          this.z,
                          this.t && this.t.redNeg());
};

Point$2.prototype.getX = function getX() {
  this.normalize();
  return this.x.fromRed();
};

Point$2.prototype.getY = function getY() {
  this.normalize();
  return this.y.fromRed();
};

Point$2.prototype.eq = function eq(other) {
  return this === other ||
         this.getX().cmp(other.getX()) === 0 &&
         this.getY().cmp(other.getY()) === 0;
};

Point$2.prototype.eqXToP = function eqXToP(x) {
  var rx = x.toRed(this.curve.red).redMul(this.z);
  if (this.x.cmp(rx) === 0)
    return true;

  var xc = x.clone();
  var t = this.curve.redN.redMul(this.z);
  for (;;) {
    xc.iadd(this.curve.n);
    if (xc.cmp(this.curve.p) >= 0)
      return false;

    rx.redIAdd(t);
    if (this.x.cmp(rx) === 0)
      return true;
  }
};

// Compatibility with BaseCurve
Point$2.prototype.toP = Point$2.prototype.normalize;
Point$2.prototype.mixedAdd = Point$2.prototype.add;

var curve_1 = createCommonjsModule(function (module, exports) {

var curve = exports;

curve.base = base;
curve.short = short_1;
curve.mont = mont;
curve.edwards = edwards;
});

var inherits_1 = inherits_browser;

function isSurrogatePair(msg, i) {
  if ((msg.charCodeAt(i) & 0xFC00) !== 0xD800) {
    return false;
  }
  if (i < 0 || i + 1 >= msg.length) {
    return false;
  }
  return (msg.charCodeAt(i + 1) & 0xFC00) === 0xDC00;
}

function toArray(msg, enc) {
  if (Array.isArray(msg))
    return msg.slice();
  if (!msg)
    return [];
  var res = [];
  if (typeof msg === 'string') {
    if (!enc) {
      // Inspired by stringToUtf8ByteArray() in closure-library by Google
      // https://github.com/google/closure-library/blob/8598d87242af59aac233270742c8984e2b2bdbe0/closure/goog/crypt/crypt.js#L117-L143
      // Apache License 2.0
      // https://github.com/google/closure-library/blob/master/LICENSE
      var p = 0;
      for (var i = 0; i < msg.length; i++) {
        var c = msg.charCodeAt(i);
        if (c < 128) {
          res[p++] = c;
        } else if (c < 2048) {
          res[p++] = (c >> 6) | 192;
          res[p++] = (c & 63) | 128;
        } else if (isSurrogatePair(msg, i)) {
          c = 0x10000 + ((c & 0x03FF) << 10) + (msg.charCodeAt(++i) & 0x03FF);
          res[p++] = (c >> 18) | 240;
          res[p++] = ((c >> 12) & 63) | 128;
          res[p++] = ((c >> 6) & 63) | 128;
          res[p++] = (c & 63) | 128;
        } else {
          res[p++] = (c >> 12) | 224;
          res[p++] = ((c >> 6) & 63) | 128;
          res[p++] = (c & 63) | 128;
        }
      }
    } else if (enc === 'hex') {
      msg = msg.replace(/[^a-z0-9]+/ig, '');
      if (msg.length % 2 !== 0)
        msg = '0' + msg;
      for (i = 0; i < msg.length; i += 2)
        res.push(parseInt(msg[i] + msg[i + 1], 16));
    }
  } else {
    for (i = 0; i < msg.length; i++)
      res[i] = msg[i] | 0;
  }
  return res;
}
var toArray_1 = toArray;

function toHex$1(msg) {
  var res = '';
  for (var i = 0; i < msg.length; i++)
    res += zero2(msg[i].toString(16));
  return res;
}
var toHex_1 = toHex$1;

function htonl(w) {
  var res = (w >>> 24) |
            ((w >>> 8) & 0xff00) |
            ((w << 8) & 0xff0000) |
            ((w & 0xff) << 24);
  return res >>> 0;
}
var htonl_1 = htonl;

function toHex32(msg, endian) {
  var res = '';
  for (var i = 0; i < msg.length; i++) {
    var w = msg[i];
    if (endian === 'little')
      w = htonl(w);
    res += zero8(w.toString(16));
  }
  return res;
}
var toHex32_1 = toHex32;

function zero2(word) {
  if (word.length === 1)
    return '0' + word;
  else
    return word;
}
var zero2_1 = zero2;

function zero8(word) {
  if (word.length === 7)
    return '0' + word;
  else if (word.length === 6)
    return '00' + word;
  else if (word.length === 5)
    return '000' + word;
  else if (word.length === 4)
    return '0000' + word;
  else if (word.length === 3)
    return '00000' + word;
  else if (word.length === 2)
    return '000000' + word;
  else if (word.length === 1)
    return '0000000' + word;
  else
    return word;
}
var zero8_1 = zero8;

function join32(msg, start, end, endian) {
  var len = end - start;
  minimalisticAssert(len % 4 === 0);
  var res = new Array(len / 4);
  for (var i = 0, k = start; i < res.length; i++, k += 4) {
    var w;
    if (endian === 'big')
      w = (msg[k] << 24) | (msg[k + 1] << 16) | (msg[k + 2] << 8) | msg[k + 3];
    else
      w = (msg[k + 3] << 24) | (msg[k + 2] << 16) | (msg[k + 1] << 8) | msg[k];
    res[i] = w >>> 0;
  }
  return res;
}
var join32_1 = join32;

function split32(msg, endian) {
  var res = new Array(msg.length * 4);
  for (var i = 0, k = 0; i < msg.length; i++, k += 4) {
    var m = msg[i];
    if (endian === 'big') {
      res[k] = m >>> 24;
      res[k + 1] = (m >>> 16) & 0xff;
      res[k + 2] = (m >>> 8) & 0xff;
      res[k + 3] = m & 0xff;
    } else {
      res[k + 3] = m >>> 24;
      res[k + 2] = (m >>> 16) & 0xff;
      res[k + 1] = (m >>> 8) & 0xff;
      res[k] = m & 0xff;
    }
  }
  return res;
}
var split32_1 = split32;

function rotr32(w, b) {
  return (w >>> b) | (w << (32 - b));
}
var rotr32_1 = rotr32;

function rotl32(w, b) {
  return (w << b) | (w >>> (32 - b));
}
var rotl32_1 = rotl32;

function sum32(a, b) {
  return (a + b) >>> 0;
}
var sum32_1 = sum32;

function sum32_3(a, b, c) {
  return (a + b + c) >>> 0;
}
var sum32_3_1 = sum32_3;

function sum32_4(a, b, c, d) {
  return (a + b + c + d) >>> 0;
}
var sum32_4_1 = sum32_4;

function sum32_5(a, b, c, d, e) {
  return (a + b + c + d + e) >>> 0;
}
var sum32_5_1 = sum32_5;

function sum64(buf, pos, ah, al) {
  var bh = buf[pos];
  var bl = buf[pos + 1];

  var lo = (al + bl) >>> 0;
  var hi = (lo < al ? 1 : 0) + ah + bh;
  buf[pos] = hi >>> 0;
  buf[pos + 1] = lo;
}
var sum64_1 = sum64;

function sum64_hi(ah, al, bh, bl) {
  var lo = (al + bl) >>> 0;
  var hi = (lo < al ? 1 : 0) + ah + bh;
  return hi >>> 0;
}
var sum64_hi_1 = sum64_hi;

function sum64_lo(ah, al, bh, bl) {
  var lo = al + bl;
  return lo >>> 0;
}
var sum64_lo_1 = sum64_lo;

function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
  var carry = 0;
  var lo = al;
  lo = (lo + bl) >>> 0;
  carry += lo < al ? 1 : 0;
  lo = (lo + cl) >>> 0;
  carry += lo < cl ? 1 : 0;
  lo = (lo + dl) >>> 0;
  carry += lo < dl ? 1 : 0;

  var hi = ah + bh + ch + dh + carry;
  return hi >>> 0;
}
var sum64_4_hi_1 = sum64_4_hi;

function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
  var lo = al + bl + cl + dl;
  return lo >>> 0;
}
var sum64_4_lo_1 = sum64_4_lo;

function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
  var carry = 0;
  var lo = al;
  lo = (lo + bl) >>> 0;
  carry += lo < al ? 1 : 0;
  lo = (lo + cl) >>> 0;
  carry += lo < cl ? 1 : 0;
  lo = (lo + dl) >>> 0;
  carry += lo < dl ? 1 : 0;
  lo = (lo + el) >>> 0;
  carry += lo < el ? 1 : 0;

  var hi = ah + bh + ch + dh + eh + carry;
  return hi >>> 0;
}
var sum64_5_hi_1 = sum64_5_hi;

function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
  var lo = al + bl + cl + dl + el;

  return lo >>> 0;
}
var sum64_5_lo_1 = sum64_5_lo;

function rotr64_hi(ah, al, num) {
  var r = (al << (32 - num)) | (ah >>> num);
  return r >>> 0;
}
var rotr64_hi_1 = rotr64_hi;

function rotr64_lo(ah, al, num) {
  var r = (ah << (32 - num)) | (al >>> num);
  return r >>> 0;
}
var rotr64_lo_1 = rotr64_lo;

function shr64_hi(ah, al, num) {
  return ah >>> num;
}
var shr64_hi_1 = shr64_hi;

function shr64_lo(ah, al, num) {
  var r = (ah << (32 - num)) | (al >>> num);
  return r >>> 0;
}
var shr64_lo_1 = shr64_lo;

var utils = {
	inherits: inherits_1,
	toArray: toArray_1,
	toHex: toHex_1,
	htonl: htonl_1,
	toHex32: toHex32_1,
	zero2: zero2_1,
	zero8: zero8_1,
	join32: join32_1,
	split32: split32_1,
	rotr32: rotr32_1,
	rotl32: rotl32_1,
	sum32: sum32_1,
	sum32_3: sum32_3_1,
	sum32_4: sum32_4_1,
	sum32_5: sum32_5_1,
	sum64: sum64_1,
	sum64_hi: sum64_hi_1,
	sum64_lo: sum64_lo_1,
	sum64_4_hi: sum64_4_hi_1,
	sum64_4_lo: sum64_4_lo_1,
	sum64_5_hi: sum64_5_hi_1,
	sum64_5_lo: sum64_5_lo_1,
	rotr64_hi: rotr64_hi_1,
	rotr64_lo: rotr64_lo_1,
	shr64_hi: shr64_hi_1,
	shr64_lo: shr64_lo_1
};

function BlockHash() {
  this.pending = null;
  this.pendingTotal = 0;
  this.blockSize = this.constructor.blockSize;
  this.outSize = this.constructor.outSize;
  this.hmacStrength = this.constructor.hmacStrength;
  this.padLength = this.constructor.padLength / 8;
  this.endian = 'big';

  this._delta8 = this.blockSize / 8;
  this._delta32 = this.blockSize / 32;
}
var BlockHash_1 = BlockHash;

BlockHash.prototype.update = function update(msg, enc) {
  // Convert message to array, pad it, and join into 32bit blocks
  msg = utils.toArray(msg, enc);
  if (!this.pending)
    this.pending = msg;
  else
    this.pending = this.pending.concat(msg);
  this.pendingTotal += msg.length;

  // Enough data, try updating
  if (this.pending.length >= this._delta8) {
    msg = this.pending;

    // Process pending data in blocks
    var r = msg.length % this._delta8;
    this.pending = msg.slice(msg.length - r, msg.length);
    if (this.pending.length === 0)
      this.pending = null;

    msg = utils.join32(msg, 0, msg.length - r, this.endian);
    for (var i = 0; i < msg.length; i += this._delta32)
      this._update(msg, i, i + this._delta32);
  }

  return this;
};

BlockHash.prototype.digest = function digest(enc) {
  this.update(this._pad());
  minimalisticAssert(this.pending === null);

  return this._digest(enc);
};

BlockHash.prototype._pad = function pad() {
  var len = this.pendingTotal;
  var bytes = this._delta8;
  var k = bytes - ((len + this.padLength) % bytes);
  var res = new Array(k + this.padLength);
  res[0] = 0x80;
  for (var i = 1; i < k; i++)
    res[i] = 0;

  // Append length
  len <<= 3;
  if (this.endian === 'big') {
    for (var t = 8; t < this.padLength; t++)
      res[i++] = 0;

    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = len & 0xff;
  } else {
    res[i++] = len & 0xff;
    res[i++] = (len >>> 8) & 0xff;
    res[i++] = (len >>> 16) & 0xff;
    res[i++] = (len >>> 24) & 0xff;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;
    res[i++] = 0;

    for (t = 8; t < this.padLength; t++)
      res[i++] = 0;
  }

  return res;
};

var common = {
	BlockHash: BlockHash_1
};

var rotr32$1 = utils.rotr32;

function ft_1(s, x, y, z) {
  if (s === 0)
    return ch32(x, y, z);
  if (s === 1 || s === 3)
    return p32(x, y, z);
  if (s === 2)
    return maj32(x, y, z);
}
var ft_1_1 = ft_1;

function ch32(x, y, z) {
  return (x & y) ^ ((~x) & z);
}
var ch32_1 = ch32;

function maj32(x, y, z) {
  return (x & y) ^ (x & z) ^ (y & z);
}
var maj32_1 = maj32;

function p32(x, y, z) {
  return x ^ y ^ z;
}
var p32_1 = p32;

function s0_256(x) {
  return rotr32$1(x, 2) ^ rotr32$1(x, 13) ^ rotr32$1(x, 22);
}
var s0_256_1 = s0_256;

function s1_256(x) {
  return rotr32$1(x, 6) ^ rotr32$1(x, 11) ^ rotr32$1(x, 25);
}
var s1_256_1 = s1_256;

function g0_256(x) {
  return rotr32$1(x, 7) ^ rotr32$1(x, 18) ^ (x >>> 3);
}
var g0_256_1 = g0_256;

function g1_256(x) {
  return rotr32$1(x, 17) ^ rotr32$1(x, 19) ^ (x >>> 10);
}
var g1_256_1 = g1_256;

var common$1 = {
	ft_1: ft_1_1,
	ch32: ch32_1,
	maj32: maj32_1,
	p32: p32_1,
	s0_256: s0_256_1,
	s1_256: s1_256_1,
	g0_256: g0_256_1,
	g1_256: g1_256_1
};

var rotl32$1 = utils.rotl32;
var sum32$1 = utils.sum32;
var sum32_5$1 = utils.sum32_5;
var ft_1$1 = common$1.ft_1;
var BlockHash$1 = common.BlockHash;

var sha1_K = [
  0x5A827999, 0x6ED9EBA1,
  0x8F1BBCDC, 0xCA62C1D6
];

function SHA1() {
  if (!(this instanceof SHA1))
    return new SHA1();

  BlockHash$1.call(this);
  this.h = [
    0x67452301, 0xefcdab89, 0x98badcfe,
    0x10325476, 0xc3d2e1f0 ];
  this.W = new Array(80);
}

utils.inherits(SHA1, BlockHash$1);
var _1 = SHA1;

SHA1.blockSize = 512;
SHA1.outSize = 160;
SHA1.hmacStrength = 80;
SHA1.padLength = 64;

SHA1.prototype._update = function _update(msg, start) {
  var W = this.W;

  for (var i = 0; i < 16; i++)
    W[i] = msg[start + i];

  for(; i < W.length; i++)
    W[i] = rotl32$1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16], 1);

  var a = this.h[0];
  var b = this.h[1];
  var c = this.h[2];
  var d = this.h[3];
  var e = this.h[4];

  for (i = 0; i < W.length; i++) {
    var s = ~~(i / 20);
    var t = sum32_5$1(rotl32$1(a, 5), ft_1$1(s, b, c, d), e, W[i], sha1_K[s]);
    e = d;
    d = c;
    c = rotl32$1(b, 30);
    b = a;
    a = t;
  }

  this.h[0] = sum32$1(this.h[0], a);
  this.h[1] = sum32$1(this.h[1], b);
  this.h[2] = sum32$1(this.h[2], c);
  this.h[3] = sum32$1(this.h[3], d);
  this.h[4] = sum32$1(this.h[4], e);
};

SHA1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils.toHex32(this.h, 'big');
  else
    return utils.split32(this.h, 'big');
};

var sum32$2 = utils.sum32;
var sum32_4$1 = utils.sum32_4;
var sum32_5$2 = utils.sum32_5;
var ch32$1 = common$1.ch32;
var maj32$1 = common$1.maj32;
var s0_256$1 = common$1.s0_256;
var s1_256$1 = common$1.s1_256;
var g0_256$1 = common$1.g0_256;
var g1_256$1 = common$1.g1_256;

var BlockHash$2 = common.BlockHash;

var sha256_K = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5,
  0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3,
  0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc,
  0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7,
  0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13,
  0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3,
  0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5,
  0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208,
  0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function SHA256() {
  if (!(this instanceof SHA256))
    return new SHA256();

  BlockHash$2.call(this);
  this.h = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];
  this.k = sha256_K;
  this.W = new Array(64);
}
utils.inherits(SHA256, BlockHash$2);
var _256 = SHA256;

SHA256.blockSize = 512;
SHA256.outSize = 256;
SHA256.hmacStrength = 192;
SHA256.padLength = 64;

SHA256.prototype._update = function _update(msg, start) {
  var W = this.W;

  for (var i = 0; i < 16; i++)
    W[i] = msg[start + i];
  for (; i < W.length; i++)
    W[i] = sum32_4$1(g1_256$1(W[i - 2]), W[i - 7], g0_256$1(W[i - 15]), W[i - 16]);

  var a = this.h[0];
  var b = this.h[1];
  var c = this.h[2];
  var d = this.h[3];
  var e = this.h[4];
  var f = this.h[5];
  var g = this.h[6];
  var h = this.h[7];

  minimalisticAssert(this.k.length === W.length);
  for (i = 0; i < W.length; i++) {
    var T1 = sum32_5$2(h, s1_256$1(e), ch32$1(e, f, g), this.k[i], W[i]);
    var T2 = sum32$2(s0_256$1(a), maj32$1(a, b, c));
    h = g;
    g = f;
    f = e;
    e = sum32$2(d, T1);
    d = c;
    c = b;
    b = a;
    a = sum32$2(T1, T2);
  }

  this.h[0] = sum32$2(this.h[0], a);
  this.h[1] = sum32$2(this.h[1], b);
  this.h[2] = sum32$2(this.h[2], c);
  this.h[3] = sum32$2(this.h[3], d);
  this.h[4] = sum32$2(this.h[4], e);
  this.h[5] = sum32$2(this.h[5], f);
  this.h[6] = sum32$2(this.h[6], g);
  this.h[7] = sum32$2(this.h[7], h);
};

SHA256.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils.toHex32(this.h, 'big');
  else
    return utils.split32(this.h, 'big');
};

function SHA224() {
  if (!(this instanceof SHA224))
    return new SHA224();

  _256.call(this);
  this.h = [
    0xc1059ed8, 0x367cd507, 0x3070dd17, 0xf70e5939,
    0xffc00b31, 0x68581511, 0x64f98fa7, 0xbefa4fa4 ];
}
utils.inherits(SHA224, _256);
var _224 = SHA224;

SHA224.blockSize = 512;
SHA224.outSize = 224;
SHA224.hmacStrength = 192;
SHA224.padLength = 64;

SHA224.prototype._digest = function digest(enc) {
  // Just truncate output
  if (enc === 'hex')
    return utils.toHex32(this.h.slice(0, 7), 'big');
  else
    return utils.split32(this.h.slice(0, 7), 'big');
};

var rotr64_hi$1 = utils.rotr64_hi;
var rotr64_lo$1 = utils.rotr64_lo;
var shr64_hi$1 = utils.shr64_hi;
var shr64_lo$1 = utils.shr64_lo;
var sum64$1 = utils.sum64;
var sum64_hi$1 = utils.sum64_hi;
var sum64_lo$1 = utils.sum64_lo;
var sum64_4_hi$1 = utils.sum64_4_hi;
var sum64_4_lo$1 = utils.sum64_4_lo;
var sum64_5_hi$1 = utils.sum64_5_hi;
var sum64_5_lo$1 = utils.sum64_5_lo;

var BlockHash$3 = common.BlockHash;

var sha512_K = [
  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
];

function SHA512() {
  if (!(this instanceof SHA512))
    return new SHA512();

  BlockHash$3.call(this);
  this.h = [
    0x6a09e667, 0xf3bcc908,
    0xbb67ae85, 0x84caa73b,
    0x3c6ef372, 0xfe94f82b,
    0xa54ff53a, 0x5f1d36f1,
    0x510e527f, 0xade682d1,
    0x9b05688c, 0x2b3e6c1f,
    0x1f83d9ab, 0xfb41bd6b,
    0x5be0cd19, 0x137e2179 ];
  this.k = sha512_K;
  this.W = new Array(160);
}
utils.inherits(SHA512, BlockHash$3);
var _512 = SHA512;

SHA512.blockSize = 1024;
SHA512.outSize = 512;
SHA512.hmacStrength = 192;
SHA512.padLength = 128;

SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
  var W = this.W;

  // 32 x 32bit words
  for (var i = 0; i < 32; i++)
    W[i] = msg[start + i];
  for (; i < W.length; i += 2) {
    var c0_hi = g1_512_hi(W[i - 4], W[i - 3]);  // i - 2
    var c0_lo = g1_512_lo(W[i - 4], W[i - 3]);
    var c1_hi = W[i - 14];  // i - 7
    var c1_lo = W[i - 13];
    var c2_hi = g0_512_hi(W[i - 30], W[i - 29]);  // i - 15
    var c2_lo = g0_512_lo(W[i - 30], W[i - 29]);
    var c3_hi = W[i - 32];  // i - 16
    var c3_lo = W[i - 31];

    W[i] = sum64_4_hi$1(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo);
    W[i + 1] = sum64_4_lo$1(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo);
  }
};

SHA512.prototype._update = function _update(msg, start) {
  this._prepareBlock(msg, start);

  var W = this.W;

  var ah = this.h[0];
  var al = this.h[1];
  var bh = this.h[2];
  var bl = this.h[3];
  var ch = this.h[4];
  var cl = this.h[5];
  var dh = this.h[6];
  var dl = this.h[7];
  var eh = this.h[8];
  var el = this.h[9];
  var fh = this.h[10];
  var fl = this.h[11];
  var gh = this.h[12];
  var gl = this.h[13];
  var hh = this.h[14];
  var hl = this.h[15];

  minimalisticAssert(this.k.length === W.length);
  for (var i = 0; i < W.length; i += 2) {
    var c0_hi = hh;
    var c0_lo = hl;
    var c1_hi = s1_512_hi(eh, el);
    var c1_lo = s1_512_lo(eh, el);
    var c2_hi = ch64_hi(eh, el, fh, fl, gh);
    var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
    var c3_hi = this.k[i];
    var c3_lo = this.k[i + 1];
    var c4_hi = W[i];
    var c4_lo = W[i + 1];

    var T1_hi = sum64_5_hi$1(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo,
      c4_hi, c4_lo);
    var T1_lo = sum64_5_lo$1(
      c0_hi, c0_lo,
      c1_hi, c1_lo,
      c2_hi, c2_lo,
      c3_hi, c3_lo,
      c4_hi, c4_lo);

    c0_hi = s0_512_hi(ah, al);
    c0_lo = s0_512_lo(ah, al);
    c1_hi = maj64_hi(ah, al, bh, bl, ch);
    c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);

    var T2_hi = sum64_hi$1(c0_hi, c0_lo, c1_hi, c1_lo);
    var T2_lo = sum64_lo$1(c0_hi, c0_lo, c1_hi, c1_lo);

    hh = gh;
    hl = gl;

    gh = fh;
    gl = fl;

    fh = eh;
    fl = el;

    eh = sum64_hi$1(dh, dl, T1_hi, T1_lo);
    el = sum64_lo$1(dl, dl, T1_hi, T1_lo);

    dh = ch;
    dl = cl;

    ch = bh;
    cl = bl;

    bh = ah;
    bl = al;

    ah = sum64_hi$1(T1_hi, T1_lo, T2_hi, T2_lo);
    al = sum64_lo$1(T1_hi, T1_lo, T2_hi, T2_lo);
  }

  sum64$1(this.h, 0, ah, al);
  sum64$1(this.h, 2, bh, bl);
  sum64$1(this.h, 4, ch, cl);
  sum64$1(this.h, 6, dh, dl);
  sum64$1(this.h, 8, eh, el);
  sum64$1(this.h, 10, fh, fl);
  sum64$1(this.h, 12, gh, gl);
  sum64$1(this.h, 14, hh, hl);
};

SHA512.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils.toHex32(this.h, 'big');
  else
    return utils.split32(this.h, 'big');
};

function ch64_hi(xh, xl, yh, yl, zh) {
  var r = (xh & yh) ^ ((~xh) & zh);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function ch64_lo(xh, xl, yh, yl, zh, zl) {
  var r = (xl & yl) ^ ((~xl) & zl);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function maj64_hi(xh, xl, yh, yl, zh) {
  var r = (xh & yh) ^ (xh & zh) ^ (yh & zh);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function maj64_lo(xh, xl, yh, yl, zh, zl) {
  var r = (xl & yl) ^ (xl & zl) ^ (yl & zl);
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s0_512_hi(xh, xl) {
  var c0_hi = rotr64_hi$1(xh, xl, 28);
  var c1_hi = rotr64_hi$1(xl, xh, 2);  // 34
  var c2_hi = rotr64_hi$1(xl, xh, 7);  // 39

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s0_512_lo(xh, xl) {
  var c0_lo = rotr64_lo$1(xh, xl, 28);
  var c1_lo = rotr64_lo$1(xl, xh, 2);  // 34
  var c2_lo = rotr64_lo$1(xl, xh, 7);  // 39

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s1_512_hi(xh, xl) {
  var c0_hi = rotr64_hi$1(xh, xl, 14);
  var c1_hi = rotr64_hi$1(xh, xl, 18);
  var c2_hi = rotr64_hi$1(xl, xh, 9);  // 41

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function s1_512_lo(xh, xl) {
  var c0_lo = rotr64_lo$1(xh, xl, 14);
  var c1_lo = rotr64_lo$1(xh, xl, 18);
  var c2_lo = rotr64_lo$1(xl, xh, 9);  // 41

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g0_512_hi(xh, xl) {
  var c0_hi = rotr64_hi$1(xh, xl, 1);
  var c1_hi = rotr64_hi$1(xh, xl, 8);
  var c2_hi = shr64_hi$1(xh, xl, 7);

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g0_512_lo(xh, xl) {
  var c0_lo = rotr64_lo$1(xh, xl, 1);
  var c1_lo = rotr64_lo$1(xh, xl, 8);
  var c2_lo = shr64_lo$1(xh, xl, 7);

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g1_512_hi(xh, xl) {
  var c0_hi = rotr64_hi$1(xh, xl, 19);
  var c1_hi = rotr64_hi$1(xl, xh, 29);  // 61
  var c2_hi = shr64_hi$1(xh, xl, 6);

  var r = c0_hi ^ c1_hi ^ c2_hi;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function g1_512_lo(xh, xl) {
  var c0_lo = rotr64_lo$1(xh, xl, 19);
  var c1_lo = rotr64_lo$1(xl, xh, 29);  // 61
  var c2_lo = shr64_lo$1(xh, xl, 6);

  var r = c0_lo ^ c1_lo ^ c2_lo;
  if (r < 0)
    r += 0x100000000;
  return r;
}

function SHA384() {
  if (!(this instanceof SHA384))
    return new SHA384();

  _512.call(this);
  this.h = [
    0xcbbb9d5d, 0xc1059ed8,
    0x629a292a, 0x367cd507,
    0x9159015a, 0x3070dd17,
    0x152fecd8, 0xf70e5939,
    0x67332667, 0xffc00b31,
    0x8eb44a87, 0x68581511,
    0xdb0c2e0d, 0x64f98fa7,
    0x47b5481d, 0xbefa4fa4 ];
}
utils.inherits(SHA384, _512);
var _384 = SHA384;

SHA384.blockSize = 1024;
SHA384.outSize = 384;
SHA384.hmacStrength = 192;
SHA384.padLength = 128;

SHA384.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils.toHex32(this.h.slice(0, 12), 'big');
  else
    return utils.split32(this.h.slice(0, 12), 'big');
};

var sha1$1 = _1;
var sha224$1 = _224;
var sha256$1 = _256;
var sha384$1 = _384;
var sha512$1 = _512;

var sha$1 = {
	sha1: sha1$1,
	sha224: sha224$1,
	sha256: sha256$1,
	sha384: sha384$1,
	sha512: sha512$1
};

var rotl32$2 = utils.rotl32;
var sum32$3 = utils.sum32;
var sum32_3$1 = utils.sum32_3;
var sum32_4$2 = utils.sum32_4;
var BlockHash$4 = common.BlockHash;

function RIPEMD160$1() {
  if (!(this instanceof RIPEMD160$1))
    return new RIPEMD160$1();

  BlockHash$4.call(this);

  this.h = [ 0x67452301, 0xefcdab89, 0x98badcfe, 0x10325476, 0xc3d2e1f0 ];
  this.endian = 'little';
}
utils.inherits(RIPEMD160$1, BlockHash$4);
var ripemd160$1 = RIPEMD160$1;

RIPEMD160$1.blockSize = 512;
RIPEMD160$1.outSize = 160;
RIPEMD160$1.hmacStrength = 192;
RIPEMD160$1.padLength = 64;

RIPEMD160$1.prototype._update = function update(msg, start) {
  var A = this.h[0];
  var B = this.h[1];
  var C = this.h[2];
  var D = this.h[3];
  var E = this.h[4];
  var Ah = A;
  var Bh = B;
  var Ch = C;
  var Dh = D;
  var Eh = E;
  for (var j = 0; j < 80; j++) {
    var T = sum32$3(
      rotl32$2(
        sum32_4$2(A, f(j, B, C, D), msg[r$1[j] + start], K$4(j)),
        s[j]),
      E);
    A = E;
    E = D;
    D = rotl32$2(C, 10);
    C = B;
    B = T;
    T = sum32$3(
      rotl32$2(
        sum32_4$2(Ah, f(79 - j, Bh, Ch, Dh), msg[rh[j] + start], Kh(j)),
        sh[j]),
      Eh);
    Ah = Eh;
    Eh = Dh;
    Dh = rotl32$2(Ch, 10);
    Ch = Bh;
    Bh = T;
  }
  T = sum32_3$1(this.h[1], C, Dh);
  this.h[1] = sum32_3$1(this.h[2], D, Eh);
  this.h[2] = sum32_3$1(this.h[3], E, Ah);
  this.h[3] = sum32_3$1(this.h[4], A, Bh);
  this.h[4] = sum32_3$1(this.h[0], B, Ch);
  this.h[0] = T;
};

RIPEMD160$1.prototype._digest = function digest(enc) {
  if (enc === 'hex')
    return utils.toHex32(this.h, 'little');
  else
    return utils.split32(this.h, 'little');
};

function f(j, x, y, z) {
  if (j <= 15)
    return x ^ y ^ z;
  else if (j <= 31)
    return (x & y) | ((~x) & z);
  else if (j <= 47)
    return (x | (~y)) ^ z;
  else if (j <= 63)
    return (x & z) | (y & (~z));
  else
    return x ^ (y | (~z));
}

function K$4(j) {
  if (j <= 15)
    return 0x00000000;
  else if (j <= 31)
    return 0x5a827999;
  else if (j <= 47)
    return 0x6ed9eba1;
  else if (j <= 63)
    return 0x8f1bbcdc;
  else
    return 0xa953fd4e;
}

function Kh(j) {
  if (j <= 15)
    return 0x50a28be6;
  else if (j <= 31)
    return 0x5c4dd124;
  else if (j <= 47)
    return 0x6d703ef3;
  else if (j <= 63)
    return 0x7a6d76e9;
  else
    return 0x00000000;
}

var r$1 = [
  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
];

var rh = [
  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
];

var s = [
  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
];

var sh = [
  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
];

var ripemd = {
	ripemd160: ripemd160$1
};

function Hmac$1(hash, key, enc) {
  if (!(this instanceof Hmac$1))
    return new Hmac$1(hash, key, enc);
  this.Hash = hash;
  this.blockSize = hash.blockSize / 8;
  this.outSize = hash.outSize / 8;
  this.inner = null;
  this.outer = null;

  this._init(utils.toArray(key, enc));
}
var hmac = Hmac$1;

Hmac$1.prototype._init = function init(key) {
  // Shorten key, if needed
  if (key.length > this.blockSize)
    key = new this.Hash().update(key).digest();
  minimalisticAssert(key.length <= this.blockSize);

  // Add padding to key
  for (var i = key.length; i < this.blockSize; i++)
    key.push(0);

  for (i = 0; i < key.length; i++)
    key[i] ^= 0x36;
  this.inner = new this.Hash().update(key);

  // 0x36 ^ 0x5c = 0x6a
  for (i = 0; i < key.length; i++)
    key[i] ^= 0x6a;
  this.outer = new this.Hash().update(key);
};

Hmac$1.prototype.update = function update(msg, enc) {
  this.inner.update(msg, enc);
  return this;
};

Hmac$1.prototype.digest = function digest(enc) {
  this.outer.update(this.inner.digest());
  return this.outer.digest(enc);
};

var hash_1 = createCommonjsModule(function (module, exports) {
var hash = exports;

hash.utils = utils;
hash.common = common;
hash.sha = sha$1;
hash.ripemd = ripemd;
hash.hmac = hmac;

// Proxy hash functions to the main object
hash.sha1 = hash.sha.sha1;
hash.sha256 = hash.sha.sha256;
hash.sha224 = hash.sha.sha224;
hash.sha384 = hash.sha.sha384;
hash.sha512 = hash.sha.sha512;
hash.ripemd160 = hash.ripemd.ripemd160;
});

var secp256k1 = {
  doubles: {
    step: 4,
    points: [
      [
        'e60fce93b59e9ec53011aabc21c23e97b2a31369b87a5ae9c44ee89e2a6dec0a',
        'f7e3507399e595929db99f34f57937101296891e44d23f0be1f32cce69616821'
      ],
      [
        '8282263212c609d9ea2a6e3e172de238d8c39cabd5ac1ca10646e23fd5f51508',
        '11f8a8098557dfe45e8256e830b60ace62d613ac2f7b17bed31b6eaff6e26caf'
      ],
      [
        '175e159f728b865a72f99cc6c6fc846de0b93833fd2222ed73fce5b551e5b739',
        'd3506e0d9e3c79eba4ef97a51ff71f5eacb5955add24345c6efa6ffee9fed695'
      ],
      [
        '363d90d447b00c9c99ceac05b6262ee053441c7e55552ffe526bad8f83ff4640',
        '4e273adfc732221953b445397f3363145b9a89008199ecb62003c7f3bee9de9'
      ],
      [
        '8b4b5f165df3c2be8c6244b5b745638843e4a781a15bcd1b69f79a55dffdf80c',
        '4aad0a6f68d308b4b3fbd7813ab0da04f9e336546162ee56b3eff0c65fd4fd36'
      ],
      [
        '723cbaa6e5db996d6bf771c00bd548c7b700dbffa6c0e77bcb6115925232fcda',
        '96e867b5595cc498a921137488824d6e2660a0653779494801dc069d9eb39f5f'
      ],
      [
        'eebfa4d493bebf98ba5feec812c2d3b50947961237a919839a533eca0e7dd7fa',
        '5d9a8ca3970ef0f269ee7edaf178089d9ae4cdc3a711f712ddfd4fdae1de8999'
      ],
      [
        '100f44da696e71672791d0a09b7bde459f1215a29b3c03bfefd7835b39a48db0',
        'cdd9e13192a00b772ec8f3300c090666b7ff4a18ff5195ac0fbd5cd62bc65a09'
      ],
      [
        'e1031be262c7ed1b1dc9227a4a04c017a77f8d4464f3b3852c8acde6e534fd2d',
        '9d7061928940405e6bb6a4176597535af292dd419e1ced79a44f18f29456a00d'
      ],
      [
        'feea6cae46d55b530ac2839f143bd7ec5cf8b266a41d6af52d5e688d9094696d',
        'e57c6b6c97dce1bab06e4e12bf3ecd5c981c8957cc41442d3155debf18090088'
      ],
      [
        'da67a91d91049cdcb367be4be6ffca3cfeed657d808583de33fa978bc1ec6cb1',
        '9bacaa35481642bc41f463f7ec9780e5dec7adc508f740a17e9ea8e27a68be1d'
      ],
      [
        '53904faa0b334cdda6e000935ef22151ec08d0f7bb11069f57545ccc1a37b7c0',
        '5bc087d0bc80106d88c9eccac20d3c1c13999981e14434699dcb096b022771c8'
      ],
      [
        '8e7bcd0bd35983a7719cca7764ca906779b53a043a9b8bcaeff959f43ad86047',
        '10b7770b2a3da4b3940310420ca9514579e88e2e47fd68b3ea10047e8460372a'
      ],
      [
        '385eed34c1cdff21e6d0818689b81bde71a7f4f18397e6690a841e1599c43862',
        '283bebc3e8ea23f56701de19e9ebf4576b304eec2086dc8cc0458fe5542e5453'
      ],
      [
        '6f9d9b803ecf191637c73a4413dfa180fddf84a5947fbc9c606ed86c3fac3a7',
        '7c80c68e603059ba69b8e2a30e45c4d47ea4dd2f5c281002d86890603a842160'
      ],
      [
        '3322d401243c4e2582a2147c104d6ecbf774d163db0f5e5313b7e0e742d0e6bd',
        '56e70797e9664ef5bfb019bc4ddaf9b72805f63ea2873af624f3a2e96c28b2a0'
      ],
      [
        '85672c7d2de0b7da2bd1770d89665868741b3f9af7643397721d74d28134ab83',
        '7c481b9b5b43b2eb6374049bfa62c2e5e77f17fcc5298f44c8e3094f790313a6'
      ],
      [
        '948bf809b1988a46b06c9f1919413b10f9226c60f668832ffd959af60c82a0a',
        '53a562856dcb6646dc6b74c5d1c3418c6d4dff08c97cd2bed4cb7f88d8c8e589'
      ],
      [
        '6260ce7f461801c34f067ce0f02873a8f1b0e44dfc69752accecd819f38fd8e8',
        'bc2da82b6fa5b571a7f09049776a1ef7ecd292238051c198c1a84e95b2b4ae17'
      ],
      [
        'e5037de0afc1d8d43d8348414bbf4103043ec8f575bfdc432953cc8d2037fa2d',
        '4571534baa94d3b5f9f98d09fb990bddbd5f5b03ec481f10e0e5dc841d755bda'
      ],
      [
        'e06372b0f4a207adf5ea905e8f1771b4e7e8dbd1c6a6c5b725866a0ae4fce725',
        '7a908974bce18cfe12a27bb2ad5a488cd7484a7787104870b27034f94eee31dd'
      ],
      [
        '213c7a715cd5d45358d0bbf9dc0ce02204b10bdde2a3f58540ad6908d0559754',
        '4b6dad0b5ae462507013ad06245ba190bb4850f5f36a7eeddff2c27534b458f2'
      ],
      [
        '4e7c272a7af4b34e8dbb9352a5419a87e2838c70adc62cddf0cc3a3b08fbd53c',
        '17749c766c9d0b18e16fd09f6def681b530b9614bff7dd33e0b3941817dcaae6'
      ],
      [
        'fea74e3dbe778b1b10f238ad61686aa5c76e3db2be43057632427e2840fb27b6',
        '6e0568db9b0b13297cf674deccb6af93126b596b973f7b77701d3db7f23cb96f'
      ],
      [
        '76e64113f677cf0e10a2570d599968d31544e179b760432952c02a4417bdde39',
        'c90ddf8dee4e95cf577066d70681f0d35e2a33d2b56d2032b4b1752d1901ac01'
      ],
      [
        'c738c56b03b2abe1e8281baa743f8f9a8f7cc643df26cbee3ab150242bcbb891',
        '893fb578951ad2537f718f2eacbfbbbb82314eef7880cfe917e735d9699a84c3'
      ],
      [
        'd895626548b65b81e264c7637c972877d1d72e5f3a925014372e9f6588f6c14b',
        'febfaa38f2bc7eae728ec60818c340eb03428d632bb067e179363ed75d7d991f'
      ],
      [
        'b8da94032a957518eb0f6433571e8761ceffc73693e84edd49150a564f676e03',
        '2804dfa44805a1e4d7c99cc9762808b092cc584d95ff3b511488e4e74efdf6e7'
      ],
      [
        'e80fea14441fb33a7d8adab9475d7fab2019effb5156a792f1a11778e3c0df5d',
        'eed1de7f638e00771e89768ca3ca94472d155e80af322ea9fcb4291b6ac9ec78'
      ],
      [
        'a301697bdfcd704313ba48e51d567543f2a182031efd6915ddc07bbcc4e16070',
        '7370f91cfb67e4f5081809fa25d40f9b1735dbf7c0a11a130c0d1a041e177ea1'
      ],
      [
        '90ad85b389d6b936463f9d0512678de208cc330b11307fffab7ac63e3fb04ed4',
        'e507a3620a38261affdcbd9427222b839aefabe1582894d991d4d48cb6ef150'
      ],
      [
        '8f68b9d2f63b5f339239c1ad981f162ee88c5678723ea3351b7b444c9ec4c0da',
        '662a9f2dba063986de1d90c2b6be215dbbea2cfe95510bfdf23cbf79501fff82'
      ],
      [
        'e4f3fb0176af85d65ff99ff9198c36091f48e86503681e3e6686fd5053231e11',
        '1e63633ad0ef4f1c1661a6d0ea02b7286cc7e74ec951d1c9822c38576feb73bc'
      ],
      [
        '8c00fa9b18ebf331eb961537a45a4266c7034f2f0d4e1d0716fb6eae20eae29e',
        'efa47267fea521a1a9dc343a3736c974c2fadafa81e36c54e7d2a4c66702414b'
      ],
      [
        'e7a26ce69dd4829f3e10cec0a9e98ed3143d084f308b92c0997fddfc60cb3e41',
        '2a758e300fa7984b471b006a1aafbb18d0a6b2c0420e83e20e8a9421cf2cfd51'
      ],
      [
        'b6459e0ee3662ec8d23540c223bcbdc571cbcb967d79424f3cf29eb3de6b80ef',
        '67c876d06f3e06de1dadf16e5661db3c4b3ae6d48e35b2ff30bf0b61a71ba45'
      ],
      [
        'd68a80c8280bb840793234aa118f06231d6f1fc67e73c5a5deda0f5b496943e8',
        'db8ba9fff4b586d00c4b1f9177b0e28b5b0e7b8f7845295a294c84266b133120'
      ],
      [
        '324aed7df65c804252dc0270907a30b09612aeb973449cea4095980fc28d3d5d',
        '648a365774b61f2ff130c0c35aec1f4f19213b0c7e332843967224af96ab7c84'
      ],
      [
        '4df9c14919cde61f6d51dfdbe5fee5dceec4143ba8d1ca888e8bd373fd054c96',
        '35ec51092d8728050974c23a1d85d4b5d506cdc288490192ebac06cad10d5d'
      ],
      [
        '9c3919a84a474870faed8a9c1cc66021523489054d7f0308cbfc99c8ac1f98cd',
        'ddb84f0f4a4ddd57584f044bf260e641905326f76c64c8e6be7e5e03d4fc599d'
      ],
      [
        '6057170b1dd12fdf8de05f281d8e06bb91e1493a8b91d4cc5a21382120a959e5',
        '9a1af0b26a6a4807add9a2daf71df262465152bc3ee24c65e899be932385a2a8'
      ],
      [
        'a576df8e23a08411421439a4518da31880cef0fba7d4df12b1a6973eecb94266',
        '40a6bf20e76640b2c92b97afe58cd82c432e10a7f514d9f3ee8be11ae1b28ec8'
      ],
      [
        '7778a78c28dec3e30a05fe9629de8c38bb30d1f5cf9a3a208f763889be58ad71',
        '34626d9ab5a5b22ff7098e12f2ff580087b38411ff24ac563b513fc1fd9f43ac'
      ],
      [
        '928955ee637a84463729fd30e7afd2ed5f96274e5ad7e5cb09eda9c06d903ac',
        'c25621003d3f42a827b78a13093a95eeac3d26efa8a8d83fc5180e935bcd091f'
      ],
      [
        '85d0fef3ec6db109399064f3a0e3b2855645b4a907ad354527aae75163d82751',
        '1f03648413a38c0be29d496e582cf5663e8751e96877331582c237a24eb1f962'
      ],
      [
        'ff2b0dce97eece97c1c9b6041798b85dfdfb6d8882da20308f5404824526087e',
        '493d13fef524ba188af4c4dc54d07936c7b7ed6fb90e2ceb2c951e01f0c29907'
      ],
      [
        '827fbbe4b1e880ea9ed2b2e6301b212b57f1ee148cd6dd28780e5e2cf856e241',
        'c60f9c923c727b0b71bef2c67d1d12687ff7a63186903166d605b68baec293ec'
      ],
      [
        'eaa649f21f51bdbae7be4ae34ce6e5217a58fdce7f47f9aa7f3b58fa2120e2b3',
        'be3279ed5bbbb03ac69a80f89879aa5a01a6b965f13f7e59d47a5305ba5ad93d'
      ],
      [
        'e4a42d43c5cf169d9391df6decf42ee541b6d8f0c9a137401e23632dda34d24f',
        '4d9f92e716d1c73526fc99ccfb8ad34ce886eedfa8d8e4f13a7f7131deba9414'
      ],
      [
        '1ec80fef360cbdd954160fadab352b6b92b53576a88fea4947173b9d4300bf19',
        'aeefe93756b5340d2f3a4958a7abbf5e0146e77f6295a07b671cdc1cc107cefd'
      ],
      [
        '146a778c04670c2f91b00af4680dfa8bce3490717d58ba889ddb5928366642be',
        'b318e0ec3354028add669827f9d4b2870aaa971d2f7e5ed1d0b297483d83efd0'
      ],
      [
        'fa50c0f61d22e5f07e3acebb1aa07b128d0012209a28b9776d76a8793180eef9',
        '6b84c6922397eba9b72cd2872281a68a5e683293a57a213b38cd8d7d3f4f2811'
      ],
      [
        'da1d61d0ca721a11b1a5bf6b7d88e8421a288ab5d5bba5220e53d32b5f067ec2',
        '8157f55a7c99306c79c0766161c91e2966a73899d279b48a655fba0f1ad836f1'
      ],
      [
        'a8e282ff0c9706907215ff98e8fd416615311de0446f1e062a73b0610d064e13',
        '7f97355b8db81c09abfb7f3c5b2515888b679a3e50dd6bd6cef7c73111f4cc0c'
      ],
      [
        '174a53b9c9a285872d39e56e6913cab15d59b1fa512508c022f382de8319497c',
        'ccc9dc37abfc9c1657b4155f2c47f9e6646b3a1d8cb9854383da13ac079afa73'
      ],
      [
        '959396981943785c3d3e57edf5018cdbe039e730e4918b3d884fdff09475b7ba',
        '2e7e552888c331dd8ba0386a4b9cd6849c653f64c8709385e9b8abf87524f2fd'
      ],
      [
        'd2a63a50ae401e56d645a1153b109a8fcca0a43d561fba2dbb51340c9d82b151',
        'e82d86fb6443fcb7565aee58b2948220a70f750af484ca52d4142174dcf89405'
      ],
      [
        '64587e2335471eb890ee7896d7cfdc866bacbdbd3839317b3436f9b45617e073',
        'd99fcdd5bf6902e2ae96dd6447c299a185b90a39133aeab358299e5e9faf6589'
      ],
      [
        '8481bde0e4e4d885b3a546d3e549de042f0aa6cea250e7fd358d6c86dd45e458',
        '38ee7b8cba5404dd84a25bf39cecb2ca900a79c42b262e556d64b1b59779057e'
      ],
      [
        '13464a57a78102aa62b6979ae817f4637ffcfed3c4b1ce30bcd6303f6caf666b',
        '69be159004614580ef7e433453ccb0ca48f300a81d0942e13f495a907f6ecc27'
      ],
      [
        'bc4a9df5b713fe2e9aef430bcc1dc97a0cd9ccede2f28588cada3a0d2d83f366',
        'd3a81ca6e785c06383937adf4b798caa6e8a9fbfa547b16d758d666581f33c1'
      ],
      [
        '8c28a97bf8298bc0d23d8c749452a32e694b65e30a9472a3954ab30fe5324caa',
        '40a30463a3305193378fedf31f7cc0eb7ae784f0451cb9459e71dc73cbef9482'
      ],
      [
        '8ea9666139527a8c1dd94ce4f071fd23c8b350c5a4bb33748c4ba111faccae0',
        '620efabbc8ee2782e24e7c0cfb95c5d735b783be9cf0f8e955af34a30e62b945'
      ],
      [
        'dd3625faef5ba06074669716bbd3788d89bdde815959968092f76cc4eb9a9787',
        '7a188fa3520e30d461da2501045731ca941461982883395937f68d00c644a573'
      ],
      [
        'f710d79d9eb962297e4f6232b40e8f7feb2bc63814614d692c12de752408221e',
        'ea98e67232d3b3295d3b535532115ccac8612c721851617526ae47a9c77bfc82'
      ]
    ]
  },
  naf: {
    wnd: 7,
    points: [
      [
        'f9308a019258c31049344f85f89d5229b531c845836f99b08601f113bce036f9',
        '388f7b0f632de8140fe337e62a37f3566500a99934c2231b6cb9fd7584b8e672'
      ],
      [
        '2f8bde4d1a07209355b4a7250a5c5128e88b84bddc619ab7cba8d569b240efe4',
        'd8ac222636e5e3d6d4dba9dda6c9c426f788271bab0d6840dca87d3aa6ac62d6'
      ],
      [
        '5cbdf0646e5db4eaa398f365f2ea7a0e3d419b7e0330e39ce92bddedcac4f9bc',
        '6aebca40ba255960a3178d6d861a54dba813d0b813fde7b5a5082628087264da'
      ],
      [
        'acd484e2f0c7f65309ad178a9f559abde09796974c57e714c35f110dfc27ccbe',
        'cc338921b0a7d9fd64380971763b61e9add888a4375f8e0f05cc262ac64f9c37'
      ],
      [
        '774ae7f858a9411e5ef4246b70c65aac5649980be5c17891bbec17895da008cb',
        'd984a032eb6b5e190243dd56d7b7b365372db1e2dff9d6a8301d74c9c953c61b'
      ],
      [
        'f28773c2d975288bc7d1d205c3748651b075fbc6610e58cddeeddf8f19405aa8',
        'ab0902e8d880a89758212eb65cdaf473a1a06da521fa91f29b5cb52db03ed81'
      ],
      [
        'd7924d4f7d43ea965a465ae3095ff41131e5946f3c85f79e44adbcf8e27e080e',
        '581e2872a86c72a683842ec228cc6defea40af2bd896d3a5c504dc9ff6a26b58'
      ],
      [
        'defdea4cdb677750a420fee807eacf21eb9898ae79b9768766e4faa04a2d4a34',
        '4211ab0694635168e997b0ead2a93daeced1f4a04a95c0f6cfb199f69e56eb77'
      ],
      [
        '2b4ea0a797a443d293ef5cff444f4979f06acfebd7e86d277475656138385b6c',
        '85e89bc037945d93b343083b5a1c86131a01f60c50269763b570c854e5c09b7a'
      ],
      [
        '352bbf4a4cdd12564f93fa332ce333301d9ad40271f8107181340aef25be59d5',
        '321eb4075348f534d59c18259dda3e1f4a1b3b2e71b1039c67bd3d8bcf81998c'
      ],
      [
        '2fa2104d6b38d11b0230010559879124e42ab8dfeff5ff29dc9cdadd4ecacc3f',
        '2de1068295dd865b64569335bd5dd80181d70ecfc882648423ba76b532b7d67'
      ],
      [
        '9248279b09b4d68dab21a9b066edda83263c3d84e09572e269ca0cd7f5453714',
        '73016f7bf234aade5d1aa71bdea2b1ff3fc0de2a887912ffe54a32ce97cb3402'
      ],
      [
        'daed4f2be3a8bf278e70132fb0beb7522f570e144bf615c07e996d443dee8729',
        'a69dce4a7d6c98e8d4a1aca87ef8d7003f83c230f3afa726ab40e52290be1c55'
      ],
      [
        'c44d12c7065d812e8acf28d7cbb19f9011ecd9e9fdf281b0e6a3b5e87d22e7db',
        '2119a460ce326cdc76c45926c982fdac0e106e861edf61c5a039063f0e0e6482'
      ],
      [
        '6a245bf6dc698504c89a20cfded60853152b695336c28063b61c65cbd269e6b4',
        'e022cf42c2bd4a708b3f5126f16a24ad8b33ba48d0423b6efd5e6348100d8a82'
      ],
      [
        '1697ffa6fd9de627c077e3d2fe541084ce13300b0bec1146f95ae57f0d0bd6a5',
        'b9c398f186806f5d27561506e4557433a2cf15009e498ae7adee9d63d01b2396'
      ],
      [
        '605bdb019981718b986d0f07e834cb0d9deb8360ffb7f61df982345ef27a7479',
        '2972d2de4f8d20681a78d93ec96fe23c26bfae84fb14db43b01e1e9056b8c49'
      ],
      [
        '62d14dab4150bf497402fdc45a215e10dcb01c354959b10cfe31c7e9d87ff33d',
        '80fc06bd8cc5b01098088a1950eed0db01aa132967ab472235f5642483b25eaf'
      ],
      [
        '80c60ad0040f27dade5b4b06c408e56b2c50e9f56b9b8b425e555c2f86308b6f',
        '1c38303f1cc5c30f26e66bad7fe72f70a65eed4cbe7024eb1aa01f56430bd57a'
      ],
      [
        '7a9375ad6167ad54aa74c6348cc54d344cc5dc9487d847049d5eabb0fa03c8fb',
        'd0e3fa9eca8726909559e0d79269046bdc59ea10c70ce2b02d499ec224dc7f7'
      ],
      [
        'd528ecd9b696b54c907a9ed045447a79bb408ec39b68df504bb51f459bc3ffc9',
        'eecf41253136e5f99966f21881fd656ebc4345405c520dbc063465b521409933'
      ],
      [
        '49370a4b5f43412ea25f514e8ecdad05266115e4a7ecb1387231808f8b45963',
        '758f3f41afd6ed428b3081b0512fd62a54c3f3afbb5b6764b653052a12949c9a'
      ],
      [
        '77f230936ee88cbbd73df930d64702ef881d811e0e1498e2f1c13eb1fc345d74',
        '958ef42a7886b6400a08266e9ba1b37896c95330d97077cbbe8eb3c7671c60d6'
      ],
      [
        'f2dac991cc4ce4b9ea44887e5c7c0bce58c80074ab9d4dbaeb28531b7739f530',
        'e0dedc9b3b2f8dad4da1f32dec2531df9eb5fbeb0598e4fd1a117dba703a3c37'
      ],
      [
        '463b3d9f662621fb1b4be8fbbe2520125a216cdfc9dae3debcba4850c690d45b',
        '5ed430d78c296c3543114306dd8622d7c622e27c970a1de31cb377b01af7307e'
      ],
      [
        'f16f804244e46e2a09232d4aff3b59976b98fac14328a2d1a32496b49998f247',
        'cedabd9b82203f7e13d206fcdf4e33d92a6c53c26e5cce26d6579962c4e31df6'
      ],
      [
        'caf754272dc84563b0352b7a14311af55d245315ace27c65369e15f7151d41d1',
        'cb474660ef35f5f2a41b643fa5e460575f4fa9b7962232a5c32f908318a04476'
      ],
      [
        '2600ca4b282cb986f85d0f1709979d8b44a09c07cb86d7c124497bc86f082120',
        '4119b88753c15bd6a693b03fcddbb45d5ac6be74ab5f0ef44b0be9475a7e4b40'
      ],
      [
        '7635ca72d7e8432c338ec53cd12220bc01c48685e24f7dc8c602a7746998e435',
        '91b649609489d613d1d5e590f78e6d74ecfc061d57048bad9e76f302c5b9c61'
      ],
      [
        '754e3239f325570cdbbf4a87deee8a66b7f2b33479d468fbc1a50743bf56cc18',
        '673fb86e5bda30fb3cd0ed304ea49a023ee33d0197a695d0c5d98093c536683'
      ],
      [
        'e3e6bd1071a1e96aff57859c82d570f0330800661d1c952f9fe2694691d9b9e8',
        '59c9e0bba394e76f40c0aa58379a3cb6a5a2283993e90c4167002af4920e37f5'
      ],
      [
        '186b483d056a033826ae73d88f732985c4ccb1f32ba35f4b4cc47fdcf04aa6eb',
        '3b952d32c67cf77e2e17446e204180ab21fb8090895138b4a4a797f86e80888b'
      ],
      [
        'df9d70a6b9876ce544c98561f4be4f725442e6d2b737d9c91a8321724ce0963f',
        '55eb2dafd84d6ccd5f862b785dc39d4ab157222720ef9da217b8c45cf2ba2417'
      ],
      [
        '5edd5cc23c51e87a497ca815d5dce0f8ab52554f849ed8995de64c5f34ce7143',
        'efae9c8dbc14130661e8cec030c89ad0c13c66c0d17a2905cdc706ab7399a868'
      ],
      [
        '290798c2b6476830da12fe02287e9e777aa3fba1c355b17a722d362f84614fba',
        'e38da76dcd440621988d00bcf79af25d5b29c094db2a23146d003afd41943e7a'
      ],
      [
        'af3c423a95d9f5b3054754efa150ac39cd29552fe360257362dfdecef4053b45',
        'f98a3fd831eb2b749a93b0e6f35cfb40c8cd5aa667a15581bc2feded498fd9c6'
      ],
      [
        '766dbb24d134e745cccaa28c99bf274906bb66b26dcf98df8d2fed50d884249a',
        '744b1152eacbe5e38dcc887980da38b897584a65fa06cedd2c924f97cbac5996'
      ],
      [
        '59dbf46f8c94759ba21277c33784f41645f7b44f6c596a58ce92e666191abe3e',
        'c534ad44175fbc300f4ea6ce648309a042ce739a7919798cd85e216c4a307f6e'
      ],
      [
        'f13ada95103c4537305e691e74e9a4a8dd647e711a95e73cb62dc6018cfd87b8',
        'e13817b44ee14de663bf4bc808341f326949e21a6a75c2570778419bdaf5733d'
      ],
      [
        '7754b4fa0e8aced06d4167a2c59cca4cda1869c06ebadfb6488550015a88522c',
        '30e93e864e669d82224b967c3020b8fa8d1e4e350b6cbcc537a48b57841163a2'
      ],
      [
        '948dcadf5990e048aa3874d46abef9d701858f95de8041d2a6828c99e2262519',
        'e491a42537f6e597d5d28a3224b1bc25df9154efbd2ef1d2cbba2cae5347d57e'
      ],
      [
        '7962414450c76c1689c7b48f8202ec37fb224cf5ac0bfa1570328a8a3d7c77ab',
        '100b610ec4ffb4760d5c1fc133ef6f6b12507a051f04ac5760afa5b29db83437'
      ],
      [
        '3514087834964b54b15b160644d915485a16977225b8847bb0dd085137ec47ca',
        'ef0afbb2056205448e1652c48e8127fc6039e77c15c2378b7e7d15a0de293311'
      ],
      [
        'd3cc30ad6b483e4bc79ce2c9dd8bc54993e947eb8df787b442943d3f7b527eaf',
        '8b378a22d827278d89c5e9be8f9508ae3c2ad46290358630afb34db04eede0a4'
      ],
      [
        '1624d84780732860ce1c78fcbfefe08b2b29823db913f6493975ba0ff4847610',
        '68651cf9b6da903e0914448c6cd9d4ca896878f5282be4c8cc06e2a404078575'
      ],
      [
        '733ce80da955a8a26902c95633e62a985192474b5af207da6df7b4fd5fc61cd4',
        'f5435a2bd2badf7d485a4d8b8db9fcce3e1ef8e0201e4578c54673bc1dc5ea1d'
      ],
      [
        '15d9441254945064cf1a1c33bbd3b49f8966c5092171e699ef258dfab81c045c',
        'd56eb30b69463e7234f5137b73b84177434800bacebfc685fc37bbe9efe4070d'
      ],
      [
        'a1d0fcf2ec9de675b612136e5ce70d271c21417c9d2b8aaaac138599d0717940',
        'edd77f50bcb5a3cab2e90737309667f2641462a54070f3d519212d39c197a629'
      ],
      [
        'e22fbe15c0af8ccc5780c0735f84dbe9a790badee8245c06c7ca37331cb36980',
        'a855babad5cd60c88b430a69f53a1a7a38289154964799be43d06d77d31da06'
      ],
      [
        '311091dd9860e8e20ee13473c1155f5f69635e394704eaa74009452246cfa9b3',
        '66db656f87d1f04fffd1f04788c06830871ec5a64feee685bd80f0b1286d8374'
      ],
      [
        '34c1fd04d301be89b31c0442d3e6ac24883928b45a9340781867d4232ec2dbdf',
        '9414685e97b1b5954bd46f730174136d57f1ceeb487443dc5321857ba73abee'
      ],
      [
        'f219ea5d6b54701c1c14de5b557eb42a8d13f3abbcd08affcc2a5e6b049b8d63',
        '4cb95957e83d40b0f73af4544cccf6b1f4b08d3c07b27fb8d8c2962a400766d1'
      ],
      [
        'd7b8740f74a8fbaab1f683db8f45de26543a5490bca627087236912469a0b448',
        'fa77968128d9c92ee1010f337ad4717eff15db5ed3c049b3411e0315eaa4593b'
      ],
      [
        '32d31c222f8f6f0ef86f7c98d3a3335ead5bcd32abdd94289fe4d3091aa824bf',
        '5f3032f5892156e39ccd3d7915b9e1da2e6dac9e6f26e961118d14b8462e1661'
      ],
      [
        '7461f371914ab32671045a155d9831ea8793d77cd59592c4340f86cbc18347b5',
        '8ec0ba238b96bec0cbdddcae0aa442542eee1ff50c986ea6b39847b3cc092ff6'
      ],
      [
        'ee079adb1df1860074356a25aa38206a6d716b2c3e67453d287698bad7b2b2d6',
        '8dc2412aafe3be5c4c5f37e0ecc5f9f6a446989af04c4e25ebaac479ec1c8c1e'
      ],
      [
        '16ec93e447ec83f0467b18302ee620f7e65de331874c9dc72bfd8616ba9da6b5',
        '5e4631150e62fb40d0e8c2a7ca5804a39d58186a50e497139626778e25b0674d'
      ],
      [
        'eaa5f980c245f6f038978290afa70b6bd8855897f98b6aa485b96065d537bd99',
        'f65f5d3e292c2e0819a528391c994624d784869d7e6ea67fb18041024edc07dc'
      ],
      [
        '78c9407544ac132692ee1910a02439958ae04877151342ea96c4b6b35a49f51',
        'f3e0319169eb9b85d5404795539a5e68fa1fbd583c064d2462b675f194a3ddb4'
      ],
      [
        '494f4be219a1a77016dcd838431aea0001cdc8ae7a6fc688726578d9702857a5',
        '42242a969283a5f339ba7f075e36ba2af925ce30d767ed6e55f4b031880d562c'
      ],
      [
        'a598a8030da6d86c6bc7f2f5144ea549d28211ea58faa70ebf4c1e665c1fe9b5',
        '204b5d6f84822c307e4b4a7140737aec23fc63b65b35f86a10026dbd2d864e6b'
      ],
      [
        'c41916365abb2b5d09192f5f2dbeafec208f020f12570a184dbadc3e58595997',
        '4f14351d0087efa49d245b328984989d5caf9450f34bfc0ed16e96b58fa9913'
      ],
      [
        '841d6063a586fa475a724604da03bc5b92a2e0d2e0a36acfe4c73a5514742881',
        '73867f59c0659e81904f9a1c7543698e62562d6744c169ce7a36de01a8d6154'
      ],
      [
        '5e95bb399a6971d376026947f89bde2f282b33810928be4ded112ac4d70e20d5',
        '39f23f366809085beebfc71181313775a99c9aed7d8ba38b161384c746012865'
      ],
      [
        '36e4641a53948fd476c39f8a99fd974e5ec07564b5315d8bf99471bca0ef2f66',
        'd2424b1b1abe4eb8164227b085c9aa9456ea13493fd563e06fd51cf5694c78fc'
      ],
      [
        '336581ea7bfbbb290c191a2f507a41cf5643842170e914faeab27c2c579f726',
        'ead12168595fe1be99252129b6e56b3391f7ab1410cd1e0ef3dcdcabd2fda224'
      ],
      [
        '8ab89816dadfd6b6a1f2634fcf00ec8403781025ed6890c4849742706bd43ede',
        '6fdcef09f2f6d0a044e654aef624136f503d459c3e89845858a47a9129cdd24e'
      ],
      [
        '1e33f1a746c9c5778133344d9299fcaa20b0938e8acff2544bb40284b8c5fb94',
        '60660257dd11b3aa9c8ed618d24edff2306d320f1d03010e33a7d2057f3b3b6'
      ],
      [
        '85b7c1dcb3cec1b7ee7f30ded79dd20a0ed1f4cc18cbcfcfa410361fd8f08f31',
        '3d98a9cdd026dd43f39048f25a8847f4fcafad1895d7a633c6fed3c35e999511'
      ],
      [
        '29df9fbd8d9e46509275f4b125d6d45d7fbe9a3b878a7af872a2800661ac5f51',
        'b4c4fe99c775a606e2d8862179139ffda61dc861c019e55cd2876eb2a27d84b'
      ],
      [
        'a0b1cae06b0a847a3fea6e671aaf8adfdfe58ca2f768105c8082b2e449fce252',
        'ae434102edde0958ec4b19d917a6a28e6b72da1834aff0e650f049503a296cf2'
      ],
      [
        '4e8ceafb9b3e9a136dc7ff67e840295b499dfb3b2133e4ba113f2e4c0e121e5',
        'cf2174118c8b6d7a4b48f6d534ce5c79422c086a63460502b827ce62a326683c'
      ],
      [
        'd24a44e047e19b6f5afb81c7ca2f69080a5076689a010919f42725c2b789a33b',
        '6fb8d5591b466f8fc63db50f1c0f1c69013f996887b8244d2cdec417afea8fa3'
      ],
      [
        'ea01606a7a6c9cdd249fdfcfacb99584001edd28abbab77b5104e98e8e3b35d4',
        '322af4908c7312b0cfbfe369f7a7b3cdb7d4494bc2823700cfd652188a3ea98d'
      ],
      [
        'af8addbf2b661c8a6c6328655eb96651252007d8c5ea31be4ad196de8ce2131f',
        '6749e67c029b85f52a034eafd096836b2520818680e26ac8f3dfbcdb71749700'
      ],
      [
        'e3ae1974566ca06cc516d47e0fb165a674a3dabcfca15e722f0e3450f45889',
        '2aeabe7e4531510116217f07bf4d07300de97e4874f81f533420a72eeb0bd6a4'
      ],
      [
        '591ee355313d99721cf6993ffed1e3e301993ff3ed258802075ea8ced397e246',
        'b0ea558a113c30bea60fc4775460c7901ff0b053d25ca2bdeee98f1a4be5d196'
      ],
      [
        '11396d55fda54c49f19aa97318d8da61fa8584e47b084945077cf03255b52984',
        '998c74a8cd45ac01289d5833a7beb4744ff536b01b257be4c5767bea93ea57a4'
      ],
      [
        '3c5d2a1ba39c5a1790000738c9e0c40b8dcdfd5468754b6405540157e017aa7a',
        'b2284279995a34e2f9d4de7396fc18b80f9b8b9fdd270f6661f79ca4c81bd257'
      ],
      [
        'cc8704b8a60a0defa3a99a7299f2e9c3fbc395afb04ac078425ef8a1793cc030',
        'bdd46039feed17881d1e0862db347f8cf395b74fc4bcdc4e940b74e3ac1f1b13'
      ],
      [
        'c533e4f7ea8555aacd9777ac5cad29b97dd4defccc53ee7ea204119b2889b197',
        '6f0a256bc5efdf429a2fb6242f1a43a2d9b925bb4a4b3a26bb8e0f45eb596096'
      ],
      [
        'c14f8f2ccb27d6f109f6d08d03cc96a69ba8c34eec07bbcf566d48e33da6593',
        'c359d6923bb398f7fd4473e16fe1c28475b740dd098075e6c0e8649113dc3a38'
      ],
      [
        'a6cbc3046bc6a450bac24789fa17115a4c9739ed75f8f21ce441f72e0b90e6ef',
        '21ae7f4680e889bb130619e2c0f95a360ceb573c70603139862afd617fa9b9f'
      ],
      [
        '347d6d9a02c48927ebfb86c1359b1caf130a3c0267d11ce6344b39f99d43cc38',
        '60ea7f61a353524d1c987f6ecec92f086d565ab687870cb12689ff1e31c74448'
      ],
      [
        'da6545d2181db8d983f7dcb375ef5866d47c67b1bf31c8cf855ef7437b72656a',
        '49b96715ab6878a79e78f07ce5680c5d6673051b4935bd897fea824b77dc208a'
      ],
      [
        'c40747cc9d012cb1a13b8148309c6de7ec25d6945d657146b9d5994b8feb1111',
        '5ca560753be2a12fc6de6caf2cb489565db936156b9514e1bb5e83037e0fa2d4'
      ],
      [
        '4e42c8ec82c99798ccf3a610be870e78338c7f713348bd34c8203ef4037f3502',
        '7571d74ee5e0fb92a7a8b33a07783341a5492144cc54bcc40a94473693606437'
      ],
      [
        '3775ab7089bc6af823aba2e1af70b236d251cadb0c86743287522a1b3b0dedea',
        'be52d107bcfa09d8bcb9736a828cfa7fac8db17bf7a76a2c42ad961409018cf7'
      ],
      [
        'cee31cbf7e34ec379d94fb814d3d775ad954595d1314ba8846959e3e82f74e26',
        '8fd64a14c06b589c26b947ae2bcf6bfa0149ef0be14ed4d80f448a01c43b1c6d'
      ],
      [
        'b4f9eaea09b6917619f6ea6a4eb5464efddb58fd45b1ebefcdc1a01d08b47986',
        '39e5c9925b5a54b07433a4f18c61726f8bb131c012ca542eb24a8ac07200682a'
      ],
      [
        'd4263dfc3d2df923a0179a48966d30ce84e2515afc3dccc1b77907792ebcc60e',
        '62dfaf07a0f78feb30e30d6295853ce189e127760ad6cf7fae164e122a208d54'
      ],
      [
        '48457524820fa65a4f8d35eb6930857c0032acc0a4a2de422233eeda897612c4',
        '25a748ab367979d98733c38a1fa1c2e7dc6cc07db2d60a9ae7a76aaa49bd0f77'
      ],
      [
        'dfeeef1881101f2cb11644f3a2afdfc2045e19919152923f367a1767c11cceda',
        'ecfb7056cf1de042f9420bab396793c0c390bde74b4bbdff16a83ae09a9a7517'
      ],
      [
        '6d7ef6b17543f8373c573f44e1f389835d89bcbc6062ced36c82df83b8fae859',
        'cd450ec335438986dfefa10c57fea9bcc521a0959b2d80bbf74b190dca712d10'
      ],
      [
        'e75605d59102a5a2684500d3b991f2e3f3c88b93225547035af25af66e04541f',
        'f5c54754a8f71ee540b9b48728473e314f729ac5308b06938360990e2bfad125'
      ],
      [
        'eb98660f4c4dfaa06a2be453d5020bc99a0c2e60abe388457dd43fefb1ed620c',
        '6cb9a8876d9cb8520609af3add26cd20a0a7cd8a9411131ce85f44100099223e'
      ],
      [
        '13e87b027d8514d35939f2e6892b19922154596941888336dc3563e3b8dba942',
        'fef5a3c68059a6dec5d624114bf1e91aac2b9da568d6abeb2570d55646b8adf1'
      ],
      [
        'ee163026e9fd6fe017c38f06a5be6fc125424b371ce2708e7bf4491691e5764a',
        '1acb250f255dd61c43d94ccc670d0f58f49ae3fa15b96623e5430da0ad6c62b2'
      ],
      [
        'b268f5ef9ad51e4d78de3a750c2dc89b1e626d43505867999932e5db33af3d80',
        '5f310d4b3c99b9ebb19f77d41c1dee018cf0d34fd4191614003e945a1216e423'
      ],
      [
        'ff07f3118a9df035e9fad85eb6c7bfe42b02f01ca99ceea3bf7ffdba93c4750d',
        '438136d603e858a3a5c440c38eccbaddc1d2942114e2eddd4740d098ced1f0d8'
      ],
      [
        '8d8b9855c7c052a34146fd20ffb658bea4b9f69e0d825ebec16e8c3ce2b526a1',
        'cdb559eedc2d79f926baf44fb84ea4d44bcf50fee51d7ceb30e2e7f463036758'
      ],
      [
        '52db0b5384dfbf05bfa9d472d7ae26dfe4b851ceca91b1eba54263180da32b63',
        'c3b997d050ee5d423ebaf66a6db9f57b3180c902875679de924b69d84a7b375'
      ],
      [
        'e62f9490d3d51da6395efd24e80919cc7d0f29c3f3fa48c6fff543becbd43352',
        '6d89ad7ba4876b0b22c2ca280c682862f342c8591f1daf5170e07bfd9ccafa7d'
      ],
      [
        '7f30ea2476b399b4957509c88f77d0191afa2ff5cb7b14fd6d8e7d65aaab1193',
        'ca5ef7d4b231c94c3b15389a5f6311e9daff7bb67b103e9880ef4bff637acaec'
      ],
      [
        '5098ff1e1d9f14fb46a210fada6c903fef0fb7b4a1dd1d9ac60a0361800b7a00',
        '9731141d81fc8f8084d37c6e7542006b3ee1b40d60dfe5362a5b132fd17ddc0'
      ],
      [
        '32b78c7de9ee512a72895be6b9cbefa6e2f3c4ccce445c96b9f2c81e2778ad58',
        'ee1849f513df71e32efc3896ee28260c73bb80547ae2275ba497237794c8753c'
      ],
      [
        'e2cb74fddc8e9fbcd076eef2a7c72b0ce37d50f08269dfc074b581550547a4f7',
        'd3aa2ed71c9dd2247a62df062736eb0baddea9e36122d2be8641abcb005cc4a4'
      ],
      [
        '8438447566d4d7bedadc299496ab357426009a35f235cb141be0d99cd10ae3a8',
        'c4e1020916980a4da5d01ac5e6ad330734ef0d7906631c4f2390426b2edd791f'
      ],
      [
        '4162d488b89402039b584c6fc6c308870587d9c46f660b878ab65c82c711d67e',
        '67163e903236289f776f22c25fb8a3afc1732f2b84b4e95dbda47ae5a0852649'
      ],
      [
        '3fad3fa84caf0f34f0f89bfd2dcf54fc175d767aec3e50684f3ba4a4bf5f683d',
        'cd1bc7cb6cc407bb2f0ca647c718a730cf71872e7d0d2a53fa20efcdfe61826'
      ],
      [
        '674f2600a3007a00568c1a7ce05d0816c1fb84bf1370798f1c69532faeb1a86b',
        '299d21f9413f33b3edf43b257004580b70db57da0b182259e09eecc69e0d38a5'
      ],
      [
        'd32f4da54ade74abb81b815ad1fb3b263d82d6c692714bcff87d29bd5ee9f08f',
        'f9429e738b8e53b968e99016c059707782e14f4535359d582fc416910b3eea87'
      ],
      [
        '30e4e670435385556e593657135845d36fbb6931f72b08cb1ed954f1e3ce3ff6',
        '462f9bce619898638499350113bbc9b10a878d35da70740dc695a559eb88db7b'
      ],
      [
        'be2062003c51cc3004682904330e4dee7f3dcd10b01e580bf1971b04d4cad297',
        '62188bc49d61e5428573d48a74e1c655b1c61090905682a0d5558ed72dccb9bc'
      ],
      [
        '93144423ace3451ed29e0fb9ac2af211cb6e84a601df5993c419859fff5df04a',
        '7c10dfb164c3425f5c71a3f9d7992038f1065224f72bb9d1d902a6d13037b47c'
      ],
      [
        'b015f8044f5fcbdcf21ca26d6c34fb8197829205c7b7d2a7cb66418c157b112c',
        'ab8c1e086d04e813744a655b2df8d5f83b3cdc6faa3088c1d3aea1454e3a1d5f'
      ],
      [
        'd5e9e1da649d97d89e4868117a465a3a4f8a18de57a140d36b3f2af341a21b52',
        '4cb04437f391ed73111a13cc1d4dd0db1693465c2240480d8955e8592f27447a'
      ],
      [
        'd3ae41047dd7ca065dbf8ed77b992439983005cd72e16d6f996a5316d36966bb',
        'bd1aeb21ad22ebb22a10f0303417c6d964f8cdd7df0aca614b10dc14d125ac46'
      ],
      [
        '463e2763d885f958fc66cdd22800f0a487197d0a82e377b49f80af87c897b065',
        'bfefacdb0e5d0fd7df3a311a94de062b26b80c61fbc97508b79992671ef7ca7f'
      ],
      [
        '7985fdfd127c0567c6f53ec1bb63ec3158e597c40bfe747c83cddfc910641917',
        '603c12daf3d9862ef2b25fe1de289aed24ed291e0ec6708703a5bd567f32ed03'
      ],
      [
        '74a1ad6b5f76e39db2dd249410eac7f99e74c59cb83d2d0ed5ff1543da7703e9',
        'cc6157ef18c9c63cd6193d83631bbea0093e0968942e8c33d5737fd790e0db08'
      ],
      [
        '30682a50703375f602d416664ba19b7fc9bab42c72747463a71d0896b22f6da3',
        '553e04f6b018b4fa6c8f39e7f311d3176290d0e0f19ca73f17714d9977a22ff8'
      ],
      [
        '9e2158f0d7c0d5f26c3791efefa79597654e7a2b2464f52b1ee6c1347769ef57',
        '712fcdd1b9053f09003a3481fa7762e9ffd7c8ef35a38509e2fbf2629008373'
      ],
      [
        '176e26989a43c9cfeba4029c202538c28172e566e3c4fce7322857f3be327d66',
        'ed8cc9d04b29eb877d270b4878dc43c19aefd31f4eee09ee7b47834c1fa4b1c3'
      ],
      [
        '75d46efea3771e6e68abb89a13ad747ecf1892393dfc4f1b7004788c50374da8',
        '9852390a99507679fd0b86fd2b39a868d7efc22151346e1a3ca4726586a6bed8'
      ],
      [
        '809a20c67d64900ffb698c4c825f6d5f2310fb0451c869345b7319f645605721',
        '9e994980d9917e22b76b061927fa04143d096ccc54963e6a5ebfa5f3f8e286c1'
      ],
      [
        '1b38903a43f7f114ed4500b4eac7083fdefece1cf29c63528d563446f972c180',
        '4036edc931a60ae889353f77fd53de4a2708b26b6f5da72ad3394119daf408f9'
      ]
    ]
  }
};

var curves_1 = createCommonjsModule(function (module, exports) {

var curves = exports;





var assert = utils_1$1.assert;

function PresetCurve(options) {
  if (options.type === 'short')
    this.curve = new curve_1.short(options);
  else if (options.type === 'edwards')
    this.curve = new curve_1.edwards(options);
  else
    this.curve = new curve_1.mont(options);
  this.g = this.curve.g;
  this.n = this.curve.n;
  this.hash = options.hash;

  assert(this.g.validate(), 'Invalid curve');
  assert(this.g.mul(this.n).isInfinity(), 'Invalid curve, G*N != O');
}
curves.PresetCurve = PresetCurve;

function defineCurve(name, options) {
  Object.defineProperty(curves, name, {
    configurable: true,
    enumerable: true,
    get: function() {
      var curve = new PresetCurve(options);
      Object.defineProperty(curves, name, {
        configurable: true,
        enumerable: true,
        value: curve
      });
      return curve;
    }
  });
}

defineCurve('p192', {
  type: 'short',
  prime: 'p192',
  p: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff',
  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff fffffffc',
  b: '64210519 e59c80e7 0fa7e9ab 72243049 feb8deec c146b9b1',
  n: 'ffffffff ffffffff ffffffff 99def836 146bc9b1 b4d22831',
  hash: hash_1.sha256,
  gRed: false,
  g: [
    '188da80e b03090f6 7cbf20eb 43a18800 f4ff0afd 82ff1012',
    '07192b95 ffc8da78 631011ed 6b24cdd5 73f977a1 1e794811'
  ]
});

defineCurve('p224', {
  type: 'short',
  prime: 'p224',
  p: 'ffffffff ffffffff ffffffff ffffffff 00000000 00000000 00000001',
  a: 'ffffffff ffffffff ffffffff fffffffe ffffffff ffffffff fffffffe',
  b: 'b4050a85 0c04b3ab f5413256 5044b0b7 d7bfd8ba 270b3943 2355ffb4',
  n: 'ffffffff ffffffff ffffffff ffff16a2 e0b8f03e 13dd2945 5c5c2a3d',
  hash: hash_1.sha256,
  gRed: false,
  g: [
    'b70e0cbd 6bb4bf7f 321390b9 4a03c1d3 56c21122 343280d6 115c1d21',
    'bd376388 b5f723fb 4c22dfe6 cd4375a0 5a074764 44d58199 85007e34'
  ]
});

defineCurve('p256', {
  type: 'short',
  prime: null,
  p: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff ffffffff',
  a: 'ffffffff 00000001 00000000 00000000 00000000 ffffffff ffffffff fffffffc',
  b: '5ac635d8 aa3a93e7 b3ebbd55 769886bc 651d06b0 cc53b0f6 3bce3c3e 27d2604b',
  n: 'ffffffff 00000000 ffffffff ffffffff bce6faad a7179e84 f3b9cac2 fc632551',
  hash: hash_1.sha256,
  gRed: false,
  g: [
    '6b17d1f2 e12c4247 f8bce6e5 63a440f2 77037d81 2deb33a0 f4a13945 d898c296',
    '4fe342e2 fe1a7f9b 8ee7eb4a 7c0f9e16 2bce3357 6b315ece cbb64068 37bf51f5'
  ]
});

defineCurve('p384', {
  type: 'short',
  prime: null,
  p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
     'fffffffe ffffffff 00000000 00000000 ffffffff',
  a: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
     'fffffffe ffffffff 00000000 00000000 fffffffc',
  b: 'b3312fa7 e23ee7e4 988e056b e3f82d19 181d9c6e fe814112 0314088f ' +
     '5013875a c656398d 8a2ed19d 2a85c8ed d3ec2aef',
  n: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff c7634d81 ' +
     'f4372ddf 581a0db2 48b0a77a ecec196a ccc52973',
  hash: hash_1.sha384,
  gRed: false,
  g: [
    'aa87ca22 be8b0537 8eb1c71e f320ad74 6e1d3b62 8ba79b98 59f741e0 82542a38 ' +
    '5502f25d bf55296c 3a545e38 72760ab7',
    '3617de4a 96262c6f 5d9e98bf 9292dc29 f8f41dbd 289a147c e9da3113 b5f0b8c0 ' +
    '0a60b1ce 1d7e819d 7a431d7c 90ea0e5f'
  ]
});

defineCurve('p521', {
  type: 'short',
  prime: null,
  p: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
     'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
     'ffffffff ffffffff ffffffff ffffffff ffffffff',
  a: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
     'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
     'ffffffff ffffffff ffffffff ffffffff fffffffc',
  b: '00000051 953eb961 8e1c9a1f 929a21a0 b68540ee a2da725b ' +
     '99b315f3 b8b48991 8ef109e1 56193951 ec7e937b 1652c0bd ' +
     '3bb1bf07 3573df88 3d2c34f1 ef451fd4 6b503f00',
  n: '000001ff ffffffff ffffffff ffffffff ffffffff ffffffff ' +
     'ffffffff ffffffff fffffffa 51868783 bf2f966b 7fcc0148 ' +
     'f709a5d0 3bb5c9b8 899c47ae bb6fb71e 91386409',
  hash: hash_1.sha512,
  gRed: false,
  g: [
    '000000c6 858e06b7 0404e9cd 9e3ecb66 2395b442 9c648139 ' +
    '053fb521 f828af60 6b4d3dba a14b5e77 efe75928 fe1dc127 ' +
    'a2ffa8de 3348b3c1 856a429b f97e7e31 c2e5bd66',
    '00000118 39296a78 9a3bc004 5c8a5fb4 2c7d1bd9 98f54449 ' +
    '579b4468 17afbd17 273e662c 97ee7299 5ef42640 c550b901 ' +
    '3fad0761 353c7086 a272c240 88be9476 9fd16650'
  ]
});

defineCurve('curve25519', {
  type: 'mont',
  prime: 'p25519',
  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
  a: '76d06',
  b: '1',
  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
  hash: hash_1.sha256,
  gRed: false,
  g: [
    '9'
  ]
});

defineCurve('ed25519', {
  type: 'edwards',
  prime: 'p25519',
  p: '7fffffffffffffff ffffffffffffffff ffffffffffffffff ffffffffffffffed',
  a: '-1',
  c: '1',
  // -121665 * (121666^(-1)) (mod P)
  d: '52036cee2b6ffe73 8cc740797779e898 00700a4d4141d8ab 75eb4dca135978a3',
  n: '1000000000000000 0000000000000000 14def9dea2f79cd6 5812631a5cf5d3ed',
  hash: hash_1.sha256,
  gRed: false,
  g: [
    '216936d3cd6e53fec0a4e231fdd6dc5c692cc7609525a7b2c9562d608f25d51a',

    // 4/5
    '6666666666666666666666666666666666666666666666666666666666666658'
  ]
});

var pre;
try {
  pre = secp256k1;
} catch (e) {
  pre = undefined;
}

defineCurve('secp256k1', {
  type: 'short',
  prime: 'k256',
  p: 'ffffffff ffffffff ffffffff ffffffff ffffffff ffffffff fffffffe fffffc2f',
  a: '0',
  b: '7',
  n: 'ffffffff ffffffff ffffffff fffffffe baaedce6 af48a03b bfd25e8c d0364141',
  h: '1',
  hash: hash_1.sha256,

  // Precomputed endomorphism
  beta: '7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee',
  lambda: '5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72',
  basis: [
    {
      a: '3086d221a7d46bcde86c90e49284eb15',
      b: '-e4437ed6010e88286f547fa90abfe4c3'
    },
    {
      a: '114ca50f7a8e2f3f657c1108d9d44cfd8',
      b: '3086d221a7d46bcde86c90e49284eb15'
    }
  ],

  gRed: false,
  g: [
    '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
    '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
    pre
  ]
});
});

function HmacDRBG(options) {
  if (!(this instanceof HmacDRBG))
    return new HmacDRBG(options);
  this.hash = options.hash;
  this.predResist = !!options.predResist;

  this.outLen = this.hash.outSize;
  this.minEntropy = options.minEntropy || this.hash.hmacStrength;

  this._reseed = null;
  this.reseedInterval = null;
  this.K = null;
  this.V = null;

  var entropy = utils_1.toArray(options.entropy, options.entropyEnc || 'hex');
  var nonce = utils_1.toArray(options.nonce, options.nonceEnc || 'hex');
  var pers = utils_1.toArray(options.pers, options.persEnc || 'hex');
  minimalisticAssert(entropy.length >= (this.minEntropy / 8),
         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');
  this._init(entropy, nonce, pers);
}
var hmacDrbg = HmacDRBG;

HmacDRBG.prototype._init = function init(entropy, nonce, pers) {
  var seed = entropy.concat(nonce).concat(pers);

  this.K = new Array(this.outLen / 8);
  this.V = new Array(this.outLen / 8);
  for (var i = 0; i < this.V.length; i++) {
    this.K[i] = 0x00;
    this.V[i] = 0x01;
  }

  this._update(seed);
  this._reseed = 1;
  this.reseedInterval = 0x1000000000000;  // 2^48
};

HmacDRBG.prototype._hmac = function hmac() {
  return new hash_1.hmac(this.hash, this.K);
};

HmacDRBG.prototype._update = function update(seed) {
  var kmac = this._hmac()
                 .update(this.V)
                 .update([ 0x00 ]);
  if (seed)
    kmac = kmac.update(seed);
  this.K = kmac.digest();
  this.V = this._hmac().update(this.V).digest();
  if (!seed)
    return;

  this.K = this._hmac()
               .update(this.V)
               .update([ 0x01 ])
               .update(seed)
               .digest();
  this.V = this._hmac().update(this.V).digest();
};

HmacDRBG.prototype.reseed = function reseed(entropy, entropyEnc, add, addEnc) {
  // Optional entropy enc
  if (typeof entropyEnc !== 'string') {
    addEnc = add;
    add = entropyEnc;
    entropyEnc = null;
  }

  entropy = utils_1.toArray(entropy, entropyEnc);
  add = utils_1.toArray(add, addEnc);

  minimalisticAssert(entropy.length >= (this.minEntropy / 8),
         'Not enough entropy. Minimum is: ' + this.minEntropy + ' bits');

  this._update(entropy.concat(add || []));
  this._reseed = 1;
};

HmacDRBG.prototype.generate = function generate(len, enc, add, addEnc) {
  if (this._reseed > this.reseedInterval)
    throw new Error('Reseed is required');

  // Optional encoding
  if (typeof enc !== 'string') {
    addEnc = add;
    add = enc;
    enc = null;
  }

  // Optional additional data
  if (add) {
    add = utils_1.toArray(add, addEnc || 'hex');
    this._update(add);
  }

  var temp = [];
  while (temp.length < len) {
    this.V = this._hmac().update(this.V).digest();
    temp = temp.concat(this.V);
  }

  var res = temp.slice(0, len);
  this._update(add);
  this._reseed++;
  return utils_1.encode(res, enc);
};

var assert$4 = utils_1$1.assert;

function KeyPair(ec, options) {
  this.ec = ec;
  this.priv = null;
  this.pub = null;

  // KeyPair(ec, { priv: ..., pub: ... })
  if (options.priv)
    this._importPrivate(options.priv, options.privEnc);
  if (options.pub)
    this._importPublic(options.pub, options.pubEnc);
}
var key = KeyPair;

KeyPair.fromPublic = function fromPublic(ec, pub, enc) {
  if (pub instanceof KeyPair)
    return pub;

  return new KeyPair(ec, {
    pub: pub,
    pubEnc: enc
  });
};

KeyPair.fromPrivate = function fromPrivate(ec, priv, enc) {
  if (priv instanceof KeyPair)
    return priv;

  return new KeyPair(ec, {
    priv: priv,
    privEnc: enc
  });
};

KeyPair.prototype.validate = function validate() {
  var pub = this.getPublic();

  if (pub.isInfinity())
    return { result: false, reason: 'Invalid public key' };
  if (!pub.validate())
    return { result: false, reason: 'Public key is not a point' };
  if (!pub.mul(this.ec.curve.n).isInfinity())
    return { result: false, reason: 'Public key * N != O' };

  return { result: true, reason: null };
};

KeyPair.prototype.getPublic = function getPublic(compact, enc) {
  // compact is optional argument
  if (typeof compact === 'string') {
    enc = compact;
    compact = null;
  }

  if (!this.pub)
    this.pub = this.ec.g.mul(this.priv);

  if (!enc)
    return this.pub;

  return this.pub.encode(enc, compact);
};

KeyPair.prototype.getPrivate = function getPrivate(enc) {
  if (enc === 'hex')
    return this.priv.toString(16, 2);
  else
    return this.priv;
};

KeyPair.prototype._importPrivate = function _importPrivate(key, enc) {
  this.priv = new bn(key, enc || 16);

  // Ensure that the priv won't be bigger than n, otherwise we may fail
  // in fixed multiplication method
  this.priv = this.priv.umod(this.ec.curve.n);
};

KeyPair.prototype._importPublic = function _importPublic(key, enc) {
  if (key.x || key.y) {
    // Montgomery points only have an `x` coordinate.
    // Weierstrass/Edwards points on the other hand have both `x` and
    // `y` coordinates.
    if (this.ec.curve.type === 'mont') {
      assert$4(key.x, 'Need x coordinate');
    } else if (this.ec.curve.type === 'short' ||
               this.ec.curve.type === 'edwards') {
      assert$4(key.x && key.y, 'Need both x and y coordinate');
    }
    this.pub = this.ec.curve.point(key.x, key.y);
    return;
  }
  this.pub = this.ec.curve.decodePoint(key, enc);
};

// ECDH
KeyPair.prototype.derive = function derive(pub) {
  return pub.mul(this.priv).getX();
};

// ECDSA
KeyPair.prototype.sign = function sign(msg, enc, options) {
  return this.ec.sign(msg, this, enc, options);
};

KeyPair.prototype.verify = function verify(msg, signature) {
  return this.ec.verify(msg, signature, this);
};

KeyPair.prototype.inspect = function inspect() {
  return '<Key priv: ' + (this.priv && this.priv.toString(16, 2)) +
         ' pub: ' + (this.pub && this.pub.inspect()) + ' >';
};

var assert$5 = utils_1$1.assert;

function Signature(options, enc) {
  if (options instanceof Signature)
    return options;

  if (this._importDER(options, enc))
    return;

  assert$5(options.r && options.s, 'Signature without r or s');
  this.r = new bn(options.r, 16);
  this.s = new bn(options.s, 16);
  if (options.recoveryParam === undefined)
    this.recoveryParam = null;
  else
    this.recoveryParam = options.recoveryParam;
}
var signature = Signature;

function Position() {
  this.place = 0;
}

function getLength(buf, p) {
  var initial = buf[p.place++];
  if (!(initial & 0x80)) {
    return initial;
  }
  var octetLen = initial & 0xf;

  // Indefinite length or overflow
  if (octetLen === 0 || octetLen > 4) {
    return false;
  }

  var val = 0;
  for (var i = 0, off = p.place; i < octetLen; i++, off++) {
    val <<= 8;
    val |= buf[off];
    val >>>= 0;
  }

  // Leading zeroes
  if (val <= 0x7f) {
    return false;
  }

  p.place = off;
  return val;
}

function rmPadding(buf) {
  var i = 0;
  var len = buf.length - 1;
  while (!buf[i] && !(buf[i + 1] & 0x80) && i < len) {
    i++;
  }
  if (i === 0) {
    return buf;
  }
  return buf.slice(i);
}

Signature.prototype._importDER = function _importDER(data, enc) {
  data = utils_1$1.toArray(data, enc);
  var p = new Position();
  if (data[p.place++] !== 0x30) {
    return false;
  }
  var len = getLength(data, p);
  if (len === false) {
    return false;
  }
  if ((len + p.place) !== data.length) {
    return false;
  }
  if (data[p.place++] !== 0x02) {
    return false;
  }
  var rlen = getLength(data, p);
  if (rlen === false) {
    return false;
  }
  var r = data.slice(p.place, rlen + p.place);
  p.place += rlen;
  if (data[p.place++] !== 0x02) {
    return false;
  }
  var slen = getLength(data, p);
  if (slen === false) {
    return false;
  }
  if (data.length !== slen + p.place) {
    return false;
  }
  var s = data.slice(p.place, slen + p.place);
  if (r[0] === 0) {
    if (r[1] & 0x80) {
      r = r.slice(1);
    } else {
      // Leading zeroes
      return false;
    }
  }
  if (s[0] === 0) {
    if (s[1] & 0x80) {
      s = s.slice(1);
    } else {
      // Leading zeroes
      return false;
    }
  }

  this.r = new bn(r);
  this.s = new bn(s);
  this.recoveryParam = null;

  return true;
};

function constructLength(arr, len) {
  if (len < 0x80) {
    arr.push(len);
    return;
  }
  var octets = 1 + (Math.log(len) / Math.LN2 >>> 3);
  arr.push(octets | 0x80);
  while (--octets) {
    arr.push((len >>> (octets << 3)) & 0xff);
  }
  arr.push(len);
}

Signature.prototype.toDER = function toDER(enc) {
  var r = this.r.toArray();
  var s = this.s.toArray();

  // Pad values
  if (r[0] & 0x80)
    r = [ 0 ].concat(r);
  // Pad values
  if (s[0] & 0x80)
    s = [ 0 ].concat(s);

  r = rmPadding(r);
  s = rmPadding(s);

  while (!s[0] && !(s[1] & 0x80)) {
    s = s.slice(1);
  }
  var arr = [ 0x02 ];
  constructLength(arr, r.length);
  arr = arr.concat(r);
  arr.push(0x02);
  constructLength(arr, s.length);
  var backHalf = arr.concat(s);
  var res = [ 0x30 ];
  constructLength(res, backHalf.length);
  res = res.concat(backHalf);
  return utils_1$1.encode(res, enc);
};

var assert$6 = utils_1$1.assert;




function EC(options) {
  if (!(this instanceof EC))
    return new EC(options);

  // Shortcut `elliptic.ec(curve-name)`
  if (typeof options === 'string') {
    assert$6(curves_1.hasOwnProperty(options), 'Unknown curve ' + options);

    options = curves_1[options];
  }

  // Shortcut for `elliptic.ec(elliptic.curves.curveName)`
  if (options instanceof curves_1.PresetCurve)
    options = { curve: options };

  this.curve = options.curve.curve;
  this.n = this.curve.n;
  this.nh = this.n.ushrn(1);
  this.g = this.curve.g;

  // Point on curve
  this.g = options.curve.g;
  this.g.precompute(options.curve.n.bitLength() + 1);

  // Hash for function for DRBG
  this.hash = options.hash || options.curve.hash;
}
var ec = EC;

EC.prototype.keyPair = function keyPair(options) {
  return new key(this, options);
};

EC.prototype.keyFromPrivate = function keyFromPrivate(priv, enc) {
  return key.fromPrivate(this, priv, enc);
};

EC.prototype.keyFromPublic = function keyFromPublic(pub, enc) {
  return key.fromPublic(this, pub, enc);
};

EC.prototype.genKeyPair = function genKeyPair(options) {
  if (!options)
    options = {};

  // Instantiate Hmac_DRBG
  var drbg = new hmacDrbg({
    hash: this.hash,
    pers: options.pers,
    persEnc: options.persEnc || 'utf8',
    entropy: options.entropy || brorand(this.hash.hmacStrength),
    entropyEnc: options.entropy && options.entropyEnc || 'utf8',
    nonce: this.n.toArray()
  });

  var bytes = this.n.byteLength();
  var ns2 = this.n.sub(new bn(2));
  do {
    var priv = new bn(drbg.generate(bytes));
    if (priv.cmp(ns2) > 0)
      continue;

    priv.iaddn(1);
    return this.keyFromPrivate(priv);
  } while (true);
};

EC.prototype._truncateToN = function truncateToN(msg, truncOnly) {
  var delta = msg.byteLength() * 8 - this.n.bitLength();
  if (delta > 0)
    msg = msg.ushrn(delta);
  if (!truncOnly && msg.cmp(this.n) >= 0)
    return msg.sub(this.n);
  else
    return msg;
};

EC.prototype.sign = function sign(msg, key, enc, options) {
  if (typeof enc === 'object') {
    options = enc;
    enc = null;
  }
  if (!options)
    options = {};

  key = this.keyFromPrivate(key, enc);
  msg = this._truncateToN(new bn(msg, 16));

  // Zero-extend key to provide enough entropy
  var bytes = this.n.byteLength();
  var bkey = key.getPrivate().toArray('be', bytes);

  // Zero-extend nonce to have the same byte size as N
  var nonce = msg.toArray('be', bytes);

  // Instantiate Hmac_DRBG
  var drbg = new hmacDrbg({
    hash: this.hash,
    entropy: bkey,
    nonce: nonce,
    pers: options.pers,
    persEnc: options.persEnc || 'utf8'
  });

  // Number of bytes to generate
  var ns1 = this.n.sub(new bn(1));

  for (var iter = 0; true; iter++) {
    var k = options.k ?
        options.k(iter) :
        new bn(drbg.generate(this.n.byteLength()));
    k = this._truncateToN(k, true);
    if (k.cmpn(1) <= 0 || k.cmp(ns1) >= 0)
      continue;

    var kp = this.g.mul(k);
    if (kp.isInfinity())
      continue;

    var kpX = kp.getX();
    var r = kpX.umod(this.n);
    if (r.cmpn(0) === 0)
      continue;

    var s = k.invm(this.n).mul(r.mul(key.getPrivate()).iadd(msg));
    s = s.umod(this.n);
    if (s.cmpn(0) === 0)
      continue;

    var recoveryParam = (kp.getY().isOdd() ? 1 : 0) |
                        (kpX.cmp(r) !== 0 ? 2 : 0);

    // Use complement of `s`, if it is > `n / 2`
    if (options.canonical && s.cmp(this.nh) > 0) {
      s = this.n.sub(s);
      recoveryParam ^= 1;
    }

    return new signature({ r: r, s: s, recoveryParam: recoveryParam });
  }
};

EC.prototype.verify = function verify(msg, signature$1, key, enc) {
  msg = this._truncateToN(new bn(msg, 16));
  key = this.keyFromPublic(key, enc);
  signature$1 = new signature(signature$1, 'hex');

  // Perform primitive values validation
  var r = signature$1.r;
  var s = signature$1.s;
  if (r.cmpn(1) < 0 || r.cmp(this.n) >= 0)
    return false;
  if (s.cmpn(1) < 0 || s.cmp(this.n) >= 0)
    return false;

  // Validate signature
  var sinv = s.invm(this.n);
  var u1 = sinv.mul(msg).umod(this.n);
  var u2 = sinv.mul(r).umod(this.n);

  if (!this.curve._maxwellTrick) {
    var p = this.g.mulAdd(u1, key.getPublic(), u2);
    if (p.isInfinity())
      return false;

    return p.getX().umod(this.n).cmp(r) === 0;
  }

  // NOTE: Greg Maxwell's trick, inspired by:
  // https://git.io/vad3K

  var p = this.g.jmulAdd(u1, key.getPublic(), u2);
  if (p.isInfinity())
    return false;

  // Compare `p.x` of Jacobian point with `r`,
  // this will do `p.x == r * p.z^2` instead of multiplying `p.x` by the
  // inverse of `p.z^2`
  return p.eqXToP(r);
};

EC.prototype.recoverPubKey = function(msg, signature$1, j, enc) {
  assert$6((3 & j) === j, 'The recovery param is more than two bits');
  signature$1 = new signature(signature$1, enc);

  var n = this.n;
  var e = new bn(msg);
  var r = signature$1.r;
  var s = signature$1.s;

  // A set LSB signifies that the y-coordinate is odd
  var isYOdd = j & 1;
  var isSecondKey = j >> 1;
  if (r.cmp(this.curve.p.umod(this.curve.n)) >= 0 && isSecondKey)
    throw new Error('Unable to find sencond key candinate');

  // 1.1. Let x = r + jn.
  if (isSecondKey)
    r = this.curve.pointFromX(r.add(this.curve.n), isYOdd);
  else
    r = this.curve.pointFromX(r, isYOdd);

  var rInv = signature$1.r.invm(n);
  var s1 = n.sub(e).mul(rInv).umod(n);
  var s2 = s.mul(rInv).umod(n);

  // 1.6.1 Compute Q = r^-1 (sR -  eG)
  //               Q = r^-1 (sR + -eG)
  return this.g.mulAdd(s1, r, s2);
};

EC.prototype.getKeyRecoveryParam = function(e, signature$1, Q, enc) {
  signature$1 = new signature(signature$1, enc);
  if (signature$1.recoveryParam !== null)
    return signature$1.recoveryParam;

  for (var i = 0; i < 4; i++) {
    var Qprime;
    try {
      Qprime = this.recoverPubKey(e, signature$1, i);
    } catch (e) {
      continue;
    }

    if (Qprime.eq(Q))
      return i;
  }
  throw new Error('Unable to find valid recovery factor');
};

var assert$7 = utils_1$1.assert;
var parseBytes = utils_1$1.parseBytes;
var cachedProperty = utils_1$1.cachedProperty;

/**
* @param {EDDSA} eddsa - instance
* @param {Object} params - public/private key parameters
*
* @param {Array<Byte>} [params.secret] - secret seed bytes
* @param {Point} [params.pub] - public key point (aka `A` in eddsa terms)
* @param {Array<Byte>} [params.pub] - public key point encoded as bytes
*
*/
function KeyPair$1(eddsa, params) {
  this.eddsa = eddsa;
  this._secret = parseBytes(params.secret);
  if (eddsa.isPoint(params.pub))
    this._pub = params.pub;
  else
    this._pubBytes = parseBytes(params.pub);
}

KeyPair$1.fromPublic = function fromPublic(eddsa, pub) {
  if (pub instanceof KeyPair$1)
    return pub;
  return new KeyPair$1(eddsa, { pub: pub });
};

KeyPair$1.fromSecret = function fromSecret(eddsa, secret) {
  if (secret instanceof KeyPair$1)
    return secret;
  return new KeyPair$1(eddsa, { secret: secret });
};

KeyPair$1.prototype.secret = function secret() {
  return this._secret;
};

cachedProperty(KeyPair$1, 'pubBytes', function pubBytes() {
  return this.eddsa.encodePoint(this.pub());
});

cachedProperty(KeyPair$1, 'pub', function pub() {
  if (this._pubBytes)
    return this.eddsa.decodePoint(this._pubBytes);
  return this.eddsa.g.mul(this.priv());
});

cachedProperty(KeyPair$1, 'privBytes', function privBytes() {
  var eddsa = this.eddsa;
  var hash = this.hash();
  var lastIx = eddsa.encodingLength - 1;

  var a = hash.slice(0, eddsa.encodingLength);
  a[0] &= 248;
  a[lastIx] &= 127;
  a[lastIx] |= 64;

  return a;
});

cachedProperty(KeyPair$1, 'priv', function priv() {
  return this.eddsa.decodeInt(this.privBytes());
});

cachedProperty(KeyPair$1, 'hash', function hash() {
  return this.eddsa.hash().update(this.secret()).digest();
});

cachedProperty(KeyPair$1, 'messagePrefix', function messagePrefix() {
  return this.hash().slice(this.eddsa.encodingLength);
});

KeyPair$1.prototype.sign = function sign(message) {
  assert$7(this._secret, 'KeyPair can only verify');
  return this.eddsa.sign(message, this);
};

KeyPair$1.prototype.verify = function verify(message, sig) {
  return this.eddsa.verify(message, sig, this);
};

KeyPair$1.prototype.getSecret = function getSecret(enc) {
  assert$7(this._secret, 'KeyPair is public only');
  return utils_1$1.encode(this.secret(), enc);
};

KeyPair$1.prototype.getPublic = function getPublic(enc) {
  return utils_1$1.encode(this.pubBytes(), enc);
};

var key$1 = KeyPair$1;

var assert$8 = utils_1$1.assert;
var cachedProperty$1 = utils_1$1.cachedProperty;
var parseBytes$1 = utils_1$1.parseBytes;

/**
* @param {EDDSA} eddsa - eddsa instance
* @param {Array<Bytes>|Object} sig -
* @param {Array<Bytes>|Point} [sig.R] - R point as Point or bytes
* @param {Array<Bytes>|bn} [sig.S] - S scalar as bn or bytes
* @param {Array<Bytes>} [sig.Rencoded] - R point encoded
* @param {Array<Bytes>} [sig.Sencoded] - S scalar encoded
*/
function Signature$1(eddsa, sig) {
  this.eddsa = eddsa;

  if (typeof sig !== 'object')
    sig = parseBytes$1(sig);

  if (Array.isArray(sig)) {
    sig = {
      R: sig.slice(0, eddsa.encodingLength),
      S: sig.slice(eddsa.encodingLength)
    };
  }

  assert$8(sig.R && sig.S, 'Signature without R or S');

  if (eddsa.isPoint(sig.R))
    this._R = sig.R;
  if (sig.S instanceof bn)
    this._S = sig.S;

  this._Rencoded = Array.isArray(sig.R) ? sig.R : sig.Rencoded;
  this._Sencoded = Array.isArray(sig.S) ? sig.S : sig.Sencoded;
}

cachedProperty$1(Signature$1, 'S', function S() {
  return this.eddsa.decodeInt(this.Sencoded());
});

cachedProperty$1(Signature$1, 'R', function R() {
  return this.eddsa.decodePoint(this.Rencoded());
});

cachedProperty$1(Signature$1, 'Rencoded', function Rencoded() {
  return this.eddsa.encodePoint(this.R());
});

cachedProperty$1(Signature$1, 'Sencoded', function Sencoded() {
  return this.eddsa.encodeInt(this.S());
});

Signature$1.prototype.toBytes = function toBytes() {
  return this.Rencoded().concat(this.Sencoded());
};

Signature$1.prototype.toHex = function toHex() {
  return utils_1$1.encode(this.toBytes(), 'hex').toUpperCase();
};

var signature$1 = Signature$1;

var assert$9 = utils_1$1.assert;
var parseBytes$2 = utils_1$1.parseBytes;



function EDDSA(curve) {
  assert$9(curve === 'ed25519', 'only tested with ed25519 so far');

  if (!(this instanceof EDDSA))
    return new EDDSA(curve);

  var curve = curves_1[curve].curve;
  this.curve = curve;
  this.g = curve.g;
  this.g.precompute(curve.n.bitLength() + 1);

  this.pointClass = curve.point().constructor;
  this.encodingLength = Math.ceil(curve.n.bitLength() / 8);
  this.hash = hash_1.sha512;
}

var eddsa = EDDSA;

/**
* @param {Array|String} message - message bytes
* @param {Array|String|KeyPair} secret - secret bytes or a keypair
* @returns {Signature} - signature
*/
EDDSA.prototype.sign = function sign(message, secret) {
  message = parseBytes$2(message);
  var key = this.keyFromSecret(secret);
  var r = this.hashInt(key.messagePrefix(), message);
  var R = this.g.mul(r);
  var Rencoded = this.encodePoint(R);
  var s_ = this.hashInt(Rencoded, key.pubBytes(), message)
               .mul(key.priv());
  var S = r.add(s_).umod(this.curve.n);
  return this.makeSignature({ R: R, S: S, Rencoded: Rencoded });
};

/**
* @param {Array} message - message bytes
* @param {Array|String|Signature} sig - sig bytes
* @param {Array|String|Point|KeyPair} pub - public key
* @returns {Boolean} - true if public key matches sig of message
*/
EDDSA.prototype.verify = function verify(message, sig, pub) {
  message = parseBytes$2(message);
  sig = this.makeSignature(sig);
  var key = this.keyFromPublic(pub);
  var h = this.hashInt(sig.Rencoded(), key.pubBytes(), message);
  var SG = this.g.mul(sig.S());
  var RplusAh = sig.R().add(key.pub().mul(h));
  return RplusAh.eq(SG);
};

EDDSA.prototype.hashInt = function hashInt() {
  var hash = this.hash();
  for (var i = 0; i < arguments.length; i++)
    hash.update(arguments[i]);
  return utils_1$1.intFromLE(hash.digest()).umod(this.curve.n);
};

EDDSA.prototype.keyFromPublic = function keyFromPublic(pub) {
  return key$1.fromPublic(this, pub);
};

EDDSA.prototype.keyFromSecret = function keyFromSecret(secret) {
  return key$1.fromSecret(this, secret);
};

EDDSA.prototype.makeSignature = function makeSignature(sig) {
  if (sig instanceof signature$1)
    return sig;
  return new signature$1(this, sig);
};

/**
* * https://tools.ietf.org/html/draft-josefsson-eddsa-ed25519-03#section-5.2
*
* EDDSA defines methods for encoding and decoding points and integers. These are
* helper convenience methods, that pass along to utility functions implied
* parameters.
*
*/
EDDSA.prototype.encodePoint = function encodePoint(point) {
  var enc = point.getY().toArray('le', this.encodingLength);
  enc[this.encodingLength - 1] |= point.getX().isOdd() ? 0x80 : 0;
  return enc;
};

EDDSA.prototype.decodePoint = function decodePoint(bytes) {
  bytes = utils_1$1.parseBytes(bytes);

  var lastIx = bytes.length - 1;
  var normed = bytes.slice(0, lastIx).concat(bytes[lastIx] & ~0x80);
  var xIsOdd = (bytes[lastIx] & 0x80) !== 0;

  var y = utils_1$1.intFromLE(normed);
  return this.curve.pointFromY(y, xIsOdd);
};

EDDSA.prototype.encodeInt = function encodeInt(num) {
  return num.toArray('le', this.encodingLength);
};

EDDSA.prototype.decodeInt = function decodeInt(bytes) {
  return utils_1$1.intFromLE(bytes);
};

EDDSA.prototype.isPoint = function isPoint(val) {
  return val instanceof this.pointClass;
};

var require$$0$2 = getCjsExportFromNamespace(_package$1);

var elliptic_1 = createCommonjsModule(function (module, exports) {

var elliptic = exports;

elliptic.version = require$$0$2.version;
elliptic.utils = utils_1$1;
elliptic.rand = brorand;
elliptic.curve = curve_1;
elliptic.curves = curves_1;

// Protocols
elliptic.ec = ec;
elliptic.eddsa = eddsa;
});
var elliptic_2 = elliptic_1.ec;

const version$d = "signing-key/5.0.4";

const logger$c = new Logger(version$d);
let _curve = null;
function getCurve() {
    if (!_curve) {
        _curve = new elliptic_2("secp256k1");
    }
    return _curve;
}
class SigningKey {
    constructor(privateKey) {
        defineReadOnly(this, "curve", "secp256k1");
        defineReadOnly(this, "privateKey", hexlify(privateKey));
        const keyPair = getCurve().keyFromPrivate(arrayify(this.privateKey));
        defineReadOnly(this, "publicKey", "0x" + keyPair.getPublic(false, "hex"));
        defineReadOnly(this, "compressedPublicKey", "0x" + keyPair.getPublic(true, "hex"));
        defineReadOnly(this, "_isSigningKey", true);
    }
    _addPoint(other) {
        const p0 = getCurve().keyFromPublic(arrayify(this.publicKey));
        const p1 = getCurve().keyFromPublic(arrayify(other));
        return "0x" + p0.pub.add(p1.pub).encodeCompressed("hex");
    }
    signDigest(digest) {
        const keyPair = getCurve().keyFromPrivate(arrayify(this.privateKey));
        const signature = keyPair.sign(arrayify(digest), { canonical: true });
        return splitSignature({
            recoveryParam: signature.recoveryParam,
            r: hexZeroPad("0x" + signature.r.toString(16), 32),
            s: hexZeroPad("0x" + signature.s.toString(16), 32),
        });
    }
    computeSharedSecret(otherKey) {
        const keyPair = getCurve().keyFromPrivate(arrayify(this.privateKey));
        const otherKeyPair = getCurve().keyFromPublic(arrayify(computePublicKey(otherKey)));
        return hexZeroPad("0x" + keyPair.derive(otherKeyPair.getPublic()).toString(16), 32);
    }
    static isSigningKey(value) {
        return !!(value && value._isSigningKey);
    }
}
function recoverPublicKey(digest, signature) {
    const sig = splitSignature(signature);
    const rs = { r: arrayify(sig.r), s: arrayify(sig.s) };
    return "0x" + getCurve().recoverPubKey(arrayify(digest), rs, sig.recoveryParam).encode("hex", false);
}
function computePublicKey(key, compressed) {
    const bytes = arrayify(key);
    if (bytes.length === 32) {
        const signingKey = new SigningKey(bytes);
        if (compressed) {
            return "0x" + getCurve().keyFromPrivate(bytes).getPublic(true, "hex");
        }
        return signingKey.publicKey;
    }
    else if (bytes.length === 33) {
        if (compressed) {
            return hexlify(bytes);
        }
        return "0x" + getCurve().keyFromPublic(bytes).getPublic(false, "hex");
    }
    else if (bytes.length === 65) {
        if (!compressed) {
            return hexlify(bytes);
        }
        return "0x" + getCurve().keyFromPublic(bytes).getPublic(true, "hex");
    }
    return logger$c.throwArgumentError("invalid public or private key", "key", "[REDACTED]");
}

const version$e = "transactions/5.0.3";

const logger$d = new Logger(version$e);
///////////////////////////////
function handleAddress(value) {
    if (value === "0x") {
        return null;
    }
    return getAddress(value);
}
function handleNumber(value) {
    if (value === "0x") {
        return Zero$1;
    }
    return BigNumber.from(value);
}
function computeAddress(key) {
    const publicKey = computePublicKey(key);
    return getAddress(hexDataSlice(keccak256(hexDataSlice(publicKey, 1)), 12));
}
function recoverAddress(digest, signature) {
    return computeAddress(recoverPublicKey(arrayify(digest), signature));
}
function parse(rawTransaction) {
    const transaction = decode(rawTransaction);
    if (transaction.length !== 9 && transaction.length !== 6) {
        logger$d.throwArgumentError("invalid raw transaction", "rawTransaction", rawTransaction);
    }
    const tx = {
        nonce: handleNumber(transaction[0]).toNumber(),
        gasPrice: handleNumber(transaction[1]),
        gasLimit: handleNumber(transaction[2]),
        to: handleAddress(transaction[3]),
        value: handleNumber(transaction[4]),
        data: transaction[5],
        chainId: 0
    };
    // Legacy unsigned transaction
    if (transaction.length === 6) {
        return tx;
    }
    try {
        tx.v = BigNumber.from(transaction[6]).toNumber();
    }
    catch (error) {
        console.log(error);
        return tx;
    }
    tx.r = hexZeroPad(transaction[7], 32);
    tx.s = hexZeroPad(transaction[8], 32);
    if (BigNumber.from(tx.r).isZero() && BigNumber.from(tx.s).isZero()) {
        // EIP-155 unsigned transaction
        tx.chainId = tx.v;
        tx.v = 0;
    }
    else {
        // Signed Tranasaction
        tx.chainId = Math.floor((tx.v - 35) / 2);
        if (tx.chainId < 0) {
            tx.chainId = 0;
        }
        let recoveryParam = tx.v - 27;
        const raw = transaction.slice(0, 6);
        if (tx.chainId !== 0) {
            raw.push(hexlify(tx.chainId));
            raw.push("0x");
            raw.push("0x");
            recoveryParam -= tx.chainId * 2 + 8;
        }
        const digest = keccak256(encode(raw));
        try {
            tx.from = recoverAddress(digest, { r: hexlify(tx.r), s: hexlify(tx.s), recoveryParam: recoveryParam });
        }
        catch (error) {
            console.log(error);
        }
        tx.hash = keccak256(rawTransaction);
    }
    return tx;
}

const logger$e = new Logger(version$9);
class Formatter {
    constructor() {
        logger$e.checkNew(new.target, Formatter);
        this.formats = this.getDefaultFormats();
    }
    getDefaultFormats() {
        const formats = ({});
        const address = this.address.bind(this);
        const bigNumber = this.bigNumber.bind(this);
        const blockTag = this.blockTag.bind(this);
        const data = this.data.bind(this);
        const hash = this.hash.bind(this);
        const hex = this.hex.bind(this);
        const number = this.number.bind(this);
        const strictData = (v) => { return this.data(v, true); };
        formats.transaction = {
            hash: hash,
            blockHash: Formatter.allowNull(hash, null),
            blockNumber: Formatter.allowNull(number, null),
            transactionIndex: Formatter.allowNull(number, null),
            confirmations: Formatter.allowNull(number, null),
            from: address,
            gasPrice: bigNumber,
            gasLimit: bigNumber,
            to: Formatter.allowNull(address, null),
            value: bigNumber,
            nonce: number,
            data: data,
            r: Formatter.allowNull(this.uint256),
            s: Formatter.allowNull(this.uint256),
            v: Formatter.allowNull(number),
            creates: Formatter.allowNull(address, null),
            raw: Formatter.allowNull(data),
        };
        formats.transactionRequest = {
            from: Formatter.allowNull(address),
            nonce: Formatter.allowNull(number),
            gasLimit: Formatter.allowNull(bigNumber),
            gasPrice: Formatter.allowNull(bigNumber),
            to: Formatter.allowNull(address),
            value: Formatter.allowNull(bigNumber),
            data: Formatter.allowNull(strictData),
        };
        formats.receiptLog = {
            transactionIndex: number,
            blockNumber: number,
            transactionHash: hash,
            address: address,
            topics: Formatter.arrayOf(hash),
            data: data,
            logIndex: number,
            blockHash: hash,
        };
        formats.receipt = {
            to: Formatter.allowNull(this.address, null),
            from: Formatter.allowNull(this.address, null),
            contractAddress: Formatter.allowNull(address, null),
            transactionIndex: number,
            root: Formatter.allowNull(hash),
            gasUsed: bigNumber,
            logsBloom: Formatter.allowNull(data),
            blockHash: hash,
            transactionHash: hash,
            logs: Formatter.arrayOf(this.receiptLog.bind(this)),
            blockNumber: number,
            confirmations: Formatter.allowNull(number, null),
            cumulativeGasUsed: bigNumber,
            status: Formatter.allowNull(number)
        };
        formats.block = {
            hash: hash,
            parentHash: hash,
            number: number,
            timestamp: number,
            nonce: Formatter.allowNull(hex),
            difficulty: this.difficulty.bind(this),
            gasLimit: bigNumber,
            gasUsed: bigNumber,
            miner: address,
            extraData: data,
            transactions: Formatter.allowNull(Formatter.arrayOf(hash)),
        };
        formats.blockWithTransactions = shallowCopy(formats.block);
        formats.blockWithTransactions.transactions = Formatter.allowNull(Formatter.arrayOf(this.transactionResponse.bind(this)));
        formats.filter = {
            fromBlock: Formatter.allowNull(blockTag, undefined),
            toBlock: Formatter.allowNull(blockTag, undefined),
            blockHash: Formatter.allowNull(hash, undefined),
            address: Formatter.allowNull(address, undefined),
            topics: Formatter.allowNull(this.topics.bind(this), undefined),
        };
        formats.filterLog = {
            blockNumber: Formatter.allowNull(number),
            blockHash: Formatter.allowNull(hash),
            transactionIndex: number,
            removed: Formatter.allowNull(this.boolean.bind(this)),
            address: address,
            data: Formatter.allowFalsish(data, "0x"),
            topics: Formatter.arrayOf(hash),
            transactionHash: hash,
            logIndex: number,
        };
        return formats;
    }
    // Requires a BigNumberish that is within the IEEE754 safe integer range; returns a number
    // Strict! Used on input.
    number(number) {
        return BigNumber.from(number).toNumber();
    }
    // Strict! Used on input.
    bigNumber(value) {
        return BigNumber.from(value);
    }
    // Requires a boolean, "true" or  "false"; returns a boolean
    boolean(value) {
        if (typeof (value) === "boolean") {
            return value;
        }
        if (typeof (value) === "string") {
            value = value.toLowerCase();
            if (value === "true") {
                return true;
            }
            if (value === "false") {
                return false;
            }
        }
        throw new Error("invalid boolean - " + value);
    }
    hex(value, strict) {
        if (typeof (value) === "string") {
            if (!strict && value.substring(0, 2) !== "0x") {
                value = "0x" + value;
            }
            if (isHexString(value)) {
                return value.toLowerCase();
            }
        }
        return logger$e.throwArgumentError("invalid hash", "value", value);
    }
    data(value, strict) {
        const result = this.hex(value, strict);
        if ((result.length % 2) !== 0) {
            throw new Error("invalid data; odd-length - " + value);
        }
        return result;
    }
    // Requires an address
    // Strict! Used on input.
    address(value) {
        return getAddress(value);
    }
    callAddress(value) {
        if (!isHexString(value, 32)) {
            return null;
        }
        const address = getAddress(hexDataSlice(value, 12));
        return (address === AddressZero) ? null : address;
    }
    contractAddress(value) {
        return getContractAddress(value);
    }
    // Strict! Used on input.
    blockTag(blockTag) {
        if (blockTag == null) {
            return "latest";
        }
        if (blockTag === "earliest") {
            return "0x0";
        }
        if (blockTag === "latest" || blockTag === "pending") {
            return blockTag;
        }
        if (typeof (blockTag) === "number" || isHexString(blockTag)) {
            return hexValue(blockTag);
        }
        throw new Error("invalid blockTag");
    }
    // Requires a hash, optionally requires 0x prefix; returns prefixed lowercase hash.
    hash(value, strict) {
        const result = this.hex(value, strict);
        if (hexDataLength(result) !== 32) {
            return logger$e.throwArgumentError("invalid hash", "value", value);
        }
        return result;
    }
    // Returns the difficulty as a number, or if too large (i.e. PoA network) null
    difficulty(value) {
        if (value == null) {
            return null;
        }
        const v = BigNumber.from(value);
        try {
            return v.toNumber();
        }
        catch (error) { }
        return null;
    }
    uint256(value) {
        if (!isHexString(value)) {
            throw new Error("invalid uint256");
        }
        return hexZeroPad(value, 32);
    }
    _block(value, format) {
        if (value.author != null && value.miner == null) {
            value.miner = value.author;
        }
        return Formatter.check(format, value);
    }
    block(value) {
        return this._block(value, this.formats.block);
    }
    blockWithTransactions(value) {
        return this._block(value, this.formats.blockWithTransactions);
    }
    // Strict! Used on input.
    transactionRequest(value) {
        return Formatter.check(this.formats.transactionRequest, value);
    }
    transactionResponse(transaction) {
        // Rename gas to gasLimit
        if (transaction.gas != null && transaction.gasLimit == null) {
            transaction.gasLimit = transaction.gas;
        }
        // Some clients (TestRPC) do strange things like return 0x0 for the
        // 0 address; correct this to be a real address
        if (transaction.to && BigNumber.from(transaction.to).isZero()) {
            transaction.to = "0x0000000000000000000000000000000000000000";
        }
        // Rename input to data
        if (transaction.input != null && transaction.data == null) {
            transaction.data = transaction.input;
        }
        // If to and creates are empty, populate the creates from the transaction
        if (transaction.to == null && transaction.creates == null) {
            transaction.creates = this.contractAddress(transaction);
        }
        // @TODO: use transaction.serialize? Have to add support for including v, r, and s...
        /*
        if (!transaction.raw) {
 
             // Very loose providers (e.g. TestRPC) do not provide a signature or raw
             if (transaction.v && transaction.r && transaction.s) {
                 let raw = [
                     stripZeros(hexlify(transaction.nonce)),
                     stripZeros(hexlify(transaction.gasPrice)),
                     stripZeros(hexlify(transaction.gasLimit)),
                     (transaction.to || "0x"),
                     stripZeros(hexlify(transaction.value || "0x")),
                     hexlify(transaction.data || "0x"),
                     stripZeros(hexlify(transaction.v || "0x")),
                     stripZeros(hexlify(transaction.r)),
                     stripZeros(hexlify(transaction.s)),
                 ];
 
                 transaction.raw = rlpEncode(raw);
             }
         }
         */
        const result = Formatter.check(this.formats.transaction, transaction);
        if (transaction.chainId != null) {
            let chainId = transaction.chainId;
            if (isHexString(chainId)) {
                chainId = BigNumber.from(chainId).toNumber();
            }
            result.chainId = chainId;
        }
        else {
            let chainId = transaction.networkId;
            // geth-etc returns chainId
            if (chainId == null && result.v == null) {
                chainId = transaction.chainId;
            }
            if (isHexString(chainId)) {
                chainId = BigNumber.from(chainId).toNumber();
            }
            if (typeof (chainId) !== "number" && result.v != null) {
                chainId = (result.v - 35) / 2;
                if (chainId < 0) {
                    chainId = 0;
                }
                chainId = parseInt(chainId);
            }
            if (typeof (chainId) !== "number") {
                chainId = 0;
            }
            result.chainId = chainId;
        }
        // 0x0000... should actually be null
        if (result.blockHash && result.blockHash.replace(/0/g, "") === "x") {
            result.blockHash = null;
        }
        return result;
    }
    transaction(value) {
        return parse(value);
    }
    receiptLog(value) {
        return Formatter.check(this.formats.receiptLog, value);
    }
    receipt(value) {
        const result = Formatter.check(this.formats.receipt, value);
        if (value.status != null) {
            result.byzantium = true;
        }
        return result;
    }
    topics(value) {
        if (Array.isArray(value)) {
            return value.map((v) => this.topics(v));
        }
        else if (value != null) {
            return this.hash(value, true);
        }
        return null;
    }
    filter(value) {
        return Formatter.check(this.formats.filter, value);
    }
    filterLog(value) {
        return Formatter.check(this.formats.filterLog, value);
    }
    static check(format, object) {
        const result = {};
        for (const key in format) {
            try {
                const value = format[key](object[key]);
                if (value !== undefined) {
                    result[key] = value;
                }
            }
            catch (error) {
                error.checkKey = key;
                error.checkValue = object[key];
                throw error;
            }
        }
        return result;
    }
    // if value is null-ish, nullValue is returned
    static allowNull(format, nullValue) {
        return (function (value) {
            if (value == null) {
                return nullValue;
            }
            return format(value);
        });
    }
    // If value is false-ish, replaceValue is returned
    static allowFalsish(format, replaceValue) {
        return (function (value) {
            if (!value) {
                return replaceValue;
            }
            return format(value);
        });
    }
    // Requires an Array satisfying check
    static arrayOf(format) {
        return (function (array) {
            if (!Array.isArray(array)) {
                throw new Error("not an array");
            }
            const result = [];
            array.forEach(function (value) {
                result.push(format(value));
            });
            return result;
        });
    }
}
// Show the throttle message only once
let throttleMessage = false;
function showThrottleMessage() {
    if (throttleMessage) {
        return;
    }
    throttleMessage = true;
    console.log("========= NOTICE =========");
    console.log("Request-Rate Exceeded  (this message will not be repeated)");
    console.log("");
    console.log("The default API keys for each service are provided as a highly-throttled,");
    console.log("community resource for low-traffic projects and early prototyping.");
    console.log("");
    console.log("While your application will continue to function, we highly recommended");
    console.log("signing up for your own API keys to improve performance, increase your");
    console.log("request rate/limit and enable other perks, such as metrics and advanced APIs.");
    console.log("");
    console.log("For more details: https:/\/docs.ethers.io/api-keys/");
    console.log("==========================");
}

var __awaiter$4 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$f = new Logger(version$9);
//////////////////////////////
// Event Serializeing
function checkTopic(topic) {
    if (topic == null) {
        return "null";
    }
    if (hexDataLength(topic) !== 32) {
        logger$f.throwArgumentError("invalid topic", "topic", topic);
    }
    return topic.toLowerCase();
}
function serializeTopics(topics) {
    // Remove trailing null AND-topics; they are redundant
    topics = topics.slice();
    while (topics.length > 0 && topics[topics.length - 1] == null) {
        topics.pop();
    }
    return topics.map((topic) => {
        if (Array.isArray(topic)) {
            // Only track unique OR-topics
            const unique = {};
            topic.forEach((topic) => {
                unique[checkTopic(topic)] = true;
            });
            // The order of OR-topics does not matter
            const sorted = Object.keys(unique);
            sorted.sort();
            return sorted.join("|");
        }
        else {
            return checkTopic(topic);
        }
    }).join("&");
}
function deserializeTopics(data) {
    if (data === "") {
        return [];
    }
    return data.split(/&/g).map((topic) => {
        if (topic === "") {
            return [];
        }
        const comps = topic.split("|").map((topic) => {
            return ((topic === "null") ? null : topic);
        });
        return ((comps.length === 1) ? comps[0] : comps);
    });
}
function getEventTag(eventName) {
    if (typeof (eventName) === "string") {
        eventName = eventName.toLowerCase();
        if (hexDataLength(eventName) === 32) {
            return "tx:" + eventName;
        }
        if (eventName.indexOf(":") === -1) {
            return eventName;
        }
    }
    else if (Array.isArray(eventName)) {
        return "filter:*:" + serializeTopics(eventName);
    }
    else if (ForkEvent.isForkEvent(eventName)) {
        logger$f.warn("not implemented");
        throw new Error("not implemented");
    }
    else if (eventName && typeof (eventName) === "object") {
        return "filter:" + (eventName.address || "*") + ":" + serializeTopics(eventName.topics || []);
    }
    throw new Error("invalid event - " + eventName);
}
//////////////////////////////
// Helper Object
function getTime() {
    return (new Date()).getTime();
}
function stall(duration) {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}
//////////////////////////////
// Provider Object
/**
 *  EventType
 *   - "block"
 *   - "poll"
 *   - "didPoll"
 *   - "pending"
 *   - "error"
 *   - "network"
 *   - filter
 *   - topics array
 *   - transaction hash
 */
const PollableEvents = ["block", "network", "pending", "poll"];
class Event {
    constructor(tag, listener, once) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);
    }
    get event() {
        switch (this.type) {
            case "tx":
                return this.hash;
            case "filter":
                return this.filter;
        }
        return this.tag;
    }
    get type() {
        return this.tag.split(":")[0];
    }
    get hash() {
        const comps = this.tag.split(":");
        if (comps[0] !== "tx") {
            return null;
        }
        return comps[1];
    }
    get filter() {
        const comps = this.tag.split(":");
        if (comps[0] !== "filter") {
            return null;
        }
        const address = comps[1];
        const topics = deserializeTopics(comps[2]);
        const filter = {};
        if (topics.length > 0) {
            filter.topics = topics;
        }
        if (address && address !== "*") {
            filter.address = address;
        }
        return filter;
    }
    pollable() {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    }
}
let defaultFormatter = null;
let nextPollId = 1;
class BaseProvider extends Provider {
    /**
     *  ready
     *
     *  A Promise<Network> that resolves only once the provider is ready.
     *
     *  Sub-classes that call the super with a network without a chainId
     *  MUST set this. Standard named networks have a known chainId.
     *
     */
    constructor(network) {
        logger$f.checkNew(new.target, Provider);
        super();
        // Events being listened to
        this._events = [];
        this._emitted = { block: -2 };
        this.formatter = new.target.getFormatter();
        // If network is any, this Provider allows the underlying
        // network to change dynamically, and we auto-detect the
        // current network
        defineReadOnly(this, "anyNetwork", (network === "any"));
        if (this.anyNetwork) {
            network = this.detectNetwork();
        }
        if (network instanceof Promise) {
            this._networkPromise = network;
            // Squash any "unhandled promise" errors; that do not need to be handled
            network.catch((error) => { });
            // Trigger initial network setting (async)
            this._ready().catch((error) => { });
        }
        else {
            const knownNetwork = getStatic((new.target), "getNetwork")(network);
            if (knownNetwork) {
                defineReadOnly(this, "_network", knownNetwork);
                this.emit("network", knownNetwork, null);
            }
            else {
                logger$f.throwArgumentError("invalid network", "network", network);
            }
        }
        this._maxInternalBlockNumber = -1024;
        this._lastBlockNumber = -2;
        this._pollingInterval = 4000;
        this._fastQueryDate = 0;
    }
    _ready() {
        return __awaiter$4(this, void 0, void 0, function* () {
            if (this._network == null) {
                let network = null;
                if (this._networkPromise) {
                    try {
                        network = yield this._networkPromise;
                    }
                    catch (error) { }
                }
                // Try the Provider's network detection (this MUST throw if it cannot)
                if (network == null) {
                    network = yield this.detectNetwork();
                }
                // This should never happen; every Provider sub-class should have
                // suggested a network by here (or have thrown).
                if (!network) {
                    logger$f.throwError("no network detected", Logger.errors.UNKNOWN_ERROR, {});
                }
                // Possible this call stacked so do not call defineReadOnly again
                if (this._network == null) {
                    if (this.anyNetwork) {
                        this._network = network;
                    }
                    else {
                        defineReadOnly(this, "_network", network);
                    }
                    this.emit("network", network, null);
                }
            }
            return this._network;
        });
    }
    // This will always return the most recently established network.
    // For "any", this can change (a "network" event is emitted before
    // any change is refelcted); otherwise this cannot change
    get ready() {
        return poll(() => {
            return this._ready().then((network) => {
                return network;
            }, (error) => {
                // If the network isn't running yet, we will wait
                if (error.code === Logger.errors.NETWORK_ERROR && error.event === "noNetwork") {
                    return undefined;
                }
                throw error;
            });
        });
    }
    // @TODO: Remove this and just create a singleton formatter
    static getFormatter() {
        if (defaultFormatter == null) {
            defaultFormatter = new Formatter();
        }
        return defaultFormatter;
    }
    // @TODO: Remove this and just use getNetwork
    static getNetwork(network) {
        return getNetwork((network == null) ? "homestead" : network);
    }
    // Fetches the blockNumber, but will reuse any result that is less
    // than maxAge old or has been requested since the last request
    _getInternalBlockNumber(maxAge) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this._ready();
            const internalBlockNumber = this._internalBlockNumber;
            if (maxAge > 0 && this._internalBlockNumber) {
                const result = yield internalBlockNumber;
                if ((getTime() - result.respTime) <= maxAge) {
                    return result.blockNumber;
                }
            }
            const reqTime = getTime();
            const checkInternalBlockNumber = resolveProperties({
                blockNumber: this.perform("getBlockNumber", {}),
                networkError: this.getNetwork().then((network) => (null), (error) => (error))
            }).then(({ blockNumber, networkError }) => {
                if (networkError) {
                    // Unremember this bad internal block number
                    if (this._internalBlockNumber === checkInternalBlockNumber) {
                        this._internalBlockNumber = null;
                    }
                    throw networkError;
                }
                const respTime = getTime();
                blockNumber = BigNumber.from(blockNumber).toNumber();
                if (blockNumber < this._maxInternalBlockNumber) {
                    blockNumber = this._maxInternalBlockNumber;
                }
                this._maxInternalBlockNumber = blockNumber;
                this._setFastBlockNumber(blockNumber); // @TODO: Still need this?
                return { blockNumber, reqTime, respTime };
            });
            this._internalBlockNumber = checkInternalBlockNumber;
            return (yield checkInternalBlockNumber).blockNumber;
        });
    }
    poll() {
        return __awaiter$4(this, void 0, void 0, function* () {
            const pollId = nextPollId++;
            // Track all running promises, so we can trigger a post-poll once they are complete
            const runners = [];
            const blockNumber = yield this._getInternalBlockNumber(100 + this.pollingInterval / 2);
            this._setFastBlockNumber(blockNumber);
            // Emit a poll event after we have the latest (fast) block number
            this.emit("poll", pollId, blockNumber);
            // If the block has not changed, meh.
            if (blockNumber === this._lastBlockNumber) {
                this.emit("didPoll", pollId);
                return;
            }
            // First polling cycle, trigger a "block" events
            if (this._emitted.block === -2) {
                this._emitted.block = blockNumber - 1;
            }
            if (Math.abs((this._emitted.block) - blockNumber) > 1000) {
                logger$f.warn("network block skew detected; skipping block events");
                this.emit("error", logger$f.makeError("network block skew detected", Logger.errors.NETWORK_ERROR, {
                    blockNumber: blockNumber,
                    event: "blockSkew",
                    previousBlockNumber: this._emitted.block
                }));
                this.emit("block", blockNumber);
            }
            else {
                // Notify all listener for each block that has passed
                for (let i = this._emitted.block + 1; i <= blockNumber; i++) {
                    this.emit("block", i);
                }
            }
            // The emitted block was updated, check for obsolete events
            if (this._emitted.block !== blockNumber) {
                this._emitted.block = blockNumber;
                Object.keys(this._emitted).forEach((key) => {
                    // The block event does not expire
                    if (key === "block") {
                        return;
                    }
                    // The block we were at when we emitted this event
                    const eventBlockNumber = this._emitted[key];
                    // We cannot garbage collect pending transactions or blocks here
                    // They should be garbage collected by the Provider when setting
                    // "pending" events
                    if (eventBlockNumber === "pending") {
                        return;
                    }
                    // Evict any transaction hashes or block hashes over 12 blocks
                    // old, since they should not return null anyways
                    if (blockNumber - eventBlockNumber > 12) {
                        delete this._emitted[key];
                    }
                });
            }
            // First polling cycle
            if (this._lastBlockNumber === -2) {
                this._lastBlockNumber = blockNumber - 1;
            }
            // Find all transaction hashes we are waiting on
            this._events.forEach((event) => {
                switch (event.type) {
                    case "tx": {
                        const hash = event.hash;
                        let runner = this.getTransactionReceipt(hash).then((receipt) => {
                            if (!receipt || receipt.blockNumber == null) {
                                return null;
                            }
                            this._emitted["t:" + hash] = receipt.blockNumber;
                            this.emit(hash, receipt);
                            return null;
                        }).catch((error) => { this.emit("error", error); });
                        runners.push(runner);
                        break;
                    }
                    case "filter": {
                        const filter = event.filter;
                        filter.fromBlock = this._lastBlockNumber + 1;
                        filter.toBlock = blockNumber;
                        const runner = this.getLogs(filter).then((logs) => {
                            if (logs.length === 0) {
                                return;
                            }
                            logs.forEach((log) => {
                                this._emitted["b:" + log.blockHash] = log.blockNumber;
                                this._emitted["t:" + log.transactionHash] = log.blockNumber;
                                this.emit(filter, log);
                            });
                        }).catch((error) => { this.emit("error", error); });
                        runners.push(runner);
                        break;
                    }
                }
            });
            this._lastBlockNumber = blockNumber;
            // Once all events for this loop have been processed, emit "didPoll"
            Promise.all(runners).then(() => {
                this.emit("didPoll", pollId);
            });
            return null;
        });
    }
    // Deprecated; do not use this
    resetEventsBlock(blockNumber) {
        this._lastBlockNumber = blockNumber - 1;
        if (this.polling) {
            this.poll();
        }
    }
    get network() {
        return this._network;
    }
    // This method should query the network if the underlying network
    // can change, such as when connected to a JSON-RPC backend
    detectNetwork() {
        return __awaiter$4(this, void 0, void 0, function* () {
            return logger$f.throwError("provider does not support network detection", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "provider.detectNetwork"
            });
        });
    }
    getNetwork() {
        return __awaiter$4(this, void 0, void 0, function* () {
            const network = yield this._ready();
            // Make sure we are still connected to the same network; this is
            // only an external call for backends which can have the underlying
            // network change spontaneously
            const currentNetwork = yield this.detectNetwork();
            if (network.chainId !== currentNetwork.chainId) {
                // We are allowing network changes, things can get complex fast;
                // make sure you know what you are doing if you use "any"
                if (this.anyNetwork) {
                    this._network = currentNetwork;
                    // Reset all internal block number guards and caches
                    this._lastBlockNumber = -2;
                    this._fastBlockNumber = null;
                    this._fastBlockNumberPromise = null;
                    this._fastQueryDate = 0;
                    this._emitted.block = -2;
                    this._maxInternalBlockNumber = -1024;
                    this._internalBlockNumber = null;
                    // The "network" event MUST happen before this method resolves
                    // so any events have a chance to unregister, so we stall an
                    // additional event loop before returning from /this/ call
                    this.emit("network", currentNetwork, network);
                    yield stall(0);
                    return this._network;
                }
                const error = logger$f.makeError("underlying network changed", Logger.errors.NETWORK_ERROR, {
                    event: "changed",
                    network: network,
                    detectedNetwork: currentNetwork
                });
                this.emit("error", error);
                throw error;
            }
            return network;
        });
    }
    get blockNumber() {
        this._getInternalBlockNumber(100 + this.pollingInterval / 2).then((blockNumber) => {
            this._setFastBlockNumber(blockNumber);
        });
        return (this._fastBlockNumber != null) ? this._fastBlockNumber : -1;
    }
    get polling() {
        return (this._poller != null);
    }
    set polling(value) {
        if (value && !this._poller) {
            this._poller = setInterval(this.poll.bind(this), this.pollingInterval);
            if (!this._bootstrapPoll) {
                this._bootstrapPoll = setTimeout(() => {
                    this.poll();
                    // We block additional polls until the polling interval
                    // is done, to prevent overwhelming the poll function
                    this._bootstrapPoll = setTimeout(() => {
                        // If polling was disabled, something may require a poke
                        // since starting the bootstrap poll and it was disabled
                        if (!this._poller) {
                            this.poll();
                        }
                        // Clear out the bootstrap so we can do another
                        this._bootstrapPoll = null;
                    }, this.pollingInterval);
                }, 0);
            }
        }
        else if (!value && this._poller) {
            clearInterval(this._poller);
            this._poller = null;
        }
    }
    get pollingInterval() {
        return this._pollingInterval;
    }
    set pollingInterval(value) {
        if (typeof (value) !== "number" || value <= 0 || parseInt(String(value)) != value) {
            throw new Error("invalid polling interval");
        }
        this._pollingInterval = value;
        if (this._poller) {
            clearInterval(this._poller);
            this._poller = setInterval(() => { this.poll(); }, this._pollingInterval);
        }
    }
    _getFastBlockNumber() {
        const now = getTime();
        // Stale block number, request a newer value
        if ((now - this._fastQueryDate) > 2 * this._pollingInterval) {
            this._fastQueryDate = now;
            this._fastBlockNumberPromise = this.getBlockNumber().then((blockNumber) => {
                if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
                    this._fastBlockNumber = blockNumber;
                }
                return this._fastBlockNumber;
            });
        }
        return this._fastBlockNumberPromise;
    }
    _setFastBlockNumber(blockNumber) {
        // Older block, maybe a stale request
        if (this._fastBlockNumber != null && blockNumber < this._fastBlockNumber) {
            return;
        }
        // Update the time we updated the blocknumber
        this._fastQueryDate = getTime();
        // Newer block number, use  it
        if (this._fastBlockNumber == null || blockNumber > this._fastBlockNumber) {
            this._fastBlockNumber = blockNumber;
            this._fastBlockNumberPromise = Promise.resolve(blockNumber);
        }
    }
    waitForTransaction(transactionHash, confirmations, timeout) {
        return __awaiter$4(this, void 0, void 0, function* () {
            if (confirmations == null) {
                confirmations = 1;
            }
            const receipt = yield this.getTransactionReceipt(transactionHash);
            // Receipt is already good
            if ((receipt ? receipt.confirmations : 0) >= confirmations) {
                return receipt;
            }
            // Poll until the receipt is good...
            return new Promise((resolve, reject) => {
                let timer = null;
                let done = false;
                const handler = (receipt) => {
                    if (receipt.confirmations < confirmations) {
                        return;
                    }
                    if (timer) {
                        clearTimeout(timer);
                    }
                    if (done) {
                        return;
                    }
                    done = true;
                    this.removeListener(transactionHash, handler);
                    resolve(receipt);
                };
                this.on(transactionHash, handler);
                if (typeof (timeout) === "number" && timeout > 0) {
                    timer = setTimeout(() => {
                        if (done) {
                            return;
                        }
                        timer = null;
                        done = true;
                        this.removeListener(transactionHash, handler);
                        reject(logger$f.makeError("timeout exceeded", Logger.errors.TIMEOUT, { timeout: timeout }));
                    }, timeout);
                    if (timer.unref) {
                        timer.unref();
                    }
                }
            });
        });
    }
    getBlockNumber() {
        return __awaiter$4(this, void 0, void 0, function* () {
            return this._getInternalBlockNumber(0);
        });
    }
    getGasPrice() {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            return BigNumber.from(yield this.perform("getGasPrice", {}));
        });
    }
    getBalance(addressOrName, blockTag) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const params = yield resolveProperties({
                address: this._getAddress(addressOrName),
                blockTag: this._getBlockTag(blockTag)
            });
            return BigNumber.from(yield this.perform("getBalance", params));
        });
    }
    getTransactionCount(addressOrName, blockTag) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const params = yield resolveProperties({
                address: this._getAddress(addressOrName),
                blockTag: this._getBlockTag(blockTag)
            });
            return BigNumber.from(yield this.perform("getTransactionCount", params)).toNumber();
        });
    }
    getCode(addressOrName, blockTag) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const params = yield resolveProperties({
                address: this._getAddress(addressOrName),
                blockTag: this._getBlockTag(blockTag)
            });
            return hexlify(yield this.perform("getCode", params));
        });
    }
    getStorageAt(addressOrName, position, blockTag) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const params = yield resolveProperties({
                address: this._getAddress(addressOrName),
                blockTag: this._getBlockTag(blockTag),
                position: Promise.resolve(position).then((p) => hexValue(p))
            });
            return hexlify(yield this.perform("getStorageAt", params));
        });
    }
    // This should be called by any subclass wrapping a TransactionResponse
    _wrapTransaction(tx, hash) {
        if (hash != null && hexDataLength(hash) !== 32) {
            throw new Error("invalid response - sendTransaction");
        }
        const result = tx;
        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            logger$f.throwError("Transaction hash mismatch from Provider.sendTransaction.", Logger.errors.UNKNOWN_ERROR, { expectedHash: tx.hash, returnedHash: hash });
        }
        // @TODO: (confirmations? number, timeout? number)
        result.wait = (confirmations) => __awaiter$4(this, void 0, void 0, function* () {
            // We know this transaction *must* exist (whether it gets mined is
            // another story), so setting an emitted value forces us to
            // wait even if the node returns null for the receipt
            if (confirmations !== 0) {
                this._emitted["t:" + tx.hash] = "pending";
            }
            const receipt = yield this.waitForTransaction(tx.hash, confirmations);
            if (receipt == null && confirmations === 0) {
                return null;
            }
            // No longer pending, allow the polling loop to garbage collect this
            this._emitted["t:" + tx.hash] = receipt.blockNumber;
            if (receipt.status === 0) {
                logger$f.throwError("transaction failed", Logger.errors.CALL_EXCEPTION, {
                    transactionHash: tx.hash,
                    transaction: tx,
                    receipt: receipt
                });
            }
            return receipt;
        });
        return result;
    }
    sendTransaction(signedTransaction) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const hexTx = yield Promise.resolve(signedTransaction).then(t => hexlify(t));
            const tx = this.formatter.transaction(signedTransaction);
            try {
                const hash = yield this.perform("sendTransaction", { signedTransaction: hexTx });
                return this._wrapTransaction(tx, hash);
            }
            catch (error) {
                error.transaction = tx;
                error.transactionHash = tx.hash;
                throw error;
            }
        });
    }
    _getTransactionRequest(transaction) {
        return __awaiter$4(this, void 0, void 0, function* () {
            const values = yield transaction;
            const tx = {};
            ["from", "to"].forEach((key) => {
                if (values[key] == null) {
                    return;
                }
                tx[key] = Promise.resolve(values[key]).then((v) => (v ? this._getAddress(v) : null));
            });
            ["gasLimit", "gasPrice", "value"].forEach((key) => {
                if (values[key] == null) {
                    return;
                }
                tx[key] = Promise.resolve(values[key]).then((v) => (v ? BigNumber.from(v) : null));
            });
            ["data"].forEach((key) => {
                if (values[key] == null) {
                    return;
                }
                tx[key] = Promise.resolve(values[key]).then((v) => (v ? hexlify(v) : null));
            });
            return this.formatter.transactionRequest(yield resolveProperties(tx));
        });
    }
    _getFilter(filter) {
        return __awaiter$4(this, void 0, void 0, function* () {
            filter = yield filter;
            const result = {};
            if (filter.address != null) {
                result.address = this._getAddress(filter.address);
            }
            ["blockHash", "topics"].forEach((key) => {
                if (filter[key] == null) {
                    return;
                }
                result[key] = filter[key];
            });
            ["fromBlock", "toBlock"].forEach((key) => {
                if (filter[key] == null) {
                    return;
                }
                result[key] = this._getBlockTag(filter[key]);
            });
            return this.formatter.filter(yield resolveProperties(result));
        });
    }
    call(transaction, blockTag) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const params = yield resolveProperties({
                transaction: this._getTransactionRequest(transaction),
                blockTag: this._getBlockTag(blockTag)
            });
            return hexlify(yield this.perform("call", params));
        });
    }
    estimateGas(transaction) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const params = yield resolveProperties({
                transaction: this._getTransactionRequest(transaction)
            });
            return BigNumber.from(yield this.perform("estimateGas", params));
        });
    }
    _getAddress(addressOrName) {
        return __awaiter$4(this, void 0, void 0, function* () {
            const address = yield this.resolveName(addressOrName);
            if (address == null) {
                logger$f.throwError("ENS name not configured", Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: `resolveName(${JSON.stringify(addressOrName)})`
                });
            }
            return address;
        });
    }
    _getBlock(blockHashOrBlockTag, includeTransactions) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            blockHashOrBlockTag = yield blockHashOrBlockTag;
            // If blockTag is a number (not "latest", etc), this is the block number
            let blockNumber = -128;
            const params = {
                includeTransactions: !!includeTransactions
            };
            if (isHexString(blockHashOrBlockTag, 32)) {
                params.blockHash = blockHashOrBlockTag;
            }
            else {
                try {
                    params.blockTag = this.formatter.blockTag(yield this._getBlockTag(blockHashOrBlockTag));
                    if (isHexString(params.blockTag)) {
                        blockNumber = parseInt(params.blockTag.substring(2), 16);
                    }
                }
                catch (error) {
                    logger$f.throwArgumentError("invalid block hash or block tag", "blockHashOrBlockTag", blockHashOrBlockTag);
                }
            }
            return poll(() => __awaiter$4(this, void 0, void 0, function* () {
                const block = yield this.perform("getBlock", params);
                // Block was not found
                if (block == null) {
                    // For blockhashes, if we didn't say it existed, that blockhash may
                    // not exist. If we did see it though, perhaps from a log, we know
                    // it exists, and this node is just not caught up yet.
                    if (params.blockHash != null) {
                        if (this._emitted["b:" + params.blockHash] == null) {
                            return null;
                        }
                    }
                    // For block tags, if we are asking for a future block, we return null
                    if (params.blockTag != null) {
                        if (blockNumber > this._emitted.block) {
                            return null;
                        }
                    }
                    // Retry on the next block
                    return undefined;
                }
                // Add transactions
                if (includeTransactions) {
                    let blockNumber = null;
                    for (let i = 0; i < block.transactions.length; i++) {
                        const tx = block.transactions[i];
                        if (tx.blockNumber == null) {
                            tx.confirmations = 0;
                        }
                        else if (tx.confirmations == null) {
                            if (blockNumber == null) {
                                blockNumber = yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
                            }
                            // Add the confirmations using the fast block number (pessimistic)
                            let confirmations = (blockNumber - tx.blockNumber) + 1;
                            if (confirmations <= 0) {
                                confirmations = 1;
                            }
                            tx.confirmations = confirmations;
                        }
                    }
                    return this.formatter.blockWithTransactions(block);
                }
                return this.formatter.block(block);
            }), { oncePoll: this });
        });
    }
    getBlock(blockHashOrBlockTag) {
        return (this._getBlock(blockHashOrBlockTag, false));
    }
    getBlockWithTransactions(blockHashOrBlockTag) {
        return (this._getBlock(blockHashOrBlockTag, true));
    }
    getTransaction(transactionHash) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            transactionHash = yield transactionHash;
            const params = { transactionHash: this.formatter.hash(transactionHash, true) };
            return poll(() => __awaiter$4(this, void 0, void 0, function* () {
                const result = yield this.perform("getTransaction", params);
                if (result == null) {
                    if (this._emitted["t:" + transactionHash] == null) {
                        return null;
                    }
                    return undefined;
                }
                const tx = this.formatter.transactionResponse(result);
                if (tx.blockNumber == null) {
                    tx.confirmations = 0;
                }
                else if (tx.confirmations == null) {
                    const blockNumber = yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
                    // Add the confirmations using the fast block number (pessimistic)
                    let confirmations = (blockNumber - tx.blockNumber) + 1;
                    if (confirmations <= 0) {
                        confirmations = 1;
                    }
                    tx.confirmations = confirmations;
                }
                return this._wrapTransaction(tx);
            }), { oncePoll: this });
        });
    }
    getTransactionReceipt(transactionHash) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            transactionHash = yield transactionHash;
            const params = { transactionHash: this.formatter.hash(transactionHash, true) };
            return poll(() => __awaiter$4(this, void 0, void 0, function* () {
                const result = yield this.perform("getTransactionReceipt", params);
                if (result == null) {
                    if (this._emitted["t:" + transactionHash] == null) {
                        return null;
                    }
                    return undefined;
                }
                // "geth-etc" returns receipts before they are ready
                if (result.blockHash == null) {
                    return undefined;
                }
                const receipt = this.formatter.receipt(result);
                if (receipt.blockNumber == null) {
                    receipt.confirmations = 0;
                }
                else if (receipt.confirmations == null) {
                    const blockNumber = yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
                    // Add the confirmations using the fast block number (pessimistic)
                    let confirmations = (blockNumber - receipt.blockNumber) + 1;
                    if (confirmations <= 0) {
                        confirmations = 1;
                    }
                    receipt.confirmations = confirmations;
                }
                return receipt;
            }), { oncePoll: this });
        });
    }
    getLogs(filter) {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            const params = yield resolveProperties({ filter: this._getFilter(filter) });
            const logs = yield this.perform("getLogs", params);
            logs.forEach((log) => {
                if (log.removed == null) {
                    log.removed = false;
                }
            });
            return Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(logs);
        });
    }
    getEtherPrice() {
        return __awaiter$4(this, void 0, void 0, function* () {
            yield this.getNetwork();
            return this.perform("getEtherPrice", {});
        });
    }
    _getBlockTag(blockTag) {
        return __awaiter$4(this, void 0, void 0, function* () {
            blockTag = yield blockTag;
            if (typeof (blockTag) === "number" && blockTag < 0) {
                if (blockTag % 1) {
                    logger$f.throwArgumentError("invalid BlockTag", "blockTag", blockTag);
                }
                let blockNumber = yield this._getInternalBlockNumber(100 + 2 * this.pollingInterval);
                blockNumber += blockTag;
                if (blockNumber < 0) {
                    blockNumber = 0;
                }
                return this.formatter.blockTag(blockNumber);
            }
            return this.formatter.blockTag(blockTag);
        });
    }
    _getResolver(name) {
        return __awaiter$4(this, void 0, void 0, function* () {
            // Get the resolver from the blockchain
            const network = yield this.getNetwork();
            // No ENS...
            if (!network.ensAddress) {
                logger$f.throwError("network does not support ENS", Logger.errors.UNSUPPORTED_OPERATION, { operation: "ENS", network: network.name });
            }
            // keccak256("resolver(bytes32)")
            const transaction = {
                to: network.ensAddress,
                data: ("0x0178b8bf" + namehash(name).substring(2))
            };
            return this.formatter.callAddress(yield this.call(transaction));
        });
    }
    resolveName(name) {
        return __awaiter$4(this, void 0, void 0, function* () {
            name = yield name;
            // If it is already an address, nothing to resolve
            try {
                return Promise.resolve(this.formatter.address(name));
            }
            catch (error) {
                // If is is a hexstring, the address is bad (See #694)
                if (isHexString(name)) {
                    throw error;
                }
            }
            if (typeof (name) !== "string") {
                logger$f.throwArgumentError("invalid ENS name", "name", name);
            }
            // Get the addr from the resovler
            const resolverAddress = yield this._getResolver(name);
            if (!resolverAddress) {
                return null;
            }
            // keccak256("addr(bytes32)")
            const transaction = {
                to: resolverAddress,
                data: ("0x3b3b57de" + namehash(name).substring(2))
            };
            return this.formatter.callAddress(yield this.call(transaction));
        });
    }
    lookupAddress(address) {
        return __awaiter$4(this, void 0, void 0, function* () {
            address = yield address;
            address = this.formatter.address(address);
            const reverseName = address.substring(2).toLowerCase() + ".addr.reverse";
            const resolverAddress = yield this._getResolver(reverseName);
            if (!resolverAddress) {
                return null;
            }
            // keccak("name(bytes32)")
            let bytes = arrayify(yield this.call({
                to: resolverAddress,
                data: ("0x691f3431" + namehash(reverseName).substring(2))
            }));
            // Strip off the dynamic string pointer (0x20)
            if (bytes.length < 32 || !BigNumber.from(bytes.slice(0, 32)).eq(32)) {
                return null;
            }
            bytes = bytes.slice(32);
            // Not a length-prefixed string
            if (bytes.length < 32) {
                return null;
            }
            // Get the length of the string (from the length-prefix)
            const length = BigNumber.from(bytes.slice(0, 32)).toNumber();
            bytes = bytes.slice(32);
            // Length longer than available data
            if (length > bytes.length) {
                return null;
            }
            const name = toUtf8String(bytes.slice(0, length));
            // Make sure the reverse record matches the foward record
            const addr = yield this.resolveName(name);
            if (addr != address) {
                return null;
            }
            return name;
        });
    }
    perform(method, params) {
        return logger$f.throwError(method + " not implemented", Logger.errors.NOT_IMPLEMENTED, { operation: method });
    }
    _startEvent(event) {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
    }
    _stopEvent(event) {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
    }
    _addEventListener(eventName, listener, once) {
        const event = new Event(getEventTag(eventName), listener, once);
        this._events.push(event);
        this._startEvent(event);
        return this;
    }
    on(eventName, listener) {
        return this._addEventListener(eventName, listener, false);
    }
    once(eventName, listener) {
        return this._addEventListener(eventName, listener, true);
    }
    emit(eventName, ...args) {
        let result = false;
        let stopped = [];
        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag) {
                return true;
            }
            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);
            result = true;
            if (event.once) {
                stopped.push(event);
                return false;
            }
            return true;
        });
        stopped.forEach((event) => { this._stopEvent(event); });
        return result;
    }
    listenerCount(eventName) {
        if (!eventName) {
            return this._events.length;
        }
        let eventTag = getEventTag(eventName);
        return this._events.filter((event) => {
            return (event.tag === eventTag);
        }).length;
    }
    listeners(eventName) {
        if (eventName == null) {
            return this._events.map((event) => event.listener);
        }
        let eventTag = getEventTag(eventName);
        return this._events
            .filter((event) => (event.tag === eventTag))
            .map((event) => event.listener);
    }
    off(eventName, listener) {
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }
        const stopped = [];
        let found = false;
        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag || event.listener != listener) {
                return true;
            }
            if (found) {
                return true;
            }
            found = true;
            stopped.push(event);
            return false;
        });
        stopped.forEach((event) => { this._stopEvent(event); });
        return this;
    }
    removeAllListeners(eventName) {
        let stopped = [];
        if (eventName == null) {
            stopped = this._events;
            this._events = [];
        }
        else {
            const eventTag = getEventTag(eventName);
            this._events = this._events.filter((event) => {
                if (event.tag !== eventTag) {
                    return true;
                }
                stopped.push(event);
                return false;
            });
        }
        stopped.forEach((event) => { this._stopEvent(event); });
        return this;
    }
}

var _version = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = "providers/5.0.6";

});

unwrapExports(_version);
var _version_1 = _version.version;

var browserWs = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


var WS = null;
try {
    WS = WebSocket;
    if (WS == null) {
        throw new Error("inject please");
    }
}
catch (error) {
    var logger_2 = new lib_esm.Logger(_version.version);
    WS = function () {
        logger_2.throwError("WebSockets not supported in this environment", lib_esm.Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "new WebSocket()"
        });
    };
}
module.exports = WS;

});

var WebSocket$1 = unwrapExports(browserWs);

const version$f = "abstract-signer/5.0.3";

var __awaiter$5 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$g = new Logger(version$f);
const allowedTransactionKeys = [
    "chainId", "data", "from", "gasLimit", "gasPrice", "nonce", "to", "value"
];
// Sub-Class Notes:
//  - A Signer MUST always make sure, that if present, the "from" field
//    matches the Signer, before sending or signing a transaction
//  - A Signer SHOULD always wrap private information (such as a private
//    key or mnemonic) in a function, so that console.log does not leak
//    the data
class Signer {
    ///////////////////
    // Sub-classes MUST call super
    constructor() {
        logger$g.checkAbstract(new.target, Signer);
        defineReadOnly(this, "_isSigner", true);
    }
    ///////////////////
    // Sub-classes MAY override these
    getBalance(blockTag) {
        return __awaiter$5(this, void 0, void 0, function* () {
            this._checkProvider("getBalance");
            return yield this.provider.getBalance(this.getAddress(), blockTag);
        });
    }
    getTransactionCount(blockTag) {
        return __awaiter$5(this, void 0, void 0, function* () {
            this._checkProvider("getTransactionCount");
            return yield this.provider.getTransactionCount(this.getAddress(), blockTag);
        });
    }
    // Populates "from" if unspecified, and estimates the gas for the transation
    estimateGas(transaction) {
        return __awaiter$5(this, void 0, void 0, function* () {
            this._checkProvider("estimateGas");
            const tx = yield resolveProperties(this.checkTransaction(transaction));
            return yield this.provider.estimateGas(tx);
        });
    }
    // Populates "from" if unspecified, and calls with the transation
    call(transaction, blockTag) {
        return __awaiter$5(this, void 0, void 0, function* () {
            this._checkProvider("call");
            const tx = yield resolveProperties(this.checkTransaction(transaction));
            return yield this.provider.call(tx, blockTag);
        });
    }
    // Populates all fields in a transaction, signs it and sends it to the network
    sendTransaction(transaction) {
        this._checkProvider("sendTransaction");
        return this.populateTransaction(transaction).then((tx) => {
            return this.signTransaction(tx).then((signedTx) => {
                return this.provider.sendTransaction(signedTx);
            });
        });
    }
    getChainId() {
        return __awaiter$5(this, void 0, void 0, function* () {
            this._checkProvider("getChainId");
            const network = yield this.provider.getNetwork();
            return network.chainId;
        });
    }
    getGasPrice() {
        return __awaiter$5(this, void 0, void 0, function* () {
            this._checkProvider("getGasPrice");
            return yield this.provider.getGasPrice();
        });
    }
    resolveName(name) {
        return __awaiter$5(this, void 0, void 0, function* () {
            this._checkProvider("resolveName");
            return yield this.provider.resolveName(name);
        });
    }
    // Checks a transaction does not contain invalid keys and if
    // no "from" is provided, populates it.
    // - does NOT require a provider
    // - adds "from" is not present
    // - returns a COPY (safe to mutate the result)
    // By default called from: (overriding these prevents it)
    //   - call
    //   - estimateGas
    //   - populateTransaction (and therefor sendTransaction)
    checkTransaction(transaction) {
        for (const key in transaction) {
            if (allowedTransactionKeys.indexOf(key) === -1) {
                logger$g.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }
        const tx = shallowCopy(transaction);
        if (tx.from == null) {
            tx.from = this.getAddress();
        }
        else {
            // Make sure any provided address matches this signer
            tx.from = Promise.all([
                Promise.resolve(tx.from),
                this.getAddress()
            ]).then((result) => {
                if (result[0] !== result[1]) {
                    logger$g.throwArgumentError("from address mismatch", "transaction", transaction);
                }
                return result[0];
            });
        }
        return tx;
    }
    // Populates ALL keys for a transaction and checks that "from" matches
    // this Signer. Should be used by sendTransaction but NOT by signTransaction.
    // By default called from: (overriding these prevents it)
    //   - sendTransaction
    populateTransaction(transaction) {
        return __awaiter$5(this, void 0, void 0, function* () {
            const tx = yield resolveProperties(this.checkTransaction(transaction));
            if (tx.to != null) {
                tx.to = Promise.resolve(tx.to).then((to) => this.resolveName(to));
            }
            if (tx.gasPrice == null) {
                tx.gasPrice = this.getGasPrice();
            }
            if (tx.nonce == null) {
                tx.nonce = this.getTransactionCount("pending");
            }
            if (tx.gasLimit == null) {
                tx.gasLimit = this.estimateGas(tx).catch((error) => {
                    return logger$g.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
                        error: error,
                        tx: tx
                    });
                });
            }
            if (tx.chainId == null) {
                tx.chainId = this.getChainId();
            }
            else {
                tx.chainId = Promise.all([
                    Promise.resolve(tx.chainId),
                    this.getChainId()
                ]).then((results) => {
                    if (results[1] !== 0 && results[0] !== results[1]) {
                        logger$g.throwArgumentError("chainId address mismatch", "transaction", transaction);
                    }
                    return results[0];
                });
            }
            return yield resolveProperties(tx);
        });
    }
    ///////////////////
    // Sub-classes SHOULD leave these alone
    _checkProvider(operation) {
        if (!this.provider) {
            logger$g.throwError("missing provider", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: (operation || "_checkProvider")
            });
        }
    }
    static isSigner(value) {
        return !!(value && value._isSigner);
    }
}

var __awaiter$6 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$h = new Logger(version$9);
function timer(timeout) {
    return new Promise(function (resolve) {
        setTimeout(resolve, timeout);
    });
}
function getResult(payload) {
    if (payload.error) {
        // @TODO: not any
        const error = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }
    return payload.result;
}
function getLowerCase(value) {
    if (value) {
        return value.toLowerCase();
    }
    return value;
}
const _constructorGuard$1 = {};
class JsonRpcSigner extends Signer {
    constructor(constructorGuard, provider, addressOrIndex) {
        logger$h.checkNew(new.target, JsonRpcSigner);
        super();
        if (constructorGuard !== _constructorGuard$1) {
            throw new Error("do not call the JsonRpcSigner constructor directly; use provider.getSigner");
        }
        defineReadOnly(this, "provider", provider);
        if (addressOrIndex == null) {
            addressOrIndex = 0;
        }
        if (typeof (addressOrIndex) === "string") {
            defineReadOnly(this, "_address", this.provider.formatter.address(addressOrIndex));
            defineReadOnly(this, "_index", null);
        }
        else if (typeof (addressOrIndex) === "number") {
            defineReadOnly(this, "_index", addressOrIndex);
            defineReadOnly(this, "_address", null);
        }
        else {
            logger$h.throwArgumentError("invalid address or index", "addressOrIndex", addressOrIndex);
        }
    }
    connect(provider) {
        return logger$h.throwError("cannot alter JSON-RPC Signer connection", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "connect"
        });
    }
    connectUnchecked() {
        return new UncheckedJsonRpcSigner(_constructorGuard$1, this.provider, this._address || this._index);
    }
    getAddress() {
        if (this._address) {
            return Promise.resolve(this._address);
        }
        return this.provider.send("eth_accounts", []).then((accounts) => {
            if (accounts.length <= this._index) {
                logger$h.throwError("unknown account #" + this._index, Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "getAddress"
                });
            }
            return this.provider.formatter.address(accounts[this._index]);
        });
    }
    sendUncheckedTransaction(transaction) {
        transaction = shallowCopy(transaction);
        const fromAddress = this.getAddress().then((address) => {
            if (address) {
                address = address.toLowerCase();
            }
            return address;
        });
        // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
        // wishes to use this, it is easy to specify explicitly, otherwise
        // we look it up for them.
        if (transaction.gasLimit == null) {
            const estimate = shallowCopy(transaction);
            estimate.from = fromAddress;
            transaction.gasLimit = this.provider.estimateGas(estimate);
        }
        return resolveProperties({
            tx: resolveProperties(transaction),
            sender: fromAddress
        }).then(({ tx, sender }) => {
            if (tx.from != null) {
                if (tx.from.toLowerCase() !== sender) {
                    logger$h.throwArgumentError("from address mismatch", "transaction", transaction);
                }
            }
            else {
                tx.from = sender;
            }
            const hexTx = this.provider.constructor.hexlifyTransaction(tx, { from: true });
            return this.provider.send("eth_sendTransaction", [hexTx]).then((hash) => {
                return hash;
            }, (error) => {
                if (error.responseText) {
                    // See: JsonRpcProvider.sendTransaction (@TODO: Expose a ._throwError??)
                    if (error.responseText.indexOf("insufficient funds") >= 0) {
                        logger$h.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("nonce too low") >= 0) {
                        logger$h.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("replacement transaction underpriced") >= 0) {
                        logger$h.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {
                            transaction: tx
                        });
                    }
                }
                throw error;
            });
        });
    }
    signTransaction(transaction) {
        return logger$h.throwError("signing transactions is unsupported", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "signTransaction"
        });
    }
    sendTransaction(transaction) {
        return this.sendUncheckedTransaction(transaction).then((hash) => {
            return poll(() => {
                return this.provider.getTransaction(hash).then((tx) => {
                    if (tx === null) {
                        return undefined;
                    }
                    return this.provider._wrapTransaction(tx, hash);
                });
            }, { onceBlock: this.provider }).catch((error) => {
                error.transactionHash = hash;
                throw error;
            });
        });
    }
    signMessage(message) {
        const data = ((typeof (message) === "string") ? toUtf8Bytes(message) : message);
        return this.getAddress().then((address) => {
            // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
            return this.provider.send("eth_sign", [address.toLowerCase(), hexlify(data)]);
        });
    }
    unlock(password) {
        const provider = this.provider;
        return this.getAddress().then(function (address) {
            return provider.send("personal_unlockAccount", [address.toLowerCase(), password, null]);
        });
    }
}
class UncheckedJsonRpcSigner extends JsonRpcSigner {
    sendTransaction(transaction) {
        return this.sendUncheckedTransaction(transaction).then((hash) => {
            return {
                hash: hash,
                nonce: null,
                gasLimit: null,
                gasPrice: null,
                data: null,
                value: null,
                chainId: null,
                confirmations: 0,
                from: null,
                wait: (confirmations) => { return this.provider.waitForTransaction(hash, confirmations); }
            };
        });
    }
}
const allowedTransactionKeys$1 = {
    chainId: true, data: true, gasLimit: true, gasPrice: true, nonce: true, to: true, value: true
};
class JsonRpcProvider extends BaseProvider {
    constructor(url, network) {
        logger$h.checkNew(new.target, JsonRpcProvider);
        let networkOrReady = network;
        // The network is unknown, query the JSON-RPC for it
        if (networkOrReady == null) {
            networkOrReady = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.detectNetwork().then((network) => {
                        resolve(network);
                    }, (error) => {
                        reject(error);
                    });
                }, 0);
            });
        }
        super(networkOrReady);
        // Default URL
        if (!url) {
            url = getStatic(this.constructor, "defaultUrl")();
        }
        if (typeof (url) === "string") {
            defineReadOnly(this, "connection", Object.freeze({
                url: url
            }));
        }
        else {
            defineReadOnly(this, "connection", Object.freeze(shallowCopy(url)));
        }
        this._nextId = 42;
    }
    static defaultUrl() {
        return "http:/\/localhost:8545";
    }
    detectNetwork() {
        return __awaiter$6(this, void 0, void 0, function* () {
            yield timer(0);
            let chainId = null;
            try {
                chainId = yield this.send("eth_chainId", []);
            }
            catch (error) {
                try {
                    chainId = yield this.send("net_version", []);
                }
                catch (error) { }
            }
            if (chainId != null) {
                const getNetwork = getStatic(this.constructor, "getNetwork");
                try {
                    return getNetwork(BigNumber.from(chainId).toNumber());
                }
                catch (error) {
                    return logger$h.throwError("could not detect network", Logger.errors.NETWORK_ERROR, {
                        chainId: chainId,
                        event: "invalidNetwork",
                        serverError: error
                    });
                }
            }
            return logger$h.throwError("could not detect network", Logger.errors.NETWORK_ERROR, {
                event: "noNetwork"
            });
        });
    }
    getSigner(addressOrIndex) {
        return new JsonRpcSigner(_constructorGuard$1, this, addressOrIndex);
    }
    getUncheckedSigner(addressOrIndex) {
        return this.getSigner(addressOrIndex).connectUnchecked();
    }
    listAccounts() {
        return this.send("eth_accounts", []).then((accounts) => {
            return accounts.map((a) => this.formatter.address(a));
        });
    }
    send(method, params) {
        const request = {
            method: method,
            params: params,
            id: (this._nextId++),
            jsonrpc: "2.0"
        };
        this.emit("debug", {
            action: "request",
            request: deepCopy(request),
            provider: this
        });
        return fetchJson(this.connection, JSON.stringify(request), getResult).then((result) => {
            this.emit("debug", {
                action: "response",
                request: request,
                response: result,
                provider: this
            });
            return result;
        }, (error) => {
            this.emit("debug", {
                action: "response",
                error: error,
                request: request,
                provider: this
            });
            throw error;
        });
    }
    prepareRequest(method, params) {
        switch (method) {
            case "getBlockNumber":
                return ["eth_blockNumber", []];
            case "getGasPrice":
                return ["eth_gasPrice", []];
            case "getBalance":
                return ["eth_getBalance", [getLowerCase(params.address), params.blockTag]];
            case "getTransactionCount":
                return ["eth_getTransactionCount", [getLowerCase(params.address), params.blockTag]];
            case "getCode":
                return ["eth_getCode", [getLowerCase(params.address), params.blockTag]];
            case "getStorageAt":
                return ["eth_getStorageAt", [getLowerCase(params.address), params.position, params.blockTag]];
            case "sendTransaction":
                return ["eth_sendRawTransaction", [params.signedTransaction]];
            case "getBlock":
                if (params.blockTag) {
                    return ["eth_getBlockByNumber", [params.blockTag, !!params.includeTransactions]];
                }
                else if (params.blockHash) {
                    return ["eth_getBlockByHash", [params.blockHash, !!params.includeTransactions]];
                }
                return null;
            case "getTransaction":
                return ["eth_getTransactionByHash", [params.transactionHash]];
            case "getTransactionReceipt":
                return ["eth_getTransactionReceipt", [params.transactionHash]];
            case "call": {
                const hexlifyTransaction = getStatic(this.constructor, "hexlifyTransaction");
                return ["eth_call", [hexlifyTransaction(params.transaction, { from: true }), params.blockTag]];
            }
            case "estimateGas": {
                const hexlifyTransaction = getStatic(this.constructor, "hexlifyTransaction");
                return ["eth_estimateGas", [hexlifyTransaction(params.transaction, { from: true })]];
            }
            case "getLogs":
                if (params.filter && params.filter.address != null) {
                    params.filter.address = getLowerCase(params.filter.address);
                }
                return ["eth_getLogs", [params.filter]];
        }
        return null;
    }
    perform(method, params) {
        const args = this.prepareRequest(method, params);
        if (args == null) {
            logger$h.throwError(method + " not implemented", Logger.errors.NOT_IMPLEMENTED, { operation: method });
        }
        // We need a little extra logic to process errors from sendTransaction
        if (method === "sendTransaction") {
            return this.send(args[0], args[1]).catch((error) => {
                if (error.responseText) {
                    // "insufficient funds for gas * price + value"
                    if (error.responseText.indexOf("insufficient funds") > 0) {
                        logger$h.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, {});
                    }
                    // "nonce too low"
                    if (error.responseText.indexOf("nonce too low") > 0) {
                        logger$h.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {});
                    }
                    // "replacement transaction underpriced"
                    if (error.responseText.indexOf("replacement transaction underpriced") > 0) {
                        logger$h.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {});
                    }
                }
                throw error;
            });
        }
        return this.send(args[0], args[1]);
    }
    _startEvent(event) {
        if (event.tag === "pending") {
            this._startPending();
        }
        super._startEvent(event);
    }
    _startPending() {
        if (this._pendingFilter != null) {
            return;
        }
        const self = this;
        const pendingFilter = this.send("eth_newPendingTransactionFilter", []);
        this._pendingFilter = pendingFilter;
        pendingFilter.then(function (filterId) {
            function poll() {
                self.send("eth_getFilterChanges", [filterId]).then(function (hashes) {
                    if (self._pendingFilter != pendingFilter) {
                        return null;
                    }
                    let seq = Promise.resolve();
                    hashes.forEach(function (hash) {
                        // @TODO: This should be garbage collected at some point... How? When?
                        self._emitted["t:" + hash.toLowerCase()] = "pending";
                        seq = seq.then(function () {
                            return self.getTransaction(hash).then(function (tx) {
                                self.emit("pending", tx);
                                return null;
                            });
                        });
                    });
                    return seq.then(function () {
                        return timer(1000);
                    });
                }).then(function () {
                    if (self._pendingFilter != pendingFilter) {
                        self.send("eth_uninstallFilter", [filterId]);
                        return;
                    }
                    setTimeout(function () { poll(); }, 0);
                    return null;
                }).catch((error) => { });
            }
            poll();
            return filterId;
        }).catch((error) => { });
    }
    _stopEvent(event) {
        if (event.tag === "pending" && this.listenerCount("pending") === 0) {
            this._pendingFilter = null;
        }
        super._stopEvent(event);
    }
    // Convert an ethers.js transaction into a JSON-RPC transaction
    //  - gasLimit => gas
    //  - All values hexlified
    //  - All numeric values zero-striped
    //  - All addresses are lowercased
    // NOTE: This allows a TransactionRequest, but all values should be resolved
    //       before this is called
    // @TODO: This will likely be removed in future versions and prepareRequest
    //        will be the preferred method for this.
    static hexlifyTransaction(transaction, allowExtra) {
        // Check only allowed properties are given
        const allowed = shallowCopy(allowedTransactionKeys$1);
        if (allowExtra) {
            for (const key in allowExtra) {
                if (allowExtra[key]) {
                    allowed[key] = true;
                }
            }
        }
        checkProperties(transaction, allowed);
        const result = {};
        // Some nodes (INFURA ropsten; INFURA mainnet is fine) do not like leading zeros.
        ["gasLimit", "gasPrice", "nonce", "value"].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            const value = hexValue(transaction[key]);
            if (key === "gasLimit") {
                key = "gas";
            }
            result[key] = value;
        });
        ["from", "to", "data"].forEach(function (key) {
            if (transaction[key] == null) {
                return;
            }
            result[key] = hexlify(transaction[key]);
        });
        return result;
    }
}

var __awaiter$7 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$i = new Logger(version$9);
/**
 *  Notes:
 *
 *  This provider differs a bit from the polling providers. One main
 *  difference is how it handles consistency. The polling providers
 *  will stall responses to ensure a consistent state, while this
 *  WebSocket provider assumes the connected backend will manage this.
 *
 *  For example, if a polling provider emits an event which indicats
 *  the event occurred in blockhash XXX, a call to fetch that block by
 *  its hash XXX, if not present will retry until it is present. This
 *  can occur when querying a pool of nodes that are mildly out of sync
 *  with each other.
 */
let NextId = 1;
// For more info about the Real-time Event API see:
//   https://geth.ethereum.org/docs/rpc/pubsub
class WebSocketProvider extends JsonRpcProvider {
    constructor(url, network) {
        // This will be added in the future; please open an issue to expedite
        if (network === "any") {
            logger$i.throwError("WebSocketProvider does not support 'any' network yet", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "network:any"
            });
        }
        super(url, network);
        this._pollingInterval = -1;
        defineReadOnly(this, "_websocket", new WebSocket$1(this.connection.url));
        defineReadOnly(this, "_requests", {});
        defineReadOnly(this, "_subs", {});
        defineReadOnly(this, "_subIds", {});
        // Stall sending requests until the socket is open...
        this._wsReady = false;
        this._websocket.onopen = () => {
            this._wsReady = true;
            Object.keys(this._requests).forEach((id) => {
                this._websocket.send(this._requests[id].payload);
            });
        };
        this._websocket.onmessage = (messageEvent) => {
            const data = messageEvent.data;
            const result = JSON.parse(data);
            if (result.id != null) {
                const id = String(result.id);
                const request = this._requests[id];
                delete this._requests[id];
                if (result.result !== undefined) {
                    request.callback(null, result.result);
                }
                else {
                    if (result.error) {
                        const error = new Error(result.error.message || "unknown error");
                        defineReadOnly(error, "code", result.error.code || null);
                        defineReadOnly(error, "response", data);
                        request.callback(error, undefined);
                    }
                    else {
                        request.callback(new Error("unknown error"), undefined);
                    }
                }
            }
            else if (result.method === "eth_subscription") {
                // Subscription...
                const sub = this._subs[result.params.subscription];
                if (sub) {
                    //this.emit.apply(this,                  );
                    sub.processFunc(result.params.result);
                }
            }
            else {
                console.warn("this should not happen");
            }
        };
        // This Provider does not actually poll, but we want to trigger
        // poll events for things that depend on them (like stalling for
        // block and transaction lookups)
        const fauxPoll = setInterval(() => {
            this.emit("poll");
        }, 1000);
        if (fauxPoll.unref) {
            fauxPoll.unref();
        }
    }
    get pollingInterval() {
        return 0;
    }
    resetEventsBlock(blockNumber) {
        logger$i.throwError("cannot reset events block on WebSocketProvider", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "resetEventBlock"
        });
    }
    set pollingInterval(value) {
        logger$i.throwError("cannot set polling interval on WebSocketProvider", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "setPollingInterval"
        });
    }
    poll() {
        return __awaiter$7(this, void 0, void 0, function* () {
            return null;
        });
    }
    set polling(value) {
        if (!value) {
            return;
        }
        logger$i.throwError("cannot set polling on WebSocketProvider", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "setPolling"
        });
    }
    send(method, params) {
        const rid = NextId++;
        return new Promise((resolve, reject) => {
            function callback(error, result) {
                if (error) {
                    return reject(error);
                }
                return resolve(result);
            }
            const payload = JSON.stringify({
                method: method,
                params: params,
                id: rid,
                jsonrpc: "2.0"
            });
            this._requests[String(rid)] = { callback, payload };
            if (this._wsReady) {
                this._websocket.send(payload);
            }
        });
    }
    static defaultUrl() {
        return "ws:/\/localhost:8546";
    }
    _subscribe(tag, param, processFunc) {
        return __awaiter$7(this, void 0, void 0, function* () {
            let subIdPromise = this._subIds[tag];
            if (subIdPromise == null) {
                subIdPromise = Promise.all(param).then((param) => {
                    return this.send("eth_subscribe", param);
                });
                this._subIds[tag] = subIdPromise;
            }
            const subId = yield subIdPromise;
            this._subs[subId] = { tag, processFunc };
        });
    }
    _startEvent(event) {
        switch (event.type) {
            case "block":
                this._subscribe("block", ["newHeads"], (result) => {
                    const blockNumber = BigNumber.from(result.number).toNumber();
                    this._emitted.block = blockNumber;
                    this.emit("block", blockNumber);
                });
                break;
            case "pending":
                this._subscribe("pending", ["newPendingTransactions"], (result) => {
                    this.emit("pending", result);
                });
                break;
            case "filter":
                this._subscribe(event.tag, ["logs", this._getFilter(event.filter)], (result) => {
                    if (result.removed == null) {
                        result.removed = false;
                    }
                    this.emit(event.filter, this.formatter.filterLog(result));
                });
                break;
            case "tx": {
                const emitReceipt = (event) => {
                    const hash = event.hash;
                    this.getTransactionReceipt(hash).then((receipt) => {
                        if (!receipt) {
                            return;
                        }
                        this.emit(hash, receipt);
                    });
                };
                // In case it is already mined
                emitReceipt(event);
                // To keep things simple, we start up a single newHeads subscription
                // to keep an eye out for transactions we are watching for.
                // Starting a subscription for an event (i.e. "tx") that is already
                // running is (basically) a nop.
                this._subscribe("tx", ["newHeads"], (result) => {
                    this._events.filter((e) => (e.type === "tx")).forEach(emitReceipt);
                });
                break;
            }
            // Nothing is needed
            case "debug":
            case "poll":
            case "willPoll":
            case "didPoll":
            case "error":
                break;
            default:
                console.log("unhandled:", event);
                break;
        }
    }
    _stopEvent(event) {
        let tag = event.tag;
        if (event.type === "tx") {
            // There are remaining transaction event listeners
            if (this._events.filter((e) => (e.type === "tx")).length) {
                return;
            }
            tag = "tx";
        }
        else if (this.listenerCount(event.event)) {
            // There are remaining event listeners
            return;
        }
        const subId = this._subIds[tag];
        if (!subId) {
            return;
        }
        delete this._subIds[tag];
        subId.then((subId) => {
            if (!this._subs[subId]) {
                return;
            }
            delete this._subs[subId];
            this.send("eth_unsubscribe", [subId]);
        });
    }
    destroy() {
        return __awaiter$7(this, void 0, void 0, function* () {
            // Wait until we have connected before trying to disconnect
            if (this._websocket.readyState === WebSocket$1.CONNECTING) {
                yield (new Promise((resolve) => {
                    this._websocket.onopen = function () {
                        resolve(true);
                    };
                    this._websocket.onerror = function () {
                        resolve(false);
                    };
                }));
            }
            // Hangup
            // See: https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent#Status_codes
            this._websocket.close(1000);
        });
    }
}

var __awaiter$8 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$j = new Logger(version$9);
// A StaticJsonRpcProvider is useful when you *know* for certain that
// the backend will never change, as it never calls eth_chainId to
// verify its backend. However, if the backend does change, the effects
// are undefined and may include:
// - inconsistent results
// - locking up the UI
// - block skew warnings
// - wrong results
// If the network is not explicit (i.e. auto-detection is expected), the
// node MUST be running and available to respond to requests BEFORE this
// is instantiated.
class StaticJsonRpcProvider extends JsonRpcProvider {
    detectNetwork() {
        const _super = Object.create(null, {
            detectNetwork: { get: () => super.detectNetwork }
        });
        return __awaiter$8(this, void 0, void 0, function* () {
            let network = this.network;
            if (network == null) {
                network = yield _super.detectNetwork.call(this);
                if (!network) {
                    logger$j.throwError("no network detected", Logger.errors.UNKNOWN_ERROR, {});
                }
                // If still not set, set it
                if (this._network == null) {
                    // A static network does not support "any"
                    defineReadOnly(this, "_network", network);
                    this.emit("network", network, null);
                }
            }
            return network;
        });
    }
}
class UrlJsonRpcProvider extends StaticJsonRpcProvider {
    constructor(network, apiKey) {
        logger$j.checkAbstract(new.target, UrlJsonRpcProvider);
        // Normalize the Network and API Key
        network = getStatic((new.target), "getNetwork")(network);
        apiKey = getStatic((new.target), "getApiKey")(apiKey);
        const connection = getStatic((new.target), "getUrl")(network, apiKey);
        super(connection, network);
        if (typeof (apiKey) === "string") {
            defineReadOnly(this, "apiKey", apiKey);
        }
        else if (apiKey != null) {
            Object.keys(apiKey).forEach((key) => {
                defineReadOnly(this, key, apiKey[key]);
            });
        }
    }
    _startPending() {
        logger$j.warn("WARNING: API provider does not support pending filters");
    }
    getSigner(address) {
        return logger$j.throwError("API provider does not support signing", Logger.errors.UNSUPPORTED_OPERATION, { operation: "getSigner" });
    }
    listAccounts() {
        return Promise.resolve([]);
    }
    // Return a defaultApiKey if null, otherwise validate the API key
    static getApiKey(apiKey) {
        return apiKey;
    }
    // Returns the url or connection for the given network and API key. The
    // API key will have been sanitized by the getApiKey first, so any validation
    // or transformations can be done there.
    static getUrl(network, apiKey) {
        return logger$j.throwError("not implemented; sub-classes must override getUrl", Logger.errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    }
}

const logger$k = new Logger(version$9);
// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io
const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
class AlchemyProvider extends UrlJsonRpcProvider {
    static getWebSocketProvider(network, apiKey) {
        const provider = new AlchemyProvider(network, apiKey);
        const url = provider.connection.url.replace(/^http/i, "ws")
            .replace(".alchemyapi.", ".ws.alchemyapi.");
        return new WebSocketProvider(url, provider.network);
    }
    static getApiKey(apiKey) {
        if (apiKey == null) {
            return defaultApiKey;
        }
        if (apiKey && typeof (apiKey) !== "string") {
            logger$k.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "eth-mainnet.alchemyapi.io/v2/";
                break;
            case "ropsten":
                host = "eth-ropsten.alchemyapi.io/v2/";
                break;
            case "rinkeby":
                host = "eth-rinkeby.alchemyapi.io/v2/";
                break;
            case "goerli":
                host = "eth-goerli.alchemyapi.io/v2/";
                break;
            case "kovan":
                host = "eth-kovan.alchemyapi.io/v2/";
                break;
            default:
                logger$k.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return {
            url: ("https:/" + "/" + host + apiKey),
            throttleCallback: (attempt, url) => {
                if (apiKey === defaultApiKey) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
    }
}

var __awaiter$9 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$l = new Logger(version$9);
class CloudflareProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        if (apiKey != null) {
            logger$l.throwArgumentError("apiKey not supported for cloudflare", "apiKey", apiKey);
        }
        return null;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "https://cloudflare-eth.com/";
                break;
            default:
                logger$l.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return host;
    }
    perform(method, params) {
        const _super = Object.create(null, {
            perform: { get: () => super.perform }
        });
        return __awaiter$9(this, void 0, void 0, function* () {
            // The Cloudflare provider does not support eth_blockNumber,
            // so we get the latest block and pull it from that
            if (method === "getBlockNumber") {
                const block = yield _super.perform.call(this, "getBlock", { blockTag: "latest" });
                return block.number;
            }
            return _super.perform.call(this, method, params);
        });
    }
}

var __awaiter$a = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$m = new Logger(version$9);
// The transaction has already been sanitized by the calls in Provider
function getTransactionString(transaction) {
    const result = [];
    for (let key in transaction) {
        if (transaction[key] == null) {
            continue;
        }
        let value = hexlify(transaction[key]);
        if ({ gasLimit: true, gasPrice: true, nonce: true, value: true }[key]) {
            value = hexValue(value);
        }
        result.push(key + "=" + value);
    }
    return result.join("&");
}
function getResult$1(result) {
    // getLogs, getHistory have weird success responses
    if (result.status == 0 && (result.message === "No records found" || result.message === "No transactions found")) {
        return result.result;
    }
    if (result.status != 1 || result.message != "OK") {
        const error = new Error("invalid response");
        error.result = JSON.stringify(result);
        if ((result.result || "").toLowerCase().indexOf("rate limit") >= 0) {
            error.throttleRetry = true;
        }
        throw error;
    }
    return result.result;
}
function getJsonResult(result) {
    // This response indicates we are being throttled
    if (result && result.status == 0 && result.message == "NOTOK" && (result.result || "").toLowerCase().indexOf("rate limit") >= 0) {
        const error = new Error("throttled response");
        error.result = JSON.stringify(result);
        error.throttleRetry = true;
        throw error;
    }
    if (result.jsonrpc != "2.0") {
        // @TODO: not any
        const error = new Error("invalid response");
        error.result = JSON.stringify(result);
        throw error;
    }
    if (result.error) {
        // @TODO: not any
        const error = new Error(result.error.message || "unknown error");
        if (result.error.code) {
            error.code = result.error.code;
        }
        if (result.error.data) {
            error.data = result.error.data;
        }
        throw error;
    }
    return result.result;
}
// The blockTag was normalized as a string by the Provider pre-perform operations
function checkLogTag(blockTag) {
    if (blockTag === "pending") {
        throw new Error("pending not supported");
    }
    if (blockTag === "latest") {
        return blockTag;
    }
    return parseInt(blockTag.substring(2), 16);
}
const defaultApiKey$1 = "9D13ZE7XSBTJ94N9BNJ2MA33VMAY2YPIRB";
class EtherscanProvider extends BaseProvider {
    constructor(network, apiKey) {
        logger$m.checkNew(new.target, EtherscanProvider);
        super(network);
        let name = "invalid";
        if (this.network) {
            name = this.network.name;
        }
        let baseUrl = null;
        switch (name) {
            case "homestead":
                baseUrl = "https://api.etherscan.io";
                break;
            case "ropsten":
                baseUrl = "https://api-ropsten.etherscan.io";
                break;
            case "rinkeby":
                baseUrl = "https://api-rinkeby.etherscan.io";
                break;
            case "kovan":
                baseUrl = "https://api-kovan.etherscan.io";
                break;
            case "goerli":
                baseUrl = "https://api-goerli.etherscan.io";
                break;
            default:
                throw new Error("unsupported network");
        }
        defineReadOnly(this, "baseUrl", baseUrl);
        defineReadOnly(this, "apiKey", apiKey || defaultApiKey$1);
    }
    detectNetwork() {
        return __awaiter$a(this, void 0, void 0, function* () {
            return this.network;
        });
    }
    perform(method, params) {
        const _super = Object.create(null, {
            perform: { get: () => super.perform }
        });
        return __awaiter$a(this, void 0, void 0, function* () {
            let url = this.baseUrl;
            let apiKey = "";
            if (this.apiKey) {
                apiKey += "&apikey=" + this.apiKey;
            }
            const get = (url, procFunc) => __awaiter$a(this, void 0, void 0, function* () {
                this.emit("debug", {
                    action: "request",
                    request: url,
                    provider: this
                });
                const connection = {
                    url: url,
                    throttleSlotInterval: 1000,
                    throttleCallback: (attempt, url) => {
                        if (this.apiKey === defaultApiKey$1) {
                            showThrottleMessage();
                        }
                        return Promise.resolve(true);
                    }
                };
                const result = yield fetchJson(connection, null, procFunc || getJsonResult);
                this.emit("debug", {
                    action: "response",
                    request: url,
                    response: deepCopy(result),
                    provider: this
                });
                return result;
            });
            switch (method) {
                case "getBlockNumber":
                    url += "/api?module=proxy&action=eth_blockNumber" + apiKey;
                    return get(url);
                case "getGasPrice":
                    url += "/api?module=proxy&action=eth_gasPrice" + apiKey;
                    return get(url);
                case "getBalance":
                    // Returns base-10 result
                    url += "/api?module=account&action=balance&address=" + params.address;
                    url += "&tag=" + params.blockTag + apiKey;
                    return get(url, getResult$1);
                case "getTransactionCount":
                    url += "/api?module=proxy&action=eth_getTransactionCount&address=" + params.address;
                    url += "&tag=" + params.blockTag + apiKey;
                    return get(url);
                case "getCode":
                    url += "/api?module=proxy&action=eth_getCode&address=" + params.address;
                    url += "&tag=" + params.blockTag + apiKey;
                    return get(url);
                case "getStorageAt":
                    url += "/api?module=proxy&action=eth_getStorageAt&address=" + params.address;
                    url += "&position=" + params.position;
                    url += "&tag=" + params.blockTag + apiKey;
                    return get(url);
                case "sendTransaction":
                    url += "/api?module=proxy&action=eth_sendRawTransaction&hex=" + params.signedTransaction;
                    url += apiKey;
                    return get(url).catch((error) => {
                        if (error.responseText) {
                            // "Insufficient funds. The account you tried to send transaction from does not have enough funds. Required 21464000000000 and got: 0"
                            if (error.responseText.toLowerCase().indexOf("insufficient funds") >= 0) {
                                logger$m.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, {});
                            }
                            // "Transaction with the same hash was already imported."
                            if (error.responseText.indexOf("same hash was already imported") >= 0) {
                                logger$m.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {});
                            }
                            // "Transaction gas price is too low. There is another transaction with same nonce in the queue. Try increasing the gas price or incrementing the nonce."
                            if (error.responseText.indexOf("another transaction with same nonce") >= 0) {
                                logger$m.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {});
                            }
                        }
                        throw error;
                    });
                case "getBlock":
                    if (params.blockTag) {
                        url += "/api?module=proxy&action=eth_getBlockByNumber&tag=" + params.blockTag;
                        if (params.includeTransactions) {
                            url += "&boolean=true";
                        }
                        else {
                            url += "&boolean=false";
                        }
                        url += apiKey;
                        return get(url);
                    }
                    throw new Error("getBlock by blockHash not implemented");
                case "getTransaction":
                    url += "/api?module=proxy&action=eth_getTransactionByHash&txhash=" + params.transactionHash;
                    url += apiKey;
                    return get(url);
                case "getTransactionReceipt":
                    url += "/api?module=proxy&action=eth_getTransactionReceipt&txhash=" + params.transactionHash;
                    url += apiKey;
                    return get(url);
                case "call": {
                    let transaction = getTransactionString(params.transaction);
                    if (transaction) {
                        transaction = "&" + transaction;
                    }
                    url += "/api?module=proxy&action=eth_call" + transaction;
                    //url += "&tag=" + params.blockTag + apiKey;
                    if (params.blockTag !== "latest") {
                        throw new Error("EtherscanProvider does not support blockTag for call");
                    }
                    url += apiKey;
                    return get(url);
                }
                case "estimateGas": {
                    let transaction = getTransactionString(params.transaction);
                    if (transaction) {
                        transaction = "&" + transaction;
                    }
                    url += "/api?module=proxy&action=eth_estimateGas&" + transaction;
                    url += apiKey;
                    return get(url);
                }
                case "getLogs": {
                    url += "/api?module=logs&action=getLogs";
                    if (params.filter.fromBlock) {
                        url += "&fromBlock=" + checkLogTag(params.filter.fromBlock);
                    }
                    if (params.filter.toBlock) {
                        url += "&toBlock=" + checkLogTag(params.filter.toBlock);
                    }
                    if (params.filter.address) {
                        url += "&address=" + params.filter.address;
                    }
                    // @TODO: We can handle slightly more complicated logs using the logs API
                    if (params.filter.topics && params.filter.topics.length > 0) {
                        if (params.filter.topics.length > 1) {
                            logger$m.throwError("unsupported topic count", Logger.errors.UNSUPPORTED_OPERATION, { topics: params.filter.topics });
                        }
                        if (params.filter.topics.length === 1) {
                            const topic0 = params.filter.topics[0];
                            if (typeof (topic0) !== "string" || topic0.length !== 66) {
                                logger$m.throwError("unsupported topic format", Logger.errors.UNSUPPORTED_OPERATION, { topic0: topic0 });
                            }
                            url += "&topic0=" + topic0;
                        }
                    }
                    url += apiKey;
                    const logs = yield get(url, getResult$1);
                    // Cache txHash => blockHash
                    let txs = {};
                    // Add any missing blockHash to the logs
                    for (let i = 0; i < logs.length; i++) {
                        const log = logs[i];
                        if (log.blockHash != null) {
                            continue;
                        }
                        if (txs[log.transactionHash] == null) {
                            const tx = yield this.getTransaction(log.transactionHash);
                            if (tx) {
                                txs[log.transactionHash] = tx.blockHash;
                            }
                        }
                        log.blockHash = txs[log.transactionHash];
                    }
                    return logs;
                }
                case "getEtherPrice":
                    if (this.network.name !== "homestead") {
                        return 0.0;
                    }
                    url += "/api?module=stats&action=ethprice";
                    url += apiKey;
                    return parseFloat((yield get(url, getResult$1)).ethusd);
            }
            return _super.perform.call(this, method, params);
        });
    }
    // @TODO: Allow startBlock and endBlock to be Promises
    getHistory(addressOrName, startBlock, endBlock) {
        let url = this.baseUrl;
        let apiKey = "";
        if (this.apiKey) {
            apiKey += "&apikey=" + this.apiKey;
        }
        if (startBlock == null) {
            startBlock = 0;
        }
        if (endBlock == null) {
            endBlock = 99999999;
        }
        return this.resolveName(addressOrName).then((address) => {
            url += "/api?module=account&action=txlist&address=" + address;
            url += "&startblock=" + startBlock;
            url += "&endblock=" + endBlock;
            url += "&sort=asc" + apiKey;
            this.emit("debug", {
                action: "request",
                request: url,
                provider: this
            });
            const connection = {
                url: url,
                throttleSlotInterval: 1000,
                throttleCallback: (attempt, url) => {
                    if (this.apiKey === defaultApiKey$1) {
                        showThrottleMessage();
                    }
                    return Promise.resolve(true);
                }
            };
            return fetchJson(connection, null, getResult$1).then((result) => {
                this.emit("debug", {
                    action: "response",
                    request: url,
                    response: deepCopy(result),
                    provider: this
                });
                let output = [];
                result.forEach((tx) => {
                    ["contractAddress", "to"].forEach(function (key) {
                        if (tx[key] == "") {
                            delete tx[key];
                        }
                    });
                    if (tx.creates == null && tx.contractAddress != null) {
                        tx.creates = tx.contractAddress;
                    }
                    let item = this.formatter.transactionResponse(tx);
                    if (tx.timeStamp) {
                        item.timestamp = parseInt(tx.timeStamp);
                    }
                    output.push(item);
                });
                return output;
            });
        });
    }
}

var _version$1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
exports.version = "random/5.0.3";

});

unwrapExports(_version$1);
var _version_1$1 = _version$1.version;

var shuffle = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });
function shuffled(array) {
    array = array.slice();
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = array[i];
        array[i] = array[j];
        array[j] = tmp;
    }
    return array;
}
exports.shuffled = shuffled;

});

unwrapExports(shuffle);
var shuffle_1 = shuffle.shuffled;

var browser$4 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });



var logger = new lib_esm.Logger(_version$1.version);

exports.shuffled = shuffle.shuffled;
var anyGlobal = null;
try {
    anyGlobal = window;
    if (anyGlobal == null) {
        throw new Error("try next");
    }
}
catch (error) {
    try {
        anyGlobal = commonjsGlobal;
        if (anyGlobal == null) {
            throw new Error("try next");
        }
    }
    catch (error) {
        anyGlobal = {};
    }
}
var crypto = anyGlobal.crypto || anyGlobal.msCrypto;
if (!crypto || !crypto.getRandomValues) {
    logger.warn("WARNING: Missing strong random number source");
    crypto = {
        getRandomValues: function (buffer) {
            return logger.throwError("no secure random source avaialble", lib_esm.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "crypto.getRandomValues"
            });
        }
    };
}
function randomBytes(length) {
    if (length <= 0 || length > 1024 || (length % 1)) {
        logger.throwArgumentError("invalid length", "length", length);
    }
    var result = new Uint8Array(length);
    crypto.getRandomValues(result);
    return lib_esm$1.arrayify(result);
}
exports.randomBytes = randomBytes;

});

unwrapExports(browser$4);
var browser_1$1 = browser$4.shuffled;
var browser_2$1 = browser$4.randomBytes;

var __awaiter$b = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const logger$n = new Logger(version$9);
function now() { return (new Date()).getTime(); }
// Returns to network as long as all agree, or null if any is null.
// Throws an error if any two networks do not match.
function checkNetworks(networks) {
    let result = null;
    for (let i = 0; i < networks.length; i++) {
        const network = networks[i];
        // Null! We do not know our network; bail.
        if (network == null) {
            return null;
        }
        if (result) {
            // Make sure the network matches the previous networks
            if (!(result.name === network.name && result.chainId === network.chainId &&
                ((result.ensAddress === network.ensAddress) || (result.ensAddress == null && network.ensAddress == null)))) {
                logger$n.throwArgumentError("provider mismatch", "networks", networks);
            }
        }
        else {
            result = network;
        }
    }
    return result;
}
function median(values, maxDelta) {
    values = values.slice().sort();
    const middle = Math.floor(values.length / 2);
    // Odd length; take the middle
    if (values.length % 2) {
        return values[middle];
    }
    // Even length; take the average of the two middle
    const a = values[middle - 1], b = values[middle];
    if (maxDelta != null && Math.abs(a - b) > maxDelta) {
        return null;
    }
    return (a + b) / 2;
}
function serialize(value) {
    if (value === null) {
        return "null";
    }
    else if (typeof (value) === "number" || typeof (value) === "boolean") {
        return JSON.stringify(value);
    }
    else if (typeof (value) === "string") {
        return value;
    }
    else if (BigNumber.isBigNumber(value)) {
        return value.toString();
    }
    else if (Array.isArray(value)) {
        return JSON.stringify(value.map((i) => serialize(i)));
    }
    else if (typeof (value) === "object") {
        const keys = Object.keys(value);
        keys.sort();
        return "{" + keys.map((key) => {
            let v = value[key];
            if (typeof (v) === "function") {
                v = "[function]";
            }
            else {
                v = serialize(v);
            }
            return JSON.stringify(key) + ":" + v;
        }).join(",") + "}";
    }
    throw new Error("unknown value type: " + typeof (value));
}
// Next request ID to use for emitting debug info
let nextRid = 1;
function stall$1(duration) {
    let cancel = null;
    let timer = null;
    let promise = (new Promise((resolve) => {
        cancel = function () {
            if (timer) {
                clearTimeout(timer);
                timer = null;
            }
            resolve();
        };
        timer = setTimeout(cancel, duration);
    }));
    const wait = (func) => {
        promise = promise.then(func);
        return promise;
    };
    function getPromise() {
        return promise;
    }
    return { cancel, getPromise, wait };
}
function exposeDebugConfig(config, now) {
    const result = {
        provider: config.provider,
        weight: config.weight
    };
    if (config.start) {
        result.start = config.start;
    }
    if (now) {
        result.duration = (now - config.start);
    }
    if (config.done) {
        if (config.error) {
            result.error = config.error;
        }
        else {
            result.result = config.result || null;
        }
    }
    return result;
}
function normalizedTally(normalize, quorum) {
    return function (configs) {
        // Count the votes for each result
        const tally = {};
        configs.forEach((c) => {
            const value = normalize(c.result);
            if (!tally[value]) {
                tally[value] = { count: 0, result: c.result };
            }
            tally[value].count++;
        });
        // Check for a quorum on any given result
        const keys = Object.keys(tally);
        for (let i = 0; i < keys.length; i++) {
            const check = tally[keys[i]];
            if (check.count >= quorum) {
                return check.result;
            }
        }
        // No quroum
        return undefined;
    };
}
function getProcessFunc(provider, method, params) {
    let normalize = serialize;
    switch (method) {
        case "getBlockNumber":
            // Return the median value, unless there is (median + 1) is also
            // present, in which case that is probably true and the median
            // is going to be stale soon. In the event of a malicious node,
            // the lie will be true soon enough.
            return function (configs) {
                const values = configs.map((c) => c.result);
                // Get the median block number
                let blockNumber = median(configs.map((c) => c.result), 2);
                if (blockNumber == null) {
                    return undefined;
                }
                blockNumber = Math.ceil(blockNumber);
                // If the next block height is present, its prolly safe to use
                if (values.indexOf(blockNumber + 1) >= 0) {
                    blockNumber++;
                }
                // Don't ever roll back the blockNumber
                if (blockNumber >= provider._highestBlockNumber) {
                    provider._highestBlockNumber = blockNumber;
                }
                return provider._highestBlockNumber;
            };
        case "getGasPrice":
            // Return the middle (round index up) value, similar to median
            // but do not average even entries and choose the higher.
            // Malicious actors must compromise 50% of the nodes to lie.
            return function (configs) {
                const values = configs.map((c) => c.result);
                values.sort();
                return values[Math.floor(values.length / 2)];
            };
        case "getEtherPrice":
            // Returns the median price. Malicious actors must compromise at
            // least 50% of the nodes to lie (in a meaningful way).
            return function (configs) {
                return median(configs.map((c) => c.result));
            };
        // No additional normalizing required; serialize is enough
        case "getBalance":
        case "getTransactionCount":
        case "getCode":
        case "getStorageAt":
        case "call":
        case "estimateGas":
        case "getLogs":
            break;
        // We drop the confirmations from transactions as it is approximate
        case "getTransaction":
        case "getTransactionReceipt":
            normalize = function (tx) {
                if (tx == null) {
                    return null;
                }
                tx = shallowCopy(tx);
                tx.confirmations = -1;
                return serialize(tx);
            };
            break;
        // We drop the confirmations from transactions as it is approximate
        case "getBlock":
            // We drop the confirmations from transactions as it is approximate
            if (params.includeTransactions) {
                normalize = function (block) {
                    if (block == null) {
                        return null;
                    }
                    block = shallowCopy(block);
                    block.transactions = block.transactions.map((tx) => {
                        tx = shallowCopy(tx);
                        tx.confirmations = -1;
                        return tx;
                    });
                    return serialize(block);
                };
            }
            else {
                normalize = function (block) {
                    if (block == null) {
                        return null;
                    }
                    return serialize(block);
                };
            }
            break;
        default:
            throw new Error("unknown method: " + method);
    }
    // Return the result if and only if the expected quorum is
    // satisfied and agreed upon for the final result.
    return normalizedTally(normalize, provider.quorum);
}
// If we are doing a blockTag query, we need to make sure the backend is
// caught up to the FallbackProvider, before sending a request to it.
function waitForSync(config, blockNumber) {
    return __awaiter$b(this, void 0, void 0, function* () {
        const provider = (config.provider);
        if ((provider.blockNumber != null && provider.blockNumber >= blockNumber) || blockNumber === -1) {
            return provider;
        }
        return poll(() => {
            return new Promise((resolve, reject) => {
                setTimeout(function () {
                    // We are synced
                    if (provider.blockNumber >= blockNumber) {
                        return resolve(provider);
                    }
                    // We're done; just quit
                    if (config.cancelled) {
                        return resolve(null);
                    }
                    // Try again, next block
                    return resolve(undefined);
                }, 0);
            });
        }, { oncePoll: provider });
    });
}
function getRunner(config, currentBlockNumber, method, params) {
    return __awaiter$b(this, void 0, void 0, function* () {
        let provider = config.provider;
        switch (method) {
            case "getBlockNumber":
            case "getGasPrice":
                return provider[method]();
            case "getEtherPrice":
                if (provider.getEtherPrice) {
                    return provider.getEtherPrice();
                }
                break;
            case "getBalance":
            case "getTransactionCount":
            case "getCode":
                if (params.blockTag && isHexString(params.blockTag)) {
                    provider = yield waitForSync(config, currentBlockNumber);
                }
                return provider[method](params.address, params.blockTag || "latest");
            case "getStorageAt":
                if (params.blockTag && isHexString(params.blockTag)) {
                    provider = yield waitForSync(config, currentBlockNumber);
                }
                return provider.getStorageAt(params.address, params.position, params.blockTag || "latest");
            case "getBlock":
                if (params.blockTag && isHexString(params.blockTag)) {
                    provider = yield waitForSync(config, currentBlockNumber);
                }
                return provider[(params.includeTransactions ? "getBlockWithTransactions" : "getBlock")](params.blockTag || params.blockHash);
            case "call":
            case "estimateGas":
                if (params.blockTag && isHexString(params.blockTag)) {
                    provider = yield waitForSync(config, currentBlockNumber);
                }
                return provider[method](params.transaction);
            case "getTransaction":
            case "getTransactionReceipt":
                return provider[method](params.transactionHash);
            case "getLogs": {
                let filter = params.filter;
                if ((filter.fromBlock && isHexString(filter.fromBlock)) || (filter.toBlock && isHexString(filter.toBlock))) {
                    provider = yield waitForSync(config, currentBlockNumber);
                }
                return provider.getLogs(filter);
            }
        }
        return logger$n.throwError("unknown method error", Logger.errors.UNKNOWN_ERROR, {
            method: method,
            params: params
        });
    });
}
class FallbackProvider extends BaseProvider {
    constructor(providers, quorum) {
        logger$n.checkNew(new.target, FallbackProvider);
        if (providers.length === 0) {
            logger$n.throwArgumentError("missing providers", "providers", providers);
        }
        const providerConfigs = providers.map((configOrProvider, index) => {
            if (Provider.isProvider(configOrProvider)) {
                return Object.freeze({ provider: configOrProvider, weight: 1, stallTimeout: 750, priority: 1 });
            }
            const config = shallowCopy(configOrProvider);
            if (config.priority == null) {
                config.priority = 1;
            }
            if (config.stallTimeout == null) {
                config.stallTimeout = 750;
            }
            if (config.weight == null) {
                config.weight = 1;
            }
            const weight = config.weight;
            if (weight % 1 || weight > 512 || weight < 1) {
                logger$n.throwArgumentError("invalid weight; must be integer in [1, 512]", `providers[${index}].weight`, weight);
            }
            return Object.freeze(config);
        });
        const total = providerConfigs.reduce((accum, c) => (accum + c.weight), 0);
        if (quorum == null) {
            quorum = total / 2;
        }
        else if (quorum > total) {
            logger$n.throwArgumentError("quorum will always fail; larger than total weight", "quorum", quorum);
        }
        // Are all providers' networks are known
        let networkOrReady = checkNetworks(providerConfigs.map((c) => (c.provider).network));
        // Not all networks are known; we must stall
        if (networkOrReady == null) {
            networkOrReady = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.detectNetwork().then(resolve, reject);
                }, 0);
            });
        }
        super(networkOrReady);
        // Preserve a copy, so we do not get mutated
        defineReadOnly(this, "providerConfigs", Object.freeze(providerConfigs));
        defineReadOnly(this, "quorum", quorum);
        this._highestBlockNumber = -1;
    }
    detectNetwork() {
        return __awaiter$b(this, void 0, void 0, function* () {
            const networks = yield Promise.all(this.providerConfigs.map((c) => c.provider.getNetwork()));
            return checkNetworks(networks);
        });
    }
    perform(method, params) {
        return __awaiter$b(this, void 0, void 0, function* () {
            // Sending transactions is special; always broadcast it to all backends
            if (method === "sendTransaction") {
                const results = yield Promise.all(this.providerConfigs.map((c) => {
                    return c.provider.sendTransaction(params.signedTransaction).then((result) => {
                        return result.hash;
                    }, (error) => {
                        return error;
                    });
                }));
                // Any success is good enough (other errors are likely "already seen" errors
                for (let i = 0; i < results.length; i++) {
                    const result = results[i];
                    if (typeof (result) === "string") {
                        return result;
                    }
                }
                // They were all an error; pick the first error
                throw results[0];
            }
            // We need to make sure we are in sync with our backends, so we need
            // to know this before we can make a lot of calls
            if (this._highestBlockNumber === -1 && method !== "getBlockNumber") {
                yield this.getBlockNumber();
            }
            const processFunc = getProcessFunc(this, method, params);
            // Shuffle the providers and then sort them by their priority; we
            // shallowCopy them since we will store the result in them too
            const configs = browser_1$1(this.providerConfigs.map(shallowCopy));
            configs.sort((a, b) => (a.priority - b.priority));
            const currentBlockNumber = this._highestBlockNumber;
            let i = 0;
            let first = true;
            while (true) {
                const t0 = now();
                // Compute the inflight weight (exclude anything past)
                let inflightWeight = configs.filter((c) => (c.runner && ((t0 - c.start) < c.stallTimeout)))
                    .reduce((accum, c) => (accum + c.weight), 0);
                // Start running enough to meet quorum
                while (inflightWeight < this.quorum && i < configs.length) {
                    const config = configs[i++];
                    const rid = nextRid++;
                    config.start = now();
                    config.staller = stall$1(config.stallTimeout);
                    config.staller.wait(() => { config.staller = null; });
                    config.runner = getRunner(config, currentBlockNumber, method, params).then((result) => {
                        config.done = true;
                        config.result = result;
                        if (this.listenerCount("debug")) {
                            this.emit("debug", {
                                action: "request",
                                rid: rid,
                                backend: exposeDebugConfig(config, now()),
                                request: { method: method, params: deepCopy(params) },
                                provider: this
                            });
                        }
                    }, (error) => {
                        config.done = true;
                        config.error = error;
                        if (this.listenerCount("debug")) {
                            this.emit("debug", {
                                action: "request",
                                rid: rid,
                                backend: exposeDebugConfig(config, now()),
                                request: { method: method, params: deepCopy(params) },
                                provider: this
                            });
                        }
                    });
                    if (this.listenerCount("debug")) {
                        this.emit("debug", {
                            action: "request",
                            rid: rid,
                            backend: exposeDebugConfig(config, null),
                            request: { method: method, params: deepCopy(params) },
                            provider: this
                        });
                    }
                    inflightWeight += config.weight;
                }
                // Wait for anything meaningful to finish or stall out
                const waiting = [];
                configs.forEach((c) => {
                    if (c.done || !c.runner) {
                        return;
                    }
                    waiting.push(c.runner);
                    if (c.staller) {
                        waiting.push(c.staller.getPromise());
                    }
                });
                if (waiting.length) {
                    yield Promise.race(waiting);
                }
                // Check the quorum and process the results; the process function
                // may additionally decide the quorum is not met
                const results = configs.filter((c) => (c.done && c.error == null));
                if (results.length >= this.quorum) {
                    const result = processFunc(results);
                    if (result !== undefined) {
                        // Shut down any stallers
                        configs.forEach(c => {
                            if (c.staller) {
                                c.staller.cancel();
                            }
                            c.cancelled = true;
                        });
                        return result;
                    }
                    if (!first) {
                        yield stall$1(100).getPromise();
                    }
                    first = false;
                }
                // All configs have run to completion; we will never get more data
                if (configs.filter((c) => !c.done).length === 0) {
                    break;
                }
            }
            // Shut down any stallers; shouldn't be any
            configs.forEach(c => {
                if (c.staller) {
                    c.staller.cancel();
                }
                c.cancelled = true;
            });
            return logger$n.throwError("failed to meet quorum", Logger.errors.SERVER_ERROR, {
                method: method,
                params: params,
                //results: configs.map((c) => c.result),
                //errors: configs.map((c) => c.error),
                results: configs.map((c) => exposeDebugConfig(c)),
                provider: this
            });
        });
    }
}

var browserNet = {};

const logger$o = new Logger(version$9);
class IpcProvider extends JsonRpcProvider {
    constructor(path, network) {
        logger$o.checkNew(new.target, IpcProvider);
        if (path == null) {
            logger$o.throwError("missing path", Logger.errors.MISSING_ARGUMENT, { arg: "path" });
        }
        super("ipc://" + path, network);
        defineReadOnly(this, "path", path);
    }
    // @TODO: Create a connection to the IPC path and use filters instead of polling for block
    send(method, params) {
        // This method is very simple right now. We create a new socket
        // connection each time, which may be slower, but the main
        // advantage we are aiming for now is security. This simplifies
        // multiplexing requests (since we do not need to multiplex).
        let payload = JSON.stringify({
            method: method,
            params: params,
            id: 42,
            jsonrpc: "2.0"
        });
        return new Promise((resolve, reject) => {
            let response = Buffer.alloc(0);
            let stream = browserNet.connect(this.path);
            stream.on("data", (data) => {
                response = Buffer.concat([response, data]);
            });
            stream.on("end", () => {
                try {
                    resolve(JSON.parse(response.toString()).result);
                    // @TODO: Better pull apart the error
                    stream.destroy();
                }
                catch (error) {
                    reject(error);
                    stream.destroy();
                }
            });
            stream.on("error", (error) => {
                reject(error);
                stream.destroy();
            });
            stream.write(payload);
            stream.end();
        });
    }
}

const logger$p = new Logger(version$9);
const defaultProjectId = "84842078b09946638c03157f83405213";
class InfuraProvider extends UrlJsonRpcProvider {
    static getWebSocketProvider(network, apiKey) {
        const provider = new InfuraProvider(network, apiKey);
        const connection = provider.connection;
        if (connection.password) {
            logger$p.throwError("INFURA WebSocket project secrets unsupported", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "InfuraProvider.getWebSocketProvider()"
            });
        }
        const url = connection.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        return new WebSocketProvider(url, network);
    }
    static getApiKey(apiKey) {
        const apiKeyObj = {
            apiKey: defaultProjectId,
            projectId: defaultProjectId,
            projectSecret: null
        };
        if (apiKey == null) {
            return apiKeyObj;
        }
        if (typeof (apiKey) === "string") {
            apiKeyObj.projectId = apiKey;
        }
        else if (apiKey.projectSecret != null) {
            logger$p.assertArgument((typeof (apiKey.projectId) === "string"), "projectSecret requires a projectId", "projectId", apiKey.projectId);
            logger$p.assertArgument((typeof (apiKey.projectSecret) === "string"), "invalid projectSecret", "projectSecret", "[REDACTED]");
            apiKeyObj.projectId = apiKey.projectId;
            apiKeyObj.projectSecret = apiKey.projectSecret;
        }
        else if (apiKey.projectId) {
            apiKeyObj.projectId = apiKey.projectId;
        }
        apiKeyObj.apiKey = apiKeyObj.projectId;
        return apiKeyObj;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "mainnet.infura.io";
                break;
            case "ropsten":
                host = "ropsten.infura.io";
                break;
            case "rinkeby":
                host = "rinkeby.infura.io";
                break;
            case "kovan":
                host = "kovan.infura.io";
                break;
            case "goerli":
                host = "goerli.infura.io";
                break;
            default:
                logger$p.throwError("unsupported network", Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        const connection = {
            url: ("https:/" + "/" + host + "/v3/" + apiKey.projectId),
            throttleCallback: (attempt, url) => {
                if (apiKey.projectId === defaultProjectId) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
        if (apiKey.projectSecret != null) {
            connection.user = "";
            connection.password = apiKey.projectSecret;
        }
        return connection;
    }
}

/* istanbul ignore file */
const logger$q = new Logger(version$9);
// Special API key provided by Nodesmith for ethers.js
const defaultApiKey$2 = "ETHERS_JS_SHARED";
class NodesmithProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        if (apiKey && typeof (apiKey) !== "string") {
            logger$q.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey || defaultApiKey$2;
    }
    static getUrl(network, apiKey) {
        logger$q.warn("NodeSmith will be discontinued on 2019-12-20; please migrate to another platform.");
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "https://ethereum.api.nodesmith.io/v1/mainnet/jsonrpc";
                break;
            case "ropsten":
                host = "https://ethereum.api.nodesmith.io/v1/ropsten/jsonrpc";
                break;
            case "rinkeby":
                host = "https://ethereum.api.nodesmith.io/v1/rinkeby/jsonrpc";
                break;
            case "goerli":
                host = "https://ethereum.api.nodesmith.io/v1/goerli/jsonrpc";
                break;
            case "kovan":
                host = "https://ethereum.api.nodesmith.io/v1/kovan/jsonrpc";
                break;
            default:
                logger$q.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return (host + "?apiKey=" + apiKey);
    }
}

const logger$r = new Logger(version$9);
let _nextId = 1;
function buildWeb3LegacyFetcher(provider, sendFunc) {
    return function (method, params) {
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        const request = {
            method: method,
            params: params,
            id: (_nextId++),
            jsonrpc: "2.0"
        };
        return new Promise((resolve, reject) => {
            sendFunc(request, function (error, result) {
                if (error) {
                    return reject(error);
                }
                if (result.error) {
                    const error = new Error(result.error.message);
                    error.code = result.error.code;
                    error.data = result.error.data;
                    return reject(error);
                }
                resolve(result.result);
            });
        });
    };
}
function buildEip1193Fetcher(provider) {
    return function (method, params) {
        if (params == null) {
            params = [];
        }
        // Metamask complains about eth_sign (and on some versions hangs)
        if (method == "eth_sign" && provider.isMetaMask) {
            // https://github.com/ethereum/go-ethereum/wiki/Management-APIs#personal_sign
            method = "personal_sign";
            params = [params[1], params[0]];
        }
        return provider.request({ method, params });
    };
}
class Web3Provider extends JsonRpcProvider {
    constructor(provider, network) {
        logger$r.checkNew(new.target, Web3Provider);
        if (provider == null) {
            logger$r.throwArgumentError("missing provider", "provider", provider);
        }
        let path = null;
        let jsonRpcFetchFunc = null;
        let subprovider = null;
        if (typeof (provider) === "function") {
            path = "unknown:";
            jsonRpcFetchFunc = provider;
        }
        else {
            path = provider.host || provider.path || "";
            if (!path && provider.isMetaMask) {
                path = "metamask";
            }
            subprovider = provider;
            if (provider.request) {
                if (path === "") {
                    path = "eip-1193:";
                }
                jsonRpcFetchFunc = buildEip1193Fetcher(provider);
            }
            else if (provider.sendAsync) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.sendAsync.bind(provider));
            }
            else if (provider.send) {
                jsonRpcFetchFunc = buildWeb3LegacyFetcher(provider, provider.send.bind(provider));
            }
            else {
                logger$r.throwArgumentError("unsupported provider", "provider", provider);
            }
            if (!path) {
                path = "unknown:";
            }
        }
        super(path, network);
        defineReadOnly(this, "jsonRpcFetchFunc", jsonRpcFetchFunc);
        defineReadOnly(this, "provider", subprovider);
    }
    send(method, params) {
        return this.jsonRpcFetchFunc(method, params);
    }
}

const logger$s = new Logger(version$9);
////////////////////////
// Helper Functions
function getDefaultProvider(network, options) {
    if (network == null) {
        network = "homestead";
    }
    // If passed a URL, figure out the right type of provider based on the scheme
    if (typeof (network) === "string") {
        // @TODO: Add support for IpcProvider; maybe if it ends in ".ipc"?
        // Handle http and ws (and their secure variants)
        const match = network.match(/^(ws|http)s?:/i);
        if (match) {
            switch (match[1]) {
                case "http":
                    return new JsonRpcProvider(network);
                case "ws":
                    return new WebSocketProvider(network);
                default:
                    logger$s.throwArgumentError("unsupported URL scheme", "network", network);
            }
        }
    }
    const n = getNetwork(network);
    if (!n || !n._defaultProvider) {
        logger$s.throwError("unsupported getDefaultProvider network", Logger.errors.NETWORK_ERROR, {
            operation: "getDefaultProvider",
            network: network
        });
    }
    return n._defaultProvider({
        FallbackProvider,
        AlchemyProvider,
        CloudflareProvider,
        EtherscanProvider,
        InfuraProvider,
        JsonRpcProvider,
        NodesmithProvider,
        Web3Provider,
        IpcProvider,
    }, options);
}

var vaultABI = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "delta",
				type: "uint256"
			}
		],
		name: "Add",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address payable[]",
				name: "arrayAsgards",
				type: "address[]"
			}
		],
		name: "AddAsgard",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "Deposit",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				indexed: false,
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "yggdrasil",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "YggdrasilMinus",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: false,
				internalType: "address",
				name: "yggdrasil",
				type: "address"
			},
			{
				indexed: false,
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "YggdrasilPlus",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address payable[]",
				name: "newAsgards",
				type: "address[]"
			}
		],
		name: "addAsgard",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		name: "arrayAsgards",
		outputs: [
			{
				internalType: "address payable",
				name: "",
				type: "address"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "asgardAllowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "asgardTransfer",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "asgards",
		outputs: [
			{
				internalType: "bool",
				name: "",
				type: "bool"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "deposit",
		outputs: [
		],
		stateMutability: "payable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "deposit",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
		],
		name: "getAsgardCount",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "asset",
				type: "address"
			}
		],
		name: "sync",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "yggAllowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "yggdrasilMinus",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "yggdrasil",
				type: "address"
			},
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "yggdrasilPlus",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "address",
				name: "asset",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			},
			{
				internalType: "string",
				name: "memo",
				type: "string"
			}
		],
		name: "yggdrasilTransfer",
		outputs: [
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var erc20ABI = [
	{
		inputs: [
		],
		stateMutability: "nonpayable",
		type: "constructor"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "owner",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Approval",
		type: "event"
	},
	{
		anonymous: false,
		inputs: [
			{
				indexed: true,
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				indexed: true,
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				indexed: false,
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "Transfer",
		type: "event"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			},
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "allowance",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "spender",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "approve",
		outputs: [
			{
				internalType: "bool",
				name: "success",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "",
				type: "address"
			}
		],
		name: "balanceOf",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "decimals",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "name",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "symbol",
		outputs: [
			{
				internalType: "string",
				name: "",
				type: "string"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
		],
		name: "totalSupply",
		outputs: [
			{
				internalType: "uint256",
				name: "",
				type: "uint256"
			}
		],
		stateMutability: "view",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transfer",
		outputs: [
			{
				internalType: "bool",
				name: "success",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	},
	{
		inputs: [
			{
				internalType: "address",
				name: "from",
				type: "address"
			},
			{
				internalType: "address",
				name: "to",
				type: "address"
			},
			{
				internalType: "uint256",
				name: "value",
				type: "uint256"
			}
		],
		name: "transferFrom",
		outputs: [
			{
				internalType: "bool",
				name: "success",
				type: "bool"
			}
		],
		stateMutability: "nonpayable",
		type: "function"
	}
];

var ethAddress = '0x0000000000000000000000000000000000000000';
/**
 * Custom Ethereum client
 * @todo Error handling
 */
var Client = /** @class */ (function () {
    function Client(network, phrase, vault) {
        var _this = this;
        if (network === void 0) { network = Network.TEST; }
        this._vault = null;
        /**
         * changes the wallet eg. when using connect() after init()
         */
        this.changeWallet = function (wallet) {
            return (_this._wallet = wallet);
        };
        if (phrase && !src_6(phrase)) {
            throw new Error('Invalid Phrase');
        }
        else {
            this._phrase = phrase || src_5();
            this._network = network;
            this._provider = getDefaultProvider(network);
            this._wallet = ethers.Wallet.fromMnemonic(this._phrase);
            this._address = this._wallet.address;
            this._balance = 0;
            this._etherscan = new EtherscanProvider(this._network); // for tx history
            if (vault)
                this.setVault(vault);
        }
    }
    /**
     * Getters
     */
    Client.prototype.getAddress = function () {
        return this._address;
    };
    Object.defineProperty(Client.prototype, "wallet", {
        get: function () {
            return this._wallet;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "vault", {
        get: function () {
            return this._vault;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "network", {
        get: function () {
            return this._network;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "provider", {
        get: function () {
            return this._provider;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "balance", {
        get: function () {
            return this._balance;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Client.prototype, "etherscan", {
        // to enable spying on EtherscanProvider.getHistory()
        get: function () {
            return this._etherscan;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * changes the provider
     */
    Client.prototype.EtherscanProvider = function () {
        var newWallet = this.wallet.connect(new EtherscanProvider(this._network));
        this.changeWallet(newWallet);
        return (this._provider = this._wallet.provider);
    };
    /**
     * Connects to the ethereum network with t
     */
    Client.prototype.init = function () {
        var provider = getDefaultProvider(this._network);
        var newWallet = this.wallet.connect(provider);
        this.changeWallet(newWallet);
        return this._wallet;
    };
    /**
     * Set's the current network
     */
    Client.prototype.setNetwork = function (network) {
        if (!network) {
            throw new Error('Wallet must be provided');
        }
        else {
            this._network = network;
            this._provider = getDefaultProvider(network);
            this._etherscan = new EtherscanProvider(network);
            return this._network;
        }
    };
    /**
     * Set's the current vault contract
     */
    Client.prototype.setVault = function (vault) {
        if (!vault) {
            throw new Error('Vault address must be provided');
        }
        else {
            var contract = new ethers.Contract(vault, vaultABI, this._provider);
            this._vault = contract.connect(this.wallet);
            return this._vault;
        }
    };
    /**
     * Generates a new mnemonic / phrase
     */
    Client.generatePhrase = function () {
        return src_5();
    };
    /**
     * Validates a mnemonic phrase
     */
    Client.validatePhrase = function (phrase) {
        return src_6(phrase) ? true : false;
    };
    /**
     * Sets a new phrase (Eg. If user wants to change wallet)
     */
    Client.prototype.setPhrase = function (phrase) {
        if (!Client.validatePhrase(phrase)) {
            throw new Error('Phrase must be provided');
        }
        else {
            this._phrase = phrase;
            var newWallet = ethers.Wallet.fromMnemonic(phrase);
            this.changeWallet(newWallet);
            return true;
        }
    };
    /**
     * Validates an address
     */
    Client.validateAddress = function (address) {
        try {
            getAddress$1(address);
            return true;
        }
        catch (error) {
            return false;
        }
    };
    /**
     * Gets the eth balance of an address
     * @todo add start & end block parameters
     */
    Client.prototype.getBalance = function (address) {
        return __awaiter(this, void 0, void 0, function () {
            var etherString;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(address && !Client.validateAddress(address))) return [3 /*break*/, 1];
                        return [2 /*return*/, Promise.reject('Invalid Address')];
                    case 1: return [4 /*yield*/, this.wallet.provider.getBalance(address || this._address)];
                    case 2:
                        etherString = _a.sent();
                        this._balance = formatEther(etherString);
                        return [2 /*return*/, this._balance];
                }
            });
        });
    };
    /**
     * Gets the erc20 asset balance of an address
     */
    Client.prototype.getERC20Balance = function (asset, address) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, erc20, erc20Balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (address && !Client.validateAddress(address)) {
                            return [2 /*return*/, Promise.reject('Invalid Address')];
                        }
                        if (!Client.validateAddress(asset)) {
                            return [2 /*return*/, Promise.reject('Invalid Asset')];
                        }
                        contract = new ethers.Contract(asset, erc20ABI, this.wallet);
                        erc20 = contract.connect(this.wallet);
                        return [4 /*yield*/, erc20.functions.balanceOf(address || this._address)];
                    case 1:
                        erc20Balance = _a.sent();
                        return [2 /*return*/, erc20Balance];
                }
            });
        });
    };
    /**
     * Gets the current block of the network
     */
    Client.prototype.getBlockNumber = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.wallet.provider.getBlockNumber()];
            });
        });
    };
    /**
     * Returns a Promise that resovles to the number of transactions this account has ever sent (also called the nonce) at the blockTag.
     * @param blocktag A block tag is used to uniquely identify a block’s position in the blockchain:
     * a Number or hex string:
     * Each block has a block number (eg. 42 or "0x2a).
     * “latest”:
     *  The most recently mined block.
     * “pending”:
     *  The block that is currently being mined.
     */
    Client.prototype.getTransactionCount = function (blocktag, address) {
        if (blocktag === void 0) { blocktag = 'latest'; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.provider.getTransactionCount(address || this.getAddress(), blocktag)];
            });
        });
    };
    /**
     * Gets the transaction history of an address.
     */
    Client.prototype.getTransactions = function (address) {
        if (address === void 0) { address = this._address; }
        return __awaiter(this, void 0, void 0, function () {
            var transactions;
            return __generator(this, function (_a) {
                if (address && !Client.validateAddress(address)) {
                    return [2 /*return*/, Promise.reject('Invalid Address')];
                }
                else {
                    transactions = this._etherscan.getHistory(address);
                    return [2 /*return*/, transactions];
                }
            });
        });
    };
    /**
     * Sends a transaction to the vault
     */
    Client.prototype.vaultTx = function (asset, amount, memo) {
        return __awaiter(this, void 0, void 0, function () {
            var contract, erc20, allowance, approved, deposit;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.vault) {
                            return [2 /*return*/, Promise.reject('vault has to be set before sending vault tx')];
                        }
                        if (!(asset.toString() == ethAddress)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.vault.deposit(toUtf8String(memo), { value: amount })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        contract = new ethers.Contract(asset, erc20ABI, this.provider);
                        erc20 = contract.connect(this.wallet);
                        return [4 /*yield*/, erc20.allowance(this.vault.address, { from: this.wallet.address })];
                    case 3:
                        allowance = _a.sent();
                        if (!(formatEther(allowance) < amount)) return [3 /*break*/, 6];
                        return [4 /*yield*/, erc20.approve(this.vault.address, amount, { from: this.wallet.address })];
                    case 4:
                        approved = _a.sent();
                        return [4 /*yield*/, approved.wait()];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [4 /*yield*/, this.vault.deposit(asset, amount, toUtf8String(memo))];
                    case 7:
                        deposit = _a.sent();
                        return [4 /*yield*/, deposit.wait()];
                    case 8: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Returns the estimate gas for a normal transaction
     * @param params NormalTxOpts  transaction options
     */
    Client.prototype.estimateNormalTx = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var addressTo, amount, overrides, transactionRequest;
            return __generator(this, function (_a) {
                addressTo = params.addressTo, amount = params.amount, overrides = params.overrides;
                transactionRequest = Object.assign({ to: addressTo, value: amount }, overrides || {});
                return [2 /*return*/, this.wallet.provider.estimateGas(transactionRequest)];
            });
        });
    };
    /**
     * Sends a transaction in ether
     */
    Client.prototype.normalTx = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var addressTo, amount, overrides, transactionRequest, transactionResponse;
            return __generator(this, function (_a) {
                addressTo = params.addressTo, amount = params.amount, overrides = params.overrides;
                transactionRequest = Object.assign({ to: addressTo, value: amount }, overrides || {});
                transactionResponse = this.wallet.sendTransaction(transactionRequest);
                return [2 /*return*/, transactionResponse];
            });
        });
    };
    /**
     * Returns a promise with the gas estimate to the function call `transfer` of a contract
     * that follows the ERC20 interfaces
     **/
    Client.prototype.estimateGasERC20Tx = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var erc20ContractAddress, addressTo, amount, contract, erc20;
            return __generator(this, function (_a) {
                erc20ContractAddress = params.erc20ContractAddress, addressTo = params.addressTo, amount = params.amount;
                if (addressTo && !Client.validateAddress(addressTo)) {
                    return [2 /*return*/, Promise.reject('Invalid Address')];
                }
                if (!Client.validateAddress(erc20ContractAddress)) {
                    return [2 /*return*/, Promise.reject('Invalid ERC20 Contract Address')];
                }
                contract = new ethers.Contract(erc20ContractAddress, erc20ABI, this.wallet);
                erc20 = contract.connect(this.wallet);
                return [2 /*return*/, erc20.estimate.transfer(addressTo, amount)];
            });
        });
    };
    /**
     * Returns a promise with the `TransactionResponse` of the erc20 transfer
     */
    Client.prototype.erc20Tx = function (params) {
        return __awaiter(this, void 0, void 0, function () {
            var erc20ContractAddress, addressTo, amount, overrides, contract, erc20, transactionOverrides;
            return __generator(this, function (_a) {
                erc20ContractAddress = params.erc20ContractAddress, addressTo = params.addressTo, amount = params.amount, overrides = params.overrides;
                if (addressTo && !Client.validateAddress(addressTo)) {
                    return [2 /*return*/, Promise.reject('Invalid Address')];
                }
                if (!Client.validateAddress(erc20ContractAddress)) {
                    return [2 /*return*/, Promise.reject('Invalid ERC20 Contract Address')];
                }
                contract = new ethers.Contract(erc20ContractAddress, erc20ABI, this.wallet);
                erc20 = contract.connect(this.wallet);
                transactionOverrides = Object.assign({}, overrides || {});
                return [2 /*return*/, erc20.transfer(addressTo, amount, transactionOverrides)];
            });
        });
    };
    return Client;
}());

export { Client, Network };
//# sourceMappingURL=index.esm.js.map
