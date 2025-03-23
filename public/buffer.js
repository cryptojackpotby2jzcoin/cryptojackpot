const Buffer = {
    TYPED_ARRAY_SUPPORT: typeof Uint8Array !== 'undefined' && typeof Uint8Array.prototype.subarray === 'function',
    poolSize: 8192,

    from: function (value, encodingOrOffset, length) {
        if (typeof value === 'string') {
            return this.fromString(value, encodingOrOffset);
        }
        if (ArrayBuffer.isView(value)) {
            return this.fromArrayLike(value);
        }
        if (value == null) {
            throw TypeError('The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object.');
        }
        if (typeof value === 'number') {
            throw new TypeError('Value must not be a number');
        }
        return this.fromObject(value);
    },

    alloc: function (size, fill, encoding) {
        if (typeof size !== 'number') {
            throw new TypeError('size must be a number');
        }
        if (size < 0) {
            throw new RangeError('size must not be negative');
        }
        const buf = this.TYPED_ARRAY_SUPPORT ? new Uint8Array(size) : new Array(size);
        if (fill !== undefined) {
            if (typeof fill === 'string') {
                this.fillBuffer(buf, fill, encoding);
            } else if (typeof fill === 'number') {
                buf.fill(fill);
            }
        }
        return buf;
    },

    allocUnsafe: function (size) {
        if (typeof size !== 'number') {
            throw new TypeError('size must be a number');
        }
        if (size < 0) {
            throw new RangeError('size must not be negative');
        }
        return this.TYPED_ARRAY_SUPPORT ? new Uint8Array(size) : new Array(size);
    },

    fromString: function (string, encoding) {
        const length = this.byteLength(string, encoding);
        const buf = this.allocUnsafe(length);
        const actual = this.write(buf, string, 0, length, encoding);
        return actual !== length ? buf.slice(0, actual) : buf;
    },

    fromArrayLike: function (array) {
        const length = array.length < 0 ? 0 : this.checked(array.length) | 0;
        const buf = this.allocUnsafe(length);
        for (let i = 0; i < length; i += 1) {
            buf[i] = array[i] & 255;
        }
        return buf;
    },

    fromObject: function (obj) {
        if (this.isBuffer(obj)) {
            const len = this.checked(obj.length) | 0;
            const buf = this.allocUnsafe(len);
            if (len !== 0) {
                obj.copy(buf, 0, 0, len);
            }
            return buf;
        }
        if (ArrayBuffer.isView(obj) || (obj && typeof obj.length === 'number')) {
            return this.fromArrayLike(obj);
        }
        throw new TypeError('Unsupported type: ' + typeof obj);
    },

    byteLength: function (string, encoding) {
        if (typeof string !== 'string') string = '' + string;
        return string.length;
    },

    write: function (buf, string, offset, length, encoding) {
        if (offset < 0 || buf.length < offset) {
            throw new RangeError('Offset out of bounds');
        }
        if (length === undefined) {
            length = buf.length - offset;
        }
        const remaining = Math.min(length, string.length);
        for (let i = 0; i < remaining; i++) {
            buf[offset + i] = string.charCodeAt(i) & 255;
        }
        return remaining;
    },

    fillBuffer: function (buf, value, encoding) {
        if (typeof value === 'string') {
            this.write(buf, value, 0, buf.length, encoding);
        } else if (typeof value === 'number') {
            buf.fill(value);
        }
    },

    isBuffer: function (b) {
        return b != null && typeof b === 'object' && b._isBuffer === true;
    },

    checked: function (length) {
        if (length >= 0x4000000) throw new RangeError('Attempt to allocate Buffer larger than maximum size');
        return length | 0;
    }
};

export { Buffer };