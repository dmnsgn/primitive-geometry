/**
 * @module utils
 * @ignore
 */

/**
 * @callback DistributionFn
 * @param {number} t
 * @returns {number}
 */

/**
 * Uniform spacing, the default `vDistribution`.
 *
 * `vDistribution` remaps rows along meridians not swept at constant speed:
 * `ellipsoid`, `superellipsoid`, `superegg`, `paraboloid`, `barrel`, `funnel`
 * and `hyperboloid`.
 *
 * @type {DistributionFn}
 */
export function linear(t) {
  return t;
}

/**
 * Chebyshev spacing: clusters rows toward both ends, eg. a prolate
 * `ellipsoid`'s poles.
 *
 * @type {DistributionFn}
 */
export function chebyshev(t) {
  return (1 - Math.cos(Math.PI * t)) / 2;
}

/**
 * Smoothstep spacing: clusters rows toward both ends, like `chebyshev`.
 *
 * @type {DistributionFn}
 */
export function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Power spacing: clusters rows toward t = 1. `2` evens out `paraboloid`'s apex.
 *
 * @param {number} [exponent=2]
 * @returns {function(number): number}
 */
export function power(exponent = 2) {
  return (t) => 1 - (1 - t) ** exponent;
}
