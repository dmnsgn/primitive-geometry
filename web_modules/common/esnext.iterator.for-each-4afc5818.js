import { _ as _export, b as aCallable } from './object-set-prototype-of-c6b82070.js';
import { a as asyncIteratorIteration, g as getIteratorDirect, i as iterate } from './es.error.cause-0cbcfba0.js';

// https://github.com/tc39/proposal-iterator-helpers

var $find = asyncIteratorIteration.find;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  find: function find(fn) {
    return $find(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers





_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  find: function find(fn) {
    var record = getIteratorDirect(this);
    aCallable(fn);
    return iterate(record, function (value, stop) {
      if (fn(value)) return stop(value);
    }, { IS_RECORD: true, INTERRUPTED: true }).result;
  }
});

// https://github.com/tc39/proposal-iterator-helpers

var $forEach = asyncIteratorIteration.forEach;

_export({ target: 'AsyncIterator', proto: true, real: true, forced: true }, {
  forEach: function forEach(fn) {
    return $forEach(this, fn);
  }
});

// https://github.com/tc39/proposal-iterator-helpers




_export({ target: 'Iterator', proto: true, real: true, forced: true }, {
  forEach: function forEach(fn) {
    iterate(getIteratorDirect(this), fn, { IS_RECORD: true });
  }
});
