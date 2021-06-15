import { a as anObject, b as aFunction, _ as _export, g as getIteratorMethod, f as functionBindContext, i as isArrayIteratorMethod, t as toLength, w as wellKnownSymbol, c as getBuiltIn } from './is-array-iterator-method-02e028bb.js';

var isPure = false;

// https://github.com/tc39/collection-methods
var collectionDeleteAll = function (/* ...elements */) {
  var collection = anObject(this);
  var remover = aFunction(collection['delete']);
  var allDeleted = true;
  var wasDeleted;
  for (var k = 0, len = arguments.length; k < len; k++) {
    wasDeleted = remover.call(collection, arguments[k]);
    allDeleted = allDeleted && wasDeleted;
  }
  return !!allDeleted;
};

// `Map.prototype.deleteAll` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  deleteAll: function deleteAll(/* ...elements */) {
    return collectionDeleteAll.apply(this, arguments);
  }
});

var getIterator = function (it) {
  var iteratorMethod = getIteratorMethod(it);
  if (typeof iteratorMethod != 'function') {
    throw TypeError(String(it) + ' is not iterable');
  } return anObject(iteratorMethod.call(it));
};

var getMapIterator =  function (it) {
  // eslint-disable-next-line es/no-map -- safe
  return Map.prototype.entries.call(it);
};

var iteratorClose = function (iterator) {
  var returnMethod = iterator['return'];
  if (returnMethod !== undefined) {
    return anObject(returnMethod.call(iterator)).value;
  }
};

var Result = function (stopped, result) {
  this.stopped = stopped;
  this.result = result;
};

var iterate = function (iterable, unboundFunction, options) {
  var that = options && options.that;
  var AS_ENTRIES = !!(options && options.AS_ENTRIES);
  var IS_ITERATOR = !!(options && options.IS_ITERATOR);
  var INTERRUPTED = !!(options && options.INTERRUPTED);
  var fn = functionBindContext(unboundFunction, that, 1 + AS_ENTRIES + INTERRUPTED);
  var iterator, iterFn, index, length, result, next, step;

  var stop = function (condition) {
    if (iterator) iteratorClose(iterator);
    return new Result(true, condition);
  };

  var callFn = function (value) {
    if (AS_ENTRIES) {
      anObject(value);
      return INTERRUPTED ? fn(value[0], value[1], stop) : fn(value[0], value[1]);
    } return INTERRUPTED ? fn(value, stop) : fn(value);
  };

  if (IS_ITERATOR) {
    iterator = iterable;
  } else {
    iterFn = getIteratorMethod(iterable);
    if (typeof iterFn != 'function') throw TypeError('Target is not iterable');
    // optimisation for array iterators
    if (isArrayIteratorMethod(iterFn)) {
      for (index = 0, length = toLength(iterable.length); length > index; index++) {
        result = callFn(iterable[index]);
        if (result && result instanceof Result) return result;
      } return new Result(false);
    }
    iterator = iterFn.call(iterable);
  }

  next = iterator.next;
  while (!(step = next.call(iterator)).done) {
    try {
      result = callFn(step.value);
    } catch (error) {
      iteratorClose(iterator);
      throw error;
    }
    if (typeof result == 'object' && result && result instanceof Result) return result;
  } return new Result(false);
};

// `Map.prototype.every` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  every: function every(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return !iterate(iterator, function (key, value, stop) {
      if (!boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

var SPECIES = wellKnownSymbol('species');

// `SpeciesConstructor` abstract operation
// https://tc39.es/ecma262/#sec-speciesconstructor
var speciesConstructor = function (O, defaultConstructor) {
  var C = anObject(O).constructor;
  var S;
  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? defaultConstructor : aFunction(S);
};

// `Map.prototype.filter` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  filter: function filter(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor(map, getBuiltIn('Map')))();
    var setter = aFunction(newMap.set);
    iterate(iterator, function (key, value) {
      if (boundFunction(value, key, map)) setter.call(newMap, key, value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

// `Map.prototype.find` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  find: function find(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `Map.prototype.findKey` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  findKey: function findKey(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `SameValueZero` abstract operation
// https://tc39.es/ecma262/#sec-samevaluezero
var sameValueZero = function (x, y) {
  // eslint-disable-next-line no-self-compare -- NaN check
  return x === y || x != x && y != y;
};

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  includes: function includes(searchElement) {
    return iterate(getMapIterator(anObject(this)), function (key, value, stop) {
      if (sameValueZero(value, searchElement)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// `Map.prototype.includes` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  keyOf: function keyOf(searchElement) {
    return iterate(getMapIterator(anObject(this)), function (key, value, stop) {
      if (value === searchElement) return stop(key);
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).result;
  }
});

// `Map.prototype.mapKeys` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  mapKeys: function mapKeys(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor(map, getBuiltIn('Map')))();
    var setter = aFunction(newMap.set);
    iterate(iterator, function (key, value) {
      setter.call(newMap, boundFunction(value, key, map), value);
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

// `Map.prototype.mapValues` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  mapValues: function mapValues(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    var newMap = new (speciesConstructor(map, getBuiltIn('Map')))();
    var setter = aFunction(newMap.set);
    iterate(iterator, function (key, value) {
      setter.call(newMap, key, boundFunction(value, key, map));
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    return newMap;
  }
});

// `Map.prototype.merge` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  // eslint-disable-next-line no-unused-vars -- required for `.length`
  merge: function merge(iterable /* ...iterbles */) {
    var map = anObject(this);
    var setter = aFunction(map.set);
    var i = 0;
    while (i < arguments.length) {
      iterate(arguments[i++], setter, { that: map, AS_ENTRIES: true });
    }
    return map;
  }
});

// `Map.prototype.reduce` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  reduce: function reduce(callbackfn /* , initialValue */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var noInitial = arguments.length < 2;
    var accumulator = noInitial ? undefined : arguments[1];
    aFunction(callbackfn);
    iterate(iterator, function (key, value) {
      if (noInitial) {
        noInitial = false;
        accumulator = value;
      } else {
        accumulator = callbackfn(accumulator, value, key, map);
      }
    }, { AS_ENTRIES: true, IS_ITERATOR: true });
    if (noInitial) throw TypeError('Reduce of empty map with no initial value');
    return accumulator;
  }
});

// `Set.prototype.some` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  some: function some(callbackfn /* , thisArg */) {
    var map = anObject(this);
    var iterator = getMapIterator(map);
    var boundFunction = functionBindContext(callbackfn, arguments.length > 1 ? arguments[1] : undefined, 3);
    return iterate(iterator, function (key, value, stop) {
      if (boundFunction(value, key, map)) return stop();
    }, { AS_ENTRIES: true, IS_ITERATOR: true, INTERRUPTED: true }).stopped;
  }
});

// `Set.prototype.update` method
// https://github.com/tc39/proposal-collection-methods
_export({ target: 'Map', proto: true, real: true, forced: isPure }, {
  update: function update(key, callback /* , thunk */) {
    var map = anObject(this);
    var length = arguments.length;
    aFunction(callback);
    var isPresentInMap = map.has(key);
    if (!isPresentInMap && length < 3) {
      throw TypeError('Updating absent value');
    }
    var value = isPresentInMap ? map.get(key) : aFunction(length > 2 ? arguments[2] : undefined)(key, map);
    map.set(key, callback(value, key, map));
    return map;
  }
});

export { iteratorClose as a, iterate as b, collectionDeleteAll as c, getIterator as g, isPure as i, speciesConstructor as s };
