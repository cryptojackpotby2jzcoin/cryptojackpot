(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.Buffer = factory());
}(this, function () {
    'use strict';

    var Buffer = function Buffer(arg, encodingOrOffset, length) {
        if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
            return new Buffer(arg, encodingOrOffset, length);
        }

        if (typeof arg === 'number') {
            if (typeof encodingOrOffset === 'string') {
                throw new Error('If encoding is specified then the first argument must be a string');
            }
            return allocUnsafe(this, arg);
        }
        return from(this, arg, encodingOrOffset, length);
    };

    Buffer.poolSize = 8192;

    Buffer.TYPED_ARRAY_SUPPORT = typeof Uint8Array !== 'undefined' && typeof Uint8Array.prototype.subarray === 'function';

    Buffer.from = function (value, encodingOrOffset, length) {
        return from(null, value, encodingOrOffset, length);
    };

    Buffer.alloc = function (size, fill, encoding) {
        return alloc(null, size, fill, encoding);
    };

    Buffer.allocUnsafe = function (size) {
        return allocUnsafe(null, size);
    };

    function from(that, value, encodingOrOffset, length) {
        if (typeof value === 'string') {
            return fromString(that, value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
            return fromArrayLike(that, value);
        }
        if (value == null) {
            throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.');
        }
        if (typeof value === 'number') {
            throw new TypeError('Value must not be a number');
        }
        return fromObject(that, value);
    }

    function alloc(that, size, fill, encoding) {
        if (typeof size !== 'number') {
            throw new TypeError('size must be a number');
        }
        if (size < 0) {
            throw new RangeError('size must not be negative');
        }
        var buf = Buffer.TYPED_ARRAY_SUPPORT ? new Uint8Array(size) : new Array(size);
        if (fill !== undefined) {
            if (typeof fill === 'string') {
                fillBuffer(buf, fill, encoding);
            } else if (typeof fill === 'number') {
                buf.fill(fill);
            }
        }
        return that ? Object.assign(that, buf) : buf;
    }

    function allocUnsafe(that, size) {
        if (typeof size !== 'number') {
            throw new TypeError('size must be a number');
        }
        if (size < 0) {
            throw new RangeError('size must not be negative');
        }
        return Buffer.TYPED_ARRAY_SUPPORT ? new Uint8Array(size) : new Array(size);
    }

    function fromString(that, string, encoding) {
        var length = byteLength(string, encoding);
        var buf = allocUnsafe(that, length);
        var actual = write(buf, string, 0, length, encoding);
        if (actual !== length) {
            buf = buf.slice(0, actual);
        }
        return that ? Object.assign(that, buf) : buf;
    }

    function fromArrayLike(that, array) {
        var length = array.length < 0 ? 0 : checked(array.length) | 0;
        var buf = allocUnsafe(that, length);
        for (var i = 0; i < length; i += 1) {
            buf[i] = array[i] & 255;
        }
        return that ? Object.assign(that, buf) : buf;
    }

    function fromObject(that, obj) {
        if (Buffer.isBuffer(obj)) {
            var len = checked(obj.length) | 0;
            var buf = allocUnsafe(that, len);
            if (len === 0) {
                return buf;
            }
            obj.copy(buf, 0, 0, len);
            return that ? Object.assign(that, buf) : buf;
        }
        if (ArrayBuffer.isView(obj) || (obj && typeof obj.length === 'number')) {
            return fromArrayLike(that, obj);
        }
        throw new TypeError('Unsupported type: ' + typeof obj);
    }

    function byteLength(string, encoding) {
        if (typeof string !== 'string') string = '' + string;
        var len = string.length;
        if (len === 0) return 0;
        return len;
    }

    function write(buf, string, offset, length, encoding) {
        if (offset < 0 || buf.length < offset) {
            throw new RangeError('Offset out of bounds');
        }
        if (length === undefined) {
            length = buf.length - offset;
        }
        var remaining = Math.min(length, string.length);
        for (var i = 0; i < remaining; i++) {
            buf[offset + i] = string.charCodeAt(i) & 255;
        }
        return remaining;
    }

    function fillBuffer(buf, value, encoding) {
        if (typeof value === 'string') {
            write(buf, value, 0, buf.length, encoding);
        } else if (typeof value === 'number') {
            buf.fill(value);
        }
    }

    Buffer.isBuffer = function isBuffer(b) {
        return b != null && b._isBuffer === true;
    };

    Buffer.prototype = {
        _isBuffer: true,
        write: function (string, offset, length, encoding) {
            return write(this, string, offset, length, encoding);
        },
        toString: function (encoding, start, end) {
            var loweredCase = false;
            start = start | 0;
            end = end === undefined || end === Infinity ? this.length : end | 0;
            if (!encoding) encoding = 'utf8';
            if (start < 0) start = 0;
            if (end > this.length) end = this.length;
            if (end <= start) return '';
            var slice = this.subarray ? this.subarray(start, end) : this.slice(start, end);
            return String.fromCharCode.apply(null, slice);
        },
        slice: function (start, end) {
            var len = this.length;
            start = ~~start;
            end = end === undefined ? len : ~~end;
            if (start < 0) start += len;
            if (end < 0) end += len;
            if (start >= len) start = len;
            if (end > len) end = len;
            if (start >= end) return Buffer.alloc(0);
            var newBuf = this.subarray ? this.subarray(start, end) : this.slice(start, end);
            return Object.assign(Object.create(Buffer.prototype), newBuf);
        },
        copy: function (target, targetStart, start, end) {
            if (!Buffer.isBuffer(target)) throw new TypeError('argument should be a Buffer');
            if (!start) start = 0;
            if (!end && end !== 0) end = this.length;
            if (targetStart >= target.length) targetStart = target.length;
            if (!targetStart) targetStart = 0;
            if (end > 0 && end < start) end = start;
            if (end === start) return 0;
            if (target.length === 0 || this.length === 0) return 0;
            if (targetStart < 0) throw new RangeError('targetStart out of bounds');
            if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds');
            if (end < 0) throw new RangeError('sourceEnd out of bounds');
            var len = Math.min(end - start, target.length - targetStart);
            for (var i = 0; i < len; i++) {
                target[i + targetStart] = this[i + start];
            }
            return len;
        }
    };

    function checked(length) {
        if (length >= 0x4000000) throw new RangeError('Attempt to allocate Buffer larger than maximum size');
        return length | 0;
    }

    return Buffer;
}));

// ES Module olarak dışa aktar
export { Buffer };