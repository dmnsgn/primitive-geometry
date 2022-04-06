import { _ as _export, l as anObject, E as aCallable } from './set-to-string-tag-66b9f676.js';
import { b as asyncIteratorIteration, a as iterate } from './web.dom-collections.iterator-8ea35636.js';

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
    anObject(this);
    aCallable(fn);
    return iterate(this, function (value, stop) {
      if (fn(value)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});
