'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var buffer = _interopDefault(require('buffer'));
var events = _interopDefault(require('events'));
var stream = _interopDefault(require('stream'));
var string_decoder$1 = _interopDefault(require('string_decoder'));
var javascriptSdk = require('@binance-chain/javascript-sdk');
var client = require('@binance-chain/javascript-sdk/lib/client');

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
/*! safe-buffer. MIT License. Feross Aboukhadijeh <https://feross.org/opensource> */
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

var streamBrowser = events.EventEmitter;

var _nodeResolve_empty = {};

var _nodeResolve_empty$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': _nodeResolve_empty
});

var debugUtil = getCjsExportFromNamespace(_nodeResolve_empty$1);

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Buffer$1 = buffer.Buffer;

var inspect = debugUtil.inspect;

var custom = inspect && inspect.custom || 'inspect';

function copyBuffer(src, target, offset) {
  Buffer$1.prototype.copy.call(src, target, offset);
}

var buffer_list =
/*#__PURE__*/
function () {
  function BufferList() {
    _classCallCheck(this, BufferList);

    this.head = null;
    this.tail = null;
    this.length = 0;
  }

  _createClass(BufferList, [{
    key: "push",
    value: function push(v) {
      var entry = {
        data: v,
        next: null
      };
      if (this.length > 0) this.tail.next = entry;else this.head = entry;
      this.tail = entry;
      ++this.length;
    }
  }, {
    key: "unshift",
    value: function unshift(v) {
      var entry = {
        data: v,
        next: this.head
      };
      if (this.length === 0) this.tail = entry;
      this.head = entry;
      ++this.length;
    }
  }, {
    key: "shift",
    value: function shift() {
      if (this.length === 0) return;
      var ret = this.head.data;
      if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
      --this.length;
      return ret;
    }
  }, {
    key: "clear",
    value: function clear() {
      this.head = this.tail = null;
      this.length = 0;
    }
  }, {
    key: "join",
    value: function join(s) {
      if (this.length === 0) return '';
      var p = this.head;
      var ret = '' + p.data;

      while (p = p.next) {
        ret += s + p.data;
      }

      return ret;
    }
  }, {
    key: "concat",
    value: function concat(n) {
      if (this.length === 0) return Buffer$1.alloc(0);
      var ret = Buffer$1.allocUnsafe(n >>> 0);
      var p = this.head;
      var i = 0;

      while (p) {
        copyBuffer(p.data, ret, i);
        i += p.data.length;
        p = p.next;
      }

      return ret;
    } // Consumes a specified amount of bytes or characters from the buffered data.

  }, {
    key: "consume",
    value: function consume(n, hasStrings) {
      var ret;

      if (n < this.head.data.length) {
        // `slice` is the same for buffers and strings.
        ret = this.head.data.slice(0, n);
        this.head.data = this.head.data.slice(n);
      } else if (n === this.head.data.length) {
        // First chunk is a perfect match.
        ret = this.shift();
      } else {
        // Result spans more than one buffer.
        ret = hasStrings ? this._getString(n) : this._getBuffer(n);
      }

      return ret;
    }
  }, {
    key: "first",
    value: function first() {
      return this.head.data;
    } // Consumes a specified amount of characters from the buffered data.

  }, {
    key: "_getString",
    value: function _getString(n) {
      var p = this.head;
      var c = 1;
      var ret = p.data;
      n -= ret.length;

      while (p = p.next) {
        var str = p.data;
        var nb = n > str.length ? str.length : n;
        if (nb === str.length) ret += str;else ret += str.slice(0, n);
        n -= nb;

        if (n === 0) {
          if (nb === str.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = str.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Consumes a specified amount of bytes from the buffered data.

  }, {
    key: "_getBuffer",
    value: function _getBuffer(n) {
      var ret = Buffer$1.allocUnsafe(n);
      var p = this.head;
      var c = 1;
      p.data.copy(ret);
      n -= p.data.length;

      while (p = p.next) {
        var buf = p.data;
        var nb = n > buf.length ? buf.length : n;
        buf.copy(ret, ret.length - n, 0, nb);
        n -= nb;

        if (n === 0) {
          if (nb === buf.length) {
            ++c;
            if (p.next) this.head = p.next;else this.head = this.tail = null;
          } else {
            this.head = p;
            p.data = buf.slice(nb);
          }

          break;
        }

        ++c;
      }

      this.length -= c;
      return ret;
    } // Make sure the linked list only shows the minimal necessary information.

  }, {
    key: custom,
    value: function value(_, options) {
      return inspect(this, _objectSpread({}, options, {
        // Only inspect one level.
        depth: 0,
        // It should not recurse.
        customInspect: false
      }));
    }
  }]);

  return BufferList;
}();

function destroy(err, cb) {
  var _this = this;

  var readableDestroyed = this._readableState && this._readableState.destroyed;
  var writableDestroyed = this._writableState && this._writableState.destroyed;

  if (readableDestroyed || writableDestroyed) {
    if (cb) {
      cb(err);
    } else if (err) {
      if (!this._writableState) {
        process.nextTick(emitErrorNT, this, err);
      } else if (!this._writableState.errorEmitted) {
        this._writableState.errorEmitted = true;
        process.nextTick(emitErrorNT, this, err);
      }
    }

    return this;
  } // we set destroyed to true before firing error callbacks in order
  // to make it re-entrance safe in case destroy() is called within callbacks


  if (this._readableState) {
    this._readableState.destroyed = true;
  } // if this is a duplex stream mark the writable part as destroyed as well


  if (this._writableState) {
    this._writableState.destroyed = true;
  }

  this._destroy(err || null, function (err) {
    if (!cb && err) {
      if (!_this._writableState) {
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else if (!_this._writableState.errorEmitted) {
        _this._writableState.errorEmitted = true;
        process.nextTick(emitErrorAndCloseNT, _this, err);
      } else {
        process.nextTick(emitCloseNT, _this);
      }
    } else if (cb) {
      process.nextTick(emitCloseNT, _this);
      cb(err);
    } else {
      process.nextTick(emitCloseNT, _this);
    }
  });

  return this;
}

function emitErrorAndCloseNT(self, err) {
  emitErrorNT(self, err);
  emitCloseNT(self);
}

function emitCloseNT(self) {
  if (self._writableState && !self._writableState.emitClose) return;
  if (self._readableState && !self._readableState.emitClose) return;
  self.emit('close');
}

function undestroy() {
  if (this._readableState) {
    this._readableState.destroyed = false;
    this._readableState.reading = false;
    this._readableState.ended = false;
    this._readableState.endEmitted = false;
  }

  if (this._writableState) {
    this._writableState.destroyed = false;
    this._writableState.ended = false;
    this._writableState.ending = false;
    this._writableState.finalCalled = false;
    this._writableState.prefinished = false;
    this._writableState.finished = false;
    this._writableState.errorEmitted = false;
  }
}

function emitErrorNT(self, err) {
  self.emit('error', err);
}

function errorOrDestroy(stream, err) {
  // We have tests that rely on errors being emitted
  // in the same tick, so changing this is semver major.
  // For now when you opt-in to autoDestroy we allow
  // the error to be emitted nextTick. In a future
  // semver major update we should change the default to this.
  var rState = stream._readableState;
  var wState = stream._writableState;
  if (rState && rState.autoDestroy || wState && wState.autoDestroy) stream.destroy(err);else stream.emit('error', err);
}

var destroy_1 = {
  destroy: destroy,
  undestroy: undestroy,
  errorOrDestroy: errorOrDestroy
};

function _inheritsLoose(subClass, superClass) { subClass.prototype = Object.create(superClass.prototype); subClass.prototype.constructor = subClass; subClass.__proto__ = superClass; }

var codes = {};

function createErrorType(code, message, Base) {
  if (!Base) {
    Base = Error;
  }

  function getMessage(arg1, arg2, arg3) {
    if (typeof message === 'string') {
      return message;
    } else {
      return message(arg1, arg2, arg3);
    }
  }

  var NodeError =
  /*#__PURE__*/
  function (_Base) {
    _inheritsLoose(NodeError, _Base);

    function NodeError(arg1, arg2, arg3) {
      return _Base.call(this, getMessage(arg1, arg2, arg3)) || this;
    }

    return NodeError;
  }(Base);

  NodeError.prototype.name = Base.name;
  NodeError.prototype.code = code;
  codes[code] = NodeError;
} // https://github.com/nodejs/node/blob/v10.8.0/lib/internal/errors.js


function oneOf(expected, thing) {
  if (Array.isArray(expected)) {
    var len = expected.length;
    expected = expected.map(function (i) {
      return String(i);
    });

    if (len > 2) {
      return "one of ".concat(thing, " ").concat(expected.slice(0, len - 1).join(', '), ", or ") + expected[len - 1];
    } else if (len === 2) {
      return "one of ".concat(thing, " ").concat(expected[0], " or ").concat(expected[1]);
    } else {
      return "of ".concat(thing, " ").concat(expected[0]);
    }
  } else {
    return "of ".concat(thing, " ").concat(String(expected));
  }
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith


function startsWith(str, search, pos) {
  return str.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/endsWith


function endsWith(str, search, this_len) {
  if (this_len === undefined || this_len > str.length) {
    this_len = str.length;
  }

  return str.substring(this_len - search.length, this_len) === search;
} // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/includes


function includes(str, search, start) {
  if (typeof start !== 'number') {
    start = 0;
  }

  if (start + search.length > str.length) {
    return false;
  } else {
    return str.indexOf(search, start) !== -1;
  }
}

createErrorType('ERR_INVALID_OPT_VALUE', function (name, value) {
  return 'The value "' + value + '" is invalid for option "' + name + '"';
}, TypeError);
createErrorType('ERR_INVALID_ARG_TYPE', function (name, expected, actual) {
  // determiner: 'must be' or 'must not be'
  var determiner;

  if (typeof expected === 'string' && startsWith(expected, 'not ')) {
    determiner = 'must not be';
    expected = expected.replace(/^not /, '');
  } else {
    determiner = 'must be';
  }

  var msg;

  if (endsWith(name, ' argument')) {
    // For cases like 'first argument'
    msg = "The ".concat(name, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  } else {
    var type = includes(name, '.') ? 'property' : 'argument';
    msg = "The \"".concat(name, "\" ").concat(type, " ").concat(determiner, " ").concat(oneOf(expected, 'type'));
  }

  msg += ". Received type ".concat(typeof actual);
  return msg;
}, TypeError);
createErrorType('ERR_STREAM_PUSH_AFTER_EOF', 'stream.push() after EOF');
createErrorType('ERR_METHOD_NOT_IMPLEMENTED', function (name) {
  return 'The ' + name + ' method is not implemented';
});
createErrorType('ERR_STREAM_PREMATURE_CLOSE', 'Premature close');
createErrorType('ERR_STREAM_DESTROYED', function (name) {
  return 'Cannot call ' + name + ' after a stream was destroyed';
});
createErrorType('ERR_MULTIPLE_CALLBACK', 'Callback called multiple times');
createErrorType('ERR_STREAM_CANNOT_PIPE', 'Cannot pipe, not readable');
createErrorType('ERR_STREAM_WRITE_AFTER_END', 'write after end');
createErrorType('ERR_STREAM_NULL_VALUES', 'May not write null values to stream', TypeError);
createErrorType('ERR_UNKNOWN_ENCODING', function (arg) {
  return 'Unknown encoding: ' + arg;
}, TypeError);
createErrorType('ERR_STREAM_UNSHIFT_AFTER_END_EVENT', 'stream.unshift() after end event');
var codes_1 = codes;

var errorsBrowser = {
	codes: codes_1
};

var ERR_INVALID_OPT_VALUE = errorsBrowser.codes.ERR_INVALID_OPT_VALUE;

function highWaterMarkFrom(options, isDuplex, duplexKey) {
  return options.highWaterMark != null ? options.highWaterMark : isDuplex ? options[duplexKey] : null;
}

function getHighWaterMark(state, options, duplexKey, isDuplex) {
  var hwm = highWaterMarkFrom(options, isDuplex, duplexKey);

  if (hwm != null) {
    if (!(isFinite(hwm) && Math.floor(hwm) === hwm) || hwm < 0) {
      var name = isDuplex ? duplexKey : 'highWaterMark';
      throw new ERR_INVALID_OPT_VALUE(name, hwm);
    }

    return Math.floor(hwm);
  } // Default value


  return state.objectMode ? 16 : 16 * 1024;
}

var state = {
  getHighWaterMark: getHighWaterMark
};

/**
 * Module exports.
 */

var browser = deprecate;

/**
 * Mark that a method should not be used.
 * Returns a modified function which warns once by default.
 *
 * If `localStorage.noDeprecation = true` is set, then it is a no-op.
 *
 * If `localStorage.throwDeprecation = true` is set, then deprecated functions
 * will throw an Error when invoked.
 *
 * If `localStorage.traceDeprecation = true` is set, then deprecated functions
 * will invoke `console.trace()` instead of `console.error()`.
 *
 * @param {Function} fn - the function to deprecate
 * @param {String} msg - the string to print to the console when `fn` is invoked
 * @returns {Function} a new "deprecated" version of `fn`
 * @api public
 */

function deprecate (fn, msg) {
  if (config('noDeprecation')) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (config('throwDeprecation')) {
        throw new Error(msg);
      } else if (config('traceDeprecation')) {
        console.trace(msg);
      } else {
        console.warn(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
}

/**
 * Checks `localStorage` for boolean values for the given `name`.
 *
 * @param {String} name
 * @returns {Boolean}
 * @api private
 */

function config (name) {
  // accessing global.localStorage can trigger a DOMException in sandboxed iframes
  try {
    if (!commonjsGlobal.localStorage) return false;
  } catch (_) {
    return false;
  }
  var val = commonjsGlobal.localStorage[name];
  if (null == val) return false;
  return String(val).toLowerCase() === 'true';
}

var _stream_writable = Writable;
// there will be only 2 of these for each stream


function CorkedRequest(state) {
  var _this = this;

  this.next = null;
  this.entry = null;

  this.finish = function () {
    onCorkedFinish(_this, state);
  };
}
/* </replacement> */

/*<replacement>*/


var Duplex;
/*</replacement>*/

Writable.WritableState = WritableState;
/*<replacement>*/

var internalUtil = {
  deprecate: browser
};
/*</replacement>*/

/*<replacement>*/


/*</replacement>*/


var Buffer$2 = buffer.Buffer;

var OurUint8Array = commonjsGlobal.Uint8Array || function () {};

function _uint8ArrayToBuffer(chunk) {
  return Buffer$2.from(chunk);
}

function _isUint8Array(obj) {
  return Buffer$2.isBuffer(obj) || obj instanceof OurUint8Array;
}



var getHighWaterMark$1 = state.getHighWaterMark;

var _require$codes = errorsBrowser.codes,
    ERR_INVALID_ARG_TYPE = _require$codes.ERR_INVALID_ARG_TYPE,
    ERR_METHOD_NOT_IMPLEMENTED = _require$codes.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK = _require$codes.ERR_MULTIPLE_CALLBACK,
    ERR_STREAM_CANNOT_PIPE = _require$codes.ERR_STREAM_CANNOT_PIPE,
    ERR_STREAM_DESTROYED = _require$codes.ERR_STREAM_DESTROYED,
    ERR_STREAM_NULL_VALUES = _require$codes.ERR_STREAM_NULL_VALUES,
    ERR_STREAM_WRITE_AFTER_END = _require$codes.ERR_STREAM_WRITE_AFTER_END,
    ERR_UNKNOWN_ENCODING = _require$codes.ERR_UNKNOWN_ENCODING;

var errorOrDestroy$1 = destroy_1.errorOrDestroy;

inherits_browser(Writable, streamBrowser);

function nop() {}

function WritableState(options, stream, isDuplex) {
  Duplex = Duplex || _stream_duplex;
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream,
  // e.g. options.readableObjectMode vs. options.writableObjectMode, etc.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex; // object stream flag to indicate whether or not this stream
  // contains buffers or objects.

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.writableObjectMode; // the point at which write() starts returning false
  // Note: 0 is a valid value, means that we always return false if
  // the entire buffer is not flushed immediately on write()

  this.highWaterMark = getHighWaterMark$1(this, options, 'writableHighWaterMark', isDuplex); // if _final has been called

  this.finalCalled = false; // drain event flag.

  this.needDrain = false; // at the start of calling end()

  this.ending = false; // when end() has been called, and returned

  this.ended = false; // when 'finish' is emitted

  this.finished = false; // has it been destroyed

  this.destroyed = false; // should we decode strings into buffers before passing to _write?
  // this is here so that some node-core streams can optimize string
  // handling at a lower level.

  var noDecode = options.decodeStrings === false;
  this.decodeStrings = !noDecode; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // not an actual buffer we keep track of, but a measurement
  // of how much we're waiting to get pushed to some underlying
  // socket or file.

  this.length = 0; // a flag to see when we're in the middle of a write.

  this.writing = false; // when true all writes will be buffered until .uncork() call

  this.corked = 0; // a flag to be able to tell if the onwrite cb is called immediately,
  // or on a later tick.  We set this to true at first, because any
  // actions that shouldn't happen until "later" should generally also
  // not happen before the first write call.

  this.sync = true; // a flag to know if we're processing previously buffered items, which
  // may call the _write() callback in the same tick, so that we don't
  // end up in an overlapped onwrite situation.

  this.bufferProcessing = false; // the callback that's passed to _write(chunk,cb)

  this.onwrite = function (er) {
    onwrite(stream, er);
  }; // the callback that the user supplies to write(chunk,encoding,cb)


  this.writecb = null; // the amount that is being written when _write is called.

  this.writelen = 0;
  this.bufferedRequest = null;
  this.lastBufferedRequest = null; // number of pending user-supplied write callbacks
  // this must be 0 before 'finish' can be emitted

  this.pendingcb = 0; // emit prefinish if the only thing we're waiting for is _write cbs
  // This is relevant for synchronous Transform streams

  this.prefinished = false; // True if the error was already emitted and should not be thrown again

  this.errorEmitted = false; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'finish' (and potentially 'end')

  this.autoDestroy = !!options.autoDestroy; // count buffered requests

  this.bufferedRequestCount = 0; // allocate the first CorkedRequest, there is always
  // one allocated and free to use, and we maintain at most two

  this.corkedRequestsFree = new CorkedRequest(this);
}

WritableState.prototype.getBuffer = function getBuffer() {
  var current = this.bufferedRequest;
  var out = [];

  while (current) {
    out.push(current);
    current = current.next;
  }

  return out;
};

(function () {
  try {
    Object.defineProperty(WritableState.prototype, 'buffer', {
      get: internalUtil.deprecate(function writableStateBufferGetter() {
        return this.getBuffer();
      }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.', 'DEP0003')
    });
  } catch (_) {}
})(); // Test _writableState for inheritance to account for Duplex streams,
// whose prototype chain only points to Readable.


var realHasInstance;

if (typeof Symbol === 'function' && Symbol.hasInstance && typeof Function.prototype[Symbol.hasInstance] === 'function') {
  realHasInstance = Function.prototype[Symbol.hasInstance];
  Object.defineProperty(Writable, Symbol.hasInstance, {
    value: function value(object) {
      if (realHasInstance.call(this, object)) return true;
      if (this !== Writable) return false;
      return object && object._writableState instanceof WritableState;
    }
  });
} else {
  realHasInstance = function realHasInstance(object) {
    return object instanceof this;
  };
}

function Writable(options) {
  Duplex = Duplex || _stream_duplex; // Writable ctor is applied to Duplexes, too.
  // `realHasInstance` is necessary because using plain `instanceof`
  // would return false, as no `_writableState` property is attached.
  // Trying to use the custom `instanceof` for Writable here will also break the
  // Node.js LazyTransform implementation, which has a non-trivial getter for
  // `_writableState` that would lead to infinite recursion.
  // Checking for a Stream.Duplex instance is faster here instead of inside
  // the WritableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex;
  if (!isDuplex && !realHasInstance.call(Writable, this)) return new Writable(options);
  this._writableState = new WritableState(options, this, isDuplex); // legacy.

  this.writable = true;

  if (options) {
    if (typeof options.write === 'function') this._write = options.write;
    if (typeof options.writev === 'function') this._writev = options.writev;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
    if (typeof options.final === 'function') this._final = options.final;
  }

  streamBrowser.call(this);
} // Otherwise people can pipe Writable streams, which is just wrong.


Writable.prototype.pipe = function () {
  errorOrDestroy$1(this, new ERR_STREAM_CANNOT_PIPE());
};

function writeAfterEnd(stream, cb) {
  var er = new ERR_STREAM_WRITE_AFTER_END(); // TODO: defer error events consistently everywhere, not just the cb

  errorOrDestroy$1(stream, er);
  process.nextTick(cb, er);
} // Checks that a user-supplied chunk is valid, especially for the particular
// mode the stream is in. Currently this means that `null` is never accepted
// and undefined/non-string values are only allowed in object mode.


function validChunk(stream, state, chunk, cb) {
  var er;

  if (chunk === null) {
    er = new ERR_STREAM_NULL_VALUES();
  } else if (typeof chunk !== 'string' && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE('chunk', ['string', 'Buffer'], chunk);
  }

  if (er) {
    errorOrDestroy$1(stream, er);
    process.nextTick(cb, er);
    return false;
  }

  return true;
}

Writable.prototype.write = function (chunk, encoding, cb) {
  var state = this._writableState;
  var ret = false;

  var isBuf = !state.objectMode && _isUint8Array(chunk);

  if (isBuf && !Buffer$2.isBuffer(chunk)) {
    chunk = _uint8ArrayToBuffer(chunk);
  }

  if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (isBuf) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;
  if (typeof cb !== 'function') cb = nop;
  if (state.ending) writeAfterEnd(this, cb);else if (isBuf || validChunk(this, state, chunk, cb)) {
    state.pendingcb++;
    ret = writeOrBuffer(this, state, isBuf, chunk, encoding, cb);
  }
  return ret;
};

Writable.prototype.cork = function () {
  this._writableState.corked++;
};

Writable.prototype.uncork = function () {
  var state = this._writableState;

  if (state.corked) {
    state.corked--;
    if (!state.writing && !state.corked && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
  }
};

Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
  // node::ParseEncoding() requires lower case.
  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new ERR_UNKNOWN_ENCODING(encoding);
  this._writableState.defaultEncoding = encoding;
  return this;
};

Object.defineProperty(Writable.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});

function decodeChunk(state, chunk, encoding) {
  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
    chunk = Buffer$2.from(chunk, encoding);
  }

  return chunk;
}

Object.defineProperty(Writable.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
}); // if we're already writing something, then just put this
// in the queue, and wait our turn.  Otherwise, call _write
// If we return false, then we need a drain event, so set that flag.

function writeOrBuffer(stream, state, isBuf, chunk, encoding, cb) {
  if (!isBuf) {
    var newChunk = decodeChunk(state, chunk, encoding);

    if (chunk !== newChunk) {
      isBuf = true;
      encoding = 'buffer';
      chunk = newChunk;
    }
  }

  var len = state.objectMode ? 1 : chunk.length;
  state.length += len;
  var ret = state.length < state.highWaterMark; // we must ensure that previous needDrain will not be reset to false.

  if (!ret) state.needDrain = true;

  if (state.writing || state.corked) {
    var last = state.lastBufferedRequest;
    state.lastBufferedRequest = {
      chunk: chunk,
      encoding: encoding,
      isBuf: isBuf,
      callback: cb,
      next: null
    };

    if (last) {
      last.next = state.lastBufferedRequest;
    } else {
      state.bufferedRequest = state.lastBufferedRequest;
    }

    state.bufferedRequestCount += 1;
  } else {
    doWrite(stream, state, false, len, chunk, encoding, cb);
  }

  return ret;
}

function doWrite(stream, state, writev, len, chunk, encoding, cb) {
  state.writelen = len;
  state.writecb = cb;
  state.writing = true;
  state.sync = true;
  if (state.destroyed) state.onwrite(new ERR_STREAM_DESTROYED('write'));else if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
  state.sync = false;
}

function onwriteError(stream, state, sync, er, cb) {
  --state.pendingcb;

  if (sync) {
    // defer the callback if we are being called synchronously
    // to avoid piling up things on the stack
    process.nextTick(cb, er); // this can emit finish, and it will always happen
    // after error

    process.nextTick(finishMaybe, stream, state);
    stream._writableState.errorEmitted = true;
    errorOrDestroy$1(stream, er);
  } else {
    // the caller expect this to happen before if
    // it is async
    cb(er);
    stream._writableState.errorEmitted = true;
    errorOrDestroy$1(stream, er); // this can emit finish, but finish must
    // always follow error

    finishMaybe(stream, state);
  }
}

function onwriteStateUpdate(state) {
  state.writing = false;
  state.writecb = null;
  state.length -= state.writelen;
  state.writelen = 0;
}

function onwrite(stream, er) {
  var state = stream._writableState;
  var sync = state.sync;
  var cb = state.writecb;
  if (typeof cb !== 'function') throw new ERR_MULTIPLE_CALLBACK();
  onwriteStateUpdate(state);
  if (er) onwriteError(stream, state, sync, er, cb);else {
    // Check if we're actually ready to finish, but don't emit yet
    var finished = needFinish(state) || stream.destroyed;

    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
      clearBuffer(stream, state);
    }

    if (sync) {
      process.nextTick(afterWrite, stream, state, finished, cb);
    } else {
      afterWrite(stream, state, finished, cb);
    }
  }
}

function afterWrite(stream, state, finished, cb) {
  if (!finished) onwriteDrain(stream, state);
  state.pendingcb--;
  cb();
  finishMaybe(stream, state);
} // Must force callback to be called on nextTick, so that we don't
// emit 'drain' before the write() consumer gets the 'false' return
// value, and has a chance to attach a 'drain' listener.


function onwriteDrain(stream, state) {
  if (state.length === 0 && state.needDrain) {
    state.needDrain = false;
    stream.emit('drain');
  }
} // if there's something in the buffer waiting, then process it


function clearBuffer(stream, state) {
  state.bufferProcessing = true;
  var entry = state.bufferedRequest;

  if (stream._writev && entry && entry.next) {
    // Fast case, write everything using _writev()
    var l = state.bufferedRequestCount;
    var buffer = new Array(l);
    var holder = state.corkedRequestsFree;
    holder.entry = entry;
    var count = 0;
    var allBuffers = true;

    while (entry) {
      buffer[count] = entry;
      if (!entry.isBuf) allBuffers = false;
      entry = entry.next;
      count += 1;
    }

    buffer.allBuffers = allBuffers;
    doWrite(stream, state, true, state.length, buffer, '', holder.finish); // doWrite is almost always async, defer these to save a bit of time
    // as the hot path ends with doWrite

    state.pendingcb++;
    state.lastBufferedRequest = null;

    if (holder.next) {
      state.corkedRequestsFree = holder.next;
      holder.next = null;
    } else {
      state.corkedRequestsFree = new CorkedRequest(state);
    }

    state.bufferedRequestCount = 0;
  } else {
    // Slow case, write chunks one-by-one
    while (entry) {
      var chunk = entry.chunk;
      var encoding = entry.encoding;
      var cb = entry.callback;
      var len = state.objectMode ? 1 : chunk.length;
      doWrite(stream, state, false, len, chunk, encoding, cb);
      entry = entry.next;
      state.bufferedRequestCount--; // if we didn't call the onwrite immediately, then
      // it means that we need to wait until it does.
      // also, that means that the chunk and cb are currently
      // being processed, so move the buffer counter past them.

      if (state.writing) {
        break;
      }
    }

    if (entry === null) state.lastBufferedRequest = null;
  }

  state.bufferedRequest = entry;
  state.bufferProcessing = false;
}

Writable.prototype._write = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED('_write()'));
};

Writable.prototype._writev = null;

Writable.prototype.end = function (chunk, encoding, cb) {
  var state = this._writableState;

  if (typeof chunk === 'function') {
    cb = chunk;
    chunk = null;
    encoding = null;
  } else if (typeof encoding === 'function') {
    cb = encoding;
    encoding = null;
  }

  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding); // .end() fully uncorks

  if (state.corked) {
    state.corked = 1;
    this.uncork();
  } // ignore unnecessary end() calls.


  if (!state.ending) endWritable(this, state, cb);
  return this;
};

Object.defineProperty(Writable.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
});

function needFinish(state) {
  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
}

function callFinal(stream, state) {
  stream._final(function (err) {
    state.pendingcb--;

    if (err) {
      errorOrDestroy$1(stream, err);
    }

    state.prefinished = true;
    stream.emit('prefinish');
    finishMaybe(stream, state);
  });
}

function prefinish(stream, state) {
  if (!state.prefinished && !state.finalCalled) {
    if (typeof stream._final === 'function' && !state.destroyed) {
      state.pendingcb++;
      state.finalCalled = true;
      process.nextTick(callFinal, stream, state);
    } else {
      state.prefinished = true;
      stream.emit('prefinish');
    }
  }
}

function finishMaybe(stream, state) {
  var need = needFinish(state);

  if (need) {
    prefinish(stream, state);

    if (state.pendingcb === 0) {
      state.finished = true;
      stream.emit('finish');

      if (state.autoDestroy) {
        // In case of duplex streams we need a way to detect
        // if the readable side is ready for autoDestroy as well
        var rState = stream._readableState;

        if (!rState || rState.autoDestroy && rState.endEmitted) {
          stream.destroy();
        }
      }
    }
  }

  return need;
}

function endWritable(stream, state, cb) {
  state.ending = true;
  finishMaybe(stream, state);

  if (cb) {
    if (state.finished) process.nextTick(cb);else stream.once('finish', cb);
  }

  state.ended = true;
  stream.writable = false;
}

function onCorkedFinish(corkReq, state, err) {
  var entry = corkReq.entry;
  corkReq.entry = null;

  while (entry) {
    var cb = entry.callback;
    state.pendingcb--;
    cb(err);
    entry = entry.next;
  } // reuse the free corkReq.


  state.corkedRequestsFree.next = corkReq;
}

Object.defineProperty(Writable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._writableState === undefined) {
      return false;
    }

    return this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._writableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._writableState.destroyed = value;
  }
});
Writable.prototype.destroy = destroy_1.destroy;
Writable.prototype._undestroy = destroy_1.undestroy;

Writable.prototype._destroy = function (err, cb) {
  cb(err);
};

/*<replacement>*/

var objectKeys = Object.keys || function (obj) {
  var keys = [];

  for (var key in obj) {
    keys.push(key);
  }

  return keys;
};
/*</replacement>*/


var _stream_duplex = Duplex$1;





inherits_browser(Duplex$1, _stream_readable);

{
  // Allow the keys array to be GC'ed.
  var keys = objectKeys(_stream_writable.prototype);

  for (var v = 0; v < keys.length; v++) {
    var method = keys[v];
    if (!Duplex$1.prototype[method]) Duplex$1.prototype[method] = _stream_writable.prototype[method];
  }
}

function Duplex$1(options) {
  if (!(this instanceof Duplex$1)) return new Duplex$1(options);
  _stream_readable.call(this, options);
  _stream_writable.call(this, options);
  this.allowHalfOpen = true;

  if (options) {
    if (options.readable === false) this.readable = false;
    if (options.writable === false) this.writable = false;

    if (options.allowHalfOpen === false) {
      this.allowHalfOpen = false;
      this.once('end', onend);
    }
  }
}

Object.defineProperty(Duplex$1.prototype, 'writableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.highWaterMark;
  }
});
Object.defineProperty(Duplex$1.prototype, 'writableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState && this._writableState.getBuffer();
  }
});
Object.defineProperty(Duplex$1.prototype, 'writableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._writableState.length;
  }
}); // the no-half-open enforcer

function onend() {
  // If the writable side ended, then we're ok.
  if (this._writableState.ended) return; // no more data can be written.
  // But allow more writes to happen in this tick.

  process.nextTick(onEndNT, this);
}

function onEndNT(self) {
  self.end();
}

Object.defineProperty(Duplex$1.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined || this._writableState === undefined) {
      return false;
    }

    return this._readableState.destroyed && this._writableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (this._readableState === undefined || this._writableState === undefined) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
    this._writableState.destroyed = value;
  }
});

/*<replacement>*/

var Buffer$3 = safeBuffer.Buffer;
/*</replacement>*/

var isEncoding = Buffer$3.isEncoding || function (encoding) {
  encoding = '' + encoding;
  switch (encoding && encoding.toLowerCase()) {
    case 'hex':case 'utf8':case 'utf-8':case 'ascii':case 'binary':case 'base64':case 'ucs2':case 'ucs-2':case 'utf16le':case 'utf-16le':case 'raw':
      return true;
    default:
      return false;
  }
};

function _normalizeEncoding(enc) {
  if (!enc) return 'utf8';
  var retried;
  while (true) {
    switch (enc) {
      case 'utf8':
      case 'utf-8':
        return 'utf8';
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return 'utf16le';
      case 'latin1':
      case 'binary':
        return 'latin1';
      case 'base64':
      case 'ascii':
      case 'hex':
        return enc;
      default:
        if (retried) return; // undefined
        enc = ('' + enc).toLowerCase();
        retried = true;
    }
  }
}
// Do not cache `Buffer.isEncoding` when checking encoding names as some
// modules monkey-patch it to support additional encodings
function normalizeEncoding(enc) {
  var nenc = _normalizeEncoding(enc);
  if (typeof nenc !== 'string' && (Buffer$3.isEncoding === isEncoding || !isEncoding(enc))) throw new Error('Unknown encoding: ' + enc);
  return nenc || enc;
}

// StringDecoder provides an interface for efficiently splitting a series of
// buffers into a series of JS strings without breaking apart multi-byte
// characters.
var StringDecoder_1 = StringDecoder;
function StringDecoder(encoding) {
  this.encoding = normalizeEncoding(encoding);
  var nb;
  switch (this.encoding) {
    case 'utf16le':
      this.text = utf16Text;
      this.end = utf16End;
      nb = 4;
      break;
    case 'utf8':
      this.fillLast = utf8FillLast;
      nb = 4;
      break;
    case 'base64':
      this.text = base64Text;
      this.end = base64End;
      nb = 3;
      break;
    default:
      this.write = simpleWrite;
      this.end = simpleEnd;
      return;
  }
  this.lastNeed = 0;
  this.lastTotal = 0;
  this.lastChar = Buffer$3.allocUnsafe(nb);
}

StringDecoder.prototype.write = function (buf) {
  if (buf.length === 0) return '';
  var r;
  var i;
  if (this.lastNeed) {
    r = this.fillLast(buf);
    if (r === undefined) return '';
    i = this.lastNeed;
    this.lastNeed = 0;
  } else {
    i = 0;
  }
  if (i < buf.length) return r ? r + this.text(buf, i) : this.text(buf, i);
  return r || '';
};

StringDecoder.prototype.end = utf8End;

// Returns only complete characters in a Buffer
StringDecoder.prototype.text = utf8Text;

// Attempts to complete a partial non-UTF-8 character using bytes from a Buffer
StringDecoder.prototype.fillLast = function (buf) {
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, this.lastTotal - this.lastNeed, 0, buf.length);
  this.lastNeed -= buf.length;
};

// Checks the type of a UTF-8 byte, whether it's ASCII, a leading byte, or a
// continuation byte. If an invalid byte is detected, -2 is returned.
function utf8CheckByte(byte) {
  if (byte <= 0x7F) return 0;else if (byte >> 5 === 0x06) return 2;else if (byte >> 4 === 0x0E) return 3;else if (byte >> 3 === 0x1E) return 4;
  return byte >> 6 === 0x02 ? -1 : -2;
}

// Checks at most 3 bytes at the end of a Buffer in order to detect an
// incomplete multi-byte UTF-8 character. The total number of bytes (2, 3, or 4)
// needed to complete the UTF-8 character (if applicable) are returned.
function utf8CheckIncomplete(self, buf, i) {
  var j = buf.length - 1;
  if (j < i) return 0;
  var nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 1;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) self.lastNeed = nb - 2;
    return nb;
  }
  if (--j < i || nb === -2) return 0;
  nb = utf8CheckByte(buf[j]);
  if (nb >= 0) {
    if (nb > 0) {
      if (nb === 2) nb = 0;else self.lastNeed = nb - 3;
    }
    return nb;
  }
  return 0;
}

// Validates as many continuation bytes for a multi-byte UTF-8 character as
// needed or are available. If we see a non-continuation byte where we expect
// one, we "replace" the validated continuation bytes we've seen so far with
// a single UTF-8 replacement character ('\ufffd'), to match v8's UTF-8 decoding
// behavior. The continuation byte check is included three times in the case
// where all of the continuation bytes for a character exist in the same buffer.
// It is also done this way as a slight performance increase instead of using a
// loop.
function utf8CheckExtraBytes(self, buf, p) {
  if ((buf[0] & 0xC0) !== 0x80) {
    self.lastNeed = 0;
    return '\ufffd';
  }
  if (self.lastNeed > 1 && buf.length > 1) {
    if ((buf[1] & 0xC0) !== 0x80) {
      self.lastNeed = 1;
      return '\ufffd';
    }
    if (self.lastNeed > 2 && buf.length > 2) {
      if ((buf[2] & 0xC0) !== 0x80) {
        self.lastNeed = 2;
        return '\ufffd';
      }
    }
  }
}

// Attempts to complete a multi-byte UTF-8 character using bytes from a Buffer.
function utf8FillLast(buf) {
  var p = this.lastTotal - this.lastNeed;
  var r = utf8CheckExtraBytes(this, buf);
  if (r !== undefined) return r;
  if (this.lastNeed <= buf.length) {
    buf.copy(this.lastChar, p, 0, this.lastNeed);
    return this.lastChar.toString(this.encoding, 0, this.lastTotal);
  }
  buf.copy(this.lastChar, p, 0, buf.length);
  this.lastNeed -= buf.length;
}

// Returns all complete UTF-8 characters in a Buffer. If the Buffer ended on a
// partial character, the character's bytes are buffered until the required
// number of bytes are available.
function utf8Text(buf, i) {
  var total = utf8CheckIncomplete(this, buf, i);
  if (!this.lastNeed) return buf.toString('utf8', i);
  this.lastTotal = total;
  var end = buf.length - (total - this.lastNeed);
  buf.copy(this.lastChar, 0, end);
  return buf.toString('utf8', i, end);
}

// For UTF-8, a replacement character is added when ending on a partial
// character.
function utf8End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + '\ufffd';
  return r;
}

// UTF-16LE typically needs two bytes per character, but even if we have an even
// number of bytes available, we need to check if we end on a leading/high
// surrogate. In that case, we need to wait for the next two bytes in order to
// decode the last character properly.
function utf16Text(buf, i) {
  if ((buf.length - i) % 2 === 0) {
    var r = buf.toString('utf16le', i);
    if (r) {
      var c = r.charCodeAt(r.length - 1);
      if (c >= 0xD800 && c <= 0xDBFF) {
        this.lastNeed = 2;
        this.lastTotal = 4;
        this.lastChar[0] = buf[buf.length - 2];
        this.lastChar[1] = buf[buf.length - 1];
        return r.slice(0, -1);
      }
    }
    return r;
  }
  this.lastNeed = 1;
  this.lastTotal = 2;
  this.lastChar[0] = buf[buf.length - 1];
  return buf.toString('utf16le', i, buf.length - 1);
}

// For UTF-16LE we do not explicitly append special replacement characters if we
// end on a partial character, we simply let v8 handle that.
function utf16End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) {
    var end = this.lastTotal - this.lastNeed;
    return r + this.lastChar.toString('utf16le', 0, end);
  }
  return r;
}

function base64Text(buf, i) {
  var n = (buf.length - i) % 3;
  if (n === 0) return buf.toString('base64', i);
  this.lastNeed = 3 - n;
  this.lastTotal = 3;
  if (n === 1) {
    this.lastChar[0] = buf[buf.length - 1];
  } else {
    this.lastChar[0] = buf[buf.length - 2];
    this.lastChar[1] = buf[buf.length - 1];
  }
  return buf.toString('base64', i, buf.length - n);
}

function base64End(buf) {
  var r = buf && buf.length ? this.write(buf) : '';
  if (this.lastNeed) return r + this.lastChar.toString('base64', 0, 3 - this.lastNeed);
  return r;
}

// Pass bytes on through for single-byte encodings (e.g. ascii, latin1, hex)
function simpleWrite(buf) {
  return buf.toString(this.encoding);
}

function simpleEnd(buf) {
  return buf && buf.length ? this.write(buf) : '';
}

var string_decoder = {
	StringDecoder: StringDecoder_1
};

var ERR_STREAM_PREMATURE_CLOSE = errorsBrowser.codes.ERR_STREAM_PREMATURE_CLOSE;

function once(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    callback.apply(this, args);
  };
}

function noop() {}

function isRequest(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function eos(stream, opts, callback) {
  if (typeof opts === 'function') return eos(stream, null, opts);
  if (!opts) opts = {};
  callback = once(callback || noop);
  var readable = opts.readable || opts.readable !== false && stream.readable;
  var writable = opts.writable || opts.writable !== false && stream.writable;

  var onlegacyfinish = function onlegacyfinish() {
    if (!stream.writable) onfinish();
  };

  var writableEnded = stream._writableState && stream._writableState.finished;

  var onfinish = function onfinish() {
    writable = false;
    writableEnded = true;
    if (!readable) callback.call(stream);
  };

  var readableEnded = stream._readableState && stream._readableState.endEmitted;

  var onend = function onend() {
    readable = false;
    readableEnded = true;
    if (!writable) callback.call(stream);
  };

  var onerror = function onerror(err) {
    callback.call(stream, err);
  };

  var onclose = function onclose() {
    var err;

    if (readable && !readableEnded) {
      if (!stream._readableState || !stream._readableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }

    if (writable && !writableEnded) {
      if (!stream._writableState || !stream._writableState.ended) err = new ERR_STREAM_PREMATURE_CLOSE();
      return callback.call(stream, err);
    }
  };

  var onrequest = function onrequest() {
    stream.req.on('finish', onfinish);
  };

  if (isRequest(stream)) {
    stream.on('complete', onfinish);
    stream.on('abort', onclose);
    if (stream.req) onrequest();else stream.on('request', onrequest);
  } else if (writable && !stream._writableState) {
    // legacy streams
    stream.on('end', onlegacyfinish);
    stream.on('close', onlegacyfinish);
  }

  stream.on('end', onend);
  stream.on('finish', onfinish);
  if (opts.error !== false) stream.on('error', onerror);
  stream.on('close', onclose);
  return function () {
    stream.removeListener('complete', onfinish);
    stream.removeListener('abort', onclose);
    stream.removeListener('request', onrequest);
    if (stream.req) stream.req.removeListener('finish', onfinish);
    stream.removeListener('end', onlegacyfinish);
    stream.removeListener('close', onlegacyfinish);
    stream.removeListener('finish', onfinish);
    stream.removeListener('end', onend);
    stream.removeListener('error', onerror);
    stream.removeListener('close', onclose);
  };
}

var endOfStream = eos;

var _Object$setPrototypeO;

function _defineProperty$1(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }



var kLastResolve = Symbol('lastResolve');
var kLastReject = Symbol('lastReject');
var kError = Symbol('error');
var kEnded = Symbol('ended');
var kLastPromise = Symbol('lastPromise');
var kHandlePromise = Symbol('handlePromise');
var kStream = Symbol('stream');

function createIterResult(value, done) {
  return {
    value: value,
    done: done
  };
}

function readAndResolve(iter) {
  var resolve = iter[kLastResolve];

  if (resolve !== null) {
    var data = iter[kStream].read(); // we defer if data is null
    // we can be expecting either 'end' or
    // 'error'

    if (data !== null) {
      iter[kLastPromise] = null;
      iter[kLastResolve] = null;
      iter[kLastReject] = null;
      resolve(createIterResult(data, false));
    }
  }
}

function onReadable(iter) {
  // we wait for the next tick, because it might
  // emit an error with process.nextTick
  process.nextTick(readAndResolve, iter);
}

function wrapForNext(lastPromise, iter) {
  return function (resolve, reject) {
    lastPromise.then(function () {
      if (iter[kEnded]) {
        resolve(createIterResult(undefined, true));
        return;
      }

      iter[kHandlePromise](resolve, reject);
    }, reject);
  };
}

var AsyncIteratorPrototype = Object.getPrototypeOf(function () {});
var ReadableStreamAsyncIteratorPrototype = Object.setPrototypeOf((_Object$setPrototypeO = {
  get stream() {
    return this[kStream];
  },

  next: function next() {
    var _this = this;

    // if we have detected an error in the meanwhile
    // reject straight away
    var error = this[kError];

    if (error !== null) {
      return Promise.reject(error);
    }

    if (this[kEnded]) {
      return Promise.resolve(createIterResult(undefined, true));
    }

    if (this[kStream].destroyed) {
      // We need to defer via nextTick because if .destroy(err) is
      // called, the error will be emitted via nextTick, and
      // we cannot guarantee that there is no error lingering around
      // waiting to be emitted.
      return new Promise(function (resolve, reject) {
        process.nextTick(function () {
          if (_this[kError]) {
            reject(_this[kError]);
          } else {
            resolve(createIterResult(undefined, true));
          }
        });
      });
    } // if we have multiple next() calls
    // we will wait for the previous Promise to finish
    // this logic is optimized to support for await loops,
    // where next() is only called once at a time


    var lastPromise = this[kLastPromise];
    var promise;

    if (lastPromise) {
      promise = new Promise(wrapForNext(lastPromise, this));
    } else {
      // fast path needed to support multiple this.push()
      // without triggering the next() queue
      var data = this[kStream].read();

      if (data !== null) {
        return Promise.resolve(createIterResult(data, false));
      }

      promise = new Promise(this[kHandlePromise]);
    }

    this[kLastPromise] = promise;
    return promise;
  }
}, _defineProperty$1(_Object$setPrototypeO, Symbol.asyncIterator, function () {
  return this;
}), _defineProperty$1(_Object$setPrototypeO, "return", function _return() {
  var _this2 = this;

  // destroy(err, cb) is a private API
  // we can guarantee we have that here, because we control the
  // Readable class this is attached to
  return new Promise(function (resolve, reject) {
    _this2[kStream].destroy(null, function (err) {
      if (err) {
        reject(err);
        return;
      }

      resolve(createIterResult(undefined, true));
    });
  });
}), _Object$setPrototypeO), AsyncIteratorPrototype);

var createReadableStreamAsyncIterator = function createReadableStreamAsyncIterator(stream) {
  var _Object$create;

  var iterator = Object.create(ReadableStreamAsyncIteratorPrototype, (_Object$create = {}, _defineProperty$1(_Object$create, kStream, {
    value: stream,
    writable: true
  }), _defineProperty$1(_Object$create, kLastResolve, {
    value: null,
    writable: true
  }), _defineProperty$1(_Object$create, kLastReject, {
    value: null,
    writable: true
  }), _defineProperty$1(_Object$create, kError, {
    value: null,
    writable: true
  }), _defineProperty$1(_Object$create, kEnded, {
    value: stream._readableState.endEmitted,
    writable: true
  }), _defineProperty$1(_Object$create, kHandlePromise, {
    value: function value(resolve, reject) {
      var data = iterator[kStream].read();

      if (data) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        resolve(createIterResult(data, false));
      } else {
        iterator[kLastResolve] = resolve;
        iterator[kLastReject] = reject;
      }
    },
    writable: true
  }), _Object$create));
  iterator[kLastPromise] = null;
  endOfStream(stream, function (err) {
    if (err && err.code !== 'ERR_STREAM_PREMATURE_CLOSE') {
      var reject = iterator[kLastReject]; // reject if we are waiting for data in the Promise
      // returned by next() and store the error

      if (reject !== null) {
        iterator[kLastPromise] = null;
        iterator[kLastResolve] = null;
        iterator[kLastReject] = null;
        reject(err);
      }

      iterator[kError] = err;
      return;
    }

    var resolve = iterator[kLastResolve];

    if (resolve !== null) {
      iterator[kLastPromise] = null;
      iterator[kLastResolve] = null;
      iterator[kLastReject] = null;
      resolve(createIterResult(undefined, true));
    }

    iterator[kEnded] = true;
  });
  stream.on('readable', onReadable.bind(null, iterator));
  return iterator;
};

var async_iterator = createReadableStreamAsyncIterator;

var fromBrowser = function () {
  throw new Error('Readable.from is not available in the browser')
};

var _stream_readable = Readable;
/*<replacement>*/

var Duplex$2;
/*</replacement>*/

Readable.ReadableState = ReadableState;
/*<replacement>*/

var EE = events.EventEmitter;

var EElistenerCount = function EElistenerCount(emitter, type) {
  return emitter.listeners(type).length;
};
/*</replacement>*/

/*<replacement>*/



/*</replacement>*/


var Buffer$4 = buffer.Buffer;

var OurUint8Array$1 = commonjsGlobal.Uint8Array || function () {};

function _uint8ArrayToBuffer$1(chunk) {
  return Buffer$4.from(chunk);
}

function _isUint8Array$1(obj) {
  return Buffer$4.isBuffer(obj) || obj instanceof OurUint8Array$1;
}
/*<replacement>*/




var debug;

if (debugUtil && debugUtil.debuglog) {
  debug = debugUtil.debuglog('stream');
} else {
  debug = function debug() {};
}
/*</replacement>*/






var getHighWaterMark$2 = state.getHighWaterMark;

var _require$codes$1 = errorsBrowser.codes,
    ERR_INVALID_ARG_TYPE$1 = _require$codes$1.ERR_INVALID_ARG_TYPE,
    ERR_STREAM_PUSH_AFTER_EOF = _require$codes$1.ERR_STREAM_PUSH_AFTER_EOF,
    ERR_METHOD_NOT_IMPLEMENTED$1 = _require$codes$1.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_STREAM_UNSHIFT_AFTER_END_EVENT = _require$codes$1.ERR_STREAM_UNSHIFT_AFTER_END_EVENT; // Lazy loaded to improve the startup performance.


var StringDecoder$1;
var createReadableStreamAsyncIterator$1;
var from;

inherits_browser(Readable, streamBrowser);

var errorOrDestroy$2 = destroy_1.errorOrDestroy;
var kProxyEvents = ['error', 'close', 'destroy', 'pause', 'resume'];

function prependListener(emitter, event, fn) {
  // Sadly this is not cacheable as some libraries bundle their own
  // event emitter implementation with them.
  if (typeof emitter.prependListener === 'function') return emitter.prependListener(event, fn); // This is a hack to make sure that our error handler is attached before any
  // userland ones.  NEVER DO THIS. This is here only because this code needs
  // to continue to work with older versions of Node.js that do not include
  // the prependListener() method. The goal is to eventually remove this hack.

  if (!emitter._events || !emitter._events[event]) emitter.on(event, fn);else if (Array.isArray(emitter._events[event])) emitter._events[event].unshift(fn);else emitter._events[event] = [fn, emitter._events[event]];
}

function ReadableState(options, stream, isDuplex) {
  Duplex$2 = Duplex$2 || _stream_duplex;
  options = options || {}; // Duplex streams are both readable and writable, but share
  // the same options object.
  // However, some cases require setting options to different
  // values for the readable and the writable sides of the duplex stream.
  // These options can be provided separately as readableXXX and writableXXX.

  if (typeof isDuplex !== 'boolean') isDuplex = stream instanceof Duplex$2; // object stream flag. Used to make read(n) ignore n and to
  // make all the buffer merging and length checks go away

  this.objectMode = !!options.objectMode;
  if (isDuplex) this.objectMode = this.objectMode || !!options.readableObjectMode; // the point at which it stops calling _read() to fill the buffer
  // Note: 0 is a valid value, means "don't call _read preemptively ever"

  this.highWaterMark = getHighWaterMark$2(this, options, 'readableHighWaterMark', isDuplex); // A linked list is used to store data chunks instead of an array because the
  // linked list can remove elements from the beginning faster than
  // array.shift()

  this.buffer = new buffer_list();
  this.length = 0;
  this.pipes = null;
  this.pipesCount = 0;
  this.flowing = null;
  this.ended = false;
  this.endEmitted = false;
  this.reading = false; // a flag to be able to tell if the event 'readable'/'data' is emitted
  // immediately, or on a later tick.  We set this to true at first, because
  // any actions that shouldn't happen until "later" should generally also
  // not happen before the first read call.

  this.sync = true; // whenever we return null, then we set a flag to say
  // that we're awaiting a 'readable' event emission.

  this.needReadable = false;
  this.emittedReadable = false;
  this.readableListening = false;
  this.resumeScheduled = false;
  this.paused = true; // Should close be emitted on destroy. Defaults to true.

  this.emitClose = options.emitClose !== false; // Should .destroy() be called after 'end' (and potentially 'finish')

  this.autoDestroy = !!options.autoDestroy; // has it been destroyed

  this.destroyed = false; // Crypto is kind of old and crusty.  Historically, its default string
  // encoding is 'binary' so we have to make this configurable.
  // Everything else in the universe uses 'utf8', though.

  this.defaultEncoding = options.defaultEncoding || 'utf8'; // the number of writers that are awaiting a drain event in .pipe()s

  this.awaitDrain = 0; // if true, a maybeReadMore has been scheduled

  this.readingMore = false;
  this.decoder = null;
  this.encoding = null;

  if (options.encoding) {
    if (!StringDecoder$1) StringDecoder$1 = string_decoder.StringDecoder;
    this.decoder = new StringDecoder$1(options.encoding);
    this.encoding = options.encoding;
  }
}

function Readable(options) {
  Duplex$2 = Duplex$2 || _stream_duplex;
  if (!(this instanceof Readable)) return new Readable(options); // Checking for a Stream.Duplex instance is faster here instead of inside
  // the ReadableState constructor, at least with V8 6.5

  var isDuplex = this instanceof Duplex$2;
  this._readableState = new ReadableState(options, this, isDuplex); // legacy

  this.readable = true;

  if (options) {
    if (typeof options.read === 'function') this._read = options.read;
    if (typeof options.destroy === 'function') this._destroy = options.destroy;
  }

  streamBrowser.call(this);
}

Object.defineProperty(Readable.prototype, 'destroyed', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    if (this._readableState === undefined) {
      return false;
    }

    return this._readableState.destroyed;
  },
  set: function set(value) {
    // we ignore the value if the stream
    // has not been initialized yet
    if (!this._readableState) {
      return;
    } // backward compatibility, the user is explicitly
    // managing destroyed


    this._readableState.destroyed = value;
  }
});
Readable.prototype.destroy = destroy_1.destroy;
Readable.prototype._undestroy = destroy_1.undestroy;

Readable.prototype._destroy = function (err, cb) {
  cb(err);
}; // Manually shove something into the read() buffer.
// This returns true if the highWaterMark has not been hit yet,
// similar to how Writable.write() returns true if you should
// write() some more.


Readable.prototype.push = function (chunk, encoding) {
  var state = this._readableState;
  var skipChunkCheck;

  if (!state.objectMode) {
    if (typeof chunk === 'string') {
      encoding = encoding || state.defaultEncoding;

      if (encoding !== state.encoding) {
        chunk = Buffer$4.from(chunk, encoding);
        encoding = '';
      }

      skipChunkCheck = true;
    }
  } else {
    skipChunkCheck = true;
  }

  return readableAddChunk(this, chunk, encoding, false, skipChunkCheck);
}; // Unshift should *always* be something directly out of read()


Readable.prototype.unshift = function (chunk) {
  return readableAddChunk(this, chunk, null, true, false);
};

function readableAddChunk(stream, chunk, encoding, addToFront, skipChunkCheck) {
  debug('readableAddChunk', chunk);
  var state = stream._readableState;

  if (chunk === null) {
    state.reading = false;
    onEofChunk(stream, state);
  } else {
    var er;
    if (!skipChunkCheck) er = chunkInvalid(state, chunk);

    if (er) {
      errorOrDestroy$2(stream, er);
    } else if (state.objectMode || chunk && chunk.length > 0) {
      if (typeof chunk !== 'string' && !state.objectMode && Object.getPrototypeOf(chunk) !== Buffer$4.prototype) {
        chunk = _uint8ArrayToBuffer$1(chunk);
      }

      if (addToFront) {
        if (state.endEmitted) errorOrDestroy$2(stream, new ERR_STREAM_UNSHIFT_AFTER_END_EVENT());else addChunk(stream, state, chunk, true);
      } else if (state.ended) {
        errorOrDestroy$2(stream, new ERR_STREAM_PUSH_AFTER_EOF());
      } else if (state.destroyed) {
        return false;
      } else {
        state.reading = false;

        if (state.decoder && !encoding) {
          chunk = state.decoder.write(chunk);
          if (state.objectMode || chunk.length !== 0) addChunk(stream, state, chunk, false);else maybeReadMore(stream, state);
        } else {
          addChunk(stream, state, chunk, false);
        }
      }
    } else if (!addToFront) {
      state.reading = false;
      maybeReadMore(stream, state);
    }
  } // We can push more data if we are below the highWaterMark.
  // Also, if we have no data yet, we can stand some more bytes.
  // This is to work around cases where hwm=0, such as the repl.


  return !state.ended && (state.length < state.highWaterMark || state.length === 0);
}

function addChunk(stream, state, chunk, addToFront) {
  if (state.flowing && state.length === 0 && !state.sync) {
    state.awaitDrain = 0;
    stream.emit('data', chunk);
  } else {
    // update the buffer info.
    state.length += state.objectMode ? 1 : chunk.length;
    if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);
    if (state.needReadable) emitReadable(stream);
  }

  maybeReadMore(stream, state);
}

function chunkInvalid(state, chunk) {
  var er;

  if (!_isUint8Array$1(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
    er = new ERR_INVALID_ARG_TYPE$1('chunk', ['string', 'Buffer', 'Uint8Array'], chunk);
  }

  return er;
}

Readable.prototype.isPaused = function () {
  return this._readableState.flowing === false;
}; // backwards compatibility.


Readable.prototype.setEncoding = function (enc) {
  if (!StringDecoder$1) StringDecoder$1 = string_decoder.StringDecoder;
  var decoder = new StringDecoder$1(enc);
  this._readableState.decoder = decoder; // If setEncoding(null), decoder.encoding equals utf8

  this._readableState.encoding = this._readableState.decoder.encoding; // Iterate over current buffer to convert already stored Buffers:

  var p = this._readableState.buffer.head;
  var content = '';

  while (p !== null) {
    content += decoder.write(p.data);
    p = p.next;
  }

  this._readableState.buffer.clear();

  if (content !== '') this._readableState.buffer.push(content);
  this._readableState.length = content.length;
  return this;
}; // Don't raise the hwm > 1GB


var MAX_HWM = 0x40000000;

function computeNewHighWaterMark(n) {
  if (n >= MAX_HWM) {
    // TODO(ronag): Throw ERR_VALUE_OUT_OF_RANGE.
    n = MAX_HWM;
  } else {
    // Get the next highest power of 2 to prevent increasing hwm excessively in
    // tiny amounts
    n--;
    n |= n >>> 1;
    n |= n >>> 2;
    n |= n >>> 4;
    n |= n >>> 8;
    n |= n >>> 16;
    n++;
  }

  return n;
} // This function is designed to be inlinable, so please take care when making
// changes to the function body.


function howMuchToRead(n, state) {
  if (n <= 0 || state.length === 0 && state.ended) return 0;
  if (state.objectMode) return 1;

  if (n !== n) {
    // Only flow one buffer at a time
    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
  } // If we're asking for more than the current hwm, then raise the hwm.


  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
  if (n <= state.length) return n; // Don't have enough

  if (!state.ended) {
    state.needReadable = true;
    return 0;
  }

  return state.length;
} // you can override either this method, or the async _read(n) below.


Readable.prototype.read = function (n) {
  debug('read', n);
  n = parseInt(n, 10);
  var state = this._readableState;
  var nOrig = n;
  if (n !== 0) state.emittedReadable = false; // if we're doing read(0) to trigger a readable event, but we
  // already have a bunch of data in the buffer, then just trigger
  // the 'readable' event and move on.

  if (n === 0 && state.needReadable && ((state.highWaterMark !== 0 ? state.length >= state.highWaterMark : state.length > 0) || state.ended)) {
    debug('read: emitReadable', state.length, state.ended);
    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
    return null;
  }

  n = howMuchToRead(n, state); // if we've ended, and we're now clear, then finish it up.

  if (n === 0 && state.ended) {
    if (state.length === 0) endReadable(this);
    return null;
  } // All the actual chunk generation logic needs to be
  // *below* the call to _read.  The reason is that in certain
  // synthetic stream cases, such as passthrough streams, _read
  // may be a completely synchronous operation which may change
  // the state of the read buffer, providing enough data when
  // before there was *not* enough.
  //
  // So, the steps are:
  // 1. Figure out what the state of things will be after we do
  // a read from the buffer.
  //
  // 2. If that resulting state will trigger a _read, then call _read.
  // Note that this may be asynchronous, or synchronous.  Yes, it is
  // deeply ugly to write APIs this way, but that still doesn't mean
  // that the Readable class should behave improperly, as streams are
  // designed to be sync/async agnostic.
  // Take note if the _read call is sync or async (ie, if the read call
  // has returned yet), so that we know whether or not it's safe to emit
  // 'readable' etc.
  //
  // 3. Actually pull the requested chunks out of the buffer and return.
  // if we need a readable event, then we need to do some reading.


  var doRead = state.needReadable;
  debug('need readable', doRead); // if we currently have less than the highWaterMark, then also read some

  if (state.length === 0 || state.length - n < state.highWaterMark) {
    doRead = true;
    debug('length less than watermark', doRead);
  } // however, if we've ended, then there's no point, and if we're already
  // reading, then it's unnecessary.


  if (state.ended || state.reading) {
    doRead = false;
    debug('reading or ended', doRead);
  } else if (doRead) {
    debug('do read');
    state.reading = true;
    state.sync = true; // if the length is currently zero, then we *need* a readable event.

    if (state.length === 0) state.needReadable = true; // call internal read method

    this._read(state.highWaterMark);

    state.sync = false; // If _read pushed data synchronously, then `reading` will be false,
    // and we need to re-evaluate how much data we can return to the user.

    if (!state.reading) n = howMuchToRead(nOrig, state);
  }

  var ret;
  if (n > 0) ret = fromList(n, state);else ret = null;

  if (ret === null) {
    state.needReadable = state.length <= state.highWaterMark;
    n = 0;
  } else {
    state.length -= n;
    state.awaitDrain = 0;
  }

  if (state.length === 0) {
    // If we have nothing in the buffer, then we want to know
    // as soon as we *do* get something into the buffer.
    if (!state.ended) state.needReadable = true; // If we tried to read() past the EOF, then emit end on the next tick.

    if (nOrig !== n && state.ended) endReadable(this);
  }

  if (ret !== null) this.emit('data', ret);
  return ret;
};

function onEofChunk(stream, state) {
  debug('onEofChunk');
  if (state.ended) return;

  if (state.decoder) {
    var chunk = state.decoder.end();

    if (chunk && chunk.length) {
      state.buffer.push(chunk);
      state.length += state.objectMode ? 1 : chunk.length;
    }
  }

  state.ended = true;

  if (state.sync) {
    // if we are sync, wait until next tick to emit the data.
    // Otherwise we risk emitting data in the flow()
    // the readable code triggers during a read() call
    emitReadable(stream);
  } else {
    // emit 'readable' now to make sure it gets picked up.
    state.needReadable = false;

    if (!state.emittedReadable) {
      state.emittedReadable = true;
      emitReadable_(stream);
    }
  }
} // Don't emit readable right away in sync mode, because this can trigger
// another read() call => stack overflow.  This way, it might trigger
// a nextTick recursion warning, but that's not so bad.


function emitReadable(stream) {
  var state = stream._readableState;
  debug('emitReadable', state.needReadable, state.emittedReadable);
  state.needReadable = false;

  if (!state.emittedReadable) {
    debug('emitReadable', state.flowing);
    state.emittedReadable = true;
    process.nextTick(emitReadable_, stream);
  }
}

function emitReadable_(stream) {
  var state = stream._readableState;
  debug('emitReadable_', state.destroyed, state.length, state.ended);

  if (!state.destroyed && (state.length || state.ended)) {
    stream.emit('readable');
    state.emittedReadable = false;
  } // The stream needs another readable event if
  // 1. It is not flowing, as the flow mechanism will take
  //    care of it.
  // 2. It is not ended.
  // 3. It is below the highWaterMark, so we can schedule
  //    another readable later.


  state.needReadable = !state.flowing && !state.ended && state.length <= state.highWaterMark;
  flow(stream);
} // at this point, the user has presumably seen the 'readable' event,
// and called read() to consume some data.  that may have triggered
// in turn another _read(n) call, in which case reading = true if
// it's in progress.
// However, if we're not ended, or reading, and the length < hwm,
// then go ahead and try to read some more preemptively.


function maybeReadMore(stream, state) {
  if (!state.readingMore) {
    state.readingMore = true;
    process.nextTick(maybeReadMore_, stream, state);
  }
}

function maybeReadMore_(stream, state) {
  // Attempt to read more data if we should.
  //
  // The conditions for reading more data are (one of):
  // - Not enough data buffered (state.length < state.highWaterMark). The loop
  //   is responsible for filling the buffer with enough data if such data
  //   is available. If highWaterMark is 0 and we are not in the flowing mode
  //   we should _not_ attempt to buffer any extra data. We'll get more data
  //   when the stream consumer calls read() instead.
  // - No data in the buffer, and the stream is in flowing mode. In this mode
  //   the loop below is responsible for ensuring read() is called. Failing to
  //   call read here would abort the flow and there's no other mechanism for
  //   continuing the flow if the stream consumer has just subscribed to the
  //   'data' event.
  //
  // In addition to the above conditions to keep reading data, the following
  // conditions prevent the data from being read:
  // - The stream has ended (state.ended).
  // - There is already a pending 'read' operation (state.reading). This is a
  //   case where the the stream has called the implementation defined _read()
  //   method, but they are processing the call asynchronously and have _not_
  //   called push() with new data. In this case we skip performing more
  //   read()s. The execution ends in this method again after the _read() ends
  //   up calling push() with more data.
  while (!state.reading && !state.ended && (state.length < state.highWaterMark || state.flowing && state.length === 0)) {
    var len = state.length;
    debug('maybeReadMore read 0');
    stream.read(0);
    if (len === state.length) // didn't get any data, stop spinning.
      break;
  }

  state.readingMore = false;
} // abstract method.  to be overridden in specific implementation classes.
// call cb(er, data) where data is <= n in length.
// for virtual (non-string, non-buffer) streams, "length" is somewhat
// arbitrary, and perhaps not very meaningful.


Readable.prototype._read = function (n) {
  errorOrDestroy$2(this, new ERR_METHOD_NOT_IMPLEMENTED$1('_read()'));
};

Readable.prototype.pipe = function (dest, pipeOpts) {
  var src = this;
  var state = this._readableState;

  switch (state.pipesCount) {
    case 0:
      state.pipes = dest;
      break;

    case 1:
      state.pipes = [state.pipes, dest];
      break;

    default:
      state.pipes.push(dest);
      break;
  }

  state.pipesCount += 1;
  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);
  var doEnd = (!pipeOpts || pipeOpts.end !== false) && dest !== process.stdout && dest !== process.stderr;
  var endFn = doEnd ? onend : unpipe;
  if (state.endEmitted) process.nextTick(endFn);else src.once('end', endFn);
  dest.on('unpipe', onunpipe);

  function onunpipe(readable, unpipeInfo) {
    debug('onunpipe');

    if (readable === src) {
      if (unpipeInfo && unpipeInfo.hasUnpiped === false) {
        unpipeInfo.hasUnpiped = true;
        cleanup();
      }
    }
  }

  function onend() {
    debug('onend');
    dest.end();
  } // when the dest drains, it reduces the awaitDrain counter
  // on the source.  This would be more elegant with a .once()
  // handler in flow(), but adding and removing repeatedly is
  // too slow.


  var ondrain = pipeOnDrain(src);
  dest.on('drain', ondrain);
  var cleanedUp = false;

  function cleanup() {
    debug('cleanup'); // cleanup event handlers once the pipe is broken

    dest.removeListener('close', onclose);
    dest.removeListener('finish', onfinish);
    dest.removeListener('drain', ondrain);
    dest.removeListener('error', onerror);
    dest.removeListener('unpipe', onunpipe);
    src.removeListener('end', onend);
    src.removeListener('end', unpipe);
    src.removeListener('data', ondata);
    cleanedUp = true; // if the reader is waiting for a drain event from this
    // specific writer, then it would cause it to never start
    // flowing again.
    // So, if this is awaiting a drain, then we just call it now.
    // If we don't know, then assume that we are waiting for one.

    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
  }

  src.on('data', ondata);

  function ondata(chunk) {
    debug('ondata');
    var ret = dest.write(chunk);
    debug('dest.write', ret);

    if (ret === false) {
      // If the user unpiped during `dest.write()`, it is possible
      // to get stuck in a permanently paused state if that write
      // also returned false.
      // => Check whether `dest` is still a piping destination.
      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
        debug('false write response, pause', state.awaitDrain);
        state.awaitDrain++;
      }

      src.pause();
    }
  } // if the dest has an error, then stop piping into it.
  // however, don't suppress the throwing behavior for this.


  function onerror(er) {
    debug('onerror', er);
    unpipe();
    dest.removeListener('error', onerror);
    if (EElistenerCount(dest, 'error') === 0) errorOrDestroy$2(dest, er);
  } // Make sure our error handler is attached before userland ones.


  prependListener(dest, 'error', onerror); // Both close and finish should trigger unpipe, but only once.

  function onclose() {
    dest.removeListener('finish', onfinish);
    unpipe();
  }

  dest.once('close', onclose);

  function onfinish() {
    debug('onfinish');
    dest.removeListener('close', onclose);
    unpipe();
  }

  dest.once('finish', onfinish);

  function unpipe() {
    debug('unpipe');
    src.unpipe(dest);
  } // tell the dest that it's being piped to


  dest.emit('pipe', src); // start the flow if it hasn't been started already.

  if (!state.flowing) {
    debug('pipe resume');
    src.resume();
  }

  return dest;
};

function pipeOnDrain(src) {
  return function pipeOnDrainFunctionResult() {
    var state = src._readableState;
    debug('pipeOnDrain', state.awaitDrain);
    if (state.awaitDrain) state.awaitDrain--;

    if (state.awaitDrain === 0 && EElistenerCount(src, 'data')) {
      state.flowing = true;
      flow(src);
    }
  };
}

Readable.prototype.unpipe = function (dest) {
  var state = this._readableState;
  var unpipeInfo = {
    hasUnpiped: false
  }; // if we're not piping anywhere, then do nothing.

  if (state.pipesCount === 0) return this; // just one destination.  most common case.

  if (state.pipesCount === 1) {
    // passed in one, but it's not the right one.
    if (dest && dest !== state.pipes) return this;
    if (!dest) dest = state.pipes; // got a match.

    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;
    if (dest) dest.emit('unpipe', this, unpipeInfo);
    return this;
  } // slow case. multiple pipe destinations.


  if (!dest) {
    // remove all.
    var dests = state.pipes;
    var len = state.pipesCount;
    state.pipes = null;
    state.pipesCount = 0;
    state.flowing = false;

    for (var i = 0; i < len; i++) {
      dests[i].emit('unpipe', this, {
        hasUnpiped: false
      });
    }

    return this;
  } // try to find the right one.


  var index = indexOf(state.pipes, dest);
  if (index === -1) return this;
  state.pipes.splice(index, 1);
  state.pipesCount -= 1;
  if (state.pipesCount === 1) state.pipes = state.pipes[0];
  dest.emit('unpipe', this, unpipeInfo);
  return this;
}; // set up data events if they are asked for
// Ensure readable listeners eventually get something


Readable.prototype.on = function (ev, fn) {
  var res = streamBrowser.prototype.on.call(this, ev, fn);
  var state = this._readableState;

  if (ev === 'data') {
    // update readableListening so that resume() may be a no-op
    // a few lines down. This is needed to support once('readable').
    state.readableListening = this.listenerCount('readable') > 0; // Try start flowing on next tick if stream isn't explicitly paused

    if (state.flowing !== false) this.resume();
  } else if (ev === 'readable') {
    if (!state.endEmitted && !state.readableListening) {
      state.readableListening = state.needReadable = true;
      state.flowing = false;
      state.emittedReadable = false;
      debug('on readable', state.length, state.reading);

      if (state.length) {
        emitReadable(this);
      } else if (!state.reading) {
        process.nextTick(nReadingNextTick, this);
      }
    }
  }

  return res;
};

Readable.prototype.addListener = Readable.prototype.on;

Readable.prototype.removeListener = function (ev, fn) {
  var res = streamBrowser.prototype.removeListener.call(this, ev, fn);

  if (ev === 'readable') {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

Readable.prototype.removeAllListeners = function (ev) {
  var res = streamBrowser.prototype.removeAllListeners.apply(this, arguments);

  if (ev === 'readable' || ev === undefined) {
    // We need to check if there is someone still listening to
    // readable and reset the state. However this needs to happen
    // after readable has been emitted but before I/O (nextTick) to
    // support once('readable', fn) cycles. This means that calling
    // resume within the same tick will have no
    // effect.
    process.nextTick(updateReadableListening, this);
  }

  return res;
};

function updateReadableListening(self) {
  var state = self._readableState;
  state.readableListening = self.listenerCount('readable') > 0;

  if (state.resumeScheduled && !state.paused) {
    // flowing needs to be set to true now, otherwise
    // the upcoming resume will not flow.
    state.flowing = true; // crude way to check if we should resume
  } else if (self.listenerCount('data') > 0) {
    self.resume();
  }
}

function nReadingNextTick(self) {
  debug('readable nexttick read 0');
  self.read(0);
} // pause() and resume() are remnants of the legacy readable stream API
// If the user uses them, then switch into old mode.


Readable.prototype.resume = function () {
  var state = this._readableState;

  if (!state.flowing) {
    debug('resume'); // we flow only if there is no one listening
    // for readable, but we still have to call
    // resume()

    state.flowing = !state.readableListening;
    resume(this, state);
  }

  state.paused = false;
  return this;
};

function resume(stream, state) {
  if (!state.resumeScheduled) {
    state.resumeScheduled = true;
    process.nextTick(resume_, stream, state);
  }
}

function resume_(stream, state) {
  debug('resume', state.reading);

  if (!state.reading) {
    stream.read(0);
  }

  state.resumeScheduled = false;
  stream.emit('resume');
  flow(stream);
  if (state.flowing && !state.reading) stream.read(0);
}

Readable.prototype.pause = function () {
  debug('call pause flowing=%j', this._readableState.flowing);

  if (this._readableState.flowing !== false) {
    debug('pause');
    this._readableState.flowing = false;
    this.emit('pause');
  }

  this._readableState.paused = true;
  return this;
};

function flow(stream) {
  var state = stream._readableState;
  debug('flow', state.flowing);

  while (state.flowing && stream.read() !== null) {
  }
} // wrap an old-style stream as the async data source.
// This is *not* part of the readable stream interface.
// It is an ugly unfortunate mess of history.


Readable.prototype.wrap = function (stream) {
  var _this = this;

  var state = this._readableState;
  var paused = false;
  stream.on('end', function () {
    debug('wrapped end');

    if (state.decoder && !state.ended) {
      var chunk = state.decoder.end();
      if (chunk && chunk.length) _this.push(chunk);
    }

    _this.push(null);
  });
  stream.on('data', function (chunk) {
    debug('wrapped data');
    if (state.decoder) chunk = state.decoder.write(chunk); // don't skip over falsy values in objectMode

    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

    var ret = _this.push(chunk);

    if (!ret) {
      paused = true;
      stream.pause();
    }
  }); // proxy all the other methods.
  // important when wrapping filters and duplexes.

  for (var i in stream) {
    if (this[i] === undefined && typeof stream[i] === 'function') {
      this[i] = function methodWrap(method) {
        return function methodWrapReturnFunction() {
          return stream[method].apply(stream, arguments);
        };
      }(i);
    }
  } // proxy certain important events.


  for (var n = 0; n < kProxyEvents.length; n++) {
    stream.on(kProxyEvents[n], this.emit.bind(this, kProxyEvents[n]));
  } // when we try to consume some more bytes, simply unpause the
  // underlying stream.


  this._read = function (n) {
    debug('wrapped _read', n);

    if (paused) {
      paused = false;
      stream.resume();
    }
  };

  return this;
};

if (typeof Symbol === 'function') {
  Readable.prototype[Symbol.asyncIterator] = function () {
    if (createReadableStreamAsyncIterator$1 === undefined) {
      createReadableStreamAsyncIterator$1 = async_iterator;
    }

    return createReadableStreamAsyncIterator$1(this);
  };
}

Object.defineProperty(Readable.prototype, 'readableHighWaterMark', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.highWaterMark;
  }
});
Object.defineProperty(Readable.prototype, 'readableBuffer', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState && this._readableState.buffer;
  }
});
Object.defineProperty(Readable.prototype, 'readableFlowing', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.flowing;
  },
  set: function set(state) {
    if (this._readableState) {
      this._readableState.flowing = state;
    }
  }
}); // exposed for testing purposes only.

Readable._fromList = fromList;
Object.defineProperty(Readable.prototype, 'readableLength', {
  // making it explicit this property is not enumerable
  // because otherwise some prototype manipulation in
  // userland will fail
  enumerable: false,
  get: function get() {
    return this._readableState.length;
  }
}); // Pluck off n bytes from an array of buffers.
// Length is the combined lengths of all the buffers in the list.
// This function is designed to be inlinable, so please take care when making
// changes to the function body.

function fromList(n, state) {
  // nothing buffered
  if (state.length === 0) return null;
  var ret;
  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
    // read it all, truncate the list
    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.first();else ret = state.buffer.concat(state.length);
    state.buffer.clear();
  } else {
    // read part of list
    ret = state.buffer.consume(n, state.decoder);
  }
  return ret;
}

function endReadable(stream) {
  var state = stream._readableState;
  debug('endReadable', state.endEmitted);

  if (!state.endEmitted) {
    state.ended = true;
    process.nextTick(endReadableNT, state, stream);
  }
}

function endReadableNT(state, stream) {
  debug('endReadableNT', state.endEmitted, state.length); // Check that we didn't get one last unshift.

  if (!state.endEmitted && state.length === 0) {
    state.endEmitted = true;
    stream.readable = false;
    stream.emit('end');

    if (state.autoDestroy) {
      // In case of duplex streams we need a way to detect
      // if the writable side is ready for autoDestroy as well
      var wState = stream._writableState;

      if (!wState || wState.autoDestroy && wState.finished) {
        stream.destroy();
      }
    }
  }
}

if (typeof Symbol === 'function') {
  Readable.from = function (iterable, opts) {
    if (from === undefined) {
      from = fromBrowser;
    }

    return from(Readable, iterable, opts);
  };
}

function indexOf(xs, x) {
  for (var i = 0, l = xs.length; i < l; i++) {
    if (xs[i] === x) return i;
  }

  return -1;
}

var _stream_transform = Transform;

var _require$codes$2 = errorsBrowser.codes,
    ERR_METHOD_NOT_IMPLEMENTED$2 = _require$codes$2.ERR_METHOD_NOT_IMPLEMENTED,
    ERR_MULTIPLE_CALLBACK$1 = _require$codes$2.ERR_MULTIPLE_CALLBACK,
    ERR_TRANSFORM_ALREADY_TRANSFORMING = _require$codes$2.ERR_TRANSFORM_ALREADY_TRANSFORMING,
    ERR_TRANSFORM_WITH_LENGTH_0 = _require$codes$2.ERR_TRANSFORM_WITH_LENGTH_0;



inherits_browser(Transform, _stream_duplex);

function afterTransform(er, data) {
  var ts = this._transformState;
  ts.transforming = false;
  var cb = ts.writecb;

  if (cb === null) {
    return this.emit('error', new ERR_MULTIPLE_CALLBACK$1());
  }

  ts.writechunk = null;
  ts.writecb = null;
  if (data != null) // single equals check for both `null` and `undefined`
    this.push(data);
  cb(er);
  var rs = this._readableState;
  rs.reading = false;

  if (rs.needReadable || rs.length < rs.highWaterMark) {
    this._read(rs.highWaterMark);
  }
}

function Transform(options) {
  if (!(this instanceof Transform)) return new Transform(options);
  _stream_duplex.call(this, options);
  this._transformState = {
    afterTransform: afterTransform.bind(this),
    needTransform: false,
    transforming: false,
    writecb: null,
    writechunk: null,
    writeencoding: null
  }; // start out asking for a readable event once data is transformed.

  this._readableState.needReadable = true; // we have implemented the _read method, and done the other things
  // that Readable wants before the first _read call, so unset the
  // sync guard flag.

  this._readableState.sync = false;

  if (options) {
    if (typeof options.transform === 'function') this._transform = options.transform;
    if (typeof options.flush === 'function') this._flush = options.flush;
  } // When the writable side finishes, then flush out anything remaining.


  this.on('prefinish', prefinish$1);
}

function prefinish$1() {
  var _this = this;

  if (typeof this._flush === 'function' && !this._readableState.destroyed) {
    this._flush(function (er, data) {
      done(_this, er, data);
    });
  } else {
    done(this, null, null);
  }
}

Transform.prototype.push = function (chunk, encoding) {
  this._transformState.needTransform = false;
  return _stream_duplex.prototype.push.call(this, chunk, encoding);
}; // This is the part where you do stuff!
// override this function in implementation classes.
// 'chunk' is an input chunk.
//
// Call `push(newChunk)` to pass along transformed output
// to the readable side.  You may call 'push' zero or more times.
//
// Call `cb(err)` when you are done with this chunk.  If you pass
// an error, then that'll put the hurt on the whole operation.  If you
// never call cb(), then you'll never get another chunk.


Transform.prototype._transform = function (chunk, encoding, cb) {
  cb(new ERR_METHOD_NOT_IMPLEMENTED$2('_transform()'));
};

Transform.prototype._write = function (chunk, encoding, cb) {
  var ts = this._transformState;
  ts.writecb = cb;
  ts.writechunk = chunk;
  ts.writeencoding = encoding;

  if (!ts.transforming) {
    var rs = this._readableState;
    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
  }
}; // Doesn't matter what the args are here.
// _transform does all the work.
// That we got here means that the readable side wants more data.


Transform.prototype._read = function (n) {
  var ts = this._transformState;

  if (ts.writechunk !== null && !ts.transforming) {
    ts.transforming = true;

    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
  } else {
    // mark that we need a transform, so that any data that comes in
    // will get processed, now that we've asked for it.
    ts.needTransform = true;
  }
};

Transform.prototype._destroy = function (err, cb) {
  _stream_duplex.prototype._destroy.call(this, err, function (err2) {
    cb(err2);
  });
};

function done(stream, er, data) {
  if (er) return stream.emit('error', er);
  if (data != null) // single equals check for both `null` and `undefined`
    stream.push(data); // TODO(BridgeAR): Write a test for these two error cases
  // if there's nothing in the write buffer, then that means
  // that nothing more will ever be provided

  if (stream._writableState.length) throw new ERR_TRANSFORM_WITH_LENGTH_0();
  if (stream._transformState.transforming) throw new ERR_TRANSFORM_ALREADY_TRANSFORMING();
  return stream.push(null);
}

var _stream_passthrough = PassThrough;



inherits_browser(PassThrough, _stream_transform);

function PassThrough(options) {
  if (!(this instanceof PassThrough)) return new PassThrough(options);
  _stream_transform.call(this, options);
}

PassThrough.prototype._transform = function (chunk, encoding, cb) {
  cb(null, chunk);
};

var eos$1;

function once$1(callback) {
  var called = false;
  return function () {
    if (called) return;
    called = true;
    callback.apply(void 0, arguments);
  };
}

var _require$codes$3 = errorsBrowser.codes,
    ERR_MISSING_ARGS = _require$codes$3.ERR_MISSING_ARGS,
    ERR_STREAM_DESTROYED$1 = _require$codes$3.ERR_STREAM_DESTROYED;

function noop$1(err) {
  // Rethrow the error if it exists to avoid swallowing it
  if (err) throw err;
}

function isRequest$1(stream) {
  return stream.setHeader && typeof stream.abort === 'function';
}

function destroyer(stream, reading, writing, callback) {
  callback = once$1(callback);
  var closed = false;
  stream.on('close', function () {
    closed = true;
  });
  if (eos$1 === undefined) eos$1 = endOfStream;
  eos$1(stream, {
    readable: reading,
    writable: writing
  }, function (err) {
    if (err) return callback(err);
    closed = true;
    callback();
  });
  var destroyed = false;
  return function (err) {
    if (closed) return;
    if (destroyed) return;
    destroyed = true; // request.destroy just do .end - .abort is what we want

    if (isRequest$1(stream)) return stream.abort();
    if (typeof stream.destroy === 'function') return stream.destroy();
    callback(err || new ERR_STREAM_DESTROYED$1('pipe'));
  };
}

function call(fn) {
  fn();
}

function pipe(from, to) {
  return from.pipe(to);
}

function popCallback(streams) {
  if (!streams.length) return noop$1;
  if (typeof streams[streams.length - 1] !== 'function') return noop$1;
  return streams.pop();
}

function pipeline() {
  for (var _len = arguments.length, streams = new Array(_len), _key = 0; _key < _len; _key++) {
    streams[_key] = arguments[_key];
  }

  var callback = popCallback(streams);
  if (Array.isArray(streams[0])) streams = streams[0];

  if (streams.length < 2) {
    throw new ERR_MISSING_ARGS('streams');
  }

  var error;
  var destroys = streams.map(function (stream, i) {
    var reading = i < streams.length - 1;
    var writing = i > 0;
    return destroyer(stream, reading, writing, function (err) {
      if (!error) error = err;
      if (err) destroys.forEach(call);
      if (reading) return;
      destroys.forEach(call);
      callback(error);
    });
  });
  return streams.reduce(pipe);
}

var pipeline_1 = pipeline;

var readableBrowser = createCommonjsModule(function (module, exports) {
exports = module.exports = _stream_readable;
exports.Stream = exports;
exports.Readable = exports;
exports.Writable = _stream_writable;
exports.Duplex = _stream_duplex;
exports.Transform = _stream_transform;
exports.PassThrough = _stream_passthrough;
exports.finished = endOfStream;
exports.pipeline = pipeline_1;
});
var readableBrowser_1 = readableBrowser.Stream;
var readableBrowser_2 = readableBrowser.Readable;
var readableBrowser_3 = readableBrowser.Writable;
var readableBrowser_4 = readableBrowser.Duplex;
var readableBrowser_5 = readableBrowser.Transform;
var readableBrowser_6 = readableBrowser.PassThrough;
var readableBrowser_7 = readableBrowser.finished;
var readableBrowser_8 = readableBrowser.pipeline;

var Buffer$5 = safeBuffer.Buffer;
var Transform$1 = readableBrowser.Transform;


function throwIfNotStringOrBuffer (val, prefix) {
  if (!Buffer$5.isBuffer(val) && typeof val !== 'string') {
    throw new TypeError(prefix + ' must be a string or a buffer')
  }
}

function HashBase (blockSize) {
  Transform$1.call(this);

  this._block = Buffer$5.allocUnsafe(blockSize);
  this._blockSize = blockSize;
  this._blockOffset = 0;
  this._length = [0, 0, 0, 0];

  this._finalized = false;
}

inherits_browser(HashBase, Transform$1);

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
  if (!Buffer$5.isBuffer(data)) data = Buffer$5.from(data, encoding);

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

var Buffer$6 = safeBuffer.Buffer;

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
  var buffer = Buffer$6.allocUnsafe(16);
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

var Buffer$7 = buffer.Buffer;



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
  var buffer = Buffer$7.alloc ? Buffer$7.alloc(20) : new Buffer$7(20);
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

var Buffer$8 = safeBuffer.Buffer;

// prototype class for hash functions
function Hash (blockSize, finalSize) {
  this._block = Buffer$8.alloc(blockSize);
  this._finalSize = finalSize;
  this._blockSize = blockSize;
  this._len = 0;
}

Hash.prototype.update = function (data, enc) {
  if (typeof data === 'string') {
    enc = enc || 'utf8';
    data = Buffer$8.from(data, enc);
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



var Buffer$9 = safeBuffer.Buffer;

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
  var H = Buffer$9.allocUnsafe(20);

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



var Buffer$a = safeBuffer.Buffer;

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
  var H = Buffer$a.allocUnsafe(20);

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



var Buffer$b = safeBuffer.Buffer;

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
  var H = Buffer$b.allocUnsafe(32);

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




var Buffer$c = safeBuffer.Buffer;

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
  var H = Buffer$c.allocUnsafe(28);

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

var Buffer$d = safeBuffer.Buffer;

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
  var H = Buffer$d.allocUnsafe(64);

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

var Buffer$e = safeBuffer.Buffer;

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
  var H = Buffer$e.allocUnsafe(48);

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

var Buffer$f = safeBuffer.Buffer;
var Transform$2 = stream.Transform;
var StringDecoder$2 = string_decoder$1.StringDecoder;


function CipherBase (hashMode) {
  Transform$2.call(this);
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
inherits_browser(CipherBase, Transform$2);

CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
  if (typeof data === 'string') {
    data = Buffer$f.from(data, inputEnc);
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
  var outData = this.__final() || Buffer$f.alloc(0);
  if (outputEnc) {
    outData = this._toString(outData, outputEnc, true);
  }
  return outData
};

CipherBase.prototype._toString = function (value, enc, fin) {
  if (!this._decoder) {
    this._decoder = new StringDecoder$2(enc);
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

var browser$1 = function createHash (alg) {
  alg = alg.toLowerCase();
  if (alg === 'md5') return new md5_js()
  if (alg === 'rmd160' || alg === 'ripemd160') return new ripemd160()

  return new Hash$1(sha_js(alg))
};

var MAX_ALLOC = Math.pow(2, 30) - 1; // default in iojs

var precondition = function (iterations, keylen) {
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
} else if (process.version) {
  var pVersionMajor = parseInt(process.version.split('.')[0].slice(1), 10);

  defaultEncoding = pVersionMajor >= 6 ? 'utf-8' : 'binary';
} else {
  defaultEncoding = 'utf-8';
}
var defaultEncoding_1 = defaultEncoding;

var md5 = function (buffer) {
  return new md5_js().update(buffer).digest()
};

var Buffer$g = safeBuffer.Buffer;

var toBuffer = function (thing, encoding, name) {
  if (Buffer$g.isBuffer(thing)) {
    return thing
  } else if (typeof thing === 'string') {
    return Buffer$g.from(thing, encoding)
  } else if (ArrayBuffer.isView(thing)) {
    return Buffer$g.from(thing.buffer)
  } else {
    throw new TypeError(name + ' must be a string, a Buffer, a typed array or a DataView')
  }
};

var Buffer$h = safeBuffer.Buffer;





var ZEROS = Buffer$h.alloc(128);
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
    key = Buffer$h.concat([key, ZEROS], blocksize);
  }

  var ipad = Buffer$h.allocUnsafe(blocksize + sizes[alg]);
  var opad = Buffer$h.allocUnsafe(blocksize + sizes[alg]);
  for (var i = 0; i < blocksize; i++) {
    ipad[i] = key[i] ^ 0x36;
    opad[i] = key[i] ^ 0x5C;
  }

  var ipad1 = Buffer$h.allocUnsafe(blocksize + saltLen + 4);
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
  precondition(iterations, keylen);
  password = toBuffer(password, defaultEncoding_1, 'Password');
  salt = toBuffer(salt, defaultEncoding_1, 'Salt');

  digest = digest || 'sha1';

  var hmac = new Hmac(digest, password, salt.length);

  var DK = Buffer$h.allocUnsafe(keylen);
  var block1 = Buffer$h.allocUnsafe(salt.length + 4);
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

var Buffer$i = safeBuffer.Buffer;






var ZERO_BUF;
var subtle = commonjsGlobal.crypto && commonjsGlobal.crypto.subtle;
var toBrowser = {
  sha: 'SHA-1',
  'sha-1': 'SHA-1',
  sha1: 'SHA-1',
  sha256: 'SHA-256',
  'sha-256': 'SHA-256',
  sha384: 'SHA-384',
  'sha-384': 'SHA-384',
  'sha-512': 'SHA-512',
  sha512: 'SHA-512'
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
  ZERO_BUF = ZERO_BUF || Buffer$i.alloc(8);
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
    'raw', password, { name: 'PBKDF2' }, false, ['deriveBits']
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
    return Buffer$i.from(res)
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

  precondition(iterations, keylen);
  password = toBuffer(password, defaultEncoding_1, 'Password');
  salt = toBuffer(salt, defaultEncoding_1, 'Salt');
  if (typeof callback !== 'function') throw new Error('No callback provided to pbkdf2')

  resolvePromise(checkNative(algo).then(function (resp) {
    if (resp) return browserPbkdf2(password, salt, iterations, keylen, algo)

    return syncBrowser(password, salt, iterations, keylen, digest)
  }), callback);
};

var pbkdf2$1 = async;
var pbkdf2Sync = syncBrowser;

var browser$2 = {
	pbkdf2: pbkdf2$1,
	pbkdf2Sync: pbkdf2Sync
};

var browser$3 = createCommonjsModule(function (module) {

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
    const hash = browser$1('sha256')
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
    return browser$2.pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512');
}
exports.mnemonicToSeedSync = mnemonicToSeedSync;
function mnemonicToSeed(mnemonic, password) {
    return new Promise((resolve, reject) => {
        try {
            const mnemonicBuffer = Buffer.from((mnemonic || '').normalize('NFKD'), 'utf8');
            const saltBuffer = Buffer.from(salt((password || '').normalize('NFKD')), 'utf8');
            browser$2.pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64, 'sha512', (err, data) => {
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
    rng = rng || browser$3;
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

var bind = function bind(fn, thisArg) {
  return function wrap() {
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; i++) {
      args[i] = arguments[i];
    }
    return fn.apply(thisArg, args);
  };
};

/*global toString:true*/

// utils is a library of generic helper functions non-specific to axios

var toString = Object.prototype.toString;

/**
 * Determine if a value is an Array
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Array, otherwise false
 */
function isArray(val) {
  return toString.call(val) === '[object Array]';
}

/**
 * Determine if a value is undefined
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if the value is undefined, otherwise false
 */
function isUndefined(val) {
  return typeof val === 'undefined';
}

/**
 * Determine if a value is a Buffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Buffer, otherwise false
 */
function isBuffer(val) {
  return val !== null && !isUndefined(val) && val.constructor !== null && !isUndefined(val.constructor)
    && typeof val.constructor.isBuffer === 'function' && val.constructor.isBuffer(val);
}

/**
 * Determine if a value is an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an ArrayBuffer, otherwise false
 */
function isArrayBuffer(val) {
  return toString.call(val) === '[object ArrayBuffer]';
}

/**
 * Determine if a value is a FormData
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an FormData, otherwise false
 */
function isFormData(val) {
  return (typeof FormData !== 'undefined') && (val instanceof FormData);
}

/**
 * Determine if a value is a view on an ArrayBuffer
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a view on an ArrayBuffer, otherwise false
 */
function isArrayBufferView(val) {
  var result;
  if ((typeof ArrayBuffer !== 'undefined') && (ArrayBuffer.isView)) {
    result = ArrayBuffer.isView(val);
  } else {
    result = (val) && (val.buffer) && (val.buffer instanceof ArrayBuffer);
  }
  return result;
}

/**
 * Determine if a value is a String
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a String, otherwise false
 */
function isString(val) {
  return typeof val === 'string';
}

/**
 * Determine if a value is a Number
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Number, otherwise false
 */
function isNumber(val) {
  return typeof val === 'number';
}

/**
 * Determine if a value is an Object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is an Object, otherwise false
 */
function isObject(val) {
  return val !== null && typeof val === 'object';
}

/**
 * Determine if a value is a Date
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Date, otherwise false
 */
function isDate(val) {
  return toString.call(val) === '[object Date]';
}

/**
 * Determine if a value is a File
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a File, otherwise false
 */
function isFile(val) {
  return toString.call(val) === '[object File]';
}

/**
 * Determine if a value is a Blob
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Blob, otherwise false
 */
function isBlob(val) {
  return toString.call(val) === '[object Blob]';
}

/**
 * Determine if a value is a Function
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Function, otherwise false
 */
function isFunction(val) {
  return toString.call(val) === '[object Function]';
}

/**
 * Determine if a value is a Stream
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a Stream, otherwise false
 */
function isStream(val) {
  return isObject(val) && isFunction(val.pipe);
}

/**
 * Determine if a value is a URLSearchParams object
 *
 * @param {Object} val The value to test
 * @returns {boolean} True if value is a URLSearchParams object, otherwise false
 */
function isURLSearchParams(val) {
  return typeof URLSearchParams !== 'undefined' && val instanceof URLSearchParams;
}

/**
 * Trim excess whitespace off the beginning and end of a string
 *
 * @param {String} str The String to trim
 * @returns {String} The String freed of excess whitespace
 */
function trim(str) {
  return str.replace(/^\s*/, '').replace(/\s*$/, '');
}

/**
 * Determine if we're running in a standard browser environment
 *
 * This allows axios to run in a web worker, and react-native.
 * Both environments support XMLHttpRequest, but not fully standard globals.
 *
 * web workers:
 *  typeof window -> undefined
 *  typeof document -> undefined
 *
 * react-native:
 *  navigator.product -> 'ReactNative'
 * nativescript
 *  navigator.product -> 'NativeScript' or 'NS'
 */
function isStandardBrowserEnv() {
  if (typeof navigator !== 'undefined' && (navigator.product === 'ReactNative' ||
                                           navigator.product === 'NativeScript' ||
                                           navigator.product === 'NS')) {
    return false;
  }
  return (
    typeof window !== 'undefined' &&
    typeof document !== 'undefined'
  );
}

/**
 * Iterate over an Array or an Object invoking a function for each item.
 *
 * If `obj` is an Array callback will be called passing
 * the value, index, and complete array for each item.
 *
 * If 'obj' is an Object callback will be called passing
 * the value, key, and complete object for each property.
 *
 * @param {Object|Array} obj The object to iterate
 * @param {Function} fn The callback to invoke for each item
 */
function forEach(obj, fn) {
  // Don't bother if no value provided
  if (obj === null || typeof obj === 'undefined') {
    return;
  }

  // Force an array if not already something iterable
  if (typeof obj !== 'object') {
    /*eslint no-param-reassign:0*/
    obj = [obj];
  }

  if (isArray(obj)) {
    // Iterate over array values
    for (var i = 0, l = obj.length; i < l; i++) {
      fn.call(null, obj[i], i, obj);
    }
  } else {
    // Iterate over object keys
    for (var key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        fn.call(null, obj[key], key, obj);
      }
    }
  }
}

/**
 * Accepts varargs expecting each argument to be an object, then
 * immutably merges the properties of each object and returns result.
 *
 * When multiple objects contain the same key the later object in
 * the arguments list will take precedence.
 *
 * Example:
 *
 * ```js
 * var result = merge({foo: 123}, {foo: 456});
 * console.log(result.foo); // outputs 456
 * ```
 *
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function merge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = merge(result[key], val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Function equal to merge with the difference being that no reference
 * to original objects is kept.
 *
 * @see merge
 * @param {Object} obj1 Object to merge
 * @returns {Object} Result of all merge properties
 */
function deepMerge(/* obj1, obj2, obj3, ... */) {
  var result = {};
  function assignValue(val, key) {
    if (typeof result[key] === 'object' && typeof val === 'object') {
      result[key] = deepMerge(result[key], val);
    } else if (typeof val === 'object') {
      result[key] = deepMerge({}, val);
    } else {
      result[key] = val;
    }
  }

  for (var i = 0, l = arguments.length; i < l; i++) {
    forEach(arguments[i], assignValue);
  }
  return result;
}

/**
 * Extends object a by mutably adding to it the properties of object b.
 *
 * @param {Object} a The object to be extended
 * @param {Object} b The object to copy properties from
 * @param {Object} thisArg The object to bind function to
 * @return {Object} The resulting value of object a
 */
function extend(a, b, thisArg) {
  forEach(b, function assignValue(val, key) {
    if (thisArg && typeof val === 'function') {
      a[key] = bind(val, thisArg);
    } else {
      a[key] = val;
    }
  });
  return a;
}

var utils = {
  isArray: isArray,
  isArrayBuffer: isArrayBuffer,
  isBuffer: isBuffer,
  isFormData: isFormData,
  isArrayBufferView: isArrayBufferView,
  isString: isString,
  isNumber: isNumber,
  isObject: isObject,
  isUndefined: isUndefined,
  isDate: isDate,
  isFile: isFile,
  isBlob: isBlob,
  isFunction: isFunction,
  isStream: isStream,
  isURLSearchParams: isURLSearchParams,
  isStandardBrowserEnv: isStandardBrowserEnv,
  forEach: forEach,
  merge: merge,
  deepMerge: deepMerge,
  extend: extend,
  trim: trim
};

function encode(val) {
  return encodeURIComponent(val).
    replace(/%40/gi, '@').
    replace(/%3A/gi, ':').
    replace(/%24/g, '$').
    replace(/%2C/gi, ',').
    replace(/%20/g, '+').
    replace(/%5B/gi, '[').
    replace(/%5D/gi, ']');
}

/**
 * Build a URL by appending params to the end
 *
 * @param {string} url The base of the url (e.g., http://www.google.com)
 * @param {object} [params] The params to be appended
 * @returns {string} The formatted url
 */
var buildURL = function buildURL(url, params, paramsSerializer) {
  /*eslint no-param-reassign:0*/
  if (!params) {
    return url;
  }

  var serializedParams;
  if (paramsSerializer) {
    serializedParams = paramsSerializer(params);
  } else if (utils.isURLSearchParams(params)) {
    serializedParams = params.toString();
  } else {
    var parts = [];

    utils.forEach(params, function serialize(val, key) {
      if (val === null || typeof val === 'undefined') {
        return;
      }

      if (utils.isArray(val)) {
        key = key + '[]';
      } else {
        val = [val];
      }

      utils.forEach(val, function parseValue(v) {
        if (utils.isDate(v)) {
          v = v.toISOString();
        } else if (utils.isObject(v)) {
          v = JSON.stringify(v);
        }
        parts.push(encode(key) + '=' + encode(v));
      });
    });

    serializedParams = parts.join('&');
  }

  if (serializedParams) {
    var hashmarkIndex = url.indexOf('#');
    if (hashmarkIndex !== -1) {
      url = url.slice(0, hashmarkIndex);
    }

    url += (url.indexOf('?') === -1 ? '?' : '&') + serializedParams;
  }

  return url;
};

function InterceptorManager() {
  this.handlers = [];
}

/**
 * Add a new interceptor to the stack
 *
 * @param {Function} fulfilled The function to handle `then` for a `Promise`
 * @param {Function} rejected The function to handle `reject` for a `Promise`
 *
 * @return {Number} An ID used to remove interceptor later
 */
InterceptorManager.prototype.use = function use(fulfilled, rejected) {
  this.handlers.push({
    fulfilled: fulfilled,
    rejected: rejected
  });
  return this.handlers.length - 1;
};

/**
 * Remove an interceptor from the stack
 *
 * @param {Number} id The ID that was returned by `use`
 */
InterceptorManager.prototype.eject = function eject(id) {
  if (this.handlers[id]) {
    this.handlers[id] = null;
  }
};

/**
 * Iterate over all the registered interceptors
 *
 * This method is particularly useful for skipping over any
 * interceptors that may have become `null` calling `eject`.
 *
 * @param {Function} fn The function to call for each interceptor
 */
InterceptorManager.prototype.forEach = function forEach(fn) {
  utils.forEach(this.handlers, function forEachHandler(h) {
    if (h !== null) {
      fn(h);
    }
  });
};

var InterceptorManager_1 = InterceptorManager;

/**
 * Transform the data for a request or a response
 *
 * @param {Object|String} data The data to be transformed
 * @param {Array} headers The headers for the request or response
 * @param {Array|Function} fns A single function or Array of functions
 * @returns {*} The resulting transformed data
 */
var transformData = function transformData(data, headers, fns) {
  /*eslint no-param-reassign:0*/
  utils.forEach(fns, function transform(fn) {
    data = fn(data, headers);
  });

  return data;
};

var isCancel = function isCancel(value) {
  return !!(value && value.__CANCEL__);
};

var normalizeHeaderName = function normalizeHeaderName(headers, normalizedName) {
  utils.forEach(headers, function processHeader(value, name) {
    if (name !== normalizedName && name.toUpperCase() === normalizedName.toUpperCase()) {
      headers[normalizedName] = value;
      delete headers[name];
    }
  });
};

/**
 * Update an Error with the specified config, error code, and response.
 *
 * @param {Error} error The error to update.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The error.
 */
var enhanceError = function enhanceError(error, config, code, request, response) {
  error.config = config;
  if (code) {
    error.code = code;
  }

  error.request = request;
  error.response = response;
  error.isAxiosError = true;

  error.toJSON = function() {
    return {
      // Standard
      message: this.message,
      name: this.name,
      // Microsoft
      description: this.description,
      number: this.number,
      // Mozilla
      fileName: this.fileName,
      lineNumber: this.lineNumber,
      columnNumber: this.columnNumber,
      stack: this.stack,
      // Axios
      config: this.config,
      code: this.code
    };
  };
  return error;
};

/**
 * Create an Error with the specified message, config, error code, request and response.
 *
 * @param {string} message The error message.
 * @param {Object} config The config.
 * @param {string} [code] The error code (for example, 'ECONNABORTED').
 * @param {Object} [request] The request.
 * @param {Object} [response] The response.
 * @returns {Error} The created error.
 */
var createError = function createError(message, config, code, request, response) {
  var error = new Error(message);
  return enhanceError(error, config, code, request, response);
};

/**
 * Resolve or reject a Promise based on response status.
 *
 * @param {Function} resolve A function that resolves the promise.
 * @param {Function} reject A function that rejects the promise.
 * @param {object} response The response.
 */
var settle = function settle(resolve, reject, response) {
  var validateStatus = response.config.validateStatus;
  if (!validateStatus || validateStatus(response.status)) {
    resolve(response);
  } else {
    reject(createError(
      'Request failed with status code ' + response.status,
      response.config,
      null,
      response.request,
      response
    ));
  }
};

/**
 * Determines whether the specified URL is absolute
 *
 * @param {string} url The URL to test
 * @returns {boolean} True if the specified URL is absolute, otherwise false
 */
var isAbsoluteURL = function isAbsoluteURL(url) {
  // A URL is considered absolute if it begins with "<scheme>://" or "//" (protocol-relative URL).
  // RFC 3986 defines scheme name as a sequence of characters beginning with a letter and followed
  // by any combination of letters, digits, plus, period, or hyphen.
  return /^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(url);
};

/**
 * Creates a new URL by combining the specified URLs
 *
 * @param {string} baseURL The base URL
 * @param {string} relativeURL The relative URL
 * @returns {string} The combined URL
 */
var combineURLs = function combineURLs(baseURL, relativeURL) {
  return relativeURL
    ? baseURL.replace(/\/+$/, '') + '/' + relativeURL.replace(/^\/+/, '')
    : baseURL;
};

/**
 * Creates a new URL by combining the baseURL with the requestedURL,
 * only when the requestedURL is not already an absolute URL.
 * If the requestURL is absolute, this function returns the requestedURL untouched.
 *
 * @param {string} baseURL The base URL
 * @param {string} requestedURL Absolute or relative URL to combine
 * @returns {string} The combined full path
 */
var buildFullPath = function buildFullPath(baseURL, requestedURL) {
  if (baseURL && !isAbsoluteURL(requestedURL)) {
    return combineURLs(baseURL, requestedURL);
  }
  return requestedURL;
};

// Headers whose duplicates are ignored by node
// c.f. https://nodejs.org/api/http.html#http_message_headers
var ignoreDuplicateOf = [
  'age', 'authorization', 'content-length', 'content-type', 'etag',
  'expires', 'from', 'host', 'if-modified-since', 'if-unmodified-since',
  'last-modified', 'location', 'max-forwards', 'proxy-authorization',
  'referer', 'retry-after', 'user-agent'
];

/**
 * Parse headers into an object
 *
 * ```
 * Date: Wed, 27 Aug 2014 08:58:49 GMT
 * Content-Type: application/json
 * Connection: keep-alive
 * Transfer-Encoding: chunked
 * ```
 *
 * @param {String} headers Headers needing to be parsed
 * @returns {Object} Headers parsed into an object
 */
var parseHeaders = function parseHeaders(headers) {
  var parsed = {};
  var key;
  var val;
  var i;

  if (!headers) { return parsed; }

  utils.forEach(headers.split('\n'), function parser(line) {
    i = line.indexOf(':');
    key = utils.trim(line.substr(0, i)).toLowerCase();
    val = utils.trim(line.substr(i + 1));

    if (key) {
      if (parsed[key] && ignoreDuplicateOf.indexOf(key) >= 0) {
        return;
      }
      if (key === 'set-cookie') {
        parsed[key] = (parsed[key] ? parsed[key] : []).concat([val]);
      } else {
        parsed[key] = parsed[key] ? parsed[key] + ', ' + val : val;
      }
    }
  });

  return parsed;
};

var isURLSameOrigin = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs have full support of the APIs needed to test
  // whether the request URL is of the same origin as current location.
    (function standardBrowserEnv() {
      var msie = /(msie|trident)/i.test(navigator.userAgent);
      var urlParsingNode = document.createElement('a');
      var originURL;

      /**
    * Parse a URL to discover it's components
    *
    * @param {String} url The URL to be parsed
    * @returns {Object}
    */
      function resolveURL(url) {
        var href = url;

        if (msie) {
        // IE needs attribute set twice to normalize properties
          urlParsingNode.setAttribute('href', href);
          href = urlParsingNode.href;
        }

        urlParsingNode.setAttribute('href', href);

        // urlParsingNode provides the UrlUtils interface - http://url.spec.whatwg.org/#urlutils
        return {
          href: urlParsingNode.href,
          protocol: urlParsingNode.protocol ? urlParsingNode.protocol.replace(/:$/, '') : '',
          host: urlParsingNode.host,
          search: urlParsingNode.search ? urlParsingNode.search.replace(/^\?/, '') : '',
          hash: urlParsingNode.hash ? urlParsingNode.hash.replace(/^#/, '') : '',
          hostname: urlParsingNode.hostname,
          port: urlParsingNode.port,
          pathname: (urlParsingNode.pathname.charAt(0) === '/') ?
            urlParsingNode.pathname :
            '/' + urlParsingNode.pathname
        };
      }

      originURL = resolveURL(window.location.href);

      /**
    * Determine if a URL shares the same origin as the current location
    *
    * @param {String} requestURL The URL to test
    * @returns {boolean} True if URL shares the same origin, otherwise false
    */
      return function isURLSameOrigin(requestURL) {
        var parsed = (utils.isString(requestURL)) ? resolveURL(requestURL) : requestURL;
        return (parsed.protocol === originURL.protocol &&
            parsed.host === originURL.host);
      };
    })() :

  // Non standard browser envs (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return function isURLSameOrigin() {
        return true;
      };
    })()
);

var cookies = (
  utils.isStandardBrowserEnv() ?

  // Standard browser envs support document.cookie
    (function standardBrowserEnv() {
      return {
        write: function write(name, value, expires, path, domain, secure) {
          var cookie = [];
          cookie.push(name + '=' + encodeURIComponent(value));

          if (utils.isNumber(expires)) {
            cookie.push('expires=' + new Date(expires).toGMTString());
          }

          if (utils.isString(path)) {
            cookie.push('path=' + path);
          }

          if (utils.isString(domain)) {
            cookie.push('domain=' + domain);
          }

          if (secure === true) {
            cookie.push('secure');
          }

          document.cookie = cookie.join('; ');
        },

        read: function read(name) {
          var match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
          return (match ? decodeURIComponent(match[3]) : null);
        },

        remove: function remove(name) {
          this.write(name, '', Date.now() - 86400000);
        }
      };
    })() :

  // Non standard browser env (web workers, react-native) lack needed support.
    (function nonStandardBrowserEnv() {
      return {
        write: function write() {},
        read: function read() { return null; },
        remove: function remove() {}
      };
    })()
);

var xhr = function xhrAdapter(config) {
  return new Promise(function dispatchXhrRequest(resolve, reject) {
    var requestData = config.data;
    var requestHeaders = config.headers;

    if (utils.isFormData(requestData)) {
      delete requestHeaders['Content-Type']; // Let the browser set it
    }

    var request = new XMLHttpRequest();

    // HTTP basic authentication
    if (config.auth) {
      var username = config.auth.username || '';
      var password = config.auth.password || '';
      requestHeaders.Authorization = 'Basic ' + btoa(username + ':' + password);
    }

    var fullPath = buildFullPath(config.baseURL, config.url);
    request.open(config.method.toUpperCase(), buildURL(fullPath, config.params, config.paramsSerializer), true);

    // Set the request timeout in MS
    request.timeout = config.timeout;

    // Listen for ready state
    request.onreadystatechange = function handleLoad() {
      if (!request || request.readyState !== 4) {
        return;
      }

      // The request errored out and we didn't get a response, this will be
      // handled by onerror instead
      // With one exception: request that using file: protocol, most browsers
      // will return status as 0 even though it's a successful request
      if (request.status === 0 && !(request.responseURL && request.responseURL.indexOf('file:') === 0)) {
        return;
      }

      // Prepare the response
      var responseHeaders = 'getAllResponseHeaders' in request ? parseHeaders(request.getAllResponseHeaders()) : null;
      var responseData = !config.responseType || config.responseType === 'text' ? request.responseText : request.response;
      var response = {
        data: responseData,
        status: request.status,
        statusText: request.statusText,
        headers: responseHeaders,
        config: config,
        request: request
      };

      settle(resolve, reject, response);

      // Clean up request
      request = null;
    };

    // Handle browser request cancellation (as opposed to a manual cancellation)
    request.onabort = function handleAbort() {
      if (!request) {
        return;
      }

      reject(createError('Request aborted', config, 'ECONNABORTED', request));

      // Clean up request
      request = null;
    };

    // Handle low level network errors
    request.onerror = function handleError() {
      // Real errors are hidden from us by the browser
      // onerror should only fire if it's a network error
      reject(createError('Network Error', config, null, request));

      // Clean up request
      request = null;
    };

    // Handle timeout
    request.ontimeout = function handleTimeout() {
      var timeoutErrorMessage = 'timeout of ' + config.timeout + 'ms exceeded';
      if (config.timeoutErrorMessage) {
        timeoutErrorMessage = config.timeoutErrorMessage;
      }
      reject(createError(timeoutErrorMessage, config, 'ECONNABORTED',
        request));

      // Clean up request
      request = null;
    };

    // Add xsrf header
    // This is only done if running in a standard browser environment.
    // Specifically not if we're in a web worker, or react-native.
    if (utils.isStandardBrowserEnv()) {
      var cookies$1 = cookies;

      // Add xsrf header
      var xsrfValue = (config.withCredentials || isURLSameOrigin(fullPath)) && config.xsrfCookieName ?
        cookies$1.read(config.xsrfCookieName) :
        undefined;

      if (xsrfValue) {
        requestHeaders[config.xsrfHeaderName] = xsrfValue;
      }
    }

    // Add headers to the request
    if ('setRequestHeader' in request) {
      utils.forEach(requestHeaders, function setRequestHeader(val, key) {
        if (typeof requestData === 'undefined' && key.toLowerCase() === 'content-type') {
          // Remove Content-Type if data is undefined
          delete requestHeaders[key];
        } else {
          // Otherwise add header to the request
          request.setRequestHeader(key, val);
        }
      });
    }

    // Add withCredentials to request if needed
    if (!utils.isUndefined(config.withCredentials)) {
      request.withCredentials = !!config.withCredentials;
    }

    // Add responseType to request if needed
    if (config.responseType) {
      try {
        request.responseType = config.responseType;
      } catch (e) {
        // Expected DOMException thrown by browsers not compatible XMLHttpRequest Level 2.
        // But, this can be suppressed for 'json' type as it can be parsed by default 'transformResponse' function.
        if (config.responseType !== 'json') {
          throw e;
        }
      }
    }

    // Handle progress if needed
    if (typeof config.onDownloadProgress === 'function') {
      request.addEventListener('progress', config.onDownloadProgress);
    }

    // Not all browsers support upload events
    if (typeof config.onUploadProgress === 'function' && request.upload) {
      request.upload.addEventListener('progress', config.onUploadProgress);
    }

    if (config.cancelToken) {
      // Handle cancellation
      config.cancelToken.promise.then(function onCanceled(cancel) {
        if (!request) {
          return;
        }

        request.abort();
        reject(cancel);
        // Clean up request
        request = null;
      });
    }

    if (requestData === undefined) {
      requestData = null;
    }

    // Send the request
    request.send(requestData);
  });
};

var DEFAULT_CONTENT_TYPE = {
  'Content-Type': 'application/x-www-form-urlencoded'
};

function setContentTypeIfUnset(headers, value) {
  if (!utils.isUndefined(headers) && utils.isUndefined(headers['Content-Type'])) {
    headers['Content-Type'] = value;
  }
}

function getDefaultAdapter() {
  var adapter;
  if (typeof XMLHttpRequest !== 'undefined') {
    // For browsers use XHR adapter
    adapter = xhr;
  } else if (typeof process !== 'undefined' && Object.prototype.toString.call(process) === '[object process]') {
    // For node use HTTP adapter
    adapter = xhr;
  }
  return adapter;
}

var defaults = {
  adapter: getDefaultAdapter(),

  transformRequest: [function transformRequest(data, headers) {
    normalizeHeaderName(headers, 'Accept');
    normalizeHeaderName(headers, 'Content-Type');
    if (utils.isFormData(data) ||
      utils.isArrayBuffer(data) ||
      utils.isBuffer(data) ||
      utils.isStream(data) ||
      utils.isFile(data) ||
      utils.isBlob(data)
    ) {
      return data;
    }
    if (utils.isArrayBufferView(data)) {
      return data.buffer;
    }
    if (utils.isURLSearchParams(data)) {
      setContentTypeIfUnset(headers, 'application/x-www-form-urlencoded;charset=utf-8');
      return data.toString();
    }
    if (utils.isObject(data)) {
      setContentTypeIfUnset(headers, 'application/json;charset=utf-8');
      return JSON.stringify(data);
    }
    return data;
  }],

  transformResponse: [function transformResponse(data) {
    /*eslint no-param-reassign:0*/
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data);
      } catch (e) { /* Ignore */ }
    }
    return data;
  }],

  /**
   * A timeout in milliseconds to abort a request. If set to 0 (default) a
   * timeout is not created.
   */
  timeout: 0,

  xsrfCookieName: 'XSRF-TOKEN',
  xsrfHeaderName: 'X-XSRF-TOKEN',

  maxContentLength: -1,

  validateStatus: function validateStatus(status) {
    return status >= 200 && status < 300;
  }
};

defaults.headers = {
  common: {
    'Accept': 'application/json, text/plain, */*'
  }
};

utils.forEach(['delete', 'get', 'head'], function forEachMethodNoData(method) {
  defaults.headers[method] = {};
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  defaults.headers[method] = utils.merge(DEFAULT_CONTENT_TYPE);
});

var defaults_1 = defaults;

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
function throwIfCancellationRequested(config) {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested();
  }
}

/**
 * Dispatch a request to the server using the configured adapter.
 *
 * @param {object} config The config that is to be used for the request
 * @returns {Promise} The Promise to be fulfilled
 */
var dispatchRequest = function dispatchRequest(config) {
  throwIfCancellationRequested(config);

  // Ensure headers exist
  config.headers = config.headers || {};

  // Transform request data
  config.data = transformData(
    config.data,
    config.headers,
    config.transformRequest
  );

  // Flatten headers
  config.headers = utils.merge(
    config.headers.common || {},
    config.headers[config.method] || {},
    config.headers
  );

  utils.forEach(
    ['delete', 'get', 'head', 'post', 'put', 'patch', 'common'],
    function cleanHeaderConfig(method) {
      delete config.headers[method];
    }
  );

  var adapter = config.adapter || defaults_1.adapter;

  return adapter(config).then(function onAdapterResolution(response) {
    throwIfCancellationRequested(config);

    // Transform response data
    response.data = transformData(
      response.data,
      response.headers,
      config.transformResponse
    );

    return response;
  }, function onAdapterRejection(reason) {
    if (!isCancel(reason)) {
      throwIfCancellationRequested(config);

      // Transform response data
      if (reason && reason.response) {
        reason.response.data = transformData(
          reason.response.data,
          reason.response.headers,
          config.transformResponse
        );
      }
    }

    return Promise.reject(reason);
  });
};

/**
 * Config-specific merge-function which creates a new config-object
 * by merging two configuration objects together.
 *
 * @param {Object} config1
 * @param {Object} config2
 * @returns {Object} New object resulting from merging config2 to config1
 */
var mergeConfig = function mergeConfig(config1, config2) {
  // eslint-disable-next-line no-param-reassign
  config2 = config2 || {};
  var config = {};

  var valueFromConfig2Keys = ['url', 'method', 'params', 'data'];
  var mergeDeepPropertiesKeys = ['headers', 'auth', 'proxy'];
  var defaultToConfig2Keys = [
    'baseURL', 'url', 'transformRequest', 'transformResponse', 'paramsSerializer',
    'timeout', 'withCredentials', 'adapter', 'responseType', 'xsrfCookieName',
    'xsrfHeaderName', 'onUploadProgress', 'onDownloadProgress',
    'maxContentLength', 'validateStatus', 'maxRedirects', 'httpAgent',
    'httpsAgent', 'cancelToken', 'socketPath'
  ];

  utils.forEach(valueFromConfig2Keys, function valueFromConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    }
  });

  utils.forEach(mergeDeepPropertiesKeys, function mergeDeepProperties(prop) {
    if (utils.isObject(config2[prop])) {
      config[prop] = utils.deepMerge(config1[prop], config2[prop]);
    } else if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (utils.isObject(config1[prop])) {
      config[prop] = utils.deepMerge(config1[prop]);
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  utils.forEach(defaultToConfig2Keys, function defaultToConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  var axiosKeys = valueFromConfig2Keys
    .concat(mergeDeepPropertiesKeys)
    .concat(defaultToConfig2Keys);

  var otherKeys = Object
    .keys(config2)
    .filter(function filterAxiosKeys(key) {
      return axiosKeys.indexOf(key) === -1;
    });

  utils.forEach(otherKeys, function otherKeysDefaultToConfig2(prop) {
    if (typeof config2[prop] !== 'undefined') {
      config[prop] = config2[prop];
    } else if (typeof config1[prop] !== 'undefined') {
      config[prop] = config1[prop];
    }
  });

  return config;
};

/**
 * Create a new instance of Axios
 *
 * @param {Object} instanceConfig The default config for the instance
 */
function Axios(instanceConfig) {
  this.defaults = instanceConfig;
  this.interceptors = {
    request: new InterceptorManager_1(),
    response: new InterceptorManager_1()
  };
}

/**
 * Dispatch a request
 *
 * @param {Object} config The config specific for this request (merged with this.defaults)
 */
Axios.prototype.request = function request(config) {
  /*eslint no-param-reassign:0*/
  // Allow for axios('example/url'[, config]) a la fetch API
  if (typeof config === 'string') {
    config = arguments[1] || {};
    config.url = arguments[0];
  } else {
    config = config || {};
  }

  config = mergeConfig(this.defaults, config);

  // Set config.method
  if (config.method) {
    config.method = config.method.toLowerCase();
  } else if (this.defaults.method) {
    config.method = this.defaults.method.toLowerCase();
  } else {
    config.method = 'get';
  }

  // Hook up interceptors middleware
  var chain = [dispatchRequest, undefined];
  var promise = Promise.resolve(config);

  this.interceptors.request.forEach(function unshiftRequestInterceptors(interceptor) {
    chain.unshift(interceptor.fulfilled, interceptor.rejected);
  });

  this.interceptors.response.forEach(function pushResponseInterceptors(interceptor) {
    chain.push(interceptor.fulfilled, interceptor.rejected);
  });

  while (chain.length) {
    promise = promise.then(chain.shift(), chain.shift());
  }

  return promise;
};

Axios.prototype.getUri = function getUri(config) {
  config = mergeConfig(this.defaults, config);
  return buildURL(config.url, config.params, config.paramsSerializer).replace(/^\?/, '');
};

// Provide aliases for supported request methods
utils.forEach(['delete', 'get', 'head', 'options'], function forEachMethodNoData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url
    }));
  };
});

utils.forEach(['post', 'put', 'patch'], function forEachMethodWithData(method) {
  /*eslint func-names:0*/
  Axios.prototype[method] = function(url, data, config) {
    return this.request(utils.merge(config || {}, {
      method: method,
      url: url,
      data: data
    }));
  };
});

var Axios_1 = Axios;

/**
 * A `Cancel` is an object that is thrown when an operation is canceled.
 *
 * @class
 * @param {string=} message The message.
 */
function Cancel(message) {
  this.message = message;
}

Cancel.prototype.toString = function toString() {
  return 'Cancel' + (this.message ? ': ' + this.message : '');
};

Cancel.prototype.__CANCEL__ = true;

var Cancel_1 = Cancel;

/**
 * A `CancelToken` is an object that can be used to request cancellation of an operation.
 *
 * @class
 * @param {Function} executor The executor function.
 */
function CancelToken(executor) {
  if (typeof executor !== 'function') {
    throw new TypeError('executor must be a function.');
  }

  var resolvePromise;
  this.promise = new Promise(function promiseExecutor(resolve) {
    resolvePromise = resolve;
  });

  var token = this;
  executor(function cancel(message) {
    if (token.reason) {
      // Cancellation has already been requested
      return;
    }

    token.reason = new Cancel_1(message);
    resolvePromise(token.reason);
  });
}

/**
 * Throws a `Cancel` if cancellation has been requested.
 */
CancelToken.prototype.throwIfRequested = function throwIfRequested() {
  if (this.reason) {
    throw this.reason;
  }
};

/**
 * Returns an object that contains a new `CancelToken` and a function that, when called,
 * cancels the `CancelToken`.
 */
CancelToken.source = function source() {
  var cancel;
  var token = new CancelToken(function executor(c) {
    cancel = c;
  });
  return {
    token: token,
    cancel: cancel
  };
};

var CancelToken_1 = CancelToken;

/**
 * Syntactic sugar for invoking a function and expanding an array for arguments.
 *
 * Common use case would be to use `Function.prototype.apply`.
 *
 *  ```js
 *  function f(x, y, z) {}
 *  var args = [1, 2, 3];
 *  f.apply(null, args);
 *  ```
 *
 * With `spread` this example can be re-written.
 *
 *  ```js
 *  spread(function(x, y, z) {})([1, 2, 3]);
 *  ```
 *
 * @param {Function} callback
 * @returns {Function}
 */
var spread = function spread(callback) {
  return function wrap(arr) {
    return callback.apply(null, arr);
  };
};

/**
 * Create an instance of Axios
 *
 * @param {Object} defaultConfig The default config for the instance
 * @return {Axios} A new instance of Axios
 */
function createInstance(defaultConfig) {
  var context = new Axios_1(defaultConfig);
  var instance = bind(Axios_1.prototype.request, context);

  // Copy axios.prototype to instance
  utils.extend(instance, Axios_1.prototype, context);

  // Copy context to instance
  utils.extend(instance, context);

  return instance;
}

// Create the default instance to be exported
var axios = createInstance(defaults_1);

// Expose Axios class to allow class inheritance
axios.Axios = Axios_1;

// Factory for creating new instances
axios.create = function create(instanceConfig) {
  return createInstance(mergeConfig(axios.defaults, instanceConfig));
};

// Expose Cancel & CancelToken
axios.Cancel = Cancel_1;
axios.CancelToken = CancelToken_1;
axios.isCancel = isCancel;

// Expose all/spread
axios.all = function all(promises) {
  return Promise.all(promises);
};
axios.spread = spread;

var axios_1 = axios;

// Allow use of default import syntax in TypeScript
var default_1 = axios;
axios_1.default = default_1;

var axios$1 = axios_1;

/**
 * Custom Binance client
 *
 * @example
 * ```
 * import { Client as BinanceClient } from '@thorchain/asgardex-binance'
 *
 * # testnet (by default)
 * const client = new BinanceClient('any BIP39 mnemonic')
 * await client.transfer(...)
 * # mainnet
 * const client = await binance.client('any BIP39 mnemonic', Network.MAINNET)
 * await client.transfer(...)
 *
 * ```
 *
 * @class Binance
 * @implements {BinanceClient}
 */
var Client = /** @class */ (function () {
    /**
     * Client has to be initialised with network type and phrase
     * It will throw an error if an invalid phrase has been passed
     **/
    function Client(phrase, network) {
        var _this = this;
        if (network === void 0) { network = 'testnet'; }
        this.address = null;
        this.privateKey = null;
        this.dirtyPrivateKey = true;
        this.getClientUrl = function () {
            return _this.network === 'testnet' ? 'https://testnet-dex.binance.org' : 'https://dex.binance.org';
        };
        this.getExplorerUrl = function () {
            return _this.network === 'testnet' ? 'https://testnet-explorer.binance.org' : 'https://explorer.binance.org';
        };
        this.getPrefix = function () {
            return _this.network === 'testnet' ? 'tbnb' : 'bnb';
        };
        // Sets this.phrase to be accessed later
        this.setPhrase = function (phrase) {
            if (_this.phrase && _this.phrase === phrase)
                return _this;
            if (!Client.validatePhrase(phrase)) {
                throw Error('Invalid BIP39 phrase passed to Binance Client');
            }
            _this.phrase = phrase;
            // whenever a new phrase has been added, a private key + address need to be renewed
            _this.address = null;
            _this.privateKey = null;
            _this.dirtyPrivateKey = true;
            return _this;
        };
        this.getPrivateKey = function () {
            if (!_this.privateKey) {
                var privateKey = javascriptSdk.crypto.getPrivateKeyFromMnemonic(_this.phrase);
                _this.privateKey = privateKey;
                return privateKey;
            }
            return _this.privateKey;
        };
        this.setPrivateKey = function () { return __awaiter(_this, void 0, void 0, function () {
            var privateKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.dirtyPrivateKey) return [3 /*break*/, 2];
                        privateKey = this.getPrivateKey();
                        return [4 /*yield*/, this.bncClient.setPrivateKey(privateKey).catch(function (error) { return Promise.reject(error); })];
                    case 1:
                        _a.sent();
                        this.dirtyPrivateKey = false;
                        _a.label = 2;
                    case 2: return [2 /*return*/, Promise.resolve()];
                }
            });
        }); };
        this.getAddress = function () {
            if (_this.address)
                return _this.address;
            var privateKey = _this.getPrivateKey(); // Extract private key
            var address = javascriptSdk.crypto.getAddressFromPrivateKey(privateKey, _this.getPrefix()); // Extract address with prefix
            _this.address = address;
            return address;
        };
        this.validateAddress = function (address) {
            return _this.bncClient.checkAddress(address, _this.getPrefix());
        };
        this.getBalance = function (address) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.bncClient.getBalance(address || this.getAddress())];
                }
            });
        }); };
        this.getTransactions = function (params) {
            if (params === void 0) { params = {}; }
            return __awaiter(_this, void 0, void 0, function () {
                var _a, address, blockHeight, endTime, limit, offset, side, startTime, txAsset, txType, clientUrl, url, response, error_1;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _a = params.address, address = _a === void 0 ? this.getAddress() : _a, blockHeight = params.blockHeight, endTime = params.endTime, limit = params.limit, offset = params.offset, side = params.side, startTime = params.startTime, txAsset = params.txAsset, txType = params.txType;
                            clientUrl = this.getClientUrl() + "/api/v1/transactions";
                            url = new URL(clientUrl);
                            if (address)
                                url.searchParams.set('address', address);
                            if (blockHeight)
                                url.searchParams.set('blockHeight', blockHeight.toString());
                            if (endTime)
                                url.searchParams.set('endTime', endTime.toString());
                            if (limit)
                                url.searchParams.set('limit', limit.toString());
                            if (offset)
                                url.searchParams.set('offset', offset.toString());
                            if (side)
                                url.searchParams.set('side', side.toString());
                            if (startTime)
                                url.searchParams.set('startTime', startTime.toString());
                            if (txAsset)
                                url.searchParams.set('txAsset', txAsset.toString());
                            if (txType)
                                url.searchParams.set('txType', txType.toString());
                            return [4 /*yield*/, this.bncClient.initChain()];
                        case 1:
                            _b.sent();
                            _b.label = 2;
                        case 2:
                            _b.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, axios$1.get(url.toString())];
                        case 3:
                            response = _b.sent();
                            return [2 /*return*/, response.data];
                        case 4:
                            error_1 = _b.sent();
                            return [2 /*return*/, Promise.reject(error_1)];
                        case 5: return [2 /*return*/];
                    }
                });
            });
        };
        this.vaultTx = function (addressTo, amount, asset, memo) { return __awaiter(_this, void 0, void 0, function () {
            var addressFrom, result, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setPrivateKey()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        addressFrom = this.getAddress();
                        return [4 /*yield*/, this.bncClient.transfer(addressFrom, addressTo, amount, asset, memo)];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        error_2 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_2)];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        this.normalTx = function (addressTo, amount, asset) { return __awaiter(_this, void 0, void 0, function () {
            var addressFrom, result, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setPrivateKey()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        addressFrom = this.getAddress();
                        return [4 /*yield*/, this.bncClient.transfer(addressFrom, addressTo, amount, asset)];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result];
                    case 5:
                        error_3 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_3)];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        this.freeze = function (amount, asset) { return __awaiter(_this, void 0, void 0, function () {
            var addressFrom, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setPrivateKey()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        addressFrom = this.getAddress();
                        return [4 /*yield*/, this.bncClient.tokens.freeze(addressFrom, asset, amount)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        error_4 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_4)];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        this.unfreeze = function (amount, asset) { return __awaiter(_this, void 0, void 0, function () {
            var addressFrom, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.setPrivateKey()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        addressFrom = this.getAddress();
                        return [4 /*yield*/, this.bncClient.tokens.unfreeze(addressFrom, asset, amount)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        error_5 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_5)];
                    case 6: return [2 /*return*/];
                }
            });
        }); };
        this.getMarkets = function (limit, offset) {
            if (limit === void 0) { limit = 1000; }
            if (offset === void 0) { offset = 0; }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.bncClient.initChain()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/, this.bncClient.getMarkets(limit, offset)];
                    }
                });
            });
        };
        this.multiSend = function (address, transactions, memo) {
            if (memo === void 0) { memo = ''; }
            return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.bncClient.initChain()];
                        case 1:
                            _a.sent();
                            return [4 /*yield*/, this.bncClient.multiSend(address, transactions, memo)];
                        case 2: return [2 /*return*/, _a.sent()];
                    }
                });
            });
        };
        this.getFees = function () { return __awaiter(_this, void 0, void 0, function () {
            var response, error_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.bncClient.initChain()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, axios$1.get(this.getClientUrl() + "/api/v1/fees")];
                    case 3:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 4:
                        error_6 = _a.sent();
                        return [2 /*return*/, Promise.reject(error_6)];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        // Invalid phrase will throw an error!
        this.setPhrase(phrase);
        this.network = network;
        this.phrase = phrase;
        this.bncClient = new client.BncClient(this.getClientUrl());
        this.bncClient.chooseNetwork(network);
    }
    // update network
    Client.prototype.setNetwork = function (network) {
        this.network = network;
        this.bncClient = new client.BncClient(this.getClientUrl());
        this.bncClient.chooseNetwork(network);
        return this;
    };
    // Will return the desired network
    Client.prototype.getNetwork = function () {
        return this.network;
    };
    Client.generatePhrase = function () {
        return src_5();
    };
    Client.validatePhrase = function (phrase) {
        return src_6(phrase);
    };
    return Client;
}());

/**
 * Get `hash` from transfer event sent by Binance chain
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html#3-transfer
 */
var getHashFromTransfer = function (transfer) { var _a; return (_a = transfer === null || transfer === void 0 ? void 0 : transfer.data) === null || _a === void 0 ? void 0 : _a.H; };
/**
 * Get `hash` from memo
 */
var getTxHashFromMemo = function (transfer) { var _a; return (_a = transfer === null || transfer === void 0 ? void 0 : transfer.data) === null || _a === void 0 ? void 0 : _a.M.split(':')[1]; };

/**
 * Type definitions for Binance Chain API
 * @see https://docs.binance.org/api-reference/dex-api/
 *
 */
(function (OrderStatus) {
    OrderStatus["Ack"] = "Ack";
    OrderStatus["PartialFill"] = "PartialFill";
    OrderStatus["IocNoFill"] = "IocNoFill";
    OrderStatus["FullyFill"] = "FullyFill";
    OrderStatus["Canceled"] = "Canceled";
    OrderStatus["Expired"] = "Expired";
    OrderStatus["FailedBlocking"] = "FailedBlocking";
    OrderStatus["FailedMatching"] = "FailedMatching";
    OrderStatus["IocExpire"] = "IocExpire";
})(exports.OrderStatus || (exports.OrderStatus = {}));

/**
 * Type definitions for data of Binance WebSocket Streams
 * @see https://docs.binance.org/api-reference/dex-api/ws-streams.html
 *
 */
/**
 * Taker (as part of {@link Trade})
 */
var Taker;
(function (Taker) {
    Taker[Taker["UNKNOWN"] = 0] = "UNKNOWN";
    Taker[Taker["SELL_TAKER"] = 1] = "SELL_TAKER";
    Taker[Taker["BUY_TAKER"] = 2] = "BUY_TAKER";
    Taker[Taker["BUY_SURPLUS"] = 3] = "BUY_SURPLUS";
    Taker[Taker["SELL_SURPLUS"] = 4] = "SELL_SURPLUS";
    Taker[Taker["NEUTRAL"] = 5] = "NEUTRAL";
})(Taker || (Taker = {}));

var binanceWs = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get Taker () { return Taker; }
});

exports.Client = Client;
exports.WS = binanceWs;
exports.getHashFromTransfer = getHashFromTransfer;
exports.getTxHashFromMemo = getTxHashFromMemo;
