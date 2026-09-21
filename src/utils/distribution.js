/** @module distribution */

/**
 * @callback DistributionFn
 * @param {number} t
 * @returns {number}
 */

/**
 * Uniform spacing: v maps to itself. The default `vDistribution` for every
 * `computeRevolutionGeometry`-based solid.
 *
 * @type {DistributionFn}
 */
export function linear(t) {
  return t;
}

/**
 * Chebyshev-node-like spacing: clusters rows toward both ends of the meridian
 * sweep (t = 0 and t = 1), sparser through the middle - the classic fix for a
 * pole/cusp at each end whose radius shrinks faster than the sweep parameter
 * grows (eg. `ellipsoid`'s poles, `apple`/`lemon`'s cusps).
 *
 * @type {DistributionFn}
 */
export function chebyshev(t) {
  return (1 - Math.cos(Math.PI * t)) / 2;
}

/**
 * Smoothstep (Hermite ease-in-out) spacing: same both-ends clustering as
 * `chebyshev`, as a cheap polynomial instead of a cosine - the standard
 * "smoothstep" curve used throughout computer graphics.
 *
 * @type {DistributionFn}
 */
export function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

/**
 * Power/ease-out spacing: clusters rows toward t = 1 only, leaving t = 0 as
 * sparse as `linear` - unlike `chebyshev`/`smoothstep`'s symmetric, both-ends
 * clustering. `exponent = 2` exactly cancels a sqrt radius law (eg.
 * `paraboloid`'s apex, where r = radius·sqrt(1 - v)); `exponent = 1` is
 * `linear`.
 *
 * @param {number} [exponent=2]
 * @returns {function(number): number}
 */
export function power(exponent = 2) {
  return (t) => 1 - (1 - t) ** exponent;
}
