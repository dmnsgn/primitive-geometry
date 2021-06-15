import { a as anObject, b as aFunction, _ as _export, c as getBuiltIn, f as functionBindContext } from './is-array-iterator-method-02e028bb.js';
import { i as isPure, c as collectionDeleteAll, s as speciesConstructor, b as iterate, g as getIterator } from './esnext.map.update-95c88744.js';

// https://github.com/tc39/collection-methods
var collectionAddAll = function (/* ...elements */) {
  var set = anObject(this);
  var adder = aFunction(set.add);
  for (var k = 0, len = arguments.length; k < len; k++) {
    adder.call(set, arguments[k]);
  }
  return set;
};

// `Set.prototype.addAll` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  addAll: function addAll(/* ...elements */) {
    return collectionAddAll.apply(this, arguments);
  }
});

// `Set.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  }
});

// `Set.prototype.difference` method
// https://github.com/tc39/proposal-set-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  difference: function difference(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, getBuiltIn('Set')))(set);
    var remover = aFunction(newSet['delete']);
    iterate(iterable, function (value) {
      remover.call(newSet, value);
    });
    return newSet;
  }
});

var getSetIterator =  function (it) {
  // eslint-disable-next-line es/no-set -- safe
  return Set.prototype.values.call(it);
};

// `Set.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  every: function every(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate(iterator, function (value, stop) {
      if (!boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// `Set.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor(set, getBuiltIn('Set')))();
    var adder = aFunction(newSet.add);
    iterate(iterator, function (value) {
      if (boundFunction(value, value, set)) adder.call(newSet, value);
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

// `Set.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  find: function find(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop(value);
    }, { IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `Set.prototype.intersection` method
// https://github.com/tc39/proposal-set-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  intersection: function intersection(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, getBuiltIn('Set')))();
    var hasCheck = aFunction(set.has);
    var adder = aFunction(newSet.add);
    iterate(iterable, function (value) {
      if (hasCheck.call(set, value)) adder.call(newSet, value);
    });
    return newSet;
  }
});

// `Set.prototype.isDisjointFrom` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isDisjointFrom
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  isDisjointFrom: function isDisjointFrom(iterable) {
    var set = anObject(this);
    var hasCheck = aFunction(set.has);
    return !iterate(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === true) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

// `Set.prototype.isSubsetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSubsetOf
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  isSubsetOf: function isSubsetOf(iterable) {
    var iterator = getIterator(this);
    var otherSet = anObject(iterable);
    var hasCheck = otherSet.has;
    if (typeof hasCheck != 'function') {
      otherSet = new (getBuiltIn('Set'))(iterable);
      hasCheck = aFunction(otherSet.has);
    }
    return !iterate(iterator, function (value, stop) {
      if (hasCheck.call(otherSet, value) === false) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// `Set.prototype.isSupersetOf` method
// https://tc39.github.io/proposal-set-methods/#Set.prototype.isSupersetOf
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  isSupersetOf: function isSupersetOf(iterable) {
    var set = anObject(this);
    var hasCheck = aFunction(set.has);
    return !iterate(iterable, function (value, stop) {
      if (hasCheck.call(set, value) === false) return stop();
    }, { INTERRUPTED: true }).stopped;
  }
});

// `Set.prototype.join` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  join: function join(separator) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var sep = separator === undefined ? ',' : String(separator);
    var result = [];
    iterate(iterator, result.push, { that: result, IS_ITERATOR: true });
    return result.join(sep);
  }
});

// `Set.prototype.map` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  map: function map(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newSet = new (speciesConstructor(set, getBuiltIn('Set')))();
    var adder = aFunction(newSet.add);
    iterate(iterator, function (value) {
      adder.call(newSet, boundFunction(value, value, set));
    }, { IS_ITERATOR: true });
    return newSet;
  }
});

// `Set.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction(callbackfn);
    iterate(iterator, function (value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, value, set);
      }
    }, { IS_ITERATOR: true });
    if (noInitial) throw TypeError('Reduce of empty set with no initial value');
    return accumulator;
  }
});

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  some: function some(callbackfn /* , thisArg */) {
    var set = anObject(this);
    var iterator = getSetIterator(set);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate(iterator, function (value, stop) {
      if (boundFunction(value, value, set)) return stop();
    }, { IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// `Set.prototype.symmetricDifference` method
// https://github.com/tc39/proposal-set-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  symmetricDifference: function symmetricDifference(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, getBuiltIn('Set')))(set);
    var remover = aFunction(newSet['delete']);
    var adder = aFunction(newSet.add);
    iterate(iterable, function (value) {
      remover.call(newSet, value) || adder.call(newSet, value);
    });
    return newSet;
  }
});

// `Set.prototype.union` method
// https://github.com/tc39/proposal-set-methods
_export({ target: 'Set', proto: true, real: true, forced: isPure }, {
  union: function union(iterable) {
    var set = anObject(this);
    var newSet = new (speciesConstructor(set, getBuiltIn('Set')))(set);
    iterate(iterable, aFunction(newSet.add), { that: newSet });
    return newSet;
  }
});

export { collectionAddAll as c };
