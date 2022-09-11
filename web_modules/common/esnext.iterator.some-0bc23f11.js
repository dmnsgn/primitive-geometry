import { t as typedArrayConstructor } from './esnext.typed-array.with-777216a9.js';
import { _ as _export, b as aCallable } from './object-set-prototype-of-c6b82070.js';
import { a as asyncIteratorIteration, g as getIteratorDirect, i as iterate } from './es.error.cause-0cbcfba0.js';

// `Uint8Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint8', function (init) {
  return function Uint8Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// `Uint16Array` constructor
// https://tc39.es/ecma262/#sec-typedarray-objects
typedArrayConstructor('Uint16', function (init) {
  return function Uint16Array(data, byteOffset, length) {
    return init(this, data, byteOffset, length);
  };
});

// https://github.com/tc39/proposal-iterator-helpers

var $some = asyncIteratorIteration.some;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  some: function some(fn) {
    return $some(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers





_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  some: function some(fn) {
    var record = getIteratorDirect(this);
    aCallable(fn);
    return iterate(record, function (value, stop) {
      if (fn(value)) return stop();
    }, { IS_RECORD: true, INTERRUPTED: true }).stopped;
  }
});
